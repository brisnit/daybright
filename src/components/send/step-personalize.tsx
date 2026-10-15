"use client";

import { clsx } from "clsx";
import type { CardDesign, MessageFont, SendDraft } from "@/lib/types";
import { MESSAGE_FONTS } from "@/components/cards/card-art";
import { MessageAssistant } from "@/components/ai/message-assistant";
import { Field, Input, inputClass } from "@/components/ui/field";
import { ExtrasPanel } from "./extras-panel";
import { SendPreview } from "./send-preview";
import { StepHeading } from "./step-card";
import type { Relationship } from "./lib";

const RELATIONSHIPS: { id: Relationship; label: string }[] = [
  { id: "friend", label: "Friend" },
  { id: "family", label: "Family" },
  { id: "colleague", label: "Colleague" },
  { id: "customer", label: "Customer or client" },
];

export function StepPersonalize({
  card,
  draft,
  patch,
  errors,
  relationship,
  setRelationship,
  onChangeCard,
}: {
  card: CardDesign;
  draft: SendDraft;
  patch: (d: Partial<SendDraft>) => void;
  errors: Record<string, string>;
  relationship: Relationship;
  setRelationship: (r: Relationship) => void;
  onChangeCard: () => void;
}) {
  return (
    <div>
      <StepHeading
        kicker="Step two"
        title="Make it theirs"
        sub={
          <>
            Writing in <strong className="font-semibold text-ink">{card.name}</strong>.{" "}
            <button type="button" onClick={onChangeCard} className="font-semibold text-cobalt hover:underline">
              Change card
            </button>
          </>
        }
      />
      <div className="mt-6 grid gap-6 lg:mt-8 lg:grid-cols-[minmax(0,1fr)_420px] lg:gap-12">
        <div className="order-2 flex flex-col gap-6 lg:order-1">
          <section className="rounded-3xl bg-white p-5 ring-1 ring-line sm:p-6" aria-label="Who it's for">
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Their name"
                value={draft.recipientName}
                onChange={(e) => patch({ recipientName: e.target.value })}
                placeholder="e.g. Rosa Delgado"
                autoComplete="off"
                error={errors.recipientName}
                id="f-recipientName"
              />
              <Input
                label="Your name"
                value={draft.senderName}
                onChange={(e) => patch({ senderName: e.target.value })}
                placeholder="e.g. Sam"
                autoComplete="name"
                error={errors.senderName}
                id="f-senderName"
              />
            </div>
            <fieldset className="mt-5">
              <legend className="text-[13px] font-semibold text-ink-2">They&rsquo;re my&hellip;</legend>
              <div className="mt-2 flex flex-wrap gap-2">
                {RELATIONSHIPS.map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    aria-pressed={relationship === r.id}
                    onClick={() => setRelationship(r.id)}
                    className={clsx(
                      "h-9 rounded-full px-4 text-[13px] font-semibold ring-1 ring-inset transition",
                      relationship === r.id ? "bg-ink text-paper ring-ink" : "bg-paper text-ink-2 ring-line-2 hover:ring-ink/40",
                    )}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
              <p className="mt-1.5 text-[12px] text-ink-3">Helps the message assistant pick the right tone.</p>
            </fieldset>
          </section>

          <section className="rounded-3xl bg-white p-5 ring-1 ring-line sm:p-6" aria-label="Your message">
            <Field label="Your message" htmlFor="f-message" error={errors.message} hint={`${draft.message.length} characters. Short and sincere is perfect.`}>
              <textarea
                id="f-message"
                value={draft.message}
                onChange={(e) => patch({ message: e.target.value })}
                aria-invalid={!!errors.message || undefined}
                rows={4}
                placeholder={`Happy birthday${draft.recipientName ? `, ${draft.recipientName.split(" ")[0]}` : ""}! ...`}
                className={clsx(inputClass, "min-h-32 resize-y text-[17px] leading-relaxed")}
                style={{ fontFamily: MESSAGE_FONTS[draft.messageFont].style.fontFamily, fontSize: draft.messageFont === "handwritten" ? 22 : undefined }}
              />
            </Field>

            <MessageAssistant
              className="mt-4"
              value={draft.message}
              onChange={(v) => patch({ message: v })}
              context={{ recipientName: draft.recipientName, senderName: draft.senderName, relationship }}
            />

            <fieldset className="mt-6">
              <legend className="text-[13px] font-semibold text-ink-2">Lettering</legend>
              <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
                {(Object.keys(MESSAGE_FONTS) as MessageFont[]).map((f) => {
                  const on = draft.messageFont === f;
                  return (
                    <button
                      key={f}
                      type="button"
                      aria-pressed={on}
                      onClick={() => patch({ messageFont: f })}
                      className={clsx(
                        "flex h-20 flex-col items-start justify-between rounded-2xl px-3.5 py-3 text-left ring-1 ring-inset transition",
                        on ? "bg-cobalt-soft ring-2 ring-cobalt" : "bg-paper ring-line-2 hover:ring-ink/40",
                      )}
                    >
                      <span className="text-[20px] leading-none text-ink" style={{ ...MESSAGE_FONTS[f].style, fontSize: f === "handwritten" ? 26 : 19 }}>
                        Happy day
                      </span>
                      <span className={clsx("text-[12px] font-semibold", on ? "text-cobalt-deep" : "text-ink-3")}>{MESSAGE_FONTS[f].label}</span>
                    </button>
                  );
                })}
              </div>
            </fieldset>
          </section>

          <ExtrasPanel card={card} extras={draft.extras} senderName={draft.senderName} onChange={(x) => patch({ extras: x })} />
        </div>

        <aside className="order-1 lg:order-2">
          <div className="rounded-3xl bg-cream/70 p-4 ring-1 ring-inset ring-line lg:sticky lg:top-24 lg:p-5">
            <SendPreview card={card} draft={draft} />
          </div>
        </aside>
      </div>
    </div>
  );
}
