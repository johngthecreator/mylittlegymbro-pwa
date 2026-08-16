import { GoogleGenAI } from "@google/genai";
import type { FoodInput, FoodSearchResult, FoodSearchSource } from "@/core/types";
import type { IAiService } from "@/core/interfaces";
import {
  clearGeminiApiKey,
  getGeminiApiKey,
  setGeminiApiKey,
} from "@/lib/settings";

const MODEL = "gemini-2.5-flash";

const NO_API_KEY_MESSAGE = "No Gemini API key configured. Add one in Settings.";
const LABEL_ERROR_MESSAGE =
  "Could not read that nutrition label — please try a clearer photo.";
const SEARCH_ERROR_MESSAGE = "Could not look that up — try again or reword it.";

function finiteNumber(value: unknown): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : Number.NaN;
}

function parseJsonObject(
  text: string | undefined,
  errorMessage: string
): Record<string, unknown> {
  if (!text) throw new Error(errorMessage);
  let candidate = text.trim();
  const fenced = candidate.match(/^```(?:json)?\s*([\s\S]*?)```\s*$/);
  if (fenced) candidate = fenced[1].trim();
  let parsed: unknown;
  try {
    parsed = JSON.parse(candidate);
  } catch {
    throw new Error(errorMessage);
  }
  if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error(errorMessage);
  }
  return parsed as Record<string, unknown>;
}

export class AiService implements IAiService {
  private client: GoogleGenAI | null = null;
  private apiKey: string | null = null;
  private loaded = false;

  async init(): Promise<void> {
    if (this.loaded) return;
    this.apiKey = await getGeminiApiKey();
    this.loaded = true;
  }

  async setApiKey(key: string): Promise<void> {
    await setGeminiApiKey(key);
    this.apiKey = key;
    this.loaded = true;
  }

  async clearApiKey(): Promise<void> {
    await clearGeminiApiKey();
    this.apiKey = null;
    this.loaded = true;
  }

  hasApiKey(): boolean {
    return this.apiKey != null;
  }

  private async ensureLoaded(): Promise<void> {
    if (!this.loaded) await this.init();
  }

  private async getClient(): Promise<GoogleGenAI> {
    await this.ensureLoaded();
    if (!this.client) {
      if (!this.apiKey) throw new Error(NO_API_KEY_MESSAGE);
      this.client = new GoogleGenAI({ apiKey: this.apiKey });
    }
    return this.client;
  }

  async parseNutritionLabel(
    image: { data: string; mimeType: string },
    barcode: string
  ): Promise<FoodInput> {
    const ai = await this.getClient();
    let text: string | undefined;
    try {
      const response = await ai.models.generateContent({
        model: MODEL,
        contents: [
          {
            role: "user",
            parts: [
              { inlineData: { mimeType: image.mimeType, data: image.data } },
              {
                text: "Extract the nutrition facts from this food nutrition label image. Return JSON matching the provided schema. Name: use the product name on the label, or infer a short, specific name. servingSize = the numeric serving quantity; servingUnit = the unit (normalize to one of: g, ml, oz, cup, tbsp, tsp, piece, slice, packet).",
              },
            ],
          },
        ],
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: "OBJECT",
            properties: {
              name: { type: "STRING" },
              brand: { type: "STRING" },
              calories: { type: "NUMBER" },
              protein: { type: "NUMBER" },
              carbs: { type: "NUMBER" },
              fat: { type: "NUMBER" },
              servingSize: { type: "NUMBER" },
              servingUnit: { type: "STRING" },
            },
            required: [
              "name",
              "calories",
              "protein",
              "carbs",
              "fat",
              "servingSize",
              "servingUnit",
            ],
          },
        },
      });
      text = response.text;
    } catch (err) {
      console.error("[aiService] parseNutritionLabel failed:", err);
      const detail = err instanceof Error ? ` (${err.message})` : "";
      throw new Error(`${LABEL_ERROR_MESSAGE}${detail}`);
    }

    const raw = parseJsonObject(text, LABEL_ERROR_MESSAGE);

    const name = typeof raw.name === "string" ? raw.name.trim() : "";
    const calories = finiteNumber(raw.calories);
    const protein = finiteNumber(raw.protein);
    const carbs = finiteNumber(raw.carbs);
    const fat = finiteNumber(raw.fat);
    const servingSize = finiteNumber(raw.servingSize);

    if (
      !name ||
      !Number.isFinite(calories) ||
      !Number.isFinite(protein) ||
      !Number.isFinite(carbs) ||
      !Number.isFinite(fat) ||
      !Number.isFinite(servingSize)
    ) {
      throw new Error(LABEL_ERROR_MESSAGE);
    }

    const brand = typeof raw.brand === "string" ? raw.brand.trim() : undefined;
    const servingUnit =
      typeof raw.servingUnit === "string" && raw.servingUnit.trim()
        ? raw.servingUnit.trim()
        : "g";

    return {
      name,
      brand: brand || undefined,
      calories,
      protein,
      carbs,
      fat,
      servingSize,
      servingUnit,
      barcode,
      isCustom: true,
    };
  }

  async searchFood(query: string): Promise<FoodSearchResult> {
    const ai = await this.getClient();
    let text: string | undefined;
    let sources: FoodSearchSource[] | undefined;
    try {
      const response = await ai.models.generateContent({
        model: MODEL,
        contents: `Web-search the nutrition facts for: "${query}". This may be a single food OR a restaurant order/meal.

Return ONLY a JSON object with EXACTLY this shape and nothing else (no markdown, no explanation):
{
  "name": string,
  "brand": string or null,
  "servingSizeGrams": number or null,
  "servingUnit": string or null,
  "calories": number,
  "protein": number,
  "carbs": number,
  "fat": number
}

Rules:
- "name" is the specific product or meal name.
- For a SINGLE FOOD: "servingSizeGrams" MUST be the grams in one serving (from the label, e.g. 100) and "servingUnit" should be "g".
- For a RESTAURANT ORDER/MEAL: set "servingUnit" to "order" (or "meal"/"combo"), macros are for the WHOLE order, and "servingSizeGrams" is null.
- Per-gram calories are derived from servingSizeGrams, so it must be accurate.`,
        config: {
          tools: [{ googleSearch: {} }],
          temperature: 0,
        },
      });
      text = response.text;
      sources =
        response.candidates?.[0]?.groundingMetadata?.groundingChunks
          ?.map((chunk) => chunk.web)
          .filter((web) => Boolean(web?.uri))
          .map((web) => ({ title: web?.title ?? "", uri: web?.uri ?? "" }))
          .filter((s) => s.uri.length > 0) ?? undefined;
      if (sources && sources.length === 0) sources = undefined;
    } catch (err) {
      console.error("[aiService] searchFood failed:", err);
      const detail = err instanceof Error ? ` (${err.message})` : "";
      throw new Error(`${SEARCH_ERROR_MESSAGE}${detail}`);
    }

    const raw = parseJsonObject(text, SEARCH_ERROR_MESSAGE);

    const name = typeof raw.name === "string" ? raw.name.trim() : "";
    const calories = finiteNumber(raw.calories);
    const protein = finiteNumber(raw.protein);
    const carbs = finiteNumber(raw.carbs);
    const fat = finiteNumber(raw.fat);

    if (
      !name ||
      !Number.isFinite(calories) ||
      !Number.isFinite(protein) ||
      !Number.isFinite(carbs) ||
      !Number.isFinite(fat)
    ) {
      throw new Error(SEARCH_ERROR_MESSAGE);
    }

    const brand = typeof raw.brand === "string" ? raw.brand.trim() : undefined;
    const servingSizeGrams = finiteNumber(raw.servingSizeGrams);
    const servingUnit =
      typeof raw.servingUnit === "string" ? raw.servingUnit.trim() : undefined;

    return {
      name,
      brand: brand || undefined,
      servingSizeGrams: Number.isFinite(servingSizeGrams)
        ? servingSizeGrams
        : undefined,
      servingUnit: servingUnit || undefined,
      calories,
      protein,
      carbs,
      fat,
      sources,
    };
  }
}
