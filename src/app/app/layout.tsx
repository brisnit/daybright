import type { Metadata } from "next";
import { AppShell } from "@/components/app/app-shell";

/** The workspace renders behind a client-side hydration gate (local demo state), so it opts out of instant-navigation validation. */
export const instant = false;

export const metadata: Metadata = { title: "Business workspace" };

export default function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
