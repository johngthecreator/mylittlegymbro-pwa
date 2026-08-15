import { useState } from "react";
import type { Recipe } from "@/core/types";
import { buildRecipeFood } from "@/lib/cooking";
import { formatNumber } from "@/lib/nutrition";
import { useLocation } from "wouter";
import { toast } from "sonner";
import { LogInIcon, PencilIcon, PlusIcon, TrashIcon } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { AmountDialog } from "@/components/AmountDialog";
import { useRecipes, useDeleteRecipe } from "@/controllers/useRecipeController";
import { useAddLogEntry } from "@/controllers/useLogController";

export default function CookPage() {
  const [, navigate] = useLocation();
  const { recipes, loading, refresh } = useRecipes();
  const { deletingId, remove } = useDeleteRecipe();
  const { adding, add } = useAddLogEntry();
  const [logRecipe, setLogRecipe] = useState<Recipe | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleDelete = async (recipe: Recipe) => {
    if (recipe.id == null) return;
    if (!window.confirm(`Delete "${recipe.name}"?`)) return;
    await remove(recipe.id);
    toast.success(`${recipe.name} removed`);
    await refresh();
  };

  const handleLog = async (amount: number, unit: string) => {
    if (!logRecipe) return;
    if (logRecipe.foodItemId == null) {
      toast.error("Recipe has no linked food");
      setDialogOpen(false);
      setLogRecipe(null);
      return;
    }
    try {
      await add(logRecipe.foodItemId, amount, unit);
      toast.success(`${logRecipe.name} logged`);
    } catch {
      toast.error("Could not log this recipe");
    }
    setDialogOpen(false);
    setLogRecipe(null);
  };

  return (
    <div className="mx-auto w-full max-w-md px-4 py-6 space-y-4">
      <div className="flex items-center justify-between gap-2">
        <h1 className="text-2xl font-bold">Home cook</h1>
        <Button onClick={() => navigate("/cook/new")}>
          <PlusIcon />
          New recipe
        </Button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <Card key={i}>
              <CardContent className="space-y-2 py-4">
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-3 w-1/3" />
                <Skeleton className="h-3 w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : recipes.length === 0 ? (
        <Card>
          <CardHeader className="text-center">
            <CardTitle>No recipes yet</CardTitle>
            <CardDescription>Cook a meal and save it as a recipe.</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Button onClick={() => navigate("/cook/new")}>Create a recipe</Button>
          </CardContent>
        </Card>
      ) : (
        recipes.map((recipe) => {
          const food = buildRecipeFood(recipe);
          return (
            <Card key={recipe.id}>
              <CardContent className="space-y-2 py-4">
                <CardTitle className="truncate">{recipe.name}</CardTitle>
                <p className="text-sm text-muted-foreground">
                  {formatNumber(recipe.ingredients.length)} ingredients ·{" "}
                  {formatNumber(recipe.totalWeightGrams)} g ·{" "}
                  {formatNumber(recipe.totals.calories)} cal
                </p>
                <p className="text-sm text-muted-foreground">
                  {formatNumber(food.calories)} cal per{" "}
                  {formatNumber(recipe.servingGrams)} g serving
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setLogRecipe(recipe);
                      setDialogOpen(true);
                    }}
                  >
                    <LogInIcon />
                    Log
                  </Button>
                  {recipe.id != null && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/cook/${recipe.id}`)}
                    >
                      <PencilIcon />
                      Edit
                    </Button>
                  )}
                  <Button
                    variant="destructive"
                    size="sm"
                    disabled={deletingId === recipe.id}
                    onClick={() => void handleDelete(recipe)}
                  >
                    <TrashIcon />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })
      )}

      <AmountDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) setLogRecipe(null);
        }}
        food={logRecipe ? buildRecipeFood(logRecipe) : null}
        onConfirm={handleLog}
        submitting={adding}
      />
    </div>
  );
}
