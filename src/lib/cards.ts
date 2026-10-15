import type { CardDesign } from "@/lib/types";
import { CARD_MAP, CARDS } from "@/data/cards";
import { PALETTES } from "@/data/palettes";

/** Studio designs that ship with the demo workspace (e.g. an approved original for a VIP). */
export const STUDIO_EXAMPLES: CardDesign[] = [
  {
    id: "studio-trail",
    name: "Onward & Upward (original)",
    tagline: "Editorial mountains made in Card Studio.",
    art: "studio:editorial",
    motif: "mountain",
    variant: 1,
    palette: { bg: "#E9F1FF", ink: "#16244F", a: "#FF6B57", b: "#2446D8", c: "#FFD45C", d: "#6FD8B1" },
    headline: "Onward\n& upward",
    headlineFont: "display",
    headlineLayout: "top",
    styles: ["bold", "playful"],
    recipients: ["customer"],
    animated: false,
    color: "cobalt",
    description: "Original concept generated in Card Studio and approved for automation.",
    keywords: ["hiking", "mountain", "outdoors"],
    source: "studio",
    approvedForAutomation: true,
    prompt: "A card for a client who loves hiking. Confident and warm.",
  },
  {
    id: "studio-bloom",
    name: "In Full Bloom (original)",
    tagline: "Watercolor seedlings made in Card Studio.",
    art: "studio:watercolor",
    motif: "plant",
    variant: 0,
    palette: { ...PALETTES.garden },
    headline: "Wishing you a\nyear in full bloom",
    headlineFont: "serif-italic",
    headlineLayout: "center",
    styles: ["elegant", "heartfelt"],
    recipients: ["customer"],
    animated: false,
    color: "mint",
    description: "Original concept generated in Card Studio. Awaiting approval for automation.",
    keywords: ["gardening", "plants"],
    source: "studio",
    approvedForAutomation: false,
    prompt: "Create a birthday card for a customer who loves gardening. Colorful, warm, and a little funny.",
  },
];

const EXAMPLE_MAP: Record<string, CardDesign> = Object.fromEntries(STUDIO_EXAMPLES.map((c) => [c.id, c]));

/** Resolve a card id across the catalog, studio examples and the user's saved cards. */
export function getCard(id: string | null | undefined, saved: CardDesign[] = []): CardDesign {
  if (!id) return CARDS[0];
  return CARD_MAP[id] ?? saved.find((c) => c.id === id) ?? EXAMPLE_MAP[id] ?? CARDS[0];
}

export function allCards(saved: CardDesign[] = []) {
  const ids = new Set(saved.map((c) => c.id));
  return [...CARDS, ...STUDIO_EXAMPLES.filter((c) => !ids.has(c.id)), ...saved];
}
