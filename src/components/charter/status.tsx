import { clsx } from "clsx";
import { AVAILABILITY, type Availability } from "@/config/charter";

const STYLE: Record<Availability, string> = {
  live: "bg-mint-soft text-mint-deep ring-mint/60",
  beta: "bg-cobalt-soft text-cobalt-deep ring-cobalt/25",
  planned: "bg-butter-soft text-butter-deep ring-butter/70",
  roadmap: "bg-ink/[0.05] text-ink-2 ring-ink/15",
  concept: "bg-coral-soft text-coral-deep ring-coral/40",
  service: "bg-lilac-soft text-lilac-deep ring-lilac/50",
  proposed: "bg-butter-soft text-butter-deep ring-butter/70",
};

/** Availability chip. Every capability claim on the marketing site carries one. */
export function StatusChip({ status, className, dark }: { status: Availability; className?: string; dark?: boolean }) {
  const a = AVAILABILITY[status];
  return (
    <span
      title={a.description}
      className={clsx(
        "inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-[0.06em] ring-1 ring-inset",
        dark ? "bg-white/10 text-paper ring-white/20" : STYLE[status],
        className,
      )}
    >
      <span className={clsx("size-1.5 rounded-full", status === "live" ? "bg-mint-deep" : "bg-current opacity-70")} aria-hidden />
      {a.label}
      <span className="sr-only">: {a.description}</span>
    </span>
  );
}

/** Legend that explains the availability labels. */
export function StatusLegend({ statuses, className }: { statuses: Availability[]; className?: string }) {
  return (
    <dl className={clsx("grid gap-x-6 gap-y-2 text-[13px] text-ink-2 sm:grid-cols-2", className)}>
      {statuses.map((s) => (
        <div key={s} className="flex items-start gap-2">
          <dt>
            <StatusChip status={s} />
          </dt>
          <dd className="leading-snug">{AVAILABILITY[s].description}</dd>
        </div>
      ))}
    </dl>
  );
}
