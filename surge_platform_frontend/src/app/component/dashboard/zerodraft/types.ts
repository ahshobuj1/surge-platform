export type FilterStatus = "All" | "Draft" | "Published" | "Failed" | "Retried";
export type ArticleStatus = "Draft" | "Published" | "Failed" | "Retried";

export interface Draft {
  id: string;
  title: string;
  time: string;
  platform: string;
  status: ArticleStatus;
  preview: string;
}