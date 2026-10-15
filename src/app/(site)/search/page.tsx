import type { Metadata } from "next";
import { Suspense } from "react";
import { SearchClient } from "@/components/search/search-client";

export const metadata: Metadata = {
  title: "Search cards & gifts",
  description: "Describe what you're looking for in plain words and get cards, gifts and pairings with clear totals.",
};

export default function SearchPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-24 pt-10 sm:px-6 sm:pt-14 lg:px-10">
      <p className="text-[12px] font-bold uppercase tracking-[0.16em] text-coral-deep">Search cards & gifts</p>
      <h1 className="mt-3 max-w-3xl font-display text-[40px] font-semibold leading-[0.98] tracking-tight sm:text-6xl">
        Tell us who it’s for. <span className="font-display-wonk italic text-cobalt">We’ll find the fit.</span>
      </h1>
      <div className="mt-8">
        <Suspense fallback={<div className="h-20 rounded-[2rem] skeleton" />}>
          <SearchClient />
        </Suspense>
      </div>
    </div>
  );
}
