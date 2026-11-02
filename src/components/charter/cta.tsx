"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { clsx } from "clsx";
import { CHARTER } from "@/config/charter";
import { Button } from "@/components/ui/button";
import { useCharter } from "./charter-provider";

export function CharterButton({
  source,
  tier = null,
  size = "lg",
  variant = "ink",
  className,
  children = "Request Founding Charter Access",
}: {
  source: string;
  tier?: "solo" | "agency" | null;
  size?: "sm" | "md" | "lg";
  variant?: "ink" | "primary" | "white" | "coral";
  className?: string;
  children?: React.ReactNode;
}) {
  const { openReservation } = useCharter();
  return (
    <Button size={size} variant={variant} className={className} onClick={() => openReservation(tier, source)}>
      {children}
    </Button>
  );
}

export function SampleButton({ source, className, tone = "light" }: { source: string; className?: string; tone?: "light" | "dark" }) {
  const { openSample } = useCharter();
  return (
    <button
      type="button"
      onClick={() => openSample(source)}
      className={clsx(
        "group inline-flex h-13 items-center gap-2 rounded-full px-2 text-[15px] font-semibold underline-offset-4 hover:underline",
        tone === "dark" ? "text-paper" : "text-ink",
        className,
      )}
    >
      Open a Sample Card
      <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
    </button>
  );
}

/** Repeated mid-page conversion band. */
export function CharterBand({ source, title, body }: { source: string; title: string; body: string }) {
  return (
    <div className="linen-dark relative overflow-hidden rounded-[2rem] px-6 py-10 text-paper sm:px-10 sm:py-12">
      <div className="pointer-events-none absolute -right-16 -top-16 size-64 rounded-full border border-white/10" aria-hidden />
      <div className="pointer-events-none absolute -right-4 -top-4 size-40 rounded-full border border-white/10" aria-hidden />
      <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-2xl">
          <h2 className="font-display text-[28px] font-semibold leading-tight tracking-tight text-balance sm:text-4xl">{title}</h2>
          <p className="mt-3 text-[15px] leading-relaxed text-paper/75">{body}</p>
        </div>
        <div className="flex shrink-0 flex-col items-start gap-2 sm:items-end">
          <CharterButton source={source} variant="white" />
          <p className="text-[12px] text-paper/60">
            Limited to {CHARTER.seats} founding firms · Nonbinding · No payment
          </p>
        </div>
      </div>
    </div>
  );
}

/** Mobile sticky conversion bar, shown after the hero scrolls away. */
export function StickyCharterBar() {
  const [show, setShow] = useState(false);
  const { openReservation } = useCharter();
  useEffect(() => {
    const onScroll = () => {
      const nearEnd = window.innerHeight + window.scrollY > document.body.scrollHeight - 500;
      setShow(window.scrollY > 640 && !nearEnd);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          className="fixed inset-x-3 bottom-3 z-40 flex items-center gap-3 rounded-2xl bg-ink p-2.5 pl-4 text-paper shadow-lift sm:hidden"
        >
          <p className="min-w-0 flex-1 text-[12.5px] leading-tight">
            <span className="block font-semibold">Founding Charter</span>
            <span className="text-paper/70">{CHARTER.seats} seats · nonbinding, no payment</span>
          </p>
          <Button size="md" variant="white" onClick={() => openReservation(null, "sticky-mobile")}>
            Request access
          </Button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
