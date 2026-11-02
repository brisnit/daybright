import type { Metadata } from "next";
import { Suspense } from "react";
import { StudioEntry } from "@/components/studio/studio-entry";
import { StudioFallback, StudioHero } from "@/components/studio/studio-hero";
import { HydrationGate } from "@/components/hydration-gate";
import { PreviewBanner } from "@/components/site/preview-banner";

export const metadata: Metadata = {
  title: "Card Studio",
  description: "Describe a birthday card in a sentence and compare three original concepts. Then refine, personalize and send.",
};

export default function StudioPage() {
  return (
    <>
      <PreviewBanner />
      <div className="mx-auto w-full max-w-6xl px-4 pt-10 sm:px-6 sm:pt-14 lg:px-10">
        <StudioHero />
        <div className="mt-8 sm:mt-10">
          <Suspense fallback={<StudioFallback />}>
            <HydrationGate fallback={<StudioFallback />}>
              <StudioEntry mode="consumer" />
            </HydrationGate>
          </Suspense>
        </div>
      </div>
    </>
  );
}
