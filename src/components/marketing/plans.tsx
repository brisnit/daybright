"use client";

import { clsx } from "clsx";
import { Check, Sparkles } from "lucide-react";
import { PLANS, PRICING_COPY, money, type Plan } from "@/config/brand";
import { ButtonLink } from "@/components/ui/button";
import { Reveal } from "./primitives";

const ACCENT: Record<Plan["id"], { chip: string; dot: string }> = {
  starter: { chip: "bg-butter-soft text-butter-deep", dot: "bg-butter" },
  growth: { chip: "bg-butter text-ink", dot: "bg-coral" },
  scale: { chip: "bg-lilac-soft text-lilac-deep", dot: "bg-lilac" },
};

/** Three plan cards rendered from config. Growth (highlight) is set apart in ink. */
export function PlanCards({ compact = false }: { compact?: boolean }) {
  return (
    <div className="grid gap-5 md:grid-cols-3 md:items-stretch">
      {PLANS.map((plan, i) => {
        const hi = !!plan.highlight;
        const features = compact ? plan.features.slice(0, 4) : plan.features;
        return (
          <Reveal key={plan.id} delay={i * 0.06} className={clsx(hi && "md:-my-3")}>
            <article
              className={clsx(
                "relative flex h-full flex-col rounded-[2rem] p-6 sm:p-7",
                hi ? "bg-ink text-paper shadow-lift" : "bg-white text-ink shadow-soft ring-1 ring-line",
              )}
              aria-labelledby={`plan-${plan.id}`}
            >
              <div className="flex items-center justify-between gap-3">
                <h3 id={`plan-${plan.id}`} className="font-display text-2xl font-semibold tracking-tight">
                  {plan.name}
                </h3>
                {hi && <span className={clsx("rounded-full px-2.5 py-0.5 text-[12px] font-bold", ACCENT[plan.id].chip)}>Most flexible</span>}
              </div>
              <p className={clsx("mt-1 text-[14px]", hi ? "text-paper/70" : "text-ink-3")}>{plan.blurb}</p>
              <p className="mt-6 flex items-baseline gap-1">
                <span className="font-display text-6xl font-semibold tracking-tight">{money(plan.monthlyPrice)}</span>
                <span className={clsx("text-[15px] font-medium", hi ? "text-paper/70" : "text-ink-3")}>/month</span>
              </p>
              <p
                className={clsx(
                  "mt-3 inline-flex w-fit items-center gap-2 rounded-full px-3 py-1 font-grotesk text-[13px] font-bold",
                  hi ? "bg-white/10 text-paper" : "bg-ink/[0.05] text-ink",
                )}
              >
                <span className={clsx("size-2 rounded-full", ACCENT[plan.id].dot)} aria-hidden />
                Up to {plan.monthlySends.toLocaleString("en-US")} card sends a month
              </p>
              <ul className={clsx("mt-6 flex-1 space-y-2.5 text-[14px]", hi ? "text-paper/85" : "text-ink-2")}>
                {features.map((f) => (
                  <li key={f} className="flex gap-2">
                    <Check className={clsx("mt-0.5 size-4 shrink-0", hi ? "text-mint" : "text-mint-deep")} aria-hidden />
                    {f}
                  </li>
                ))}
                <li className="flex gap-2">
                  <Sparkles className={clsx("mt-0.5 size-4 shrink-0", hi ? "text-lilac" : "text-lilac-deep")} aria-hidden />
                  <span>
                    AI card creation and message help
                    <span className={clsx("block text-[12px]", hi ? "text-paper/55" : "text-ink-3")}>{PRICING_COPY.aiAllowance}</span>
                  </span>
                </li>
              </ul>
              <ButtonLink
                href={`/onboarding?plan=${plan.id}`}
                variant={hi ? "coral" : "outline"}
                size="lg"
                className="mt-7 w-full"
                aria-label={`Start setup with the ${plan.name} plan`}
              >
                Start with {plan.name}
              </ButtonLink>
            </article>
          </Reveal>
        );
      })}
    </div>
  );
}
