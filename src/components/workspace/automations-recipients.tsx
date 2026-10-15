"use client";

import Link from "next/link";
import { useState } from "react";
import { clsx } from "clsx";
import { Pencil, SkipForward, Undo2 } from "lucide-react";
import type { AutomationRule, Customer, Send } from "@/lib/types";
import { useDemo } from "@/lib/store";
import { customerIssues, ruleForCustomer } from "@/lib/selectors";
import { daysUntil, fmtDate, nextBirthday, relDays } from "@/lib/dates";
import { getCard } from "@/lib/cards";
import { GIFT_MAP } from "@/data/gifts";
import { money } from "@/config/brand";
import { renderTemplate } from "@/lib/ai/messages";
import { Badge, GiftBadge, StatusBadge } from "@/components/ui/badges";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/overlay";
import { Textarea } from "@/components/ui/field";
import { useToast } from "@/components/ui/toast";
import { CardFront, CardInside } from "@/components/cards/card-art";
import { CardPicker } from "./automations-card-picker";

const DAY = 86_400_000;

type Row = { customer: Customer; date: Date; days: number; send: Send | null; plannedGift: { giftId: string; amount: number } | null };

function plannedGiftFor(rule: AutomationRule, c: Customer) {
  if (rule.giftMode !== "gift" || !rule.giftId) return null;
  if (c.giftPreference === "card-only") return null;
  if (rule.giftSegmentTag && !c.tags.some((t) => t.toLowerCase() === rule.giftSegmentTag!.toLowerCase())) return null;
  return { giftId: rule.giftId, amount: rule.giftAmount };
}

export function useRecipients(rule: AutomationRule, withinDays = 30): Row[] {
  const customers = useDemo((s) => s.customers);
  const sends = useDemo((s) => s.sends);
  const automations = useDemo((s) => s.automations);
  // Treat this rule as active so a paused rule still previews who it would reach.
  const rules = automations.map((a) => (a.id === rule.id ? { ...a, active: true } : a));
  return customers
    .filter((c) => ruleForCustomer(rules, c)?.id === rule.id)
    .map((c) => {
      const date = nextBirthday(c, rule.feb29);
      const days = daysUntil(date) ?? Infinity;
      const send = date ? sends.find((s) => s.customerId === c.id && Math.abs(new Date(s.scheduledFor).getTime() - date.getTime()) < 3 * DAY) ?? null : null;
      return { customer: c, date: date as Date, days, send, plannedGift: plannedGiftFor(rule, c) };
    })
    .filter((r) => r.date && r.days >= 0 && r.days <= withinDays)
    .sort((a, b) => a.days - b.days);
}

export function NextRecipients({ rule }: { rule: AutomationRule }) {
  const rows = useRecipients(rule);
  const business = useDemo((s) => s.business);
  const savedCards = useDemo((s) => s.savedCards);
  const addSend = useDemo((s) => s.addSend);
  const skipSend = useDemo((s) => s.skipSend);
  const updateSend = useDemo((s) => s.updateSend);
  const toast = useToast();
  const [editing, setEditing] = useState<string | null>(null);

  const prepare = (r: Row, status: Send["status"]) => {
    const at = new Date(r.date);
    const [h, m] = rule.sendTime.split(":").map(Number);
    at.setHours(h || 9, m || 0, 0, 0);
    const pg = r.plannedGift;
    return addSend({
      source: "automation",
      customerId: r.customer.id,
      automationId: rule.id,
      recipientName: `${r.customer.firstName} ${r.customer.lastName}`.trim(),
      recipientEmail: r.customer.email,
      cardId: rule.cardId,
      message: renderTemplate(rule.messageTemplate, { firstName: r.customer.firstName, companyName: business.name, senderName: business.senderName }),
      messageFont: "classic",
      senderName: business.senderName,
      fromLabel: business.name,
      brandColor: business.brandColor,
      logoDataUrl: business.logoDataUrl,
      scheduledFor: at.toISOString(),
      status,
      approved: status === "scheduled",
      gift: pg ? { giftId: pg.giftId, amount: pg.amount, shipping: GIFT_MAP[pg.giftId]?.shipping ?? 0, status: "pending-approval" } : null,
      events: [{ at: new Date().toISOString(), label: status === "skipped" ? "Skipped this birthday" : `Prepared early from “${rule.name}”` }],
    });
  };

  const skip = (r: Row) => {
    if (r.send) skipSend(r.send.id);
    else prepare(r, "skipped");
    toast({ title: `Skipped ${r.customer.firstName}'s birthday`, body: "Nothing will be sent this year. You can undo this." });
  };
  const undo = (r: Row) => {
    if (!r.send) return;
    updateSend(r.send.id, { status: r.send.approved ? "scheduled" : "pending-review" }, "Skip undone");
    toast({ title: "Skip undone", body: `${r.customer.firstName}'s card is back on the schedule.`, tone: "success" });
  };
  const edit = (r: Row) => {
    const id = r.send ? r.send.id : prepare(r, rule.approval === "review" ? "pending-review" : "scheduled");
    setEditing(id);
  };

  if (!rows.length) {
    return <p className="rounded-2xl bg-cream/60 p-4 text-sm text-ink-2 ring-1 ring-line">No birthdays for this rule in the next 30 days.</p>;
  }

  return (
    <>
      <ul className="divide-y divide-line overflow-hidden rounded-2xl ring-1 ring-line">
        <li className="hidden grid-cols-[110px_minmax(0,1.3fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_190px] gap-4 bg-cream/60 px-4 py-2.5 text-[11px] font-bold uppercase tracking-[0.12em] text-ink-3 lg:grid">
          <span>Date</span>
          <span>Customer</span>
          <span>Card</span>
          <span>Gift</span>
          <span>Status</span>
          <span className="text-right">Actions</span>
        </li>
        {rows.map((r) => {
          const card = getCard(r.send?.cardId ?? rule.cardId, savedCards);
          const issues = customerIssues(r.customer);
          const skipped = r.send?.status === "skipped";
          const editable = !r.send || r.send.status === "pending-review" || r.send.status === "scheduled";
          const gift = r.send ? r.send.gift : r.plannedGift ? { ...r.plannedGift, status: "pending-approval" as const } : null;
          const g = gift ? GIFT_MAP[gift.giftId] : null;
          return (
            <li
              key={r.customer.id}
              className={clsx(
                "grid grid-cols-[1fr_auto] gap-x-4 gap-y-2 bg-white px-4 py-3.5 lg:grid-cols-[110px_minmax(0,1.3fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_190px] lg:items-center",
                skipped && "bg-ink/[0.02]",
              )}
            >
              <div className="col-span-2 flex items-baseline gap-2 lg:col-span-1 lg:block">
                <p className="font-grotesk text-[15px] font-bold">{fmtDate(r.date)}</p>
                <p className="text-[12px] text-ink-3">{relDays(r.days)}</p>
              </div>
              <div className="col-span-2 min-w-0 lg:col-span-1">
                <Link href={`/app/customers?id=${r.customer.id}`} className={clsx("font-semibold underline-offset-2 hover:underline", skipped && "text-ink-3 line-through")}>
                  {r.customer.firstName} {r.customer.lastName}
                </Link>
                <p className="truncate text-[12px] text-ink-3">{r.customer.tags.join(" · ") || "No tags"}</p>
              </div>
              <div className="flex min-w-0 items-center gap-2.5">
                <div className="w-8 shrink-0">
                  <CardFront card={card} shadow={false} className="ring-1 ring-line" />
                </div>
                <span className="truncate text-[13px] text-ink-2">{card.name.replace(" (original)", "")}</span>
              </div>
              <div className="min-w-0 text-[13px]">
                {gift && g ? (
                  <div className="flex flex-col items-start gap-1">
                    <span className="text-ink-2">
                      {g.name} · {money(gift.amount)}
                    </span>
                    {r.send ? <GiftBadge status={gift.status} /> : <Badge>Needs approval when prepared</Badge>}
                  </div>
                ) : (
                  <span className="text-ink-3">Card only</span>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                {r.send ? <StatusBadge status={r.send.status} /> : <Badge>Prepared a week before</Badge>}
                {issues.length > 0 && <Badge tone="coral">{issues[0]}</Badge>}
              </div>
              <div className="col-span-2 flex flex-wrap justify-start gap-1.5 lg:col-span-1 lg:justify-end">
                {skipped ? (
                  <Button size="sm" variant="outline" icon={<Undo2 className="size-3.5" />} onClick={() => undo(r)}>
                    Undo skip
                  </Button>
                ) : editable ? (
                  <>
                    <Button size="sm" variant="outline" icon={<Pencil className="size-3.5" />} onClick={() => edit(r)} aria-label={`Edit upcoming send for ${r.customer.firstName}`}>
                      Edit
                    </Button>
                    <Button size="sm" variant="ghost" icon={<SkipForward className="size-3.5" />} onClick={() => skip(r)} aria-label={`Skip ${r.customer.firstName}'s birthday`}>
                      Skip
                    </Button>
                  </>
                ) : r.send ? (
                  <Link href={`/app/activity?id=${r.send.id}`} className="text-[13px] font-semibold text-cobalt underline-offset-2 hover:underline">
                    View activity
                  </Link>
                ) : null}
              </div>
            </li>
          );
        })}
      </ul>
      <EditSendModal id={editing} onClose={() => setEditing(null)} />
    </>
  );
}

export function EditSendModal({ id, onClose }: { id: string | null; onClose: () => void }) {
  const send = useDemo((s) => (id ? s.sends.find((x) => x.id === id) : undefined));
  return (
    <Modal open={!!send} onClose={onClose} title={send ? `Edit ${send.recipientName.split(" ")[0]}'s card` : ""} width="max-w-3xl">
      {send && <EditSendBody key={send.id} send={send} onClose={onClose} />}
    </Modal>
  );
}

function EditSendBody({ send, onClose }: { send: Send; onClose: () => void }) {
  const updateSend = useDemo((s) => s.updateSend);
  const savedCards = useDemo((s) => s.savedCards);
  const business = useDemo((s) => s.business);
  const toast = useToast();
  const [cardId, setCardId] = useState(send.cardId);
  const [message, setMessage] = useState(send.message);
  const card = getCard(cardId, savedCards);
  const brand = { name: business.name, color: business.brandColor, logo: business.logoDataUrl };
  const save = () => {
    updateSend(send.id, { cardId, message }, `Edited by ${business.senderName}`);
    toast({ title: "Upcoming send updated", body: `Only ${send.recipientName.split(" ")[0]}'s ${fmtDate(send.scheduledFor)} card changed. The rule stays the same.`, tone: "success" });
    onClose();
  };
  return (
    <div className="grid gap-6 md:grid-cols-[1fr_220px]">
      <div className="flex min-w-0 flex-col gap-4">
        <p className="text-[13px] text-ink-3">Changes apply to this one send on {fmtDate(send.scheduledFor, { weekday: "long", month: "long", day: "numeric" })}. The rule itself isn’t changed.</p>
        <CardPicker value={cardId} onChange={setCardId} onlyApproved label="Card for this send" />
        <Textarea label="Message" rows={5} value={message} onChange={(e) => setMessage(e.target.value)} />
        <div className="flex flex-wrap justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={save} disabled={!message.trim()}>
            Save this send
          </Button>
        </div>
      </div>
      <div className="hidden flex-col gap-3 md:flex">
        <CardFront card={card} brandMark={brand} />
        <CardInside message={message} font={send.messageFont} brand={brand} />
      </div>
    </div>
  );
}
