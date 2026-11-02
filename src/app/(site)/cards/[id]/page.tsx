import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { CARDS, CARD_MAP } from "@/data/cards";
import { STUDIO_EXAMPLES } from "@/lib/cards";
import type { CardDesign } from "@/lib/types";
import { CardDetail } from "./card-detail-client";
import { PreviewBanner } from "@/components/site/preview-banner";

const ALL: CardDesign[] = [...CARDS, ...STUDIO_EXAMPLES];
const find = (id: string) => CARD_MAP[id] ?? STUDIO_EXAMPLES.find((c) => c.id === id) ?? null;

export function generateStaticParams() {
  return ALL.map((c) => ({ id: c.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const card = find(id);
  if (!card) return { title: "Card not found" };
  return { title: `${card.name} birthday card`, description: card.description };
}

async function Detail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const card = find(decodeURIComponent(id));
  if (!card) notFound();
  return <CardDetail id={card.id} />;
}

export default function CardPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <>
      <PreviewBanner />
      <Suspense fallback={<div className="mx-auto h-[80vh] max-w-7xl px-4" aria-busy="true" />}>
        <Detail params={params} />
      </Suspense>
    </>
  );
}
