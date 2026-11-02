import type { Metadata } from "next";
import Link from "next/link";
import { ArrowDown, ArrowRight } from "lucide-react";
import { BRAND, CONSUMER, money } from "@/config/brand";
import { GiftCatalog } from "@/components/gifts/gift-catalog";
import { GiftFinder } from "@/components/gifts/gift-finder";
import { PreviewBanner } from "@/components/site/preview-banner";

export const metadata: Metadata = {
  title: "Gifts",
  description: "Optional gifts to send with a birthday card: gift cards, treats, flowers and more, with clear prices and shipping.",
};

export default function GiftsPage() {
  return (
    <>
      <PreviewBanner />
      <div className="pb-24">
        <section className="mx-auto w-full max-w-6xl px-4 pt-10 sm:px-6 sm:pt-14 lg:px-10">
          <div className="grid gap-8 lg:grid-cols-[1.3fr_1fr] lg:items-end">
            <div>
              <p className="text-[12px] font-bold uppercase tracking-[0.16em] text-coral-deep">Gifts</p>
              <h1 className="mt-3 font-display text-[44px] font-semibold leading-[0.95] tracking-tight sm:text-7xl">
                A little something extra.
                <br />
                <span className="font-display-wonk italic text-cobalt">Entirely optional.</span>
              </h1>
              <p className="mt-5 max-w-xl text-[17px] leading-relaxed text-ink-2">
                Add a gift card, a treat or flowers to any card, with the price, shipping and delivery time shown up front.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <a href="#finder" className="inline-flex h-11 items-center gap-2 rounded-full bg-cobalt px-5 text-sm font-semibold text-white shadow-soft hover:bg-cobalt-deep">
                  Help me choose <ArrowDown className="size-4" aria-hidden />
                </a>
                <a href="#catalog" className="inline-flex h-11 items-center rounded-full bg-white/70 px-5 text-sm font-semibold ring-1 ring-inset ring-line-2 hover:ring-ink/40">
                  Browse all gifts
                </a>
              </div>
            </div>
            <aside className="relative rotate-1 rounded-3xl bg-butter-soft p-6 ring-1 ring-butter/60">
              <p className="font-hand text-3xl leading-none text-butter-deep">Just the card?</p>
              <p className="mt-3 text-[15px] leading-relaxed text-ink-2">
                That’s a complete gift. A thoughtful message on an original card is what people remember. Every {BRAND.name} card is{" "}
                {money(CONSUMER.digitalCardPrice, { cents: true })} on its own (provisional demo pricing), and adding a gift is always your choice.
              </p>
              <Link href="/cards" className="mt-4 inline-flex items-center gap-1.5 text-[14px] font-semibold text-ink hover:underline">
                Choose a card <ArrowRight className="size-4" aria-hidden />
              </Link>
            </aside>
          </div>
        </section>

        <section id="finder" className="mx-auto mt-20 w-full max-w-6xl scroll-mt-24 px-4 sm:px-6 lg:px-10" aria-labelledby="finder-h">
          <div className="mb-6 max-w-2xl">
            <p className="text-[12px] font-bold uppercase tracking-[0.16em] text-lilac-deep">Thoughtful Gift Finder</p>
            <h2 id="finder-h" className="mt-2 font-display text-4xl font-semibold tracking-tight sm:text-5xl">
              Five questions. Three good ideas.
            </h2>
            <p className="mt-2 text-[15px] text-ink-2">Not sure what they’d like? We’ll suggest a flexible option and explain why.</p>
          </div>
          <GiftFinder />
        </section>

        <section id="catalog" className="mx-auto mt-20 w-full max-w-6xl scroll-mt-24 px-4 sm:px-6 lg:px-10" aria-labelledby="catalog-h">
          <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <h2 id="catalog-h" className="font-display text-4xl font-semibold tracking-tight sm:text-5xl">
              The gift shelf
            </h2>
            <p className="max-w-sm text-[13px] text-ink-3">
              Merchants are fictional and prices are illustrative for this demo. Gifts would be priced separately from the card.
            </p>
          </div>
          <GiftCatalog />
        </section>
      </div>
    </>
  );
}
