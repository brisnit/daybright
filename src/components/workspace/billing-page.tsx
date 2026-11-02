"use client";

import Link from "next/link";
import { useState } from "react";
import { clsx } from "clsx";
import { Check, Sparkles } from "lucide-react";
import { PLANS, PRICING_COPY, getPlan, money, type Plan } from "@/config/brand";
import { useDemo } from "@/lib/store";
import { usage } from "@/lib/selectors";
import { GIFT_MAP } from "@/data/gifts";
import { fmtDate, MONTHS } from "@/lib/dates";
import { AppPage, PageHeader, Panel } from "@/components/app/app-shell";
import { Badge, SimulatedNote } from "@/components/ui/badges";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/overlay";
import { useToast } from "@/components/ui/toast";
import { Eyebrow, Meter } from "./automations-shared";
import { useGiftSpendItems } from "./giftsws-budget";

export function BillingPage() {
  const planId = useDemo((s) => s.planId);
  const sends = useDemo((s) => s.sends);
  const setPlan = useDemo((s) => s.setPlan);
  const toast = useToast();
  const u = usage({ sends, planId });
  const plan = u.plan;
  const [target, setTarget] = useState<Plan | null>(null);
  const giftItems = useGiftSpendItems();
  const giftTotal = giftItems.reduce((n, s) => n + (s.gift ? s.gift.amount + s.gift.shipping : 0), 0);
  const giftValue = giftItems.reduce((n, s) => n + (s.gift?.amount ?? 0), 0);
  const shipping = giftTotal - giftValue;

  const now = new Date();
  const monthName = MONTHS[now.getMonth()];
  const nextBill = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const invoices = [1, 2, 3].map((i) => new Date(now.getFullYear(), now.getMonth() - i + 1, 1));

  const confirm = () => {
    if (!target) return;
    const up = target.monthlyPrice > plan.monthlyPrice;
    setPlan(target.id);
    toast({ title: `Switched to ${target.name}`, body: `Demo only, no charge. ${up ? "New features are unlocked now." : "Your plan changes right away in this demo."}`, tone: "success" });
    setTarget(null);
  };

  return (
    <AppPage>
      <PageHeader eyebrow="Plan & billing" title="Plan & billing" description="In this preview, a plan covers digital card sends, and gifts would be billed separately when you approve them." />
      <SimulatedNote className="mt-4">Demo billing. No payment method is stored and nothing is charged.</SimulatedNote>

      <div className="mt-6 grid gap-4 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
        <Panel className="relative overflow-hidden">
          <Eyebrow>Current plan</Eyebrow>
          <div className="mt-2 flex flex-wrap items-end gap-x-3 gap-y-1">
            <h2 className="font-display text-4xl font-semibold tracking-tight">{plan.name}</h2>
            <p className="pb-1 text-ink-2">
              <span className="font-grotesk text-2xl font-bold text-ink">{money(plan.monthlyPrice)}</span>/month{" "}
              <span className="text-[12px] font-semibold uppercase tracking-wide text-butter-deep">Illustrative</span>
            </p>
          </div>
          <p className="mt-2 max-w-md text-[14px] text-ink-2">{plan.blurb}</p>
          <p className="mt-4 text-[13px] text-ink-3">Next bill {fmtDate(nextBill, { month: "long", day: "numeric" })} (demo). {PRICING_COPY.provisional}</p>
        </Panel>

        <Panel>
          <Eyebrow>{monthName} usage</Eyebrow>
          <p className="mt-2 font-grotesk text-3xl font-bold tracking-tight">
            {u.sent}
            <span className="text-base font-semibold text-ink-3"> of {plan.monthlySends.toLocaleString()} card sends</span>
          </p>
          <Meter value={u.sent} max={plan.monthlySends} label="Card sends used this month" tone={u.pct > 85 ? "coral" : "cobalt"} />
          <dl className="mt-4 grid grid-cols-3 gap-3 text-[13px]">
            <div>
              <dt className="text-ink-3">Sent</dt>
              <dd className="font-grotesk text-lg font-bold">{u.sent}</dd>
            </div>
            <div>
              <dt className="text-ink-3">Scheduled</dt>
              <dd className="font-grotesk text-lg font-bold">{u.scheduled}</dd>
            </div>
            <div>
              <dt className="text-ink-3">Remaining</dt>
              <dd className="font-grotesk text-lg font-bold">{u.remaining}</dd>
            </div>
          </dl>
        </Panel>
      </div>

      <p className="mt-5 rounded-2xl bg-cream/70 px-4 py-3 text-[14px] font-medium text-ink ring-1 ring-line">{PRICING_COPY.includes}</p>

      {/* Plan comparison */}
      <section className="mt-8">
        <Eyebrow>Compare plans</Eyebrow>
        <h2 className="font-display text-2xl font-semibold tracking-tight">Try a different preview plan</h2>
        <p className="mb-4 mt-1 text-[13px] text-ink-3">{PRICING_COPY.provisional}</p>
        <div className="grid gap-4 md:grid-cols-3">
          {PLANS.map((p) => {
            const current = p.id === plan.id;
            const up = p.monthlyPrice > plan.monthlyPrice;
            return (
              <div key={p.id} className={clsx("flex flex-col rounded-3xl bg-white p-5 ring-1", current ? "ring-2 ring-ink" : "ring-line")}>
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-display text-xl font-semibold">{p.name}</h3>
                  {current ? <Badge tone="ink">Current plan</Badge> : p.highlight ? <Badge tone="cobalt">Popular</Badge> : null}
                </div>
                <p className="mt-2">
                  <span className="font-grotesk text-3xl font-bold">{money(p.monthlyPrice)}</span>
                  <span className="text-ink-3">/month</span>
                </p>
                <p className="mt-1 text-[13px] text-ink-3">{p.blurb}</p>
                <ul className="mt-4 flex flex-1 flex-col gap-2 text-[13.5px] text-ink-2">
                  {p.features.map((f) => (
                    <li key={f} className="flex gap-2">
                      <Check className="mt-0.5 size-4 shrink-0 text-mint-deep" aria-hidden />
                      {f}
                    </li>
                  ))}
                </ul>
                <Button className="mt-5" variant={current ? "outline" : up ? "primary" : "outline"} disabled={current} onClick={() => setTarget(p)}>
                  {current ? "Your plan" : up ? `Upgrade to ${p.name}` : `Switch to ${p.name}`}
                </Button>
              </div>
            );
          })}
        </div>
      </section>

      {/* Subscription vs gifts */}
      <div className="mt-8 grid gap-4 lg:grid-cols-2">
        <Panel>
          <Eyebrow>Subscription</Eyebrow>
          <h2 className="font-display text-xl font-semibold tracking-tight">{monthName} subscription</h2>
          <dl className="mt-4 divide-y divide-line text-[14px]">
            <Row label={`${plan.name} plan`} value={money(plan.monthlyPrice)} />
            <Row label={`Card sends (${u.sent} of ${plan.monthlySends.toLocaleString()})`} value="Included" />
            <Row label="AI card creation and message help" value="Included" />
            <Row label="Subscription total" value={money(plan.monthlyPrice)} strong />
          </dl>
        </Panel>
        <Panel>
          <div className="flex items-start justify-between gap-3">
            <div>
              <Eyebrow>Gift spending</Eyebrow>
              <h2 className="font-display text-xl font-semibold tracking-tight">{monthName} gifts, billed separately</h2>
            </div>
            <Link href="/app/gifts?tab=spending" className="shrink-0 text-[13px] font-semibold text-cobalt underline-offset-2 hover:underline">
              Details
            </Link>
          </div>
          {giftItems.length === 0 ? (
            <p className="mt-4 text-sm text-ink-3">No gifts this month. Cards on their own cost nothing extra.</p>
          ) : (
            <dl className="mt-4 divide-y divide-line text-[14px]">
              {giftItems.map((s) => (
                <Row
                  key={s.id}
                  label={`${s.recipientName} · ${GIFT_MAP[s.gift!.giftId]?.name ?? "Gift"}`}
                  sub={s.gift!.shipping > 0 ? `${money(s.gift!.amount)} gift + ${money(s.gift!.shipping, { cents: true })} shipping` : `${money(s.gift!.amount)} gift, no shipping`}
                  value={money(s.gift!.amount + s.gift!.shipping, { cents: true })}
                />
              ))}
              <Row label="Gift value" value={money(giftValue, { cents: true })} />
              <Row label="Shipping" value={money(shipping, { cents: true })} />
              <Row label="Gift total" value={money(giftTotal, { cents: true })} strong />
            </dl>
          )}
        </Panel>
      </div>

      {/* AI note */}
      <Panel className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-start sm:gap-4">
        <span className="grid size-10 shrink-0 place-items-center rounded-full bg-lilac-soft text-lilac-deep">
          <Sparkles className="size-5" aria-hidden />
        </span>
        <div>
          <h2 className="font-semibold">AI card creation and message help</h2>
          <p className="mt-1 text-[14px] text-ink-2">{PRICING_COPY.aiNote}</p>
          <p className="mt-1 text-[13px] text-ink-3">{PRICING_COPY.aiAllowance}</p>
        </div>
      </Panel>

      {/* Invoices */}
      <Panel className="mt-8">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <Eyebrow>Invoice history</Eyebrow>
            <h2 className="font-display text-xl font-semibold tracking-tight">Past invoices</h2>
          </div>
          <Badge tone="butter">Demo invoices</Badge>
        </div>
        <ul className="mt-4 divide-y divide-line text-[14px]">
          {invoices.map((d, i) => (
            <li key={i} className="flex flex-wrap items-center justify-between gap-2 py-3">
              <div>
                <p className="font-semibold">{fmtDate(d, { month: "long", day: "numeric", year: "numeric" })}</p>
                <p className="text-[13px] text-ink-3">{plan.name} plan subscription · sample record</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-grotesk font-bold">{money(plan.monthlyPrice)}</span>
                <Badge tone="neutral">Demo, not charged</Badge>
              </div>
            </li>
          ))}
        </ul>
      </Panel>

      <Modal
        open={!!target}
        onClose={() => setTarget(null)}
        title={target ? `Switch to ${target.name}?` : ""}
        footer={
          <>
            <Button variant="outline" onClick={() => setTarget(null)}>
              Cancel
            </Button>
            <Button onClick={confirm}>Confirm switch</Button>
          </>
        }
      >
        {target && (
          <div className="flex flex-col gap-3 text-ink-2">
            <p>
              {getPlan(plan.id).name} ({money(plan.monthlyPrice)}/month) → <strong className="text-ink">{target.name}</strong> ({money(target.monthlyPrice)}/month), up to{" "}
              {target.monthlySends.toLocaleString()} card sends per month. Illustrative preview pricing; nothing is charged.
            </p>
            {target.monthlyPrice < plan.monthlyPrice && (
              <p className="text-[14px]">Features not in {target.name} stay visible to explore, with a note that they belong to a higher plan.</p>
            )}
            <SimulatedNote>Demo — no charge. No payment details are needed.</SimulatedNote>
          </div>
        )}
      </Modal>
    </AppPage>
  );
}

function Row({ label, value, sub, strong }: { label: string; value: string; sub?: string; strong?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-3 py-2.5">
      <dt className={clsx("min-w-0", strong ? "font-semibold text-ink" : "text-ink-2")}>
        {label}
        {sub && <span className="block text-[12px] text-ink-3">{sub}</span>}
      </dt>
      <dd className={clsx("shrink-0 font-grotesk", strong ? "font-bold text-ink" : "text-ink")}>{value}</dd>
    </div>
  );
}
