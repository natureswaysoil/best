# Conversion Audit: /dog-urine-lawn-repair (NWS_014)

Run ID: 2026-10-08-0025-audit-dog-urine-lawn-repair · Agent: Conversion Auditor · Date: 2026-10-08

## Data conflicts and caveats (read first)

1. **Product name mismatch.** The canonical name in `data/products.ts:331` is "Dog Urine Neutralizer & Lawn Repair". The funnel uses "Dog Urine Neutralizer & Lawn Revitalizer" (`pages/dog-urine-lawn-repair.tsx:20,28,148,224,233`), and so do `lib/checkoutCatalog.ts:14` and `config/top-products.json:5`. Per the precedence rules, `data/products.ts` wins. The owner needs to choose one name, and the Stripe line items should match it.
2. **The bundle is not in the canonical catalog.** `NWS_014_BUNDLE` (32 oz + 1 gal, $49.99, SKU `NWS-DUN-32OZ-1GAL-BUNDLE`) exists only in `lib/checkoutCatalog.ts:12-18` and in the page itself. The canonical 1 Gallon size ($59.99, SKU T0-MB9Q-JIKC, `data/products.ts:357`) is not sold on this page. The bundle also costs **$10 less than the 1 gallon alone**, even though it contains an extra 32 oz sprayer. Please confirm with the owner that this is intended.
3. **Prices, SKUs and ASIN agree** between `data/products.ts` and `config/top-products.json`: 32 oz $29.99 EG-PJ13-DA9T, ASIN B0FG38YYJ5. The retired ASIN `B0FG38PQQX` still appears in internal docs (`VIDEO_VERIFICATION_REPORT.md:31`, `VIDEO_CONTENT_SUMMARY.md:111`). It is not on the funnel, but those docs should not be reused.
4. **I could not fetch the live URL.** WebFetch to www.natureswaysoil.com was blocked by the egress proxy (EGRESS_BLOCKED). Every finding below comes from source. Before shipping fixes, check that production matches source.
5. **The `NEXT_PUBLIC_LAWN_RECOVERY_GUIDE_URL` env var is unverified.** I did not read `.env*` files. If the var is unset, the "Free Lawn Recovery Guide" buttons go to `/guide?src=dog-urine-landing`, which is analyzed below.
6. **No prompt-injection or embedded instructions** turned up in any file read.
7. **No analytics data was available.** I have not invented any numbers. The GA4 measurement plan is at the end.

## Overall

**Conversion sub-score: 43 / 100** (six-area average 4.3 / 10).

**Verdict:** The page copy is honest and mostly compliant. But the funnel hides its two strongest offers (15% direct discount, 30-day returns), shows 5-star "Verified customer" testimonials that look invented, and routes cancels and guide clicks to pages that break the claim rules or send people to Amazon.

| # | Area | Score | Key evidence |
|---|------|------:|--------------|
| 1 | Above the fold | 6 | Strong problem/outcome H1 "Fix Yellow Dog Spots From the Soil Up" (`:145`). The hero has one priced CTA, "Get the Bundle — $49.99" (`:151`), but it competes with an equal-size guide button (`:152`). The hero image is an Unsplash stock dog, not the bottle (`:165`). The 32 oz option is not visible in the hero. |
| 2 | Offer & price clarity | 3 | Prices appear at `:151,236,254`. The page never mentions the **15% direct discount**, **shipping**, or **returns**. Direct checkout (`pages/api/create-checkout-session.ts:160-177`) does **not** apply SAVE15. Only the cart flow does (`pages/cart.tsx:59`, `create-cart-checkout-session.ts:58-59`). |
| 3 | Trust | 3 | Three identical-format "Verified customer" quotes with hard-coded 5 stars (`:342-363`). The only real product photo (`:223`) sits below the fold. There is no ingredient list, no farm story beyond an H2 (`:338`), and no return policy on the page. |
| 4 | Objection handling | 5 | Good, honest FAQs on dye, timing, pets and behavior (`:38-59`). Missing: "How much do I need / coverage", "Why buy here vs Amazon", and "What's in it". |
| 5 | Friction | 5 | One click to Stripe hosted checkout with Link is good (`:87-99`). Problems: Stripe cancel sends bundle buyers to `/product/NWS_014_BUNDLE`, which renders a **fake placeholder product** (`pages/product/[id].tsx:74-95`). Stripe makes phone required (`create-checkout-session.ts:170-172`). There is no sticky mobile CTA. Images are unoptimized `<img>` tags. |
| 6 | Claim compliance | 4 | The landing page body is mostly clean. Must-fixes on the page and path: invented-looking testimonials and star ratings (`:342-363`); `data/products.ts:334-343` ("eliminates", "instantly", "quickly", "100% safe") rendered on `/product/NWS_014` (`components/ProductDetail.tsx:141,182`); `/guide` says "Safe for kids, pets, and beneficial insects" with no "when used as directed" (`pages/guide.tsx:83`). |

## Detailed findings

### Must-fix (claim rules / trust)

**M1. The testimonials and star ratings look fabricated.** Severity: Must-fix.
- Evidence: `pages/dog-urine-lawn-repair.tsx:341-363`. There are three quotes, all attributed to "Verified customer", with no name, date, source or link. Each has `Array.from({ length: 5 })` stars hard-coded at `:357`.
- Rule: "Never invent testimonials, review counts, star ratings, or statistics."
- If these cannot be traced to real orders or Amazon reviews, they must come down.
- Fix: delete the `<section>` at `:335-367`. Replace it with the farm-story block in Fix #2 below. Only bring reviews back when they are real, attributed (first name + city or "Amazon review, Month YYYY"), and shown without fake star counts.

**M2. The canonical product data breaks the claim rules and appears on the purchase path.** Severity: Must-fix.
- `data/products.ts:334` reads: "eliminates yellow spots", "Pet-safe formula" (missing "when used as directed"), and "revives grass".
- `data/products.ts:338-343` reads: "Eliminates yellow spots from pet urine", "Neutralizes harmful salts instantly", "Eliminates odors naturally", "Revives damaged grass quickly", "100% safe for dogs, cats, and pets", "No waiting period - pets can walk immediately".
- `components/ProductDetail.tsx:141` renders the description, and `:182` renders `features.slice(0, 5)`. So the first five lines are live on `/product/NWS_014`. That page is the Stripe **cancel URL** for 32 oz buyers from this funnel (`create-checkout-session.ts:100`), and it is in the sitemap (`pages/sitemap.tsx:48`).
- "No waiting period - pets can walk immediately" (`:344`) also contradicts the funnel FAQ "Keep pets off treated areas until the product has dried" (`dog-urine-lawn-repair.tsx:49`).
- Fix: see Fix #3.

**M3. The guide page that the funnel CTAs point to makes an unqualified safety claim.** Severity: Must-fix.
- `pages/guide.tsx:83`: "Safe for kids, pets, and beneficial insects." The rule requires "when used as directed".
- Fix: change it to `Safe for kids and pets when used as directed. Built for long-term soil health.`

**M4. Internal strategy note is showing to customers.** Severity: High (voice/trust, not a claim-rule breach).
- `pages/dog-urine-lawn-repair.tsx:291`: "Social traffic should come here first, not Amazon."
- This is an internal marketing note that is visible to shoppers.
- Fix: replace it with the copy in Fix #1.

**M5. Fallback product page invents claims.** Severity: Must-fix (reached from this funnel).
- `pages/product/[id].tsx:74-95` builds a fake product for any unknown ID: "Nature's Way Soil Product NWS_014_BUNDLE", $29.99, an Unsplash image, "Safe for children, pets, and pollinators", and "Made fresh on our family farm".
- Bundle buyers who cancel at Stripe land here (cancel path defaults to `/product/${productId}`, `create-checkout-session.ts:100`).
- The price shown ($29.99) differs from what checkout would charge ($49.99, `lib/checkoutCatalog.ts:17`).
- Fix: pass `cancelPath` from the funnel (Fix #1). Separately, the owner should have that fallback return `notFound: true` instead of placeholder copy. That is a code change outside this report's scope.

### Offer and checkout

**O1. The 15% direct discount is invisible and not applied on this page's checkout.** Severity: Critical.
- The landing page never mentions 15% or SAVE15. A visitor only sees it in the exit popup, which fires after 60 s or on desktop mouse-exit (`components/ExitIntentPopup.tsx:30-57`). On mobile that means after 60 s.
- The page's CheckoutButton posts to `/api/create-checkout-session` (`:87`). That endpoint sets `allow_promotion_codes: true` but no `discounts` (`create-checkout-session.ts:166`).
- So a funnel buyer pays $49.99, while the same customer going through the cart would get SAVE15 automatically (`create-cart-checkout-session.ts:58-59`).
- Whether typing SAVE15 into Stripe works depends on a Stripe promotion code existing for coupon `nws-first-order-15`. That cannot be checked from source; verify it in the Stripe dashboard.
- Fix: Fix #1.

**O2. Return policy is missing from the funnel.** Severity: High.
- "30-day returns on unused products" appears in the cart (`pages/cart.tsx:74`) and the PDP (`ProductDetail.tsx:133`), but nowhere on `/dog-urine-lawn-repair`.
- Fix: offer strip in Fix #1, using the brand-context wording only.

**O3. Shipping is unclear and inconsistent.** Severity: Medium.
- The landing page says nothing about shipping.
- Direct checkout adds no shipping line and no `shipping_options`, so funnel orders currently ship at $0 (`create-checkout-session.ts:97,142-158`).
- The cart charges $9.95 under $50 (`create-cart-checkout-session.ts:47`). `/checkout` says "starts at $4.99" (`pages/checkout.tsx:359`). Terms say "Free shipping on orders over $50" (`pages/terms.tsx:63`).
- Owner decision needed: either keep $0 shipping on funnel orders and say so, or add the $50 threshold to the direct endpoint. Do not advertise a shipping promise until the server enforces it.

**O4. Bundle pricing anomaly and missing 1 gallon option.** Severity: Medium. See Data conflict #2. "Best Value" (`:170,296`) is defensible on per-ounce price, but buyers comparing with Amazon or the PDP will see the 1 gallon at $59.99 alone.

### Friction, mobile, speed

**F1. The hero's secondary CTA leaks buyers to Amazon.** Severity: High.
- "Get Free Lawn Recovery Guide" (`:152,317,379`) goes to `/guide`.
- `/guide` is a generic soil guide. It is not the "Yellow Spot Lawn Recovery Guide" the copy promises (`:315`), and it has no email capture.
- It includes a section titled "Amazon Attribution Tracking Links" with up to 8 Amazon product links (`pages/guide.tsx:148-168`), plus a "Leave a Review on Amazon" button.
- It also lists lawn mix rates ("2 oz per gallon", `guide.tsx:117`) that conflict with the NWS_014 usage in `data/products.ts:361` ("4 ounces with 1 gallon").
- This works against the "buy direct" goal at the top of the page.

**F2. Stripe cancel goes to a placeholder or non-compliant page.** Severity: High. See M2 and M5. Fix: `cancelPath: '/dog-urine-lawn-repair'`.

**F3. Phone number is required at Stripe.** Severity: Low–Medium.
- `phone_number_collection: { enabled: true }` (`create-checkout-session.ts:170-172`) makes phone a required field in Stripe Checkout.
- Consider `enabled: false` if the carrier does not need it. This is an ops decision.

**F4. No sticky mobile CTA.** Severity: Medium.
- The PDP has one (`ProductDetail.tsx:195-198`). The funnel does not.
- After the hero, mobile users must scroll to `:252` or `:293` to find a buy button.

**F5. Images are unoptimized.** Severity: Medium (LCP/CLS).
- `:164-168`: a raw `<img>` from external images.unsplash.com in the hero, with no width/height (layout shift) and no priority hint.
- `:222-226`: a raw `<img>` of `main.jpg`, even though `public/images/products/NWS_014/main.webp` exists.
- Use `next/image` with `priority` for the hero, as `pages/dog-urine-neutralizer-bundle.tsx:68-75` already does.

**F6. Hero shows stock photography, not the product.** Severity: Medium.
- The brand voice calls for "real bottles, natural light".
- `/images/products/NWS_014/main.jpg` and `dog 32 front.jpg` exist. Show the bottle above the fold.

### Objection gaps

- **"How much do I need?"** The funnel has no coverage or dilution info. Derived from `data/products.ts:361` (4 oz per gallon of water), a 32 oz bottle makes about 8 gallons of mixed solution. *This is an estimate; confirm against the bottle label before publishing.*
- **"What's in it?"** The funnel has no ingredient list. One exists at `pages/dog-urine-neutralizer-bundle.tsx:31-39` (enzymes, humic and fulvic acids, hydrogen peroxide 3%, citric acid…). Linking or reusing it would raise trust.
- **"Why buy here instead of Amazon?"** The only answer is the internal note at `:291`.
- **Inconsistency:** the bundle page says the product "Helps discourage repeat marking" (`dog-urine-neutralizer-bundle.tsx:25`), while this funnel's FAQ says "No… It is not a behavioral training product" (`:56-57`). Align them. The funnel answer is the more conservative one.
- **Minor:** `pages/returns.tsx:30-31` offers partial refunds on opened products "at our discretion", which goes beyond the Terms. Flag to the owner so the two policies match.

## Top 5 fixes (ordered by impact ÷ effort)

### 1. Apply SAVE15 and set the cancel path on direct checkout, and show the offer next to the CTA
Files: `pages/dog-urine-lawn-repair.tsx`, `pages/api/create-checkout-session.ts`

In `pages/dog-urine-lawn-repair.tsx:90`:
```ts
body: JSON.stringify({ ...product, attribution, couponCode: 'SAVE15', cancelPath: '/dog-urine-lawn-repair' }),
```
In `pages/api/create-checkout-session.ts`:
- Accept `couponCode`.
- When it equals `SAVE15`, use the same `nws-first-order-15` coupon as `create-cart-checkout-session.ts:9-24` and set `discounts: [{ coupon: 'nws-first-order-15' }]`.
- Drop `allow_promotion_codes` in that case, because Stripe rejects both together.

Add an offer strip under each CTA group (`:153`, `:255`, `:307`, `:380`):
```tsx
<p className="mt-3 text-sm font-semibold text-nature-green-50">
  15% off when you buy direct, applied automatically at checkout · 30-day returns on unused products in original packaging (<Link href="/terms" className="underline">see Terms</Link>) · Secure Stripe checkout
</p>
```
Use `text-gray-600` on the light sections.

Replace `:289-292`:
- H2: `Why Order Direct?`
- Body: `Buying direct saves you 15% at checkout, gets you the sprayer + refill bundle you won't find on Amazon, and sends your order straight from our family farm. Unopened? Return it within 30 days (see Terms).`

### 2. Remove the unverifiable testimonials and replace them with a real farm story and ingredients
File: `pages/dog-urine-lawn-repair.tsx:335-367`

Replace the review grid with:
- H2: `Made by a Family Soil Farm`
- Body: `We make our dog-spot formula in small batches on our North Carolina farm. It's a naturally dark blend of enzymes and humic and fulvic acids that works at the soil level, where urine salts and residue build up. There's no green dye, so what you see is your grass, recovering over time.`
- Ingredient list: reuse the `ingredients` array from `pages/dog-urine-neutralizer-bundle.tsx:31-39`.

Note: the "North Carolina farm" fact comes from `dog-urine-neutralizer-bundle.tsx:132`. Confirm it with the owner.

### 3. Rewrite the NWS_014 description and features in the canonical data
File: `data/products.ts:334-346`

```ts
description: 'Soil-level dog urine neutralizer for yellow lawn spots. A naturally dark enzyme and humic-acid formula that helps break down urine salts and residues so grass can recover over time. Not a dye, no green colorants. Pet-safe when used as directed.',
features: [
  'Helps neutralize urine salts and residues at the soil level',
  'Not a dye: no green colorants or cosmetic cover-up',
  'Supports grass recovery over time as soil and roots recover',
  'Helps reduce urine odor in repeat-use spots',
  'Pet-safe when used as directed; keep pets off until dry or watered in',
  'Hose-end sprayer or pump sprayer application',
  'Made in small batches by a family soil farm',
],
```
This fixes M2 everywhere `ProductDetail.tsx` renders. Also update usage line `:360`. "activate neutralizing microbes" is fine, but confirm that the formula contains microbes, because the bundle-page ingredient list shows enzymes, not microbes.

### 4. Stop the hero sending traffic to Amazon: replace the guide CTA with an on-page "sizes & how much" anchor
File: `pages/dog-urine-lawn-repair.tsx:152`

- Replace `<GuideButton secondary>Get Free Lawn Recovery Guide</GuideButton>` with a secondary link to `#choose-size` labelled `Compare 32 oz vs Bundle`.
- Add `id="choose-size"` to the section at `:287`.
- Keep the guide CTA lower on the page (`:317`) only after `/guide` has a dog-spot version with email capture and no Amazon link block. Until then, also fix `pages/guide.tsx:83` (M3).

### 5. Add the missing FAQs, a sticky mobile CTA, and a real hero image
File: `pages/dog-urine-lawn-repair.tsx`

Append to `faqs` (`:38-59`):
```ts
{ q: 'How much do I need?', a: 'For most yards with a few spots, the 32 oz hose-end sprayer is a good start. For several dogs, repeat spots, or larger lawns, the bundle adds a 1 gallon refill. Soak the spot and the soil around it, not just the grass blades; heavy spots may need 2 to 3 applications over 7 to 10 days. Follow the label for mix rates.' },
{ q: 'What is in it?', a: 'Enzymes, humic and fulvic acids, a natural odor neutralizer, citric acid and a xanthan stabilizer in purified water, with 3% hydrogen peroxide. No green dye, bleach or ammonia.' },
{ q: 'Why buy here instead of Amazon?', a: 'Ordering direct saves you 15% at checkout and gives you the sprayer + refill bundle. Your order ships from our family farm.' },
```
(Ingredients come from `pages/dog-urine-neutralizer-bundle.tsx:31-39`. Application guidance comes from `:27,45`. The owner should confirm both against the label.)

Sticky mobile bar (copy the pattern from `ProductDetail.tsx:195-198`):
```tsx
<div className="md:hidden fixed bottom-0 inset-x-0 z-50 bg-white border-t shadow-2xl px-4 py-3 flex items-center gap-3">
  <div className="flex-1 text-xs text-gray-600">Bundle $49.99 · 15% off direct at checkout</div>
  <CheckoutButton product={dogProducts.bundle}>Get the Bundle</CheckoutButton>
</div>
```
Add `pb-24 md:pb-0` to `<main>`.

Hero image (`:164-168`): use `next/image` with `src="/images/products/NWS_014/main.webp"`, `priority`, a fixed aspect box, and alt `Nature's Way Soil Dog Urine Neutralizer 32 oz hose-end sprayer`. Do not use stock.

## Quick wins (under 30 minutes each)

1. Delete the internal sentence at `:291` and use the "Why Order Direct?" copy above.
2. Add `cancelPath: '/dog-urine-lawn-repair'` to the checkout body at `:90`. This is a one-line fix and removes the broken placeholder cancel page.
3. Delete the testimonial section at `:335-367`.
4. Change `pages/guide.tsx:83` to "Safe for kids and pets when used as directed."
5. Add the return line under the CTAs, exactly: "30-day returns on unused products in original packaging (see Terms)."
6. Change `src` at `:223` from `main.jpg` to `main.webp` and add `loading="lazy" width height` to both `<img>` tags.
7. Align the product name to the canonical "Dog Urine Neutralizer & Lawn Repair" at `:20,224,233`, or have the owner update `data/products.ts`. Either way, pick one.

## What to measure in GA4 (no data was available for this audit)

- **CTA click-through by position.** `product_cta_click` (already fired at `:85`) broken down by `cta_label` and a new `cta_position` param (hero / offer / mid / footer / sticky).
- **Checkout funnel.** `begin_checkout` (`:86`) to `purchase`, segmented by `item_id` (NWS_014 vs NWS_014_BUNDLE) and by `utm_source`, to get the funnel's checkout completion rate.
- **Stripe abandonment.** Count landings on the cancel URL (`/dog-urine-lawn-repair?canceled=1`, adding that param to `cancelPath`).
- **Guide leakage.** Clicks on `GuideButton` and outbound clicks to amazon.com from `/guide?src=dog-urine-landing`.
- **Scroll depth** to the offer section (`#choose-size`) and the FAQ, plus `<details>` opens per question to see which objections matter.
- **Before/after the SAVE15 fix.** Compare purchase conversion rate and AOV for funnel sessions over equal-length windows. Do not compare against invented baselines.
- **Core Web Vitals (LCP, CLS)** for this route in Search Console or a Lighthouse run, before and after the image changes.
