/**
 * Central, editable product configuration.
 * Brand name, pricing and plan limits all live here so they can change in one place.
 * All prices are provisional prototype values, not commercial commitments.
 *
 * NOTE: `PLANS` below are the product-preview plans used by /app and /onboarding. Public business pricing
 * comes from `TIERS` in src/config/charter.ts. See docs/PRICING_ALIGNMENT.md.
 */

export const BRAND = {
  name: "Daybright",
  tagline: "Birthday cards and gifts, thoughtfully on time.",
  supportEmail: "hello@daybright.store" // provisional; same as SALES_EMAIL, verify before launch,
} as const;

export type PlanId = "starter" | "growth" | "scale";

export type Plan = {
  id: PlanId;
  name: string;
  monthlyPrice: number;
  monthlySends: number;
  blurb: string;
  features: string[];
  /** Plain flags used by the workspace to decide what is unlocked. */
  limits: {
    segments: boolean;
    giftBudgetControls: boolean;
    multipleRules: boolean;
    teamMembers: number;
    brandProfiles: number;
    expandedReporting: boolean;
  };
  highlight?: boolean;
};

export const PLANS: Plan[] = [
  {
    id: "starter",
    name: "Starter",
    monthlyPrice: 39,
    monthlySends: 100,
    blurb: "For small teams who want every customer birthday covered.",
    features: [
      "Up to 100 customer birthday card sends per month",
      "Digital card collection included",
      "Birthday scheduling and automation",
      "CSV customer import",
      "Business logo and signature",
      "Gifts purchased separately",
    ],
    limits: {
      segments: false,
      giftBudgetControls: false,
      multipleRules: false,
      teamMembers: 1,
      brandProfiles: 1,
      expandedReporting: false,
    },
  },
  {
    id: "growth",
    name: "Growth",
    monthlyPrice: 79,
    monthlySends: 300,
    blurb: "For growing client lists with VIPs and different audiences.",
    features: [
      "Up to 300 customer birthday card sends per month",
      "Everything in Starter",
      "Customer segments",
      "Gift budget controls",
      "Multiple card and message rules",
    ],
    limits: {
      segments: true,
      giftBudgetControls: true,
      multipleRules: true,
      teamMembers: 1,
      brandProfiles: 1,
      expandedReporting: false,
    },
    highlight: true,
  },
  {
    id: "scale",
    name: "Scale",
    monthlyPrice: 149,
    monthlySends: 1000,
    blurb: "For teams and multi-location businesses.",
    features: [
      "Up to 1,000 customer birthday card sends per month",
      "Everything in Growth",
      "Multiple team members",
      "Multiple brand profiles",
      "Expanded reporting",
    ],
    limits: {
      segments: true,
      giftBudgetControls: true,
      multipleRules: true,
      teamMembers: 10,
      brandProfiles: 5,
      expandedReporting: true,
    },
  },
];

export const getPlan = (id: PlanId) => PLANS.find((p) => p.id === id) ?? PLANS[0];

export const PRICING_COPY = {
  includes:
    "Your plan includes digital cards. Gift cards, physical gifts, and shipping are additional.",
  provisional: "Illustrative pricing for this product preview only. It isn't Daybright's Founding Charter pricing, and nothing is charged.",
  aiAllowance: "Included in this demo; launch limits to be finalized.",
  aiNote:
    "AI card creation and message help are separate from your monthly card-send allowance.",
} as const;

/** One-time consumer pricing (provisional demo pricing). */
export const CONSUMER = {
  digitalCardPrice: 4.99,
  premiumExtras: {
    recordedGreeting: 0,
    groupSignatures: 0,
    photoMemories: 0,
  },
  note: "Provisional demo pricing for one-time sends.",
} as const;

export const money = (n: number, opts: { cents?: boolean } = {}) => {
  const cents = opts.cents ?? !Number.isInteger(n);
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: cents ? 2 : 0,
    maximumFractionDigits: cents ? 2 : 0,
  }).format(n);
};
