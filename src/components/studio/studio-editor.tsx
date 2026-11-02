"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { clsx } from "clsx";
import {
  ArrowRight,
  BadgeCheck,
  Bookmark,
  Briefcase,
  CornerDownLeft,
  History,
  Loader2,
  RefreshCw,
  Send,
  ShieldCheck,
  Sparkles,
  Wand2,
} from "lucide-react";
import type { PaletteId, StudioBrief } from "@/lib/types";
import { recolor, refineConcept, rewriteHeadline, type Concept } from "@/lib/ai/studio";
import { useDemo } from "@/lib/store";
import { emptyDraft } from "@/data/seed";
import { BRAND, PRICING_COPY } from "@/config/brand";
import { CardFront, CardInside } from "@/components/cards/card-art";
import { MessageAssistant } from "@/components/ai/message-assistant";
import { AIDemoLabel } from "@/components/ui/badges";
import { Button, ButtonLink } from "@/components/ui/button";
import { Segmented } from "@/components/ui/controls";
import { Input } from "@/components/ui/field";
import { inputClass } from "@/components/ui/field";
import { Modal } from "@/components/ui/overlay";
import { useToast } from "@/components/ui/toast";
import { PalettePicker } from "./pickers";
import { REFINE_CHIPS, paletteLabel, toCardDesign, toneLabel } from "./studio-helpers";

type Version = { concept: Concept; note: string };
type BrandMark = { name: string; color: string; logo?: string | null } | null;

export function StudioEditor({
  initial,
  initialNote = "Original concept",
  initialSavedId = null,
  mode,
  brief,
  brandColor,
  brandMark,
}: {
  initial: Concept;
  initialNote?: string;
  initialSavedId?: string | null;
  mode: "consumer" | "business";
  brief: StudioBrief;
  brandColor?: string;
  brandMark: BrandMark;
}) {
  const business = mode === "business";
  const router = useRouter();
  const toast = useToast();
  const reduce = useReducedMotion();
  const biz = useDemo((s) => s.business);
  const saveCard = useDemo((s) => s.saveCard);
  const updateCard = useDemo((s) => s.updateCard);
  const setDraft = useDemo((s) => s.setDraft);

  const [hist, setHist] = useState<{ versions: Version[]; active: number }>({ versions: [{ concept: initial, note: initialNote }], active: 0 });
  const { versions, active } = hist;
  const setActive = (i: number) => setHist((h) => ({ ...h, active: i }));
  const [instruction, setInstruction] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [lastNote, setLastNote] = useState<string | null>(null);
  const [side, setSide] = useState<"front" | "inside">("front");
  const [message, setMessage] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [senderName, setSenderName] = useState("");
  const [savedId, setSavedId] = useState<string | null>(initialSavedId);
  const [templateOpen, setTemplateOpen] = useState(false);
  const [bizInfoOpen, setBizInfoOpen] = useState(false);
  const savedCard = useDemo((s) => (savedId ? s.savedCards.find((c) => c.id === savedId) : undefined));

  const current = versions[active].concept;
  const sender = business ? biz.senderName : senderName;

  function push(concept: Concept, note: string) {
    setHist((h) => ({ versions: [...h.versions, { concept, note }], active: h.versions.length }));
    setLastNote(note);
  }

  function setHeadline(h: string) {
    setHist((s) => ({ ...s, versions: s.versions.map((v, i) => (i === s.active ? { ...v, concept: { ...v.concept, headline: h } } : v)) }));
  }

  async function refine(text: string) {
    const t = text.trim();
    if (!t || busy) return;
    setBusy(t);
    setLastNote(null);
    const res = await refineConcept(current, t, brandColor);
    push(res.concept, res.changeNote);
    setInstruction("");
    setBusy(null);
  }

  function applyPalette(id: PaletteId | "any") {
    if (id === "any") return;
    push(recolor(current, id, brandColor), `Changed colors to ${paletteLabel(id).toLowerCase()}`);
  }

  function rewrite() {
    push(rewriteHeadline(current, brief.tone), `Rewrote the headline (${toneLabel(brief.tone).toLowerCase()})`);
  }

  function save(opts: { approved?: boolean; quiet?: boolean } = {}) {
    const id = savedId ?? current.id;
    // Changing approved artwork or text means it needs approving again before automations use it.
    const unchanged =
      !!savedCard &&
      savedCard.headline === current.headline &&
      savedCard.art === current.art &&
      savedCard.motif === current.motif &&
      savedCard.variant === current.variant &&
      JSON.stringify(savedCard.palette) === JSON.stringify(current.palette);
    const card = toCardDesign(current, { id, headline: current.headline, approved: opts.approved ?? (unchanged ? savedCard?.approvedForAutomation : false) ?? false });
    saveCard({ ...card, prompt: brief.prompt || card.prompt });
    setSavedId(id);
    if (!opts.quiet) {
      toast({
        title: savedId ? "Saved your latest version" : business ? "Saved to Cards" : "Saved to My Cards",
        body: business ? "It's in your workspace card library." : "Open it again any time from My Cards.",
        tone: "success",
      });
    }
    return id;
  }

  function sendNow() {
    const id = save({ quiet: true });
    setDraft({ ...emptyDraft(id), headline: current.headline, message, recipientName, senderName });
    router.push(`/send?card=${encodeURIComponent(id)}`);
  }

  function useAsTemplate() {
    if (!business) {
      setBizInfoOpen(true);
      return;
    }
    save({ quiet: true });
    setTemplateOpen(true);
  }

  const approved = !!savedCard?.approvedForAutomation;

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:gap-12">
      {/* Preview */}
      <div className="lg:sticky lg:top-24 lg:self-start">
        <div className="flex items-center justify-between gap-3">
          <Segmented
            ariaLabel="Preview side"
            size="sm"
            value={side}
            onChange={setSide}
            options={[
              { value: "front", label: "Front" },
              { value: "inside", label: "Inside" },
            ]}
          />
          <AIDemoLabel />
        </div>
        <div className="relative mx-auto mt-4 max-w-[400px] [perspective:1400px]">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={side}
              initial={reduce ? { opacity: 0 } : { rotateY: side === "inside" ? -70 : 70, opacity: 0 }}
              animate={{ rotateY: 0, opacity: 1 }}
              exit={reduce ? { opacity: 0 } : { rotateY: side === "inside" ? 70 : -70, opacity: 0 }}
              transition={{ duration: reduce ? 0.12 : 0.32, ease: "easeOut" }}
            >
              {side === "front" ? (
                <CardFront card={current} live brandMark={brandMark} />
              ) : (
                <CardInside
                  message={message}
                  recipientName={recipientName || undefined}
                  senderName={sender || undefined}
                  brand={brandMark}
                  accent={current.palette.a}
                  placeholder="Write a message on the right, or let the assistant draft three options."
                />
              )}
            </motion.div>
          </AnimatePresence>
          <AnimatePresence>
            {busy && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-10 grid place-items-center rounded-[6%/4.3%] bg-paper/70 backdrop-blur-[3px]"
                aria-live="polite"
              >
                <div className="mx-6 rounded-2xl bg-white px-4 py-3 text-center shadow-lift ring-1 ring-line">
                  <p className="flex items-center justify-center gap-2 text-sm font-semibold">
                    <Loader2 className={clsx("size-4 text-lilac-deep", !reduce && "animate-spin")} aria-hidden /> Refining
                  </p>
                  <p className="mt-1 font-hand text-xl leading-tight text-ink-2">“{busy}”</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <AnimatePresence>
          {lastNote && (
            <motion.p
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mx-auto mt-4 flex max-w-[400px] items-start gap-2 rounded-2xl bg-mint-soft px-3.5 py-2.5 text-[13.5px] text-mint-deep"
              aria-live="polite"
            >
              <Sparkles className="mt-0.5 size-4 shrink-0" aria-hidden />
              <span>
                <span className="font-semibold">What changed:</span> {lastNote}
              </span>
            </motion.p>
          )}
        </AnimatePresence>

        {/* Version history */}
        <div className="mx-auto mt-5 max-w-[400px]">
          <p className="flex items-center gap-1.5 text-[12px] font-bold uppercase tracking-[0.12em] text-ink-3">
            <History className="size-3.5" aria-hidden /> Versions
            <span className="font-medium normal-case tracking-normal">· click to go back</span>
          </p>
          <ol className="no-scrollbar mt-2 flex gap-2.5 overflow-x-auto pb-1">
            {versions.map((v, i) => (
              <li key={v.concept.id + i} className="shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setActive(i);
                    setLastNote(null);
                  }}
                  aria-current={i === active}
                  title={v.note}
                  className={clsx(
                    "flex w-[74px] flex-col gap-1 rounded-xl p-1 text-left transition",
                    i === active ? "bg-ink text-paper" : "hover:bg-ink/5",
                  )}
                >
                  <CardFront card={v.concept} shadow={false} className="pointer-events-none" rounded="rounded-lg" />
                  <span className="px-0.5 font-grotesk text-[11px] font-bold">v{i + 1}</span>
                  <span className={clsx("line-clamp-2 px-0.5 text-[10.5px] leading-tight", i === active ? "text-paper/75" : "text-ink-3")}>{v.note}</span>
                </button>
              </li>
            ))}
          </ol>
        </div>
      </div>

      {/* Controls */}
      <div className="space-y-5">
        <section className="rounded-3xl bg-white p-5 ring-1 ring-line sm:p-6" aria-labelledby="refine-h">
          <div className="flex items-center justify-between gap-2">
            <h3 id="refine-h" className="flex items-center gap-2 font-display text-xl font-semibold tracking-tight">
              <Wand2 className="size-5 text-lilac-deep" aria-hidden /> Refine it
            </h3>
            <span className="text-[12px] text-ink-3">Say what you’d change</span>
          </div>
          <form
            className="mt-3 flex items-center gap-2 rounded-2xl bg-paper p-1.5 ring-1 ring-inset ring-line-2 focus-within:ring-2 focus-within:ring-cobalt"
            onSubmit={(e) => {
              e.preventDefault();
              refine(instruction);
            }}
          >
            <label htmlFor="refine-input" className="sr-only">
              Follow-up instruction
            </label>
            <input
              id="refine-input"
              value={instruction}
              onChange={(e) => setInstruction(e.target.value)}
              placeholder="e.g. Make the headline funnier and the colors darker."
              className="min-w-0 flex-1 bg-transparent px-2.5 py-2 text-[15px] focus:outline-none"
              disabled={!!busy}
            />
            <Button type="submit" size="sm" variant="ink" disabled={!instruction.trim() || !!busy} icon={<CornerDownLeft className="size-3.5" aria-hidden />}>
              Apply
            </Button>
          </form>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {(business ? REFINE_CHIPS : [...REFINE_CHIPS.filter((c) => !/brand/.test(c)), "Try a darker palette."]).map((c) => (
              <button
                key={c}
                type="button"
                disabled={!!busy}
                onClick={() => refine(c)}
                className="inline-flex h-8 items-center rounded-full bg-lilac-soft px-3 text-[12.5px] font-semibold text-lilac-deep transition hover:bg-lilac/40 disabled:opacity-50"
              >
                {c}
              </button>
            ))}
          </div>
        </section>

        <section className="rounded-3xl bg-white p-5 ring-1 ring-line sm:p-6" aria-labelledby="colors-h">
          <h3 id="colors-h" className="font-display text-xl font-semibold tracking-tight">
            Colors
          </h3>
          <p className="mt-0.5 text-[13px] text-ink-3">Recolors the same artwork. Your headline stays put.</p>
          <div className="mt-3">
            <PalettePicker value={null} onChange={applyPalette} brandColor={business ? brandColor : undefined} includeAny={false} size="sm" />
          </div>
        </section>

        <section className="rounded-3xl bg-white p-5 ring-1 ring-line sm:p-6" aria-labelledby="headline-h">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 id="headline-h" className="font-display text-xl font-semibold tracking-tight">
              Headline
            </h3>
            <Button size="sm" variant="soft" onClick={rewrite} icon={<RefreshCw className="size-3.5" aria-hidden />}>
              Rewrite headline
            </Button>
          </div>
          <label htmlFor="headline-input" className="sr-only">
            Headline text
          </label>
          <textarea
            id="headline-input"
            value={current.headline}
            onChange={(e) => setHeadline(e.target.value)}
            rows={3}
            maxLength={60}
            className={clsx(inputClass, "mt-3 resize-none font-display text-xl leading-tight tracking-tight")}
          />
          <p className="mt-1.5 text-[12.5px] text-ink-3">
            Type set separately from the artwork, so it is always crisp and spelled exactly as you write it. Press Enter for a line break.
          </p>
        </section>

        <section className="rounded-3xl bg-white p-5 ring-1 ring-line sm:p-6" aria-labelledby="message-h">
          <div className="flex items-center justify-between gap-2">
            <h3 id="message-h" className="font-display text-xl font-semibold tracking-tight">
              Inside message
            </h3>
            <button type="button" onClick={() => setSide("inside")} className="text-[13px] font-semibold text-cobalt hover:underline">
              Preview inside
            </button>
          </div>
          {!business ? (
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <Input label="Their name" optional value={recipientName} onChange={(e) => setRecipientName(e.target.value)} placeholder="e.g. June" />
              <Input label="Your name" optional value={senderName} onChange={(e) => setSenderName(e.target.value)} placeholder="e.g. Sam" />
            </div>
          ) : (
            <p className="mt-1 text-[13px] text-ink-3">
              Signed by {biz.senderName} at {biz.name}. Automated sends personalize the first name for each customer.
            </p>
          )}
          <label htmlFor="message-input" className="mt-3 block text-[13px] font-semibold text-ink-2">
            Message
          </label>
          <textarea
            id="message-input"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onFocus={() => setSide("inside")}
            rows={4}
            placeholder="Write your own, or draft from a few notes below."
            className={clsx(inputClass, "mt-1.5 min-h-28 resize-y leading-relaxed")}
          />
          <MessageAssistant
            className="mt-3"
            compact
            value={message}
            onChange={(v) => {
              setMessage(v);
              setSide("inside");
            }}
            context={{
              recipientName: recipientName || (business ? "there" : ""),
              senderName: sender,
              companyName: business ? biz.name : undefined,
              interests: brief.interests.map((i) => i.toLowerCase()),
              relationship: brief.recipient,
              voice: business ? biz.voice : null,
              business,
            }}
          />
        </section>

        {/* Actions */}
        <section className="rounded-3xl bg-ink p-5 text-paper sm:p-6" aria-label="Save and send">
          <div className="flex flex-col gap-2.5 sm:flex-row sm:flex-wrap">
            {business ? (
              <>
                <Button variant="coral" onClick={useAsTemplate} icon={<Briefcase className="size-4" aria-hidden />}>
                  Use as automation template
                </Button>
                <Button variant="white" onClick={() => save()} icon={<Bookmark className="size-4" aria-hidden />}>
                  {savedId ? "Save changes" : "Save to Cards"}
                </Button>
              </>
            ) : (
              <>
                <Button variant="coral" onClick={sendNow} icon={<Send className="size-4" aria-hidden />}>
                  Send now
                </Button>
                <Button variant="white" onClick={() => save()} icon={<Bookmark className="size-4" aria-hidden />}>
                  {savedId ? "Save changes" : "Save to My Cards"}
                </Button>
                <Button variant="ghost" className="text-paper hover:bg-white/10" onClick={useAsTemplate} icon={<Briefcase className="size-4" aria-hidden />}>
                  Use as automation template
                </Button>
              </>
            )}
          </div>
          <p className="mt-3 text-[12.5px] text-paper/65">
            {business
              ? approved
                ? "Approved for automations. If you save changes to the design, it will need approving again."
                : "Original artwork needs your approval before automations can use it."
              : "Send now saves this card and takes you to personalize, add an optional gift and schedule delivery."}
          </p>
          {business && (
            <p className="mt-3 border-t border-white/10 pt-3 text-[12px] text-paper/60">
              AI card creation: {PRICING_COPY.aiAllowance} {PRICING_COPY.aiNote}
            </p>
          )}
        </section>
      </div>

      {/* Business: automation template approval */}
      <Modal
        open={templateOpen}
        onClose={() => setTemplateOpen(false)}
        title="Use as an automation template"
        footer={
          approved ? (
            <div className="flex flex-wrap justify-end gap-2">
              <Button variant="ghost" onClick={() => setTemplateOpen(false)}>
                Keep editing
              </Button>
              <ButtonLink href="/app/automations" iconRight={<ArrowRight className="size-4" aria-hidden />}>
                Go to automations
              </ButtonLink>
            </div>
          ) : (
            <div className="flex flex-wrap justify-end gap-2">
              <Button variant="ghost" onClick={() => setTemplateOpen(false)}>
                Not yet
              </Button>
              <Button
                icon={<ShieldCheck className="size-4" aria-hidden />}
                onClick={() => {
                  if (savedId) updateCard(savedId, { approvedForAutomation: true });
                  toast({ title: "Design approved for automations", body: "You can now pick it in any birthday rule.", tone: "success" });
                }}
              >
                Approve design for automations
              </Button>
            </div>
          )
        }
      >
        <div className="flex gap-4">
          <div className="w-28 shrink-0">
            <CardFront card={current} brandMark={brandMark} />
          </div>
          <div className="text-[14.5px] text-ink-2">
            <p>
              Saved to your card library as <span className="font-semibold text-ink">{current.name}</span>.
            </p>
            {approved ? (
              <p className="mt-2 flex items-start gap-2 rounded-xl bg-mint-soft px-3 py-2 text-mint-deep">
                <BadgeCheck className="mt-0.5 size-4 shrink-0" aria-hidden />
                Approved. It now appears as a card choice in your birthday automations.
              </p>
            ) : (
              <p className="mt-2">
                Original artwork needs a person to approve it before it can go out in automated sends. Check the headline, colors and
                spelling, then approve it once. It becomes a reusable design for any rule.
              </p>
            )}
          </div>
        </div>
      </Modal>

      {/* Consumer: business-only explanation */}
      <Modal
        open={bizInfoOpen}
        onClose={() => setBizInfoOpen(false)}
        title="Automation templates are a business feature"
        footer={
          <div className="flex flex-wrap justify-end gap-2">
            <Button variant="ghost" onClick={() => setBizInfoOpen(false)}>
              Back to my card
            </Button>
            <ButtonLink href="/" iconRight={<ArrowRight className="size-4" aria-hidden />}>
              {BRAND.name} for firms
            </ButtonLink>
          </div>
        }
      >
        <p className="text-[14.5px] text-ink-2">
          In the live product, a design like this could become the card every client gets on their birthday, sent automatically in your
          brand with each person’s name. Original artwork is approved once by your team before it’s used in automated sends.
        </p>
        <p className="mt-3 text-[14.5px] text-ink-2">Sending to one person? Try the demo send. Nothing is actually sent.</p>
      </Modal>
    </div>
  );
}
