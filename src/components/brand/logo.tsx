import Link from "next/link";
import { clsx } from "clsx";
import { BRAND } from "@/config/brand";

/** Sun-over-envelope mark. */
export function Mark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={clsx("shrink-0", className)} aria-hidden>
      <rect x="2" y="2" width="36" height="36" rx="11" fill="#2446D8" />
      <g stroke="#FFD45C" strokeWidth="2.4" strokeLinecap="round">
        <path d="M20 7.5v3.2M10.6 11.4l2.2 2.2M29.4 11.4l-2.2 2.2M7 20.5h3.2M29.8 20.5H33" />
      </g>
      <path d="M12.5 21.5a7.5 7.5 0 0115 0z" fill="#FFD45C" />
      <path d="M8.5 22.5h23v8a2 2 0 01-2 2h-19a2 2 0 01-2-2z" fill="#FFF9F0" />
      <path d="M8.8 23l11.2 7 11.2-7" fill="none" stroke="#FF6B57" strokeWidth="2.2" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

export function Logo({ className, href = "/", tone = "ink" }: { className?: string; href?: string; tone?: "ink" | "paper" }) {
  return (
    <Link href={href} className={clsx("inline-flex items-center gap-2", className)} aria-label={`${BRAND.name} home`}>
      <Mark className="size-8" />
      <span
        className={clsx(
          "font-display text-[22px] font-semibold tracking-tight",
          tone === "paper" ? "text-paper" : "text-ink",
        )}
        style={{ fontVariationSettings: '"SOFT" 100, "WONK" 1' }}
      >
        {BRAND.name}
      </span>
    </Link>
  );
}
