import { Check, RotateCcw } from "lucide-react";

export type JobStatus = "done" | "running" | "pending";

export interface JobEntry {
  time: string;
  label: string;
  status: JobStatus;
}

interface JobLogProps {
  jobs: JobEntry[];
}

export function JobLog({ jobs }: JobLogProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4">
      <h3 className="text-base font-bold text-foreground mb-3">Job Log</h3>
      <div className="flex flex-col gap-3">
        {jobs.map((job, i) => (
          <div key={i} className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground w-24 shrink-0">{job.time}</span>
            <span className="text-base text-foreground flex-1">{job.label}</span>
            {job.status === "done" && (
              <Check className="w-4 h-4 text-emerald-500 shrink-0" />
            )}
            {job.status === "running" && (
              <RotateCcw className="w-4 h-4 text-muted-foreground shrink-0" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}