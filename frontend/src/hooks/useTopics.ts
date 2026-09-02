import { useEffect, useState } from "react";
import { getTopics } from "@/api/curriculum";
import { DEMO_TOPICS } from "@/lib/demoData";

interface TopicsResult {
  topics: string[];
  loading: boolean;
}

/**
 * Loads topics for the selected subject, scoped server-side via
 * GET /api/topics?subject=... (backend/app/api/routes.py). Fetches lazily —
 * nothing is requested until a subject is chosen, so picking Grade/Subject
 * doesn't fire a topics request that gets thrown away the moment the
 * subject changes again.
 */
export function useTopics(subject: string | null, referenceIsDemo: boolean): TopicsResult {
  const [topics, setTopics] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!subject) {
      setTopics([]);
      setLoading(false);
      return;
    }

    // Curriculum data overall is demo/placeholder (backend unreachable, or
    // reachable but empty) — use the static demo mapping instead of calling
    // an endpoint that can't return anything real for a demo subject name.
    if (referenceIsDemo) {
      setTopics(DEMO_TOPICS[subject] ?? []);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    getTopics(subject)
      .then((result) => {
        if (!cancelled) setTopics(result);
      })
      .catch((err) => {
        if (cancelled) return;
        console.error(`[topics] failed to load topics for subject "${subject}":`, err);
        setTopics(DEMO_TOPICS[subject] ?? []);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [subject, referenceIsDemo]);

  return { topics, loading };
}
