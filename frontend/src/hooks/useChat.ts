import { useCallback, useEffect, useRef, useState } from "react";
import { ApiError } from "@/api/client";
import { sendChatMessage } from "@/api/chat";
import { getConversation } from "@/api/conversations";
import type {
  ChatMessageData,
  ConversationSummary,
  TeachingContext,
} from "@/types";

function truncate(text: string, max: number): string {
  const trimmed = text.trim();
  return trimmed.length > max ? `${trimmed.slice(0, max - 1).trimEnd()}…` : trimmed;
}

interface UseChatOptions {
  conversationId: string | null;
  context: TeachingContext;
  onConversationCreated: (conversation: ConversationSummary) => void;
}

interface UseChatResult {
  messages: ChatMessageData[];
  sending: boolean;
  /** Set when loading an existing conversation's history failed. */
  historyError: string | null;
  sendMessage: (text: string) => void;
  retryMessage: (assistantMessageId: string) => void;
  reloadHistory: () => void;
}

/**
 * Owns the message list and send/retry lifecycle for the active
 * conversation. Loads history for a real conversation id, starts empty for
 * a new or demo conversation, and never fabricates assistant content.
 */
export function useChat({
  conversationId,
  context,
  onConversationCreated,
}: UseChatOptions): UseChatResult {
  const [messages, setMessages] = useState<ChatMessageData[]>([]);
  const [sending, setSending] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const [historyReloadToken, setHistoryReloadToken] = useState(0);

  // Tracks the backend conversation id once a brand-new chat gets one back
  // from its first response, without waiting for the parent to re-render.
  const resolvedConversationId = useRef<string | null>(conversationId);
  const contextRef = useRef(context);
  useEffect(() => {
    contextRef.current = context;
  });

  useEffect(() => {
    // Demo sidebar entries have no backend record — they only seed the
    // teaching context (see AppContext.selectConversation). Treat them as
    // "no conversation yet" so the first real message starts a fresh one
    // instead of sending a fake id to the backend.
    const isRealConversation = !!conversationId && !conversationId.startsWith("demo-");
    resolvedConversationId.current = isRealConversation ? conversationId : null;
    setHistoryError(null);

    if (!isRealConversation) {
      setMessages([]);
      return;
    }

    let cancelled = false;
    getConversation(conversationId)
      .then((detail) => {
        if (!cancelled) setMessages(detail.messages);
      })
      .catch((err) => {
        if (cancelled) return;
        setMessages([]);
        setHistoryError(
          err instanceof ApiError ? err.message : "Couldn't load this conversation.",
        );
      });

    return () => {
      cancelled = true;
    };
  }, [conversationId, historyReloadToken]);

  const performSend = useCallback(
    async (text: string, assistantMessageId: string) => {
      setSending(true);
      try {
        const { grade, subject, topic } = contextRef.current;
        const result = await sendChatMessage({
          conversationId: resolvedConversationId.current,
          message: text,
          grade,
          subject,
          topic,
        });

        const isNewConversation = resolvedConversationId.current === null;
        resolvedConversationId.current = result.conversationId;

        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantMessageId ? { ...result.message, id: assistantMessageId } : m,
          ),
        );

        if (isNewConversation) {
          const now = new Date().toISOString();
          onConversationCreated({
            id: result.conversationId,
            title: topic ?? truncate(text, 48),
            grade: grade ?? null,
            subject: subject ?? null,
            topic: topic ?? null,
            createdAt: now,
            updatedAt: now,
          });
        }
      } catch (err) {
        if (!(err instanceof ApiError)) console.error("[chat] unexpected error:", err);
        const message =
          err instanceof ApiError ? err.message : "Sorry, Msingi couldn't answer right now.";
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantMessageId
              ? { ...m, status: "error", errorMessage: message }
              : m,
          ),
        );
      } finally {
        setSending(false);
      }
    },
    [onConversationCreated],
  );

  const sendMessage = useCallback(
    (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || sending) return;

      const now = new Date().toISOString();
      const userMessage: ChatMessageData = {
        id: crypto.randomUUID(),
        role: "user",
        content: trimmed,
        createdAt: now,
        status: "done",
      };
      const assistantId = crypto.randomUUID();
      const placeholder: ChatMessageData = {
        id: assistantId,
        role: "assistant",
        content: "",
        createdAt: now,
        status: "sending",
      };

      setMessages((prev) => [...prev, userMessage, placeholder]);
      void performSend(trimmed, assistantId);
    },
    [performSend, sending],
  );

  const retryMessage = useCallback(
    (assistantMessageId: string) => {
      if (sending) return;

      // Read from current state directly rather than inside the setMessages
      // updater below — updater functions must stay pure (React may invoke
      // them more than once), and performSend has real side effects (a
      // network call).
      const index = messages.findIndex((m) => m.id === assistantMessageId);
      if (index === -1) return;
      let userText: string | null = null;
      for (let i = index - 1; i >= 0; i -= 1) {
        if (messages[i].role === "user") {
          userText = messages[i].content;
          break;
        }
      }
      if (userText === null) return;

      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantMessageId
            ? { ...m, status: "sending", errorMessage: undefined }
            : m,
        ),
      );
      void performSend(userText, assistantMessageId);
    },
    [messages, performSend, sending],
  );

  const reloadHistory = useCallback(() => {
    setHistoryReloadToken((t) => t + 1);
  }, []);

  return { messages, sending, historyError, sendMessage, retryMessage, reloadHistory };
}
