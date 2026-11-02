import type { Metadata } from "next";
import { BRAND } from "@/config/brand";
import { TIERS } from "@/config/charter";
import { CharterHome } from "@/components/charter/home";

const title = `${BRAND.name} · Client Retention & Milestone Intelligence for Regulated Industries`;
const description =
  "Tactile digital stationery, wet-ink-style signatures and optional micro-gifts for financial advisors, insurance agencies, real estate teams and legal practices. Founding Charter access limited to 15 firms.";

export const metadata: Metadata = {
  title: { absolute: title },
  description,
  alternates: { canonical: "/" },
  openGraph: { title, description, type: "website", siteName: BRAND.name, url: "/" },
  twitter: { card: "summary_large_image", title, description },
};

/** Structured data: describes the software and the published charter offers. No ratings or reviews are claimed. */
function jsonLd() {
  const offers = TIERS.filter((t) => t.charter && (t.id === "solo" || t.id === "agency")).map((t) => ({
    "@type": "Offer",
    name: `${t.name} — ${t.charter!.label}`,
    price: t.charter!.amount,
    priceCurrency: "USD",
    availability: "https://schema.org/LimitedAvailability",
    priceSpecification: {
      "@type": "UnitPriceSpecification",
      price: t.charter!.amount,
      priceCurrency: "USD",
      unitCode: t.charter!.cadence === "year" ? "ANN" : "MON",
    },
  }));
  return [
    { "@context": "https://schema.org", "@type": "Organization", name: BRAND.name, url: "https://daybright.store/" },
    {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      name: BRAND.name,
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      description,
      offers,
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
