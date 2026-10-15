"use client";

import Link from "next/link";
import { clsx } from "clsx";
import { useState } from "react";
import { ArrowRight, CalendarDays, Check, History, Mail, Pencil, Send as SendIcon, Sparkles, Trash2, Workflow } from "lucide-react";
import { useDemo } from "@/lib/store";
import type { Customer } from "@/lib/types";
import { customerIssues, ruleForCustomer } from "@/lib/selectors";
import { daysUntil, fmtDate, formatBirthday, isLeap, nextBirthday, relDays } from "@/lib/dates";
import { getCard } from "@/lib/cards";
import { freshSuggestionsSync, suggestForCustomerSync } from "@/lib/ai/personalize";
import { Drawer, Modal } from "@/components/ui/overlay";
import { AIDemoLabel, Badge, GiftBadge, SimulatedNote, StatusBadge } from "@/components/ui/badges";
import { Button, ButtonLink } from "@/components/ui/button";
import { Textarea } from "@/components/ui/field";
import { useToast } from "@/components/ui/toast";
import { CardFront } from "@/components/cards/card-art";
import { Avatar } from "./dashboard-overview";
import { ruleSummary, upcomingSendFor } from "./dashboard-utils";
import { CardPicker } from "./review-card-picker";
import { GIFT_PREFS, fullName } from "./customers-utils";

export function CustomerDetailDrawer({ customer, onClose, onEdit }: { customer: Customer | null; onClose: () => void; onEdit: (c: Customer) => void }) {
  // Keep showing the last customer while the drawer animates closed.
  const [last, setLast] = useState<Customer | null>(customer);
  if (customer && customer !== last) setLast(customer);
  const shown = customer ?? last;
  return (
    <Drawer open={!!customer} onClose={onClose} width="max-w-3xl" title={shown ? fullName(shown) : ""} description={shown ? shown.email || "No email on file" : undefined}>
      {shown && <DetailBody key={shown.id} customer={shown} onClose={onClose} onEdit={onEdit} />}
    </Drawer>
  );
}

function DetailBody({ customer: c, onClose, onEdit }: { customer: Customer; onClose: () => void; onEdit: (c: Customer) => void }) {
  const business = useDemo((s) => s.business);
  const automations = useDemo((s) => s.automations);
  const sends = useDemo((s) => s.sends);
  const savedCards = useDemo((s) => s.savedCards);
  const updateSend = useDemo((s) => s.updateSend);
  const updateCustomer = useDemo((s) => s.updateCustomer);
  const deleteCustomer = useDemo((s) => s.deleteCustomer);
  const addSend = useDemo((s) => s.addSend);
  const toast = useToast();

  const [confirmDelete, setConfirmDelete] = useState(false);
  const [sendNow, setSendNow] = useState(false);

  const rule = ruleForCustomer(automations, c);
  const main = automations.find((a) => a.id === "auto-main") ?? automations[0];
  const feb29 = rule?.feb29 ?? main?.feb29 ?? "feb28";
  const next = nextBirthday(c, feb29);
  const days = daysUntil(next);
  const issues = customerIssues(c);
  const upcoming = upcomingSendFor(sends, c.id);
  const pastSends = sends.filter((s) => s.customerId === c.id && s !== upcoming && s.status !== "pending-review" && s.status !== "scheduled");
  const fresh = freshSuggestionsSync(c, business);
  const isLeapDay = c.birthMonth === 2 && c.birthDay === 29;
  const giftEligible = rule?.giftMode === "gift" && (!rule.giftSegmentTag || c.tags.some((t) => t.toLowerCase() === rule.giftSegmentTag!.toLowerCase())) && c.giftPreference !== "card-only";

  // History: stored yearly history plus this year's sends that already went out.
  const thisYear = new Date().getFullYear();
  const history = [
    ...pastSends.filter((s) => s.status !== "skipped").map((s) => ({ year: new Date(s.scheduledFor).getFullYear(), cardId: s.cardId, message: s.message, key: s.id })),
    ...c.history.map((h, i) => ({ ...h, key: `h${i}` })),
  ].sort((a, b) => b.year - a.year);

  function applyFresh(i: number) {
    const s = fresh[i];
    const card = getCard(s.cardId, savedCards);
    if (upcoming) {
      updateSend(upcoming.id, { cardId: s.cardId, message: s.message, aiReasons: [`Annual freshness: new design and wording, different from previous years`, ...(upcoming.aiReasons ?? []).filter((r) => /gift/i.test(r))] }, "Fresh suggestion chosen for this year");
      toast({ title: `Updated ${c.firstName}'s upcoming card`, body: `${card.name} with new wording. It's ${upcoming.status === "pending-review" ? "waiting in Review birthdays" : "still scheduled"}.`, tone: "success" });
    } else {
      updateCustomer(c.id, { cardPreference: s.cardId });
      toast({ title: `Saved for ${c.firstName}'s next birthday`, body: `${card.name} is now their card preference. The new wording will be suggested when the card is prepared.`, tone: "success" });
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <Avatar name={fullName(c)} id={c.id} className="size-14 text-lg" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap gap-1.5">
            {c.tags.map((t) => (
              <Badge key={t} tone="cobalt">
                {t}
              </Badge>
            ))}
            {issues.map((i) => (
              <Badge key={i} tone="coral" dot>
                {i}
              </Badge>
            ))}
          </div>
          <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-[14px]">
            {c.company && (
              <>
                <dt className="text-ink-3">Company</dt>
                <dd>{c.company}</dd>
              </>
            )}
            <dt className="text-ink-3">Birthday</dt>
            <dd>{formatBirthday(c)}</dd>
            <dt className="text-ink-3">Gifts</dt>
            <dd>{GIFT_PREFS.find((g) => g.value === c.giftPreference)?.label}</dd>
            {c.cardPreference && (
              <>
                <dt className="text-ink-3">Card preference</dt>
                <dd>{getCard(c.cardPreference, savedCards).name}</dd>
              </>
            )}
          </dl>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="primary" icon={<SendIcon className="size-3.5" />} onClick={() => setSendNow(true)} disabled={!c.email}>
            Send a card now
          </Button>
          <Button size="sm" variant="outline" icon={<Pencil className="size-3.5" />} onClick={() => onEdit(c)}>
            Edit
          </Button>
          <Button size="sm" variant="danger" icon={<Trash2 className="size-3.5" />} onClick={() => setConfirmDelete(true)} aria-label={`Delete ${fullName(c)}`}>
            Delete
          </Button>
        </div>
      </div>

      {/* Next birthday + rule */}
      <div className="grid gap-3 sm:grid-cols-2">
        <section className="rounded-2xl bg-white p-4 ring-1 ring-line">
          <p className="flex items-center gap-1.5 text-[12px] font-bold uppercase tracking-wide text-ink-3">
            <CalendarDays className="size-3.5" aria-hidden /> Next birthday
          </p>
          {next ? (
            <>
              <p className="mt-1.5 font-display text-2xl font-semibold tracking-tight">{fmtDate(next, { weekday: "long", month: "long", day: "numeric" })}</p>
              <p className="text-[13px] text-ink-3">
                {relDays(days)}
                {c.birthYear ? ` · turning ${next.getFullYear() - c.birthYear}` : ""}
              </p>
              {isLeapDay && (
                <p className="mt-2 rounded-xl bg-lilac-soft px-3 py-2 text-[13px] text-lilac-deep">
                  Leap-day birthday. {isLeap(next.getFullYear()) ? `${next.getFullYear()} is a leap year, so the card goes out on Feb 29.` : `In non-leap years the card goes out on ${feb29 === "feb28" ? "Feb 28" : "Mar 1"}.`}{" "}
                  <Link href="/app/automations" className="font-semibold underline-offset-2 hover:underline">
                    Change this rule
                  </Link>
                </p>
              )}
            </>
          ) : (
            <div className="mt-1.5">
              <p className="font-semibold">No birthday on file</p>
              <p className="text-[13px] text-ink-3">Add it and their card will be prepared automatically.</p>
              <Button size="sm" variant="soft" className="mt-2" onClick={() => onEdit(c)}>
                Add birthday
              </Button>
            </div>
          )}
        </section>

        <section className="rounded-2xl bg-white p-4 ring-1 ring-line">
          <p className="flex items-center gap-1.5 text-[12px] font-bold uppercase tracking-wide text-ink-3">
            <Workflow className="size-3.5" aria-hidden /> Automation
          </p>
          {rule ? (
            <>
              <Link href={`/app/automations?id=${rule.id}`} className="mt-1.5 block font-semibold hover:underline">
                {rule.name}
              </Link>
              <p className="mt-1 text-[13px] leading-snug text-ink-3">{ruleSummary(rule)}</p>
              <p className="mt-2 text-[13px] text-ink-2">
                {c.giftPreference === "card-only"
                  ? "Card only, per this customer's preference."
                  : giftEligible
                    ? "Eligible for this rule's gift, subject to approval and budget."
                    : "Card only under this rule."}
              </p>
            </>
          ) : (
            <p className="mt-1.5 text-[14px] text-ink-2">
              No active rule covers this customer.{" "}
              <Link href="/app/automations" className="font-semibold text-cobalt hover:underline">
                Set one up
              </Link>
            </p>
          )}
        </section>
      </div>

      {/* Upcoming send */}
      <section>
        <h3 className="text-[13px] font-bold uppercase tracking-wide text-ink-3">Upcoming card</h3>
        {upcoming ? (
          <div className="mt-2 flex gap-4 rounded-2xl bg-white p-4 ring-1 ring-line">
            <div className="w-20 shrink-0">
              <CardFront card={getCard(upcoming.cardId, savedCards)} headline={upcoming.headline} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge status={upcoming.status} />
                {upcoming.gift && <GiftBadge status={upcoming.gift.status} />}
                <span className="text-[13px] text-ink-3">{fmtDate(upcoming.scheduledFor, { month: "short", day: "numeric" })}</span>
              </div>
              <p className="mt-2 line-clamp-3 text-[14px] text-ink-2">{upcoming.message}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {upcoming.status === "pending-review" ? (
                  <ButtonLink href={`/app/review#${upcoming.id}`} size="sm" iconRight={<ArrowRight className="size-3.5" />}>
                    Review card
                  </ButtonLink>
                ) : (
                  <ButtonLink href={`/app/activity?id=${upcoming.id}`} size="sm" variant="outline">
                    View scheduled card
                  </ButtonLink>
                )}
              </div>
            </div>
          </div>
        ) : (
          <p className="mt-2 rounded-2xl bg-paper p-4 text-[14px] text-ink-2 ring-1 ring-inset ring-line">
            {next && rule
              ? `Nothing prepared yet. ${rule.name} will prepare a card about a week before ${fmtDate(next, { month: "long", day: "numeric" })}.`
              : "Nothing scheduled."}
          </p>
        )}
      </section>

      {/* Notes & interests */}
      <section>
        <h3 className="text-[13px] font-bold uppercase tracking-wide text-ink-3">Notes & interests</h3>
        <div className="mt-2 rounded-2xl bg-white p-4 ring-1 ring-line">
          {c.notes ? <p className="text-[14px] text-ink-2">{c.notes}</p> : <p className="text-[14px] text-ink-3">No relationship notes yet. A sentence or two makes suggestions far more personal.</p>}
          <div className="mt-3 flex flex-wrap gap-1.5">
            {c.interests.length ? (
              c.interests.map((i) => (
                <Badge key={i} tone="lilac">
                  {i}
                </Badge>
              ))
            ) : (
              <span className="text-[13px] text-ink-3">No interests recorded.</span>
            )}
          </div>
        </div>
      </section>

      {/* Annual freshness */}
      <section className="rounded-3xl bg-cream/70 p-4 ring-1 ring-inset ring-line sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="flex items-center gap-2 font-display text-xl font-semibold tracking-tight">
            <History className="size-5 text-ink-3" aria-hidden /> Annual freshness
          </h3>
          <AIDemoLabel />
        </div>

        <p className="mt-1 text-[13px] text-ink-3">Previous cards and messages, so this year&apos;s feels new.</p>
        {history.length ? (
          <ol className="mt-3 flex flex-col gap-2">
            {history.map((h) => (
              <li key={h.key} className="flex gap-3 rounded-2xl bg-white p-3 ring-1 ring-line">
                <div className="w-14 shrink-0">
                  <CardFront card={getCard(h.cardId, savedCards)} shadow={false} className="ring-1 ring-line" />
                </div>
                <div className="min-w-0">
                  <p className="text-[13px] font-semibold">
                    <span className="font-grotesk">{h.year}</span> · {getCard(h.cardId, savedCards).name}
                    {h.year === thisYear && <span className="font-normal text-ink-3"> (this year)</span>}
                  </p>
                  <p className="mt-0.5 text-[13.5px] italic text-ink-2">&ldquo;{h.message}&rdquo;</p>
                </div>
              </li>
            ))}
          </ol>
        ) : (
          <p className="mt-3 rounded-2xl bg-white p-3 text-[14px] text-ink-3 ring-1 ring-line">No previous cards yet. This will be their first from {business.name}.</p>
        )}

        <p className="mt-5 text-[12px] font-bold uppercase tracking-wide text-lilac-deep">
          <Sparkles className="mr-1 inline size-3.5" aria-hidden />
          Fresh ideas for the next birthday
        </p>
        <p className="mt-1 text-[14px] text-ink-2">{fresh[0]?.explanation}</p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {fresh.map((s, i) => {
            const card = getCard(s.cardId, savedCards);
            const inUse = upcoming ? upcoming.cardId === s.cardId && upcoming.message === s.message : c.cardPreference === s.cardId;
            return (
              <div key={i} className={clsx("flex flex-col rounded-2xl bg-white p-3 ring-1", inUse ? "ring-2 ring-mint-deep" : "ring-line")}>
                <div className="flex gap-3">
                  <div className="w-20 shrink-0">
                    <CardFront card={card} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] font-bold uppercase tracking-wide text-ink-3">{i === 0 ? "New design, fresh wording" : "New design, different tone"}</p>
                    <p className="text-[14px] font-semibold">{card.name}</p>
                    <p className="mt-1 text-[13px] leading-snug text-ink-2">{s.message}</p>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant={inUse ? "soft" : "ink"}
                  className="mt-3 self-start"
                  icon={inUse ? <Check className="size-3.5" /> : undefined}
                  onClick={() => applyFresh(i)}
                  disabled={inUse}
                >
                  {inUse ? "Chosen for next birthday" : "Use this for the next birthday"}
                </Button>
              </div>
            );
          })}
        </div>
        <p className="mt-4 text-[13px] text-ink-3">
          {main?.avoidRepeat ? "“Avoid repeating last year’s card” is on, so automations already skip last year's design." : "“Avoid repeating last year’s card” is off for your main rule."}{" "}
          <Link href="/app/automations" className="font-semibold text-cobalt hover:underline">
            Automation settings
          </Link>
        </p>
      </section>

      <Modal
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        title={`Delete ${fullName(c)}?`}
        footer={
          <>
            <Button variant="outline" onClick={() => setConfirmDelete(false)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                const pending = sends.filter((s) => s.customerId === c.id && (s.status === "pending-review" || s.status === "scheduled"));
                pending.forEach((s) => updateSend(s.id, { status: "skipped" }, "Customer deleted; card cancelled"));
                deleteCustomer(c.id);
                setConfirmDelete(false);
                onClose();
                toast({ title: `${fullName(c)} deleted`, body: pending.length ? "Their upcoming card was cancelled." : undefined });
              }}
            >
              Delete customer
            </Button>
          </>
        }
      >
        <p className="text-ink-2">They&apos;ll be removed from your customer list and any upcoming card will be cancelled. Past activity stays in your records.</p>
      </Modal>

      <SendNowModal open={sendNow} onClose={() => setSendNow(false)} customer={c} onSend={addSend} />
    </div>
  );
}

function SendNowModal({
  open,
  onClose,
  customer: c,
  onSend,
}: {
  open: boolean;
  onClose: () => void;
  customer: Customer;
  onSend: ReturnType<typeof useDemo.getState>["addSend"];
}) {
  const business = useDemo((s) => s.business);
  const savedCards = useDemo((s) => s.savedCards);
  const toast = useToast();
  const [init] = useState(() => suggestForCustomerSync(c, business));
  const [cardId, setCardId] = useState(c.cardPreference ?? init.cardId);
  const [message, setMessage] = useState(init.message);
  const [picker, setPicker] = useState(false);
  const card = getCard(cardId, savedCards);
  return (
    <>
      <Modal
        open={open && !picker}
        onClose={onClose}
        title={`Send ${c.firstName} a card now`}
        width="max-w-2xl"
        footer={
          <>
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              icon={<Mail className="size-4" />}
              disabled={!message.trim()}
              onClick={() => {
                const now = new Date().toISOString();
                onSend({
                  source: "manual",
                  customerId: c.id,
                  automationId: null,
                  recipientName: fullName(c),
                  recipientEmail: c.email,
                  cardId,
                  message,
                  messageFont: "classic",
                  senderName: business.senderName,
                  fromLabel: business.name,
                  brandColor: business.brandColor,
                  logoDataUrl: business.logoDataUrl,
                  scheduledFor: now,
                  status: "sent",
                  gift: null,
                  approved: true,
                  events: [{ at: now, label: "Sent (simulated)" }],
                });
                onClose();
                toast({ title: `Card sent to ${c.firstName}`, body: "Simulated delivery. It now appears in Activity.", tone: "success" });
              }}
            >
              Send now
            </Button>
          </>
        }
      >
        <div className="grid gap-4 sm:grid-cols-[150px_1fr]">
          <div>
            <CardFront card={card} />
            <button type="button" className="mt-2 text-[13px] font-semibold text-cobalt hover:underline" onClick={() => setPicker(true)}>
              Change card
            </button>
          </div>
          <div className="flex flex-col gap-3">
            <Textarea label="Message" value={message} onChange={(e) => setMessage(e.target.value)} rows={5} />
            <p className="text-[13px] text-ink-3">To {c.email}. Counts toward your monthly card allowance.</p>
            <SimulatedNote>Demo only: nothing is actually emailed.</SimulatedNote>
          </div>
        </div>
      </Modal>
      <CardPicker open={picker} onClose={() => setPicker(false)} value={cardId} onPick={setCardId} />
    </>
  );
}
