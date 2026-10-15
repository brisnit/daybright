import type { PlanId } from "@/config/brand";

/* ------------------------------------------------------------------ */
/* Cards                                                               */
/* ------------------------------------------------------------------ */

export type CardStyle = "playful" | "elegant" | "minimal" | "bold" | "heartfelt";
export type CardRecipient = "customer" | "colleague" | "friend" | "family";
export type ColorFamily = "cobalt" | "coral" | "butter" | "mint" | "lilac" | "ink";

/** Artwork compositions. Catalog designs use bespoke keys; studio concepts use style families. */
export type ArtKey =
  | "confetti-parade"
  | "garden-arch"
  | "big-type"
  | "candle-glow"
  | "layer-cake"
  | "balloon-bouquet"
  | "sunburst"
  | "paper-collage"
  | "midnight-sparkler"
  | "wildflower-row"
  | "party-hats"
  | "postmark"
  | "citrus-toast"
  | "orbit-circles"
  | `studio:${StudioStyle}`;

export type Palette = {
  bg: string;
  ink: string;
  a: string;
  b: string;
  c: string;
  d: string;
};

export type HeadlineFont = "display" | "bold" | "retro" | "script" | "sans" | "serif-italic";

export type HeadlineLayout = "top" | "center" | "bottom" | "stacked" | "left";

export type CardDesign = {
  id: string;
  name: string;
  tagline: string;
  art: ArtKey;
  palette: Palette;
  headline: string;
  headlineFont: HeadlineFont;
  headlineLayout: HeadlineLayout;
  headlineColor?: string;
  styles: CardStyle[];
  recipients: CardRecipient[];
  animated: boolean;
  color: ColorFamily;
  description: string;
  /** Keywords used by local search matching. */
  keywords: string[];
  /** Studio-only: motif + layout variation. */
  motif?: Motif;
  variant?: number;
  source?: "catalog" | "studio";
  /** Studio-only bookkeeping */
  createdAt?: string;
  prompt?: string;
  approvedForAutomation?: boolean;
};

/* ------------------------------------------------------------------ */
/* AI studio                                                           */
/* ------------------------------------------------------------------ */

export type StudioStyle =
  | "bold-type"
  | "editorial"
  | "watercolor"
  | "collage"
  | "retro"
  | "minimal";

export type Motif =
  | "flower"
  | "leaf"
  | "coffee"
  | "mountain"
  | "book"
  | "music"
  | "paw"
  | "wave"
  | "cake"
  | "balloon"
  | "star"
  | "plant"
  | "bike"
  | "camera"
  | "chef"
  | "house"
  | "golf"
  | "sun";

export type Tone = "warm" | "funny" | "elegant" | "heartfelt" | "professional" | "playful";

export type StudioBrief = {
  prompt: string;
  occasion: string;
  recipient: CardRecipient | "client" | "team";
  interests: string[];
  style: StudioStyle | "any";
  palette: PaletteId | "any";
  tone: Tone;
  useBranding: boolean;
};

export type PaletteId =
  | "sunny"
  | "cobalt-pop"
  | "garden"
  | "sorbet"
  | "midnight"
  | "linen"
  | "brand";

/* ------------------------------------------------------------------ */
/* Gifts                                                               */
/* ------------------------------------------------------------------ */

export type GiftKind = "digital" | "physical";
export type GiftCategory = "gift-card" | "basket" | "treats" | "flowers" | "wellness";

export type Gift = {
  id: string;
  name: string;
  merchant: string;
  category: GiftCategory;
  kind: GiftKind;
  /** Gift cards have selectable amounts; products have a fixed price. */
  amounts?: number[];
  price?: number;
  shipping: number;
  delivery: string;
  addressRequired: boolean;
  description: string;
  tags: string[];
  art: "coffee-card" | "flex-card" | "snack-basket" | "chocolate" | "flowers" | "wellness" | "garden-kit" | "book-card" | "tea";
  tone: ColorFamily;
};

export type GiftSelection = {
  giftId: string;
  amount: number; // face value for gift cards or product price
  shipping: number;
};

/* ------------------------------------------------------------------ */
/* Messages                                                            */
/* ------------------------------------------------------------------ */

export type MessageFont = "classic" | "handwritten" | "modern" | "typewriter";

export type Extras = {
  recordedGreeting?: { durationSec: number; label: string } | null;
  groupSignatures?: { name: string; note: string }[];
  photoMemories?: string[]; // demo photo ids
  animatedReveal?: boolean;
};

/* ------------------------------------------------------------------ */
/* Business                                                            */
/* ------------------------------------------------------------------ */

export type VoicePreset = "neighborly" | "polished" | "upbeat" | "calm";

export type BrandVoice = {
  preset: VoicePreset;
  tones: string[]; // three tone words
  sample: string;
  usePhrases: string[];
  avoidPhrases: string[];
  signOff: string;
  summary: string;
};

export type Business = {
  name: string;
  logoDataUrl: string | null;
  brandColor: string;
  senderName: string;
  signature: string;
  defaultMessage: string;
  defaultCardId: string;
  timezone: string;
  voice: BrandVoice;
};

export type CardHistoryItem = {
  year: number;
  cardId: string;
  message: string;
  gift?: string;
};

export type Customer = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  birthMonth: number | null; // 1-12
  birthDay: number | null;
  birthYear: number | null;
  company: string;
  tags: string[];
  notes: string;
  interests: string[];
  cardPreference: string | null; // card id
  giftPreference: "card-only" | "gift-ok" | "no-physical";
  createdAt: string; // ISO
  history: CardHistoryItem[];
  /** Optional: customer opted out of AI personalization */
  aiOff?: boolean;
};

export type SendStatus =
  | "pending-review"
  | "scheduled"
  | "sent"
  | "opened"
  | "gift-claimed"
  | "awaiting-address"
  | "needs-attention"
  | "skipped";

export type GiftStatus =
  | "pending-approval"
  | "approved"
  | "held-budget"
  | "claimed"
  | "awaiting-address"
  | "shipped"
  | "declined";

export type SendGift = GiftSelection & {
  status: GiftStatus;
  note?: string;
};

export type SendEvent = { at: string; label: string };

export type Send = {
  id: string;
  source: "automation" | "manual" | "consumer";
  customerId: string | null;
  automationId: string | null;
  recipientName: string;
  recipientEmail: string;
  cardId: string;
  headline?: string;
  message: string;
  messageFont: MessageFont;
  senderName: string;
  fromLabel: string; // business name or person
  brandColor?: string;
  logoDataUrl?: string | null;
  scheduledFor: string; // ISO
  status: SendStatus;
  gift: SendGift | null;
  events: SendEvent[];
  issue?: string;
  extras?: Extras;
  /** AI suggestion provenance shown in review */
  aiReasons?: string[];
  approved?: boolean;
};

export type AutomationRule = {
  id: string;
  name: string;
  active: boolean;
  segment: { type: "all" } | { type: "tag"; tag: string };
  cardId: string;
  messageTemplate: string;
  sendTime: string; // "09:00"
  timezone: string;
  giftMode: "card-only" | "gift";
  giftId: string | null;
  giftAmount: number;
  giftSegmentTag: string | null; // e.g. VIP only
  monthlyGiftBudget: number;
  approval: "auto" | "review";
  avoidRepeat: boolean;
  feb29: "feb28" | "mar1";
  lateAdd: "skip" | "belated";
  aiPersonalize: boolean;
};

export type ConsumerOrder = {
  id: string;
  sendId: string;
  createdAt: string;
  total: number;
};

export type SendDraft = {
  cardId: string;
  headline?: string;
  recipientName: string;
  senderName: string;
  message: string;
  messageFont: MessageFont;
  gift: GiftSelection | null;
  recipientEmail: string;
  when: "now" | "schedule";
  date: string; // yyyy-mm-dd
  time: string; // HH:MM
  addressMode: "ask-recipient" | "enter";
  address: { line1: string; city: string; region: string; postal: string };
  extras: Extras;
};

export type DemoState = {
  version: number;
  onboarded: boolean;
  planId: PlanId;
  business: Business;
  customers: Customer[];
  sends: Send[];
  automations: AutomationRule[];
  savedCards: CardDesign[];
  orders: ConsumerOrder[];
  draft: SendDraft | null;
};
