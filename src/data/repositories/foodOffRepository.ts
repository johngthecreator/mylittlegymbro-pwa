import ky from "ky";
import type { FoodItem } from "@/core/types";
import type { IOffFoodRepository } from "@/core/interfaces";
import { OFF_BASE_URL, OFF_USER_AGENT } from "@/core/constants";
import { FoodNotFoundError, OffApiError } from "@/core/errors";
import { mapOffProduct } from "./offMapper";

export class FoodOffRepository implements IOffFoodRepository {
  async fetchByBarcode(barcode: string): Promise<FoodItem> {
    const code = barcode.trim();
    let json: unknown;
    try {
      const res = await ky.get(
        `${OFF_BASE_URL}/product/${encodeURIComponent(code)}.json`,
        {
          headers: {
            "User-Agent": OFF_USER_AGENT,
            Accept: "application/json",
          },
          throwHttpErrors: false,
          retry: 0,
          timeout: 15000,
        },
      );
      if (res.status === 404) {
        throw new FoodNotFoundError(code);
      }
      if (!res.ok) {
        throw new OffApiError(code, new Error(`HTTP status ${res.status}`));
      }
      json = await res.json();
    } catch (err) {
      if (err instanceof FoodNotFoundError || err instanceof OffApiError) {
        throw err;
      }
      throw new OffApiError(code, err);
    }

    const status = (json as { status?: number } | null)?.status;
    if (status !== 1) {
      throw new FoodNotFoundError(code);
    }
    return mapOffProduct(json, code);
  }
}
