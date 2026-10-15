"use client";

import { clsx } from "clsx";
import type { AutomationRule } from "@/lib/types";
import { useDemo } from "@/lib/store";
import { allTags } from "@/lib/selectors";
import { GIFTS, GIFT_MAP } from "@/data/gifts";
import { getPlan, money } from "@/config/brand";
import { TIMEZONES } from "@/lib/dates";
import { Input, Select, Field, inputClass } from "@/components/ui/field";
import { ChoiceCard, Segmented, Toggle } from "@/components/ui/controls";
import { CardPicker } from "./automations-card-picker";
import { TemplateEditor, UpgradeHint } from "./automations-shared";

function Section({ n, title, children, hint }: { n: number; title: string; children: React.ReactNode; hint?: string }) {
  return (
    <fieldset className="min-w-0 border-t border-line pt-5 first:border-t-0 first:pt-0">
      <legend className="flex items-center gap-2.5 text-[15px] font-semibold text-ink">
        <span className="grid size-6 place-items-center rounded-full bg-ink text-[11px] font-bold text-paper">{n}</span>
        {title}
      </legend>
      {hint && <p className="mt-1 pl-[34px] text-[13px] text-ink-3">{hint}</p>}
      <div className="mt-4 flex flex-col gap-4">{children}</div>
    </fieldset>
  );
}

export function RuleEditor({ draft, patch }: { draft: AutomationRule; patch: (p: Partial<AutomationRule>) => void }) {
  const customers = useDemo((s) => s.customers);
  const business = useDemo((s) => s.business);
  const planId = useDemo((s) => s.planId);
  const plan = getPlan(planId);
  const tags = allTags(customers);
  const gift = draft.giftId ? GIFT_MAP[draft.giftId] : null;

  const sampleCustomer =
    customers.find((c) => draft.segment.type === "all" || c.tags.some((t) => draft.segment.type === "tag" && t.toLowerCase() === draft.segment.tag.toLowerCase())) ??
    customers[0];
  const sample = { firstName: sampleCustomer?.firstName ?? "Rosa", companyName: business.name, senderName: business.senderName };

  const setGiftId = (id: string) => {
    const g = GIFT_MAP[id];
    patch({ giftId: id, giftAmount: g?.amounts ? (g.amounts.includes(draft.giftAmount) ? draft.giftAmount : g.amounts[1] ?? g.amounts[0]) : g?.price ?? 0 });
  };

  return (
    <div className="flex flex-col gap-6">
      <Section n={1} title="Who it's for">
        <Input label="Rule name" value={draft.name} onChange={(e) => patch({ name: e.target.value })} />
        <div className="flex flex-col gap-2">
          <p className="text-[13px] font-semibold text-ink-2">Customers</p>
          <Segmented
            ariaLabel="Segment"
            value={draft.segment.type}
            onChange={(v) => patch({ segment: v === "all" ? { type: "all" } : { type: "tag", tag: tags.find((t) => t === "VIP") ?? tags[0] ?? "VIP" } })}
            options={[
              { value: "all", label: "All customers" },
              { value: "tag", label: "Customers with a tag" },
            ]}
          />
          {draft.segment.type === "tag" && (
            <Select aria-label="Tag" value={draft.segment.tag} onChange={(e) => patch({ segment: { type: "tag", tag: e.target.value } })} className="max-w-xs">
              {tags.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </Select>
          )}
          {draft.segment.type === "tag" && !plan.limits.segments && (
            <UpgradeHint>Customer segments are part of Growth and Scale. You can explore them here on the {plan.name} plan.</UpgradeHint>
          )}
          <p className="text-[13px] text-ink-3">When a customer matches a tag rule, that rule wins over the all-customers rule.</p>
        </div>
      </Section>

      <Section n={2} title="Card" hint="Catalog cards are ready to use. Original designs from Card Studio need a one-time approval.">
        <CardPicker value={draft.cardId} onChange={(id) => patch({ cardId: id })} />
      </Section>

      <Section n={3} title="Message">
        <TemplateEditor id={`tpl-${draft.id}`} value={draft.messageTemplate} onChange={(v) => patch({ messageTemplate: v })} sample={sample} />
        <Toggle
          checked={draft.aiPersonalize}
          onChange={(v) => patch({ aiPersonalize: v })}
          label="AI personalization"
          description="Suggest a personal line from each customer's notes and interests, in your brand voice. Customers without notes get this template."
        />
      </Section>

      <Section n={4} title="When it sends">
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Send time" type="time" value={draft.sendTime} onChange={(e) => patch({ sendTime: e.target.value || "09:00" })} />
          <Select label="Time zone" value={draft.timezone} onChange={(e) => patch({ timezone: e.target.value })}>
            {TIMEZONES.map((t) => (
              <option key={t.id} value={t.id}>
                {t.label}
              </option>
            ))}
          </Select>
        </div>
      </Section>

      <Section n={5} title="Gift" hint="Cards are complete on their own. Gifts are optional and billed separately from your plan.">
        <Segmented
          ariaLabel="Gift"
          value={draft.giftMode}
          onChange={(v) =>
            patch(
              v === "card-only"
                ? { giftMode: "card-only" }
                : { giftMode: "gift", giftId: draft.giftId ?? "coffee-card", giftAmount: draft.giftAmount || 15, monthlyGiftBudget: draft.monthlyGiftBudget || 100 },
            )
          }
          options={[
            { value: "card-only", label: "Card only" },
            { value: "gift", label: "Include a gift" },
          ]}
        />
        {draft.giftMode === "gift" && (
          <div className="grid gap-4 rounded-2xl bg-cream/60 p-4 ring-1 ring-line sm:grid-cols-2">
            <Select label="Gift" value={draft.giftId ?? ""} onChange={(e) => setGiftId(e.target.value)}>
              {GIFTS.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name} {g.kind === "physical" ? "(ships)" : "(digital)"}
                </option>
              ))}
            </Select>
            {gift?.amounts ? (
              <Select label="Amount" value={String(draft.giftAmount)} onChange={(e) => patch({ giftAmount: Number(e.target.value) })}>
                {gift.amounts.map((a) => (
                  <option key={a} value={a}>
                    {money(a)}
                  </option>
                ))}
              </Select>
            ) : (
              <Field label="Price">
                <p className={clsx(inputClass, "bg-cream/40")}>
                  {money(gift?.price ?? 0)} + {money(gift?.shipping ?? 0, { cents: true })} shipping
                </p>
              </Field>
            )}
            <Select
              label="Only for customers tagged"
              value={draft.giftSegmentTag ?? ""}
              onChange={(e) => patch({ giftSegmentTag: e.target.value || null })}
              hint="Everyone else in this rule gets the card only."
            >
              <option value="">Everyone in this rule</option>
              {tags.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </Select>
            <Input
              label="Monthly gift budget"
              type="number"
              min={0}
              step={5}
              inputMode="numeric"
              value={String(draft.monthlyGiftBudget)}
              onChange={(e) => patch({ monthlyGiftBudget: Math.max(0, Number(e.target.value) || 0) })}
              hint="Includes shipping. Over budget, gifts wait for review; cards still send."
            />
            {!plan.limits.giftBudgetControls && (
              <UpgradeHint className="sm:col-span-2">Gift budget controls are part of Growth and Scale. Try them here on the {plan.name} plan.</UpgradeHint>
            )}
          </div>
        )}
      </Section>

      <Section n={6} title="Approval">
        <div className="grid gap-3 sm:grid-cols-2">
          <ChoiceCard selected={draft.approval === "review"} onClick={() => patch({ approval: "review" })}>
            <p className="pr-6 font-semibold">Review before sending</p>
            <p className="mt-1 text-[13px] text-ink-3">Cards and gifts are prepared a week ahead and wait for your OK.</p>
          </ChoiceCard>
          <ChoiceCard selected={draft.approval === "auto"} onClick={() => patch({ approval: "auto" })}>
            <p className="pr-6 font-semibold">Send automatically</p>
            <p className="mt-1 text-[13px] text-ink-3">Cards go out on the day. Gifts still respect the monthly budget.</p>
          </ChoiceCard>
        </div>
      </Section>

      <Section n={7} title="Special cases">
        <Toggle
          checked={draft.avoidRepeat}
          onChange={(v) => patch({ avoidRepeat: v })}
          label="Avoid repeating last year's card"
          description="If a customer received this design last year, a fresh one from your approved cards is used instead."
        />
        <div className="flex flex-col gap-2">
          <p className="text-[13px] font-semibold text-ink-2">February 29 birthdays</p>
          <Segmented
            ariaLabel="February 29 rule"
            value={draft.feb29}
            onChange={(v) => patch({ feb29: v })}
            options={[
              { value: "feb28", label: "Celebrate Feb 28" },
              { value: "mar1", label: "Celebrate Mar 1" },
            ]}
          />
          <p className="text-[13px] text-ink-3">
            In non-leap years, Feb 29 birthdays are celebrated on {draft.feb29 === "feb28" ? "Feb 28" : "Mar 1"}. In leap years they’re celebrated on Feb 29.
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <p className="text-[13px] font-semibold text-ink-2">Customers added after their birthday</p>
          <Segmented
            ariaLabel="Late additions"
            value={draft.lateAdd}
            onChange={(v) => patch({ lateAdd: v })}
            options={[
              { value: "skip", label: "Wait until next year" },
              { value: "belated", label: "Send a belated card" },
            ]}
          />
          <p className="text-[13px] text-ink-3">
            {draft.lateAdd === "skip"
              ? "If a birthday already passed this year when someone is added, their first card goes out next year."
              : "If a birthday passed within the last 30 days, a “happy belated birthday” card goes out the next morning."}
          </p>
        </div>
      </Section>
    </div>
  );
}
