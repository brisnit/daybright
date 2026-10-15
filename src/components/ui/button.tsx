import Link from "next/link";
import { clsx } from "clsx";
import type { ComponentProps, ReactNode } from "react";

type Variant = "primary" | "ink" | "coral" | "outline" | "ghost" | "soft" | "white" | "danger";
type Size = "sm" | "md" | "lg";

const base =
  "relative inline-flex items-center justify-center gap-2 font-semibold whitespace-nowrap rounded-full transition-[transform,background-color,box-shadow,color] duration-150 active:translate-y-px disabled:opacity-45 disabled:pointer-events-none select-none";

const variants: Record<Variant, string> = {
  primary: "bg-cobalt text-white shadow-[0_1px_0_rgb(26_47_158),0_8px_20px_-10px_rgb(36_70_216/0.8)] hover:bg-cobalt-deep",
  ink: "bg-ink text-paper hover:bg-ink-2 shadow-[0_8px_20px_-12px_rgb(28_24_56/0.8)]",
  coral: "bg-coral text-ink hover:bg-[#ff806e] shadow-[0_1px_0_rgb(201_64_44),0_8px_20px_-10px_rgb(255_107_87/0.8)]",
  outline: "bg-white/70 text-ink ring-1 ring-inset ring-line-2 hover:ring-ink/40 hover:bg-white",
  ghost: "text-ink hover:bg-ink/5",
  soft: "bg-cobalt-soft text-cobalt-deep hover:bg-[#d6defe]",
  white: "bg-white text-ink hover:bg-paper shadow-soft",
  danger: "bg-white text-coral-deep ring-1 ring-inset ring-coral/40 hover:bg-coral-soft",
};

const sizes: Record<Size, string> = {
  sm: "h-8 px-3.5 text-[13px]",
  md: "h-10 px-5 text-sm",
  lg: "h-13 px-7 text-[15px]",
};

type Common = { variant?: Variant; size?: Size; icon?: ReactNode; iconRight?: ReactNode; className?: string; children?: ReactNode };

export function buttonClass({ variant = "primary", size = "md", className }: { variant?: Variant; size?: Size; className?: string } = {}) {
  return clsx(base, variants[variant], sizes[size], className);
}

export function Button({ variant, size, icon, iconRight, className, children, type = "button", ...rest }: Common & ComponentProps<"button">) {
  return (
    <button type={type} className={buttonClass({ variant, size, className })} {...rest}>
      {icon}
      {children}
      {iconRight}
    </button>
  );
}

export function ButtonLink({ variant, size, icon, iconRight, className, children, ...rest }: Common & ComponentProps<typeof Link>) {
  return (
    <Link className={buttonClass({ variant, size, className })} {...rest}>
      {icon}
      {children}
      {iconRight}
    </Link>
  );
}
