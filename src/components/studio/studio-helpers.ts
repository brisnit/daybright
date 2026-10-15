import type { CardDesign, Motif, PaletteId, StudioBrief, StudioStyle, Tone } from "@/lib/types";
import { parseBrief, STYLE_LABEL, TONES, type Concept } from "@/lib/ai/studio";
import { PALETTES } from "@/data/palettes";

/** Map parsed motifs back to the human interest chips shown in the Studio controls. */
export const MOTIF_INTEREST: Partial<Record<Motif, string>> = {
  plant: "Gardening",
  flower: "Flowers",
  coffee: "Coffee",
  mountain: "Hiking",
  book: "Books",
  music: "Music",
  paw: "Dogs",
  wave: "Beach",
  bike: "Cycling",
  camera: "Photography",
  chef: "Cooking",
  house: "Home",
  golf: "Golf",
  leaf: "Autumn",
  sun: "Summer",
};

export type RecipientOption = StudioBrief["recipient"];

export const RECIPIENT_OPTIONS: { id: RecipientOption; label: string }[] = [
  { id: "customer", label: "Customer" },
  { id: "client", label: "Client" },
  { id: "colleague", label: "Colleague" },
  { id: "team", label: "Team" },
  { id: "friend", label: "Friend" },
  { id: "family", label: "Family" },
];

export type ParsedHints = {
  interests: string[];
  /** Every tone word found, e.g. "warm" and "a little funny". */
  toneWords: Tone[];
  style?: StudioStyle;
  tone?: Tone;
  palette?: PaletteId;
  recipient?: RecipientOption;
};

/** Read a sentence into control suggestions (the user can override every one). */
export function hintsFromText(text: string): ParsedHints {
  const p = parseBrief(text);
  const t = text.toLowerCase();
  const recipient: RecipientOption | undefined = /\bclient/.test(t) ? "client" : /\bteam\b/.test(t) ? "team" : (p.recipient as RecipientOption | undefined);
  return {
    interests: [...new Set(p.motifs.map((m) => MOTIF_INTEREST[m]).filter(Boolean) as string[])],
    toneWords: TONES.filter((x) => x.id !== "playful" || !/funny/.test(t))
      .filter((x) => new RegExp(x.id === "funny" ? "funny|silly|witty|humou?r" : x.id === "playful" ? "playful|cheerful|\\bfun\\b" : x.id === "elegant" ? "elegant|sophisticat|classy|refined" : x.id === "professional" ? "professional|formal|polished" : x.id === "heartfelt" ? "heartfelt|sincere|meaningful" : "warm|cozy|kind").test(t))
      .map((x) => x.id),
    style: p.style,
    tone: p.tone,
    palette: p.palette,
    recipient,
  };
}

export const toneLabel = (t: Tone) => TONES.find((x) => x.id === t)?.label ?? t;

export function paletteLabel(id: PaletteId | "any") {
  if (id === "any") return "Studio's choice";
  if (id === "brand") return "Our brand colors";
  return PALETTES[id].label;
}

/** Progress copy for the generation sequence, written from the actual brief. */
export function progressSteps(brief: StudioBrief, branded: boolean, toneWords: Tone[] = []): string[] {
  const tones = [...new Set([...toneWords.filter((t) => t !== brief.tone), brief.tone])];
  const idea = [
    ...brief.interests.map((i) => i.toLowerCase()),
    ...tones.map((t) => toneLabel(t).toLowerCase()),
    brief.style !== "any" ? STYLE_LABEL[brief.style].toLowerCase() : null,
  ].filter(Boolean);
  const recipient = { customer: "a customer", client: "a client", colleague: "a colleague", team: "the team", friend: "a friend", family: "family" }[brief.recipient];
  return [
    `Reading your idea: ${idea.join(", ")}`,
    `${brief.occasion} card for ${recipient}`,
    "Sketching three compositions",
    brief.palette === "any" ? "Trying palettes that suit each style" : `Mixing the palette: ${paletteLabel(brief.palette).toLowerCase()}`,
    "Setting the headline type",
    branded ? "Placing your logo where it won't crowd the art" : "Checking the headline reads at phone size",
  ];
}

/** Concept → plain CardDesign for saving. */
export function toCardDesign(c: Concept, opts: { id?: string; headline: string; approved?: boolean }): CardDesign {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { conceptNote, ...rest } = c;
  return {
    ...rest,
    id: opts.id ?? c.id,
    headline: opts.headline,
    tagline: c.conceptNote,
    description: c.conceptNote,
    approvedForAutomation: opts.approved ?? c.approvedForAutomation ?? false,
  };
}

/** Saved CardDesign → Concept, so a saved studio card can be reopened in the editor. */
export function toConcept(c: CardDesign): Concept {
  return { ...c, conceptNote: c.description || c.tagline };
}

export const REFINE_CHIPS = ["Less formal.", "Make it more botanical.", "Use our brand colors.", "Keep the artwork, change the headline."];
