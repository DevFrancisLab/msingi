import { useCallback, useMemo, useState, type ReactNode } from "react";
import { useConnectionStatus } from "@/hooks/useConnectionStatus";
import { useConversations } from "@/hooks/useConversations";
import { useReferenceData } from "@/hooks/useReferenceData";
import { AppContext, type AppContextValue } from "@/context/app-context";
import type { ConversationSummary } from "@/types";

export function AppProvider({ children }: { children: ReactNode }) {
  const {
    grades,
    subjects,
    topics,
    isDemo: referenceIsDemo,
    loading: referenceLoading,
  } = useReferenceData();
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

  const [grade, setGrade] = useState("Grade 10");
  const [subject, setSubject] = useState<string | null>(null);
  const [topic, setTopic] = useState<string | null>(null);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
