"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  currentPage:  number;
  totalPages:   number;
  onPageChange: (page: number) => void;
}

export function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  const pageNumbers = useMemo(() => {
    if (totalPages <= 5) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const start = Math.max(1, Math.min(currentPage - 2, totalPages - 4));
    return Array.from({ length: 5 }, (_, i) => start + i);
  }, [totalPages, currentPage]);

  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-1 pt-2">
      {/* Prev */}
      <button
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
          className="w-9 h-9 flex items-center justify-center rounded-lg text-muted-foreground hover:bg-slate-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      {/* First + ellipsis */}
      {pageNumbers[0] > 1 && (
        <>
          <button onClick={() => onPageChange(1)} className="w-9 h-9 rounded-lg text-base sm:text-sm font-semibold text-slate-500 hover:bg-slate-200 transition-colors">1</button>
            {pageNumbers[0] > 2 && <span className="w-9 h-9 flex items-center justify-center text-muted-foreground text-base sm:text-sm">…</span>}
        </>
      )}

      {/* Pages */}
      {pageNumbers.map((page) => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={cn(
              "w-9 h-9 rounded-lg text-base sm:text-sm font-semibold transition-colors",
              currentPage === page
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-muted-foreground hover:bg-slate-200"
            )}
        >
          {page}
        </button>
      ))}

      {/* Last + ellipsis */}
      {pageNumbers[pageNumbers.length - 1] < totalPages && (
        <>
          {pageNumbers[pageNumbers.length - 1] < totalPages - 1 && (
              <span className="w-9 h-9 flex items-center justify-center text-muted-foreground text-base sm:text-sm">…</span>
          )}
          <button onClick={() => onPageChange(totalPages)} className="w-9 h-9 rounded-lg text-base sm:text-sm font-semibold text-slate-500 hover:bg-slate-200 transition-colors">{totalPages}</button>
        </>
      )}

      {/* Next */}
      <button
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
          className="w-9 h-9 flex items-center justify-center rounded-lg text-muted-foreground hover:bg-slate-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  );
}