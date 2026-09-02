import { useEffect, useState } from "react";
import { getGrades, getSubjects } from "@/api/curriculum";
import { DEMO_GRADES, DEMO_SUBJECTS } from "@/lib/demoData";

interface ReferenceData {
  grades: string[];
  subjects: string[];
  /** True while the lists above are demo/placeholder data. */
  isDemo: boolean;
  loading: boolean;
}

/**
 * Loads the Grade and Subject lists the Header/ContextBar selectors offer.
 * Falls back to realistic placeholder data if the backend has no curriculum
 * ingested yet or is unreachable, so the UI never renders empty.
 *
 * Topics are handled separately (see useTopics) — they're scoped by
 * subject, so nothing is fetched until a subject is actually chosen.
 */
export function useReferenceData(): ReferenceData {
  const [grades, setGrades] = useState<string[]>(DEMO_GRADES);
  const [subjects, setSubjects] = useState<string[]>(DEMO_SUBJECTS);
  const [isDemo, setIsDemo] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const [g, s] = await Promise.all([getGrades(), getSubjects()]);
        if (cancelled) return;

        setGrades(g.length ? g : DEMO_GRADES);
        setSubjects(s.length ? s : DEMO_SUBJECTS);
        setIsDemo(s.length === 0);
      } catch (err) {
        if (cancelled) return;
        console.error("[reference-data] failed to load grades/subjects:", err);
        setGrades(DEMO_GRADES);
        setSubjects(DEMO_SUBJECTS);
        setIsDemo(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return { grades, subjects, isDemo, loading };
}
