"use client";

import { Fragment } from "react";
import { clsx } from "clsx";
import { ArrowRight, Check, Minus, Sparkles } from "lucide-react";
import { BRAND, CONSUMER, PLANS, PRICING_COPY, STARTING_PRICE, money, type Plan } from "@/config/brand";
import { GIFT_MAP, giftPrice } from "@/data/gifts";
import { GiftArt } from "@/components/gifts/gift-art";
import { ButtonLink } from "@/components/ui/button";
import { FAQS, FaqSection } from "./faq";
import { FinalCTA } from "./final-cta";
import { PlanCards } from "./plans";
import { Container, Display, Eyebrow, Reveal, Squiggle } from "./primitives";

export function PricingPage() {
  return (
    <>
      <section className="relative overflow-hidden">
        <div aria-hidden className="pointer-events-none absolute -left-40 -top-24 size-[480px] rounded-full bg-butter-soft" />
        <Container className="relative pb-14 pt-10 sm:pt-16">
          <Eyebrow tone="butter">Pricing</Eyebrow>
          <h1 className="mt-5 max-w-4xl font-display text-[3rem] font-semibold leading-[0.95] tracking-tight text-ink sm:text-7xl">
            Simple monthly plans.{" "}
            <span className="relative inline-block whitespace-nowrap text-cobalt">
              Cards included.
              <Squiggle className="absolute -bottom-2 left-0 h-3 w-full sm:h-4" />
            </span>
          </h1>
          <p className="mt-8 inline-flex max-w-3xl items-start gap-3 rounded-2xl bg-white px-5 py-4 text-lg font-semibold leading-snug text-ink shadow-soft ring-1 ring-line sm:text-xl">
            <span className="mt-1.5 size-2.5 shrink-0 rounded-full bg-coral" aria-hidden />
            {PRICING_COPY.includes}
          </p>
          <p className="mt-4 max-w-2xl text-ink-2">
            Plans start at {money(STARTING_PRICE)}/month and differ by how many birthday cards you send each month and which team
            features you need. Monthly billing, no setup fees.
          </p>
        </Container>
      </section>

      <section aria-label="Plans" className="pb-20">
        <Container>
          <PlanCards />
          <p className="mt-6 text-[13px] text-ink-3">{PRICING_COPY.provisional}</p>
        </Container>
      </section>

      <ComparisonTable />
      <AiAndGifts />
      <OneCard />
      <FaqSection
        title="Pricing questions."
        items={["included", "giftsCost", "ai", "consumer", "annual", "cancelSend", "address"].map((k) => FAQS[k])}
      />
      <FinalCTA
        title="See it with real-looking data first."
        body="The demo workspace is already set up for a fictional real estate team. Nothing is billed or sent."
        primary={{ href: "/app", label: "Explore business demo" }}
        secondary={{ href: "/onboarding", label: "Start setup" }}
      />
    </>
  );
}

/* ------------------------------------------------------------------ */

type Row = { label: string; value: (p: Plan) => boolean | string; note?: string };
const GROUPS: { title: string; rows: Row[] }[] = [
  {
    title: "Cards",
    rows: [
      { label: "Price", value: (p) => `${money(p.monthlyPrice)}/month` },
      { label: "Birthday card sends per month", value: (p) => p.monthlySends.toLocaleString("en-US") },
      { label: "Digital card collection", value: () => true },
      { label: "Birthday scheduling and automation", value: () => true },
      { label: "CSV customer import", value: () => true },
      { label: "Business logo and signature", value: () => true },
    ],
  },
  {
    title: "Team features",
    rows: [
      { label: "Customer segments", value: (p) => p.limits.segments },
      { label: "Gift budget controls", value: (p) => p.limits.giftBudgetControls },
      { label: "Multiple card and message rules", value: (p) => p.limits.multipleRules },
      { label: "Team members", value: (p) => (p.limits.teamMembers > 1 ? `Up to ${p.limits.teamMembers}` : "1") },
      { label: "Brand profiles", value: (p) => (p.limits.brandProfiles > 1 ? `Up to ${p.limits.brandProfiles}` : "1") },
      { label: "Expanded reporting", value: (p) => p.limits.expandedReporting },
    ],
  },
  {
    title: "AI and gifts",
    rows: [
      { label: "AI card creation and message help", value: () => "Included", note: PRICING_COPY.aiAllowance },
      { label: "Gift cards, physical gifts, shipping", value: () => "Paid per gift" },
    ],
  },
];

function Cell({ v, hi }: { v: boolean | string; hi: boolean }) {
  if (v === true) return <Check className={clsx("mx-auto size-5", hi ? "text-mint-deep" : "text-mint-deep")} aria-label="Included" />;
  if (v === false) return <Minus className="mx-auto size-5 text-ink-3/50" aria-label="Not included" />;
  return <span className="font-semibold text-ink">{v}</span>;
}

function ComparisonTable() {
  return (
    <section aria-labelledby="compare-title" className="border-y border-line bg-cream/60 py-20 sm:py-24">
      <Container>
        <Reveal>
          <Display id="compare-title" className="text-4xl leading-[1] text-ink sm:text-5xl">
            Compare plans
          </Display>
        </Reveal>
        <p className="mt-3 text-[13px] text-ink-3 sm:hidden">Swipe the table sideways to see every plan.</p>
        <div className="-mx-4 mt-6 overflow-x-auto sm:mt-10 px-4 sm:mx-0 sm:px-0">
          <table className="w-full min-w-[620px] border-separate border-spacing-0 overflow-hidden rounded-3xl bg-white text-[14px] ring-1 ring-line">
            <thead>
              <tr>
                <th scope="col" className="sticky left-0 z-10 w-[38%] bg-white p-4 text-left text-[13px] font-semibold text-ink-3">
                  <span className="sr-only">Feature</span>
                </th>
                {PLANS.map((p) => (
                  <th
                    key={p.id}
                    scope="col"
                    className={clsx("p-4 text-center font-display text-xl font-semibold tracking-tight", p.highlight ? "bg-butter-soft text-ink" : "text-ink")}
                  >
                    {p.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {GROUPS.map((g) => (
                <Fragment key={g.title}>
                  <tr>
                    <th
                      scope="colgroup"
                      colSpan={PLANS.length + 1}
                      className="border-t border-line bg-paper px-4 py-2.5 text-left font-grotesk text-[12px] font-bold uppercase tracking-[0.12em] text-ink-3"
                    >
                      {g.title}
                    </th>
                  </tr>
                  {g.rows.map((r) => (
                    <tr key={r.label}>
                      <th scope="row" className="sticky left-0 z-10 border-t border-line bg-white p-4 text-left font-medium text-ink-2">
                        {r.label}
                        {r.note && <span className="mt-0.5 block text-[12px] font-normal text-ink-3">{r.note}</span>}
                      </th>
                      {PLANS.map((p) => (
                        <td key={p.id} className={clsx("border-t border-line p-4 text-center", p.highlight && "bg-butter-soft/50")}>
                          <Cell v={r.value(p)} hi={!!p.highlight} />
                        </td>
                      ))}
                    </tr>
                  ))}
                </Fragment>
              ))}
              <tr>
                <td className="sticky left-0 z-10 border-t border-line bg-white p-4" />
                {PLANS.map((p) => (
                  <td key={p.id} className={clsx("border-t border-line p-4 text-center", p.highlight && "bg-butter-soft/50")}>
                    <ButtonLink href={`/onboarding?plan=${p.id}`} size="sm" variant={p.highlight ? "primary" : "outline"}>
                      Choose {p.name}
                    </ButtonLink>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </Container>
    </section>
  );
}

/* ------------------------------------------------------------------ */

const GIFT_EXAMPLES = [
  { id: "coffee-card", amount: 25 },
  { id: "garden-kit" },
  { id: "flowers" },
];

function AiAndGifts() {
  return (
    <section aria-labelledby="extras-title" className="py-20 sm:py-28">
      <Container className="grid items-start gap-6 lg:grid-cols-[0.8fr_1.2fr]">
        <Reveal className="rounded-[2rem] bg-lilac-soft p-6 sm:p-8">
          <p className="inline-flex items-center gap-2 font-grotesk text-[12px] font-bold uppercase tracking-[0.12em] text-lilac-deep">
            <Sparkles className="size-4" aria-hidden /> AI allowance
          </p>
          <Display className="mt-4 text-3xl leading-[1.05] text-ink sm:text-4xl">Creative help, counted separately.</Display>
          <p className="mt-4 text-[15px] leading-relaxed text-ink-2">
            Card Studio designs, message drafts and rewrites, brand voice and personalization suggestions are part of every plan.{" "}
            {PRICING_COPY.aiNote}
          </p>
          <p className="mt-5 rounded-2xl bg-white px-4 py-3 text-[14px] font-semibold text-ink ring-1 ring-lilac/40">
            {PRICING_COPY.aiAllowance}
          </p>
          <p className="mt-3 text-[13px] text-ink-3">
            AI image generation is not unlimited. Specific allowances will be set before launch.
          </p>
        </Reveal>

        <Reveal delay={0.06} className="rounded-[2rem] bg-white p-6 shadow-soft ring-1 ring-line sm:p-8">
          <p className="font-grotesk text-[12px] font-bold uppercase tracking-[0.12em] text-mint-deep">How gift pricing works</p>
          <Display id="extras-title" className="mt-4 text-3xl leading-[1.05] text-ink sm:text-4xl">
            You pay for a gift only when you send one.
          </Display>
          <p className="mt-4 text-[15px] leading-relaxed text-ink-2">
            Gifts are optional and billed per gift: the gift card amount or product price, plus shipping for physical gifts. Totals
            are shown before you approve anything. Examples below are illustrative.
          </p>
          <ul className="mt-6 grid gap-3 sm:grid-cols-3">
            {GIFT_EXAMPLES.map((ex) => {
              const g = GIFT_MAP[ex.id];
              if (!g) return null;
              const price = giftPrice(g, ex.amount);
              return (
                <li key={ex.id} className="rounded-2xl bg-paper p-3 ring-1 ring-line">
                  <GiftArt gift={g} amount={ex.amount} />
                  <p className="mt-2 text-[14px] font-semibold leading-snug text-ink">{g.name}</p>
                  <dl className="mt-2 space-y-0.5 text-[13px] text-ink-2">
                    <div className="flex justify-between">
                      <dt>{g.kind === "digital" ? "Amount" : "Price"}</dt>
                      <dd>{money(price)}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt>Shipping</dt>
                      <dd>{g.shipping ? money(g.shipping) : "None"}</dd>
                    </div>
                    <div className="flex justify-between border-t border-line pt-1 font-semibold text-ink">
                      <dt>Gift total</dt>
                      <dd>{money(price + g.shipping)}</dd>
                    </div>
                  </dl>
                </li>
              );
            })}
          </ul>
          <ButtonLink href="/gifts" variant="ghost" className="mt-4 -ml-3" iconRight={<ArrowRight className="size-4" aria-hidden />}>
            Browse all gifts
          </ButtonLink>
        </Reveal>
      </Container>
    </section>
  );
}

function OneCard() {
  return (
    <section aria-labelledby="one-card-title" className="pb-10">
      <Container>
        <Reveal className="grid items-center gap-6 rounded-[2rem] bg-ink p-6 text-paper sm:p-10 md:grid-cols-[1fr_auto]">
          <div>
            <p className="font-grotesk text-[12px] font-bold uppercase tracking-[0.12em] text-butter">Not a business?</p>
            <Display id="one-card-title" className="mt-3 text-3xl leading-[1.05] text-paper sm:text-5xl">
              One card, {money(CONSUMER.digitalCardPrice)}. No subscription.
            </Display>
            <p className="mt-3 max-w-xl text-paper/75">
              Send a single digital birthday card from {BRAND.name}, with or without a gift. Gifts and any shipping are added at
              checkout. {CONSUMER.note}
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row md:flex-col">
            <ButtonLink href="/cards" variant="white" size="lg">
              Browse cards
            </ButtonLink>
            <ButtonLink href="/studio" variant="coral" size="lg">
              Create a card with AI
            </ButtonLink>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
