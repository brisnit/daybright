"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, Sparkles } from "lucide-react";
import type { CardDesign, CardStyle } from "@/lib/types";
import { STYLE_LABELS } from "@/data/cards";
import { allCards } from "@/lib/cards";
import { CardTile } from "@/components/cards/card-tile";
import { Chip } from "@/components/ui/controls";
import { Badge } from "@/components/ui/badges";

export function StepCard({ selectedId, saved, onSelect }: { selectedId: string; saved: CardDesign[]; onSelect: (c: CardDesign) => void }) {
  const [style, setStyle] = useState<CardStyle | "originals" | null>(null);
  const cards = allCards(saved);
  const list = cards.filter((c) =>
    style === null ? true : style === "originals" ? c.source === "studio" : c.styles.includes(style),
  );
  const hasOriginals = cards.some((c) => c.source === "studio");

  return (
    <div>
      <StepHeading kicker="Step one" title="Choose a card" sub="Every design has room inside for your own words. You can change your mind later." />
      <div className="no-scrollbar -mx-4 mt-6 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0">
        <Chip active={style === null} onClick={() => setStyle(null)} className="shrink-0">
          All
        </Chip>
        {hasOriginals && (
          <Chip active={style === "originals"} tone="lilac" onClick={() => setStyle("originals")} className="shrink-0">
            My originals
          </Chip>
        )}
        {(Object.keys(STYLE_LABELS) as CardStyle[]).map((s) => (
          <Chip key={s} active={style === s} onClick={() => setStyle(style === s ? null : s)} className="shrink-0">
            {STYLE_LABELS[s]}
          </Chip>
        ))}
      </div>
      <ul className="mt-6 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        <li>
          <Link
            href="/studio"
            className="group flex aspect-[5/7] flex-col justify-end rounded-[6%/4.3%] border-2 border-dashed border-lilac bg-lilac-soft/60 p-4 transition hover:border-lilac-deep hover:bg-lilac-soft"
          >
            <Sparkles className="mb-auto size-6 text-lilac-deep" aria-hidden />
            <span className="font-display text-xl font-semibold leading-tight tracking-tight text-ink">Create an original with AI</span>
            <span className="mt-2 inline-flex items-center gap-1 text-[13px] font-semibold text-lilac-deep">
              Open Card Studio <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden />
            </span>
          </Link>
        </li>
        {list.map((c) => (
          <li key={c.id}>
            <CardTile
              card={c}
              selected={c.id === selectedId}
              onClick={() => onSelect(c)}
              badge={c.id === selectedId ? <Badge tone="cobalt">Selected</Badge> : undefined}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}

export function StepHeading({ kicker, title, sub }: { kicker: string; title: string; sub?: React.ReactNode }) {
  return (
    <div>
      <p className="font-hand text-xl text-coral-deep">{kicker}</p>
      <h2 className="font-display text-4xl font-semibold leading-[0.98] tracking-tight text-ink sm:text-5xl">{title}</h2>
      {sub && <p className="mt-3 max-w-xl text-[16px] leading-relaxed text-ink-2">{sub}</p>}
    </div>
  );
}
