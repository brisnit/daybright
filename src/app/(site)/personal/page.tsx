import type { Metadata } from "next";
import { HomePage } from "@/components/marketing/home-page";

export const metadata: Metadata = {
  title: "Personal birthday cards",
  description: "Create an original birthday card, find a thoughtful gift and make someone's day. One-time cards, no subscription.",
};

/** The original consumer storefront, preserved for one-time personal sends. */
export default function PersonalPage() {
  return <HomePage />;
}
