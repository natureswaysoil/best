# Competitor Analysis: Dog Urine Lawn Repair / Dog Spot Neutralizer
Run ID: 2026-10-08-0025-audit-dog-urine-lawn-repair · Command: /market audit · Agent: Competitor Analyst · Date: 2026-10-08

**Competitive position sub-score (current page): 58 / 100** (reasoning in section 7)

---

## 0. Data flags (read first)

1. **Bundle vs. canonical sizes.** `data/products.ts` (canonical) lists NWS_014 as **32 oz $29.99** (SKU EG-PJ13-DA9T) and **1 Gallon $59.99** (SKU T0-MB9Q-JIKC), ASIN `B0FG38YYJ5`. The landing page (`pages/dog-urine-lawn-repair.tsx`) does not sell the 1 Gallon at all. Instead it sells an `NWS_014_BUNDLE` (32 oz hose-end sprayer + 1 gal refill) at **$49.99**, SKU `NWS-DUN-32OZ-1GAL-BUNDLE`, which is not in `products.ts`. That makes the bundle ($49.99 for 160 oz) cheaper than the 1 gallon alone ($59.99 for 128 oz). Someone needs to confirm whether this is intended.
2. **Size wording conflict.** `config/top-products.json` says "32 fl oz concentrate". The landing page calls the 32 oz a "hose-end sprayer". `products.ts` usage says "mix 4 ounces with 1 gallon of water", which describes a concentrate. The format needs to be confirmed, because it changes how cost per treatment works out.
3. **Claim-rule violations in canonical product data (`data/products.ts`, NWS_014).** The description and features say: "eliminates yellow spots", "Neutralizes harmful salts instantly", "Revives damaged grass quickly", "100% safe for dogs, cats, and pets", "No waiting period - pets can walk immediately". These break the brand rules (no instant results, no outcome claims, pet-safe only "when used as directed"). The "No waiting period" line also contradicts the landing-page FAQ ("Keep pets off treated areas until the product has dried or watered in"). This data probably feeds the product detail page, so it should be fixed (not done by me, since I write only this report).
4. **Testimonials on the landing page.** There are three 5-star quotes credited to "Verified customer" with no source. Under the "never invent testimonials" rule they need to be traced to real reviews (Amazon or email) or removed.
5. **15% direct offer not stated.** The brief and brand context promise "Save 15% when you buy direct". The page only says "Order Direct and Save" and gives no number or mechanism, and the prices shown ($29.99 / $49.99) match list price.
6. **Fetch limits.** Most direct fetches were blocked by the egress proxy: natureswaysoil.com, amazon.com, walmart.com, chewy.com, acehardware.com, scottsmiraclegro.com, southlandorganics.com, simplelawnsolutions.com, iheartdogs.com, sites.salsify.com. `petigreen.com` did not resolve (DNS ENOTFOUND). I analysed our page from the repo source. Competitor facts below come from search-result snippets of the cited URLs. Prices are snapshots and may be stale.
7. **Prompt-injection check.** None of the content I read contained any instructions directed at me.

---

## 1. Competitor profiles

### A. Sunday Pet Patch (Sunday Lawn Care): the closest soil-remediation competitor
- **Positioning:** a ready-to-spray pet-spot repair pouch built on "soil remediation ingredients like humic acid and seaweed extract, plus iron for extra greening." The maker says it "will not prevent all pet spots, but will help the lawn retain moisture and wash out residual salts." [Walmart](https://www.walmart.com/ip/seort/7633866441), [PetSmart](https://www.petsmart.com/pet-parents/home-and-yard-cleaning/outdoor-care/sunday-pet-patch-ready-to-spray-lawn-repair-for-pet-spots--for-all-grasses--423-oz--2500-sq-ft-97646.html)
- **Hero / price:** 42.3 oz pouch, 0-0-0.10. $17.96 at Walmart (about $0.42/oz), $23.99 at Ace, $24.99 at PetSmart (about $0.59/oz). Covers "50 large spots or 2,500 sq ft". [Walmart](https://www.walmart.com/ip/seort/7633866441), [Ace](https://www.acehardware.com/departments/lawn-and-garden/lawn-care/lawn-fertilizers/7038634)
- **Per spot (derived):** about $0.36–$0.50 per large spot.
- **Hooks:** humic + seaweed, no unwanted pesticides, "thick regrowth".
- **Note:** the iron is "for extra greening", so it is not purely soil-level. That leaves NWS room on "no colorants, no cosmetic green-up".
- **Reviews:** Walmart shows about 4.5 stars from about 319 ratings / 272 reviews (search snippet; I did not read the review content myself). Reviews seen in snippets mention spots coming back "faster and greener" with repeated applications over about a month. [Walmart](https://www.walmart.com/ip/seort/7633866441)
- **Channels:** Walmart, PetSmart, Ace, own DTC brand.

### B. Scotts EZ Seed Dog Spot Repair: the mass-market seed-patch leader
- **Positioning:** seed + mulch + "a soil amendment that helps repair areas burned by dog urine", tackifier and protectant. 2 lb treats "up to 100 dog spots". [Hemlock Hardware](https://hemlockhardware.com/products/700842-scotts-ez-seed-2-lb-covers-up-to-100-dog-spots-sun-shade-grass-patch-repair), [Slickdeals](https://slickdeals.net/f/17742117-2-lbs-scotts-ez-seed-mixed-sun-or-shade-pet-dog-spot-grass-repair-seed-9-09-free-s-h-w-walmart-or-on-35)
- **Price:** 2 lb at $16.44 (Walmart), $19.47 (Home Depot/Amazon, March 2026 tracker), $20.99–$22.99 (Hemlock, Ace). That is about $0.16–$0.23 per spot (derived). [Slickdeals](https://slickdeals.net/f/16830080-2-lb-scotts-ez-seed-dog-spot-grass-repair-for-sun-shade-11-85-free-shipping-w-prime-or-on-25), [Ace](https://www.acehardware.com/p/7283716)
- **Reviews:** ratings vary by SKU. Scotts' own pages show 3.2 to 4.3 out of 5. [Scotts 17530A](https://scottsmiraclegro.com/en-us/brands/scotts/products/grass-seed/17530A.html), [Scotts 17530B](https://scottsmiraclegro.com/en-us/brands/scotts/products/grass-seed/17530B.html). A Fakespot summary (marked outdated) says the main complaint is **poor or zero germination** even when instructions were followed. Praise centres on ease of use. [Fakespot](https://fakespot.com/product/scotts-ez-seed-sun-shade-17530-dog-spot-repair), [Home Depot reviews](https://homedepot.com/p/reviews/Scotts-2-lbs-EZ-Seed-Dog-Spot-Repair-Sun-and-Shade-Grass-Seed-and-Mulch-Combination-17530/206605408/1)
- **Channels:** Amazon, Home Depot, Walmart, Ace, every big box.

### C. Turf Titan K9 Correcter: the closest mechanism match (liquid, biology)
- **Positioning:** "beneficial bacteria, enzymes, and surfactants" / "beneficial bacteria and humates". It "restores and prevents lawn grass burns" and "neutralizes the soil's high nitrogen levels". [Ace](https://www.acehardware.com/p/7040585), [True Value](https://www.truevalue.com/product/744574/turf-titan-k9-correcter-32-oz-6000-sq-ft-coverage-yellow-lawn-spot-repair-744574/)
- **Hero / price:** 32 oz hose-end. $23.99 at Ace ($0.75/oz), $35.23 at Walmart, out of stock ($1.10/oz). Coverage 6,000 sq ft (Ace/True Value) or "up to 8,000 sq ft / ~150 large pet spots" (Walmart). The listings disagree. [Walmart](https://www.walmart.com/ip/2237043879)
- **Claims:** "results within 10 days" on one Walmart listing. "Safe for kids and animals" "when used correctly".
- **Reviews:** too thin to summarise. One Walmart listing shows about 3 stars from 1–2 reviews. [Walmart](https://www.walmart.com/ip/2237043879)
- **Channels:** hardware co-ops (Ace, True Value), Walmart marketplace.

### D. See Spot Run: natural microbial concentrate
- **Positioning:** "neutralizes the soil's high nitrogen levels, allowing new grass, sod, or seed to grow". All-natural, pet-safe, microbes. The Walmart title uses "Cures & Prevents", which is an outcome claim NWS cannot make. [Walmart](https://www.walmart.com/ip/See-Spot-Run-Lawn-Protectant-Cures-Prevents-Dog-Urine-Spots-Safe-Effective-Natural-Lawn-Care-Product-Excellent-Grass-Saver-Pets-Aid-Lawn-Fertilizer-1/583815409)
- **Price:** 64 fl oz at $59.99 ($0.94/oz) or $39.99 ($1.25/fl oz as Chewy itself shows; the two Chewy pages conflict). 64 oz covers 5,000 sq ft. The gallon claims 20,000+ sq ft at 2–3 oz/gal (no price found). 32 oz at $39.99 at Bath Garden Center, sold out. [Chewy](https://www.chewy.com/see-spot-run-dog-urine-grass-saver/dp/179900), [Chewy brand page](https://www.chewy.com/f/see-spot-run_f1v501564), [Bath Garden Center](https://shop.bathgardencenter.com/item/850434002503)
- **Offers:** Chewy Autoship discount (amount not captured).
- **Reviews:** 3.5 stars from 167 reviews on Chewy vs. 4.5 from 188 on Walmart (search snippet). A blog reviewer describes reapplying every four weeks. [Ralph's Way](https://ralphsway.com/see-spot-run-lawn-protection-reviews/)
- **Channels:** Chewy, Walmart, garden centres.

### E. BioAdvanced Dog Spot Lawn Repair (ready-to-spray): big-brand "green in days"
- **Claims (manufacturer sheet, via search snippet):** 32 oz covers up to 4,000 sq ft. Stops lawn burn "by absorbing excess nitrogen", "eliminates odors", returns grass "to green in just days". **Money-back guarantee**. Safe for kids and pets when used as directed. I found no price. [Salsify spec sheet](https://sites.salsify.com/9ecad8fa-7766-44b3-94ed-29101ebe606b/ae45b22a-4de0-48de-bd24-763e74851cde/product/00840216202412/820241B-BioAdvanced-Dog-Spot-Lawn-Repair-Ready-to-Spray-32-oz/), [label PDF](https://images.salsify.com/image/upload/s--BMjpLhuN--/dhynubsrgkulvhacpmdf.pdf)
- **Why it matters:** this is the "fast green" promise NWS is not allowed to make. NWS should not try to compete on speed and should contrast on mechanism and honesty instead.

### F. Cosmetic green-dye sprays (e.g. "Dog Spot Repair Green Grass Paint")
- 32 oz at $31.95 on Walmart. A colorant for urine spots and brown patches (search snippet; one snippet cites about 1,443 reviews, which I could not verify directly). [Walmart](https://www.walmart.com/ip/seort/5632318015)
- **Why it matters:** this is the category NWS's "not a dye" message is aimed at. Big review counts show real demand for the quick cosmetic fix.

### G. Prevention-at-the-dog products (indirect competitors)
- **Dog Rocks:** $16.99 for a 2-month supply on Chewy, with first-time Autoship at $11.04 [Chewy](https://www.chewy.com/dog-rocks-lawn-burn-patch/dp/48201). The claim is "paramagnetic" rock that filters nitrates from drinking water, with results in "3-5 weeks". GardenMyths calls the mechanism unlikely or insignificant. [GardenMyths](https://gardenmyths.com/dog-rocks-lawn-burn/), [Jollyes](https://www.jollyes.co.uk/dog-rocks.html). Jollyes reviews are mixed: some say patches recovered, some gave up after a year.
- **NaturVet GrassSaver:** an oral supplement (tablets, wafers, soft chews). 250 ct at $33.99, or $16.99 first Autoship, on Chewy. [Chewy](https://www.chewy.com/naturvet-grasssaver-chewable-tablets/dp/36802), [PetSmart](https://www.petsmart.com/dog/cleaning-supplies/waste-disposal/naturvet-grasssaver-plus-enzymes-wafers-5122975.html)
- **Shared message:** "fix it inside the dog". NWS's existing hook "Your dog is not the problem" is a direct counter to this.

### H. Brands in the brief I could not verify
- **Simple Lawn Solutions:** I found no dog-spot product in search, and the site fetch was blocked. Not profiled.
- **PetiGreen:** the only listing found was a South African price aggregator (16 oz). The claim there is that it "restores the soil's ability to metabolize the excess nitrogen", applied every 6–8 weeks, reseeding 3 weeks later. I found no US price, and petigreen.com did not resolve. [PriceCheck](https://www.pricecheck.co.za/offers/245287322/Petigreen%2BStop%2BDog%2BUrine%2BDamage%2BTo%2BYour%2BLawn%2B16%2BOz)
- **Dogonit:** only a newspaper mention, as a product that helps "neutralize the nitrogen and remove salts". No price found. [Star-Advertiser](https://www.staradvertiser.com/?p=827296)
- **Jonathan Green:** I found no dog-spot product. Mag-I-Cal is a calcium/pH amendment, not a spot product. [True Value](https://www.truevalue.com/product/mag-i-cal-pelletized-calcium-fertilizer-covers-15-000-sq-ft/)
- **Southland Organics Dog Spot** (found instead): quart at $18.50, "encapsulates the nitrogen", 3.9 average from 13 reviews (search snippet). [Southland](https://www.southlandorganics.com/products/dog-spot-for-lawns)
- **Amazon top sellers:** amazon.com was blocked, so I could not get best-seller rank data.

### Nature's Way Soil (for reference)
- 32 oz $29.99 ($0.94/oz). 1 gal $59.99 ($0.47/oz) per `data/products.ts`. Landing-page bundle of 32 oz + 1 gal for $49.99 (160 oz, about **$0.31/oz**). Usage is 4 oz per gallon of water for fresh spots, so 32 oz makes about 8 gallons of mix (derived, about $3.75 per mixed gallon at list price). **No coverage figure (sq ft or spots) appears anywhere on the page.**
- Also listed on Walmart at $29.99 (search snippet) [Walmart soil-neutralizer category](https://www.walmart.com/c/kp/soil-neutralizer) and on Amazon (B0FG38YYJ5; listing not fetchable).

---

## 2. Comparison table

| Brand / product | Type | Size | Price seen | $/oz (derived) | Coverage claim | Key promise | Offer / guarantee | Review signal (as seen) |
|---|---|---|---|---|---|---|---|---|
| **NWS Dog Urine Neutralizer** | Liquid enzymes + humic, no dye | 32 oz / 1 gal / bundle 160 oz | $29.99 / $59.99 / $49.99 | $0.94 / $0.47 / $0.31 | **none stated** | Soil-level recovery over time | 15% direct (not shown on page); 30-day returns on unused (not shown on page) | No real reviews shown; page uses unsourced "Verified customer" quotes |
| Sunday Pet Patch | RTS humic + seaweed + iron | 42.3 oz | $17.96–$24.99 | $0.42–$0.59 | 50 spots / 2,500 sq ft | Repair + thick regrowth, no pesticides | n/a | ~4.5 / ~300 ratings (Walmart) |
| Scotts EZ Seed Dog Spot | Seed + mulch + amendment | 2 lb | $16.44–$22.99 | n/a ($0.16–0.23/spot) | 100 spots | Patch and regrow | n/a | 3.2–4.3 by SKU; germination complaints |
| Turf Titan K9 Correcter | Liquid bacteria/enzymes/humates | 32 oz | $23.99–$35.23 | $0.75–$1.10 | 6,000–8,000 sq ft | Neutralize nitrogen, results in 10 days | n/a | Too few reviews |
| See Spot Run | Liquid microbes concentrate | 64 oz / 1 gal | $39.99–$59.99 (64 oz) | $0.62–$0.94 | 5,000 sq ft (64 oz) | "Cures & prevents" | Chewy Autoship | 3.5/167 Chewy; 4.5/188 Walmart |
| BioAdvanced Dog Spot RTS | Ready-to-spray | 32 oz | not found | n/a | 4,000 sq ft | "Green in just days" | Money-back guarantee | not found |
| Green grass paint | Colorant | 32 oz | $31.95 | $1.00 | n/a | Instant cosmetic green | n/a | Large count reported (unverified) |
| Dog Rocks | In-bowl rock | 2-month supply | $16.99 ($11.04 first Autoship) | n/a | n/a | Filters nitrates from water | Autoship | Mixed; mechanism disputed |
| NaturVet GrassSaver | Oral supplement | 250 ct | $33.99 ($16.99 first Autoship) | n/a | n/a | Fix it in the dog | Autoship | not captured |

---

## 3. White space Nature's Way Soil can own

1. **"No dye, no iron green-up, nothing cosmetic."** Dyes sell on instant color. Even Sunday adds iron "for extra greening", and BioAdvanced promises green "in just days". NWS is the honest no-cosmetics option, and it is the only one in this set that says so plainly.
2. **"Soil prep before seed."** Scotts' main complaint is poor germination. PetiGreen's own directions say to reseed 3 weeks after treating. NWS can own the step before reseeding, positioned as a partner to seed rather than a rival ("stop reseeding into burned soil").
3. **"Your dog is not the problem."** Dog Rocks and GrassSaver put the blame on the dog. NWS treats the lawn and leaves the dog's water and diet alone, which counters a mechanism that independent critics dispute.
4. **Family-farm soil expertise.** The competitors are big-box brands (Scotts, BioAdvanced, Sunday) or single-SKU niche brands. None tells a farm or soil-biology origin story. Our page mentions a "soil-focused small business" but shows no farm, no people and no real bottles. It uses an Unsplash stock dog photo, which goes against the brand's voice rules.
5. **Value at volume.** At about $0.31/oz the bundle has the lowest per-oz price in this set of liquids, and it lands well for multi-dog yards with repeat spots. Today the page does not explain it this way.
6. **Honest expectations.** The FAQ already says severe spots may need reseeding. Making this candour a selling point ("we'll tell you when a spot needs seed") stands out against "cures", "eliminates" and "green in days".

---

## 4. Three positioning angles (claim-rule compliant)

**Angle 1: "Fix the soil, not the color" (vs. dyes and green-up sprays)**
- Headline: **"Green paint hides the spot. We work on the soil underneath it."**
- Support: enzymes + humic acid, not a dye, no green colorants. Results come over time as soil and roots recover.

**Angle 2: "Prep the soil before you reseed again" (vs. Scotts EZ Seed and seed patches)**
- Headline: **"Stop reseeding into burned soil."**
- Support: treat the spot and the soil around it first, then reseed spots that are fully dead. Works with your seed, not against it. Builds on the existing "Stop reseeding your lawn" hook.

**Angle 3: "Your dog is not the problem" (vs. rocks and supplements), told through the family farm**
- Headline: **"Your dog is not the problem. Tired soil is."**
- Support: no changes to your dog's water or diet. Made by a family farm that works with soil biology every day. Pet-safe when used as directed.

(Avoid "cure", "eliminate", "instant", "guaranteed", "100% safe". Don't present the 30-day return policy as a guarantee.)

---

## 5. Pricing observations
- **32 oz at $29.99 ($0.94/oz)** is at the top of the per-oz range, alongside See Spot Run and Turf Titan's Walmart price. It costs more than Sunday ($0.42–0.59) and Turf Titan at Ace ($0.75). The page can justify it by explaining how far the concentrate goes (4 oz per gallon, about 8 gallons of mix), but only if coverage is published.
- **Bundle at $49.99 ($0.31/oz)** is the cheapest per oz in the set and is the best competitive lever. "160 oz for less than most 64 oz jugs" holds against See Spot Run's 64 oz at $39.99–$59.99, but it has to be date-stamped and re-checked before use.
- **The 1 gal at $59.99 costs more than the bundle at $49.99.** This undercuts trust and should be resolved (see Data flags).
- The **15% direct saving** is the best reason to buy direct over Amazon, and right now it is invisible on the page.
- Per-spot economics: Scotts works out to about $0.16–0.23 per spot and Sunday about $0.36–0.50. NWS can't make a per-spot comparison until coverage is defined.

---

## 6. Channel presence (as found)
- **NWS:** own site, Amazon (B0FG38YYJ5), Walmart listing (snippet). Social is per the brand context.
- **Sunday:** Walmart, PetSmart, Ace, DTC. **Scotts:** Amazon, Home Depot, Walmart, Ace. **See Spot Run:** Chewy, Walmart. **Turf Titan:** Ace, True Value, Walmart. **Dog Rocks / GrassSaver:** Chewy, PetSmart, with Autoship.
- Pet retailers (Chewy, PetSmart) with Autoship are a channel NWS doesn't use, and Autoship is a subscription mechanic NWS doesn't offer.

---

## 7. Competitive position sub-score: 58 / 100

| Factor | Weight | Score | Notes |
|---|---|---|---|
| Differentiation clarity | 20 | 15 | "Not a green dye" and "soil-level" are prominent in hero and FAQ. The mechanism (enzymes, humic acid) is **never named** on the page. |
| Proof / trust | 20 | 6 | No real reviews, no Amazon proof, unsourced 5-star "Verified customer" quotes (compliance risk), stock dog photo, no farm story. |
| Offer vs. competitors | 20 | 12 | Bundle value is strong, but the 15% direct saving isn't stated, returns aren't mentioned, there's no subscription/Autoship equivalent, and the 1 gal costs more than the bundle. |
| Spec completeness | 15 | 5 | No coverage (sq ft or spots), no dilution rate, no ingredients. Every major competitor lists coverage. |
| Expectation honesty / compliance | 15 | 13 | Good: "over time", reseeding caveat, "use according to label". Points lost for the testimonials. |
| Head-to-head framing | 10 | 7 | Positions against dyes but never addresses seed patches, rocks or supplements. |
| **Total** | 100 | **58** | |

**Quickest gains:** name the ingredients and mechanism; publish coverage and dilution; replace the unsourced testimonials with real, linked reviews; state "Save 15% direct" and "30-day returns on unused products"; fix the price inversion between the 1 gal and the bundle; add a dye vs. seed vs. rocks vs. NWS comparison block; swap the stock photo for real farm and bottle imagery.

---

## Sources
- Repo: `/home/user/best/pages/dog-urine-lawn-repair.tsx`, `/home/user/best/data/products.ts`, `/home/user/best/config/top-products.json`, `/home/user/best/marketing/brand-context.md`
- https://www.walmart.com/ip/seort/7633866441 · https://www.petsmart.com/pet-parents/home-and-yard-cleaning/outdoor-care/sunday-pet-patch-ready-to-spray-lawn-repair-for-pet-spots--for-all-grasses--423-oz--2500-sq-ft-97646.html · https://www.acehardware.com/departments/lawn-and-garden/lawn-care/lawn-fertilizers/7038634
- https://hemlockhardware.com/products/700842-scotts-ez-seed-2-lb-covers-up-to-100-dog-spots-sun-shade-grass-patch-repair · https://slickdeals.net/f/17742117-2-lbs-scotts-ez-seed-mixed-sun-or-shade-pet-dog-spot-grass-repair-seed-9-09-free-s-h-w-walmart-or-on-35 · https://slickdeals.net/f/16830080-2-lb-scotts-ez-seed-dog-spot-grass-repair-for-sun-shade-11-85-free-shipping-w-prime-or-on-25 · https://www.acehardware.com/p/7283716 · https://scottsmiraclegro.com/en-us/brands/scotts/products/grass-seed/17530A.html · https://scottsmiraclegro.com/en-us/brands/scotts/products/grass-seed/17530B.html · https://fakespot.com/product/scotts-ez-seed-sun-shade-17530-dog-spot-repair · https://homedepot.com/p/reviews/Scotts-2-lbs-EZ-Seed-Dog-Spot-Repair-Sun-and-Shade-Grass-Seed-and-Mulch-Combination-17530/206605408/1
- https://www.acehardware.com/p/7040585 · https://www.truevalue.com/product/744574/turf-titan-k9-correcter-32-oz-6000-sq-ft-coverage-yellow-lawn-spot-repair-744574/ · https://www.walmart.com/ip/2237043879
- https://www.walmart.com/ip/See-Spot-Run-Lawn-Protectant-Cures-Prevents-Dog-Urine-Spots-Safe-Effective-Natural-Lawn-Care-Product-Excellent-Grass-Saver-Pets-Aid-Lawn-Fertilizer-1/583815409 · https://www.chewy.com/see-spot-run-dog-urine-grass-saver/dp/179900 · https://www.chewy.com/f/see-spot-run_f1v501564 · https://shop.bathgardencenter.com/item/850434002503 · https://ralphsway.com/see-spot-run-lawn-protection-reviews/
- https://sites.salsify.com/9ecad8fa-7766-44b3-94ed-29101ebe606b/ae45b22a-4de0-48de-bd24-763e74851cde/product/00840216202412/820241B-BioAdvanced-Dog-Spot-Lawn-Repair-Ready-to-Spray-32-oz/ · https://images.salsify.com/image/upload/s--BMjpLhuN--/dhynubsrgkulvhacpmdf.pdf
- https://www.walmart.com/ip/seort/5632318015 · https://www.walmart.com/c/kp/soil-neutralizer
- https://www.chewy.com/dog-rocks-lawn-burn-patch/dp/48201 · https://gardenmyths.com/dog-rocks-lawn-burn/ · https://www.jollyes.co.uk/dog-rocks.html
- https://www.chewy.com/naturvet-grasssaver-chewable-tablets/dp/36802 · https://www.petsmart.com/dog/cleaning-supplies/waste-disposal/naturvet-grasssaver-plus-enzymes-wafers-5122975.html
- https://www.pricecheck.co.za/offers/245287322/Petigreen%2BStop%2BDog%2BUrine%2BDamage%2BTo%2BYour%2BLawn%2B16%2BOz · https://www.staradvertiser.com/?p=827296 · https://www.truevalue.com/product/mag-i-cal-pelletized-calcium-fertilizer-covers-15-000-sq-ft/ · https://www.southlandorganics.com/products/dog-spot-for-lawns
