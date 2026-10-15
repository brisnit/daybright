import type { Metadata } from "next";
import { BusinessPage } from "@/components/marketing/business-page";

export const metadata: Metadata = {
  title: "For business",
  description:
    "Birthday cards for every customer, in your brand and your voice. Personalized suggestions, review before sending, and optional gifts within your budget.",
};

export default function Page() {
  return <BusinessPage />;
}
