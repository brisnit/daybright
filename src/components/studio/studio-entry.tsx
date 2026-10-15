"use client";

import { useSearchParams } from "next/navigation";
import { useDemo } from "@/lib/store";
import { getCard } from "@/lib/cards";
import { CardStudio } from "./card-studio";

/**
 * Reads `?prompt=` (auto-generates) and `?card=<saved studio card id>` (opens it in the editor).
 * Must be rendered inside <Suspense> and after local state has hydrated.
 */
export function StudioEntry({ mode }: { mode: "consumer" | "business" }) {
  const params = useSearchParams();
  const savedCards = useDemo((s) => s.savedCards);
  const prompt = params.get("prompt");
  const cardId = params.get("card");
  const card = cardId ? getCard(cardId, savedCards) : null;
  const initialCard = card && card.id === cardId && card.source === "studio" ? card : null;
  return <CardStudio key={`${prompt ?? ""}|${initialCard?.id ?? ""}`} mode={mode} initialPrompt={prompt} initialCard={initialCard} />;
}
