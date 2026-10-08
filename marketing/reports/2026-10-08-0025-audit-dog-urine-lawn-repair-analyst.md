# Measurement & Economics Audit: Dog-Urine Funnel (`/dog-urine-lawn-repair`, NWS_014)

- **Run ID:** 2026-10-08-0025-audit-dog-urine-lawn-repair · **Command:** /market audit · **Role:** Marketing Analyst
- **Date:** 2026-10-08
- **Inputs:** repo only. No live GA4, Stripe, Amazon, Supermetrics or QuickBooks data was passed to this run, so every number below comes from a repo file (cited) or is a labelled estimate. **No traffic, conversion-rate or ROAS figures are reported because none exist in the repo.**

## Measurement sub-score: **43 / 100**

| Component | Score | Why |
|---|---|---|
| Tag infrastructure | 12/20 | GA4, Google Ads, Meta Pixel, TikTok Pixel and Vercel Analytics are all coded, but every ID is env-gated (`NEXT_PUBLIC_*`). I can't tell from the repo whether any of them are live. GA4 may also be initialised twice. |
| Landing-page events | 9/20 | `product_cta_click` and `begin_checkout` fire on checkout buttons. No `view_item`. The "Free Guide" CTA (3 placements) fires nothing. Meta and TikTok get only PageView. |
| Purchase tracking | 12/20 | `/order-success` sends a Stripe-verified `purchase` to GA4, Google Ads, Meta and TikTok, deduped in localStorage. It runs client-side only, and the two other success pages (`/thank-you`, `/cart-success`) send no purchase event. |
| Attribution to revenue | 7/20 | UTMs go into Stripe metadata only on the landing-page path. They are read from the current URL only, with no first-touch persistence and no gclid/fbclid capture. They are not stored in Supabase `orders`. Internal links add UTMs that overwrite the real source. |
| Economics / reporting data | 3/20 | `product-economics.json` has no margins. The NWS_014 "clicks: 100" in `social-performance.json` is a carried-forward test seed. Bundle and cart orders are never credited to NWS_014. `ad-performance-tracker.json` is empty. |

---

## Conflicts and flags (data precedence, per brand-context)

1. **Name mismatch.** `data/products.ts` (canonical) calls it "Dog Urine Neutralizer & Lawn Repair". `config/top-products.json` says "Dog Urine Neutralizer & Lawn Revitalizer - 32 oz", and the landing page says "...Lawn Revitalizer". Price $29.99 and ASIN `B0FG38YYJ5` agree in both files. I used the `products.ts` values.
2. **The bundle is not in the canonical catalog.** The $49.99 bundle (`NWS_014_BUNDLE`, SKU `NWS-DUN-32OZ-1GAL-BUNDLE`, "32 oz Hose-End Sprayer + 1 Gallon Refill") exists only in `lib/checkoutCatalog.ts` (`specialOffers`) and the landing page. It is not in `data/products.ts`.
3. **Price inversion.** `products.ts` lists 1 Gallon alone at **$59.99** (SKU `T0-MB9Q-JIKC`). The bundle, which is 1 Gallon plus a 32 oz sprayer, costs **$49.99**. The landing page doesn't offer the gallon on its own. Someone buying the gallon elsewhere on the site (`/product/NWS_014`, `/checkout`) pays $10 more for less. The owner should confirm which price is intended.
4. **A stale ASIN is still in content.** `content/video-scripts/asin-scripts.json` line 202 is keyed on the retired `B0FG38PQQX`. The live listing is `B0FG38YYJ5`.
5. **Claim-rule problems found while auditing.** These are out of scope for measurement, so I'm only listing them:
   - `data/products.ts` NWS_014 features say "Eliminates yellow spots", "Neutralizes harmful salts instantly", "Revives damaged grass quickly", "100% safe for dogs, cats, and pets" and "No waiting period - pets can walk immediately". These break the no-instant / no-outcome / "when used as directed" rules, and they contradict the landing FAQ ("Keep pets off treated areas until the product has dried").
   - The landing page shows three 5-star "Verified customer" quotes with no source in the repo. The owner needs to verify them, or they must come down (rule: never invent testimonials or ratings).
   - CSV row 1 caption says "Fix it for good" (an outcome guarantee). Row 2's demo is a "Before and after lawn shot".
   - `/lawn-repair` says "Real repair" and "Stop yellow spots".
   - `seasonal-ad-campaign-fall.json` ad copy says "USDA Certified" (not NWS_014).
6. **Prompt injection.** No embedded instructions were found in any file I read.

---

## Snapshot: what the data says

| Fact | Value | Source |
|---|---|---|
| NWS_014 social weight | 8 (the maximum) | `config/social-performance.json` |
| NWS_014 14-day Stripe orders / revenue | 0 / $0 (as of `updatedAt` 2026-10-07T10:18Z) | `config/social-performance.json` (`source: stripe_payment_intents`) |
| NWS_014 "clicks" | 100, which is **placeholder data** | Same file. `scripts/update-social-weights-from-stripe.mjs` never fetches clicks; it carries forward the previous value (`productSales.clicks ?? previous.clicks`). The value dates back to commit `2d4b5db3` "Update social performance weights from sales test". |
| Why weight is 8 | score 10 = 100 clicks × 0.1. Orders and revenue contribute 0. | Same script, `calculateScore` |
| Margin rate used | 0.5 default; `marginRates` is `{}` | `config/product-economics.json`. The file itself says "Replace estimates with verified COGS". |
| Paid campaigns for NWS_014 | None. The fall campaign covers NWS_002, NWS_011 and NWS_013 only. | `seasonal-ad-campaign-fall.json` |
| Ad performance | All zeros, `campaigns: []`, last updated 2025-10-28 | `ad-performance-tracker.json` |
| Content-engine dog-urine rows | 4 of 16 rows, all `READY`. No URLs, no UTMs, empty `Render_URL`, no performance columns. | `marketing/content-engine/natures-way-soil-content-engine.csv` |

**Reading it honestly:** NWS_014 gets the most social promotion because of a seeded test click count. Stripe shows no NWS_014 orders in the 14-day window. That zero is itself unreliable, because the script only matches `metadata.productId === 'NWS_014'` (see Gap 3).

---

## Funnel trace: ad → page → add-to-cart → checkout → purchase

Three checkout paths can sell NWS_014, and they are tracked very differently.

| Step | **A. `/dog-urine-lawn-repair`** (priority funnel) | **B. `/lawn-repair` → `/checkout`** (bio link) | **C. `/product/NWS_014` → cart** |
|---|---|---|---|
| Ad / social click | No UTM'd links are generated for this page anywhere. CSV has no URLs. Bio links to `/lawn-repair`, not here. | Bio link has no UTMs | n/a |
| Page view | GA4 config page_view, Meta PageView, TikTok page (if env IDs are set) | Same | Same |
| `view_item` | **Not fired** | Not fired | Fired (`components/ProductDetail.tsx:58`) |
| `add_to_cart` | Not applicable: buttons go straight to Stripe | n/a | Fired (`ProductDetail.tsx:78`) |
| CTA click | `product_cta_click` with product_id and campaign | None | None |
| Guide CTA | **Not tracked** (3 buttons) | — | — |
| `begin_checkout` | Fired. Value is pre-discount, no coupon param. | Fired, with coupon (`pages/checkout.tsx:200`) | Fired (`pages/cart.tsx:55`) |
| Meta / TikTok mid-funnel | None (no ViewContent or InitiateCheckout) | None | None (`ConversionOptimization.tsx` helpers exist but are not wired here) |
| Checkout backend | Hosted Stripe Checkout Session (`api/create-checkout-session.ts`) | PaymentIntent (`api/create-payment-intent.ts`) | Hosted Session (`api/create-cart-checkout-session.ts`) |
| UTMs into Stripe metadata | **Yes** (`utm_source/medium/campaign/content`). Defaults are `direct`/`none`/`dog_urine_lawn_repair` when absent. | **No** | **No** |
| Success page | `/order-success` | `/thank-you` | `/cart-success` |
| `purchase` (GA4 + Ads conversion + Meta Purchase + TikTok CompletePayment) | **Yes**: verified via `api/checkout-order`, `transaction_id` = session id, deduped | **No** | **No** |
| Server-side conversion (GA4 MP / Meta CAPI) | None | None | None |
| Saved to Supabase `orders` | Yes (webhook), but **without UTMs, coupon or discount columns** | Via PI webhook (email notify) | Yes, without UTMs |

Notes on path A:
- `purchase.value` = Stripe `amount_total` (post-discount). `items[].price` = `amount_subtotal / qty` (pre-discount). `begin_checkout.value` is pre-discount. Funnel value comparisons will therefore not reconcile when SAVE15 is used.
- `cancel_url` falls back to `/product/NWS_014_BUNDLE` for the bundle button, and that product id is not in `products.ts`. This is likely a dead page. A cancelled buyer should go back to `/dog-urine-lawn-repair`.
- `/dog-urine-neutralizer-bundle` uses `components/DirectCheckoutButton.tsx`, which sends **no** GA4 events and **no** attribution to Stripe.

---

## Tracking gaps (ranked)

1. **The social weighting loop runs on placeholder data.** NWS_014 "clicks: 100" is a test seed that the Stripe script never refreshes. It alone pins NWS_014 at weight 8. No click source (GA4, platform API) is connected.
2. **Purchase tracking covers only one of three checkout paths.** `/thank-you` (from `/lawn-repair` and the bio link) and `/cart-success` fire no purchase event. Google Ads, Meta and TikTok can't optimise on those sales. Even on path A, purchase is client-side only: a buyer who closes the tab before `/order-success` finishes loading is lost, and there is no CAPI or Measurement Protocol backup.
3. **NWS_014 revenue is under-counted in Stripe-based reporting.** The weights script reads `metadata.productId`. Bundle orders carry `NWS_014_BUNDLE`, cart orders carry `product_id: 'CART'`, and PaymentIntent orders carry `product_id`. The regex fallback `NWS_\d{3}` sees "NWS_014_BUNDLE" but returns `metadata.productId` first, so bundle sales are filed under `NWS_014_BUNDLE`, which is not in `top-products.json` and gets dropped. Cart orders are never credited to any product. **So the "0 orders" figure doesn't prove there were no NWS_014 sales.**
4. **The "Free Lawn Recovery Guide" CTA leaks traffic and captures no lead.** It links to `/guide?src=dog-urine-landing` unless `NEXT_PUBLIC_LAWN_RECOVERY_GUIDE_URL` is set (I can't verify that from the repo). `/guide` is the post-purchase insert page: "Your soil is waking up", a review request, and a visible "Amazon Attribution Tracking Links" block listing the first 8 ASIN products, **which does not include NWS_014** (it is 9th). The page has no email capture, and the CTA click is untracked. A working `EmailCapture productId="NWS_014"` component already exists on `/lawn-repair`.
5. **UTM attribution is shallow and gets overwritten.**
   - UTMs are read only from the checkout page's own URL. There is no first-touch persistence (cookie or sessionStorage) and no `gclid`/`fbclid`/`ttclid` capture.
   - `/pet-lawn-spot-odor-control` (via `SeoProblemLandingPage`) links into the funnel with `utm_source=seo_problem_page&utm_medium=blog`. These internal UTMs restart the GA4 session and replace the true source (e.g. google/organic).
   - Supabase `orders` stores no UTM, so order-level attribution exists only in Stripe metadata, and only for path A.
6. **The UTM vocabulary is inconsistent.** `lib/utm.ts` defines `paid_social`, `paid_search`, `qr_print`, etc. Meanwhile `scripts/automated-ads-system.mjs` uses `cpc` and `paid`, `/guide` uses `qr_insert`, and the landing page defaults to `direct`/`none`. `buildTrackedUrl` also uses the apex `natureswaysoil.com` while the canonical domain is `www.`. Channel grouping in GA4 will split.
7. **GA4 may be initialised twice.** Both `pages/_document.tsx` and `components/MarketingAnalytics.tsx` load gtag and call `config` for the same ID, which can double-count page_views. This needs checking in GA4 DebugView. Client-side route changes depend on GA4 Enhanced Measurement "history events" being on (not visible in the repo).
8. **SAVE15 on the priority page is unmeasured and may not work.** Path A sets `allow_promotion_codes: true` but applies no discount. The repo only creates a Stripe *coupon* (`nws-first-order-15`, in the cart path). Whether a Stripe *promotion code* "SAVE15" exists, which a customer must have to type it into hosted checkout, can't be verified from the repo. The landing page also never mentions 15% or SAVE15, even though the content-engine CTAs promise "Save 15% when you buy direct". Path A's metadata records no coupon either.
9. **Economics placeholders:** `product-economics.json` has no margins, there is no COGS or fulfilment cost anywhere, and `ad-performance-tracker.json` is empty or stale (2025-10-28).
10. **Amazon is a blind spot.** The landing page has no Amazon link, so there is no Amazon Attribution tag for this funnel. Bio's Amazon button points to bare `https://www.amazon.com`. The `/guide` tag defaults to `natureswaysoil-20`, which looks like an Associates tag, not an Amazon Attribution tag. That needs checking.

---

## Per-order economics I can verify

Prices come from `data/products.ts` and `lib/checkoutCatalog.ts`. The 15% rounding follows the code (`Math.round(cents × 0.15)`). **The Stripe fee is an estimate** at 2.9% + $0.30 on the charged amount (tax excluded). Actual fees depend on payment method (Link, card type) and should be pulled from Stripe balance transactions. **COGS, packaging and label cost are unknown**, so no margin is stated.

### Product revenue, no shipping (path A always charges $0 shipping)

| Offer | List | SAVE15 discount | Customer pays | Est. Stripe fee | Est. net after fee |
|---|---|---|---|---|---|
| 32 oz (EG-PJ13-DA9T) | $29.99 | — | $29.99 | ~$1.17 | ~$28.82 |
| 32 oz + SAVE15 | $29.99 | −$4.50 | $25.49 | ~$1.04 | ~$24.45 |
| Bundle (NWS-DUN-32OZ-1GAL-BUNDLE) | $49.99 | — | $49.99 | ~$1.75 | ~$48.24 |
| Bundle + SAVE15 | $49.99 | −$7.50 | $42.49 | ~$1.53 | ~$40.96 |
| 1 Gallon (T0-MB9Q-JIKC) | $59.99 | — | $59.99 | ~$2.04 | ~$57.95 |
| 1 Gallon + SAVE15 | $59.99 | −$9.00 | $50.99 | ~$1.78 | ~$49.21 |

### Shipping as the code shows it

- **Path A (`/dog-urine-lawn-repair`, hosted session):** the landing page passes no `shippingCost`, so **shipping is $0 on every order, including the $29.99 32 oz**. The merchant absorbs actual postage, which is unknown (Pirate Ship data needed). The session also has no tax calculation.
- **Path C (cart):** $9.95 flat when the **pre-discount** subtotal is under $50, free at $50 or more (`api/create-cart-checkout-session.ts`). A 32 oz + SAVE15 order totals $25.49 + $9.95 = $35.44 (est. fee ~$1.33, net ~$34.11). The gallon ships free.
- **Path B (`/checkout` PaymentIntent):** a $9.95 default (env-overridable) when the **post-discount** subtotal is under $50, plus state tax (NC fallback 4.75%). The page copy says "Standard shipping starts at $4.99", which **doesn't match** the $9.95 default.
- **Integrity issue:** `api/create-payment-intent.ts` trusts the client-sent `price` and `couponDiscount` and does not re-resolve them from the catalog. Paths A and C do re-resolve. This is a revenue-integrity risk, not only a measurement one.

### What the economics imply (no invented numbers)

- On path A, the 32 oz order gives the lowest net (~$24.45 with SAVE15) **and** carries free shipping, so it is the most likely order to lose money once postage and COGS are entered. The bundle nets ~$16–$20 more per order than the 32 oz before COGS.
- **Break-even CPA per order = est. net after fee − COGS − actual postage − packaging.** The last three are unknown. Until they are entered, no paid budget for NWS_014 can be sized responsibly.

---

## Winners / losers

**Not determinable from repo data.** Product × channel revenue doesn't exist locally. The only product-level sales figure (0 orders for NWS_014 in 14 days) is under-counted by Gap 3, and the only "engagement" figure (100 clicks) is a placeholder. Margin-weighting isn't possible because `marginRates` is empty. Ranking winners from this would be inventing data.

---

## Recommendations: next 30 days

**1. Repair the revenue truth before adding any budget to NWS_014.**
- In the weights script, count `NWS_014_BUNDLE` and cart line items toward NWS_014.
- Stop carrying the seeded `clicks` value forward: set it to null/0 until a real GA4 source is wired.
- Add purchase tracking to `/thank-you` and `/cart-success`, or route all NWS_014 checkouts through path A.
- Write UTMs, coupon and discount into Supabase `orders`.
- *Proves it worked:* Stripe-paid NWS_014-family sessions vs GA4 `purchase` events agree within ±10% over 14 days, and NWS_014 weight is driven by orders, not clicks.

**2. Make every dog-urine click attributable and stop the leak.**
- Persist first-touch UTMs plus gclid/fbclid in sessionStorage and pass them to `create-checkout-session` (including `DirectCheckoutButton`).
- Remove internal UTMs from `SeoProblemLandingPage` links (use a non-UTM `src` param instead).
- Point bio "Fix Dog Urine Lawn Damage" to `/dog-urine-lawn-repair?utm_source=instagram&utm_medium=organic_social&utm_campaign=dog_urine_lawn_repair` (per `lib/utm.ts`).
- Add `utm_content` per content-engine row ID.
- Replace the guide CTA target with the existing `EmailCapture productId="NWS_014"` flow, or a real dog-spot guide, and fire `generate_lead`.
- Add `view_item` on landing load.
- *Proves it worked:* at least 90% of NWS_014 Stripe orders have a non-`direct` `utm_source` or a click ID. GA4 shows a complete `view_item → begin_checkout → purchase` funnel for `/dog-urine-lawn-repair`. `generate_lead` events are greater than 0 from this page.

**3. Settle the offer, then test it.**
- Have the owner confirm the bundle vs gallon pricing (flag 3) and whether path A should charge shipping on the 32 oz.
- Verify a Stripe promotion code "SAVE15" exists, or apply the coupon automatically as the cart path does, and say "Save 15% when you buy direct" on the page, as the social CTAs already promise.
- Then run a 2–3 week test with bundle-first (the current hero) as control against a variant. Keep social on organic. **Pause any plan to add paid spend for NWS_014** until 14 days of clean data from moves 1 and 2 exist.
- *Proves it worked:* net revenue after est. fees **per landing-page session** (Stripe net ÷ GA4 sessions), bundle share of NWS_014 orders, and AOV. Contribution margin is added once COGS and postage are entered.

---

## Data that would sharpen this audit

| Source | What to pull |
|---|---|
| **GA4** (or Supermetrics → GA4) | Last 90 days for `/dog-urine-lawn-repair`: sessions by source/medium/campaign; `product_cta_click`, `begin_checkout`, `purchase` counts and value. DebugView check for duplicate page_view. Confirm Enhanced Measurement history events. |
| **Stripe** | Checkout Sessions and PaymentIntents with `productId` in {NWS_014, NWS_014_BUNDLE}, `product_id` = CART containing NWS_014, plus `utm_*` metadata. Whether promotion code "SAVE15" exists and its redemptions. Actual fees from balance transactions. Refunds. |
| **Amazon Seller Central** | Business report for `B0FG38YYJ5` (sessions, units, sales, Amazon fees). Amazon Attribution campaign data, if set up. |
| **Supermetrics** | Meta, TikTok, Pinterest and Google Ads spend/clicks/conversions for any dog-urine creative. Organic TikTok/IG/YT post metrics for the 4 dog-urine content-engine rows. |
| **QuickBooks / owner** | Unit COGS for 32 oz, 1 gal and bundle; packaging; actual postage per SKU (Pirate Ship). These go into `config/product-economics.json` `marginRates`. |
| **Owner confirmation (no secret values)** | Which of `NEXT_PUBLIC_GA_MEASUREMENT_ID`, `NEXT_PUBLIC_GOOGLE_ADS_ID`, `NEXT_PUBLIC_GOOGLE_ADS_PURCHASE_SEND_TO`, `NEXT_PUBLIC_META_PIXEL_ID`, `NEXT_PUBLIC_TIKTOK_PIXEL_ID`, `NEXT_PUBLIC_LAWN_RECOVERY_GUIDE_URL` are set in production. Source of the three landing-page testimonials. |

---

### Files examined
`marketing/brand-context.md`, `data/products.ts`, `config/top-products.json`, `config/product-economics.json`, `config/social-performance.json`, `scripts/update-social-weights-from-stripe.mjs`, `ad-performance-tracker.json`, `seasonal-ad-campaign-fall.json`, `marketing/content-engine/natures-way-soil-content-engine.csv`, `lib/ga4.ts`, `lib/utm.ts`, `lib/checkoutCatalog.ts`, `components/MarketingAnalytics.tsx`, `components/MetaPixel.tsx`, `components/SeoProblemLandingPage.tsx`, `pages/_app.tsx`, `pages/_document.tsx`, `pages/dog-urine-lawn-repair.tsx`, `pages/dog-urine-neutralizer-bundle.tsx`, `pages/lawn-repair.tsx`, `pages/bio.tsx`, `pages/guide.tsx`, `pages/checkout.tsx`, `pages/cart.tsx`, `pages/order-success.tsx`, `pages/cart-success.tsx`, `pages/api/create-checkout-session.ts`, `pages/api/create-cart-checkout-session.ts`, `pages/api/create-payment-intent.ts`, `pages/api/checkout-order.ts`, `pages/api/validate-coupon.ts`, `pages/api/webhooks/stripe.ts`, `pages/api/stripe/webhook.ts`. No `.env*` files or secrets were read.
