"use client";

import { clsx } from "clsx";
import { useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ArrowDown, ArrowUp, ChevronRight, Search, Upload, UserPlus, Users } from "lucide-react";
import { useDemo } from "@/lib/store";
import type { Customer } from "@/lib/types";
import { allTags, customerIssues } from "@/lib/selectors";
import { daysUntil, formatBirthday, nextBirthday, relDays } from "@/lib/dates";
import { AppPage, PageHeader } from "@/components/app/app-shell";
import { Badge, GiftBadge, StatusBadge } from "@/components/ui/badges";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/controls";
import { inputClass } from "@/components/ui/field";
import { useToast } from "@/components/ui/toast";
import { Avatar } from "./dashboard-overview";
import { plural, upcomingSendFor } from "./dashboard-utils";
import { CustomerFormDrawer } from "./customers-form";
import { CustomerImportDrawer } from "./customers-import";
import { CustomerDetailDrawer } from "./customers-detail";
import { demoCustomers, fullName } from "./customers-utils";

type Filter = "all" | "month" | "next30" | "issues" | "card-only";
type SortKey = "name" | "birthday" | "added";

const FILTERS: { id: Filter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "month", label: "Birthday this month" },
  { id: "next30", label: "Next 30 days" },
  { id: "issues", label: "Needs details" },
  { id: "card-only", label: "Card only" },
];

export function CustomersPage() {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const customers = useDemo((s) => s.customers);
  const sends = useDemo((s) => s.sends);
  const automations = useDemo((s) => s.automations);
  const importCustomers = useDemo((s) => s.importCustomers);
  const toast = useToast();

  const feb29 = automations[0]?.feb29 ?? "feb28";
  const filter = (FILTERS.some((f) => f.id === params.get("filter")) ? params.get("filter") : "all") as Filter;
  const tag = params.get("tag") ?? "";
  const id = params.get("id");
  const editing = params.get("edit") === "1";

  const [q, setQ] = useState("");
  const [sort, setSort] = useState<{ key: SortKey; dir: 1 | -1 }>({ key: "birthday", dir: 1 });
  const [newOpen, setNewOpen] = useState(false);
  const [newKey, setNewKey] = useState(0);
  const [importOpen, setImportOpen] = useState(false);

  function setParams(patch: Record<string, string | null>) {
    const p = new URLSearchParams(params.toString());
    Object.entries(patch).forEach(([k, v]) => (v === null || v === "" ? p.delete(k) : p.set(k, v)));
    const s = p.toString();
    router.replace(s ? `${pathname}?${s}` : pathname, { scroll: false });
  }

  const now = new Date();
  const rows = useMemo(
    () =>
      customers.map((c) => {
        const next = nextBirthday(c, feb29);
        return { c, next, days: daysUntil(next), issues: customerIssues(c), send: upcomingSendFor(sends, c.id) };
      }),
    [customers, sends, feb29],
  );

  const counts: Record<Filter, number> = {
    all: rows.length,
    month: rows.filter((r) => r.c.birthMonth === now.getMonth() + 1).length,
    next30: rows.filter((r) => r.days !== null && r.days <= 30).length,
    issues: rows.filter((r) => r.issues.length).length,
    "card-only": rows.filter((r) => r.c.giftPreference === "card-only").length,
  };

  const visible = rows
    .filter((r) => {
      if (filter === "month" && r.c.birthMonth !== now.getMonth() + 1) return false;
      if (filter === "next30" && !(r.days !== null && r.days <= 30)) return false;
      if (filter === "issues" && !r.issues.length) return false;
      if (filter === "card-only" && r.c.giftPreference !== "card-only") return false;
      if (tag && !r.c.tags.includes(tag)) return false;
      if (q.trim()) {
        const hay = `${fullName(r.c)} ${r.c.email} ${r.c.company} ${r.c.tags.join(" ")} ${r.c.notes} ${r.c.interests.join(" ")}`.toLowerCase();
        if (!q.toLowerCase().split(/\s+/).every((w) => hay.includes(w))) return false;
      }
      return true;
    })
    .sort((a, b) => {
      let d = 0;
      if (sort.key === "name") d = fullName(a.c).localeCompare(fullName(b.c));
      else if (sort.key === "birthday") d = (a.days ?? 9999) - (b.days ?? 9999);
      else d = b.c.createdAt.localeCompare(a.c.createdAt);
      return d * sort.dir;
    });

  const detail = id && !editing ? customers.find((c) => c.id === id) ?? null : null;
  const editCustomer = id && editing ? customers.find((c) => c.id === id) ?? null : null;

  function importDemo() {
    const existing = new Set(customers.map((c) => c.email.toLowerCase()));
    const fresh = demoCustomers().filter((c) => !existing.has(c.email.toLowerCase()));
    if (!fresh.length) {
      toast({ title: "Demo customers are already here", body: "All six sample customers are in your list." });
      return;
    }
    const n = importCustomers(fresh);
    toast({ title: `${n} demo ${plural(n, "customer")} added`, body: "Fictional people with birthdays over the next few months.", tone: "success" });
  }

  const sortButton = (key: SortKey, label: string) => (
    <button
      type="button"
      onClick={() => setSort((s) => ({ key, dir: s.key === key ? ((-s.dir) as 1 | -1) : 1 }))}
      className={clsx("inline-flex items-center gap-1 font-bold uppercase tracking-wide", sort.key === key ? "text-ink" : "text-ink-3 hover:text-ink")}
      aria-label={`Sort by ${label}`}
    >
      {label}
      {sort.key === key && (sort.dir === 1 ? <ArrowUp className="size-3" aria-hidden /> : <ArrowDown className="size-3" aria-hidden />)}
    </button>
  );

  const tags = allTags(customers);

  return (
    <AppPage>
      <PageHeader
        title="Customers"
        description={`${customers.length} people whose birthdays ${customers.length === 1 ? "is" : "are"} on your calendar. ${counts.issues ? `${counts.issues} need details.` : "Everyone's details are complete."}`}
        actions={
          <>
            <Button variant="outline" icon={<Upload className="size-4" />} onClick={() => setImportOpen(true)}>
              Import CSV
            </Button>
            <Button
              icon={<UserPlus className="size-4" />}
              onClick={() => {
                setNewKey((k) => k + 1);
                setNewOpen(true);
              }}
            >
              Add customer
            </Button>
          </>
        }
      />

      {/* Search + filters */}
      <div className="mt-6 flex flex-col gap-3">
        <div className="flex flex-col gap-2 sm:flex-row">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-ink-3" aria-hidden />
            <input
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search name, email, company, notes"
              aria-label="Search customers"
              className={clsx(inputClass, "pl-10")}
            />
          </div>
          <div className="relative sm:w-52">
            <select aria-label="Filter by tag" value={tag} onChange={(e) => setParams({ tag: e.target.value || null })} className={clsx(inputClass, "appearance-none pr-9")}>
              <option value="">All tags</option>
              {tags.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
            <svg aria-hidden className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-ink-3" viewBox="0 0 16 16" fill="none">
              <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
            </svg>
          </div>
        </div>
        <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0" role="group" aria-label="Filters">
          {FILTERS.map((f) => (
            <Chip key={f.id} active={filter === f.id} tone={f.id === "issues" ? "coral" : "ink"} onClick={() => setParams({ filter: f.id === "all" ? null : f.id })} className="shrink-0">
              {f.label} <span className="ml-0.5 opacity-70">{counts[f.id]}</span>
            </Chip>
          ))}
        </div>
      </div>

      {/* Desktop table */}
      <div className="mt-4 hidden overflow-hidden rounded-3xl bg-white ring-1 ring-line md:block">
        <table className="w-full text-left text-[14px]">
          <thead className="border-b border-line bg-paper text-[11.5px]">
            <tr>
              <th scope="col" className="px-5 py-3">
                {sortButton("name", "Name")}
              </th>
              <th scope="col" className="px-3 py-3">
                {sortButton("birthday", "Birthday")}
              </th>
              <th scope="col" className="px-3 py-3 font-bold uppercase tracking-wide text-ink-3">
                Tags
              </th>
              <th scope="col" className="px-3 py-3 font-bold uppercase tracking-wide text-ink-3">
                Status
              </th>
              <th scope="col" className="px-3 py-3 text-right">
                {sortButton("added", "Added")}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {visible.map((r) => (
              <tr key={r.c.id} className="cursor-pointer transition hover:bg-paper" onClick={() => setParams({ id: r.c.id, edit: null })}>
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <Avatar name={fullName(r.c)} id={r.c.id} className="size-9" />
                    <div className="min-w-0">
                      <button
                        type="button"
                        className="font-semibold hover:underline"
                        onClick={(e) => {
                          e.stopPropagation();
                          setParams({ id: r.c.id, edit: null });
                        }}
                      >
                        {fullName(r.c)}
                      </button>
                      <p className="truncate text-[12.5px] text-ink-3">{r.c.email || "No email"}{r.c.company ? ` · ${r.c.company}` : ""}</p>
                    </div>
                  </div>
                </td>
                <td className="px-3 py-3">
                  <p className={clsx(!r.c.birthMonth && "text-ink-3")}>{r.c.birthMonth ? formatBirthday(r.c) : "No birthday yet"}</p>
                  {r.days !== null && r.days <= 30 && <p className="text-[12.5px] font-semibold text-cobalt-deep">{relDays(r.days)}</p>}
                </td>
                <td className="px-3 py-3">
                  <div className="flex max-w-[220px] flex-wrap gap-1">
                    {r.c.tags.map((t) => (
                      <Badge key={t}>{t}</Badge>
                    ))}
                  </div>
                </td>
                <td className="px-3 py-3">
                  <RowStatus r={r} />
                </td>
                <td className="px-3 py-3 text-right text-[12.5px] text-ink-3">
                  {new Date(r.c.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {visible.length === 0 && <Empty onReset={() => { setQ(""); setParams({ filter: null, tag: null }); }} />}
      </div>

      {/* Mobile list */}
      <div className="mt-4 md:hidden">
        <div className="mb-2 flex items-center justify-between text-[12.5px] text-ink-3">
          <span>
            {visible.length} {plural(visible.length, "customer")}
          </span>
          <label className="flex items-center gap-1.5">
            Sort
            <select
              value={sort.key}
              onChange={(e) => setSort({ key: e.target.value as SortKey, dir: 1 })}
              className="rounded-full bg-white px-2 py-1 text-[12.5px] font-semibold text-ink ring-1 ring-line"
            >
              <option value="birthday">Next birthday</option>
              <option value="name">Name</option>
              <option value="added">Recently added</option>
            </select>
          </label>
        </div>
        <ul className="flex flex-col gap-2">
          {visible.map((r) => (
            <li key={r.c.id}>
              <button type="button" onClick={() => setParams({ id: r.c.id, edit: null })} className="flex w-full items-center gap-3 rounded-2xl bg-white p-3 text-left ring-1 ring-line">
                <Avatar name={fullName(r.c)} id={r.c.id} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-semibold">{fullName(r.c)}</span>
                  <span className="block truncate text-[12.5px] text-ink-3">
                    {r.c.birthMonth ? formatBirthday(r.c) : "No birthday yet"}
                    {r.days !== null && r.days <= 30 ? ` · ${relDays(r.days)}` : ""}
                  </span>
                  <span className="mt-1.5 flex flex-wrap gap-1">
                    <RowStatus r={r} />
                  </span>
                </span>
                <ChevronRight className="size-4 shrink-0 text-ink-3" aria-hidden />
              </button>
            </li>
          ))}
        </ul>
        {visible.length === 0 && (
          <div className="rounded-3xl bg-white ring-1 ring-line">
            <Empty onReset={() => { setQ(""); setParams({ filter: null, tag: null }); }} />
          </div>
        )}
      </div>

      <CustomerDetailDrawer customer={detail} onClose={() => setParams({ id: null, edit: null })} onEdit={(c) => setParams({ id: c.id, edit: "1" })} />

      <CustomerFormDrawer
        key={editCustomer ? `edit-${editCustomer.id}` : `new-${newKey}`}
        open={!!editCustomer || newOpen}
        customer={editCustomer}
        onClose={() => {
          if (editCustomer) setParams({ edit: null });
          setNewOpen(false);
        }}
        onOpenCustomer={(cid) => {
          setNewOpen(false);
          setParams({ id: cid, edit: null });
        }}
      />

      <CustomerImportDrawer open={importOpen} onClose={() => setImportOpen(false)} onImportDemo={importDemo} />
    </AppPage>
  );
}

function RowStatus({ r }: { r: { c: Customer; issues: string[]; send: ReturnType<typeof upcomingSendFor> } }) {
  return (
    <div className="flex flex-wrap gap-1">
      {r.issues.map((i) => (
        <Badge key={i} tone="coral" dot>
          {i}
        </Badge>
      ))}
      {r.send && <StatusBadge status={r.send.status} />}
      {r.send?.gift && <GiftBadge status={r.send.gift.status} />}
      {r.c.giftPreference === "card-only" && <Badge>Card only</Badge>}
      {!r.issues.length && !r.send && r.c.giftPreference !== "card-only" && <span className="text-[12.5px] text-ink-3">All set</span>}
    </div>
  );
}

function Empty({ onReset }: { onReset: () => void }) {
  return (
    <div className="flex flex-col items-center gap-2 px-6 py-12 text-center">
      <Users className="size-6 text-ink-3" aria-hidden />
      <p className="font-semibold">No customers match</p>
      <p className="text-[14px] text-ink-3">Try a different search or clear the filters.</p>
      <Button size="sm" variant="outline" onClick={onReset}>
        Clear filters
      </Button>
    </div>
  );
}
