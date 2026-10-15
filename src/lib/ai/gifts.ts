import type { Gift } from "@/lib/types";
import { GIFTS } from "@/data/gifts";
import { money } from "@/config/brand";
import { normalizeInterest } from "./messages";
import { simulate } from "./simulate";

/**
 * Thoughtful Gift Finder — demo implementation.
 * Never adds a gift or spends money; it only returns recommendations for the user to choose.
 */

export type FinderAnswers = {
  who: "customer" | "colleague" | "friend" | "family" | "";
  enjoys: string[]; // interests, may be empty / "not sure"
  budget: number; // total incl. shipping
  kind: "digital" | "physical" | "either";
  when: "today" | "this-week" | "flexible";
};

export type GiftRecommendation = {
  gift: Gift;
  amount: number;
  shipping: number;
  total: number;
  reason: string;
  tag: "Best match" | "Flexible pick" | "Budget friendly" | "Something different";
};

export const ENJOY_OPTIONS = ["Coffee", "Gardening", "Sweets", "Books", "Relaxing", "Snacks", "Flowers", "Tea", "Not sure"];

export function recommendGiftsSync(a: FinderAnswers): GiftRecommendation[] {
  const unknown = !a.enjoys.length || a.enjoys.some((e) => /not sure/i.test(e));
  const interests = a.enjoys.filter((e) => !/not sure/i.test(e)).map((e) => {
    const n = normalizeInterest(e);
    return n === "sweets" ? "chocolate" : n === "relaxing" ? "wellness" : n;
  });

  const candidates = GIFTS.flatMap((g) => {
    if (a.kind !== "either" && g.kind !== a.kind) return [];
    if (a.when === "today" && g.kind === "physical") return [];
    if (a.when === "this-week" && /3–5/.test(g.delivery)) return [];
    const amounts = g.amounts ?? [g.price ?? 0];
    const fits = amounts.filter((x) => x + g.shipping <= a.budget);
    if (!fits.length) return [];
    const amount = g.amounts ? fits[fits.length - 1] : fits[0];
    let score = 0;
    const hits = interests.filter((i) => g.tags.some((t) => t.includes(i) || i.includes(t)) || g.category === i);
    score += hits.length * 4;
    if (a.who && (g.tags.includes(a.who) || (a.who === "customer" && g.tags.includes("client")))) score += 1;
    if (g.id === "flex-card") score += unknown ? 6 : 0.5;
    return [{ g, amount, score, hits }];
  }).sort((x, y) => y.score - x.score);

  const picks = candidates.slice(0, 3);
  return picks.map((p, i) => {
    const total = round(p.amount + p.g.shipping);
    const totalText = `${money(total, { cents: true })} total${p.g.shipping ? ` including ${money(p.g.shipping, { cents: true })} shipping` : ", nothing to ship"}`;
    let reason: string;
    let tag: GiftRecommendation["tag"];
    if (p.g.id === "flex-card" && (unknown || !p.hits.length)) {
      reason = unknown
        ? `Since you're not sure what they enjoy, a flexible card lets them choose. ${totalText}.`
        : `A safe backup that lets them choose. ${totalText}.`;
      tag = "Flexible pick";
    } else if (p.hits.length) {
      reason = `They enjoy ${p.hits[0]}, and this fits your ${money(a.budget)} budget: ${totalText}. ${p.g.delivery}.`;
      tag = i === 0 ? "Best match" : "Something different";
    } else {
      reason = `Within budget at ${totalText}. ${p.g.delivery}.`;
      tag = total < a.budget * 0.7 ? "Budget friendly" : "Something different";
    }
    return { gift: p.g, amount: p.amount, shipping: p.g.shipping, total, reason, tag };
  });
}

export async function recommendGifts(a: FinderAnswers) {
  await simulate(900);
  return recommendGiftsSync(a);
}

const round = (n: number) => Math.round(n * 100) / 100;
