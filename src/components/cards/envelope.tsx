"use client";

import { motion, useReducedMotion } from "framer-motion";
import { clsx } from "clsx";
import type { ReactNode } from "react";

export type EnvelopeStage = "closed" | "open" | "out";

/**
 * Envelope that opens and lets its card rise out.
 * Controlled: parent sets `stage`. Card content is passed as children (usually <CardFront>).
 * Sizing: the envelope is 4:3; the card is 72% of the envelope's width.
 */
export function Envelope({
  stage,
  children,
  color = "#FF6B57",
  liner = "#FFD45C",
  className,
  label,
  stamp = true,
  onClick,
  sealColor = "#2446D8",
}: {
  sealColor?: string;
  stage: EnvelopeStage;
  children?: ReactNode;
  color?: string;
  liner?: string;
  className?: string;
  label?: ReactNode;
  stamp?: boolean;
  onClick?: () => void;
}) {
  const reduce = useReducedMotion();
  const open = stage !== "closed";
  const out = stage === "out";
  const t = (d: number, delay = 0) => (reduce ? { duration: 0 } : { duration: d, delay, ease: [0.22, 1, 0.36, 1] as const });

  const Wrapper = onClick ? motion.button : motion.div;

  return (
    <Wrapper
      type={onClick ? "button" : undefined}
      onClick={onClick}
      className={clsx("relative block aspect-[4/3] w-full [perspective:1400px]", onClick && "cursor-pointer", className)}
      aria-label={onClick ? "Open the envelope" : undefined}
    >
      {/* back of envelope + liner */}
      <div className="absolute inset-0 rounded-[4%] shadow-[0_24px_40px_-24px_rgb(28_24_56/0.55)]" style={{ background: shade(color, -0.12) }} />
      <svg viewBox="0 0 400 300" className="absolute inset-0 size-full" aria-hidden>
        <path d="M12 8 H388 L200 150Z" fill={liner} />
        <g opacity=".35" stroke="#fff" strokeWidth="3">
          {Array.from({ length: 9 }).map((_, i) => (
            <path key={i} d={`M${40 + i * 40} 10 L${200 + (i - 4) * 6} 140`} />
          ))}
        </g>
      </svg>

      {/* card rising out — clipped at the envelope's bottom edge */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 top-[-400%] overflow-hidden" style={{ zIndex: out ? 30 : 1 }}>
        <motion.div
          className="pointer-events-auto absolute bottom-0 left-[14%] w-[72%]"
          initial={false}
          animate={out ? { y: "-56%", rotate: -2, opacity: 1 } : open ? { y: "-9%", rotate: 0, opacity: 1 } : { y: "28%", rotate: 0, opacity: 0 }}
          transition={out ? t(0.9, 0.05) : t(0.8, open ? 0.45 : 0)}
        >
          {children}
        </motion.div>
      </div>

      {/* front pocket */}
      <svg viewBox="0 0 400 300" className="pointer-events-none absolute inset-0 z-10 size-full" aria-hidden>
        <path d="M0 40 L200 175 L400 40 V284 a16 16 0 0 1 -16 16 H16 a16 16 0 0 1 -16 -16Z" fill={color} />
        <path d="M0 300 L170 160 M400 300 L230 160" stroke={shade(color, -0.18)} strokeWidth="2" opacity=".6" />
        <path d="M0 40 L200 175 L400 40" fill="none" stroke={shade(color, 0.15)} strokeWidth="2" opacity=".7" />
      </svg>

      {/* address label */}
      {label && (
        <div className="pointer-events-none absolute bottom-[14%] left-1/2 z-20 w-[48%] -translate-x-1/2 rounded-md bg-[#FFFDF6] px-3 py-2 text-center shadow-sm">
          {label}
        </div>
      )}
      {stamp && (
        <div className="pointer-events-none absolute right-[5%] top-[38%] z-20 w-[12%] rotate-3">
          <svg viewBox="0 0 40 48" aria-hidden>
            <rect x="1" y="1" width="38" height="46" fill="#FFFDF6" stroke="#E7DCC8" />
            <rect x="5" y="5" width="30" height="38" fill="#2446D8" />
            <circle cx="20" cy="22" r="8" fill="#FFD45C" />
            <path d="M12 36 H28" stroke="#FFF9F0" strokeWidth="2" />
          </svg>
        </div>
      )}

      {/* flap */}
      <motion.div
        className="absolute inset-x-0 top-0 h-[58%] origin-top [transform-style:preserve-3d]"
        style={{ zIndex: open ? 0 : 25 }}
        initial={false}
        animate={{ rotateX: open ? 180 : 0 }}
        transition={t(0.6)}
      >
        <svg viewBox="0 0 400 174" className="absolute inset-0 size-full [backface-visibility:hidden]" aria-hidden>
          <path d="M0 16 a16 16 0 0 1 16 -16 H384 a16 16 0 0 1 16 16 L200 174Z" fill={shade(color, 0.06)} />
          <path d="M0 16 L200 174 L400 16" fill="none" stroke={shade(color, -0.2)} strokeWidth="2" opacity=".5" />
        </svg>
        <svg viewBox="0 0 400 174" className="absolute inset-0 size-full [backface-visibility:hidden] [transform:rotateX(180deg)]" aria-hidden>
          <path d="M0 16 a16 16 0 0 1 16 -16 H384 a16 16 0 0 1 16 16 L200 174Z" fill={liner} />
        </svg>
        {/* wax seal */}
        {!open && (
          <div className="absolute left-1/2 top-[86%] grid aspect-square w-[11%] -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full shadow-md" style={{ background: sealColor }}>
            <svg viewBox="0 0 24 24" className="w-1/2" aria-hidden>
              <path d="M12 3v3M5.6 5.6l2.1 2.1M18.4 5.6l-2.1 2.1M3 12h3M18 12h3" stroke="#FFD45C" strokeWidth="2" strokeLinecap="round" />
              <path d="M7 15a5 5 0 0110 0z" fill="#FFD45C" />
            </svg>
          </div>
        )}
      </motion.div>
    </Wrapper>
  );
}

function shade(hex: string, amt: number) {
  const h = hex.replace("#", "");
  const n = parseInt(h.length === 3 ? h.split("").map((c) => c + c).join("") : h, 16);
  const ch = (v: number) => Math.max(0, Math.min(255, Math.round(amt < 0 ? v * (1 + amt) : v + (255 - v) * amt)));
  const r = ch((n >> 16) & 255), g = ch((n >> 8) & 255), b = ch(n & 255);
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
}
