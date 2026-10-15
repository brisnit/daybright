"use client";

import { AnimatePresence, motion } from "framer-motion";
import { clsx } from "clsx";
import { useEffect, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";

function useLockAndEscape(open: boolean, onClose: () => void, ref: React.RefObject<HTMLDivElement | null>) {
  useEffect(() => {
    if (!open) return;
    const prev = document.activeElement as HTMLElement | null;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "Tab" && ref.current) {
        const els = ref.current.querySelectorAll<HTMLElement>(
          'a[href],button:not([disabled]),textarea,input:not([disabled]),select,[tabindex]:not([tabindex="-1"])',
        );
        if (!els.length) return;
        const first = els[0];
        const last = els[els.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener("keydown", onKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const t = setTimeout(() => {
      const target = ref.current?.querySelector<HTMLElement>("[data-autofocus], input, textarea, select, button");
      target?.focus();
    }, 50);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
      clearTimeout(t);
      prev?.focus?.();
    };
  }, [open, onClose, ref]);
}

export function Drawer({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  width = "max-w-xl",
}: {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  description?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  width?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useLockAndEscape(open, onClose, ref);
  if (typeof document === "undefined") return null;
  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[80]">
          <motion.div
            className="absolute inset-0 bg-ink/35 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            ref={ref}
            role="dialog"
            aria-modal="true"
            className={clsx("absolute inset-y-0 right-0 flex w-full flex-col bg-paper shadow-lift sm:rounded-l-3xl", width)}
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 380, damping: 40 }}
          >
            <div className="flex items-start justify-between gap-4 border-b border-line px-6 py-5">
              <div>
                <h2 className="font-display text-2xl font-semibold tracking-tight">{title}</h2>
                {description && <p className="mt-1 text-sm text-ink-3">{description}</p>}
              </div>
              <CloseButton onClick={onClose} />
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>
            {footer && <div className="border-t border-line bg-white/60 px-6 py-4">{footer}</div>}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}

export function Modal({
  open,
  onClose,
  title,
  children,
  footer,
  width = "max-w-lg",
  bare,
}: {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  width?: string;
  bare?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useLockAndEscape(open, onClose, ref);
  if (typeof document === "undefined") return null;
  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[90] grid place-items-end overflow-y-auto p-0 sm:place-items-center sm:p-6">
          <motion.div
            className="fixed inset-0 bg-ink/40 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            ref={ref}
            role="dialog"
            aria-modal="true"
            className={clsx("relative w-full rounded-t-3xl bg-paper shadow-lift sm:rounded-3xl", width, !bare && "p-6")}
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 420, damping: 36 }}
          >
            {title && (
              <div className={clsx("mb-4 flex items-start justify-between gap-4", bare && "px-6 pt-6")}>
                <h2 className="font-display text-2xl font-semibold tracking-tight">{title}</h2>
                <CloseButton onClick={onClose} />
              </div>
            )}
            {!title && (
              <div className="absolute right-3 top-3 z-10">
                <CloseButton onClick={onClose} />
              </div>
            )}
            {children}
            {footer && <div className={clsx("mt-6 flex flex-wrap justify-end gap-2", bare && "px-6 pb-6")}>{footer}</div>}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}

export function CloseButton({ onClick, label = "Close" }: { onClick: () => void; label?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="grid size-9 shrink-0 place-items-center rounded-full bg-white text-ink ring-1 ring-line transition hover:bg-cream"
    >
      <svg viewBox="0 0 16 16" className="size-4" aria-hidden>
        <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    </button>
  );
}
