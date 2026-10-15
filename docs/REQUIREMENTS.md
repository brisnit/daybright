# Daybright — product requirements (prototype phase)

Working brand name **Daybright**. Brand name, pricing and plan limits are centrally configurable (`src/config/brand.ts`).
This phase is about visual design, customer journeys, interactions and product clarity. Build the real experience, not wireframes. No auth, Stripe, payments, production infra, or external delivery. Seeded demo data, simulated actions, local persistence.

## Business concept
Daybright helps companies remember customers' birthdays and send thoughtful digital cards automatically, with optional gifts. Business subscriptions start at $39/month with digital cards included; gift cards, baskets and other gifts cost extra. Initial audience: companies with warm relationships. Should feel personal, affordable, easy. The public site also serves consumers sending one card (with or without a gift) without subscribing.
Category references (don't copy, no invented price comparisons, don't claim cheapest): Levitate, Ellacard, Cardsnacks, Kudoboard, Paperless Post Pro, Handwrytten, The Birthday Company.

## Positioning: AI-powered thoughtfulness
An AI-powered celebration studio that helps people create something original and helps businesses make every customer feel remembered. Lead with creativity, personalization and convenience; affordability supports it.
Homepage headline: **Their birthday. / Something only you would send.**
Supporting: “Create an original card, find a thoughtful gift, and make someone’s day. For one person or every customer you serve.”
Primary CTA **Create a card with AI** · Secondary CTA **Explore business plans** · visible **Search cards & gifts** entry · clearly visible **Explore business demo** action (opens populated workspace, no login).

AI prototype scope: convincing interactive AI using curated outputs + local simulation. Varied results responding to style, occasion, recipient, tone. Label generated previews as demo examples; never imply a live model. Services are behind reusable functions (`src/lib/ai`).

## Design direction
Stationery-shop delight + modern business platform confidence. Modern, cheerful, thoughtful, polished. Bright colors balanced with warm white and dark ink; cobalt, coral, butter yellow, mint, lilac. Strong typography, generous spacing, playful editorial layouts. Rounded cards/buttons with controlled depth. Beautiful original card artwork with different styles. Professional dashboard in the same brand. Avoid generic SaaS, excessive gradients, endless identical feature cards, emoji identity.
Animation: envelope opening to reveal a card; gentle card tilts/hover; smooth transitions between personalization steps; small celebration after a simulated send; delightful recipient reveal. Respect reduced motion. Fast and usable on mobile.

## 1. Homepage (consumers + business)
- Animated card-and-envelope hero composition
- “Business plans from $39/month”; digital cards included, gifts optional extras
- Shoppable selection of cards; gift section (gift cards, baskets, treats, flowers)
- Simple business workflow: add customers, choose a card, set it to celebrate
- Visual preview of the business dashboard; pricing preview; FAQs; strong final business CTA
- Section **From “they love gardening” to “you absolutely nailed it.”** demonstrating: 1 a short idea → 2 three original concepts → 3 a personalized message → 4 an optional matching gift → 5 the finished recipient experience; include a working embedded sample that opens the Card Studio.
- Business section **One brand. Hundreds of personal moments.** — three customers receiving different cards/messages, all in the same business voice.
- Concrete copy. No fabricated logos/testimonials/numbers/results. No unsupported revenue/retention/emotional-impact promises.

## 2. Card collection
Filters: Style (playful, elegant, minimal, bold, heartfelt), Recipient (customer, colleague, friend, family), Format (animated/static), Color. 14 seeded cards. Selecting a card opens detail + personalization flow. Card Studio accessible from gallery.

## 3. Consumer sending flow
Choose card → Personalize → Add optional gift → Delivery → Review → Confirmation (editable, step transitions animated).
- Personalize: recipient name, sender name, message, font/message style, live preview. AI Message Assistant inside the editor.
- Gift: prominent “Just the card”; gift cards with selectable amounts; curated physical gifts; clear separate prices.
- Delivery: recipient email; send now or schedule; optional time. Physical gifts: option to let the recipient enter their own address.
- Review: card preview, recipient + delivery details, itemized costs, edit links, clearly labeled simulated checkout. Example one-time digital card price $4.99 (config) and note that consumer pricing is provisional demo pricing. No real payment details.
- Confirmation: scheduled/sent status, view recipient experience, send another card. Small celebratory moment.
- Optional extras on selected cards: animated reveal, short recorded greeting (simulated), group signature page, small photo-memory layout from user-selected demo images. Optional; a simple card must feel complete. No generated voices/impersonation/automatic personal photos.

## 4. Business pricing
Starter $39 (100 sends/mo, collection, scheduling+automation, CSV import, logo+signature, gifts separate) · Growth $79 (300, + segments, gift budget controls, multiple rules) · Scale $149 (1,000, + team members, multiple brand profiles, expanded reporting). Placeholders. Unmistakable: **Your plan includes digital cards. Gift cards, physical gifts, and shipping are additional.** No fake annual savings or unrequested fees. AI: show card creation + message assistance as value; mark allowances “Included in this demo; launch limits to be finalized.”; don't promise unlimited image generation; AI allowances separate from card-send allowance; gifts/shipping separate.

## 5. Business onboarding
1 Select plan · 2 Business name, logo, brand color · 3 Add customers manually / import CSV / load demo customers · 4 Pick default card and personalize message · 5 Configure birthday automation · 6 Review and activate demo. Skippable optional steps; enter the workspace. Message tokens: First name, Company name, Sender name with real rendered example next to the template.
**Brand Voice** during onboarding: three tone choices, short writing sample, phrases to use, phrases to avoid, preferred sign-off; presets Warm and neighborly / Polished and professional / Playful and upbeat / Calm and understated; generate editable brand-voice summary + sample birthday message; live before-and-after preview; voice applies to card messages and suggestions.

## 6. Business dashboard
Seeded fictional business (Harbor & Pine Realty). Birthdays coming up, cards scheduled, cards sent this month, remaining allowance, gift spend this month, recent activity, automation status. Obvious next action: “Three customers have birthdays next week. Review their cards.” Mix of customers: upcoming birthday, scheduled card, missing birthday, card-only rule, gift requiring approval.
**Celebration Planner** panel: “You have 18 birthdays coming up. Twelve cards are ready, four customers need birthday details, and two gift suggestions need approval.” Direct actions: Review ready cards, Complete missing details, Review gift suggestions, Create a seasonal card collection. Uses live local state, changes as tasks complete. Actionable, not decorative chat.
Nav: Overview, Customers, Cards, Gifts, Automations, Activity, Plan & billing, Brand settings (+ Review birthdays, Card Studio). Every destination meaningful.

## 7. Customer management
Search, filters, table, add/edit drawer, customer detail view, CSV import preview with column mapping, demo import option. Fields: first/last name, email, birthday month/day, optional year, company, tags, relationship notes, card + gift preferences. Don't require birth year. Validation: missing email, invalid dates, duplicates, missing birthdays. CSV import local-only; review sample rows and resolve basic errors first.
**Annual Freshness** on a customer profile: show previous cards + messages; suggest a fresh design + new wording for next birthday using prior send history to explain. Automation setting **Avoid repeating last year’s card**.

## 8. Birthday automation
Rule editor: segment, card, message template, send time + timezone, card only or optional gift, gift amount/product, monthly gift budget, automatic vs review before sending. Default card-only; gifts explicitly enabled. Plain-language summary e.g. “Send every customer a birthday card at 9:00 AM in the selected timezone. Include a $15 gift card for VIP customers, subject to approval and the monthly gift budget.” Demonstrate: pause/resume, skip one birthday, edit an upcoming send, preview next recipients, gift budget reached, customer added after their birthday, Feb 29 handling (clear editable default). If gift spend reaches budget: hold gift for review, keep card scheduled, explain in UI. Original AI artwork must be approved before it can be used in an automated rule (reusable approved designs).

## 9. Gift catalog
Coffee gift card, flexible digital gift card, artisan snack basket, chocolate box, flowers, wellness set (+ extras). Fictional merchants. Show product/amount, price, digital/physical, delivery expectations, address required, shipping cost. Illustrative. Card-only sending must feel complete and valuable.
**Thoughtful Gift Finder**: compact guided flow — who is it for, what do they enjoy, total budget, digital or physical, when must it arrive. Three recommendations with reasons + transparent totals. Never add/approve/spend automatically. Unknown preferences → flexible option with explanation.

## 10. Activity & reporting
Records: scheduled, sent, opened, gift claimed, awaiting address, needs attention. Inspect individual sends, open recipient preview, simulate resend. Demo data; don't imply real tracking.

## 11. Recipient experience (major)
Mobile-first: “A little birthday something from [Business]”, tap to open envelope, beautiful card reveal, personalized message, sender branding, optional gift reveal. Digital gift: simulate claim. Physical: simulate entering delivery address + confirmation. Card-only and card-with-gift examples. Warm and focused; no aggressive sales prompts before enjoying the card. Supports optional extras (recorded greeting simulated, group signatures, photo memories, animated reveal).

## 12. Brand & plan settings
Brand: business name, logo upload preview, brand color, default signature, default message, live card preview, Brand Voice editor with updated message suggestions preview. Plan & billing: current plan, monthly usage, plan comparison, simulated upgrade/downgrade, separate subscription and gift spending summaries; AI allowance note. Billing actions clearly demo.

## AI features
1. **AI Card Studio** (flagship; from homepage, gallery, workspace): start from a sentence (e.g. “Create a birthday card for a customer who loves gardening. Colorful, warm, and a little funny.”); guided controls: occasion, recipient/relationship, interests, visual style (Bold typography, Editorial illustration, Watercolor botanicals, Playful collage, Retro celebration, Elegant minimalism), color palette, tone, optional business branding. Three distinct concepts. Select, refine with follow-up instruction (“Less formal.” “Make it more botanical.” “Use our brand colors.” “Keep the artwork, change the headline.”), change colors, rewrite headline, edit message, Save to My Cards, Send now, Use as a business automation template. Card text editable and separate from artwork. Polished generation sequence with progress messages; reduced motion. “Surprise me”.
2. **Natural-language search** across cards and gifts with editable interpretation chips (Birthday, Elegant, Customer, Under $40, Digital delivery); results grouped Cards / Gifts / Card + gift pairings with short concrete reasons and itemized pairing totals that show shipping and whether it's included in budget; weak results → **Create a card from this idea**. Examples: “A sophisticated birthday card for a longtime real estate client.” “Something funny for a coworker who loves coffee.” “A gardening gift under $40.” “A cheerful card and chocolate gift under $30.” “An elegant card in our company colors.”
3. **AI Message Assistant** in the editor (draft from notes, warmer/shorter/playful/professional/remove sales/translate; 3 tone options; editable; “What would make this feel personal?”; only supplied facts; business defaults warm, brief, no pitch).
4. **Business Brand Voice** (onboarding + brand settings).
5. **Personalization Preview** for businesses: suggestions (card style, message, optional gift) from interests/notes/tags with source shown (“Suggested because this customer’s interests include gardening.”); no context → thoughtful general message; review screen for several recipients: preview each, edit message, regenerate one, approve selected, apply shared template, switch off AI personalization.
6. **Thoughtful Gift Finder** (above). 7. **Celebration Planner** (above). 8. **Annual Freshness** (above). 9. **Recipient delight** extras (above).

## Demo journeys that must work end to end
1. Homepage → card → personalize → optional gift → schedule → confirmation → recipient reveal
2. Homepage → business plan → onboarding → populated dashboard
3. Dashboard → customer → birthday automation → review scheduled card and gift
4. Homepage → describe a card → compare three concepts → refine → personalize → optional gift → simulated send → recipient reveal
5. Search “gardening gift under $40” → inspect interpreted filters → choose a pairing → review total
6. Dashboard → review upcoming birthdays → inspect AI suggestions + source notes → edit one → approve selected cards
7. Brand settings → change voice → preview updated message suggestions
8. Customer profile → inspect last year’s card → choose a fresh suggestion
Also: browse/filter cards, add/remove gift, simulated checkout, add/edit customer, import demo customers, configure + pause automation, approve a gift, change demo plan, open recipient experience. No dead-end primary actions.
