"use client";

import { DEMO_SENDS } from "@/data/demo-sends";
import { useDemo } from "@/lib/store";
import type { Send } from "@/lib/types";

/** Resolve a send by id from local state, falling back to the built-in recipient examples. */
export function useSend(id: string | null | undefined): Send | null {
  const send = useDemo((s) => (id ? s.sends.find((x) => x.id === id) : undefined));
  if (!id) return null;
  return send ?? DEMO_SENDS[id] ?? null;
}
