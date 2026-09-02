import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { useConnectionStatus } from "@/hooks/useConnectionStatus";
import { useConversations } from "@/hooks/useConversations";
import { useReferenceData } from "@/hooks/useReferenceData";
import { useTopics } from "@/hooks/useTopics";
import { AppContext, type AppContextValue } from "@/context/app-context";
import { getConversationIdFromUrl, setConversationIdInUrl } from "@/lib/conversationUrl";
import type { ConversationSummary } from "@/types";

// Demo sidebar entries have no backend record (see useConversations) and
// aren't worth resuming from a URL — only a real conversation id restores.
function initialConversationId(): string | null {
  const id = getConversationIdFromUrl();
  return id && !id.startsWith("demo-") ? id : null;
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [grade, setGrade] = useState("Grade 10");
  const [subject, setSubject] = useState<string | null>(null);
  const [topic, setTopic] = useState<string | null>(null);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(
    initialConversationId,
  );
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Keep the URL in sync so a refresh (or a shared/bookmarked link) resumes
  // this conversation — see useChat's history-loading effect, which already
  // fetches GET /api/conversations/{id} for any real id, restored or not.
  // Demo ids are never real backend records, so they're not written out.
  useEffect(() => {
    const isDemo = activeConversationId?.startsWith("demo-") ?? false;
    setConversationIdInUrl(isDemo ? null : activeConversationId);
  }, [activeConversationId]);

  const {
    grades,
    subjects,
    isDemo: referenceIsDemo,
    loading: referenceLoading,
  } = useReferenceData();
  // Topics are scoped by the selected subject (GET /api/topics?subject=...),
  // fetched lazily — nothing is requested until a subject is chosen.
  const { topics, loading: topicsLoading } = useTopics(subject, referenceIsDemo);
  const {
    conversations,
    loading: conversationsLoading,
    isDemo: conversationsAreDemo,
    upsert,
  } = useConversations();
  const {
    state: connectionState,
    detail: connectionDetail,
    health: connectionHealth,
    checkNow: recheckConnection,
  } = useConnectionStatus();

  const selectConversation = useCallback(
    (id: string) => {
      setActiveConversationId(id);
      const match = conversations.find((c) => c.id === id);
      if (match) {
        setSubject(match.subject ?? null);
        setTopic(match.topic ?? null);
        if (match.grade) setGrade(match.grade);
      }
      setSidebarOpen(false);
    },
    [conversations],
  );

  const startNewChat = useCallback(() => {
    setActiveConversationId(null);
    setSubject(null);
    setTopic(null);
    setSidebarOpen(false);
  }, []);

  const onConversationCreated = useCallback(
    (conversation: ConversationSummary) => {
      upsert(conversation);
      setActiveConversationId(conversation.id);
    },
    [upsert],
  );

  const value = useMemo<AppContextValue>(
    () => ({
      grade,
      subject,
      topic,
      setGrade,
      setSubject,
      setTopic,
      grades,
      subjects,
      topics,
      topicsLoading,
      referenceIsDemo,
      referenceLoading,
      conversations,
      conversationsLoading,
      conversationsAreDemo,
      activeConversationId,
      selectConversation,
      startNewChat,
      onConversationCreated,
      connectionState,
      connectionDetail,
      connectionHealth,
      recheckConnection,
      sidebarOpen,
      openSidebar: () => setSidebarOpen(true),
      closeSidebar: () => setSidebarOpen(false),
    }),
    [
      grade,
      subject,
      topic,
      grades,
      subjects,
      topics,
      topicsLoading,
      referenceIsDemo,
      referenceLoading,
      conversations,
      conversationsLoading,
      conversationsAreDemo,
      activeConversationId,
      selectConversation,
      startNewChat,
      onConversationCreated,
      connectionState,
      connectionDetail,
      connectionHealth,
      recheckConnection,
      sidebarOpen,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
