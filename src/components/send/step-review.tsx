"use client";

import { Loader2, Lock } from "lucide-react";
import type { CardDesign, SendDraft } from "@/lib/types";
import { CONSUMER, money } from "@/config/brand";
import { GIFT_MAP } from "@/data/gifts";
import { fmtTime } from "@/lib/dates";
import { CardFront, CardInside, MESSAGE_FONTS } from "@/components/cards/card-art";
import { Button } from "@/components/ui/button";
import { SimulatedNote } from "@/components/ui/badges";
import { ExtrasSummary } from "./send-preview";
import { StepHeading } from "./step-card";
import { firstName, fmtLongDate, totals, type StepId } from "./lib";

export function StepReview({
  card,
  draft,
  goTo,
  onPlace,
  placing,
}: {
  card: CardDesign;
  draft: SendDraft;
  goTo: (s: StepId) => void;
  onPlace: () => void;
  placing: boolean;
}) {
  const t = totals(draft);
  const gift = draft.gift ? GIFT_MAP[draft.gift.giftId] : null;
  const name = firstName(draft.recipientName);
  const when =
    draft.when === "now" ? "Right after checkout" : `${fmtLongDate(draft.date)} at ${fmtTime(draft.time || "09:00")}`;

  return (
    <div>
      <StepHeading kicker="Last look" title="Review and send" sub="Everything is editable until you send." />

      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_400px] lg:gap-12">
        <div className="flex flex-col gap-4">
          <div className="rounded-3xl bg-cream/70 p-4 ring-1 ring-inset ring-line sm:p-6">
            <div className="mx-auto grid max-w-md grid-cols-2 gap-3 sm:gap-5">
            <CardFront card={card} headline={draft.headline} live={!!draft.extras.animatedReveal} />
            <CardInside message={draft.message} font={draft.messageFont} recipientName={draft.recipientName} senderName={draft.senderName} accent={card.palette.a} />
            </div>
          </div>

          <ReviewRow title="Card" onEdit={() => goTo("card")}>
            {card.name}
            {card.source === "studio" && <span className="text-ink-3"> · your original</span>}
          </ReviewRow>
          <ReviewRow title="Message" onEdit={() => goTo("personalize")}>
            <p>
              To <strong className="font-semibold">{draft.recipientName}</strong>, from <strong className="font-semibold">{draft.senderName}</strong>
            </p>
            <p className="mt-1 line-clamp-2 text-ink-3">“{draft.message}”</p>
            <p className="mt-1 text-[13px] text-ink-3">Lettering: {MESSAGE_FONTS[draft.messageFont].label}</p>
            <ExtrasSummary draft={draft} className="mt-3" />
          </ReviewRow>
          <ReviewRow title="Gift" onEdit={() => goTo("gift")}>
            {gift ? (
              <>
                {gift.name} · {money(draft.gift!.amount)}
                <span className="block text-[13px] text-ink-3">
                  {gift.merchant} · {gift.kind === "digital" ? "Digital, delivered with the card" : gift.delivery}
                </span>
              </>
            ) : (
              <>Just the card. Lovely.</>
            )}
          </ReviewRow>
          <ReviewRow title="Delivery" onEdit={() => goTo("delivery")}>
            <p>{draft.recipientEmail}</p>
            <p className="text-ink-3">{when}</p>
            {gift?.addressRequired && (
              <p className="mt-1 text-[13px] text-ink-3">
                {draft.addressMode === "ask-recipient"
                  ? `${name || "They"} will enter a shipping address when they open the card.`
                  : `Ships to ${draft.address.line1}, ${draft.address.city}, ${draft.address.region} ${draft.address.postal}`}
              </p>
            )}
          </ReviewRow>
        </div>

        <aside>
          <div className="rounded-3xl bg-white p-5 shadow-soft ring-1 ring-line sm:p-6 lg:sticky lg:top-24">
            <h3 className="font-display text-2xl font-semibold tracking-tight text-ink">Order summary</h3>
            <dl className="mt-5 flex flex-col gap-3 text-[15px]">
              <Line label="Digital card" sub="One-time, provisional demo pricing" value={money(t.card)} />
              {gift && <Line label={gift.name} sub={gift.kind === "digital" ? "Gift card value" : "Gift"} value={money(t.gift)} />}
              {gift && <Line label="Shipping" value={t.shipping ? money(t.shipping) : "Free"} />}
              <div className="mt-1 flex items-baseline justify-between border-t border-dashed border-line-2 pt-4">
                <dt className="font-semibold text-ink">Total</dt>
                <dd className="font-grotesk text-3xl font-bold tracking-tight text-ink">{money(t.total, { cents: true })}</dd>
              </div>
            </dl>

            <SimulatedNote className="mt-5 w-full">Demo checkout — no payment is taken</SimulatedNote>
            <Button size="lg" className="mt-4 w-full" onClick={onPlace} disabled={placing} icon={placing ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <Lock className="size-4" aria-hidden />}>
              {placing ? "Sending…" : draft.when === "now" ? `Send now · ${money(t.total, { cents: true })}` : `Schedule card · ${money(t.total, { cents: true })}`}
            </Button>
            <p className="mt-3 text-[12px] leading-relaxed text-ink-3">
              {CONSUMER.note} No card details are collected in this prototype. Digital cards are included with business plans.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}

function ReviewRow({ title, onEdit, children }: { title: string; onEdit: () => void; children: React.ReactNode }) {
  return (
    <section className="flex gap-4 rounded-2xl bg-white p-4 ring-1 ring-line sm:p-5">
      <h3 className="w-20 shrink-0 pt-0.5 text-[11px] font-bold uppercase tracking-[0.16em] text-ink-3 sm:w-24">{title}</h3>
      <div className="min-w-0 flex-1 text-[15px] text-ink">{children}</div>
      <button type="button" onClick={onEdit} className="self-start text-[13px] font-semibold text-cobalt hover:underline" aria-label={`Edit ${title.toLowerCase()}`}>
        Edit
      </button>
    </section>
  );
}

function Line({ label, sub, value }: { label: string; sub?: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <dt>
        <span className="text-ink">{label}</span>
        {sub && <span className="block text-[12px] text-ink-3">{sub}</span>}
      </dt>
      <dd className="font-grotesk font-semibold tabular-nums text-ink">{value}</dd>
    </div>
  );
}
