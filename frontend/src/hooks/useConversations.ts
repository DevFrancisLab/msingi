import { useCallback, useEffect, useState } from "react";
import { listConversations } from "@/api/conversations";
import { DEMO_CONVERSATIONS } from "@/lib/demoData";
import type { ConversationSummary } from "@/types";

interface ConversationsResult {
  conversations: ConversationSummary[];
  loading: boolean;
  /** True while the list shown is placeholder data, not real chat history. */
  isDemo: boolean;
  refresh: () => Promise<void>;
  /** Merge a freshly created/updated conversation into the list (optimistic). */
  upsert: (conversation: ConversationSummary) => void;
}

/**
 * Loads the "Recent chats" list for the sidebar. Falls back to placeholder
 * titles when the backend has no conversations yet or is unreachable, so a
 * fresh install still demonstrates the intended UI.
 */
export function useConversations(): ConversationsResult {
  const [conversations, setConversations] =
    useState<ConversationSummary[]>(DEMO_CONVERSATIONS);
  const [isDemo, setIsDemo] = useState(true);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const result = await listConversations();
      if (result.length > 0) {
        setConversations(result);
        setIsDemo(false);
      } else {
        setConversations(DEMO_CONVERSATIONS);
        setIsDemo(true);
      }
    } catch (err) {
      console.error("[conversations] failed to load recent chats:", err);
      setConversations(DEMO_CONVERSATIONS);
      setIsDemo(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const upsert = useCallback((conversation: ConversationSummary) => {
    setIsDemo(false);
    setConversations((prev) => {
      const withoutDemos = prev.filter((c) => !c.isDemo);
      const withoutExisting = withoutDemos.filter((c) => c.id !== conversation.id);
      return [conversation, ...withoutExisting];
    });
  }, []);

  return { conversations, loading, isDemo, refresh, upsert };
}
