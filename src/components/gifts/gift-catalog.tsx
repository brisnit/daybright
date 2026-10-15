"use client";

import { useState } from "react";
import Link from "next/link";
import { clsx } from "clsx";
import { ArrowRight, MapPin, Package, Truck, Zap } from "lucide-react";
import type { Gift, GiftCategory } from "@/lib/types";
import { GIFTS, GIFT_CATEGORY_LABELS, giftPrice } from "@/data/gifts";
import { money } from "@/config/brand";
import { Chip } from "@/components/ui/controls";
import { GiftArt } from "./gift-art";

type Filter = "all" | GiftCategory;
type KindFilter = "any" | "digital" | "physical";

export function giftSendHref(giftId: string, amount?: number) {
  const p = new URLSearchParams({ gift: giftId });
  if (amount != null) p.set("amount", String(amount));
  return `/send?${p.toString()}`;
}

/** Browsable gift catalog with category and delivery filters. */
export function GiftCatalog() {
  const [cat, setCat] = useState<Filter>("all");
  const [kind, setKind] = useState<KindFilter>("any");
  const list = GIFTS.filter((g) => (cat === "all" || g.category === cat) && (kind === "any" || g.kind === kind));
  const cats = Object.entries(GIFT_CATEGORY_LABELS) as [GiftCategory, string][];

  return (
    <div>
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="no-scrollbar -mx-4 flex gap-1.5 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0" role="group" aria-label="Gift category">
          <Chip active={cat === "all"} onClick={() => setCat("all")} className="shrink-0">
            All gifts
          </Chip>
          {cats.map(([id, label]) => (
            <Chip key={id} active={cat === id} onClick={() => setCat(id)} className="shrink-0">
              {label}
            </Chip>
          ))}
        </div>
        <div className="flex gap-1.5" role="group" aria-label="Delivery type">
          {(["any", "digital", "physical"] as const).map((k) => (
            <Chip key={k} tone="cobalt" active={kind === k} onClick={() => setKind(k)}>
              {k === "any" ? "Digital & physical" : k === "digital" ? "Digital" : "Physical"}
            </Chip>
          ))}
        </div>
      </div>

      {list.length ? (
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((g) => (
            <GiftItem key={g.id} gift={g} />
          ))}
        </div>
      ) : (
        <p className="mt-8 rounded-3xl border border-dashed border-line-2 p-8 text-center text-ink-2">
          No {kind} gifts in this category yet.{" "}
          <button type="button" className="font-semibold text-cobalt hover:underline" onClick={() => setKind("any")}>
            Show all delivery types
          </button>
        </p>
      )}
    </div>
  );
}

function GiftItem({ gift }: { gift: Gift }) {
  const [amount, setAmount] = useState(gift.amounts ? gift.amounts[Math.min(1, gift.amounts.length - 1)] : giftPrice(gift));
  const total = amount + gift.shipping;
  return (
    <article className="group flex flex-col rounded-3xl bg-white p-3 ring-1 ring-line transition hover:shadow-soft">
      <GiftArt gift={gift} amount={gift.amounts ? amount : undefined} className="transition-transform duration-300 group-hover:scale-[1.01]" />
      <div className="flex flex-1 flex-col px-2 pb-2 pt-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-display text-xl font-semibold leading-tight tracking-tight">{gift.name}</h3>
            <p className="mt-0.5 text-[12.5px] text-ink-3">{gift.merchant}</p>
          </div>
          <span
            className={clsx(
              "inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide",
              gift.kind === "digital" ? "bg-cobalt-soft text-cobalt-deep" : "bg-butter-soft text-butter-deep",
            )}
          >
            {gift.kind === "digital" ? <Zap className="size-3" aria-hidden /> : <Package className="size-3" aria-hidden />}
            {gift.kind}
          </span>
        </div>
        <p className="mt-2 text-[14px] leading-snug text-ink-2">{gift.description}</p>

        {gift.amounts ? (
          <div className="mt-4">
            <p className="text-[12px] font-semibold text-ink-3" id={`amt-${gift.id}`}>
              Choose an amount
            </p>
            <div className="mt-1.5 flex flex-wrap gap-1.5" role="radiogroup" aria-labelledby={`amt-${gift.id}`}>
              {gift.amounts.map((a) => (
                <button
                  key={a}
                  type="button"
                  role="radio"
                  aria-checked={a === amount}
                  onClick={() => setAmount(a)}
                  className={clsx(
                    "h-8 min-w-12 rounded-full px-3 font-grotesk text-[14px] font-bold ring-1 ring-inset transition",
                    a === amount ? "bg-ink text-paper ring-ink" : "bg-paper text-ink ring-line-2 hover:ring-ink/40",
                  )}
                >
                  {money(a)}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <p className="mt-4 font-grotesk text-2xl font-bold">{money(amount, { cents: !Number.isInteger(amount) })}</p>
        )}

        <dl className="mt-4 grid grid-cols-1 gap-1.5 border-t border-dashed border-line-2 pt-3 text-[13px] text-ink-2">
          <div className="flex items-center gap-2">
            <Truck className="size-3.5 shrink-0 text-ink-3" aria-hidden />
            <dt className="sr-only">Delivery</dt>
            <dd>{gift.delivery}</dd>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="size-3.5 shrink-0 text-ink-3" aria-hidden />
            <dt className="sr-only">Address</dt>
            <dd>{gift.addressRequired ? "Needs a delivery address (you or the recipient can add it)" : "No address needed"}</dd>
          </div>
          <div className="flex items-baseline justify-between gap-2 pt-1">
            <dt>Shipping</dt>
            <dd className="tabular-nums">{gift.shipping ? money(gift.shipping, { cents: true }) : "None"}</dd>
          </div>
          <div className="flex items-baseline justify-between gap-2 font-semibold text-ink">
            <dt>Gift total</dt>
            <dd className="tabular-nums">{money(total, { cents: true })}</dd>
          </div>
        </dl>

        <Link
          href={giftSendHref(gift.id, amount)}
          className="mt-4 inline-flex h-10 items-center justify-center gap-2 rounded-full bg-ink px-5 text-sm font-semibold text-paper transition hover:bg-ink-2"
        >
          Send with a card <ArrowRight className="size-4" aria-hidden />
        </Link>
      </div>
    </article>
  );
}
