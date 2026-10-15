import type { Metadata } from "next";
import { LibraryPage } from "@/components/workspace/library-page";

export const metadata: Metadata = { title: "Card library" };

export default function Page() {
  return <LibraryPage />;
}
