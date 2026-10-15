"use client";

import Link from "next/link";
import { clsx } from "clsx";
import { motion } from "framer-motion";
import {
  ArrowRight,
  CalendarCheck2,
  CalendarHeart,
  CheckCircle2,
  Gift,
  Leaf,
  Pause,
  Play,
  Sparkles,
  UserRoundPen,
  Workflow,
} from "lucide-react";
import { useDemo } from "@/lib/store";
import { giftSpendThisMonth, numberWord, plannerSummary, usage, type Upcoming } from "@/lib/selectors";
import { fmtDate, fmtDateTime, relDays } from "@/lib/dates";
import { getCard } from "@/lib/cards";
import { money } from "@/config/brand";
import { AppPage, Panel } from "@/components/app/app-shell";
import { Badge, GiftBadge, StatusBadge } from "@/components/ui/badges";
import { ButtonLink } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { CardFront, initials } from "@/components/cards/card-art";
import { customerIssues } from "@/lib/selectors";
import { lowerFirst, plural, ruleSummary } from "./dashboard-utils";
import { hash } from "@/lib/ai/simulate";

const AVATAR_TONES = ["bg-cobalt-soft text-cobalt-deep", "bg-coral-soft text-coral-deep", "bg-mint-soft text-mint-deep", "bg-lilac-soft text-lilac-deep", "bg-butter-soft text-butter-deep"];

export function Avatar({ name, id, className }: { name: string; id: string; className?: string }) {
  return (
    <span className={clsx("grid size-10 shrink-0 place-items-center rounded-full text-[13px] font-bold", AVATAR_TONES[hash(id) % AVATAR_TONES.length], className)} aria-hidden>
      {initials(name) || "?"}
    </span>
  );
}

const word = (n: number) => lowerFirst(numberWord(n));
const Word = (n: number) => numberWord(n);

export const SEASONAL_PROMPT = "An autumn birthday card collection in our brand colors: warm, cozy and a little playful, with falling leaves and harvest tones.";

export function DashboardOverview() {
  const state = useDemo();
  const { business, sends, automations, savedCards } = state;
  const p = plannerSummary(state);
  const u = usage(state);
  const main = automations.find((a) => a.id === "auto-main") ?? automations[0];
  const giftSpend = giftSpendThisMonth(sends);
  const budget = main?.monthlyGiftBudget ?? 0;
  const scheduledCount = sends.filter((s) => s.status === "scheduled" && s.source !== "consumer").length;

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const firstName = business.senderName.split(" ")[0];

  return (
    <AppPage>
      <div className="flex flex-col gap-1">
        <p className="text-[12px] font-bold uppercase tracking-[0.14em] text-ink-3">{business.name}</p>
        <h1 className="font-display text-[30px] font-semibold leading-tight tracking-tight sm:text-[40px]">
          {greeting}, {firstName}.
        </h1>
        <p className="text-[15px] text-ink-2">
          Here&apos;s who&apos;s celebrating soon and what needs you today, {fmtDate(new Date(), { weekday: "long", month: "long", day: "numeric" })}.
        </p>
      </div>

      <NextAction nextWeekToReview={p.nextWeekToReview} toReview={p.toReview} nextWeekCount={p.nextWeek.length} />

      {/* Stats */}
      <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-5">
        <Stat label="Birthdays coming up" value={p.upcoming.length} note="Next 30 days" href="#upcoming" />
        <Stat label="Cards scheduled" value={scheduledCount} note={`${p.toReview} waiting for review`} href="/app/activity" />
        <Stat label="Cards sent this month" value={u.sent} note={`${u.plan.name} plan`} href="/app/activity" />
        <Stat
          label="Remaining allowance"
          value={u.remaining}
          note={`${u.sent} of ${u.plan.monthlySends} cards used`}
          bar={{ pct: u.pct, tone: u.pct > 85 ? "bg-coral" : "bg-cobalt" }}
          href="/app/billing"
        />
        <Stat
          label="Gift spend this month"
          value={money(giftSpend)}
          note={budget ? `of ${money(budget)} monthly budget` : "No gift budget set"}
          bar={budget ? { pct: Math.min(100, (giftSpend / budget) * 100), tone: giftSpend >= budget ? "bg-coral" : "bg-mint-deep" } : undefined}
          href="/app/gifts"
          className="col-span-2 lg:col-span-1"
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="flex min-w-0 flex-col gap-6">
          <CelebrationPlanner p={p} />
          <UpcomingList upcoming={p.upcoming} savedCards={savedCards} />
        </div>
        <div className="flex min-w-0 flex-col gap-6">
          <AutomationStatus />
          <RecentActivity />
        </div>
      </div>
    </AppPage>
  );
}

function NextAction({ nextWeekToReview, toReview, nextWeekCount }: { nextWeekToReview: Upcoming[]; toReview: number; nextWeekCount: number }) {
  const n = nextWeekToReview.length;
  let title: string;
  let body: string;
  let tone: "butter" | "mint";
  if (n > 0) {
    tone = "butter";
    title = `${Word(n)} ${plural(n, "customer has a birthday", "customers have birthdays")} next week. Review ${plural(n, "their card", "their cards")}.`;
    body = nextWeekToReview
      .map((u) => `${u.customer.firstName} (${relDays(u.days).toLowerCase()})`)
      .join(", ");
  } else if (toReview > 0) {
    tone = "butter";
    title = `All set for next week. ${Word(toReview)} later ${plural(toReview, "card is", "cards are")} ready for a look.`;
    body = "Reviewing early means nothing waits on you closer to the day.";
  } else {
    tone = "mint";
    title = "All set for next week.";
    body =
      nextWeekCount > 0
        ? `${Word(nextWeekCount)} ${plural(nextWeekCount, "birthday is", "birthdays are")} coming up and every card is approved and scheduled.`
        : "Every card is approved and scheduled. We'll let you know when the next ones are ready to review.";
  }
  const show = n > 0 || toReview > 0;
  return (
    <motion.div
      key={title}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={clsx(
        "mt-6 flex flex-col gap-4 rounded-3xl p-5 ring-1 ring-inset sm:flex-row sm:items-center sm:p-6",
        tone === "butter" ? "bg-butter-soft ring-butter/60" : "bg-mint-soft ring-mint/60",
      )}
    >
      <span className={clsx("grid size-12 shrink-0 place-items-center rounded-2xl", tone === "butter" ? "bg-butter text-ink" : "bg-mint text-ink")}>
        {show ? <CalendarHeart className="size-6" aria-hidden /> : <CheckCircle2 className="size-6" aria-hidden />}
      </span>
      <div className="min-w-0 flex-1">
        <p className="font-display text-xl font-semibold leading-snug tracking-tight sm:text-2xl">{title}</p>
        <p className="mt-1 text-[14px] text-ink-2">{body}</p>
      </div>
      {show ? (
        <ButtonLink href="/app/review" variant="ink" iconRight={<ArrowRight className="size-4" />} className="self-start sm:self-center">
          Review cards
        </ButtonLink>
      ) : (
        <ButtonLink href="/app/activity" variant="outline" className="self-start sm:self-center">
          See scheduled cards
        </ButtonLink>
      )}
    </motion.div>
  );
}

function Stat({
  label,
  value,
  note,
  bar,
  href,
  className,
}: {
  label: string;
  value: React.ReactNode;
  note: string;
  bar?: { pct: number; tone: string };
  href: string;
  className?: string;
}) {
  return (
    <Link href={href} className={clsx("group flex flex-col rounded-3xl bg-white p-4 ring-1 ring-line transition hover:ring-ink/25 sm:p-5", className)}>
      <span className="text-[12px] font-semibold uppercase tracking-wide text-ink-3">{label}</span>
      <span className="mt-2 font-grotesk text-[30px] font-bold leading-none tracking-tight tabular-nums">{value}</span>
      {bar && (
        <span className="mt-3 block h-1.5 overflow-hidden rounded-full bg-ink/8" aria-hidden>
          <motion.span className={clsx("block h-full rounded-full", bar.tone)} initial={{ width: 0 }} animate={{ width: `${Math.max(2, bar.pct)}%` }} transition={{ duration: 0.6 }} />
        </span>
      )}
      <span className="mt-auto pt-2 text-[12.5px] text-ink-3">{note}</span>
    </Link>
  );
}

function CelebrationPlanner({ p }: { p: ReturnType<typeof plannerSummary> }) {
  const n = p.upcoming.length;
  const parts: string[] = [];
  parts.push(`${Word(p.ready)} ${plural(p.ready, "card is", "cards are")} ready`);
  if (p.toReview) parts.push(`${word(p.toReview)} ${plural(p.toReview, "is", "are")} waiting for your review`);
  parts.push(`${word(p.missing)} ${plural(p.missing, "customer needs", "customers need")} birthday or contact details`);
  parts.push(`${word(p.giftsToApprove)} gift ${plural(p.giftsToApprove, "suggestion needs", "suggestions need")} approval`);
  const sentence = parts.length > 1 ? `${parts.slice(0, -1).join(", ")}, and ${parts[parts.length - 1]}.` : `${parts[0]}.`;

  const actions = [
    { href: "/app/review", label: "Review ready cards", count: p.toReview, detail: p.toReview ? `${p.toReview} to review` : "Nothing waiting", icon: CalendarCheck2, tone: "bg-cobalt-soft text-cobalt-deep" },
    { href: "/app/customers?filter=issues", label: "Complete missing details", count: p.missing, detail: p.missing ? `${p.missing} ${plural(p.missing, "customer")}` : "All complete", icon: UserRoundPen, tone: "bg-coral-soft text-coral-deep" },
    { href: "/app/gifts?tab=approvals", label: "Review gift suggestions", count: p.giftsToApprove, detail: p.giftsToApprove ? `${p.giftsToApprove} awaiting approval` : "None pending", icon: Gift, tone: "bg-mint-soft text-mint-deep" },
    { href: `/app/studio?prompt=${encodeURIComponent(SEASONAL_PROMPT)}`, label: "Create a seasonal card collection", count: null, detail: "Autumn designs in your brand colors", icon: Leaf, tone: "bg-butter-soft text-butter-deep" },
  ];

  return (
    <Panel className="relative overflow-hidden">
      <div className="flex items-center justify-between gap-3">
        <p className="flex items-center gap-2 text-[12px] font-bold uppercase tracking-[0.14em] text-lilac-deep">
          <Sparkles className="size-4" aria-hidden /> Celebration Planner
        </p>
        <span className="text-[12px] text-ink-3">Next 30 days</span>
      </div>
      <p className="mt-3 max-w-2xl font-display text-[22px] font-medium leading-snug tracking-tight text-ink sm:text-[26px]">
        You have <span className="rounded-md bg-butter-soft px-1">{n} {plural(n, "birthday")}</span> coming up. {sentence}
      </p>
      <div className="mt-5 grid gap-2 sm:grid-cols-2">
        {actions.map((a) => (
          <Link
            key={a.label}
            href={a.href}
            className="group flex items-center gap-3 rounded-2xl bg-paper p-3 ring-1 ring-inset ring-line transition hover:bg-white hover:ring-ink/25"
          >
            <span className={clsx("grid size-10 shrink-0 place-items-center rounded-xl", a.tone)}>
              <a.icon className="size-5" aria-hidden />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[14px] font-semibold">{a.label}</span>
              <span className="block text-[12.5px] text-ink-3">{a.detail}</span>
            </span>
            <ArrowRight className="size-4 shrink-0 text-ink-3 transition group-hover:translate-x-0.5 group-hover:text-ink" aria-hidden />
          </Link>
        ))}
      </div>
    </Panel>
  );
}

function UpcomingList({ upcoming, savedCards }: { upcoming: Upcoming[]; savedCards: ReturnType<typeof useDemo.getState>["savedCards"] }) {
  return (
    <Panel className="!p-0" as="section">
      <div id="upcoming" className="flex scroll-mt-20 items-center justify-between gap-3 px-5 pt-5 sm:px-6 sm:pt-6">
        <div>
          <h2 className="font-display text-xl font-semibold tracking-tight">Upcoming birthdays</h2>
          <p className="text-[13px] text-ink-3">Next 30 days</p>
        </div>
        <ButtonLink href="/app/customers" variant="ghost" size="sm" iconRight={<ArrowRight className="size-3.5" />}>
          All customers
        </ButtonLink>
      </div>
      {upcoming.length === 0 ? (
        <p className="px-6 py-10 text-center text-ink-3">No birthdays in the next 30 days.</p>
      ) : (
        <ul className="mt-3 divide-y divide-line">
          {upcoming.map((u) => (
            <UpcomingRow key={u.customer.id} u={u} savedCards={savedCards} />
          ))}
        </ul>
      )}
    </Panel>
  );
}

function UpcomingRow({ u, savedCards }: { u: Upcoming; savedCards: ReturnType<typeof useDemo.getState>["savedCards"] }) {
  const { customer: c, send } = u;
  const name = `${c.firstName} ${c.lastName}`;
  const issues = customerIssues(c);
  const card = send ? getCard(send.cardId, savedCards) : null;
  return (
    <li className="flex items-center gap-3 px-5 py-3 sm:px-6">
      <Avatar name={name} id={c.id} className="hidden sm:grid" />
      <div className="w-12 shrink-0 text-center sm:w-14">
        <p className="text-[11px] font-bold uppercase tracking-wide text-ink-3">{fmtDate(u.date, { month: "short" })}</p>
        <p className="font-grotesk text-[22px] font-bold leading-none">{u.date.getDate()}</p>
      </div>
      <div className="min-w-0 flex-1">
        <Link href={`/app/customers?id=${c.id}`} className="block truncate text-[15px] font-semibold hover:underline">
          {name}
        </Link>
        <div className="mt-1 flex flex-wrap items-center gap-1.5">
          <span className="text-[12.5px] text-ink-3">{relDays(u.days)}</span>
          {send ? <StatusBadge status={send.status} /> : issues.length ? <Badge tone="coral">{issues[0]}</Badge> : <Badge>Card prepared {fmtDate(new Date(u.date.getTime() - 7 * 86_400_000))}</Badge>}
          {send?.gift && <GiftBadge status={send.gift.status} />}
        </div>
      </div>
      {card && (
        <div className="hidden w-9 shrink-0 sm:block" title={card.name}>
          <CardFront card={card} headline={send?.headline} shadow={false} className="ring-1 ring-line" />
        </div>
      )}
      <div className="shrink-0">
        {send?.status === "pending-review" ? (
          <ButtonLink href={`/app/review#${send.id}`} size="sm" variant="primary">
            Review
          </ButtonLink>
        ) : issues.length ? (
          <ButtonLink href={`/app/customers?id=${c.id}&edit=1`} size="sm" variant="outline">
            Fix
          </ButtonLink>
        ) : send ? (
          <ButtonLink href={`/app/activity?id=${send.id}`} size="sm" variant="outline">
            View
          </ButtonLink>
        ) : (
          <ButtonLink href={`/app/customers?id=${c.id}`} size="sm" variant="outline">
            Profile
          </ButtonLink>
        )}
      </div>
    </li>
  );
}

function RecentActivity() {
  const sends = useDemo((s) => s.sends);
  const events = sends
    .filter((s) => s.source !== "consumer")
    .flatMap((s) => s.events.map((e) => ({ ...e, send: s })))
    .sort((a, b) => b.at.localeCompare(a.at))
    .slice(0, 7);
  return (
    <Panel>
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-display text-xl font-semibold tracking-tight">Recent activity</h2>
        <ButtonLink href="/app/activity" variant="ghost" size="sm">
          View all
        </ButtonLink>
      </div>
      <ol className="mt-3 flex flex-col">
        {events.map((e, i) => (
          <li key={`${e.send.id}-${i}-${e.at}`}>
            <Link href={`/app/activity?id=${e.send.id}`} className="-mx-2 flex gap-3 rounded-xl px-2 py-2 transition hover:bg-paper">
              <span className={clsx("mt-1.5 size-2 shrink-0 rounded-full", dotTone(e.label))} aria-hidden />
              <span className="min-w-0">
                <span className="block text-[13.5px] leading-snug">
                  <span className="font-semibold">{e.send.recipientName}</span> <span className="text-ink-2">{lowerFirst(e.label)}</span>
                </span>
                <span className="block text-[12px] text-ink-3">{fmtDateTime(e.at)}</span>
              </span>
            </Link>
          </li>
        ))}
        {events.length === 0 && <li className="py-6 text-center text-[14px] text-ink-3">No activity yet.</li>}
      </ol>
    </Panel>
  );
}

function dotTone(label: string) {
  if (/problem|held|attention/i.test(label)) return "bg-coral";
  if (/opened|claimed|approved/i.test(label)) return "bg-mint-deep";
  if (/waiting|review/i.test(label)) return "bg-butter";
  return "bg-cobalt";
}

function AutomationStatus() {
  const automations = useDemo((s) => s.automations);
  const updateAutomation = useDemo((s) => s.updateAutomation);
  const toast = useToast();
  return (
    <Panel>
      <div className="flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 font-display text-xl font-semibold tracking-tight">
          <Workflow className="size-5 text-ink-3" aria-hidden /> Automations
        </h2>
        <ButtonLink href="/app/automations" variant="ghost" size="sm">
          Manage
        </ButtonLink>
      </div>
      <ul className="mt-3 flex flex-col gap-3">
        {automations.map((a) => (
          <li key={a.id} className={clsx("rounded-2xl p-3.5 ring-1 ring-inset", a.active ? "bg-paper ring-line" : "bg-ink/[0.03] ring-line")}>
            <div className="flex items-center justify-between gap-3">
              <Link href={`/app/automations?id=${a.id}`} className="min-w-0 truncate text-[14px] font-semibold hover:underline">
                {a.name}
              </Link>
              <div className="flex items-center gap-2">
                <Badge tone={a.active ? "mint" : "neutral"} dot>
                  {a.active ? "Active" : "Paused"}
                </Badge>
                <button
                  type="button"
                  onClick={() => {
                    const v = !a.active;
                    updateAutomation(a.id, { active: v });
                    toast({ title: v ? `${a.name} resumed` : `${a.name} paused`, body: v ? "Cards will be prepared again as birthdays come up." : "No new cards will be prepared until you resume.", tone: v ? "success" : "warn" });
                  }}
                  aria-label={a.active ? `Pause ${a.name}` : `Resume ${a.name}`}
                  className="grid size-7 place-items-center rounded-full bg-white text-ink-2 ring-1 ring-line transition hover:text-ink hover:ring-ink/30"
                >
                  {a.active ? <Pause className="size-3.5" aria-hidden /> : <Play className="size-3.5" aria-hidden />}
                </button>
              </div>
            </div>
            <p className="mt-1.5 text-[12.5px] leading-snug text-ink-3">{ruleSummary(a)}</p>
          </li>
        ))}
        {automations.length === 0 && (
          <li className="rounded-2xl bg-paper p-4 text-[14px] text-ink-3">
            No automations yet. <Link href="/app/automations" className="font-semibold text-cobalt">Create one</Link>
          </li>
        )}
      </ul>
    </Panel>
  );
}
