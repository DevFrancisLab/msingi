import { createContext } from "react";
import type { ConnectionState, ConversationSummary, HealthStatus } from "@/types";

export interface AppContextValue {
  // Teaching context (Grade / Subject / Topic)
  grade: string;
  subject: string | null;
  topic: string | null;
  setGrade: (grade: string) => void;
  setSubject: (subject: string | null) => void;
  setTopic: (topic: string | null) => void;

  grades: string[];
  subjects: string[];
  topics: string[];
  topicsLoading: boolean;
  referenceIsDemo: boolean;
  referenceLoading: boolean;

  // Conversations (sidebar)
  conversations: ConversationSummary[];
  conversationsLoading: boolean;
  conversationsAreDemo: boolean;
  activeConversationId: string | null;
  selectConversation: (id: string) => void;
  startNewChat: () => void;
  onConversationCreated: (conversation: ConversationSummary) => void;

  // Connection status
  connectionState: ConnectionState;
  connectionDetail: string;
  connectionHealth: HealthStatus | null;
  recheckConnection: () => void;

  // Mobile sidebar drawer
  sidebarOpen: boolean;
  openSidebar: () => void;
  closeSidebar: () => void;
}

export const AppContext = createContext<AppContextValue | null>(null);
