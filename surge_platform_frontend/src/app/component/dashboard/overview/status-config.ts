import { ArticleStatus } from "./types";

export const STATUS_BADGE: Record<ArticleStatus, string> = {
  Published: "bg-[#E8F8EE] text-[#16A34A]",
  Failed:    "bg-[#FEECEC] text-[#EF4444]",
  Retried:   "bg-[#FEF6E7] text-[#D97706]",
};