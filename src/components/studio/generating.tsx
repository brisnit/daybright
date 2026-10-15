"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { clsx } from "clsx";
import { Check, Loader2 } from "lucide-react";

/**
 * Generation sequence: real progress copy derived from the brief, plus three sketching card skeletons.
 * With reduced motion the copy still advances, but nothing draws or moves.
 */
export function Generating({ steps, durationMs = 2600 }: { steps: string[]; durationMs?: number }) {
  const [i, setI] = useState(0);
  const reduce = useReducedMotion();
  useEffect(() => {
    const per = durationMs / steps.length;
    const t = setInterval(() => setI((x) => Math.min(x + 1, steps.length - 1)), per);
    return () => clearInterval(t);
  }, [steps.length, durationMs]);

  return (
    <div className="grid gap-8 lg:grid-cols-[300px_1fr] lg:gap-12" aria-live="polite" aria-busy="true">
      <ol className="order-2 space-y-2.5 lg:order-1 lg:pt-4">
        {steps.map((s, n) => {
          const done = n < i;
          const now = n === i;
          return (
            <li
              key={s}
              className={clsx(
                "flex items-start gap-3 text-[15px] leading-snug transition-colors duration-300",
                done ? "text-ink-3" : now ? "font-semibold text-ink" : "text-ink-3/50",
              )}
            >
              <span
                className={clsx(
                  "mt-0.5 grid size-5 shrink-0 place-items-center rounded-full",
                  done ? "bg-mint-soft text-mint-deep" : now ? "bg-lilac-soft text-lilac-deep" : "ring-1 ring-inset ring-line-2",
                )}
              >
                {done ? <Check className="size-3" aria-hidden /> : now ? <Loader2 className={clsx("size-3", !reduce && "animate-spin")} aria-hidden /> : null}
              </span>
              <span>
                {s}
                {now && "…"}
              </span>
            </li>
          );
        })}
      </ol>
      <div className="order-1 lg:order-2">
        <div className="no-scrollbar -mx-4 flex snap-x gap-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-3 sm:gap-6 sm:overflow-visible sm:px-0">
          {[0, 1, 2].map((n) => (
            <SketchCard key={n} n={n} reduce={!!reduce} progress={i / (steps.length - 1)} />
          ))}
        </div>
        <AnimatePresence mode="wait">
          <motion.p
            key={i}
            initial={reduce ? false : { opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? undefined : { opacity: 0, y: -4 }}
            className="mt-4 text-center font-hand text-2xl text-ink-2 sm:hidden"
          >
            {steps[i]}
          </motion.p>
        </AnimatePresence>
      </div>
    </div>
  );
}

const SKETCHES = [
  // arch + bloom
  ["M70 520 C70 300 180 200 250 200 C320 200 430 300 430 520", "M250 380 m-50 0 a50 50 0 1 0 100 0 a50 50 0 1 0 -100 0", "M250 430 L250 560", "M250 500 C220 480 200 490 190 470", "M250 510 C280 490 300 500 310 480"],
  // big type blocks
  ["M70 130 L330 130", "M70 210 L410 210", "M70 290 L280 290", "M300 470 m-70 0 a70 70 0 1 0 140 0 a70 70 0 1 0 -140 0", "M90 600 L410 600"],
  // collage scraps
  ["M90 160 L260 140 L280 300 L110 320 Z", "M260 330 L420 360 L390 520 L230 490 Z", "M120 420 m-40 0 a40 40 0 1 0 80 0 a40 40 0 1 0 -80 0", "M150 590 L380 590", "M330 110 l30 40 l-50 0 z"],
];

function SketchCard({ n, reduce, progress }: { n: number; reduce: boolean; progress: number }) {
  return (
    <div className="relative w-[70vw] max-w-[300px] shrink-0 snap-center sm:w-auto sm:max-w-none">
      <div className="relative aspect-[5/7] overflow-hidden rounded-[6%/4.3%] bg-white shadow-[0_1px_1px_rgb(28_24_56/0.08),0_14px_30px_-14px_rgb(28_24_56/0.35)] ring-1 ring-line">
        <div className="absolute inset-0 skeleton opacity-60" />
        <svg viewBox="0 0 500 700" className="absolute inset-0 size-full" aria-hidden>
          {SKETCHES[n].map((d, k) => (
            <motion.path
              key={k}
              d={d}
              fill="none"
              stroke="#1C1838"
              strokeOpacity={0.35}
              strokeWidth={3}
              strokeLinecap="round"
              strokeDasharray={reduce ? "6 10" : undefined}
              initial={reduce ? false : { pathLength: 0 }}
              animate={reduce ? undefined : { pathLength: Math.min(1, progress * 1.4 - k * 0.12 + 0.3) }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            />
          ))}
        </svg>
        <span className="absolute bottom-3 left-3 rounded-full bg-white/90 px-2 py-0.5 text-[11px] font-semibold text-ink-3 shadow-sm">
          Concept {n + 1}
        </span>
      </div>
      <div className="mt-3 h-4 w-2/3 rounded-md skeleton" />
      <div className="mt-2 h-3 w-full rounded-md skeleton" />
    </div>
  );
}
