# Claims review: B2B Founding Charter site

Status: **needs business and compliance sign-off before launch.**
Basis: as of this change, the codebase is a front-end product prototype. It has no auth, no CRM connectors, no SMS, no email delivery, no archiving, no payments and no gifting wallet. Statuses are set centrally in `src/config/charter.ts`; change a status only after the capability is verified in production.

## Availability labels used on the site
| Label | Meaning |
| --- | --- |
| Live | Generally available, verified in production. **Nothing is currently marked Live.** |
| Beta | Works in the product preview (`/app`) today; not production-delivered. |
| Planned | Committed for the Charter program; not built. |
| Roadmap | Later release; timing not committed. |
| Concept | Requires legal/compliance review before any commitment. |
| Included service | Delivered by the team, not software. |
| Proposed terms | Commercial terms not yet active. |

## Supplied copy that was adapted
| Supplied | Shipped | Why |
| --- | --- | --- |
| "Replace $4 physical mailers…" / "Stop paying $3.50+ per physical card" | "Replace costly physical mailers…" / "Printing, postage and hand-addressing add up…" | Per-piece cost figures are unsubstantiated and inconsistent ($4 vs $3.50). Restore with a sourced figure if desired. |
| "tactile, wet-ink-signed digital stationery" | "wet-ink-style signatures" | Digital cards cannot be wet-ink signed; the signature is decorative and not authenticated. |
| "Connect your client data" | "Bring in your client data" | Only CSV import exists (Beta). |
| Microcopy "White-Glove CRM Setup Included" | "White-glove contact import & brand setup included" | No CRM connections exist yet. |
| Pill: "FINRA / SEC Auto-BCC Archiving — Smarsh, Global Relay, Redtail & Wealthbox Ready" | "Auto-BCC archiving for FINRA / SEC recordkeeping workflows · Designed to route copies to Smarsh, Global Relay, Redtail and Wealthbox" + **Planned** | "Ready" implies a working, verified integration and regulatory fitness. |
| Pill: "2-Way CRM Timeline Write-Back" | "CRM timeline write-back" + **Planned** | Not built. |
| Pill: "Principal-Locked Template Mode" | Same + **Planned** | Not built. The product has a review-before-send queue (Beta), which is not a principal approval workflow. |
| Card: "Immutable Compliance Archiving (Auto-BCC)" | "Compliance Archiving (Auto-BCC)" | Immutability (WORM) is a property of the receiving archive, not something Daybright can assert. |
| Card: "Revenue-Driving Milestone Intelligence" | "Milestone Intelligence That Starts Conversations" | Revenue outcome is unsubstantiated. Added a disclaimer that milestone rules vary by person and jurisdiction. |
| "Plugs Directly Into Your Existing Vertical CRM in 60 Seconds" | "Built to Plug Into the Vertical CRM You Already Use" | No connector, OAuth flow or measured setup time exists. All seven tiles show Planned/Roadmap; no "2-Way Live Sync" badge is shown (`liveTwoWaySync: false`). |
| Agency badge "Most Popular" | "Best for teams" | No customer data supports a popularity claim. |
| Enterprise "$15–$22/seat/month" | Hidden (`indicativePerSeat.approved: false`) | Brief says show only if approved. |
| Enterprise "MBE supplier-diversity procurement positioning" | Omitted (`CLAIM_FLAGS.mbeCertified: false`) | No certification evidence in the repo. |
| Sponsor "RESPA/marketing compliance split-tracking" | Shown as **Concept** with a "subject to legal review" note | RESPA Section 8 exposure for co-marketing needs counsel review. |
| Gifting wallet terms | Shown as **Proposed terms** with a "not active, no funds held" note | Custody, money-transmission, payment and fulfillment models are unverified. |

## Items kept as supplied (confirm before launch)
- "Limited to 15 Founding Agencies & Practices". This is a scarcity commitment; the business must honor it.
- Charter and standard prices: Solo $199/yr vs $39/mo ($468/yr), save 57%; Agency $599/yr vs $149/mo ($1,788/yr), save 66% (66.5% rounded down); Sponsor $349/mo vs $499/mo, save 30%. Savings are computed in code from `src/config/charter.ts`.
- Feature quotas (500/2,500 contacts, 100/500 SMS, 5 seats, 25 sponsored partners, "unlimited automated email cards"). "Unlimited" may need a fair-use policy.
- `SALES_EMAIL = hello@daybright.store`, used as the reservation fallback. **Verify this mailbox exists.**
- Third-party product names appear as text monograms, not logos, with a trademark notice. Using official logos requires each owner's brand-guideline approval.

## Other open decisions
- The product preview (`/app`, `/onboarding`) still uses the prototype plans (Starter/Growth/Scale at $39/$79/$149, card-send limits). These conflict with the new tiers. Decide whether to re-plan the product to match.
- The previous consumer homepage moved to `/personal`; consumer flows (`/cards`, `/studio`, `/send`, `/gifts`) are unchanged.
- Privacy: the reservation form has a consent checkbox and a short disclosure. Link a privacy policy once one exists.
