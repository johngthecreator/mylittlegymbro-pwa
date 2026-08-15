import type { FoodItem, MacroValues } from "../core/types";

/** Scale a food's per-serving macros to a given eaten amount (same unit as the
 *  food's serving unit). Guards against a zero/negative serving size. */
export function scaledMacros(food: FoodItem, amount: number): MacroValues {
  const servings = amount / (food.servingSize > 0 ? food.servingSize : 1);
  return {
    calories: food.calories * servings,
    protein: food.protein * servings,
    carbs: food.carbs * servings,
    fat: food.fat * servings,
  };
}

/** Format a macro number for display (trim to at most 1 decimal). */
export function formatNumber(n: number): string {
  if (!Number.isFinite(n)) return "0";
  return n.toLocaleString(undefined, { maximumFractionDigits: 1 });
}

/** Round a raw macro value to a sensible precision for storage. */
export function roundMacro(n: number): number {
  if (!Number.isFinite(n)) return 0;
  return Math.round(n * 100) / 100;
}

/** Clamp a non-finite/negative value to >= 0. */
export function clampNonNegative(n: number): number {
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, n);
}
