import { useRef, useState } from "react";
import type { ChangeEvent } from "react";
import { useLocation } from "wouter";
import { ArrowLeft, Camera, ImagePlus, LoaderCircle } from "lucide-react";
import { toast } from "sonner";
import { useServices } from "@/di/AppServicesProvider";
import { useAiKey } from "@/controllers/useAiController";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function LabelCapturePage() {
  const [location, navigate] = useLocation();
  const { aiService } = useServices();
  const { ready, hasKey } = useAiKey();
  const [loading, setLoading] = useState(false);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const barcode =
    new URLSearchParams(location.split("?")[1] ?? "").get("barcode") ?? "";

  const handleFile = async (e: ChangeEvent<HTMLInputElement>): Promise<void> => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== "string") return;
      void submitImage(reader.result, file.type || "image/jpeg");
    };
    reader.readAsDataURL(file);
  };

  const submitImage = async (dataUrl: string, mimeType: string): Promise<void> => {
    const comma = dataUrl.indexOf(",");
    if (comma === -1) return;
    const data = dataUrl.slice(comma + 1);
    setLoading(true);
    try {
      const parsed = await aiService.parseNutritionLabel({ data, mimeType }, barcode);
      sessionStorage.setItem(
        "macrocalc.draftFood",
        JSON.stringify({ ...parsed, barcode })
      );
      navigate("/foods/new?draft=1");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not read that label");
    } finally {
      setLoading(false);
    }
  };

  if (!ready) return null;

  if (!hasKey) {
    return (
      <div className="mx-auto w-full max-w-md px-4 py-6 space-y-4">
        <h1 className="text-2xl font-bold">Photo the nutrition label</h1>
        <Card>
          <CardHeader>
            <CardTitle>AI key required</CardTitle>
            <CardDescription>
              Add a Gemini API key in Settings to photo a nutrition label.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" onClick={() => navigate("/settings")}>
              Go to Settings
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-md px-4 py-6 space-y-4">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={() => navigate("/scan")} aria-label="Back">
          <ArrowLeft />
        </Button>
        <h1 className="text-2xl font-bold">Photo the nutrition label</h1>
      </div>

      {barcode && (
        <p className="font-mono text-sm text-muted-foreground">Barcode: {barcode}</p>
      )}

      {loading ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-8">
            <LoaderCircle className="size-8 animate-spin" />
            <p className="text-sm text-muted-foreground">Reading label…</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="flex flex-col gap-2">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => cameraInputRef.current?.click()}
              disabled={loading}
            >
              <Camera />
              Take photo
            </Button>
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={(e) => void handleFile(e)}
            />
            <Button
              variant="outline"
              className="w-full"
              onClick={() => galleryInputRef.current?.click()}
              disabled={loading}
            >
              <ImagePlus />
              Choose image
            </Button>
            <input
              ref={galleryInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => void handleFile(e)}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
