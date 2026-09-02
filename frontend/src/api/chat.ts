/**
 * Chat: the core teach/prepare/explain flow.
 * Backend: POST /api/chat (backend/app/api/routes.py, schemas.ChatRequest/ChatResponse).
 */
import { request } from "@/api/client";
import type { ChatMessageData, SourceRef } from "@/types";

interface SourceRefRaw {
  source: string | null;
  page: number | null;
  subject: string | null;
  grade: string | null;
  topic: string | null;
}

interface ChatResponseRaw {
  conversation_id: string;
  message: { role: string; content: string };
  sources: SourceRefRaw[];
}

export interface SendMessagePayload {
  conversationId: string | null;
  message: string;
  grade?: string | null;
  subject?: string | null;
  topic?: string | null;
  /** UNDERSTAND | PREPARE | TEACH — omit to let the model infer. */
  mode?: string | null;
}

export interface SendMessageResult {
  conversationId: string;
  message: ChatMessageData;
}

function mapSource(raw: SourceRefRaw): SourceRef {
  return {
    source: raw.source,
    page: raw.page,
    subject: raw.subject,
    grade: raw.grade,
    topic: raw.topic,
  };
}

export async function sendChatMessage(payload: SendMessagePayload): Promise<SendMessageResult> {
  const raw = await request<ChatResponseRaw>("/api/chat", {
    method: "POST",
    body: JSON.stringify({
      conversation_id: payload.conversationId,
      message: payload.message,
      grade: payload.grade,
      subject: payload.subject,
      topic: payload.topic,
      mode: payload.mode,
    }),
  });

  return {
    conversationId: raw.conversation_id,
    message: {
      id: crypto.randomUUID(),
      role: "assistant",
      content: raw.message.content,
      createdAt: new Date().toISOString(),
      status: "done",
      // Empty array when the backend found no grounding chunks — SourceList
      // already renders nothing for an empty array, so no "invented" sources.
      sources: raw.sources.map(mapSource),
    },
  };
}
