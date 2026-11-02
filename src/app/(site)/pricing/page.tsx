import type { Metadata } from "next";
import { PricingPageBody } from "@/components/charter/home";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Proposed Founding Charter pricing for Solo, Agency, Co-Marketing Sponsor and Enterprise plans. Reservations are nonbinding and nothing is charged.",
  alternates: { canonical: "/pricing" },
};

export default function Page() {
  return <PricingPageBody />;
}
