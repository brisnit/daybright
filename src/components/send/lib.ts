import type { SendDraft } from "@/lib/types";
import { CONSUMER } from "@/config/brand";
import { GIFT_MAP } from "@/data/gifts";

export const STEPS = [
  { id: "card", label: "Card" },
  { id: "personalize", label: "Personalize" },
  { id: "gift", label: "Gift" },
  { id: "delivery", label: "Delivery" },
  { id: "review", label: "Review" },
] as const;

export type StepId = (typeof STEPS)[number]["id"] | "done";

export const stepIndex = (s: StepId) => (s === "done" ? STEPS.length : STEPS.findIndex((x) => x.id === s));

export function totals(d: Pick<SendDraft, "gift">) {
  const card = CONSUMER.digitalCardPrice;
  const gift = d.gift?.amount ?? 0;
  const shipping = d.gift?.shipping ?? 0;
  return { card, gift, shipping, total: Math.round((card + gift + shipping) * 100) / 100 };
}

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export const firstName = (n: string) => n.trim().split(/\s+/)[0] ?? "";

export type Relationship = "friend" | "family" | "colleague" | "customer";

/** Validation per step. Returns field → message. */
export function validate(step: StepId, d: SendDraft, today: string): Record<string, string> {
  const e: Record<string, string> = {};
  if (step === "personalize") {
    if (!d.recipientName.trim()) e.recipientName = "Who is this card for?";
    if (!d.senderName.trim()) e.senderName = "Add your name so they know who it's from.";
    if (!d.message.trim()) e.message = "Write a message, or let the assistant draft one from your notes.";
  }
  if (step === "delivery") {
    if (!d.recipientEmail.trim()) e.recipientEmail = "Add their email so the card can find them.";
    else if (!EMAIL_RE.test(d.recipientEmail.trim())) e.recipientEmail = "That email doesn't look quite right.";
    if (d.when === "schedule") {
      if (!d.date) e.date = "Pick a delivery date.";
      else if (d.date < today) e.date = "Pick today or a future date.";
    }
    const gift = d.gift ? GIFT_MAP[d.gift.giftId] : null;
    if (gift?.addressRequired && d.addressMode === "enter") {
      if (!d.address.line1.trim()) e.line1 = "Street address is required.";
      if (!d.address.city.trim()) e.city = "City is required.";
      if (!d.address.region.trim()) e.region = "Required.";
      if (!d.address.postal.trim()) e.postal = "Required.";
    }
  }
  return e;
}

export function todayISO() {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

export function fmtLongDate(yyyyMmDd: string) {
  const [y, m, d] = yyyyMmDd.split("-").map(Number);
  if (!y || !m || !d) return yyyyMmDd;
  return new Date(y, m - 1, d).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
}
