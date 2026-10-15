"use client";

import { motion } from "framer-motion";
import { clsx } from "clsx";
import type { ReactNode } from "react";

/** Gentle one-time scroll reveal. framer-motion's MotionConfig handles reduced motion globally. */
export function Reveal({
  children,
  className,
  delay = 0,
  y = 18,
  as = "div",
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  as?: "div" | "li" | "section";
}) {
  const Comp = as === "li" ? motion.li : as === "section" ? motion.section : motion.div;
  return (
    <Comp
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -8% 0px" }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </Comp>
  );
}

export function Container({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={clsx("mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8", className)}>{children}</div>;
}

/** Small label above a section headline. */
export function Eyebrow({
  children,
  tone = "cobalt",
  className,
}: {
  children: ReactNode;
  tone?: "cobalt" | "coral" | "mint" | "lilac" | "butter" | "paper";
  className?: string;
}) {
  const dot = {
    cobalt: "bg-cobalt",
    coral: "bg-coral",
    mint: "bg-mint",
    lilac: "bg-lilac",
    butter: "bg-butter",
    paper: "bg-butter",
  }[tone];
  return (
    <p
      className={clsx(
        "inline-flex items-center gap-2 font-grotesk text-[13px] font-semibold uppercase tracking-[0.14em]",
        tone === "paper" ? "text-paper/80" : "text-ink-2",
        className,
      )}
    >
      <span className={clsx("size-2 rounded-full", dot)} aria-hidden />
      {children}
    </p>
  );
}

/** Big editorial headline. */
export function Display({
  children,
  className,
  as: Tag = "h2",
  id,
}: {
  children: ReactNode;
  className?: string;
  as?: "h1" | "h2" | "h3";
  id?: string;
}) {
  return (
    <Tag id={id} className={clsx("font-display font-semibold tracking-tight text-balance", className)}>
      {children}
    </Tag>
  );
}

/** Hand-drawn squiggle underline used under a highlighted word. */
export function Squiggle({ className, color = "#FF6B57" }: { className?: string; color?: string }) {
  return (
    <svg viewBox="0 0 220 16" preserveAspectRatio="none" className={clsx("pointer-events-none", className)} aria-hidden>
      <path
        d="M3 11 C 30 3, 48 3, 70 9 S 112 15, 136 8 S 184 2, 217 9"
        fill="none"
        stroke={color}
        strokeWidth="4"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** Small numbered step badge. */
export function StepNumber({ n, className, tone = "ink" }: { n: number; className?: string; tone?: "ink" | "butter" }) {
  return (
    <span
      className={clsx(
        "grid size-8 shrink-0 place-items-center rounded-full font-grotesk text-sm font-bold",
        tone === "butter" ? "bg-butter text-ink" : "bg-ink text-paper",
        className,
      )}
      aria-hidden
    >
      {n}
    </span>
  );
}
