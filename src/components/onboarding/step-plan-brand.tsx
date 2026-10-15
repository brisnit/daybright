"use client";

import { clsx } from "clsx";
import { Check, ImagePlus, Pipette } from "lucide-react";
import { useRef, useState } from "react";
import { PLANS, PRICING_COPY, money } from "@/config/brand";
import { getCard } from "@/lib/cards";
import { renderTemplate } from "@/lib/ai/messages";
import { CardFront, initials } from "@/components/cards/card-art";
import { ChoiceCard } from "@/components/ui/controls";
import { Input } from "@/components/ui/field";
import { Badge } from "@/components/ui/badges";
import { Button } from "@/components/ui/button";
import { BRAND_SWATCHES, type OnboardingDraft } from "./model";
import { RecipientInside } from "@/components/recipient/recipient-inside";
import { Eyebrow, Panel, StepHeader } from "./bits";

type StepProps = { d: OnboardingDraft; set: (p: Partial<OnboardingDraft>) => void; step: number; total: number };

export function PlanStep({ d, set, step, total }: StepProps) {
  return (
    <>
      <StepHeader step={step} total={total} title="Pick a plan to try.">
        Every plan includes the full card collection, scheduling and automation. You can switch any time in this demo.
      </StepHeader>
      <div className="grid gap-4 md:grid-cols-3">
        {PLANS.map((p) => (
          <ChoiceCard key={p.id} selected={d.planId === p.id} onClick={() => set({ planId: p.id })} className="flex flex-col p-5">
            <div className="flex items-center gap-2">
              <p className="font-grotesk text-lg font-bold text-ink">{p.name}</p>
              {p.highlight && <Badge tone="butter">Recommended</Badge>}
            </div>
            <p className="mt-3 flex items-baseline gap-1">
              <span className="font-display text-5xl font-semibold tracking-tight text-ink">{money(p.monthlyPrice)}</span>
              <span className="text-sm text-ink-3">/month</span>
            </p>
            <p className="mt-1 text-[13px] font-semibold text-cobalt-deep">{p.monthlySends.toLocaleString()} card sends a month</p>
            <p className="mt-3 text-[14px] leading-relaxed text-ink-2">{p.blurb}</p>
            <ul className="mt-4 space-y-2 border-t border-line pt-4">
              {p.features.map((f) => (
                <li key={f} className="flex gap-2 text-[13px] text-ink-2">
                  <Check className="mt-0.5 size-3.5 shrink-0 text-mint-deep" />
                  {f}
                </li>
              ))}
            </ul>
          </ChoiceCard>
        ))}
      </div>
      <div className="mt-6 rounded-2xl bg-butter-soft px-5 py-4">
        <p className="font-semibold text-ink">{PRICING_COPY.includes}</p>
        <p className="mt-1 text-[13px] text-ink-2">
          {PRICING_COPY.provisional} No payment details needed for the demo.
        </p>
      </div>
    </>
  );
}

export function BrandStep({ d, set, step, total }: StepProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [fileError, setFileError] = useState<string | null>(null);

  const onFile = (f: File | undefined) => {
    setFileError(null);
    if (!f) return;
    if (!f.type.startsWith("image/")) return setFileError("Choose an image file (PNG, JPG or SVG).");
    if (f.size > 1_000_000) return setFileError("That image is over 1 MB. Try a smaller version.");
    const reader = new FileReader();
    reader.onload = () => set({ logo: String(reader.result) });
    reader.readAsDataURL(f);
  };

  const custom = !BRAND_SWATCHES.some((s) => s.hex.toLowerCase() === d.brandColor.toLowerCase());

  return (
    <>
      <StepHeader step={step} total={total} title="Make it look like you.">
        Your name, logo and color appear on every card, so customers know exactly who&rsquo;s thinking of them.
      </StepHeader>
      <div className="grid gap-8 lg:grid-cols-[1fr_minmax(0,380px)]">
        <div className="space-y-5">
          <Panel className="space-y-4">
            <Input label="Business name" value={d.name} onChange={(e) => set({ name: e.target.value })} error={d.name.trim() ? null : "Add your business name to continue."} />
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="Your name" hint="Used for {{sender_name}} in messages." value={d.senderName} onChange={(e) => set({ senderName: e.target.value })} />
              <Input label="Card signature" optional value={d.signature} onChange={(e) => set({ signature: e.target.value })} />
            </div>
          </Panel>

          <Panel>
            <Eyebrow>Logo</Eyebrow>
            <div className="mt-3 flex flex-wrap items-center gap-4">
              <div className="grid size-16 place-items-center overflow-hidden rounded-2xl ring-1 ring-line" style={{ background: d.logo ? "#fff" : d.brandColor }}>
                {d.logo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={d.logo} alt="Your logo preview" className="size-full object-cover" />
                ) : (
                  <span className="font-grotesk text-xl font-bold text-white">{initials(d.name || "Your Business") || "YB"}</span>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" icon={<ImagePlus className="size-4" />} onClick={() => fileRef.current?.click()}>
                  {d.logo ? "Replace logo" : "Upload logo"}
                </Button>
                <Button variant={d.logo ? "ghost" : "soft"} size="sm" onClick={() => set({ logo: null })} aria-pressed={!d.logo}>
                  {d.logo ? "Use initials instead" : "Using initials"}
                </Button>
              </div>
              <input ref={fileRef} type="file" accept="image/*" className="sr-only" aria-label="Upload logo" onChange={(e) => onFile(e.target.files?.[0])} />
            </div>
            {fileError ? <p className="mt-2 text-[13px] font-medium text-coral-deep">{fileError}</p> : <p className="mt-2 text-[13px] text-ink-3">Square images work best. It stays in this browser.</p>}
          </Panel>

          <Panel>
            <Eyebrow>Brand color</Eyebrow>
            <div className="mt-3 flex flex-wrap items-center gap-2.5" role="radiogroup" aria-label="Brand color">
              {BRAND_SWATCHES.map((s) => {
                const on = s.hex.toLowerCase() === d.brandColor.toLowerCase();
                return (
                  <button
                    key={s.hex}
                    type="button"
                    role="radio"
                    aria-checked={on}
                    aria-label={s.label}
                    onClick={() => set({ brandColor: s.hex })}
                    className={clsx("grid size-10 place-items-center rounded-full transition", on ? "ring-2 ring-ink ring-offset-2 ring-offset-white" : "hover:scale-105")}
                    style={{ background: s.hex }}
                  >
                    {on && <Check className="size-4 text-white" />}
                  </button>
                );
              })}
              <label
                className={clsx(
                  "relative grid size-10 cursor-pointer place-items-center rounded-full ring-1 ring-line-2 transition hover:ring-ink/40",
                  custom && "ring-2 ring-ink ring-offset-2",
                )}
                style={custom ? { background: d.brandColor } : undefined}
                title="Custom color"
              >
                <Pipette className={clsx("size-4", custom ? "text-white" : "text-ink-2")} />
                <input type="color" value={d.brandColor} onChange={(e) => set({ brandColor: e.target.value })} className="absolute inset-0 size-full cursor-pointer opacity-0" aria-label="Custom brand color" />
              </label>
              <span className="ml-1 font-mono text-[13px] uppercase text-ink-3">{d.brandColor}</span>
            </div>
          </Panel>
        </div>

        <BrandPreview d={d} />
      </div>
    </>
  );
}

export function BrandPreview({ d }: { d: OnboardingDraft }) {
  const card = getCard(d.cardId);
  const brand = { name: d.name || "Your business", color: d.brandColor, logo: d.logo };
  const message = renderTemplate(d.template, { firstName: "Jordan", companyName: brand.name, senderName: d.senderName.split(" ")[0] });
  return (
    <div className="lg:sticky lg:top-24 lg:self-start">
      <Eyebrow className="mb-3">Live preview</Eyebrow>
      <div className="relative rounded-3xl p-6 pb-10 ring-1 ring-line" style={{ background: `color-mix(in oklab, ${d.brandColor} 10%, #FFF9F0)` }}>
        <div className="relative mx-auto flex max-w-[340px] items-start">
          <div className="w-[58%] -rotate-3">
            <CardFront card={card} brandMark={brand} />
          </div>
          <div className="-ml-[16%] mt-10 w-[58%] rotate-2">
            <RecipientInside card={card} message={message} font="handwritten" brand={brand} accent={d.brandColor} senderName={d.senderName} recipientName={"Jordan"} />
          </div>
        </div>
        <p className="mt-6 text-center text-[13px] text-ink-3">What Jordan sees on their birthday.</p>
      </div>
    </div>
  );
}
