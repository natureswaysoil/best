# Nature's Way Soil — Brand Context (shared by all marketing agents)

Every marketing agent reads this file first. Keep it current: it is the single source of truth
for voice, offers, and claim rules. Live product data lives in `data/products.ts` and
`config/top-products.json`; prefer those over anything copied here.

### Product data precedence
- **`data/products.ts` is canonical** for product names, sizes, prices, SKUs and Amazon ASINs, because it drives the storefront and checkout.
- `config/top-products.json` is canonical only for marketing fields it alone has: priority order, `funnelUrl`, `cta`, `keywords`, b-roll queries.
- When the two files disagree on a shared field (price, size, ASIN or Amazon URL), use the `data/products.ts` value **and flag the conflict** at the top of the report. Never pick silently.
- NWS_014 (dog urine neutralizer) Amazon listing confirmed by the owner on 2026-10-07: ASIN `B0FG38YYJ5` (https://www.amazon.com/dp/B0FG38YYJ5). The older `B0FG38PQQX` is not the live listing; never use it.

## Business
- **Brand:** Nature's Way Soil — family farm making natural fertilizers, soil amendments, biochar and living compost.
- **Site:** https://www.natureswaysoil.com (Next.js, Stripe checkout). Also sold on Amazon.
- **Channels in use:** website + blog, TikTok / Instagram / YouTube Shorts, Pinterest, Amazon, email (Resend), GA4.

## Audiences
1. **Dog owners with lawn spots** — highest-priority funnel (`/dog-urine-lawn-repair`, NWS_014).
2. **Home gardeners** — vegetables, tomatoes, fruit trees, indoor plants; care about chemical-free, pet/family safety.
3. **Lawn owners with compacted / clay soil** — `/compacted-clay-soil`, `/lawn-soil-recovery-system`.
4. **Pasture, hay and horse owners** — `/pasture-hay-farmers`, horse-safe fertilizer.
5. **Landscapers & government buyers** — bulk sizes, `/homeowners-landscapers-government`.

## Core offers
- Save **15% when you buy direct** at checkout (vs. Amazon).
- **30-day returns** on unused products in original packaging (the policy in `pages/terms.tsx`; see Claim rules for wording).
- Multiple sizes (32 oz → 2.5 gal) on most liquids; bundles on the dog-urine line.

## Voice
Helpful, practical, farm-honest. Explain *why it works* (soil biology, humic/fulvic acid, kelp,
microbes, biochar) in plain language. Confident but never hype. Short sentences. Real lawns,
real bottles, natural light — no fake before/afters, no neon-green grass, no robotic stock.

## Claim rules (hard — every agent must follow)
- No instant green-up claims. Results are "over time" as soil and roots recover.
- No **outcome** guarantees: no "cure", "guaranteed fix", "guaranteed green lawn", "100% repair". Use "helps", "supports", "works at the soil level".
- **Return policy wording.** The actual policy (`pages/terms.tsx`, "Returns and Refunds") is: 30-day returns for **unused products in original packaging**; the customer pays return shipping unless the product is defective; some products may not be eligible. Describe it only that way, e.g. "30-day returns on unused products" or "Unopened? Return it within 30 days (see Terms)". Do **not** call it a "guarantee", "satisfaction guarantee" or "money-back guarantee", don't say "no questions asked" or "risk-free", and never tie it to results. If a page already says more than this, flag it as a mismatch with the Terms; don't repeat it.
- No pesticide, herbicide, or medical claims.
- Pet-safe / kid-safe only with "when used as directed".
- Don't say "organic certified" or "OMRI listed" unless the specific product page says so.
- Never invent testimonials, review counts, star ratings, or statistics. Mark any estimate as an estimate.
- Dog-urine line: "not a dye / no green colorants" is true and a key differentiator.

## Hooks that already perform (from `marketing/content-engine/natures-way-soil-content-engine.csv`)
- "Dog pee killing your grass?" · "Your dog is not the problem." · "Stop reseeding your lawn."
- "Fix the root cause instead of covering the spot."
