import { useCallback, useEffect, useState } from "react";
import type { Recipe, RecipeInput } from "@/core/types";
import { useServices } from "@/di/AppServicesProvider";

export function useRecipes(): {
  recipes: Recipe[];
  loading: boolean;
  refresh(): Promise<void>;
} {
  const { recipeService } = useServices();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      setRecipes(await recipeService.getRecipes());
    } catch {
      // keep previous recipes on failure
    } finally {
      setLoading(false);
    }
  }, [recipeService]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { recipes, loading, refresh };
}

export function useRecipe(id: number | undefined): {
  recipe: Recipe | null;
  loading: boolean;
} {
  const { recipeService } = useServices();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (id == null) {
      setRecipe(null);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    recipeService
      .getRecipe(id)
      .then((r) => {
        if (!cancelled) setRecipe(r ?? null);
      })
      .catch(() => {
        if (!cancelled) setRecipe(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [id, recipeService]);

  return { recipe, loading };
}

export function useSaveRecipe(): {
  saving: boolean;
  error: string | null;
  save(input: RecipeInput, id?: number): Promise<Recipe | null>;
} {
  const { recipeService } = useServices();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const save = useCallback(
    async (input: RecipeInput, id?: number) => {
      setSaving(true);
      setError(null);
      try {
        return id != null
          ? await recipeService.updateRecipe(id, input)
          : await recipeService.createRecipe(input);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
        return null;
      } finally {
        setSaving(false);
      }
    },
    [recipeService]
  );

  return { saving, error, save };
}

export function useDeleteRecipe(): {
  deletingId: number | null;
  remove(id: number): Promise<void>;
} {
  const { recipeService } = useServices();
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const remove = useCallback(
    async (id: number) => {
      setDeletingId(id);
      try {
        await recipeService.deleteRecipe(id);
      } finally {
        setDeletingId(null);
      }
    },
    [recipeService]
  );

  return { deletingId, remove };
}
