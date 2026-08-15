import type { Recipe } from "@/core/types";
import type { IRecipeRepository } from "@/core/interfaces";
import { db } from "@/data/db";

export class RecipeDbRepository implements IRecipeRepository {
  async getAll(): Promise<Recipe[]> {
    return db.recipes.orderBy("createdAt").toArray();
  }

  async getById(id: number): Promise<Recipe | undefined> {
    return db.recipes.get(id);
  }

  async put(recipe: Recipe): Promise<number> {
    return db.recipes.put(recipe);
  }

  async update(id: number, changes: Partial<Recipe>): Promise<void> {
    await db.recipes.update(id, changes);
  }

  async delete(id: number): Promise<void> {
    await db.recipes.delete(id);
  }

  async bulkAdd(recipes: Omit<Recipe, "id">[]): Promise<number> {
    const stamped = recipes.map((recipe) => ({
      ...recipe,
      createdAt: recipe.createdAt ?? Date.now(),
      updatedAt: recipe.updatedAt ?? Date.now(),
    }));
    await db.recipes.bulkAdd(stamped);
    return stamped.length;
  }
}
