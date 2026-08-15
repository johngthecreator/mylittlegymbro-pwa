import type { ReactElement } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { LogEntryWithFood } from "@/core/types";
import { formatNumber, scaledMacros } from "@/lib/nutrition";

function MacroStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex flex-col items-center">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="font-medium">{formatNumber(value)}</span>
    </div>
  );
}

export function LogEntryCard(props: {
  entry: LogEntryWithFood;
  onRemove?: (id: number) => void;
  removing?: boolean;
}): ReactElement {
  const { entry, onRemove, removing } = props;
  const entryId = entry.id;
  const removeButton =
    onRemove && entryId != null ? (
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-2 right-2"
        disabled={removing}
        onClick={() => onRemove(entryId)}
        aria-label="Remove entry"
      >
        <Trash2 />
      </Button>
    ) : null;

  if (!entry.food) {
    return (
      <Card className="relative">
        <CardHeader>
          <CardTitle>Unknown food</CardTitle>
        </CardHeader>
        {removeButton}
      </Card>
    );
  }

  const macros = scaledMacros(entry.food, entry.amount);

  return (
    <Card className="relative">
      <CardHeader>
        <div className="flex items-start justify-between gap-2 pr-6">
          <div className="min-w-0">
            <CardTitle className="truncate">{entry.food.name}</CardTitle>
            {entry.food.brand && (
              <span className="text-xs text-muted-foreground">
                {entry.food.brand}
              </span>
            )}
          </div>
          {removeButton}
        </div>
      </CardHeader>
      <CardContent className="flex items-center justify-between gap-3">
        <span className="text-muted-foreground">
          {formatNumber(entry.amount)} {entry.unit}
        </span>
        <div className="flex gap-4">
          <MacroStat label="Cal" value={macros.calories} />
          <MacroStat label="P" value={macros.protein} />
          <MacroStat label="C" value={macros.carbs} />
          <MacroStat label="F" value={macros.fat} />
        </div>
      </CardContent>
    </Card>
  );
}
