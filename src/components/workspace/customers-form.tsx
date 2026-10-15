"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, Plus } from "lucide-react";
import { useDemo } from "@/lib/store";
import type { Customer } from "@/lib/types";
import { allTags } from "@/lib/selectors";
import { daysInMonth, isValidBirthday, MONTHS } from "@/lib/dates";
import { allCards } from "@/lib/cards";
import { CARD_MAP } from "@/data/cards";
import { INTEREST_SUGGESTIONS } from "@/lib/ai/studio";
import { Drawer } from "@/components/ui/overlay";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea, inputClass } from "@/components/ui/field";
import { Chip } from "@/components/ui/controls";
import { useToast } from "@/components/ui/toast";
import { EMAIL_RE, GIFT_PREFS, findDuplicate, fullName, type CustomerInput } from "./customers-utils";

const EMPTY: CustomerInput = {
  firstName: "",
  lastName: "",
  email: "",
  birthMonth: null,
  birthDay: null,
  birthYear: null,
  company: "",
  tags: [],
  notes: "",
  interests: [],
  cardPreference: null,
  giftPreference: "gift-ok",
};

/** Add / edit customer drawer. Remount (via `key`) to reset between customers. */
export function CustomerFormDrawer({
  open,
  onClose,
  customer,
  onSaved,
  onOpenCustomer,
}: {
  open: boolean;
  onClose: () => void;
  customer: Customer | null;
  onSaved?: (id: string) => void;
  onOpenCustomer: (id: string) => void;
}) {
  const customers = useDemo((s) => s.customers);
  const savedCards = useDemo((s) => s.savedCards);
  const addCustomer = useDemo((s) => s.addCustomer);
  const updateCustomer = useDemo((s) => s.updateCustomer);
  const toast = useToast();

  const [f, setF] = useState<CustomerInput>(() => (customer ? { ...EMPTY, ...customer } : EMPTY));
  const [yearText, setYearText] = useState(customer?.birthYear ? String(customer.birthYear) : "");
  const [tagText, setTagText] = useState("");
  const [interestText, setInterestText] = useState("");
  const [tried, setTried] = useState(false);
  const set = <K extends keyof CustomerInput>(k: K, v: CustomerInput[K]) => setF((x) => ({ ...x, [k]: v }));

  const tagOptions = allTags(customers).filter((t) => !f.tags.includes(t));
  const cards = allCards(savedCards).filter((c) => CARD_MAP[c.id] || c.approvedForAutomation);

  const dup = useMemo(() => (f.firstName || f.email ? findDuplicate(customers, f, customer?.id) : null), [customers, f, customer?.id]);

  const errors: Partial<Record<"firstName" | "email" | "birthday" | "year", string>> = {};
  if (!f.firstName.trim()) errors.firstName = "Add a first name.";
  if (f.email && !EMAIL_RE.test(f.email.trim())) errors.email = "This email doesn't look right. Check for typos.";
  if ((f.birthMonth && !f.birthDay) || (!f.birthMonth && f.birthDay)) errors.birthday = "Choose both a month and a day, or leave both empty.";
  else if (f.birthMonth && f.birthDay && !isValidBirthday(f.birthMonth, f.birthDay))
    errors.birthday = `${MONTHS[f.birthMonth - 1]} ${f.birthDay} isn't a real date. ${MONTHS[f.birthMonth - 1]} has ${daysInMonth(f.birthMonth, 2024)} days.`;
  if (yearText && !/^\d{4}$/.test(yearText)) errors.year = "Use four digits, e.g. 1984.";
  else if (yearText && (+yearText < 1900 || +yearText > new Date().getFullYear())) errors.year = "That year looks out of range.";

  const warnings: string[] = [];
  if (!f.email.trim()) warnings.push("No email yet. You can save, but cards can't be delivered until one is added.");
  if (!f.birthMonth && !f.birthDay) warnings.push("No birthday yet. You can save, and we'll flag them under Needs details.");

  const valid = Object.keys(errors).length === 0;

  function addTag(raw: string) {
    const t = raw.trim().replace(/,$/, "");
    if (t && !f.tags.some((x) => x.toLowerCase() === t.toLowerCase())) set("tags", [...f.tags, t]);
    setTagText("");
  }
  function toggleInterest(raw: string) {
    const i = raw.trim().toLowerCase();
    if (!i) return;
    set("interests", f.interests.includes(i) ? f.interests.filter((x) => x !== i) : [...f.interests, i]);
  }

  function save() {
    setTried(true);
    if (!valid) return;
    const data: CustomerInput = {
      ...f,
      firstName: f.firstName.trim(),
      lastName: f.lastName.trim(),
      email: f.email.trim(),
      company: f.company.trim(),
      birthYear: yearText ? +yearText : null,
      tags: tagText.trim() ? [...f.tags, tagText.trim()] : f.tags,
    };
    if (customer) {
      updateCustomer(customer.id, data);
      toast({ title: `${fullName(data)} updated`, tone: "success" });
      onSaved?.(customer.id);
    } else {
      const id = addCustomer(data);
      toast({ title: `${fullName(data)} added`, body: data.birthMonth ? "Their birthday is now covered by your automations." : "Add a birthday when you have it.", tone: "success" });
      onSaved?.(id);
    }
    onClose();
  }

  const days = Array.from({ length: 31 }, (_, i) => i + 1);

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={customer ? `Edit ${customer.firstName}` : "Add a customer"}
      description="Only a first name is required. Birth year is always optional."
      footer={
        <div className="flex items-center justify-between gap-2">
          <p className="text-[12.5px] text-ink-3">{tried && !valid ? "Fix the highlighted fields to save." : ""}</p>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={save}>{customer ? "Save changes" : "Add customer"}</Button>
          </div>
        </div>
      }
    >
      <form
        className="flex flex-col gap-5"
        onSubmit={(e) => {
          e.preventDefault();
          save();
        }}
      >
        {dup && (
          <div className="flex gap-3 rounded-2xl bg-butter-soft p-3.5 text-[14px] ring-1 ring-inset ring-butter/60" role="status">
            <AlertTriangle className="mt-0.5 size-4 shrink-0 text-butter-deep" aria-hidden />
            <div>
              <p className="font-semibold">Possible duplicate</p>
              <p className="text-ink-2">
                {fullName(dup)} ({dup.email || "no email"}) already has the same {dup.email && dup.email.toLowerCase() === f.email.trim().toLowerCase() ? "email" : "name"}.{" "}
                <button
                  type="button"
                  className="font-semibold text-cobalt hover:underline"
                  onClick={() => {
                    onClose();
                    onOpenCustomer(dup.id);
                  }}
                >
                  Open existing customer
                </button>
              </p>
            </div>
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="First name" value={f.firstName} onChange={(e) => set("firstName", e.target.value)} error={tried ? errors.firstName : null} autoComplete="off" />
          <Input label="Last name" value={f.lastName} onChange={(e) => set("lastName", e.target.value)} autoComplete="off" />
        </div>
        <Input
          label="Email"
          type="email"
          value={f.email}
          onChange={(e) => set("email", e.target.value)}
          error={errors.email ?? null}
          hint={!f.email ? "Needed to deliver cards." : undefined}
          autoComplete="off"
        />

        <fieldset>
          <legend className="text-[13px] font-semibold text-ink-2">Birthday</legend>
          <div className="mt-1.5 grid grid-cols-[1.4fr_1fr_1fr] gap-2">
            <Select aria-label="Birth month" value={f.birthMonth ?? ""} onChange={(e) => set("birthMonth", e.target.value ? +e.target.value : null)} error={errors.birthday ? " " : null}>
              <option value="">Month</option>
              {MONTHS.map((m, i) => (
                <option key={m} value={i + 1}>
                  {m}
                </option>
              ))}
            </Select>
            <Select aria-label="Birth day" value={f.birthDay ?? ""} onChange={(e) => set("birthDay", e.target.value ? +e.target.value : null)} error={errors.birthday ? " " : null}>
              <option value="">Day</option>
              {days.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </Select>
            <input
              aria-label="Birth year (optional)"
              inputMode="numeric"
              placeholder="Year (optional)"
              value={yearText}
              onChange={(e) => setYearText(e.target.value.replace(/[^\d]/g, "").slice(0, 4))}
              aria-invalid={!!errors.year || undefined}
              className={inputClass}
            />
          </div>
          {errors.birthday || errors.year ? (
            <p className="mt-1.5 text-[13px] font-medium text-coral-deep" role="alert">
              {errors.birthday ?? errors.year}
            </p>
          ) : (
            <p className="mt-1.5 text-[13px] text-ink-3">
              {f.birthMonth === 2 && f.birthDay === 29
                ? "Leap-day birthday. In other years the card follows your Feb 29 setting in Automations."
                : "We never need the birth year. It's only used if you choose to mention milestones."}
            </p>
          )}
        </fieldset>

        <Input label="Company" optional value={f.company} onChange={(e) => set("company", e.target.value)} />

        <Field label="Tags" hint="Press Enter or comma to add. Tags decide which automation applies.">
          <div className="flex flex-wrap items-center gap-1.5 rounded-xl bg-white p-2 ring-1 ring-inset ring-line-2 focus-within:ring-2 focus-within:ring-cobalt">
            {f.tags.map((t) => (
              <Chip key={t} tone="cobalt" onRemove={() => set("tags", f.tags.filter((x) => x !== t))}>
                {t}
              </Chip>
            ))}
            <input
              aria-label="Add a tag"
              value={tagText}
              onChange={(e) => {
                const v = e.target.value;
                if (v.endsWith(",")) addTag(v);
                else setTagText(v);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addTag(tagText);
                } else if (e.key === "Backspace" && !tagText && f.tags.length) set("tags", f.tags.slice(0, -1));
              }}
              placeholder={f.tags.length ? "" : "e.g. VIP, Past client"}
              className="min-w-24 flex-1 bg-transparent px-1.5 py-1 text-[15px] outline-none"
            />
          </div>
          {tagOptions.length > 0 && (
            <div className="mt-1 flex flex-wrap gap-1.5">
              {tagOptions.slice(0, 8).map((t) => (
                <button key={t} type="button" onClick={() => addTag(t)} className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[12px] font-semibold text-ink-3 ring-1 ring-inset ring-line hover:text-ink">
                  <Plus className="size-3" aria-hidden /> {t}
                </button>
              ))}
            </div>
          )}
        </Field>

        <Textarea
          label="Relationship notes"
          optional
          value={f.notes}
          onChange={(e) => set("notes", e.target.value)}
          placeholder="e.g. Longtime client, loves hiking, helped us launch our business."
          hint="Personalized suggestions only use what you write here and in interests."
          rows={3}
        />

        <Field label="Interests" optional>
          <div className="flex flex-wrap gap-1.5">
            {[...new Set([...INTEREST_SUGGESTIONS.map((i) => i.toLowerCase()), ...f.interests])].map((i) => (
              <Chip key={i} tone="lilac" active={f.interests.includes(i)} onClick={() => toggleInterest(i)}>
                {i.charAt(0).toUpperCase() + i.slice(1)}
              </Chip>
            ))}
          </div>
          <div className="mt-1 flex gap-2">
            <input
              aria-label="Add another interest"
              value={interestText}
              onChange={(e) => setInterestText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  toggleInterest(interestText);
                  setInterestText("");
                }
              }}
              placeholder="Add another interest"
              className={inputClass}
            />
            <Button
              variant="outline"
              onClick={() => {
                toggleInterest(interestText);
                setInterestText("");
              }}
              disabled={!interestText.trim()}
            >
              Add
            </Button>
          </div>
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Select label="Card preference" value={f.cardPreference ?? ""} onChange={(e) => set("cardPreference", e.target.value || null)} hint="Overrides the rule's card for this customer.">
            <option value="">Use the automation&apos;s card</option>
            {cards.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
          <Select label="Gift preference" value={f.giftPreference} onChange={(e) => set("giftPreference", e.target.value as Customer["giftPreference"])} hint={GIFT_PREFS.find((g) => g.value === f.giftPreference)?.hint}>
            {GIFT_PREFS.map((g) => (
              <option key={g.value} value={g.value}>
                {g.label}
              </option>
            ))}
          </Select>
        </div>

        {warnings.length > 0 && (
          <ul className="flex flex-col gap-1.5 rounded-2xl bg-paper p-3.5 text-[13px] text-ink-2 ring-1 ring-inset ring-line">
            {warnings.map((w) => (
              <li key={w} className="flex gap-2">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-butter-deep" aria-hidden />
                {w}
              </li>
            ))}
          </ul>
        )}
        <button type="submit" className="hidden" aria-hidden tabIndex={-1} />
      </form>
    </Drawer>
  );
}
