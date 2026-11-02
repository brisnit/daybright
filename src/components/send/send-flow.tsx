"use client";
/* eslint-disable react-hooks/set-state-in-effect -- one-time URL/timer initialisation after local state loads */

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { clsx } from "clsx";
import { ArrowLeft, ArrowRight, Check, Loader2 } from "lucide-react";
import type { CardDesign, GiftSelection, SendDraft } from "@/lib/types";
import { useDemo } from "@/lib/store";
import { getCard } from "@/lib/cards";
import { emptyDraft } from "@/data/seed";
import { GIFT_MAP, giftPrice } from "@/data/gifts";
import { money } from "@/config/brand";
import { Button } from "@/components/ui/button";
import { StepCard } from "./step-card";
import { StepPersonalize } from "./step-personalize";
import { StepGift } from "./step-gift";
import { StepDelivery } from "./step-delivery";
import { StepReview } from "./step-review";
import { Confirmation } from "./confirmation";
import { STEPS, stepIndex, todayISO, totals, validate, type Relationship, type StepId } from "./lib";

export function SendFlow() {
  const params = useSearchParams();
  const router = useRouter();
  const reduce = useReducedMotion();

  const draft = useDemo((s) => s.draft);
  const saved = useDemo((s) => s.savedCards);
  const sends = useDemo((s) => s.sends);
  const orders = useDemo((s) => s.orders);
  const setDraft = useDemo((s) => s.setDraft);
  const patchDraft = useDemo((s) => s.patchDraft);
  const placeOrder = useDemo((s) => s.placeOrder);

  const [ready, setReady] = useState(false);
  const [step, setStep] = useState<StepId>("card");
  const [maxReached, setMaxReached] = useState(0);
  const [dir, setDir] = useState(1);
  const [showErrors, setShowErrors] = useState<Partial<Record<StepId, boolean>>>({});
  const [relationship, setRelationship] = useState<Relationship>("friend");
  const [placing, setPlacing] = useState(false);
  const [doneId, setDoneId] = useState<string | null>(null);

  // Initialise the draft once from ?card= / ?gift= (store is hydrated: we render inside HydrationGate).
  useEffect(() => {
    const cardParam = params.get("card");
    const giftParam = params.get("gift");
    const savedCards = useDemo.getState().savedCards;
    let d: SendDraft = useDemo.getState().draft ?? emptyDraft();
    if (cardParam) {
      const c = getCard(cardParam, savedCards);
      d = { ...d, cardId: c.id, headline: c.source === "studio" ? c.headline : d.cardId === c.id ? d.headline : undefined };
    }
    const g = giftParam ? GIFT_MAP[giftParam] : null;
    const amountParam = Number(params.get("amount"));
    const amount = g?.amounts?.includes(amountParam) ? amountParam : undefined;
    if (g) d = { ...d, gift: { giftId: g.id, amount: giftPrice(g, amount), shipping: g.shipping } };
    if (!getCard(d.cardId, savedCards).animated && d.extras.animatedReveal) d = { ...d, extras: { ...d.extras, animatedReveal: false } };
    setDraft(d);
    const start: StepId = cardParam ? "personalize" : "card";
    setStep(start);
    setMaxReached(stepIndex(start));
    if (cardParam || giftParam) router.replace("/send", { scroll: false });
    setReady(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const card: CardDesign = useMemo(() => getCard(draft?.cardId, saved), [draft?.cardId, saved]);
  const today = todayISO();
  const errors = draft && showErrors[step] ? validate(step, draft, today) : {};

  function goTo(next: StepId) {
    const ni = stepIndex(next);
    setDir(ni >= stepIndex(step) ? 1 : -1);
    setStep(next);
    setMaxReached((m) => Math.max(m, ni));
    window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
  }

  function next() {
    if (!draft) return;
    const errs = validate(step, draft, today);
    if (Object.keys(errs).length) {
      setShowErrors((s) => ({ ...s, [step]: true }));
      const first = Object.keys(errs)[0];
      requestAnimationFrame(() => {
        const el = document.getElementById(`f-${first}`);
        el?.focus();
        el?.scrollIntoView({ block: "center", behavior: reduce ? "auto" : "smooth" });
      });
      return;
    }
    const i = stepIndex(step);
    if (i < STEPS.length - 1) goTo(STEPS[i + 1].id);
  }

  function back() {
    const i = stepIndex(step);
    if (i > 0) goTo(STEPS[i - 1].id);
  }

  function place() {
    if (!draft || placing) return;
    // Re-check every step before the simulated checkout.
    for (const s of ["personalize", "delivery"] as const) {
      if (Object.keys(validate(s, draft, today)).length) {
        setShowErrors((x) => ({ ...x, [s]: true }));
        goTo(s);
        return;
      }
    }
    setPlacing(true);
    setTimeout(() => {
      const id = placeOrder();
      setPlacing(false);
      if (!id) return;
      setDoneId(id);
      setDraft(null);
      setDir(1);
      setStep("done");
      window.scrollTo({ top: 0, behavior: "auto" });
    }, 900);
  }

  const selectCard = (c: CardDesign) => {
    patchDraft({
      cardId: c.id,
      headline: c.source === "studio" ? c.headline : undefined,
      extras: c.animated ? draft?.extras ?? {} : { ...(draft?.extras ?? {}), animatedReveal: false },
    });
  };
  const setGift = (g: GiftSelection | null) => patchDraft({ gift: g });

  // Confirmation
  if (step === "done" && doneId) {
    const send = sends.find((s) => s.id === doneId);
    if (send) {
      const order = orders.find((o) => o.sendId === doneId);
      return (
        <div className="mx-auto w-full max-w-7xl px-4 pb-24 pt-8 sm:px-6 sm:pt-14">
          <Confirmation send={send} card={getCard(send.cardId, saved)} total={order?.total ?? null} onSendAnother={() => setDraft(null)} />
        </div>
      );
    }
  }

  if (!ready || !draft) return <FlowSkeleton />;

  const t = totals(draft);
  const i = stepIndex(step);
  const nextLabel = step === "card" ? `Continue with ${card.name}` : `Continue to ${STEPS[i + 1]?.label.toLowerCase()}`;

  return (
    <div className="mx-auto w-full max-w-7xl px-4 sm:px-6">
      <StepIndicator step={step} maxReached={maxReached} onGo={goTo} />

      <div className="relative pb-10 pt-8 sm:pt-10">
        <AnimatePresence mode="wait" initial={false} custom={dir}>
          <motion.div
            key={step}
            custom={dir}
            initial={{ opacity: 0, x: reduce ? 0 : dir * 36 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: reduce ? 0 : dir * -36 }}
            transition={{ duration: reduce ? 0.12 : 0.28, ease: [0.22, 1, 0.36, 1] }}
          >
            {step === "card" && <StepCard selectedId={draft.cardId} saved={saved} onSelect={selectCard} />}
            {step === "personalize" && (
              <StepPersonalize
                card={card}
                draft={draft}
                patch={patchDraft}
                errors={errors}
                relationship={relationship}
                setRelationship={setRelationship}
                onChangeCard={() => goTo("card")}
              />
            )}
            {step === "gift" && <StepGift card={card} draft={draft} setGift={setGift} />}
            {step === "delivery" && <StepDelivery draft={draft} patch={patchDraft} errors={errors} today={today} />}
            {step === "review" && <StepReview card={card} draft={draft} goTo={goTo} onPlace={place} placing={placing} />}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Sticky action bar */}
      <div className="sticky bottom-0 z-30 -mx-4 border-t border-line bg-paper/92 px-4 py-3 backdrop-blur-md sm:-mx-6 sm:px-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" onClick={back} disabled={i === 0} icon={<ArrowLeft className="size-4" aria-hidden />} className="shrink-0 px-3 sm:px-5">
            <span className="hidden sm:inline">Back</span>
          </Button>
          <div className="min-w-0 flex-1 text-[13px] leading-tight">
            <p className="font-grotesk text-lg font-bold tabular-nums text-ink">{money(t.total, { cents: true })}</p>
            <p className="truncate text-ink-3">
              Card {money(t.card)}
              {draft.gift ? ` + gift ${money(t.gift)}` : " · no gift"}
              {t.shipping ? ` + shipping ${money(t.shipping)}` : ""}
            </p>
            <p className="truncate text-ink-3">Demo · no charge</p>
          </div>
          {step === "review" ? (
            <Button size="lg" onClick={place} disabled={placing} className="shrink-0" icon={placing ? <Loader2 className="size-4 animate-spin" aria-hidden /> : undefined}>
              {placing ? "Finishing…" : "Finish demo"}
            </Button>
          ) : (
            <Button size="lg" onClick={next} className="max-w-[60%] shrink-0" iconRight={<ArrowRight className="size-4" aria-hidden />}>
              <span className="truncate">
                <span className="sm:hidden">Continue</span>
                <span className="hidden sm:inline">{nextLabel}</span>
              </span>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

function StepIndicator({ step, maxReached, onGo }: { step: StepId; maxReached: number; onGo: (s: StepId) => void }) {
  const cur = stepIndex(step);
  return (
    <nav aria-label="Send a card: progress" className="pt-6 sm:pt-10">
      <ol className="flex items-center gap-1.5 sm:gap-2">
        {STEPS.map((s, i) => {
          const done = i < cur || (i <= maxReached && i !== cur);
          const reachable = i <= maxReached && i !== cur;
          const current = i === cur;
          return (
            <li key={s.id} className={clsx("flex min-w-0 items-center gap-1.5 sm:gap-2", i < STEPS.length - 1 && "flex-1")}>
              <button
                type="button"
                disabled={!reachable}
                onClick={() => onGo(s.id)}
                aria-current={current ? "step" : undefined}
                className={clsx(
                  "group flex shrink-0 items-center gap-2 rounded-full p-1 text-[13px] font-semibold transition sm:pr-3",
                  current && "bg-ink text-paper sm:pr-3",
                  !current && reachable && "text-ink hover:bg-white",
                  !current && !reachable && "text-ink-3",
                )}
              >
                <span
                  className={clsx(
                    "grid size-6 place-items-center rounded-full font-grotesk text-[12px] font-bold",
                    current ? "bg-butter text-ink" : done ? "bg-mint-deep text-white" : "bg-ink/8 text-ink-3 ring-1 ring-inset ring-line-2",
                  )}
                >
                  {done && !current ? <Check className="size-3.5" aria-hidden /> : i + 1}
                </span>
                <span className="sr-only sm:not-sr-only">{s.label}</span>
              </button>
              {i < STEPS.length - 1 && <span aria-hidden className={clsx("h-px flex-1", i < cur ? "bg-mint-deep/60" : "bg-line-2")} />}
            </li>
          );
        })}
      </ol>
      <p className="mt-3 text-[13px] font-semibold text-ink-2 sm:hidden">
        Step {Math.min(cur + 1, STEPS.length)} of {STEPS.length} · <span className="text-ink">{STEPS[Math.min(cur, STEPS.length - 1)].label}</span>
      </p>
    </nav>
  );
}

export function FlowSkeleton() {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 pb-24 pt-10 sm:px-6" aria-busy="true" aria-label="Loading">
      <div className="h-8 w-full max-w-2xl rounded-full skeleton" />
      <div className="mt-10 h-12 w-72 rounded-xl skeleton" />
      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="aspect-[5/7] rounded-2xl skeleton" />
        ))}
      </div>
    </div>
  );
}
