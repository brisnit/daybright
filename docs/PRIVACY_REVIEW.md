# Privacy policy draft: items for legal review

Draft: `/privacy` (`src/app/(site)/privacy/page.tsx`). It's set to `noindex` while `DRAFT = true`, and every open item is highlighted on the page as **[Legal review: …]**. It's linked from the reservation consent text and the footer.

**Scope:** the marketing site, the Founding Charter reservation form and the Sponsor/Enterprise inquiry forms. It doesn't cover the product's customer and client data, which will need its own terms and DPA.

## Status
The content now reflects what is actually implemented: Vercel hosting, Neon database storage in US East, a keyed IP hash for abuse limits, a browser-side copy of unsent requests, and optional Turnstile and notification email. It stays `DRAFT = true` (noindex, with highlighted flags) until counsel signs off. Then set `DRAFT = false` in `src/app/(site)/privacy/page.tsx`.

## What the form actually collects (as implemented)
- **Fields:** name; title (optional); firm; website (optional); work email; CRM; tier; team size and note (inquiry only).
- **Consent:** a boolean plus the consent wording, the received-at timestamp, the source CTA and an idempotency key.
- **IP address:** not stored. A keyed one-way hash (HMAC-SHA256 with `LEAD_IP_HASH_SECRET`, truncated) is stored with the lead for abuse limits. Counsel should confirm whether this is treated as personal data; the policy discloses it either way. Vercel's request logs still capture IPs.
- **Not stored:** user agent, form-fill timing (used only as a bot check).
- **Browser:** an unsent request copy in localStorage, removed on success.
- **Browser storage:** no cookies set by the app. The product preview uses localStorage for demo data. Analytics events go to `window.dataLayer` only, with no vendor installed.
- **Fonts:** self-hosted via `next/font`, so there are no runtime calls to Google Fonts.

## Open items
1. Legal entity name, state of organization, mailing address and effective date.
2. Applicable laws: which US state privacy laws apply (thresholds, B2B exemptions); whether EU/UK visitors are in scope (legal bases, international transfer language); CAN-SPAM for follow-up emails.
3. Service providers to list once chosen: hosting, lead database, email delivery, any CRM receiving webhooks. Sign DPAs.
4. Retention period for reservation records (the draft suggests 24 months after last contact) and deletion procedure.
5. Data-subject request process: verification method, response timelines, an authorized-agent process if California applies.
6. Security statements: confirm encryption at rest and access controls for the chosen store before publishing them.
7. Analytics and cookies: if a tag manager or analytics vendor is added, update the policy and assess cookie-consent or opt-out requirements.
8. Children: confirm the age threshold (draft says under 16).
9. Client information: the form and policy tell visitors not to submit client data. Confirm this wording is enough given GLBA (financial) and HIPAA-adjacent (insurance) audiences.
10. Contact mailbox: `hello@daybright.store` must be verified and monitored before the policy is published.
11. Relationship to a future customer privacy notice, terms of service and DPA for the product itself.
