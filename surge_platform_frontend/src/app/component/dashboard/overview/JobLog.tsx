"use client";

import { Check, Loader2 } from "lucide-react";
import { JobEntry } from "./types";

interface JobLogProps {
  jobs: JobEntry[];
}

export function JobLog({ jobs }: JobLogProps) {
  return (
    <div className="bg-[#EEF3FE] rounded-2xl border border-white/60 p-5 shadow-xs">
      <h3 className="text-sm font-bold text-slate-800 mb-3.5">Job Log</h3>

      <div className="bg-white rounded-xl divide-y divide-slate-100 overflow-hidden shadow-xs">
        {jobs.map((job, i) => (
          <div
            key={i}
            className="flex items-center justify-between px-4 py-3 text-xs"
          >
            {/* Time */}
            <span className="text-slate-400 font-normal w-20 shrink-0">
              {job.time}
            </span>

            {/* Label */}
            <span className="font-semibold text-slate-700 flex-1 px-2">
              {job.label}
            </span>

            {/* Status icon */}
            <div className="shrink-0 flex items-center justify-end w-6">
              {job.status === "done" && (
                <Check className="w-4 h-4 text-emerald-500 stroke-[2.5]" />
              )}
              {job.status === "running" && (
                <Loader2 className="w-4 h-4 text-slate-300 animate-spin" />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}