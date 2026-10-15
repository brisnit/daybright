"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { clsx } from "clsx";
import { useDemo } from "@/lib/store";
import { GIFTS, GIFT_CATEGORY_LABELS, GIFT_MAP } from "@/data/gifts";
import { PRICING_COPY, money } from "@/config/brand";
import { fmtDate, MONTHS, startOfToday } from "@/lib/dates";
import { AppPage, PageHeader, Panel } from "@/components/app/app-shell";
import { Badge, GiftBadge, SimulatedNote } from "@/components/ui/badges";
import { ButtonLink } from "@/components/ui/button";
import { Segmented } from "@/components/ui/controls";
import { GiftArt } from "@/components/gifts/gift-art";
import { Eyebrow } from "./automations-shared";
import { GiftBudgetMeter, GiftDecisionRow, useGiftBudget, useGiftSpendItems } from "./giftsws-budget";

type Tab = "approvals" | "catalog" | "spending";
const TABS: Tab[] = ["approvals", "catalog", "spending"];

export function GiftsWorkspacePage() {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const raw = params.get("tab");
  const tab: Tab = TABS.includes(raw as Tab) ? (raw as Tab) : "approvals";
  const setTab = (t: Tab) => router.replace(`${pathname}?tab=${t}`, { scroll: false });
  const { waiting } = useGiftBudget();
  const items = useGiftSpendItems();

  return (
    <AppPage>
      <PageHeader
        eyebrow="Gifts"
        title="Gifts"
        description="Optional extras that travel with a birthday card. You approve every gift, and they're billed separately from your plan."
        actions={
          <ButtonLink href="/app/automations" variant="outline">
            Gift rules
          </ButtonLink>
        }
      />
      <p className="mt-4 text-[14px] text-ink-2">{PRICING_COPY.includes}</p>

      <div className="mt-5 overflow-x-auto">
        <Segmented
          ariaLabel="Gift sections"
          value={tab}
          onChange={setTab}
          options={[
            { value: "approvals", label: `Approvals${waiting.length ? ` (${waiting.length})` : ""}` },
            { value: "catalog", label: "Catalog" },
            { value: "spending", label: "Spending" },
          ]}
        />
      </div>

      {tab === "approvals" && <Approvals />}
      {tab === "catalog" && <Catalog />}
      {tab === "spending" && <Spending items={items} />}
    </AppPage>
  );
}

function Approvals() {
  const sends = useDemo((s) => s.sends);
  const { waiting } = useGiftBudget();
  const today = startOfToday().toISOString();
  const decided = sends.filter((s) => s.gift && (s.gift.status === "approved" || s.gift.status === "declined") && s.scheduledFor >= today);
  const sorted = [...waiting].sort((a, b) => a.scheduledFor.localeCompare(b.scheduledFor));
  return (
    <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
      <div className="min-w-0">
        <h2 className="font-display text-2xl font-semibold tracking-tight">Waiting for you</h2>
        <p className="mb-4 mt-1 text-[13px] text-ink-3">Approving a gift checks it against the monthly budget. Held gifts show why. Either way, the card stays on schedule.</p>
        {sorted.length === 0 ? (
          <div className="rounded-3xl bg-white p-8 text-center ring-1 ring-line">
            <p className="font-display text-xl font-semibold">All caught up</p>
            <p className="mt-1 text-ink-2">No gifts need a decision right now.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {sorted.map((s) => (
              <GiftDecisionRow key={s.id} send={s} />
            ))}
          </div>
        )}
        {decided.length > 0 && (
          <div className="mt-8">
            <Eyebrow>Recently decided</Eyebrow>
            <ul className="mt-2 divide-y divide-line rounded-2xl bg-white ring-1 ring-line">
              {decided.map((s) => (
                <li key={s.id} className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 text-[14px]">
                  <Link href={`/app/activity?id=${s.id}`} className="font-semibold underline-offset-2 hover:underline">
                    {s.recipientName}
                  </Link>
                  <span className="flex items-center gap-2 text-ink-3">
                    {GIFT_MAP[s.gift!.giftId]?.name} · {fmtDate(s.scheduledFor)}
                    <GiftBadge status={s.gift!.status} />
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      <Panel className="lg:sticky lg:top-6 lg:self-start">
        <Eyebrow>Monthly gift budget</Eyebrow>
        <div className="mt-3">
          <GiftBudgetMeter />
        </div>
        <Link href="/app/automations" className="mt-3 inline-block text-[13px] font-semibold text-cobalt underline-offset-2 hover:underline">
          Change budget in Automations
        </Link>
      </Panel>
    </div>
  );
}

function Catalog() {
  return (
    <section className="mt-6">
      <SimulatedNote className="mb-4">Illustrative catalog. Merchants are fictional; prices and delivery times are examples.</SimulatedNote>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {GIFTS.map((g) => (
          <div key={g.id} className="flex flex-col rounded-3xl bg-white p-4 ring-1 ring-line">
            <GiftArt gift={g} amount={g.amounts?.[1]} />
            <div className="mt-3 flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h3 className="font-semibold">{g.name}</h3>
                <p className="text-[12px] text-ink-3">{g.merchant}</p>
              </div>
              <Badge tone={g.kind === "digital" ? "cobalt" : "coral"}>{g.kind === "digital" ? "Digital" : "Physical"}</Badge>
            </div>
            <p className="mt-2 flex-1 text-[13px] text-ink-2">{g.description}</p>
            <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2 border-t border-line pt-3 text-[13px]">
              <div>
                <dt className="text-ink-3">{g.amounts ? "Amounts" : "Price"}</dt>
                <dd className="font-semibold">{g.amounts ? g.amounts.map((a) => money(a)).join(" · ") : money(g.price ?? 0)}</dd>
              </div>
              <div>
                <dt className="text-ink-3">Shipping</dt>
                <dd className="font-semibold">{g.shipping ? money(g.shipping, { cents: true }) : "None"}</dd>
              </div>
              <div>
                <dt className="text-ink-3">Delivery</dt>
                <dd className="font-semibold">{g.delivery}</dd>
              </div>
              <div>
                <dt className="text-ink-3">Address</dt>
                <dd className="font-semibold">{g.addressRequired ? "Required (recipient can add it)" : "Not needed"}</dd>
              </div>
            </dl>
            <p className="mt-3 text-[11px] font-bold uppercase tracking-[0.12em] text-ink-3">{GIFT_CATEGORY_LABELS[g.category]}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function Spending({ items }: { items: ReturnType<typeof useGiftSpendItems> }) {
  const total = items.reduce((n, s) => n + (s.gift ? s.gift.amount + s.gift.shipping : 0), 0);
  const month = MONTHS[new Date().getMonth()];
  return (
    <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
      <Panel className="min-w-0 !p-0">
        <div className="border-b border-line p-5">
          <Eyebrow>{month} gift spending</Eyebrow>
          <p className="mt-1 text-[13px] text-ink-3">Approved, claimed and shipping gifts this month. Billed separately from your subscription.</p>
        </div>
        {items.length === 0 ? (
          <p className="p-6 text-sm text-ink-3">No gift spending yet this month.</p>
        ) : (
          <ul className="divide-y divide-line">
            {items.map((s) => {
              const g = GIFT_MAP[s.gift!.giftId];
              return (
                <li key={s.id} className="grid grid-cols-[1fr_auto] items-center gap-x-4 gap-y-1 px-5 py-3.5 sm:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)_auto_auto]">
                  <div className="min-w-0">
                    <Link href={`/app/activity?id=${s.id}`} className="font-semibold underline-offset-2 hover:underline">
                      {s.recipientName}
                    </Link>
                    <p className="text-[12px] text-ink-3">{fmtDate(s.scheduledFor)}</p>
                  </div>
                  <p className="order-3 col-span-2 text-[13px] text-ink-2 sm:order-none sm:col-span-1">
                    {g?.name} · {money(s.gift!.amount)}
                    {s.gift!.shipping > 0 && ` + ${money(s.gift!.shipping, { cents: true })} shipping`}
                  </p>
                  <span className="hidden sm:block">
                    <GiftBadge status={s.gift!.status} />
                  </span>
                  <p className="text-right font-grotesk font-bold">{money(s.gift!.amount + s.gift!.shipping, { cents: true })}</p>
                </li>
              );
            })}
            <li className={clsx("flex items-center justify-between bg-cream/50 px-5 py-3.5 font-semibold")}>
              <span>Total this month</span>
              <span className="font-grotesk text-lg font-bold">{money(total, { cents: true })}</span>
            </li>
          </ul>
        )}
      </Panel>
      <Panel className="lg:self-start">
        <GiftBudgetMeter showExplanation={false} />
        <SimulatedNote className="mt-4">Demo amounts. No gifts are purchased or charged.</SimulatedNote>
      </Panel>
    </div>
  );
}
