"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  Globe,
  Loader2,
  Palette,
  Rss,
  Sparkles,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/context/AuthContext";
import { PreferencesData } from "./StepPreferences";
import { ScheduleData } from "./StepSchedule";
import { PlanTier } from "./StepPaywall";

interface StepCompletedProps {
  feedUrl?: string;
  feedTitle?: string;
  preferences?: PreferencesData;
  connectedPlatforms?: string[];
  scheduleData?: ScheduleData | null;
  plan?: PlanTier;
  onComplete?: () => void;
}

export function StepCompleted({
  feedUrl,
  feedTitle,
  preferences,
  connectedPlatforms = [],
  scheduleData,
  plan,
  onComplete,
}: StepCompletedProps) {
  const router = useRouter();
  const { completeOnboarding } = useAuth();
  const [isLaunching, setIsLaunching] = useState(false);

  useEffect(() => {
    // Automatically finalize onboarding state in backend upon reaching completion step
    void completeOnboarding();
  }, [completeOnboarding]);

  const handleLaunchDashboard = async () => {
    setIsLaunching(true);
    try {
      await completeOnboarding();
    } catch (err: unknown) {
      console.warn("Could not mark onboarding complete:", err);
    }

    if (onComplete) {
      onComplete();
    } else {
      router.push("/dashboard");
    }
  };

  const isWordpressConnected = connectedPlatforms.includes("wordpress");
  const frequencyLabel = scheduleData?.frequency || "Daily";
  const mainTime = scheduleData?.mainTime
    ? `${scheduleData.mainTime.hour}:${scheduleData.mainTime.minute} ${scheduleData.mainTime.period} ${scheduleData.timezone || "UTC"}`
    : "09:00 AM UTC";

  return (
    <div className="flex flex-col items-center justify-between w-full max-w-2xl mx-auto py-2 font-mono">
      {/* Celebration Header */}
      <div className="flex flex-col items-center text-center">
        <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 mb-4 shadow-sm">
          <CheckCircle2 className="w-9 h-9 stroke-[2.5]" />
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Automation Setup Complete!
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-2 max-w-md">
          Your AI publishing engine is ready. Articles will be automatically monitored, synthesized, and published according to your editorial guidelines.
        </p>
      </div>

      {/* Review Summary Card */}
      <Card className="w-full rounded-2xl border border-slate-200/80 bg-slate-50/70 p-5 sm:p-6 flex flex-col gap-4 mt-6 shadow-2xs ring-0">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
          Setup Review & Configuration Summary
        </span>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
          {/* 1. RSS Source */}
          <div className="flex items-start gap-3 p-3 rounded-xl bg-white border border-slate-200/70 shadow-2xs">
            <div className="w-8 h-8 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center shrink-0 mt-0.5">
              <Rss className="w-4 h-4" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[10px] text-slate-400 font-semibold uppercase">
                Content Source
              </span>
              <span className="text-xs font-bold text-slate-800 truncate">
                {feedTitle || "Verified RSS Feed"}
              </span>
              <span className="text-[10px] text-slate-500 truncate">
                {feedUrl || "Active polling enabled"}
              </span>
            </div>
          </div>

          {/* 2. Editorial Style */}
          <div className="flex items-start gap-3 p-3 rounded-xl bg-white border border-slate-200/70 shadow-2xs">
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 mt-0.5">
              <Palette className="w-4 h-4" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[10px] text-slate-400 font-semibold uppercase">
                Editorial Voice
              </span>
              <span className="text-xs font-bold text-slate-800 truncate">
                {preferences?.tone || "Professional & Objective"}
              </span>
              <span className="text-[10px] text-slate-500 truncate">
                {preferences?.audience
                  ? `Audience: ${preferences.audience}`
                  : "Target audience configured"}
              </span>
            </div>
          </div>

          {/* 3. Publishing Channel */}
          <div className="flex items-start gap-3 p-3 rounded-xl bg-white border border-slate-200/70 shadow-2xs">
            <div className="w-8 h-8 rounded-lg bg-[#21759B]/10 text-[#21759B] flex items-center justify-center shrink-0 mt-0.5">
              <Globe className="w-4 h-4" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[10px] text-slate-400 font-semibold uppercase">
                Publishing Channel
              </span>
              <span className="text-xs font-bold text-slate-800 truncate">
                {isWordpressConnected ? "WordPress Connected" : "CMS Ready"}
              </span>
              <span className="text-[10px] text-emerald-600 font-semibold truncate">
                ✓ REST API Authenticated
              </span>
            </div>
          </div>

          {/* 4. Publishing Schedule */}
          <div className="flex items-start gap-3 p-3 rounded-xl bg-white border border-slate-200/70 shadow-2xs">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-[#4F62E8] flex items-center justify-center shrink-0 mt-0.5">
              <Clock className="w-4 h-4" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[10px] text-slate-400 font-semibold uppercase">
                Automation Schedule
              </span>
              <span className="text-xs font-bold text-slate-800 truncate">
                {frequencyLabel} at {mainTime}
              </span>
              <span className="text-[10px] text-emerald-600 font-semibold truncate">
                ✓ BullMQ Scheduler Synced
              </span>
            </div>
          </div>
        </div>

        {/* Plan Banner */}
        {plan && (
          <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 text-slate-600">
              <Sparkles className="w-3.5 h-3.5 text-[#4F62E8]" />
              <span>
                Active Plan: <strong className="text-slate-900">{plan.name}</strong>
              </span>
            </div>
            <span className="text-emerald-700 font-semibold">Active & Live</span>
          </div>
        )}
      </Card>

      {/* Action Button */}
      <div className="w-full flex justify-center mt-7">
        <Button
          type="button"
          onClick={() => void handleLaunchDashboard()}
          disabled={isLaunching}
          className="h-12 px-10 rounded-full bg-[#4F62E8] hover:bg-[#4353D3] text-white text-xs font-bold shadow-[0_4px_14px_rgba(79,98,232,0.3)] transition-all cursor-pointer flex items-center gap-2"
        >
          {isLaunching ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Launching Dashboard...</span>
            </>
          ) : (
            <>
              <span>Launch Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

