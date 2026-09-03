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
    <TableRow className="border-b border-border/60 hover:bg-muted/30 transition-colors">
      {/* Title */}
      <TableCell className="py-4 pl-2 pr-2">
        <span className="text-sm font-medium text-foreground">
          {article.title}
        </span>
      </TableCell>

      {/* Time */}
      <TableCell className="py-4 text-sm text-muted-foreground whitespace-nowrap">
        {article.time}
      </TableCell>

      {/* Source */}
      <TableCell className="py-4 text-sm text-muted-foreground">
        {article.source}
      </TableCell>

      {/* Status */}
      <TableCell className="py-4">
        <span
          className={cn(
            "inline-block text-xs font-semibold px-3 py-1 rounded-full",
            STATUS_BADGE[article.status]
          )}
        >
          {article.status}
        </span>
      </TableCell>

      {/* Actions */}
      <TableCell className="py-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => onPreview(article)}
            className="text-muted-foreground hover:text-indigo-500 transition-colors"
            title="Preview"
          >
            <Eye className="w-4 h-4" />
          </button>
          {article.status === "Failed" && (
            <button
              className="text-muted-foreground hover:text-foreground transition-colors"
              title="Retry"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}
        </div>
      </TableCell>
    </TableRow>
  );
}