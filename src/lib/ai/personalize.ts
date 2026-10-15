import type { Business, CardDesign, Customer, Motif } from "@/lib/types";
import { CARDS } from "@/data/cards";
import { GIFT_MAP } from "@/data/gifts";
import { draftMessagesSync, extractFacts, renderTemplate } from "./messages";
import { hash, simulate } from "./simulate";

/**
 * Business personalization — demo implementation.
 * Suggests a card, message and optional gift using ONLY the customer's recorded interests, notes and tags.
 * Every suggestion carries the source fields it used, so reviewers can see why.
 */

export type Suggestion = {
  cardId: string;
  message: string;
  giftId: string | null;
  giftAmount: number;
  reasons: string[];
  /** True when there was no personal context and a general message was used. */
  general: boolean;
};

const INTEREST_CARDS: Record<string, string[]> = {
  gardening: ["garden-arch", "wildflower-row"],
  flowers: ["garden-arch", "wildflower-row"],
  hiking: ["studio-trail", "sunburst"],
  coffee: ["orbit-circles", "confetti-parade"],
  books: ["orbit-circles", "postmark"],
  reading: ["wildflower-row", "orbit-circles"],
  cooking: ["citrus-toast", "layer-cake"],
  music: ["sunburst", "big-type"],
  dogs: ["party-hats", "paper-collage"],
  golf: ["postmark", "citrus-toast"],
  cycling: ["big-type", "sunburst"],
  travel: ["postmark", "balloon-bouquet"],
  photography: ["midnight-sparkler", "paper-collage"],
  wine: ["citrus-toast", "midnight-sparkler"],
  yoga: ["candle-glow", "orbit-circles"],
};

const INTEREST_GIFTS: Record<string, string> = {
  gardening: "garden-kit", flowers: "flowers", coffee: "coffee-card", books: "book-card", reading: "book-card",
  cooking: "snack-basket", tea: "tea", yoga: "wellness",
};

export function suggestForCustomerSync(
  customer: Customer,
  business: Business,
  opts: { variant?: number; allowGift?: boolean; template?: string; avoidCardIds?: string[] } = {},
): Suggestion {
  const facts = extractFacts(customer.notes, customer.interests);
  const reasons: string[] = [];
  const variant = opts.variant ?? 0;
  const avoid = new Set([...(opts.avoidCardIds ?? []), ...customer.history.slice(0, 1).map((h) => h.cardId)]);

  const interest = facts.interests[0];
  if (customer.interests.length) reasons.push(`Interests include ${customer.interests.map((i) => i.toLowerCase()).join(" and ")}`);
  if (facts.gratitude) reasons.push(`Relationship note: “${customer.notes.split(/[.;]/).find((s) => /helped us/i.test(s))?.trim()}”`);
  else if (facts.longtime) reasons.push("Relationship note mentions a long-standing relationship");

  // Card
  let pool = (interest && INTEREST_CARDS[interest]) || [];
  pool = pool.filter((id) => !avoid.has(id));
  if (!pool.length) pool = [business.defaultCardId, "candle-glow", "citrus-toast", "orbit-circles"].filter((id) => !avoid.has(id));
  const cardId = pool[(variant + hash(customer.id)) % pool.length] ?? business.defaultCardId;
  if (customer.history[0] && avoid.has(customer.history[0].cardId)) reasons.push(`Avoids last year's card (${cardName(customer.history[0].cardId)})`);

  // Message
  const general = !customer.interests.length && !facts.used.length;
  let message: string;
  if (general) {
    message = renderTemplate(opts.template ?? business.defaultMessage, {
      firstName: customer.firstName,
      companyName: business.name,
      senderName: business.senderName,
    });
    reasons.push("No personal notes on file, so this uses your general birthday message");
  } else {
    const options = draftMessagesSync({
      recipientName: customer.firstName,
      senderName: business.senderName,
      companyName: business.name,
      notes: customer.notes,
      interests: customer.interests,
      relationship: "customer",
      voice: business.voice,
      business: true,
    });
    message = options[variant % options.length].text;
  }

  // Gift: only suggested, never auto-approved.
  let giftId: string | null = null;
  let giftAmount = 0;
  if (opts.allowGift && customer.giftPreference !== "card-only") {
    const g = (interest && INTEREST_GIFTS[interest]) || "flex-card";
    const gift = GIFT_MAP[g];
    if (gift && !(customer.giftPreference === "no-physical" && gift.kind === "physical")) {
      giftId = g;
      giftAmount = gift.amounts ? gift.amounts[1] ?? gift.amounts[0] : gift.price ?? 0;
      reasons.push(interest && INTEREST_GIFTS[interest] ? `Gift idea based on interest in ${interest}` : "Flexible gift card, since preferences are unknown");
    }
  } else if (customer.giftPreference === "card-only") {
    reasons.push("Customer preference: card only");
  }

  return { cardId, message, giftId, giftAmount, reasons, general };
}

export async function suggestForCustomer(...args: Parameters<typeof suggestForCustomerSync>) {
  await simulate(800);
  return suggestForCustomerSync(...args);
}

/* ------------------------------------------------------------------ */
/* Annual freshness                                                    */
/* ------------------------------------------------------------------ */

export type FreshSuggestion = {
  cardId: string;
  message: string;
  explanation: string;
};

export function freshSuggestionsSync(customer: Customer, business: Business): FreshSuggestion[] {
  const usedCards = customer.history.map((h) => h.cardId);
  const last = customer.history[0];
  const base = suggestForCustomerSync(customer, business, { avoidCardIds: usedCards });
  const alt = suggestForCustomerSync(customer, business, { avoidCardIds: [...usedCards, base.cardId], variant: 1 });
  const lastText = last ? `Last year ${customer.firstName} received ${cardName(last.cardId)}` : "No previous cards on record";
  const lastStyles = last ? CARDS.find((c) => c.id === last.cardId)?.styles ?? [] : [];
  return [base, alt].map((s, i) => {
    const card = CARDS.find((c) => c.id === s.cardId);
    const styleShift = card && lastStyles.length && !card.styles.some((x) => lastStyles.includes(x)) ? ` in a different style (${card.styles[0]})` : "";
    return {
      cardId: s.cardId,
      message: s.message,
      explanation: `${lastText}. This suggestion uses a new design${styleShift} and ${i === 0 ? "fresh wording" : "a different tone"} so it doesn't repeat.`,
    };
  });
}

/* ------------------------------------------------------------------ */

export const MOTIF_FOR_INTEREST: Record<string, Motif> = {
  gardening: "plant", flowers: "flower", hiking: "mountain", coffee: "coffee", books: "book", reading: "book",
  music: "music", dogs: "paw", cooking: "chef", cycling: "bike", photography: "camera", golf: "golf", travel: "wave",
};

function cardName(id: string) {
  return CARDS.find((c) => c.id === id)?.name ?? (id.startsWith("studio") ? "an original Studio design" : id);
}

export type { CardDesign };
