import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import ZerodraftLogo from "@/app/component/shared/ZeroDraftLogo";

export type StepStatus = "completed" | "active" | "upcoming";

export interface Step {
  id: number;
  label: string;
  status: StepStatus;
}

interface OnboardingSidebarProps {
  steps: Step[];
  onStepClick?: (stepId: number) => void;
}

export function OnboardingSidebar({ steps, onStepClick }: OnboardingSidebarProps) {
  return (
    <aside className="w-52 shrink-0 flex flex-col justify-start py-1">
      {/* Brand Logo */}
      <div className="mb-9 flex justify-start">
        <ZerodraftLogo className="mb-0 !justify-start" size="md" />
      </div>

      {/* Steps */}
      <nav className="flex flex-col">
        {steps.map((step, index) => {
          const isClickable = (step.status === "completed" || step.status === "active") && onStepClick;
          return (
            <div key={step.id} className="flex flex-col">
              <button
                type="button"
                onClick={() => isClickable && onStepClick(step.id)}
                disabled={!isClickable}
                className={cn(
                  "flex items-center gap-3 py-1.5 text-left transition-all duration-200 outline-none select-none",
                  isClickable ? "cursor-pointer group" : "cursor-default"
                )}
              >
                {/* Step circle */}
                <div
                  className={cn(
                    "w-6 h-6 rounded-full flex items-center justify-center text-xs font-mono shrink-0 transition-all duration-200",
                    step.status === "completed" && "bg-[#3B6BF6] text-white",
                    step.status === "active" && "bg-[#111827] text-white font-bold",
                    step.status === "upcoming" && "bg-transparent border border-slate-300 text-slate-400 font-normal"
                  )}
                >
                  {step.status === "completed" ? (
                    <Check className="w-3 h-3 stroke-[3]" />
                  ) : (
                    step.id
                  )}
                </div>

                {/* Step label */}
                <span
                  className={cn(
                    "text-xs sm:text-sm font-mono transition-colors duration-200",
                    step.status === "active" && "font-bold text-slate-900",
                    step.status === "completed" && "font-normal text-slate-800 group-hover:text-slate-900",
                    step.status === "upcoming" && "text-slate-400 font-normal"
                  )}
                >
                  {step.label}
                </span>
              </button>

              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className="ml-[11px] w-[1px] h-5 bg-slate-300/80" />
              )}
            </div>
          );
        })}
      </nav>
    </aside>
  );
}

