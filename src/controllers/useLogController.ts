import { useCallback, useEffect, useMemo, useState } from "react";
import type { DailyTotals, LogEntryWithFood } from "@/core/types";
import { useServices } from "@/di/AppServicesProvider";

export function useTodayLog(): {
  entries: LogEntryWithFood[];
  loading: boolean;
  refresh(): Promise<void>;
} {
  const { logService } = useServices();
  const [entries, setEntries] = useState<LogEntryWithFood[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      setEntries(await logService.getEntries());
    } catch {
      // keep previous entries on failure
    } finally {
      setLoading(false);
    }
  }, [logService]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { entries, loading, refresh };
}

export function useAddLogEntry(): {
  adding: boolean;
  error: string | null;
  add(foodId: number, amount: number, unit: string): Promise<void>;
} {
  const { logService } = useServices();
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const add = useCallback(
    async (foodId: number, amount: number, unit: string) => {
      setAdding(true);
      setError(null);
      try {
        await logService.addEntry(foodId, amount, unit);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
      } finally {
        setAdding(false);
      }
    },
    [logService]
  );

  return { adding, error, add };
}

export function useRemoveLogEntry(): {
  removingId: number | null;
  remove(id: number): Promise<void>;
} {
  const { logService } = useServices();
  const [removingId, setRemovingId] = useState<number | null>(null);

  const remove = useCallback(
    async (id: number) => {
      setRemovingId(id);
      try {
        await logService.removeEntry(id);
      } finally {
        setRemovingId(null);
      }
    },
    [logService]
  );

  return { removingId, remove };
}

export function useDailyTotals(entries: LogEntryWithFood[]): DailyTotals {
  const { logService } = useServices();
  return useMemo(() => logService.getDailyTotals(entries), [entries, logService]);
}
