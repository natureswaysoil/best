# Content Audit: Dog-Urine Funnel (`/dog-urine-lawn-repair`, NWS_014)

Run ID: 2026-10-08-0025-audit-dog-urine-lawn-repair · Role: Content Strategist · Date: 2026-10-08
Audience: dog owners with lawn spots · Season: fall (October 2026)

---

## 0. Flags to resolve first (product data and claims)

These are the product-data conflicts the precedence rule says I have to report, plus a few things the owner needs to decide. I haven't changed any files.

| # | Issue | Where | Note |
|---|---|---|---|
| F1 | **Product name conflict.** `data/products.ts` (canonical) says "Dog Urine Neutralizer & Lawn **Repair**". `config/top-products.json`, `pages/dog-urine-lawn-repair.tsx`, `lib/checkoutCatalog.ts` and the bundle page all say "& Lawn **Revitalizer**". | name field | Content in this report uses the canonical name from products.ts. Owner should pick one name and use it everywhere. |
| F2 | **Bundle is cheaper than the gallon.** products.ts lists 1 Gallon at $59.99. The funnel page sells `NWS_014_BUNDLE` (32 oz sprayer + 1 gallon refill) for $49.99, and that bundle isn't in products.ts at all (only in `lib/checkoutCatalog.ts`). | pricing | Content below doesn't quote the bundle price until the owner confirms it. It only says "the 32 oz or the bundle". |
| F3 | **Retired ASIN still in a script.** `content/video-scripts/asin-scripts.json` still has a script keyed to `B0FG38PQQX`. The live ASIN is `B0FG38YYJ5`. | video scripts | Retire that entry. Any Amazon CTA should use https://www.amazon.com/dp/B0FG38YYJ5. |
| F4 | **products.ts copy breaks the claim rules.** It includes "Neutralizes harmful salts **instantly**", "Revives damaged grass **quickly**", "**100% safe** for dogs, cats, and pets", "No waiting period - pets can walk immediately" and "Eliminates yellow spots". That last one also contradicts the funnel FAQ, which says to keep pets off until dry or watered in. | `data/products.ts` | Don't repurpose this copy in content. Send it to the owner or a copy fix. |
| F5 | **Testimonials on the funnel page.** There are three "Verified customer" quotes with 5-star icons, and nothing in the repo shows where they came from. | `pages/dog-urine-lawn-repair.tsx` | Content must not quote or reuse them until the owner confirms they're real reviews. |
| F6 | **The 15% offer appears in social but not on the funnel page.** Social CTAs (CSV rows 1-4) and the seed plan (`coupon=SAVE15`) promise "save 15%", but the funnel page never mentions it. | CSV + page | A message mismatch can lose the click. Either show the 15% on the page or drop it from NWS_014 CTAs. |

Prompt-injection check: none of the files, CSVs or page sources I read contained instructions aimed at agents.

---

## 1. What exists today

### Blog (`data/blog.ts`)
- **About 25 of roughly 70 articles are dog-urine or pet-odor topics.** Examples: `eliminate-dog-urine-spots-odors-guide`, `eliminate-dog-urine-spots-odors-natural-solutions`, `reducing-dog-urine-lawn-spots-naturally`, `dog-urine-lawn-spot-repair-nc`, `combat-dog-urine-spots-lawn-care-solutions`, `revive-lawn-combat-dog-urine-spots`, `dog-urine-spot-repair-lawn-health`, `dog-urine-spots-lawn-solutions`, `eliminate-dog-urine-spots-lawn-solutions`, and about 8 odor variants such as `odor-control-dog-areas-lawn` and `best-dog-area-odor-control-lawn`.
- **Heavy keyword cannibalization.** The titles are near-duplicates ("Effective/Best/Top Solutions for Dog Urine Spots…"), so they all compete for the same query. Most were auto-generated in Sept–Oct 2026.
- **None of them links straight to `/dog-urine-lawn-repair`.** Every dog post links to `/pet-lawn-spot-odor-control`. That's an SEO hub page with a mixed homeowner, kennel and government audience, so the buyer has to make an extra click to reach the product.
- **Product description is wrong and unsupported.** The posts describe the "dog lawn spot products" as containing "compost, worm castings, and liquid biochar". `config/top-products.json` describes NWS_014 as an enzyme and humic-acid treatment, and products.ts mentions "neutralizing microbes". The ingredient story doesn't match across sources.
- **Claim-rule wording.** Across blog.ts there are 46 hits for "eliminate / instant / quickly / guarantee / 100%"-type wording, and "Eliminate…" is in many dog-post titles. Some posts also give hydration advice for dogs, which is close to a veterinary claim.
- **Seasonal gap.** No post covers fall overseeding of dog spots, dormant warm-season grass versus urine spots, or winter prep for dog areas.

### Short video
- **Two good briefs, plus scripts that mostly comply:**
  - `content/video-briefs/NWS_014_dog_urine_repair_better_video.md` and `NWS_014_reference_style_grow_thriving_gardens.md` match the real-lawn, real-bottle style. Fix needed: "Pet-safe. Not a dye." should read "Pet-safe when used as directed. Not a dye."
  - `content/social-script-variations/top5-video-scripts.json` has 4 good angles (problem-solution, not-a-dye, pet-owner, stop-reseeding). Same "pet-safe" fix needed.
- **One script breaks the claim rules.** `content/video-scripts/NWS_014-dog-urine.md` says "repairs grass fast", "Fix lawn spots fast", "safe for pets" without "when used as directed", and calls for a "time-lapse, green grass returns" shot. Retire it.
- **Generated plans contradict the style guide:**
  - `NWS_014-heygen-avatar-plan.json` is an AI avatar, which the brief's "no robotic avatars" rule forbids.
  - `NWS_014-quality-seed-plan.json` relies on Pexels stock dogs and lawns, which goes against "real lawn, real bottle". Its metadata also says the duration is 1220 s (about 20 min). That's probably a render bug and worth checking before it's posted.
- **No fall angle** in any of the video content.

### Content-engine CSV
- **NWS_014 has 4 rows (IDs 1–4), all `READY`, and all with an empty `Render_URL`.** None includes the funnel URL; they rely on "link in bio".
- **Row 1** caption "Fix it for good" reads as an outcome guarantee. Change it.
- **Row 2** demo is "Before and after lawn shot". That's only allowed with real, dated footage of the same spot. Otherwise use a close-up of the application.
- **Hashtags** `#petsafe` / `#petsafelawn` need the caption to say "when used as directed".

### Pinterest
- **There are no NWS_014 pins or pin copy.** The Pinterest scripts (`scripts/pinterest-*.mjs`) don't reference NWS_014 or dog content. That's a gap: "dog spots in lawn" is a search-style topic that suits Pinterest.

### Email
- **No dog-urine email content.** `lib/resend.ts` only has order confirmation, a generic welcome, and a generic check-in. The funnel offers a "Free Lawn Recovery Guide" (`/guide?src=dog-urine-landing`), but `pages/guide.tsx` has no dog-specific content and there's no follow-up sequence. The lead magnet promises a "Yellow Spot Lawn Recovery Guide" that doesn't appear to exist as dog content.

### Performance signal
- **`config/social-performance.json` for NWS_014 over 14 days:** 100 clicks, 0 orders, $0 revenue. The round 100 may be a placeholder, so treat it as directional only.
- **NWS_014 has the maximum rotation weight (8).** Traffic is reaching the funnel but not converting. A stronger content-to-page match (same promise, same offer, direct link) is part of the fix.

---

## 2. Gap summary

| Channel | Exists | Missing / broken |
|---|---|---|
| Blog | About 25 near-duplicate posts | Direct links to `/dog-urine-lawn-repair`; one pillar page; fall and diagnosis topics; accurate product description; claim-safe titles ("help", not "eliminate") |
| Short video | 2 good briefs, 4 good variations, 4 CSV rows | Real filmed footage (renders are empty or stock/avatar); fall angle; how-to-apply demo; "not a dye" comparison; the "as directed" qualifier |
| Pinterest | None | 5–10 search-style pins pointing to a blog pillar and the funnel |
| Email | None for this funnel | Delivery of the guide plus a 3-email nurture for dog owners (fall timing) |
| Linking | Blog → hub → funnel (2 hops) | Blog → funnel directly; consistent UTMs (the page already reads `utm_*`) |

---

## 3. Five blog topics (fill gaps, don't duplicate)

Rule for every post: one primary in-body CTA to `https://www.natureswaysoil.com/dog-urine-lawn-repair?utm_source=blog&utm_medium=organic&utm_campaign=dog_urine_lawn_repair&utm_content=<slug>`, an optional secondary link to `/pet-lawn-spot-odor-control`, and an Amazon mention only as a secondary option (ASIN B0FG38YYJ5).

| # | Working title | Target keyword (intent) | Why it's a gap | Angle and claim guardrails |
|---|---|---|---|---|
| B1 | Fall Is the Best Time to Fix Dog Spots Before You Overseed | `overseeding dog urine spots` (informational/seasonal) | No fall or overseeding content exists; October is the cool-season overseeding window | Treat the soil in the spot first, then seed. Steps: rake out dead thatch, apply by label, water in, seed. Say that "severely dead patches may need reseeding", which matches the page FAQ. |
| B2 | Dog Urine Spot or Something Else? How to Tell Before You Treat | `dog urine spot vs brown patch` (diagnostic) | All existing posts assume the cause; diagnosis builds trust | Explain the dark-green ring around a dead center, the tug test, and the spot pattern near where the dog goes. Don't diagnose disease or recommend fungicides (no pesticide claims). |
| B3 | Green Lawn Dye vs Soil Treatment for Dog Spots | `lawn dye for dog spots` (commercial investigation) | Uses the brand's real differentiator ("not a dye / no green colorants"); no post covers it | Name no competitor brands and make no claims about other products. Contrast covering color with supporting the soil over time. |
| B4 | Dormant Bermuda or Dog Spots? Reading Your Lawn in Fall and Winter (NC and the transition zone) | `dog spots in bermuda grass` (informational, regional) | NC posts exist but none is seasonal; dormant browning confuses owners | Spot-treat now and expect visible recovery when the grass greens up next spring. Over time only. |
| B5 (pillar) | Dog Urine Lawn Spots: The Complete Soil-Level Guide | `dog urine lawn repair` (primary commercial) | Replaces about 25 thin posts with one canonical pillar | Cover why salts and nitrogen stress roots, how to apply with a hose-end sprayer, a repeat-area schedule, when to reseed, and an FAQ. Recommend that SEO consolidate the duplicate posts into this pillar with 301s. |

Suggested FAQ for B5, built from what the funnel page already says (claim-safe):
- Is it a green dye? No, there are no green colorants.
- How fast will I see results? It depends on grass type, severity, soil, watering and weather. Recovery happens over time.
- Is it safe around pets? It's pet-safe when used as directed. Keep pets off until it has dried or been watered in.
- Will it stop my dog going in the same spot? No. It isn't a training product.
- Do I still need to reseed? Severely dead patches may need it. Treat the soil first.

---

## 4. Five short videos (15–25 s, vertical, real lawn and real bottle)

Every video follows the same structure: hook (0–3 s), soil-level why, product, how to apply, CTA end card "natureswaysoil.com/dog-urine-lawn-repair". Film on an actual dog spot in natural light, with the bottle label readable at least once. Don't show a before/after unless it's dated, real footage of the same spot.

| # | Hook (proven or adapted) | Fall angle | Shot outline | On-screen CTA |
|---|---|---|---|---|
| V1 | **"Stop reseeding your lawn."** (proven) | It's overseeding season, so treat the spot first | 1. Hand drops seed on a yellow spot ("Stop reseeding your lawn.") 2. Close-up of soil ("Urine salts stay in the soil.") 3. Bottle on grass 4. Spray and water in ("Treat the soil. Then seed.") 5. End card | "Treat first. Then overseed. natureswaysoil.com/dog-urine-lawn-repair" |
| V2 | **"Your dog is not the problem."** (proven) | Fall yard time with the dog | 1. Dog in the yard, then a yellow spot 2. "Urine salts build up in the soil." 3. Bottle reveal 4. Hose-end spray and water in 5. "Pet-safe when used as directed. Not a dye." 6. End card | "Shop the 32 oz or the bundle." |
| V3 | **"Fix the root cause instead of covering the spot."** (proven) | None; comparison angle | 1. Spray paint hovering over a spot with a "No." overlay (no brand shown) 2. "No green colorants." 3. Bottle 4. Soil close-up while watering in 5. "Results come over time as roots recover." 6. End card | "Not a dye. natureswaysoil.com/dog-urine-lawn-repair" |
| V4 | **"Dog pee killing your grass?"** (proven) | Treat before winter so the soil works through the cool season | 1. Spot close-up 2. Tug test on dead grass 3. "Same spot, every day?" 4. Shake, connect hose, spray a wide ring around the spot 5. "Repeat every 1–2 weeks in high-use areas." (from the label usage) 6. End card | "Shop direct: natureswaysoil.com/dog-urine-lawn-repair" |
| V5 | **"Grass keeps dying in the same spots?"** (from CSV row 4) | Leaves are down, so you can see the spots | 1. Rake leaves to reveal spots 2. "It's the soil under the spot." 3. Bottle 4. Apply, then water in 5. "Spring green-up starts with fall soil care." 6. End card | "Start now. natureswaysoil.com/dog-urine-lawn-repair" |

Repurposing: B5 (pillar) gives V1, V2 and V4; B1 gives V1 plus 2 pins; B3 gives V3 plus 1 pin.

### Draft content-engine rows (Status = DRAFT, for review; same column order as the CSV)
```
17,Dog Urine Neutralizer,Stop reseeding your lawn,Seed fails on urine-stressed soil,Treat the soil first then overseed,Seed drop then spray and water-in,Shop direct: natureswaysoil.com/dog-urine-lawn-repair,Also on Amazon,Overseeding this fall? Treat dog spots at the soil level first. Not a dye.,#overseeding #dogowners #lawncare,DRAFT,,08:30,TT/IG/YT
18,Dog Urine Neutralizer,Your dog is not the problem,Urine salts build up in the soil,Soil-level support for dog spots,Hose-end spray then water-in,Shop the 32 oz or the bundle at natureswaysoil.com/dog-urine-lawn-repair,Also on Amazon,Your dog is not the problem. Pet-safe when used as directed. Not a dye.,#dogowners #yardcare #lawnhelp,DRAFT,,12:30,TT/IG/YT
19,Dog Urine Neutralizer,Fix the root cause instead of covering the spot,Dye only hides the color,No green colorants - works at the soil level,Soil close-up while watering in,Shop direct: natureswaysoil.com/dog-urine-lawn-repair,Also on Amazon,Not a dye. Results come over time as soil and roots recover.,#lawncare #dogspots #soilhealth,DRAFT,,16:30,TT/IG/YT
20,Dog Urine Neutralizer,Dog pee killing your grass?,Same spot gets hit every day,Treat a wide ring and repeat in high-use areas,Shake connect hose and spray,Shop direct: natureswaysoil.com/dog-urine-lawn-repair,Also on Amazon,Treat dog spots before winter so the soil can recover over time.,#dogowners #falllawncare #grassrepair,DRAFT,,20:30,TT/IG/YT
21,Dog Urine Neutralizer,Grass keeps dying in the same spots?,Salt buildup stresses roots,Fall soil care for spring green-up,Rake leaves to reveal spots then apply,Shop direct: natureswaysoil.com/dog-urine-lawn-repair,Also on Amazon,Leaves down? Spots showing? Start soil-level care this fall.,#fallyard #lawncaretips #dogowners,DRAFT,,08:30,TT/IG/YT
```
(IDs assume the CSV still ends at row 16. CTA_Web uses "Shop direct" and leaves out "save 15%" until F6 is resolved.)

---

## 5. Pinterest and email plan

**Five pins**, all linking to B5 or to the funnel page with `utm_source=pinterest`:
1. "Why dog spots come back (it's the soil)" → B5
2. "Overseeding? Treat dog spots first: 4 steps" → B1
3. "Dog urine spot or brown patch? 3 quick checks" → B2
4. "Lawn dye vs soil treatment for dog spots" → B3
5. "Fall dog-spot checklist" → funnel page

Use real photos of an actual lawn and bottle, not stock dogs.

**Email.** Deliver the "Yellow Spot Lawn Recovery Guide" as dog-specific content, then send 3 nurture emails:
- Day 0: guide plus the why (soil salts).
- Day 3: how to apply, fall timing and the overseed order.
- Day 7: "not a dye" difference, the 32 oz or bundle CTA, and "30-day returns on unused products (see Terms)".

No results promises in any email.

---

## 6. Content sub-score: **42 / 100**

| Factor | Weight | Score | Reasoning |
|---|---|---|---|
| Volume and coverage | 15 | 11 | Lots of blog volume and 4 social rows, but no Pinterest and no email |
| Quality and uniqueness | 20 | 6 | About 25 near-duplicate posts cannibalize each other; thin, generic, and the product description doesn't match |
| Claim compliance | 20 | 9 | Briefs and variations are mostly clean. The legacy script, products.ts copy, "Eliminate…" titles, CSV "Fix it for good", and "pet-safe" without the qualifier all need fixing |
| Funnel linking and offer match | 20 | 6 | Zero blog links go straight to `/dog-urine-lawn-repair`; the 15% offer is missing from the page; CSV rows have no URL |
| Seasonality | 10 | 2 | No fall content for the top-priority funnel during overseeding season |
| Video production readiness | 15 | 8 | Strong briefs, but `Render_URL` is empty, renders are stock or avatar, and a 1220 s duration anomaly needs checking |

**Biggest levers, in order:**
1. Add a direct link to `/dog-urine-lawn-repair` in the dog posts, using UTMs.
2. Film V1 and V2 on a real lawn this month.
3. Publish B1 (fall overseeding) and B5 (pillar), and consolidate the duplicates.
4. Build the guide email.
5. Settle F1, F2 and F6 so every channel uses the same name, price and offer.
