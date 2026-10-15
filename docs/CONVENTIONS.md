# Daybright prototype — build conventions

Interactive prototype for a birthday card + gifting product (B2C storefront + B2B workspace + recipient experience).
No backend, auth, payments or real AI. Everything is local state (zustand + localStorage) and deterministic "AI" services.

## Stack (read before coding)
- **Next.js 16 App Router with `cacheComponents: true`** (see `node_modules/next/dist/docs/`). Rules that matter:
  - `page.tsx` files should be thin **server components** that export `metadata` and render a `"use client"` component from `src/components/...` or a co-located `*-client.tsx`.
  - Any client component calling `useSearchParams()` MUST be wrapped in `<Suspense fallback={...}>` by its parent page.
  - Do not call `Math.random()`, `Date.now()`, `new Date()` or `uid()` **during render** of anything that prerenders. Do it in event handlers/effects, or render the component inside `<HydrationGate>` (`src/components/hydration-gate.tsx`), which renders only after local state loads. The workspace (`/app/*`) is already wrapped in a HydrationGate by `AppShell`. Public pages that read the store or current dates must wrap that part in `<HydrationGate>` themselves.
  - Dynamic routes: prefer query params (`/open?id=...`) + Suspense. `/cards/[id]` uses `generateStaticParams`.
- Tailwind v4 (tokens in `src/app/globals.css` `@theme`), framer-motion, lucide-react icons, clsx.
- TypeScript strict. Run `npx tsc --noEmit` and fix only errors in files you own.

## Design language
Stationery shop delight + confident business platform. Warm white paper (`bg-paper`), dark ink text (`text-ink`, `text-ink-2`, `text-ink-3`), lines `ring-line` / `border-line`.
Accents: `cobalt` (primary actions), `coral`, `butter`, `mint`, `lilac` — each has `-soft` (backgrounds) and `-deep` (readable text) variants.
- Typography: `font-display` (Fraunces, editorial headlines; use `font-semibold tracking-tight`), body `font-sans` (Instrument Sans), `font-grotesk` (Bricolage, punchy labels/numbers), `font-hand` (Caveat, small handwritten accents — sparingly).
- Big editorial headlines (e.g. `font-display text-5xl sm:text-7xl tracking-tight leading-[0.95]`), generous spacing, asymmetric/playful layouts. Avoid rows of identical feature boxes, avoid big gradients, **no emoji anywhere**.
- Surfaces: `rounded-3xl bg-white ring-1 ring-line` panels; buttons are pill-shaped. Shadows: `shadow-soft`, `shadow-lift`.
- Motion: tasteful, fast; framer-motion respects reduced motion via `MotionConfig reducedMotion="user"`; use `useReducedMotion()` for anything bigger.
- Mobile-first; check 390px width. Visible focus states (global `:focus-visible` is set). Use real `<button>`/`<a>`, labels for inputs.
- Copy: concrete, warm, short. Don't fabricate logos, testimonials, usage numbers or results. Don't claim to be cheapest. Mark simulations only where users might mistake them for real purchases/delivery/billing (use `<SimulatedNote>`). Label AI output with `<AIDemoLabel />` ("Demo example"). Never imply a live AI model.

## Central config & data (do not duplicate values)
- `src/config/brand.ts` — `BRAND.name`, `PLANS`, `getPlan`, `STARTING_PRICE`, `PRICING_COPY` (includes the exact sentence “Your plan includes digital cards. Gift cards, physical gifts, and shipping are additional.”), `CONSUMER.digitalCardPrice`, `money()`. Always render brand name/prices from here.
- `src/lib/types.ts` — all domain types.
- `src/data/cards.ts` (`CARDS`, `CARD_MAP`, label maps, `COLOR_SWATCHES`), `src/lib/cards.ts` (`getCard(id, savedCards)`, `allCards(saved)`, `STUDIO_EXAMPLES`).
- `src/data/gifts.ts` (`GIFTS`, `GIFT_MAP`, `giftPrice`, `GIFT_CATEGORY_LABELS`), `src/data/palettes.ts`, `src/data/seed.ts` (seed state, `emptyDraft()`), `src/data/demo-sends.ts` (`demo-card`, `demo-gift`, `demo-basket` recipient examples).
- `src/lib/store.ts` — `useDemo` zustand store (state + actions: customers, sends, automations, savedCards, draft/placeOrder, approveGift with budget hold, recipient claim/address actions, reset). Read with selectors: `useDemo((s) => s.customers)`.
- `src/lib/selectors.ts` — `usage`, `giftSpendThisMonth`, `upcomingBirthdays`, `plannerSummary`, `customerIssues`, `ruleForCustomer`, `allTags`, `numberWord`.
- `src/lib/dates.ts` — `nextBirthday` (Feb 29 rule), `daysUntil`, `formatBirthday`, `relDays`, `fmtDate`, `fmtDateTime`, `fmtTime`, `TIMEZONES`, `MONTHS`.
- `src/lib/use-send.ts` — `useSend(id)` resolves store sends + demo examples.

## AI service layer (`src/lib/ai/*`) — async functions with simulated latency; swap for real providers later
- `studio.ts`: `briefFromText`, `parseBrief`, `generateConcepts(brief, brandColor)` → 3 `Concept`s, `refineConcept(concept, instruction, brandColor)` → `{concept, changeNote}`, `recolor`, `rewriteHeadline`, `surprisePrompt`, `STUDIO_STYLES`, `TONES`, `OCCASIONS`, `INTEREST_SUGGESTIONS`, `resolvePalette`.
- `messages.ts`: `draftMessages(ctx)`, `rewriteMessage(text, action, ctx)`, `renderTemplate(template, {firstName, companyName, senderName})`, `TOKENS`, `LANGUAGES`, `extractFacts`.
- `search.ts`: `interpret(query)`, `searchSync/search/searchWithChips`, `EXAMPLE_SEARCHES`, types `Chip`, `SearchResults`, `Pairing`.
- `gifts.ts`: `recommendGifts(answers)`, `ENJOY_OPTIONS`.
- `personalize.ts`: `suggestForCustomerSync/suggestForCustomer(customer, business, opts)` (card/message/gift + `reasons` showing source fields), `freshSuggestionsSync(customer, business)`.
- `voice.ts`: `VOICE_PRESETS`, `VOICE_ORDER`, `summarizeVoice`, `sampleMessageForVoice`, `GENERIC_MESSAGE`.

## Shared components
- Cards: `CardFront` (art + separately rendered headline; props `card`, `headline?`, `live?`, `brandMark?`), `CardInside` (message, `font`, `brand`), `MESSAGE_FONTS`, `HEADLINE_FONTS`, `initials` — `src/components/cards/card-art.tsx`. `CardTile` (gallery tile with tilt), `Tilt`, `Envelope` (`stage: "closed"|"open"|"out"`, children = card).
- Gifts: `GiftArt` (`src/components/gifts/gift-art.tsx`).
- AI: `MessageAssistant` (`src/components/ai/message-assistant.tsx`) — embed in any message editor.
- UI: `Button`, `ButtonLink`, `buttonClass` (variants primary|ink|coral|outline|ghost|soft|white|danger; sizes sm|md|lg); `Input`, `Textarea`, `Select`, `Field`, `inputClass`; `Chip`, `Toggle`, `Segmented`, `ChoiceCard` (`controls.tsx`); `Drawer`, `Modal` (`overlay.tsx`); `Badge`, `StatusBadge`, `GiftBadge`, `AIDemoLabel`, `SimulatedNote`, `SEND_STATUS` (`badges.tsx`); `useToast()`.
- Layout: public pages live in `src/app/(site)/` (header/footer provided). Workspace in `src/app/app/` with `AppShell`; use `AppPage`, `PageHeader`, `Panel` from `src/components/app/app-shell.tsx`.

## Route map
Public: `/` home · `/cards` gallery · `/cards/[id]` detail · `/studio` AI Card Studio (`?prompt=`, `?card=` saved id) · `/search` (`?q=`) · `/gifts` catalog + Gift Finder (`#finder`) · `/send` consumer flow (`?card=<id>`, `?gift=<giftId>`) · `/business` · `/pricing`
Focused: `/onboarding` · `/open?id=<sendId>` recipient experience (examples: `demo-card`, `demo-gift`, `demo-basket`)
Workspace: `/app` overview · `/app/review` upcoming birthdays review/approve · `/app/customers` (`?id=` opens detail) · `/app/cards` · `/app/studio` · `/app/gifts` · `/app/automations` · `/app/activity` (`?id=` opens a send) · `/app/billing` · `/app/brand`
