# Founding Charter lead capture: production recommendation

## What exists now (branch `b2b-charter-redesign`)
`POST /api/reservations` (Next.js route handler) → `src/lib/lead-store.ts`

- **Shared validation** between client and server (`src/lib/reservations.ts`). Required fields are name, firm, email, CRM, tier and consent.
- **Abuse controls:**
  - Honeypot field.
  - Same-origin check (`RESERVATION_ALLOWED_ORIGINS` for extra origins).
  - JSON-only requests, 16 KB body limit.
  - Per-IP rate limit of 5 per 10 minutes. This is in-memory, per instance.
- **Duplicate protection:** a client-generated idempotency key, so retries never create duplicates. This also lives in memory, per instance.
- **Delivery:**
  - Webhook (`RESERVATION_WEBHOOK_URL`, optional bearer secret).
  - Dev-only file store.
  - Otherwise `503 not_configured`.
- **The UI never shows success unless a 201 comes back.** On failure it keeps the form filled in and offers a pre-filled email to the sales address.
- **Verified paths:** dev file store (201), production with no destination (503 plus email fallback in the UI), and production with a webhook (201, bearer header received).

**Gap:** there is no durable store yet. On a serverless host the file store isn't durable, and the in-memory duplicate and rate-limit guards reset between instances.

## Recommendation: managed Postgres as the system of record, plus a notification email
This is the simplest secure option that fits the current architecture: one route handler, one table, no new UI.

1. **Store:** add a Postgres table, using the database offered by whichever host you deploy to (for example Neon through Vercel, or Supabase). Insert the record in `deliverLead` as the first branch. Return 201 only after the insert commits.
2. **Duplicates:** give `idempotency_key` a unique constraint, so duplicates are blocked across instances. On conflict, return the existing id.
3. **Notify:** after a successful insert, send an internal email to the sales inbox with a transactional email service (for example Resend or Postmark).
   - A failed notification is logged and alerted, but doesn't fail the request, because the lead is already stored.
4. **CRM (optional):** keep the webhook to forward leads into your sales CRM, again after the insert.
5. **Operations:**
   - Store secrets as host environment variables only.
   - Restrict database access to the app role and named staff.
   - Alert on any 5xx from `/api/reservations`.
   - Run a weekly retention job that matches the privacy policy.
6. **Spam (only if it appears):** add Cloudflare Turnstile, or move the rate limit into the database or a shared store such as Upstash.

```sql
create table reservations (
  id              uuid primary key,
  received_at     timestamptz not null default now(),
  kind            text not null check (kind in ('reservation','inquiry')),
  tier            text not null,
  full_name       text not null,
  title           text,
  firm            text not null,
  website         text,
  email           text not null,
  crm             text not null,
  seats           text,
  message         text,
  consent         boolean not null,
  consent_text    text not null,
  source          text,
  idempotency_key text not null unique,
  status          text not null default 'new'  -- new | contacted | confirmed | declined
);
```

**Why not a webhook-only setup (Zapier, Make, Google Sheets)?** It's quick, but it adds another processor of personal data. It also gives weaker access control and harder auditing, and some failure modes are silent. It's fine as a secondary fan-out after the database insert.

**Why not email-only?** There's no durable, queryable record, so seat counting and follow-up become manual.

**Effort:** about 1 day. That covers 1 database driver dependency, about 40 lines in `lead-store.ts`, 1 migration, 3–4 environment variables, and an alert.

**Decisions needed:** hosting provider, database and email vendors (and signing their DPAs), retention period, who has access, and whether seat counting (15) should be enforced automatically from the table.
