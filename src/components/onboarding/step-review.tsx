"use client";

import { Pencil } from "lucide-react";
import type { ReactNode } from "react";
import { getPlan, money, PRICING_COPY } from "@/config/brand";
import { getCard } from "@/lib/cards";
import { renderTemplate } from "@/lib/ai/messages";
import { VOICE_PRESETS } from "@/lib/ai/voice";
import { useDemo } from "@/lib/store";
import { CardFront, initials } from "@/components/cards/card-art";
import { automationSentence, type OnboardingDraft } from "./model";
import { StepHeader } from "./bits";
import { RecipientInside } from "@/components/recipient/recipient-inside";

export function ReviewStep({ d, step, total, goTo, ids }: { d: OnboardingDraft; step: number; total: number; goTo: (id: string) => void; ids: Record<string, string> }) {
  const existing = useDemo((s) => s.customers.length);
  const plan = getPlan(d.planId);
  const card = getCard(d.cardId);
  const brand = { name: d.name || "Your business", color: d.brandColor, logo: d.logo };
  const rendered = renderTemplate(d.template, { firstName: "Jordan", companyName: d.name, senderName: d.senderName.split(" ")[0] });

  return (
    <>
      <StepHeader step={step} total={total} title="Looks lovely. Ready?">
        Here&rsquo;s everything in one place. Activating sets up your demo workspace; nothing is billed or sent for real.
      </StepHeader>
      <div className="grid gap-8 lg:grid-cols-[1fr_minmax(0,320px)]">
        <dl className="divide-y divide-line overflow-hidden rounded-3xl bg-white ring-1 ring-line">
          <Row label="Plan" onEdit={() => goTo(ids.plan)}>
            <span className="font-semibold text-ink">{plan.name}</span> · {money(plan.monthlyPrice)}/month (illustrative) · {plan.monthlySends.toLocaleString()} sends
            <span className="mt-1 block text-[13px] text-ink-3">{PRICING_COPY.includes}</span>
          </Row>
          <Row label="Business" onEdit={() => goTo(ids.brand)}>
            <span className="flex items-center gap-2.5">
              {d.logo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={d.logo} alt="" className="size-8 rounded-lg object-cover" />
              ) : (
                <span className="grid size-8 place-items-center rounded-lg text-[12px] font-bold text-white" style={{ background: d.brandColor }}>
                  {initials(brand.name)}
                </span>
              )}
              <span>
                <span className="block font-semibold text-ink">{brand.name}</span>
                <span className="block text-[13px] text-ink-3">
                  Signed by {d.senderName || "you"}
                  {d.signature ? ` · “${d.signature}”` : ""}
                </span>
              </span>
            </span>
          </Row>
          <Row label="Brand voice" onEdit={() => goTo(ids.voice)}>
            <span className="font-semibold text-ink">{VOICE_PRESETS[d.voice.preset].label}</span> · {d.voice.tones.join(", ")}
            <span className="mt-1 block text-[13px] text-ink-3">{d.voice.summary}</span>
          </Row>
          <Row label="Customers" onEdit={() => goTo(ids.customers)}>
            {existing} demo customers
            {d.newCustomers.length ? ` + ${d.newCustomers.length} you added` : ""}
          </Row>
          <Row label="Default card" onEdit={() => goTo(ids.card)}>
            <span className="font-semibold text-ink">{card.name}</span>
            <span className="mt-1 block font-mono text-[12px] text-ink-3">{d.template}</span>
          </Row>
          <Row label="Automation" onEdit={() => goTo(ids.automation)}>
            {automationSentence(d)}
          </Row>
        </dl>
        <div className="lg:sticky lg:top-24 lg:self-start">
          <div className="mx-auto flex max-w-[300px] items-start">
            <div className="w-[58%] -rotate-3">
              <CardFront card={card} brandMark={brand} />
            </div>
            <div className="-ml-[14%] mt-8 w-[58%] rotate-2">
              <RecipientInside card={card} message={rendered} font="handwritten" brand={brand} accent={d.brandColor} senderName={d.senderName} recipientName={"Jordan"} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function Row({ label, children, onEdit }: { label: string; children: ReactNode; onEdit: () => void }) {
  return (
    <div className="grid gap-1 px-5 py-4 sm:grid-cols-[130px_1fr_auto] sm:items-start sm:gap-4">
      <dt className="text-[12px] font-semibold uppercase tracking-[0.14em] text-ink-3 sm:pt-0.5">{label}</dt>
      <dd className="text-[14px] leading-relaxed text-ink-2">{children}</dd>
      <button
        type="button"
        onClick={onEdit}
        className="inline-flex items-center gap-1 justify-self-start rounded-full px-2 py-1 text-[13px] font-semibold text-cobalt hover:bg-cobalt-soft sm:justify-self-end"
        aria-label={`Edit ${label.toLowerCase()}`}
      >
        <Pencil className="size-3.5" /> Edit
      </button>
    </div>
  );
}
