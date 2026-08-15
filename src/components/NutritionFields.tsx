import type { ReactElement } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UNIT_OPTIONS } from "@/core/constants";

export interface NutritionValues {
  calories: string;
  protein: string;
  carbs: string;
  fat: string;
  servingSize: string;
  servingUnit: string;
}

function NumericField({
  label,
  value,
  placeholder,
  onValueChange,
}: {
  label: string;
  value: string;
  placeholder?: string;
  onValueChange: (value: string) => void;
}) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <Input
        type="number"
        inputMode="decimal"
        step="any"
        min={0}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onValueChange(e.target.value)}
      />
    </div>
  );
}

export function NutritionFields(props: {
  value: NutritionValues;
  placeholder?: NutritionValues;
  onChange: (patch: Partial<NutritionValues>) => void;
}): ReactElement {
  const { value, placeholder, onChange } = props;
  const unitOptions = Array.from(
    new Set<string>([...UNIT_OPTIONS, value.servingUnit])
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Nutrition</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-3">
        <NumericField
          label="Calories"
          value={value.calories}
          placeholder={placeholder?.calories}
          onValueChange={(v) => onChange({ calories: v })}
        />
        <NumericField
          label="Protein (g)"
          value={value.protein}
          placeholder={placeholder?.protein}
          onValueChange={(v) => onChange({ protein: v })}
        />
        <NumericField
          label="Carbs (g)"
          value={value.carbs}
          placeholder={placeholder?.carbs}
          onValueChange={(v) => onChange({ carbs: v })}
        />
        <NumericField
          label="Fat (g)"
          value={value.fat}
          placeholder={placeholder?.fat}
          onValueChange={(v) => onChange({ fat: v })}
        />
        <NumericField
          label="Serving size"
          value={value.servingSize}
          placeholder={placeholder?.servingSize}
          onValueChange={(v) => onChange({ servingSize: v })}
        />
        <div className="space-y-1.5">
          <Label>Serving unit</Label>
          <Select
            value={value.servingUnit}
            onValueChange={(u) => onChange({ servingUnit: u })}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {unitOptions.map((unit) => (
                <SelectItem key={unit} value={unit}>
                  {unit}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}
