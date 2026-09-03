"use client";

import { useState, useMemo, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { OnboardingSidebar, Step } from "@/app/component/onboarding/OnboardingSidebar";
import { Card } from "@/components/ui/card";
import { StepAddFeeds } from "@/app/component/onboarding/StepAddFeeds";
import { StepPreferences, PreferencesData } from "@/app/component/onboarding/StepPreferences";
import { StepConnectPlatforms } from "@/app/component/onboarding/StepConnectCMS";
import { StepSchedule, ScheduleData } from "@/app/component/onboarding/StepSchedule";
import { StepPaywall, PlanTier, BillingInterval, PLAN_TIERS, PlanId } from "@/app/component/onboarding/StepPaywall";
import { StepCheckout } from "@/app/component/onboarding/StepCheckout";
import { useWorkspace } from "@/lib/context/WorkspaceContext";
import { api } from "@/lib/api";
import type { ValidatedFeedInfo } from "@/app/component/onboarding/StepAddFeeds";

const STEP_LABELS = ["Add Feeds", "Preferences", "Connect Platforms", "Schedule"];

function buildSteps(currentStep: number): Step[] {
  return STEP_LABELS.map((label, i) => {
    const id = i + 1;
    let status: Step["status"] = "upcoming";
    if (id < currentStep) status = "completed";
    else if (id === currentStep) status = "active";
    return { id, label, status };
  });
}

function parseStep(param: string | null): number {
  if (!param) return 1;
  const lower = param.toLowerCase();
  if (lower === "paywall" || lower === "5") return 5;
  if (lower === "checkout" || lower === "6") return 6;
  const num = parseInt(lower, 10);
  if (num >= 1 && num <= 6) return num;
  return 1;
}

function stepToParam(stepNum: number): string {
  if (stepNum === 5) return "paywall";
  if (stepNum === 6) return "checkout";
  return String(stepNum);
}

interface OnboardingProps {
  onComplete?: () => void;
}

function OnboardingContent({ onComplete }: OnboardingProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Current step parsed from query param ?step=1|2|3|4|paywall|checkout
  const stepParam = searchParams.get("step");
  const currentStep = useMemo(() => parseStep(stepParam), [stepParam]);

  // Plan override parsed from query param ?plan=starter|pro|enterprise
  const planParam = searchParams.get("plan");
  const activePlanTier: PlanTier = useMemo(() => {
    if (planParam === "starter" || planParam === "pro" || planParam === "enterprise") {
      const match = PLAN_TIERS.find((p) => p.id === planParam);
      if (match) return match;
    }
    return PLAN_TIERS.find((p) => p.id === "pro") || PLAN_TIERS[1];
  }, [planParam]);

  // Helper to navigate steps using URL parameters with browser history support
  const navigateToStep = (newStep: number, planOverride?: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("step", stepToParam(newStep));
    if (planOverride) {
      params.set("plan", planOverride);
    }
    router.push(`/onboarding?${params.toString()}`, { scroll: false });
  };

  const { activeWorkspace, workspaces } = useWorkspace();
  const targetWorkspaceId = activeWorkspace?.id || workspaces[0]?.id;

  // Onboarding aggregated state
  const [feedUrl, setFeedUrl] = useState<string>("");
  const [feedTitle, setFeedTitle] = useState<string>("");
  const [preferences, setPreferences] = useState<PreferencesData>({
    tone: "Professional & Objective",
    audience: "",
    excluded: "",
  });
  const [connectedPlatforms, setConnectedPlatforms] = useState<string[]>(["wordpress"]);
  const [scheduleData, setScheduleData] = useState<ScheduleData | null>(null);

  // Billing Interval State
  const [billingInterval, setBillingInterval] = useState<BillingInterval>("monthly");

  // Step transitions
  const handleFeedContinue = (feedData?: ValidatedFeedInfo) => {
    if (feedData?.url) {
      setFeedUrl(feedData.url);
      if (feedData.title) setFeedTitle(feedData.title);
    }
    navigateToStep(2);
  };

  const handlePreferencesContinue = (data: PreferencesData) => {
    setPreferences(data);
    navigateToStep(3);
  };

  const handlePlatformsContinue = (platformIds: string[]) => {
    setConnectedPlatforms(platformIds);
    navigateToStep(4);
  };

  const handleScheduleComplete = (data: ScheduleData) => {
    setScheduleData(data);
    navigateToStep(5); // Go to Paywall
  };

  const handleUpgradePlanFromSchedule = (tier: PlanId) => {
    navigateToStep(5, tier); // Open paywall with tier
  };

  const handleSelectPlan = (plan: PlanTier, interval: BillingInterval) => {
    setBillingInterval(interval);
    navigateToStep(6, plan.id); // Go to Checkout
  };

  const handleBackToPlans = () => {
    navigateToStep(5);
  };

  const handleStepClick = (stepId: number) => {
    if (stepId <= 4) {
      navigateToStep(stepId);
    }
  };

  const handleFinalPaymentConfirm = async () => {
    try {
      if (targetWorkspaceId && feedUrl) {
        await api.post(`/workspaces/${targetWorkspaceId}/rss-sources`, {
          feedUrl,
          name: feedTitle || undefined,
        });
      }
    } catch (err: unknown) {
      console.warn("Could not automatically create workspace RSS feed:", err);
    }

    if (onComplete) {
      onComplete();
    } else {
      setTimeout(() => {
        router.push("/dashboard");
      }, 1200);
    }
  };

  return (
    <div className="min-h-screen w-full relative overflow-hidden flex items-center justify-center bg-gradient-to-br from-[#E6EBF5] via-[#D8E0F2] to-[#B8C4E6] p-4 sm:p-6 lg:p-8 select-none">
      {/* Subtle Ambient Glow Orbs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[350px] bg-white/45 rounded-full blur-[110px] pointer-events-none" />
      <div className="absolute -top-16 left-1/3 w-[450px] h-[450px] bg-[#9BAAF3]/25 rounded-full blur-[130px] pointer-events-none" />

      {/* Container for Steps 1 - 4: Side-by-side card with Stepper Sidebar */}
      {currentStep <= 4 && (
        <Card className="relative z-10 w-full max-w-[940px] bg-white/70 backdrop-blur-2xl rounded-[32px] shadow-[0_30px_70px_-15px_rgba(90,110,170,0.22),0_0_0_1px_rgba(255,255,255,0.8)] border border-white/80 flex flex-col md:flex-row overflow-hidden min-h-[560px] md:h-[560px] transition-all duration-300 ring-0 py-0 gap-0">
          {/* Left Sidebar with refined divider */}
          <div className="w-full md:w-60 shrink-0 h-full bg-transparent border-b md:border-b-0 md:border-r border-slate-200/60 p-8 sm:p-10 flex flex-col justify-start">
            <OnboardingSidebar
              steps={buildSteps(currentStep)}
              onStepClick={handleStepClick}
            />
          </div>

          {/* Right Content Area */}
          <div className="flex-1 h-full p-8 sm:p-10 lg:p-12 flex flex-col justify-between overflow-y-auto">
            {currentStep === 1 && (
              <StepAddFeeds
                onContinue={handleFeedContinue}
                initialUrl={feedUrl}
                workspaceId={targetWorkspaceId}
              />
            )}
            {currentStep === 2 && (
              <StepPreferences
                onContinue={handlePreferencesContinue}
                initialData={preferences}
              />
            )}
            {currentStep === 3 && (
              <StepConnectPlatforms
                onContinue={handlePlatformsContinue}
                initialConnected={connectedPlatforms}
              />
            )}
            {currentStep === 4 && (
              <StepSchedule
                onComplete={handleScheduleComplete}
                onUpgradePlan={handleUpgradePlanFromSchedule}
                planTier={activePlanTier.id}
                initialData={scheduleData || undefined}
              />
            )}
          </div>
        </Card>
      )}

      {/* Screen 5: Paywall ("Activate Your Automation") */}
      {currentStep === 5 && (
        <Card className="relative z-10 w-full max-w-5xl bg-white/75 backdrop-blur-2xl rounded-[36px] shadow-[0_30px_70px_-15px_rgba(90,110,170,0.22),0_0_0_1px_rgba(255,255,255,0.8)] border border-white/80 p-8 sm:p-12 lg:p-14 transition-all duration-300 ring-0">
          <StepPaywall
            onSelectPlan={handleSelectPlan}
            defaultPlanId={activePlanTier.id}
            defaultInterval={billingInterval}
          />
        </Card>
      )}

      {/* Screen 6: Checkout / Stripe Payment */}
      {currentStep === 6 && (
        <Card className="relative z-10 w-full max-w-3xl bg-white/70 backdrop-blur-2xl rounded-[32px] shadow-[0_30px_70px_-15px_rgba(90,110,170,0.22),0_0_0_1px_rgba(255,255,255,0.8)] border border-white/80 p-8 sm:p-10 transition-all duration-300 ring-0">
          <StepCheckout
            plan={activePlanTier}
            interval={billingInterval}
            onBack={handleBackToPlans}
            onConfirmPayment={handleFinalPaymentConfirm}
          />
        </Card>
      )}
    </div>
  );
}

export default function Onboarding(props: OnboardingProps) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-[#E6EBF5] via-[#D8E0F2] to-[#B8C4E6]">
          <div className="w-10 h-10 rounded-full border-2 border-[#1868F2] border-t-transparent animate-spin" />
        </div>
      }
    >
      <OnboardingContent {...props} />
    </Suspense>
  );
}