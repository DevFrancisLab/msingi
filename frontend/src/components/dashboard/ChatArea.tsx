import { AlertCircle, RotateCcw } from "lucide-react";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { MessageList } from "@/components/dashboard/MessageList";
import type { ChatMessageData } from "@/types";

interface ChatAreaProps {
  messages: ChatMessageData[];
  historyError: string | null;
  onReloadHistory: () => void;
  onSelectPrompt: (prompt: string) => void;
  onRetryMessage: (assistantMessageId: string) => void;
}

export function ChatArea({
  messages,
  historyError,
  onReloadHistory,
  onSelectPrompt,
  onRetryMessage,
}: ChatAreaProps) {
  return (
    <div className="min-h-0 flex-1 overflow-y-auto no-scrollbar">
      {historyError ? (
        <div className="flex h-full flex-col items-center justify-center gap-3 px-4 text-center">
          <AlertCircle className="h-6 w-6 text-offline" aria-hidden="true" />
          <p className="text-sm text-ink-muted">{historyError}</p>
          <button
            type="button"
            onClick={onReloadHistory}
            className="inline-flex items-center gap-1.5 rounded-md border border-border bg-surface px-3 py-1.5 text-sm font-medium text-ink hover:bg-surface-muted"
          >
            <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
            Try again
          </button>
        </div>
      ) : messages.length === 0 ? (
        <EmptyState onSelectPrompt={onSelectPrompt} />
      ) : (
        <MessageList messages={messages} onRetry={onRetryMessage} />
      )}
    </div>
  );
}
