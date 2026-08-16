import { db } from "@/data/db";

const GEMINI_API_KEY_KEY = "geminiApiKey";

export async function getGeminiApiKey(): Promise<string | null> {
  try {
    const row = await db.settings.get(GEMINI_API_KEY_KEY);
    return row?.value ?? null;
  } catch {
    return null;
  }
}

export async function setGeminiApiKey(key: string): Promise<void> {
  await db.settings.put({ key: GEMINI_API_KEY_KEY, value: key });
}

export async function clearGeminiApiKey(): Promise<void> {
  await db.settings.delete(GEMINI_API_KEY_KEY);
}
