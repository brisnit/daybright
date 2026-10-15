import type { Metadata } from "next";
import { Suspense } from "react";
import { OnboardingFlow } from "@/components/onboarding/onboarding-flow";

export const metadata: Metadata = {
  title: "Set up your workspace",
  description: "Choose a plan, add your brand and voice, and set birthday cards to send themselves.",
};

export default function OnboardingPage() {
  return (
    <Suspense fallback={<div className="min-h-[80svh]" aria-busy="true" />}>
      <OnboardingFlow />
    </Suspense>
  );
}
