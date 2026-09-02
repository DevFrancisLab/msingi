import { ChatArea } from "@/components/dashboard/ChatArea";
import { Composer } from "@/components/dashboard/Composer";
import { ContextBar } from "@/components/dashboard/ContextBar";
import { useApp } from "@/context/useApp";
import { useChat } from "@/hooks/useChat";

/** The main chat panel: context selectors, conversation, and composer. */
export function ChatWorkspace() {
  const { grade, subject, topic, activeConversationId, onConversationCreated } = useApp();

  const { messages, sending, historyError, sendMessage, retryMessage, reloadHistory } = useChat({
    conversationId: activeConversationId,
    context: { grade, subject, topic },
    onConversationCreated,
  });

  return (
    <div className="flex min-w-0 flex-1 flex-col">
      <ContextBar />
      <ChatArea
        messages={messages}
        historyError={historyError}
        onReloadHistory={reloadHistory}
        onSelectPrompt={sendMessage}
        onRetryMessage={retryMessage}
      />
      <Composer onSend={sendMessage} sending={sending} />
    </div>
  );
}
