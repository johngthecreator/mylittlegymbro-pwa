import { useCallback, useEffect, useState } from "react";
import type { FoodInput, FoodItem } from "@/core/types";
import { FoodNotFoundError } from "@/core/errors";
import { useServices } from "@/di/AppServicesProvider";

export function useBarcodeLookup(): {
  food: FoodItem | null;
  loading: boolean;
  error: string | null;
  notFound: boolean;
  lookup(barcode: string): Promise<void>;
  reset(): void;
} {
  const { foodService } = useServices();
  const [food, setFood] = useState<FoodItem | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  const lookup = useCallback(
    async (barcode: string) => {
      setLoading(true);
      setError(null);
      setNotFound(false);
      try {
        setFood(await foodService.lookupByBarcode(barcode));
      } catch (err) {
        if (err instanceof FoodNotFoundError) {
          setNotFound(true);
        }
        setError(err instanceof Error ? err.message : "Something went wrong");
      } finally {
        setLoading(false);
      }
    },
    [foodService]
  );

  const reset = useCallback(() => {
    setFood(null);
    setError(null);
    setNotFound(false);
  }, []);

  return { food, loading, error, notFound, lookup, reset };
}

export function useFoods(): {
  foods: FoodItem[];
  loading: boolean;
  error: string | null;
  refresh(): Promise<void>;
  removeFood(id: number): Promise<void>;
} {
  const { foodService } = useServices();
  const [foods, setFoods] = useState<FoodItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setFoods(await foodService.getAllFoods());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, [foodService]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const removeFood = useCallback(
    async (id: number) => {
      await foodService.deleteFood(id);
      await refresh();
    },
    [foodService, refresh]
  );

  return { foods, loading, error, refresh, removeFood };
}

export function useSaveFood(): {
  saving: boolean;
  error: string | null;
  save(input: FoodInput, existingId?: number): Promise<FoodItem | null>;
} {
  const { foodService } = useServices();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const save = useCallback(
    async (input: FoodInput, existingId?: number) => {
      setSaving(true);
      setError(null);
      try {
        return await foodService.upsertFood(input, existingId);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
        return null;
      } finally {
        setSaving(false);
      }
    },
    [foodService]
  );

  return { saving, error, save };
}

export function useFood(id: number | undefined): {
  food: FoodItem | null;
  loading: boolean;
} {
  const { foodService } = useServices();
  const [food, setFood] = useState<FoodItem | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (id == null) {
      setFood(null);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    foodService
      .getAllFoods()
      .then((all) => {
        if (!cancelled) setFood(all.find((f) => f.id === id) ?? null);
      })
      .catch(() => {
        if (!cancelled) setFood(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [id, foodService]);

  return { food, loading };
}
