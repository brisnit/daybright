"use client";

import { clsx } from "clsx";
import { Check } from "lucide-react";
import { CHARTER, CLAIM_FLAGS, GIFTING_TERMS, PUBLIC_TIERS, QUOTAS, visibleFeatures, type Availability, type Tier } from "@/config/charter";
import { Button } from "@/components/ui/button";
import { useCharter } from "./charter-provider";
import { StatusChip, StatusLegend } from "./status";

/** Legend entries for the statuses actually shown in the matrix (gated features excluded). */
const LEGEND = (["beta", "planned", "roadmap", "concept", "service"] as Availability[]).filter((s) =>
  PUBLIC_TIERS.some((t) => visibleFeatures(t).some((f) => f.status === s)),
);

const usd = (n: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);

function PriceBlock({ tier, dark }: { tier: Tier; dark?: boolean }) {
  const c = dark
    ? { big: "text-paper", mid: "text-paper/75", low: "text-paper/60", gold: "text-[#E9D9A8]" }
    : { big: "text-ink", mid: "text-ink-2", low: "text-ink-3", gold: "text-[#8A6A2B]" };
  if (!tier.charter) {
    return (
      <div>
        <p className={clsx("font-display text-[44px] font-semibold leading-none tracking-tight", c.big)}>Custom</p>
        <p className={clsx("mt-2 text-[13px]", c.low)}>
          {tier.indicativePerSeat?.approved
            ? `Indicative ${usd(tier.indicativePerSeat.min)}–${usd(tier.indicativePerSeat.max)} per seat per month`
            : "Quoted by seat count and rollout scope"}
        </p>
      </div>
    );
  }
  return (
    <div>
      <p className={clsx("text-[12px] font-semibold uppercase tracking-[0.14em]", c.gold)}>{tier.charter.label}</p>
      <p className="mt-1 flex items-baseline gap-1.5">
        <span className={clsx("font-display text-[44px] font-semibold leading-none tracking-tight", c.big)}>{usd(tier.charter.amount)}</span>
        <span className={clsx("text-[14px] font-medium", c.mid)}>/{tier.charter.cadence}</span>
      </p>
      <p className={clsx("mt-2 text-[13px]", c.low)}>Proposed price · not charged when you reserve</p>
    </div>
  );
}

export function PricingMatrix({ source = "pricing", headingLevel = "h2" }: { source?: string; headingLevel?: "h1" | "h2" }) {
  const { openReservation, openInquiry } = useCharter();
  const H = headingLevel;

  return (
    <div>
      <div className="max-w-3xl">
        <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-[#8A6A2B]">Pricing</p>
        <H id="pricing-title" className="mt-3 font-display text-[34px] font-semibold leading-[1.05] tracking-tight text-[#16203A] text-balance sm:text-5xl">
          Founding Charter Pricing
        </H>
        <p className="mt-4 text-[17px] leading-relaxed text-ink-2">
          Proposed pricing for the first {CHARTER.seats} founding firms. Reserving is free and nonbinding: we review each request
          and confirm pricing, scope and timing with you in writing before anything is agreed.
        </p>
      </div>

      <ul className={clsx("mt-8 grid gap-4 md:grid-cols-2", PUBLIC_TIERS.length === 3 ? "xl:grid-cols-3" : "xl:grid-cols-4")}>
        {PUBLIC_TIERS.map((t) => {
          const featured = t.id === "agency";
          return (
            <li
              key={t.id}
              className={clsx(
                "relative flex flex-col rounded-[1.75rem] p-6 sm:p-7",
                featured ? "bg-[#16203A] text-paper shadow-lift" : "emboss bg-white ring-1 ring-[#EDE4D3]",
              )}
            >
              {t.badge && (
                <span className="absolute -top-3 left-6 rounded-full bg-[#E9D9A8] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-[#16203A]">
                  {t.badge}
                </span>
              )}
              <div className="xl:min-h-[84px]">
                <h3 className={clsx("font-display text-[22px] font-semibold leading-tight tracking-tight", featured ? "text-paper" : "text-ink")}>{t.name}</h3>
                <p className={clsx("mt-1 text-[13px]", featured ? "text-paper/65" : "text-ink-3")}>{t.audience}</p>
              </div>

              <div className="mt-5 min-h-[132px]">
                <PriceBlock tier={t} dark={featured} />
              </div>

              <Button
                size="md"
                variant={featured ? "white" : t.cta.action === "reserve" ? "ink" : "outline"}
                className="mt-6 w-full whitespace-normal text-center"
                onClick={() =>
                  t.cta.action === "reserve"
                    ? openReservation(t.id as "solo" | "agency", `${source}-${t.id}`)
                    : openInquiry(t.id, `${source}-${t.id}`)
                }
              >
                {t.cta.label}
              </Button>

              <ul className={clsx("mt-6 space-y-3 border-t pt-5", featured ? "border-white/15" : "border-line")}>
                {visibleFeatures(t).map((f) => (
                  <li key={f.label} className="flex items-start gap-2.5 text-[14px] leading-snug">
                    <Check className={clsx("mt-0.5 size-4 shrink-0", featured ? "text-[#E9D9A8]" : "text-[#8A6A2B]")} aria-hidden />
                    <span className="flex flex-1 flex-col items-start gap-1">
                      <span>{f.label}</span>
                      <span className="flex flex-wrap items-center gap-1.5">
                        <StatusChip status={f.status} dark={featured} />
                        {f.quota && !QUOTAS.confirmed && (
                          <span className={clsx("text-[11px] font-medium", featured ? "text-paper/60" : "text-ink-3")}>Proposed limit</span>
                        )}
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
            </li>
          );
        })}
      </ul>

      <div className="mt-8 rounded-[1.5rem] bg-white/60 p-5 ring-1 ring-line sm:p-6">
        <p className="mb-3 text-[13px] font-semibold text-ink">What the labels mean</p>
        <StatusLegend statuses={LEGEND} />
        <p className="mt-4 text-[12px] leading-relaxed text-ink-3">
          Prices are proposed, in US dollars, and may change before launch. {CHARTER.nonbinding} No billing is active on this site.
          Contact, seat and SMS limits marked &ldquo;Proposed limit&rdquo; are not final. Planned and roadmap features
          have no committed release dates.
          {CLAIM_FLAGS.respaConcept &&
            " The RESPA / marketing-compliance split-tracking concept is subject to legal review before it is offered."}
        </p>
      </div>

      {CLAIM_FLAGS.giftingTerms && <GiftingTerms />}
    </div>
  );
}

/** Proposed gifting fees. Rendered only while CLAIM_FLAGS.giftingTerms is true (hidden pending legal review). */
export function GiftingTerms() {
  return (
    <section aria-labelledby="gifting-title" className="linen mt-10 overflow-hidden rounded-[1.75rem] p-6 ring-1 ring-[#E7DDCC] sm:p-8">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="max-w-2xl">
          <h3 id="gifting-title" className="font-display text-[26px] font-semibold tracking-tight text-[#16203A]">
            Gifting Wallet &amp; SMS Top-Ups
          </h3>
          <p className="mt-2 text-[15px] leading-relaxed text-ink-2">
            Gifting and extra messages aren&rsquo;t built yet. If they launch, they&rsquo;d be optional and priced separately from your
            plan. These are the terms we&rsquo;re considering.
          </p>
        </div>
        <div className="flex gap-1.5">
          <StatusChip status="concept" />
          <StatusChip status="proposed" />
        </div>
      </div>
      <dl className="mt-6 grid gap-px overflow-hidden rounded-2xl bg-[#E7DDCC] ring-1 ring-[#E7DDCC] sm:grid-cols-2 lg:grid-cols-4">
        {GIFTING_TERMS.map((g) => (
          <div key={g.label} className="bg-[#FCFAF5] p-5">
            <dt className="font-semibold text-ink">{g.label}</dt>
            <dd className="mt-1 text-[13px] leading-relaxed text-ink-3">{g.detail}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-4 text-[12px] leading-relaxed text-ink-3">
        The gifting wallet, funding methods, fees and merchant catalog are not active and may change or not launch. Payment and
        gifting models need legal review first. Daybright does not process payments, hold funds or connect to bank accounts.
      </p>
    </section>
  );
}
