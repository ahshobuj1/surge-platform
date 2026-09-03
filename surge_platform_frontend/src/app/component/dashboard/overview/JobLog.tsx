"use client";

import { Check, Loader2 } from "lucide-react";
import { JobEntry } from "./types";
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
} from "@/components/ui/table";

interface JobLogProps {
  jobs: JobEntry[];
}

export function JobLog({ jobs }: JobLogProps) {
  return (
    <div className="bg-[#eef0fb] rounded-2xl border border-border/40 p-5">
      <h3 className="text-sm font-bold text-foreground mb-3">Job Log</h3>

      <Table>
        <TableBody>
          {jobs.map((job, i) => (
            <TableRow
              key={i}
              className="border-b border-border/40 hover:bg-transparent last:border-b-0"
            >
              {/* Time */}
              <TableCell className="py-3.5 pl-2 pr-4 w-[400px]">
                <span className="text-xs font-medium text-indigo-400 whitespace-nowrap">
                  {job.time}
                </span>
              </TableCell>

              {/* Label */}
              <TableCell className="py-3.5 px-2">
                <span className="text-sm text-foreground">{job.label}</span>
              </TableCell>

              {/* Status icon */}
              <TableCell className="py-3.5 pr-2 w-8 text-right">
                {job.status === "done" && (
                  <Check className="w-4 h-4 text-emerald-500 ml-auto" />
                )}
                {job.status === "running" && (
                  <Loader2 className="w-4 h-4 text-muted-foreground/50 ml-auto animate-spin" />
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}