import { useEffect, useState } from "react";

/**
 * Whole seconds elapsed since `since` (an ISO timestamp), ticking once a
 * second while `active`. Used to keep a long-running request from looking
 * frozen — local model inference can take minutes on modest hardware.
 */
export function useElapsedSeconds(active: boolean, since: string): number {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!active) return;
    const start = new Date(since).getTime();
    const tick = () => setElapsed(Math.max(0, Math.floor((Date.now() - start) / 1000)));
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [active, since]);

  return elapsed;
}
