"use client";

import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from "framer-motion";
import { clsx } from "clsx";
import type { ReactNode } from "react";

/** Gentle pointer-follow tilt for card previews. Disabled for reduced motion and touch. */
export function Tilt({ children, className, max = 8 }: { children: ReactNode; className?: string; max?: number }) {
  const reduce = useReducedMotion();
  const x = useMotionValue(0.5);
  const y = useMotionValue(0.5);
  const sx = useSpring(x, { stiffness: 220, damping: 20 });
  const sy = useSpring(y, { stiffness: 220, damping: 20 });
  const rotateY = useTransform(sx, [0, 1], [-max, max]);
  const rotateX = useTransform(sy, [0, 1], [max, -max]);
  const glareX = useTransform(sx, [0, 1], ["0%", "100%"]);
  const glare = useTransform(glareX, (gx) => `radial-gradient(circle at ${gx} 20%, rgb(255 255 255 / 0.35), transparent 55%)`);

  return (
    <div className={clsx("[perspective:1000px]", className)}>
      <motion.div
        style={reduce ? undefined : { rotateX, rotateY, transformStyle: "preserve-3d" }}
        onPointerMove={(e) => {
          if (reduce || e.pointerType === "touch") return;
          const r = e.currentTarget.getBoundingClientRect();
          x.set((e.clientX - r.left) / r.width);
          y.set((e.clientY - r.top) / r.height);
        }}
        onPointerLeave={() => {
          x.set(0.5);
          y.set(0.5);
        }}
        className="relative"
      >
        {children}
        {!reduce && (
          <motion.div
            aria-hidden
            className="pointer-events-none absolute inset-0 rounded-[6%/4.3%] opacity-0 transition-opacity duration-300 [.group:hover_&]:opacity-100"
            style={{ background: glare }}
          />
        )}
      </motion.div>
    </div>
  );
}
