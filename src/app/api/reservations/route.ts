import { appendFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { normalizeWebsite, validateLead, type LeadSubmission } from "@/lib/reservations";

/**
 * Founding Charter reservations and Sponsor / Enterprise inquiries.
 *
 * Delivery, in order:
 *  1. RESERVATION_WEBHOOK_URL is set → POST the lead as JSON (optional bearer RESERVATION_WEBHOOK_SECRET).
 *     Success only on a 2xx from the webhook.
 *  2. Otherwise, outside production (or with RESERVATION_FILE_STORE=1) → append to .data/reservations.jsonl.
 *  3. Otherwise → 503 not_configured. The client shows an error with an email fallback; it never shows success.
 *
 * No payment is requested or processed here.
 */

const seen = new Map<string, { id: string; channel: string }>(); // best-effort duplicate guard per server instance
const MAX_BODY = 16_000;

export async function POST(request: Request) {
  const raw = await request.text();
  if (raw.length > MAX_BODY) return Response.json({ ok: false, error: "too_large" }, { status: 413 });

  let data: Partial<LeadSubmission>;
  try {
    data = JSON.parse(raw);
  } catch {
    return Response.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  // Honeypot: bots fill hidden fields. Accept silently without storing.
  if (typeof data.company_url === "string" && data.company_url.trim()) {
    return Response.json({ ok: true, id: "ignored", channel: "none" }, { status: 201 });
  }

  const fields = validateLead(data);
  if (Object.keys(fields).length) return Response.json({ ok: false, error: "invalid", fields }, { status: 422 });

  const key = String(data.idempotencyKey);
  const previous = seen.get(key);
  if (previous) return Response.json({ ok: true, ...previous, duplicate: true }, { status: 201 });

  const record = {
    id: crypto.randomUUID(),
    receivedAt: new Date().toISOString(),
    kind: data.kind,
    tier: data.tier,
    fullName: data.fullName!.trim(),
    title: (data.title ?? "").trim(),
    firm: data.firm!.trim(),
    website: normalizeWebsite(data.website ?? ""),
    email: data.email!.trim().toLowerCase(),
    crm: data.crm,
    seats: (data.seats ?? "").trim(),
    message: (data.message ?? "").trim(),
    consent: true,
    source: (data.source ?? "").slice(0, 100),
    idempotencyKey: key,
    paymentTaken: false,
  };

  const webhook = process.env.RESERVATION_WEBHOOK_URL;
  let channel: string;

  if (webhook) {
    try {
      const res = await fetch(webhook, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          ...(process.env.RESERVATION_WEBHOOK_SECRET ? { authorization: `Bearer ${process.env.RESERVATION_WEBHOOK_SECRET}` } : {}),
        },
        body: JSON.stringify(record),
        signal: AbortSignal.timeout(8000),
      });
      if (!res.ok) throw new Error(`Webhook responded ${res.status}`);
      channel = "webhook";
    } catch (err) {
      console.error("[reservations] delivery failed", record.id, err);
      return Response.json({ ok: false, error: "delivery_failed" }, { status: 502 });
    }
  } else if (process.env.NODE_ENV !== "production" || process.env.RESERVATION_FILE_STORE === "1") {
    try {
      const dir = path.join(process.cwd(), ".data");
      await mkdir(dir, { recursive: true });
      await appendFile(path.join(dir, "reservations.jsonl"), JSON.stringify(record) + "\n", "utf8");
      channel = "file";
    } catch (err) {
      console.error("[reservations] file store failed", record.id, err);
      return Response.json({ ok: false, error: "delivery_failed" }, { status: 502 });
    }
  } else {
    console.error("[reservations] no lead destination configured; lead not stored", record.email);
    return Response.json({ ok: false, error: "not_configured" }, { status: 503 });
  }

  seen.set(key, { id: record.id, channel });
  return Response.json({ ok: true, id: record.id, channel }, { status: 201 });
}
