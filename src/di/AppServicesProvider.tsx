import { createContext, useContext, useMemo } from "react";
import type { ReactNode } from "react";
import type {
  IAiService,
  IFoodService,
  ILogService,
  IRecipeService,
  IScannerService,
} from "@/core/interfaces";
import { FoodOffRepository } from "@/data/repositories/foodOffRepository";
import { FoodDbRepository } from "@/data/repositories/foodDbRepository";
import { LogDbRepository } from "@/data/repositories/logDbRepository";
import { RecipeDbRepository } from "@/data/repositories/recipeDbRepository";
import { FoodService } from "@/services/foodService";
import { LogService } from "@/services/logService";
import { RecipeService } from "@/services/recipeService";
import { ScannerService } from "@/services/scannerService";
import { AiService } from "@/services/aiService";

export interface AppServices {
  foodService: IFoodService;
  logService: ILogService;
  scannerService: IScannerService;
  recipeService: IRecipeService;
  aiService: IAiService;
}

const AppServicesContext = createContext<AppServices | null>(null);

export function AppServicesProvider({ children }: { children: ReactNode }) {
  const services = useMemo<AppServices>(() => {
    const offRepo = new FoodOffRepository();
    const foodRepo = new FoodDbRepository();
    const logRepo = new LogDbRepository();
    const recipeRepo = new RecipeDbRepository();
    return {
      foodService: new FoodService(offRepo, foodRepo),
      logService: new LogService(logRepo, foodRepo),
      scannerService: new ScannerService(),
      recipeService: new RecipeService(recipeRepo, foodRepo),
      aiService: new AiService(),
    };
  }, []);

  return (
    <AppServicesContext.Provider value={services}>
      {children}
    </AppServicesContext.Provider>
  );
}

export function useServices(): AppServices {
  const ctx = useContext(AppServicesContext);
  if (!ctx) {
    throw new Error("useServices must be used within AppServicesProvider");
  }
  return ctx;
}
