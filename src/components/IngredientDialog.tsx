import { useEffect, useState } from "react";
import type { FoodItem, RecipeIngredient } from "@/core/types";
import { GRAMS_PER_UNIT } from "@/core/constants";
import { formatNumber } from "@/lib/nutrition";
import { ingredientFromFood, isWeightUnit, rawIngredient } from "@/lib/cooking";
import { useServices } from "@/di/AppServicesProvider";
import { toast } from "sonner";
import { SearchIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export function IngredientDialog(props: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (ingredient: RecipeIngredient) => void;
}) {
  const { open, onOpenChange, onConfirm } = props;
  const { foodService } = useServices();

  const [foods, setFoods] = useState<FoodItem[]>([]);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<FoodItem | null>(null);
  const [grams, setGrams] = useState("");
  const [density, setDensity] = useState("");

  const [qaName, setQaName] = useState("");
  const [qaGrams, setQaGrams] = useState("");
  const [qaCalories, setQaCalories] = useState("");
  const [qaProtein, setQaProtein] = useState("");
  const [qaCarbs, setQaCarbs] = useState("");
  const [qaFat, setQaFat] = useState("");

  useEffect(() => {
    let cancelled = false;
    foodService
      .getAllFoods()
      .then((all) => {
        if (!cancelled) setFoods(all.filter((f) => !f.isRecipe));
      })
      .catch(() => {
        if (!cancelled) toast.error("Could not load foods");
      });
    return () => {
      cancelled = true;
    };
  }, [foodService]);

  useEffect(() => {
    if (open) {
      setQuery("");
      setSelected(null);
      setGrams("");
      setDensity("");
      setQaName("");
      setQaGrams("");
      setQaCalories("");
      setQaProtein("");
      setQaCarbs("");
      setQaFat("");
    }
  }, [open]);

  const filtered = foods.filter((food) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return (
      food.name.toLowerCase().includes(q) ||
      (food.brand ?? "").toLowerCase().includes(q)
    );
  });

  const selectFood = (food: FoodItem) => {
    setSelected(food);
    setGrams("");
    setDensity(String(GRAMS_PER_UNIT[food.servingUnit] ?? 50));
  };

  const confirmLibrary = () => {
    if (!selected) return;
    const amount = parseFloat(grams);
    if (!(Number.isFinite(amount) && amount > 0)) {
      toast.error("Enter a weight in grams");
      return;
    }
    const densityValue = parseFloat(density);
    onConfirm(
      ingredientFromFood(
        selected,
        amount,
        Number.isFinite(densityValue) ? densityValue : undefined
      )
    );
    onOpenChange(false);
  };

  const confirmQuick = () => {
    if (!qaName.trim()) {
      toast.error("Enter an ingredient name");
      return;
    }
    const amount = parseFloat(qaGrams);
    if (!(Number.isFinite(amount) && amount > 0)) {
      toast.error("Enter a weight in grams");
      return;
    }
    const num = (value: string) => {
      const parsed = parseFloat(value);
      return Number.isFinite(parsed) ? parsed : 0;
    };
    onConfirm(
      rawIngredient(qaName.trim(), amount, {
        calories: num(qaCalories),
        protein: num(qaProtein),
        carbs: num(qaCarbs),
        fat: num(qaFat),
      })
    );
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add ingredient</DialogTitle>
          <DialogDescription>
            Pick a food from your library or enter macros by hand.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="library">
          <TabsList className="w-full">
            <TabsTrigger value="library" className="flex-1">
              Library
            </TabsTrigger>
            <TabsTrigger value="quickadd" className="flex-1">
              Quick add
            </TabsTrigger>
          </TabsList>

          <TabsContent value="library" className="space-y-3">
            <div className="relative">
              <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search foods"
                className="pl-8"
              />
            </div>

            <div className="max-h-64 space-y-2 overflow-y-auto">
              {filtered.map((food) => (
                <Card key={food.id} size="sm">
                  <CardContent className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => selectFood(food)}
                      className="min-w-0 flex-1 text-left"
                    >
                      <div className="truncate font-medium">{food.name}</div>
                      <div className="truncate text-xs text-muted-foreground">
                        {formatNumber(food.calories)} cal · P{" "}
                        {formatNumber(food.protein)} · C {formatNumber(food.carbs)}{" "}
                        · F {formatNumber(food.fat)} per {formatNumber(food.servingSize)}{" "}
                        {food.servingUnit}
                      </div>
                    </button>
                    <Button variant="outline" size="sm" onClick={() => selectFood(food)}>
                      Add
                    </Button>
                  </CardContent>
                </Card>
              ))}
              {filtered.length === 0 && (
                <p className="py-4 text-center text-sm text-muted-foreground">
                  No matching foods
                </p>
              )}
            </div>

            {selected && (
              <div className="space-y-3 rounded-lg border p-3">
                <div className="space-y-1.5">
                  <Label htmlFor="ingredient-grams">Weight (g)</Label>
                  <Input
                    id="ingredient-grams"
                    type="number"
                    inputMode="decimal"
                    step="any"
                    min={0}
                    value={grams}
                    onChange={(e) => setGrams(e.target.value)}
                    placeholder="e.g. 150"
                  />
                </div>
                {!isWeightUnit(selected.servingUnit) && (
                  <div className="space-y-1.5">
                    <Label htmlFor="ingredient-density">
                      Grams per {selected.servingUnit}
                    </Label>
                    <Input
                      id="ingredient-density"
                      type="number"
                      inputMode="decimal"
                      step="any"
                      min={0}
                      value={density}
                      onChange={(e) => setDensity(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      Estimated weight of one {selected.servingUnit}.
                    </p>
                  </div>
                )}
                <Button className="w-full" onClick={confirmLibrary}>
                  Add ingredient
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="quickadd" className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="qa-name">Name</Label>
              <Input
                id="qa-name"
                value={qaName}
                onChange={(e) => setQaName(e.target.value)}
                placeholder="e.g. Chicken breast"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="qa-grams">Weight (g)</Label>
              <Input
                id="qa-grams"
                type="number"
                inputMode="decimal"
                step="any"
                min={0}
                value={qaGrams}
                onChange={(e) => setQaGrams(e.target.value)}
                placeholder="e.g. 200"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1.5">
                <Label htmlFor="qa-calories">Calories / 100 g</Label>
                <Input
                  id="qa-calories"
                  type="number"
                  inputMode="decimal"
                  step="any"
                  min={0}
                  value={qaCalories}
                  onChange={(e) => setQaCalories(e.target.value)}
                  placeholder="e.g. 165"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="qa-protein">Protein / 100 g</Label>
                <Input
                  id="qa-protein"
                  type="number"
                  inputMode="decimal"
                  step="any"
                  min={0}
                  value={qaProtein}
                  onChange={(e) => setQaProtein(e.target.value)}
                  placeholder="e.g. 31"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="qa-carbs">Carbs / 100 g</Label>
                <Input
                  id="qa-carbs"
                  type="number"
                  inputMode="decimal"
                  step="any"
                  min={0}
                  value={qaCarbs}
                  onChange={(e) => setQaCarbs(e.target.value)}
                  placeholder="e.g. 0"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="qa-fat">Fat / 100 g</Label>
                <Input
                  id="qa-fat"
                  type="number"
                  inputMode="decimal"
                  step="any"
                  min={0}
                  value={qaFat}
                  onChange={(e) => setQaFat(e.target.value)}
                  placeholder="e.g. 3.6"
                />
              </div>
            </div>
            <Button className="w-full" onClick={confirmQuick}>
              Add ingredient
            </Button>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
