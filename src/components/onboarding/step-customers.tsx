"use client";

import Link from "next/link";
import { clsx } from "clsx";
import { FileUp, ListPlus, Trash2, Upload, UserPlus, Users } from "lucide-react";
import { useMemo, useRef, useState, type FormEvent } from "react";
import { useDemo } from "@/lib/store";
import { MONTHS, daysInMonth, isValidBirthday } from "@/lib/dates";
import { ChoiceCard } from "@/components/ui/controls";
import { Input, Select, Textarea } from "@/components/ui/field";
import { Badge } from "@/components/ui/badges";
import { Button } from "@/components/ui/button";
import { importable, parseCsv, SAMPLE_CSV, type NewCustomer, type OnboardingDraft } from "./model";
import { Eyebrow, Panel, StepHeader } from "./bits";

type StepProps = { d: OnboardingDraft; set: (p: Partial<OnboardingDraft>) => void; step: number; total: number };

export function CustomersStep({ d, set, step, total }: StepProps) {
  const existing = useDemo((s) => s.customers);
  const emails = useMemo(
    () => new Set([...existing.map((c) => c.email.toLowerCase()), ...d.newCustomers.map((c) => c.email.toLowerCase())]),
    [existing, d.newCustomers],
  );
  const addMany = (rows: NewCustomer[]) => set({ newCustomers: [...d.newCustomers, ...rows] });

  const modes = [
    { id: "demo" as const, icon: Users, title: "Load demo customers", body: `${existing.length} fictional customers, ready to explore.` },
    { id: "manual" as const, icon: UserPlus, title: "Add one manually", body: "A name, email and birthday." },
    { id: "csv" as const, icon: FileUp, title: "Import a CSV", body: "Paste or upload a spreadsheet export." },
  ];

  return (
    <>
      <StepHeader step={step} total={total} title="Who has birthdays coming up?">
        Start with demo customers to see a full workspace, or add a few of your own. Birth years are never required.
      </StepHeader>

      <div className="grid gap-3 sm:grid-cols-3">
        {modes.map((m) => (
          <ChoiceCard key={m.id} selected={d.customerMode === m.id} onClick={() => set({ customerMode: m.id })}>
            <m.icon className="size-5 text-cobalt" />
            <p className="mt-3 pr-6 font-semibold text-ink">{m.title}</p>
            <p className="mt-0.5 text-[13px] text-ink-3">{m.body}</p>
          </ChoiceCard>
        ))}
      </div>

      <div className="mt-5">
        {d.customerMode === "demo" && (
          <Panel>
            <p className="font-display text-xl font-semibold tracking-tight text-ink">Demo customers are loaded.</p>
            <p className="mt-1 text-[14px] text-ink-2">
              They include upcoming birthdays, a missing birthday, a card-only preference and a gift waiting for approval, so every part of the workspace has something to show.
            </p>
            <ul className="mt-4 flex flex-wrap gap-2">
              {existing.slice(0, 8).map((c) => (
                <li key={c.id} className="rounded-full bg-paper px-3 py-1 text-[13px] font-medium text-ink-2 ring-1 ring-line">
                  {c.firstName} {c.lastName}
                </li>
              ))}
              {existing.length > 8 && <li className="px-2 py-1 text-[13px] text-ink-3">and {existing.length - 8} more</li>}
            </ul>
          </Panel>
        )}
        {d.customerMode === "manual" && <ManualForm emails={emails} onAdd={(c) => addMany([c])} />}
        {d.customerMode === "csv" && <CsvImport emails={emails} onAdd={addMany} />}
      </div>

      {d.newCustomers.length > 0 && (
        <Panel className="mt-5">
          <div className="flex items-center justify-between gap-3">
            <Eyebrow>Ready to add ({d.newCustomers.length})</Eyebrow>
            <Button size="sm" variant="ghost" onClick={() => set({ newCustomers: [] })}>
              Clear
            </Button>
          </div>
          <ul className="mt-3 divide-y divide-line">
            {d.newCustomers.map((c, i) => (
              <li key={c.email + i} className="flex items-center justify-between gap-3 py-2.5">
                <div className="min-w-0">
                  <p className="truncate font-semibold text-ink">
                    {c.firstName} {c.lastName}
                  </p>
                  <p className="truncate text-[13px] text-ink-3">
                    {c.email}
                    {c.birthMonth ? ` · ${MONTHS[c.birthMonth - 1]} ${c.birthDay}` : ""}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {!c.birthMonth && <Badge tone="butter">Birthday needed</Badge>}
                  <button
                    type="button"
                    onClick={() => set({ newCustomers: d.newCustomers.filter((_, j) => j !== i) })}
                    className="grid size-8 place-items-center rounded-full text-ink-3 hover:bg-ink/5 hover:text-coral-deep"
                    aria-label={`Remove ${c.firstName}`}
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-[13px] text-ink-3">They&rsquo;ll be added alongside the demo customers when you activate.</p>
        </Panel>
      )}
    </>
  );
}

function ManualForm({ emails, onAdd }: { emails: Set<string>; onAdd: (c: NewCustomer) => void }) {
  const [f, setF] = useState({ first: "", last: "", email: "", month: "", day: "" });
  const [err, setErr] = useState<Record<string, string>>({});
  const days = f.month ? daysInMonth(+f.month, 2024) : 31;

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const x: Record<string, string> = {};
    const email = f.email.trim().toLowerCase();
    if (!f.first.trim()) x.first = "Add a first name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) x.email = "Add a valid email.";
    else if (emails.has(email)) x.email = "That email is already in your list.";
    if ((f.month || f.day) && !isValidBirthday(+f.month || null, +f.day || null)) x.day = "Pick a real month and day.";
    setErr(x);
    if (Object.keys(x).length) return;
    onAdd({
      firstName: f.first.trim(),
      lastName: f.last.trim(),
      email,
      birthMonth: f.month ? +f.month : null,
      birthDay: f.day ? +f.day : null,
      birthYear: null,
      company: "",
      tags: [],
      notes: "",
      interests: [],
      cardPreference: null,
      giftPreference: "gift-ok",
    });
    setF({ first: "", last: "", email: "", month: "", day: "" });
  };

  return (
    <Panel>
      <form onSubmit={submit} noValidate className="grid gap-4 sm:grid-cols-2">
        <Input label="First name" value={f.first} onChange={(e) => setF({ ...f, first: e.target.value })} error={err.first} />
        <Input label="Last name" optional value={f.last} onChange={(e) => setF({ ...f, last: e.target.value })} />
        <Input label="Email" type="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} error={err.email} wrapClassName="sm:col-span-2" />
        <Select label="Birthday month" value={f.month} onChange={(e) => setF({ ...f, month: e.target.value })}>
          <option value="">Month</option>
          {MONTHS.map((m, i) => (
            <option key={m} value={i + 1}>
              {m}
            </option>
          ))}
        </Select>
        <Select label="Day" value={f.day} onChange={(e) => setF({ ...f, day: e.target.value })} error={err.day} hint="Year not needed.">
          <option value="">Day</option>
          {Array.from({ length: days }).map((_, i) => (
            <option key={i} value={i + 1}>
              {i + 1}
            </option>
          ))}
        </Select>
        <div className="sm:col-span-2">
          <Button type="submit" variant="ink" icon={<ListPlus className="size-4" />}>
            Add customer
          </Button>
        </div>
      </form>
    </Panel>
  );
}

function CsvImport({ emails, onAdd }: { emails: Set<string>; onAdd: (rows: NewCustomer[]) => void }) {
  const [text, setText] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const parsed = useMemo(() => parseCsv(text, emails), [text, emails]);
  const ok = parsed.rows.filter(importable);

  const onFile = (f: File | undefined) => {
    if (!f) return;
    const r = new FileReader();
    r.onload = () => setText(String(r.result ?? ""));
    r.readAsText(f);
  };

  return (
    <Panel className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <Button size="sm" variant="outline" icon={<Upload className="size-4" />} onClick={() => fileRef.current?.click()}>
          Upload .csv
        </Button>
        <Button size="sm" variant="soft" onClick={() => setText(SAMPLE_CSV)}>
          Use a sample CSV
        </Button>
        <input ref={fileRef} type="file" accept=".csv,text/csv" className="sr-only" aria-label="Upload CSV file" onChange={(e) => onFile(e.target.files?.[0])} />
      </div>
      <Textarea
        label="Or paste CSV"
        hint="Columns like first_name, last_name, email, birthday (MM/DD), company."
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={5}
        className="font-mono text-[13px]"
        placeholder={"first_name,last_name,email,birthday\nHannah,Brooks,hannah@example.com,04/12"}
      />
      {parsed.rows.length > 0 && (
        <div>
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <Eyebrow>Preview</Eyebrow>
            <p className="text-[13px] text-ink-3">
              {ok.length} of {parsed.rows.length} rows can be added
            </p>
          </div>
          <div className="mt-2 overflow-x-auto rounded-2xl ring-1 ring-line">
            <table className="w-full min-w-[520px] text-left text-[13px]">
              <thead className="bg-paper text-ink-3">
                <tr>
                  <th className="px-3 py-2 font-semibold">Name</th>
                  <th className="px-3 py-2 font-semibold">Email</th>
                  <th className="px-3 py-2 font-semibold">Birthday</th>
                  <th className="px-3 py-2 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {parsed.rows.slice(0, 8).map((r, i) => (
                  <tr key={i} className={clsx(!importable(r) && "bg-coral-soft/40")}>
                    <td className="px-3 py-2 font-medium text-ink">
                      {r.row.firstName} {r.row.lastName}
                    </td>
                    <td className="px-3 py-2 text-ink-2">{r.row.email || "—"}</td>
                    <td className="px-3 py-2 text-ink-2">{r.row.birthMonth ? `${MONTHS[r.row.birthMonth - 1].slice(0, 3)} ${r.row.birthDay}` : "—"}</td>
                    <td className="px-3 py-2">
                      {r.issues.length === 0 ? (
                        <Badge tone="mint">Ready</Badge>
                      ) : (
                        <div className="flex flex-wrap gap-1">
                          {r.issues.map((x) => (
                            <Badge key={x} tone={importable(r) ? "butter" : "coral"}>
                              {x}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {parsed.rows.length > 8 && <p className="mt-2 text-[12px] text-ink-3">Showing the first 8 rows.</p>}
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <Button
              variant="ink"
              disabled={!ok.length}
              onClick={() => {
                onAdd(ok.map((r) => r.row));
                setText("");
              }}
            >
              Add {ok.length} {ok.length === 1 ? "customer" : "customers"}
            </Button>
            <p className="text-[13px] text-ink-3">
              Rows with missing birthdays are added and flagged. Need column mapping? The full import tool lives in{" "}
              <Link href="/app/customers" className="font-semibold text-cobalt underline-offset-2 hover:underline">
                Customers
              </Link>
              .
            </p>
          </div>
        </div>
      )}
    </Panel>
  );
}
