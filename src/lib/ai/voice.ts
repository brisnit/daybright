import type { BrandVoice, VoicePreset } from "@/lib/types";

/**
 * Brand voice presets and helpers.
 * Demo implementation: curated presets and deterministic rewriting.
 */

export const VOICE_PRESETS: Record<VoicePreset, { label: string; description: string; voice: BrandVoice }> = {
  neighborly: {
    label: "Warm and neighborly",
    description: "Friendly, first-name basis, like a note from someone down the street.",
    voice: {
      preset: "neighborly",
      tones: ["Warm", "Friendly", "Personal"],
      sample: "Thanks for stopping by! We loved catching up and can't wait to see you again soon.",
      usePhrases: ["Warmly", "thinking of you"],
      avoidPhrases: ["valued customer", "don't hesitate to reach out", "special offer"],
      signOff: "Warmly",
      summary:
        "Warm, friendly and personal. Uses first names, short sentences and everyday words. Sounds like a neighbor, never a sales team.",
    },
  },
  polished: {
    label: "Polished and professional",
    description: "Courteous and composed. Fits advisory, legal and financial services.",
    voice: {
      preset: "polished",
      tones: ["Polished", "Gracious", "Concise"],
      sample: "Thank you for your continued trust. It is a privilege to work with you.",
      usePhrases: ["With best wishes", "it's a privilege"],
      avoidPhrases: ["awesome", "super excited", "special offer"],
      signOff: "With best wishes",
      summary:
        "Gracious, composed and concise. Complete sentences, no slang, sincere without being effusive.",
    },
  },
  upbeat: {
    label: "Playful and upbeat",
    description: "Bright energy, a little wit, lots of exclamation-point joy (but not too many).",
    voice: {
      preset: "upbeat",
      tones: ["Playful", "Bright", "Witty"],
      sample: "You made our week! Come back soon. We'll save you the good seat.",
      usePhrases: ["Cheers", "hooray"],
      avoidPhrases: ["valued customer", "per our records", "special offer"],
      signOff: "Cheers",
      summary:
        "Bright, playful and a little witty. Short lines, light humor, and genuine enthusiasm without hype.",
    },
  },
  calm: {
    label: "Calm and understated",
    description: "Quiet, thoughtful, plenty of white space.",
    voice: {
      preset: "calm",
      tones: ["Calm", "Thoughtful", "Simple"],
      sample: "Thank you for being here. We hope today is a good one.",
      usePhrases: ["Kindly", "a quiet moment"],
      avoidPhrases: ["amazing", "!!!", "special offer"],
      signOff: "Kindly",
      summary:
        "Calm, simple and thoughtful. Few exclamation points, gentle wishes, room to breathe.",
    },
  },
};

export const VOICE_ORDER: VoicePreset[] = ["neighborly", "polished", "upbeat", "calm"];

const TONE_WORDS: Record<string, string> = {
  warm: "warm", friendly: "friendly", personal: "personal", polished: "polished", gracious: "gracious",
  concise: "concise", playful: "playful", bright: "bright", witty: "witty", calm: "calm",
  thoughtful: "thoughtful", simple: "simple",
};

/** Builds an editable plain-language summary of a voice definition. */
export function summarizeVoice(v: Omit<BrandVoice, "summary">): string {
  const tones = v.tones.filter(Boolean).map((t) => TONE_WORDS[t.toLowerCase()] ?? t.toLowerCase());
  const toneText = tones.length ? listJoin(tones) : "warm";
  const sampleLen = v.sample.split(/\s+/).filter(Boolean).length;
  const style = sampleLen && sampleLen < 18 ? "Short sentences and everyday words." : "Complete sentences with a little more detail.";
  const exclaims = (v.sample.match(/!/g) || []).length;
  const punct = exclaims >= 2 ? " Happy to use an exclamation point." : exclaims === 0 ? " Rarely uses exclamation points." : "";
  const use = v.usePhrases.filter(Boolean).length ? ` Likes phrases such as “${v.usePhrases.filter(Boolean).join("”, “")}”.` : "";
  const avoid = v.avoidPhrases.filter(Boolean).length ? ` Avoids “${v.avoidPhrases.filter(Boolean).join("”, “")}”.` : "";
  const sign = v.signOff ? ` Signs off with “${v.signOff}”.` : "";
  return `${cap(toneText)}. ${style}${punct}${use}${avoid}${sign} No sales pitches in birthday messages.`;
}

/** Sample birthday message in a given voice. Uses only the name supplied. */
export function sampleMessageForVoice(v: BrandVoice, opts: { firstName?: string; sender?: string; company?: string } = {}) {
  const name = opts.firstName ?? "Jordan";
  const sender = opts.sender ?? "Maya";
  const company = opts.company ? ` at ${opts.company}` : "";
  const sign = v.signOff || "Warmly";
  switch (v.preset) {
    case "polished":
      return `Happy birthday, ${name}. Wishing you good health and a rewarding year ahead. ${sign}, ${sender}${company}`;
    case "upbeat":
      return `Happy birthday, ${name}! Hope today is loud, sunny and full of cake. ${sign}, ${sender}${company}`;
    case "calm":
      return `Happy birthday, ${name}. We hope today brings a quiet moment just for you. ${sign}, ${sender}${company}`;
    default:
      return `Happy birthday, ${name}! Thinking of you today and hoping the year ahead is a good one. ${sign}, ${sender}${company}`;
  }
}

/** A deliberately generic "before" message used for before/after previews. */
export const GENERIC_MESSAGE = (name = "Jordan", company = "our company") =>
  `Dear valued customer ${name}, happy birthday from all of us at ${company}! Don't hesitate to reach out if we can help with anything. Enjoy 10% off your next visit!`;

function listJoin(xs: string[]) {
  if (xs.length <= 1) return xs.join("");
  return `${xs.slice(0, -1).join(", ")} and ${xs[xs.length - 1]}`;
}
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
