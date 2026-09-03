export type ArticleStatus = "Published" | "Failed" | "Retried";
export type JobStatus = "done" | "running" | "pending";

export interface Article {
  id: string;
  title: string;
  time: string;
  source: string;
  status: ArticleStatus;
  preview: string;
}

export interface JobEntry {
  time: string;
  label: string;
  status: JobStatus;
}

export interface ErrorAlert {
  id: string;
  title: string;
  description: string;
  retryAttempted: boolean;
}

export interface SystemStatusData {
  status: "Active" | "Paused" | "Error";
  lastRun: string;
  nextRun: string;
  feedsCount: number;
  publishedLast7d: number;
}

export interface TodaysThemeData {
  theme: string;
  sourced: number;
  generated: number;
}