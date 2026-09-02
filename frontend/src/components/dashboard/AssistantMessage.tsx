import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { AlertCircle, RotateCcw } from "lucide-react";
import { Logo } from "@/components/dashboard/Logo";
import { SourceList } from "@/components/dashboard/SourceList";
import { useElapsedSeconds } from "@/hooks/useElapsedSeconds";
import { formatDuration } from "@/lib/utils";
import type { ChatMessageData } from "@/types";

// Local CPU inference can genuinely take minutes (observed ~3-4min on
// modest hardware for one answer) — past this, say so, so a live demo
// doesn't read as frozen. Below it, the dots alone are enough.
const LONG_WAIT_SECONDS = 20;

function TypingIndicator({ since }: { since: string }) {
  const elapsed = useElapsedSeconds(true, since);
  const longWait = elapsed >= LONG_WAIT_SECONDS;

  return (
    <div
      className="flex flex-col gap-1 py-1"
      role="status"
      aria-label="Msingi is preparing a response"
    >
      <span className="inline-flex items-center gap-2 text-sm text-ink-faint" aria-hidden="true">
        <span className="inline-flex items-center gap-1">
          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-ink-faint [animation-delay:-0.2s]" />
          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-ink-faint [animation-delay:-0.1s]" />
          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-ink-faint" />
        </span>
        Msingi is thinking… <span className="tabular-nums">{formatDuration(elapsed)}</span>
      </span>
      {longWait && (
        <span className="text-xs text-ink-faint" aria-hidden="true">
          Running on local hardware can take a few minutes — no need to resend.
        </span>
      )}
    </div>
  );
}

interface AssistantMessageProps {
  message: ChatMessageData;
  onRetry: (assistantMessageId: string) => void;
}

export function AssistantMessage({ message, onRetry }: AssistantMessageProps) {
  return (
    <div className="bg-surface-muted/60">
      <div className="mx-auto w-full max-w-2xl px-4 py-3 sm:px-6">
        <div className="mb-1.5 flex items-center gap-1.5">
          <Logo markOnly />
          <span className="text-xs font-semibold uppercase tracking-wide text-ink-faint">
            MSINGI
          </span>
        </div>

        {message.status === "sending" && <TypingIndicator since={message.createdAt} />}

        {message.status === "error" && (
          <div className="flex items-start gap-2 rounded-md border border-offline/30 bg-offline-soft px-3 py-2.5 text-sm text-offline">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            <div className="flex-1">
              <p>{message.errorMessage ?? "Sorry, Msingi couldn't answer right now."}</p>
              <button
                type="button"
                onClick={() => onRetry(message.id)}
                className="mt-1.5 inline-flex items-center gap-1 text-sm font-medium text-offline hover:underline"
              >
                <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                Retry
              </button>
            </div>
          </div>
        )}

        {message.status === "done" && (
          <>
            <div className="msingi-prose">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content}</ReactMarkdown>
            </div>
            {message.sources && <SourceList sources={message.sources} />}
          </>
        )}
      </div>
    </div>
  );
}
