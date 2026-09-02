import { useState } from "react";
import { BookOpen, ChevronDown } from "lucide-react";
import { cn, formatSourceLabel } from "@/lib/utils";
import type { SourceRef } from "@/types";

interface SourceListProps {
  sources: SourceRef[];
}

/**
 * Subtle, collapsed-by-default disclosure for the curriculum passages an
 * answer was grounded on. Purely a renderer — the array always comes from
 * the API response (ChatResponse.sources); never fabricated here.
 */
export function SourceList({ sources }: SourceListProps) {
  const [open, setOpen] = useState(false);

  if (sources.length === 0) return null;

  return (
    <div className="mt-2.5 border-t border-border pt-2.5">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex items-center gap-1.5 text-xs font-medium text-ink-faint hover:text-ink-muted"
      >
        <BookOpen className="h-3.5 w-3.5" aria-hidden="true" />
        Curriculum sources
        <span className="text-ink-faint">
          ({sources.length})
        </span>
        <ChevronDown
          className={cn("h-3.5 w-3.5 transition-transform", open && "rotate-180")}
          aria-hidden="true"
        />
      </button>

      {open && (
        <ul className="mt-2 flex flex-col gap-1.5">
          {sources.map((source, index) => {
            const { primary, secondary } = formatSourceLabel(source);
            return (
              <li
                key={`${source.source ?? "source"}-${index}`}
                className="rounded-md bg-surface-muted px-2.5 py-1.5 text-xs text-ink-muted"
              >
                <span className="font-medium text-ink">{primary}</span>
                {secondary && <span className="text-ink-faint"> · {secondary}</span>}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
