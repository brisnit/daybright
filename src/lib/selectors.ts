import type { AutomationRule, Customer, DemoState, Send } from "@/lib/types";
import { getPlan } from "@/config/brand";
import { daysUntil, isThisMonth, isValidBirthday, nextBirthday } from "@/lib/dates";

/** Gift spend this calendar month. `includeApproved` counts approved-but-not-yet-sent gifts toward the budget. */
export function giftSpendThisMonth(sends: Send[], includeApproved = true) {
  return sends.reduce((sum, s) => {
    if (!s.gift) return sum;
    const counted =
      s.gift.status === "claimed" ||
      s.gift.status === "shipped" ||
      s.gift.status === "awaiting-address" ||
      (includeApproved && s.gift.status === "approved");
    return counted && isThisMonth(s.scheduledFor) ? sum + s.gift.amount + s.gift.shipping : sum;
  }, 0);
}

export const SENT_STATUSES = new Set(["sent", "opened", "gift-claimed", "awaiting-address", "needs-attention"]);

export function cardsSentThisMonth(sends: Send[]) {
  return sends.filter((s) => s.source !== "consumer" && SENT_STATUSES.has(s.status) && isThisMonth(s.scheduledFor)).length;
}

export function usage(state: Pick<DemoState, "sends" | "planId">) {
  const plan = getPlan(state.planId);
  const sent = cardsSentThisMonth(state.sends);
  const scheduled = state.sends.filter(
    (s) => s.source !== "consumer" && (s.status === "scheduled" || s.status === "pending-review") && isThisMonth(s.scheduledFor),
  ).length;
  return { plan, sent, scheduled, remaining: Math.max(0, plan.monthlySends - sent), pct: Math.min(100, (sent / plan.monthlySends) * 100) };
}

export type Upcoming = { customer: Customer; date: Date; days: number; send: Send | null };

export function upcomingBirthdays(state: Pick<DemoState, "customers" | "sends" | "automations">, withinDays = 30): Upcoming[] {
  const feb29 = state.automations[0]?.feb29 ?? "feb28";
  return state.customers
    .map((c) => {
      const date = nextBirthday(c, feb29);
      const days = daysUntil(date);
      const send =
        state.sends.find(
          (s) => s.customerId === c.id && s.status !== "skipped" && date && Math.abs(new Date(s.scheduledFor).getTime() - date.getTime()) < 3 * 86_400_000,
        ) ?? null;
      return { customer: c, date: date!, days: days ?? Infinity, send };
    })
    .filter((u) => u.date && u.days >= 0 && u.days <= withinDays)
    .sort((a, b) => a.days - b.days);
}

export function customerIssues(c: Customer) {
  const issues: string[] = [];
  if (!c.birthMonth || !c.birthDay) issues.push("Missing birthday");
  else if (!isValidBirthday(c.birthMonth, c.birthDay)) issues.push("Invalid birthday");
  if (!c.email) issues.push("Missing email");
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(c.email)) issues.push("Invalid email");
  return issues;
}

export function customersNeedingDetails(customers: Customer[]) {
  return customers.filter((c) => customerIssues(c).length > 0);
}

/** Celebration Planner: live summary of the coming month from local state. */
export function plannerSummary(state: Pick<DemoState, "customers" | "sends" | "automations">) {
  const upcoming = upcomingBirthdays(state, 30);
  const ready = upcoming.filter((u) => u.send && u.send.status === "scheduled").length;
  const toReview = state.sends.filter((s) => s.status === "pending-review").length;
  const missing = customersNeedingDetails(state.customers).length;
  const giftsToApprove = state.sends.filter((s) => s.gift && (s.gift.status === "pending-approval" || s.gift.status === "held-budget")).length;
  const nextWeek = upcoming.filter((u) => u.days <= 7);
  const nextWeekToReview = nextWeek.filter((u) => u.send?.status === "pending-review");
  return { upcoming, ready, toReview, missing, giftsToApprove, nextWeek, nextWeekToReview };
}

export function segmentMatches(rule: AutomationRule, c: Customer) {
  if (rule.segment.type === "all") return true;
  const tag = rule.segment.tag;
  return c.tags.some((t) => t.toLowerCase() === tag.toLowerCase());
}

/** Which rule applies to a customer: the most specific active tag rule wins, otherwise the "all" rule. */
export function ruleForCustomer(rules: AutomationRule[], c: Customer) {
  const tagRule = rules.find((r) => r.active && r.segment.type === "tag" && segmentMatches(r, c));
  return tagRule ?? rules.find((r) => r.active && r.segment.type === "all") ?? null;
}

export function allTags(customers: Customer[]) {
  return [...new Set(customers.flatMap((c) => c.tags))].sort();
}

export const numberWord = (n: number) =>
  ["No", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve"][n] ?? String(n);
