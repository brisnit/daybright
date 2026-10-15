"use client";

import { motion, useReducedMotion } from "framer-motion";
import { clsx } from "clsx";
import { ArrowRight, Check } from "lucide-react";
import type { Concept } from "@/lib/ai/studio";
import { STYLE_LABEL } from "@/lib/ai/studio";
import type { StudioStyle } from "@/lib/types";
import { CardFront } from "@/components/cards/card-art";
import { Tilt } from "@/components/cards/tilt";
import { AIDemoLabel } from "@/components/ui/badges";

type BrandMark = { name: string; color: string; logo?: string | null } | null;

/** Three concepts dealt side by side (a swipeable row on mobile). */
export function ConceptGrid({
  concepts,
  selectedIndex,
  onSelect,
  brandMark,
}: {
  concepts: Concept[];
  selectedIndex: number | null;
  onSelect: (i: number) => void;
  brandMark?: BrandMark;
}) {
  const reduce = useReducedMotion();
  return (
    <div className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-3 sm:mx-0 sm:grid sm:grid-cols-3 sm:gap-6 sm:overflow-visible sm:px-0 sm:pb-0">
      {concepts.map((c, i) => {
        const selected = selectedIndex === i;
        const style = c.art.replace("studio:", "") as StudioStyle;
        return (
          <motion.article
            key={c.id}
            initial={reduce ? false : { opacity: 0, y: 40, rotate: [-4, 2, 5][i], scale: 0.94 }}
            animate={{ opacity: 1, y: 0, rotate: 0, scale: 1 }}
            transition={{ type: "spring", stiffness: 160, damping: 20, delay: i * 0.12 }}
            className="w-[74vw] max-w-[320px] shrink-0 snap-center sm:w-auto sm:max-w-none"
          >
            <button
              type="button"
              onClick={() => onSelect(i)}
              aria-pressed={selected}
              aria-label={`Choose concept ${i + 1}: ${c.name}`}
              className="group block w-full text-left focus-visible:outline-none"
            >
              <Tilt>
                <div
                  className={clsx(
                    "relative rounded-[6%/4.3%] transition duration-300 group-hover:-translate-y-1 group-focus-visible:ring-4 group-focus-visible:ring-cobalt",
                    selected && "ring-4 ring-cobalt ring-offset-4 ring-offset-paper",
                  )}
                >
                  <CardFront card={c} live brandMark={brandMark} />
                  <span className="absolute left-3 top-3 z-[3] rounded-full bg-white/90 px-2 py-0.5 font-grotesk text-[11px] font-bold text-ink shadow-sm">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  {selected && (
                    <span className="absolute right-3 top-3 z-[3] grid size-7 place-items-center rounded-full bg-cobalt text-white shadow">
                      <Check className="size-4" aria-hidden />
                    </span>
                  )}
                </div>
              </Tilt>
            </button>
            <div className="mt-4 px-0.5">
              <div className="flex items-center justify-between gap-2">
                <p className="text-[12px] font-bold uppercase tracking-[0.12em] text-ink-3">
                  Concept {String(i + 1).padStart(2, "0")} · {c.name.split(" · ")[1] ?? "Original"}
                </p>
                <AIDemoLabel />
              </div>
              <h3 className="mt-1 font-display text-xl font-semibold tracking-tight">{STYLE_LABEL[style] ?? c.name}</h3>
              <p className="mt-1 text-[14px] leading-snug text-ink-2">{c.conceptNote}</p>
              <button
                type="button"
                onClick={() => onSelect(i)}
                className={clsx(
                  "mt-3 inline-flex items-center gap-1.5 text-[14px] font-semibold",
                  selected ? "text-mint-deep" : "text-cobalt hover:underline",
                )}
              >
                {selected ? (
                  <>
                    <Check className="size-4" aria-hidden /> Editing this one
                  </>
                ) : (
                  <>
                    Refine this concept <ArrowRight className="size-4" aria-hidden />
                  </>
                )}
              </button>
            </div>
          </motion.article>
        );
      })}
    </div>
  );
}
