# Pricing alignment: product preview vs. Founding Charter

## Current state
There are two pricing models in the code:

| Source | Used by | Model |
| --- | --- | --- |
| `TIERS` + `QUOTAS` in `src/config/charter.ts` | `/`, `/pricing`, `/business` and `/personal` plan summaries, FAQ | Solo $39/mo ($199/yr charter) · Agency $149/mo ($599/yr charter) · Sponsor $499/mo ($349/mo charter) · Enterprise custom. Limits are **contacts, seats and SMS**. |
| `PLANS` in `src/config/brand.ts` | `/app` workspace, `/onboarding` | Starter $39 · Growth $79 · Scale $149. Limits are **card sends per month**, plus feature flags. |

Public marketing pages no longer show Starter/Growth/Scale. On this branch the FAQ summary and "Business plans from $39/month" now come from `TIERS`; $39 equals Solo's standard price.

## Where the old plans still appear (audit)
| Area | Files | What it shows / uses |
| --- | --- | --- |
| Workspace shell | `components/app/app-shell.tsx` | "Growth plan" under the business name |
| Plan & billing | `components/workspace/billing-page.tsx` | Price, card-send meter, 3-plan comparison, simulated upgrade/downgrade |
| Dashboard | `components/workspace/dashboard-overview.tsx`, `lib/selectors.ts` (`usage`) | "Remaining allowance: X of 300 cards" |
| Automations | `components/workspace/automations-page.tsx`, `automations-editor.tsx` | Feature gating: segments, gift budget, multiple rules |
| Onboarding | `components/onboarding/onboarding-flow.tsx`, `step-plan-brand.tsx`, `step-review.tsx`, `step-card-automation.tsx` | Plan picker ($39/$79/$149), `?plan=starter\|growth\|scale`, gating |
| State | `lib/types.ts` (`planId`), `lib/store.ts` (`setPlan`), `data/seed.ts` (`planId: "growth"`) | Persisted in each browser's localStorage |
| Marketing mock | `components/marketing/dashboard-preview.tsx` | `getPlan("growth")` sends figure in a static mock |

## Proposal: one entitlement model, derived from `TIERS`
**Goal:** the product reads the same tiers as the website, and nothing breaks for existing preview users.

1. **Single source of truth.** Add `ENTITLEMENTS` to `src/config/charter.ts`, keyed by `TierId`, built from `QUOTAS`:

   | | Solo | Agency | Sponsor | Enterprise |
   | --- | --- | --- | --- | --- |
   | Active contacts | 500 | 2,500 | per partner account* | unlimited* |
   | Seats | 1 | 5 | per partner* | custom |
   | Email cards | unlimited (fair use*) | unlimited | unlimited | unlimited |
   | SMS/MMS per month | 100 | 500 | * | custom |
   | Segments | no* | yes | yes | yes |
   | Gift budget controls | no* | yes | yes | yes |
   | Multiple rules | no* | yes | yes | yes |

   Cells marked * need a business decision. Solo's feature flags currently mirror the old Starter plan.
2. **Compatibility layer, no breaking change.**
   - Change `PlanId` to `TierId`.
   - Keep `getPlan(id)` as a thin adapter returning the old shape, so existing callers keep working while they migrate.
   - Map legacy ids: `starter → solo`, `growth → agency`, `scale → enterprise`.
   - Bump `STATE_VERSION` and change the store's `migrate` to remap `planId` instead of resetting. Today it resets to seed data.
3. **Usage meter.** Switch the dashboard and billing meter from "card sends this month" to "active contacts vs. limit". Show SMS usage as "Planned" until SMS exists. Remove the per-month card-send cap, since the tiers include unlimited email cards.
4. **Billing page.** Show the four tiers with charter vs. standard pricing (reuse `PriceBlock` from `components/charter/pricing.tsx`). Keep upgrade/downgrade clearly simulated. Sponsor and Enterprise open the inquiry modal instead of switching.
5. **Onboarding.** The plan step offers Solo and Agency (charter prices, annual prepaid). Sponsor and Enterprise link to the inquiry flow. Accept `?plan=solo|agency` and the legacy ids.
6. **Seed and mocks.** The seed business moves to `agency`. The marketing dashboard mock reads `ENTITLEMENTS.agency`.
7. **Pricing CTAs.** These stay as reservations, not self-serve signup, until billing is approved.

**Order:** 1–2 first (invisible), then 3–6 in one PR.
**Effort:** about 1–2 days, plus a manual pass through `/app` and `/onboarding` at 3 widths.
**Risk:** low, because the adapter keeps the old callers working and the migration preserves demo state.

**Decisions needed before building:** the * cells above, whether Solo keeps the Starter feature restrictions, and how Sponsor partner accounts appear in the product.

## Update (2026-11-02)
Per the owner's decision, the preview plans stay as they are but are labelled **illustrative** wherever they appear (`PRICING_COPY.provisional`, billing page, onboarding plan and review steps), and a product-preview banner on every `/app` and `/onboarding` page links to Founding Charter pricing. Public standard prices and savings comparisons were removed from `TIERS`, so `STARTING_PRICE` no longer exists. Aligning preview entitlements with the charter tiers is still optional future work.
