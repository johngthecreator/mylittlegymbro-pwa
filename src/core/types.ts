export interface FoodItem {
  id?: number;
  barcode?: string;
  name: string;
  brand?: string;
  imageUrl?: string;
  /** Calories per serving */
  calories: number;
  /** Protein in grams per serving */
  protein: number;
  /** Carbs in grams per serving */
  carbs: number;
  /** Fat in grams per serving */
  fat: number;
  /** Serving size quantity (e.g. 100, 30, 1) */
  servingSize: number;
  /** Serving unit (e.g. "g", "ml", "cup", "oz") */
  servingUnit: string;
  /** True when created manually by the user (no barcode) */
  isCustom?: boolean;
  /** True for foods derived from a saved recipe (hidden from the library). */
  isRecipe?: boolean;
  /** True when the food represents a restaurant order / meal. */
  isOrder?: boolean;
  updatedAt?: number;
}

export interface FoodInput {
  barcode?: string;
  name: string;
  brand?: string;
  imageUrl?: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  servingSize: number;
  servingUnit: string;
  isCustom?: boolean;
}

export interface LogEntry {
  id?: number;
  /** Reference to the food that was eaten */
  foodId: number;
  /** Local date key "YYYY-MM-DD" */
  date: string;
  /** How much was actually eaten, in `unit` */
  amount: number;
  /** Unit for the eaten amount (snapshot at log time) */
  unit: string;
  createdAt: number;
}

export interface LogEntryWithFood extends LogEntry {
  food?: FoodItem;
}

export interface DailyTotals {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  /** Total number of logged servings */
  servings: number;
}

export interface MacroValues {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface RecipeIngredient {
  /** Reference to the library food, if any (undefined for quick-add raw ingredients). */
  foodId?: number;
  /** Ingredient label (snapshotted at cook time). */
  name: string;
  /** Weight added, in grams. */
  grams: number;
  /** Snapshot macros for this ingredient at `grams`. */
  macros: MacroValues;
}

export interface Recipe {
  id?: number;
  name: string;
  ingredients: RecipeIngredient[];
  /** Sum of ingredient weights in grams. */
  totalWeightGrams: number;
  /** Total macros for the whole meal. */
  totals: MacroValues;
  /** Chosen serving size in grams. */
  servingGrams: number;
  /** Id of the derived, loggable FoodItem created from this recipe. */
  foodItemId?: number;
  createdAt: number;
  updatedAt?: number;
}

export interface RecipeInput {
  name: string;
  ingredients: RecipeIngredient[];
  servingGrams: number;
}

export interface FoodSearchSource {
  title: string;
  uri: string;
}

/** Nutrition info extracted by the AI for a single food or restaurant order. */
export interface FoodSearchResult {
  name: string;
  brand?: string;
  /** Serving size in grams (for single-item results). */
  servingSizeGrams?: number;
  /** Serving unit override (for order results, e.g. "order", "meal", "combo"). */
  servingUnit?: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  /** Web pages the model grounded its answer on. */
  sources?: FoodSearchSource[];
}
