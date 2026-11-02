"use client";

import Link from "next/link";
import { clsx } from "clsx";
import { ArrowRight, CalendarDays, Gift, LayoutGrid, Send, Users, Wand2, Zap } from "lucide-react";
import { money } from "@/config/brand";
import { getCard } from "@/lib/cards";
import { CardFront, initials } from "@/components/cards/card-art";
import { Badge } from "@/components/ui/badges";
import { BIZ, VOICE_EXAMPLES } from "./business-samples";

const ROWS = [
  { ...VOICE_EXAMPLES[0], when: "In 3 days", status: <Badge tone="butter">Gift needs approval</Badge> },
  { ...VOICE_EXAMPLES[1], when: "In 5 days", status: <Badge tone="cobalt" dot>Scheduled</Badge> },
  { ...VOICE_EXAMPLES[2], when: "In 6 days", status: <Badge tone="butter" dot>Needs review</Badge> },
];

const NAV = [
  { icon: LayoutGrid, label: "Overview", active: true },
  { icon: CalendarDays, label: "Review birthdays" },
  { icon: Users, label: "Customers" },
  { icon: Wand2, label: "Card Studio" },
  { icon: Gift, label: "Gifts" },
  { icon: Zap, label: "Automations" },
  { icon: Send, label: "Activity" },
];

/** A designed, static preview of the business workspace, built from real components and demo data. */
export function DashboardPreview({ className }: { className?: string }) {
  return (
    <div className={clsx("relative", className)}>
      <div className="overflow-hidden rounded-[1.75rem] bg-white shadow-lift ring-1 ring-line">
        {/* window chrome */}
        <div className="flex items-center gap-2 border-b border-line bg-paper px-4 py-3">
          <span className="size-2.5 rounded-full bg-coral" />
          <span className="size-2.5 rounded-full bg-butter" />
          <span className="size-2.5 rounded-full bg-mint" />
          <span className="ml-3 truncate rounded-full bg-white px-3 py-1 text-[11px] font-medium text-ink-3 ring-1 ring-line">
            Demo workspace · {BIZ.name}
          </span>
          <span className="ml-auto shrink-0 rounded-full bg-butter-soft px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-butter-deep">
            Demo
          </span>
        </div>
        <div className="grid sm:grid-cols-[150px_1fr]">
          <aside className="hidden border-r border-line bg-paper/60 p-3 sm:block" aria-hidden>
            <div className="flex items-center gap-2 px-1.5 py-1">
              <span className="grid size-7 place-items-center rounded-lg text-[11px] font-bold text-white" style={{ background: BIZ.brandColor }}>
                {initials(BIZ.name)}
              </span>
              <span className="truncate text-[12px] font-semibold text-ink">{BIZ.name}</span>
            </div>
            <ul className="mt-4 space-y-0.5">
              {NAV.map((n) => (
                <li
                  key={n.label}
                  className={clsx(
                    "flex items-center gap-2 rounded-lg px-2 py-1.5 text-[12px] font-medium",
                    n.active ? "bg-ink text-paper" : "text-ink-2",
                  )}
                >
                  <n.icon className="size-3.5" />
                  {n.label}
                </li>
              ))}
            </ul>
          </aside>
          <div className="min-w-0 p-4 sm:p-5">
            <p className="text-[12px] font-semibold text-ink-3">Good morning, {BIZ.senderName.split(" ")[0]}</p>
            <p className="font-display text-xl font-semibold leading-tight tracking-tight text-ink sm:text-2xl">
              Three customers have birthdays next week.
            </p>
            <div className="mt-2 inline-flex items-center gap-1 rounded-full bg-cobalt px-3 py-1 text-[12px] font-semibold text-white">
              Review their cards <ArrowRight className="size-3" aria-hidden />
            </div>

            <dl className="mt-4 grid grid-cols-2 gap-2 lg:grid-cols-4">
              {[
                { k: "Coming up", v: "18", sub: "next 30 days", tone: "bg-butter-soft" },
                { k: "Scheduled", v: "12", sub: "cards ready", tone: "bg-cobalt-soft" },
                { k: "Needs review", v: "3", sub: "cards to approve", tone: "bg-mint-soft" },
                { k: "Gift spend", v: money(45), sub: `of ${money(150)} budget`, tone: "bg-coral-soft" },
              ].map((s) => (
                <div key={s.k} className={clsx("rounded-xl px-3 py-2", s.tone)}>
                  <dt className="text-[11px] font-semibold text-ink-2">{s.k}</dt>
                  <dd className="font-grotesk text-xl font-bold leading-tight text-ink">{s.v}</dd>
                  <dd className="text-[10px] text-ink-3">{s.sub}</dd>
                </div>
              ))}
            </dl>

            <div className="mt-4 rounded-xl ring-1 ring-line">
              <p className="border-b border-line px-3 py-2 text-[12px] font-semibold text-ink">Birthdays coming up</p>
              <ul>
                {ROWS.map((r) => (
                  <li key={r.firstName} className="flex items-center gap-3 border-b border-line px-3 py-2 last:border-0">
                    <div className="w-7 shrink-0">
                      <CardFront card={getCard(r.cardId)} shadow={false} rounded="rounded-[3px]" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13px] font-semibold text-ink">{r.firstName}</p>
                      <p className="text-[11px] text-ink-3">{r.when}</p>
                    </div>
                    <span className="hidden sm:inline-flex">{r.status}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-3 flex items-start gap-2 rounded-xl bg-paper px-3 py-2.5 text-[12px] text-ink-2 ring-1 ring-line">
              <Zap className="mt-0.5 size-3.5 shrink-0 text-mint-deep" aria-hidden />
              <p>
                <span className="font-semibold text-ink">Birthday automation is on.</span> Send every customer a birthday card at 9:00 AM.
                Include a {money(15)} gift card for VIP customers, subject to approval and the monthly gift budget.
              </p>
            </div>
          </div>
        </div>
      </div>
      <Link
        href="/app"
        className="absolute inset-0 rounded-[1.75rem] focus-visible:outline-offset-4"
        aria-label="Open the business demo workspace"
      />
      <div className="pointer-events-none absolute -bottom-5 right-4 rotate-[-3deg] rounded-full bg-butter px-4 py-2 text-[13px] font-bold text-ink shadow-lift sm:right-8">
        Open the demo workspace →
      </div>
    </div>
  );
}
