"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { DEMO_SENDS } from "@/data/demo-sends";
import { getCard } from "@/lib/cards";
import { CardFront } from "@/components/cards/card-art";

const EXAMPLES = [
  { id: "demo-card", title: "A card from a business", body: "Branded, personal, card only." },
  { id: "demo-gift", title: "A card with a gift", body: "Group signatures and a coffee gift card." },
  { id: "demo-basket", title: "A gift that ships", body: "The recipient adds their own address." },
];

/** Shown for a missing or unknown send id. Warm, never a dead end. */
export function RecipientFallback({ missing }: { missing: boolean }) {
  return (
    <div className="mx-auto flex min-h-[80svh] w-full max-w-3xl flex-col justify-center px-4 py-14 sm:px-6">
      <p className="text-[12px] font-semibold uppercase tracking-[0.2em] text-coral-deep">{missing ? "Hmm, this envelope is empty" : "Birthday cards"}</p>
      <h1 className="mt-3 font-display text-[40px] font-semibold leading-[0.98] tracking-tight text-ink sm:text-6xl">
        {missing ? (
          <>
            We couldn&rsquo;t find
            <br />
            that card.
          </>
        ) : (
          <>
            Open a sample
            <br />
            birthday card.
          </>
        )}
      </h1>
      <p className="mt-4 max-w-md text-[16px] leading-relaxed text-ink-2">
        {missing
          ? "The link may be from another browser, or the demo data was reset. In the meantime, here are a few cards waiting to be opened."
          : "Each one opens just like it would for the person receiving it."}
      </p>
      <ul className="mt-10 grid gap-4 sm:grid-cols-3">
        {EXAMPLES.map((ex, i) => {
          const send = DEMO_SENDS[ex.id];
          const card = getCard(send.cardId);
          return (
            <li key={ex.id}>
              <Link
                href={`/open?id=${ex.id}`}
                className="group flex items-center gap-4 rounded-3xl bg-white p-3 ring-1 ring-line transition hover:-translate-y-0.5 hover:shadow-soft sm:flex-col sm:items-stretch sm:p-4"
              >
                <div className="w-20 shrink-0 transition-transform duration-300 group-hover:-rotate-2 sm:w-full" style={{ rotate: `${(i - 1) * 2}deg` }}>
                  <CardFront card={card} headline={send.headline} />
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-ink">{ex.title}</p>
                  <p className="text-[13px] text-ink-3">{ex.body}</p>
                  <p className="mt-2 inline-flex items-center gap-1 text-[13px] font-semibold text-cobalt">
                    Open it <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
                  </p>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
