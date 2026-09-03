"use client";

import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Article } from "./types";
import { STATUS_BADGE } from "./status-config";

interface ArticlePreviewDialogProps {
  article: Article | null;
  open:    boolean;
  onClose: () => void;
}

export function ArticlePreviewDialog({
  article,
  open,
  onClose,
}: ArticlePreviewDialogProps) {
  if (!article) return null;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="w-full max-w-lg rounded-2xl p-8 gap-0 sm:rounded-2xl">

        {/* Title */}
        <h2 className="text-xl font-bold text-foreground leading-snug mb-5 pr-6">
          {article.title}
        </h2>

        {/* Meta */}
        <div className="flex items-center gap-2.5 mb-6">
          <span className={cn(
            "text-xs font-semibold px-2.5 py-0.5 rounded-full",
            STATUS_BADGE[article.status]
          )}>
            {article.status}
          </span>
          <span className="text-sm text-muted-foreground">
            {article.source} · {article.time}
          </span>
        </div>

        {/* Content */}
        <div className="text-sm text-foreground leading-relaxed whitespace-pre-line">
          {article.preview}
        </div>

      </DialogContent>
    </Dialog>
  );
}