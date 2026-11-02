"use client";

import { useState } from "react";
import { clsx } from "clsx";
import { Check } from "lucide-react";
import { CHARTER, GIFTING_TERMS, TIERS, tierSavings, type Tier } from "@/config/charter";
import { Segmented } from "@/components/ui/controls";
import { Button } from "@/components/ui/button";
import { track } from "@/lib/analytics";
import { useCharter } from "./charter-provider";
import { StatusChip, StatusLegend } from "./status";

type View = "charter" | "standard";

const usd = (n: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);

function PriceBlock({ tier, view, dark }: { tier: Tier; view: View; dark?: boolean }) {
  const s = tierSavings(tier);
  const c = dark
    ? { big: "text-paper", mid: "text-paper/75", low: "text-paper/60", gold: "text-[#E9D9A8]", save: "bg-white/10 text-[#BFF0DA]" }
    : { big: "text-ink", mid: "text-ink-2", low: "text-ink-3", gold: "text-[#8A6A2B]", save: "bg-mint-soft text-mint-deep" };
  if (!tier.standard) {
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
  if (view === "charter" && tier.charter) {
    const yearly = tier.charter.cadence === "year";
    return (
      <div>
        <p className={clsx("text-[12px] font-semibold uppercase tracking-[0.14em]", c.gold)}>{tier.charter.label}</p>
        <p className="mt-1 flex items-baseline gap-1.5">
          <span className={clsx("font-display text-[44px] font-semibold leading-none tracking-tight", c.big)}>{usd(tier.charter.amount)}</span>
          <span className={clsx("text-[14px] font-medium", c.mid)}>/{tier.charter.cadence}{tier.charter.prepaid ? ", prepaid" : ""}</span>
        </p>
        <p className={clsx("mt-2 text-[13px]", c.low)}>
          Standard <span className="line-through decoration-current/60">{usd(tier.standard.amount)}/{tier.standard.cadence}</span>
          {yearly && s ? ` (${usd(s.standardYear)}/year)` : ""}
        </p>
        {s && (
          <p className={clsx("mt-2 inline-flex rounded-full px-2.5 py-1 text-[12px] font-semibold", c.save)}>
            Save {s.pct}%{yearly ? ` · ${usd(s.saved)} per year` : " on the monthly rate"}
          </p>
        )}
      </div>
    );
  }
  return (
    <div>
      <p className={clsx("text-[12px] font-semibold uppercase tracking-[0.14em]", c.low)}>Standard</p>
      <p className="mt-1 flex items-baseline gap-1.5">
        <span className={clsx("font-display text-[44px] font-semibold leading-none tracking-tight", c.big)}>{usd(tier.standard.amount)}</span>
        <span className={clsx("text-[14px] font-medium", c.mid)}>/{tier.standard.cadence}</span>
      </p>
      <p className={clsx("mt-2 text-[13px]", c.low)}>
        Billed monthly{s && tier.charter?.cadence === "year" ? ` · ${usd(s.standardYear)} per year` : ""}
      </p>
    </div>
  );
}

export function PricingMatrix({ source = "pricing", headingLevel = "h2" }: { source?: string; headingLevel?: "h1" | "h2" }) {
  const [view, setView] = useState<View>("charter");
  const { openReservation, openInquiry } = useCharter();
  const H = headingLevel;

  return (
    <div>
      <div className="max-w-3xl">
        <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-[#8A6A2B]">Pricing</p>
        <H id="pricing-title" className="mt-3 font-display text-[34px] font-semibold leading-[1.05] tracking-tight text-[#16203A] text-balance sm:text-5xl">
          Software-Grade Automation at a Fraction of Physical Postage
        </H>
        <p className="mt-4 text-[17px] leading-relaxed text-ink-2">
          Printing, postage and hand-addressing add up for every physical card. Lock in Founding Charter rates during our initial{" "}
          {CHARTER.seats}-member beta rollout.
        </p>
      </div>

      <div className="mt-8 flex flex-wrap items-center gap-4">
        <Segmented<View>
          ariaLabel="Pricing view"
          value={view}
          onChange={(v) => {
            setView(v);
            track("pricing_view_toggle", { view: v, source });
          }}
          options={[
            { value: "charter", label: "Founding Charter" },
            { value: "standard", label: "Standard pricing" },
          ]}
        />
        <p className="text-[13px] text-ink-3">
          {view === "charter"
            ? "Solo and Agency charters are prepaid annually. Sponsor charter is billed monthly."
            : "Standard rates after the charter period, billed monthly."}
        </p>
      </div>

      <ul className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {TIERS.map((t) => {
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
                <PriceBlock tier={t} view={view} dark={featured} />
              </div>

              <Button
                size="md"
                variant={featured ? "white" : t.cta.action === "reserve" ? "ink" : "outline"}
                className="mt-6 w-full whitespace-normal text-center"
                onClick={() =>
                  t.cta.action === "reserve"
                    ? openReservation(t.id as "solo" | "agency", `${source}-${t.id}`)
                    : openInquiry(t.id as "sponsor" | "enterprise", `${source}-${t.id}`)
                }
              >
                {t.cta.label}
              </Button>

              <ul className={clsx("mt-6 space-y-3 border-t pt-5", featured ? "border-white/15" : "border-line")}>
                {t.features.map((f) => (
                  <li key={f.label} className="flex items-start gap-2.5 text-[14px] leading-snug">
                    <Check className={clsx("mt-0.5 size-4 shrink-0", featured ? "text-[#E9D9A8]" : "text-[#8A6A2B]")} aria-hidden />
                    <span className="flex flex-1 flex-col items-start gap-1">
                      <span>{f.label}</span>
                      <StatusChip status={f.status} dark={featured} />
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
        <StatusLegend statuses={["beta", "planned", "roadmap", "concept", "service"]} />
        <p className="mt-4 text-[12px] leading-relaxed text-ink-3">
          Prices are proposed launch pricing in US dollars. Reserving a charter seat is not a purchase: no billing is active and no
          payment is collected on this site. Charter pricing is confirmed in writing when we follow up. The RESPA / marketing-compliance
          split-tracking concept is subject to legal review before it is offered.
        </p>
      </div>

      <GiftingTerms />
    </div>
  );
}

export function GiftingTerms() {
  return (
    <section aria-labelledby="gifting-title" className="linen mt-10 overflow-hidden rounded-[1.75rem] p-6 ring-1 ring-[#E7DDCC] sm:p-8">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="max-w-2xl">
          <h3 id="gifting-title" className="font-display text-[26px] font-semibold tracking-tight text-[#16203A]">
            100% Transparent Gifting Wallet &amp; SMS Top-Ups
          </h3>
          <p className="mt-2 text-[15px] leading-relaxed text-ink-2">
            Gifts and extra messages are optional and priced separately from your plan. These are the terms we&rsquo;re proposing for launch.
          </p>
        </div>
        <StatusChip status="proposed" />
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
        The gifting wallet, funding methods, fees and merchant catalog are not yet active and may change. Daybright does not hold
        funds or connect to bank accounts on this site.
      </p>
    </section>
  );
}
