import type { Metadata } from "next";
import { Suspense } from "react";
import { ActivityPage } from "@/components/workspace/activity-page";

export const metadata: Metadata = { title: "Activity" };

export default function Page() {
  return (
    <Suspense fallback={null}>
      <ActivityPage />
    </Suspense>
  );
}
