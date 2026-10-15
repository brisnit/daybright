"use client";

import Link from "next/link";
import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Check, ChevronRight, RotateCcw, Sparkles, Wand2 } from "lucide-react";
import type { CardDesign } from "@/lib/types";
import { CARDS, CARD_MAP, COLOR_SWATCHES, RECIPIENT_LABELS, STYLE_LABELS } from "@/data/cards";
import { STUDIO_EXAMPLES } from "@/lib/cards";
import { CONSUMER, money } from "@/config/brand";
import { CardFront, CardInside } from "@/components/cards/card-art";
import { CardTile } from "@/components/cards/card-tile";
import { Tilt } from "@/components/cards/tilt";
import { ButtonLink } from "@/components/ui/button";
import { Badge } from "@/components/ui/badges";
import { Segmented } from "@/components/ui/controls";

const SAMPLE_MESSAGE =
  "Your words go here, in your own handwriting style.\n\nWrite it yourself, or give the message assistant a few notes and pick from three drafts.";

function findCard(id: string): CardDesign {
  return CARD_MAP[id] ?? STUDIO_EXAMPLES.find((c) => c.id === id) ?? CARDS[0];
}

function moreLike(card: CardDesign) {
  return CARDS.filter((c) => c.id !== card.id)
    .map((c) => ({
      c,
      score:
        c.styles.filter((s) => card.styles.includes(s)).length * 2 +
        c.recipients.filter((r) => card.recipients.includes(r)).length +
        (c.color === card.color ? 1.5 : 0) +
        (c.animated === card.animated ? 0.5 : 0),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 4)
    .map((x) => x.c);
}

export function CardDetail({ id }: { id: string }) {
  const card = findCard(id);
  const reduce = useReducedMotion();
  const [side, setSide] = useState<"front" | "inside">("front");
  const flipped = side === "inside";
  const isOriginal = card.source === "studio";
  const remixPrompt = `A birthday card in the spirit of “${card.name}”: ${card.description.replace(/\.$/, "")}. Make it my own.`;

  return (
    <div className="mx-auto w-full max-w-7xl px-4 pb-24 pt-6 sm:px-6 sm:pt-10">
      <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-[13px] text-ink-3">
        <Link href="/cards" className="font-semibold hover:text-ink">
          Cards
        </Link>
        <ChevronRight className="size-3.5" aria-hidden />
        <span className="truncate text-ink-2" aria-current="page">
          {card.name}
        </span>
      </nav>

      <div className="mt-6 grid gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:gap-16">
        {/* Stage */}
        <div>
          <div
            className="relative grid place-items-center overflow-hidden rounded-[2rem] px-6 py-10 sm:py-14"
            style={{ background: `color-mix(in srgb, ${card.palette.bg} 55%, #FFF9F0)` }}
          >
            <div aria-hidden className="dotted-bg pointer-events-none absolute inset-0 opacity-60" />
            <div aria-hidden className="pointer-events-none absolute -bottom-16 -left-10 size-56 rounded-full opacity-40" style={{ background: card.palette.a }} />
            <div className="relative w-[min(78%,360px)]">
              <Tilt max={7} className="group">
                <motion.div
                  className="relative [transform-style:preserve-3d]"
                  animate={reduce ? undefined : { rotateY: flipped ? 180 : 0 }}
                  transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                >
                  <div
                    className="[backface-visibility:hidden]"
                    style={reduce ? { opacity: flipped ? 0 : 1, transition: "opacity .2s" } : undefined}
                    aria-hidden={flipped}
                  >
                    <CardFront card={card} live />
                  </div>
                  <div
                    className="absolute inset-0 [backface-visibility:hidden]"
                    style={reduce ? { opacity: flipped ? 1 : 0, transition: "opacity .2s" } : { transform: "rotateY(180deg)" }}
                    aria-hidden={!flipped}
                  >
                    <CardInside message={SAMPLE_MESSAGE} font="handwritten" accent={card.palette.a} recipientName="Someone wonderful" />
                  </div>
                </motion.div>
              </Tilt>
            </div>
            <div className="relative mt-8 flex items-center gap-3">
              <Segmented
                ariaLabel="Preview side"
                value={side}
                onChange={setSide}
                options={[
                  { value: "front", label: "Front" },
                  { value: "inside", label: "Inside" },
                ]}
                className="bg-white/70 backdrop-blur"
              />
              <button
                type="button"
                onClick={() => setSide(flipped ? "front" : "inside")}
                className="inline-flex h-9 items-center gap-1.5 rounded-full px-3 text-[13px] font-semibold text-ink-2 hover:bg-white/60 hover:text-ink"
              >
                <RotateCcw className="size-3.5" aria-hidden /> Flip
              </button>
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="flex flex-col">
          <div className="flex flex-wrap gap-2">
            {isOriginal && (
              <Badge tone="lilac">
                <Sparkles className="size-3" aria-hidden /> Original from Card Studio
              </Badge>
            )}
            {card.animated && <Badge tone="butter">Animated</Badge>}
            <Badge tone="neutral">
              <span className="size-2.5 rounded-full ring-1 ring-black/10" style={{ background: COLOR_SWATCHES[card.color].hex }} aria-hidden />
              {COLOR_SWATCHES[card.color].label}
            </Badge>
          </div>
          <h1 className="mt-4 font-display text-5xl font-semibold leading-[0.95] tracking-tight text-ink sm:text-6xl">{card.name}</h1>
          <p className="mt-3 font-hand text-2xl text-coral-deep">{card.tagline}</p>
          <p className="mt-5 max-w-lg text-[17px] leading-relaxed text-ink-2">{card.description}</p>

          <dl className="mt-7 grid grid-cols-2 gap-5 border-y border-line py-5 text-[14px]">
            <div>
              <dt className="text-[11px] font-bold uppercase tracking-[0.16em] text-ink-3">Style</dt>
              <dd className="mt-1.5 flex flex-wrap gap-1.5">
                {card.styles.map((s) => (
                  <Link key={s} href="/cards" className="rounded-full bg-white px-2.5 py-0.5 font-semibold text-ink ring-1 ring-inset ring-line-2">
                    {STYLE_LABELS[s]}
                  </Link>
                ))}
              </dd>
            </div>
            <div>
              <dt className="text-[11px] font-bold uppercase tracking-[0.16em] text-ink-3">Lovely for</dt>
              <dd className="mt-1.5 font-medium text-ink">{card.recipients.map((r) => RECIPIENT_LABELS[r]).join(", ")}</dd>
            </div>
            <div className="col-span-2">
              <dt className="text-[11px] font-bold uppercase tracking-[0.16em] text-ink-3">What you can add</dt>
              <dd className="mt-2 grid gap-1.5 text-ink-2 sm:grid-cols-2">
                {[
                  "Your own message, in four lettering styles",
                  "Optional gift card or curated gift",
                  "Group signatures and photo memories",
                  card.animated ? "Animated reveal when they open it" : "Recorded greeting (simulated)",
                ].map((t) => (
                  <span key={t} className="flex items-start gap-2">
                    <Check className="mt-0.5 size-4 shrink-0 text-mint-deep" aria-hidden />
                    {t}
                  </span>
                ))}
              </dd>
            </div>
          </dl>

          <div className="mt-6 rounded-3xl bg-white p-5 ring-1 ring-line sm:p-6">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="flex items-baseline gap-2">
                  <span className="font-grotesk text-4xl font-bold tracking-tight text-ink">{money(CONSUMER.digitalCardPrice)}</span>
                  <span className="text-[14px] font-semibold text-ink-2">one-time</span>
                </p>
                <p className="mt-1 text-[13px] text-ink-3">Provisional demo pricing. Gifts are optional and priced separately.</p>
              </div>
              <Link href="/pricing" className="rounded-full bg-mint-soft px-3 py-1 text-[12px] font-semibold text-mint-deep hover:underline">
                Included with business plans
              </Link>
            </div>
            <div className="mt-5 flex flex-col gap-2.5 sm:flex-row">
              <ButtonLink
                href={`/send?card=${encodeURIComponent(card.id)}`}
                size="lg"
                className="flex-1"
                iconRight={<ArrowRight className="size-4" aria-hidden />}
              >
                Personalize this card
              </ButtonLink>
              <ButtonLink href={`/studio?prompt=${encodeURIComponent(remixPrompt)}`} variant="outline" size="lg" icon={<Wand2 className="size-4" aria-hidden />}>
                Remix in Card Studio
              </ButtonLink>
            </div>
          </div>
        </div>
      </div>

      <section aria-labelledby="more-like" className="mt-20">
        <div className="flex items-end justify-between gap-4">
          <h2 id="more-like" className="font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
            More like this
          </h2>
          <Link href="/cards" className="text-[14px] font-semibold text-cobalt hover:underline">
            See all cards
          </Link>
        </div>
        <ul className="mt-6 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-4 sm:gap-x-6">
          {moreLike(card).map((c) => (
            <li key={c.id}>
              <CardTile card={c} href={`/cards/${c.id}`} />
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
