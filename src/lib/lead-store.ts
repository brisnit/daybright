import "server-only";
import { appendFile, mkdir } from "node:fs/promises";
import path from "node:path";

/**
 * Lead delivery adapters for POST /api/reservations.
 * `deliverLead` resolves only when the lead is durably stored or accepted downstream;
 * otherwise it throws or reports "not_configured", and the client must not show success.
 *
 * Recommended production setup (docs/LEAD_CAPTURE.md): a managed Postgres table as the system of
 * record, plus a notification email. Add that adapter here as the first branch of `deliverLead`.
 */

export type LeadRecord = Record<string, unknown> & { id: string; email: string };

export type DeliveryResult = { ok: true; channel: "webhook" | "file" } | { ok: false; reason: "not_configured" | "delivery_failed" };

async function toWebhook(url: string, record: LeadRecord) {
  const res = await fetch(url, {
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

async function toFile(record: LeadRecord) {
  const dir = path.join(process.cwd(), ".data");
  await mkdir(dir, { recursive: true });
  await appendFile(path.join(dir, "reservations.jsonl"), JSON.stringify(record) + "\n", "utf8");
}

export async function deliverLead(record: LeadRecord): Promise<DeliveryResult> {
  const webhook = process.env.RESERVATION_WEBHOOK_URL;
  try {
    if (webhook) {
      await toWebhook(webhook, record);
      return { ok: true, channel: "webhook" };
    }
    if (process.env.NODE_ENV !== "production" || process.env.RESERVATION_FILE_STORE === "1") {
      await toFile(record);
      return { ok: true, channel: "file" };
    }
    console.error("[reservations] no lead destination configured; lead not stored", record.id);
    return { ok: false, reason: "not_configured" };
  } catch (err) {
    console.error("[reservations] delivery failed", record.id, err);
    return { ok: false, reason: "delivery_failed" };
  }
}
