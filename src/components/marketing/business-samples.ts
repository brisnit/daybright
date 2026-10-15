import { SEED_BUSINESS } from "@/data/seed";
import { VOICE_PRESETS } from "@/lib/ai/voice";

/** Curated examples of one business voice across different customers (fictional people). */
export const BIZ = SEED_BUSINESS;
export const BIZ_VOICE = VOICE_PRESETS[SEED_BUSINESS.voice.preset];
const SENDER_FIRST = SEED_BUSINESS.senderName.split(" ")[0];
const SIGN = SEED_BUSINESS.voice.signOff;

export const VOICE_EXAMPLES = [
  {
    firstName: "Rosa",
    note: "Interests: gardening. “Talks about her tomato beds every time we see her.”",
    cardId: "wildflower-row",
    headline: undefined as string | undefined,
    message: `Happy birthday, Rosa! Hope this year brings a bumper crop of tomatoes and plenty of sunny mornings in the garden. ${SIGN}, ${SENDER_FIRST}`,
    tone: "mint" as const,
  },
  {
    firstName: "Marcus",
    note: "Interests: hiking. “Longtime client. Helped us launch our business.”",
    cardId: "studio-trail",
    headline: undefined,
    message: `Happy birthday, Marcus! We still remember who helped get us started. Wishing you clear trails and big views this year. ${SIGN}, ${SENDER_FIRST}`,
    tone: "cobalt" as const,
  },
  {
    firstName: "Priya",
    note: "Interests: coffee, books. “Always has a book recommendation.”",
    cardId: "orbit-circles",
    headline: undefined,
    message: `Happy birthday, Priya! Thinking of you today. Hope there's a good book and a great cup of coffee in your near future. ${SIGN}, ${SENDER_FIRST}`,
    tone: "lilac" as const,
  },
];
