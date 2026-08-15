import type {
  DailyTotals,
  LogEntry,
  LogEntryWithFood,
} from "@/core/types";
import type {
  IFoodRepository,
  ILogRepository,
  ILogService,
} from "@/core/interfaces";
import { scaledMacros } from "@/lib/nutrition";
import { dateKey } from "@/lib/dates";

export class LogService implements ILogService {
  private readonly logRepo: ILogRepository;
  private readonly foodRepo: IFoodRepository;

  constructor(logRepo: ILogRepository, foodRepo: IFoodRepository) {
    this.logRepo = logRepo;
    this.foodRepo = foodRepo;
  }

  getDateKey(d?: Date): string {
    return dateKey(d);
  }

  async getEntries(date?: Date): Promise<LogEntryWithFood[]> {
    const key = this.getDateKey(date);
    const entries = await this.logRepo.getByDate(key);

    const withFood: LogEntryWithFood[] = [];
    for (const entry of entries) {
      const food = await this.foodRepo.getById(entry.foodId);
      withFood.push({ ...entry, food });
    }

    return withFood.sort((a, b) => a.createdAt - b.createdAt);
  }

  async addEntry(foodId: number, amount: number, unit: string): Promise<LogEntry> {
    if (!(Number.isFinite(amount) && amount > 0)) {
      throw new Error("Amount must be a positive number");
    }

    const entry: Omit<LogEntry, "id"> = {
      foodId,
      date: this.getDateKey(),
      amount,
      unit,
      createdAt: Date.now(),
    };
    const id = await this.logRepo.add(entry);
    return { ...entry, id };
  }

  removeEntry(id: number): Promise<void> {
    return this.logRepo.delete(id);
  }

  getDailyTotals(entries: LogEntryWithFood[]): DailyTotals {
    const totals: DailyTotals = {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      servings: 0,
    };

    for (const entry of entries) {
      if (!entry.food) continue;

      const m = scaledMacros(entry.food, entry.amount);
      totals.calories += m.calories;
      totals.protein += m.protein;
      totals.carbs += m.carbs;
      totals.fat += m.fat;
      totals.servings +=
        entry.amount / (entry.food.servingSize > 0 ? entry.food.servingSize : 1);
    }

    return totals;
  }

  purgeOldEntries(): Promise<void> {
    return this.logRepo.deleteOlderThan(this.getDateKey());
  }
}
