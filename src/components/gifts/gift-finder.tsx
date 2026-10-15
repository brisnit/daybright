"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { clsx } from "clsx";
import { ArrowLeft, ArrowRight, Check, Loader2, RotateCcw, Sparkles } from "lucide-react";
import { ENJOY_OPTIONS, recommendGifts, type FinderAnswers, type GiftRecommendation } from "@/lib/ai/gifts";
import { CONSUMER, money } from "@/config/brand";
import { AIDemoLabel } from "@/components/ui/badges";
import { Button } from "@/components/ui/button";
import { GiftArt } from "./gift-art";
import { giftSendHref } from "./gift-catalog";

const WHO: { id: FinderAnswers["who"]; label: string }[] = [
  { id: "customer", label: "A customer or client" },
  { id: "colleague", label: "A colleague" },
  { id: "friend", label: "A friend" },
  { id: "family", label: "Family" },
];
const KINDS: { id: FinderAnswers["kind"]; label: string; sub: string }[] = [
  { id: "digital", label: "Digital", sub: "Arrives with the card" },
  { id: "physical", label: "Physical", sub: "Ships to their door" },
  { id: "either", label: "Either is fine", sub: "Show me the best fit" },
];
const WHEN: { id: FinderAnswers["when"]; label: string; sub: string }[] = [
  { id: "today", label: "Today", sub: "Digital gifts only" },
  { id: "this-week", label: "This week", sub: "Within a few days" },
  { id: "flexible", label: "I'm flexible", sub: "Any delivery time" },
];
const BUDGETS = [15, 25, 40, 60];
const STEPS = ["Who is it for?", "What do they enjoy?", "Total gift budget", "Digital or physical?", "When does it need to arrive?"];

/** Thoughtful Gift Finder: five quick questions, three recommendations. Never adds anything by itself. */
export function GiftFinder() {
  const reduce = useReducedMotion();
  const [step, setStep] = useState(0);
  const [a, setA] = useState<FinderAnswers>({ who: "", enjoys: [], budget: 40, kind: "either", when: "flexible" });
  const [recs, setRecs] = useState<GiftRecommendation[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [chosen, setChosen] = useState<string | null>(null);

  const done = recs !== null || loading;

  function toggleEnjoy(o: string) {
    setA((x) => {
      if (/not sure/i.test(o)) return { ...x, enjoys: x.enjoys.includes(o) ? [] : [o] };
      const list = x.enjoys.filter((e) => !/not sure/i.test(e));
      return { ...x, enjoys: list.includes(o) ? list.filter((e) => e !== o) : [...list, o] };
    });
  }

  async function find(next = a) {
    setLoading(true);
    setRecs(null);
    setChosen(null);
    const r = await recommendGifts(next);
    setRecs(r);
    setLoading(false);
  }

  const summary = [
    WHO.find((w) => w.id === a.who)?.label ?? "Anyone",
    a.enjoys.length ? a.enjoys.join(", ") : "Not sure",
    `${money(a.budget)} total`,
    KINDS.find((k) => k.id === a.kind)?.label,
    WHEN.find((w) => w.id === a.when)?.label,
  ];

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.35fr)] lg:gap-10">
      {/* Questions */}
      <div className="rounded-[2rem] bg-white p-5 shadow-soft ring-1 ring-line sm:p-7">
        <div className="flex items-center justify-between">
          <p className="font-grotesk text-sm font-bold text-ink-3">
            {Math.min(step + 1, STEPS.length)} <span className="font-medium">of {STEPS.length}</span>
          </p>
          <div className="flex gap-1" aria-hidden>
            {STEPS.map((s, i) => (
              <span key={s} className={clsx("h-1.5 rounded-full transition-all", i === step ? "w-6 bg-cobalt" : i < step ? "w-3 bg-cobalt/40" : "w-3 bg-ink/10")} />
            ))}
          </div>
        </div>
        <AnimatePresence mode="wait" initial={false}>
          <motion.fieldset
            key={step}
            initial={reduce ? { opacity: 0 } : { opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, x: -24 }}
            transition={{ duration: 0.2 }}
            className="mt-5 min-h-[220px]"
          >
            <legend className="font-display text-2xl font-semibold tracking-tight sm:text-[28px]">{STEPS[step]}</legend>
            {step === 0 && (
              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                {WHO.map((w) => (
                  <Option key={w.id} active={a.who === w.id} onClick={() => setA({ ...a, who: w.id })} label={w.label} />
                ))}
              </div>
            )}
            {step === 1 && (
              <>
                <p className="mt-1 text-[13.5px] text-ink-3">Pick any that fit. Not sure is a perfectly good answer.</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {ENJOY_OPTIONS.map((o) => {
                    const on = a.enjoys.includes(o);
                    return (
                      <button
                        key={o}
                        type="button"
                        aria-pressed={on}
                        onClick={() => toggleEnjoy(o)}
                        className={clsx(
                          "h-10 rounded-full px-4 text-[14px] font-semibold ring-1 ring-inset transition",
                          on ? "bg-ink text-paper ring-ink" : "bg-paper text-ink-2 ring-line-2 hover:ring-ink/40",
                          /not sure/i.test(o) && !on && "border border-dashed border-ink/25 ring-0",
                        )}
                      >
                        {o}
                      </button>
                    );
                  })}
                </div>
              </>
            )}
            {step === 2 && (
              <>
                <p className="mt-1 text-[13.5px] text-ink-3">Gift plus any shipping. The card itself is {money(CONSUMER.digitalCardPrice, { cents: true })} on top.</p>
                <p className="mt-5 font-grotesk text-5xl font-bold tabular-nums">{money(a.budget)}</p>
                <label htmlFor="budget-range" className="sr-only">
                  Budget
                </label>
                <input
                  id="budget-range"
                  type="range"
                  min={10}
                  max={100}
                  step={5}
                  value={a.budget}
                  onChange={(e) => setA({ ...a, budget: Number(e.target.value) })}
                  className="mt-3 w-full accent-cobalt"
                />
                <div className="mt-3 flex flex-wrap gap-2">
                  {BUDGETS.map((b) => (
                    <button
                      key={b}
                      type="button"
                      aria-pressed={a.budget === b}
                      onClick={() => setA({ ...a, budget: b })}
                      className={clsx(
                        "h-9 rounded-full px-4 font-grotesk text-[14px] font-bold ring-1 ring-inset",
                        a.budget === b ? "bg-ink text-paper ring-ink" : "bg-paper ring-line-2 hover:ring-ink/40",
                      )}
                    >
                      {money(b)}
                    </button>
                  ))}
                </div>
              </>
            )}
            {step === 3 && (
              <div className="mt-4 grid gap-2">
                {KINDS.map((k) => (
                  <Option key={k.id} active={a.kind === k.id} onClick={() => setA({ ...a, kind: k.id })} label={k.label} sub={k.sub} />
                ))}
              </div>
            )}
            {step === 4 && (
              <div className="mt-4 grid gap-2">
                {WHEN.map((w) => (
                  <Option key={w.id} active={a.when === w.id} onClick={() => setA({ ...a, when: w.id })} label={w.label} sub={w.sub} />
                ))}
              </div>
            )}
          </motion.fieldset>
        </AnimatePresence>
        <div className="mt-6 flex items-center justify-between gap-2">
          <Button variant="ghost" onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0} icon={<ArrowLeft className="size-4" aria-hidden />}>
            Back
          </Button>
          {step < STEPS.length - 1 ? (
            <Button onClick={() => setStep((s) => s + 1)} iconRight={<ArrowRight className="size-4" aria-hidden />}>
              {step === 1 && !a.enjoys.length ? "Skip" : "Next"}
            </Button>
          ) : (
            <Button onClick={() => find()} disabled={loading} icon={loading ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <Sparkles className="size-4" aria-hidden />}>
              {recs ? "Update ideas" : "Show three ideas"}
            </Button>
          )}
        </div>
        <ul className="mt-5 flex flex-wrap gap-1.5 border-t border-line pt-4" aria-label="Your answers">
          {summary.map((s, i) => (
            <li key={i}>
              <button
                type="button"
                onClick={() => setStep(i)}
                className={clsx("rounded-full px-2.5 py-1 text-[12px] font-semibold transition", i === step ? "bg-cobalt-soft text-cobalt-deep" : "bg-ink/5 text-ink-2 hover:bg-ink/10")}
              >
                {s}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Recommendations */}
      <div aria-live="polite">
        {!done && (
          <div className="flex h-full min-h-[280px] flex-col justify-center rounded-[2rem] border border-dashed border-line-2 p-8">
            <p className="font-hand text-3xl text-ink-2">Three ideas, your call.</p>
            <p className="mt-2 max-w-sm text-[14.5px] text-ink-2">
              Answer a few questions and we’ll suggest three gifts with the full cost, shipping included. Nothing is added to your order until you choose.
            </p>
          </div>
        )}
        {loading && (
          <div className="grid gap-3" aria-busy="true">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-36 rounded-3xl skeleton" />
            ))}
          </div>
        )}
        {recs && !loading && (
          <div>
            <div className="mb-3 flex items-center justify-between gap-2">
              <p className="text-[13px] font-bold text-ink-2">Three ideas for {(summary[0] ?? "anyone").toLowerCase()}</p>
              <AIDemoLabel />
            </div>
            {recs.length === 0 ? (
              <div className="rounded-3xl bg-butter-soft p-6 text-butter-deep">
                <p className="font-semibold">Nothing fits {money(a.budget)} with these choices.</p>
                <p className="mt-1 text-[14px]">
                  {a.when === "today" && a.kind === "physical" ? "Physical gifts can’t arrive today. " : ""}Try a higher budget or a digital gift. Or send the card on its own: it’s complete as it is.
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant="white"
                    onClick={() => {
                      const next = { ...a, kind: "digital" as const };
                      setA(next);
                      find(next);
                    }}
                  >
                    Show digital options
                  </Button>
                  <Link href="/cards" className="inline-flex h-8 items-center text-[13px] font-semibold underline">
                    Just send a card
                  </Link>
                </div>
              </div>
            ) : (
              <ol className="grid gap-3">
                {recs.map((r, i) => {
                  const isChosen = chosen === r.gift.id;
                  return (
                    <motion.li
                      key={r.gift.id}
                      initial={reduce ? false : { opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.08 }}
                      className={clsx("grid gap-4 rounded-3xl bg-white p-3 ring-1 transition sm:grid-cols-[180px_1fr] sm:p-4", isChosen ? "ring-2 ring-cobalt shadow-soft" : "ring-line")}
                    >
                      <GiftArt gift={r.gift} amount={r.gift.amounts ? r.amount : undefined} />
                      <div className="flex flex-col px-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={clsx(
                              "rounded-full px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide",
                              r.tag === "Best match" ? "bg-coral-soft text-coral-deep" : r.tag === "Flexible pick" ? "bg-cobalt-soft text-cobalt-deep" : "bg-mint-soft text-mint-deep",
                            )}
                          >
                            {r.tag}
                          </span>
                          <span className="text-[12px] text-ink-3">{r.gift.merchant}</span>
                        </div>
                        <h3 className="mt-1.5 font-display text-xl font-semibold tracking-tight">{r.gift.name}</h3>
                        <p className="mt-1 text-[13.5px] leading-snug text-ink-2">{r.reason}</p>
                        <p className="mt-2 text-[13px] tabular-nums text-ink-2">
                          {money(r.amount, { cents: !Number.isInteger(r.amount) })} gift
                          {r.shipping ? ` + ${money(r.shipping, { cents: true })} shipping` : " + no shipping"} ={" "}
                          <span className="font-semibold text-ink">{money(r.total, { cents: true })}</span>
                        </p>
                        <div className="mt-auto flex flex-wrap items-center gap-2 pt-3">
                          {isChosen ? (
                            <>
                              <Link
                                href={giftSendHref(r.gift.id, r.amount)}
                                className="inline-flex h-9 items-center gap-1.5 rounded-full bg-cobalt px-4 text-[13.5px] font-semibold text-white hover:bg-cobalt-deep"
                              >
                                Send with a card <ArrowRight className="size-4" aria-hidden />
                              </Link>
                              <button type="button" onClick={() => setChosen(null)} className="text-[13px] font-semibold text-ink-3 hover:text-ink">
                                Change my mind
                              </button>
                            </>
                          ) : (
                            <Button size="sm" variant="outline" onClick={() => setChosen(r.gift.id)} icon={<Check className="size-3.5" aria-hidden />}>
                              Choose this gift
                            </Button>
                          )}
                        </div>
                      </div>
                    </motion.li>
                  );
                })}
              </ol>
            )}
            <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-[12.5px] text-ink-3">
              <p>Illustrative demo merchants and prices. Nothing is added or charged until you check out.</p>
              <button
                type="button"
                onClick={() => {
                  setRecs(null);
                  setChosen(null);
                  setStep(0);
                }}
                className="inline-flex items-center gap-1 font-semibold hover:text-ink"
              >
                <RotateCcw className="size-3.5" aria-hidden /> Start over
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Option({ active, onClick, label, sub }: { active: boolean; onClick: () => void; label: string; sub?: string }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={clsx(
        "flex items-center justify-between gap-3 rounded-2xl px-4 py-3 text-left ring-1 ring-inset transition",
        active ? "bg-ink text-paper ring-ink" : "bg-paper ring-line hover:ring-ink/30",
      )}
    >
      <span>
        <span className="block text-[15px] font-semibold">{label}</span>
        {sub && <span className={clsx("block text-[12.5px]", active ? "text-paper/70" : "text-ink-3")}>{sub}</span>}
      </span>
      {active && <Check className="size-4 shrink-0" aria-hidden />}
    </button>
  );
}
