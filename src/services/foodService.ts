import type { FoodInput, FoodItem } from "@/core/types";
import type {
  IFoodRepository,
  IFoodService,
  IOffFoodRepository,
} from "@/core/interfaces";

export class FoodService implements IFoodService {
  private readonly offRepo: IOffFoodRepository;
  private readonly foodRepo: IFoodRepository;

  constructor(offRepo: IOffFoodRepository, foodRepo: IFoodRepository) {
    this.offRepo = offRepo;
    this.foodRepo = foodRepo;
  }

  async lookupByBarcode(barcode: string): Promise<FoodItem> {
    barcode = barcode.trim();
    if (!barcode) throw new Error("Please enter a barcode");

    const cached = await this.foodRepo.getByBarcode(barcode);
    if (cached) return cached;

    const off = await this.offRepo.fetchByBarcode(barcode);
    const id = await this.foodRepo.put(off);
    return { ...off, id };
  }

  async upsertFood(input: FoodInput, existingId?: number): Promise<FoodItem> {
    if (existingId !== undefined) {
      await this.foodRepo.update(existingId, input);
      return { ...input, id: existingId };
    }

    const id = await this.foodRepo.put(input);
    return { ...input, id };
  }

  async updateFood(id: number, changes: Partial<FoodItem>): Promise<FoodItem> {
    await this.foodRepo.update(id, changes);
    const updated = await this.foodRepo.getById(id);
    if (!updated) throw new Error("Food not found");
    return updated;
  }

  async createCustomFood(input: FoodInput): Promise<FoodItem> {
    const withFlag: FoodInput = { ...input, isCustom: true };
    const id = await this.foodRepo.put(withFlag);
    return { ...withFlag, id };
  }

  async getAllFoods(): Promise<FoodItem[]> {
    const all = await this.foodRepo.getAll();
    return all.filter((food) => !food.isRecipe);
  }

  deleteFood(id: number): Promise<void> {
    return this.foodRepo.delete(id);
  }

  async exportFoods(): Promise<string> {
    const foods = await this.foodRepo.getAll();
    return JSON.stringify(foods, null, 2);
  }

  async importFoods(json: string): Promise<number> {
    const data: unknown = JSON.parse(json);
    if (!Array.isArray(data)) {
      throw new Error("Import file must be a JSON array of foods");
    }

    const valid: Omit<FoodItem, "id">[] = [];
    for (const raw of data) {
      const item = raw as Partial<FoodItem>;
      if (typeof item.name !== "string" || !item.name.trim()) continue;
      if (
        !Number.isFinite(Number(item.calories)) ||
        !Number.isFinite(Number(item.protein)) ||
        !Number.isFinite(Number(item.carbs)) ||
        !Number.isFinite(Number(item.fat))
      ) {
        continue;
      }

      valid.push({
        name: item.name.trim(),
        brand: typeof item.brand === "string" ? item.brand : undefined,
        barcode: typeof item.barcode === "string" ? item.barcode : undefined,
        imageUrl: typeof item.imageUrl === "string" ? item.imageUrl : undefined,
        calories: Number(item.calories),
        protein: Number(item.protein),
        carbs: Number(item.carbs),
        fat: Number(item.fat),
        servingSize: Number.isFinite(Number(item.servingSize))
          ? Number(item.servingSize)
          : 1,
        servingUnit:
          typeof item.servingUnit === "string" && item.servingUnit.trim()
            ? item.servingUnit
            : "serving",
        isCustom: item.isCustom ?? true,
      });
    }

    if (valid.length === 0) {
      throw new Error("No valid foods found in the file");
    }

    return this.foodRepo.bulkAdd(valid);
  }
}
