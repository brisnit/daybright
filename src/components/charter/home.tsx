"use client";

import Link from "next/link";
import { FaqList, type FaqItem } from "@/components/marketing/faq";
import { CHARTER, CLAIM_FLAGS, PUBLIC_TIERS, SALES_EMAIL } from "@/config/charter";
import { CharterBand, CharterButton, SampleButton, StickyCharterBar } from "./cta";
import { CharterHero } from "./hero";
import { ComplianceSection } from "./compliance";
import { IntegrationsSection } from "./integrations";
import { PricingMatrix } from "./pricing";
import { SampleCardExperience } from "./sample-card";
import { useCharter } from "./charter-provider";

/** Shown only while CLAIM_FLAGS.giftingTerms is true (fees hidden pending legal review). */
const GIFTING_FAQ: FaqItem = {
  q: "How will gifting be funded?",
  a: "Gifting is a concept and isn't built. The terms we're considering are $0 platform markup on ACH-funded gifts, a 3.5% processing fee for card funding, and $0.05 per extra SMS/MMS. These may change or not launch, and payments need legal review first. Merchant availability isn't confirmed.",
};

export const CHARTER_FAQ: FaqItem[] = [
  {
    q: "Will Daybright make my firm's client communications compliant?",
    a: "No. Daybright is not a compliance or recordkeeping product, no regulator has reviewed or approved it, and it doesn't provide legal or compliance advice. Your firm stays responsible for supervising, approving and retaining client communications under its own policies.",
  },
  {
    q: "What works today, and what is still in development?",
    a: "Daybright isn't in production use yet. Card design, branded templates, message review, birthday automation rules, CSV import with duplicate warnings and year-over-year design rotation can be tried in the product preview (marked Beta). The preview runs in your browser with sample data and doesn't send anything. CRM connections, SMS, household grouping and team seats are Planned, and no release dates are committed yet.",
  },
  {
    q: "Which CRMs will you connect to?",
    a: "Connections to Wealthbox, Redtail, GoHighLevel, Follow Up Boss, Clio and AgencyZoom are planned, with HubSpot and Zapier webhooks on the roadmap. None is available yet, and we have no partnership with these companies. Until a connection ships, clients can be imported by CSV, and our team will help with the import as part of charter setup.",
  },
  {
    q: "What does reserving a Founding Charter seat commit me to?",
    a: `Nothing. A reservation is a nonbinding expression of interest, not a purchase or a contract, and it doesn't guarantee a place. We review requests in the order received and will accept up to ${CHARTER.seats} founding firms. If we're a fit, we'll confirm pricing, scope and timing with you in writing before anything is agreed. No payment is collected on this site.`,
  },
  {
    q: "Are the signatures legally binding?",
    a: "No. The wet-ink look is a handwriting style for warmth. It is not an electronic signature and isn't used to authenticate anything.",
  },
  {
    q: "Is pricing locked in, and what about refunds?",
    a: "Prices shown are proposed. We haven't set a price-lock period, renewal terms or a refund policy yet, so none is promised here. They'll be stated in writing before you agree to anything, and nothing is charged before then.",
  },
  ...(CLAIM_FLAGS.giftingTerms ? [GIFTING_FAQ] : []),
];

export function CharterHome() {
  const { openInquiry } = useCharter();
  return (
    <>
      <CharterHero />
      <ComplianceSection />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <CharterBand
          source="after-compliance"
          title={`Help shape Daybright as one of ${CHARTER.seats} founding firms.`}
          body="Founding firms get proposed charter pricing, white-glove contact import and brand setup, and a direct say in which CRM connections and compliance features we build first."
        />
      </div>

      <section id="sample" aria-labelledby="sample-title" className="scroll-mt-24 py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-6 lg:grid-cols-[1fr_1fr] lg:items-end">
            <div>
              <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-[#8A6A2B]">See what clients receive</p>
              <h2 id="sample-title" className="mt-3 font-display text-[34px] font-semibold leading-[1.05] tracking-tight text-[#16203A] text-balance sm:text-5xl">
                An envelope worth opening.
              </h2>
            </div>
            <p className="text-[17px] leading-relaxed text-ink-2">
              Pick a practice and open the card: personalized design, a note in your voice, a wet-ink-style signature, your disclosure
              footer and an optional gift. No login required.
            </p>
          </div>
          <div className="emboss mt-10 rounded-[2rem] bg-[#FCFAF5] p-5 ring-1 ring-[#EDE4D3] sm:p-8 lg:p-10">
            <SampleCardExperience headingId="sample" />
          </div>
        </div>
      </section>

      <IntegrationsSection />

      <section id="pricing" aria-labelledby="pricing-title" className="scroll-mt-24 py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <PricingMatrix source="home-pricing" />
          <div className="mt-10">
            <CharterBand
              source="after-pricing"
              title={`Founding Charter places are limited to ${CHARTER.seats} firms.`}
              body="Request a place now. We review each request and confirm details with you in writing. Reserving is nonbinding and nothing is charged."
            />
          </div>
        </div>
      </section>

      <section aria-labelledby="charter-faq" className="border-t border-line py-20 sm:py-28">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[0.75fr_1.25fr] lg:gap-16 lg:px-8">
          <div>
            <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-[#8A6A2B]">Straight answers</p>
            <h2 id="charter-faq" className="mt-3 font-display text-[34px] font-semibold leading-tight tracking-tight text-[#16203A] sm:text-4xl">
              Questions compliance teams ask first
            </h2>
            <p className="mt-4 text-[15px] text-ink-2">
              Something else? Email{" "}
              <a href={`mailto:${SALES_EMAIL}`} className="font-semibold text-cobalt hover:underline">
                {SALES_EMAIL}
              </a>
              .
            </p>
          </div>
          <FaqList items={CHARTER_FAQ} />
        </div>
      </section>

      <section aria-labelledby="final-cta" className="linen-dark text-paper">
        <div className="mx-auto max-w-7xl px-4 py-20 text-center sm:px-6 sm:py-24 lg:px-8">
          <h2 id="final-cta" className="mx-auto max-w-3xl font-display text-[36px] font-semibold leading-[1.05] tracking-tight text-balance sm:text-5xl">
            Every milestone remembered. Every card on brand.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-[17px] text-paper/75">
            Apply to be one of the first {CHARTER.seats} agencies and practices to shape Daybright.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <CharterButton source="final" variant="white" />
            <SampleButton source="final" tone="dark" />
          </div>
          <div className="mt-8 flex flex-wrap justify-center gap-x-6 gap-y-2 text-[14px] text-paper/70">
            {PUBLIC_TIERS.filter((t) => t.inquiry).map((t) => (
              <button key={t.id} type="button" onClick={() => openInquiry(t.id, "final")} className="font-semibold underline-offset-4 hover:text-paper hover:underline">
                {t.inquiry!.link}
              </button>
            ))}
            <Link href="/app" className="font-semibold underline-offset-4 hover:text-paper hover:underline">
              Explore the product preview (sample data)
            </Link>
          </div>
        </div>
      </section>
      <StickyCharterBar />
    </>
  );
}

export function PricingPageBody() {
  return (
    <>
      <section className="py-14 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <PricingMatrix source="pricing-page" headingLevel="h1" />
        </div>
      </section>
      <section className="border-t border-line py-16 sm:py-20">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[0.75fr_1.25fr] lg:gap-16 lg:px-8">
          <h2 className="font-display text-3xl font-semibold tracking-tight text-[#16203A]">Pricing questions</h2>
          <FaqList items={CHARTER_FAQ.slice(3)} />
        </div>
      </section>
      <div className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <CharterBand
          source="pricing-page-bottom"
          title="Not sure which tier fits?"
          body="Request the closest one. You can switch tiers before anything is agreed, and we'll help you choose when we follow up."
        />
      </div>
      <StickyCharterBar />
    </>
  );
}

