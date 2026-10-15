import type { Metadata } from "next";
import { Suspense } from "react";
import { CardGallery } from "./gallery-client";

export const metadata: Metadata = {
  title: "Birthday cards",
  description: "Original birthday cards for customers, colleagues, friends and family. Filter by style, recipient, format and color.",
};

export default function CardsPage() {
  // Suspense: some catalog artwork reads the current year while rendering.
  return (
    <Suspense fallback={<div className="mx-auto h-[80vh] max-w-7xl px-4" aria-busy="true" />}>
      <CardGallery />
    </Suspense>
  );
}
