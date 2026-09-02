import { useEffect, useState } from "react";
import { getGrades, getSubjects, getTopics } from "@/api/curriculum";
import { DEMO_GRADES, DEMO_SUBJECTS, DEMO_TOPICS } from "@/lib/demoData";

interface ReferenceData {
  grades: string[];
  subjects: string[];
  topics: string[];
  /** True while the curriculum lists above are demo/placeholder data. */
  isDemo: boolean;
  loading: boolean;
}

const DEMO_TOPICS_FLAT = Object.values(DEMO_TOPICS).flat();

/**
 * Loads the grade/subject/topic lists the ContextBar and Header selectors
 * offer. Falls back to realistic placeholder data if the backend has no
 * curriculum ingested yet or is unreachable, so the UI never renders empty.
 */
export function useReferenceData(): ReferenceData {
  const [grades, setGrades] = useState<string[]>(DEMO_GRADES);
  const [subjects, setSubjects] = useState<string[]>(DEMO_SUBJECTS);
  const [topics, setTopics] = useState<string[]>(DEMO_TOPICS_FLAT);
  const [isDemo, setIsDemo] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const [g, s, t] = await Promise.all([
          getGrades(),
          getSubjects(),
          getTopics(),
        ]);
        if (cancelled) return;

        setGrades(g.length ? g : DEMO_GRADES);
        setSubjects(s.length ? s : DEMO_SUBJECTS);
        setTopics(t.length ? t : DEMO_TOPICS_FLAT);
        setIsDemo(s.length === 0 && t.length === 0);
      } catch (err) {
        if (cancelled) return;
        console.error("[reference-data] failed to load grades/subjects/topics:", err);
        setGrades(DEMO_GRADES);
        setSubjects(DEMO_SUBJECTS);
        setTopics(DEMO_TOPICS_FLAT);
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

  return { grades, subjects, topics, isDemo, loading };
}
