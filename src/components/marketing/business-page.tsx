"use client";

import Link from "next/link";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { clsx } from "clsx";
import { ArrowRight, ArrowUpRight, Check, CircleAlert, History, PauseCircle, Sparkles, Upload } from "lucide-react";
import { PRICING_COPY, STARTING_PRICE, money } from "@/config/brand";
import { CARD_MAP } from "@/data/cards";
import { GIFT_MAP } from "@/data/gifts";
import { getCard } from "@/lib/cards";
import { renderTemplate } from "@/lib/ai/messages";
import { GENERIC_MESSAGE, VOICE_ORDER, VOICE_PRESETS, sampleMessageForVoice } from "@/lib/ai/voice";
import type { VoicePreset } from "@/lib/types";
import { CardFront, CardInside } from "@/components/cards/card-art";
import { GiftArt } from "@/components/gifts/gift-art";
import { AIDemoLabel, Badge } from "@/components/ui/badges";
import { ButtonLink } from "@/components/ui/button";
import { Toggle } from "@/components/ui/controls";
import { BIZ, VOICE_EXAMPLES } from "./business-samples";
import { FAQS, FaqSection } from "./faq";
import { FinalCTA } from "./final-cta";
import { PlanCards } from "./plans";
import { Container, Display, Eyebrow, Reveal, Squiggle } from "./primitives";

const brandMark = { name: BIZ.name, color: BIZ.brandColor };

export function BusinessPage() {
  return (
    <>
      <BizHero />
      <HowItWorks />
      <PersonalizationPreview />
      <BrandVoiceSection />
      <PlannerAndFreshness />
      <BudgetAndRecipient />
      <section aria-labelledby="biz-pricing" className="border-y border-line bg-cream/60 py-20 sm:py-24">
        <Container>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <Reveal className="max-w-2xl">
              <Eyebrow tone="butter">Plans</Eyebrow>
              <Display id="biz-pricing" className="mt-4 text-4xl leading-[1] text-ink sm:text-6xl">
                Pick a size. Change it any time.
              </Display>
              <p className="mt-4 text-lg font-medium text-ink">{PRICING_COPY.includes}</p>
            </Reveal>
            <Link href="/pricing" className="group inline-flex items-center gap-1.5 font-semibold text-cobalt">
              Full pricing and comparison
              <ArrowUpRight className="size-4" aria-hidden />
            </Link>
          </div>
          <div className="mt-12">
            <PlanCards compact />
          </div>
          <p className="mt-6 text-[13px] text-ink-3">{PRICING_COPY.provisional}</p>
        </Container>
      </section>
      <FaqSection
        title="Before you set it up."
        items={["review", "giftsCost", "address", "birthYear", "feb29", "lateAdd", "ai"].map((k) => FAQS[k])}
      />
      <FinalCTA
        title="Your first birthday automation takes a few minutes."
        body="Set up your brand, add customers and choose a card in a guided demo. Or look around a populated workspace first."
        primary={{ href: "/onboarding", label: "Start setup" }}
        secondary={{ href: "/app", label: "Explore business demo" }}
      />
    </>
  );
}

/* ------------------------------------------------------------------ */

function BizHero() {
  const [a, b, c] = VOICE_EXAMPLES;
  return (
    <section className="relative overflow-hidden">
      <div aria-hidden className="pointer-events-none absolute -right-48 top-10 size-[560px] rounded-full bg-mint-soft" />
      <Container className="relative grid items-center gap-12 pb-20 pt-10 sm:pt-14 lg:grid-cols-[1.1fr_0.9fr] lg:pb-28">
        <div>
          <Eyebrow tone="mint">For business</Eyebrow>
          <h1 className="mt-5 font-display text-[3rem] font-semibold leading-[0.95] tracking-tight text-ink sm:text-7xl lg:text-[5.2rem]">
            Make every customer feel{" "}
            <span className="relative inline-block italic text-mint-deep">
              remembered.
              <Squiggle className="absolute -bottom-2 left-0 h-3 w-full sm:h-4" color="#FFD45C" />
            </span>
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink-2 sm:text-xl">
            Add your customers once. Every birthday gets a card in your brand and your voice, personalized from the notes your team
            already keeps. Gifts only when you want them, and only within your budget.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <ButtonLink href="/onboarding" size="lg" iconRight={<ArrowRight className="size-4" aria-hidden />}>
              Start setup
            </ButtonLink>
            <ButtonLink href="/app" size="lg" variant="ink">
              Explore business demo
            </ButtonLink>
          </div>
          <p className="mt-6 text-[14px] text-ink-2">
            <span className="font-semibold text-ink">Plans from {money(STARTING_PRICE)}/month.</span> {PRICING_COPY.includes}
          </p>
        </div>
        <div className="relative mx-auto h-[420px] w-full max-w-[460px] sm:h-[480px]" aria-hidden>
          {[a, b, c].map((ex, i) => (
            <motion.div
              key={ex.firstName}
              className="absolute w-[46%]"
              style={{ left: ["2%", "27%", "52%"][i], top: ["14%", "0%", "18%"][i], zIndex: i === 1 ? 3 : 2 - i }}
              initial={{ opacity: 0, y: 30, rotate: 0 }}
              animate={{ opacity: 1, y: 0, rotate: [-8, 1, 9][i] }}
              transition={{ duration: 0.8, delay: 0.15 + i * 0.12, ease: [0.22, 1, 0.36, 1] }}
            >
              <CardFront card={getCard(ex.cardId)} live brandMark={brandMark} />
            </motion.div>
          ))}
          <motion.div
            className="absolute bottom-0 left-1/2 z-10 w-[86%] -translate-x-1/2 rounded-2xl bg-white p-4 shadow-lift ring-1 ring-line"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
          >
            <p className="flex items-center gap-2 text-[12px] font-semibold text-mint-deep">
              <span className="size-2 rounded-full bg-mint-deep" /> Birthday automation on
            </p>
            <p className="mt-1 text-[14px] leading-snug text-ink">
              Send every customer a birthday card at 9:00 AM. Review before sending.
            </p>
          </motion.div>
        </div>
      </Container>
    </section>
  );
}

/* ------------------------------------------------------------------ */

function HowItWorks() {
  const coffee = GIFT_MAP["coffee-card"];
  const steps = [
    {
      title: "Bring in your customers",
      body: "Import a CSV with column mapping, add people by hand, or load demo customers. Month and day are all you need; birth year is optional. Missing emails, invalid dates and duplicates are flagged before anything is saved.",
      visual: (
        <div className="space-y-2">
          {[
            { n: "Rosa Delgado", d: "Oct 18", t: "VIP" },
            { n: "Marcus Bell", d: "Oct 20", t: "Referral partner" },
            { n: "Chloe Martin", d: "Nov 4", t: "Needs email", warn: true },
          ].map((r) => (
            <div key={r.n} className="flex items-center gap-3 rounded-xl bg-white px-3 py-2 ring-1 ring-line">
              <span className="grid size-7 place-items-center rounded-full bg-butter-soft text-[11px] font-bold text-butter-deep">
                {r.n.split(" ").map((x) => x[0]).join("")}
              </span>
              <span className="flex-1 text-[13px] font-semibold text-ink">{r.n}</span>
              <span className="text-[12px] text-ink-3">{r.d}</span>
              <Badge tone={r.warn ? "coral" : "neutral"}>{r.t}</Badge>
            </div>
          ))}
          <p className="flex items-center gap-1.5 pt-1 text-[12px] text-ink-3">
            <Upload className="size-3.5" aria-hidden /> customers.csv · 3 rows ready, 1 to fix
          </p>
        </div>
      ),
      tone: "bg-butter-soft",
    },
    {
      title: "Choose a card and a message",
      body: "Start from the collection or create an original in Card Studio. Original designs are approved once, then reused. Write one message with First name, Company name and Sender name, and see it rendered for a real customer as you type.",
      visual: (
        <div>
          <div className="grid grid-cols-3 gap-3">
            {["garden-arch", "candle-glow", "citrus-toast"].map((id, i) => (
              <div key={id} className={clsx(i === 0 && "rounded-[8%] ring-4 ring-cobalt ring-offset-2 ring-offset-coral-soft")}>
                <CardFront card={CARD_MAP[id]} />
              </div>
            ))}
          </div>
          <p className="mt-4 rounded-xl bg-white px-3 py-2 font-mono text-[12px] leading-relaxed text-ink-2 ring-1 ring-line">
            Happy birthday, <span className="rounded bg-cobalt-soft px-1 text-cobalt-deep">{"{{first_name}}"}</span>! &hellip;
          </p>
        </div>
      ),
      tone: "bg-coral-soft",
    },
    {
      title: "Set the automation",
      body: "Pick who it applies to, the send time and timezone, and whether to send automatically or wait for review. Gifts stay off unless you turn them on. Pause, skip one birthday, or edit an upcoming send whenever you like.",
      visual: (
        <div className="space-y-2 rounded-2xl bg-white p-4 ring-1 ring-line">
          <p className="text-[13px] leading-snug text-ink">
            Send every customer a birthday card at <b>9:00 AM</b> in the selected timezone. Include a <b>{money(15)} gift card</b>{" "}
            for VIP customers, subject to approval and the monthly gift budget.
          </p>
          <div className="flex flex-wrap gap-2 pt-1">
            <Badge tone="mint" dot>Active</Badge>
            <Badge tone="neutral">Review before sending</Badge>
            <Badge tone="neutral">Feb 29 → Feb 28</Badge>
          </div>
          <p className="flex items-center gap-1.5 pt-1 text-[12px] text-ink-3">
            <PauseCircle className="size-3.5" aria-hidden /> Pause any time
          </p>
        </div>
      ),
      tone: "bg-mint-soft",
    },
    {
      title: "Review cards, approve gifts",
      body: "A few days ahead, upcoming birthdays appear for review. Edit a message, regenerate a suggestion, or approve a batch. Gifts are never bought without an approval.",
      visual: (
        <div className="flex items-center gap-4 rounded-2xl bg-white p-4 ring-1 ring-line">
          <div className="w-20 shrink-0">
            <GiftArt gift={coffee} amount={15} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[13px] font-semibold text-ink">
              {money(15)} {coffee.name.toLowerCase()} for Marcus
            </p>
            <Badge tone="butter" className="mt-1">Gift needs approval</Badge>
            <div className="mt-2 flex flex-wrap gap-2">
              <span className="rounded-full bg-ink px-3 py-1 text-[12px] font-semibold text-paper">Approve gift</span>
              <span className="rounded-full px-3 py-1 text-[12px] font-semibold text-ink ring-1 ring-line-2">Card only</span>
            </div>
          </div>
        </div>
      ),
      tone: "bg-lilac-soft",
    },
  ];
  return (
    <section aria-labelledby="how-title" className="py-20 sm:py-28">
      <Container>
        <Reveal className="max-w-3xl">
          <Eyebrow>How it works</Eyebrow>
          <Display id="how-title" className="mt-4 text-4xl leading-[1] text-ink sm:text-6xl">
            Four steps, then it runs itself.
          </Display>
        </Reveal>
        <ol className="mt-14 space-y-6">
          {steps.map((s, i) => (
            <Reveal as="li" key={s.title} delay={0.04}>
              <div
                className={clsx(
                  "grid items-center gap-6 rounded-[2rem] p-6 sm:p-8 md:grid-cols-2 md:gap-10",
                  s.tone,
                  i % 2 === 1 && "md:[&>*:first-child]:order-2",
                )}
              >
                <div>
                  <p className="font-grotesk text-[64px] font-bold leading-none text-ink/15">0{i + 1}</p>
                  <h3 className="mt-2 font-display text-3xl font-semibold tracking-tight text-ink">{s.title}</h3>
                  <p className="mt-3 max-w-lg text-[15px] leading-relaxed text-ink-2">{s.body}</p>
                </div>
                <div className="md:px-6">{s.visual}</div>
              </div>
            </Reveal>
          ))}
        </ol>
      </Container>
    </section>
  );
}

/* ------------------------------------------------------------------ */

function PersonalizationPreview() {
  const [aiOn, setAiOn] = useState(true);
  const ex = VOICE_EXAMPLES[0];
  const gift = GIFT_MAP["garden-kit"];
  const general = renderTemplate(BIZ.defaultMessage, { firstName: ex.firstName, companyName: BIZ.name, senderName: BIZ.senderName.split(" ")[0] });
  const card = getCard(aiOn ? "garden-arch" : BIZ.defaultCardId);
  return (
    <section aria-labelledby="pp-title" className="relative overflow-hidden bg-ink py-20 text-paper sm:py-28">
      <Container className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
        <Reveal>
          <Eyebrow tone="paper">Personalization Preview</Eyebrow>
          <Display id="pp-title" className="mt-4 text-4xl leading-[1] text-paper sm:text-6xl">
            Suggestions you can see the reasons for.
          </Display>
          <p className="mt-5 text-lg text-paper/75">
            For each upcoming birthday, we suggest a card style, a message and an optional gift, using only the interests, notes
            and tags on that customer&rsquo;s profile. Every suggestion shows where it came from, so you can trust it or change it.
          </p>
          <ul className="mt-6 space-y-2 text-[15px] text-paper/80">
            {[
              "No notes on file? You get your thoughtful general message instead of a guess.",
              "Preview several recipients, edit one, regenerate one, approve the rest.",
              "Switch AI personalization off for one customer or everyone.",
            ].map((t) => (
              <li key={t} className="flex gap-2">
                <Check className="mt-0.5 size-4 shrink-0 text-mint" aria-hidden /> {t}
              </li>
            ))}
          </ul>
        </Reveal>

        <Reveal delay={0.08} className="rounded-[2rem] bg-paper p-5 text-ink shadow-lift sm:p-7">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-[12px] font-semibold uppercase tracking-wide text-ink-3">Upcoming · in 3 days</p>
              <p className="font-display text-2xl font-semibold tracking-tight">Rosa Delgado</p>
            </div>
            <AIDemoLabel />
          </div>
          <div className="mt-3 flex flex-wrap gap-1.5">
            <Badge tone="mint">Interest: gardening</Badge>
            <Badge tone="neutral">VIP</Badge>
          </div>
          <p className="mt-2 text-[13px] text-ink-3">Note: &ldquo;Talks about her tomato beds every time we see her.&rdquo;</p>

          <div className="mt-5 grid gap-5 sm:grid-cols-[0.7fr_1.3fr]">
            <div className="mx-auto w-40 sm:w-full">
              <AnimatePresence mode="wait">
                <motion.div key={card.id} initial={{ opacity: 0, rotate: -3 }} animate={{ opacity: 1, rotate: -2 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
                  <CardFront card={card} brandMark={brandMark} />
                </motion.div>
              </AnimatePresence>
            </div>
            <div className="min-w-0">
              <AnimatePresence mode="wait">
                <motion.p
                  key={aiOn ? "ai" : "general"}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.25 }}
                  className="rounded-2xl bg-white p-4 font-hand text-[21px] leading-[1.2] ring-1 ring-line"
                >
                  {aiOn ? ex.message : general}
                </motion.p>
              </AnimatePresence>
              {aiOn ? (
                <div className="mt-3 flex items-center gap-3 rounded-2xl bg-mint-soft p-3">
                  <div className="w-16 shrink-0">
                    <GiftArt gift={gift} className="rounded-xl" />
                  </div>
                  <p className="text-[13px] leading-snug text-ink-2">
                    <span className="font-semibold text-ink">Optional gift:</span> {gift.name}, {money(gift.price ?? 0)} +{" "}
                    {money(gift.shipping)} shipping. Needs your approval.
                  </p>
                </div>
              ) : (
                <p className="mt-3 rounded-2xl bg-ink/[0.04] p-3 text-[13px] text-ink-2">Card only. Your default card and message.</p>
              )}
            </div>
          </div>

          <div className="mt-5 rounded-2xl bg-cobalt-soft p-4" aria-live="polite">
            <p className="flex items-center gap-1.5 text-[12px] font-bold uppercase tracking-wide text-cobalt-deep">
              <Sparkles className="size-3.5" aria-hidden /> Why this suggestion
            </p>
            {aiOn ? (
              <ul className="mt-2 space-y-1 text-[14px] text-ink">
                <li>Suggested because this customer&rsquo;s interests include gardening.</li>
                <li>Message mentions her tomato beds, from your relationship note.</li>
                <li>Avoids last year&rsquo;s card (Little Wildflowers).</li>
              </ul>
            ) : (
              <p className="mt-2 text-[14px] text-ink">AI personalization is off, so this uses your general birthday message.</p>
            )}
          </div>
          <div className="mt-5 border-t border-line pt-4">
            <Toggle checked={aiOn} onChange={setAiOn} label="AI personalization" description="Try switching it off to see the general message." />
          </div>
        </Reveal>
      </Container>
    </section>
  );
}

/* ------------------------------------------------------------------ */

function BrandVoiceSection() {
  const [preset, setPreset] = useState<VoicePreset>("neighborly");
  const v = VOICE_PRESETS[preset];
  const after = sampleMessageForVoice(v.voice, { firstName: "Jordan", sender: BIZ.senderName.split(" ")[0], company: BIZ.name });
  return (
    <section aria-labelledby="voice-title" className="py-20 sm:py-28">
      <Container>
        <Reveal className="max-w-3xl">
          <Eyebrow tone="coral">Brand voice</Eyebrow>
          <Display id="voice-title" className="mt-4 text-4xl leading-[1] text-ink sm:text-6xl">
            Sounds like you. Never like a coupon.
          </Display>
          <p className="mt-4 max-w-2xl text-lg text-ink-2">
            Choose a voice, share a short writing sample, and list the phrases you love and the ones you&rsquo;d never say. Every
            message and suggestion follows it.
          </p>
        </Reveal>
        <Reveal delay={0.06} className="mt-10">
          <div role="radiogroup" aria-label="Voice preset" className="flex flex-wrap gap-2">
            {VOICE_ORDER.map((id) => (
              <button
                key={id}
                type="button"
                role="radio"
                aria-checked={preset === id}
                onClick={() => setPreset(id)}
                className={clsx(
                  "h-10 rounded-full px-4 text-sm font-semibold ring-1 ring-inset transition",
                  preset === id ? "bg-ink text-paper ring-ink" : "bg-white text-ink-2 ring-line-2 hover:ring-ink/40",
                )}
              >
                {VOICE_PRESETS[id].label}
              </button>
            ))}
          </div>
          <div className="mt-6 grid gap-5 md:grid-cols-2">
            <div className="rounded-[2rem] bg-white p-6 ring-1 ring-line">
              <p className="font-grotesk text-[12px] font-bold uppercase tracking-wide text-ink-3">Before · generic</p>
              <p className="mt-3 text-[16px] leading-relaxed text-ink-3 line-through decoration-coral/60 decoration-2">
                {GENERIC_MESSAGE("Jordan", BIZ.name)}
              </p>
            </div>
            <div className="relative rounded-[2rem] bg-coral-soft p-6">
              <div className="flex items-center justify-between gap-3">
                <p className="font-grotesk text-[12px] font-bold uppercase tracking-wide text-coral-deep">After · {v.label}</p>
                <AIDemoLabel />
              </div>
              <AnimatePresence mode="wait">
                <motion.p
                  key={preset}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.25 }}
                  className="mt-3 font-display text-2xl leading-snug text-ink"
                >
                  {after}
                </motion.p>
              </AnimatePresence>
              <p className="mt-4 text-[13px] text-ink-2">{v.voice.summary}</p>
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}

/* ------------------------------------------------------------------ */

function PlannerAndFreshness() {
  const last = CARD_MAP["wildflower-row"];
  const next = CARD_MAP["garden-arch"];
  const [avoid, setAvoid] = useState(true);
  return (
    <section aria-labelledby="planner-title" className="border-y border-line bg-cream/60 py-20 sm:py-28">
      <Container className="grid items-start gap-6 lg:grid-cols-2">
        <Reveal className="flex flex-col rounded-[2rem] bg-white p-6 shadow-soft ring-1 ring-line sm:p-8">
          <Eyebrow tone="lilac">Celebration Planner</Eyebrow>
          <Display id="planner-title" className="mt-4 text-3xl leading-[1.05] text-ink sm:text-4xl">
            One look tells you what needs you.
          </Display>
          <p className="mt-3 text-[15px] text-ink-2">
            The planner reads your customers, schedule and gift rules and turns them into a short to-do list. It&rsquo;s a set of
            actions, not a chat window.
          </p>
          <div className="mt-6 rounded-2xl bg-lilac-soft p-5">
            <p className="font-display text-xl leading-snug text-ink">
              &ldquo;You have 18 birthdays coming up. Twelve cards are ready, four customers need birthday details, and two gift
              suggestions need approval.&rdquo;
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {[
                { href: "/app/review", label: "Review ready cards" },
                { href: "/app/customers", label: "Complete missing details" },
                { href: "/app/gifts", label: "Review gift suggestions" },
                { href: "/app/studio", label: "Create a seasonal card collection" },
              ].map((a) => (
                <Link
                  key={a.label}
                  href={a.href}
                  className="rounded-full bg-white px-3.5 py-1.5 text-[13px] font-semibold text-ink ring-1 ring-line transition hover:ring-ink/40"
                >
                  {a.label}
                </Link>
              ))}
            </div>
          </div>
          <p className="mt-3 text-[12px] text-ink-3">Example from the demo workspace. Actions open it.</p>
        </Reveal>

        <Reveal delay={0.06} className="flex flex-col rounded-[2rem] bg-white p-6 shadow-soft ring-1 ring-line sm:p-8">
          <Eyebrow tone="mint">Annual freshness</Eyebrow>
          <Display className="mt-4 text-3xl leading-[1.05] text-ink sm:text-4xl">A fresh card every year.</Display>
          <p className="mt-3 text-[15px] text-ink-2">
            Each profile keeps last year&rsquo;s card and message. Next year&rsquo;s suggestion uses a new design and new wording, and
            tells you why.
          </p>
          <div className="mt-6 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
            <figure>
              <div className="opacity-70 grayscale-[30%]">
                <CardFront card={last} />
              </div>
              <figcaption className="mt-2 flex items-center gap-1 text-[12px] text-ink-3">
                <History className="size-3.5" aria-hidden /> Last year
              </figcaption>
            </figure>
            <ArrowRight className="size-5 text-ink-3" aria-hidden />
            <figure>
              <AnimatePresence mode="wait">
                <motion.div key={avoid ? "new" : "old"} initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
                  <CardFront card={avoid ? next : last} />
                </motion.div>
              </AnimatePresence>
              <figcaption className="mt-2 text-[12px] font-semibold text-ink">This year</figcaption>
            </figure>
          </div>
          <p className="mt-4 rounded-xl bg-mint-soft px-3 py-2 text-[13px] text-mint-deep" aria-live="polite">
            {avoid
              ? `Last year Rosa received ${last.name}. This suggestion uses a new design and fresh wording so it doesn't repeat.`
              : `Same design as last year. Turn the setting back on to get a fresh suggestion.`}
          </p>
          <div className="mt-5 border-t border-line pt-4">
            <Toggle checked={avoid} onChange={setAvoid} label="Avoid repeating last year’s card" description="An automation setting, on by default." />
          </div>
        </Reveal>
      </Container>
    </section>
  );
}

/* ------------------------------------------------------------------ */

function BudgetAndRecipient() {
  const budget = 150;
  const spent = 140;
  const coffee = GIFT_MAP["coffee-card"];
  const demoCard = CARD_MAP["garden-arch"];
  return (
    <section aria-labelledby="budget-title" className="py-20 sm:py-28">
      <Container className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <Reveal>
          <Eyebrow tone="coral">Gift budget controls</Eyebrow>
          <Display id="budget-title" className="mt-4 text-4xl leading-[1] text-ink sm:text-6xl">
            The card always goes. The gift waits for you.
          </Display>
          <p className="mt-5 max-w-xl text-lg text-ink-2">
            Set a monthly gift budget per rule. If the next gift would go over it, that gift is held for your review and the card is
            still delivered on the day. Gifts are priced separately from your plan.
          </p>
          <div className="mt-8 rounded-[2rem] bg-white p-5 shadow-soft ring-1 ring-line sm:p-6">
            <div className="flex items-baseline justify-between gap-3">
              <p className="text-[13px] font-semibold text-ink">Gift spend this month</p>
              <p className="font-grotesk text-lg font-bold text-ink">
                {money(spent)} <span className="text-[13px] font-medium text-ink-3">of {money(budget)}</span>
              </p>
            </div>
            <div className="mt-2 h-3 overflow-hidden rounded-full bg-ink/[0.06]" role="img" aria-label={`${money(spent)} of ${money(budget)} gift budget used`}>
              <motion.div
                className="h-full rounded-full bg-coral"
                initial={{ width: 0 }}
                whileInView={{ width: `${(spent / budget) * 100}%` }}
                viewport={{ once: true }}
                transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
              />
            </div>
            <div className="mt-5 flex flex-col gap-3 rounded-2xl bg-paper p-4 ring-1 ring-line sm:flex-row sm:items-center">
              <div className="w-16 shrink-0">
                <GiftArt gift={coffee} amount={15} className="rounded-xl" />
              </div>
              <div className="flex-1">
                <p className="text-[14px] font-semibold text-ink">Isaac&rsquo;s birthday · {money(15)} {coffee.name.toLowerCase()}</p>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  <Badge tone="cobalt" dot>Card scheduled</Badge>
                  <Badge tone="coral">Gift held: budget</Badge>
                </div>
              </div>
            </div>
            <p className="mt-3 flex items-start gap-1.5 text-[13px] text-ink-2">
              <CircleAlert className="mt-0.5 size-4 shrink-0 text-coral-deep" aria-hidden />
              This gift would bring the month to {money(spent + 15)}, over the {money(budget)} budget. Approve it anyway, or send the
              card on its own.
            </p>
          </div>
        </Reveal>

        <Reveal delay={0.08} className="rounded-[2.5rem] bg-butter-soft p-6 sm:p-10">
          <Eyebrow tone="butter">What your customer sees</Eyebrow>
          <Display className="mt-4 text-3xl leading-[1.05] text-ink sm:text-4xl">A real moment, not a marketing email.</Display>
          <p className="mt-3 text-[15px] text-ink-2">
            &ldquo;A little birthday something from {BIZ.name}&rdquo;. They tap to open the envelope, the card slides out, and your
            message is there. No sales prompts before they&rsquo;ve enjoyed it.
          </p>
          <div className="mx-auto mt-8 grid max-w-sm grid-cols-2 gap-4">
            <div className="rotate-[-3deg]">
              <CardFront card={demoCard} brandMark={brandMark} />
            </div>
            <div className="rotate-[3deg] translate-y-4">
              <CardInside
                message="Happy birthday, Jordan! Hope the year ahead feels just like home. Warmly, Maya"
                font="handwritten"
                recipientName="Jordan"
                brand={brandMark}
              />
            </div>
          </div>
          <div className="mt-10 flex flex-wrap gap-2">
            <ButtonLink href="/open?id=demo-card" variant="ink" iconRight={<ArrowUpRight className="size-4" aria-hidden />}>
              Open a card-only example
            </ButtonLink>
            <ButtonLink href="/open?id=demo-gift" variant="outline">
              With a gift
            </ButtonLink>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
