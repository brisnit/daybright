import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { BRAND } from "@/config/brand";
import { SALES_EMAIL } from "@/config/charter";

const COLS = [
  {
    title: "Business",
    links: [
      ["/#compliance", "Compliance & milestone tools"],
      ["/#integrations", "Planned CRM integrations"],
      ["/pricing", "Pricing"],
      ["/app", "Product preview"],
      ["/onboarding", "Guided setup demo"],
    ],
  },
  {
    title: "Personal cards",
    links: [
      ["/personal", "Personal cards (prototype)"],
      ["/cards", "Card collection"],
      ["/studio", "Card Studio"],
      ["/gifts", "Gifts (demo)"],
    ],
  },
  {
    title: "See it",
    links: [
      ["/#sample", "Interactive sample card"],
      ["/open?id=demo-card", "Full-screen recipient view"],
      ["/privacy", "Privacy Policy"],
    ],
  },
] as const;

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-line bg-[#F6F1E7]">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-[1.4fr_repeat(3,1fr)] lg:px-8">
        <div className="max-w-sm">
          <Logo />
          <p className="mt-4 text-sm leading-relaxed text-ink-2">
            Client retention and milestone intelligence for financial advisors, insurance agencies, real estate teams and legal practices.
          </p>
          <a href={`mailto:${SALES_EMAIL}`} className="mt-4 inline-block text-sm font-semibold text-cobalt hover:underline">
            {SALES_EMAIL}
          </a>
          <p className="mt-4 text-[12px] leading-relaxed text-ink-3">
            Features marked Beta, Planned, Roadmap or Concept are not generally available. Daybright does not provide legal, tax,
            investment or compliance advice, and is not reviewed or approved by any regulator.
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
        <p className="mx-auto max-w-7xl px-4 py-5 text-[12px] text-ink-3 sm:px-6 lg:px-8">
          © {BRAND.name}. Sample firms, people and license numbers shown on this site are fictional. Third-party product names are
          trademarks of their respective owners.
        </p>
      </div>
    </footer>
  );
}
