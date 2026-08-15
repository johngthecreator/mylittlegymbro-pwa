export class FoodNotFoundError extends Error {
  readonly barcode: string;

  constructor(barcode: string) {
    super(`No product found for barcode ${barcode}.`);
    this.name = "FoodNotFoundError";
    this.barcode = barcode;
  }
}

export class OffApiError extends Error {
  readonly barcode: string;

  constructor(barcode: string, cause: unknown) {
    super(`Could not reach OpenFoodFacts for barcode ${barcode}.`);
    this.name = "OffApiError";
    this.barcode = barcode;
    this.cause = cause;
  }
}

export class ScannerError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ScannerError";
  }
}
