import type { Metadata } from "next";
import { BRAND } from "@/config/brand";
import { CHARTER } from "@/config/charter";
import { CharterHome } from "@/components/charter/home";

const title = `${BRAND.name} · Client Retention & Milestone Intelligence for Regulated Industries`;
const description =
  `Tactile digital stationery, wet-ink-style signatures and optional micro-gifts for financial advisors, insurance agencies, real estate teams and legal practices. Founding Charter access limited to ${CHARTER.seats} firms.`;

export const metadata: Metadata = {
  title: { absolute: title },
  description,
  alternates: { canonical: "/" },
  openGraph: { title, description, type: "website", siteName: BRAND.name, url: "/" },
  twitter: { card: "summary_large_image", title, description },
};

/**
 * Structured data: describes the organization and the software only. No offers are published, because charter
 * reservations are nonbinding and nothing can be bought; no ratings or reviews are claimed.
 */
function jsonLd() {
  return [
    { "@context": "https://schema.org", "@type": "Organization", name: BRAND.name, url: "https://daybright.store/" },
    {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      name: BRAND.name,
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      description,
    },
  ];
}

export default function Home() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd()).replace(/</g, "\\u003c") }} />
      <CharterHome />
    </>
  );
}
