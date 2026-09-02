import { ChevronRight } from "lucide-react";
import { useApp } from "@/context/useApp";
import { Select } from "@/components/ui/Select";

/**
 * Grade / Subject / Topic selection for the active chat. These map to the
 * `grade` / `subject` / `topic` fields the backend attaches to each chat
 * request and to the conversation it creates.
 *
 * Subject → Topic is a real dependent fetch: Topic stays disabled until a
 * Subject is chosen, and only then does useTopics call
 * GET /api/topics?subject=... (backend/app/api/routes.py) — no topics
 * request fires before that, and no client-side filtering fakes what the
 * backend already scopes for us.
 */
export function ContextBar() {
  const {
    grade,
    grades,
    setGrade,
    subject,
    subjects,
    setSubject,
    topic,
    topics,
    setTopic,
    topicsLoading,
    referenceLoading,
  } = useApp();

  const topicPlaceholder = !subject
    ? "Select a subject first"
    : topicsLoading
      ? "Loading…"
      : topics.length === 0
        ? "No topics found"
        : "Topic";

  return (
    <div className="flex shrink-0 flex-wrap items-center gap-1.5 border-b border-border bg-surface px-3 py-2 sm:px-4">
      <Select
        label="Grade"
        value={grade}
        options={grades}
        onChange={setGrade}
        disabled={referenceLoading}
      />
      <ChevronRight className="h-3.5 w-3.5 shrink-0 text-ink-faint" aria-hidden="true" />
      <Select
        label="Subject"
        value={subject ?? ""}
        options={subjects}
        placeholder={referenceLoading ? "Loading…" : "Subject"}
        onChange={(value) => setSubject(value || null)}
        disabled={referenceLoading}
      />
      <ChevronRight className="h-3.5 w-3.5 shrink-0 text-ink-faint" aria-hidden="true" />
      <Select
        label="Topic"
        value={topic ?? ""}
        options={topics}
        placeholder={topicPlaceholder}
        onChange={(value) => setTopic(value || null)}
        disabled={!subject || topicsLoading || topics.length === 0}
      />
    </div>
  );
}
