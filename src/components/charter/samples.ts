import type { CardDesign } from "@/lib/types";
import { CARD_MAP } from "@/data/cards";

/**
 * Fictional sample firms used in the interactive card preview.
 * License numbers are zeroed placeholders, clearly marked as samples.
 */
export type VerticalSample = {
  id: "advisor" | "insurance" | "realestate" | "legal";
  tab: string;
  milestone: string;
  firm: string;
  monogram: string;
  color: string;
  sender: string;
  senderTitle: string;
  recipient: string;
  card: CardDesign;
  message: string;
  disclosure: string;
  gift: { label: string; detail: string };
};

const linen = { bg: "#F4EEE3", ink: "#1E2A44" };

export const VERTICAL_SAMPLES: VerticalSample[] = [
  {
    id: "advisor",
    tab: "Financial advisor",
    milestone: "Age 59½ milestone",
    firm: "Northline Wealth Partners",
    monogram: "NW",
    color: "#1E2A44",
    sender: "Elena Brooks",
    senderTitle: "Financial Advisor",
    recipient: "David Alvarez",
    card: {
      ...CARD_MAP["candle-glow"],
      id: "sample-advisor",
      headline: "Happy 59½,\nDavid.",
      palette: { ...CARD_MAP["candle-glow"].palette, ...linen, a: "#C9A24B", c: "#D8CDB8" },
    },
    message:
      "Happy half-birthday, David. Fifty-nine and a half is a milestone worth marking, and Karen tells me there will be cake. Wishing you both a wonderful year ahead. Whenever you'd like to talk through what's next, my door is open.",
    disclosure: "Sample disclosure · CRD #0000000 · Your firm's required disclosures appear here.",
    gift: { label: "$25 coffee gift card", detail: "Optional gift, shown in the demo only" },
  },
  {
    id: "insurance",
    tab: "Insurance agency",
    milestone: "Policy anniversary",
    firm: "Harborline Insurance Agency",
    monogram: "HI",
    color: "#2E4A7A",
    sender: "Marcus Reyes",
    senderTitle: "Agency Principal",
    recipient: "The Okafor family",
    card: {
      ...CARD_MAP["citrus-toast"],
      id: "sample-insurance",
      headline: "Five years\ntogether",
    },
    message:
      "Five years ago this week, you trusted us with your family's coverage. Thank you. It has been a privilege to be in your corner, and we're always a phone call away if anything changes at home.",
    disclosure: "Sample disclosure · NPN 00000000 · Licensed in [State]. Required disclosures appear here.",
    gift: { label: "Artisan snack basket", detail: "Optional gift, shown in the demo only" },
  },
  {
    id: "realestate",
    tab: "Real estate",
    milestone: "Housiversary",
    firm: "Harbor & Pine Realty",
    monogram: "HP",
    color: "#1F5C4A",
    sender: "Maya Okafor",
    senderTitle: "Broker Associate",
    recipient: "Priya & Sam",
    card: {
      ...CARD_MAP["postmark"],
      id: "sample-realestate",
      headline: "Happy\nhousiversary",
    },
    message:
      "One year ago today you got the keys to Willow Street. I still remember the look on your faces at the closing table. Hope the house has been everything you wanted, and happy first year at home.",
    disclosure: "Sample disclosure · DRE #00000000 · Brokerage name and license details appear here.",
    gift: { label: "Windowsill herb garden", detail: "Optional gift, shown in the demo only" },
  },
  {
    id: "legal",
    tab: "Legal practice",
    milestone: "Estate-plan review anniversary",
    firm: "Whitcombe & Hale",
    monogram: "WH",
    color: "#3B2F4A",
    sender: "Laura Whitcombe",
    senderTitle: "Partner, Estate Planning",
    recipient: "Margaret Chen",
    card: {
      ...CARD_MAP["garden-arch"],
      id: "sample-legal",
      headline: "With warm\nwishes",
    },
    message:
      "It has been a year since we finalized your estate plan. Thank you for trusting us with something so important. Life has a way of changing; whenever it does, we're glad to take another look together.",
    disclosure: "Sample disclosure · State Bar #000000 · Attorney advertising notices appear here.",
    gift: { label: "Seasonal flowers", detail: "Optional gift, shown in the demo only" },
  },
];
