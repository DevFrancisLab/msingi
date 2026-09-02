import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { AlertCircle, RotateCcw } from "lucide-react";
import { Logo } from "@/components/dashboard/Logo";
import { SourceList } from "@/components/dashboard/SourceList";
import type { ChatMessageData } from "@/types";

function TypingIndicator() {
  return (
    <span className="inline-flex items-center gap-2 py-1 text-sm text-ink-faint">
      <span className="inline-flex items-center gap-1" aria-hidden="true">
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-ink-faint [animation-delay:-0.2s]" />
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-ink-faint [animation-delay:-0.1s]" />
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-ink-faint" />
      </span>
      Msingi is thinking…
    </span>
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

        {message.status === "sending" && <TypingIndicator />}

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
