import type { Customer } from "@/lib/types";

export const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
export const MONTHS_SHORT = MONTHS.map((m) => m.slice(0, 3));

const DAY = 86_400_000;

export const isLeap = (y: number) => (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;

export function daysInMonth(month: number, year = 2024) {
  return new Date(year, month, 0).getDate();
}

/** Valid month/day check. Feb 29 is valid (leap-day birthdays exist). */
export function isValidBirthday(month: number | null, day: number | null) {
  if (!month || !day) return false;
  if (month < 1 || month > 12) return false;
  return day >= 1 && day <= daysInMonth(month, 2024);
}

export function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * Next occurrence of a birthday, from today (inclusive).
 * Feb 29 birthdays in non-leap years fall on Feb 28 or Mar 1 per the `feb29` rule.
 */
export function nextBirthday(
  c: Pick<Customer, "birthMonth" | "birthDay">,
  feb29: "feb28" | "mar1" = "feb28",
  from = startOfToday(),
): Date | null {
  if (!c.birthMonth || !c.birthDay) return null;
  for (const y of [from.getFullYear(), from.getFullYear() + 1]) {
    let m = c.birthMonth - 1;
    let d = c.birthDay;
    if (m === 1 && d === 29 && !isLeap(y)) {
      if (feb29 === "feb28") d = 28;
      else { m = 2; d = 1; }
    }
    const date = new Date(y, m, d);
    if (date >= from) return date;
  }
  return null;
}

export function daysUntil(date: Date | null, from = startOfToday()) {
  if (!date) return null;
  return Math.round((date.getTime() - from.getTime()) / DAY);
}

export function formatBirthday(c: Pick<Customer, "birthMonth" | "birthDay" | "birthYear">) {
  if (!c.birthMonth || !c.birthDay) return "Missing";
  return `${MONTHS_SHORT[c.birthMonth - 1]} ${c.birthDay}${c.birthYear ? `, ${c.birthYear}` : ""}`;
}

export function relDays(n: number | null) {
  if (n === null) return "";
  if (n === 0) return "Today";
  if (n === 1) return "Tomorrow";
  if (n === -1) return "Yesterday";
  if (n < 0) return `${-n} days ago`;
  if (n < 7) return `In ${n} days`;
  return `In ${n} days`;
}

export function fmtDate(iso: string | Date, opts: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" }) {
  const d = typeof iso === "string" ? new Date(iso) : iso;
  return d.toLocaleDateString("en-US", opts);
}

export function fmtDateTime(iso: string) {
  const d = new Date(iso);
  return `${d.toLocaleDateString("en-US", { month: "short", day: "numeric" })}, ${d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}`;
}

export function fmtTime(hhmm: string) {
  const [h, m] = hhmm.split(":").map(Number);
  const d = new Date(2024, 0, 1, h, m);
  return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

export function isThisMonth(iso: string, now = new Date()) {
  const d = new Date(iso);
  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
}

export const TIMEZONES = [
  { id: "America/New_York", label: "Eastern (New York)" },
  { id: "America/Chicago", label: "Central (Chicago)" },
  { id: "America/Denver", label: "Mountain (Denver)" },
  { id: "America/Los_Angeles", label: "Pacific (Los Angeles)" },
  { id: "Europe/London", label: "London" },
  { id: "recipient", label: "Each recipient's local time" },
];

export const tzLabel = (id: string) => TIMEZONES.find((t) => t.id === id)?.label ?? id;
