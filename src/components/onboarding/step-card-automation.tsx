"use client";

import { AnimatePresence, motion } from "framer-motion";
import { CalendarClock, Gift as GiftIcon, Plus, Sparkles } from "lucide-react";
import { useRef } from "react";
import { PRICING_COPY, getPlan, money } from "@/config/brand";
import { CARDS } from "@/data/cards";
import { GIFTS, GIFT_MAP } from "@/data/gifts";
import { TIMEZONES } from "@/lib/dates";
import { renderTemplate, TOKENS } from "@/lib/ai/messages";
import { sampleMessageForVoice } from "@/lib/ai/voice";
import { getCard } from "@/lib/cards";
import { CardTile } from "@/components/cards/card-tile";
import { CardFront } from "@/components/cards/card-art";
import { ChoiceCard, Toggle } from "@/components/ui/controls";
import { Field, Input, Select, Textarea } from "@/components/ui/field";
import { AIDemoLabel } from "@/components/ui/badges";
import { Button } from "@/components/ui/button";
import { automationSentence, type OnboardingDraft } from "./model";
import { RecipientInside } from "@/components/recipient/recipient-inside";
import { Eyebrow, Panel, StepHeader } from "./bits";

type StepProps = { d: OnboardingDraft; set: (p: Partial<OnboardingDraft>) => void; step: number; total: number };

export function CardStep({ d, set, step, total }: StepProps) {
  const ta = useRef<HTMLTextAreaElement>(null);
  const card = getCard(d.cardId);
  const brand = { name: d.name || "Your business", color: d.brandColor, logo: d.logo };
  const example = d.newCustomers.find((c) => c.firstName)?.firstName ?? "Jordan";
  const rendered = renderTemplate(d.template, { firstName: example, companyName: d.name, senderName: d.senderName.split(" ")[0] });

  const insert = (token: string) => {
    const el = ta.current;
    if (!el) return set({ template: d.template + token });
    const start = el.selectionStart ?? d.template.length;
    const end = el.selectionEnd ?? start;
    const before = d.template.slice(0, start);
    const pad = before && !/\s$/.test(before) ? " " : "";
    const next = before + pad + token + d.template.slice(end);
    set({ template: next });
    requestAnimationFrame(() => {
      el.focus();
      const pos = start + pad.length + token.length;
      el.setSelectionRange(pos, pos);
    });
  };

  const inVoice = () =>
    set({ template: sampleMessageForVoice(d.voice, { firstName: "{{first_name}}", sender: "{{sender_name}}", company: "{{company_name}}" }) });

  return (
    <>
      <StepHeader step={step} total={total} title="Choose your go-to card.">
        This is the default for birthday automation. You can personalize individual customers later, or make an original design in Card Studio.
      </StepHeader>

      <div className="grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 lg:grid-cols-5">
        {CARDS.map((c) => (
          <CardTile key={c.id} card={c} onClick={() => set({ cardId: c.id })} selected={d.cardId === c.id} />
        ))}
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_minmax(0,340px)]">
        <Panel>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="font-display text-2xl font-semibold tracking-tight text-ink">Default message</p>
            <Button size="sm" variant="soft" onClick={inVoice} icon={<Sparkles className="size-4" />}>
              Write it in our voice
            </Button>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="text-[13px] font-semibold text-ink-2">Insert</span>
            {TOKENS.map((t) => (
              <button
                key={t.token}
                type="button"
                onClick={() => insert(t.token)}
                className="inline-flex h-8 items-center gap-1 rounded-full bg-cobalt-soft px-3 text-[13px] font-semibold text-cobalt-deep transition hover:bg-[#d6defe]"
              >
                <Plus className="size-3.5" />
                {t.label}
              </button>
            ))}
          </div>
          <Textarea ref={ta} aria-label="Default message template" value={d.template} onChange={(e) => set({ template: e.target.value })} rows={4} className="mt-3 font-mono text-[14px]" />
          <div className="mt-4 rounded-2xl bg-paper p-4 ring-1 ring-line">
            <div className="flex items-center justify-between gap-2">
              <Eyebrow>What {example} will read</Eyebrow>
              <AIDemoLabel>Example</AIDemoLabel>
            </div>
            <p className="mt-2 font-hand text-[24px] leading-[1.2] text-ink">{rendered}</p>
          </div>
        </Panel>
        <div className="lg:sticky lg:top-24 lg:self-start">
          <Eyebrow className="mb-3">Preview</Eyebrow>
          <div className="mx-auto flex max-w-[320px] items-start">
            <div className="w-[56%] -rotate-3">
              <CardFront card={card} brandMark={brand} />
            </div>
            <div className="-ml-[12%] mt-8 w-[56%] rotate-2">
              <RecipientInside card={card} message={rendered} font="handwritten" brand={brand} accent={d.brandColor} senderName={d.senderName} recipientName={example} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export function AutomationStep({ d, set, step, total }: StepProps) {
  const gift = GIFT_MAP[d.giftId];
  const plan = getPlan(d.planId);
  return (
    <>
      <StepHeader step={step} total={total} title="Set it to celebrate.">
        Birthdays are handled on time, every time. Cards only by default; gifts are something you switch on deliberately.
      </StepHeader>

      <div className="grid gap-5 lg:grid-cols-2">
        <Panel className="space-y-4">
          <div className="flex items-center gap-2">
            <CalendarClock className="size-5 text-cobalt" />
            <p className="font-semibold text-ink">When cards go out</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Send time" type="time" value={d.sendTime} onChange={(e) => set({ sendTime: e.target.value })} />
            <Select label="Timezone" value={d.timezone} onChange={(e) => set({ timezone: e.target.value })}>
              {TIMEZONES.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.label}
                </option>
              ))}
            </Select>
          </div>
          <Field label="Before sending">
            <div className="grid gap-3 sm:grid-cols-2">
              <ChoiceCard selected={d.approval === "review"} onClick={() => set({ approval: "review" })}>
                <p className="pr-6 font-semibold text-ink">Review first</p>
                <p className="mt-0.5 text-[13px] text-ink-3">Cards wait for your OK a few days ahead.</p>
              </ChoiceCard>
              <ChoiceCard selected={d.approval === "auto"} onClick={() => set({ approval: "auto" })}>
                <p className="pr-6 font-semibold text-ink">Send automatically</p>
                <p className="mt-0.5 text-[13px] text-ink-3">Hands-off. You can still edit or skip any card.</p>
              </ChoiceCard>
            </div>
          </Field>
        </Panel>

        <Panel className="space-y-4">
          <div className="flex items-center gap-2">
            <GiftIcon className="size-5 text-coral-deep" />
            <p className="font-semibold text-ink">Gifts</p>
          </div>
          <Toggle
            checked={d.giftOn}
            onChange={(giftOn) => set({ giftOn })}
            label="Include a gift with birthday cards"
            description="Off means card only. Gifts are billed separately from your plan."
          />
          <AnimatePresence initial={false}>
            {d.giftOn && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                <div className="grid gap-4 pt-1 sm:grid-cols-2">
                  <Select
                    label="Gift"
                    value={d.giftId}
                    onChange={(e) => {
                      const g = GIFT_MAP[e.target.value];
                      set({ giftId: e.target.value, giftAmount: g.amounts ? g.amounts[1] ?? g.amounts[0] : g.price ?? 0 });
                    }}
                  >
                    {GIFTS.map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.name}
                        {g.price ? ` (${money(g.price)}${g.shipping ? ` + ${money(g.shipping)} shipping` : ""})` : ""}
                      </option>
                    ))}
                  </Select>
                  {gift?.amounts ? (
                    <Select label="Amount" value={d.giftAmount} onChange={(e) => set({ giftAmount: +e.target.value })}>
                      {gift.amounts.map((a) => (
                        <option key={a} value={a}>
                          {money(a)}
                        </option>
                      ))}
                    </Select>
                  ) : (
                    <Field label="Price">
                      <p className="py-2.5 text-[15px] text-ink-2">{gift ? `${money(gift.price ?? 0)} + ${money(gift.shipping)} shipping` : ""}</p>
                    </Field>
                  )}
                  <Input
                    label="Monthly gift budget"
                    type="number"
                    min={0}
                    step={10}
                    value={d.budget}
                    onChange={(e) => set({ budget: Math.max(0, +e.target.value || 0) })}
                    hint="Gifts over budget are held for review. Cards still send."
                  />
                  <div className="flex items-end pb-1">
                    <Toggle size="sm" checked={d.vipOnly} onChange={(vipOnly) => set({ vipOnly })} label="VIP customers only" />
                  </div>
                </div>
                {!plan.limits.giftBudgetControls && (
                  <p className="mt-3 text-[13px] text-ink-3">Detailed gift budget controls are part of Growth and Scale. In this demo you can try them on any plan.</p>
                )}
              </motion.div>
            )}
          </AnimatePresence>
          <p className="text-[13px] text-ink-3">{PRICING_COPY.includes}</p>
        </Panel>
      </div>

      <div className="mt-6 rounded-3xl bg-ink p-6 text-paper sm:p-7">
        <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-paper/60">In plain words</p>
        <motion.p key={automationSentence(d)} initial={{ opacity: 0.5 }} animate={{ opacity: 1 }} className="mt-2 font-display text-[22px] leading-snug tracking-tight sm:text-[26px]">
          {automationSentence(d)}
        </motion.p>
      </div>
    </>
  );
}
