"use client";

import { clsx } from "clsx";
import { motion } from "framer-motion";
import { useId, type ReactNode } from "react";

/** Toggleable filter / interpretation chip. */
export function Chip({
  active,
  onClick,
  onRemove,
  children,
  tone = "ink",
  className,
  icon,
}: {
  active?: boolean;
  onClick?: () => void;
  onRemove?: () => void;
  children: ReactNode;
  tone?: "ink" | "cobalt" | "coral" | "mint" | "lilac" | "butter";
  className?: string;
  icon?: ReactNode;
}) {
  const activeTone = {
    ink: "bg-ink text-paper ring-ink",
    cobalt: "bg-cobalt text-white ring-cobalt",
    coral: "bg-coral text-ink ring-coral",
    mint: "bg-mint-soft text-mint-deep ring-mint",
    lilac: "bg-lilac-soft text-lilac-deep ring-lilac",
    butter: "bg-butter-soft text-butter-deep ring-butter",
  }[tone];
  const content = (
    <>
      {icon}
      <span>{children}</span>
    </>
  );
  if (onRemove) {
    return (
      <span className={clsx("inline-flex h-8 items-center gap-1.5 rounded-full pl-3 pr-1 text-[13px] font-semibold ring-1 ring-inset", activeTone, className)}>
        {content}
        <button
          type="button"
          onClick={onRemove}
          aria-label={`Remove ${typeof children === "string" ? children : "filter"}`}
          className="grid size-6 place-items-center rounded-full hover:bg-black/10"
        >
          <svg viewBox="0 0 12 12" className="size-3" aria-hidden>
            <path d="M3 3l6 6M9 3l-6 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
        </button>
      </span>
    );
  }
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={clsx(
        "inline-flex h-8 items-center gap-1.5 rounded-full px-3.5 text-[13px] font-semibold ring-1 ring-inset transition",
        active ? activeTone : "bg-white/70 text-ink-2 ring-line-2 hover:ring-ink/40 hover:text-ink",
        className,
      )}
    >
      {content}
    </button>
  );
}

export function Toggle({
  checked,
  onChange,
  label,
  description,
  disabled,
  size = "md",
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label?: ReactNode;
  description?: ReactNode;
  disabled?: boolean;
  size?: "sm" | "md";
}) {
  const id = useId();
  const sw = (
    <button
      id={id}
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={clsx(
        "relative shrink-0 rounded-full transition-colors disabled:opacity-40",
        size === "sm" ? "h-5 w-9" : "h-6 w-11",
        checked ? "bg-mint-deep" : "bg-ink/20",
      )}
    >
      <motion.span
        layout
        transition={{ type: "spring", stiffness: 500, damping: 32 }}
        className={clsx(
          "absolute top-0.5 rounded-full bg-white shadow",
          size === "sm" ? "size-4" : "size-5",
          checked ? (size === "sm" ? "left-[18px]" : "left-[22px]") : "left-0.5",
        )}
      />
      <span className="sr-only">{typeof label === "string" ? label : "Toggle"}</span>
    </button>
  );
  if (!label) return sw;
  return (
    <div className="flex items-start justify-between gap-4">
      <label htmlFor={id} className="cursor-pointer">
        <span className="block text-sm font-semibold text-ink">{label}</span>
        {description && <span className="mt-0.5 block text-[13px] text-ink-3">{description}</span>}
      </label>
      {sw}
    </div>
  );
}

export function Segmented<T extends string>({
  options,
  value,
  onChange,
  size = "md",
  className,
  ariaLabel,
}: {
  options: { value: T; label: ReactNode }[];
  value: T;
  onChange: (v: T) => void;
  size?: "sm" | "md";
  className?: string;
  ariaLabel?: string;
}) {
  const id = useId();
  return (
    <div role="radiogroup" aria-label={ariaLabel} className={clsx("inline-flex rounded-full bg-ink/5 p-1", className)}>
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(o.value)}
            className={clsx(
              "relative rounded-full font-semibold transition-colors",
              size === "sm" ? "px-3 py-1 text-[12px]" : "px-4 py-1.5 text-[13px]",
              active ? "text-ink" : "text-ink-3 hover:text-ink",
            )}
          >
            {active && (
              <motion.span
                layoutId={`seg-${id}`}
                className="absolute inset-0 rounded-full bg-white shadow-soft"
                transition={{ type: "spring", stiffness: 500, damping: 38 }}
              />
            )}
            <span className="relative">{o.label}</span>
          </button>
        );
      })}
    </div>
  );
}

/** Large selectable tile, used for plan / gift / option choices. */
export function ChoiceCard({
  selected,
  onClick,
  children,
  className,
  disabled,
}: {
  selected: boolean;
  onClick: () => void;
  children: ReactNode;
  className?: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      disabled={disabled}
      onClick={onClick}
      className={clsx(
        "relative rounded-2xl bg-white p-4 text-left ring-1 ring-inset transition disabled:opacity-50",
        selected ? "ring-2 ring-cobalt shadow-soft" : "ring-line hover:ring-ink/30",
        className,
      )}
    >
      {selected && (
        <span className="absolute right-3 top-3 grid size-5 place-items-center rounded-full bg-cobalt text-white">
          <svg viewBox="0 0 12 12" className="size-3" aria-hidden>
            <path d="M2.5 6.2l2.3 2.3 4.7-5" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      )}
      {children}
    </button>
  );
}
