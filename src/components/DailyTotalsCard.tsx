import type { ReactElement } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { DEFAULT_TARGETS } from "@/core/constants";
import type { DailyTotals } from "@/core/types";
import { formatNumber } from "@/lib/nutrition";

/** Soft, neutral take on how the day is going (no deficit framing). */
function intakeLine(calories: number): string {
  const target = DEFAULT_TARGETS.calories;
  if (calories <= 0.6 * target) return "A light day so far.";
  if (calories <= target) return "A balanced day.";
  if (calories <= 1.3 * target) return "A filling day.";
  return "That's a lot today.";
}

function MacroRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{formatNumber(value)} g</span>
    </div>
  );
}

export function DailyTotalsCard(props: { totals: DailyTotals }): ReactElement {
  const { totals } = props;

  return (
    <Card>
      <CardContent className="space-y-4">
        <div className="space-y-1">
          <span className="text-sm text-muted-foreground">Calories consumed</span>
          <div className="text-3xl font-semibold">
            {formatNumber(totals.calories)}
          </div>
          <p className="text-xs text-muted-foreground">
            {intakeLine(totals.calories)}
          </p>
        </div>
        <div className="space-y-2 border-t pt-3">
          <MacroRow label="Protein" value={totals.protein} />
          <MacroRow label="Carbs" value={totals.carbs} />
          <MacroRow label="Fat" value={totals.fat} />
        </div>
      </CardContent>
    </Card>
  );
}
