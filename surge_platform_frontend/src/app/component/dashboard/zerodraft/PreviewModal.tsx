"use client";

import { cn } from "@/lib/utils";
import { X } from "lucide-react";
import { Draft } from "./types";
import { STATUS_BADGE } from "./status-config";

interface PreviewModalProps {
  draft:   Draft | null;
  onClose: () => void;
}

export function PreviewModal({ draft, onClose }: PreviewModalProps) {
  if (!draft) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/20 z-40" onClick={onClose} />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-lg px-4">
        <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 p-6 flex flex-col gap-4">
          <div className="flex items-start justify-between gap-4">
            <h2 className="text-xl sm:text-2xl font-bold text-foreground leading-snug">{draft.title}</h2>
            <button onClick={onClose} className="shrink-0 text-muted-foreground hover:text-foreground transition-colors mt-0.5">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="flex items-center gap-2">
            <span className={cn("text-sm sm:text-base font-semibold px-2.5 py-0.5 rounded-full", STATUS_BADGE[draft.status])}>
              {draft.status}
            </span>
            <span className="text-sm sm:text-base text-muted-foreground">{draft.platform} · {draft.time}</span>
          </div>
          <div className="text-base sm:text-lg text-foreground leading-relaxed whitespace-pre-line">{draft.preview}</div>
        </div>
      </div>
    </>
  );
}