"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { clsx } from "clsx";
import {
  Activity,
  CalendarHeart,
  CreditCard,
  Gift,
  LayoutDashboard,
  Menu,
  Palette,
  RotateCcw,
  Sparkles,
  SquareStack,
  Users,
  Workflow,
  X,
} from "lucide-react";
import { Mark } from "@/components/brand/logo";
import { BRAND, getPlan } from "@/config/brand";
import { useDemo } from "@/lib/store";
import { Modal } from "@/components/ui/overlay";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { initials } from "@/components/cards/card-art";
import { HydrationGate } from "@/components/hydration-gate";
import { PreviewBanner } from "@/components/site/preview-banner";

export const APP_NAV = [
  { href: "/app", label: "Overview", icon: LayoutDashboard },
  { href: "/app/review", label: "Review birthdays", icon: CalendarHeart, badge: "review" as const },
  { href: "/app/customers", label: "Customers", icon: Users },
  { href: "/app/cards", label: "Cards", icon: SquareStack },
  { href: "/app/studio", label: "Card Studio", icon: Sparkles },
  { href: "/app/gifts", label: "Gifts", icon: Gift, badge: "gifts" as const },
  { href: "/app/automations", label: "Automations", icon: Workflow },
  { href: "/app/activity", label: "Activity", icon: Activity },
  { href: "/app/billing", label: "Plan & billing", icon: CreditCard },
  { href: "/app/brand", label: "Brand settings", icon: Palette },
];

function useBadges() {
  const sends = useDemo((s) => s.sends);
  return {
    review: sends.filter((s) => s.status === "pending-review").length,
    gifts: sends.filter((s) => s.gift && (s.gift.status === "pending-approval" || s.gift.status === "held-budget")).length,
  };
}

function BusinessChip() {
  const business = useDemo((s) => s.business);
  const planId = useDemo((s) => s.planId);
  return (
    <Link href="/app/brand" className="flex items-center gap-3 rounded-2xl bg-white p-2.5 ring-1 ring-line transition hover:ring-ink/20">
      {business.logoDataUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={business.logoDataUrl} alt="" className="size-10 rounded-xl object-cover" />
      ) : (
        <span className="grid size-10 shrink-0 place-items-center rounded-xl text-sm font-bold text-white" style={{ background: business.brandColor }}>
          {initials(business.name)}
        </span>
      )}
      <span className="min-w-0">
        <span className="block truncate text-sm font-semibold">{business.name}</span>
        <span className="block text-[12px] text-ink-3">{getPlan(planId).name} plan</span>
      </span>
    </Link>
  );
}

function NavList({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const badges = useBadges();
  return (
    <nav aria-label="Workspace" className="flex flex-col gap-0.5">
      {APP_NAV.map((n) => {
        const active = n.href === "/app" ? pathname === "/app" : pathname.startsWith(n.href);
        const count = n.badge ? badges[n.badge] : 0;
        return (
          <Link
            key={n.href}
            href={n.href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={clsx(
              "group flex items-center gap-3 rounded-xl px-3 py-2 text-[14px] font-semibold transition",
              active ? "bg-ink text-paper" : "text-ink-2 hover:bg-ink/5 hover:text-ink",
            )}
          >
            <n.icon className={clsx("size-[18px]", active ? "text-butter" : "text-ink-3 group-hover:text-ink")} aria-hidden />
            <span className="flex-1">{n.label}</span>
            {count > 0 && (
              <span className={clsx("rounded-full px-1.5 text-[11px] font-bold", active ? "bg-butter text-ink" : "bg-coral text-ink")}>{count}</span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}

function DemoFooter() {
  const [confirm, setConfirm] = useState(false);
  const reset = useDemo((s) => s.reset);
  const toast = useToast();
  const router = useRouter();
  return (
    <>
      <div className="rounded-2xl bg-butter-soft p-3 text-[12px] text-butter-deep">
        <p className="flex items-center gap-1.5 font-bold uppercase tracking-wide">
          <span className="size-1.5 rounded-full bg-butter-deep" /> Demo workspace
        </p>
        <p className="mt-1 leading-snug text-ink-2">Sample data. Nothing is sent or charged. Changes save in this browser.</p>
        <button type="button" onClick={() => setConfirm(true)} className="mt-2 inline-flex items-center gap-1 font-semibold text-ink underline-offset-2 hover:underline">
          <RotateCcw className="size-3.5" aria-hidden /> Reset demo
        </button>
      </div>
      <Modal
        open={confirm}
        onClose={() => setConfirm(false)}
        title="Reset the demo?"
        footer={
          <>
            <Button variant="outline" onClick={() => setConfirm(false)}>
              Cancel
            </Button>
            <Button
              variant="ink"
              onClick={() => {
                reset();
                setConfirm(false);
                toast({ title: "Demo reset", body: "Sample customers, cards and settings are back to the start.", tone: "success" });
                router.push("/app");
              }}
            >
              Reset everything
            </Button>
          </>
        }
      >
        <p className="text-ink-2">This restores the sample business, customers, automations and activity. Edits you made in this browser will be cleared.</p>
      </Modal>
    </>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setOpen(false);
  }

  return (
    <div className="flex min-h-dvh bg-[#FBF6EE]">
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-dvh w-[260px] shrink-0 flex-col gap-5 border-r border-line bg-paper px-4 py-5 lg:flex">
        <Link href="/" className="flex items-center gap-2 px-1">
          <Mark className="size-7" />
          <span className="font-display text-lg font-semibold" style={{ fontVariationSettings: '"SOFT" 100, "WONK" 1' }}>
            {BRAND.name}
          </span>
        </Link>
        <BusinessChip />
        <div className="-mx-1 flex-1 overflow-y-auto px-1">
          <NavList />
        </div>
        <DemoFooter />
      </aside>

      {/* Mobile top bar */}
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="sticky top-0 z-40 flex h-14 items-center gap-3 border-b border-line bg-paper/90 px-4 backdrop-blur lg:hidden">
          <button type="button" onClick={() => setOpen(true)} aria-label="Open navigation" className="grid size-9 place-items-center rounded-full bg-white ring-1 ring-line">
            <Menu className="size-5" />
          </button>
          <Link href="/" className="flex items-center gap-2">
            <Mark className="size-6" />
            <span className="font-display font-semibold">{BRAND.name}</span>
          </Link>
          <span className="ml-auto rounded-full bg-butter-soft px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-butter-deep">Demo</span>
        </div>
        <AnimatePresence>
          {open && (
            <div className="fixed inset-0 z-[70] lg:hidden">
              <motion.div className="absolute inset-0 bg-ink/40" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOpen(false)} />
              <motion.aside
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={{ type: "spring", stiffness: 400, damping: 40 }}
                className="absolute inset-y-0 left-0 flex w-[290px] flex-col gap-4 overflow-y-auto bg-paper px-4 py-4"
              >
                <div className="flex items-center justify-between">
                  <Link href="/" className="flex items-center gap-2">
                    <Mark className="size-7" />
                    <span className="font-display text-lg font-semibold">{BRAND.name}</span>
                  </Link>
                  <button type="button" onClick={() => setOpen(false)} aria-label="Close navigation" className="grid size-9 place-items-center rounded-full bg-white ring-1 ring-line">
                    <X className="size-5" />
                  </button>
                </div>
                <BusinessChip />
                <NavList onNavigate={() => setOpen(false)} />
                <div className="mt-auto">
                  <DemoFooter />
                </div>
              </motion.aside>
            </div>
          )}
        </AnimatePresence>
        <main id="main" className="min-w-0 flex-1">
          <PreviewBanner variant="app" />
          <HydrationGate>{children}</HydrationGate>
        </main>
      </div>
    </div>
  );
}

/** Standard page header used across workspace pages. */
export function PageHeader({
  title,
  description,
  actions,
  eyebrow,
}: {
  title: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  eyebrow?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        {eyebrow && <p className="mb-1 text-[12px] font-bold uppercase tracking-[0.14em] text-ink-3">{eyebrow}</p>}
        <h1 className="font-display text-[28px] font-semibold leading-tight tracking-tight sm:text-[34px]">{title}</h1>
        {description && <p className="mt-1.5 max-w-2xl text-[15px] text-ink-2">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

/** Content container for workspace pages. */
export function AppPage({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={clsx("mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-10 lg:py-10", className)}>{children}</div>;
}

/** White panel surface. */
export function Panel({ children, className, as: As = "section" }: { children: React.ReactNode; className?: string; as?: "section" | "div" }) {
  return <As className={clsx("rounded-3xl bg-white p-5 ring-1 ring-line sm:p-6", className)}>{children}</As>;
}
