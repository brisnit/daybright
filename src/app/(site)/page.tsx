import type { Metadata } from "next";
import { BRAND } from "@/config/brand";
import { HomePage } from "@/components/marketing/home-page";

export const metadata: Metadata = {
  title: { absolute: `${BRAND.name} · Their birthday. Something only you would send.` },
};

export default function Home() {
  return <HomePage />;
}
