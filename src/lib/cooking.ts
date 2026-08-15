import type { FoodItem, MacroValues, RecipeIngredient } from "../core/types";
import {
  GRAMS_PER_UNIT,
  GRAMS_PER_WEIGHT_UNIT,
  WEIGHT_UNITS,
} from "../core/constants";
import { roundMacro } from "./nutrition";

/** True when `unit` is a weight-based unit (g, oz, kg) that can be normalized to grams. */
export function isWeightUnit(unit: string): boolean {
  return (WEIGHT_UNITS as readonly string[]).includes(unit);
}

/** Convert a serving size in `servingUnit` to grams (identity for non-weight units). */
export function normalizeGrams(servingSize: number, servingUnit: string): number {
  const size = servingSize > 0 ? servingSize : 1;
  if (isWeightUnit(servingUnit)) {
    return size * (GRAMS_PER_WEIGHT_UNIT[servingUnit] ?? 1);
  }
  return size;
}

/** Per-gram macros, rounded for storage. */
export function perGramMacros(macros: MacroValues, grams: number): MacroValues {
  const denom = grams > 0 ? grams : 1;
  return {
    calories: roundMacro(macros.calories / denom),
    protein: roundMacro(macros.protein / denom),
    carbs: roundMacro(macros.carbs / denom),
    fat: roundMacro(macros.fat / denom),
  };
}

/** Build a recipe ingredient from a library food at a given weight in grams. */
export function ingredientFromFood(
  food: FoodItem,
  grams: number,
  densityGrams?: number
): RecipeIngredient {
  const factor = isWeightUnit(food.servingUnit)
    ? grams / normalizeGrams(food.servingSize, food.servingUnit)
    : grams / (densityGrams ?? GRAMS_PER_UNIT[food.servingUnit] ?? 50);
  return {
    foodId: food.id,
    name: food.name,
    grams,
    macros: {
      calories: roundMacro(food.calories * factor),
      protein: roundMacro(food.protein * factor),
      carbs: roundMacro(food.carbs * factor),
      fat: roundMacro(food.fat * factor),
    },
  };
}

/** Build a recipe ingredient from hand-entered macros per 100 g. */
export function rawIngredient(
  name: string,
  grams: number,
  macrosPer100g: MacroValues
): RecipeIngredient {
  const factor = grams / 100;
  return {
    foodId: undefined,
    name,
    grams,
    macros: {
      calories: roundMacro(macrosPer100g.calories * factor),
      protein: roundMacro(macrosPer100g.protein * factor),
      carbs: roundMacro(macrosPer100g.carbs * factor),
      fat: roundMacro(macrosPer100g.fat * factor),
    },
  };
}

/** Sum ingredient macros and weights for a whole recipe. */
export function recipeTotals(ingredients: RecipeIngredient[]): {
  totals: MacroValues;
  totalWeightGrams: number;
} {
  const totals: MacroValues = { calories: 0, protein: 0, carbs: 0, fat: 0 };
  let totalWeightGrams = 0;
  for (const ingredient of ingredients) {
    totals.calories += ingredient.macros.calories;
    totals.protein += ingredient.macros.protein;
    totals.carbs += ingredient.macros.carbs;
    totals.fat += ingredient.macros.fat;
    totalWeightGrams += ingredient.grams;
  }
  return {
    totals: {
      calories: roundMacro(totals.calories),
      protein: roundMacro(totals.protein),
      carbs: roundMacro(totals.carbs),
      fat: roundMacro(totals.fat),
    },
    totalWeightGrams,
  };
}

/** Derive a loggable FoodItem from a recipe, with per-serving macros. */
export function buildRecipeFood(recipe: {
  name: string;
  totals: MacroValues;
  totalWeightGrams: number;
  servingGrams: number;
}): FoodItem {
  const factor =
    recipe.servingGrams /
    (recipe.totalWeightGrams > 0 ? recipe.totalWeightGrams : 1);
  return {
    name: recipe.name,
    calories: roundMacro(recipe.totals.calories * factor),
    protein: roundMacro(recipe.totals.protein * factor),
    carbs: roundMacro(recipe.totals.carbs * factor),
    fat: roundMacro(recipe.totals.fat * factor),
    servingSize: recipe.servingGrams,
    servingUnit: "g",
    isCustom: true,
    isRecipe: true,
  };
}
