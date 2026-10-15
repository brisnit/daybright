"use client";

import { CalendarClock, Send as SendIcon } from "lucide-react";
import type { SendDraft } from "@/lib/types";
import { GIFT_MAP } from "@/data/gifts";
import { fmtTime } from "@/lib/dates";
import { Input } from "@/components/ui/field";
import { ChoiceCard } from "@/components/ui/controls";
import { SimulatedNote } from "@/components/ui/badges";
import { StepHeading } from "./step-card";
import { firstName, fmtLongDate } from "./lib";

export function StepDelivery({
  draft,
  patch,
  errors,
  today,
}: {
  draft: SendDraft;
  patch: (d: Partial<SendDraft>) => void;
  errors: Record<string, string>;
  today: string;
}) {
  const name = firstName(draft.recipientName) || "They";
  const gift = draft.gift ? GIFT_MAP[draft.gift.giftId] : null;
  const setAddr = (k: keyof SendDraft["address"], v: string) => patch({ address: { ...draft.address, [k]: v } });

  return (
    <div className="mx-auto max-w-3xl">
      <StepHeading kicker="Step four" title="When should it arrive?" sub={`${name} gets an email with a sealed envelope to open. No app or account needed.`} />

      <section className="mt-8 rounded-3xl bg-white p-5 ring-1 ring-line sm:p-6">
        <Input
          id="f-recipientEmail"
          type="email"
          inputMode="email"
          autoComplete="off"
          label={`${firstName(draft.recipientName) || "Their"}${firstName(draft.recipientName) ? "’s" : ""} email`}
          value={draft.recipientEmail}
          onChange={(e) => patch({ recipientEmail: e.target.value })}
          placeholder="name@example.com"
          error={errors.recipientEmail}
          hint="We only use it to deliver this card."
        />

        <fieldset className="mt-6">
          <legend className="text-[13px] font-semibold text-ink-2">Delivery</legend>
          <div className="mt-2 grid gap-3 sm:grid-cols-2">
            <ChoiceCard selected={draft.when === "now"} onClick={() => patch({ when: "now" })}>
              <SendIcon className="size-5 text-cobalt" aria-hidden />
              <p className="mt-3 font-semibold text-ink">Send now</p>
              <p className="text-[13px] text-ink-3">Arrives within a minute of checkout.</p>
            </ChoiceCard>
            <ChoiceCard selected={draft.when === "schedule"} onClick={() => patch({ when: "schedule" })}>
              <CalendarClock className="size-5 text-coral-deep" aria-hidden />
              <p className="mt-3 font-semibold text-ink">Schedule it</p>
              <p className="text-[13px] text-ink-3">Land it on the day, at a time you choose.</p>
            </ChoiceCard>
          </div>
        </fieldset>

        {draft.when === "schedule" && (
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <Input
              id="f-date"
              type="date"
              label="Date"
              min={today}
              value={draft.date}
              onChange={(e) => patch({ date: e.target.value })}
              error={errors.date}
              hint={draft.date ? fmtLongDate(draft.date) : undefined}
            />
            <Input
              id="f-time"
              type="time"
              label="Time"
              optional
              value={draft.time}
              onChange={(e) => patch({ time: e.target.value })}
              hint={draft.time ? `Delivers at ${fmtTime(draft.time)}, your local time.` : "Leave blank and it goes out at 9:00 AM."}
            />
          </div>
        )}
      </section>

      {gift?.addressRequired && (
        <section className="mt-6 rounded-3xl bg-white p-5 ring-1 ring-line sm:p-6" aria-labelledby="addr-h">
          <h3 id="addr-h" className="font-semibold text-ink">
            Shipping the {gift.name.toLowerCase()}
          </h3>
          <p className="text-[13px] text-ink-3">{gift.delivery}.</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <ChoiceCard selected={draft.addressMode === "ask-recipient"} onClick={() => patch({ addressMode: "ask-recipient" })}>
              <p className="pr-6 font-semibold text-ink">Let {firstName(draft.recipientName) || "them"} enter their own address</p>
              <p className="mt-1 text-[13px] text-ink-3">They add it privately when they open the card. The gift ships after that.</p>
            </ChoiceCard>
            <ChoiceCard selected={draft.addressMode === "enter"} onClick={() => patch({ addressMode: "enter" })}>
              <p className="pr-6 font-semibold text-ink">I&rsquo;ll enter the address</p>
              <p className="mt-1 text-[13px] text-ink-3">Good if it&rsquo;s a surprise and you know where they&rsquo;ll be.</p>
            </ChoiceCard>
          </div>
          {draft.addressMode === "enter" && (
            <div className="mt-5 grid gap-3 sm:grid-cols-6">
              <Input id="f-line1" wrapClassName="sm:col-span-6" label="Street address" value={draft.address.line1} onChange={(e) => setAddr("line1", e.target.value)} error={errors.line1} autoComplete="off" />
              <Input id="f-city" wrapClassName="sm:col-span-3" label="City" value={draft.address.city} onChange={(e) => setAddr("city", e.target.value)} error={errors.city} autoComplete="off" />
              <Input id="f-region" wrapClassName="sm:col-span-1" label="State" value={draft.address.region} onChange={(e) => setAddr("region", e.target.value)} error={errors.region} autoComplete="off" />
              <Input id="f-postal" wrapClassName="sm:col-span-2" label="ZIP" value={draft.address.postal} onChange={(e) => setAddr("postal", e.target.value)} error={errors.postal} autoComplete="off" />
            </div>
          )}
          <SimulatedNote className="mt-4">Demo only. Nothing is shipped from this prototype.</SimulatedNote>
        </section>
      )}
    </div>
  );
}
