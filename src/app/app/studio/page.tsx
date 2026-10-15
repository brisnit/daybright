import type { Metadata } from "next";
import { Suspense } from "react";
import { AppPage, PageHeader } from "@/components/app/app-shell";
import { StudioEntry } from "@/components/studio/studio-entry";
import { StudioFallback } from "@/components/studio/studio-hero";
import { AIDemoLabel } from "@/components/ui/badges";
import { ButtonLink } from "@/components/ui/button";

export const metadata: Metadata = { title: "Card Studio" };

// The workspace renders behind a HydrationGate (local demo state), so there is nothing to validate at prerender.

export default function WorkspaceStudioPage() {
  return (
    <AppPage>
      <PageHeader
        eyebrow={<span className="inline-flex items-center gap-2">Card Studio <AIDemoLabel /></span>}
        title="Design an original card for your customers"
        description="Describe it in a sentence. Compare three concepts, refine one, then approve it once to use in your birthday automations."
        actions={
          <ButtonLink href="/app/cards" variant="outline" size="sm">
            Card library
          </ButtonLink>
        }
      />
      <div className="mt-8">
        <Suspense fallback={<StudioFallback />}>
          <StudioEntry mode="business" />
        </Suspense>
      </div>
    </AppPage>
  );
}
