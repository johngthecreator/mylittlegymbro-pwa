import { useEffect, useState } from "react";
import { useServices } from "@/di/AppServicesProvider";

/** Ensures the AI key is loaded, then reports whether one is configured. */
export function useAiKey(): { ready: boolean; hasKey: boolean } {
  const { aiService } = useServices();
  const [ready, setReady] = useState(false);
  const [hasKey, setHasKey] = useState(false);

  useEffect(() => {
    let active = true;
    aiService
      .init()
      .then(() => {
        if (!active) return;
        setHasKey(aiService.hasApiKey());
        setReady(true);
      })
      .catch(() => {
        if (!active) return;
        setReady(true);
      });
    return () => {
      active = false;
    };
  }, [aiService]);

  return { ready, hasKey };
}
