import { useEffect } from "react";
import { Redirect, Route, Switch, useLocation } from "wouter";
import { ChefHat, NotebookPen, ScanLine, Settings, UtensilsCrossed } from "lucide-react";
import { AppServicesProvider, useServices } from "@/di/AppServicesProvider";
import { Toaster } from "@/components/ui/sonner";
import { cn } from "@/lib/utils";
import TodayPage from "@/views/TodayPage";
import ScanPage from "@/views/ScanPage";
import FoodsPage from "@/views/FoodsPage";
import FoodEditPage from "@/views/FoodEditPage";
import SettingsPage from "@/views/SettingsPage";
import CookPage from "@/views/CookPage";
import CookRecipePage from "@/views/CookRecipePage";
import LabelCapturePage from "@/views/LabelCapturePage";
import AskPage from "@/views/AskPage";

const NAV_ITEMS = [
  { path: "/", label: "Today", icon: NotebookPen },
  { path: "/scan", label: "Scan", icon: ScanLine },
  { path: "/foods", label: "Foods", icon: UtensilsCrossed },
  { path: "/cook", label: "Cook", icon: ChefHat },
  { path: "/settings", label: "Settings", icon: Settings },
];

function BottomNav() {
  const [location, navigate] = useLocation();

  const isActive = (path: string) =>
    path === "/" ? location === "/" : location.startsWith(path);

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t bg-background/95 backdrop-blur pb-[env(safe-area-inset-bottom)]">
      <div className="mx-auto flex max-w-md items-stretch">
        {NAV_ITEMS.map(({ path, label, icon: Icon }) => (
          <button
            key={path}
            type="button"
            onClick={() => navigate(path)}
            className={cn(
              "flex flex-1 flex-col items-center gap-1 py-2 text-xs font-medium",
              isActive(path) ? "text-primary" : "text-muted-foreground",
            )}
          >
            <Icon className="size-5" />
            {label}
          </button>
        ))}
      </div>
    </nav>
  );
}

function AppContent() {
  const { logService } = useServices();
  const [location] = useLocation();
  const isScanRoute = location.startsWith("/scan");

  useEffect(() => {
    void logService.purgeOldEntries();
  }, [logService]);

  return (
    <div className={isScanRoute ? "" : "pb-[calc(env(safe-area-inset-bottom)+5rem)]"}>
      <Switch>
        <Route path="/" component={TodayPage} />
        <Route path="/scan" component={ScanPage} />
        <Route path="/ask" component={AskPage} />
        <Route path="/foods" component={FoodsPage} />
        <Route path="/foods/new" component={FoodEditPage} />
        <Route path="/foods/:id" component={FoodEditPage} />
        <Route path="/cook" component={CookPage} />
        <Route path="/cook/new" component={CookRecipePage} />
        <Route path="/cook/:id" component={CookRecipePage} />
        <Route path="/label" component={LabelCapturePage} />
        <Route path="/settings" component={SettingsPage} />
        <Route>
          <Redirect to="/" />
        </Route>
      </Switch>
      <BottomNav />
    </div>
  );
}

export default function App() {
  return (
    <AppServicesProvider>
      <Toaster />
      <AppContent />
    </AppServicesProvider>
  );
}
