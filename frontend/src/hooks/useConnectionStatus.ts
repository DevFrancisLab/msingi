import { useCallback, useEffect, useRef, useState } from "react";
import { getHealth } from "@/api/curriculum";
import type { ConnectionState, HealthStatus } from "@/types";

const POLL_INTERVAL_MS = 20_000;

interface ConnectionStatusResult {
  state: ConnectionState;
  health: HealthStatus | null;
  /** Human-readable reason shown in the status tooltip. Never leaks backend internals. */
  detail: string;
  checkNow: () => void;
}

/**
 * Polls the backend health endpoint to reflect whether Msingi can currently
 * reach a working local model — not just whether the browser has internet.
 * "Online" here means the local AI is usable, not that the network is up.
 */
export function useConnectionStatus(): ConnectionStatusResult {
  const [state, setState] = useState<ConnectionState>("checking");
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [detail, setDetail] = useState("Checking connection…");
  const inFlight = useRef(false);

  const check = useCallback(async () => {
    if (inFlight.current) return;
    inFlight.current = true;
    try {
      const result = await getHealth();
      setHealth(result);
      if (result.ollamaAvailable) {
        setState("online");
        setDetail("Local AI model is ready");
      } else {
        setState("offline");
        // result.ollamaError can contain internal detail (e.g. Ollama's base
        // URL) — that's useful for developers, not for the tooltip a teacher
        // sees, so keep it generic and log the real reason to the console.
        if (result.ollamaError) console.warn("[health] ollama unavailable:", result.ollamaError);
        setDetail("Local AI model isn't available right now");
      }
    } catch {
      setHealth(null);
      setState("offline");
      setDetail("Can't reach the Msingi backend");
    } finally {
      inFlight.current = false;
    }
  }, []);

  useEffect(() => {
    check();
    const id = window.setInterval(check, POLL_INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [check]);

  return { state, health, detail, checkNow: check };
}
