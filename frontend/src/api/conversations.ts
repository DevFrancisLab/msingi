/**
 * Conversation history for the sidebar.
 * Backend: POST/GET /api/conversations, GET/DELETE /api/conversations/{id}
 * (backend/app/api/routes.py, schemas.ConversationOut/ConversationDetail).
 */
import { request } from "@/api/client";
import type { ConversationDetail, ConversationSummary } from "@/types";

interface ConversationOutRaw {
  id: string;
  title: string | null;
  grade: string | null;
  subject: string | null;
  topic: string | null;
  created_at: string;
  updated_at: string;
}

interface MessageOutRaw {
  id: string;
  role: string;
  content: string;
  created_at: string;
}

interface ConversationDetailRaw extends ConversationOutRaw {
  messages: MessageOutRaw[];
}

function mapConversation(raw: ConversationOutRaw): ConversationSummary {
  return {
    id: raw.id,
    title: raw.title,
    grade: raw.grade,
    subject: raw.subject,
    topic: raw.topic,
    createdAt: raw.created_at,
    updatedAt: raw.updated_at,
  };
}

export async function listConversations(): Promise<ConversationSummary[]> {
  const raw = await request<ConversationOutRaw[]>("/api/conversations");
  return raw.map(mapConversation);
}

export async function getConversation(id: string): Promise<ConversationDetail> {
  const raw = await request<ConversationDetailRaw>(`/api/conversations/${id}`);
  return {
    ...mapConversation(raw),
    messages: raw.messages.map((m) => ({
      id: m.id,
      role: m.role === "user" ? "user" : "assistant",
      content: m.content,
      createdAt: m.created_at,
      status: "done",
    })),
  };
}

interface CreateConversationPayload {
  grade?: string | null;
  subject?: string | null;
  topic?: string | null;
  title?: string | null;
}

/**
 * Explicitly creates a conversation ahead of the first message. Not on the
 * critical path today — POST /api/chat creates one implicitly when
 * conversation_id is omitted (see useChat) — but exposed since the backend
 * has it and a future flow (e.g. "start chat" before typing) may want it.
 */
export async function createConversation(
  payload: CreateConversationPayload,
): Promise<ConversationSummary> {
  const raw = await request<ConversationOutRaw>("/api/conversations", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return mapConversation(raw);
}

export function deleteConversation(id: string): Promise<void> {
  return request<void>(`/api/conversations/${id}`, { method: "DELETE" });
}
