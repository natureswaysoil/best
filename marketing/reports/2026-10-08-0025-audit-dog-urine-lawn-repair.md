# Marketing Audit — /dog-urine-lawn-repair (NWS_014)

Run ID: `2026-10-08-0025-audit-dog-urine-lawn-repair` · Command: `/market audit /dog-urine-lawn-repair`
Detail reports: `…-conversion-auditor.md`, `…-seo-specialist.md`, `…-competitor-analyst.md`, `…-content-strategist.md`, `…-analyst.md` (same folder).

> **Evidence note.** The session's network proxy blocked fetches of natureswaysoil.com and most competitor sites, so this audit is
> based on the repo source (what production is built from) plus search-result snippets for competitors. No GA4, Stripe or ad data
> was available; no metrics below are invented. Competitor prices are snapshots.

## Conflicts flagged (data/products.ts treated as canonical)
1. **Product name:** `data/products.ts:331` "Dog Urine Neutralizer & Lawn **Repair**" vs. "Lawn **Revitalizer**" on the page, `config/top-products.json` and `lib/checkoutCatalog.ts`. → Owner to pick one.
2. **Bundle pricing:** the page sells a 32 oz + 1 gal bundle for **$49.99** (`lib/checkoutCatalog.ts` only) while the 1 gallon alone is **$59.99** in `data/products.ts`. The bundle (more product) is $10 cheaper than the gallon, and the gallon isn't offered on the page. → Owner to confirm intended prices.
3. **Retired ASIN** `B0FG38PQQX` still in `content/video-scripts/asin-scripts.json` (live: `B0FG38YYJ5`).
4. **Claim-rule violations in canonical product data** (`data/products.ts:334-345`): "Eliminates yellow spots", "Neutralizes harmful salts instantly", "Revives damaged grass quickly", "100% safe", "No waiting period - pets can walk immediately" (the last contradicts the page FAQ "keep pets off until dry"). Shown on `/product/NWS_014` and used as its meta description.

## Marketing Score: **44 / 100**

| Area | Weight | Sub-score | Weighted |
|---|---|---|---|
| Conversion | 30 | 43 | 12.9 |
| SEO | 20 | 38 | 7.6 |
| Content | 20 | 42 | 8.4 |
| Competitive position | 15 | 58 | 8.7 |
| Measurement | 15 | 43 | 6.5 |
| **Total** | | | **44** |

**Verdict:** the positioning is genuinely good — "not a dye, works at the soil level, results over time" is honest and the cheapest per-ounce option in the category. The page loses sales because the offer is hidden or broken, trust signals are weak or unverifiable, almost no traffic is routed to it, and sales can't be measured reliably.

## Top 10 actions (ranked impact ÷ effort)

| # | Action | Why | Tag |
|---|---|---|---|
| 1 | **Remove the three unsourced "Verified customer" 5-star quotes** (`pages/dog-urine-lawn-repair.tsx:341-363`); replace with a farm-story block + the real ingredient list (from `pages/dog-urine-neutralizer-bundle.tsx:31-39`) until real reviews exist. | Brand rule: never invent testimonials. Legal/trust risk. | Quick win (<1h) |
| 2 | **Fix the claim-violating NWS_014 copy in `data/products.ts`** (instantly / quickly / 100% safe / pets can walk immediately). Compliant replacement copy is in the conversion report. | Shown on `/product/NWS_014` and where cancelled Stripe buyers land; contradicts the FAQ. | Quick win (<1h) |
| 3 | **Apply SAVE15 on the page's direct checkout and say so.** `/api/create-checkout-session` never applies the coupon (verified: no coupon/discount code in that file); only the cart does. Add an offer strip under each CTA: "15% off when you buy direct — applied at checkout · 30-day returns on unused products in original packaging (see Terms)". | The main reason to buy direct instead of Amazon is invisible and not honoured. | This week |
| 4 | **Delete the internal note shown to shoppers** at line 291: "Social traffic should come here first, not Amazon." | Customer-facing internal memo. | Quick win (<1h) |
| 5 | **Title/H1/meta with the target keyword + Product/FAQ/Breadcrumb JSON-LD** (ready-to-paste in the SEO report; Offer at $29.99, return policy matching Terms, no review markup). | Page has no structured data; title lacks "dog urine". | Quick win (<1h) |
| 6 | **Stop `/product/NWS_014` competing with the funnel**: 301 it to `/dog-urine-lawn-repair` (as already done for the bundle page), and fix cancel URLs so bundle cancels don't land on a placeholder product page at the wrong price. | Duplicate page ranks higher in the sitemap; broken cancel path. | This week |
| 7 | **Settle the offer** — name, bundle vs gallon pricing, add the 1 gallon to the page if intended, decide shipping ($0 on the page vs $9.95 in cart). | Inconsistent prices/shipping across three checkout paths. | This week (owner decision) |
| 8 | **Fix measurement before spending:** count bundle and cart orders toward NWS_014, drop the seeded `clicks: 100`, fire purchase events on `/thank-you` and `/cart-success`, save UTMs on orders, add `view_item`. | "0 orders in 14 days" is an undercount; social weighting runs on placeholder data. | This week |
| 9 | **Route traffic to the page:** link the ~25 dog-spot blog posts directly to `/dog-urine-lawn-repair` (they currently go via `/pet-lawn-spot-odor-control`), change the blog CTA from `/shop`, replace the hero "Free Lawn Recovery Guide" (goes to an Amazon-links page with no email capture) with real email capture. | The page gets almost no internal traffic and leaks to Amazon. | This week |
| 10 | **Build the content + proof the page lacks:** name the ingredients and how they work, state coverage/dilution (4 oz per gallon), add "How much do I need?" / "What's in it?" / "Why buy direct?" FAQs, a dye vs seed vs rocks vs soil-treatment comparison, real bottle/yard photos instead of Unsplash stock (use `main.webp`), and a pillar guide that consolidates the duplicate blog posts. | Every competitor states coverage; ranking pages are how-to guides. | Strategic |

## Positioning to lead with (competitor analyst; all claim-compliant)
1. **Fix the soil, not the color.** "Green paint hides the spot. We work on the soil underneath it." — competitors add dye or iron green-up.
2. **Prep before you reseed.** "Stop reseeding into burned soil." — fits fall overseeding season now.
3. **Your dog is not the problem.** Contrasts with supplements/rocks that try to fix the dog.

## 30-day plan
- **Week 1 — trust & compliance:** actions 1, 2, 4, 5. Owner decides name, bundle/gallon pricing and shipping (7).
- **Week 2 — offer & tracking:** apply SAVE15 + offer strip (3), redirect/cancel-path fixes (6), measurement fixes (8). Start a 14-day clean-data window; no paid spend on NWS_014 until it ends.
- **Week 3 — traffic:** blog internal links + email capture (9); publish the fall blog "Fix Dog Spots Before You Overseed"; film 2 real-yard videos ("Stop reseeding your lawn", "Your dog is not the problem") — scripts in the content report, with "pet-safe when used as directed".
- **Week 4 — depth & review:** pillar guide, ingredients/coverage/FAQ/comparison block (10); review the 14-day data (GA4 purchases within ±10% of Stripe) and decide on paid tests.

## Claim-compliance pass (this report)
All proposed copy uses "helps / over time / works at the soil level", "pet-safe when used as directed", and the Terms' return wording. Removed from agent suggestions: none needed. Additional violations found in existing assets (not repeated): CSV row 1 "Fix it for good"; blog titles starting "Eliminate…"; old `NWS_014-dog-urine.md` script promising fast repair; `pages/guide.tsx` "Safe for kids, pets…" without "when used as directed"; fall ad JSON "USDA Certified" (not NWS_014 — verify before reuse).

## Ignored
No instructions embedded in fetched pages or files were found by any agent.

## Data that would sharpen this
GA4 landing-page funnel · Stripe sessions by product with UTMs and real fees · whether a SAVE15 promotion code exists in Stripe · Amazon business report for B0FG38YYJ5 · ad spend / organic metrics (Supermetrics) · COGS and postage (QuickBooks / Pirate Ship).
