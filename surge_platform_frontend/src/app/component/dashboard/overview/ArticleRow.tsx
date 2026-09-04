"use client";

import { cn } from "@/lib/utils";
import { Eye, RotateCcw } from "lucide-react";
import { Article } from "./types";
import { STATUS_BADGE } from "./status-config";
import { TableCell, TableRow } from "@/components/ui/table";

interface ArticleRowProps {
  article: Article;
  onPreview: (article: Article) => void;
}

export function ArticleRow({ article, onPreview }: ArticleRowProps) {
  return (
    <TableRow className="border-b border-slate-100/80 hover:bg-slate-50/50 transition-colors last:border-b-0">
      {/* Title */}
      <TableCell className="py-3.5 pl-0 pr-4">
        <span className="text-xs sm:text-sm font-semibold text-slate-800">
          {article.title}
        </span>
      </TableCell>

      {/* Time */}
      <TableCell className="py-3.5 px-4 text-xs sm:text-sm text-slate-500 font-normal whitespace-nowrap">
        {article.time}
      </TableCell>

      {/* Source */}
      <TableCell className="py-3.5 px-4 text-xs sm:text-sm text-slate-500 font-normal whitespace-nowrap">
        {article.source}
      </TableCell>

      {/* Status */}
      <TableCell className="py-3.5 px-4 whitespace-nowrap">
        <span
          className={cn(
            "inline-block text-xs font-medium px-2.5 py-0.5 rounded-full",
            STATUS_BADGE[article.status]
          )}
        >
          {article.status}
        </span>
      </TableCell>

      {/* Actions */}
      <TableCell className="py-3.5 pl-4 pr-0 text-right whitespace-nowrap">
        <div className="flex items-center justify-end gap-2.5">
          <button
            onClick={() => onPreview(article)}
            className="text-slate-300 hover:text-slate-600 transition-colors cursor-pointer"
            title="Preview"
          >
            <Eye className="w-4 h-4" />
          </button>
          {article.status === "Failed" && (
            <button
              className="text-slate-300 hover:text-slate-600 transition-colors cursor-pointer"
              title="Retry"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </TableCell>
    </TableRow>
  );
}