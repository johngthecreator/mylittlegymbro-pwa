import { useLocation } from "wouter";
import { LogEntryCard } from "@/components/LogEntryCard";
import { DailyTotalsCard } from "@/components/DailyTotalsCard";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useTodayLog,
  useDailyTotals,
  useRemoveLogEntry,
} from "@/controllers/useLogController";

export default function TodayPage() {
  const [, navigate] = useLocation();
  const { entries, loading, refresh } = useTodayLog();
  const totals = useDailyTotals(entries);
  const { removingId, remove } = useRemoveLogEntry();

  const handleRemove = async (id: number) => {
    await remove(id);
    await refresh();
  };

  return (
    <div className="mx-auto w-full max-w-md px-4 py-6 space-y-4">
      <div className="flex items-start justify-between gap-2">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold">Today</h1>
          <p className="text-sm text-muted-foreground">
            {new Date().toLocaleDateString(undefined, {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
        <Button variant="outline" onClick={() => navigate("/foods/new")}>
          Quick add
        </Button>
      </div>

      <DailyTotalsCard totals={totals} />

      {loading ? (
        <Card>
          <CardContent className="space-y-3 py-4">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-2/3" />
          </CardContent>
        </Card>
      ) : entries.length === 0 ? (
        <Card>
          <CardHeader className="text-center">
            <CardTitle>No meals logged yet</CardTitle>
            <CardDescription>
              Scan a packaged food or add your own custom food to get started.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center gap-2">
            <Button onClick={() => navigate("/scan")}>Scan a food</Button>
            <Button variant="outline" onClick={() => navigate("/foods")}>
              Add from library
            </Button>
          </CardContent>
        </Card>
      ) : (
        entries.map((entry) => (
          <LogEntryCard
            key={entry.id}
            entry={entry}
            onRemove={handleRemove}
            removing={removingId === entry.id}
          />
        ))
      )}
    </div>
  );
}
