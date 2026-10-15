import Link from "next/link";
import { Logo } from "@/components/brand/logo";

/** Focused onboarding layout: logo plus two ways out, nothing else to distract. */
export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <header className="sticky top-0 z-40 border-b border-line bg-paper/85 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-10">
          <Logo />
          <nav className="flex items-center gap-1 text-[13px] font-semibold sm:gap-2 sm:text-sm">
            <Link href="/app" className="rounded-full px-3 py-2 text-cobalt hover:bg-cobalt-soft">
              <span className="sm:hidden">Skip to demo</span>
              <span className="hidden sm:inline">Skip to demo workspace</span>
            </Link>
            <Link href="/" className="rounded-full px-3 py-2 text-ink-2 hover:bg-ink/5 hover:text-ink">
              Exit<span className="hidden sm:inline"> to site</span>
            </Link>
          </nav>
        </div>
      </header>
      <main id="main" className="flex-1">
        {children}
      </main>
    </>
  );
}
