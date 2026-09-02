import { cn } from "@/lib/utils";
import type { ConnectionState } from "@/types";

interface ConnectionStatusProps {
  state: ConnectionState;
  /** Longer explanation shown as a tooltip, e.g. why it's offline. */
  detail?: string;
  className?: string;
}

const LABEL: Record<ConnectionState, string> = {
  online: "Online",
  offline: "Offline",
  checking: "Checking…",
};

const DOT_CLASS: Record<ConnectionState, string> = {
  online: "bg-online",
  offline: "bg-offline",
  checking: "bg-ink-faint animate-pulse",
};

/**
 * Reusable status pill. `state` is intentionally the only thing it needs —
 * it's driven today by useConnectionStatus (backend health + local model
 * availability) but any future provider/health source can feed it the same
 * three states.
 */
export function ConnectionStatus({ state, detail, className }: ConnectionStatusProps) {
  return (
    <span
      title={detail}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-2.5 py-1 text-xs font-medium text-ink-muted",
        className,
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", DOT_CLASS[state])} aria-hidden="true" />
      <span className="hidden sm:inline">{LABEL[state]}</span>
    </span>
  );
}
