"use client";

import { Draft } from "./types";
import { DraftRow } from "./DraftRow";

interface DraftTableProps {
  drafts:    Draft[];
  onPreview: (draft: Draft) => void;
  onEdit:    (draft: Draft) => void;
}

export function DraftTable({ drafts, onPreview, onEdit }: DraftTableProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex-1">
      {/* Header */}
      <div className="hidden sm:grid grid-cols-[1fr_80px_130px_130px_80px] gap-2 px-6 py-3 border-b border-slate-100">
        {["TITLE", "TIME", "PLATFORM", "STATUS", ""].map((h, i) => (
          <span key={i} className="text-xs sm:text-sm font-bold text-muted-foreground uppercase tracking-wider">
            {h}
          </span>
        ))}
      </div>

      {/* Rows */}
      <div className="flex flex-col divide-y divide-slate-50">
        {drafts.length === 0 ? (
          <div className="px-6 py-16 text-center text-sm text-slate-400">
            No drafts found.
          </div>
        ) : (
          drafts.map((draft) => (
            <DraftRow
              key={draft.id}
              draft={draft}
              onPreview={onPreview}
              onEdit={onEdit}
            />
          ))
        )}
      </div>
    </div>
  );
}