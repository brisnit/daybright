"use client";

import Link from "next/link";
import { useState } from "react";
import { clsx } from "clsx";
import { Check, Mail, MapPin, Package, Plus, Search } from "lucide-react";
import type { CardDesign, Gift, GiftSelection, SendDraft } from "@/lib/types";
import { GIFTS, giftPrice } from "@/data/gifts";
import { CONSUMER, money } from "@/config/brand";
import { CardFront } from "@/components/cards/card-art";
import { GiftArt } from "@/components/gifts/gift-art";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badges";
import { StepHeading } from "./step-card";
import { firstName } from "./lib";

export function StepGift({ card, draft, setGift }: { card: CardDesign; draft: SendDraft; setGift: (g: GiftSelection | null) => void }) {
  const name = firstName(draft.recipientName) || "them";
  const none = !draft.gift;
  const digital = GIFTS.filter((g) => g.kind === "digital");
  const physical = GIFTS.filter((g) => g.kind === "physical");

  return (
    <div>
      <StepHeading kicker="Step three" title="Add a gift, if you like" sub="Completely optional. Gifts are priced separately and listed clearly on the review step." />

      {/* Just the card */}
      <button
        type="button"
        aria-pressed={none}
        onClick={() => setGift(null)}
        className={clsx(
          "relative mt-8 grid w-full items-center gap-5 overflow-hidden rounded-[2rem] p-5 text-left ring-inset transition sm:grid-cols-[120px_1fr_auto] sm:p-7",
          none ? "bg-butter-soft ring-2 ring-ink" : "bg-white ring-1 ring-line hover:ring-ink/30",
        )}
      >
        <div className="hidden w-[110px] -rotate-3 sm:block" aria-hidden>
          <CardFront card={card} headline={draft.headline} />
        </div>
        <div>
          <p className="font-display text-3xl font-semibold tracking-tight text-ink">Just the card</p>
          <p className="mt-1.5 max-w-lg text-[15px] leading-relaxed text-ink-2">
            Your words, on a card chosen for {name}. That&rsquo;s a complete, lovely birthday on its own. Nothing else needed.
          </p>
        </div>
        <div className="flex items-center gap-3 sm:flex-col sm:items-end">
          <span className="font-grotesk text-2xl font-bold text-ink">{money(CONSUMER.digitalCardPrice)}</span>
          <span
            className={clsx(
              "inline-flex h-8 items-center gap-1.5 rounded-full px-3 text-[13px] font-semibold",
              none ? "bg-ink text-paper" : "bg-ink/5 text-ink-2",
            )}
          >
            {none ? (
              <>
                <Check className="size-3.5" aria-hidden /> Selected
              </>
            ) : (
              "Choose card only"
            )}
          </span>
        </div>
      </button>

      <div className="mt-12 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h3 className="font-display text-2xl font-semibold tracking-tight text-ink">Gift cards</h3>
          <p className="text-[14px] text-ink-3">Digital. Arrives inside the card, no address or shipping.</p>
        </div>
        <Link href="/gifts#finder" className="inline-flex items-center gap-1.5 text-[14px] font-semibold text-cobalt hover:underline">
          <Search className="size-4" aria-hidden /> Not sure? Try the Gift Finder
        </Link>
      </div>
      <ul className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {digital.map((g) => (
          <GiftOption key={g.id} gift={g} draft={draft} setGift={setGift} name={name} />
        ))}
      </ul>

      <div className="mt-12">
        <h3 className="font-display text-2xl font-semibold tracking-tight text-ink">Curated gifts</h3>
        <p className="text-[14px] text-ink-3">Physical (demo merchants; nothing ships). Shipping is shown up front.</p>
      </div>
      <ul className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {physical.map((g) => (
          <GiftOption key={g.id} gift={g} draft={draft} setGift={setGift} name={name} />
        ))}
      </ul>
      <p className="mt-6 text-[13px] text-ink-3">One gift per card. Merchants are fictional; prices and delivery times are illustrative.</p>
    </div>
  );
}

function GiftOption({ gift, draft, setGift, name }: { gift: Gift; draft: SendDraft; setGift: (g: GiftSelection | null) => void; name: string }) {
  const added = draft.gift?.giftId === gift.id;
  const [amount, setAmount] = useState<number>(added ? draft.gift!.amount : giftPrice(gift));
  const price = gift.amounts ? amount : giftPrice(gift);
  const select = (a = price) => setGift({ giftId: gift.id, amount: a, shipping: gift.shipping });

  return (
    <li
      className={clsx(
        "flex flex-col rounded-3xl bg-white p-3 ring-inset transition",
        added ? "shadow-soft ring-2 ring-cobalt" : "ring-1 ring-line",
      )}
    >
      <div className="relative">
        <GiftArt gift={gift} amount={gift.amounts ? amount : undefined} />
        {added && (
          <span className="absolute left-2.5 top-2.5">
            <Badge tone="cobalt">
              <Check className="size-3" aria-hidden /> Added
            </Badge>
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col px-2 pb-1 pt-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="font-semibold leading-tight text-ink">{gift.name}</p>
            <p className="mt-0.5 truncate text-[13px] text-ink-3">{gift.merchant}</p>
          </div>
          <p className="shrink-0 text-right">
            <span className="font-grotesk text-xl font-bold text-ink">{money(price)}</span>
            {gift.shipping > 0 && <span className="block text-[12px] text-ink-3">+ {money(gift.shipping)} shipping</span>}
          </p>
        </div>
        <p className="mt-2 line-clamp-2 text-[13px] leading-snug text-ink-2">{gift.description}</p>

        {gift.amounts && (
          <div className="mt-3 flex flex-wrap gap-1.5" role="radiogroup" aria-label={`${gift.name} amount`}>
            {gift.amounts.map((a) => (
              <button
                key={a}
                type="button"
                role="radio"
                aria-checked={amount === a}
                onClick={() => {
                  setAmount(a);
                  if (added) select(a);
                }}
                className={clsx(
                  "h-8 min-w-12 rounded-full px-3 font-grotesk text-[13px] font-bold ring-1 ring-inset transition",
                  amount === a ? "bg-ink text-paper ring-ink" : "bg-paper text-ink-2 ring-line-2 hover:ring-ink/40",
                )}
              >
                {money(a)}
              </button>
            ))}
          </div>
        )}

        <ul className="mt-3 flex flex-col gap-1 text-[12px] text-ink-3">
          <li className="flex items-center gap-1.5">
            {gift.kind === "digital" ? <Mail className="size-3.5" aria-hidden /> : <Package className="size-3.5" aria-hidden />}
            {gift.kind === "digital" ? "Digital" : "Physical"} · {gift.delivery}
          </li>
          {gift.addressRequired && (
            <li className="flex items-center gap-1.5">
              <MapPin className="size-3.5" aria-hidden /> Address needed. {name === "them" ? "They" : name} can add it.
            </li>
          )}
        </ul>

        <div className="mt-auto pt-4">
          {added ? (
            <Button variant="outline" size="sm" className="w-full" onClick={() => setGift(null)}>
              Remove gift
            </Button>
          ) : (
            <Button variant="soft" size="sm" className="w-full" onClick={() => select()} icon={<Plus className="size-3.5" aria-hidden />}>
              Add for {money(price + gift.shipping, { cents: gift.shipping > 0 })}
              {gift.shipping > 0 ? " with shipping" : ""}
            </Button>
          )}
        </div>
      </div>
    </li>
  );
}
