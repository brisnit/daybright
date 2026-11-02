/**
 * B2B marketing configuration: Founding Charter tiers, feature availability, integrations,
 * proposed gifting terms and claim flags.
 *
 * Every capability carries an explicit availability status. Flip a status only after the
 * capability is verified in production. See docs/CLAIMS_REVIEW.md for the review log.
 * Prices here are supplied business requirements for display only; nothing here activates billing.
 */

export type Availability = "live" | "beta" | "planned" | "roadmap" | "concept" | "service" | "proposed";

export const AVAILABILITY: Record<Availability, { label: string; description: string }> = {
  live: { label: "Live", description: "Generally available and verified in production." },
  beta: {
    label: "Beta",
    description: "Works in the Daybright product preview today; being hardened with Charter members before general release.",
  },
  planned: { label: "Planned", description: "Committed for the Charter program, but not available yet." },
  roadmap: { label: "Roadmap", description: "Intended for a later release. Timing is not committed." },
  concept: { label: "Concept", description: "Proposed only. Requires legal and compliance review before any commitment." },
  service: { label: "Included service", description: "Delivered by the Daybright team rather than by software." },
  proposed: { label: "Proposed terms", description: "Proposed commercial terms, subject to change before launch." },
};

/**
 * Contact channel for reservations and the fallback when submission fails.
 * PROVISIONAL: the mailbox must be verified (send + receive) before launch.
 */
export const SALES_EMAIL = "hello@daybright.store";
export const SALES_EMAIL_VERIFIED = false;

export const CHARTER = {
  /** Founding Charter seat limit shown across the site. Change here only. */
  seats: 15,
  programName: "Founding Charter",
  /** Supplied claim: "White-Glove CRM Setup Included". Adapted until CRM connections exist. */
  setupMicrocopy: "White-glove contact import & brand setup included",
} as const;

export type TierId = "solo" | "agency" | "sponsor" | "enterprise";

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

/** `quota` marks features whose numbers are proposed and subject to confirmation. */
export type Feature = { label: string; status: Availability; quota?: boolean };

export type Tier = {
  id: TierId;
  name: string;
  audience: string;
  badge?: string;
  /** Standard (post-charter) list price. null = custom. */
  standard: Price | null;
  /** Founding Charter / Charter Partner price. null = not offered. */
  charter: (Price & { label: string; prepaid?: boolean }) | null;
  /** Shown only when approved. */
  indicativePerSeat?: { min: number; max: number; approved: boolean };
  features: Feature[];
  cta: { label: string; action: "reserve" | "inquire" };
};

export const TIERS: Tier[] = [
  {
    id: "solo",
    name: "Solo Practitioner",
    audience: "Independent agents & advisors",
    standard: { amount: 39, cadence: "month" },
    charter: { amount: 199, cadence: "year", prepaid: true, label: "Founding Charter" },
    features: [
      { label: `Up to ${n(QUOTAS.solo.contacts)} active contacts`, status: "beta", quota: true },
      { label: `${QUOTAS.solo.users} user profile and signature`, status: "beta", quota: true },
      { label: "Unlimited automated email cards", status: "beta", quota: true },
      { label: `${n(QUOTAS.solo.smsPerMonth)} SMS/MMS deliveries per month`, status: "planned", quota: true },
      { label: "Voice-to-note AI mobile app (PWA)", status: "planned" },
      { label: "Auto-BCC compliance archiving", status: "planned" },
    ],
    cta: { label: "Lock In Solo Charter ($199/yr)", action: "reserve" },
  },
  {
    id: "agency",
    name: "Growth / Agency",
    audience: "Teams & branches",
    // Supplied as "Most Popular". Adapted: there is no customer data to support a popularity claim yet.
    badge: "Best for teams",
    standard: { amount: 149, cadence: "month" },
    charter: { amount: 599, cadence: "year", prepaid: true, label: "Founding Charter" },
    features: [
      { label: `Up to ${n(QUOTAS.agency.contacts)} active contacts`, status: "beta", quota: true },
      { label: `Up to ${QUOTAS.agency.seats} team seats with individual signatures`, status: "planned", quota: true },
      { label: "Native 2-way CRM sync for supported systems", status: "planned" },
      { label: `${n(QUOTAS.agency.smsPerMonth)} SMS/MMS deliveries per month`, status: "planned", quota: true },
      { label: "Household grouping", status: "planned" },
      { label: "Multi-year smart tracks (no repeated designs)", status: "beta" },
      { label: "White-glove contact and brand setup", status: "service" },
    ],
    cta: { label: "Claim Agency Charter ($599/yr)", action: "reserve" },
  },
  {
    id: "sponsor",
    name: "Co-Marketing Sponsor",
    audience: "Loan officers, title reps, wholesalers",
    standard: { amount: 499, cadence: "month" },
    charter: { amount: 349, cadence: "month", label: "Charter Partner" },
    features: [
      { label: `Sponsor up to ${QUOTAS.sponsor.partnerAccounts} referral partner accounts`, status: "planned", quota: true },
      { label: "Dual co-branded card footers and wax seals", status: "planned" },
      { label: "RESPA / marketing-compliance split tracking", status: "concept" },
      { label: "Central sponsor ROI dashboard", status: "roadmap" },
    ],
    cta: { label: "Apply for Sponsor Account", action: "inquire" },
  },
  {
    id: "enterprise",
    name: "Enterprise IMO / Brokerage",
    audience: "100 to 5,000+ seats",
    standard: null,
    charter: null,
    indicativePerSeat: { min: 15, max: 22, approved: false },
    features: [
      { label: "Unlimited contacts and sub-accounts", status: "roadmap", quota: true },
      { label: "Central compliance approval queue", status: "planned" },
      { label: "Custom-domain white labeling", status: "roadmap" },
      { label: "Dedicated account manager", status: "service" },
      { label: "Custom API", status: "roadmap" },
    ],
    cta: { label: "Schedule Enterprise Demo", action: "inquire" },
  },
];

export const getTier = (id: TierId) => TIERS.find((t) => t.id === id)!;

/** Annualized standard and charter cost, and the rounded savings percentage. */
export function tierSavings(t: Tier) {
  if (!t.standard || !t.charter) return null;
  const perYear = (p: Price) => (p.cadence === "month" ? p.amount * 12 : p.amount);
  const standardYear = perYear(t.standard);
  const charterYear = perYear(t.charter);
  const pct = Math.round((1 - charterYear / standardYear) * 100);
  return { standardYear, charterYear, pct, saved: standardYear - charterYear };
}

/** Hero capability pills. Supplied wording is adapted where the capability is not yet live. */
export const CAPABILITY_PILLS: { title: string; detail: string; status: Availability }[] = [
  {
    title: "Auto-BCC archiving for FINRA / SEC recordkeeping workflows",
    detail: "Designed to route copies to Smarsh, Global Relay, Redtail and Wealthbox",
    status: "planned",
  },
  {
    title: "CRM timeline write-back",
    detail: "Timestamped PDF/HTML audit snapshots on each contact",
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

/** Proposed commercial terms for gifting and messaging. Not active; no funds are held or processed. */
export const GIFTING_TERMS: { label: string; detail: string }[] = [
  { label: "Digital gift cards, $5–$100", detail: "From supported merchants. Merchant availability is still being confirmed." },
  { label: "$0 platform markup on ACH-funded gifting", detail: "Gift value passes through at face value." },
  { label: "3.5% processing fee on card-funded gifting", detail: "Covers card processing costs." },
  { label: "Additional SMS/MMS credits at $0.05 per send", detail: "Beyond your plan's monthly allowance." },
];

/** Claims that require documentary evidence before they can be shown. */
export const CLAIM_FLAGS = {
  /** MBE supplier-diversity positioning. Keep false until certification is documented. */
  mbeCertified: false,
} as const;
