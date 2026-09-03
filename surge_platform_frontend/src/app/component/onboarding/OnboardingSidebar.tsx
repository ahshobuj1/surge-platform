import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export type StepStatus = "completed" | "active" | "upcoming";

export interface Step {
  id: number;
  label: string;
  status: StepStatus;
}

interface OnboardingSidebarProps {
  steps: Step[];
}

export function OnboardingSidebar({ steps }: OnboardingSidebarProps) {
  return (
    <aside className="w-52 shrink-0 flex flex-col gap-1 py-2">
      {/* Logo */}
      <div className="mb-8 px-1">
        <span className="font-mono text-lg font-bold tracking-tighter text-slate-800 select-none">
          zerodraft.
        </span>
      </div>

      {/* Steps */}
      <nav className="flex flex-col gap-0">
        {steps.map((step, index) => (
          <div key={step.id} className="flex flex-col">
            <div className="flex items-center gap-3 py-1.5">
              {/* Step circle */}
              <div
                className={cn(
                  "w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 transition-all duration-200",
                  step.status === "completed" &&
                    "bg-indigo-500 text-white",
                  step.status === "active" &&
                    "bg-slate-900 text-white",
                  step.status === "upcoming" &&
                    "bg-transparent border border-slate-300 text-slate-400"
                )}
              >
                {step.status === "completed" ? (
                  <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                ) : (
                  step.id
                )}
              </div>

              {/* Step label */}
              <span
                className={cn(
                  "text-sm transition-colors duration-200",
                  step.status === "active" &&
                    "font-semibold text-slate-900",
                  step.status === "completed" &&
                    "font-medium text-slate-500",
                  step.status === "upcoming" && "text-slate-400"
                )}
              >
                {step.label}
              </span>
            </div>

            {/* Connector line */}
            {index < steps.length - 1 && (
              <div className="ml-3.25 w-px h-4 bg-slate-200" />
            )}
          </div>
        ))}
      </nav>
    </aside>
  );
}
