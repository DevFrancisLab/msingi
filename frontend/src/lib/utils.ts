import { clsx, type ClassValue } from "clsx";

/** Joins conditional class names. */
export function cn(...inputs: ClassValue[]): string {
  return clsx(...inputs);
}

/** Formats an ISO timestamp as a short relative label ("2h ago", "Just now"). */
export function formatRelativeTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";

  const diffMs = Date.now() - date.getTime();
  const diffMin = Math.round(diffMs / 60_000);

  if (diffMin < 1) return "Just now";
  if (diffMin < 60) return `${diffMin}m ago`;

  const diffHr = Math.round(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;

  const diffDay = Math.round(diffHr / 24);
  if (diffDay < 7) return `${diffDay}d ago`;

  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

/** Formats whole seconds as "0:07", "1:23", "12:04" — for a live "thinking" timer. */
export function formatDuration(totalSeconds: number): string {
  const clamped = Math.max(0, Math.floor(totalSeconds));
  const minutes = Math.floor(clamped / 60);
  const seconds = clamped % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

/** Builds a human label from a source ref, e.g. "Grade 10 Biology · Photosynthesis · Page 42". */
export function formatSourceLabel(source: {
  grade: string | null;
  subject: string | null;
  topic: string | null;
  page: number | null;
}): { primary: string; secondary: string | null } {
  const primary = [source.grade, source.subject].filter(Boolean).join(" ") || "Curriculum";
  const secondaryParts = [
    source.topic,
    source.page != null ? `Page ${source.page}` : null,
  ].filter(Boolean);

  return {
    primary,
    secondary: secondaryParts.length ? secondaryParts.join(" · ") : null,
  };
}
