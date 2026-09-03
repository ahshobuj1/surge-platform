import { ErrorAlert } from "./ErrorAlerts";
import { JobEntry } from "./JobLog";
import { Article } from "./RecentlyPublished";

export const MOCK_ARTICLES: Article[] = [
  { id: "a1", title: "Why AI Copilots Are Changing Code Review", time: "03:02 AM", source: "WordPress", status: "Published", viewUrl: "#" },
  { id: "a2", title: "State of CSS 2024: What's New?",           time: "Oct 23",   source: "WordPress", status: "Published", viewUrl: "#" },
  { id: "a3", title: "Optimizing React Server Components",        time: "Oct 23",   source: "Medium",    status: "Failed" },
  { id: "a4", title: "Understanding Vector Databases",            time: "Oct 23",   source: "Medium",    status: "Retried" },
  { id: "a5", title: "State of CSS 2024: What's New?",           time: "Oct 23",   source: "Medium",    status: "Published", viewUrl: "#" },
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

export const MOCK_SYSTEM_STATUS = {
  status: "Active" as const,
  lastRun: "03:02 AM",
  nextRun: "Tomorrow, 3am",
  feedsCount: 5,
  publishedLast7d: 12,
};

export const MOCK_TODAYS_THEME = {
  theme: "The Future of Developer Tooling",
  sourced: 8,
  generated: 3,
};