/**
 * Keeps the active conversation id in the URL (`?c=<id>`) so a page refresh
 * resumes the open conversation instead of landing back on "New Chat".
 *
 * Deliberately not a router — no route library is in use, and the app has
 * exactly one thing worth persisting in the URL. `history.replaceState`
 * (not `pushState`) keeps switching conversations from piling up
 * browser-history entries; the URL just always reflects current state.
 */
const PARAM = "c";

export function getConversationIdFromUrl(): string | null {
  return new URLSearchParams(window.location.search).get(PARAM);
}

export function setConversationIdInUrl(id: string | null): void {
  const url = new URL(window.location.href);
  if (id) {
    url.searchParams.set(PARAM, id);
  } else {
    url.searchParams.delete(PARAM);
  }
  window.history.replaceState(null, "", url);
}
