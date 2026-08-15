import { useState } from "react";
import type { FoodItem } from "@/core/types";
import { formatNumber } from "@/lib/nutrition";
import { useLocation } from "wouter";
import { toast } from "sonner";
import { LogInIcon, PencilIcon, PlusIcon, SearchIcon, TrashIcon } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { AmountDialog } from "@/components/AmountDialog";
import { useFoods } from "@/controllers/useFoodController";
import { useAddLogEntry } from "@/controllers/useLogController";

export default function FoodsPage() {
  const [, navigate] = useLocation();
  const { foods, loading, removeFood } = useFoods();
  const { adding, add } = useAddLogEntry();
  const [query, setQuery] = useState("");
  const [logFood, setLogFood] = useState<FoodItem | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const filtered = foods.filter((food) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return (
      food.name.toLowerCase().includes(q) ||
      (food.brand ?? "").toLowerCase().includes(q) ||
      (food.barcode ?? "").toLowerCase().includes(q)
    );
  });

  const handleDelete = async (food: FoodItem) => {
    if (food.id == null) return;
    if (!window.confirm(`Delete "${food.name}"?`)) return;
    await removeFood(food.id);
    toast.success(`${food.name} removed`);
  };

  const handleLog = async (amount: number, unit: string) => {
    if (!logFood?.id) return;
    try {
      await add(logFood.id, amount, unit);
      toast.success(`${logFood.name} logged`);
    } catch {
      toast.error("Could not log this food");
    }
    setDialogOpen(false);
    setLogFood(null);
  };

  return (
    <div className="mx-auto w-full max-w-md px-4 py-6 space-y-4">
      <div className="flex items-center justify-between gap-2">
        <h1 className="text-2xl font-bold">My foods</h1>
        <Button onClick={() => navigate("/foods/new")}>
          <PlusIcon />
          Add food
        </Button>
      </div>

      <div className="sticky top-[env(safe-area-inset-top)] z-10 -mx-4 bg-background px-4 pt-2 pb-3 shadow-sm">
        <div className="relative">
          <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search foods"
            className="pl-8"
          />
        </div>
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
      ) : filtered.length === 0 ? (
        <Card>
          <CardHeader className="text-center">
            <CardTitle>{foods.length === 0 ? "No foods yet" : "No matches"}</CardTitle>
            <CardDescription>
              {foods.length === 0
                ? "Add your first food to get started."
                : "Try a different search term."}
            </CardDescription>
          </CardHeader>
          {foods.length === 0 && (
            <CardContent className="flex justify-center">
              <Button onClick={() => navigate("/foods/new")}>Add your first food</Button>
            </CardContent>
          )}
        </Card>
      ) : (
        filtered.map((food) => (
          <Card key={food.id}>
            <CardContent className="space-y-2 py-4">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <CardTitle className="truncate">{food.name}</CardTitle>
                  {food.brand && (
                    <CardDescription className="truncate">{food.brand}</CardDescription>
                  )}
                </div>
                <Badge variant="secondary" className="shrink-0">
                  {food.isCustom ? "custom" : (food.barcode ?? "").slice(0, 16)}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {formatNumber(food.calories)} cal · P {formatNumber(food.protein)} · C{" "}
                {formatNumber(food.carbs)} · F {formatNumber(food.fat)} per{" "}
                {formatNumber(food.servingSize)} {food.servingUnit}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setLogFood(food);
                    setDialogOpen(true);
                  }}
                >
                  <LogInIcon />
                  Log
                </Button>
                {food.id != null && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/foods/${food.id}`)}
                  >
                    <PencilIcon />
                    Edit
                  </Button>
                )}
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => void handleDelete(food)}
                >
                  <TrashIcon />
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))
      )}

      <AmountDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) setLogFood(null);
        }}
        food={logFood}
        onConfirm={handleLog}
        submitting={adding}
      />
    </div>
  );
}
