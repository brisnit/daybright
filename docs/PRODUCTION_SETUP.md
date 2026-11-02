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
| `LEAD_REVIEW_URL` | Optional link added to alert emails (e.g. the Neon console for the Production project) | – | – | optional |
| `RESERVATION_ALLOWED_ORIGINS` | Extra allowed origins, comma-separated | – | – | only if serving from another hostname (e.g. `https://www.daybright.store`) |

Values are never committed: `.env*` and `.vercel` are gitignored. Add secrets with `--sensitive`.

## 2. Lead alert emails with Resend (prepared, not active)
**Owner decision 2026-11-02:** send from a verified Daybright domain, so no shared or test sender is used.

**What's built:** after a lead is saved, `notifyLead` sends a short alert:
- **Subject:** request type and reference only, e.g. "New Founding Charter reservation request · E0CB4799". No personal data, because subjects show in notification previews.
- **Body:** reference, received time, tier, name, firm and email.
- **Left out on purpose:** title, website, CRM, team size and the free-text note. The note could contain client information. These stay in the database.
- **Reply-to:** the submitter's email, so replying reaches them.
- **Never blocks a lead:** the alert is sent after the lead is saved, so a Resend failure only shows up in the logs.

**Tested 2026-11-02:**
- **Payload capture:** the app's call to Resend was intercepted, with nothing sent. The note, title, website, CRM and team size didn't appear.
- **Invalid key:** the lead was still saved (201).

**Cost:** free tier, ample for this form. Don't choose a paid plan.

**Setup:** walk through it with the owner one step at a time (the conversation of 2026-11-02). The outline:
1. **Create a Resend account** in Daybright's name.
2. **Add the domain** `daybright.store`, region **North Virginia (us-east-1)**.
3. **Add the DNS records** Resend shows, in Spaceship → Advanced DNS (owner action). They're normally:
   | Type | Host | Value | Priority |
   | --- | --- | --- | --- |
   | TXT | `resend._domainkey` | DKIM key (unique; copy from Resend) | – |
   | MX | `send` | `feedback-smtp.us-east-1.amazonses.com` | 10 |
   | TXT | `send` | `v=spf1 include:amazonses.com ~all` | – |

   They sit on `send.` and the DKIM selector, so they don't touch the ImprovMX MX/SPF on `@` or the site's A record. Copy values from Resend if they differ.
4. **Wait** until Resend shows the domain as **Verified**.
5. **Create an API key** with "Sending access", restricted to `daybright.store`.
6. **At launch only** **[approval]**, set the Production variables:
   ```bash
   vercel env add RESEND_API_KEY production --sensitive
   vercel env add LEAD_NOTIFY_FROM production     # Daybright Leads <leads@daybright.store>
   vercel env add LEAD_NOTIFY_TO production       # the operator inbox
   ```
7. **Optional, later:** a DMARC record (`_dmarc` TXT `v=DMARC1; p=none;`) improves deliverability for both ImprovMX replies and Resend.

## 3. Cloudflare Turnstile bot check (prepared, kept OFF by owner decision 2026-11-02)
**What's built:**
- **Widget:** the modal shows it only when `NEXT_PUBLIC_TURNSTILE_SITE_KEY` is set.
- **Server check:** the API verifies the token with Cloudflare whenever `TURNSTILE_SECRET_KEY` is set.
- **Fresh token on retry:** tokens are single-use, so the widget resets after every failed attempt.
- **Missing token:** if the widget hasn't produced a token yet, the form asks the visitor to complete the check instead of sending.

**Tested 2026-11-02** with Cloudflare's official test keys:
- **Always-fail secret:** 403 `verification_failed`, with or without a token.
- **Always-pass keys, full browser flow:** success, then a storage failure, then a retry that succeeded with a fresh token.

**Cost and DNS:** Turnstile is free and needs no DNS change. The domain doesn't have to be on Cloudflare.

**Current decision:** keep it off. The honeypot, time trap, same-origin check, JSON-only and size limits, and database rate limits stay active. `scripts/prod-preflight.mjs` warns, but doesn't fail, while it's off. Turn it on only if spam appears, and only with approval.

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
### 4.1 Separate Production database (configuration prepared; not created or connected)
Preview and Development share `daybright-leads`, so test submissions never mix with real leads.

| Setting | Value | Why |
| --- | --- | --- |
| Resource name | `daybright-leads-prod` | Distinct from Preview's `daybright-leads` |
| Provider and plan | Neon via Vercel Marketplace, `free_v3` | Same as Preview; ample for the charter |
| Region | `iad1` (US East, AWS us-east-1) | Matches the Vercel function region. Preview functions confirmed on `iad1` via the `x-vercel-id` header, 2026-11-02 |
| Neon Auth | off (`auth=false`) | Not used |
| Environments | **Production only** | Preview and Development keep the separate database |
| Schema | migrations 001–003 via `scripts/db-migrate.mjs` | Includes the status constraint and the database-enforced 15-seat cap |
| Access | owner via Vercel → Storage; operators via their own limited role | See `docs/LEAD_OPERATIONS.md` |

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

### 4.3 Migrate and preflight the Production database before launch
The app applies pending migrations on its first database request. Running them explicitly first lets you verify the schema, the cap and the host:
```bash
vercel env pull .env.production.local --environment=production
node --env-file=.env.production.local scripts/db-migrate.mjs
#  → "Database host:" must NOT be the Preview host (ep-aged-river-…); expect 001–003 and "cap in database: 15 seats"
node --env-file=.env.production.local scripts/prod-preflight.mjs
#  → read-only. Fails on: shared Preview DB, LEAD_TEST_FAULTS, missing/short IP secret, half-set Resend or Turnstile,
#    a non-daybright.store sender, Turnstile test keys, missing migrations, cap mismatch, leftover ZZ test rows
rm .env.production.local
```
Tested 2026-11-02 against the Preview env: it correctly **failed** on "shared Preview database" and "missing IP secret".

### 4.4 Security checks before merging
- [ ] `vercel env ls production` shows no `LEAD_TEST_FAULTS` and no Turnstile **test** keys.
- [ ] `scripts/prod-preflight.mjs` passes (4.3). That covers the database host, test flags, secrets and the cap.
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
5. **Rows saved:** the operator opens the Production database (`docs/LEAD_OPERATIONS.md`) and sees both rows with status `new`.
6. **Alerts:** if Resend is on, both alert emails arrive from `leads@daybright.store`. Check that they contain no note, title, website or CRM, and that the reply-to is the submitted address.
7. **Fault header ignored:** a request with `x-lead-test-fault: storage` is **not** failed in Production.
8. **Clean up:** delete the test rows in the Neon console (`delete from reservations where firm = 'ZZ LAUNCH TEST'`). Then confirm `summary` shows no leads.

### 4.7 Rollback
- **The site:** in Vercel → Deployments, choose the previous Production deployment → **Instant Rollback** (or run `vercel rollback`).
- **The leads:** the Production database is unaffected by a rollback. The old site never wrote to it.

## 5. Running the Founding Charter after launch
The operator guide is `docs/LEAD_OPERATIONS.md`. It works in the browser or a desktop database app, with no terminal. The notes below are for developers.
- **Check each lead:** `leads:admin summary`, `list [status]`, and `set <reference> <status> ["note"]`.
- **Statuses:** `new` → `contacted` → `accepted` | `waitlisted` | `declined`; use `withdrawn` if someone opts out.
- **Seat cap:** only `accepted` reservations count toward `CHARTER.seats` (15). The **database** refuses a 16th acceptance (migration 003 trigger), whether it comes from the Neon console, a database app or the script. Tested 2026-11-02, including with a least-privilege operator role.
- **Who sets status:** the public form never sets or reveals status. Submitting always creates `new`.
- **When all seats are accepted:** the site still accepts requests, and its copy says requests are reviewed and not guaranteed. Waitlist them, or decide whether to change the site copy.

## 6. Ownership and open decisions
- **Entity:** legal entity details are pending the 2026-11-03 legal meeting. The privacy policy keeps a placeholder, and no entity is assumed in code or docs.
- **Vendor:** Artifact Digital is the development vendor only, not Daybright's owner or operator. Accounts holding lead data (Vercel, Neon, Resend, ImprovMX, Spaceship, GitHub) should be in Daybright's name, with vendor access as a member that can be removed (`docs/LEAD_OPERATIONS.md` section 6).

## 7. External services
| Service | Role | Status | Plan |
| --- | --- | --- | --- |
| Vercel | Hosting, environment secrets | in use | existing |
| Neon (via Vercel Marketplace) | Lead databases: `daybright-leads` (Preview/Dev), `daybright-leads-prod` (Production, at launch); US East | Preview in use | Free |
| ImprovMX | `hello@daybright.store` inbound forwarding | active since 2026-11-02 | Free |
| Resend | Lead alert emails from verified `daybright.store` | prepared, not active | Free tier |
| Cloudflare Turnstile | Bot check | prepared, kept off by decision | Free |
