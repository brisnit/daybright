"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { clsx } from "clsx";
import { Menu, Search, X } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { ButtonLink } from "@/components/ui/button";

export const SITE_NAV = [
  { href: "/cards", label: "Cards" },
  { href: "/studio", label: "Card Studio" },
  { href: "/gifts", label: "Gifts" },
  { href: "/business", label: "For business" },
  { href: "/pricing", label: "Pricing" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

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
        scrolled ? "bg-paper/85 shadow-[0_1px_0_var(--color-line)] backdrop-blur-md" : "bg-paper/0",
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6 lg:h-[72px]">
        <Logo />
        <nav aria-label="Main" className="ml-6 hidden items-center gap-1 lg:flex">
          {SITE_NAV.map((n) => {
            const active = pathname === n.href || pathname.startsWith(n.href + "/");
            return (
              <Link
                key={n.href}
                href={n.href}
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
          <Link
            href="/search"
            className="hidden h-10 w-56 items-center gap-2 rounded-full bg-white/80 px-4 text-[14px] text-ink-3 ring-1 ring-inset ring-line-2 transition hover:ring-ink/30 md:flex xl:w-64"
          >
            <Search className="size-4" aria-hidden />
            Search cards &amp; gifts
          </Link>
          <Link href="/search" aria-label="Search cards and gifts" className="grid size-10 place-items-center rounded-full bg-white ring-1 ring-line-2 md:hidden">
            <Search className="size-4" />
          </Link>
          <span className="hidden sm:block">
            <ButtonLink href="/app" variant="ink" size="md">
              Explore business demo
            </ButtonLink>
          </span>
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
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
            aria-label="Mobile"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden border-t border-line bg-paper lg:hidden"
          >
            <div className="flex flex-col gap-1 px-4 py-4">
              {SITE_NAV.map((n) => (
                <Link key={n.href} href={n.href} className="rounded-xl px-3 py-3 text-lg font-semibold hover:bg-ink/5">
                  {n.label}
                </Link>
              ))}
              <ButtonLink href="/app" variant="ink" size="lg" className="mt-3">
                Explore business demo
              </ButtonLink>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
