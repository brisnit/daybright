import { clsx } from "clsx";
import { Archive, CalendarClock, Users } from "lucide-react";
import type { Availability } from "@/config/charter";
import { StatusChip } from "./status";

type Capability = { label: string; status: Availability };

const CARDS: {
  icon: typeof Archive;
  title: string;
  body: string;
  capabilities: Capability[];
  note: string;
  visual: React.ReactNode;
}[] = [
  {
    icon: Archive,
    title: "Compliance Archiving (Auto-BCC)",
    body:
      "Each email or SMS card will generate a timestamped PDF/HTML audit snapshot: the personal note, the signature and the disclosures you configure, such as NPN, CRD, DRE or State Bar identifiers. A copy goes to the archive address your compliance team designates.",
    capabilities: [
      { label: "Timestamped PDF/HTML snapshots", status: "planned" },
      { label: "Auto-BCC to your designated archive", status: "planned" },
      { label: "Configurable license and disclosure footers", status: "planned" },
    ],
    note: "Your firm remains responsible for supervision and recordkeeping. Daybright provides tools, not compliance advice.",
    visual: <SnapshotVisual />,
  },
  {
    icon: CalendarClock,
    title: "Milestone Intelligence That Starts Conversations",
    body:
      "Go beyond birthdays: life-insurance half-birthdays and age changes, wealth milestones at 50, 59½, 62, 65 and 73, annual housiversaries and estate-plan review anniversaries, each queued for review before anything is sent.",
    capabilities: [
      { label: "Birthday automation with review queue", status: "beta" },
      { label: "Half-birthday and age-change reminders", status: "planned" },
      { label: "Wealth, home and estate milestone tracks", status: "planned" },
    ],
    note: "Milestone ages reflect common planning conversations. Eligibility, regulatory and financial rules vary by person and jurisdiction and can change.",
    visual: <TimelineVisual />,
  },
  {
    icon: Users,
    title: "Household Deduplication & Multi-Year Smart Tracks",
    body:
      "Group spouses and households so one family gets one thoughtful card, not three. Smart tracks rotate designs year over year, so long-time clients never receive the same card twice.",
    capabilities: [
      { label: "Duplicate warnings on import", status: "beta" },
      { label: "Design rotation (no repeat of last year's card)", status: "beta" },
      { label: "Household grouping and spouse-aware cards", status: "planned" },
    ],
    note: "Beta items work in the Daybright product preview today.",
    visual: <HouseholdVisual />,
  },
];

const OUTCOMES = [
  { title: "Stronger relationships", body: "A personal note on the dates clients actually care about." },
  { title: "Fewer forgotten touchpoints", body: "Milestones are queued ahead of time, not remembered the night before." },
  { title: "Less manual CRM work", body: "Import once, review a short queue, approve. No sticky notes." },
  { title: "Consistent brand communication", body: "Every card carries your firm's look, voice and required footer." },
];

export function ComplianceSection() {
  return (
    <section id="compliance" aria-labelledby="compliance-title" className="scroll-mt-24 py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-[#8A6A2B]">Enterprise compliance &amp; intelligence</p>
          <h2 id="compliance-title" className="mt-3 font-display text-[34px] font-semibold leading-[1.05] tracking-tight text-[#16203A] text-balance sm:text-5xl">
            Why Top Producers &amp; Compliance Officers Switch to Daybright
          </h2>
          <p className="mt-4 text-[17px] leading-relaxed text-ink-2">
            Relationship marketing your compliance team can follow, built around the milestones that move client conversations.
            Each capability is labeled with where it stands today.
          </p>
        </div>

        <div className="mt-12 grid gap-5 lg:grid-cols-3">
          {CARDS.map((c, i) => (
            <article key={c.title} className={clsx("emboss flex flex-col overflow-hidden rounded-[1.75rem] bg-white ring-1 ring-[#EDE4D3]")}>
              <div className={clsx("linen relative h-44 border-b border-[#EDE4D3]")}>{c.visual}</div>
              <div className="flex flex-1 flex-col p-6 sm:p-7">
                <div className="flex items-center gap-3">
                  <span className="grid size-9 place-items-center rounded-xl bg-[#16203A] text-[#E9D9A8]">
                    <c.icon className="size-[18px]" aria-hidden />
                  </span>
                  <span className="font-grotesk text-[12px] font-semibold uppercase tracking-[0.14em] text-ink-3">0{i + 1}</span>
                </div>
                <h3 className="mt-4 font-display text-[22px] font-semibold leading-tight tracking-tight text-ink">{c.title}</h3>
                <p className="mt-3 text-[15px] leading-relaxed text-ink-2">{c.body}</p>
                <ul className="mt-5 space-y-2.5 border-t border-line pt-5">
                  {c.capabilities.map((cap) => (
                    <li key={cap.label} className="flex items-start justify-between gap-3 text-[14px] text-ink">
                      <span>{cap.label}</span>
                      <StatusChip status={cap.status} />
                    </li>
                  ))}
                </ul>
                <p className="mt-5 text-[12.5px] leading-relaxed text-ink-3">{c.note}</p>
              </div>
            </article>
          ))}
        </div>

        <dl className="mt-14 grid gap-px overflow-hidden rounded-[1.5rem] bg-line ring-1 ring-line sm:grid-cols-2 lg:grid-cols-4">
          {OUTCOMES.map((o) => (
            <div key={o.title} className="bg-paper p-6">
              <dt className="font-display text-lg font-semibold text-ink">{o.title}</dt>
              <dd className="mt-1.5 text-[14px] leading-relaxed text-ink-2">{o.body}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

function SnapshotVisual() {
  return (
    <div className="absolute inset-0 flex items-center justify-center" aria-hidden>
      <div className="absolute left-[18%] top-7 h-32 w-28 rotate-[-6deg] rounded-md bg-white shadow-sm ring-1 ring-[#E4DACA]" />
      <div className="relative w-44 rotate-[3deg] rounded-md bg-white p-3 shadow-md ring-1 ring-[#E4DACA]">
        <div className="flex items-center justify-between">
          <span className="text-[8px] font-bold uppercase tracking-[0.16em] text-ink-3">Snapshot</span>
          <span className="rounded bg-butter-soft px-1 text-[7.5px] font-bold uppercase text-butter-deep">Sample</span>
        </div>
        <p className="mt-1 font-mono text-[9px] text-ink-2">2026-11-14 09:00:02 CT</p>
        <div className="mt-2 space-y-1">
          <span className="block h-1.5 w-full rounded bg-[#EDE5D6]" />
          <span className="block h-1.5 w-4/5 rounded bg-[#EDE5D6]" />
          <span className="block h-1.5 w-3/5 rounded bg-[#EDE5D6]" />
        </div>
        <p className="mt-2 font-hand text-[15px] leading-none text-[#1D2B6B]">Elena Brooks</p>
        <p className="mt-2 border-t border-dashed border-[#E4DACA] pt-1 text-[7.5px] uppercase tracking-wide text-ink-3">CRD #0000000 · Disclosures</p>
      </div>
      <div className="absolute bottom-5 right-[16%] grid size-12 place-items-center rounded-full bg-[#7A1F2B] text-[8px] font-bold uppercase tracking-wide text-[#F3D9C0] shadow-md">
        BCC
      </div>
    </div>
  );
}

function TimelineVisual() {
  const ages = ["50", "59½", "62", "65", "73"];
  return (
    <div className="absolute inset-0 flex flex-col justify-center px-6" aria-hidden>
      <div className="relative">
        <div className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-[#CDBE9F]" />
        <div className="relative flex justify-between">
          {ages.map((a, i) => (
            <div key={a} className="flex flex-col items-center">
              <span className={clsx("grid size-11 place-items-center rounded-full font-display text-[14px] font-semibold ring-4 ring-[#FBF7EF]", i === 1 ? "bg-[#16203A] text-[#E9D9A8]" : "bg-white text-ink shadow-sm")}>
                {a}
              </span>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-5 flex flex-wrap justify-center gap-1.5">
        {["Half-birthday", "Housiversary", "Policy renewal", "Estate review"].map((t) => (
          <span key={t} className="rounded-full bg-white px-2.5 py-1 text-[10.5px] font-semibold text-ink-2 ring-1 ring-[#E4DACA]">
            {t}
          </span>
        ))}
      </div>
    </div>
  );
}

function HouseholdVisual() {
  return (
    <div className="absolute inset-0 flex items-center justify-center gap-4 px-6" aria-hidden>
      <div className="space-y-2">
        {["David Alvarez", "Karen Alvarez", "D. Alvarez"].map((n, i) => (
          <div key={n} className={clsx("flex items-center gap-2 rounded-lg bg-white px-2.5 py-1.5 text-[11px] font-medium shadow-sm ring-1 ring-[#E4DACA]", i === 2 && "text-ink-3 line-through decoration-coral")}>
            <span className="grid size-5 place-items-center rounded-full bg-[#EDE5D6] text-[8px] font-bold">{n[0]}</span>
            {n}
          </div>
        ))}
      </div>
      <svg viewBox="0 0 40 20" className="w-10 text-[#8A6A2B]">
        <path d="M2 10h30m-6-6 6 6-6 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <div className="rounded-xl bg-[#16203A] p-3 text-[#F4EEE3] shadow-md">
        <p className="text-[8.5px] font-bold uppercase tracking-[0.16em] text-[#E9D9A8]">Household</p>
        <p className="mt-0.5 font-display text-[14px] font-semibold">The Alvarez family</p>
        <div className="mt-2 flex gap-1">
          {["’24", "’25", "’26"].map((y, i) => (
            <span key={y} className={clsx("grid h-8 w-6 place-items-end rounded-sm pb-0.5 text-[7px] font-bold", ["bg-[#C9A24B]", "bg-[#7A9A8B]", "bg-[#B5654A]"][i])}>
              {y}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
