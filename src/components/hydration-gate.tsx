"use client";

import { useDemo } from "@/lib/store";

/**
 * Renders children only after local demo state has loaded from localStorage.
 * Use around anything that reads persisted state or the current date, so prerendering stays static
 * and visitors never see seed data flash before their own edits.
 */
export function HydrationGate({ children, fallback }: { children: React.ReactNode; fallback?: React.ReactNode }) {
  const hydrated = useDemo((s) => s.hydrated);
  if (!hydrated) return <>{fallback ?? <DefaultFallback />}</>;
  return <>{children}</>;
}

function DefaultFallback() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-10" aria-busy="true" aria-label="Loading">
      <div className="h-9 w-64 rounded-xl skeleton" />
      <div className="mt-3 h-5 w-96 max-w-full rounded-lg skeleton" />
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-32 rounded-3xl skeleton" />
        ))}
      </div>
      <div className="mt-4 h-72 rounded-3xl skeleton" />
    </div>
  );
}
