import type { AutomationRule, Customer, Send } from "@/lib/types";
import { GIFT_MAP } from "@/data/gifts";
import { money } from "@/config/brand";
import { fmtTime, tzLabel } from "@/lib/dates";

/** Plain-language summary of an automation rule (short form for dashboards and profiles). */
export function ruleSummary(rule: AutomationRule) {
  const who = rule.segment.type === "all" ? "every customer" : `customers tagged ${rule.segment.tag}`;
  const tz = rule.timezone === "recipient" ? "each recipient's local time" : tzLabel(rule.timezone);
  let text = `Sends ${who} a birthday card at ${fmtTime(rule.sendTime)} (${tz}).`;
  if (rule.giftMode === "gift" && rule.giftId) {
    const gift = GIFT_MAP[rule.giftId];
    const target = rule.giftSegmentTag ? `${rule.giftSegmentTag} customers` : "everyone in this rule";
    text += ` Includes a ${money(rule.giftAmount)} ${gift?.name.toLowerCase() ?? "gift"} for ${target}${rule.monthlyGiftBudget ? `, within a ${money(rule.monthlyGiftBudget)} monthly gift budget` : ""}.`;
  } else {
    text += " Card only.";
  }
  text += rule.approval === "review" ? " You review cards before they go out." : " Cards go out automatically.";
  return text;
}

export type ReasonLine = { source: string; text: string };

/** Turn stored AI reason fragments into plain "Suggested because..." sentences with their source field. */
export function explainReason(raw: string, customer?: Customer | null): ReasonLine {
  const r = raw.trim();
  let m = r.match(/^Interests include (.+)$/i);
  if (m) return { source: "Interests", text: `Suggested because this customer's interests include ${m[1]}.` };
  m = r.match(/^Relationship note:?\s*(.+)$/i);
  if (m) return { source: "Relationship notes", text: `Suggested because of your note: ${m[1].replace(/^[“"]|[”"]$/g, "")}.` };
  if (/long-standing/i.test(r)) return { source: "Relationship notes", text: "Suggested because your notes mention a long-standing relationship." };
  m = r.match(/^Tagged (.+?): gift rule applies$/i);
  if (m) return { source: "Tags", text: `Gift suggested because ${customer?.firstName ?? "this customer"} is tagged ${m[1]}, and your rule includes a gift for that tag.` };
  m = r.match(/^Gift idea based on interest in (.+)$/i);
  if (m) return { source: "Interests", text: `Gift idea chosen because of an interest in ${m[1]}.` };
  m = r.match(/^Avoids last year's card \((.+)\)$/i);
  if (m) return { source: "Card history", text: `Uses a different design from last year's card (${m[1]}).` };
  if (/^Customer preference: card only/i.test(r)) return { source: "Gift preference", text: "No gift suggested: this customer prefers card only." };
  if (/^Flexible gift card/i.test(r)) return { source: "Gift preference", text: "A flexible gift card, since gift preferences aren't recorded." };
  if (/No personal notes/i.test(r)) return { source: "No context", text: r.endsWith(".") ? r : `${r}.` };
  if (/AI personalization is off|shared template/i.test(r)) return { source: "Shared template", text: r.endsWith(".") ? r : `${r}.` };
  return { source: "Suggestion", text: r.endsWith(".") ? r : `${r}.` };
}

/** Send currently awaiting the customer's next birthday (review or scheduled). */
export function upcomingSendFor(sends: Send[], customerId: string) {
  return (
    sends
      .filter((s) => s.customerId === customerId && (s.status === "pending-review" || s.status === "scheduled"))
      .sort((a, b) => a.scheduledFor.localeCompare(b.scheduledFor))[0] ?? null
  );
}

export function lowerFirst(s: string) {
  return s.charAt(0).toLowerCase() + s.slice(1);
}

export function plural(n: number, one: string, many = `${one}s`) {
  return n === 1 ? one : many;
}
