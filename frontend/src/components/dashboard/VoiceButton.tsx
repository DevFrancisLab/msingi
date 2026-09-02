import { Mic } from "lucide-react";
import { cn } from "@/lib/utils";

interface VoiceButtonProps {
  size?: "sm" | "md";
  className?: string;
}

/**
 * Voice input is not implemented yet (see SPEC.md Phase 2). This renders the
 * affordance honestly: present, focusable, but disabled — no simulated
 * listening state or fake transcription.
 */
export function VoiceButton({ size = "md", className }: VoiceButtonProps) {
  const dimension = size === "sm" ? "h-8 w-8" : "h-9 w-9";
  const iconSize = size === "sm" ? "h-4 w-4" : "h-[18px] w-[18px]";

  return (
    <button
      type="button"
      disabled
      title="Voice input — coming soon"
      aria-label="Voice input (coming soon)"
      className={cn(
        "inline-flex items-center justify-center rounded-md border border-border bg-surface text-ink-faint",
        "cursor-not-allowed disabled:opacity-60",
        dimension,
        className,
      )}
    >
      <Mic className={iconSize} aria-hidden="true" />
    </button>
  );
}
