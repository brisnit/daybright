# Production launch runbook

**Status (2026-11-02):** nothing in this document has been applied to Production. `daybright.store` still serves the original `main` site. Production has no database and no lead environment variables. Every step marked **[approval]** needs the owner's explicit go-ahead first.

Preview (branch `b2b-charter-redesign`) and Development are configured and tested against the `daybright-leads` database.

## 1. Environment variables (Vercel project `daybright`)
| Variable | Purpose | Dev | Preview | Production (planned) |
| --- | --- | --- | --- | --- |
| `DATABASE_URL` (+ `PG*`/`POSTGRES_*`) | Neon connection; required for lead storage | ✅ `daybright-leads` | ✅ `daybright-leads` (shared with Dev) | separate `daybright-leads-prod` (step 4.1) |
| `LEAD_IP_HASH_SECRET` | Key for hashing IPs used by abuse limits | ✅ | ✅ | fresh value (step 4.2) |
| `LEAD_TEST_FAULTS` | Enables the storage-failure test header | – | ✅ `1` | **must stay unset** (also ignored when `VERCEL_ENV=production`) |
| `RESEND_API_KEY`, `LEAD_NOTIFY_FROM`, `LEAD_NOTIFY_TO` | Email alert per new lead (section 2) | – | optional | recommended |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY` | Cloudflare Turnstile bot check (section 3). Set both or neither | – | optional (test keys) | optional |
| `RESERVATION_WEBHOOK_URL`, `RESERVATION_WEBHOOK_SECRET` | Optional copy of each lead to a CRM/automation | – | – | optional |
| `RESERVATION_ALLOWED_ORIGINS` | Extra allowed origins, comma-separated | – | – | only if serving from another hostname (e.g. `https://www.daybright.store`) |

Values are never committed: `.env*` and `.vercel` are gitignored. Add secrets with `--sensitive`.

## 2. Lead alert emails with Resend (prepared, not active)
**What's built:** after a lead is saved, `notifyLead` sends a plain-text alert with the lead's details, and its reply-to is set to the lead's email. It runs after the response, so a Resend outage or bad key never affects whether a lead is saved; the failure is just logged.
- **Tested 2026-11-02:** with an invalid key, the lead saved (201) and the log showed `notification failed … Resend responded 401`.

**Cost:** Resend has a free tier, which is plenty for a 15-seat form. Check current limits at resend.com/pricing. Don't choose a paid plan for this.

**To activate** **[approval: account + DNS]**:
1. **Create a free account** at https://resend.com. Use the inbox that should receive alerts.
2. **Option A (recommended): verify the domain.** Under **Domains → Add domain**, enter `daybright.store` (region us-east-1, matching the database). Resend shows the exact records to add in **Spaceship → Advanced DNS**. They're normally:
   | Type | Host | Value | Priority |
   | --- | --- | --- | --- |
   | MX | `send` | `feedback-smtp.us-east-1.amazonses.com` | 10 |
   | TXT | `send` | `v=spf1 include:amazonses.com ~all` | – |
   | TXT | `resend._domainkey` | DKIM key (copy from Resend; it's unique) | – |
   These sit on the `send` subdomain and the DKIM selector, so they don't touch the ImprovMX MX/SPF records on `@` or the site's A record. Use Resend's values if they differ from this table.
3. **Option B (no DNS change): use Resend's test sender.** Set `LEAD_NOTIFY_FROM` to `Daybright Leads <onboarding@resend.dev>`. Resend only delivers this sender's mail to the account owner's own address, so `LEAD_NOTIFY_TO` must be that address. Fine as a stopgap; switch to Option A when convenient.
4. **Create an API key** with "Sending access" and set the three variables for Production:
   ```bash
   vercel env add RESEND_API_KEY production --sensitive
   vercel env add LEAD_NOTIFY_FROM production     # e.g. Daybright Leads <leads@daybright.store>
   vercel env add LEAD_NOTIFY_TO production       # e.g. hellodaybright@gmail.com
   ```
5. Add Resend to the privacy policy's service-provider list (see `PRIVACY_REVIEW.md`).

## 3. Cloudflare Turnstile bot check (prepared, not active)
**What's built:**
- **Widget:** the modal shows it only when `NEXT_PUBLIC_TURNSTILE_SITE_KEY` is set.
- **Server check:** the API verifies the token with Cloudflare whenever `TURNSTILE_SECRET_KEY` is set.
- **Fresh token on retry:** tokens are single-use, so the widget resets after every failed attempt.
- **Missing token:** if the widget hasn't produced a token yet, the form asks the visitor to complete the check instead of sending.

**Tested 2026-11-02** with Cloudflare's official test keys:
- **Always-fail secret:** 403 `verification_failed`, with or without a token.
- **Always-pass keys, full browser flow:** success, then a storage failure, then a retry that succeeded with a fresh token.

**Cost and DNS:** Turnstile is free and needs no DNS change. The domain doesn't have to be on Cloudflare.

**Recommendation:** launch without it. The honeypot, time trap, same-origin check and database rate limits are already active. Turn it on if spam appears.

**To activate** **[approval: account]**:
1. Go to Cloudflare dashboard → **Turnstile → Add widget**. Hostnames: `daybright.store`, plus `www.daybright.store` if you add `www`. Mode: **Managed**.
2. Set the keys for Production. The public key is read at build time, so redeploy afterwards:
   ```bash
   vercel env add NEXT_PUBLIC_TURNSTILE_SITE_KEY production
   vercel env add TURNSTILE_SECRET_KEY production --sensitive
   ```
3. **Previews:** random preview hostnames won't match the widget. Use Cloudflare's test keys there (site `1x00000000000000000000AA`, secret `1x0000000000000000000000000000000AA`), or leave Turnstile off.
4. In `/privacy`, keep the Turnstile paragraph and link Cloudflare's Turnstile privacy terms. If it stays off, remove the paragraph.

## 4. Launch sequence **[approval for each numbered step]**
### 4.1 Separate Production database
Preview and Development share `daybright-leads`, so test submissions never mix with real leads.
```bash
vercel integration add neon --plan free_v3 -m region=iad1 -m auth=false -n daybright-leads-prod -e production --no-env-pull
vercel env ls production        # expect DATABASE_URL (+ PG*/POSTGRES_*) for Production only
```
- Region `iad1` (US East) matches Vercel's default function region and the privacy policy.
- Connecting the integration can redeploy the **current** Production commit. That happened once during setup: same `main` code, no visible change.

### 4.2 Secrets
```bash
openssl rand -hex 32 | vercel env add LEAD_IP_HASH_SECRET production --sensitive
```
Then add Resend (section 2) and Turnstile (section 3) if approved.

### 4.3 Migrate the Production database before launch
The app applies pending migrations on its first database request. Running them explicitly first lets you verify the schema and the host:
```bash
vercel env pull .env.production.local --environment=production
node --env-file=.env.production.local scripts/db-migrate.mjs
#  → check "Database host:" is NOT the Preview host (ep-aged-river-…); expect 001_reservations, 002_status_tracking
node --env-file=.env.production.local scripts/leads-admin.mjs summary   # → "No leads yet. 0 of 15 seats accepted"
rm .env.production.local
```

### 4.4 Security checks before merging
- [ ] `vercel env ls production` shows no `LEAD_TEST_FAULTS` and no Turnstile **test** keys.
- [ ] Production `DATABASE_URL` points at `daybright-leads-prod` (4.3), not the Preview database.
- [ ] All secrets are marked Sensitive, and no `.env*` file is tracked (`git ls-files | grep .env` is empty).
- [ ] `npm audit --omit=dev` reports 0 vulnerabilities (true on 2026-11-02).
- [ ] Neon console: only the owner has project access. Database credentials live only in Vercel.
- [ ] Vercel Deployment Protection stays on for Preview deployments.
- [ ] Logs contain only lead ids, never names or emails (true in `route.ts` / `lead-store.ts`).
- [ ] `/privacy` is still marked **Draft** unless counsel has signed off (decision for the owner, section 6).

### 4.5 Merge and deploy
Merge `b2b-charter-redesign` into `main`. Vercel then deploys `main` to `daybright.store`.

### 4.6 End-to-end test on Production (immediately after deploy)
1. **Pages:** `/`, `/pricing`, `/privacy`, `/app`, `/personal`, `/open?id=demo-card` all return 200, and `/business` redirects to `/`.
2. **Cross-site request rejected:**
   ```bash
   curl -s -X POST https://daybright.store/api/reservations -H 'content-type: application/json' -H 'origin: https://example.com' -d '{}'
   # → 403
   ```
3. **Real reservation from a phone browser:** submit one Founding Charter reservation with your own email and firm "ZZ LAUNCH TEST". Expect "Your request is in" and a reference.
4. **Inquiry from a desktop browser:** submit one Enterprise inquiry.
5. **Rows saved:** `node --env-file=.env.production.local scripts/leads-admin.mjs list` shows both rows, with status `new`. Re-pull the env file for this step, and delete it afterwards.
6. **Alerts:** if Resend is on, both alert emails arrive, and the reply-to is the submitted address.
7. **Fault header ignored:** a request with `x-lead-test-fault: storage` is **not** failed in Production.
8. **Clean up:** delete the test rows in the Neon console (`delete from reservations where firm = 'ZZ LAUNCH TEST'`). Then confirm `summary` shows no leads.

### 4.7 Rollback
- **The site:** in Vercel → Deployments, choose the previous Production deployment → **Instant Rollback** (or run `vercel rollback`).
- **The leads:** the Production database is unaffected by a rollback. The old site never wrote to it.

## 5. Running the Founding Charter after launch
- **Check each lead:** `leads:admin summary`, `list [status]`, and `set <reference> <status> ["note"]`.
- **Statuses:** `new` → `contacted` → `accepted` | `waitlisted` | `declined`; use `withdrawn` if someone opts out.
- **Seat cap:** only `accepted` reservations count toward `CHARTER.seats` (15). The script refuses a 16th acceptance; tested 2026-11-02.
- **Who sets status:** the public form never sets or reveals status. Submitting always creates `new`.
- **When all seats are accepted:** the site still accepts requests, and its copy says requests are reviewed and not guaranteed. Waitlist them, or decide whether to change the site copy.

## 6. Owner decisions still open
See the launch-readiness report. Legal entity details are pending the 2026-11-03 legal meeting. No entity name is assumed anywhere in the code or docs.

## 7. External services
| Service | Role | Status | Plan |
| --- | --- | --- | --- |
| Vercel | Hosting, environment secrets | in use | existing |
| Neon (via Vercel Marketplace) | Lead databases: `daybright-leads` (Preview/Dev), `daybright-leads-prod` (Production, at launch); US East | Preview in use | Free |
| ImprovMX | `hello@daybright.store` inbound forwarding | active since 2026-11-02 | Free |
| Resend | Lead alert emails | prepared, not active | Free tier |
| Cloudflare Turnstile | Bot check | prepared, not active | Free |
