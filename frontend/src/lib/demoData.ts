/**
 * Placeholder content shown only when the backend is unreachable or has no
 * data yet (fresh install, offline demo). Never used once real data exists —
 * see useConversations / useReferenceData, which prefer live API results.
 */
import type { ConversationSummary } from "@/types";

export const DEMO_GRADES = ["Grade 10"];

export const DEMO_SUBJECTS = ["Biology", "Chemistry", "Mathematics", "Agriculture"];

export const DEMO_TOPICS: Record<string, string[]> = {
  Biology: ["Photosynthesis", "Cell Division"],
  Chemistry: ["Chemical Bonding"],
  Mathematics: ["Quadratic Equations"],
  Agriculture: ["Soil Fertility"],
};

const now = Date.now();
const hoursAgo = (h: number) => new Date(now - h * 60 * 60 * 1000).toISOString();

export const DEMO_CONVERSATIONS: ConversationSummary[] = [
  {
    id: "demo-photosynthesis",
    title: "Photosynthesis",
    grade: "Grade 10",
    subject: "Biology",
    topic: "Photosynthesis",
    createdAt: hoursAgo(3),
    updatedAt: hoursAgo(3),
    isDemo: true,
  },
  {
    id: "demo-cell-division",
    title: "Cell Division",
    grade: "Grade 10",
    subject: "Biology",
    topic: "Cell Division",
    createdAt: hoursAgo(27),
    updatedAt: hoursAgo(27),
    isDemo: true,
  },
  {
    id: "demo-quadratic-equations",
    title: "Quadratic Equations",
    grade: "Grade 10",
    subject: "Mathematics",
    topic: "Quadratic Equations",
    createdAt: hoursAgo(50),
    updatedAt: hoursAgo(50),
    isDemo: true,
  },
  {
    id: "demo-chemical-bonding",
    title: "Chemical Bonding",
    grade: "Grade 10",
    subject: "Chemistry",
    topic: "Chemical Bonding",
    createdAt: hoursAgo(96),
    updatedAt: hoursAgo(96),
    isDemo: true,
  },
];
