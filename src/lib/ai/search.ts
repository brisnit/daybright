import type { CardDesign, CardRecipient, CardStyle, ColorFamily, Gift } from "@/lib/types";
import { CARDS } from "@/data/cards";
import { GIFTS, giftPrice } from "@/data/gifts";
import { CONSUMER, money } from "@/config/brand";
import { normalizeInterest } from "./messages";
import { simulate } from "./simulate";

/**
 * Natural-language card & gift search — demo implementation.
 * Deterministic local matching over the seeded catalog. The interpretation is returned as
 * editable chips so a real model can later produce the same structure.
 */

export type ChipKind = "occasion" | "style" | "recipient" | "budget" | "delivery" | "interest" | "color" | "giftType" | "brand";

export type Chip = { id: string; kind: ChipKind; label: string; value: string };

export type Interpretation = {
  query: string;
  chips: Chip[];
  wantsCard: boolean;
  wantsGift: boolean;
};

export type CardResult = { card: CardDesign; reason: string; score: number };
export type GiftResult = { gift: Gift; amount: number; total: number; reason: string; score: number };
export type Pairing = {
  card: CardDesign;
  gift: Gift;
  amount: number;
  cardPrice: number;
  shipping: number;
  total: number;
  withinBudget: boolean | null;
  reason: string;
};

export type SearchResults = {
  interpretation: Interpretation;
  cards: CardResult[];
  gifts: GiftResult[];
  pairings: Pairing[];
  /** True when nothing scored well; UI should lead with "Create a card from this idea". */
  weak: boolean;
};

export const EXAMPLE_SEARCHES = [
  "A sophisticated birthday card for a longtime real estate client.",
  "Something funny for a coworker who loves coffee.",
  "A gardening gift under $40.",
  "A cheerful card and chocolate gift under $30.",
  "An elegant card in our company colors.",
];

const STYLE_MAP: [RegExp, CardStyle, string][] = [
  [/sophisticat|elegant|classy|refined|upscale|luxur/, "elegant", "Elegant"],
  [/funny|fun\b|silly|humou?r|playful|cheerful|cheery|happy/, "playful", "Playful"],
  [/minimal|simple|clean|understated|calm/, "minimal", "Minimal"],
  [/bold|loud|statement|bright/, "bold", "Bold"],
  [/heartfelt|sincere|sweet|touching|warm/, "heartfelt", "Heartfelt"],
];

const RECIPIENT_MAP: [RegExp, CardRecipient, string][] = [
  [/client|customer|patient|guest/, "customer", "Customer"],
  [/cowork|colleague|team|boss|employee|office/, "colleague", "Colleague"],
  [/friend|bestie|buddy/, "friend", "Friend"],
  [/mom|dad|mother|father|sister|brother|grand|family|aunt|uncle|wife|husband/, "family", "Family"],
];

const COLOR_MAP: [RegExp, ColorFamily, string][] = [
  [/blue|cobalt|navy/, "cobalt", "Blue"],
  [/pink|coral|orange|peach/, "coral", "Coral"],
  [/yellow|gold|sunny/, "butter", "Yellow"],
  [/green|mint|sage/, "mint", "Green"],
  [/purple|lilac|lavender/, "lilac", "Lilac"],
  [/dark|black|night/, "ink", "Dark"],
];

const GIFT_TYPES: [RegExp, string, string][] = [
  [/chocolate|truffle|candy/, "chocolate", "Chocolate"],
  [/flower|bouquet|floral/, "flowers", "Flowers"],
  [/basket|snack/, "basket", "Gift basket"],
  [/gift card|voucher/, "gift-card", "Gift card"],
  [/wellness|spa|relax|self-care/, "wellness", "Wellness"],
  [/tea\b/, "tea", "Tea"],
];

const INTEREST_WORDS = /(garden\w*|coffee|hik\w*|book\w*|read\w*|cook\w*|music|dog\w*|golf|travel\w*|wine|yoga|tea|flowers?|plants?)/g;

export function interpret(query: string): Interpretation {
  const q = query.toLowerCase();
  const chips: Chip[] = [];
  const add = (kind: ChipKind, value: string, label: string) => {
    if (!chips.some((c) => c.kind === kind && c.value === value)) chips.push({ id: `${kind}:${value}`, kind, label, value });
  };

  add("occasion", "birthday", "Birthday");
  STYLE_MAP.forEach(([r, v, l]) => r.test(q) && add("style", v, l));
  RECIPIENT_MAP.forEach(([r, v, l]) => r.test(q) && add("recipient", v, l));
  if (/real estate|realtor|home/.test(q)) add("interest", "home", "Home");
  if (/longtime|long-time|loyal/.test(q)) add("recipient", "customer", "Customer");
  (q.match(INTEREST_WORDS) || []).forEach((w) => {
    const n = normalizeInterest(w);
    if (n === "flowers" && /flower|bouquet/.test(q) && /gift/.test(q)) return; // treated as gift type
    add("interest", n, cap(n));
  });
  GIFT_TYPES.forEach(([r, v, l]) => r.test(q) && add("giftType", v, l));
  if (/company colou?rs|our colou?rs|brand/.test(q)) add("brand", "brand", "Our brand colors");
  COLOR_MAP.forEach(([r, v, l]) => r.test(q) && !/company colou?r|our colou?r/.test(q) && add("color", v, l));

  const budget = q.match(/(?:under|below|less than|up to|max(?:imum)?|budget(?: of)?|within)\s*\$?\s*(\d+)/) || q.match(/\$(\d+)\s*(?:or less|max)/);
  if (budget) add("budget", budget[1], `Under $${budget[1]}`);

  if (/digital|email|instant|today|last[- ]minute/.test(q)) add("delivery", "digital", "Digital delivery");
  else if (/ship|mail|physical|door|deliver(ed)? to/.test(q)) add("delivery", "physical", "Ships to them");

  const wantsGift = /gift|basket|chocolate|flower|treat|present|something/.test(q) || chips.some((c) => c.kind === "giftType");
  const wantsCard = /card/.test(q) || !wantsGift || /something/.test(q);
  if (wantsCard && !wantsGift && !chips.some((c) => c.kind === "delivery")) add("delivery", "digital", "Digital delivery");
  return { query, chips, wantsCard, wantsGift };
}

export function searchSync(interp: Interpretation, opts: { business?: boolean } = {}): SearchResults {
  const get = (k: ChipKind) => interp.chips.filter((c) => c.kind === k).map((c) => c.value);
  const styles = get("style") as CardStyle[];
  const recipients = get("recipient") as CardRecipient[];
  const colors = get("color") as ColorFamily[];
  const interests = get("interest");
  const giftTypes = get("giftType");
  const budget = get("budget")[0] ? Number(get("budget")[0]) : null;
  const delivery = get("delivery")[0] as "digital" | "physical" | undefined;
  const brand = get("brand").length > 0;
  const cardPrice = opts.business ? 0 : CONSUMER.digitalCardPrice;

  /* Cards */
  const cards: CardResult[] = CARDS.map((card) => {
    let score = 0;
    const why: string[] = [];
    const sMatch = styles.filter((s) => card.styles.includes(s));
    if (sMatch.length) { score += 3 * sMatch.length; why.push(`${sMatch.map(lower).join(" and ")} style`); }
    const rMatch = recipients.filter((r) => card.recipients.includes(r));
    if (rMatch.length) { score += 2; why.push(`suited to a ${rMatch[0]}`); }
    const iMatch = interests.filter((i) => card.keywords.some((k) => k.includes(i) || i.includes(k)));
    if (iMatch.length) { score += 4; why.push(`fits their love of ${iMatch[0]}`); }
    if (interests.includes("home") && card.keywords.some((k) => /real estate|client|longtime/.test(k))) { score += 2; }
    if (colors.includes(card.color)) { score += 2; why.push(`${COLOR_MAP.find((c) => c[1] === card.color)?.[2].toLowerCase()} palette`); }
    if (brand && card.styles.includes("elegant")) { score += 1; }
    const qWords = interp.query.toLowerCase().split(/\W+/);
    if (card.keywords.some((k) => qWords.includes(k))) score += 1;
    return { card, score, reason: why.length ? `Matches your request: ${why.join(", ")}.` : "A versatile pick for most recipients." };
  })
    .filter((r) => r.score > 1)
    .sort((a, b) => b.score - a.score)
    .slice(0, 6);

  if (brand) {
    cards.forEach((c) => (c.reason = `${c.reason.replace(/\.$/, "")}. Can be recolored to your brand in Card Studio.`));
  }

  /* Gifts */
  const giftBudget = budget != null ? (interp.wantsCard && interp.wantsGift ? budget - cardPrice : budget) : null;
  const gifts: GiftResult[] = GIFTS.flatMap((gift) => {
    if (delivery && gift.kind !== delivery) return [];
    let score = 0;
    const why: string[] = [];
    const tMatch = giftTypes.filter((t) => gift.id.includes(t) || gift.category === t || gift.tags.includes(t));
    if (tMatch.length) { score += 5; why.push(`it's ${lower(gift.name)}`); }
    const iMatch = interests.filter((i) => gift.tags.some((t) => t.includes(i) || i.includes(t)));
    if (iMatch.length) { score += 4; why.push(`matches their interest in ${iMatch[0]}`); }
    const rMatch = recipients.filter((r) => gift.tags.includes(r) || (r === "customer" && gift.tags.includes("client")));
    if (rMatch.length) { score += 1; }
    if (gift.id === "flex-card") score += 0.5; // safe fallback
    // choose the largest gift-card amount that fits budget
    let amount = giftPrice(gift);
    if (gift.amounts) {
      const fits = gift.amounts.filter((a) => giftBudget == null || a + gift.shipping <= giftBudget);
      amount = fits.length ? fits[Math.min(1, fits.length - 1)] : gift.amounts[0];
    }
    const total = amount + gift.shipping;
    if (giftBudget != null && total > giftBudget) return [];
    if (giftBudget != null) why.push(`${money(total, { cents: true })}${gift.shipping ? " with shipping" : ""}, within your ${money(budget!)} budget`);
    return [{ gift, amount, total, score, reason: why.length ? cap(`${why.join(" and ")}.`) : `${gift.delivery}.` }];
  })
    .filter((g) => g.score > 0.4 || (!giftTypes.length && !interests.length))
    .sort((a, b) => b.score - a.score)
    .slice(0, 4);

  /* Pairings */
  const pairings: Pairing[] = [];
  if (interp.wantsGift || interests.length) {
    const topCards = (cards.length ? cards : fallbackCards()).slice(0, 3);
    const topGifts = gifts.slice(0, 3);
    for (let i = 0; i < Math.min(3, topGifts.length); i++) {
      const c = topCards[i % topCards.length];
      const g = topGifts[i];
      const total = round(cardPrice + g.amount + g.gift.shipping);
      // Gift-only queries budget the gift + shipping; card + gift queries budget the full total.
      const withinBudget = budget != null ? (interp.wantsCard ? total : g.amount + g.gift.shipping) <= budget : null;
      const shipNote = g.gift.shipping ? `shipping included in the ${money(total, { cents: true })} total` : "no shipping needed";
      pairings.push({
        card: c.card,
        gift: g.gift,
        amount: g.amount,
        cardPrice,
        shipping: g.gift.shipping,
        total,
        withinBudget,
        reason: `${c.card.name} with ${lower(g.gift.name)}: ${shipNote}${withinBudget ? `, within ${money(budget!)}` : ""}.`,
      });
    }
  }

  const weak = cards.length === 0 && gifts.every((g) => g.score < 1);
  return { interpretation: interp, cards, gifts, pairings, weak };
}

export async function search(query: string, opts: { business?: boolean } = {}) {
  await simulate(700);
  return searchSync(interpret(query), opts);
}

export async function searchWithChips(interp: Interpretation, opts: { business?: boolean } = {}) {
  await simulate(300);
  return searchSync(interp, opts);
}

function fallbackCards(): CardResult[] {
  return ["garden-arch", "confetti-parade", "candle-glow"].map((id) => ({
    card: CARDS.find((c) => c.id === id)!,
    score: 0,
    reason: "A popular pick.",
  }));
}

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
const lower = (s: string) => s.toLowerCase();
const round = (n: number) => Math.round(n * 100) / 100;
