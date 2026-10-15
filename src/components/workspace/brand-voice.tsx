"use client";

import { useState } from "react";
import { ArrowRight, RefreshCw } from "lucide-react";
import type { BrandVoice, Business } from "@/lib/types";
import { useDemo } from "@/lib/store";
import { GENERIC_MESSAGE, sampleMessageForVoice, summarizeVoice, VOICE_ORDER, VOICE_PRESETS } from "@/lib/ai/voice";
import { suggestForCustomerSync } from "@/lib/ai/personalize";
import { getCard } from "@/lib/cards";
import { Panel } from "@/components/app/app-shell";
import { AIDemoLabel, Badge } from "@/components/ui/badges";
import { Button } from "@/components/ui/button";
import { ChoiceCard } from "@/components/ui/controls";
import { Input, Textarea } from "@/components/ui/field";
import { CardFront } from "@/components/cards/card-art";
import { Eyebrow } from "./automations-shared";

const PREVIEW_IDS = ["c-rosa", "c-marcus", "c-priya"];
const splitList = (s: string) => s.split(",").map((x) => x.trim()).filter(Boolean);

function PhraseInput({ label, value, onChange }: { label: string; value: string[]; onChange: (v: string[]) => void }) {
  const [text, setText] = useState(value.join(", "));
  return (
    <Input
      label={label}
      hint="Separate with commas."
      value={text}
      onChange={(e) => {
        setText(e.target.value);
        onChange(splitList(e.target.value));
      }}
    />
  );
}

export function BrandVoiceEditor({ draft, patchVoice }: { draft: Business; patchVoice: (v: Partial<BrandVoice>) => void }) {
  const customers = useDemo((s) => s.customers);
  const savedBusiness = useDemo((s) => s.business);
  const savedCards = useDemo((s) => s.savedCards);
  const v = draft.voice;
  const preview = PREVIEW_IDS.map((id) => customers.find((c) => c.id === id)).filter((c): c is NonNullable<typeof c> => !!c);
  const previewList = preview.length ? preview : customers.slice(0, 3);

  const choosePreset = (id: keyof typeof VOICE_PRESETS) => patchVoice({ ...VOICE_PRESETS[id].voice });
  const updateSummary = () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { summary, ...rest } = v;
    patchVoice({ summary: summarizeVoice(rest) });
  };
  const company = draft.name;
  const sender = draft.senderName.split(" ")[0] || "Maya";

  return (
    <Panel className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <Eyebrow>Brand voice</Eyebrow>
          <h2 className="font-display text-xl font-semibold tracking-tight">How your messages sound</h2>
          <p className="mt-1 text-[13px] text-ink-3">Applies to suggested card messages and AI personalization. Your templates stay exactly as you write them.</p>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {VOICE_ORDER.map((id) => (
          <ChoiceCard key={id} selected={v.preset === id} onClick={() => choosePreset(id)}>
            <p className="pr-6 font-semibold">{VOICE_PRESETS[id].label}</p>
            <p className="mt-1 text-[13px] text-ink-3">{VOICE_PRESETS[id].description}</p>
          </ChoiceCard>
        ))}
      </div>

      <div>
        <p className="text-[13px] font-semibold text-ink-2">Three words for your tone</p>
        <div className="mt-2 grid grid-cols-3 gap-2">
          {[0, 1, 2].map((i) => (
            <Input
              key={i}
              aria-label={`Tone word ${i + 1}`}
              value={v.tones[i] ?? ""}
              onChange={(e) => {
                const tones = [...v.tones];
                tones[i] = e.target.value;
                patchVoice({ tones });
              }}
            />
          ))}
        </div>
      </div>

      <Textarea label="A short writing sample" hint="A sentence or two you've actually sent customers." rows={3} value={v.sample} onChange={(e) => patchVoice({ sample: e.target.value })} />
      <div className="grid gap-4 sm:grid-cols-2">
        <PhraseInput key={`use-${v.preset}`} label="Phrases to use" value={v.usePhrases} onChange={(usePhrases) => patchVoice({ usePhrases })} />
        <PhraseInput key={`avoid-${v.preset}`} label="Phrases to avoid" value={v.avoidPhrases} onChange={(avoidPhrases) => patchVoice({ avoidPhrases })} />
      </div>
      <Input label="Preferred sign-off" value={v.signOff} onChange={(e) => patchVoice({ signOff: e.target.value })} className="max-w-xs" />

      <div className="rounded-2xl bg-lilac-soft/60 p-4 ring-1 ring-lilac/40">
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <p className="text-[13px] font-semibold text-ink-2">Brand voice summary</p>
            <AIDemoLabel />
          </div>
          <Button size="sm" variant="outline" icon={<RefreshCw className="size-3.5" />} onClick={updateSummary}>
            Update summary
          </Button>
        </div>
        <Textarea aria-label="Brand voice summary" rows={3} value={v.summary} onChange={(e) => patchVoice({ summary: e.target.value })} />
        <p className="mt-1.5 text-[12px] text-ink-3">Editable. Rebuild it from the fields above any time.</p>
      </div>

      {/* Before / after */}
      <div>
        <p className="mb-2 text-[13px] font-semibold text-ink-2">Before and after</p>
        <div className="grid gap-3 md:grid-cols-[1fr_auto_1fr] md:items-stretch">
          <div className="rounded-2xl bg-white p-4 ring-1 ring-line">
            <Badge>Generic message</Badge>
            <p className="mt-2 text-[14px] leading-relaxed text-ink-3">{GENERIC_MESSAGE("Jordan", company)}</p>
          </div>
          <ArrowRight className="mx-auto hidden size-5 self-center text-ink-3 md:block" aria-hidden />
          <div className="rounded-2xl bg-white p-4 ring-2 ring-mint">
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone="mint">In your voice</Badge>
              <AIDemoLabel />
            </div>
            <p className="mt-2 text-[14px] leading-relaxed text-ink">{sampleMessageForVoice(v, { firstName: "Jordan", sender, company })}</p>
          </div>
        </div>
      </div>

      {/* Updated suggestions */}
      <div>
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <p className="text-[13px] font-semibold text-ink-2">Updated message suggestions</p>
          <AIDemoLabel />
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          {previewList.map((c) => {
            const s = suggestForCustomerSync(c, draft);
            const before = suggestForCustomerSync(c, savedBusiness);
            const changed = s.message !== before.message;
            const card = getCard(s.cardId, savedCards);
            return (
              <div key={c.id} className="flex flex-col gap-3 rounded-2xl bg-white p-4 ring-1 ring-line">
                <div className="flex items-center gap-3">
                  <div className="w-10 shrink-0">
                    <CardFront card={card} shadow={false} className="ring-1 ring-line" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold">
                      {c.firstName} {c.lastName}
                    </p>
                    <p className="truncate text-[12px] text-ink-3">{c.interests.join(", ") || c.tags.join(", ")}</p>
                  </div>
                </div>
                <p className="flex-1 text-[14px] leading-relaxed text-ink">{s.message}</p>
                {changed && (
                  <p className="rounded-xl bg-cream/70 p-2.5 text-[12px] leading-snug text-ink-3">
                    <span className="font-semibold text-ink-2">Saved voice: </span>
                    {before.message}
                  </p>
                )}
                <ul className="flex flex-col gap-1 text-[12px] text-ink-3">
                  {s.reasons.slice(0, 2).map((r) => (
                    <li key={r}>Source: {r}</li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>
    </Panel>
  );
}
