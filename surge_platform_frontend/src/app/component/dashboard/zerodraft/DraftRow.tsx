"use client";

import { cn } from "@/lib/utils";
import { Eye, Pencil, RotateCcw } from "lucide-react";
import { Draft } from "./types";
import { STATUS_BADGE } from "./status-config";

interface DraftRowProps {
  draft: Draft;
  onPreview: (draft: Draft) => void;
  onEdit:    (draft: Draft) => void;
}

export function DraftRow({ draft, onPreview, onEdit }: DraftRowProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-[1fr_80px_130px_130px_80px] gap-1 sm:gap-2 items-start sm:items-center px-6 py-4 hover:bg-slate-50/60 transition-colors">
      {/* Title */}
      <span className="text-base sm:text-lg font-medium text-foreground truncate pr-2">
        {draft.title}
      </span>

      {/* Time */}
      <span className="text-sm sm:text-base text-muted-foreground">{draft.time}</span>

      {/* Platform */}
      <span className="text-sm sm:text-base text-muted-foreground">{draft.platform}</span>

      {/* Status */}
      <div>
        <span className={cn(
          "inline-block text-sm sm:text-base font-semibold px-3 py-1 rounded-full",
          STATUS_BADGE[draft.status]
        )}>
          {draft.status}
        </span>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 mt-1 sm:mt-0">
        {/* Eye — always */}
        <button
          onClick={() => onPreview(draft)}
          className="text-muted-foreground hover:text-indigo-500 transition-colors"
          title="Preview"
        >
          <Eye className="w-4 h-4" />
        </button>

        {/* Pencil — Draft & Retried */}
        {(draft.status === "Draft" || draft.status === "Retried") && (
            <button
            onClick={() => onEdit(draft)}
            className="text-muted-foreground hover:text-slate-600 transition-colors"
            title="Edit"
          >
            <Pencil className="w-4 h-4" />
          </button>
        )}

        {/* Retry — Failed */}
        {draft.status === "Failed" && (
          <button
            className="text-muted-foreground hover:text-slate-600 transition-colors"
            title="Retry"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}