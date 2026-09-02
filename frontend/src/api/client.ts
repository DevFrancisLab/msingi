/**
 * Base HTTP client for the Msingi FastAPI backend.
 *
 * Architecture rule: this is the ONLY place in the frontend that calls
 * `fetch`. React never talks to Ollama, LangChain, or Chroma directly —
 * everything goes through FastAPI (see backend/app/api/routes.py).
 *
 *   React → api/*.ts → FastAPI → AIService → LangChain → RAG → Ollama
 *
 * Base URL comes from VITE_API_BASE_URL (public, non-secret config — see
 * frontend/.env.example). It defaults to the backend's standard local dev
 * address so the app works with zero setup. Never put secrets (API keys,
 * Ollama credentials) in VITE_* — anything prefixed VITE_ is bundled into
 * the browser build in plain text.
 */
const DEFAULT_BASE_URL = "http://localhost:8000";

const API_BASE = (import.meta.env.VITE_API_BASE_URL ?? DEFAULT_BASE_URL).replace(/\/$/, "");

/** Error shown to the teacher. `message` is always safe to render as-is. */
export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

/**
 * Backend error `detail` strings can contain internal detail (Ollama's base
 * URL, a Python exception's `str()`, etc — see backend/app/ai/ollama.py).
 * Never render that in the UI. This maps status + raw detail to a message
 * safe for a teacher to read, and the raw detail is logged separately for
 * developers (console, not the DOM).
 */
function toFriendlyMessage(status: number, rawDetail: string | null): string {
  if (status === 0) {
    return "Msingi's local AI isn't reachable. Check your connection and try again.";
  }
  if (status === 404) {
    return "That conversation couldn't be found.";
  }
  if (status === 422) {
    return "Please enter a message and try again.";
  }
  if (status === 503) {
    return "Sorry, Msingi couldn't answer right now. Try again in a moment.";
  }
  if (status >= 500) {
    return "Sorry, something went wrong on Msingi's end. Try again.";
  }
  // Other 4xx: still don't trust the raw text blindly, but these are
  // typically our own request-validation messages, not leaked internals.
  return rawDetail || "Sorry, that didn't work. Try again.";
}

export async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE}${path}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...init?.headers,
      },
    });
  } catch (err) {
    console.error(`[api] network error calling ${path}:`, err);
    throw new ApiError(toFriendlyMessage(0, null), 0);
  }

  if (!response.ok) {
    let rawDetail: string | null = null;
    try {
      const body = (await response.json()) as { detail?: string };
      rawDetail = body?.detail ?? null;
    } catch {
      // no JSON body
    }
    console.error(`[api] ${init?.method ?? "GET"} ${path} failed (${response.status}):`, rawDetail);
    throw new ApiError(toFriendlyMessage(response.status, rawDetail), response.status);
  }

  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}
