/**
 * Domain types for the Msingi teacher dashboard.
 *
 * These mirror `backend/app/api/schemas.py` but use camelCase, which the
 * mapping functions in `lib/api.ts` translate to/from at the network edge.
 */

export type MessageRole = "user" | "assistant";

/** Delivery state of a single chat message bubble. */
export type MessageStatus = "sending" | "done" | "error";

export interface SourceRef {
  source: string | null;
  page: number | null;
  subject: string | null;
  grade: string | null;
  topic: string | null;
}

export interface ChatMessageData {
  id: string;
  role: MessageRole;
  content: string;
  createdAt: string;
  status: MessageStatus;
  sources?: SourceRef[];
  /** Present when status === "error"; lets the composer offer a retry. */
  errorMessage?: string;
}

export interface ConversationSummary {
  id: string;
  title: string | null;
  grade: string | null;
  subject: string | null;
  topic: string | null;
  createdAt: string;
  updatedAt: string;
  /** True for locally-seeded demo entries with no backend record. */
  isDemo?: boolean;
}

export interface ConversationDetail extends ConversationSummary {
  messages: ChatMessageData[];
}

export interface HealthStatus {
  status: string;
  appEnv: string;
  aiProvider: string;
  ollamaAvailable: boolean;
  ollamaError?: string | null;
}

/** Reflects whether Msingi can currently reach a working local model. */
export type ConnectionState = "checking" | "online" | "offline";

export interface TeachingContext {
  grade: string;
  subject: string | null;
  topic: string | null;
}
