"use client";

import { TodaysThemeData } from "./types";

interface TodaysThemeProps {
  data: TodaysThemeData;
}

export function TodaysTheme({ data }: TodaysThemeProps) {
  return (
    <div className="w-full bg-white rounded-2xl shadow-xs border border-white/60 px-7 py-4 flex items-center justify-between gap-4">
      <div className="flex items-center min-w-0">
        <span className="text-xs font-semibold text-slate-400 shrink-0">
          Today&apos;s Theme
        </span>
        <span className="text-xs sm:text-sm font-bold text-slate-800 truncate ml-4">
          &ldquo;{data.theme}&rdquo;
        </span>
      </div>
      <span className="text-xs text-[#7888B8] font-medium shrink-0 bg-[#EEF3FE] px-3.5 py-1.5 rounded-lg border border-[#E2EAFB]/60">
        {data.sourced} sourced · {data.generated} generated
      </span>
    </div>
  );
}