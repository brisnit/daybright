import Link from "next/link";
import { BRAND } from "@/config/brand";
import { Mark } from "@/components/brand/logo";

/** Focused recipient layout: no site header, just a quiet mark at the very bottom. */
export default function OpenLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <main id="main" className="flex-1">
        {children}
      </main>
      <footer className="flex justify-center py-5">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-[12px] font-medium text-ink-3 opacity-80 transition hover:opacity-100"
        >
          <Mark className="size-4" />
          Sent with {BRAND.name}
        </Link>
      </footer>
    </>
  );
}
