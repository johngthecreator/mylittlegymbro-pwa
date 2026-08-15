import { useEffect, useState } from "react";
import type { FoodInput, FoodItem } from "@/core/types";
import { DEFAULT_SERVING_SIZE, DEFAULT_SERVING_UNIT } from "@/core/constants";
import { useLocation, useParams } from "wouter";
import { toast } from "sonner";
import { useFood, useSaveFood } from "@/controllers/useFoodController";
import { NutritionFields, type NutritionValues } from "@/components/NutritionFields";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertTitle } from "@/components/ui/alert";

const EMPTY_NUTRITION: NutritionValues = {
  calories: "",
  protein: "",
  carbs: "",
  fat: "",
  servingSize: "",
  servingUnit: DEFAULT_SERVING_UNIT,
};

function placeholderFrom(food: FoodItem | null | undefined): NutritionValues {
  return {
    calories: String(food?.calories ?? 0),
    protein: String(food?.protein ?? 0),
    carbs: String(food?.carbs ?? 0),
    fat: String(food?.fat ?? 0),
    servingSize: String(food?.servingSize ?? DEFAULT_SERVING_SIZE),
    servingUnit: food?.servingUnit ?? DEFAULT_SERVING_UNIT,
  };
}

/** Parse typed input; fall back to the placeholder value when untouched. */
function numOr(typed: string, fallback: number): number {
  const parsed = parseFloat(typed);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export default function FoodEditPage() {
  const { id } = useParams();
  const [location, navigate] = useLocation();
  const isNew = !id || id === "new";
  const numericId = isNew ? undefined : Number(id);

  const { food, loading } = useFood(numericId);
  const { saving, error, save } = useSaveFood();

  const [name, setName] = useState("");
  const [brand, setBrand] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [barcode, setBarcode] = useState<string | undefined>(undefined);
  const [nutrition, setNutrition] = useState<NutritionValues>(EMPTY_NUTRITION);
  const [placeholder, setPlaceholder] = useState<NutritionValues>(() =>
    placeholderFrom(null)
  );

  useEffect(() => {
    const ph = placeholderFrom(food);
    setPlaceholder(ph);
    setName(food?.name ?? "");
    setBrand(food?.brand ?? "");
    setImageUrl(food?.imageUrl ?? "");
    setBarcode(food?.barcode);
    setNutrition({ ...EMPTY_NUTRITION, servingUnit: ph.servingUnit });
  }, [food]);

  useEffect(() => {
    if (!isNew) return;
    const params = new URLSearchParams(location.split("?")[1] ?? "");
    if (params.get("draft") !== "1") return;
    const raw = sessionStorage.getItem("macrocalc.draftFood");
    if (!raw) return;
    try {
      const draft = JSON.parse(raw) as FoodInput;
      setName(draft.name ?? "");
      setBrand(draft.brand ?? "");
      setBarcode(draft.barcode);
      setNutrition({
        calories: draft.calories != null ? String(draft.calories) : "",
        protein: draft.protein != null ? String(draft.protein) : "",
        carbs: draft.carbs != null ? String(draft.carbs) : "",
        fat: draft.fat != null ? String(draft.fat) : "",
        servingSize: draft.servingSize != null ? String(draft.servingSize) : String(DEFAULT_SERVING_SIZE),
        servingUnit: draft.servingUnit ?? DEFAULT_SERVING_UNIT,
      });
    } catch {
      // ignore malformed draft
    } finally {
      sessionStorage.removeItem("macrocalc.draftFood");
    }
  }, [isNew, location]);

  const handleSave = async () => {
    if (!name.trim()) return;
    const input: FoodInput = {
      name: name.trim(),
      brand: brand.trim() || undefined,
      imageUrl: imageUrl.trim() || undefined,
      barcode: barcode ?? food?.barcode,
      calories: numOr(nutrition.calories, parseFloat(placeholder.calories)),
      protein: numOr(nutrition.protein, parseFloat(placeholder.protein)),
      carbs: numOr(nutrition.carbs, parseFloat(placeholder.carbs)),
      fat: numOr(nutrition.fat, parseFloat(placeholder.fat)),
      servingSize: numOr(
        nutrition.servingSize,
        parseFloat(placeholder.servingSize)
      ),
      servingUnit: nutrition.servingUnit || placeholder.servingUnit,
      isCustom: isNew,
    };
    try {
      const saved = await save(input, numericId);
      if (!saved) return;
      toast.success("Saved");
      navigate("/foods");
    } catch {
      toast.error("Could not save food");
    }
  };

  return (
    <div className="mx-auto w-full max-w-md px-4 py-6 space-y-4">
      <h1 className="text-2xl font-bold">{isNew ? "Add food" : "Edit food"}</h1>

      {loading ? (
        <Card>
          <CardContent className="space-y-3 py-4">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-full" />
          </CardContent>
        </Card>
      ) : !isNew && !food ? (
        <Alert variant="destructive">
          <AlertTitle>Food not found</AlertTitle>
        </Alert>
      ) : (
        <Card>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="food-name">Name</Label>
              <Input
                id="food-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Greek yogurt"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="food-brand">Brand</Label>
              <Input
                id="food-brand"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                placeholder="e.g. Fage"
              />
            </div>
            <NutritionFields
              value={nutrition}
              placeholder={placeholder}
              onChange={(patch) => setNutrition((n) => ({ ...n, ...patch }))}
            />
            <div className="flex items-center gap-2">
              <Button onClick={handleSave} disabled={saving || !name.trim()}>
                {saving ? "Saving…" : "Save"}
              </Button>
              {error && <p className="text-sm text-destructive">{error}</p>}
            </div>
          </CardContent>
        </Card>
      )}

      {isNew && (
        <p className="text-sm text-muted-foreground">
          This food will be stored locally as a custom food.
        </p>
      )}
    </div>
  );
}
