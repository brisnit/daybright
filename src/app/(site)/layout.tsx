import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { CharterProvider } from "@/components/charter/charter-provider";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <CharterProvider>
      <a href="#main" className="sr-only z-[100] rounded-full bg-ink px-4 py-2 text-paper focus:not-sr-only focus:fixed focus:left-3 focus:top-3">
        Skip to content
      </a>
      <SiteHeader />
      <main id="main" className="flex-1">
        {children}
      </main>
      <SiteFooter />
    </CharterProvider>
  );
}
