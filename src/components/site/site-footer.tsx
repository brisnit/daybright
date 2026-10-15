import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { BRAND, PRICING_COPY } from "@/config/brand";

const COLS = [
  { title: "Send", links: [["/cards", "Birthday cards"], ["/studio", "Card Studio"], ["/gifts", "Gifts"], ["/search", "Search cards & gifts"]] },
  { title: "Business", links: [["/business", "How it works"], ["/pricing", "Plans & pricing"], ["/onboarding", "Start setup"], ["/app", "Explore business demo"]] },
  { title: "See it", links: [["/open?id=demo-card", "Example: card only"], ["/open?id=demo-gift", "Example: card + gift"]] },
] as const;

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-line bg-cream/60">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-[1.4fr_repeat(3,1fr)]">
        <div className="max-w-xs">
          <Logo />
          <p className="mt-4 text-sm leading-relaxed text-ink-2">{BRAND.tagline}</p>
          <p className="mt-4 text-[12px] leading-relaxed text-ink-3">
            This is an interactive prototype. Sends, payments, gifts and delivery are simulated. {PRICING_COPY.provisional}
          </p>
        </div>
        {COLS.map((c) => (
          <div key={c.title}>
            <h3 className="text-[12px] font-bold uppercase tracking-[0.14em] text-ink-3">{c.title}</h3>
            <ul className="mt-4 space-y-2.5">
              {c.links.map(([href, label]) => (
                <li key={href}>
                  <Link href={href} className="text-[15px] font-medium text-ink-2 hover:text-cobalt">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-line">
        <p className="mx-auto max-w-7xl px-4 py-5 text-[12px] text-ink-3 sm:px-6">
          © {BRAND.name} (working name). Demo merchants and products are fictional.
        </p>
      </div>
    </footer>
  );
}
