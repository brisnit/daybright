import type { Metadata } from "next";
import { Suspense } from "react";
import { RecipientExperience } from "@/components/recipient/recipient-experience";

export const metadata: Metadata = {
  title: "A birthday card for you",
  description: "A sample Daybright birthday card. Tap to open it.",
  robots: { index: false },
};

export default function OpenPage() {
  return (
    <Suspense fallback={<div className="min-h-[88svh]" aria-busy="true" />}>
      <RecipientExperience />
    </Suspense>
  );
}
