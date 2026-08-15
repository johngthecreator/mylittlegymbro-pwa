import Dexie, { type Table } from "dexie";
import type { FoodItem, LogEntry, Recipe } from "../core/types";

class MacrocalcDB extends Dexie {
  foods!: Table<FoodItem, number>;
  logEntries!: Table<LogEntry, number>;
  recipes!: Table<Recipe, number>;

  constructor() {
    super("macrocalc");
    this.version(1).stores({
      foods: "++id, barcode, name",
      logEntries: "++id, foodId, date",
    });
    this.version(2).stores({
      foods: "++id, barcode, name",
      logEntries: "++id, foodId, date",
      recipes: "++id, name, createdAt",
    });
  }
}

export const db = new MacrocalcDB();
