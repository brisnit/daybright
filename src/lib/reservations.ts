import { CRM_OPTIONS, type TierId } from "@/config/charter";

/**
 * Founding Charter reservation / sales inquiry contract.
 * Shared by the client form and POST /api/reservations so both validate identically.
 *
 * Request:  POST /api/reservations  (application/json)  body: LeadSubmission
 * Response: 201 { ok: true, id, duplicate? }              lead stored (duplicates return the original id)
 *           400 / 413 / 415                               malformed request
 *           403 { ok: false, error: "forbidden" }         cross-site request
 *           403 { ok: false, error: "verification_failed" } spam check failed (Turnstile, when enabled)
 *           422 { ok: false, error: "invalid", fields }  validation errors
 *           429 { ok: false, error: "rate_limited" }      too many submissions
 *           502 { ok: false, error: "delivery_failed" }   storage failed; nothing was saved
 *           503 { ok: false, error: "not_configured" }    no lead store configured
 * A reservation is NOT a purchase: no payment is requested or taken.
 */

export type LeadKind = "reservation" | "inquiry";

export type LeadSubmission = {
  kind: LeadKind;
  tier: TierId;
  fullName: string;
  title: string;
  firm: string;
  website: string;
  email: string;
  crm: string;
  /** Inquiry only: team size / partner accounts. */
  seats?: string;
  message?: string;
  consent: boolean;
  /** Client-generated key so retries never create duplicate leads. */
  idempotencyKey: string;
  /** Honeypot; must stay empty. */
  company_url?: string;
  source?: string;
  /** Milliseconds the form was open before submitting (bot time-trap). */
  elapsedMs?: number;
  /** Cloudflare Turnstile token, when Turnstile is enabled. */
  turnstileToken?: string;
};

export type FieldErrors = Partial<Record<keyof LeadSubmission, string>>;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const MAX = 300;

/**
 * Consent wording shown next to the checkbox. The server stores this exact text with each lead,
 * so it must match what the visitor saw.
 */
export function consentText(kind: LeadKind) {
  return `I agree that Daybright may store these details and contact me by email about this ${kind === "inquiry" ? "request" : "reservation"}. We use them only to respond and won't sell them. Please don't include client information.`;
}

export function normalizeWebsite(v: string) {
  const t = v.trim();
  if (!t) return "";
  return /^https?:\/\//i.test(t) ? t : `https://${t}`;
}

export function validateLead(d: Partial<LeadSubmission>): FieldErrors {
  const e: FieldErrors = {};
  const str = (v: unknown) => (typeof v === "string" ? v.trim() : "");

  if (d.kind !== "reservation" && d.kind !== "inquiry") e.kind = "Unknown request type.";
  const tiers: TierId[] = d.kind === "inquiry" ? ["sponsor", "enterprise"] : ["solo", "agency"];
  if (!d.tier || !tiers.includes(d.tier)) e.tier = d.kind === "inquiry" ? "Choose an account type." : "Choose a charter tier.";

  if (!str(d.fullName)) e.fullName = "Enter your full name.";
  if (!str(d.firm)) e.firm = "Enter your agency or firm name.";
  const email = str(d.email);
  if (!email) e.email = "Enter your email so we can confirm your reservation.";
  else if (!EMAIL.test(email)) e.email = "Enter a valid email address, like name@firm.com.";

  const site = str(d.website);
  if (site) {
    try {
      const u = new URL(normalizeWebsite(site));
      if (!u.hostname.includes(".")) throw new Error();
    } catch {
      e.website = "Enter a valid website, like yourfirm.com.";
    }
  }
  if (!str(d.crm) || !(CRM_OPTIONS as readonly string[]).includes(str(d.crm))) e.crm = "Choose the CRM you use today.";
  if (d.consent !== true) e.consent = "Please confirm we may contact you about your request.";

  for (const k of ["fullName", "title", "firm", "website", "email", "seats"] as const) {
    if (str(d[k]).length > MAX) e[k] = "That's a little long. Please shorten it.";
  }
  if (str(d.message).length > 2000) e.message = "Please keep your note under 2,000 characters.";
  if (!str(d.idempotencyKey) || str(d.idempotencyKey).length > 100) e.idempotencyKey = "Missing request key.";
  return e;
}

/** Subject and body for the manual email fallback; the visitor sends it themselves. */
export function emailFallbackText(d: Partial<LeadSubmission>, tierLabel: string) {
  const subject = d.kind === "inquiry" ? `${tierLabel} inquiry` : `Founding Charter reservation: ${tierLabel}`;
  const body = [
    `Name: ${d.fullName ?? ""}`,
    `Title: ${d.title ?? ""}`,
    `Firm: ${d.firm ?? ""}`,
    `Website: ${d.website ?? ""}`,
    `Email: ${d.email ?? ""}`,
    `CRM: ${d.crm ?? ""}`,
    `Selection: ${tierLabel}`,
    d.seats ? `Team size / partners: ${d.seats}` : "",
    d.message ? `Note: ${d.message}` : "",
  ]
    .filter(Boolean)
    .join("\n");
  return { subject, body };
}

export function emailFallbackHref(to: string, d: Partial<LeadSubmission>, tierLabel: string) {
  const { subject, body } = emailFallbackText(d, tierLabel);
  return `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
