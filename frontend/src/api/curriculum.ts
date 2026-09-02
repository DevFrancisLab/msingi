/**
 * Grade/Subject/Topic reference data and backend health.
 * Backend: GET /api/health, /api/grades, /api/subjects, /api/topics
 * (backend/app/api/routes.py, backend/app/api/reference.py).
 */
import { request } from "@/api/client";
import type { HealthStatus } from "@/types";

interface HealthResponseRaw {
  status: string;
  app_env: string;
  ai_provider: string;
  ollama_available: boolean;
  ollama_error: string | null;
}

export async function getHealth(): Promise<HealthStatus> {
  const raw = await request<HealthResponseRaw>("/api/health");
  return {
    status: raw.status,
    appEnv: raw.app_env,
    aiProvider: raw.ai_provider,
    ollamaAvailable: raw.ollama_available,
    ollamaError: raw.ollama_error,
  };
}

// Grade 10 only for the MVP (see backend/app/api/reference.py); subjects and
// topics are flat lists derived from whatever curriculum has been ingested,
// not scoped by grade/subject — the backend doesn't offer that filter, so
// the frontend doesn't pretend to either.
export function getGrades(): Promise<string[]> {
  return request<string[]>("/api/grades");
}

export function getSubjects(): Promise<string[]> {
  return request<string[]>("/api/subjects");
}

export function getTopics(): Promise<string[]> {
  return request<string[]>("/api/topics");
}
