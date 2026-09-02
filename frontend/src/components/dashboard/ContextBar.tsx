import { ChevronRight } from "lucide-react";
import { useApp } from "@/context/useApp";
import { Select } from "@/components/ui/Select";
import { DEMO_TOPICS } from "@/lib/demoData";

/**
 * Grade / Subject / Topic selection for the active chat. These map to the
 * `grade` / `subject` / `topic` fields the backend attaches to each chat
 * request and to the conversation it creates.
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
    referenceIsDemo,
    referenceLoading,
  } = useApp();

  // The backend's /api/topics list isn't subject-scoped yet, so real data
  // shows every ingested topic. The demo fallback can narrow to the
  // selected subject since it's a static, known mapping.
  const topicOptions = referenceIsDemo && subject ? (DEMO_TOPICS[subject] ?? topics) : topics;

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
        options={topicOptions}
        placeholder={referenceLoading ? "Loading…" : "Topic"}
        onChange={(value) => setTopic(value || null)}
        // Topic is dependent on Subject: pick a subject first so the
        // question a teacher asks is grounded in a specific area.
        disabled={referenceLoading || !subject}
      />
    </div>
  );
}
