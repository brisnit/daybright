"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Search, Sparkles } from "lucide-react";
import { CONSUMER, PRICING_COPY, STARTING_PRICE, money } from "@/config/brand";
import { CARD_MAP } from "@/data/cards";
import { GIFT_MAP } from "@/data/gifts";
import { CardFront } from "@/components/cards/card-art";
import { Envelope, type EnvelopeStage } from "@/components/cards/envelope";
import { GiftArt } from "@/components/gifts/gift-art";
import { ButtonLink } from "@/components/ui/button";
import { Container, Squiggle } from "./primitives";

export function HomeHero() {
  return (
    <section className="relative overflow-hidden">
      {/* soft paper shapes */}
      <div aria-hidden className="pointer-events-none absolute -right-40 -top-40 size-[640px] rounded-full bg-butter-soft/80 blur-0" />
      <div aria-hidden className="pointer-events-none absolute -left-24 bottom-10 size-56 rounded-full bg-lilac-soft" />
      <Container className="relative grid items-center gap-10 pb-16 pt-8 sm:pt-12 lg:grid-cols-[1.08fr_1fr] lg:gap-6 lg:pb-24 lg:pt-14">
        <div className="relative z-10 max-w-2xl">
          <p className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-[13px] font-semibold text-ink-2 shadow-soft ring-1 ring-line">
            <Sparkles className="size-3.5 text-lilac-deep" aria-hidden />
            Original cards, made with AI. Sent on the day.
          </p>
          <h1 className="mt-6 font-display text-[3.25rem] font-semibold leading-[0.95] tracking-tight text-ink sm:text-7xl lg:text-[5.4rem]">
            Their birthday.
            <span className="mt-2 block text-cobalt">
              Something only{" "}
              <span className="relative inline-block whitespace-nowrap italic text-coral-deep [font-variation-settings:'SOFT'_100,'WONK'_1]">
                you
                <Squiggle className="absolute -bottom-1.5 left-0 h-3 w-full sm:-bottom-2 sm:h-4" />
              </span>{" "}
              would send.
            </span>
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink-2 sm:text-xl">
            Create an original card, find a thoughtful gift, and make someone&rsquo;s day. For one person or every customer you serve.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <ButtonLink href="/studio" size="lg" icon={<Sparkles className="size-4" aria-hidden />}>
              Create a card with AI
            </ButtonLink>
            <ButtonLink href="/business" size="lg" variant="outline" iconRight={<ArrowRight className="size-4" aria-hidden />}>
              Explore business plans
            </ButtonLink>
          </div>
          <HeroSearch />
          <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-2 text-[14px] text-ink-2">
            <Link href="/pricing" className="group inline-flex items-center gap-2 font-semibold text-ink">
              <span className="rounded-full bg-mint-soft px-2.5 py-0.5 font-grotesk text-[13px] font-bold text-mint-deep">
                Business plans from {money(STARTING_PRICE)}/month
              </span>
              <span className="underline decoration-line-2 underline-offset-4 group-hover:decoration-ink">Digital cards included</span>
            </Link>
            <span className="text-ink-3">Gifts are optional extras · One-time cards from {money(CONSUMER.digitalCardPrice)}</span>
          </div>
          <p className="sr-only">{PRICING_COPY.includes}</p>
        </div>
        <HeroComposition />
      </Container>
    </section>
  );
}

function HeroSearch() {
  const router = useRouter();
  const [q, setQ] = useState("");
  return (
    <form
      role="search"
      className="mt-6 flex max-w-xl items-center gap-2 rounded-full bg-white p-1.5 pl-4 shadow-soft ring-1 ring-line-2 focus-within:ring-2 focus-within:ring-cobalt"
      onSubmit={(e) => {
        e.preventDefault();
        const query = q.trim();
        router.push(query ? `/search?q=${encodeURIComponent(query)}` : "/search");
      }}
    >
      <Search className="size-4 shrink-0 text-ink-3" aria-hidden />
      <label htmlFor="hero-search" className="sr-only">
        Search cards &amp; gifts
      </label>
      <input
        id="hero-search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search cards & gifts: “a gardening gift under $40”"
        className="h-10 min-w-0 flex-1 bg-transparent text-[15px] text-ink placeholder:text-ink-3 focus:outline-none"
      />
      <button
        type="submit"
        className="h-10 shrink-0 rounded-full bg-ink px-4 text-sm font-semibold text-paper transition hover:bg-ink-2"
      >
        Search
      </button>
    </form>
  );
}

/** Envelope opens on load, card rises out, two cards fan behind it. */
export function HeroComposition() {
  const reduce = useReducedMotion();
  const [animStage, setStage] = useState<EnvelopeStage>("closed");
  const [animFan, setFan] = useState(false);
  const stage: EnvelopeStage = reduce ? "out" : animStage;
  const fan = reduce || animFan;

  useEffect(() => {
    if (reduce) return;
    const t1 = setTimeout(() => setStage("open"), 650);
    const t2 = setTimeout(() => setStage("out"), 1500);
    const t3 = setTimeout(() => setFan(true), 2100);
    return () => [t1, t2, t3].forEach(clearTimeout);
  }, [reduce]);

  const main = CARD_MAP["garden-arch"];
  const left = CARD_MAP["big-type"];
  const right = CARD_MAP["confetti-parade"];
  const coffee = GIFT_MAP["coffee-card"];
  const ease = [0.22, 1, 0.36, 1] as const;

  return (
    <div className="relative mx-auto w-full max-w-[460px] select-none lg:max-w-[500px]" aria-label="A birthday card rising out of an opened envelope" role="img">
      {/* pt reserves room above the envelope for the rising card (padding % is relative to width) */}
      <div className="relative pt-[86%]">
        {/* fanned cards behind */}
        <div className="absolute inset-x-0 top-[4%] z-0 h-[80%]" aria-hidden>
          <motion.div
            className="absolute left-[22%] top-[12%] w-[44%]"
            initial={false}
            animate={fan ? { x: "-52%", y: "6%", rotate: -14, opacity: 1 } : { x: "0%", y: "40%", rotate: 0, opacity: 0 }}
            transition={{ duration: reduce ? 0 : 0.9, ease }}
          >
            <CardFront card={left} />
          </motion.div>
          <motion.div
            className="absolute right-[22%] top-[12%] w-[44%]"
            initial={false}
            animate={fan ? { x: "52%", y: "10%", rotate: 13, opacity: 1 } : { x: "0%", y: "40%", rotate: 0, opacity: 0 }}
            transition={{ duration: reduce ? 0 : 0.9, delay: reduce ? 0 : 0.08, ease }}
          >
            <CardFront card={right} live />
          </motion.div>
        </div>

        <div className="relative z-10">
          <Envelope
            stage={stage}
            color="#FF6B57"
            liner="#FFD45C"
            label={
              <span className="block leading-tight">
                <span className="block font-hand text-[clamp(18px,4.6vw,26px)] text-ink">for Rosa</span>
                <span className="block text-[clamp(8px,1.8vw,10px)] font-semibold uppercase tracking-[0.2em] text-ink-3">opens on her birthday</span>
              </span>
            }
          >
            <CardFront card={main} headline={"Wishing you a\nyear in full bloom"} live />
          </Envelope>
        </div>

        {/* optional gift tag */}
        <motion.div
          className="absolute -bottom-6 -left-2 z-20 w-[38%] sm:-left-8"
          initial={false}
          animate={fan ? { opacity: 1, y: 0, rotate: -6 } : { opacity: 0, y: 16, rotate: 0 }}
          transition={{ duration: reduce ? 0 : 0.6, delay: reduce ? 0 : 0.25, ease }}
        >
          <div className="rounded-2xl bg-white p-2 shadow-lift ring-1 ring-line">
            <GiftArt gift={coffee} amount={25} className="rounded-xl" />
            <p className="px-1 pb-0.5 pt-1.5 text-[11px] font-semibold leading-tight text-ink sm:text-xs">
              Optional gift
              <span className="block font-normal text-ink-3">or just the card</span>
            </p>
          </div>
        </motion.div>

        {/* handwritten note */}
        <motion.p
          className="absolute -right-1 bottom-[30%] z-20 hidden rotate-[8deg] font-hand text-2xl leading-none text-cobalt-deep sm:block"
          initial={false}
          animate={fan ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: reduce ? 0 : 0.6, delay: reduce ? 0 : 0.5 }}
          aria-hidden
        >
          she loves
          <br />
          her garden
        </motion.p>
      </div>
    </div>
  );
}
