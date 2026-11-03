/**
 * B2B marketing configuration: Founding Charter tiers, feature availability, integrations,
 * proposed gifting terms and claim flags.
 *
 * Every capability carries an explicit availability status. Flip a status only after the
 * capability is verified in production. See docs/CLAIMS_REVIEW.md for the review log.
 * Prices here are proposed and for display only; nothing here activates billing. A reservation is a nonbinding
 * expression of interest, not a purchase, and does not guarantee a seat.
 */

export type Availability = "live" | "beta" | "planned" | "roadmap" | "concept" | "service" | "proposed";

export const AVAILABILITY: Record<Availability, { label: string; description: string }> = {
  live: { label: "Live", description: "Generally available and verified in production." },
  beta: {
    label: "Beta",
    description: "Can be tried in the browser-based product preview with sample data. Not yet in production use.",
  },
  planned: { label: "Planned", description: "In development and not available yet. No release date is committed." },
  roadmap: { label: "Roadmap", description: "Intended for a later release. Timing is not committed." },
  concept: { label: "Concept", description: "Proposed only. Requires legal and compliance review before any commitment." },
  service: { label: "Included service", description: "Delivered by the Daybright team rather than by software. Scope is confirmed in writing." },
  proposed: { label: "Proposed terms", description: "Proposed commercial terms, subject to change before launch." },
};

/**
 * Contact channel for reservations and the fallback when submission fails.
 * Receives mail via ImprovMX forwarding (MX + SPF at Spaceship), verified with a real test message on 2026-11-02.
 * Inbound only: replies go out from the forwarding inbox until a sending mailbox is set up.
 */
export const SALES_EMAIL = "hello@daybright.store";
/** Shows the manual email option, but only after an online submission fails. */
export const SALES_EMAIL_VERIFIED = true;

export const CHARTER = {
  /**
   * Founding Charter cap: the most reservations that can be accepted (status 'accepted' in the database).
   * Shown across the site and enforced by `npm run leads:admin`. Change here only.
   */
  seats: 15,
  programName: "Founding Charter",
  /** Supplied claim: "White-Glove CRM Setup Included". Adapted until CRM connections exist. */
  setupMicrocopy: "White-glove contact import & brand setup included",
  /** Shown wherever someone can reserve. Keep in sync with the FAQ and the privacy policy. */
  nonbinding:
    "A reservation is a nonbinding expression of interest, not a purchase. It doesn't guarantee a seat: we review requests in the order received and confirm any agreement in writing. Nothing is charged.",
} as const;

export type TierId = "solo" | "agency" | "sponsor" | "enterprise";

/**
 * Co-Marketing Sponsor tier switch (see CLAIM_FLAGS.sponsorTier). A plain constant so that, while it's false, the
 * build drops the tier's content from the browser bundle as well as from the rendered pages.
 */
const SPONSOR_TIER_ENABLED = false;

/**
 * Claims hidden from the public site until evidence or legal review supports them. Content gated by a flag stays
 * in this file (and in docs/CLAIMS_REVIEW.md) so it can be restored by flipping the flag. Owner decision 2026-11-02:
 * gifting fee terms, the RESPA concept and FINRA/SEC archiving claims stay hidden until legal review is complete.
 * Owner decision 2026-11-02: the Co-Marketing Sponsor tier stays hidden until counsel reviews it under RESPA.
 */
export const CLAIM_FLAGS = {
  /** MBE supplier-diversity positioning. Keep false until certification is documented. */
  mbeCertified: false,
  /** Proposed gifting wallet and SMS top-up fees (GIFTING_TERMS) and the gifting-funding FAQ. */
  giftingTerms: false,
  /** RESPA / marketing-compliance split tracking for co-marketing sponsors. */
  respaConcept: false,
  /** Auto-BCC archiving for FINRA/SEC recordkeeping, audit snapshots and named archive vendors. */
  regulatoryArchiving: false,
  /**
   * The Co-Marketing Sponsor tier (loan officers, title reps and wholesalers paying for referral partners' cards):
   * its pricing card, inquiry option, FAQ and links. The arrangement itself needs RESPA review, so the whole tier is
   * hidden, and the API rejects Sponsor inquiries while this is false. Set via SPONSOR_TIER_ENABLED above.
   */
  sponsorTier: SPONSOR_TIER_ENABLED,
} as const;

export type ClaimFlag = keyof typeof CLAIM_FLAGS;

/** True when content gated by `flag` may be shown publicly. Ungated content is always shown. */
export const claimVisible = (flag?: ClaimFlag) => !flag || CLAIM_FLAGS[flag];

/**
 * Proposed plan quotas. Subject to confirmation: while `confirmed` is false, every quota-based feature
 * is labeled "Proposed limit" on the site.
 */
export const QUOTAS = {
  confirmed: false,
  solo: { contacts: 500, users: 1, smsPerMonth: 100 },
  agency: { contacts: 2500, seats: 5, smsPerMonth: 500 },
  sponsor: { partnerAccounts: 25 },
} as const;

const n = (v: number) => v.toLocaleString("en-US");

type Price = { amount: number; cadence: "month" | "year"; note?: string };

/**
 * `quota` marks features whose numbers are proposed and subject to confirmation.
 * `gate` hides the feature publicly unless that claim flag is on.
 */
export type Feature = { label: string; status: Availability; quota?: boolean; gate?: ClaimFlag };

export type Tier = {
  id: TierId;
  name: string;
  audience: string;
  badge?: string;
  /**
   * Proposed Founding Charter / Charter Partner price. null = custom quote.
   * No standard or post-charter price is published: comparison prices and savings claims are removed until
   * list prices are set and actually charged.
   */
  charter: (Price & { label: string }) | null;
  /** Shown only when approved. */
  indicativePerSeat?: { min: number; max: number; approved: boolean };
  features: Feature[];
  cta: { label: string; action: "reserve" | "inquire" };
  /** Hides the whole tier publicly unless that claim flag is on. */
  gate?: ClaimFlag;
  /** Inquiry tiers only: final-CTA link text, modal title and the optional size field. */
  inquiry?: { link: string; title: string; sizeLabel: string; sizePlaceholder: string };
};

export const TIERS: Tier[] = [
  {
    id: "solo",
    name: "Solo Practitioner",
    audience: "Independent agents & advisors",
    charter: { amount: 199, cadence: "year", label: "Founding Charter" },
    features: [
      { label: `Up to ${n(QUOTAS.solo.contacts)} active contacts`, status: "beta", quota: true },
      { label: `${QUOTAS.solo.users} user profile and signature`, status: "beta", quota: true },
      { label: "Unlimited automated email cards", status: "beta", quota: true },
      { label: `${n(QUOTAS.solo.smsPerMonth)} SMS/MMS deliveries per month`, status: "planned", quota: true },
      { label: "Voice-to-note AI mobile app (PWA)", status: "planned" },
      { label: "Auto-BCC compliance archiving", status: "planned", gate: "regulatoryArchiving" },
    ],
    cta: { label: "Request a Solo Charter Seat", action: "reserve" },
  },
  {
    id: "agency",
    name: "Growth / Agency",
    audience: "Teams & branches",
    // Supplied as "Most Popular". Adapted: there is no customer data to support a popularity claim yet.
    badge: "Best for teams",
    charter: { amount: 599, cadence: "year", label: "Founding Charter" },
    features: [
      { label: `Up to ${n(QUOTAS.agency.contacts)} active contacts`, status: "beta", quota: true },
      { label: `Up to ${QUOTAS.agency.seats} team seats with individual signatures`, status: "planned", quota: true },
      { label: "Native 2-way CRM sync for supported systems", status: "planned" },
      { label: `${n(QUOTAS.agency.smsPerMonth)} SMS/MMS deliveries per month`, status: "planned", quota: true },
      { label: "Household grouping", status: "planned" },
      { label: "Multi-year smart tracks (no repeated designs)", status: "beta" },
      { label: "White-glove contact and brand setup", status: "service" },
    ],
    cta: { label: "Request an Agency Charter Seat", action: "reserve" },
  },
  // Hidden pending RESPA review: included only while SPONSOR_TIER_ENABLED is true.
  ...(SPONSOR_TIER_ENABLED
    ? ([
      {
        id: "sponsor",
        name: "Co-Marketing Sponsor",
        audience: "Loan officers, title reps, wholesalers",
        charter: { amount: 349, cadence: "month", label: "Charter Partner" },
        features: [
          { label: `Sponsor up to ${QUOTAS.sponsor.partnerAccounts} referral partner accounts`, status: "planned", quota: true },
          { label: "Dual co-branded card footers and wax seals", status: "planned" },
          { label: "RESPA / marketing-compliance split tracking", status: "concept", gate: "respaConcept" },
          { label: "Central sponsor ROI dashboard", status: "roadmap" },
        ],
        cta: { label: "Apply for Sponsor Account", action: "inquire" },
        inquiry: {
          link: "Sponsor accounts for referral partners",
          title: "Apply for a Sponsor account",
          sizeLabel: "Referral partners to sponsor",
          sizePlaceholder: "e.g. 12",
        },
        gate: "sponsorTier",
      },
      ] satisfies Tier[])
    : []),
  {
    id: "enterprise",
    name: "Enterprise IMO / Brokerage",
    audience: "100 to 5,000+ seats",
    charter: null,
    indicativePerSeat: { min: 15, max: 22, approved: false },
    features: [
      { label: "Unlimited contacts and sub-accounts", status: "roadmap", quota: true },
      { label: "Central compliance approval queue", status: "planned" },
      { label: "Custom-domain white labeling", status: "roadmap" },
      { label: "Dedicated account manager", status: "service" },
      { label: "Custom API", status: "roadmap" },
    ],
    cta: { label: "Request an Enterprise Demo", action: "inquire" },
    inquiry: { link: "Enterprise IMOs & brokerages", title: "Request an Enterprise demo", sizeLabel: "Approximate seats", sizePlaceholder: "e.g. 250" },
  },
];

/** Hidden tiers (Sponsor while gated) aren't in TIERS, so pass only publicly offered ids. */
export const getTier = (id: TierId) => TIERS.find((t) => t.id === id)!;

/** Tiers that may be shown, reserved or inquired about publicly. Use this, not TIERS, for anything visitors see. */
export const PUBLIC_TIERS = TIERS.filter((t) => claimVisible(t.gate));
export const RESERVATION_TIER_IDS = PUBLIC_TIERS.filter((t) => t.cta.action === "reserve").map((t) => t.id);
export const INQUIRY_TIER_IDS = PUBLIC_TIERS.filter((t) => t.cta.action === "inquire").map((t) => t.id);

/** Features that may be shown publicly for a tier. */
export const visibleFeatures = (t: Tier) => t.features.filter((f) => claimVisible(f.gate));

/** Hero capability pills. Supplied wording is adapted where the capability is not yet live. */
export const CAPABILITY_PILLS: { title: string; detail: string; status: Availability; gate?: ClaimFlag }[] = [
  {
    title: "Auto-BCC archiving for FINRA / SEC recordkeeping workflows",
    detail: "Designed to route copies to Smarsh, Global Relay, Redtail and Wealthbox",
    status: "planned",
    gate: "regulatoryArchiving",
  },
  {
    title: "CRM timeline write-back",
    detail: "A timestamped note on each contact's CRM timeline when a card goes out",
    status: "planned",
  },
  {
    title: "Principal-locked template mode",
    detail: "Pre-approved copy and automatic license footers",
    status: "planned",
  },
];

export type Integration = {
  name: string;
  vertical: string;
  target: string;
  status: Availability;
  /** Show a "2-Way Live Sync" badge only when verified in production. */
  liveTwoWaySync: boolean;
  /** Neutral text monogram. Official logos require each owner's brand-guideline approval. */
  monogram: string;
};

export const INTEGRATIONS: Integration[] = [
  { name: "Wealthbox", vertical: "Wealth management & RIAs", target: "Client milestone sync, RMD-related reminders and compliance activity notes.", status: "planned", liveTwoWaySync: false, monogram: "W" },
  { name: "Redtail CRM", vertical: "Financial & insurance", target: "Household records, birthdays and card-delivery receipt logging.", status: "planned", liveTwoWaySync: false, monogram: "R" },
  { name: "GoHighLevel", vertical: "Insurance IMOs & agencies", target: "Sub-account installation and Sold-stage pipeline automations.", status: "planned", liveTwoWaySync: false, monogram: "G" },
  { name: "Follow Up Boss", vertical: "Real estate teams", target: "Closed-deal anniversary tracks and referral check-ins.", status: "planned", liveTwoWaySync: false, monogram: "F" },
  { name: "Clio", vertical: "Law firms & estate planning", target: "Case-closing appreciation and recurring review reminders.", status: "planned", liveTwoWaySync: false, monogram: "C" },
  { name: "AgencyZoom", vertical: "P&C and life agencies", target: "Policy anniversaries, renewals and X-date touchpoints.", status: "planned", liveTwoWaySync: false, monogram: "A" },
  { name: "HubSpot & Zapier", vertical: "Enterprise & custom stacks", target: "Webhooks and custom enterprise workflows.", status: "roadmap", liveTwoWaySync: false, monogram: "H" },
];

export const CRM_OPTIONS = ["Wealthbox", "Redtail", "GoHighLevel", "Follow Up Boss", "Clio", "AgencyZoom", "HubSpot", "Other / CSV"] as const;

/**
 * Proposed commercial terms for gifting and messaging. Concept only: not built, no funds are held or processed.
 * Hidden publicly while `CLAIM_FLAGS.giftingTerms` is false.
 */
export const GIFTING_TERMS: { label: string; detail: string }[] = [
  { label: "Digital gift cards, $5–$100", detail: "From supported merchants. Merchant availability is still being confirmed." },
  { label: "$0 platform markup on ACH-funded gifting", detail: "Gift value passes through at face value." },
  { label: "3.5% processing fee on card-funded gifting", detail: "Covers card processing costs." },
  { label: "Additional SMS/MMS credits at $0.05 per send", detail: "Beyond your plan's monthly allowance." },
];
