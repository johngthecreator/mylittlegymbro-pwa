import Dexie, { type Table } from "dexie";
import type { FoodItem, LogEntry, Recipe, SettingEntry } from "../core/types";

class MacrocalcDB extends Dexie {
  foods!: Table<FoodItem, number>;
  logEntries!: Table<LogEntry, number>;
  recipes!: Table<Recipe, number>;
  settings!: Table<SettingEntry, string>;

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
    this.version(3).stores({
      foods: "++id, barcode, name",
      logEntries: "++id, foodId, date",
      recipes: "++id, name, createdAt",
      settings: "key",
    });
  }
}

export const db = new MacrocalcDB();
