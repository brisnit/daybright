import Link from "next/link";
import { clsx } from "clsx";
import { ArrowRight } from "lucide-react";
import { TIERS } from "@/config/charter";

const usd = (n: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);

/**
 * Compact plan summary for secondary marketing pages. The source of truth for business pricing is
 * src/config/charter.ts and the full matrix at /pricing.
 */
export function PlanCards({ compact = false }: { compact?: boolean }) {
  return (
    <ul className={clsx("grid gap-4 sm:grid-cols-2", compact ? "lg:grid-cols-4" : "xl:grid-cols-4")}>
      {TIERS.map((t) => {
        return (
          <li key={t.id} className="flex flex-col rounded-3xl bg-white p-6 ring-1 ring-line">
            <h3 className="font-display text-xl font-semibold tracking-tight text-ink">{t.name}</h3>
            <p className="text-[13px] text-ink-3">{t.audience}</p>
            <p className="mt-5 font-display text-3xl font-semibold text-ink">
              {t.charter ? usd(t.charter.amount) : "Custom"}
              {t.charter && <span className="ml-1 font-sans text-sm font-medium text-ink-2">/{t.charter.cadence}</span>}
            </p>
            <p className="mt-1 text-[13px] text-ink-3">
              {t.charter ? `${t.charter.label} · proposed` : "Quoted by seat count"}
            </p>
            <Link href="/pricing" className="mt-5 inline-flex items-center gap-1 text-[14px] font-semibold text-cobalt hover:underline">
              See what&rsquo;s included <ArrowRight className="size-4" aria-hidden />
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
