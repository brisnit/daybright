"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { useState } from "react";
import { GENERIC_MESSAGE, VOICE_ORDER, VOICE_PRESETS, sampleMessageForVoice, summarizeVoice } from "@/lib/ai/voice";
import { simulate } from "@/lib/ai/simulate";
import type { BrandVoice } from "@/lib/types";
import { Chip, ChoiceCard } from "@/components/ui/controls";
import { Input, Textarea } from "@/components/ui/field";
import { AIDemoLabel } from "@/components/ui/badges";
import { Button } from "@/components/ui/button";
import type { OnboardingDraft } from "./model";
import { Eyebrow, Panel, StepHeader, TagInput } from "./bits";

type StepProps = { d: OnboardingDraft; set: (p: Partial<OnboardingDraft>) => void; step: number; total: number };

const EXTRA_TONES = ["Grateful", "Sincere", "Cheerful", "Down-to-earth"];
const TONE_POOL = Array.from(new Set([...VOICE_ORDER.flatMap((k) => VOICE_PRESETS[k].voice.tones), ...EXTRA_TONES]));

export function VoiceStep({ d, set, step, total }: StepProps) {
  const v = d.voice;
  const [busy, setBusy] = useState(false);
  const setVoice = (p: Partial<BrandVoice>) => set({ voice: { ...v, ...p } });

  const toggleTone = (t: string) => {
    if (v.tones.includes(t)) setVoice({ tones: v.tones.filter((x) => x !== t) });
    else setVoice({ tones: [...v.tones, t].slice(-3) });
  };

  const generate = async () => {
    setBusy(true);
    await simulate(1100);
    set({ voice: { ...v, summary: summarizeVoice(v) }, voiceGenerated: true });
    setBusy(false);
  };

  const company = d.name || "our company";
  const sender = d.senderName.split(" ")[0] || "Maya";
  const after = sampleMessageForVoice(v, { firstName: "Jordan", sender, company: d.name || undefined });

  return (
    <>
      <StepHeader step={step} total={total} title="How do you sound?">
        Teach the message assistant your voice. It shapes every birthday message and suggestion, and you can change it later in Brand settings.
      </StepHeader>

      <div className="grid gap-8 lg:grid-cols-[1fr_minmax(0,380px)]">
        <div className="space-y-5">
          <div>
            <Eyebrow className="mb-3">Start from a preset</Eyebrow>
            <div className="grid gap-3 sm:grid-cols-2">
              {VOICE_ORDER.map((k) => {
                const p = VOICE_PRESETS[k];
                return (
                  <ChoiceCard
                    key={k}
                    selected={v.preset === k}
                    onClick={() => set({ voice: { ...p.voice }, voiceGenerated: false })}
                  >
                    <p className="pr-6 font-display text-lg font-semibold tracking-tight text-ink">{p.label}</p>
                    <p className="mt-1 text-[13px] leading-snug text-ink-3">{p.description}</p>
                    <p className="mt-3 font-hand text-[19px] leading-tight text-ink-2">&ldquo;{p.voice.sample}&rdquo;</p>
                  </ChoiceCard>
                );
              })}
            </div>
          </div>

          <Panel className="space-y-5">
            <div>
              <div className="flex items-baseline justify-between">
                <p className="text-[13px] font-semibold text-ink-2">Three words for your tone</p>
                <p className="text-[12px] text-ink-3">{v.tones.length}/3</p>
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {TONE_POOL.map((t) => (
                  <Chip key={t} active={v.tones.includes(t)} onClick={() => toggleTone(t)} tone="cobalt">
                    {t}
                  </Chip>
                ))}
              </div>
            </div>
            <Textarea
              label="A short writing sample"
              hint="A thank-you note, an email line, anything that sounds like you."
              value={v.sample}
              onChange={(e) => setVoice({ sample: e.target.value })}
              rows={3}
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <TagInput label="Phrases to use" values={v.usePhrases} onChange={(usePhrases) => setVoice({ usePhrases })} placeholder="Type and press Enter" />
              <TagInput label="Phrases to avoid" tone="coral" values={v.avoidPhrases} onChange={(avoidPhrases) => setVoice({ avoidPhrases })} placeholder="e.g. valued customer" />
            </div>
            <Input label="Preferred sign-off" value={v.signOff} onChange={(e) => setVoice({ signOff: e.target.value })} placeholder="Warmly" />
            <div className="flex flex-wrap items-center gap-3 border-t border-line pt-5">
              <Button onClick={generate} disabled={busy} icon={<Sparkles className="size-4" />}>
                {busy ? "Reading your voice…" : d.voiceGenerated ? "Regenerate summary" : "Generate voice summary"}
              </Button>
              <span className="text-[13px] text-ink-3">Uses only what you entered above.</span>
            </div>
            <AnimatePresence initial={false}>
              {d.voiceGenerated && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                  <div className="rounded-2xl bg-lilac-soft/60 p-4 ring-1 ring-lilac/40">
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <p className="text-[13px] font-semibold text-ink-2">Your brand voice summary</p>
                      <AIDemoLabel />
                    </div>
                    <Textarea
                      aria-label="Brand voice summary"
                      value={v.summary}
                      onChange={(e) => setVoice({ summary: e.target.value })}
                      rows={4}
                      className="bg-white"
                    />
                    <p className="mt-2 text-[12px] text-ink-3">Edit freely. This is what the message assistant follows.</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </Panel>
        </div>

        <div className="lg:sticky lg:top-24 lg:self-start">
          <div className="flex items-center justify-between">
            <Eyebrow>Before and after</Eyebrow>
            <AIDemoLabel />
          </div>
          <div className="mt-3 space-y-3">
            <div className="rounded-3xl bg-white/60 p-5 ring-1 ring-line">
              <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-ink-3">A generic birthday email</p>
              <p className="mt-2 text-[15px] leading-relaxed text-ink-3 line-through decoration-coral/60 decoration-1">{GENERIC_MESSAGE("Jordan", company)}</p>
            </div>
            <div className="grid place-items-center text-ink-3" aria-hidden>
              <ArrowRight className="size-5 rotate-90" />
            </div>
            <motion.div key={after} initial={{ opacity: 0.4, y: 4 }} animate={{ opacity: 1, y: 0 }} className="rounded-3xl bg-[#FFFDF8] p-5 shadow-soft ring-1 ring-line" style={{ borderTop: `4px solid ${d.brandColor}` }}>
              <p className="text-[12px] font-semibold uppercase tracking-[0.16em]" style={{ color: d.brandColor }}>
                Sample birthday message, in your voice
              </p>
              <p className="mt-2 font-hand text-[26px] leading-[1.15] text-ink">{after}</p>
            </motion.div>
            <p className="text-[12px] text-ink-3">Birthday messages never include sales pitches or offers.</p>
          </div>
        </div>
      </div>
    </>
  );
}
