import "server-only";
import { createHmac } from "node:crypto";
import { appendFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { neon, type NeonQueryFunction } from "@neondatabase/serverless";
import { CHARTER } from "@/config/charter";
import { migrate } from "./lead-schema.mjs";

/**
 * Lead storage for POST /api/reservations. See docs/LEAD_CAPTURE.md.
 *
 * System of record: Postgres (Neon via the Vercel Marketplace), using DATABASE_URL.
 * A lead counts as captured only after the INSERT commits; notifications run afterwards and never
 * decide success. New leads always start with status 'new'; follow-up status is changed only with
 * `npm run leads:admin`, never by the public form. Without DATABASE_URL: optional webhook, dev-only file store, else "not_configured".
 */

export type LeadRecord = {
  id: string;
  receivedAt: string;
  kind: string;
  tier: string;
  fullName: string;
  title: string;
  firm: string;
  website: string;
  email: string;
  crm: string;
  seats: string;
  message: string;
  consent: true;
  consentText: string;
  source: string;
  idempotencyKey: string;
};

export type StoreResult =
  | { ok: true; id: string; channel: "database" | "webhook" | "file"; duplicate: boolean }
  | { ok: false; reason: "not_configured" | "delivery_failed" | "rate_limited" };

const RATE = { ipPer10Min: 5, emailPerDay: 3 };

let sqlClient: NeonQueryFunction<false, false> | null = null;
let schemaReady: Promise<void> | null = null;

function db() {
  const url = process.env.DATABASE_URL;
  if (!url) return null;
  sqlClient ??= neon(url);
  return sqlClient;
}

/** Applies pending migrations once per server instance (also covers fresh preview branches). */
function ensureSchema(sql: NeonQueryFunction<false, false>) {
  schemaReady ??= migrate(sql, { charterSeats: CHARTER.seats })
    .then(() => undefined)
    .catch((err) => {
      schemaReady = null; // allow a retry on the next request
      throw err;
    });
  return schemaReady;
}

/** Keyed hash of the client IP for abuse limits. The raw IP is never stored. */
export function hashIp(ip: string) {
  const secret = process.env.LEAD_IP_HASH_SECRET || process.env.NEON_PROJECT_ID || "daybright-dev";
  return createHmac("sha256", secret).update(ip).digest("hex").slice(0, 32);
}

export async function storeLead(record: LeadRecord, opts: { ipHash: string; simulateFailure?: boolean }): Promise<StoreResult> {
  const sql = db();
  try {
    if (opts.simulateFailure) throw new Error("Simulated storage failure (preview test)");
    if (sql) {
      await ensureSchema(sql);

      // Duplicate submission (same idempotency key): return the original id, no new row.
      const existing = await sql`select id from reservations where idempotency_key = ${record.idempotencyKey} limit 1`;
      if (existing.length) return { ok: true, id: String(existing[0].id), channel: "database", duplicate: true };

      // Durable abuse limits (work across serverless instances).
      const [limits] = await sql`
        select
          (select count(*) from reservations where ip_hash = ${opts.ipHash} and received_at > now() - interval '10 minutes')::int as ip_recent,
          (select count(*) from reservations where email = ${record.email} and received_at > now() - interval '1 day')::int as email_recent`;
      if (limits.ip_recent >= RATE.ipPer10Min || limits.email_recent >= RATE.emailPerDay) return { ok: false, reason: "rate_limited" };

      const rows = await sql`
        insert into reservations (id, received_at, kind, tier, full_name, title, firm, website, email, crm, seats, message,
                                  consent, consent_text, source, idempotency_key, ip_hash)
        values (${record.id}, ${record.receivedAt}, ${record.kind}, ${record.tier}, ${record.fullName}, ${record.title}, ${record.firm},
                ${record.website}, ${record.email}, ${record.crm}, ${record.seats}, ${record.message}, ${record.consent},
                ${record.consentText}, ${record.source}, ${record.idempotencyKey}, ${opts.ipHash})
        on conflict (idempotency_key) do nothing
        returning id`;
      if (!rows.length) {
        const again = await sql`select id from reservations where idempotency_key = ${record.idempotencyKey} limit 1`;
        return { ok: true, id: String(again[0].id), channel: "database", duplicate: true };
      }
      return { ok: true, id: record.id, channel: "database", duplicate: false };
    }

    if (process.env.RESERVATION_WEBHOOK_URL) {
      await postWebhook(record);
      return { ok: true, id: record.id, channel: "webhook", duplicate: false };
    }
    if (process.env.NODE_ENV !== "production") {
      const dir = path.join(process.cwd(), ".data");
      await mkdir(dir, { recursive: true });
      await appendFile(path.join(dir, "reservations.jsonl"), JSON.stringify(record) + "\n", "utf8");
      return { ok: true, id: record.id, channel: "file", duplicate: false };
    }
    console.error("[reservations] no lead store configured", record.id);
    return { ok: false, reason: "not_configured" };
  } catch (err) {
    console.error("[reservations] storage failed", record.id, err instanceof Error ? err.message : err);
    return { ok: false, reason: "delivery_failed" };
  }
}

/** Post-commit notifications. Failures are logged, never surfaced to the visitor (the lead is already stored). */
export async function notifyLead(record: LeadRecord) {
  const tasks: Promise<unknown>[] = [];
  if (process.env.RESERVATION_WEBHOOK_URL && db()) tasks.push(postWebhook(record));
  if (process.env.RESEND_API_KEY && process.env.LEAD_NOTIFY_TO && process.env.LEAD_NOTIFY_FROM) tasks.push(sendEmail(record));
  const results = await Promise.allSettled(tasks);
  for (const r of results) if (r.status === "rejected") console.error("[reservations] notification failed", record.id, String(r.reason));
}

async function postWebhook(record: LeadRecord) {
  const res = await fetch(process.env.RESERVATION_WEBHOOK_URL!, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      ...(process.env.RESERVATION_WEBHOOK_SECRET ? { authorization: `Bearer ${process.env.RESERVATION_WEBHOOK_SECRET}` } : {}),
    },
    body: JSON.stringify(record),
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) throw new Error(`Webhook responded ${res.status}`);
}

/**
 * Lead alert email. Deliberately minimal: only what's needed to recognise the lead and reply. Title, website, CRM,
 * team size and the free-text note are left out (the note could contain client information); they stay in the
 * database. The subject carries no personal data, since it shows in notification previews.
 */
export function leadAlert(record: LeadRecord) {
  const ref = record.id.slice(0, 8).toUpperCase();
  const what = record.kind === "inquiry" ? `${TIER_NAMES[record.tier] ?? record.tier} inquiry` : "Founding Charter reservation request";
  const text = [
    record.kind === "inquiry" ? `New ${what}.` : `New ${what} (nonbinding).`,
    "",
    `Reference: ${ref}`,
    `Received: ${record.receivedAt.slice(0, 16).replace("T", " ")} UTC`,
    record.kind === "inquiry" ? null : `Tier: ${TIER_NAMES[record.tier] ?? record.tier}`,
    `Name: ${record.fullName}`,
    `Firm: ${record.firm}`,
    `Email: ${record.email}`,
    "",
    "Status: new. Other details are in the lead database; review and update the status there.",
    process.env.LEAD_REVIEW_URL ? `Review leads: ${process.env.LEAD_REVIEW_URL}` : null,
    "Replying to this email goes to the person who submitted the request.",
  ]
    .filter((l) => l !== null)
    .join("\n");
  return { subject: `New ${what} · ${ref}`, text };
}

const TIER_NAMES: Record<string, string> = {
  solo: "Solo Founding Charter",
  agency: "Agency Founding Charter",
  sponsor: "Co-Marketing Sponsor",
  enterprise: "Enterprise",
};

async function sendEmail(record: LeadRecord) {
  const { subject, text } = leadAlert(record);
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { authorization: `Bearer ${process.env.RESEND_API_KEY}`, "content-type": "application/json" },
    body: JSON.stringify({
      from: process.env.LEAD_NOTIFY_FROM,
      to: process.env.LEAD_NOTIFY_TO!.split(",").map((s) => s.trim()),
      reply_to: record.email,
      subject,
      text,
    }),
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) throw new Error(`Resend responded ${res.status}`);
}
