"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { clsx } from "clsx";
import { Plus, Trash2 } from "lucide-react";
import type { AutomationRule } from "@/lib/types";
import { useDemo } from "@/lib/store";
import { allTags } from "@/lib/selectors";
import { getCard } from "@/lib/cards";
import { getPlan } from "@/config/brand";
import { AppPage, PageHeader, Panel } from "@/components/app/app-shell";
import { Badge } from "@/components/ui/badges";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/overlay";
import { useToast } from "@/components/ui/toast";
import { CardFront } from "@/components/cards/card-art";
import { RuleEditor } from "./automations-editor";
import { NextRecipients } from "./automations-recipients";
import { EdgeCases } from "./automations-edge";
import { Eyebrow, ruleSummary, UpgradeHint } from "./automations-shared";
import { needsApproval } from "./automations-card-picker";
import { GiftBudgetMeter, GiftDecisionRow } from "./giftsws-budget";

export function AutomationsPage() {
  const automations = useDemo((s) => s.automations);
  const savedCards = useDemo((s) => s.savedCards);
  const business = useDemo((s) => s.business);
  const customers = useDemo((s) => s.customers);
  const sends = useDemo((s) => s.sends);
  const planId = useDemo((s) => s.planId);
  const updateAutomation = useDemo((s) => s.updateAutomation);
  const addAutomation = useDemo((s) => s.addAutomation);
  const deleteAutomation = useDemo((s) => s.deleteAutomation);
  const toast = useToast();
  const plan = getPlan(planId);
  const params = useSearchParams();
  const cardParam = params.get("card");

  const [selectedId, setSelectedId] = useState<string>(automations[0]?.id ?? "");
  const saved = automations.find((a) => a.id === selectedId) ?? automations[0];
  const [draft, setDraft] = useState<AutomationRule | null>(() => (saved ? { ...saved, cardId: cardParam ?? saved.cardId } : null));
  const [fromLibrary] = useState(() => !!cardParam && !!saved && cardParam !== saved.cardId);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const current = draft && draft.id === saved?.id ? draft : saved ? { ...saved } : null;
  const dirty = !!current && !!saved && JSON.stringify(current) !== JSON.stringify(saved);
  const draftCard = current ? getCard(current.cardId, savedCards) : null;
  const blocked = !!draftCard && needsApproval(draftCard);

  const patch = (p: Partial<AutomationRule>) => setDraft((d) => ({ ...(d && d.id === saved?.id ? d : saved), ...p }) as AutomationRule);
  /** Applies a change immediately (used by quick controls) and keeps the draft in sync. */
  const patchSaved = (id: string, p: Partial<AutomationRule>) => {
    updateAutomation(id, p);
    setDraft((d) => (d && d.id === id ? { ...d, ...p } : d));
  };

  const select = (id: string) => {
    if (id === selectedId) return;
    const r = automations.find((a) => a.id === id);
    if (dirty) toast({ title: "Unsaved changes discarded", body: `Your edits to “${saved?.name}” weren't saved.`, tone: "warn" });
    setSelectedId(id);
    setDraft(r ? { ...r } : null);
    document.getElementById("rule-editor")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const save = () => {
    if (!current || blocked) return;
    const { id, ...rest } = current;
    updateAutomation(id, rest);
    toast({ title: "Rule saved", body: ruleSummary(current, savedCards)[0], tone: "success" });
  };

  const newRule = () => {
    const tags = allTags(customers);
    const used = new Set(automations.flatMap((a) => (a.segment.type === "tag" ? [a.segment.tag] : [])));
    const tag = tags.find((t) => !used.has(t)) ?? tags[0] ?? "VIP";
    const id = addAutomation({
      name: `${tag} birthdays`,
      active: false,
      segment: { type: "tag", tag },
      cardId: business.defaultCardId,
      messageTemplate: business.defaultMessage,
      sendTime: "09:00",
      timezone: business.timezone,
      giftMode: "card-only",
      giftId: null,
      giftAmount: 0,
      giftSegmentTag: null,
      monthlyGiftBudget: 0,
      approval: "review",
      avoidRepeat: true,
      feb29: "feb28",
      lateAdd: "skip",
      aiPersonalize: true,
    });
    const r = useDemo.getState().automations.find((a) => a.id === id);
    setSelectedId(id);
    setDraft(r ? { ...r } : null);
    toast({ title: "New rule created", body: "It starts paused. Set it up, save, then switch it on." });
    setTimeout(() => document.getElementById("rule-editor")?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
  };

  const remove = () => {
    if (!saved) return;
    const name = saved.name;
    const next = automations.find((a) => a.id !== saved.id);
    deleteAutomation(saved.id);
    setConfirmDelete(false);
    setSelectedId(next?.id ?? "");
    setDraft(next ? { ...next } : null);
    toast({ title: "Rule deleted", body: `“${name}” won't send anything. Already scheduled cards stay in Activity.` });
  };

  const heldSends = sends.filter((s) => s.gift?.status === "held-budget");
  const jamal = sends.find((s) => s.id === "s-jamal");
  const budgetExamples = heldSends.length ? heldSends : jamal ? [jamal] : [];

  return (
    <AppPage>
      <PageHeader
        eyebrow="Automations"
        title="Birthday automation"
        description="Rules decide who gets a card, which design and message, and whether a gift comes along. Change anything; every customer stays covered."
        actions={
          <Button variant="outline" icon={<Plus className="size-4" />} onClick={newRule}>
            New rule
          </Button>
        }
      />

      {!plan.limits.multipleRules && automations.length > 1 && (
        <UpgradeHint className="mt-5">Multiple rules are part of Growth and Scale. You’re on {plan.name}; feel free to explore.</UpgradeHint>
      )}

      {/* Rules list */}
      <div className="mt-6 grid gap-3 md:grid-cols-2">
        {automations.map((r) => {
          const card = getCard(r.cardId, savedCards);
          const sel = r.id === saved?.id;
          return (
            <div
              key={r.id}
              className={clsx(
                "flex gap-4 rounded-3xl bg-white p-4 ring-1 transition sm:p-5",
                sel ? "ring-2 ring-ink shadow-soft" : "ring-line",
                !r.active && "bg-white/60",
              )}
            >
              <div className={clsx("w-14 shrink-0 sm:w-16", !r.active && "opacity-50 grayscale")}>
                <CardFront card={card} shadow={false} className="ring-1 ring-line" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="truncate font-semibold">{r.name}</h2>
                    <div className="mt-1 flex flex-wrap gap-1.5">
                      <Badge tone={r.active ? "mint" : "neutral"} dot>
                        {r.active ? "Active" : "Paused"}
                      </Badge>
                      <Badge tone={r.giftMode === "gift" ? "coral" : "neutral"}>{r.giftMode === "gift" ? "Card + gift" : "Card only"}</Badge>
                      {r.approval === "review" && <Badge tone="butter">Review first</Badge>}
                    </div>
                  </div>
                  <RuleSwitch
                    checked={r.active}
                    onChange={(v) => {
                      patchSaved(r.id, { active: v });
                      toast({
                        title: v ? `“${r.name}” resumed` : `“${r.name}” paused`,
                        body: v ? "Upcoming birthdays will be prepared again." : "Nothing new is prepared or sent while paused. Already approved cards stay scheduled.",
                        tone: v ? "success" : "warn",
                      });
                    }}
                    label={r.active ? `Pause ${r.name}` : `Resume ${r.name}`}
                  />
                </div>
                <p className="mt-2 line-clamp-3 text-[13px] leading-relaxed text-ink-2">{ruleSummary(r, savedCards).slice(0, 2).join(" ")}</p>
                <button
                  type="button"
                  onClick={() => select(r.id)}
                  className={clsx("mt-2 text-[13px] font-semibold underline-offset-2 hover:underline", sel ? "text-ink-3" : "text-cobalt")}
                  aria-pressed={sel}
                >
                  {sel ? "Editing below" : "Edit rule"}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Editor */}
      {current && (
        <section id="rule-editor" className="mt-8 scroll-mt-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
            <Panel>
              <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <Eyebrow>Rule editor</Eyebrow>
                  <h2 className="font-display text-2xl font-semibold tracking-tight">{current.name || "Untitled rule"}</h2>
                </div>
                {automations.length > 1 && (
                  <Button size="sm" variant="danger" icon={<Trash2 className="size-3.5" />} onClick={() => setConfirmDelete(true)}>
                    Delete rule
                  </Button>
                )}
              </div>
              {fromLibrary && current.cardId === cardParam && dirty && (
                <p className="mb-5 rounded-2xl bg-cobalt-soft px-3.5 py-2.5 text-[13px] text-cobalt-deep">
                  “{getCard(cardParam, savedCards).name}” was picked from your card library. Save the rule to start using it.
                </p>
              )}
              <RuleEditor draft={current} patch={patch} />
            </Panel>

            <div className="lg:sticky lg:top-6 lg:self-start">
              <Panel className="flex flex-col gap-4">
                <div>
                  <Eyebrow>In plain language</Eyebrow>
                  <p className="mt-2 text-[15px] leading-relaxed text-ink">{ruleSummary(current, savedCards).join(" ")}</p>
                </div>
                {draftCard && (
                  <div className="mx-auto w-40">
                    <CardFront card={draftCard} brandMark={{ name: business.name, color: business.brandColor, logo: business.logoDataUrl }} />
                  </div>
                )}
                <div className="flex flex-col gap-2 border-t border-line pt-4">
                  {blocked && <p className="text-[13px] text-butter-deep">Approve the selected original design before saving.</p>}
                  <Button onClick={save} disabled={!dirty || blocked}>
                    {dirty ? "Save changes" : "All changes saved"}
                  </Button>
                  {dirty && (
                    <Button variant="ghost" onClick={() => setDraft(saved ? { ...saved } : null)}>
                      Discard changes
                    </Button>
                  )}
                  {!current.active && <p className="text-center text-[12px] text-ink-3">This rule is paused. Switch it on above when ready.</p>}
                </div>
              </Panel>
            </div>
          </div>
        </section>
      )}

      {/* Next recipients */}
      {saved && (
        <Panel className="mt-8">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
            <div>
              <Eyebrow>Preview next recipients</Eyebrow>
              <h2 className="font-display text-2xl font-semibold tracking-tight">Next 30 days for “{saved.name}”</h2>
              <p className="mt-1 text-[13px] text-ink-3">Based on saved settings. Skip one birthday or edit a single upcoming card without changing the rule.</p>
            </div>
            {!saved.active && <Badge tone="butter">Paused: nothing below will be prepared or sent</Badge>}
          </div>
          <NextRecipients rule={saved} />
        </Panel>
      )}

      {/* Gift budget */}
      <Panel className="mt-8">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <div>
            <Eyebrow>Gift budget</Eyebrow>
            <h2 className="mb-4 font-display text-2xl font-semibold tracking-tight">This month’s gift spending</h2>
            <GiftBudgetMeter />
            {!plan.limits.giftBudgetControls && <UpgradeHint className="mt-3">Gift budget controls are part of Growth and Scale.</UpgradeHint>}
          </div>
          <div>
            <p className="mb-2 text-[13px] font-semibold text-ink-2">Live example: a gift held by the budget</p>
            {budgetExamples.length ? (
              <div className="flex flex-col gap-3">
                {budgetExamples.map((s) => (
                  <GiftDecisionRow key={s.id} send={s} />
                ))}
              </div>
            ) : (
              <p className="rounded-2xl bg-cream/60 p-4 text-sm text-ink-2 ring-1 ring-line">No gifts are held right now.</p>
            )}
            <p className="mt-3 text-[13px] text-ink-3">The card for a held gift stays scheduled either way. Removing the gift sends the card on its own.</p>
          </div>
        </div>
      </Panel>

      {/* Edge cases */}
      {saved && (
        <section className="mt-8">
          <Eyebrow>Edge cases</Eyebrow>
          <h2 className="mb-1 font-display text-2xl font-semibold tracking-tight">How tricky birthdays are handled</h2>
          <p className="mb-4 text-[13px] text-ink-3">These controls change “{saved.name}” right away.</p>
          <EdgeCases rule={saved} patchSaved={(p) => patchSaved(saved.id, p)} />
        </section>
      )}

      <Modal
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        title="Delete this rule?"
        footer={
          <>
            <Button variant="outline" onClick={() => setConfirmDelete(false)}>
              Cancel
            </Button>
            <Button variant="ink" onClick={remove}>
              Delete rule
            </Button>
          </>
        }
      >
        <p className="text-ink-2">
          “{saved?.name}” will stop preparing cards. Customers it covered fall back to your other rules. Cards already scheduled stay in Activity.
        </p>
      </Modal>
    </AppPage>
  );
}

function RuleSwitch({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      title={label}
      onClick={() => onChange(!checked)}
      className="flex shrink-0 items-center gap-2 rounded-full py-1 pl-2.5 pr-1 text-[12px] font-semibold text-ink-2 ring-1 ring-line transition hover:ring-ink/30"
    >
      {checked ? "On" : "Paused"}
      <span className={clsx("relative h-5 w-9 rounded-full transition-colors", checked ? "bg-mint-deep" : "bg-ink/20")}>
        <span className={clsx("absolute top-0.5 size-4 rounded-full bg-white shadow transition-[left]", checked ? "left-[18px]" : "left-0.5")} />
      </span>
    </button>
  );
}
