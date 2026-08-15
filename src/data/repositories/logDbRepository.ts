import type { LogEntry } from "@/core/types";
import type { ILogRepository } from "@/core/interfaces";
import { db } from "@/data/db";

export class LogDbRepository implements ILogRepository {
  async getByDate(date: string): Promise<LogEntry[]> {
    return db.logEntries.where("date").equals(date).toArray();
  }

  async add(entry: Omit<LogEntry, "id">): Promise<number> {
    return db.logEntries.add(entry);
  }

  async update(id: number, changes: Partial<LogEntry>): Promise<void> {
    await db.logEntries.update(id, changes);
  }

  async delete(id: number): Promise<void> {
    await db.logEntries.delete(id);
  }

  async deleteOlderThan(date: string): Promise<void> {
    await db.logEntries.where("date").below(date).delete();
  }
}
