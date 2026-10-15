import type { Customer } from "@/lib/types";
import { isValidBirthday, MONTHS } from "@/lib/dates";
import { extractFacts } from "@/lib/ai/messages";

export type CustomerInput = Omit<Customer, "id" | "createdAt" | "history">;

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const GIFT_PREFS: { value: Customer["giftPreference"]; label: string; hint: string }[] = [
  { value: "gift-ok", label: "Gifts OK", hint: "Rules may include a gift" },
  { value: "no-physical", label: "No physical gifts", hint: "Digital gift cards only" },
  { value: "card-only", label: "Card only", hint: "Never include a gift" },
];

export const fullName = (c: Pick<Customer, "firstName" | "lastName">) => `${c.firstName} ${c.lastName}`.trim();

/** Find an existing customer with the same email or same full name. */
export function findDuplicate(customers: Customer[], c: { firstName: string; lastName: string; email: string }, excludeId?: string) {
  const email = c.email.trim().toLowerCase();
  const name = `${c.firstName} ${c.lastName}`.trim().toLowerCase().replace(/\s+/g, " ");
  return (
    customers.find((x) => x.id !== excludeId && email && x.email.toLowerCase() === email) ??
    customers.find((x) => x.id !== excludeId && name.length > 1 && fullName(x).toLowerCase().replace(/\s+/g, " ") === name) ??
    null
  );
}

/* ------------------------------------------------------------------ */
/* CSV                                                                 */
/* ------------------------------------------------------------------ */

/** Small RFC-4180-ish parser: quoted fields, escaped quotes, CRLF. */
export function parseCSV(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let q = false;
  const src = text.replace(/^﻿/, "");
  for (let i = 0; i < src.length; i++) {
    const ch = src[i];
    if (q) {
      if (ch === '"') {
        if (src[i + 1] === '"') {
          field += '"';
          i++;
        } else q = false;
      } else field += ch;
      continue;
    }
    if (ch === '"') q = true;
    else if (ch === ",") {
      row.push(field);
      field = "";
    } else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && src[i + 1] === "\n") i++;
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else field += ch;
  }
  if (field.length || row.length) {
    row.push(field);
    rows.push(row);
  }
  return rows.filter((r) => r.some((c) => c.trim() !== "")).map((r) => r.map((c) => c.trim()));
}

export type FieldKey =
  | "ignore"
  | "fullName"
  | "firstName"
  | "lastName"
  | "email"
  | "birthday"
  | "birthMonth"
  | "birthDay"
  | "birthYear"
  | "company"
  | "tags"
  | "notes"
  | "interests";

export const FIELD_OPTIONS: { value: FieldKey; label: string }[] = [
  { value: "ignore", label: "Don't import" },
  { value: "fullName", label: "Full name (split)" },
  { value: "firstName", label: "First name" },
  { value: "lastName", label: "Last name" },
  { value: "email", label: "Email" },
  { value: "birthday", label: "Birthday (date)" },
  { value: "birthMonth", label: "Birth month" },
  { value: "birthDay", label: "Birth day" },
  { value: "birthYear", label: "Birth year" },
  { value: "company", label: "Company" },
  { value: "tags", label: "Tags" },
  { value: "notes", label: "Relationship notes" },
  { value: "interests", label: "Interests" },
];

export function guessField(header: string): FieldKey {
  const h = header.toLowerCase().replace(/[^a-z]/g, "");
  if (/^(first|firstname|given|givenname|fname)$/.test(h)) return "firstName";
  if (/^(last|lastname|surname|family|familyname|lname)$/.test(h)) return "lastName";
  if (/^(name|fullname|customer|customername|contact|contactname|client)$/.test(h)) return "fullName";
  if (/email|mail/.test(h)) return "email";
  if (/year/.test(h)) return "birthYear";
  if (/^(birthmonth|month)$/.test(h)) return "birthMonth";
  if (/^(birthday|dob|birthdate|dateofbirth|bday)/.test(h) && !/day$/.test(h.replace(/^birthday/, ""))) return "birthday";
  if (/^(birthdayday|day)$/.test(h)) return "birthDay";
  if (/birth|dob|bday/.test(h)) return "birthday";
  if (/company|organization|organisation|business|employer/.test(h)) return "company";
  if (/tag|segment|group|label/.test(h)) return "tags";
  if (/interest|hobb|likes/.test(h)) return "interests";
  if (/note|comment|relationship/.test(h)) return "notes";
  return "ignore";
}

/** Parse a birthday cell: MM/DD, MM/DD/YYYY, YYYY-MM-DD, "March 4", "4 March". */
export function parseBirthday(raw: string): { month: number | null; day: number | null; year: number | null; error?: string } {
  const v = raw.trim();
  if (!v) return { month: null, day: null, year: null };
  let m = v.match(/^(\d{1,2})[/.-](\d{1,2})(?:[/.-](\d{2,4}))?$/);
  if (m) {
    const month = +m[1];
    const day = +m[2];
    const year = m[3] ? (m[3].length === 2 ? 1900 + +m[3] : +m[3]) : null;
    return validate(month, day, year, v);
  }
  m = v.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (m) return validate(+m[2], +m[3], +m[1], v);
  m = v.match(/^([a-z]+)\.?\s+(\d{1,2})(?:,?\s+(\d{4}))?$/i) ?? null;
  if (m) {
    const month = monthFromName(m[1]);
    if (month) return validate(month, +m[2], m[3] ? +m[3] : null, v);
  }
  m = v.match(/^(\d{1,2})\s+([a-z]+)\.?(?:\s+(\d{4}))?$/i);
  if (m) {
    const month = monthFromName(m[2]);
    if (month) return validate(month, +m[1], m[3] ? +m[3] : null, v);
  }
  return { month: null, day: null, year: null, error: `Couldn't read “${v}” as a date. Use MM/DD.` };
}

function monthFromName(s: string) {
  const i = MONTHS.findIndex((m) => m.toLowerCase().startsWith(s.toLowerCase().slice(0, 3)));
  return i >= 0 ? i + 1 : null;
}

function validate(month: number, day: number, year: number | null, raw: string) {
  if (!isValidBirthday(month, day)) {
    const name = month >= 1 && month <= 12 ? MONTHS[month - 1] : `month ${month}`;
    return { month: null, day: null, year, error: `${name} ${day} isn't a real date (from “${raw}”).` };
  }
  return { month, day, year };
}

export type RowResult = {
  index: number;
  input: CustomerInput;
  errors: string[];
  warnings: string[];
  duplicateOf: Customer | null;
  duplicateInFile: boolean;
};

export function buildRows(rows: string[][], mapping: FieldKey[], existing: Customer[]): RowResult[] {
  const seen: { firstName: string; lastName: string; email: string }[] = [];
  return rows.map((cells, index) => {
    const get = (k: FieldKey) => {
      const i = mapping.indexOf(k);
      return i >= 0 ? (cells[i] ?? "").trim() : "";
    };
    const errors: string[] = [];
    const warnings: string[] = [];
    let firstName = get("firstName");
    let lastName = get("lastName");
    const full = get("fullName");
    if (full && !firstName) {
      const parts = full.split(/\s+/);
      firstName = parts[0] ?? "";
      lastName = lastName || parts.slice(1).join(" ");
    }
    const email = get("email");
    let month: number | null = null;
    let day: number | null = null;
    let year: number | null = null;
    const bday = get("birthday");
    if (bday) {
      const p = parseBirthday(bday);
      if (p.error) errors.push(p.error);
      month = p.month;
      day = p.day;
      year = p.year;
    } else if (get("birthMonth") || get("birthDay")) {
      const mRaw = get("birthMonth");
      const mo = /^\d+$/.test(mRaw) ? +mRaw : monthFromName(mRaw);
      const d = +get("birthDay");
      if (mo && d && isValidBirthday(mo, d)) {
        month = mo;
        day = d;
      } else errors.push(`Birthday “${mRaw} ${get("birthDay")}” isn't a real date.`);
    }
    const yRaw = get("birthYear");
    if (yRaw) {
      const y = +yRaw;
      if (y > 1900 && y <= 2030) year = y;
      else warnings.push(`Birth year “${yRaw}” ignored`);
    }
    if (!firstName) errors.push("Missing name");
    if (!email) warnings.push("Missing email: they can't receive cards until it's added");
    else if (!EMAIL_RE.test(email)) errors.push(`Email “${email}” doesn't look valid`);
    if (!bday && !month && !errors.some((e) => /Birthday/.test(e))) warnings.push("Missing birthday: imported and flagged");

    const notes = get("notes");
    const interestsRaw = get("interests");
    const interests = interestsRaw
      ? interestsRaw.split(/[;|,]/).map((s) => s.trim().toLowerCase()).filter(Boolean)
      : extractFacts(notes).interests;
    const input: CustomerInput = {
      firstName,
      lastName,
      email,
      birthMonth: month,
      birthDay: day,
      birthYear: year,
      company: get("company"),
      tags: get("tags").split(/[;|]/).map((s) => s.trim()).filter(Boolean),
      notes,
      interests,
      cardPreference: null,
      giftPreference: "gift-ok",
    };
    const duplicateOf = firstName ? findDuplicate(existing, input) : null;
    const key = { firstName, lastName, email };
    const duplicateInFile =
      !duplicateOf &&
      seen.some((s) => (email && s.email.toLowerCase() === email.toLowerCase()) || (`${s.firstName} ${s.lastName}`.toLowerCase() === `${firstName} ${lastName}`.toLowerCase() && firstName));
    seen.push(key);
    if (duplicateOf) warnings.unshift(`Already in your customers as ${fullName(duplicateOf)}`);
    if (duplicateInFile) warnings.unshift("Appears twice in this file");
    return { index, input, errors, warnings, duplicateOf, duplicateInFile };
  });
}

/** Realistic sample CSV with a few deliberate problems to resolve. */
export function sampleCSV(existing: Customer[]) {
  const dup = existing.find((c) => c.id === "c-rosa") ?? existing.find((c) => c.email && c.birthMonth);
  const pad = (n: number) => String(n).padStart(2, "0");
  const dupRow = dup
    ? `${dup.firstName} ${dup.lastName},${dup.email},${dup.birthMonth ? `${pad(dup.birthMonth)}/${pad(dup.birthDay ?? 1)}` : ""},,${dup.company},${dup.tags.join(";")},Duplicate of an existing customer`
    : "";
  return [
    "Name,Email,Birthday (MM/DD),Birth year,Company,Tags,Notes",
    "Lena Ortiz,lena.ortiz@example.com,04/12,1986,,Past client;VIP,Loves gardening and her two cats",
    "Paul Jensen,paul.jensen@example.com,02/30,,Jensen Dental,Referral partner,Refers neighbors to us every spring",
    "Mira Shah,,07/08,,,Prospect,Met at the fall open house",
    dupRow,
    "Theo Grant,theo.grant@example.com,,,,Past client,Bought the corner lot on Birch Ave.",
    "Ruth Adeyemi,ruth.adeyemi@example.com,11/02,1990,,Past client,Avid cyclist; rides every weekend",
    '"Kenji Watanabe",kenji.w@example.com,10/28,,"Watanabe Design, LLC",Investor,"Coffee enthusiast, longtime client"',
    "Amara Okoye,amara.okoye@example.com,12/19,,,Past client,Enjoys cooking for big family dinners",
  ]
    .filter(Boolean)
    .join("\n");
}

/** Extra fictional customers for the one-click demo import. Birthdays spread across the coming months. */
export function demoCustomers(now = new Date()): CustomerInput[] {
  const at = (offset: number) => {
    const d = new Date(now.getTime() + offset * 86_400_000);
    return { birthMonth: d.getMonth() + 1, birthDay: d.getDate() };
  };
  const base = { birthYear: null, company: "", cardPreference: null, giftPreference: "gift-ok" as const };
  return [
    { ...base, firstName: "Olivia", lastName: "Grant", email: "olivia.grant@example.com", ...at(11), tags: ["Past client"], interests: ["books"], notes: "Runs the neighborhood book swap." },
    { ...base, firstName: "Mateo", lastName: "Silva", email: "mateo.silva@example.com", ...at(16), tags: ["VIP"], interests: ["cooking"], notes: "Longtime client. Bakes sourdough every weekend." },
    { ...base, firstName: "Harriet", lastName: "Osei", email: "harriet.osei@example.com", ...at(33), tags: ["Referral partner"], company: "Osei Home Staging", interests: ["flowers"], notes: "Helped us stage the Maple St. listing." },
    { ...base, firstName: "Daniel", lastName: "Kraus", email: "daniel.kraus@example.com", ...at(52), tags: ["Investor"], company: "Kraus Capital", interests: [], notes: "", giftPreference: "card-only" },
    { ...base, firstName: "Sofia", lastName: "Lind", email: "sofia.lind@example.com", ...at(70), tags: ["Past client"], interests: ["hiking", "dogs"], notes: "Moved here with her border collie, Pepper." },
    { ...base, firstName: "Ezra", lastName: "Nakamura", email: "ezra.nakamura@example.com", ...at(95), birthYear: 1992, tags: ["New client"], interests: ["music"], notes: "Just closed on his first condo." },
  ];
}
