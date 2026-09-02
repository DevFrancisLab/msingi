import { useEffect, useRef } from "react";
import { AssistantMessage } from "@/components/dashboard/AssistantMessage";
import { UserMessage } from "@/components/dashboard/UserMessage";
import type { ChatMessageData } from "@/types";

interface MessageListProps {
  messages: ChatMessageData[];
  onRetry: (assistantMessageId: string) => void;
}

export function MessageList({ messages, onRetry }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [messages]);

  return (
    <div className="flex flex-col divide-y divide-border">
      {messages.map((message) =>
        message.role === "user" ? (
          <UserMessage key={message.id} message={message} />
        ) : (
          <AssistantMessage key={message.id} message={message} onRetry={onRetry} />
        ),
      )}
      <div ref={bottomRef} />
    </div>
  );
}
