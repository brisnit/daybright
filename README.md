# Daybright — interactive prototype

Birthday cards and gifts for one person or every customer you serve. This is a **clickable product prototype** for UX iteration: real journeys, seeded demo data, simulated sending, billing and AI. No backend, auth, payments or external integrations.

## Run it

```bash
npm install
npm run dev        # http://localhost:3000
```

Checks:

```bash
npx tsc --noEmit   # typecheck
npm run lint
npm run build      # production build
```

State is stored in your browser (`localStorage` key `daybright-demo`). Use **Reset demo** in the workspace sidebar to restore the sample business.

## Where things are

| Experience | Route |
| --- | --- |
| Homepage | `/` |
| Card gallery / detail | `/cards`, `/cards/[id]` |
| AI Card Studio | `/studio` (`?prompt=`), `/app/studio` |
| Natural-language search | `/search?q=` |
| Gifts + Gift Finder | `/gifts`, `/gifts#finder` |
| Consumer send flow | `/send?card=` |
| Business landing / pricing | `/business`, `/pricing` |
| Business onboarding | `/onboarding` |
| Business workspace | `/app` (overview, review, customers, cards, studio, gifts, automations, activity, billing, brand) |
| Recipient experience | `/open?id=demo-card`, `/open?id=demo-gift`, `/open?id=demo-basket`, or any send id |

## Changing brand, pricing and limits

Everything commercial lives in **`src/config/brand.ts`**: brand name, plan names, monthly prices, monthly send limits, feature flags, the consumer one-time card price and the pricing/AI-allowance copy.

## Swapping in real services later

The "AI" is deterministic local logic behind async functions with the shapes a real provider would return:

- `src/lib/ai/studio.ts` — card concept generation and refinement
- `src/lib/ai/messages.ts` — message drafting, rewriting, translation, template tokens
- `src/lib/ai/search.ts` — query interpretation (editable chips) and catalog matching
- `src/lib/ai/gifts.ts` — gift recommendations
- `src/lib/ai/personalize.ts` — per-customer suggestions and annual freshness
- `src/lib/ai/voice.ts` — brand voice presets and summaries

Card artwork is original SVG (`src/components/cards/art/`); headline and message text are always rendered separately so they stay editable.

See `docs/REQUIREMENTS.md` for the brief and `docs/CONVENTIONS.md` for code conventions.
