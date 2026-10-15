"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { clsx } from "clsx";
import { ArrowRight, ChevronDown, Pencil, Plus, RotateCcw, Shuffle, Sparkles } from "lucide-react";
import type { CardDesign, Motif, PaletteId, StudioBrief, StudioStyle, Tone } from "@/lib/types";
import { generateConcepts, INTEREST_SUGGESTIONS, OCCASIONS, STYLE_LABEL, surprisePrompt, TONES, type Concept } from "@/lib/ai/studio";
import { useDemo } from "@/lib/store";
import { PRICING_COPY } from "@/config/brand";
import { AIDemoLabel } from "@/components/ui/badges";
import { Button } from "@/components/ui/button";
import { Chip, Toggle } from "@/components/ui/controls";
import { ConceptGrid } from "./concept-grid";
import { Generating } from "./generating";
import { PalettePicker, StylePicker } from "./pickers";
import { StudioEditor } from "./studio-editor";
import { MOTIF_INTEREST, RECIPIENT_OPTIONS, hintsFromText, paletteLabel, progressSteps, toConcept, toneLabel, type ParsedHints, type RecipientOption } from "./studio-helpers";

export const STUDIO_EXAMPLE_PROMPT = "Create a birthday card for a customer who loves gardening. Colorful, warm, and a little funny.";

type Manual = Partial<{ recipient: RecipientOption; style: StudioStyle | "any"; palette: PaletteId | "any"; tone: Tone; occasion: string }>;
type Phase = "compose" | "generating" | "results";

const INTEREST_MOTIF: Record<string, Motif> = Object.fromEntries(Object.entries(MOTIF_INTEREST).map(([m, l]) => [l, m as Motif]));

/**
 * AI Card Studio. Sentence in, three original concepts out, then a controllable editor.
 * Every value the sentence suggests is shown as a control the user can override.
 */
export function CardStudio({
  mode,
  initialPrompt,
  initialCard,
}: {
  mode: "consumer" | "business";
  initialPrompt?: string | null;
  initialCard?: CardDesign | null;
}) {
  const business = mode === "business";
  const reduce = useReducedMotion();
  const biz = useDemo((s) => s.business);

  const [prompt, setPrompt] = useState(initialPrompt ?? initialCard?.prompt ?? "");
  const [hints, setHints] = useState<ParsedHints>(() => hintsFromText(initialPrompt ?? initialCard?.prompt ?? ""));
  const [manual, setManual] = useState<Manual>({});
  const [removed, setRemoved] = useState<string[]>([]);
  const [added, setAdded] = useState<string[]>([]);
  const [newInterest, setNewInterest] = useState("");
  const [branding, setBranding] = useState(business);
  const [controlsOpen, setControlsOpen] = useState(true);

  const [phase, setPhase] = useState<Phase>(initialCard ? "results" : "compose");
  const [steps, setSteps] = useState<string[]>([]);
  const [concepts, setConcepts] = useState<Concept[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [editing, setEditing] = useState<{ concept: Concept; note: string; savedId: string | null } | null>(
    initialCard ? { concept: toConcept(initialCard), note: "Opened from your cards", savedId: initialCard.id } : null,
  );
  const [lastBrief, setLastBrief] = useState<StudioBrief | null>(null);
  const [round, setRound] = useState(0);
  const resultsRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<HTMLDivElement>(null);
  const autoRan = useRef(false);

  // Read the sentence into control suggestions as the user types.
  useEffect(() => {
    const t = setTimeout(() => setHints(hintsFromText(prompt)), 280);
    return () => clearTimeout(t);
  }, [prompt]);

  const defaults = { recipient: (business ? "customer" : "friend") as RecipientOption, style: "any" as const, palette: "any" as const, tone: "warm" as Tone };
  function resolve(h: ParsedHints) {
    const interests = [...new Set([...h.interests.filter((i) => !removed.includes(i)), ...added])];
    return {
      occasion: manual.occasion ?? "Birthday",
      recipient: manual.recipient ?? h.recipient ?? defaults.recipient,
      style: manual.style ?? h.style ?? defaults.style,
      palette: manual.palette ?? (h.palette === "brand" && !business ? undefined : h.palette) ?? defaults.palette,
      tone: manual.tone ?? h.tone ?? defaults.tone,
      interests,
    };
  }
  const controls = resolve(hints);
  const fromIdea = (k: keyof Manual) => manual[k] === undefined && hints[k as keyof ParsedHints] !== undefined;
  const motif: Motif = INTEREST_MOTIF[controls.interests[0]] ?? "star";
  const brandMark = business && branding ? { name: biz.name, color: biz.brandColor, logo: biz.logoDataUrl } : null;

  const readout = useMemo(() => {
    const bits: string[] = [];
    hints.interests.forEach((i) => bits.push(i.toLowerCase()));
    if (hints.recipient) bits.push(RECIPIENT_OPTIONS.find((r) => r.id === hints.recipient)?.label.toLowerCase() ?? "");
    (hints.toneWords.length ? hints.toneWords : hints.tone ? [hints.tone] : []).forEach((t) => bits.push(toneLabel(t).toLowerCase()));
    if (hints.style) bits.push(STYLE_LABEL[hints.style].toLowerCase());
    if (hints.palette && (business || hints.palette !== "brand")) bits.push(`${paletteLabel(hints.palette).toLowerCase()} palette`);
    return bits.filter(Boolean);
  }, [hints, business]);

  function scrollTo(el: HTMLElement | null) {
    if (!el) return;
    requestAnimationFrame(() => el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" }));
  }

  async function generate(opts: { prompt?: string; again?: boolean } = {}) {
    const text = (opts.prompt ?? prompt).trim() || STUDIO_EXAMPLE_PROMPT;
    if (!prompt.trim() && !opts.prompt) setPrompt(text);
    const h = hintsFromText(text);
    setHints(h);
    const c = resolve(h);
    const brief: StudioBrief = {
      prompt: text,
      occasion: c.occasion,
      recipient: c.recipient,
      interests: c.interests,
      style: c.style,
      palette: c.palette,
      tone: c.tone,
      useBranding: false,
    };
    const nextRound = opts.again ? round + 1 : round;
    setRound(nextRound);
    setLastBrief(brief);
    setSteps(progressSteps(brief, !!brandMark, h.toneWords));
    setPhase("generating");
    setSelected(null);
    setEditing(null);
    setControlsOpen(false);
    scrollTo(resultsRef.current);
    // Controls are the source of truth: the generator reads interests, not the raw sentence.
    const genBrief: StudioBrief = { ...brief, prompt: `${c.interests.join(" ")}${nextRound ? ` r${nextRound}` : ""}` };
    const out = await generateConcepts(genBrief, biz.brandColor);
    setConcepts(out.map((x) => ({ ...x, prompt: text })));
    setPhase("results");
  }

  // Auto-generate when arriving with ?prompt=
  useEffect(() => {
    if (autoRan.current || !initialPrompt || initialCard) return;
    autoRan.current = true;
    generate({ prompt: initialPrompt });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function choose(i: number) {
    setSelected(i);
    setEditing({ concept: concepts[i], note: `Concept ${i + 1}`, savedId: null });
    scrollTo(editorRef.current);
  }

  function addInterest(raw: string) {
    const v = raw.trim().replace(/\s+/g, " ");
    if (!v) return;
    const label = v.charAt(0).toUpperCase() + v.slice(1);
    setRemoved((r) => r.filter((x) => x !== label));
    if (!controls.interests.includes(label)) setAdded((a) => [...a, label]);
    setNewInterest("");
  }
  function toggleInterest(label: string) {
    if (controls.interests.includes(label)) {
      setAdded((a) => a.filter((x) => x !== label));
      if (hints.interests.includes(label)) setRemoved((r) => [...r, label]);
    } else addInterest(label);
  }

  const collapsed = phase !== "compose" && !controlsOpen;

  return (
    <div className={clsx(business ? "" : "pb-20")}>
      {/* ---------------- Brief ---------------- */}
      <section aria-labelledby="brief-h">
        <h2 id="brief-h" className="sr-only">
          Describe the card
        </h2>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            generate();
          }}
          className="relative overflow-hidden rounded-[2rem] bg-white p-4 shadow-lift ring-1 ring-line sm:p-7"
        >
          <div className="flex items-center justify-between gap-3">
            <label htmlFor="studio-prompt" className="text-[12px] font-bold uppercase tracking-[0.14em] text-ink-3">
              Describe the card…
            </label>
            <AIDemoLabel>Demo studio</AIDemoLabel>
          </div>
          <textarea
            id="studio-prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                generate();
              }
            }}
            rows={collapsed ? 2 : 3}
            placeholder={STUDIO_EXAMPLE_PROMPT}
            className="mt-2 w-full resize-none bg-transparent font-display text-[22px] leading-[1.2] tracking-tight text-ink placeholder:text-ink-3/45 focus:outline-none sm:text-[30px]"
          />
          <div className="mt-2 min-h-7" aria-live="polite">
            {readout.length > 0 ? (
              <p className="flex flex-wrap items-center gap-1.5 text-[13px] text-ink-3">
                <Sparkles className="size-3.5 text-lilac-deep" aria-hidden />
                <span>Picked up:</span>
                {readout.map((r) => (
                  <span key={r} className="rounded-full bg-lilac-soft px-2 py-0.5 font-semibold text-lilac-deep">
                    {r}
                  </span>
                ))}
              </p>
            ) : (
              <p className="text-[13px] text-ink-3">Mention who it’s for, what they love and the feel you want. Every detail stays editable below.</p>
            )}
          </div>
          <div className="mt-4 flex flex-col-reverse gap-2 border-t border-line pt-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  const p = surprisePrompt(Date.now() + prompt.length);
                  setPrompt(p === prompt ? surprisePrompt(Date.now() + 1) : p);
                  setManual({});
                  setAdded([]);
                  setRemoved([]);
                }}
                icon={<Shuffle className="size-4" aria-hidden />}
              >
                Surprise me
              </Button>
              {phase !== "compose" && (
                <Button variant="ghost" onClick={() => setControlsOpen((o) => !o)} aria-expanded={controlsOpen} iconRight={<ChevronDown className={clsx("size-4 transition", controlsOpen && "rotate-180")} aria-hidden />}>
                  {controlsOpen ? "Hide details" : "Edit details"}
                </Button>
              )}
            </div>
            <Button type="submit" size="lg" disabled={phase === "generating"} icon={<Sparkles className="size-4" aria-hidden />}>
              {phase === "compose" ? "Generate three concepts" : "Generate again from this brief"}
            </Button>
          </div>
        </form>

        {/* Guided controls */}
        <AnimatePresence initial={false}>
          {!collapsed && (
            <motion.div
              initial={reduce ? { opacity: 0 } : { opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="mt-4 grid gap-x-8 gap-y-6 rounded-[2rem] bg-cream/70 p-4 ring-1 ring-line sm:p-7 lg:grid-cols-2">
                <Group label="Occasion">
                  <div className="flex flex-wrap gap-1.5">
                    {OCCASIONS.map((o) => (
                      <Chip key={o} active={controls.occasion === o} onClick={() => setManual((m) => ({ ...m, occasion: o }))}>
                        {o}
                      </Chip>
                    ))}
                  </div>
                </Group>
                <Group label="Who it's for" auto={fromIdea("recipient")}>
                  <div className="flex flex-wrap gap-1.5">
                    {RECIPIENT_OPTIONS.map((r) => (
                      <Chip key={r.id} active={controls.recipient === r.id} onClick={() => setManual((m) => ({ ...m, recipient: r.id }))}>
                        {r.label}
                      </Chip>
                    ))}
                  </div>
                </Group>
                <Group label="What they love" auto={hints.interests.length > 0 && !added.length} className="lg:col-span-2">
                  <div className="flex flex-wrap items-center gap-1.5">
                    {[...new Set([...controls.interests, ...INTEREST_SUGGESTIONS])].map((i) => (
                      <Chip key={i} tone="cobalt" active={controls.interests.includes(i)} onClick={() => toggleInterest(i)}>
                        {i}
                      </Chip>
                    ))}
                    <span className="inline-flex h-8 items-center rounded-full bg-white pl-3 ring-1 ring-inset ring-line-2 focus-within:ring-2 focus-within:ring-cobalt">
                      <label htmlFor="add-interest" className="sr-only">
                        Add an interest
                      </label>
                      <input
                        id="add-interest"
                        value={newInterest}
                        onChange={(e) => setNewInterest(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            addInterest(newInterest);
                          }
                        }}
                        placeholder="Add your own"
                        className="w-28 bg-transparent text-[13px] focus:outline-none"
                      />
                      <button type="button" onClick={() => addInterest(newInterest)} aria-label="Add interest" className="grid size-8 place-items-center rounded-full text-ink-3 hover:text-ink">
                        <Plus className="size-4" aria-hidden />
                      </button>
                    </span>
                  </div>
                </Group>
                <Group label="Visual style" auto={fromIdea("style")} className="lg:col-span-2">
                  <StylePicker value={controls.style} onChange={(v) => setManual((m) => ({ ...m, style: v }))} motif={motif} auto={manual.style === undefined ? hints.style : null} />
                </Group>
                <Group label="Colors" auto={fromIdea("palette")}>
                  <PalettePicker
                    value={controls.palette}
                    onChange={(v) => setManual((m) => ({ ...m, palette: v }))}
                    brandColor={business ? biz.brandColor : undefined}
                    auto={manual.palette === undefined ? hints.palette : null}
                    size="sm"
                  />
                </Group>
                <div className="space-y-6">
                  <Group label="Tone" auto={fromIdea("tone")}>
                    <div className="flex flex-wrap gap-1.5">
                      {TONES.map((t) => (
                        <Chip key={t.id} tone="coral" active={controls.tone === t.id} onClick={() => setManual((m) => ({ ...m, tone: t.id }))}>
                          {t.label}
                        </Chip>
                      ))}
                    </div>
                  </Group>
                  {business && (
                    <div className="rounded-2xl bg-white p-4 ring-1 ring-line">
                      <Toggle
                        checked={branding}
                        onChange={setBranding}
                        label="Add our branding"
                        description={`Places the ${biz.name} logo on the front and signs the inside. Brand colors are a separate choice above.`}
                      />
                    </div>
                  )}
                </div>
                {Object.keys(manual).length + added.length + removed.length > 0 && (
                  <div className="lg:col-span-2">
                    <button
                      type="button"
                      onClick={() => {
                        setManual({});
                        setAdded([]);
                        setRemoved([]);
                      }}
                      className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-ink-3 hover:text-ink"
                    >
                      <RotateCcw className="size-3.5" aria-hidden /> Reset details to match the sentence
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* ---------------- Results ---------------- */}
      <div ref={resultsRef} className="scroll-mt-24">
        {phase === "generating" && (
          <section className="mt-12" aria-label="Generating concepts">
            <SectionTitle eyebrow="Working on it" title="Sketching three directions" />
            <div className="mt-6">
              <Generating steps={steps} />
            </div>
          </section>
        )}

        {phase === "results" && concepts.length > 0 && (
          <section className="mt-12" aria-labelledby="concepts-h">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <SectionTitle
                id="concepts-h"
                eyebrow="Three original concepts"
                title={selected == null ? "Pick one to make it yours" : "Comparing concepts"}
                sub={lastBrief ? `From “${truncate(lastBrief.prompt, 90)}”` : undefined}
              />
              <Button variant="outline" size="sm" onClick={() => generate({ again: true })} icon={<RotateCcw className="size-3.5" aria-hidden />}>
                Three new concepts
              </Button>
            </div>
            <p className="mt-2 text-[13px] text-ink-3">
              Curated demo examples that respond to your brief. No live AI model is used in this prototype.
            </p>
            <div className="mt-6">
              <ConceptGrid concepts={concepts} selectedIndex={selected} onSelect={choose} brandMark={brandMark} />
            </div>
          </section>
        )}
      </div>

      <div ref={editorRef} className="scroll-mt-24">
        {editing && (
          <section className="mt-14 border-t border-line pt-10" aria-labelledby="editor-h">
            <SectionTitle
              id="editor-h"
              eyebrow={editing.savedId ? "Editing a saved card" : `Editing ${editing.note.toLowerCase()}`}
              title="Make it yours"
              sub="Refine with a sentence, recolor, rewrite the headline and write the message. Every change is a version you can go back to."
            />
            <div className="mt-8">
              <StudioEditor
                key={editing.concept.id}
                initial={editing.concept}
                initialNote={editing.note}
                initialSavedId={editing.savedId}
                mode={mode}
                brief={
                  lastBrief ?? {
                    prompt,
                    occasion: controls.occasion,
                    recipient: controls.recipient,
                    interests: controls.interests,
                    style: controls.style,
                    palette: controls.palette,
                    tone: controls.tone,
                    useBranding: false,
                  }
                }
                brandColor={business ? biz.brandColor : undefined}
                brandMark={brandMark}
              />
            </div>
          </section>
        )}
      </div>

      {phase === "compose" && (
        <div className="mt-6 flex flex-col gap-2 text-[13px] text-ink-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="flex items-center gap-1.5">
            <Pencil className="size-3.5" aria-hidden /> Headlines are set as real text, separate from the artwork, so they stay editable.
          </p>
          {business ? (
            <p>AI card creation: {PRICING_COPY.aiAllowance}</p>
          ) : (
            <p className="flex items-center gap-1">
              Then personalize, add an optional gift and send <ArrowRight className="size-3.5" aria-hidden />
            </p>
          )}
        </div>
      )}
      {business && phase === "compose" && <p className="mt-1 text-right text-[12px] text-ink-3">{PRICING_COPY.aiNote}</p>}
    </div>
  );
}

function Group({ label, auto, children, className }: { label: string; auto?: boolean; children: React.ReactNode; className?: string }) {
  return (
    <fieldset className={clsx("min-w-0", className)}>
      <legend className="mb-2 flex items-center gap-2 text-[13px] font-bold text-ink-2">
        {label}
        {auto && <span className="rounded-full bg-lilac-soft px-1.5 py-px text-[10px] font-bold uppercase tracking-wide text-lilac-deep">From your idea</span>}
      </legend>
      {children}
    </fieldset>
  );
}

function SectionTitle({ eyebrow, title, sub, id }: { eyebrow: string; title: string; sub?: string; id?: string }) {
  return (
    <div>
      <p className="text-[12px] font-bold uppercase tracking-[0.14em] text-coral-deep">{eyebrow}</p>
      <h2 id={id} className="mt-1 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
        {title}
      </h2>
      {sub && <p className="mt-1.5 max-w-2xl text-[15px] text-ink-2">{sub}</p>}
    </div>
  );
}

const truncate = (s: string, n: number) => (s.length > n ? `${s.slice(0, n - 1)}…` : s);
