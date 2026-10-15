"use client";

import Link from "next/link";
import { clsx } from "clsx";
import { useState } from "react";
import { Lock } from "lucide-react";
import { useDemo } from "@/lib/store";
import { allCards } from "@/lib/cards";
import { CARD_MAP } from "@/data/cards";
import { Modal } from "@/components/ui/overlay";
import { Button } from "@/components/ui/button";
import { Segmented } from "@/components/ui/controls";
import { CardFront } from "@/components/cards/card-art";

/** Pick a card from the catalog or approved Card Studio originals. */
export function CardPicker({
  open,
  onClose,
  value,
  onPick,
  title = "Choose a card",
}: {
  open: boolean;
  onClose: () => void;
  value: string;
  onPick: (cardId: string) => void;
  title?: string;
}) {
  const savedCards = useDemo((s) => s.savedCards);
  const [tab, setTab] = useState<"catalog" | "studio">("catalog");
  const cards = allCards(savedCards);
  const catalog = cards.filter((c) => CARD_MAP[c.id]);
  const studio = cards.filter((c) => !CARD_MAP[c.id]);
  const list = tab === "catalog" ? catalog : studio;
  return (
    <Modal open={open} onClose={onClose} title={title} width="max-w-3xl">
      <Segmented
        ariaLabel="Card source"
        value={tab}
        onChange={setTab}
        options={[
          { value: "catalog", label: `Collection (${catalog.length})` },
          { value: "studio", label: `Your Studio originals (${studio.length})` },
        ]}
      />
      {tab === "studio" && (
        <p className="mt-3 text-[13px] text-ink-3">
          Original designs must be approved before they can be used for customer birthdays.{" "}
          <Link href="/app/cards" className="font-semibold text-cobalt hover:underline">
            Manage approvals in Cards
          </Link>
        </p>
      )}
      <div className="mt-4 grid max-h-[55vh] grid-cols-3 gap-3 overflow-y-auto p-1 sm:grid-cols-5">
        {list.map((c) => {
          const locked = !CARD_MAP[c.id] && !c.approvedForAutomation;
          const selected = c.id === value;
          return (
            <button
              key={c.id}
              type="button"
              disabled={locked}
              aria-pressed={selected}
              onClick={() => {
                onPick(c.id);
                onClose();
              }}
              className={clsx(
                "group flex flex-col gap-1.5 rounded-2xl p-1.5 text-left transition disabled:cursor-not-allowed",
                selected ? "bg-cobalt-soft ring-2 ring-cobalt" : "hover:bg-ink/5",
              )}
            >
              <span className="relative block">
                <CardFront card={c} shadow={false} className={clsx("ring-1 ring-line", locked && "opacity-50")} />
                {locked && (
                  <span className="absolute inset-x-1 bottom-1 flex items-center justify-center gap-1 rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-semibold text-ink-2">
                    <Lock className="size-3" aria-hidden /> Not approved
                  </span>
                )}
              </span>
              <span className="truncate text-[12px] font-semibold">{c.name}</span>
            </button>
          );
        })}
        {list.length === 0 && (
          <p className="col-span-full py-8 text-center text-[14px] text-ink-3">
            No Studio originals yet.{" "}
            <Link href="/app/studio" className="font-semibold text-cobalt">
              Create one in Card Studio
            </Link>
          </p>
        )}
      </div>
      <div className="mt-4 flex justify-end">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
      </div>
    </Modal>
  );
}
