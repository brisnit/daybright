import { FileSpreadsheet } from "lucide-react";
import { INTEGRATIONS } from "@/config/charter";
import { StatusChip } from "./status";

export function IntegrationsSection() {
  return (
    <section id="integrations" aria-labelledby="integrations-title" className="scroll-mt-24 border-y border-[#E7DDCC] bg-[#F6F1E7] py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[1fr_1.1fr] lg:items-end">
          <div>
            <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-[#8A6A2B]">Zero double data entry</p>
            <h2 id="integrations-title" className="mt-3 font-display text-[34px] font-semibold leading-[1.05] tracking-tight text-[#16203A] text-balance sm:text-5xl">
              Built to Plug Into the Vertical CRM You Already Use
            </h2>
          </div>
          <p className="text-[17px] leading-relaxed text-ink-2">
            The goal: connect securely, bring in the client milestones you already track, and write a timestamped engagement note back
            to each contact&rsquo;s timeline. Today, you can import clients by CSV. Native connections below are in development, and
            Charter members help decide which ship first.
          </p>
        </div>

        <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <li className="flex flex-col rounded-[1.5rem] bg-[#16203A] p-6 text-paper">
            <div className="flex items-start justify-between gap-3">
              <span className="grid size-11 place-items-center rounded-xl bg-white/10">
                <FileSpreadsheet className="size-5 text-[#E9D9A8]" aria-hidden />
              </span>
              <StatusChip status="beta" dark />
            </div>
            <h3 className="mt-5 font-display text-xl font-semibold">CSV import</h3>
            <p className="text-[13px] text-paper/60">Any CRM or spreadsheet</p>
            <p className="mt-3 text-[14px] leading-relaxed text-paper/80">
              Column mapping, birthday parsing, duplicate warnings and a row-by-row review before anything is imported.
            </p>
          </li>
          {INTEGRATIONS.map((i) => (
            <li key={i.name} className="emboss flex flex-col rounded-[1.5rem] bg-white p-6 ring-1 ring-[#EDE4D3]">
              <div className="flex items-start justify-between gap-3">
                <span className="grid size-11 place-items-center rounded-xl bg-[#F4EEE3] font-display text-lg font-semibold text-[#16203A] ring-1 ring-[#E4DACA]" aria-hidden>
                  {i.monogram}
                </span>
                <div className="flex flex-col items-end gap-1">
                  <StatusChip status={i.status} />
                  {i.liveTwoWaySync && (
                    <span className="rounded-full bg-mint-soft px-2 py-0.5 text-[11px] font-semibold text-mint-deep">2-Way Live Sync</span>
                  )}
                </div>
              </div>
              <h3 className="mt-5 font-display text-xl font-semibold text-ink">{i.name}</h3>
              <p className="text-[13px] text-ink-3">{i.vertical}</p>
              <p className="mt-3 text-[14px] leading-relaxed text-ink-2">
                <span className="font-semibold text-ink">Target: </span>
                {i.target}
              </p>
            </li>
          ))}
        </ul>
        <p className="mt-6 max-w-3xl text-[12px] leading-relaxed text-ink-3">
          Product names are trademarks of their respective owners and are shown to describe planned compatibility. No partnership,
          endorsement or marketplace listing is implied. Connection methods, including OAuth, and setup time will be confirmed per
          integration before release.
        </p>
      </div>
    </section>
  );
}
