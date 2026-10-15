"use client";

import { useEffect, useRef, useState } from "react";
import { clsx } from "clsx";
import { Check, Plus, X } from "lucide-react";
import type { Chip, ChipKind, Interpretation } from "@/lib/ai/search";

const KIND_TONE: Record<ChipKind, string> = {
  occasion: "bg-ink text-paper",
  style: "bg-lilac-soft text-lilac-deep",
  recipient: "bg-cobalt-soft text-cobalt-deep",
  budget: "bg-butter-soft text-butter-deep",
  delivery: "bg-mint-soft text-mint-deep",
  interest: "bg-coral-soft text-coral-deep",
  giftType: "bg-coral-soft text-coral-deep",
  color: "bg-white text-ink ring-1 ring-inset ring-line-2",
  brand: "bg-white text-ink ring-1 ring-inset ring-line-2",
};

const KIND_LABEL: Record<ChipKind, string> = {
  occasion: "Occasion",
  style: "Style",
  recipient: "For",
  budget: "Budget",
  delivery: "Delivery",
  interest: "Interest",
  giftType: "Gift",
  color: "Color",
  brand: "Colors",
};

/** Kinds that can only hold one value at a time. */
const SINGLE: ChipKind[] = ["budget", "delivery"];

const mk = (kind: ChipKind, value: string, label: string): Chip => ({ id: `${kind}:${value}`, kind, value, label });

const ADD_GROUPS: { label: string; chips: Chip[] }[] = [
  { label: "Style", chips: [mk("style", "playful", "Playful"), mk("style", "elegant", "Elegant"), mk("style", "minimal", "Minimal"), mk("style", "bold", "Bold"), mk("style", "heartfelt", "Heartfelt")] },
  { label: "Who it's for", chips: [mk("recipient", "customer", "Customer"), mk("recipient", "colleague", "Colleague"), mk("recipient", "friend", "Friend"), mk("recipient", "family", "Family")] },
  { label: "Budget", chips: [mk("budget", "25", "Under $25"), mk("budget", "40", "Under $40"), mk("budget", "60", "Under $60")] },
  { label: "Delivery", chips: [mk("delivery", "digital", "Digital delivery"), mk("delivery", "physical", "Ships to them")] },
  {
    label: "Gift type",
    chips: [mk("giftType", "gift-card", "Gift card"), mk("giftType", "chocolate", "Chocolate"), mk("giftType", "flowers", "Flowers"), mk("giftType", "basket", "Gift basket"), mk("giftType", "wellness", "Wellness"), mk("giftType", "tea", "Tea")],
  },
  { label: "They love", chips: [mk("interest", "gardening", "Gardening"), mk("interest", "coffee", "Coffee"), mk("interest", "books", "Books"), mk("interest", "hiking", "Hiking"), mk("interest", "cooking", "Cooking")] },
  { label: "Color", chips: [mk("color", "cobalt", "Blue"), mk("color", "coral", "Coral"), mk("color", "butter", "Yellow"), mk("color", "mint", "Green"), mk("color", "lilac", "Lilac"), mk("color", "ink", "Dark")] },
];

/** Editable interpretation: remove chips, edit the budget inline, add filters from a small menu. */
export function InterpretationChips({ interp, onChange }: { interp: Interpretation; onChange: (i: Interpretation) => void }) {
  const [menu, setMenu] = useState(false);
  const [editingBudget, setEditingBudget] = useState(false);
  const budget = interp.chips.find((c) => c.kind === "budget");
  const [budgetDraft, setBudgetDraft] = useState(budget?.value ?? "");
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menu) return;
    const close = (e: MouseEvent | KeyboardEvent) => {
      if (e instanceof KeyboardEvent ? e.key === "Escape" : !menuRef.current?.contains(e.target as Node)) setMenu(false);
    };
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", close);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", close);
    };
  }, [menu]);

  const remove = (id: string) => onChange({ ...interp, chips: interp.chips.filter((c) => c.id !== id) });

  function add(chip: Chip) {
    let chips = interp.chips;
    if (SINGLE.includes(chip.kind)) chips = chips.filter((c) => c.kind !== chip.kind);
    if (chips.some((c) => c.id === chip.id)) chips = chips.filter((c) => c.id !== chip.id);
    else chips = [...chips, chip];
    const wantsGift = interp.wantsGift || chip.kind === "giftType" || chip.kind === "budget";
    onChange({ ...interp, chips, wantsGift });
  }

  function commitBudget() {
    const n = Math.round(Number(budgetDraft));
    setEditingBudget(false);
    if (!budgetDraft || !Number.isFinite(n) || n <= 0) return;
    const chips = interp.chips.filter((c) => c.kind !== "budget");
    onChange({ ...interp, chips: [...chips, mk("budget", String(n), `Under $${n}`)] });
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {interp.chips.map((c) =>
        c.kind === "budget" && editingBudget ? (
          <form
            key={c.id}
            onSubmit={(e) => {
              e.preventDefault();
              commitBudget();
            }}
            className="inline-flex h-8 items-center gap-1 rounded-full bg-butter-soft pl-3 pr-1 text-[13px] font-semibold text-butter-deep ring-2 ring-butter"
          >
            <label htmlFor="budget-edit">Under $</label>
            <input
              id="budget-edit"
              autoFocus
              inputMode="numeric"
              value={budgetDraft}
              onChange={(e) => setBudgetDraft(e.target.value.replace(/[^\d]/g, "").slice(0, 4))}
              onBlur={commitBudget}
              className="w-12 bg-transparent text-ink focus:outline-none"
            />
            <button type="submit" aria-label="Save budget" className="grid size-6 place-items-center rounded-full bg-white text-ink">
              <Check className="size-3.5" aria-hidden />
            </button>
          </form>
        ) : (
          <span key={c.id} className={clsx("inline-flex h-8 items-center gap-1 rounded-full pl-3 pr-1 text-[13px] font-semibold", KIND_TONE[c.kind])}>
            <span className="sr-only">{KIND_LABEL[c.kind]}: </span>
            {c.kind === "budget" ? (
              <button
                type="button"
                onClick={() => {
                  setBudgetDraft(c.value);
                  setEditingBudget(true);
                }}
                className="underline decoration-dotted underline-offset-4"
                aria-label={`Edit budget, currently ${c.label}`}
              >
                {c.label}
              </button>
            ) : (
              c.label
            )}
            <button type="button" onClick={() => remove(c.id)} aria-label={`Remove ${c.label}`} className="grid size-6 place-items-center rounded-full hover:bg-black/10">
              <X className="size-3.5" aria-hidden />
            </button>
          </span>
        ),
      )}
      <div ref={menuRef} className="relative">
        <button
          type="button"
          onClick={() => setMenu((m) => !m)}
          aria-expanded={menu}
          aria-haspopup="true"
          className="inline-flex h-8 items-center gap-1 rounded-full px-3 text-[13px] font-semibold text-ink-2 border border-dashed border-ink/30 hover:text-ink hover:border-ink/60"
        >
          <Plus className="size-3.5" aria-hidden /> Add filter
        </button>
        {menu && (
          <div className="fixed inset-x-4 bottom-4 z-50 max-h-[75vh] overflow-y-auto rounded-2xl bg-white p-3 shadow-lift ring-1 ring-line sm:absolute sm:inset-x-auto sm:bottom-auto sm:left-0 sm:mt-2 sm:w-[360px]">
            {ADD_GROUPS.map((g) => (
              <div key={g.label} className="py-1.5">
                <p className="px-1 text-[11px] font-bold uppercase tracking-[0.12em] text-ink-3">{g.label}</p>
                <div className="mt-1.5 flex flex-wrap gap-1">
                  {g.chips.map((c) => {
                    const on = interp.chips.some((x) => x.id === c.id);
                    return (
                      <button
                        key={c.id}
                        type="button"
                        aria-pressed={on}
                        onClick={() => add(c)}
                        className={clsx(
                          "h-7 rounded-full px-2.5 text-[12.5px] font-semibold ring-1 ring-inset transition",
                          on ? "bg-ink text-paper ring-ink" : "bg-paper text-ink-2 ring-line hover:ring-ink/30",
                        )}
                      >
                        {c.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
