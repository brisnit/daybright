import { clsx } from "clsx";
import { Sparkles } from "lucide-react";
import type { ReactNode } from "react";
import type { GiftStatus, SendStatus } from "@/lib/types";

type Tone = "ink" | "cobalt" | "coral" | "mint" | "lilac" | "butter" | "neutral";

const tones: Record<Tone, string> = {
  ink: "bg-ink text-paper",
  cobalt: "bg-cobalt-soft text-cobalt-deep",
  coral: "bg-coral-soft text-coral-deep",
  mint: "bg-mint-soft text-mint-deep",
  lilac: "bg-lilac-soft text-lilac-deep",
  butter: "bg-butter-soft text-butter-deep",
  neutral: "bg-ink/5 text-ink-2",
};

export function Badge({ tone = "neutral", children, className, dot }: { tone?: Tone; children: ReactNode; className?: string; dot?: boolean }) {
  return (
    <span className={clsx("inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-0.5 text-[12px] font-semibold", tones[tone], className)}>
      {dot && <span className="size-1.5 rounded-full bg-current" />}
      {children}
    </span>
  );
}

export const SEND_STATUS: Record<SendStatus, { label: string; tone: Tone }> = {
  "pending-review": { label: "Needs review", tone: "butter" },
  scheduled: { label: "Scheduled", tone: "cobalt" },
  sent: { label: "Sent", tone: "lilac" },
  opened: { label: "Opened", tone: "mint" },
  "gift-claimed": { label: "Gift claimed", tone: "mint" },
  "awaiting-address": { label: "Awaiting address", tone: "butter" },
  "needs-attention": { label: "Needs attention", tone: "coral" },
  skipped: { label: "Skipped", tone: "neutral" },
};

export const GIFT_STATUS: Record<GiftStatus, { label: string; tone: Tone }> = {
  "pending-approval": { label: "Gift needs approval", tone: "butter" },
  approved: { label: "Gift approved", tone: "mint" },
  "held-budget": { label: "Gift held: budget", tone: "coral" },
  claimed: { label: "Gift claimed", tone: "mint" },
  "awaiting-address": { label: "Awaiting address", tone: "butter" },
  shipped: { label: "Gift shipping", tone: "mint" },
  declined: { label: "Card only", tone: "neutral" },
};

export function StatusBadge({ status }: { status: SendStatus }) {
  const s = SEND_STATUS[status];
  return (
    <Badge tone={s.tone} dot>
      {s.label}
    </Badge>
  );
}

export function GiftBadge({ status }: { status: GiftStatus }) {
  const s = GIFT_STATUS[status];
  return <Badge tone={s.tone}>{s.label}</Badge>;
}

/** Label for AI-generated demo output. Never implies a live model. */
export function AIDemoLabel({ className, children = "Demo example" }: { className?: string; children?: ReactNode }) {
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1 rounded-full bg-lilac-soft px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-lilac-deep",
        className,
      )}
      title="Generated previews in this prototype are curated demo examples, not output from a live AI model."
    >
      <Sparkles className="size-3" aria-hidden />
      {children}
    </span>
  );
}

/** Marks actions that would cost money or deliver something in production. */
export function SimulatedNote({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <p className={clsx("inline-flex items-center gap-1.5 rounded-lg bg-butter-soft px-2.5 py-1.5 text-[12px] font-medium text-butter-deep", className)}>
      <svg viewBox="0 0 16 16" className="size-3.5 shrink-0" aria-hidden>
        <circle cx="8" cy="8" r="6.5" fill="none" stroke="currentColor" strokeWidth="1.4" />
        <path d="M8 4.8v3.6M8 10.6v.4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
      {children}
    </p>
  );
}
