"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { clsx } from "clsx";
import { Menu, X } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { useCharter } from "@/components/charter/charter-provider";

export const SITE_NAV = [
  { href: "/#compliance", label: "Compliance" },
  { href: "/#sample", label: "Sample card" },
  { href: "/#integrations", label: "Integrations" },
  { href: "/pricing", label: "Pricing" },
  { href: "/personal", label: "Personal cards" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { openReservation, openSample } = useCharter();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setOpen(false);
  }

  return (
    <header
      className={clsx(
        "sticky top-0 z-50 transition-[background-color,box-shadow,backdrop-filter]",
        scrolled || open ? "bg-paper/90 shadow-[0_1px_0_var(--color-line)] backdrop-blur-md" : "bg-transparent",
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6 lg:h-[72px] lg:px-8">
        <Logo />
        <nav aria-label="Main" className="ml-4 hidden items-center gap-0.5 lg:flex">
          {SITE_NAV.map((n) => {
            const active = !n.href.includes("#") && (pathname === n.href || pathname.startsWith(n.href + "/"));
            return (
              <Link
                key={n.href}
                href={n.href}
                aria-current={active ? "page" : undefined}
                className={clsx(
                  "rounded-full px-3.5 py-2 text-[14px] font-semibold transition",
                  active ? "bg-ink/[0.06] text-ink" : "text-ink-2 hover:bg-ink/[0.04] hover:text-ink",
                )}
              >
                {n.label}
              </Link>
            );
          })}
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <Link href="/app" className="hidden rounded-full px-3 py-2 text-[14px] font-semibold text-ink-2 hover:text-ink xl:inline-flex">
            Product preview
          </Link>
          <span className="hidden sm:block">
            <Button variant="ink" size="md" onClick={() => openReservation(null, "header")}>
              Claim Charter Access
            </Button>
          </span>
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? "Close menu" : "Open menu"}
            className="grid size-10 place-items-center rounded-full bg-white ring-1 ring-line-2 lg:hidden"
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>
      <AnimatePresence>
        {open && (
          <motion.nav
            id="mobile-nav"
            aria-label="Mobile"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden border-t border-line bg-paper lg:hidden"
          >
            <div className="flex flex-col gap-1 px-4 py-4">
              {SITE_NAV.map((n) => (
                <Link key={n.href} href={n.href} onClick={() => setOpen(false)} className="rounded-xl px-3 py-3 text-lg font-semibold hover:bg-ink/5">
                  {n.label}
                </Link>
              ))}
              <Link href="/app" className="rounded-xl px-3 py-3 text-lg font-semibold hover:bg-ink/5">
                Product preview
              </Link>
              <div className="mt-3 grid gap-2">
                <Button
                  variant="ink"
                  size="lg"
                  onClick={() => {
                    setOpen(false);
                    openReservation(null, "mobile-menu");
                  }}
                >
                  Claim Founding Charter Access
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => {
                    setOpen(false);
                    openSample("mobile-menu");
                  }}
                >
                  Unwrap a sample card
                </Button>
              </div>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}

