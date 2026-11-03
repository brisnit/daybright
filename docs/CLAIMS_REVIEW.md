# Claims review: B2B Founding Charter site

Status: **conservative launch cleanup applied 2026-11-02; legal and business sign-off still required before launch.**
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
| "Replace $4 physical mailers…" / "Stop paying $3.50+ per physical card" | "Tactile digital stationery in place of printed mailers and plain CRM emails…" (2026-11-02; cost comparison removed entirely) | Per-piece cost figures are unsubstantiated and inconsistent ($4 vs $3.50). |
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

## Owner decisions applied (2026-11-02): conservative Founding Charter launch
| Decision | How it's implemented |
| --- | --- |
| Keep the 15-reservation cap, with no implied guarantee or automatic acceptance | `CHARTER.seats` = 15. Each reserve surface (modal header, pricing note, FAQ, bands) says a reservation is nonbinding and doesn't guarantee a seat, and that requests are reviewed in order (`CHARTER.nonbinding`). CTAs say "Request…", not "Claim…" or "Lock in…". Status is tracked in the database, and only `accepted` counts toward the cap, enforced by `npm run leads:admin`. |
| Remove unverified savings and comparisons | The standard prices ($39/$149/$499 per month), strikethroughs, "Save N%", the Standard pricing toggle, "Software-grade automation at a fraction of physical postage", "Replace costly physical mailers", "envelopes clients actually open" and the old "$39/month" business pricing on consumer pages are all gone. The `standard` field and `tierSavings()` were removed from config. |
| Quotas stay Proposed | `QUOTAS.confirmed = false`, so every quota line shows "Proposed limit". |
| No lifetime pricing, delivery dates, guaranteed features or refunds | The "Planned" label now reads "In development… No release date is committed" (it used to say "Committed for the Charter program"). Beta means "can be tried in the browser-based preview… not in production use". A new FAQ says no price-lock period, renewal terms or refund policy has been set. "Prepaid" wording is removed. |
| Payments disabled; reservations are nonbinding | No payment code exists. Copy everywhere: "Nonbinding · No payment". Structured data no longer publishes Offers. The success screen says the request "doesn't guarantee a seat or commit you to anything". |
| Unbuilt features labelled conceptual or planned | Gifting wallet: **Concept** + **Proposed terms** (the "100% Transparent" heading was removed), with a note that payment models need legal review. Compliance: Planned, with "No" leading the compliance FAQ answer. CRM connections: Planned/Roadmap, with "no partnership" stated. |
| Enterprise per-seat pricing and MBE stay hidden | `indicativePerSeat.approved = false`, `CLAIM_FLAGS.mbeCertified = false`. |
| `/app` pricing labelled illustrative | `PRICING_COPY.provisional` now reads "Illustrative pricing for this product preview only…". Billing, onboarding plan step and review step all carry "illustrative". A product-preview banner sits on every `/app` and `/onboarding` page. |
| Consumer pages don't imply operation | A prototype banner sits on `/personal`, `/cards`, `/cards/[id]`, `/studio`, `/send`, `/gifts` and `/search`, and a sample-card banner on `/open`. Send confirmations read "Demo send complete… Nothing was sent". Checkout-style buttons and lock icons are removed. Gift reveal says "Sample gift / Sample code". "Made with AI. Sent on the day." is removed. `/business` (an older small-business pitch with $39/month pricing) temporarily redirects to `/`. |

## Hidden pending legal review (owner decision 2026-11-02, second round)
These are removed from every public page, but the content and implementation are kept. Each is gated by a flag in `CLAIM_FLAGS` (`src/config/charter.ts`); set the flag to `true` to restore it after counsel approves.
| Flag | What's hidden | Where it lived |
| --- | --- | --- |
| `giftingTerms` | Gifting wallet and SMS top-up fees ($0 ACH markup, 3.5% card fee, $0.05/SMS) and the "How will gifting be funded?" FAQ | `GiftingTerms` on pricing, `GIFTING_FAQ` in `home.tsx`, `GIFTING_TERMS` |
| `respaConcept` | "RESPA / marketing-compliance split tracking" (Sponsor tier) and its pricing footnote | `TIERS.sponsor.features`, pricing footnote |
| `sponsorTier` | The whole **Co-Marketing Sponsor** tier (owner decision 2026-11-02, third round): its pricing card ($349/mo Charter Partner, 25 partner accounts, co-branded footers, ROI dashboard), the Sponsor inquiry option and modal copy, the "Sponsor accounts for referral partners" link, the Sponsor plan in FAQ summaries and plan cards, "partner-account" in the pricing footnote, and Sponsor mentions in `/pricing` metadata and the privacy draft. **The API also rejects Sponsor inquiries** while the flag is off. | `TIERS` entry with `gate: "sponsorTier"`; everything public reads `PUBLIC_TIERS`, `RESERVATION_TIER_IDS` and `INQUIRY_TIER_IDS` |
| `regulatoryArchiving` | Auto-BCC archiving for FINRA/SEC recordkeeping (hero pill naming Smarsh / Global Relay), the "Compliance Archiving (Auto-BCC)" card, the hero "Audit snapshot" visual, and the Solo "Auto-BCC compliance archiving" feature | `CAPABILITY_PILLS`, `compliance.tsx`, `hero.tsx`, `TIERS.solo.features` |

**Rewritten, not gated:**
- The compliance FAQ is now "Will Daybright make my firm's client communications compliant?" The answer is "No…", with no feature claims and no regulator names.
- The "CRM timeline write-back" pill detail no longer mentions audit snapshots.
- "archiving" is gone from the "What works today" answer.

**Restoring the Sponsor tier:** set `sponsorTier: true` (and `respaConcept` if the split-tracking feature is approved), then re-add "Sponsor" to the `/pricing` metadata description and the privacy policy's form list, which are plain text.

**Still visible, consider with counsel:**
- "Principal-locked template mode" and "Central compliance approval queue" (Planned). These are approval workflows, not archiving claims.
- "Built for Regulated Industries" positioning.

## Site-wide audit (2026-11-02)
- **Coverage:** every route was rendered in a browser and scanned for banned phrases and the correct preview banner: 22 routes, all 200, all with the right banner. After the second round, the scan also fails on FINRA, SEC, RESPA, archiving, Smarsh, Global Relay, Auto-BCC, audit snapshot, 3.5%, markup, ACH, $0.05 and "gifting wallet". No route contains any of them.
- **Remaining matches are intentional:**
  - "locked in" and "guarantee a seat" appear only inside disclaimers.
  - "$39/month" appears only on `/app/billing` as labelled illustrative preview pricing.
- **No fake social proof:** none was found anywhere. There are no testimonials, ratings, customer counts, ROI or time-saved figures, SOC 2/HIPAA claims or app-store claims.
- **AI:** every "AI" feature is local templates (no model calls) and is labelled "Demo example" or covered by the preview banner.
- **Still shown as supplied, owner to confirm:**
  - "White-glove contact import & brand setup included" (Included service; scope to be confirmed in writing).
  - "Unlimited automated email cards" (Beta + Proposed limit; may need a fair-use policy).
  - Charter prices $199/yr, $599/yr, $349/mo (labelled proposed).

## Still open
- Legal entity name, address and effective date: pending the owner's legal meeting (2026-11-03). Nothing assumes an entity.
- Final quotas, price-lock/renewal/refund terms and any delivery commitments: to be set before any written agreement.
- Gifting terms, the RESPA concept and FINRA/SEC archiving claims are hidden until counsel review. The Co-Marketing Sponsor tier is hidden too, pending counsel's RESPA review of the arrangement.
- Product-preview plans vs charter tiers: `docs/PRICING_ALIGNMENT.md`.
