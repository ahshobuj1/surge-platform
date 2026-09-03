import { ArticleStatus } from "./types";

export const STATUS_BADGE: Record<ArticleStatus, string> = {
  Published: "bg-emerald-100 text-emerald-600",
  Failed:    "bg-red-100 text-red-500",
  Retried:   "bg-amber-100 text-amber-600",
  Draft:     "bg-slate-100 text-slate-500",
};

export const ITEMS_PER_PAGE = 9;