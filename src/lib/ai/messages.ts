import type { BrandVoice } from "@/lib/types";
import { simulate } from "./simulate";

/**
 * AI Message Assistant — demo implementation.
 * Deterministic templates that only use facts the user supplied.
 * Swap `draftMessages` / `rewriteMessage` for a real provider later; keep the signatures.
 */

export type MessageContext = {
  recipientName: string;
  senderName: string;
  companyName?: string;
  /** Free-text "what would make this feel personal?" */
  notes?: string;
  interests?: string[];
  relationship?: "customer" | "client" | "colleague" | "friend" | "family" | "team";
  voice?: BrandVoice | null;
  /** Business sends default to warm, brief and pitch-free. */
  business?: boolean;
};

export type MessageOption = {
  id: string;
  label: string;
  text: string;
  /** Plain-language list of supplied facts used. */
  usedFacts: string[];
};

export type RewriteAction =
  | "warmer"
  | "shorter"
  | "playful"
  | "professional"
  | "no-sales"
  | `translate:${LanguageCode}`;

export type LanguageCode = "es" | "fr" | "de" | "pt" | "it";

export const LANGUAGES: { code: LanguageCode; label: string }[] = [
  { code: "es", label: "Spanish" },
  { code: "fr", label: "French" },
  { code: "de", label: "German" },
  { code: "pt", label: "Portuguese" },
  { code: "it", label: "Italian" },
];

/* ------------------------------------------------------------------ */
/* Fact extraction: only what the user wrote                           */
/* ------------------------------------------------------------------ */

type Facts = {
  interests: string[];
  longtime: boolean;
  gratitude: string | null; // e.g. "helping us launch our business"
  newClient: boolean;
  used: string[];
};

const INTEREST_WISHES: Record<string, { en: string; es: string; fr: string; de: string; pt: string; it: string; playful: string }> = {
  hiking: { en: "plenty of good trails", es: "muchos buenos senderos", fr: "plein de beaux sentiers", de: "viele schöne Wanderwege", pt: "muitas boas trilhas", it: "tanti bei sentieri", playful: "Trail mix is mandatory today." },
  gardening: { en: "a garden that keeps surprising you", es: "un jardín que te siga sorprendiendo", fr: "un jardin qui continue de vous surprendre", de: "einen Garten, der Sie immer wieder überrascht", pt: "um jardim que continue te surpreendendo", it: "un giardino che continui a sorprenderti", playful: "May your tomatoes be plentiful and your weeds be shy." },
  coffee: { en: "a great cup of coffee every morning", es: "un gran café cada mañana", fr: "un excellent café chaque matin", de: "jeden Morgen einen großartigen Kaffee", pt: "um ótimo café toda manhã", it: "un ottimo caffè ogni mattina", playful: "Today's coffee doesn't count toward the daily limit." },
  books: { en: "a stack of good books", es: "una pila de buenos libros", fr: "une pile de bons livres", de: "einen Stapel guter Bücher", pt: "uma pilha de bons livros", it: "una pila di buoni libri", playful: "Consider this permission to start one more book." },
  reading: { en: "a stack of good books", es: "una pila de buenos libros", fr: "une pile de bons livres", de: "einen Stapel guter Bücher", pt: "uma pilha de bons livros", it: "una pila di buoni libri", playful: "Consider this permission to start one more book." },
  cooking: { en: "full tables and good company", es: "mesas llenas y buena compañía", fr: "des tables pleines et de bons amis", de: "volle Tische und gute Gesellschaft", pt: "mesas cheias e boa companhia", it: "tavole piene e buona compagnia", playful: "Someone else is doing the dishes today. Those are the rules." },
  music: { en: "a great soundtrack", es: "una gran banda sonora", fr: "une belle bande-son", de: "einen großartigen Soundtrack", pt: "uma ótima trilha sonora", it: "una splendida colonna sonora", playful: "Turn it up. It's your birthday." },
  dogs: { en: "lots of happy tail wags", es: "muchas colas felices", fr: "beaucoup de queues qui remuent", de: "viel fröhliches Schwanzwedeln", pt: "muitos rabinhos abanando", it: "tante code scodinzolanti", playful: "Extra treats for everyone, especially the four-legged guests." },
  golf: { en: "a few more birdies", es: "unos cuantos birdies más", fr: "quelques birdies de plus", de: "ein paar Birdies mehr", pt: "mais alguns birdies", it: "qualche birdie in più", playful: "May every putt drop today." },
  cycling: { en: "open roads and tailwinds", es: "caminos abiertos y viento a favor", fr: "des routes dégagées et du vent dans le dos", de: "freie Straßen und Rückenwind", pt: "estradas abertas e vento a favor", it: "strade libere e vento a favore", playful: "Tailwinds only, all year." },
  travel: { en: "a few new stamps in your passport", es: "algunos sellos nuevos en tu pasaporte", fr: "quelques nouveaux tampons dans votre passeport", de: "ein paar neue Stempel im Reisepass", pt: "alguns carimbos novos no passaporte", it: "qualche nuovo timbro sul passaporto", playful: "Window seat, always." },
  photography: { en: "great light wherever you go", es: "buena luz dondequiera que vayas", fr: "une belle lumière partout où vous allez", de: "gutes Licht, wohin Sie auch gehen", pt: "boa luz aonde você for", it: "bella luce ovunque tu vada", playful: "Golden hour lasts all day today." },
  yoga: { en: "plenty of calm", es: "mucha calma", fr: "beaucoup de calme", de: "viel Ruhe", pt: "muita calma", it: "tanta calma", playful: "Namaste in bed a little longer." },
  wine: { en: "a few bottles worth opening", es: "algunas botellas que valga la pena abrir", fr: "quelques bouteilles qui méritent d'être ouvertes", de: "ein paar Flaschen, die es wert sind", pt: "algumas garrafas que valem a pena", it: "qualche bottiglia da aprire", playful: "Pour generously." },
  flowers: { en: "fresh flowers on the table", es: "flores frescas en la mesa", fr: "des fleurs fraîches sur la table", de: "frische Blumen auf dem Tisch", pt: "flores frescas na mesa", it: "fiori freschi sul tavolo", playful: "Stop and smell all of them." },
};

const INTEREST_ALIASES: Record<string, string> = {
  hike: "hiking", hikes: "hiking", hiker: "hiking", trails: "hiking", outdoors: "hiking",
  garden: "gardening", gardens: "gardening", gardener: "gardening", plants: "gardening",
  book: "books", reader: "books", novels: "books",
  cook: "cooking", cooks: "cooking", baking: "cooking", food: "cooking",
  dog: "dogs", puppy: "dogs", bike: "cycling", biking: "cycling", cyclist: "cycling",
  traveling: "travel", travels: "travel", photo: "photography", photos: "photography",
  espresso: "coffee", latte: "coffee", tea: "coffee",
};

export function normalizeInterest(raw: string): string {
  const w = raw.toLowerCase().trim().replace(/[^a-z\s-]/g, "");
  if (INTEREST_WISHES[w]) return w;
  for (const word of w.split(/\s+/)) {
    if (INTEREST_WISHES[word]) return word;
    if (INTEREST_ALIASES[word]) return INTEREST_ALIASES[word];
  }
  return w;
}

export function extractFacts(notes = "", interests: string[] = []): Facts {
  const facts: Facts = { interests: [], longtime: false, gratitude: null, newClient: false, used: [] };
  const text = notes.toLowerCase();
  const fragments = text.split(/[,.;\n]|\band\b/).map((s) => s.trim()).filter(Boolean);

  for (const f of fragments) {
    const love = f.match(/(?:loves?|enjoys?|into|fan of|passionate about|likes?)\s+(.+)/);
    if (love) {
      const parts = love[1].split(/\s*(?:&|\/|\bor\b)\s*/);
      for (const p of parts) {
        const n = normalizeInterest(p);
        if (n && !facts.interests.includes(n)) facts.interests.push(n);
      }
      facts.used.push(f);
      continue;
    }
    if (/long[- ]?time|for years|since \d{4}|years with us/.test(f)) {
      facts.longtime = true;
      facts.used.push(f);
      continue;
    }
    const helped = f.match(/helped us\s+(.+)/);
    if (helped) {
      facts.gratitude = `helping us ${helped[1].replace(/\bour\b/g, "our")}`;
      facts.used.push(f);
      continue;
    }
    if (/new client|first home|just closed|new customer/.test(f)) {
      facts.newClient = true;
      facts.used.push(f);
    }
  }
  for (const i of interests) {
    const n = normalizeInterest(i);
    if (n && !facts.interests.includes(n)) {
      facts.interests.push(n);
      facts.used.push(`interest: ${i}`);
    }
  }
  return facts;
}

function wishFor(interest: string, lang: keyof (typeof INTEREST_WISHES)["hiking"] = "en") {
  const w = INTEREST_WISHES[interest];
  if (w) return w[lang];
  return lang === "en" ? `more time for ${interest}` : null;
}

const first = (full: string) => (full || "there").trim().split(/\s+/)[0];

/* ------------------------------------------------------------------ */
/* Drafting                                                            */
/* ------------------------------------------------------------------ */

export function draftMessagesSync(ctx: MessageContext): MessageOption[] {
  const name = first(ctx.recipientName) || "there";
  const sender = ctx.senderName || "Me";
  const facts = extractFacts(ctx.notes, ctx.interests);
  const voice = ctx.voice;
  const sign = voice?.signOff || (ctx.business ? "Warmly" : "Love");
  const signLine = ctx.business && ctx.companyName ? `${sign}, ${sender} at ${ctx.companyName}` : `${sign}, ${sender}`;
  const interest = facts.interests[0];
  const interestWish = interest ? wishFor(interest) : null;

  const thanks = facts.gratitude
    ? ` Thank you for ${facts.gratitude}. We haven't forgotten it.`
    : facts.longtime
      ? ctx.business
        ? " It's been a real pleasure working with you all these years."
        : " Lucky to have you in my life all these years."
      : facts.newClient
        ? " We're so glad to have you with us."
        : "";

  // Voice shapes wording, punctuation and rhythm, not just the sign-off.
  const preset = voice?.preset ?? "neighborly";
  const bang = preset === "polished" || preset === "calm" ? "." : "!";
  const hello = `Happy birthday, ${name}${bang}`;
  const warmBody = {
    neighborly: interestWish
      ? `I hope the year ahead brings ${interestWish} and plenty of good days in between.`
      : "Thinking of you today and hoping the year ahead is full of good things.",
    polished: interestWish
      ? `We hope the year ahead brings ${interestWish}, along with good health and continued success.`
      : "We hope the year ahead brings good health and continued success.",
    upbeat: interestWish
      ? `Here's to a year packed with ${interestWish}. Go celebrate!`
      : "Hope today is loud, sunny and full of cake. Go celebrate!",
    calm: interestWish
      ? `We hope today brings a quiet moment for yourself, and a year with ${interestWish}.`
      : "We hope today brings a quiet moment just for you.",
  }[preset];
  const briefBody = {
    neighborly: `Wishing you ${interestWish ?? "a wonderful year"}.`,
    polished: `With warm wishes for ${interestWish ?? "a rewarding year ahead"}.`,
    upbeat: `${interestWish ? `Cheers to ${interestWish}!` : "Have the best day!"}`,
    calm: `Wishing you ${interestWish ?? "a gentle, happy year"}.`,
  }[preset];
  const thanksV = preset === "polished" && facts.gratitude ? ` Thank you for ${facts.gratitude}; it meant a great deal.` : thanks;

  const warm = `${hello}${thanksV} ${warmBody} ${signLine}`;
  const brief = `${hello} ${briefBody} ${signLine}`;

  const playfulLine = interest && INTEREST_WISHES[interest] ? INTEREST_WISHES[interest].playful : "Cake first, everything else later.";
  const formal = voice?.preset === "polished" || ctx.relationship === "client";

  const third: MessageOption = formal
    ? {
        id: "professional",
        label: "Polished",
        text: `Happy birthday, ${name}.${facts.gratitude ? ` Thank you for ${facts.gratitude}.` : facts.longtime ? " Thank you for your trust over the years." : ""} Wishing you ${interestWish ?? "good health and a rewarding year ahead"}. ${voice?.signOff || "With best wishes"}, ${sender}${ctx.business && ctx.companyName ? `, ${ctx.companyName}` : ""}`,
        usedFacts: facts.used,
      }
    : {
        id: "playful",
        label: "Playful",
        text: `Happy birthday, ${name}! ${playfulLine}${facts.gratitude ? ` (Also: thank you for ${facts.gratitude}.)` : ""} ${ctx.business ? signLine : `${voice?.signOff || "Cheers"}, ${sender}`}`,
        usedFacts: facts.used,
      };

  return [
    { id: "warm", label: "Warm", text: warm, usedFacts: facts.used },
    { id: "brief", label: "Short & sweet", text: brief, usedFacts: facts.used },
    third,
  ].map((o) => ({ ...o, text: tidy(o.text) }));
}

export async function draftMessages(ctx: MessageContext): Promise<MessageOption[]> {
  await simulate(900);
  return draftMessagesSync(ctx);
}

/* ------------------------------------------------------------------ */
/* Rewriting                                                           */
/* ------------------------------------------------------------------ */

const SALES = /\b(offer|discount|% ?off|deal|promo|coupon|sale|buy|purchase|book (a|your)|schedule (a|your)|call us|referral|refer a friend|listing|limited time|don'?t hesitate|reach out|valued customer|services?)\b/i;

function sentences(text: string) {
  return text.match(/[^.!?]+[.!?]+["”)]?|[^.!?]+$/g)?.map((s) => s.trim()).filter(Boolean) ?? [text];
}

/** Split out a trailing sign-off like "Warmly, Maya" so rewrites keep it intact. */
function splitSignoff(text: string) {
  const m = text.match(/^([\s\S]*?)(\s*(?:Warmly|Love|Cheers|Best|Kindly|With best wishes|Sincerely|All the best|Fondly|Best wishes|Thanks|XO|xo)[,!]?\s+[^.!?]*)$/);
  if (m) return { body: m[1].trim(), sign: m[2].trim() };
  return { body: text.trim(), sign: "" };
}

export function rewriteSync(text: string, action: RewriteAction, ctx: MessageContext): string {
  const { body, sign } = splitSignoff(text);
  const name = first(ctx.recipientName);
  switch (action) {
    case "shorter": {
      const s = sentences(body);
      const keep = s.length > 2 ? [s[0], s[s.length - 1]] : s.slice(0, 1);
      return tidy(`${keep.join(" ")} ${sign}`);
    }
    case "warmer": {
      let out = body.replace(/^Happy birthday,?/i, "Happy birthday,").replace(/\.\s*$/, ".");
      if (!/thinking of you/i.test(out)) out = `${out} Thinking of you today, and so glad you're in our corner.`;
      const newSign = sign ? sign.replace(/^(Best|Kindly|Sincerely|With best wishes|Best wishes|All the best)/, "Warmly") : `Warmly, ${ctx.senderName}`;
      return tidy(`${out} ${newSign}`);
    }
    case "playful": {
      let out = body.replace(/\.(\s|$)/, "!$1");
      const facts = extractFacts(ctx.notes, ctx.interests);
      const line = facts.interests[0] && INTEREST_WISHES[facts.interests[0]] ? INTEREST_WISHES[facts.interests[0]].playful : "Cake for breakfast is officially allowed.";
      if (!out.includes(line)) out = `${out} ${line}`;
      return tidy(`${out} ${sign || `Cheers, ${ctx.senderName}`}`);
    }
    case "professional": {
      let out = body
        .replace(/!+/g, ".")
        .replace(/\b(Hey|Hi)\b/g, "Dear")
        .replace(/\b(awesome|super|amazing)\b/gi, "wonderful")
        .replace(/\bxo+\b/gi, "");
      out = sentences(out).filter((s) => !/cake for breakfast|trail mix|those are the rules|turn it up/i.test(s)).join(" ");
      const newSign = sign ? sign.replace(/^(Love|Cheers|XO|xo|Warmly)/, "With best wishes") : `With best wishes, ${ctx.senderName}`;
      return tidy(`${out} ${newSign}`);
    }
    case "no-sales": {
      const kept = sentences(body).filter((s) => !SALES.test(s));
      const out = kept.length ? kept.join(" ") : `Happy birthday, ${name}! Wishing you a wonderful year ahead.`;
      return tidy(`${out} ${sign}`);
    }
    default: {
      const lang = action.split(":")[1] as LanguageCode;
      return translateSync(ctx, lang);
    }
  }
}

export async function rewriteMessage(text: string, action: RewriteAction, ctx: MessageContext) {
  await simulate(650);
  return rewriteSync(text, action, ctx);
}

/** Demo translation: rebuilds the message in the target language from the same supplied details. */
function translateSync(ctx: MessageContext, lang: LanguageCode) {
  const name = first(ctx.recipientName);
  const facts = extractFacts(ctx.notes, ctx.interests);
  const wish = facts.interests[0] ? wishFor(facts.interests[0], lang) : null;
  const T = {
    es: { hb: `¡Feliz cumpleaños, ${name}!`, wish: wish ? `Te deseo ${wish} este año.` : "Te deseo un año maravilloso.", thanks: "Gracias por todo.", sign: "Con cariño" },
    fr: { hb: `Joyeux anniversaire, ${name} !`, wish: wish ? `Je vous souhaite ${wish} cette année.` : "Je vous souhaite une merveilleuse année.", thanks: "Merci pour tout.", sign: "Chaleureusement" },
    de: { hb: `Alles Gute zum Geburtstag, ${name}!`, wish: wish ? `Ich wünsche Ihnen ${wish} in diesem Jahr.` : "Ich wünsche Ihnen ein wunderbares Jahr.", thanks: "Danke für alles.", sign: "Herzliche Grüße" },
    pt: { hb: `Feliz aniversário, ${name}!`, wish: wish ? `Desejo a você ${wish} este ano.` : "Desejo a você um ano maravilhoso.", thanks: "Obrigado por tudo.", sign: "Com carinho" },
    it: { hb: `Buon compleanno, ${name}!`, wish: wish ? `Ti auguro ${wish} quest'anno.` : "Ti auguro un anno meraviglioso.", thanks: "Grazie di tutto.", sign: "Con affetto" },
  }[lang];
  const company = ctx.business && ctx.companyName ? `, ${ctx.companyName}` : "";
  return `${T.hb} ${T.wish}${facts.gratitude || facts.longtime ? ` ${T.thanks}` : ""} ${T.sign}, ${ctx.senderName}${company}`;
}

/* ------------------------------------------------------------------ */
/* Templates with tokens                                               */
/* ------------------------------------------------------------------ */

export const TOKENS = [
  { token: "{{first_name}}", label: "First name" },
  { token: "{{company_name}}", label: "Company name" },
  { token: "{{sender_name}}", label: "Sender name" },
] as const;

export function renderTemplate(
  template: string,
  vars: { firstName?: string; companyName?: string; senderName?: string },
) {
  return template
    .replace(/\{\{\s*first_name\s*\}\}/g, vars.firstName || "there")
    .replace(/\{\{\s*company_name\s*\}\}/g, vars.companyName || "")
    .replace(/\{\{\s*sender_name\s*\}\}/g, vars.senderName || "");
}

function tidy(s: string) {
  return s.replace(/\s+/g, " ").replace(/\s+([.,!?])/g, "$1").replace(/([.!?])\1+/g, "$1").trim();
}
