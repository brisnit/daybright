"use client";

import Link from "next/link";
import { clsx } from "clsx";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Check, CheckCheck, FileText, Loader2, PenLine, RefreshCw, SkipForward, Sparkles, SquareStack, X } from "lucide-react";
import { useDemo } from "@/lib/store";
import type { Customer, Send } from "@/lib/types";
import { getCard } from "@/lib/cards";
import { daysUntil, fmtDate, relDays, startOfToday } from "@/lib/dates";
import { renderTemplate } from "@/lib/ai/messages";
import { suggestForCustomer, suggestForCustomerSync } from "@/lib/ai/personalize";
import { GIFT_MAP } from "@/data/gifts";
import { money } from "@/config/brand";
import { AppPage, PageHeader, Panel } from "@/components/app/app-shell";
import { AIDemoLabel, Badge, GiftBadge, StatusBadge } from "@/components/ui/badges";
import { Button, ButtonLink } from "@/components/ui/button";
import { Toggle } from "@/components/ui/controls";
import { Drawer } from "@/components/ui/overlay";
import { Textarea } from "@/components/ui/field";
import { useToast } from "@/components/ui/toast";
import { CardFront, CardInside } from "@/components/cards/card-art";
import { GiftArt } from "@/components/gifts/gift-art";
import { MessageAssistant } from "@/components/ai/message-assistant";
import { Avatar } from "./dashboard-overview";
import { explainReason, plural } from "./dashboard-utils";
import { numberWord } from "@/lib/selectors";
import { CardPicker } from "./review-card-picker";

const DAY = 86_400_000;

export function ReviewQueue() {
  const sends = useDemo((s) => s.sends);
  const customers = useDemo((s) => s.customers);
  const business = useDemo((s) => s.business);
  const automations = useDemo((s) => s.automations);
  const approveSends = useDemo((s) => s.approveSends);
  const updateSend = useDemo((s) => s.updateSend);
  const updateAutomation = useDemo((s) => s.updateAutomation);
  const toast = useToast();

  const main = automations.find((a) => a.id === "auto-main") ?? automations[0];
  const aiOn = main?.aiPersonalize ?? true;
  const [includeScheduled, setIncludeScheduled] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const pending = useMemo(
    () => sends.filter((s) => s.status === "pending-review").sort((a, b) => a.scheduledFor.localeCompare(b.scheduledFor)),
    [sends],
  );
  const scheduled = useMemo(() => {
    const now = startOfToday().getTime();
    return sends
      .filter((s) => s.status === "scheduled" && s.source !== "consumer" && new Date(s.scheduledFor).getTime() - now <= 31 * DAY && new Date(s.scheduledFor).getTime() >= now)
      .sort((a, b) => a.scheduledFor.localeCompare(b.scheduledFor));
  }, [sends]);

  const visible = includeScheduled ? [...pending, ...scheduled] : pending;
  const selectable = pending.map((s) => s.id);
  const sel = [...selected].filter((id) => visible.some((s) => s.id === id));
  const allSelected = selectable.length > 0 && selectable.every((id) => selected.has(id));

  // Scroll to a send when linked with #id (content renders after hydration, so the browser can't do it).
  useEffect(() => {
    const id = decodeURIComponent(window.location.hash.slice(1));
    if (!id) return;
    const t = setTimeout(() => {
      const el = document.getElementById(id);
      el?.scrollIntoView({ behavior: "smooth", block: "start" });
      el?.classList.add("ring-2", "ring-cobalt");
      setTimeout(() => el?.classList.remove("ring-2", "ring-cobalt"), 2200);
    }, 150);
    return () => clearTimeout(t);
  }, []);

  const toggle = (id: string) =>
    setSelected((cur) => {
      const n = new Set(cur);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });

  const customerFor = (s: Send) => customers.find((c) => c.id === s.customerId) ?? null;

  function templateFor(s: Send) {
    const c = customerFor(s);
    const rule = automations.find((a) => a.id === s.automationId) ?? main;
    return renderTemplate(rule?.messageTemplate ?? business.defaultMessage, {
      firstName: c?.firstName ?? s.recipientName.split(" ")[0],
      companyName: business.name,
      senderName: business.senderName,
    });
  }

  const giftReasons = (s: Send) => (s.aiReasons ?? []).filter((r) => /gift/i.test(r));

  function approveSelected() {
    const ids = sel.filter((id) => pending.some((p) => p.id === id));
    if (!ids.length) return;
    approveSends(ids);
    setSelected(new Set());
    const remaining = pending.length - ids.length;
    toast({
      title: `${ids.length} ${plural(ids.length, "card")} approved and scheduled`,
      body: remaining ? `${remaining} still waiting for review.` : "That's everything. The queue is clear.",
      tone: "success",
    });
  }

  function applyTemplate() {
    if (!sel.length) return;
    sel.forEach((id) => {
      const s = sends.find((x) => x.id === id);
      if (!s) return;
      updateSend(id, { message: templateFor(s), aiReasons: ["Shared template applied instead of a personalized message", ...giftReasons(s)] }, "Shared template applied");
    });
    toast({ title: `Shared template applied to ${sel.length} ${plural(sel.length, "card")}`, body: "Personalized messages were replaced. You can still edit each one." });
  }

  function setAi(on: boolean) {
    if (!main) return;
    updateAutomation(main.id, { aiPersonalize: on });
    pending
      .filter((s) => (s.automationId ?? main.id) === main.id)
      .forEach((s) => {
        const c = customerFor(s);
        if (!on) {
          updateSend(s.id, { message: templateFor(s), aiReasons: ["AI personalization is off, so this uses your shared template", ...giftReasons(s)] }, "Switched to shared template");
        } else if (c) {
          const sug = suggestForCustomerSync(c, business, { template: main.messageTemplate });
          updateSend(s.id, { message: sug.message, aiReasons: [...sug.reasons, ...giftReasons(s)] }, "Personalized suggestion restored");
        }
      });
    toast({
      title: on ? "AI personalization is on" : "AI personalization is off",
      body: on ? "Cards waiting for review now use suggestions from each customer's notes and interests." : "Cards waiting for review now use your shared message template.",
    });
  }

  return (
    <AppPage className="pb-32">
      <PageHeader
        eyebrow="Personalization preview"
        title="Review birthdays"
        description="Check each card before it goes out. Every suggestion shows which part of the customer record it came from."
        actions={
          <div className="flex items-center gap-3 rounded-2xl bg-white px-4 py-2.5 ring-1 ring-line">
            <div className="min-w-0">
              <p className="text-[13px] font-semibold">AI personalization</p>
              <p className="text-[12px] text-ink-3">{aiOn ? "Uses notes, interests and tags" : "Using your shared template"}</p>
            </div>
            <Toggle checked={aiOn} onChange={setAi} />
          </div>
        }
      />

      {/* Toolbar */}
      <div className="mt-6 flex flex-col gap-3 rounded-2xl bg-white p-3 ring-1 ring-line sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <label className={clsx("flex items-center gap-2 pl-1 text-[14px] font-semibold", !selectable.length && "opacity-50")}>
            <input
              type="checkbox"
              className="size-[18px] accent-cobalt"
              disabled={!selectable.length}
              checked={allSelected}
              onChange={() => setSelected(allSelected ? new Set() : new Set(selectable))}
            />
            Select all to review ({pending.length})
          </label>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Toggle size="sm" checked={includeScheduled} onChange={setIncludeScheduled} />
          <button type="button" className="text-[13px] font-semibold text-ink-2" onClick={() => setIncludeScheduled((v) => !v)}>
            Include scheduled cards, next 30 days ({scheduled.length})
          </button>
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-4">
        <AnimatePresence initial={false}>
          {visible.map((s) => (
            <motion.div key={s.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, height: 0, marginTop: -16 }} transition={{ duration: 0.25 }}>
              <ReviewItem send={s} customer={customerFor(s)} selected={selected.has(s.id)} onToggle={() => toggle(s.id)} aiOn={aiOn} templateMessage={templateFor(s)} />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {pending.length === 0 && <AllClear scheduledCount={scheduled.length} showScheduled={() => setIncludeScheduled(true)} includeScheduled={includeScheduled} />}

      {/* Bulk action bar */}
      <AnimatePresence>
        {sel.length > 0 && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            className="fixed inset-x-3 bottom-3 z-50 mx-auto flex max-w-2xl flex-wrap items-center gap-2 rounded-2xl bg-ink p-2.5 pl-4 text-paper shadow-lift lg:left-[260px] lg:right-0 lg:bottom-6"
          >
            <span className="mr-auto text-[14px] font-semibold">{sel.length} selected</span>
            <button type="button" onClick={() => setSelected(new Set())} className="rounded-full px-3 py-1.5 text-[13px] font-semibold text-paper/80 hover:bg-white/10">
              Clear
            </button>
            <Button size="sm" variant="white" icon={<FileText className="size-4" />} onClick={applyTemplate}>
              <span className="sm:hidden">Use template</span>
              <span className="hidden sm:inline">Apply shared template</span>
            </Button>
            <Button size="sm" variant="coral" icon={<CheckCheck className="size-4" />} onClick={approveSelected}>
              <span className="sm:hidden">Approve</span>
              <span className="hidden sm:inline">Approve selected</span>
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </AppPage>
  );
}

/* ------------------------------------------------------------------ */

function ReviewItem({
  send,
  customer,
  selected,
  onToggle,
  aiOn,
  templateMessage,
}: {
  send: Send;
  customer: Customer | null;
  selected: boolean;
  onToggle: () => void;
  aiOn: boolean;
  templateMessage: string;
}) {
  const business = useDemo((s) => s.business);
  const savedCards = useDemo((s) => s.savedCards);
  const updateSend = useDemo((s) => s.updateSend);
  const approveSends = useDemo((s) => s.approveSends);
  const approveGift = useDemo((s) => s.approveGift);
  const declineGift = useDemo((s) => s.declineGift);
  const skipSend = useDemo((s) => s.skipSend);
  const toast = useToast();

  const [draft, setDraft] = useState(send.message);
  const [lastSaved, setLastSaved] = useState(send.message);
  const [variant, setVariant] = useState(0);
  const [regenerating, setRegenerating] = useState(false);
  const [picker, setPicker] = useState(false);
  const [assistant, setAssistant] = useState(false);
  const [assistDraft, setAssistDraft] = useState(send.message);
  const [assistNotes, setAssistNotes] = useState(customer?.notes ?? "");

  // Keep the editor in sync when the message changes elsewhere (regenerate, template, AI toggle).
  if (send.message !== lastSaved) {
    setLastSaved(send.message);
    setDraft(send.message);
  }

  const dirty = draft !== send.message;
  const card = getCard(send.cardId, savedCards);
  const date = new Date(send.scheduledFor);
  const days = daysUntil(new Date(date.getFullYear(), date.getMonth(), date.getDate()));
  const first = customer?.firstName ?? send.recipientName.split(" ")[0];
  const isPending = send.status === "pending-review";
  const general = customer ? !customer.interests.length && !customer.notes.trim() : true;
  const reasons = (send.aiReasons ?? []).map((r) => explainReason(r, customer));
  if (!reasons.length && customer) {
    suggestForCustomerSync(customer, business).reasons.forEach((r) => reasons.push(explainReason(r, customer)));
  }

  function save() {
    updateSend(send.id, { message: draft }, `Message edited by ${business.senderName}`);
    toast({ title: `Message updated for ${first}`, tone: "success" });
  }

  async function regenerate() {
    if (!customer) return;
    setRegenerating(true);
    const next = variant + 1;
    const sug = await suggestForCustomer(customer, business, { variant: next, avoidCardIds: [send.cardId] });
    setVariant(next);
    const gifts = (send.aiReasons ?? []).filter((r) => /gift/i.test(r));
    updateSend(send.id, { cardId: sug.cardId, message: aiOn ? sug.message : templateMessage, aiReasons: [...sug.reasons.filter((r) => !/gift/i.test(r) || !gifts.length), ...gifts] }, "New suggestion generated");
    setRegenerating(false);
    toast({ title: `New suggestion for ${first}`, body: aiOn ? "A different card and message wording." : "A different card. Messages use your shared template while AI personalization is off." });
  }

  return (
    <article id={send.id} className={clsx("scroll-mt-20 rounded-3xl bg-white ring-1 transition", selected ? "ring-2 ring-cobalt" : "ring-line")}>
      {/* Header */}
      <header className="flex flex-wrap items-center gap-3 border-b border-line px-4 py-3 sm:px-5">
        {isPending ? (
          <input type="checkbox" className="size-[18px] accent-cobalt" checked={selected} onChange={onToggle} aria-label={`Select ${send.recipientName}`} />
        ) : (
          <span className="size-[18px]" aria-hidden />
        )}
        <Avatar name={send.recipientName} id={customer?.id ?? send.id} className="size-9" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-[15px] font-semibold">
            {customer ? (
              <Link href={`/app/customers?id=${customer.id}`} className="hover:underline">
                {send.recipientName}
              </Link>
            ) : (
              send.recipientName
            )}
          </p>
          <p className="text-[12.5px] text-ink-3">
            Birthday {fmtDate(date, { weekday: "short", month: "short", day: "numeric" })} · {relDays(days)}
            {customer?.company ? ` · ${customer.company}` : ""}
          </p>
        </div>
        <StatusBadge status={send.status} />
      </header>

      <div className="grid gap-5 p-4 sm:p-5 lg:grid-cols-[300px_minmax(0,1fr)]">
        {/* Card preview */}
        <div className="flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-3">
            <CardFront card={card} headline={send.headline} />
            <CardInside message={draft} font={send.messageFont} brand={{ name: business.name, color: business.brandColor, logo: business.logoDataUrl }} />
          </div>
          <div className="flex items-center justify-between gap-2">
            <p className="min-w-0 truncate text-[12.5px] text-ink-3" title={card.name}>
              {card.name}
            </p>
            <Button size="sm" variant="outline" icon={<SquareStack className="size-3.5" />} onClick={() => setPicker(true)}>
              Change card
            </Button>
          </div>
        </div>

        {/* Details */}
        <div className="flex min-w-0 flex-col gap-4">
          <section aria-label="Why this suggestion" className="rounded-2xl bg-lilac-soft/50 p-3.5 ring-1 ring-inset ring-lilac/40">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="flex items-center gap-1.5 text-[12px] font-bold uppercase tracking-wide text-lilac-deep">
                <Sparkles className="size-3.5" aria-hidden /> Why this suggestion
              </p>
              <AIDemoLabel />
            </div>
            {general && aiOn ? (
              <p className="mt-2 text-[14px] leading-snug text-ink-2">
                We don&apos;t have personal notes or interests for {first} yet, so this is a thoughtful general message rather than a guess.{" "}
                {customer && (
                  <Link href={`/app/customers?id=${customer.id}&edit=1`} className="font-semibold text-cobalt hover:underline">
                    Add a note
                  </Link>
                )}
              </p>
            ) : null}
            <ul className="mt-2 flex flex-col gap-1.5">
              {reasons.map((r, i) => (
                <li key={i} className="flex flex-col gap-0.5 text-[14px] leading-snug sm:flex-row sm:items-baseline sm:gap-2">
                  <span className="shrink-0 text-[11px] font-bold uppercase tracking-wide text-ink-3 sm:w-28">{r.source}</span>
                  <span className="text-ink">{r.text}</span>
                </li>
              ))}
            </ul>
            {customer && (customer.notes || customer.interests.length > 0 || customer.tags.length > 0) && (
              <div className="mt-3 border-t border-lilac/30 pt-3">
                <p className="text-[11px] font-bold uppercase tracking-wide text-ink-3">From {first}&apos;s record</p>
                {customer.notes && <p className="mt-1 text-[13.5px] italic text-ink-2">&ldquo;{customer.notes}&rdquo;</p>}
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {customer.interests.map((i) => (
                    <Badge key={i} tone="lilac">
                      {i}
                    </Badge>
                  ))}
                  {customer.tags.map((t) => (
                    <Badge key={t}>{t}</Badge>
                  ))}
                </div>
              </div>
            )}
          </section>

          <div>
            <Textarea
              label={
                <span className="flex items-center gap-2">
                  Message {draft.trim() === templateMessage.trim() && <Badge tone="neutral">Shared template</Badge>}
                </span>
              }
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              rows={4}
            />
            <div className="mt-2 flex flex-wrap items-center gap-2">
              {dirty && (
                <>
                  <Button size="sm" variant="ink" icon={<Check className="size-3.5" />} onClick={save}>
                    Save message
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setDraft(send.message)}>
                    Undo
                  </Button>
                </>
              )}
              <Button
                size="sm"
                variant="outline"
                icon={regenerating ? <Loader2 className="size-3.5 animate-spin" /> : <RefreshCw className="size-3.5" />}
                onClick={regenerate}
                disabled={regenerating || !customer}
              >
                {regenerating ? "Regenerating" : "Regenerate"}
              </Button>
              <Button
                size="sm"
                variant="outline"
                icon={<PenLine className="size-3.5" />}
                onClick={() => {
                  setAssistDraft(draft);
                  setAssistant(true);
                }}
              >
                Message assistant
              </Button>
            </div>
          </div>

          {send.gift && <GiftLine send={send} first={first} onApprove={() => approveGift(send.id)} onRemove={() => declineGift(send.id)} />}

          <div className="mt-auto flex flex-wrap items-center gap-2 border-t border-line pt-4">
            {isPending ? (
              <Button
                icon={<Check className="size-4" />}
                onClick={() => {
                  if (dirty) updateSend(send.id, { message: draft }, `Message edited by ${business.senderName}`);
                  approveSends([send.id]);
                  toast({ title: `${first}'s card is scheduled`, body: `Goes out ${fmtDate(date, { month: "long", day: "numeric" })}.`, tone: "success" });
                }}
              >
                Approve card
              </Button>
            ) : (
              <p className="text-[13px] text-ink-3">Approved and scheduled. Edits save straight to the scheduled card.</p>
            )}
            <Button
              variant="ghost"
              size="sm"
              icon={<SkipForward className="size-3.5" />}
              onClick={() => {
                skipSend(send.id);
                toast({ title: `Skipped ${first}'s birthday this year`, body: "No card will be sent. Their next birthday will be prepared as usual.", tone: "warn" });
              }}
            >
              Skip this birthday
            </Button>
          </div>
        </div>
      </div>

      <CardPicker
        open={picker}
        onClose={() => setPicker(false)}
        value={send.cardId}
        title={`Choose a card for ${first}`}
        onPick={(id) => {
          updateSend(send.id, { cardId: id }, "Card design changed");
          toast({ title: "Card updated", body: `${first} will receive ${getCard(id, savedCards).name}.` });
        }}
      />

      <Drawer
        open={assistant}
        onClose={() => setAssistant(false)}
        title={`Message for ${first}`}
        description="Draft and rewrite using only what you know about this customer."
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setAssistant(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                updateSend(send.id, { message: assistDraft }, `Message edited by ${business.senderName}`);
                setAssistant(false);
                toast({ title: `Message updated for ${first}`, tone: "success" });
              }}
            >
              Use this message
            </Button>
          </div>
        }
      >
        <Textarea label="Message" value={assistDraft} onChange={(e) => setAssistDraft(e.target.value)} rows={5} />
        <MessageAssistant
          className="mt-4"
          compact
          value={assistDraft}
          onChange={setAssistDraft}
          notes={assistNotes}
          onNotesChange={setAssistNotes}
          context={{
            recipientName: first,
            senderName: business.senderName,
            companyName: business.name,
            interests: customer?.interests ?? [],
            relationship: "customer",
            voice: business.voice,
            business: true,
          }}
        />
      </Drawer>
    </article>
  );
}

function GiftLine({ send, first, onApprove, onRemove }: { send: Send; first: string; onApprove: () => { ok: boolean; reason?: string }; onRemove: () => void }) {
  const updateSend = useDemo((s) => s.updateSend);
  const toast = useToast();
  const g = send.gift!;
  const gift = GIFT_MAP[g.giftId];
  if (!gift) return null;
  const actionable = g.status === "pending-approval" || g.status === "held-budget";
  return (
    <div className={clsx("rounded-2xl p-3 ring-1 ring-inset", g.status === "held-budget" ? "bg-coral-soft/50 ring-coral/40" : "bg-paper ring-line")}>
      <div className="flex flex-wrap items-center gap-3">
        <GiftArt gift={gift} amount={gift.amounts ? g.amount : undefined} className="!w-16 shrink-0 !rounded-xl" />
        <div className="min-w-0 flex-1">
          <p className="text-[14px] font-semibold">
            {g.status === "declined" ? <span className="text-ink-3 line-through">{gift.name}</span> : gift.name}
          </p>
          <p className="text-[12.5px] text-ink-3">
            {money(g.amount)}
            {g.shipping ? ` + ${money(g.shipping)} shipping` : " · no shipping"} · billed separately from your plan
          </p>
        </div>
        <GiftBadge status={g.status} />
      </div>
      {g.status === "held-budget" && (
        <p className="mt-2 text-[13px] text-coral-deep">{g.note ?? "This gift would go over this month's gift budget, so it's held for review."}
          {g.note && /scheduled/i.test(g.note) ? "" : " The card is still scheduled."}</p>
      )}
      {actionable && (
        <div className="mt-3 flex flex-wrap gap-2">
          <Button
            size="sm"
            variant="soft"
            icon={<Check className="size-3.5" />}
            onClick={() => {
              const r = onApprove();
              if (r.ok) toast({ title: `Gift approved for ${first}`, body: `${gift.name}, ${money(g.amount + g.shipping)}.`, tone: "success" });
              else toast({ title: "Gift held for review", body: r.reason, tone: "warn" });
            }}
          >
            Approve gift
          </Button>
          <Button
            size="sm"
            variant="ghost"
            icon={<X className="size-3.5" />}
            onClick={() => {
              onRemove();
              toast({ title: `Gift removed for ${first}`, body: "They'll receive the card only." });
            }}
          >
            Remove gift
          </Button>
        </div>
      )}
      {g.status === "declined" && (
        <button
          type="button"
          className="mt-2 text-[13px] font-semibold text-cobalt hover:underline"
          onClick={() => updateSend(send.id, { gift: { ...g, status: "pending-approval" } }, "Gift added back for approval")}
        >
          Add the gift back
        </button>
      )}
    </div>
  );
}

function AllClear({ scheduledCount, showScheduled, includeScheduled }: { scheduledCount: number; showScheduled: () => void; includeScheduled: boolean }) {
  const reduce = useReducedMotion();
  const colors = ["#2446d8", "#ff6b57", "#ffd45c", "#6fd8b1", "#bba6f6"];
  return (
    <Panel className="relative mt-2 overflow-hidden py-14 text-center">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        {Array.from({ length: 18 }).map((_, i) => (
          <motion.span
            key={i}
            className="absolute block rounded-sm"
            style={{ left: `${(i * 53) % 100}%`, top: -12, width: 8 + (i % 3) * 3, height: 5 + (i % 2) * 6, background: colors[i % colors.length] }}
            initial={{ y: reduce ? 40 + ((i * 37) % 120) : -20, rotate: 0, opacity: reduce ? 0.7 : 0 }}
            animate={reduce ? {} : { y: 120 + ((i * 41) % 220), rotate: 180 + i * 20, opacity: [0, 1, 1, 0.8] }}
            transition={{ duration: 1.6 + (i % 5) * 0.2, delay: (i % 6) * 0.08, ease: "easeOut" }}
          />
        ))}
      </div>
      <div className="relative">
        <span className="mx-auto grid size-14 place-items-center rounded-full bg-mint text-ink">
          <CheckCheck className="size-7" aria-hidden />
        </span>
        <h2 className="mt-4 font-display text-3xl font-semibold tracking-tight">Every card is reviewed.</h2>
        <p className="mx-auto mt-2 max-w-md text-ink-2">
          {scheduledCount
            ? `${numberWord(scheduledCount)} ${plural(scheduledCount, "card is", "cards are")} scheduled over the next 30 days. We'll bring new ones here about a week before each birthday.`
            : "Nothing is waiting on you. New cards show up here about a week before each birthday."}
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <ButtonLink href="/app" variant="ink" iconRight={<ArrowRight className="size-4" />}>
            Back to overview
          </ButtonLink>
          {!includeScheduled && scheduledCount > 0 && (
            <Button variant="outline" onClick={showScheduled}>
              Review scheduled cards
            </Button>
          )}
        </div>
      </div>
    </Panel>
  );
}
