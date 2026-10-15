import type { Metadata } from "next";
import { BillingPage } from "@/components/workspace/billing-page";

export const metadata: Metadata = { title: "Plan & billing" };

export default function Page() {
  return <BillingPage />;
}
