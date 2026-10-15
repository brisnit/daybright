"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { clsx } from "clsx";
import { ExternalLink, RotateCw, Search } from "lucide-react";
import type { Send, SendStatus } from "@/lib/types";
import { useDemo } from "@/lib/store";
import { cardsSentThisMonth } from "@/lib/selectors";
import { getCard } from "@/lib/cards";
import { GIFT_MAP } from "@/data/gifts";
import { money } from "@/config/brand";
import { fmtDate, fmtDateTime, isThisMonth } from "@/lib/dates";
import { AppPage, PageHeader, Panel } from "@/components/app/app-shell";
import { GiftBadge, SimulatedNote, StatusBadge } from "@/components/ui/badges";
import { Button, buttonClass } from "@/components/ui/button";
import { Input, inputClass } from "@/components/ui/field";
import { Drawer } from "@/components/ui/overlay";
import { useToast } from "@/components/ui/toast";
import { CardFront, CardInside } from "@/components/cards/card-art";
import { Eyebrow } from "./automations-shared";

type Filter = "all" | SendStatus;
const FILTERS: { id: Filter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "scheduled", label: "Scheduled" },
  { id: "sent", label: "Sent" },
  { id: "opened", label: "Opened" },
  { id: "gift-claimed", label: "Gift claimed" },
  { id: "awaiting-address", label: "Awaiting address" },
  { id: "needs-attention", label: "Needs attention" },
  { id: "pending-review", label: "Needs review" },
  { id: "skipped", label: "Skipped" },
];

const OPENED = new Set<SendStatus>(["opened", "gift-claimed", "awaiting-address"]);

export function ActivityPage() {
  const sends = useDemo((s) => s.sends);
  const automations = useDemo((s) => s.automations);
  const savedCards = useDemo((s) => s.savedCards);
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const openId = params.get("id");
  const [filter, setFilter] = useState<Filter>("all");
  const [q, setQ] = useState("");

  const counts = useMemo(() => {
    const m: Record<string, number> = { all: sends.length };
    for (const s of sends) m[s.status] = (m[s.status] ?? 0) + 1;
    return m;
  }, [sends]);

  const rows = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return sends
      .filter((s) => filter === "all" || s.status === filter)
      .filter((s) => !needle || `${s.recipientName} ${s.recipientEmail} ${getCard(s.cardId, savedCards).name}`.toLowerCase().includes(needle))
      .sort((a, b) => b.scheduledFor.localeCompare(a.scheduledFor));
  }, [sends, filter, q, savedCards]);

  const thisMonth = sends.filter((s) => s.source !== "consumer" && isThisMonth(s.scheduledFor));
  const sent = cardsSentThisMonth(sends);
  const opened = thisMonth.filter((s) => OPENED.has(s.status)).length;
  const claimed = thisMonth.filter((s) => s.gift && (s.gift.status === "claimed" || s.gift.status === "shipped")).length;
  const rate = sent ? Math.round((opened / sent) * 100) : 0;

  const open = (id: string | null) => router.replace(id ? `${pathname}?id=${id}` : pathname, { scroll: false });
  const ruleName = (id: string | null) => automations.find((a) => a.id === id)?.name;

  return (
    <AppPage>
      <PageHeader
        eyebrow="Activity"
        title="Activity & reporting"
        description="Every card that's scheduled, sent, opened or needs a hand. Select one to see its full story."
      />
      <SimulatedNote className="mt-4">Demo records. Delivery, opens and claims are simulated, not real tracking.</SimulatedNote>

      <dl className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          { label: "Sent this month", value: sent, tone: "text-lilac-deep" },
          { label: "Opened", value: opened, tone: "text-mint-deep" },
          { label: "Gifts claimed", value: claimed, tone: "text-coral-deep" },
          { label: "Open rate", value: `${rate}%`, tone: "text-cobalt-deep" },
        ].map((s) => (
          <div key={s.label} className="rounded-3xl bg-white p-4 ring-1 ring-line sm:p-5">
            <dt className="text-[13px] font-semibold text-ink-3">{s.label}</dt>
            <dd className={clsx("mt-1 font-grotesk text-3xl font-bold tracking-tight", s.tone)}>{s.value}</dd>
          </div>
        ))}
      </dl>

      <Panel className="mt-6 !p-0">
        <div className="flex flex-col gap-3 border-b border-line p-4 sm:p-5">
          <div className="relative max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-3" aria-hidden />
            <input
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search recipient, email or card"
              aria-label="Search activity"
              className={clsx(inputClass, "pl-9")}
            />
          </div>
          <div className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1" role="tablist" aria-label="Filter by status">
            {FILTERS.map((f) => (
              <button
                key={f.id}
                type="button"
                role="tab"
                aria-selected={filter === f.id}
                onClick={() => setFilter(f.id)}
                className={clsx(
                  "inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-[13px] font-semibold ring-1 ring-inset transition",
                  filter === f.id ? "bg-ink text-paper ring-ink" : "bg-white text-ink-2 ring-line-2 hover:ring-ink/40",
                )}
              >
                {f.label}
                <span className={clsx("rounded-full px-1.5 text-[11px]", filter === f.id ? "bg-paper/20" : "bg-ink/5")}>{counts[f.id] ?? 0}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="hidden grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_120px] gap-4 border-b border-line bg-cream/50 px-5 py-2.5 text-[11px] font-bold uppercase tracking-[0.12em] text-ink-3 md:grid">
          <span>Recipient</span>
          <span>Card</span>
          <span>Gift</span>
          <span>Date</span>
          <span>Status</span>
        </div>
        {rows.length === 0 ? (
          <p className="p-8 text-center text-sm text-ink-3">No sends match. Try another filter or search.</p>
        ) : (
          <ul className="divide-y divide-line">
            {rows.map((s) => {
              const card = getCard(s.cardId, savedCards);
              const g = s.gift ? GIFT_MAP[s.gift.giftId] : null;
              return (
                <li key={s.id}>
                  <button
                    type="button"
                    onClick={() => open(s.id)}
                    className={clsx(
                      "grid w-full grid-cols-[40px_1fr_auto] items-center gap-x-3 gap-y-1 px-4 py-3 text-left transition hover:bg-cream/50 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_120px] md:gap-4 md:px-5",
                      openId === s.id && "bg-cobalt-soft/50",
                    )}
                  >
                    <div className="w-10 md:hidden">
                      <CardFront card={card} shadow={false} className="ring-1 ring-line" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-semibold">{s.recipientName}</p>
                      <p className="truncate text-[12px] text-ink-3">
                        <span className="md:hidden">{fmtDate(s.scheduledFor)} · </span>
                        {s.source === "consumer" ? "One-time send" : ruleName(s.automationId) ?? "Manual send"}
                      </p>
                    </div>
                    <div className="md:hidden">
                      <StatusBadge status={s.status} />
                    </div>
                    <div className="hidden min-w-0 items-center gap-2.5 md:flex">
                      <div className="w-7 shrink-0">
                        <CardFront card={card} shadow={false} className="ring-1 ring-line" />
                      </div>
                      <span className="truncate text-[13px] text-ink-2">{card.name.replace(" (original)", "")}</span>
                    </div>
                    <div className="hidden min-w-0 text-[13px] text-ink-2 md:block">
                      {s.gift && g ? (
                        <span className="flex flex-col items-start gap-1">
                          <span className="truncate">
                            {g.name} · {money(s.gift.amount)}
                          </span>
                        </span>
                      ) : (
                        <span className="text-ink-3">Card only</span>
                      )}
                    </div>
                    <div className="hidden text-[13px] text-ink-2 md:block">{fmtDateTime(s.scheduledFor)}</div>
                    <div className="hidden md:block">
                      <StatusBadge status={s.status} />
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </Panel>

      <SendDrawer id={openId} onClose={() => open(null)} />
    </AppPage>
  );
}

function SendDrawer({ id, onClose }: { id: string | null; onClose: () => void }) {
  const send = useDemo((s) => (id ? s.sends.find((x) => x.id === id) : undefined));
  return (
    <Drawer
      open={!!send}
      onClose={onClose}
      title={send?.recipientName ?? ""}
      description={send ? `${send.recipientEmail || "No email on file"}` : undefined}
      width="max-w-2xl"
    >
      {send && <SendDetail key={send.id} send={send} />}
    </Drawer>
  );
}

function SendDetail({ send }: { send: Send }) {
  const savedCards = useDemo((s) => s.savedCards);
  const automations = useDemo((s) => s.automations);
  const updateSend = useDemo((s) => s.updateSend);
  const updateCustomer = useDemo((s) => s.updateCustomer);
  const resend = useDemo((s) => s.resend);
  const toast = useToast();
  const card = getCard(send.cardId, savedCards);
  const brand = { name: send.fromLabel, color: send.brandColor ?? "#2446D8", logo: send.logoDataUrl };
  const g = send.gift ? GIFT_MAP[send.gift.giftId] : null;
  const rule = automations.find((a) => a.id === send.automationId);
  const suggested = send.recipientEmail.replace(/@exmaple\./i, "@example.").replace(/@gmial\./i, "@gmail.");
  const [email, setEmail] = useState(suggested);
  const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const delivered = ["sent", "opened", "gift-claimed", "awaiting-address"].includes(send.status);

  const fixAndResend = () => {
    if (!validEmail) return;
    updateSend(send.id, { recipientEmail: email }, `Email corrected to ${email}`);
    if (send.customerId) updateCustomer(send.customerId, { email });
    resend(send.id);
    toast({ title: "Email fixed and card resent", body: "Simulated resend. The customer record was updated too.", tone: "success" });
  };
  const simulateResend = () => {
    resend(send.id);
    toast({ title: "Card resent", body: "Simulated resend. Nothing was delivered.", tone: "success" });
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center gap-2">
        <StatusBadge status={send.status} />
        {send.gift && <GiftBadge status={send.gift.status} />}
      </div>

      {send.status === "needs-attention" && (
        <div className="rounded-2xl bg-coral-soft p-4 ring-1 ring-coral/30">
          <p className="font-semibold text-coral-deep">What went wrong</p>
          <p className="mt-1 text-[14px] text-ink-2">{send.issue ?? "This card couldn't be delivered."}</p>
          <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-end">
            <Input
              label="Recipient email"
              wrapClassName="flex-1"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={email && !validEmail ? "Enter a valid email address." : null}
              hint={suggested !== send.recipientEmail ? `Suggested fix from “${send.recipientEmail}”.` : undefined}
            />
            <Button variant="ink" onClick={fixAndResend} disabled={!validEmail} icon={<RotateCw className="size-4" />} className="sm:mb-[22px]">
              Save & resend (simulated)
            </Button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        <CardFront card={card} headline={send.headline} brandMark={brand} live />
        <CardInside message={send.message} font={send.messageFont} brand={brand} />
      </div>

      <dl className="grid gap-x-6 gap-y-3 rounded-2xl bg-white p-4 text-[14px] ring-1 ring-line sm:grid-cols-2">
        <Detail label="Recipient">
          {send.customerId ? (
            <Link href={`/app/customers?id=${send.customerId}`} className="font-semibold text-cobalt underline-offset-2 hover:underline">
              {send.recipientName}
            </Link>
          ) : (
            send.recipientName
          )}
          <span className="block text-[13px] text-ink-3">{send.recipientEmail || "No email"}</span>
        </Detail>
        <Detail label={delivered ? "Sent" : "Scheduled for"}>{fmtDate(send.scheduledFor, { weekday: "short", month: "short", day: "numeric", year: "numeric" })}, {new Date(send.scheduledFor).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}</Detail>
        <Detail label="Card">{card.name}</Detail>
        <Detail label="Source">{send.source === "consumer" ? "One-time send" : rule ? `Rule: ${rule.name}` : "Manual send"}</Detail>
        <Detail label="Gift">
          {send.gift && g ? (
            <>
              {g.name} · {money(send.gift.amount)}
              {send.gift.shipping > 0 && <span className="text-ink-3"> + {money(send.gift.shipping, { cents: true })} shipping</span>}
              {send.gift.note && <span className="mt-1 block text-[13px] text-ink-3">{send.gift.note}</span>}
              {(send.gift.status === "pending-approval" || send.gift.status === "held-budget") && (
                <Link href="/app/gifts?tab=approvals" className="mt-1 block text-[13px] font-semibold text-cobalt underline-offset-2 hover:underline">
                  Decide in Gift approvals
                </Link>
              )}
            </>
          ) : (
            "Card only"
          )}
        </Detail>
        <Detail label="From">{send.senderName} · {send.fromLabel}</Detail>
      </dl>

      <div>
        <Eyebrow>Timeline</Eyebrow>
        <ol className="mt-3 flex flex-col gap-0">
          {send.events.map((e, i) => (
            <li key={i} className="relative flex gap-3 pb-4 last:pb-0">
              {i < send.events.length - 1 && <span className="absolute left-[5px] top-4 h-full w-px bg-line-2" aria-hidden />}
              <span className={clsx("mt-1.5 size-[11px] shrink-0 rounded-full ring-2 ring-paper", i === send.events.length - 1 ? "bg-cobalt" : "bg-ink/25")} />
              <div>
                <p className="text-[14px] font-medium">{e.label}</p>
                <p className="text-[12px] text-ink-3">{fmtDateTime(e.at)}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>

      <div className="flex flex-wrap gap-2 border-t border-line pt-5">
        <a href={`/open?id=${send.id}`} target="_blank" rel="noreferrer" className={buttonClass({ variant: "primary" })}>
          Open recipient preview <ExternalLink className="size-4" aria-hidden />
        </a>
        {delivered && (
          <Button variant="outline" icon={<RotateCw className="size-4" />} onClick={simulateResend}>
            Simulate resend
          </Button>
        )}
        {(send.status === "pending-review" || send.status === "scheduled") && (
          <Link href="/app/automations" className={buttonClass({ variant: "outline" })}>
            Manage in Automations
          </Link>
        )}
      </div>
      <SimulatedNote>Demo record. Recipient preview and resends are simulated.</SimulatedNote>
    </div>
  );
}

function Detail({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="min-w-0">
      <dt className="text-[11px] font-bold uppercase tracking-[0.12em] text-ink-3">{label}</dt>
      <dd className="mt-0.5 text-ink">{children}</dd>
    </div>
  );
}
