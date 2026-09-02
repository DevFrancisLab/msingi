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

// Grade 10 only for the MVP (see backend/app/api/reference.py). Subjects are
// a flat list derived from whatever curriculum has been ingested — the
// backend has only one grade, so there's nothing to scope subjects by yet.
export function getGrades(): Promise<string[]> {
  return request<string[]>("/api/grades");
}

export function getSubjects(): Promise<string[]> {
  return request<string[]>("/api/subjects");
}

/**
 * Topics ingested for a subject. `subject` is optional — omit it for the
 * full unscoped list (GET /api/topics), or pass one to scope the result
 * (GET /api/topics?subject=...) once the backend has ingested content
 * tagged with more than one subject.
 */
export function getTopics(subject?: string | null): Promise<string[]> {
  const query = subject ? `?subject=${encodeURIComponent(subject)}` : "";
  return request<string[]>(`/api/topics${query}`);
}
