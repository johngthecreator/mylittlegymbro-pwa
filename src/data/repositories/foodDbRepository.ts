import type { FoodItem, FoodInput } from "@/core/types";
import type { IFoodRepository } from "@/core/interfaces";
import { db } from "@/data/db";

export class FoodDbRepository implements IFoodRepository {
  async getByBarcode(barcode: string): Promise<FoodItem | undefined> {
    return db.foods.where("barcode").equals(barcode).first();
  }

  async getById(id: number): Promise<FoodItem | undefined> {
    return db.foods.get(id);
  }

  async getAll(): Promise<FoodItem[]> {
    return db.foods.orderBy("name").toArray();
  }

  async put(food: FoodItem | FoodInput): Promise<number> {
    const updatedAt = "updatedAt" in food ? food.updatedAt : undefined;
    const withStamp = { ...food, updatedAt: updatedAt ?? Date.now() };
    return db.foods.put(withStamp);
  }

  async bulkAdd(foods: Omit<FoodItem, "id">[]): Promise<number> {
    const stamped = foods.map((food) => ({ ...food, updatedAt: Date.now() }));
    await db.foods.bulkAdd(stamped);
    return stamped.length;
  }

  async update(id: number, changes: Partial<FoodItem>): Promise<void> {
    await db.foods.update(id, { ...changes, updatedAt: Date.now() });
  }

  async delete(id: number): Promise<void> {
    await db.foods.delete(id);
  }
}
