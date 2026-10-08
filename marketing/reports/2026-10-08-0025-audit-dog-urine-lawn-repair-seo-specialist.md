# SEO Audit: /dog-urine-lawn-repair (NWS_014)

- **Run ID:** 2026-10-08-0025-audit-dog-urine-lawn-repair · **Command:** /market audit · **Agent:** SEO Specialist
- **Date:** 2026-10-08
- **Scope:** `pages/dog-urine-lawn-repair.tsx`, sitemap (`scripts/gen-sitemap.js`, `public/sitemap.xml`, `pages/sitemap.tsx`), `public/robots.txt`, canonical, internal links (site + `data/blog.ts`), competing dog-urine URLs.
- **SEO sub-score: 38 / 100** (breakdown in section 6)

## 0. Conflicts and limitations (read first)

**Product data conflicts (per brand-context precedence, `data/products.ts` wins and is used in all recommendations below):**

| Field | `data/products.ts` (canonical) | Other source | Status |
|---|---|---|---|
| Product name | `Dog Urine Neutralizer & Lawn Repair` (products.ts:331) | `config/top-products.json` and page: "Dog Urine Neutralizer & Lawn **Revitalizer**" (page lines 20, 28, 148, 224, 233) | **CONFLICT.** Schema below uses canonical name. Owner should decide which name is correct and update the other file. |
| 32 oz price / SKU | $29.99, `EG-PJ13-DA9T` (products.ts:356) | Page line 23-24: $29.99, `EG-PJ13-DA9T` | Match |
| 1 Gallon | $59.99, `T0-MB9Q-JIKC` (products.ts:357) | Not offered on page | Gap: canonical size not sold on the funnel |
| Bundle (32 oz sprayer + 1 gal refill) | **Not in products.ts** | Page lines 26-33: `NWS_014_BUNDLE`, $49.99, SKU `NWS-DUN-32OZ-1GAL-BUNDLE` | **CONFLICT / unverifiable.** Bundle price can't be checked against canonical data. Note: the $49.99 bundle (with a gallon) is priced *below* the canonical 1 Gallon alone ($59.99). The owner needs to confirm. Bundle left out of the Offer schema until it is added to products.ts. |
| ASIN | `B0FG38YYJ5` (products.ts:330) | top-products.json `amazonUrl` B0FG38YYJ5 | Match. Page has no Amazon link (fine for a direct funnel). |

**Claim-rule conflict in canonical data:** `data/products.ts:334-345` (NWS_014 description/features) says "eliminates yellow spots", "Neutralizes harmful salts instantly", "Revives damaged grass quickly", "100% safe for dogs, cats, and pets" and "No waiting period - pets can walk immediately". These break the claim rules (no instant claims, no outcome guarantees, pet-safe only "when used as directed"). They also contradict the funnel FAQ (page line 49: "Keep pets off treated areas until the product has dried"). This copy shows up as the meta description of `/product/NWS_014` (`pages/product/[id].tsx:45-46`). **None of it is reused below.**

**Live-site check not possible:** both `curl` and WebFetch to `www.natureswaysoil.com` were blocked by the network egress proxy (HTTP 403 / EGRESS_BLOCKED). All findings come from repo source at HEAD. Someone should confirm deployed HTML, the HTTP status, the apex→www redirect and the live sitemap after the fixes ship.

**Prompt-injection check:** I found no instructions in the page source, data files or search results. Several search results came from spammy/scraped domains. I treated them as noise and did not use them as evidence.

---

## 1. Prioritized fix list

| # | Issue | Page / file | Impact | Effort | Fix |
|---|---|---|---|---|---|
| 1 | **No structured data at all.** There's no Product/Offer, FAQPage, BreadcrumbList or Organization JSON-LD. The `components/SEO.tsx` helper exists but this page doesn't use it. | `pages/dog-urine-lawn-repair.tsx:126-134` | High | S (30 min) | Paste the JSON-LD in section 3 into `<Head>`. Offer uses the canonical 32 oz $29.99. |
| 2 | **Primary keyword missing from title and H1.** Title and H1 are "Fix Yellow Dog Spots From the Soil Up". Neither "dog urine" nor "lawn repair" (the URL slug and target terms) appears. | `:127`, `:144-146` | High | XS | New title/H1/meta in section 2. |
| 3 | **Duplicate/competing product URL.** `/product/NWS_014` is indexable with no canonical tag (`pages/product/[id].tsx:44-48`) and sits in the sitemap at priority **0.8** (`public/sitemap.xml:41`), above the funnel's 0.7 (`:21`). Its meta description is the claim-violating products.ts text. | `pages/product/[id].tsx`, `scripts/gen-sitemap.js` | High | S | Option A (preferred, matches how `/dog-urine-neutralizer-bundle` is handled in `next.config.js:46`): 301 `/product/NWS_014` → `/dog-urine-lawn-repair` and drop it from the sitemap. Option B: add `<link rel="canonical" href="https://www.natureswaysoil.com/dog-urine-lawn-repair">` on that product page only. Separately, fix the products.ts claims (owner/content task). |
| 4 | **Zero blog links to the funnel.** 25 dog/pet posts in `data/blog.ts` (e.g. slugs at lines 298, 466, 487, 571, 634, 865, 1054, 1222) contain **0** links to `/dog-urine-lawn-repair`. Blog markdown links go to `/pet-lawn-spot-odor-control` (28x), so every visit takes an extra hop. The blog template CTA goes to `/shop` (`pages/blog/[slug].tsx:229`). | `data/blog.ts`, `pages/blog/[slug].tsx` | High | M | Add a contextual link in the first 2 paragraphs of every dog-urine post (anchors in section 5). In `[slug].tsx`, swap the `/shop` CTA for `/dog-urine-lawn-repair` when the slug matches `dog|urine|pet`. |
| 5 | **Thin content and missing "why it works".** About 350 words of body copy. The words "enzyme", "humic", "pet safe", "neutralizer" (as a noun phrase in copy), "reseed" (only in an FAQ) and "watering" are absent or barely there. Ranking pages (Pennington, LawnStarter, UMD Extension) are full how-to guides: why urine burns grass (nitrogen + salts), watering, checking if grass is alive, reseeding. | whole page | High | M | Add the H2 sections in section 2 (about 600-900 words). Explain the ingredients in plain language and the process "over time". |
| 6 | **Unverified testimonials with 5-star graphics.** Three quotes are attributed to "Verified customer", each with 5 rendered stars. The repo has nothing that shows these are real (brand rule: never invent testimonials or star ratings). | `:338-366` | High (trust / policy) | XS | Remove them, or swap in real attributable reviews with a source. **Never** mark them up as `Review`/`AggregateRating` schema. |
| 7 | **Internal note visible to shoppers:** "Social traffic should come here first, not Amazon." | `:291` | Med | XS | Replace with customer copy, e.g. "Order direct for bundles and lawn-recovery resources." Add "Save 15% when you buy direct" only if checkout really applies it (verify first). |
| 8 | **LCP / CLS risk on hero image.** Plain `<img>` loading an external Unsplash URL (`:164-168`) with no `width`/`height`, no priority/preload, and generic alt. It's also stock photography, which goes against the brand voice ("real lawns, real bottles"). | `:164-168` | Med | S | Use `next/image` with `priority`, explicit `width={900} height={600}`, `sizes="(min-width:1024px) 50vw, 100vw"`, and a real NWS lawn/bottle photo. Alt in section 4. |
| 9 | **Unoptimized product image.** `main.jpg` is 142 KB at 1254x1254, but `main.webp` (25 KB) sits in the same folder (`public/images/products/NWS_014/`). | `:222-226` | Med | XS | `<Image src="/images/products/NWS_014/main.webp" width={1254} height={1254} sizes="(min-width:1024px) 50vw, 100vw" ...>` |
| 10 | **No Open Graph / Twitter tags.** Shares from TikTok/IG/Pinterest bios (a key traffic source for this funnel) show no image or title preview. | `:126-134` | Med | XS | See the `<Head>` block in section 2. |
| 11 | **The highest-priority funnel isn't in global nav or footer.** Only linked from `pages/index.tsx:22`, `pages/sitemap.tsx:22` and `pages/pet-lawn-spot-odor-control.tsx:11,31`. `components/Header.tsx` and `Footer.tsx` have no dog link. | `components/Header.tsx`, `Footer.tsx` | Med | XS | Add a "Dog Spot Lawn Repair" link to the footer (and the nav Solutions menu if there is one). |
| 12 | **Blog cannibalization.** 25 near-duplicate dog/pet posts ("Eliminate Dog Urine Spots...", "Effective Solutions for Dog Urine Spots...", "Best Solutions for Managing Dog Urine Spots..."). Several titles use "Eliminate", which breaks the claim rules. | `data/blog.ts` (titles at 297, 465, 1158, 1221, ...) | Med | L | Merge into 2-3 pillar guides (e.g. "How to repair dog urine spots", "Dog area odor in the yard") and 301 the rest. Retitle to drop "Eliminate". Hand this to the content agent. |
| 13 | **FAQ only partly targets search questions.** The 5 FAQs are good and claim-safe but miss high-intent questions ("Will grass grow back after dog urine?", "Do I still need to reseed?", "Supplements vs. lawn treatment?"). | `:38-59` | Med | S | Add the FAQs in section 3. Note: Google now shows FAQ rich results only for authoritative gov/health sites, so FAQPage markup mostly helps machine understanding and AI answers, not SERP display. |
| 14 | **Canonical size not sold.** The 1 Gallon ($59.99, products.ts:357) isn't offered, while a non-canonical bundle is. | `:17-34` | Med (owner decision) | S | Owner: either add the bundle to products.ts, or show the 1 Gallon at $59.99. Keep schema in sync with whatever is visible. |
| 15 | **Nested `<main>` elements.** Layout already wraps children in `<main>` (`components/Layout.tsx:16`), and the page opens a second `<main>` (`:136`). | `:136`, `:383` | Low | XS | Change the page's `<main>` to `<div>`. |
| 16 | **Render-blocking Google Fonts (two stylesheets, site-wide).** | `pages/_document.tsx:11-18` | Low-Med | S | Move to `next/font` (Inter, Libre Baskerville, IBM Plex Sans) to cut render-blocking requests. |
| 17 | **Committed `public/sitemap.xml` is stale** (61 blog URLs vs 70 slugs in `data/blog.ts`; e.g. `natural-odor-control-solutions-dog-areas-lawn` missing). The `prebuild` script (`package.json:65`) regenerates it, so production is *probably* fine. Couldn't verify live. | `public/sitemap.xml` | Low | XS | Check the live `/sitemap.xml` after deploy. Optionally add `<lastmod>` for static routes. |
| 18 | Robots and canonical: **OK.** `public/robots.txt` allows all and points to the sitemap. The page canonical is the absolute www URL (`:133`). The funnel is in `STATIC_ROUTES` (`scripts/gen-sitemap.js:20`). The `/lawn-repair` and `/dog-urine-neutralizer-bundle` aliases 301 to the funnel and are kept out of the sitemap (`next.config.js:45-46`, `gen-sitemap.js:28-35`). | - | - | - | No change. Remove the redundant `<meta name="viewport">` at `:132` only if `_app.tsx` already sets one (Low). |

---

## 2. Ready-to-paste meta, heading structure and copy direction

### `<Head>` replacement (`pages/dog-urine-lawn-repair.tsx:126-134`)

```tsx
<Head>
  <title>Dog Urine Neutralizer &amp; Lawn Spot Repair | Nature&apos;s Way Soil</title>
  <meta
    name="description"
    content="Dog pee killing your grass? Our dog urine neutralizer works at the soil level to help yellow spots recover over time. Not a dye. 32 oz, $29.99."
  />
  <link rel="canonical" href="https://www.natureswaysoil.com/dog-urine-lawn-repair" />
  <meta property="og:type" content="product" />
  <meta property="og:site_name" content="Nature's Way Soil" />
  <meta property="og:title" content="Dog Urine Neutralizer & Lawn Spot Repair" />
  <meta property="og:description" content="Works at the soil level to help dog urine spots recover over time. Not a dye, no green colorants." />
  <meta property="og:url" content="https://www.natureswaysoil.com/dog-urine-lawn-repair" />
  <meta property="og:image" content="https://www.natureswaysoil.com/images/products/NWS_014/main.jpg" />
  <meta name="twitter:card" content="summary_large_image" />
  <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(dogUrineSchema) }} />
</Head>
```

- Title: 60 characters including brand. It covers "dog urine neutralizer" and "lawn spot repair"/"dog spot repair".
- Meta description: about 142 characters. Uses a proven hook, has no instant or guaranteed claims, says "over time" and "not a dye", and the price matches canonical.
- A/B alternative title (estimate only, not tested): `Dog Urine Lawn Repair Spray, No Dye | Nature's Way Soil` (55 chars).

### Heading outline (one H1)

- **H1:** `Dog Urine Lawn Repair That Works From the Soil Up`
- First 100 words must include "dog urine", "lawn", "neutralizer" and "not a dye". Suggested intro:
  > Dog pee killing your grass? Your dog is not the problem. Concentrated urine leaves nitrogen and salts in one small spot, and the grass and soil there get stressed. Nature's Way Soil Dog Urine Neutralizer & Lawn Repair is a naturally dark, enzyme and humic-acid lawn treatment that works at the soil level, so the spot has a better chance to recover over time. It is not a dye and has no green colorants.
  *(The ingredient wording comes from `config/top-products.json` NWS_014 description. Check it against the bottle label before publishing.)*
- **H2:** Why Dog Urine Turns Grass Yellow *(nitrogen + salts; green rings at the edge; dry or stressed lawns get hit harder)*
- **H2:** How the Neutralizer Works at the Soil Level *(enzymes, humic acid, soil biology, in plain language)*
- **H2:** How to Repair Dog Urine Spots in 4 Steps *(water the spot deeply → apply per label → check if grass is alive → reseed dead centers. Honest, and it matches the SERP how-to intent.)*
- **H2:** Choose Your Size *(32 oz $29.99; plus 1 Gallon $59.99 and/or the bundle after the owner confirms)*
- **H2:** Dog Urine Lawn Repair FAQs
- **H2:** Start Lawn Recovery From the Soil Up *(closing CTA)*
- Demote the current "Dog Urine Neutralizer & Lawn Revitalizer" H2 (`:232-234`) to the product name block and align it with the canonical name once the owner decides.

---

## 3. JSON-LD (ready to paste, claim-safe, canonical prices)

Put above the component in `pages/dog-urine-lawn-repair.tsx`. **Rule:** Offer data must match what's visible on the page. Right now that is only the 32 oz at $29.99. Add the 1 Gallon offer (commented) only when the page shows it. Add a bundle offer only after the bundle is in `data/products.ts`. **No `aggregateRating` or `review`**: there is no verified review data.

```tsx
const PAGE_URL = 'https://www.natureswaysoil.com/dog-urine-lawn-repair';

const faqSchemaItems = [
  { q: 'Is this a green dye?', a: 'No. It is not a dye and contains no green colorants. It works at the soil level where dog urine has stressed the grass and soil.' },
  { q: 'Will grass grow back after dog urine damage?', a: 'Stressed, yellow grass often recovers over time with watering and soil support. If the center of a spot is brown, dry and pulls out easily, that grass is dead and the spot will need reseeding or sod.' },
  { q: 'How fast will I see results?', a: 'Recovery depends on grass type, how severe the spot is, soil condition, watering and weather. Results come over time as the soil and roots recover, not overnight.' },
  { q: 'Is it safe around pets?', a: 'Use it according to the label directions. Keep pets off treated areas until the product has dried or been watered in as directed.' },
  { q: 'Should I still water the spot?', a: 'Yes. Watering a urine spot soon after your dog goes helps dilute it. Use the neutralizer as part of a routine that includes watering.' },
  { q: 'How is this different from dog supplements or water-bowl products?', a: 'Supplements and water-bowl products are given to the dog. This product is applied to the lawn and soil where the spot is. It does not change your dog or its diet.' },
  { q: 'Will it stop my dog from peeing in the same spot?', a: 'No. This product is for lawn and soil recovery. It is not a behavioral training product.' },
];

const dogUrineSchema = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': 'https://www.natureswaysoil.com/#organization',
      name: "Nature's Way Soil",
      url: 'https://www.natureswaysoil.com',
    },
    {
      '@type': 'Product',
      '@id': `${PAGE_URL}#product`,
      name: 'Dog Urine Neutralizer & Lawn Repair',
      sku: 'EG-PJ13-DA9T',
      productID: 'NWS_014',
      image: ['https://www.natureswaysoil.com/images/products/NWS_014/main.jpg'],
      description:
        'Liquid lawn treatment for dog urine spots that works at the soil level to help stressed grass recover over time. Not a dye and no green colorants. Use as directed.',
      brand: { '@type': 'Brand', name: "Nature's Way Soil" },
      category: 'Lawn Care',
      offers: [
        {
          '@type': 'Offer',
          name: '32 oz',
          sku: 'EG-PJ13-DA9T',
          price: '29.99',
          priceCurrency: 'USD',
          availability: 'https://schema.org/InStock',
          itemCondition: 'https://schema.org/NewCondition',
          url: PAGE_URL,
          seller: { '@id': 'https://www.natureswaysoil.com/#organization' },
          hasMerchantReturnPolicy: {
            '@type': 'MerchantReturnPolicy',
            applicableCountry: 'US',
            returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow',
            merchantReturnDays: 30,
            returnMethod: 'https://schema.org/ReturnByMail',
            returnFees: 'https://schema.org/ReturnShippingFees',
          },
        },
        // Add ONLY when the 1 Gallon is shown on this page:
        // { '@type': 'Offer', name: '1 Gallon', sku: 'T0-MB9Q-JIKC', price: '59.99', priceCurrency: 'USD',
        //   availability: 'https://schema.org/InStock', itemCondition: 'https://schema.org/NewCondition', url: PAGE_URL },
      ],
    },
    {
      '@type': 'FAQPage',
      '@id': `${PAGE_URL}#faq`,
      mainEntity: faqSchemaItems.map((f) => ({
        '@type': 'Question',
        name: f.q,
        acceptedAnswer: { '@type': 'Answer', text: f.a },
      })),
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.natureswaysoil.com/' },
        { '@type': 'ListItem', position: 2, name: 'Dog Urine Lawn Repair', item: PAGE_URL },
      ],
    },
  ],
};
```

Notes:
- **Keep the FAQ schema and the visible FAQ in sync.** Replace the page's `faqs` array (`:38-59`) with `faqSchemaItems` so the markup matches the visible text exactly.
- The return policy markup reflects `pages/terms.tsx:76-79`: 30 days, unused products in original packaging, customer pays return shipping unless defective. Nowhere is it described as a guarantee.
- Add `gtin` only when a real GTIN exists (`top-products.json` gtin is empty for NWS_014).
- Validate with Google's Rich Results Test after deploy (couldn't run it here because egress is blocked).

---

## 4. Image alt text

| Line | Current | Recommended |
|---|---|---|
| `:166` (hero, stock) | "Dog on healthy green lawn" | Replace the image with a real NWS photo, then e.g. `alt="Dog in a backyard lawn being treated for urine spots with Nature's Way Soil neutralizer"` (describe what the real photo actually shows). |
| `:224` (product) | "Nature's Way Soil Dog Urine Neutralizer & Lawn Revitalizer" | `alt="Nature's Way Soil Dog Urine Neutralizer & Lawn Repair 32 oz hose-end sprayer bottle"` (canonical name; check that the photo shows the 32 oz hose-end bottle) |

---

## 5. Internal linking plan

1. **Blog → funnel (High).** In each dog/pet post in `data/blog.ts`, link once in the first 2 paragraphs and once near the end. Vary the anchors:
   - "dog urine lawn repair" · "dog urine neutralizer for lawns" · "dog spot repair treatment" · "how to repair dog urine spots" · "a pet-safe lawn treatment (when used as directed)"
   - Priority posts (most on-topic slugs): `repair-dog-urine-spots-liquid-soil-conditioner`, `dog-urine-spot-repair-lawn-health`, `dog-urine-lawn-spot-repair-nc`, `dog-urine-spots-lawn-recovery-solutions`, `reducing-dog-urine-lawn-spots-naturally`, `managing-dog-lawn-spots-biochar`.
2. **Blog template (High).** `pages/blog/[slug].tsx:229`: make the CTA topic-aware (dog/urine/pet slugs → `/dog-urine-lawn-repair`, label "See the dog spot lawn treatment").
3. **Footer/nav (Med).** Add "Dog Spot Lawn Repair" → `/dog-urine-lawn-repair`.
4. **Funnel → supporting pages (Low-Med).** From the "How to Repair" H2, link to `/lawn-soil-recovery-system` ("for the whole lawn, not just spots") and to one pillar blog guide. Right now the page links out only to `/guide`.
5. **Consolidate `/product/NWS_014`** into the funnel (fix #3) so internal and external links stop splitting between two URLs.

---

## 6. Keyword observations (from WebSearch on 2026-10-08; no volumes observed)

I did not observe search volumes or rankings for natureswaysoil.com. A `site:natureswaysoil.com dog urine` search returned no NWS pages. That's only a weak signal of low visibility, because the site: operator didn't seem to apply.

| Query observed | What ranks (observed) | Gap / opportunity |
|---|---|---|
| dog urine lawn repair | Pennington, LawnStarter, Platt Hill Nursery, The Grass People, Johnson's Lawn Seed: how-to guides (why it happens, water, check if alive, reseed) | The funnel has no how-to content. Add the 4-step H2 and the "will grass grow back" FAQ. Informational intent dominates, so a product-only page will struggle (estimate). |
| best dog urine neutralizer for lawn | Retailers and listicles (iHeartDogs, Walmart Turf Titan K9, PetSafe, Zamzows); results mix dog supplements and lawn sprays | Content gap: "lawn treatment vs. dog supplement" comparison. That's a natural FAQ and blog topic, and it highlights the no-dye, soil-level difference. |
| does humic acid help dog urine spots | Southland Organics "Dog Spot" (humic-based competitor) ranks, plus UMD Extension | Direct competitor on the same mechanism. A plain-language "how humic acid and enzymes support the soil" section serves the `humic acid` and `enzyme lawn treatment` keywords. Keep it honest: extension sources stress watering and reseeding, so present the product as support, never a cure. |
| dog spot lawn treatment no dye enzyme hose end sprayer | Turf Titan K9, See Spot Run (Chewy/Walmart), Revive (Ace) | "No dye" is rarely confirmed in competitor listings, which makes it a real differentiator. Put "not a dye / no green colorants" in the title/meta/H1 area (done above). |

Quick-win long-tail targets (estimated opportunity, not measured): "how to fix dog pee spots without reseeding" (answer honestly: stressed grass may recover, dead centers need seed), "dog urine neutralizer hose end sprayer", "pet safe lawn treatment for dog spots", "non dye dog spot lawn treatment", "enzyme lawn treatment for dog urine", "humic acid dog spot lawn".

### Sub-score breakdown (38/100)

| Area | Score | Why |
|---|---|---|
| Technical (indexable, canonical, sitemap, robots, CWV) | 16/25 | Canonical, sitemap and robots are correct and aliases redirect properly. Losses: duplicate `/product/NWS_014` with no canonical at higher sitemap priority, no OG tags, external unsized hero `<img>`, 142 KB jpg when a webp exists, nested `<main>`. |
| On-page (title, H1, first 100 words, content depth) | 12/25 | Unique title/meta and one H1, but no target keyword in title/H1. Thin copy; enzyme/humic/pet-safe terms missing. |
| Structured data | 0/20 | No JSON-LD on the page. |
| Internal linking | 4/15 | Only 3 internal referrers. 0 of 25 dog/pet blog posts link to the funnel. Not in nav/footer. |
| Content/keyword coverage and trust | 6/15 | FAQ exists and is claim-safe. Losses: unverified "Verified customer" 5-star quotes, internal note visible to shoppers, cannibalizing blog cluster. |

---

## 7. Sources (WebSearch, 2026-10-08)

- [Pennington: How to Fix Dog Urine Spots on Lawns](https://pennington.com/all-products/grass-seed/resources/healthy-lawns-and-happy-dogs)
- [LawnStarter: Why Does Dog Pee Kill Grass](https://www.lawnstarter.com/blog/lawn-care-2/dog-pee-killing-grass/)
- [Platt Hill Nursery: How to Fix Dog Urine Spots](https://platthillnursery.com/how-to-mend-your-lawn-from-dog-urine-spots-chicago/)
- [The Grass People: How to repair dog urine patches](https://thegrasspeople.com/how-to-repair-dog-urine-patches/)
- [University of Maryland Extension: Dog urine damage to lawns](https://extension.umd.edu/resource/dog-urine-damage-lawns)
- [Southland Organics: Dog Spot Lawn Repair](https://southlandorganics.com/products/dog-spot-for-lawns/)
- [iHeartDogs: Best Grass Saver Products for Dogs](https://iheartdogs.com/best-grass-saver-products-for-dogs/)
- [Walmart: Turf Titan K9 Corrector](https://www.walmart.com/ip/2237043879)
- [Chewy: See Spot Run Dog Urine Grass Saver](https://www.chewy.com/see-spot-run-dog-urine-grass-saver/dp/179900)
- [Zamzows: How to Stop Dog Urine Burns](https://zamzows.com/blogs/lawn-garden/how-to-stop-dog-urine-burns-in-your-lawn)
- [ask.extension.org (Colorado Master Gardener answer)](https://ask.extension.org/kb/faq.php?id=253256)
