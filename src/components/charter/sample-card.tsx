"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { clsx } from "clsx";
import { ExternalLink, Gift, RotateCcw } from "lucide-react";
import { CardFront } from "@/components/cards/card-art";
import { Envelope, type EnvelopeStage } from "@/components/cards/envelope";
import { Toggle } from "@/components/ui/controls";
import { VERTICAL_SAMPLES, type VerticalSample } from "./samples";

/** Wet-ink-style signature: a handwritten name that "writes" itself left to right. Decorative only. */
export function InkSignature({ name, play, className }: { name: string; play: boolean; className?: string }) {
  const reduce = useReducedMotion();
  return (
    <span className={clsx("relative inline-block", className)}>
      <motion.span
        aria-label={`Signed ${name}`}
        className="block font-hand text-[1.9em] leading-none text-[#1D2B6B] [text-shadow:0_0.5px_0_rgb(29_43_107/0.35)]"
        initial={false}
        animate={{ clipPath: play || reduce ? "inset(0 0% 0 0)" : "inset(0 100% 0 0)" }}
        transition={reduce ? { duration: 0 } : { duration: 1.4, ease: [0.45, 0.05, 0.3, 1], delay: 0.35 }}
      >
        {name}
      </motion.span>
      <svg viewBox="0 0 160 14" className="absolute -bottom-1 left-0 h-[0.45em] w-[85%]" aria-hidden>
        <motion.path
          d="M2 9 C 30 3, 60 13, 92 7 S 140 4, 158 8"
          fill="none"
          stroke="#1D2B6B"
          strokeWidth="1.6"
          strokeLinecap="round"
          initial={false}
          animate={{ pathLength: play || reduce ? 1 : 0, opacity: play || reduce ? 0.7 : 0 }}
          transition={reduce ? { duration: 0 } : { duration: 0.6, delay: 1.6 }}
        />
      </svg>
    </span>
  );
}

function Monogram({ text, color, className }: { text: string; color: string; className?: string }) {
  return (
    <span
      className={clsx("grid shrink-0 place-items-center rounded-full font-display font-semibold tracking-wide text-white", className)}
      style={{ background: color, boxShadow: "inset 0 1px 0 rgb(255 255 255 / 0.25), inset 0 -2px 4px rgb(0 0 0 / 0.25)" }}
      aria-hidden
    >
      {text}
    </span>
  );
}

/** The inside of the card: message, wet-ink-style signature, sender details and disclosure footer. */
export function SampleInside({ sample, play, withGift }: { sample: VerticalSample; play: boolean; withGift: boolean }) {
  return (
    <div className="linen relative flex h-full flex-col overflow-hidden rounded-2xl p-6 shadow-[0_1px_1px_rgb(28_24_56/0.08),0_18px_36px_-20px_rgb(28_24_56/0.45)] ring-1 ring-[#E4DACA] sm:p-8">
      <div className="flex items-center gap-3">
        <Monogram text={sample.monogram} color={sample.color} className="size-10 text-[13px]" />
        <div className="min-w-0">
          <p className="truncate font-display text-[15px] font-semibold text-ink">{sample.firm}</p>
          <p className="text-[12px] uppercase tracking-[0.14em] text-ink-3">For {sample.recipient}</p>
        </div>
      </div>
      <p className="mt-6 flex-1 font-display text-[17px] leading-relaxed text-ink-2 italic sm:text-[19px]" style={{ fontVariationSettings: '"SOFT" 100' }}>
        {sample.message}
      </p>
      <div className="mt-6">
        <InkSignature name={sample.sender} play={play} className="text-[18px] sm:text-[20px]" />
        <p className="mt-2 text-[13px] font-semibold text-ink">
          {sample.sender} <span className="font-normal text-ink-3">· {sample.senderTitle}</span>
        </p>
      </div>
      <AnimatePresence initial={false}>
        {withGift && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-5 flex items-center gap-3 rounded-xl bg-white/70 p-3 ring-1 ring-[#E4DACA]">
              <span className="grid size-9 place-items-center rounded-lg bg-butter-soft text-butter-deep">
                <Gift className="size-4" aria-hidden />
              </span>
              <div className="text-[13px] leading-snug">
                <p className="font-semibold text-ink">A gift is waiting: {sample.gift.label}</p>
                <p className="text-ink-3">{sample.gift.detail}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <p className="mt-5 border-t border-[#E4DACA] pt-3 text-[10.5px] leading-snug tracking-wide text-ink-3">{sample.disclosure}</p>
    </div>
  );
}

/**
 * Interactive preview built from the product's own envelope and card renderer.
 * Works without login. The signature is a decorative handwriting style, not an authenticated signature.
 */
export function SampleCardExperience({
  initial = "advisor",
  showTabs = true,
  autoOpen = false,
  headingId,
}: {
  initial?: VerticalSample["id"];
  showTabs?: boolean;
  autoOpen?: boolean;
  headingId?: string;
}) {
  const reduce = useReducedMotion();
  const [id, setId] = useState<VerticalSample["id"]>(initial);
  const [stage, setStage] = useState<EnvelopeStage>("closed");
  const [revealed, setRevealed] = useState(false);
  const [withGift, setWithGift] = useState(false);
  const timers = useRef<number[]>([]);
  const sample = VERTICAL_SAMPLES.find((s) => s.id === id)!;

  const clear = () => {
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];
  };

  const open = () => {
    clear();
    if (reduce) {
      setStage("out");
      setRevealed(true);
      return;
    }
    setStage("open");
    timers.current.push(window.setTimeout(() => setStage("out"), 900));
    timers.current.push(window.setTimeout(() => setRevealed(true), 1700));
  };

  const reset = () => {
    clear();
    setStage("closed");
    setRevealed(false);
  };

  useEffect(() => {
    if (!autoOpen) return;
    const t = window.setTimeout(open, 500);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => clear, []);

  return (
    <div>
      {showTabs && (
        <div role="tablist" aria-label="Choose an example" className="no-scrollbar -mx-1 mb-6 flex gap-1.5 overflow-x-auto px-1 pb-1">
          {VERTICAL_SAMPLES.map((s) => (
            <button
              key={s.id}
              role="tab"
              type="button"
              aria-selected={s.id === id}
              onClick={() => {
                setId(s.id);
                reset();
              }}
              className={clsx(
                "shrink-0 rounded-full px-4 py-2 text-[13px] font-semibold ring-1 ring-inset transition",
                s.id === id ? "bg-ink text-paper ring-ink" : "bg-white/70 text-ink-2 ring-line-2 hover:text-ink hover:ring-ink/30",
              )}
            >
              {s.tab}
              <span className={clsx("ml-1.5 hidden font-normal sm:inline", s.id === id ? "text-paper/70" : "text-ink-3")}>· {s.milestone}</span>
            </button>
          ))}
        </div>
      )}

      <div className="grid items-center gap-8 md:grid-cols-[1fr_1.05fr] md:gap-10">
        <div className="mx-auto w-full max-w-[360px]">
          {/* Headroom for the card as it rises ~82% of the envelope width above it */}
          <div className="pt-[88%]">
            <Envelope
              stage={stage}
              color={sample.color}
              liner="#E9DFCB"
              onClick={stage === "closed" ? open : undefined}
              label={
                <span className="block">
                  <span className="block font-hand text-[20px] leading-none text-ink">{sample.recipient}</span>
                  <span className="mt-1 block text-[9px] font-semibold uppercase tracking-[0.18em] text-ink-3">{sample.milestone}</span>
                </span>
              }
            >
              <CardFront card={sample.card} live={revealed} brandMark={{ name: sample.firm, color: sample.color }} />
            </Envelope>
          </div>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-2" aria-live="polite">
            {stage === "closed" ? (
              <button
                type="button"
                onClick={open}
                className="inline-flex h-11 items-center gap-2 rounded-full bg-ink px-6 text-sm font-semibold text-paper shadow-soft transition hover:bg-ink-2"
              >
                Open the envelope
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  reset();
                  timers.current.push(window.setTimeout(open, 450));
                }}
                className="inline-flex h-11 items-center gap-2 rounded-full bg-white px-5 text-sm font-semibold text-ink ring-1 ring-line-2 transition hover:ring-ink/30"
              >
                <RotateCcw className="size-4" aria-hidden /> Replay
              </button>
            )}
            <span className="sr-only">{revealed ? `Card opened: ${sample.card.headline.replace(/\n/g, " ")}` : ""}</span>
          </div>
        </div>

        <div className="relative min-h-[420px]" id={headingId ? `${headingId}-inside` : undefined}>
          <AnimatePresence mode="wait">
            {revealed ? (
              <motion.div
                key={`inside-${id}`}
                initial={{ opacity: 0, y: 14, rotate: reduce ? 0 : 1.2 }}
                animate={{ opacity: 1, y: 0, rotate: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="h-full"
              >
                <SampleInside sample={sample} play={revealed} withGift={withGift} />
              </motion.div>
            ) : (
              <motion.div
                key="placeholder"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid h-full min-h-[420px] place-items-center rounded-2xl border border-dashed border-line-2 bg-white/40 p-8 text-center"
              >
                <div>
                  <p className="font-display text-xl font-semibold text-ink">{sample.milestone}</p>
                  <p className="mx-auto mt-2 max-w-xs text-sm text-ink-3">
                    Open the envelope to read {sample.sender.split(" ")[0]}&rsquo;s note to {sample.recipient}.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-3 border-t border-line pt-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="max-w-xs">
          <Toggle checked={withGift} onChange={setWithGift} label="Include an optional gift" description="Gifting is shown as a demo." size="sm" />
        </div>
        <Link
          href="/open?id=demo-card"
          target="_blank"
          className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-cobalt hover:underline"
        >
          Full-screen recipient view (real estate example) <ExternalLink className="size-3.5" aria-hidden />
        </Link>
      </div>
      <p className="mt-3 text-[12px] text-ink-3">
        Fictional firms and sample license numbers. The handwritten signature is a decorative style, not a legally authenticated signature.
      </p>
    </div>
  );
}
