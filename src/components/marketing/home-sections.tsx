"use client";

import Link from "next/link";
import { clsx } from "clsx";
import { ArrowRight, ArrowUpRight, Check, Upload, Wand2, CalendarHeart } from "lucide-react";
import { PRICING_COPY, STARTING_PRICE, money } from "@/config/brand";
import { CARD_MAP } from "@/data/cards";
import { GIFT_MAP, giftPrice } from "@/data/gifts";
import { getCard } from "@/lib/cards";
import { CardFront } from "@/components/cards/card-art";
import { CardTile } from "@/components/cards/card-tile";
import { GiftArt } from "@/components/gifts/gift-art";
import { ButtonLink } from "@/components/ui/button";
import { BIZ, BIZ_VOICE, VOICE_EXAMPLES } from "./business-samples";
import { Container, Display, Eyebrow, Reveal, Squiggle } from "./primitives";
import { PlanCards } from "./plans";
import { DashboardPreview } from "./dashboard-preview";

/* ------------------------------------------------------------------ */
/* Shoppable cards                                                     */
/* ------------------------------------------------------------------ */

const SHOP_IDS = ["confetti-parade", "candle-glow", "sunburst", "layer-cake", "midnight-sparkler"];

export function ShopCards() {
  const cards = SHOP_IDS.map((id) => CARD_MAP[id]).filter(Boolean);
  return (
    <section aria-labelledby="shop-title" className="border-y border-line bg-cream/60 py-20 sm:py-24">
      <Container>
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <Reveal className="max-w-2xl">
            <Eyebrow tone="coral">The card shop</Eyebrow>
            <Display id="shop-title" className="mt-4 text-4xl leading-[1] text-ink sm:text-6xl">
              Cards for every kind of birthday person.
            </Display>
            <p className="mt-4 text-lg text-ink-2">
              Original artwork in playful, elegant, minimal, bold and heartfelt styles. Some even move a little.
            </p>
          </Reveal>
          <div className="flex shrink-0 flex-wrap gap-2">
            <ButtonLink href="/cards" variant="ink" iconRight={<ArrowRight className="size-4" aria-hidden />}>
              See all cards
            </ButtonLink>
            <ButtonLink href="/studio" variant="outline">
              Design your own
            </ButtonLink>
          </div>
        </div>
        <ul className="no-scrollbar -mx-4 mt-12 flex snap-x snap-mandatory scroll-px-4 gap-5 overflow-x-auto px-4 pb-6 pt-4 sm:mx-0 sm:grid sm:grid-cols-3 sm:overflow-visible sm:px-0 lg:grid-cols-5">
          {cards.map((card, i) => (
            <Reveal
              as="li"
              key={card.id}
              delay={i * 0.05}
              className={clsx("w-[62%] shrink-0 snap-start sm:w-auto", i % 2 === 1 && "lg:translate-y-8", i >= 3 && "sm:hidden lg:block")}
            >
              <CardTile card={card} href={`/cards/${card.id}`} />
            </Reveal>
          ))}
        </ul>
      </Container>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Gifts                                                               */
/* ------------------------------------------------------------------ */

const GIFT_SHOWCASE = [
  { id: "coffee-card", label: "Gift cards", amount: 25 },
  { id: "snack-basket", label: "Baskets" },
  { id: "chocolate", label: "Treats" },
  { id: "flowers", label: "Flowers" },
];

export function GiftsSection() {
  return (
    <section aria-labelledby="gifts-title" className="py-20 sm:py-28">
      <Container className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <Reveal>
          <Eyebrow tone="mint">Gifts, optional</Eyebrow>
          <Display id="gifts-title" className="mt-4 text-4xl leading-[1] text-ink sm:text-6xl">
            Add a little something.
            <span className="block italic text-mint-deep">Or don&rsquo;t.</span>
          </Display>
          <p className="mt-5 max-w-lg text-lg text-ink-2">
            A card on its own is complete. If you want to add a gift card, a snack basket, chocolates or flowers, you&rsquo;ll see
            the price and any shipping before anything is ordered.
          </p>
          <ul className="mt-6 space-y-2 text-[15px] text-ink-2">
            {["Digital gift cards arrive inside the card", "Physical gifts can ask the recipient for their address", "Gift prices are separate from the card"].map((t) => (
              <li key={t} className="flex items-start gap-2">
                <Check className="mt-0.5 size-4 shrink-0 text-mint-deep" aria-hidden />
                {t}
              </li>
            ))}
          </ul>
          <div className="mt-8 flex flex-wrap gap-2">
            <ButtonLink href="/gifts" variant="ink">
              Browse gifts
            </ButtonLink>
            <ButtonLink href="/gifts#finder" variant="outline" iconRight={<ArrowRight className="size-4" aria-hidden />}>
              Try the Gift Finder
            </ButtonLink>
          </div>
        </Reveal>
        <div className="grid grid-cols-2 gap-4 sm:gap-6">
          {GIFT_SHOWCASE.map((g, i) => {
            const gift = GIFT_MAP[g.id];
            if (!gift) return null;
            const price = giftPrice(gift, g.amount);
            return (
              <Reveal key={g.id} delay={i * 0.06} className={clsx(i % 2 === 1 && "translate-y-8")}>
                <Link href="/gifts" className="group block rounded-3xl bg-white p-3 shadow-soft ring-1 ring-line transition hover:-translate-y-1 hover:shadow-lift">
                  <GiftArt gift={gift} amount={g.amount} />
                  <div className="px-1.5 pb-1 pt-3">
                    <p className="font-grotesk text-[12px] font-bold uppercase tracking-wide text-ink-3">{g.label}</p>
                    <p className="mt-0.5 font-semibold leading-snug text-ink">{gift.name}</p>
                    <p className="mt-1 text-[13px] text-ink-2">
                      {gift.amounts ? `From ${money(gift.amounts[0])}` : money(price)}
                      {gift.shipping ? ` + ${money(gift.shipping)} shipping` : " · no shipping"}
                    </p>
                  </div>
                </Link>
              </Reveal>
            );
          })}
        </div>
      </Container>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* One brand. Hundreds of personal moments.                            */
/* ------------------------------------------------------------------ */

const TONE_BG = { mint: "bg-mint-soft", cobalt: "bg-cobalt-soft", lilac: "bg-lilac-soft" } as const;

export function OneBrandSection() {
  return (
    <section aria-labelledby="brand-title" className="relative overflow-hidden bg-ink py-20 text-paper sm:py-28">
      <div aria-hidden className="pointer-events-none absolute -left-32 top-20 size-80 rounded-full bg-cobalt/40 blur-3xl" />
      <Container className="relative">
        <Reveal className="max-w-3xl">
          <Eyebrow tone="paper">For business</Eyebrow>
          <Display id="brand-title" className="mt-4 text-[2.6rem] leading-[0.98] text-paper sm:text-6xl lg:text-7xl">
            One brand.
            <span className="block text-butter">Hundreds of personal moments.</span>
          </Display>
          <p className="mt-5 max-w-2xl text-lg text-paper/75">
            Three customers of {BIZ.name}, a fictional demo business. Different cards, different messages, all in the same{" "}
            {BIZ_VOICE.label.toLowerCase()} voice. Each one starts from what the team actually wrote down.
          </p>
        </Reveal>

        <div className="mt-14 grid gap-6 md:grid-cols-3 md:gap-5 lg:gap-8">
          {VOICE_EXAMPLES.map((ex, i) => {
            const card = getCard(ex.cardId);
            return (
              <Reveal key={ex.firstName} delay={i * 0.08} className={clsx(i === 1 && "md:translate-y-10")}>
                <article className="rounded-[2rem] bg-paper p-4 text-ink shadow-lift sm:p-5">
                  <div className="grid grid-cols-[42%_1fr] gap-4">
                    <div className={clsx("rotate-[-3deg]", i === 1 && "rotate-[2deg]")}>
                      <CardFront card={card} headline={ex.headline} live brandMark={{ name: BIZ.name, color: BIZ.brandColor }} />
                    </div>
                    <div className="min-w-0">
                      <p className="font-grotesk text-[12px] font-bold uppercase tracking-wide text-ink-3">For</p>
                      <p className="font-display text-3xl font-semibold tracking-tight">{ex.firstName}</p>
                      <p className={clsx("mt-2 rounded-xl px-2.5 py-2 text-[12px] leading-snug text-ink-2", TONE_BG[ex.tone])}>{ex.note}</p>
                    </div>
                  </div>
                  <p className="mt-4 border-t border-dashed border-line-2 pt-4 font-hand text-[22px] leading-[1.15] text-ink">{ex.message}</p>
                </article>
              </Reveal>
            );
          })}
        </div>

        <Reveal className="mt-16 grid gap-6 rounded-[2rem] bg-white/[0.06] p-6 ring-1 ring-white/10 sm:p-8 md:mt-24 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <p className="font-grotesk text-[12px] font-bold uppercase tracking-[0.14em] text-butter">Brand voice · {BIZ_VOICE.label}</p>
            <p className="mt-2 max-w-3xl font-display text-xl leading-snug text-paper sm:text-2xl">&ldquo;{BIZ.voice.summary}&rdquo;</p>
          </div>
          <ButtonLink href="/business" variant="white" iconRight={<ArrowRight className="size-4" aria-hidden />}>
            How personalization works
          </ButtonLink>
        </Reveal>
      </Container>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Workflow + dashboard preview                                        */
/* ------------------------------------------------------------------ */

export const WORKFLOW = [
  {
    icon: Upload,
    title: "Add customers",
    body: "Import a CSV, type a few in, or load demo customers. Birth year is optional.",
    tone: "bg-butter",
  },
  {
    icon: Wand2,
    title: "Choose a card",
    body: "Pick from the collection or make an original in Card Studio, then write one message with your name and theirs.",
    tone: "bg-coral",
  },
  {
    icon: CalendarHeart,
    title: "Set it to celebrate",
    body: "Choose a send time and timezone. Review each card first, or let it go automatically.",
    tone: "bg-mint",
  },
];

export function WorkflowAndDashboard() {
  return (
    <section aria-labelledby="workflow-title" className="py-20 sm:py-28">
      <Container>
        <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
          <Reveal>
            <Eyebrow>How it works for teams</Eyebrow>
            <Display id="workflow-title" className="mt-4 text-4xl leading-[1] text-ink sm:text-6xl">
              Set it up once.
              <span className="block">
                Remember{" "}
                <span className="relative inline-block whitespace-nowrap">
                  every year.
                  <Squiggle className="absolute -bottom-2 left-0 h-3 w-full" color="#6FD8B1" />
                </span>
              </span>
            </Display>
            <ol className="mt-10 space-y-7">
              {WORKFLOW.map((s, i) => (
                <li key={s.title} className="grid grid-cols-[auto_1fr] gap-4">
                  <span className={clsx("grid size-12 place-items-center rounded-2xl text-ink shadow-soft", s.tone)}>
                    <s.icon className="size-5" aria-hidden />
                  </span>
                  <div>
                    <p className="font-grotesk text-[12px] font-bold uppercase tracking-wide text-ink-3">Step {i + 1}</p>
                    <h3 className="font-display text-2xl font-semibold tracking-tight text-ink">{s.title}</h3>
                    <p className="mt-1 text-[15px] text-ink-2">{s.body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </Reveal>
          <Reveal delay={0.1}>
            <DashboardPreview />
          </Reveal>
        </div>
      </Container>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Pricing preview                                                     */
/* ------------------------------------------------------------------ */

export function PricingPreview() {
  return (
    <section aria-labelledby="pricing-title" className="border-y border-line bg-cream/60 py-20 sm:py-28">
      <Container>
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <Reveal className="max-w-2xl">
            <Eyebrow tone="butter">Business plans</Eyebrow>
            <Display id="pricing-title" className="mt-4 text-4xl leading-[1] text-ink sm:text-6xl">
              From {money(STARTING_PRICE)} a month. Cards included.
            </Display>
            <p className="mt-4 text-lg font-medium text-ink">{PRICING_COPY.includes}</p>
          </Reveal>
          <Link href="/pricing" className="group inline-flex items-center gap-1.5 font-semibold text-cobalt">
            Compare plans in detail
            <ArrowUpRight className="size-4 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden />
          </Link>
        </div>
        <div className="mt-12">
          <PlanCards compact />
        </div>
        <p className="mt-6 text-[13px] text-ink-3">{PRICING_COPY.provisional}</p>
      </Container>
    </section>
  );
}

