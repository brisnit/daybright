"use client";

import { clsx } from "clsx";
import { Check, ShieldCheck } from "lucide-react";
import { useDemo } from "@/lib/store";
import { allCards } from "@/lib/cards";
import type { CardDesign } from "@/lib/types";
import { CardFront } from "@/components/cards/card-art";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";

export const needsApproval = (c: CardDesign) => c.source === "studio" && !c.approvedForAutomation;

/**
 * Compact card picker across the catalog and saved Card Studio originals.
 * Originals must be approved before automated use; unapproved ones show an inline approve action.
 */
export function CardPicker({
  value,
  onChange,
  onlyApproved,
  label = "Card design",
}: {
  value: string;
  onChange: (id: string) => void;
  onlyApproved?: boolean;
  label?: string;
}) {
  const savedCards = useDemo((s) => s.savedCards);
  const updateCard = useDemo((s) => s.updateCard);
  const toast = useToast();
  const cards = allCards(savedCards).filter((c) => !onlyApproved || !needsApproval(c));
  const originals = cards.filter((c) => c.source === "studio");
  const catalog = cards.filter((c) => c.source !== "studio");
  const selected = cards.find((c) => c.id === value);
  const isSaved = (id: string) => savedCards.some((c) => c.id === id);

  const approve = (c: CardDesign) => {
    if (!isSaved(c.id)) return;
    updateCard(c.id, { approvedForAutomation: true });
    toast({ title: "Design approved", body: `“${c.name}” can now be used in automated rules.`, tone: "success" });
  };

  const tile = (c: CardDesign) => {
    const active = c.id === value;
    const pending = needsApproval(c);
    return (
      <button
        key={c.id}
        type="button"
        onClick={() => onChange(c.id)}
        aria-pressed={active}
        className="group w-[86px] shrink-0 text-left sm:w-[96px]"
        title={c.name}
      >
        <div className={clsx("relative rounded-[6%/4.3%] transition", active ? "ring-[3px] ring-cobalt ring-offset-2 ring-offset-white" : "group-hover:-translate-y-0.5")}>
          <CardFront card={c} shadow={false} className="ring-1 ring-line" />
          {active && (
            <span className="absolute right-1.5 top-1.5 z-[3] grid size-5 place-items-center rounded-full bg-cobalt text-white">
              <Check className="size-3" aria-hidden />
            </span>
          )}
          {pending && (
            <span className="absolute inset-x-1 bottom-1 z-[3] rounded-full bg-butter px-1.5 py-0.5 text-center text-[9.5px] font-bold uppercase tracking-wide text-ink">Needs approval</span>
          )}
        </div>
        <span className="mt-1 block truncate text-[12px] font-medium text-ink-2">{c.name.replace(" (original)", "")}</span>
      </button>
    );
  };

  return (
    <div>
      <p className="text-[13px] font-semibold text-ink-2">{label}</p>
      {originals.length > 0 && (
        <>
          <p className="mt-2 text-[11px] font-bold uppercase tracking-[0.12em] text-ink-3">Your originals</p>
          <div className="-mx-1 mt-1.5 flex gap-3 overflow-x-auto px-1 pb-2 pt-1">
            {originals.map((c) => (
              tile(c)
            ))}
          </div>
        </>
      )}
      <p className="mt-2 text-[11px] font-bold uppercase tracking-[0.12em] text-ink-3">Catalog</p>
      <div className="-mx-1 mt-1.5 flex gap-3 overflow-x-auto px-1 pb-2 pt-1">
        {catalog.map((c) => (
          tile(c)
        ))}
      </div>
      {selected && needsApproval(selected) && (
        <div className="mt-2 flex flex-wrap items-center gap-3 rounded-2xl bg-butter-soft p-3 text-[13px] text-butter-deep">
          <ShieldCheck className="size-4 shrink-0" aria-hidden />
          <p className="min-w-0 flex-1">
            <strong>“{selected.name}” is an original AI design.</strong> Approve it once before it can be used in an automated rule. Approved designs are reusable.
          </p>
          {isSaved(selected.id) && (
            <Button size="sm" variant="ink" onClick={() => approve(selected)}>
              Approve design
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
