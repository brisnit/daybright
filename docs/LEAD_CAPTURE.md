# Founding Charter lead capture

**Status:** implemented on `b2b-charter-redesign`, tested locally against Neon and in Vercel Preview. Not yet connected to Production. To go live, see `docs/PRODUCTION_SETUP.md`.

## How it works
```
Reservation / inquiry modal  ──POST /api/reservations──▶  route handler  ──INSERT──▶  Neon Postgres (system of record)
 (src/components/charter/lead-modal.tsx)                 (src/app/api/reservations/route.ts)        │
                                                                                                     └─ after commit: optional webhook + email notification
```
- **Success** (201 plus a reference number) is returned **only after the INSERT commits**.
- **Notifications** (webhook, Resend email) run after the response using `after()`. They never decide success, and failures are logged.
- **Failures** (storage error, rate limit, misconfiguration, network) show a specific message that says nothing was saved. The form keeps the data and also saves an unsent copy in the visitor's browser (`localStorage["daybright-pending-lead"]`), so reopening the form restores it. The copy is deleted on success.
- **Email fallback:** shown only inside the failure message, never on the normal form or the success screen. It says plainly that nothing is sent automatically and offers "Open a pre-filled email" (mailto) and "Copy details" (for webmail users). It's controlled by `SALES_EMAIL_VERIFIED` in `src/config/charter.ts`, which is `true` since `hello@daybright.store` was verified on 2026-11-02. Emails sent this way arrive in the forwarding inbox, **not** in Neon, so log them by hand.

## Safeguards
| Concern | Control |
| --- | --- |
| Validation | Shared rules client- and server-side (`src/lib/reservations.ts`): required name, firm, email, CRM, tier, consent; email/URL format; length limits; tier must match the form type |
| Duplicates | Client idempotency key (reused when an unsent request is restored), plus a `unique` constraint in the database. A repeat returns the original reference with no new row |
| Spam / bots | Honeypot field; time-trap (submitted under 2.5 s → silently dropped); same-origin check; JSON-only; 16 KB body limit; optional Cloudflare Turnstile (prepared, off; token refreshed after each failed attempt) |
| Abuse limits | Durable, database-backed: 5 requests per IP per 10 min and 3 per email per day. Plus an in-memory burst limit per instance |
| Privacy | The raw IP is never stored, only an HMAC with `LEAD_IP_HASH_SECRET`. No payment data. Visitors are told not to submit client information |
| Secrets | Database credentials live only in Vercel's encrypted environment variables and the gitignored `.env.local` |
| Testing hook | `x-lead-test-fault: storage` simulates a storage failure only when `LEAD_TEST_FAULTS=1` **and** `VERCEL_ENV !== "production"`. It's set only for Preview on this branch |

## Data model
Table `reservations`. Its schema is defined as ordered, idempotent migrations in `src/lib/lead-schema.mjs`, recorded in `schema_migrations`. The app applies pending migrations on its first database request, so fresh Neon preview branches work. `npm run db:migrate` applies them explicitly; use it for Production before launch.
- **Lead fields:** `id`, `received_at`, `kind`, `tier`, `full_name`, `title`, `firm`, `website`, `email`, `crm`, `seats`, `message`
- **Consent and source:** `consent`, `consent_text`, `source`
- **Integrity and abuse limits:** `idempotency_key` (unique), `ip_hash`
- **Follow-up:** `status`, one of `new` (default) · `contacted` · `accepted` · `waitlisted` · `declined` · `withdrawn`. The database enforces this with a check constraint. Also `status_note` and `status_updated_at`.
- **Consent wording:** `consent_text` stores the exact sentence shown next to the checkbox (`consentText()` in `src/lib/reservations.ts`).

## Founding Charter cap and status
- A reservation is a nonbinding expression of interest, and submitting never guarantees a seat. The public form always creates `new`, and it can't set or read status.
- Only `accepted` reservations count toward `CHARTER.seats` (15). The cap is enforced **in the database** by a trigger (migration `003_charter_cap_guard`). Any route, whether the Neon console, a database app or the admin script, gets "Founding Charter cap reached" on a 16th acceptance. The trigger takes an advisory lock, so two simultaneous acceptances can't both slip through. It also stamps `status_updated_at`.
- The seat count lives in `charter_settings` and is synced from `CHARTER.seats` (`src/config/charter.ts`) whenever migrations run, so the config stays the single source.
- Operators manage leads without a terminal: see `docs/LEAD_OPERATIONS.md`.
- Commands: `npm run leads:admin -- summary`, `-- list [status]`, `-- set <reference> <status> ["note"]`. `<reference>` is the 8-character code the visitor sees on the success screen.

## Reading leads
- **Neon console:** Vercel dashboard → Storage → `daybright-leads` → Open in Neon → Tables → `reservations`.
- **Command line:** `npm run leads:admin -- list` (see above).
- **CSV:** run `vercel env pull .env.local && npm run leads:export > leads.csv`. Status, note and status time are included. The export guards against spreadsheet formula injection. Don't commit the output.
- **Instant alerts:** the optional Resend email (`PRODUCTION_SETUP.md` section 2) contains only reference, time, tier, name, firm and email, with no personal data in the subject. Notes and other fields stay in the database.

## Responses
`201` stored · `400/413/415` malformed · `403` cross-site or failed bot check · `422` validation · `429` rate limited · `502` storage failed · `503` no store configured.
