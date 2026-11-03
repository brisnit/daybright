# Production launch checklist

The condensed version of `docs/PRODUCTION_SETUP.md`, which has the commands. Status as of **2026-11-03**: Production is unchanged and still serves the original `main` site. Every unchecked item needs the owner's explicit approval before it's done.

**Legend:** ✅ done · ☐ to do at launch · ⚠ needs a decision or attention first

## 1. Before launch day
| | Item | Notes |
| --- | --- | --- |
| ⚠ | **Legal entity and privacy policy** | The entity placeholder stays until the details from legal are supplied. `/privacy` is still marked Draft. Before launch: name the entity, and list Resend, ImprovMX and the Gmail inbox as service providers (a Review marker is already in the draft). Then decide whether to remove the Draft flag |
| ⚠ | **Claims held for legal review** | Gifting terms, the RESPA concept, FINRA/SEC archiving, the Sponsor tier and MBE stay hidden (`CLAIM_FLAGS`). Launch with them off unless counsel approves |
| ⚠ | **Account ownership** | Vercel, Neon, Resend, ImprovMX, Spaceship, GitHub and the `hellodaybright@gmail.com` inbox should be in Daybright's name, with 2FA on. The vendor has member access only (`docs/LEAD_OPERATIONS.md` section 6) |
| ✅ | Preview verified end to end | Forms, Neon saves, duplicates, the storage-failure path and Resend alerts all pass (2026-11-02/03) |
| ✅ | Sending domain | `daybright.store` verified in Resend: DKIM TXT `resend._domainkey`, CNAME `send` → `send.forge.rmta.net` |
| ☐ | DMARC (optional) | Owner adds TXT `_dmarc` `v=DMARC1; p=none;` at Spaceship. It's a DNS change, so it needs approval |

## 2. Production database (`PRODUCTION_SETUP.md` 4.1, 4.3)
- [ ] Create `daybright-leads-prod` (Neon, free, `iad1`, **Production only**). It must be separate from Preview's `daybright-leads`.
- [ ] Run migrations 001–003. Expect "cap in database: 15 seats", and a host that is **not** the Preview host.
- [ ] Set up the operator's limited database role, or confirm the owner uses the Neon console (`docs/LEAD_OPERATIONS.md`).

## 3. Production environment variables (`PRODUCTION_SETUP.md` 1, 2, 4.2)
- [ ] `DATABASE_URL` (+ `PG*`/`POSTGRES_*`): added by the Neon integration, Production only.
- [ ] `LEAD_IP_HASH_SECRET`: a **new** random 64-character value, Sensitive.
- [ ] `RESEND_API_KEY`: a **separate Production key**, "Sending access" for `daybright.store` only, Sensitive.
- [ ] `LEAD_NOTIFY_FROM` = `Daybright Leads <notifications@daybright.store>`
- [ ] `LEAD_NOTIFY_TO` = `hellodaybright@gmail.com`
- [ ] **Not set:** `LEAD_TEST_FAULTS`, Turnstile keys (kept off by decision), and Turnstile test keys.
- [ ] All variables are saved **before** the Production build. Variables added later need a redeploy.

## 4. Final security checks (`PRODUCTION_SETUP.md` 4.4)
- [ ] `scripts/prod-preflight.mjs` passes against the pulled Production env (then delete the env file).
- [ ] `git ls-files | grep .env` is empty, and `npm audit --omit=dev` reports 0 vulnerabilities.
- [ ] Deployment Protection stays on for Previews.
- [ ] Neon and Resend access is limited to the owner and named operators.

## 5. Domain
- ✅ `daybright.store` is attached to the `daybright` project. Its A record `216.150.1.1` points to Vercel, and merging to `main` deploys to it. No DNS change is needed to launch.
- ☐ `www.daybright.store` has no DNS record today. Optional: add it in Vercel and Spaceship (approval needed), then set `RESERVATION_ALLOWED_ORIGINS` to include it.

## 6. Launch (`PRODUCTION_SETUP.md` 4.5–4.6)
- [ ] **Stakeholder approval recorded:** who approved, the date, and which commit.
- [ ] Merge `b2b-charter-redesign` into `main`, then confirm the Production deployment is Ready.
- [ ] **Pages:** `/`, `/pricing`, `/privacy`, `/app`, `/personal` and `/open?id=demo-card` return 200, and `/business` redirects to `/`.
- [ ] **Security:** a cross-site POST returns 403, and the `x-lead-test-fault` header is ignored.
- [ ] **Form test:** one reservation from a phone and one Enterprise inquiry from a desktop, with firm `ZZ LAUNCH TEST`. Both show a reference, and both rows appear in the Production database.
- [ ] **Email:** the logs show `lead alert accepted by Resend` for both references. Both emails arrive at `hellodaybright@gmail.com` with no note, title, website or CRM, and reply-to is the submitted address.
- [ ] **Clean up:** delete the `ZZ LAUNCH TEST` rows. Preflight then shows 0 test rows.

## 7. Rollback (`PRODUCTION_SETUP.md` 4.7)
- **Site:** Vercel → Deployments → the previous Production deployment → **Instant Rollback**. This takes under a minute and needs no DNS change.
- **Leads:** the Production database is unaffected. Rolling back the site never deletes leads.
- **Alerts only:** to stop emails without rolling back, remove `RESEND_API_KEY` from Production and redeploy, or revoke the Production key in Resend. Leads keep saving.
- **Forms only:** if needed, remove `DATABASE_URL` from Production and redeploy. The form then shows its "nothing was saved" message with the email fallback.
