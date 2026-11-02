import { after } from "next/server";
import { normalizeWebsite, validateLead, type LeadSubmission } from "@/lib/reservations";
import { hashIp, notifyLead, storeLead, type LeadRecord } from "@/lib/lead-store";

/**
 * Founding Charter reservations and Sponsor / Enterprise inquiries.
 * Contract: src/lib/reservations.ts · Storage: src/lib/lead-store.ts · Setup: docs/LEAD_CAPTURE.md
 * Success (201) is returned only after the lead is durably stored. No payment is requested or processed.
 */

const MAX_BODY = 16_000;
const MIN_FILL_MS = 2500; // humans can't complete the form faster than this
const BURST_WINDOW_MS = 60_000;
const BURST_MAX = 10;
const CONSENT_TEXT = "Daybright may store these details and contact me by email about this request.";

// Per-instance burst guard in front of the durable (database) limits.
const hits = new Map<string, number[]>();

function clientIp(request: Request) {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "unknown";
}

function sameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return true; // non-browser clients; browsers always send Origin on POST
  const allowed = (process.env.RESERVATION_ALLOWED_ORIGINS ?? "").split(",").map((s) => s.trim()).filter(Boolean);
  try {
    const o = new URL(origin);
    const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
    return o.host === host || allowed.includes(o.origin);
  } catch {
    return false;
  }
}

function burstLimited(ip: string) {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < BURST_WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) hits.clear();
  return recent.length > BURST_MAX;
}

async function turnstileOk(token: string | undefined, ip: string) {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return true; // Turnstile not enabled
  if (!token) return false;
  try {
    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      body: new URLSearchParams({ secret, response: token, remoteip: ip }),
      signal: AbortSignal.timeout(5000),
    });
    const body = (await res.json()) as { success?: boolean };
    return body.success === true;
  } catch {
    return false;
  }
}

/** Preview-only switch to exercise the storage-failure path. Never active in production. */
function faultInjected(request: Request) {
  return (
    process.env.VERCEL_ENV !== "production" &&
    process.env.LEAD_TEST_FAULTS === "1" &&
    request.headers.get("x-lead-test-fault") === "storage"
  );
}

const json = (body: unknown, status: number, headers?: HeadersInit) => Response.json(body, { status, headers });

export async function POST(request: Request) {
  if (!sameOrigin(request)) return json({ ok: false, error: "forbidden" }, 403);
  if (!(request.headers.get("content-type") ?? "").includes("application/json")) return json({ ok: false, error: "unsupported_media_type" }, 415);
  const ip = clientIp(request);
  if (burstLimited(ip)) return json({ ok: false, error: "rate_limited" }, 429, { "retry-after": "60" });

  const raw = await request.text();
  if (raw.length > MAX_BODY) return json({ ok: false, error: "too_large" }, 413);

  let data: Partial<LeadSubmission>;
  try {
    data = JSON.parse(raw);
  } catch {
    return json({ ok: false, error: "invalid_json" }, 400);
  }

  // Bot traps: filled honeypot, or submitted implausibly fast. Accept silently without storing.
  const tooFast = typeof data.elapsedMs === "number" && data.elapsedMs < MIN_FILL_MS;
  if ((typeof data.company_url === "string" && data.company_url.trim()) || tooFast) {
    return json({ ok: true, id: "ignored" }, 201);
  }

  const fields = validateLead(data);
  if (Object.keys(fields).length) return json({ ok: false, error: "invalid", fields }, 422);

  if (!(await turnstileOk(data.turnstileToken, ip))) return json({ ok: false, error: "verification_failed" }, 403);

  const record: LeadRecord = {
    id: crypto.randomUUID(),
    receivedAt: new Date().toISOString(),
    kind: data.kind!,
    tier: data.tier!,
    fullName: data.fullName!.trim(),
    title: (data.title ?? "").trim(),
    firm: data.firm!.trim(),
    website: normalizeWebsite(data.website ?? ""),
    email: data.email!.trim().toLowerCase(),
    crm: data.crm!,
    seats: (data.seats ?? "").trim(),
    message: (data.message ?? "").trim(),
    consent: true,
    consentText: CONSENT_TEXT,
    source: (data.source ?? "").slice(0, 100),
    idempotencyKey: String(data.idempotencyKey),
  };

  const result = await storeLead(record, { ipHash: hashIp(ip), simulateFailure: faultInjected(request) });
  if (!result.ok) {
    if (result.reason === "rate_limited") return json({ ok: false, error: "rate_limited" }, 429, { "retry-after": "600" });
    return json({ ok: false, error: result.reason }, result.reason === "not_configured" ? 503 : 502);
  }
  if (!result.duplicate) after(() => notifyLead(record));
  return json({ ok: true, id: result.id, duplicate: result.duplicate || undefined }, 201);
}
