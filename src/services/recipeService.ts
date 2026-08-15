import type { Recipe, RecipeInput, RecipeIngredient } from "@/core/types";
import type {
  IFoodRepository,
  IRecipeRepository,
  IRecipeService,
} from "@/core/interfaces";
import { buildRecipeFood, recipeTotals } from "@/lib/cooking";

export class RecipeService implements IRecipeService {
  private readonly recipeRepo: IRecipeRepository;
  private readonly foodRepo: IFoodRepository;

  constructor(recipeRepo: IRecipeRepository, foodRepo: IFoodRepository) {
    this.recipeRepo = recipeRepo;
    this.foodRepo = foodRepo;
  }

  async getRecipes(): Promise<Recipe[]> {
    return this.recipeRepo.getAll();
  }

  async getRecipe(id: number): Promise<Recipe | undefined> {
    return this.recipeRepo.getById(id);
  }

  async createRecipe(input: RecipeInput): Promise<Recipe> {
    const { totals, totalWeightGrams } = recipeTotals(input.ingredients);
    const derivedFood = buildRecipeFood({
      name: input.name,
      totals,
      totalWeightGrams,
      servingGrams: input.servingGrams,
    });
    const foodItemId = await this.foodRepo.put(derivedFood);
    const recipe: Recipe = {
      ...input,
      totals,
      totalWeightGrams,
      foodItemId,
      createdAt: Date.now(),
    };
    const id = await this.recipeRepo.put(recipe);
    return { ...recipe, id };
  }

  async updateRecipe(id: number, input: RecipeInput): Promise<Recipe> {
    const existing = await this.recipeRepo.getById(id);
    if (!existing) throw new Error("Recipe not found");

    const { totals, totalWeightGrams } = recipeTotals(input.ingredients);
    await this.recipeRepo.update(id, {
      name: input.name,
      ingredients: input.ingredients,
      totals,
      totalWeightGrams,
      servingGrams: input.servingGrams,
      updatedAt: Date.now(),
    });

    if (existing.foodItemId != null) {
      const derivedFood = buildRecipeFood({
        name: input.name,
        totals,
        totalWeightGrams,
        servingGrams: input.servingGrams,
      });
      await this.foodRepo.update(existing.foodItemId, derivedFood);
    }

    const updated = await this.recipeRepo.getById(id);
    if (!updated) throw new Error("Recipe not found");
    return updated;
  }

  async deleteRecipe(id: number): Promise<void> {
    const recipe = await this.recipeRepo.getById(id);
    if (recipe?.foodItemId != null) {
      await this.foodRepo.delete(recipe.foodItemId);
    }
    await this.recipeRepo.delete(id);
  }

  async exportRecipes(): Promise<string> {
    const recipes = await this.recipeRepo.getAll();
    return JSON.stringify(recipes, null, 2);
  }

  async importRecipes(json: string): Promise<number> {
    const data: unknown = JSON.parse(json);
    if (!Array.isArray(data)) {
      throw new Error("Import file must be a JSON array of recipes");
    }

    const valid: Omit<Recipe, "id">[] = [];
    for (const raw of data) {
      const item = raw as Partial<Recipe>;
      if (typeof item.name !== "string" || !item.name.trim()) continue;
      if (!Array.isArray(item.ingredients)) continue;

      const ingredients: RecipeIngredient[] = item.ingredients.filter(
        (ing): ing is RecipeIngredient =>
          typeof ing?.name === "string" &&
          !!ing.name.trim() &&
          Number.isFinite(Number(ing.grams))
      );

      const { totals, totalWeightGrams } = recipeTotals(ingredients);
      valid.push({
        name: item.name.trim(),
        ingredients,
        totals,
        totalWeightGrams,
        servingGrams: Number.isFinite(Number(item.servingGrams))
          ? Number(item.servingGrams)
          : 100,
        createdAt: item.createdAt ?? Date.now(),
      });
    }

    if (valid.length === 0) {
      throw new Error("No valid recipes found");
    }

    return this.recipeRepo.bulkAdd(valid);
  }
}
