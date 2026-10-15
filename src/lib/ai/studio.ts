import type {
  CardDesign,
  CardStyle,
  HeadlineFont,
  HeadlineLayout,
  Motif,
  Palette,
  PaletteId,
  StudioBrief,
  StudioStyle,
  Tone,
} from "@/lib/types";
import { PALETTES, PALETTE_ORDER, brandPalette } from "@/data/palettes";
import { hash, pick, simulate, uid } from "./simulate";

/**
 * AI Card Studio — demo implementation.
 * Produces curated, deterministic concepts that respond to the brief.
 * Artwork is described by (style, motif, variant, palette); headline text is kept separate and editable.
 */

export const STUDIO_STYLES: { id: StudioStyle; label: string; blurb: string }[] = [
  { id: "bold-type", label: "Bold typography", blurb: "Big letterforms do the talking." },
  { id: "editorial", label: "Editorial illustration", blurb: "Flat shapes, confident color, magazine energy." },
  { id: "watercolor", label: "Watercolor botanicals", blurb: "Soft washes and loose florals." },
  { id: "collage", label: "Playful collage", blurb: "Cut paper, stickers and layered scraps." },
  { id: "retro", label: "Retro celebration", blurb: "Sunbursts, stripes and chunky type." },
  { id: "minimal", label: "Elegant minimalism", blurb: "Fine lines and generous space." },
];

export const STYLE_LABEL: Record<StudioStyle, string> = Object.fromEntries(
  STUDIO_STYLES.map((s) => [s.id, s.label]),
) as Record<StudioStyle, string>;

export const TONES: { id: Tone; label: string }[] = [
  { id: "warm", label: "Warm" },
  { id: "funny", label: "A little funny" },
  { id: "elegant", label: "Elegant" },
  { id: "heartfelt", label: "Heartfelt" },
  { id: "professional", label: "Professional" },
  { id: "playful", label: "Playful" },
];

export const OCCASIONS = ["Birthday", "Milestone birthday", "Belated birthday", "Work anniversary", "Client appreciation"];

export const INTEREST_SUGGESTIONS = ["Gardening", "Coffee", "Hiking", "Books", "Music", "Dogs", "Cooking", "Cycling", "Beach", "Photography", "Golf", "Home"];

/* ------------------------------------------------------------------ */
/* Parsing                                                             */
/* ------------------------------------------------------------------ */

const MOTIF_WORDS: [RegExp, Motif][] = [
  [/garden|plant|grow|seed|herb|tomato/, "plant"],
  [/flower|floral|botanical|bloom|rose|peony/, "flower"],
  [/coffee|latte|espresso|cafe|caf[eé]|tea/, "coffee"],
  [/hik|mountain|trail|outdoor|camp|climb/, "mountain"],
  [/book|read|librar|novel|writer/, "book"],
  [/music|band|guitar|song|concert|bass|piano|vinyl/, "music"],
  [/dog|puppy|cat|pet|paw/, "paw"],
  [/beach|ocean|surf|sail|swim|sea|wave|lake/, "wave"],
  [/bike|cycl|ride/, "bike"],
  [/photo|camera/, "camera"],
  [/cook|chef|kitchen|bak|food|dinner/, "chef"],
  [/home|house|real estate|realtor|move|mortgage|propert/, "house"],
  [/golf/, "golf"],
  [/leaf|leaves|autumn|fall|forest/, "leaf"],
  [/sun|summer|sunny/, "sun"],
  [/cake|dessert|sweet/, "cake"],
  [/balloon|party/, "balloon"],
];

const STYLE_WORDS: [RegExp, StudioStyle][] = [
  [/watercolou?r|botanical|soft|painterly/, "watercolor"],
  [/collage|paper|craft|scrap|sticker/, "collage"],
  [/retro|vintage|70s|seventies|groovy/, "retro"],
  [/minimal|elegant|simple|sophisticat|classy|understated|refined|clean/, "minimal"],
  [/bold|typograph|type|statement|loud|big/, "bold-type"],
  [/illustrat|editorial|graphic|modern/, "editorial"],
];

const TONE_WORDS: [RegExp, Tone][] = [
  [/funny|silly|humou?r|joke|pun|a little funny|witty/, "funny"],
  [/elegant|sophisticat|classy|refined/, "elegant"],
  [/heartfelt|sincere|touching|emotional|meaningful/, "heartfelt"],
  [/professional|formal|corporate|polished/, "professional"],
  [/playful|fun|cheerful|bright/, "playful"],
  [/warm|kind|cozy/, "warm"],
];

const PALETTE_WORDS: [RegExp, PaletteId][] = [
  [/brand|company colou?rs|our colou?rs/, "brand"],
  [/dark|night|moody|black|navy/, "midnight"],
  [/green|garden|earthy|sage/, "garden"],
  [/pink|peach|pastel|sorbet|coral/, "sorbet"],
  [/blue|cobalt/, "cobalt-pop"],
  [/neutral|linen|cream|muted|beige/, "linen"],
  [/colou?rful|bright|vivid|yellow|sunny|cheerful/, "sunny"],
];

export function parseBrief(text: string) {
  const t = text.toLowerCase();
  const motifs = MOTIF_WORDS.filter(([r]) => r.test(t)).map(([, m]) => m);
  const style = STYLE_WORDS.find(([r]) => r.test(t))?.[1];
  const tone = TONE_WORDS.find(([r]) => r.test(t))?.[1];
  const palette = PALETTE_WORDS.find(([r]) => r.test(t))?.[1];
  const recipient = /customer|client|patient|guest|member/.test(t)
    ? "customer"
    : /cowork|colleague|team|boss|employee/.test(t)
      ? "colleague"
      : /mom|dad|mother|father|sister|brother|grand|aunt|uncle|family|wife|husband|partner/.test(t)
        ? "family"
        : /friend|bestie|buddy/.test(t)
          ? "friend"
          : undefined;
  return { motifs: [...new Set(motifs)], style, tone, palette, recipient };
}

/* ------------------------------------------------------------------ */
/* Headline library                                                    */
/* ------------------------------------------------------------------ */

const HEADLINES: Partial<Record<Motif, Record<"funny" | "warm" | "elegant", string[]>>> = {
  plant: {
    funny: ["Growing older,\nnot up", "Hope your day\nis un-be-leaf-able", "You're a\nlate bloomer?\nNever."],
    warm: ["Wishing you a\nyear in full bloom", "Grow on,\nbirthday friend", "May this year\ngrow beautifully"],
    elegant: ["In full bloom", "A year to\nflourish", "Rooted in\ngratitude"],
  },
  flower: {
    funny: ["You're one\nhot-house flower", "Blooming\nmarvelous", "Petal to\nthe metal"],
    warm: ["Wishing you\na lovely year", "Bloom where\nyou're planted", "A bouquet\nof birthday wishes"],
    elegant: ["In full bloom", "Fresh flowers,\nfresh year", "With warmest\nwishes"],
  },
  coffee: {
    funny: ["You're\nbrew-tiful", "Espresso\nyourself", "A latte love\nfor you"],
    warm: ["Here's to slow\nmornings", "Grab a mug.\nIt's your day.", "Warm wishes,\nstrong coffee"],
    elegant: ["A toast,\nin a mug", "Savor the day", "Freshly brewed\nwishes"],
  },
  mountain: {
    funny: ["Peak\nbirthday", "Over the hill?\nKeep climbing.", "Altitude:\nexcellent"],
    warm: ["Onward\n& upward", "Another year,\nanother summit", "May every trail\nlead somewhere good"],
    elegant: ["New heights", "The view from\nhere is lovely", "Onward"],
  },
  book: {
    funny: ["You're a\npage-turner", "Plot twist:\nyou're older", "Bookmark\nthis day"],
    warm: ["Another chapter\nbegins", "Here's to your\nbest chapter yet", "A story\nworth celebrating"],
    elegant: ["Chapter next", "A fine new\nchapter", "Well read,\nwell loved"],
  },
  music: {
    funny: ["Turn it up,\nit's your day", "You rock.\nLiterally.", "Encore!"],
    warm: ["Here's to your\ngreatest hits", "A year with a\ngreat soundtrack", "Play it loud"],
    elegant: ["In perfect\nharmony", "A note for you", "Bravo"],
  },
  paw: {
    funny: ["Paws for\ncelebration", "Who's a\nbirthday human?", "Best in show"],
    warm: ["From the\nwhole pack", "Tail wags\nall day", "Sending you\npuppy-sized joy"],
    elegant: ["Good company", "Loyal wishes", "With love, the pack"],
  },
  wave: {
    funny: ["Shore thing:\nit's your day", "Sea-riously,\nhappy birthday", "Make\nwaves"],
    warm: ["Ride the\nwave", "Sun, salt\n& you", "A tide of\ngood wishes"],
    elegant: ["Endless\nsummer", "Calm waters\nahead", "By the sea"],
  },
  bike: {
    funny: ["Wheelie\nhappy birthday", "Gear up,\nit's your day", "Ride or\nbirthday"],
    warm: ["Tailwinds\nall year", "Enjoy the ride", "Open roads\nahead"],
    elegant: ["Onward", "The long ride", "A good road"],
  },
  camera: {
    funny: ["Snap!\nYou're older.", "Picture\nperfect", "Say cake!"],
    warm: ["Here's to\nbig moments", "Frame-worthy\nyear ahead", "Capture\nthe day"],
    elegant: ["Golden hour", "In focus", "A moment\nfor you"],
  },
  chef: {
    funny: ["Chef's kiss\nbirthday", "Whisk-ful\nthinking", "You're\nthe main course"],
    warm: ["Full tables,\nfull hearts", "A recipe for\na great year", "Cooked up\njust for you"],
    elegant: ["Bon appétit", "To the host\nwith the most", "Savor it"],
  },
  house: {
    funny: ["Home sweet\nbirthday", "No place\nlike your day", "Party at\nyour place"],
    warm: ["Feel at home\ntoday", "Wishing you\nhappy at home", "Here's to\nhome & you"],
    elegant: ["At home with\ngood wishes", "Welcome home,\nanother year", "Home & heart"],
  },
  golf: {
    funny: ["Fore!\nYou're older.", "Hole in one\nbirthday", "Par-ty time"],
    warm: ["Here's to a\nyear under par", "Fairways\nahead", "A great\ndrive ahead"],
    elegant: ["On the green", "The back nine,\nbeautifully", "Fairways"],
  },
};

const GENERIC_HEADLINES = {
  funny: ["Older,\nwiser,\ncake-ier", "Another trip\naround the sun", "Level up!"],
  warm: ["Happy\nbirthday", "Celebrating\nyou today", "Here's to you"],
  elegant: ["With warmest\nwishes", "A beautiful\nyear ahead", "Many happy\nreturns"],
};

function headlineBank(motif: Motif | undefined, tone: Tone) {
  const key = tone === "funny" || tone === "playful" ? "funny" : tone === "elegant" || tone === "professional" ? "elegant" : "warm";
  const bank = (motif && HEADLINES[motif]?.[key]) || GENERIC_HEADLINES[key];
  return bank;
}

/* ------------------------------------------------------------------ */
/* Style presets                                                       */
/* ------------------------------------------------------------------ */

const STYLE_FONT: Record<StudioStyle, HeadlineFont> = {
  "bold-type": "bold",
  editorial: "display",
  watercolor: "serif-italic",
  collage: "bold",
  retro: "retro",
  minimal: "serif-italic",
};

const STYLE_LAYOUTS: Record<StudioStyle, HeadlineLayout[]> = {
  "bold-type": ["stacked", "center", "left"],
  editorial: ["top", "bottom", "left"],
  watercolor: ["center", "bottom", "top"],
  collage: ["left", "center", "bottom"],
  retro: ["center", "bottom", "top"],
  minimal: ["bottom", "center", "left"],
};

const STYLE_TO_CATALOG: Record<StudioStyle, CardStyle[]> = {
  "bold-type": ["bold"],
  editorial: ["playful", "bold"],
  watercolor: ["elegant", "heartfelt"],
  collage: ["playful"],
  retro: ["bold", "playful"],
  minimal: ["minimal", "elegant"],
};

function defaultPaletteFor(style: StudioStyle, tone: Tone): Exclude<PaletteId, "brand"> {
  if (style === "watercolor") return "garden";
  if (style === "minimal") return tone === "elegant" ? "midnight" : "linen";
  if (style === "retro") return "sorbet";
  if (style === "bold-type") return "cobalt-pop";
  if (style === "collage") return "linen";
  return "sunny";
}

export function stylesForBrief(brief: StudioBrief, parsedStyle?: StudioStyle): StudioStyle[] {
  const order: StudioStyle[] = [];
  const add = (s?: StudioStyle) => s && !order.includes(s) && order.push(s);
  add(brief.style !== "any" ? brief.style : undefined);
  add(parsedStyle);
  const tone = brief.tone;
  if (tone === "funny" || tone === "playful") ["bold-type", "collage", "editorial", "retro"].forEach((s) => add(s as StudioStyle));
  if (tone === "elegant" || tone === "professional") ["minimal", "watercolor", "editorial"].forEach((s) => add(s as StudioStyle));
  if (tone === "warm" || tone === "heartfelt") ["watercolor", "editorial", "collage", "minimal"].forEach((s) => add(s as StudioStyle));
  STUDIO_STYLES.forEach((s) => add(s.id));
  return order.slice(0, 3);
}

/* ------------------------------------------------------------------ */
/* Public API                                                          */
/* ------------------------------------------------------------------ */

export type Concept = CardDesign & { conceptNote: string };

export function resolvePalette(id: PaletteId | "any", brandColor?: string, fallback: Exclude<PaletteId, "brand"> = "sunny"): Palette {
  if (id === "brand") return brandPalette(brandColor || "#2446D8");
  if (id === "any") return strip(PALETTES[fallback]);
  return strip(PALETTES[id]);
}
function strip(p: Palette & { label?: string }): Palette {
  return { bg: p.bg, ink: p.ink, a: p.a, b: p.b, c: p.c, d: p.d };
}

export function briefFromText(prompt: string, partial: Partial<StudioBrief> = {}): StudioBrief {
  const parsed = parseBrief(prompt);
  return {
    prompt,
    occasion: "Birthday",
    recipient: (parsed.recipient as StudioBrief["recipient"]) ?? "friend",
    interests: parsed.motifs.length ? [] : [],
    style: parsed.style ?? "any",
    palette: parsed.palette ?? "any",
    tone: parsed.tone ?? "warm",
    useBranding: false,
    ...partial,
  };
}

export function generateConceptsSync(brief: StudioBrief, brandColor?: string): Concept[] {
  const text = `${brief.prompt} ${brief.interests.join(" ")}`;
  const parsed = parseBrief(text);
  const seed = hash(`${text}|${brief.style}|${brief.palette}|${brief.tone}|${brief.recipient}`);
  const motifs: Motif[] = parsed.motifs.length ? parsed.motifs : (["cake", "balloon", "star", "sun"] as Motif[]);
  const tone = brief.tone;
  const styles = stylesForBrief(brief, parsed.style);
  const paletteChoice: PaletteId | "any" = brief.useBranding ? "brand" : brief.palette !== "any" ? brief.palette : parsed.palette ?? "any";

  return styles.map((style, i) => {
    const motif = motifs[i % motifs.length];
    const bank = headlineBank(motif, tone);
    const headline = pick(bank, seed, i);
    const fallbackPalette =
      paletteChoice === "any" ? (i === 0 ? defaultPaletteFor(style, tone) : pick(PALETTE_ORDER, seed, i * 2 + 1)) : "sunny";
    const palette = resolvePalette(paletteChoice, brandColor, fallbackPalette);
    const variant = (seed + i) % 3;
    const layout = STYLE_LAYOUTS[style][variant];
    return {
      id: uid("studio"),
      name: `${STYLE_LABEL[style]} · ${motifName(motif)}`,
      tagline: conceptNote(style, motif, tone),
      conceptNote: conceptNote(style, motif, tone),
      art: `studio:${style}` as const,
      motif,
      variant,
      palette,
      headline,
      headlineFont: STYLE_FONT[style],
      headlineLayout: layout,
      styles: STYLE_TO_CATALOG[style],
      recipients: [toCatalogRecipient(brief.recipient)],
      animated: style === "collage" || style === "retro",
      color: "cobalt",
      description: conceptNote(style, motif, tone),
      keywords: [motif, style, tone],
      source: "studio" as const,
      prompt: brief.prompt,
      createdAt: new Date().toISOString(),
    };
  });
}

export async function generateConcepts(brief: StudioBrief, brandColor?: string) {
  await simulate(2600);
  return generateConceptsSync(brief, brandColor);
}

export type Refinement = { concept: Concept; changeNote: string };

export function refineConceptSync(c: Concept, instruction: string, brandColor?: string): Refinement {
  const t = instruction.toLowerCase();
  const seed = hash(t + c.id + c.headline);
  const next: Concept = { ...c, id: uid("studio") };
  const notes: string[] = [];
  const style = (c.art.replace("studio:", "") as StudioStyle) || "editorial";
  const keepArt = /keep (the )?(art|artwork|design|image|illustration)/.test(t);

  if (!keepArt) {
    if (/botanical|floral|flower|garden|leafy|plants?/.test(t)) {
      next.art = "studio:watercolor";
      next.motif = /garden|plant/.test(t) ? "plant" : "flower";
      next.headlineFont = "serif-italic";
      if (!/colou?r/.test(t)) next.palette = resolvePalette("garden");
      notes.push("Moved to watercolor botanicals");
    }
    const parsedStyle = STYLE_WORDS.find(([r]) => r.test(t))?.[1];
    if (parsedStyle && !/botanical|floral|flower/.test(t)) {
      next.art = `studio:${parsedStyle}`;
      next.headlineFont = STYLE_FONT[parsedStyle];
      next.headlineLayout = STYLE_LAYOUTS[parsedStyle][next.variant ?? 0];
      notes.push(`Switched to ${STYLE_LABEL[parsedStyle].toLowerCase()}`);
    }
    const pal = PALETTE_WORDS.find(([r]) => r.test(t))?.[1];
    if (pal) {
      next.palette = resolvePalette(pal, brandColor);
      notes.push(pal === "brand" ? "Applied your brand colors" : `Changed colors to ${pal === "midnight" ? "a darker palette" : PALETTES[pal as Exclude<PaletteId, "brand">].label.toLowerCase()}`);
    }
    if (/different (layout|composition)|rearrange|move/.test(t)) {
      next.variant = ((c.variant ?? 0) + 1) % 3;
      notes.push("Tried a new composition");
    }
  }

  const lessFormal = /less formal|casual|relaxed|funnier|funny|joke|lighter|playful|silly/.test(t);
  const moreFormal = /more formal|professional|elegant|sophisticat|serious|classy/.test(t);
  const newHeadline = /headline|wording|words|text|say something else/.test(t);

  if (lessFormal || moreFormal || newHeadline || keepArt) {
    const tone: Tone = lessFormal ? "funny" : moreFormal ? "elegant" : "warm";
    const bank = headlineBank(next.motif, tone).filter((h) => h !== c.headline);
    next.headline = pick(bank.length ? bank : GENERIC_HEADLINES.warm, seed);
    if (lessFormal && !keepArt) next.headlineFont = next.headlineFont === "serif-italic" ? "display" : next.headlineFont;
    if (moreFormal && !keepArt) next.headlineFont = "serif-italic";
    notes.push(lessFormal ? "Loosened up the headline" : moreFormal ? "Made the headline more refined" : "Rewrote the headline");
  }

  if (/bigger|larger/.test(t)) {
    next.headlineFont = "bold";
    notes.push("Made the type bigger and bolder");
  }

  if (!notes.length) {
    next.variant = ((c.variant ?? 0) + 1) % 3;
    next.headline = pick(headlineBank(next.motif, "warm").filter((h) => h !== c.headline), seed);
    notes.push("Explored a variation with a new composition and headline");
  }
  const s = next.art.replace("studio:", "") as StudioStyle;
  // Each style composes its art around specific headline positions; keep them in sync after a style change.
  if (!keepArt && STYLE_LAYOUTS[s]) next.headlineLayout = STYLE_LAYOUTS[s][next.variant ?? 0];
  next.name = `${STYLE_LABEL[s] ?? STYLE_LABEL[style]} · ${motifName(next.motif ?? "star")}`;
  next.conceptNote = conceptNote(s, next.motif ?? "star", lessFormal ? "funny" : "warm");
  return { concept: next, changeNote: notes.join(" · ") };
}

export async function refineConcept(c: Concept, instruction: string, brandColor?: string) {
  await simulate(1500);
  return refineConceptSync(c, instruction, brandColor);
}

export function recolor(c: Concept, paletteId: PaletteId, brandColor?: string): Concept {
  return { ...c, palette: resolvePalette(paletteId, brandColor) };
}

export function rewriteHeadline(c: Concept, tone: Tone = "warm"): Concept {
  const bank = headlineBank(c.motif, tone).filter((h) => h !== c.headline);
  return { ...c, headline: pick(bank.length ? bank : GENERIC_HEADLINES.warm, hash(c.headline + tone)) };
}

export const SURPRISE_PROMPTS = [
  "A card for my sister who just ran her first marathon. Bright, bold and proud.",
  "Birthday card for a coworker who lives on cold brew. Funny, but office-safe.",
  "Something elegant for a longtime client who loves sailing.",
  "A watercolor card for my grandmother who keeps a rose garden.",
  "Retro card for a friend who collects vinyl records. Groovy and loud.",
  "Minimal card for a customer who just bought their first home.",
  "A playful collage card for a friend who adopted a rescue dog this year.",
  "Card for a bookworm neighbor. Warm, cozy, a little witty.",
];

export function surprisePrompt(seed = Date.now()) {
  return SURPRISE_PROMPTS[seed % SURPRISE_PROMPTS.length];
}

/* ------------------------------------------------------------------ */

function motifName(m: Motif) {
  return (
    {
      flower: "Blooms", leaf: "Leaves", coffee: "Coffee", mountain: "Trails", book: "Books", music: "Music",
      paw: "Paws", wave: "Waves", cake: "Cake", balloon: "Balloons", star: "Stars", plant: "Seedlings",
      bike: "Cycling", camera: "Snapshots", chef: "Kitchen", house: "Home", golf: "Fairway", sun: "Sunshine",
    } as Record<Motif, string>
  )[m];
}

function conceptNote(style: StudioStyle, motif: Motif, tone: Tone) {
  const s = {
    "bold-type": "Oversized lettering carries the message",
    editorial: "Flat, confident illustration with a magazine feel",
    watercolor: "Loose watercolor washes with hand-painted detail",
    collage: "Cut-paper layers and sticker accents",
    retro: "Sunburst rays and chunky retro lettering",
    minimal: "Fine-line drawing with generous white space",
  }[style];
  const m = motifName(motif).toLowerCase();
  const toneText = tone === "funny" || tone === "playful" ? "the joke lives in the headline" : tone === "elegant" || tone === "professional" ? "quiet and refined" : "warm and personal";
  return `${s}; ${m} motif; ${toneText}.`;
}

function toCatalogRecipient(r: StudioBrief["recipient"]) {
  if (r === "client") return "customer" as const;
  if (r === "team") return "colleague" as const;
  return r;
}
