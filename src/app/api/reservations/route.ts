import { normalizeWebsite, validateLead, type LeadSubmission } from "@/lib/reservations";
import { deliverLead } from "@/lib/lead-store";

/**
 * Founding Charter reservations and Sponsor / Enterprise inquiries.
 * Contract: src/lib/reservations.ts. Delivery: src/lib/lead-store.ts. Setup: docs/LEAD_CAPTURE.md.
 * No payment is requested or processed here.
 */

const MAX_BODY = 16_000;
const RATE_WINDOW_MS = 10 * 60_000;
const RATE_MAX = 5;

// Best-effort, per-instance guards. On serverless hosts these reset between instances;
// the durable store's unique idempotency key is the real duplicate guard.
const seen = new Map<string, { id: string; channel: string }>();
const hits = new Map<string, number[]>();

function clientIp(request: Request) {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "unknown";
}

function sameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return true; // non-browser clients; browsers always send Origin on cross-site POSTs
  const allowed = (process.env.RESERVATION_ALLOWED_ORIGINS ?? "").split(",").map((s) => s.trim()).filter(Boolean);
  try {
    const o = new URL(origin);
    const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
    return o.host === host || allowed.includes(o.origin);
  } catch {
    return false;
  }
}

function rateLimited(ip: string) {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < RATE_WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > RATE_MAX;
}

export async function POST(request: Request) {
  if (!sameOrigin(request)) return Response.json({ ok: false, error: "forbidden" }, { status: 403 });
  if (!(request.headers.get("content-type") ?? "").includes("application/json")) {
    return Response.json({ ok: false, error: "unsupported_media_type" }, { status: 415 });
  }
  if (rateLimited(clientIp(request))) {
    return Response.json({ ok: false, error: "rate_limited" }, { status: 429, headers: { "retry-after": "600" } });
  }

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
    consentText: "May store these details and contact me by email about this request.",
    source: (data.source ?? "").slice(0, 100),
    idempotencyKey: key,
    paymentTaken: false,
  };

  const result = await deliverLead(record);
  if (!result.ok) {
    return Response.json({ ok: false, error: result.reason }, { status: result.reason === "not_configured" ? 503 : 502 });
  }
  seen.set(key, { id: record.id, channel: result.channel });
  return Response.json({ ok: true, id: record.id, channel: result.channel }, { status: 201 });
}
