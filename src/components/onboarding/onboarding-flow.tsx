"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { clsx } from "clsx";
import { ArrowLeft, ArrowRight, Check, Rocket } from "lucide-react";
import { useEffect, useState } from "react";
import { PLANS, type PlanId } from "@/config/brand";
import { useDemo } from "@/lib/store";
import { summarizeVoice } from "@/lib/ai/voice";
import { HydrationGate } from "@/components/hydration-gate";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import type { OnboardingDraft } from "./model";
import { BrandStep, PlanStep } from "./step-plan-brand";
import { VoiceStep } from "./step-voice";
import { CustomersStep } from "./step-customers";
import { AutomationStep, CardStep } from "./step-card-automation";
import { ReviewStep } from "./step-review";

const STEPS = [
  { id: "plan", label: "Plan" },
  { id: "brand", label: "Your brand" },
  { id: "voice", label: "Brand voice", optional: true },
  { id: "customers", label: "Customers", optional: true },
  { id: "card", label: "Default card" },
  { id: "automation", label: "Automation" },
  { id: "review", label: "Review & activate" },
] as const;

const IDS = Object.fromEntries(STEPS.map((s) => [s.id, s.id])) as Record<string, string>;

export function OnboardingFlow() {
  const params = useSearchParams();
  const plan = params.get("plan");
  return (
    <HydrationGate>
      <Flow initialPlan={PLANS.some((p) => p.id === plan) ? (plan as PlanId) : null} />
    </HydrationGate>
  );
}

function Flow({ initialPlan }: { initialPlan: PlanId | null }) {
  const router = useRouter();
  const toast = useToast();
  const reduce = useReducedMotion();
  const store = useDemo();
  const rule = store.automations.find((a) => a.id === "auto-main");

  const [d, setD] = useState<OnboardingDraft>(() => ({
    planId: initialPlan ?? store.planId,
    name: store.business.name,
    senderName: store.business.senderName,
    signature: store.business.signature,
    logo: store.business.logoDataUrl,
    brandColor: store.business.brandColor,
    voice: { ...store.business.voice },
    voiceGenerated: false,
    customerMode: "demo",
    newCustomers: [],
    cardId: store.business.defaultCardId,
    template: store.business.defaultMessage,
    sendTime: rule?.sendTime ?? "09:00",
    timezone: rule?.timezone ?? store.business.timezone,
    approval: rule?.approval ?? "review",
    giftOn: false,
    giftId: rule?.giftId ?? "coffee-card",
    giftAmount: rule?.giftAmount || 15,
    budget: rule?.monthlyGiftBudget || 120,
    vipOnly: true,
  }));
  const set = (p: Partial<OnboardingDraft>) => setD((x) => ({ ...x, ...p }));

  const [i, setI] = useState(initialPlan ? 1 : 0);
  const [dir, setDir] = useState(1);
  const [visited, setVisited] = useState(initialPlan ? 2 : 1);
  const [activating, setActivating] = useState(false);
  const step = STEPS[i];
  const total = STEPS.length;

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
  }, [i, reduce]);

  const go = (n: number) => {
    const next = Math.max(0, Math.min(total - 1, n));
    setDir(next > i ? 1 : -1);
    setI(next);
    setVisited((v) => Math.max(v, next + 1));
  };
  const goTo = (id: string) => go(STEPS.findIndex((s) => s.id === id));

  const canContinue = step.id !== "brand" || d.name.trim().length > 0;

  const activate = () => {
    setActivating(true);
    const summary = d.voice.summary?.trim() || summarizeVoice(d.voice);
    store.setPlan(d.planId);
    store.updateBusiness({
      name: d.name.trim(),
      logoDataUrl: d.logo,
      brandColor: d.brandColor,
      senderName: d.senderName.trim() || store.business.senderName,
      signature: d.signature,
      defaultMessage: d.template,
      defaultCardId: d.cardId,
      timezone: d.timezone === "recipient" ? store.business.timezone : d.timezone,
      voice: { ...d.voice, summary },
    });
    store.updateAutomation("auto-main", {
      cardId: d.cardId,
      messageTemplate: d.template,
      sendTime: d.sendTime || "09:00",
      timezone: d.timezone,
      approval: d.approval,
      giftMode: d.giftOn ? "gift" : "card-only",
      giftId: d.giftOn ? d.giftId : null,
      giftAmount: d.giftOn ? d.giftAmount : 0,
      monthlyGiftBudget: d.giftOn ? d.budget : 0,
      giftSegmentTag: d.giftOn && d.vipOnly ? "VIP" : null,
    });
    if (d.newCustomers.length) store.importCustomers(d.newCustomers);
    store.completeOnboarding();
    toast({
      title: "Your demo workspace is ready",
      body: `${d.name.trim()} is set to celebrate. Start by reviewing upcoming birthdays.`,
      tone: "success",
    });
    router.push("/app");
  };

  const props = { d, set, step: i + 1, total };

  return (
    <div className="mx-auto w-full max-w-7xl px-4 pb-32 pt-6 sm:px-6 lg:grid lg:grid-cols-[220px_1fr] lg:gap-12 lg:px-10 lg:pt-12">
      {/* Progress: rail on desktop */}
      <nav aria-label="Onboarding progress" className="hidden lg:block">
        <ol className="sticky top-24 space-y-1">
          {STEPS.map((s, n) => {
            const done = n < i;
            const current = n === i;
            const reachable = n < visited;
            return (
              <li key={s.id}>
                <button
                  type="button"
                  disabled={!reachable}
                  onClick={() => go(n)}
                  aria-current={current ? "step" : undefined}
                  className={clsx(
                    "flex w-full items-center gap-3 rounded-xl px-2.5 py-2 text-left text-[14px] transition",
                    current ? "bg-white font-semibold text-ink shadow-soft ring-1 ring-line" : reachable ? "text-ink-2 hover:bg-white/60" : "text-ink-3/70",
                  )}
                >
                  <span
                    className={clsx(
                      "grid size-6 shrink-0 place-items-center rounded-full font-grotesk text-[12px] font-bold",
                      done ? "bg-mint-deep text-white" : current ? "bg-cobalt text-white" : "bg-ink/5 text-ink-3",
                    )}
                  >
                    {done ? <Check className="size-3.5" /> : n + 1}
                  </span>
                  <span className="flex-1">{s.label}</span>
                  {"optional" in s && s.optional && <span className="text-[11px] font-normal text-ink-3">Optional</span>}
                </button>
              </li>
            );
          })}
        </ol>
      </nav>

      <div className="min-w-0">
        {/* Progress: compact bar on mobile */}
        <div className="mb-6 lg:hidden">
          <div className="flex gap-1" aria-hidden>
            {STEPS.map((s, n) => (
              <span key={s.id} className={clsx("h-1.5 flex-1 rounded-full transition-colors", n <= i ? "bg-cobalt" : "bg-ink/10")} />
            ))}
          </div>
          <p className="mt-2 text-[13px] font-semibold text-ink-2">
            {step.label}
            {"optional" in step && step.optional ? <span className="font-normal text-ink-3"> · Optional</span> : null}
          </p>
        </div>

        <AnimatePresence mode="wait" initial={false} custom={dir}>
          <motion.div
            key={step.id}
            custom={dir}
            initial={reduce ? { opacity: 0 } : { opacity: 0, x: dir * 36 }}
            animate={{ opacity: 1, x: 0 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, x: dir * -36 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          >
            {step.id === "plan" && <PlanStep {...props} />}
            {step.id === "brand" && <BrandStep {...props} />}
            {step.id === "voice" && <VoiceStep {...props} />}
            {step.id === "customers" && <CustomersStep {...props} />}
            {step.id === "card" && <CardStep {...props} />}
            {step.id === "automation" && <AutomationStep {...props} />}
            {step.id === "review" && <ReviewStep d={d} step={i + 1} total={total} goTo={goTo} ids={IDS} />}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Step nav */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-paper/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center gap-2 px-4 py-3 sm:px-6 lg:px-10">
          <Button variant="ghost" onClick={() => go(i - 1)} disabled={i === 0} icon={<ArrowLeft className="size-4" />}>
            Back
          </Button>
          <div className="flex-1" />
          {"optional" in step && step.optional && (
            <Button variant="ghost" onClick={() => go(i + 1)}>
              Skip
            </Button>
          )}
          {step.id === "review" ? (
            <Button size="lg" onClick={activate} disabled={activating} icon={<Rocket className="size-4" />}>
              {activating ? "Setting up…" : "Activate demo workspace"}
            </Button>
          ) : (
            <Button size="lg" variant="ink" onClick={() => go(i + 1)} disabled={!canContinue} iconRight={<ArrowRight className="size-4" />}>
              Continue
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
