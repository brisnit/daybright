"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { clsx } from "clsx";
import { ArrowRight, Check, CircleAlert, Package, Sparkles, Zap } from "lucide-react";
import type { Pairing, SearchResults } from "@/lib/ai/search";
import { money } from "@/config/brand";
import { CardFront } from "@/components/cards/card-art";
import { CardTile } from "@/components/cards/card-tile";
import { GiftArt } from "@/components/gifts/gift-art";
import { AIDemoLabel } from "@/components/ui/badges";
import { ButtonLink } from "@/components/ui/button";

const studioHref = (q: string) => `/studio?prompt=${encodeURIComponent(q)}`;

export function sendHref(cardId: string | null, giftId: string | null, amount?: number) {
  const p = new URLSearchParams();
  if (cardId) p.set("card", cardId);
  if (giftId) p.set("gift", giftId);
  if (giftId && amount != null) p.set("amount", String(amount));
  return `/send?${p.toString()}`;
}

export function CreateFromIdea({ query, lead }: { query: string; lead?: boolean }) {
  return (
    <div
      className={clsx(
        "flex flex-col gap-4 rounded-3xl p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6",
        lead ? "bg-ink text-paper" : "bg-lilac-soft/70 ring-1 ring-inset ring-lilac/50",
      )}
    >
      <div>
        <p className={clsx("flex items-center gap-2 text-[12px] font-bold uppercase tracking-[0.14em]", lead ? "text-butter" : "text-lilac-deep")}>
          <Sparkles className="size-3.5" aria-hidden /> {lead ? "Nothing quite fits yet" : "Or make something new"}
        </p>
        <p className={clsx("mt-1.5 font-display text-2xl font-semibold tracking-tight", lead ? "text-paper" : "text-ink")}>
          {lead ? "This sounds like a card worth making from scratch." : "Turn this idea into an original card."}
        </p>
        <p className={clsx("mt-1 text-[14px]", lead ? "text-paper/70" : "text-ink-2")}>Card Studio sketches three concepts from your words, ready to refine (demo).</p>
      </div>
      <ButtonLink href={studioHref(query)} variant={lead ? "coral" : "ink"} iconRight={<ArrowRight className="size-4" aria-hidden />} className="shrink-0">
        Create a card from this idea
      </ButtonLink>
    </div>
  );
}

function SectionHead({ id, title, count, note }: { id: string; title: string; count: number; note?: string }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-2">
      <h2 id={id} className="font-display text-3xl font-semibold tracking-tight">
        {title} <span className="font-grotesk text-lg font-bold text-ink-3">{count}</span>
      </h2>
      {note && <p className="text-[13px] text-ink-3">{note}</p>}
    </div>
  );
}

function PairingCard({ p, i, budget, giftOnlyBudget }: { p: Pairing; i: number; budget: number | null; giftOnlyBudget: boolean }) {
  const reduce = useReducedMotion();
  const giftTotal = Math.round((p.amount + p.shipping) * 100) / 100;
  return (
    <motion.article
      initial={reduce ? false : { opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: i * 0.06 }}
      className="flex flex-col rounded-3xl bg-white p-4 ring-1 ring-line sm:p-5"
    >
      <div className="relative flex items-end gap-3">
        <div className="w-[42%] -rotate-3">
          <CardFront card={p.card} />
        </div>
        <span className="mb-10 grid size-7 shrink-0 place-items-center rounded-full bg-paper font-grotesk text-sm font-bold text-ink-3 ring-1 ring-line">+</span>
        <div className="flex-1 rotate-2">
          <GiftArt gift={p.gift} amount={p.gift.amounts ? p.amount : undefined} />
        </div>
      </div>
      <h3 className="mt-4 font-semibold leading-snug text-ink">
        {p.card.name} <span className="text-ink-3">with</span> {p.gift.name.toLowerCase()}
      </h3>
      <p className="mt-0.5 text-[12.5px] text-ink-3">{p.gift.merchant} · {p.gift.delivery}</p>

      <dl className="mt-3 space-y-1 border-t border-dashed border-line-2 pt-3 text-[13.5px]">
        <Row label="Digital card" value={p.cardPrice ? money(p.cardPrice, { cents: true }) : "Included"} />
        <Row label={p.gift.amounts ? `${p.gift.name} (${money(p.amount)} value)` : p.gift.name} value={money(p.amount, { cents: true })} />
        <Row label="Shipping" value={p.shipping ? money(p.shipping, { cents: true }) : "None, it's digital"} />
        <div className="flex items-baseline justify-between border-t border-line pt-1.5 font-semibold text-ink">
          <dt>Total</dt>
          <dd className="font-grotesk text-lg font-bold">{money(p.total, { cents: true })}</dd>
        </div>
      </dl>
      {p.withinBudget === true && (
        <p className="mt-2 flex items-start gap-1.5 rounded-lg bg-mint-soft px-2.5 py-1.5 text-[12.5px] font-semibold text-mint-deep">
          <Check className="mt-0.5 size-3.5 shrink-0" aria-hidden />
          {giftOnlyBudget
            ? `Gift${p.shipping ? " and shipping" : ""} (${money(giftTotal, { cents: true })}) fit your ${money(budget!)} gift budget. The card adds ${money(p.cardPrice, { cents: true })}.`
            : p.shipping
              ? `Shipping included in your ${money(budget!)} budget`
              : `Within your ${money(budget!)} budget`}
        </p>
      )}
      {p.withinBudget === false && budget != null && (
        <p className="mt-2 flex items-center gap-1.5 rounded-lg bg-coral-soft px-2.5 py-1.5 text-[12.5px] font-semibold text-coral-deep">
          <CircleAlert className="size-3.5" aria-hidden /> Over your {money(budget)} {giftOnlyBudget ? "gift " : ""}budget by{" "}
          {money((giftOnlyBudget ? giftTotal : p.total) - budget, { cents: true })}
        </p>
      )}
      <div className="mt-auto pt-4">
        <ButtonLink href={sendHref(p.card.id, p.gift.id, p.amount)} className="w-full" iconRight={<ArrowRight className="size-4" aria-hidden />}>
          Choose this pairing
        </ButtonLink>
      </div>
    </motion.article>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3 text-ink-2">
      <dt>{label}</dt>
      <dd className="tabular-nums">{value}</dd>
    </div>
  );
}

export function Results({ results, budget }: { results: SearchResults; budget: number | null }) {
  const { cards, gifts, pairings, weak, interpretation } = results;
  const q = interpretation.query;
  const pairingsFirst = interpretation.wantsGift && pairings.length > 0;
  // "A gardening gift under $40" budgets the gift; "a card and chocolate under $30" budgets everything.
  const giftOnlyBudget = !interpretation.wantsCard;

  const pairingSection = pairings.length > 0 && (
    <section aria-labelledby="pairings-h" className="scroll-mt-24" id="pairings">
      <SectionHead
        id="pairings-h"
        title="Card + gift pairings"
        count={pairings.length}
        note={
          budget != null
            ? giftOnlyBudget
              ? `Totals include the card, gift and shipping. Your ${money(budget)} budget is applied to the gift and shipping.`
              : `Totals include the card, gift and shipping, checked against ${money(budget)}.`
            : "Totals include the card, gift and shipping."
        }
      />
      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {pairings.map((p, i) => (
          <PairingCard key={`${p.card.id}-${p.gift.id}`} p={{ ...p, withinBudget: budget == null ? null : (giftOnlyBudget ? p.amount + p.shipping : p.total) <= budget + 0.001 }}
            i={i}
            budget={budget}
            giftOnlyBudget={giftOnlyBudget}
          />
        ))}
      </div>
    </section>
  );

  return (
    <div className="space-y-14">
      {weak && <CreateFromIdea query={q} lead />}

      <nav aria-label="Result sections" className="flex flex-wrap gap-2 text-[13px] font-semibold">
        {[
          ["cards", "Cards", cards.length],
          ["gifts", "Gifts", gifts.length],
          ["pairings", "Pairings", pairings.length],
        ].map(([id, label, n]) => (
          <a key={id} href={`#${id}`} className={clsx("rounded-full px-3 py-1.5 ring-1 ring-inset ring-line-2 hover:ring-ink/40", !n && "pointer-events-none opacity-40")}>
            {label} <span className="font-grotesk text-ink-3">{n}</span>
          </a>
        ))}
        <span className="ml-auto self-center">
          <AIDemoLabel>Demo search</AIDemoLabel>
        </span>
      </nav>

      {pairingsFirst && pairingSection}

      <section aria-labelledby="cards-h" id="cards" className="scroll-mt-24">
        <SectionHead id="cards-h" title="Cards" count={cards.length} note="Every card can be personalized before sending." />
        {cards.length ? (
          <div className="mt-5 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
            {cards.map((r) => (
              <div key={r.card.id}>
                <CardTile card={r.card} href={`/cards/${r.card.id}`} />
                <p className="mt-1.5 px-0.5 text-[12.5px] leading-snug text-ink-2">{r.reason}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-4 text-[15px] text-ink-2">
            No cards in the collection match all of these filters. Try removing a filter, or{" "}
            <Link href={studioHref(q)} className="font-semibold text-cobalt hover:underline">
              create one from this idea
            </Link>
            .
          </p>
        )}
      </section>

      <section aria-labelledby="gifts-h" id="gifts" className="scroll-mt-24">
        <SectionHead id="gifts-h" title="Gifts" count={gifts.length} note="Optional. Illustrative demo merchants and prices." />
        {gifts.length ? (
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {gifts.map((g) => (
              <article key={g.gift.id} className="flex flex-col rounded-3xl bg-white p-3 ring-1 ring-line">
                <GiftArt gift={g.gift} amount={g.gift.amounts ? g.amount : undefined} />
                <div className="flex flex-1 flex-col px-1.5 pb-1 pt-3">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold leading-snug">{g.gift.name}</h3>
                    <span className="inline-flex shrink-0 items-center gap-1 text-[11px] font-bold uppercase tracking-wide text-ink-3">
                      {g.gift.kind === "digital" ? <Zap className="size-3" aria-hidden /> : <Package className="size-3" aria-hidden />}
                      {g.gift.kind}
                    </span>
                  </div>
                  <p className="text-[12px] text-ink-3">{g.gift.merchant}</p>
                  <p className="mt-2 text-[13px] leading-snug text-ink-2">{g.reason}</p>
                  <p className="mt-3 text-[13px] text-ink-2">
                    {money(g.amount, { cents: !Number.isInteger(g.amount) })}
                    {g.gift.shipping ? ` + ${money(g.gift.shipping, { cents: true })} shipping` : " · no shipping"} ={" "}
                    <span className="font-semibold text-ink">{money(g.total, { cents: true })}</span>
                  </p>
                  <Link href={sendHref(null, g.gift.id, g.amount)} className="mt-auto inline-flex items-center gap-1 pt-3 text-[13.5px] font-semibold text-cobalt hover:underline">
                    Send with a card <ArrowRight className="size-3.5" aria-hidden />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <p className="mt-4 text-[15px] text-ink-2">
            No gifts fit these filters{budget != null ? ` within ${money(budget)} including shipping` : ""}. A card on its own is a complete, thoughtful send.
          </p>
        )}
      </section>

      {!pairingsFirst && pairingSection}

      {!weak && <CreateFromIdea query={q} />}
    </div>
  );
}
