import type { FoodItem } from "@/core/types";
import { DEFAULT_SERVING_SIZE, DEFAULT_SERVING_UNIT } from "@/core/constants";
import { FoodNotFoundError } from "@/core/errors";
import { clampNonNegative, roundMacro } from "@/lib/nutrition";

interface OffNutriments {
  [key: string]: unknown;
}

interface OffProduct {
  code?: string | number;
  product_name?: string;
  brands?: string;
  serving_size?: string;
  serving_quantity?: number;
  nutriments?: OffNutriments;
  image_front_small_url?: string;
  image_front_url?: string;
}

interface OffResponse {
  status?: number;
  product?: OffProduct;
}

const UNIT_MAP: Record<string, string> = {
  g: "g",
  gram: "g",
  grams: "g",
  ml: "ml",
  millilitre: "ml",
  millilitres: "ml",
  milliliter: "ml",
  milliliters: "ml",
  l: "l",
  litre: "l",
  litres: "l",
  liter: "l",
  liters: "l",
  cup: "cup",
  cups: "cup",
  ounce: "oz",
  ounces: "oz",
  oz: "oz",
  tablespoon: "tbsp",
  tablespoons: "tbsp",
  tbsp: "tbsp",
  teaspoon: "tsp",
  teaspoons: "tsp",
  tsp: "tsp",
  piece: "piece",
  pieces: "piece",
  slice: "slice",
  slices: "slice",
  bar: "bar",
  packet: "packet",
};

function toFinite(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null;
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : null;
}

function parseServingSize(text: string | undefined): number {
  if (!text) return DEFAULT_SERVING_SIZE;
  const match = text.trim().match(/^(\d+(?:\.\d+)?)/);
  if (!match) return DEFAULT_SERVING_SIZE;
  const n = toFinite(match[1]);
  return n !== null && n > 0 ? n : DEFAULT_SERVING_SIZE;
}

function parseServingUnit(text: string | undefined): string {
  if (!text) return DEFAULT_SERVING_UNIT;
  const match = text.trim().match(/^\d+(?:\.\d+)?\s*([a-zA-Z].*)$/);
  if (!match) return DEFAULT_SERVING_UNIT;
  const word = match[1]
    .trim()
    .split(/\s+/)[0]
    .toLowerCase()
    .replace(/[^a-z]/g, "");
  return UNIT_MAP[word] ?? DEFAULT_SERVING_UNIT;
}

function macroValue(
  nutr: OffNutriments,
  per100gKey: string,
  perServingKey: string,
  servingSize: number,
): number {
  const perServing = toFinite(nutr[perServingKey]);
  if (perServing !== null) return perServing;
  const per100g = toFinite(nutr[per100gKey]);
  if (per100g !== null) return (per100g * servingSize) / 100;
  return 0;
}

function energyKcal(nutr: OffNutriments, servingSize: number): number {
  const perServing = toFinite(nutr["energy-kcal_serving"]);
  if (perServing !== null) return perServing;
  const per100gKcal = toFinite(nutr["energy-kcal_100g"]);
  if (per100gKcal !== null) return (per100gKcal * servingSize) / 100;
  const per100gKj = toFinite(nutr["energy_100g"]);
  if (per100gKj !== null) return (per100gKj / 4.184) * (servingSize / 100);
  return 0;
}

export function mapOffProduct(raw: unknown, fallbackBarcode: string): FoodItem {
  const response = raw as OffResponse | null | undefined;
  const product = response?.product;
  if (!response || response.status !== 1 || !product || !product.product_name) {
    throw new FoodNotFoundError(fallbackBarcode);
  }

  const nutr = product.nutriments ?? {};

  const quantity = toFinite(product.serving_quantity);
  let servingSize =
    quantity !== null && quantity > 0
      ? quantity
      : parseServingSize(product.serving_size);
  servingSize = roundMacro(clampNonNegative(servingSize));

  const servingUnit = parseServingUnit(product.serving_size);
  const calories = roundMacro(
    clampNonNegative(energyKcal(nutr, servingSize)),
  );
  const protein = roundMacro(
    clampNonNegative(
      macroValue(nutr, "proteins_100g", "proteins_serving", servingSize),
    ),
  );
  const carbs = roundMacro(
    clampNonNegative(
      macroValue(nutr, "carbohydrates_100g", "carbohydrates_serving", servingSize),
    ),
  );
  const fat = roundMacro(
    clampNonNegative(
      macroValue(nutr, "fat_100g", "fat_serving", servingSize),
    ),
  );

  return {
    name: product.product_name || "Unknown product",
    brand: product.brands || undefined,
    imageUrl: product.image_front_small_url || product.image_front_url || undefined,
    barcode: String(product.code ?? fallbackBarcode).trim(),
    calories,
    protein,
    carbs,
    fat,
    servingSize,
    servingUnit,
  };
}
