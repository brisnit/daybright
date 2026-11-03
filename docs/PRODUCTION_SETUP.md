# Production launch runbook

**Status (2026-11-03):** nothing in this document has been applied to Production. `daybright.store` still serves the original `main` site. Production has no database and no lead environment variables. Every step marked **[approval]** needs the owner's explicit go-ahead first. The condensed checklist is `docs/LAUNCH_CHECKLIST.md`.

Preview (branch `b2b-charter-redesign`) and Development are configured and tested against the `daybright-leads` database. Resend lead alerts are live on Preview and were verified end to end on 2026-11-03 (section 2).

**Vercel environment variables apply only to deployments built after they're saved.** Adding or changing one doesn't affect existing deployments, including the one you're testing: redeploy afterwards (push a commit, or Vercel → the deployment → ⋯ → **Redeploy**, keeping the environment on Preview). On 2026-11-03 the sender and recipient were added after the latest Preview was built, so that Preview silently skipped alerts until it was rebuilt.

## 1. Environment variables (Vercel project `daybright`)
| Variable | Purpose | Dev | Preview | Production (planned) |
| --- | --- | --- | --- | --- |
| `DATABASE_URL` (+ `PG*`/`POSTGRES_*`) | Neon connection; required for lead storage | ✅ `daybright-leads` | ✅ `daybright-leads` (shared with Dev) | separate `daybright-leads-prod` (step 4.1) |
| `LEAD_IP_HASH_SECRET` | Key for hashing IPs used by abuse limits | ✅ | ✅ | fresh value (step 4.2) |
| `LEAD_TEST_FAULTS` | Enables the storage-failure test header | – | ✅ `1` | **must stay unset** (also ignored when `VERCEL_ENV=production`) |
| `RESEND_API_KEY`, `LEAD_NOTIFY_FROM`, `LEAD_NOTIFY_TO` | Email alert per new lead (section 2). All three or none | – | ✅ (branch-scoped) | recommended, own key |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY` | Cloudflare Turnstile bot check (section 3). Set both or neither | – | optional (test keys) | optional |
| `RESERVATION_WEBHOOK_URL`, `RESERVATION_WEBHOOK_SECRET` | Optional copy of each lead to a CRM/automation | – | – | optional |
| `LEAD_REVIEW_URL` | Optional link added to alert emails (e.g. the Neon console for the Production project) | – | – | optional |
| `RESERVATION_ALLOWED_ORIGINS` | Extra allowed origins, comma-separated | – | – | only if serving from another hostname (e.g. `https://www.daybright.store`) |

Values are never committed: `.env*` and `.vercel` are gitignored. Add secrets with `--sensitive`.

## 2. Lead alert emails with Resend (active on Preview; not on Production)
**Owner decision 2026-11-02:** send from a verified Daybright domain, so no shared or test sender is used.

### Configuration
| Variable | Value | Notes |
| --- | --- | --- |
| `RESEND_API_KEY` | Resend API key (secret) | Add as **Sensitive**. Never commit, paste into chat or log it. Use a separate key per environment |
| `LEAD_NOTIFY_FROM` | `Daybright Leads <notifications@daybright.store>` | Must be on the verified `daybright.store` domain. `scripts/prod-preflight.mjs` fails otherwise |
| `LEAD_NOTIFY_TO` | `hellodaybright@gmail.com` | Comma-separate for several recipients |
| `LEAD_REVIEW_URL` | optional | A link added to each alert, e.g. the Neon console for the Production project |

All three of the first variables must be set, or no email is sent. On Preview they are scoped to the `b2b-charter-redesign` branch. **After adding or changing any of them, redeploy** (see the top of this document).

### Resend account and domain
- **Account:** Resend, Free plan, in Daybright's name.
- **Domain:** `daybright.store`, verified in Resend.
- **API key:** "Sending access" restricted to `daybright.store` (owner to confirm in Resend → API Keys).

**DNS records at Spaceship, as published on 2026-11-03** (checked read-only with `dig`):
| Type | Host | Value | Purpose |
| --- | --- | --- | --- |
| TXT | `resend._domainkey` | `p=MIGfMA0…` (DKIM public key; copy the full value from Resend → Domains if it ever needs re-entering) | Signs Daybright's alert emails |
| CNAME | `send` | `send.forge.rmta.net` | Resend's managed return path. It provides the `send` subdomain's MX (`feedback.forge.rmta.net`, priority 10) and SPF, so there are no separate MX or TXT records on `send` |

These records don't touch the ImprovMX records on the root domain (MX `mx1`/`mx2.improvmx.com`, TXT `v=spf1 include:spf.improvmx.com ~all`) or the site's A record (`216.150.1.1`). Earlier versions of this guide listed Amazon SES records for `send`; Resend issued the CNAME above instead, so treat Resend's dashboard as the source of truth.

**Not yet set (optional, owner action at Spaceship):** a DMARC record, TXT `_dmarc` with `v=DMARC1; p=none;`. It improves deliverability for both Resend alerts and ImprovMX replies. It's a DNS change, so it needs approval.

### How an alert is sent
1. The visitor submits the form. The API validates it, applies the spam and rate limits, and **saves the lead to Neon**.
2. Only after the save commits does the API return 201 with the reference.
3. If the request wasn't a duplicate (same idempotency key), `after()` runs `notifyLead` once the response has gone. A duplicate returns the original reference and sends nothing.
4. `notifyLead` sends to Resend only if all three variables are set, with an 8-second timeout. A Resend error or timeout is caught and logged. The lead stays saved and the visitor still sees success.

**What the email contains:**
- **Subject:** request type and reference only, e.g. "New Founding Charter reservation request · 56305ADD". No personal data, because subjects show in notification previews.
- **Body:** reference, received time (UTC), tier (reservations), name, firm and email, plus `LEAD_REVIEW_URL` if set.
- **Left out on purpose:** the free-text note, title, website, CRM and team size. The note could contain client information. These stay in the database.
- **Reply-to:** the submitter's email, so replying reaches them.

### Diagnostic logging
Each alert writes one log line under `[reservations]`, carrying only the 8-character lead reference. Logs never contain the key, the variable values, names, emails or notes.
| Log line | Meaning |
| --- | --- |
| `lead alert accepted by Resend <ref> <resend id>` | Resend accepted it. Look up the Resend id under Resend → Emails |
| `notification failed <ref> Error: Resend responded <status> (<error name>)` | Resend rejected it, e.g. 403 for an unverified domain or bad key, 422 for an invalid sender. The lead is still saved |
| `lead alert skipped: missing <VARIABLE names> <ref>` | Partly configured. Add the missing variable, then **redeploy** |
| `lead alert skipped: email alerts not configured <ref>` | None of the three variables are set (expected on Production today) |

To read them: Vercel → the deployment → **Logs**, filtered to `/api/reservations`. Or `vercel logs --deployment <url> --since 30m --query "lead alert"`.

### Testing procedure (Preview)
Test emails go to the real inbox, so get the owner's go-ahead first.
1. Check the latest Preview deployment was built **after** the variables were last changed (`vercel ls`, `vercel env ls preview b2b-charter-redesign`). If not, redeploy.
2. Submit one reservation and one inquiry with firm names starting `ZZ` (the preflight script flags leftover `ZZ` rows). Use a `+tag` address on the operator inbox as the email, and a unique marker word in the note.
3. Expect 201 with a reference for each. In the logs, expect `lead alert accepted by Resend` for both references.
4. In the inbox, check both emails arrive from `notifications@daybright.store`. The note marker, title, website and CRM must be absent, and reply-to must be the submitted address.
5. Delete the test rows (owner in the Neon console: `delete from reservations where firm ilike 'zz%';`), and confirm the table holds no test rows.

**Verified 2026-11-03** on Preview `daybright-dxk9hgxnp` (commit `fde9776`): both leads saved, Resend accepted both, both arrived at `hellodaybright@gmail.com` without the note (stakeholder confirmed), and the test rows were deleted. Earlier, on 2026-11-02, an intercepted payload test and an invalid-key test (lead still saved, 201) also passed.

### At launch only **[approval]**
Create a **separate Production API key** in Resend ("Sending access", `daybright.store` only), so Preview and Production keys can be revoked independently. Then:
```bash
vercel env add RESEND_API_KEY production --sensitive
vercel env add LEAD_NOTIFY_FROM production     # Daybright Leads <notifications@daybright.store>
vercel env add LEAD_NOTIFY_TO production       # hellodaybright@gmail.com
```
Add these **before** the Production deployment is built, or redeploy afterwards.

**Cost:** Resend's free tier is ample for this form. Don't choose a paid plan.

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
6. **Alerts:** if Resend is on, both alert emails arrive from `notifications@daybright.store`, and the logs show `lead alert accepted by Resend` for both references. Check that they contain no note, title, website or CRM, and that the reply-to is the submitted address.
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
| Resend | Lead alert emails from verified `daybright.store` | active on Preview (verified 2026-11-03); not on Production | Free tier |
| Cloudflare Turnstile | Bot check | prepared, kept off by decision | Free |
