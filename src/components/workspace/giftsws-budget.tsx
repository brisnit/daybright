"use client";

import Link from "next/link";
import { clsx } from "clsx";
import { useDemo } from "@/lib/store";
import { giftSpendThisMonth } from "@/lib/selectors";
import { GIFT_MAP } from "@/data/gifts";
import { money } from "@/config/brand";
import { fmtDate, isThisMonth } from "@/lib/dates";
import type { Send } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { GiftBadge } from "@/components/ui/badges";
import { useToast } from "@/components/ui/toast";
import { Meter } from "./automations-shared";

/** Live gift-budget numbers for this month. */
export function useGiftBudget() {
  const sends = useDemo((s) => s.sends);
  const automations = useDemo((s) => s.automations);
  const rule = automations.find((a) => a.giftMode === "gift" && a.monthlyGiftBudget > 0) ?? automations.find((a) => a.monthlyGiftBudget > 0) ?? null;
  const budget = rule?.monthlyGiftBudget ?? 0;
  const spent = giftSpendThisMonth(sends, true);
  const waiting = sends.filter((s) => s.gift && (s.gift.status === "pending-approval" || s.gift.status === "held-budget"));
  const waitingValue = waiting.reduce((n, s) => n + (s.gift ? s.gift.amount + s.gift.shipping : 0), 0);
  return { rule, budget, spent, remaining: Math.max(0, budget - spent), waiting, waitingValue };
}

/** Itemized gift spend this month (gift value + shipping). */
export function useGiftSpendItems() {
  const sends = useDemo((s) => s.sends);
  return sends
    .filter(
      (s) =>
        s.gift &&
        isThisMonth(s.scheduledFor) &&
        (s.gift.status === "claimed" || s.gift.status === "shipped" || s.gift.status === "awaiting-address" || s.gift.status === "approved"),
    )
    .sort((a, b) => a.scheduledFor.localeCompare(b.scheduledFor));
}

export function GiftBudgetMeter({ className, showExplanation = true }: { className?: string; showExplanation?: boolean }) {
  const { budget, spent, remaining, waiting, waitingValue, rule } = useGiftBudget();
  const over = budget > 0 && spent >= budget;
  const near = budget > 0 && spent / budget >= 0.75;
  return (
    <div className={className}>
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <p className="font-grotesk text-3xl font-bold tracking-tight">
            {money(spent, { cents: true })}
            <span className="text-base font-semibold text-ink-3"> of {budget > 0 ? money(budget) : "no budget set"}</span>
          </p>
          <p className="text-[13px] text-ink-3">Gift spend this month, including shipping{rule ? ` · budget from “${rule.name}”` : ""}</p>
        </div>
        {budget > 0 && (
          <p className={clsx("text-sm font-semibold", over ? "text-coral-deep" : "text-ink-2")}>{over ? "Budget reached" : `${money(remaining, { cents: true })} left`}</p>
        )}
      </div>
      <Meter value={spent} max={budget || 1} tone={over ? "coral" : near ? "butter" : "mint"} label="Monthly gift budget used" />
      {waiting.length > 0 && (
        <p className="mt-2 text-[13px] text-ink-2">
          {waiting.length} gift{waiting.length === 1 ? "" : "s"} waiting for your decision ({money(waitingValue, { cents: true })}). Approved gifts count toward the budget.
        </p>
      )}
      {showExplanation && (
        <p className="mt-3 rounded-2xl bg-cream/70 p-3 text-[13px] leading-relaxed text-ink-2 ring-1 ring-line">
          <strong className="text-ink">When the budget is reached,</strong> new gifts are held for your review and the card stays scheduled. Nothing extra is spent until you approve it.
        </p>
      )}
    </div>
  );
}

/** One gift decision row: approve (respecting the budget), approve anyway when held, or remove the gift. */
export function GiftDecisionRow({ send, compact }: { send: Send; compact?: boolean }) {
  const approveGift = useDemo((s) => s.approveGift);
  const declineGift = useDemo((s) => s.declineGift);
  const toast = useToast();
  if (!send.gift) return null;
  const gift = GIFT_MAP[send.gift.giftId];
  const held = send.gift.status === "held-budget";
  const decided = send.gift.status !== "pending-approval" && send.gift.status !== "held-budget";

  const approve = () => {
    const r = approveGift(send.id);
    if (r.ok) toast({ title: "Gift approved", body: `${gift?.name ?? "Gift"} for ${send.recipientName.split(" ")[0]} will go out with the card.`, tone: "success" });
    else toast({ title: "Gift held for review", body: r.reason, tone: "warn" });
  };
  const approveAnyway = () => {
    approveGift(send.id, { force: true });
    toast({ title: "Gift approved over budget", body: "It now counts toward this month's gift spending.", tone: "success" });
  };
  const remove = () => {
    declineGift(send.id);
    toast({ title: "Gift removed", body: `${send.recipientName.split(" ")[0]} will receive the card only.` });
  };

  return (
    <div className={clsx("rounded-2xl bg-white ring-1 ring-line", compact ? "p-3.5" : "p-4")}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-semibold text-ink">
            <Link href={`/app/activity?id=${send.id}`} className="underline-offset-2 hover:underline">
              {send.recipientName}
            </Link>
          </p>
          <p className="text-[13px] text-ink-3">
            {gift?.name ?? "Gift"} · {money(send.gift.amount)}
            {send.gift.shipping > 0 ? ` + ${money(send.gift.shipping, { cents: true })} shipping` : ""} · card {fmtDate(send.scheduledFor)}
          </p>
        </div>
        <GiftBadge status={send.gift.status} />
      </div>
      {send.gift.note && !decided && <p className="mt-2 text-[13px] leading-snug text-coral-deep">{send.gift.note}</p>}
      {!decided && (
        <div className="mt-3 flex flex-wrap gap-2">
          {held ? (
            <Button size="sm" variant="ink" onClick={approveAnyway}>
              Approve anyway
            </Button>
          ) : (
            <Button size="sm" variant="ink" onClick={approve}>
              Approve gift
            </Button>
          )}
          <Button size="sm" variant="outline" onClick={remove}>
            Remove gift
          </Button>
        </div>
      )}
      {decided && (
        <p className="mt-2 text-[13px] text-ink-3">{send.gift.status === "declined" ? "Gift removed. The card still goes out as scheduled." : "Decision saved. The card stays on schedule."}</p>
      )}
    </div>
  );
}
