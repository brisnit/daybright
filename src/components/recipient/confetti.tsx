"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useMemo } from "react";

const COLORS = ["#2446D8", "#FF6B57", "#FFD45C", "#6FD8B1", "#BBA6F6", "#1C1838"];

/** Deterministic pseudo-random in [0,1) for piece i, channel k. */
function r(i: number, k: number) {
  const x = Math.sin(i * 127.1 + k * 311.7) * 43758.5453;
  return x - Math.floor(x);
}

/**
 * One-shot confetti burst from the center of its (relative) parent.
 * `burst` changes retrigger it. Renders nothing for reduced motion.
 */
export function ConfettiBurst({ burst, count = 46, extra = [] }: { burst: number; count?: number; extra?: string[] }) {
  const reduce = useReducedMotion();
  const pieces = useMemo(() => {
    const palette = [...extra, ...COLORS];
    return Array.from({ length: count }).map((_, i) => {
      const angle = r(i, 1) * Math.PI * 2;
      const dist = 140 + r(i, 2) * 260;
      return {
        i,
        x: Math.cos(angle) * dist,
        y: Math.sin(angle) * dist * 0.75 - 80,
        fall: 220 + r(i, 3) * 260,
        rot: (r(i, 4) - 0.5) * 900,
        w: 6 + r(i, 5) * 8,
        h: r(i, 6) > 0.55 ? 6 + r(i, 7) * 6 : 14 + r(i, 7) * 8,
        round: r(i, 8) > 0.7,
        color: palette[i % palette.length],
        delay: r(i, 9) * 0.18,
        dur: 1.6 + r(i, 10) * 1.1,
      };
    });
  }, [count, extra]);

  if (reduce || burst === 0) return null;

  return (
    <div key={burst} className="pointer-events-none absolute inset-0 z-40 overflow-visible" aria-hidden>
      <div className="absolute left-1/2 top-1/2">
        {pieces.map((p) => (
          <motion.span
            key={p.i}
            className="absolute block"
            style={{
              width: p.w,
              height: p.h,
              background: p.color,
              borderRadius: p.round ? 999 : 2,
              marginLeft: -p.w / 2,
              marginTop: -p.h / 2,
            }}
            initial={{ x: 0, y: 0, rotate: 0, opacity: 0, scale: 0.4 }}
            animate={{
              x: [0, p.x, p.x * 1.08],
              y: [0, p.y, p.y + p.fall],
              rotate: [0, p.rot * 0.5, p.rot],
              opacity: [0, 1, 1, 0],
              scale: [0.4, 1, 1, 0.9],
            }}
            transition={{ duration: p.dur, delay: p.delay, ease: [0.16, 1, 0.3, 1], times: [0, 0.35, 1] }}
          />
        ))}
      </div>
    </div>
  );
}

/** A few soft twinkling sparkles around a card. Static (still visible) for reduced motion. */
export function Sparkles({ color = "#FFD45C" }: { color?: string }) {
  const reduce = useReducedMotion();
  const spots = [
    { l: "-6%", t: "8%", s: 22, d: 0 },
    { l: "102%", t: "18%", s: 16, d: 0.5 },
    { l: "-4%", t: "72%", s: 14, d: 0.9 },
    { l: "98%", t: "84%", s: 24, d: 0.3 },
    { l: "48%", t: "-5%", s: 12, d: 1.2 },
  ];
  return (
    <div className="pointer-events-none absolute inset-0 z-30" aria-hidden>
      {spots.map((p, i) => (
        <motion.svg
          key={i}
          viewBox="0 0 24 24"
          className="absolute"
          style={{ left: p.l, top: p.t, width: p.s, height: p.s }}
          initial={{ opacity: 0, scale: 0.4 }}
          animate={reduce ? { opacity: 0.9, scale: 1 } : { opacity: [0, 1, 0.35, 1], scale: [0.4, 1.1, 0.8, 1], rotate: [0, 20, 0] }}
          transition={reduce ? { duration: 0.3 } : { duration: 2.4, delay: 0.4 + p.d, repeat: Infinity, repeatType: "mirror" }}
        >
          <path d="M12 0c.8 6.4 4.8 10.6 12 12-7.2 1.4-11.2 5.6-12 12-.8-6.4-4.8-10.6-12-12C7.2 10.6 11.2 6.4 12 0z" fill={color} />
        </motion.svg>
      ))}
    </div>
  );
}
