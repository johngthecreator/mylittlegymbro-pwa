import type {
  DailyTotals,
  FoodInput,
  FoodItem,
  FoodSearchResult,
  LogEntry,
  LogEntryWithFood,
  Recipe,
  RecipeInput,
} from "./types";

// ---------------------------------------------------------------------------
// Repositories (data layer)
// ---------------------------------------------------------------------------

export interface IFoodRepository {
  getByBarcode(barcode: string): Promise<FoodItem | undefined>;
  getById(id: number): Promise<FoodItem | undefined>;
  getAll(): Promise<FoodItem[]>;
  put(food: FoodItem | FoodInput): Promise<number>;
  /** Insert a batch of new foods. Returns the number inserted. */
  bulkAdd(foods: Omit<FoodItem, "id">[]): Promise<number>;
  update(id: number, changes: Partial<FoodItem>): Promise<void>;
  delete(id: number): Promise<void>;
}

export interface IOffFoodRepository {
  fetchByBarcode(barcode: string): Promise<FoodItem>;
}

export interface ILogRepository {
  getByDate(date: string): Promise<LogEntry[]>;
  add(entry: Omit<LogEntry, "id">): Promise<number>;
  update(id: number, changes: Partial<LogEntry>): Promise<void>;
  delete(id: number): Promise<void>;
  deleteOlderThan(date: string): Promise<void>;
}

export interface IRecipeRepository {
  getAll(): Promise<Recipe[]>;
  getById(id: number): Promise<Recipe | undefined>;
  put(recipe: Recipe): Promise<number>;
  update(id: number, changes: Partial<Recipe>): Promise<void>;
  delete(id: number): Promise<void>;
  bulkAdd(recipes: Omit<Recipe, "id">[]): Promise<number>;
}

// ---------------------------------------------------------------------------
// Services (business logic layer)
// ---------------------------------------------------------------------------

export interface IFoodService {
  /** Cache-first lookup. Returns cached (possibly user-corrected) food if
   *  present, otherwise fetches from OpenFoodFacts and writes through to the
   *  cache. */
  lookupByBarcode(barcode: string): Promise<FoodItem>;
  /** Create a new food, or update an existing one when `existingId` is given. */
  upsertFood(input: FoodInput, existingId?: number): Promise<FoodItem>;
  updateFood(id: number, changes: Partial<FoodItem>): Promise<FoodItem>;
  createCustomFood(input: FoodInput): Promise<FoodItem>;
  getAllFoods(): Promise<FoodItem[]>;
  deleteFood(id: number): Promise<void>;
  /** Serialize the whole food library to a JSON string. */
  exportFoods(): Promise<string>;
  /** Import foods from a JSON string (array of food entries). Returns the number imported. */
  importFoods(json: string): Promise<number>;
}

export interface ILogService {
  /** Local date key for "today" in the format "YYYY-MM-DD". */
  getDateKey(date?: Date): string;
  /** Today's entries, each joined with its food. */
  getEntries(date?: Date): Promise<LogEntryWithFood[]>;
  addEntry(foodId: number, amount: number, unit: string): Promise<LogEntry>;
  removeEntry(id: number): Promise<void>;
  getDailyTotals(entries: LogEntryWithFood[]): DailyTotals;
  purgeOldEntries(): Promise<void>;
}

export interface IRecipeService {
  getRecipes(): Promise<Recipe[]>;
  getRecipe(id: number): Promise<Recipe | undefined>;
  createRecipe(input: RecipeInput): Promise<Recipe>;
  updateRecipe(id: number, input: RecipeInput): Promise<Recipe>;
  deleteRecipe(id: number): Promise<void>;
  /** Serialize all saved recipes to a JSON string. */
  exportRecipes(): Promise<string>;
  /** Import recipes from a JSON string (array of recipe entries). Returns the number imported. */
  importRecipes(json: string): Promise<number>;
}

// ---------------------------------------------------------------------------
// AI (Gemini)
// ---------------------------------------------------------------------------

export interface IAiService {
  /** True when a Gemini API key is configured in settings. */
  hasApiKey(): boolean;
  /** Extract nutrition facts from a nutrition-label image. */
  parseNutritionLabel(
    image: { data: string; mimeType: string },
    barcode: string
  ): Promise<FoodInput>;
  /** Web-search the nutrition of a food / restaurant order. */
  searchFood(query: string): Promise<FoodSearchResult>;
}

// ---------------------------------------------------------------------------
// Scanner
// ---------------------------------------------------------------------------

export interface IScannerService {
  /** Start the camera feed inside `containerId` and report decoded barcodes. */
  start(containerId: string, onDetected: (barcode: string) => void): Promise<void>;
  stop(): Promise<void>;
  isRunning(): boolean;
  hasTorch(): Promise<boolean>;
  toggleTorch(): Promise<boolean>;
  scanFile(file: File): Promise<string>;
}
