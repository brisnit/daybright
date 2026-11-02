# Production setup: environment variables and external services

Nothing here has been applied to **Production** yet. Preview (branch `b2b-charter-redesign`) and Development are configured.

## 1. Environment variables (Vercel project `daybright`)
| Variable | Purpose | Development | Preview | Production |
| --- | --- | --- | --- | --- |
| `DATABASE_URL` (+ other `PG*`/`POSTGRES_*` vars) | Neon connection; required for lead storage | ✅ `daybright-leads` | ✅ `daybright-leads` (shared with Development) | ❌ separate `daybright-leads-prod` at launch (step 3.1) |
| `LEAD_IP_HASH_SECRET` | Secret for hashing IPs in abuse limits. Generate fresh for Production | ✅ | ✅ (this branch) | ❌ add at launch |
| `LEAD_TEST_FAULTS` | Enables the storage-failure test header. **Never set in Production** | – | ✅ `1` (this branch only) | must stay unset |
| `RESEND_API_KEY`, `LEAD_NOTIFY_FROM`, `LEAD_NOTIFY_TO` | Optional email alert for each new lead | – | optional | recommended |
| `RESERVATION_WEBHOOK_URL`, `RESERVATION_WEBHOOK_SECRET` | Optional copy of each lead to a CRM/automation | – | optional | optional |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY` | Optional Cloudflare Turnstile bot check (set both or neither) | – | optional | only if spam appears |
| `RESERVATION_ALLOWED_ORIGINS` | Extra allowed origins, comma-separated (e.g. `https://www.daybright.store`) | – | – | only if serving from another hostname |

Values are never committed. `.env*` and `.vercel` are gitignored.

## 2. Make `hello@daybright.store` receive email (requires your action)
**Current state:** `daybright.store` has **no MX records** (DNS is at Spaceship), so mail to this address bounces. The site hides the email fallback until it's verified.

**Option A: free forwarding with ImprovMX (simplest).** Forwards to an inbox you already use.
1. At https://improvmx.com, sign up and add the domain `daybright.store`. Create the alias `hello` and set the forwarding address to your inbox.
2. In Spaceship: **Domains → daybright.store → Advanced DNS (Manage DNS)**, add:
   | Type | Host | Value | Priority |
   | --- | --- | --- | --- |
   | MX | `@` | `mx1.improvmx.com` | 10 |
   | MX | `@` | `mx2.improvmx.com` | 20 |
   | TXT | `@` | `v=spf1 include:spf.improvmx.com ~all` | – |
   Don't change the existing A record (it serves the site).
3. Wait for ImprovMX to show the domain as verified (usually minutes, up to a few hours).
4. From a different account, email `hello@daybright.store` and confirm it arrives. Then tell me and I'll re-check DNS and set `SALES_EMAIL_VERIFIED = true`.

**Option B: a real mailbox** (Spaceship Spacemail, Google Workspace or Microsoft 365) if you want to send *as* hello@. Follow that provider's setup wizard. It will give you the MX and SPF records to add in the same Spaceship DNS screen. Use only one provider's MX records.

## 3. Launch steps (after your approval)
1. Give Production **its own database**. Preview and Development share `daybright-leads`, so test submissions must never mix with real leads:
   ```bash
   vercel integration add neon --plan free_v3 -m region=iad1 -m auth=false -n daybright-leads-prod -e production --no-env-pull
   ```
   This sets `DATABASE_URL` for Production only. The `reservations` table is created automatically on the first submission.
   Installing or connecting an integration can trigger an automatic redeploy of the current Production commit. That happened once during setup (same `main` commit, no change to the live site).
2. Add a fresh secret: `openssl rand -hex 32 | vercel env add LEAD_IP_HASH_SECRET production --sensitive`.
3. Optional (recommended) lead alert email with Resend:
   1. Create an account at https://resend.com and add the domain `daybright.store`.
   2. Add the DNS records it shows in Spaceship. They go on the `send` subdomain and `resend._domainkey`, so they don't conflict with ImprovMX.
   3. Create an API key, then set `RESEND_API_KEY`, `LEAD_NOTIFY_FROM` (e.g. `Daybright <leads@daybright.store>`) and `LEAD_NOTIFY_TO` (your inbox).
4. Confirm `LEAD_TEST_FAULTS` is **not** set for Production: `vercel env ls production`.
5. Merge `b2b-charter-redesign` into `main` (Vercel deploys `main` to `daybright.store`). Then submit one real test reservation, check it appears in Neon, and delete it.

## 4. External services in use
| Service | Role | Account | Plan |
| --- | --- | --- | --- |
| Vercel | Hosting, environment secrets | britt-midgettes-projects | existing |
| Neon (via Vercel Marketplace) | Lead databases: `daybright-leads` (Preview/Dev, created) and `daybright-leads-prod` (Production, at launch); region `iad1` (US East) | provisioned through Vercel | Free |
| ImprovMX or another mail provider | `hello@daybright.store` inbound | to create | Free (ImprovMX) |
| Resend | Optional lead alert emails | to create | Free tier available |
| Cloudflare Turnstile | Optional bot check | only if needed | Free |

**Free-plan note:** Neon's free plan has storage and compute limits that are far beyond what a 15-seat reservation form needs. Review the limits before using the same database for the product.
