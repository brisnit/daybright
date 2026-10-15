import type { Metadata } from "next";
import { PricingPage } from "@/components/marketing/pricing-page";

export const metadata: Metadata = {
  title: "Pricing",
  description: "Monthly business plans with digital birthday cards included. Gifts and shipping are priced separately.",
};

export default function Page() {
  return <PricingPage />;
}
