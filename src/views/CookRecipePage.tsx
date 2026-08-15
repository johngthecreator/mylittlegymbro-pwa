import { useEffect, useMemo, useState } from "react";
import type { RecipeIngredient } from "@/core/types";
import { recipeTotals } from "@/lib/cooking";
import { formatNumber } from "@/lib/nutrition";
import { useLocation, useParams } from "wouter";
import { toast } from "sonner";
import { PlusIcon, XIcon } from "lucide-react";
import { useRecipe, useSaveRecipe } from "@/controllers/useRecipeController";
import { IngredientDialog } from "@/components/IngredientDialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertTitle } from "@/components/ui/alert";

export default function CookRecipePage() {
  const { id } = useParams();
  const [, navigate] = useLocation();
  const isNew = !id || id === "new";
  const numericId = isNew ? undefined : Number(id);

  const { recipe, loading } = useRecipe(numericId);
  const { saving, error, save } = useSaveRecipe();

  const [name, setName] = useState("");
  const [ingredients, setIngredients] = useState<RecipeIngredient[]>([]);
  const [servingGrams, setServingGrams] = useState("100");
  const [addOpen, setAddOpen] = useState(false);

  useEffect(() => {
    if (!recipe) return;
    setName(recipe.name);
    setIngredients(recipe.ingredients);
    setServingGrams(String(recipe.servingGrams));
  }, [recipe]);

  const { totals, totalWeightGrams } = useMemo(
    () => recipeTotals(ingredients),
    [ingredients]
  );

  const parsedServing = parseFloat(servingGrams) || 100;
  const servingFactor =
    parsedServing / (totalWeightGrams > 0 ? totalWeightGrams : 1);
  const perServing = {
    calories: totals.calories * servingFactor,
    protein: totals.protein * servingFactor,
    carbs: totals.carbs * servingFactor,
    fat: totals.fat * servingFactor,
  };
  const calPer100g =
    totalWeightGrams > 0 ? (totals.calories / totalWeightGrams) * 100 : 0;

  const handleSave = async () => {
    const saved = await save(
      {
        name: name.trim(),
        ingredients,
        servingGrams: parsedServing,
      },
      numericId
    );
    if (!saved) return;
    toast.success("Saved");
    navigate("/cook");
  };

  const removeIngredient = (index: number) => {
    setIngredients((ings) => ings.filter((_, i) => i !== index));
  };

  return (
    <div className="mx-auto w-full max-w-md px-4 py-6 space-y-4">
      <h1 className="text-2xl font-bold">{isNew ? "New recipe" : "Edit recipe"}</h1>

      {loading ? (
        <Card>
          <CardContent className="space-y-3 py-4">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-8 w-full" />
          </CardContent>
        </Card>
      ) : !isNew && !recipe ? (
        <Alert variant="destructive">
          <AlertTitle>Recipe not found</AlertTitle>
        </Alert>
      ) : (
        <>
          <Card>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="recipe-name">Name</Label>
                <Input
                  id="recipe-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Sunday chili"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="serving-size">Serving size (g)</Label>
                <Input
                  id="serving-size"
                  type="number"
                  inputMode="decimal"
                  step="any"
                  min={0}
                  value={servingGrams}
                  onChange={(e) => setServingGrams(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Summary</CardTitle>
              <CardDescription>Whole meal totals</CardDescription>
            </CardHeader>
            <CardContent className="space-y-1">
              <p className="font-medium">
                {formatNumber(totals.calories)} cal · P {formatNumber(totals.protein)}{" "}
                · C {formatNumber(totals.carbs)} · F {formatNumber(totals.fat)}
              </p>
              <p className="text-sm text-muted-foreground">
                {formatNumber(totalWeightGrams)} g total
              </p>
              <p className="text-sm text-muted-foreground">
                {formatNumber(calPer100g)} cal per 100 g
              </p>
              <p className="text-sm text-muted-foreground">
                {formatNumber(perServing.calories)} cal per{" "}
                {formatNumber(parsedServing)} g serving
              </p>
            </CardContent>
          </Card>

          <div className="flex items-center justify-between gap-2">
            <h2 className="text-lg font-semibold">Ingredients</h2>
            <Button variant="outline" size="sm" onClick={() => setAddOpen(true)}>
              <PlusIcon />
              Add ingredient
            </Button>
          </div>

          {ingredients.length === 0 ? (
            <Card>
              <CardContent className="py-6 text-center text-sm text-muted-foreground">
                No ingredients yet.
              </CardContent>
            </Card>
          ) : (
            ingredients.map((ing, index) => (
              <Card key={index} size="sm">
                <CardContent className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="truncate font-medium">{ing.name}</div>
                    <p className="text-xs text-muted-foreground">
                      {formatNumber(ing.grams)} g · {formatNumber(ing.macros.calories)}{" "}
                      cal · P {formatNumber(ing.macros.protein)} · C{" "}
                      {formatNumber(ing.macros.carbs)} · F {formatNumber(ing.macros.fat)}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label={`Remove ${ing.name}`}
                    onClick={() => removeIngredient(index)}
                  >
                    <XIcon />
                  </Button>
                </CardContent>
              </Card>
            ))
          )}

          <div className="flex items-center gap-2">
            <Button onClick={handleSave} disabled={saving || !name.trim()}>
              {saving ? "Saving…" : "Save recipe"}
            </Button>
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
        </>
      )}

      <IngredientDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        onConfirm={(ingredient) => {
          setIngredients((ings) => [...ings, ingredient]);
        }}
      />
    </div>
  );
}
