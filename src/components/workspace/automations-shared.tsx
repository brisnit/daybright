"use client";

import Link from "next/link";
import { useRef } from "react";
import { clsx } from "clsx";
import { ArrowUpRight, Lock } from "lucide-react";
import type { AutomationRule, CardDesign } from "@/lib/types";
import { getCard } from "@/lib/cards";
import { GIFT_MAP } from "@/data/gifts";
import { money } from "@/config/brand";
import { fmtTime, tzLabel } from "@/lib/dates";
import { renderTemplate, TOKENS } from "@/lib/ai/messages";
import { inputClass } from "@/components/ui/field";

/** Plain-language sentences describing a rule. Updates live as the rule is edited. */
export function ruleSummary(rule: AutomationRule, savedCards: CardDesign[] = []): string[] {
  const who = rule.segment.type === "all" ? "every customer" : `customers tagged “${rule.segment.tag || "…"}”`;
  const when =
    rule.timezone === "recipient"
      ? `at ${fmtTime(rule.sendTime)} in each recipient's local time`
      : `at ${fmtTime(rule.sendTime)} ${tzLabel(rule.timezone).replace(/\s*\(.*\)/, "")} time`;
  const card = getCard(rule.cardId, savedCards);
  const out = [`Send ${who} a birthday card ${when}, using “${card.name}”.`];

  if (rule.giftMode === "gift" && rule.giftId) {
    const gift = GIFT_MAP[rule.giftId];
    const amount = gift?.amounts ? `a ${money(rule.giftAmount)} ${gift.name.toLowerCase()}` : `a ${gift?.name.toLowerCase() ?? "gift"} (${money(rule.giftAmount)})`;
    const forWhom = rule.giftSegmentTag ? `for ${rule.giftSegmentTag} customers` : "for everyone in this rule";
    const conds = [rule.approval === "review" ? "approval" : null, rule.monthlyGiftBudget > 0 ? `the ${money(rule.monthlyGiftBudget)} monthly gift budget` : null].filter(Boolean);
    out.push(`Include ${amount} ${forWhom}${conds.length ? `, subject to ${conds.join(" and ")}` : ""}.`);
  } else {
    out.push("Card only, no gift.");
  }

  out.push(rule.approval === "review" ? "You review each card before it goes out." : "Cards go out automatically.");
  if (rule.aiPersonalize) out.push("Messages are personalized from each customer's notes and interests.");
  if (rule.avoidRepeat) out.push("Never repeats last year's card.");
  return out;
}

/** Message template editor: token insert chips + real rendered example. */
export function TemplateEditor({
  value,
  onChange,
  sample,
  label = "Message template",
  id = "template",
  rows = 4,
}: {
  value: string;
  onChange: (v: string) => void;
  sample: { firstName: string; companyName: string; senderName: string };
  label?: string;
  id?: string;
  rows?: number;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);
  const insert = (token: string) => {
    const el = ref.current;
    if (!el) return onChange(value + token);
    const start = el.selectionStart ?? value.length;
    const end = el.selectionEnd ?? value.length;
    const next = value.slice(0, start) + token + value.slice(end);
    onChange(next);
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(start + token.length, start + token.length);
    });
  };
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-[13px] font-semibold text-ink-2">
        {label}
      </label>
      <div className="flex flex-wrap items-center gap-1.5" aria-label="Insert a personalization token">
        <span className="text-[12px] text-ink-3">Insert:</span>
        {TOKENS.map((t) => (
          <button
            key={t.token}
            type="button"
            onClick={() => insert(t.token)}
            className="rounded-full bg-cobalt-soft px-2.5 py-1 text-[12px] font-semibold text-cobalt-deep transition hover:bg-[#d6defe]"
          >
            + {t.label}
          </button>
        ))}
      </div>
      <textarea id={id} ref={ref} rows={rows} value={value} onChange={(e) => onChange(e.target.value)} className={clsx(inputClass, "resize-y leading-relaxed")} />
      <div className="rounded-2xl bg-cream/70 p-3.5 ring-1 ring-line">
        <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-ink-3">Example for {sample.firstName}</p>
        <p className="mt-1 text-[14px] leading-relaxed text-ink">{renderTemplate(value, sample) || <span className="text-ink-3">Write a message above.</span>}</p>
      </div>
    </div>
  );
}

/** Gentle hint that a feature belongs to a higher plan. Never blocks exploring. */
export function UpgradeHint({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={clsx("flex flex-wrap items-center gap-x-3 gap-y-1 rounded-2xl bg-lilac-soft px-3.5 py-2.5 text-[13px] text-lilac-deep", className)}>
      <Lock className="size-3.5 shrink-0" aria-hidden />
      <span className="flex-1">{children}</span>
      <Link href="/app/billing" className="inline-flex items-center gap-0.5 font-semibold underline-offset-2 hover:underline">
        Compare plans <ArrowUpRight className="size-3.5" aria-hidden />
      </Link>
    </div>
  );
}

/** Small uppercase section label. */
export function Eyebrow({ children, className }: { children: React.ReactNode; className?: string }) {
  return <p className={clsx("text-[11px] font-bold uppercase tracking-[0.14em] text-ink-3", className)}>{children}</p>;
}

/** Simple progress meter. */
export function Meter({ value, max, tone = "cobalt", label }: { value: number; max: number; tone?: "cobalt" | "coral" | "mint" | "butter"; label: string }) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  const bar = { cobalt: "bg-cobalt", coral: "bg-coral", mint: "bg-mint-deep", butter: "bg-butter" }[tone];
  return (
    <div className="h-2.5 w-full overflow-hidden rounded-full bg-ink/8" role="meter" aria-valuemin={0} aria-valuemax={max} aria-valuenow={value} aria-label={label}>
      <div className={clsx("h-full rounded-full transition-[width] duration-500", bar)} style={{ width: `${pct}%` }} />
    </div>
  );
}
