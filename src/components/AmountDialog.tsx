import type { ReactElement } from "react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DEFAULT_SERVING_SIZE,
  DEFAULT_SERVING_UNIT,
  UNIT_OPTIONS,
} from "@/core/constants";
import type { FoodItem } from "@/core/types";
import { formatNumber, scaledMacros } from "@/lib/nutrition";

function PreviewStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg bg-muted p-2 text-center">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="font-medium">{formatNumber(value)}</div>
    </div>
  );
}

export function AmountDialog(props: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  food: FoodItem | null;
  onConfirm: (amount: number, unit: string) => void;
  submitting?: boolean;
}): ReactElement | null {
  const { open, onOpenChange, food, onConfirm, submitting } = props;
  const [amount, setAmount] = useState("");
  const [unit, setUnit] = useState(DEFAULT_SERVING_UNIT);

  useEffect(() => {
    if (open && food) {
      setAmount(String(food.servingSize || DEFAULT_SERVING_SIZE));
      setUnit(food.servingUnit || DEFAULT_SERVING_UNIT);
    }
  }, [open, food]);

  if (!food) return null;

  const parsedAmount = Number.isFinite(parseFloat(amount))
    ? parseFloat(amount)
    : 0;
  const macros = scaledMacros(food, parsedAmount);
  const unitOptions = Array.from(new Set<string>([...UNIT_OPTIONS, unit]));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{food.name}</DialogTitle>
          <DialogDescription>
            <div className="flex items-center gap-3">
              {food.imageUrl && (
                <img
                  src={food.imageUrl}
                  alt={food.name}
                  className="h-16 w-16 rounded object-cover"
                />
              )}
              <span>
                per serving: {formatNumber(food.calories)} cal
              </span>
            </div>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-1.5">
          <Label htmlFor="amount">Amount</Label>
          <div className="flex gap-2">
            <Input
              id="amount"
              type="number"
              inputMode="decimal"
              step="any"
              min={0}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="flex-1"
            />
            <Select value={unit} onValueChange={setUnit}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {unitOptions.map((u) => (
                  <SelectItem key={u} value={u}>
                    {u}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-2">
          <PreviewStat label="Cal" value={macros.calories} />
          <PreviewStat label="P" value={macros.protein} />
          <PreviewStat label="C" value={macros.carbs} />
          <PreviewStat label="F" value={macros.fat} />
        </div>

        <Button
          className="w-full"
          disabled={parsedAmount <= 0 || submitting}
          onClick={() => onConfirm(parsedAmount, unit)}
        >
          {submitting ? "Logging…" : "Log it"}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
