import { useRef, useState } from "react";
import {
  DownloadIcon,
  Eye,
  EyeOff,
  SettingsIcon,
  UploadIcon,
} from "lucide-react";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useServices } from "@/di/AppServicesProvider";
import {
  clearGeminiApiKey,
  getGeminiApiKey,
  setGeminiApiKey,
} from "@/lib/settings";

export default function SettingsPage() {
  const { foodService, recipeService } = useServices();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);
  const [keyInput, setKeyInput] = useState(() => getGeminiApiKey() ?? "");
  const [showKey, setShowKey] = useState(false);

  const handleExport = async () => {
    setExporting(true);
    try {
      const foods = JSON.parse(await foodService.exportFoods());
      const recipes = JSON.parse(await recipeService.exportRecipes());
      const backup = JSON.stringify({ version: 2, foods, recipes }, null, 2);
      const blob = new Blob([backup], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "macrocalc-backup.json";
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      toast.success("Backup exported");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not export backup");
    } finally {
      setExporting(false);
    }
  };

  const handleImport = async (file: File) => {
    setImporting(true);
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      if (Array.isArray(data)) {
        const count = await foodService.importFoods(text);
        toast.success(`Imported ${count} foods`);
      } else if (
        data &&
        typeof data === "object" &&
        Array.isArray(data.foods)
      ) {
        const foodCount = await foodService.importFoods(
          JSON.stringify(data.foods)
        );
        const recipeCount = data.recipes
          ? await recipeService.importRecipes(JSON.stringify(data.recipes))
          : 0;
        toast.success(`Imported ${foodCount} foods and ${recipeCount} recipes`);
      } else {
        throw new Error("Unrecognized backup file");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not import backup");
    } finally {
      setImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSaveKey = () => {
    setGeminiApiKey(keyInput.trim());
    setKeyInput(getGeminiApiKey() ?? "");
    toast.success("API key saved");
  };

  const handleClearKey = () => {
    clearGeminiApiKey();
    setKeyInput("");
    toast.success("API key removed");
  };

  return (
    <div className="mx-auto w-full max-w-md px-4 py-6 space-y-4">
      <div className="flex items-center gap-2">
        <SettingsIcon className="size-5" />
        <h1 className="text-2xl font-bold">Settings</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Gemini AI</CardTitle>
          <CardDescription>
            Your key is stored only in this browser's localStorage. For safety,
            restrict it to your app's domain in Google AI Studio.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="gemini-api-key">API key</Label>
            <div className="relative">
              <Input
                id="gemini-api-key"
                type={showKey ? "text" : "password"}
                value={keyInput}
                onChange={(e) => setKeyInput(e.target.value)}
                placeholder="Paste your Gemini API key"
                autoComplete="off"
                spellCheck={false}
                className="pr-9"
              />
              <button
                type="button"
                onClick={() => setShowKey((v) => !v)}
                className="absolute inset-y-0 right-0 flex items-center pr-2.5 text-muted-foreground hover:text-foreground"
                aria-label={showKey ? "Hide API key" : "Show API key"}
              >
                {showKey ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          </div>
          {getGeminiApiKey() && (
            <p className="text-sm text-muted-foreground">Key configured.</p>
          )}
          <div className="flex gap-2">
            <Button
              variant="default"
              onClick={handleSaveKey}
              disabled={!keyInput.trim()}
            >
              Save
            </Button>
            <Button variant="outline" onClick={handleClearKey}>
              Clear
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Food library</CardTitle>
          <CardDescription>
            Export/import your foods and recipes as a JSON backup.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          <Button variant="outline" onClick={() => void handleExport()} disabled={exporting}>
            <DownloadIcon />
            {exporting ? "Exporting…" : "Export to JSON"}
          </Button>
          <Button
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={importing}
          >
            <UploadIcon />
            {importing ? "Importing…" : "Import from JSON"}
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void handleImport(file);
            }}
          />
        </CardContent>
      </Card>

      <p className="text-center text-xs text-muted-foreground">
        <a href="/tech" className="underline-offset-2 hover:underline">
          Tech stack
        </a>
        {" · "}
        <a href="/legal#terms" className="underline-offset-2 hover:underline">
          Terms
        </a>
        {" · "}
        <a href="/legal#privacy" className="underline-offset-2 hover:underline">
          Privacy
        </a>
      </p>
    </div>
  );
}
