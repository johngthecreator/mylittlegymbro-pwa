import { useEffect, useRef, useState } from "react";
import type { FormEvent, ReactElement } from "react";
import { useLocation } from "wouter";
import { LoaderCircle, LogInIcon, PlusIcon, RotateCcw, Send, Sparkles } from "lucide-react";
import { toast } from "sonner";
import type { FoodInput, FoodItem, FoodSearchResult } from "@/core/types";
import { useServices } from "@/di/AppServicesProvider";
import { useAddLogEntry } from "@/controllers/useLogController";
import { AmountDialog } from "@/components/AmountDialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Message,
  MessageAvatar,
  MessageContent,
  MessageHeader,
} from "@/components/ui/message";
import { MessageBar, PromptInput } from "@/components/ui/prompt-input";
import { formatNumber } from "@/lib/nutrition";

type ResultType = "item" | "order";

interface ChatMessage {
  id: number;
  role: "user" | "assistant";
  text: string;
  result?: FoodSearchResult;
  food?: FoodItem;
}

const INITIAL_MESSAGE: ChatMessage = {
  id: 0,
  role: "assistant",
  text: "Ask about any food or restaurant order and I'll look up its nutrition online.",
};

const SUGGESTIONS = [
  "Big Mac",
  "Chipotle chicken burrito bowl",
  "In-N-Out Double-Double",
  "Chick-fil-A nuggets",
  "Starbucks cold brew",
];

function ResultCard(props: {
  message: ChatMessage;
  type: ResultType;
  onTypeChange: (type: ResultType) => void;
  onAddCustom: () => void;
  onLog: () => void;
}): ReactElement {
  const { message, type, onTypeChange, onAddCustom, onLog } = props;
  if (!message.result) return <></>;
  const { result } = message;
  const isOrder = type === "order";
  const servingGrams =
    result.servingSizeGrams && result.servingSizeGrams > 0
      ? result.servingSizeGrams
      : 100;
  const per100g = isOrder ? null : (result.calories / servingGrams) * 100;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {result.name}
          <Badge variant="secondary">{isOrder ? "Order" : "Per Gram"}</Badge>
        </CardTitle>
        {result.brand && <CardDescription>{result.brand}</CardDescription>}
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm font-medium">
          {formatNumber(result.calories)} cal · P {formatNumber(result.protein)} · C{" "}
          {formatNumber(result.carbs)} · F {formatNumber(result.fat)}
        </p>
        <p className="text-xs text-muted-foreground">
          {isOrder ? "whole order" : `per ${formatNumber(servingGrams)}g serving`}
          {per100g != null && ` · ≈ ${formatNumber(per100g)} cal / 100 g`}
        </p>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant={isOrder ? "default" : "outline"}
            onClick={() => onTypeChange("order")}
          >
            Order
          </Button>
          <Button
            size="sm"
            variant={isOrder ? "outline" : "default"}
            onClick={() => onTypeChange("item")}
          >
            Per Gram
          </Button>
        </div>
        <div className="flex gap-2">
          <Button size="sm" onClick={onAddCustom}>
            <PlusIcon />
            Add custom food
          </Button>
          <Button size="sm" variant="outline" onClick={onLog}>
            <LogInIcon />
            Log
          </Button>
        </div>
        {result.sources && result.sources.length > 0 && (
          <div className="space-y-1 border-t pt-2">
            <p className="text-xs text-muted-foreground">Sources</p>
            {result.sources.slice(0, 3).map((source, i) => (
              <a
                key={`${source.uri}-${i}`}
                href={source.uri}
                target="_blank"
                rel="noopener noreferrer"
                className="block truncate text-xs text-primary underline-offset-2 hover:underline"
              >
                {source.title || source.uri}
              </a>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function AskFoodChat(): ReactElement {
  const { aiService, foodService } = useServices();
  const [, navigate] = useLocation();
  const { adding, add } = useAddLogEntry();

  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_MESSAGE]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [resultTypes, setResultTypes] = useState<Record<number, ResultType>>({});
  const [dialogOpen, setDialogOpen] = useState(false);
  const [logFood, setLogFood] = useState<FoodItem | null>(null);
  const nextId = useRef(1);
  const listEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    listEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, loading]);

  const typeFor = (id: number): ResultType => resultTypes[id] ?? "order";
  const showSuggestions = messages.length === 1 && !loading;

  const newChat = (): void => {
    setMessages([INITIAL_MESSAGE]);
    setResultTypes({});
    setInput("");
  };

  const buildFoodInput = (result: FoodSearchResult, type: ResultType): FoodInput => {
    const isOrder = type === "order";
    return {
      name: result.name,
      brand: result.brand,
      servingSize: isOrder ? 1 : (result.servingSizeGrams ?? 100),
      servingUnit: isOrder ? (result.servingUnit ?? "order") : "g",
      calories: result.calories,
      protein: result.protein,
      carbs: result.carbs,
      fat: result.fat,
      isCustom: true,
    };
  };

  const attachFood = async (msg: ChatMessage): Promise<FoodItem | null> => {
    if (msg.food) return msg.food;
    if (!msg.result) return null;
    const food = await foodService.createCustomFood(
      buildFoodInput(msg.result, typeFor(msg.id))
    );
    setMessages((m) => m.map((x) => (x.id === msg.id ? { ...x, food } : x)));
    return food;
  };

  const handleAddCustom = async (msg: ChatMessage): Promise<void> => {
    try {
      const food = await attachFood(msg);
      if (!food) return;
      toast.success("Added to library");
    } catch {
      toast.error("Could not add food");
    }
  };

  const handleLog = async (msg: ChatMessage): Promise<void> => {
    try {
      const food = await attachFood(msg);
      if (!food) return;
      setLogFood(food);
      setDialogOpen(true);
    } catch {
      toast.error("Could not prepare food");
    }
  };

  const handleConfirm = async (amount: number, unit: string): Promise<void> => {
    if (!logFood?.id) return;
    try {
      await add(logFood.id, amount, unit);
    } catch {
      toast.error("Could not log this food");
      return;
    }
    toast.success(`${logFood.name} logged`);
    setDialogOpen(false);
    setLogFood(null);
  };

  const handleSubmit = (e: FormEvent): void => {
    e.preventDefault();
    void send(input);
  };

  const send = async (query: string): Promise<void> => {
    const q = query.trim();
    if (!q || loading) return;
    setInput("");
    const userId = nextId.current++;
    setMessages((m) => [...m, { id: userId, role: "user", text: q }]);
    setLoading(true);
    const replyId = nextId.current++;
    try {
      const result = await aiService.searchFood(q);
      setMessages((m) => [
        ...m,
        { id: replyId, role: "assistant", text: "Here's what I found:", result },
      ]);
    } catch (err) {
      setMessages((m) => [
        ...m,
        {
          id: replyId,
          role: "assistant",
          text:
            err instanceof Error
              ? err.message
              : "Could not look that up — try again or reword it.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (!aiService.hasApiKey()) {
    return (
      <Card className="mt-4">
        <CardHeader>
          <CardTitle>AI search disabled</CardTitle>
          <CardDescription>
            Add your own Gemini API key in Settings to use AI search. Each user
            brings their own key — it stays in your browser.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button className="w-full" onClick={() => navigate("/settings")}>
            Add a Gemini API key in Settings to use AI search
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="relative flex h-full flex-col">
      <div className="flex items-center justify-between gap-2 pt-4">
        <div>
          <h2 className="text-lg font-semibold">Ask about a food</h2>
          <p className="text-xs text-muted-foreground">
            I'll look up its nutrition online.
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={newChat}
          disabled={messages.length === 1}
        >
          <RotateCcw />
          New chat
        </Button>
      </div>

      {showSuggestions && (
        <div className="flex flex-wrap gap-2 pt-4">
          {SUGGESTIONS.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => void send(suggestion)}
              className="rounded-full border bg-muted px-3 py-1.5 text-sm text-muted-foreground transition active:bg-accent"
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}

      <div className="flex-1 space-y-3 overflow-y-auto py-4">
        {messages.map((msg) =>
          msg.role === "user" ? (
            <Message key={msg.id} className="items-end">
              <MessageContent className="bg-primary text-primary-foreground">
                {msg.text}
              </MessageContent>
            </Message>
          ) : (
            <Message key={msg.id} className="items-start">
              <MessageHeader>
                <MessageAvatar>
                  <Sparkles className="size-4" />
                </MessageAvatar>
                Assistant
              </MessageHeader>
              <MessageContent>{msg.text}</MessageContent>
              {msg.result && (
                <ResultCard
                  message={msg}
                  type={typeFor(msg.id)}
                  onTypeChange={(t) =>
                    setResultTypes((r) => ({ ...r, [msg.id]: t }))
                  }
                  onAddCustom={() => void handleAddCustom(msg)}
                  onLog={() => void handleLog(msg)}
                />
              )}
              {msg.food && (
                <Badge variant="secondary">Saved: {msg.food.name}</Badge>
              )}
            </Message>
          )
        )}
        {loading && (
          <Message className="items-start">
            <MessageContent className="flex items-center gap-2 text-muted-foreground">
              <LoaderCircle className="size-4 animate-spin" />
              Searching…
            </MessageContent>
          </Message>
        )}
        <div ref={listEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="pb-2">
        <MessageBar>
          <PromptInput
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about a food…"
            aria-label="Ask about a food"
            disabled={loading}
          />
          <Button
            type="submit"
            size="icon"
            className="h-10 w-10 shrink-0 rounded-full"
            disabled={loading || !input.trim()}
            aria-label="Send"
          >
            <Send className="size-4" />
          </Button>
        </MessageBar>
      </form>

      <AmountDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) setLogFood(null);
        }}
        food={logFood}
        onConfirm={(amount, unit) => void handleConfirm(amount, unit)}
        submitting={adding}
      />
    </div>
  );
}
