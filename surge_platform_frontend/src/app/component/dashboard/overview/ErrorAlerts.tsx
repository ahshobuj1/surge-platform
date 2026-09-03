"use client";

import { AlertTriangle } from "lucide-react";
import { ErrorAlert } from "./types";

interface ErrorAlertsProps {
  alerts: ErrorAlert[];
}

export function ErrorAlerts({ alerts }: ErrorAlertsProps) {
  if (!alerts.length) return null;

  return (
    <div className="bg-[#eef0fb] rounded-2xl border border-border/40 p-5">
      <div className="flex flex-col divide-y divide-border/40">
        {alerts.map((alert) => (
          <div
            key={alert.id}
            className="flex items-start gap-3.5 py-4 first:pt-0 last:pb-0"
          >
            {/* Icon */}
            <div className="shrink-0 w-9 h-9 rounded-xl bg-red-100 flex items-center justify-center mt-0.5">
              <AlertTriangle className="w-4 h-4 text-red-500" />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-foreground">
                {alert.title}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {alert.description}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Retry attempted:{" "}
                <span className="text-foreground font-medium">
                  {alert.retryAttempted ? "Yes" : "No"}
                </span>
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}