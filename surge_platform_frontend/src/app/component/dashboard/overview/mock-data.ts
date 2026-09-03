import { Article, ErrorAlert, JobEntry, SystemStatusData, TodaysThemeData } from "./types";

export const MOCK_ARTICLES: Article[] = [
  {
    id: "a1",
    title: "Why AI Copilots Are Changing Code Review",
    time: "03:02 AM", source: "WordPress", status: "Published",
    preview: "AI-powered code review tools are transforming how engineering teams collaborate. From catching bugs earlier to suggesting architectural improvements, these copilots are becoming indispensable members of development workflows.\n\nThe key advantage isn't just speed—it's consistency. While human reviewers may miss patterns across large codebases, AI copilots maintain awareness of the entire project context.",
  },
  {
    id: "a2",
    title: "State of CSS 2024: What's New?",
    time: "Oct 23", source: "WordPress", status: "Published",
    preview: "CSS continues to evolve rapidly. From container queries to cascade layers, the platform is maturing at an unprecedented pace.\n\nDevelopers now have powerful new tools for responsive design that don't require JavaScript hacks or complex workarounds.",
  },
  {
    id: "a3",
    title: "Optimizing React Server Components",
    time: "Oct 23", source: "Medium", status: "Failed",
    preview: "React Server Components offer a new paradigm for building performant applications, but optimization requires understanding the boundary between server and client rendering.",
  },
  {
    id: "a4",
    title: "Understanding Vector Databases",
    time: "Oct 23", source: "Medium", status: "Retried",
    preview: "Vector databases are becoming essential infrastructure for AI applications, enabling semantic search and similarity matching at scale.",
  },
  {
    id: "a5",
    title: "State of CSS 2024: What's New?",
    time: "Oct 23", source: "Medium", status: "Published",
    preview: "A deep dive into the most exciting new CSS features landing in browsers this year, including anchor positioning, view transitions, and more.",
  },
];

export const MOCK_JOB_LOG: JobEntry[] = [
  { time: "03:00 AM", label: "Collection", status: "done" },
  { time: "03:01 AM", label: "Clustering",  status: "done" },
  { time: "03:02 AM", label: "Publishing",  status: "running" },
];

export const MOCK_ERROR_ALERTS: ErrorAlert[] = [
  { id: "e1", title: "Open Source AI Tools", description: "WordPress API token expired", retryAttempted: true },
  { id: "e2", title: "Vector database",       description: "WordPress API token expired", retryAttempted: true },
];

export const MOCK_SYSTEM_STATUS: SystemStatusData = {
  status: "Active",
  lastRun: "03:02 AM",
  nextRun: "Tomorrow, 3am",
  feedsCount: 5,
  publishedLast7d: 12,
};

export const MOCK_TODAYS_THEME: TodaysThemeData = {
  theme: "The Future of Developer Tooling",
  sourced: 8,
  generated: 3,
};