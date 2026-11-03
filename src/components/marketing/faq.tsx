"use client";

import { useId, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { clsx } from "clsx";
import { Plus } from "lucide-react";
import { CONSUMER, PRICING_COPY, money } from "@/config/brand";
import { PUBLIC_TIERS } from "@/config/charter";
import { Container, Display, Eyebrow, Reveal } from "./primitives";

export type FaqItem = { q: string; a: ReactNode };

const planSummary = PUBLIC_TIERS.map((t) => (t.charter ? `${t.name} ${money(t.charter.amount)}/${t.charter.cadence} (proposed)` : `${t.name} custom`)).join(", ");

export const FAQS: Record<string, FaqItem> = {
  included: {
    q: "What’s included in a business plan?",
    a: (
      <>
        The digital card collection, birthday scheduling and automation, CSV import, and your logo and signature on each card are
        in the product preview and still in development. Proposed Founding Charter plans differ by contacts, seats and features:{" "}
        {planSummary}. See Pricing for details. Nothing is charged today.
      </>
    ),
  },
  giftsCost: {
    q: "Do gifts cost extra?",
    a: (
      <>
        Yes. Gift cards and physical gifts are priced separately from your plan or card, and any shipping is shown before you
        confirm. Gifts are always optional. A card on its own is a complete send. For businesses, gifts can require approval and
        stay inside a monthly gift budget.
      </>
    ),
  },
  address: {
    q: "How do physical gifts get a delivery address?",
    a: (
      <>
        In the live product, you could enter an address yourself, or let the recipient add their own when they open the card. Their address goes
        straight to the gift order, and the card arrives either way. In this prototype, address entry is simulated.
      </>
    ),
  },
  birthYear: {
    q: "Do I need customers’ birth years?",
    a: <>No. Month and day are enough. Birth year is optional and only used if you choose to mark a milestone birthday.</>,
  },
  review: {
    q: "Can I review cards before they’re sent?",
    a: (
      <>
        In the product preview, each automation can send automatically or wait for review. In review, you can preview every card, edit the message,
        swap the design, skip one birthday, and approve the ones you’re happy with. Gifts can always require approval.
      </>
    ),
  },
  ai: {
    q: "Is the AI real? Are there limits?",
    a: (
      <>
        In this prototype, Card Studio, the message assistant and search use curated demo results that respond to what you enter,
        so you can see how the product will feel. Generated previews are labeled as demo examples. AI card creation and message
        help are separate from your card-send allowance. {PRICING_COPY.aiAllowance}
      </>
    ),
  },
  feb29: {
    q: "What happens with a February 29 birthday?",
    a: (
      <>
        In non-leap years, leap-day birthdays are celebrated on February 28 by default. You can switch that to March 1 in the
        automation settings.
      </>
    ),
  },
  lateAdd: {
    q: "What if I add a customer after their birthday has passed?",
    a: <>Nothing is sent by surprise. By default they’re skipped until next year, or you can choose to send a belated card.</>,
  },
  consumer: {
    q: "Can I send just one card without a plan?",
    a: (
      <>
        Yes. Pick a card or make one in Card Studio, personalize it, and send it now or schedule it (simulated in this demo). One digital card is{" "}
        {money(CONSUMER.digitalCardPrice)} in this demo (provisional pricing), plus any gift you choose to add.
      </>
    ),
  },
};

export const HOME_FAQ = ["included", "giftsCost", "address", "birthYear", "review", "ai", "feb29", "consumer"].map((k) => FAQS[k]);

export function FaqList({ items }: { items: FaqItem[] }) {
  const [open, setOpen] = useState<number | null>(0);
  const base = useId();
  return (
    <ul className="divide-y divide-line border-y border-line">
      {items.map((item, i) => {
        const isOpen = open === i;
        const btn = `${base}-b${i}`;
        const panel = `${base}-p${i}`;
        return (
          <li key={item.q}>
            <h3>
              <button
                id={btn}
                type="button"
                aria-expanded={isOpen}
                aria-controls={panel}
                onClick={() => setOpen(isOpen ? null : i)}
                className="group flex w-full items-center justify-between gap-6 py-5 text-left"
              >
                <span className="font-display text-lg font-semibold tracking-tight text-ink sm:text-xl">{item.q}</span>
                <span
                  className={clsx(
                    "grid size-9 shrink-0 place-items-center rounded-full ring-1 ring-line-2 transition",
                    isOpen ? "rotate-45 bg-ink text-paper ring-ink" : "bg-white text-ink group-hover:ring-ink/40",
                  )}
                  aria-hidden
                >
                  <Plus className="size-4" />
                </span>
              </button>
            </h3>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  id={panel}
                  role="region"
                  aria-labelledby={btn}
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                  className="overflow-hidden"
                >
                  <p className="max-w-3xl pb-6 pr-12 text-[15px] leading-relaxed text-ink-2">{item.a}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </li>
        );
      })}
    </ul>
  );
}

export function FaqSection({ items = HOME_FAQ, title = "Good questions." }: { items?: FaqItem[]; title?: string }) {
  return (
    <section aria-labelledby="faq-title" className="py-20 sm:py-28">
      <Container className="grid gap-10 lg:grid-cols-[0.75fr_1.25fr] lg:gap-16">
        <Reveal>
          <Eyebrow tone="coral">FAQ</Eyebrow>
          <Display id="faq-title" className="mt-4 text-4xl leading-[1] text-ink sm:text-6xl">
            {title}
          </Display>
          <p className="mt-4 max-w-sm text-ink-2">Straight answers about cards, gifts, pricing and what happens on the day.</p>
        </Reveal>
        <Reveal delay={0.06}>
          <FaqList items={items} />
        </Reveal>
      </Container>
    </section>
  );
}
