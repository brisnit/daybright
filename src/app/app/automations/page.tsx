import type { Metadata } from "next";
import { Suspense } from "react";
import { AutomationsPage } from "@/components/workspace/automations-page";

export const metadata: Metadata = { title: "Birthday automation" };

export default function Page() {
  return (
    <Suspense fallback={null}>
      <AutomationsPage />
    </Suspense>
  );
}
