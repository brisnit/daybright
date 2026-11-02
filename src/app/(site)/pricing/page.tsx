import type { Metadata } from "next";
import { PricingPageBody } from "@/components/charter/home";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Founding Charter and standard pricing for Solo, Agency, Co-Marketing Sponsor and Enterprise plans. Gifting and SMS top-ups are priced separately.",
  alternates: { canonical: "/pricing" },
};

export default function Page() {
  return <PricingPageBody />;
}
