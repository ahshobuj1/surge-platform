"use client";

import Onboarding from "@/app/(WithCommonLayout)/onboarding/page";

export default function OnboardingPage() {
  return (
    <Onboarding
      onComplete={() => {
        // e.g. router.push("/dashboard")
        console.log("Onboarding complete!");
      }}
    />
  );
}
