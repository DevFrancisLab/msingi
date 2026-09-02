import { useRef, useState, type KeyboardEvent } from "react";
import { ArrowUp } from "lucide-react";
import { VoiceButton } from "@/components/dashboard/VoiceButton";
import { cn } from "@/lib/utils";

const MAX_TEXTAREA_HEIGHT = 200;

interface ComposerProps {
  onSend: (text: string) => void;
  sending: boolean;
}

export function Composer({ onSend, sending }: ComposerProps) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const resize = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, MAX_TEXTAREA_HEIGHT)}px`;
  };

  const submit = () => {
    const trimmed = value.trim();
    if (!trimmed || sending) return;
    onSend(trimmed);
    setValue("");
    requestAnimationFrame(resize);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  const canSend = value.trim().length > 0 && !sending;

  return (
    <div className="shrink-0 border-t border-border bg-surface px-3 py-3 sm:px-4">
      <div
        className={cn(
          "mx-auto flex w-full max-w-2xl items-end gap-2 rounded-2xl border border-border bg-surface p-1.5 pl-3.5 shadow-sm transition-colors focus-within:border-brand/50",
        )}
      >
        <label htmlFor="composer-input" className="sr-only">
          Ask Msingi
        </label>
        <textarea
          id="composer-input"
          ref={textareaRef}
          rows={1}
          value={value}
          disabled={sending}
          placeholder="Ask Msingi anything…"
          onChange={(e) => {
            setValue(e.target.value);
            resize();
          }}
          onKeyDown={handleKeyDown}
          className="min-w-0 max-h-[200px] flex-1 resize-none bg-transparent py-1.5 text-[15px] leading-relaxed text-ink placeholder:text-ink-faint focus:outline-none disabled:opacity-60"
        />
        <div className="flex items-center gap-1.5 pb-0.5">
          <VoiceButton size="sm" />
          <button
            type="button"
            onClick={submit}
            disabled={!canSend}
            aria-label="Send message"
            title="Send"
            className={cn(
              "inline-flex h-8 w-8 items-center justify-center rounded-full transition-colors",
              canSend
                ? "bg-brand text-white hover:bg-brand-strong"
                : "bg-surface-muted text-ink-faint",
            )}
          >
            <ArrowUp className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>
      <p className="mx-auto mt-1.5 max-w-2xl text-center text-[11px] text-ink-faint">
        Enter to send · Shift + Enter for a new line
      </p>
    </div>
  );
}
