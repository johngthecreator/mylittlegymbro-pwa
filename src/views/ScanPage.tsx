import { useEffect, useRef, useState } from "react";
import type { ChangeEvent } from "react";
import { Camera, ImagePlus, LoaderCircle, PencilIcon, ScanLine, SearchX, Sparkles, X } from "lucide-react";
import { useLocation } from "wouter";
import { toast } from "sonner";
import { ScannerView } from "@/components/ScannerView";
import type { ScannerViewHandle } from "@/components/ScannerView";
import { AmountDialog } from "@/components/AmountDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatNumber } from "@/lib/nutrition";
import { useBarcodeLookup } from "@/controllers/useFoodController";
import { useAddLogEntry } from "@/controllers/useLogController";
import { useServices } from "@/di/AppServicesProvider";

type Phase = "idle" | "starting" | "scanning" | "processing" | "found" | "error";

export default function ScanPage() {
  const [, navigate] = useLocation();
  const { aiService } = useServices();
  const scannerRef = useRef<ScannerViewHandle>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { food: foundFood, error, notFound, lookup, reset } = useBarcodeLookup();
  const { adding, add } = useAddLogEntry();

  const [phase, setPhase] = useState<Phase>("idle");
  const [lastBarcode, setLastBarcode] = useState("");
  const [manualOpen, setManualOpen] = useState(false);
  const [manualBarcode, setManualBarcode] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    if (foundFood) {
      setPhase("found");
    } else if (error) {
      setPhase("error");
    }
  }, [foundFood, error]);

  const beginScan = async (): Promise<void> => {
    setPhase("starting");
    try {
      await scannerRef.current?.start();
      setPhase("scanning");
    } catch {
      setPhase("idle");
      toast.error("Could not start the camera. Use the manual entry or upload options.");
    }
  };

  const resumeScanning = async (): Promise<void> => {
    reset();
    setPhase("starting");
    try {
      await scannerRef.current?.start();
      setPhase("scanning");
    } catch {
      setPhase("idle");
    }
  };

  const stopScan = async (): Promise<void> => {
    await scannerRef.current?.stop();
    reset();
    setPhase("idle");
  };

  const handleDetected = async (barcode: string): Promise<void> => {
    setPhase("processing");
    setLastBarcode(barcode);
    reset();
    await lookup(barcode);
  };

  const handleManualSubmit = (): void => {
    const code = manualBarcode.trim();
    if (!code) return;
    setManualOpen(false);
    setManualBarcode("");
    void handleDetected(code);
  };

  const handleFile = async (e: ChangeEvent<HTMLInputElement>): Promise<void> => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    try {
      const barcode = await scannerRef.current?.scanFile(file);
      if (barcode) await handleDetected(barcode);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not read that image");
    }
  };

  const handleConfirm = async (amount: number, unit: string): Promise<void> => {
    if (!foundFood?.id) return;
    try {
      await add(foundFood.id, amount, unit);
    } catch {
      toast.error("Could not log this food");
      return;
    }
    toast.success(`${foundFood.name} logged`);
    setDialogOpen(false);
    await resumeScanning();
  };

  return (
    <div className="fixed inset-0 z-20 bg-black">
      <ScannerView ref={scannerRef} onDetected={(barcode) => void handleDetected(barcode)} />

          {phase === "scanning" && (
            <button
              type="button"
              onClick={() => void stopScan()}
              aria-label="Stop scanning"
              className="absolute top-16 right-6 z-10 flex size-10 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur"
            >
              <X />
            </button>
          )}

          {phase === "idle" && (
            <div className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-6 bg-black/60 p-6 text-white">
              <p className="text-lg font-semibold">Scan a food</p>
              <button
                type="button"
                onClick={() => void beginScan()}
                aria-label="Start scanning"
                className="flex size-24 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-2xl shadow-primary/40 transition hover:scale-105 active:scale-95"
              >
                <Camera className="size-10" />
              </button>
              <p className="text-sm text-white/70">Tap to start the camera</p>
              <div className="flex gap-3">
                <Button variant="secondary" onClick={() => setManualOpen(true)}>
                  <ScanLine />
                  Enter barcode
                </Button>
                <Button variant="secondary" onClick={() => fileInputRef.current?.click()}>
                  <ImagePlus />
                  Upload image
                </Button>
              </div>
              <Button variant="secondary" onClick={() => navigate("/ask")}>
                <Sparkles />
                AI search a food
              </Button>
            </div>
          )}

          {phase === "starting" && (
            <div className="absolute inset-0 z-30 flex items-center justify-center gap-3 bg-black/60 text-white">
              <LoaderCircle className="size-8 animate-spin" />
              <span className="font-medium">Starting camera…</span>
            </div>
          )}

          {phase === "processing" && (
            <div className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-4 bg-black/75 text-white">
              <LoaderCircle className="size-10 animate-spin" />
              <div className="text-center">
                <p className="font-semibold">Reading barcode</p>
                <p className="mt-1 font-mono text-sm text-white/60">{lastBarcode}</p>
                <p className="mt-2 text-sm text-white/60">Looking up the product…</p>
              </div>
            </div>
          )}

          {phase === "error" && (
            <div className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-4 bg-black/80 p-6 text-center text-white">
              <SearchX className="size-14 text-white/70" />
              <h2 className="text-xl font-semibold">No product found</h2>
              <p className="max-w-xs text-sm text-white/70">
                {error ?? "We couldn't find a product for that barcode."}
              </p>
              <div className="flex gap-3">
                <Button onClick={() => void resumeScanning()}>Try again</Button>
                <Button variant="secondary" onClick={() => setManualOpen(true)}>
                  Enter barcode
                </Button>
              </div>
              {notFound &&
                (aiService.hasApiKey() ? (
                  <Button
                    variant="secondary"
                    onClick={() => navigate(`/label?barcode=${encodeURIComponent(lastBarcode)}`)}
                  >
                    Photo the nutrition label
                  </Button>
                ) : (
                  <Button
                    variant="ghost"
                    className="text-white/60"
                    onClick={() => navigate("/settings")}
                  >
                    Add AI key to photo a label
                  </Button>
                ))}
            </div>
          )}

          {phase === "found" && foundFood && (
            <div className="absolute inset-0 z-30 flex flex-col justify-end bg-black/40">
              <div className="mx-auto w-full max-w-md rounded-t-3xl border-t bg-background p-6 pb-24">
                <div className="flex items-center gap-4">
                  {foundFood.imageUrl && (
                    <img
                      src={foundFood.imageUrl}
                      alt={foundFood.name}
                      className="size-16 rounded-xl object-cover"
                    />
                  )}
                  <div className="min-w-0 flex-1">
                    <h2 className="truncate text-lg font-semibold">{foundFood.name}</h2>
                    {foundFood.brand && (
                      <p className="truncate text-sm text-muted-foreground">{foundFood.brand}</p>
                    )}
                  </div>
                </div>
                <p className="mt-3 text-sm text-muted-foreground">
                  {formatNumber(foundFood.calories)} cal · P {formatNumber(foundFood.protein)} · C{" "}
                  {formatNumber(foundFood.carbs)} · F {formatNumber(foundFood.fat)} per{" "}
                  {formatNumber(foundFood.servingSize)} {foundFood.servingUnit}
                </p>
                <div className="mt-4 grid grid-cols-2 gap-2">
                  <Button onClick={() => setDialogOpen(true)} disabled={adding}>
                    Log amount
                  </Button>
                  {foundFood.id != null && (
                    <Button variant="outline" onClick={() => navigate(`/foods/${foundFood.id}`)}>
                      <PencilIcon />
                      Edit
                    </Button>
                  )}
                </div>
                <Button
                  variant="ghost"
                  className="mt-2 w-full text-muted-foreground"
                  onClick={() => void resumeScanning()}
                >
                  Scan another
                </Button>
              </div>
            </div>
          )}

          {manualOpen && (
            <div
              className="absolute inset-0 z-40 flex items-end bg-black/50"
              onClick={() => setManualOpen(false)}
            >
              <div
                className="mx-auto w-full max-w-md rounded-t-3xl border-t bg-background p-6 pb-24"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-lg font-semibold">Enter barcode</h2>
                  <Button variant="ghost" size="icon" onClick={() => setManualOpen(false)}>
                    <X />
                  </Button>
                </div>
                <form
                  className="flex gap-2"
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleManualSubmit();
                  }}
                >
                  <Input
                    value={manualBarcode}
                    onChange={(e) => setManualBarcode(e.target.value)}
                    placeholder="e.g. 3017620422003"
                    autoFocus
                    aria-label="Barcode"
                  />
                  <Button type="submit">
                    <ScanLine />
                    Look up
                  </Button>
                </form>
              </div>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => void handleFile(e)}
          />

          <AmountDialog
            open={dialogOpen}
            onOpenChange={setDialogOpen}
            food={foundFood}
            onConfirm={(amount, unit) => void handleConfirm(amount, unit)}
            submitting={adding}
          />
        </div>
  );
}
