import type { Metadata } from "next";
import { Suspense } from "react";
import { HydrationGate } from "@/components/hydration-gate";
import { FlowSkeleton, SendFlow } from "@/components/send/send-flow";

export const metadata: Metadata = {
  title: "Send a card",
  description: "Choose a card, write your message, add an optional gift and pick when it arrives.",
};

export default function SendPage() {
  return (
    <Suspense fallback={<FlowSkeleton />}>
      <HydrationGate fallback={<FlowSkeleton />}>
        <SendFlow />
      </HydrationGate>
    </Suspense>
  );
}
