import type { Metadata } from "next";
import { Suspense } from "react";
import { GiftsWorkspacePage } from "@/components/workspace/giftsws-page";

export const metadata: Metadata = { title: "Gifts" };

export default function Page() {
  return (
    <Suspense fallback={null}>
      <GiftsWorkspacePage />
    </Suspense>
  );
}
