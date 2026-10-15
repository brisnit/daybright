import type { PlanId } from "@/config/brand";
import { money } from "@/config/brand";
import { GIFT_MAP } from "@/data/gifts";
import { fmtTime, isValidBirthday, MONTHS, tzLabel } from "@/lib/dates";
import type { BrandVoice, Customer } from "@/lib/types";

export type NewCustomer = Omit<Customer, "id" | "createdAt" | "history">;

/** Everything collected during onboarding. Held locally until "Activate demo workspace". */
export type OnboardingDraft = {
  planId: PlanId;
  name: string;
  senderName: string;
  signature: string;
  logo: string | null;
  brandColor: string;
  voice: BrandVoice;
  voiceGenerated: boolean;
  customerMode: "demo" | "manual" | "csv";
  newCustomers: NewCustomer[];
  cardId: string;
  template: string;
  sendTime: string;
  timezone: string;
  approval: "review" | "auto";
  giftOn: boolean;
  giftId: string;
  giftAmount: number;
  budget: number;
  vipOnly: boolean;
};

export const BRAND_SWATCHES = [
  { hex: "#1F5C4A", label: "Pine" },
  { hex: "#2446D8", label: "Cobalt" },
  { hex: "#C9402C", label: "Brick" },
  { hex: "#5B3FB8", label: "Violet" },
  { hex: "#0E6E7E", label: "Teal" },
  { hex: "#B4235A", label: "Berry" },
  { hex: "#8A6400", label: "Ochre" },
  { hex: "#1C1838", label: "Ink" },
];

export function automationSentence(d: OnboardingDraft) {
  const when = d.timezone === "recipient" ? "in each recipient's local time" : `${tzLabel(d.timezone)} time`;
  let s = `Send every customer a birthday card at ${fmtTime(d.sendTime || "09:00")} ${when}.`;
  s += d.approval === "review" ? " Each card waits for your review before it goes out." : " Cards go out automatically.";
  if (d.giftOn) {
    const g = GIFT_MAP[d.giftId];
    const name = g ? g.name.toLowerCase() : "gift";
    const amt = g?.amounts ? `${money(d.giftAmount)} ` : "";
    s += ` Include a ${amt}${name} for ${d.vipOnly ? "VIP customers" : "every customer"}, subject to approval and the ${money(d.budget)} monthly gift budget.`;
  } else {
    s += " Card only, no gifts.";
  }
  return s;
}

/* ------------------------------------------------------------------ */
/* Lightweight CSV parsing for the onboarding preview                  */
/* ------------------------------------------------------------------ */

export const SAMPLE_CSV = `first_name,last_name,email,birthday,company
Hannah,Brooks,hannah.brooks@example.com,04/12,Brooks Bakery
Theo,Nguyen,theo@example.com,11/03,
Priya,Shah,,07/22,Shah Dental
Owen,Carter,owen.carter@example.com,02/30,
Lucia,Romero,lucia.romero@example.com,,Romero Design`;

export type ParsedRow = { row: NewCustomer; issues: string[] };

function splitLine(line: string) {
  const out: string[] = [];
  let cur = "";
  let q = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (q && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else q = !q;
    } else if (ch === "," && !q) {
      out.push(cur.trim());
      cur = "";
    } else cur += ch;
  }
  out.push(cur.trim());
  return out;
}

function parseBirthday(raw: string): { m: number | null; d: number | null; y: number | null } {
  const s = raw.trim();
  if (!s) return { m: null, d: null, y: null };
  let m: RegExpMatchArray | null;
  if ((m = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/))) return { y: +m[1], m: +m[2], d: +m[3] };
  if ((m = s.match(/^(\d{1,2})[/-](\d{1,2})(?:[/-](\d{2,4}))?$/))) return { m: +m[1], d: +m[2], y: m[3] && m[3].length === 4 ? +m[3] : null };
  if ((m = s.match(/^([A-Za-z]+)\.?\s+(\d{1,2})(?:,?\s*(\d{4}))?$/))) {
    const idx = MONTHS.findIndex((x) => x.toLowerCase().startsWith(m![1].toLowerCase().slice(0, 3)));
    if (idx >= 0) return { m: idx + 1, d: +m[2], y: m[3] ? +m[3] : null };
  }
  return { m: -1, d: -1, y: null };
}

const COLS: Record<string, string[]> = {
  first: ["first_name", "first", "firstname", "first name", "given name"],
  last: ["last_name", "last", "lastname", "last name", "surname"],
  name: ["name", "full name", "full_name"],
  email: ["email", "email address", "e-mail"],
  birthday: ["birthday", "birth date", "birthdate", "dob", "date of birth"],
  month: ["month", "birth_month", "birth month"],
  day: ["day", "birth_day", "birth day"],
  company: ["company", "organization", "business"],
};

export function parseCsv(text: string, existingEmails: Set<string>): { rows: ParsedRow[]; columns: string[] } {
  const lines = text.split(/\r?\n/).filter((l) => l.trim());
  if (lines.length < 2) return { rows: [], columns: [] };
  const header = splitLine(lines[0]).map((h) => h.toLowerCase().trim());
  const col = (k: string) => header.findIndex((h) => COLS[k].includes(h));
  const idx = Object.fromEntries(Object.keys(COLS).map((k) => [k, col(k)])) as Record<string, number>;
  const seen = new Set<string>();
  const rows = lines.slice(1).map((line) => {
    const cells = splitLine(line);
    const get = (k: string) => (idx[k] >= 0 ? cells[idx[k]] ?? "" : "");
    let first = get("first");
    let last = get("last");
    if (!first && get("name")) {
      const parts = get("name").split(/\s+/);
      first = parts[0] ?? "";
      last = parts.slice(1).join(" ");
    }
    const email = get("email").toLowerCase();
    let b = parseBirthday(get("birthday"));
    if (b.m === null && (get("month") || get("day"))) b = { m: +get("month") || -1, d: +get("day") || -1, y: null };
    const issues: string[] = [];
    if (!first) issues.push("Missing first name");
    if (!email) issues.push("Missing email");
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) issues.push("Invalid email");
    else if (existingEmails.has(email) || seen.has(email)) issues.push("Duplicate email");
    if (b.m === null) issues.push("Missing birthday");
    else if (!isValidBirthday(b.m, b.d)) issues.push("Invalid birthday");
    if (email) seen.add(email);
    const valid = b.m !== null && isValidBirthday(b.m, b.d);
    const row: NewCustomer = {
      firstName: first,
      lastName: last,
      email,
      birthMonth: valid ? b.m : null,
      birthDay: valid ? b.d : null,
      birthYear: valid ? b.y : null,
      company: get("company"),
      tags: [],
      notes: "",
      interests: [],
      cardPreference: null,
      giftPreference: "gift-ok",
    };
    return { row, issues };
  });
  return { rows, columns: header };
}

/** Rows we can import: a name and a usable, unique email. Missing birthdays import but get flagged later. */
export const importable = (r: ParsedRow) =>
  !r.issues.some((i) => ["Missing first name", "Missing email", "Invalid email", "Duplicate email"].includes(i));
