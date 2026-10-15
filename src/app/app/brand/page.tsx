import type { Metadata } from "next";
import { BrandPage } from "@/components/workspace/brand-page";

export const metadata: Metadata = { title: "Brand settings" };

export default function Page() {
  return <BrandPage />;
}
