const GEMINI_API_KEY_KEY = "macrocalc.geminiApiKey";

export function getGeminiApiKey(): string | null {
  try {
    return localStorage.getItem(GEMINI_API_KEY_KEY);
  } catch {
    return null;
  }
}

export function setGeminiApiKey(key: string): void {
  localStorage.setItem(GEMINI_API_KEY_KEY, key);
}

export function clearGeminiApiKey(): void {
  localStorage.removeItem(GEMINI_API_KEY_KEY);
}
