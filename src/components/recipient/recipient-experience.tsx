"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowDown, Eye, RotateCcw, Undo2 } from "lucide-react";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { HydrationGate } from "@/components/hydration-gate";
import { CardFront, initials } from "@/components/cards/card-art";
import { Envelope, type EnvelopeStage } from "@/components/cards/envelope";
import { Button } from "@/components/ui/button";
import { useDemo } from "@/lib/store";
import { useSend } from "@/lib/use-send";
import { getCard } from "@/lib/cards";
import { fmtDate } from "@/lib/dates";
import type { Send } from "@/lib/types";
import { ConfettiBurst, Sparkles } from "./confetti";
import { PhotoMemories, RecordedGreeting, SectionHead, SignaturePage } from "./extras";
import { GiftReveal, visibleGift } from "./gift-reveal";
import { RecipientFallback } from "./fallback";
import { RecipientInside } from "./recipient-inside";

type Stage = "intro" | "envelope" | "opening" | "rising" | "front" | "inside";

export function RecipientExperience() {
  const params = useSearchParams();
  const id = params.get("id");
  return (
    <HydrationGate fallback={<SceneSkeleton />}>
      <Resolver id={id} />
    </HydrationGate>
  );
}

function SceneSkeleton() {
  return (
    <div className="grid min-h-[88svh] place-items-center" aria-busy="true" aria-label="Loading your card">
      <div className="w-[min(80vw,420px)]">
        <div className="aspect-[4/3] rounded-3xl skeleton" />
      </div>
    </div>
  );
}

function Resolver({ id }: { id: string | null }) {
  const send = useSend(id);
  if (!send) return <RecipientFallback missing={!!id} />;
  // key: a different send resets the whole experience
  return <Experience key={send.id} send={send} />;
}

function useIsDesktop() {
  const [v, setV] = useState(false);
  useEffect(() => {
    const m = window.matchMedia("(min-width: 1024px)");
    const on = () => setV(m.matches);
    on();
    m.addEventListener("change", on);
    return () => m.removeEventListener("change", on);
  }, []);
  return v;
}

function tint(hex: string, pct: number) {
  return `color-mix(in oklab, ${hex} ${pct}%, #FFF9F0)`;
}

function Experience({ send }: { send: Send }) {
  const reduce = useReducedMotion();
  const desktop = useIsDesktop();
  const savedCards = useDemo((s) => s.savedCards);
  const inStore = useDemo((s) => s.sends.some((x) => x.id === send.id));
  const markOpened = useDemo((s) => s.markOpened);
  const claimGift = useDemo((s) => s.claimGift);
  const submitAddress = useDemo((s) => s.submitAddress);

  const card = getCard(send.cardId, savedCards);
  const isBusiness = send.source !== "consumer";
  const accent = send.brandColor ?? (isBusiness ? "#2446D8" : "#FF6B57");
  const brand = isBusiness ? { name: send.fromLabel, color: accent, logo: send.logoDataUrl ?? null } : null;
  const preview = inStore && (send.status === "scheduled" || send.status === "pending-review");
  const persist = inStore && !preview;
  const first = send.recipientName.split(" ")[0] || "you";
  const extras = send.extras ?? {};
  const gift = visibleGift(send);
  const hasMore = !!(extras.recordedGreeting || extras.groupSignatures?.length || extras.photoMemories?.length || gift);

  const [stage, setStage] = useState<Stage>("intro");
  const [burst, setBurst] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const opened = useRef(false);
  const timers = useRef<number[]>([]);
  const moreRef = useRef<HTMLDivElement>(null);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  // Let the quiet footer sit on the same tinted paper as the scene.
  useEffect(() => {
    if (!isBusiness) return;
    const prev = document.body.style.background;
    document.body.style.background = tint(accent, 9);
    return () => {
      document.body.style.background = prev;
    };
  }, [isBusiness, accent]);

  const later = (fn: () => void, ms: number) => {
    timers.current.push(window.setTimeout(fn, ms));
  };

  const openEnvelope = () => {
    if (stage !== "envelope") return;
    if (!opened.current) {
      opened.current = true;
      if (persist && send.status === "sent") markOpened(send.id);
    }
    if (reduce) {
      setStage("front");
      return;
    }
    setStage("opening");
    later(() => setStage("rising"), 750);
    later(() => {
      setStage("front");
      setBurst((b) => b + 1);
    }, 2000);
  };

  const openCard = () => {
    setStage("inside");
    setFlipped(true);
  };

  const replay = () => {
    timers.current.forEach(clearTimeout);
    setFlipped(false);
    setStage("intro");
    window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
  };

  const envStage: EnvelopeStage = stage === "opening" ? "open" : stage === "rising" ? "out" : "closed";
  const sceneBg: CSSProperties = { background: isBusiness ? tint(accent, 9) : "#FFF9F0" };
  const fromLine = send.fromLabel || send.senderName;

  return (
    <div style={sceneBg} className="relative overflow-x-clip">
      {preview && (
        <div className="relative z-50 flex items-center justify-center gap-2 bg-ink px-4 py-2 text-center text-[13px] text-paper">
          <Eye className="size-4 shrink-0" />
          <span>
            Preview. This card is {send.status === "pending-review" ? "waiting for review" : "scheduled"} for {fmtDate(send.scheduledFor, { month: "long", day: "numeric" })}.
          </span>
        </div>
      )}

      {/* ---------------- Reveal scene ---------------- */}
      <section className="relative mx-auto flex min-h-[calc(100svh-64px)] w-full max-w-6xl flex-col items-center justify-center overflow-hidden px-4 pb-10 pt-8 sm:px-6">
        {!isBusiness && <div className="dotted-bg pointer-events-none absolute inset-0 opacity-60" aria-hidden />}

        <AnimatePresence mode="wait" initial={false}>
          {(stage === "intro" || stage === "envelope" || stage === "opening" || stage === "rising") && (
            <motion.div
              key="env-scene"
              className="relative flex w-full flex-col items-center"
              exit={reduce ? { opacity: 0 } : { opacity: 0, y: 40, scale: 0.96 }}
              transition={{ duration: 0.45 }}
            >
              {/* Heading */}
              <AnimatePresence mode="wait" initial={false}>
                {stage === "intro" ? (
                  <motion.div
                    key="intro-copy"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.4 }}
                    className="relative z-10 flex flex-col items-center text-center"
                  >
                    <SenderChip send={send} brand={brand} />
                    <p className="mt-6 text-[12px] font-semibold uppercase tracking-[0.22em] text-ink-3">For {first}</p>
                    <h1 className="mt-3 max-w-[15ch] font-display text-[42px] font-semibold leading-[0.95] tracking-tight text-ink sm:text-7xl">
                      A little birthday something{" "}
                      <span className="font-display-wonk italic" style={{ color: isBusiness ? accent : "var(--color-coral-deep)" }}>
                        from {fromLine}
                      </span>
                    </h1>
                  </motion.div>
                ) : (
                  <motion.div
                    key="env-copy"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: stage === "envelope" ? 1 : 0, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="relative z-10 text-center"
                  >
                    <p className="font-hand text-3xl text-ink-2">For {first}, with love from {isBusiness ? fromLine : send.senderName}</p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Envelope */}
              <motion.div
                layout={!reduce}
                className={
                  stage === "intro"
                    ? "relative mt-10 w-[min(64vw,300px)] rotate-[-4deg]"
                    : "relative mt-[min(40vw,240px)] w-[min(90vw,540px)]"
                }
                transition={{ type: "spring", stiffness: 120, damping: 20 }}
              >
                <motion.div
                  animate={stage === "envelope" && !reduce ? { y: [0, -6, 0] } : { y: 0 }}
                  transition={stage === "envelope" ? { duration: 2.6, repeat: Infinity, ease: "easeInOut" } : { duration: 0.3 }}
                >
                  <Envelope
                    stage={envStage}
                    color={isBusiness ? accent : "#FF6B57"}
                    liner={isBusiness ? tint(accent, 22) : "#FFD45C"}
                    onClick={stage === "intro" ? () => setStage("envelope") : stage === "envelope" ? openEnvelope : undefined}
                    label={
                      stage === "intro" ? undefined : (
                        <span className="block">
                          <span className="block font-hand text-[clamp(18px,4.5vw,26px)] leading-none text-ink">{send.recipientName}</span>
                        </span>
                      )
                    }
                  >
                    <CardFront card={card} headline={send.headline} brandMark={brand} />
                  </Envelope>
                </motion.div>
              </motion.div>

              {/* Actions */}
              <div className="relative z-10 mt-8 flex h-14 items-center justify-center">
                <AnimatePresence mode="wait" initial={false}>
                  {stage === "intro" && (
                    <motion.div key="b1" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                      <Button size="lg" variant="ink" onClick={() => setStage("envelope")}>
                        Open your envelope
                      </Button>
                    </motion.div>
                  )}
                  {stage === "envelope" && (
                    <motion.button
                      key="b2"
                      type="button"
                      onClick={openEnvelope}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-[15px] font-semibold text-ink shadow-soft ring-1 ring-line"
                    >
                      <span className="relative flex size-2.5">
                        {!reduce && <span className="absolute inline-flex size-full animate-ping rounded-full opacity-70" style={{ background: accent }} />}
                        <span className="relative inline-flex size-2.5 rounded-full" style={{ background: accent }} />
                      </span>
                      Tap to open
                    </motion.button>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}

          {(stage === "front" || stage === "inside") && (
            <motion.div
              key="card-scene"
              className="relative flex w-full flex-col items-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <CardStage
                send={send}
                card={card}
                brand={brand}
                accent={accent}
                stage={stage}
                desktop={desktop}
                flipped={flipped}
                burst={burst}
                live={!!extras.animatedReveal || card.animated}
              />

              <div className="relative z-10 mt-7 flex min-h-12 flex-wrap items-center justify-center gap-3">
                {stage === "front" ? (
                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: reduce ? 0 : 0.7 }}>
                    <Button size="lg" variant="ink" onClick={openCard}>
                      Open card
                    </Button>
                  </motion.div>
                ) : (
                  <motion.div
                    className="flex flex-wrap items-center justify-center gap-3"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: reduce ? 0 : 0.6 }}
                  >
                    {!desktop && (
                      <Button variant="outline" onClick={() => setFlipped((f) => !f)} icon={<Undo2 className="size-4" />}>
                        {flipped ? "See the front" : "See the message"}
                      </Button>
                    )}
                    {hasMore ? (
                      <Button
                        variant="ink"
                        onClick={() => moreRef.current?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" })}
                        icon={<ArrowDown className="size-4" />}
                      >
                        {gift ? "There's more, including a gift" : "There's more inside"}
                      </Button>
                    ) : (
                      <Button variant="ghost" onClick={replay} icon={<RotateCcw className="size-4" />}>
                        Open again
                      </Button>
                    )}
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* ---------------- After the card ---------------- */}
      {stage === "inside" && (
        <div ref={moreRef} className="relative scroll-mt-4">
          {extras.recordedGreeting && (
            <Section>
              <SectionHead eyebrow="Press play" title={`${send.senderName.split(" ")[0]} recorded something`} accent={accent} />
              <RecordedGreeting
                durationSec={extras.recordedGreeting.durationSec}
                label={extras.recordedGreeting.label}
                from={send.senderName}
                accent={accent}
              />
            </Section>
          )}
          {!!extras.groupSignatures?.length && (
            <Section>
              <SectionHead eyebrow="Signed by" title={`${extras.groupSignatures.length + 1} people wanted to say it`} accent={accent} />
              <SignaturePage signatures={extras.groupSignatures} recipientFirst={first} />
            </Section>
          )}
          {!!extras.photoMemories?.length && (
            <Section>
              <SectionHead eyebrow="Photo memories" title="A few good days" accent={accent} />
              <PhotoMemories ids={extras.photoMemories} />
            </Section>
          )}
          {gift && (
            <Section>
              <SectionHead
                eyebrow="One more thing"
                title={gift.gift.kind === "digital" ? "There's a gift, too." : "Something's on its way."}
                accent={accent}
              />
              <GiftReveal
                send={send}
                accent={accent}
                preview={preview}
                onClaim={() => persist && claimGift(send.id)}
                onAddress={() => persist && submitAddress(send.id)}
              />
            </Section>
          )}

          {hasMore && (
            <div className="mx-auto max-w-xl px-4 pb-6 pt-10 text-center">
              <p className="font-hand text-3xl text-ink-2">Happy birthday, {first}.</p>
              <div className="mt-6 flex justify-center">
                <Button variant="outline" onClick={replay} icon={<RotateCcw className="size-4" />}>
                  Open again
                </Button>
              </div>
            </div>
          )}
          <p className="pb-4 pt-6 text-center text-[13px] text-ink-3">
            Want to send one too?{" "}
            <Link href="/" className="font-semibold text-ink underline decoration-line-2 underline-offset-4 hover:decoration-ink">
              Make a card
            </Link>
          </p>
        </div>
      )}
    </div>
  );
}

function Section({ children }: { children: React.ReactNode }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="px-4 py-12 sm:px-6 sm:py-16"
    >
      {children}
    </motion.section>
  );
}

function SenderChip({ send, brand }: { send: Send; brand: { name: string; color: string; logo: string | null } | null }) {
  if (!brand) {
    return (
      <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 shadow-soft ring-1 ring-line">
        <span className="grid size-7 place-items-center rounded-full bg-coral text-[12px] font-bold text-ink">{initials(send.senderName) || "?"}</span>
        <span className="pr-1 font-hand text-[22px] leading-none text-ink">from {send.senderName}</span>
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-2.5 rounded-full bg-white py-1.5 pl-1.5 pr-4 shadow-soft ring-1 ring-line">
      {brand.logo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={brand.logo} alt="" className="size-8 rounded-full object-cover" />
      ) : (
        <span className="grid size-8 place-items-center rounded-full text-[12px] font-bold text-white" style={{ background: brand.color }}>
          {initials(brand.name)}
        </span>
      )}
      <span className="text-[14px] font-semibold text-ink">{brand.name}</span>
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Card stage: front reveal, then flip (mobile) or open spread (desktop) */
/* ------------------------------------------------------------------ */

function CardStage({
  send,
  card,
  brand,
  accent,
  stage,
  desktop,
  flipped,
  burst,
  live,
}: {
  send: Send;
  card: ReturnType<typeof getCard>;
  brand: { name: string; color: string; logo: string | null } | null;
  accent: string;
  stage: Stage;
  desktop: boolean;
  flipped: boolean;
  burst: number;
  live: boolean;
}) {
  const reduce = useReducedMotion();
  const inside = stage === "inside";
  const front = <CardFront card={card} headline={send.headline} live={live && !reduce} brandMark={brand} />;
  const insideCard = (
    <RecipientInside
      card={card}
      message={send.message}
      font={send.messageFont}
      recipientName={send.recipientName}
      senderName={send.senderName}
      brand={brand}
      accent={accent}
    />
  );
  // Card fills the viewport height on phones without overflowing.
  const size = "w-[min(86vw,calc((100svh-210px)*0.714),460px)]";
  const settle = reduce
    ? { initial: { opacity: 0 }, animate: { opacity: 1 } }
    : { initial: { opacity: 0, y: 80, scale: 0.84, rotate: -5 }, animate: { opacity: 1, y: 0, scale: 1, rotate: 0 } };

  if (desktop) {
    return (
      <div className="relative flex items-center justify-center gap-8">
        <motion.div
          layout={!reduce}
          {...settle}
          transition={{ type: "spring", stiffness: 90, damping: 15 }}
          className="relative w-[min(400px,calc((100svh-200px)*0.714))]"
        >
          <ConfettiBurst burst={burst} extra={[accent]} />
          {!inside && <Sparkles />}
          <motion.div animate={{ rotate: inside ? -2 : 0 }} transition={{ duration: 0.6 }}>
            {front}
          </motion.div>
        </motion.div>
        <AnimatePresence>
          {inside && (
            <motion.div
              key="inside"
              className="w-[min(400px,calc((100svh-200px)*0.714))] [perspective:1600px]"
              initial={reduce ? { opacity: 0 } : { opacity: 0, x: -120 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            >
              <motion.div
                style={{ transformOrigin: "0% 50%" }}
                initial={reduce ? false : { rotateY: -95 }}
                animate={{ rotateY: 0, rotate: 1.5 }}
                transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
              >
                {insideCard}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <motion.div {...settle} transition={{ type: "spring", stiffness: 90, damping: 15 }} className={`relative ${size}`}>
      <ConfettiBurst burst={burst} extra={[accent]} />
      {!inside && <Sparkles />}
      <div className="[perspective:1600px]">
        <motion.div
          className="relative [transform-style:preserve-3d]"
          animate={{ rotateY: flipped ? 180 : 0 }}
          transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="[backface-visibility:hidden]" aria-hidden={flipped}>
            {front}
          </div>
          <div className="absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)]" aria-hidden={!flipped}>
            {insideCard}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
