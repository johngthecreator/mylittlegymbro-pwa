export const APP_NAME = "Macrocalc";

/** Fallback serving size used when OpenFoodFacts provides none. */
export const DEFAULT_SERVING_SIZE = 100;

/** Default metric unit when OpenFoodFacts provides none. */
export const DEFAULT_SERVING_UNIT = "g";

/** Barcode formats relevant to grocery products. */
export const BARCODE_FORMATS = [
  "EAN_13",
  "EAN_8",
  "UPC_A",
  "UPC_E",
  "CODE_128",
  "ITF",
  "QR_CODE",
] as const;

/** Per-user-agent OpenFoodFacts asks for identification; include a static UA. */
export const OFF_USER_AGENT = "macrocalc/0.1 (personal macro tracker)";

/** Base URL for the OpenFoodFacts REST API. */
export const OFF_BASE_URL = "https://world.openfoodfacts.org/api/v2";

/** Default daily macro targets, used to render progress on the summary. */
export const DEFAULT_TARGETS = {
  calories: 2000,
  protein: 150,
  carbs: 200,
  fat: 67,
} as const;

export const UNIT_OPTIONS = [
  "g",
  "ml",
  "oz",
  "cup",
  "tbsp",
  "tsp",
  "fl oz",
  "piece",
  "slice",
  "packet",
] as const;

/** Weight-based serving units that can be normalized to grams. */
export const WEIGHT_UNITS = ["g", "oz", "kg"] as const;

/** Grams per gram / ounce / kilogram used to normalize weights. */
export const GRAMS_PER_WEIGHT_UNIT: Record<string, number> = {
  g: 1,
  oz: 28.3495,
  kg: 1000,
};

/** Rough grams-per-serving estimates for non-weight units (density override defaults). */
export const GRAMS_PER_UNIT: Record<string, number> = {
  cup: 240,
  tbsp: 15,
  tsp: 5,
  "fl oz": 30,
  piece: 50,
  slice: 50,
  packet: 50,
};

/** Serving-unit choices for restaurant-order results. */
export const ORDER_UNITS = ["order", "meal", "combo"] as const;
