"use client";

import { AlertTriangle } from "lucide-react";
import { ErrorAlert } from "./types";

interface ErrorAlertsProps {
  alerts: ErrorAlert[];
}

export function ErrorAlerts({ alerts }: ErrorAlertsProps) {
  if (!alerts.length) return null;

  return (
    <div className="bg-white rounded-2xl border border-white/60 p-6 shadow-xs flex flex-col gap-6">
      {alerts.map((alert) => (
        <div
          key={alert.id}
          className="flex items-start gap-4"
        >
          {/* Icon */}
          <div className="shrink-0 w-10 h-10 rounded-xl bg-[#FEECEC] flex items-center justify-center mt-0.5">
            <AlertTriangle className="w-5 h-5 text-[#EF4444]" />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <p className="text-xs sm:text-sm font-bold text-slate-900">
              {alert.title}
            </p>
            <p className="text-xs text-slate-400 mt-0.5">
              {alert.description}
            </p>
            <p className="text-[11px] text-slate-400 mt-1">
              Retry attempted: {alert.retryAttempted ? "Yes" : "No"}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}