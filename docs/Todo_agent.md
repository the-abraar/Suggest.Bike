# Todo — agent

See also `UI_AUDIT.md`. Every audit item there was resolved on 2026-10-06; the open work below is what remains.

Work an AI coding agent can pick up without the owner. Ordered by impact. Each item names the files involved and what "done" means. Run `node scripts/validate-data.mjs`, `npx tsc --noEmit` and `npm run build` before calling anything done. If data changes, run `node scripts/sources.mjs` too.

## P0 — Trust and correctness

- [ ] **Re-check the data the research flagged as shaky.** Fix it in `src/data/bikes.json` and update `priceAsOf`/`sources`:
  - Hornet 2.0: BD-spec power/torque (16.6 PS / 15.9 Nm per BikeBD vs 17.03 / 16.1 used).
  - TVS Stryker 125: gears, tank and seat height. Metro Plus: kerb weight. Discover 125: tank (8 L vs 11 L).
  - Hunk 150R: power/torque. Saluto: carb vs FI. XSR155: ABS. Access 125: brakes. SP160: ABS on the single-disc variant.
  - Vespa VXL: carb vs FI. KTM Duke 125 / RC 125: still in stock in BD? (India discontinued both in 2025.)
  - Conflicting prices: Gixxer Monotone, X-Blade, Ray ZR 125, R15 V4 BS7.
- [x] ~~**Show a "how sure are we" marker.**~~ *Partly done: an `approx` tag marks estimates. A per-field `confidence` value is still open.* Add an optional `confidence` (`"high" | "medium" | "low"`) per field group to the `Bike` type. Show a small "estimate" badge next to mileage and parts prices on `/bikes/[id]` and `/compare`.
- [ ] **Registration cost for 250–350cc.** Find a real itemised receipt, or a BRTA source, for a >165cc registration. Update `guide.json → registration.bands` and drop the "low" confidence.
- [ ] **CBU >165cc import status** under Import Policy Order 2026–29. Settle the conflicting reports (Dhaka Times vs Desh Rupantor/Bangla Tribune) from the gazette PDF, then update `guide.json → ccPolicy` and the guide copy.
- [x] ~~**Translate bike content into Bangla.**~~ *Done: `bn` field on every bike.* Add `bn` versions of `tagline`, `feel`, `quirks`, `braking`, `mechanicNote`, `pros`, `cons` and `bestFor`, either as optional `*Bn` fields or a parallel `bikes.bn.json`. Today a Bangla visitor gets an English bike page.
- [x] ~~**Translate generated strings.**~~ *Done.* Match reasons and warnings (`src/lib/match.ts`), compare row labels, the cost page and the guide page are English-only. Move them into `src/lib/i18n.tsx`.

## P1 — Product

- [x] *(done 2026-10-14 for 9 brands from official locators; Runner, GPX, Haojue, Vespa, Aprilia, Zontes, Walton have no official count)* **Fill `src/data/networks.json`.** Per brand: distributor, showroom and service-centre counts, divisions covered, dealer-locator URL, sources and confidence. The "Where do you ride" quiz step already uses it.

- [ ] **Electric bikes.** The schema can't describe EVs (cc, stroke, carb/FI). Add `powertrain: "ice" | "ev"` with battery kWh, range and charge time. Then add Revoo, Walton Takyon, etc., and a "cost per km vs petrol" comparison.
- [x] ~~**Used-market prices for on-sale bikes.**~~ *Done for 40 bikes (`usedPrice`). Extend coverage to the remaining 32, and let the cost model use it instead of `yearlyRetention`.* Add "1-year-old" and "3-year-old" used prices (from bikroy.com listings) next to the resale estimate. This replaces the formula in `src/lib/cost.ts → yearlyRetention`.
- [ ] **Price history.** Store `priceHistory: { month, priceBDT }[]` and draw a small sparkline on the detail page. People want to know whether to wait.
- [x] ~~**Matchmaker: city/region question.**~~ *Done in code. `src/data/networks.json` is still `{}`: research per-brand showroom and service-centre counts (shape `BrandNetwork` in `src/lib/types.ts`) and fill it.* Dealer and service network matters outside Dhaka/Chattogram. Weight `mechanicFamiliarity`/`partsAvailability` higher for district riders. Needs dealer-count data per brand (see the owner todo).
- [x] ~~**Matchmaker: EMI / monthly budget mode.**~~ *Done (plain 12-month split). Bank-specific terms are still open.* Many buyers think "৳8k a month", not "৳2.5 lakh". Let them enter a monthly budget and convert it using typical bank and dealer EMI terms.
- [ ] **Women riders / scooter path.** Add a dedicated landing section: seat height filter, weight, scooter comparisons, and a guide to scooter licensing.
- [x] ~~**Shareable compare images.**~~ *Bike and site OG images are done. Compare/result images need a server or edge function because they depend on the query string, so they're still open.* Generate an OG image for `/compare?bikes=…` and `/bikes/[id]` so links look good on Facebook and Messenger, where BD bike talk happens. Use `next/og` at build time, since this is a static export.
- [x] ~~**"Report a wrong price" button**~~ *Done (mailto).* on each bike page. It should open a prefilled form or `mailto:` with the bike id and current price.
- [x] ~~**Real photos.**~~ *Done where a verified Wikimedia Commons photo exists. Add more, and colour swatches.* Let `Bike` carry `image?: { src, credit, license }`. Make `BikeArt` fall back to the illustration. Keep the 5:3 frame.

## From the ResearchingStuff review (2026-10-13)

Full findings and file references: `docs/researching-stuff-uses.md`. Every number there is a lead from a 2026-10-13 snapshot: re-fetch it at its cited source (official URL first) before editing, and record `priceAsOf`/`asOf` and the source. Never copy ResearchingStuff text or BikeBD tables verbatim.

- [x] *(done 2026-10-14)* **Fix ResearchingStuff first.** The Padma Bridge rows in `rules/00-overview.md`, `rules/roads-and-restrictions.md` and `rules/recent-changes-and-news.md` say motorcycles are still banned; they were allowed again from 20 Apr 2023 (the site is right).
- [x] *(done 2026-10-14)* **Price corrections** (`npm run audit:prices`): Honda Dio (৳1,99,000 vs ৳1,57,000 on the cited page), KTM RC 125 (৳3,70,000 vs ৳4,43,000), Pulsar N250 and F250 (official ৳3,60,000 / ৳3,65,100), Yamaha Fazer FI V2, FZS FI V4, FZ-X, FZS FI Hybrid and R15 V4 (all ৳1-5k high), V-Strom SX 250 (৳4,49,000 vs the owner-reported ৳4,50,000 regular price in `offers.json`; also missing from Suzuki's official list).
- [x] *(done 2026-10-14 except Access 125 and GSX-R150 weights: Suzuki spec API unreachable)* **Spec corrections in `bikes.json`:** Discover 125 tank 8 L; CT100 7.7 PS / 8.24 Nm / 111 kg (currently copied from Platina); Ray ZR 125 9.7 Nm; Hunk 150R 148/149 kg; NS125 141 kg; Pulsar 150 144 kg, 13.4 Nm; N160 154 kg; GSX-R150 131 kg; Access 125 102 kg, 10.2 Nm; Platina tank 11.5 L; Apache RTR 160 4V top speed (official 113 km/h); Zontes ZT155 U distributor (Mototech vs MotoSolution).
- [x] *(done 2026-10-14: both reported, marked unconfirmed)* **guide.json corrections:** *s.84 done 2026-10-13 (the Act says 1-3 years, up to Tk 3 lakh, or both; non-bailable per s.117). Still open:* TIN for >150cc vs return proof (PSR) for >165cc after the 2026 Finance Act; whether the IDRA motor-liability pilot (৳1,006, used by /cost insurance) continued past Aug 2026.
- [x] *(done 2026-10-14; speed limits and e-fines got their own pages)* **Extend `guide.json` laws (EN+BN):** speed limits (flag the conflicting highway figures), phone while riding (s.92(2)), 12-point demerit system, accident duty (s.62/95, call 999), police-stop rights (charge copy, receipt, impound release), RFID and front plate, Dhaka AI-camera e-fines and the fake-SMS warning.
- [x] *(done 2026-10-14: speed-limits, driving-licence, e-fines)* **Bangla rules-and-fines pages** *(fines page done 2026-10-13: `/guide/motorcycle-fines/` + BN, covering fines, helmet, points, police stop, accident duty and the 2024 draft. Still open: speed limits, licence steps, AI-camera e-fines; see `docs/seo-log.md` Next)* (`/guide/<slug>` + `/bn/guide/<slug>`) from `rules/penalties-table.md` and siblings, with statute section numbers, an as-of date and a "not legal advice" line. Mark the 2024 amendment "cabinet-approved, not enacted"; never present draft policy as law. Owned by the SEO agent (`.claude/agents/seo.md`).
- [x] *(done 2026-10-14)* **Used-bike checklist additions** (`guide.json` `usedChecklist`): online ownership transfer at bsp.brta.gov.bd with seller biometric, same day (BRTA, 1 Sep 2026); VIN origin prefixes (ME1, MD2, MD6, ME4, MBL); FZS V2/V3/V4 and Gixxer generation tells. The late-fine waiver until 29 Oct 2026 is time-boxed: add it with an end date or skip it.
- [x] *(official-source ones done 2026-10-14; single-source list still open)* **Cheap volume bikes with official sources:** Yamaha FZS V2 DD (৳2,34,000), Suzuki Gixxer carb DD (৳2,37,950) and Classic Matt (৳2,05,950), Bajaj Discover 110 (৳1,49,600), Platina 110 H (৳1,40,100). Then single-source: Hero Passion Xpro, Xtreme 160R 4V, Pleasure; TVS Max 125, Metro; Runner Turbo 125; Honda SP160 SD, Shine 100 DX.
- [ ] **Market snapshot** on `/method` or `/about`: brand shares (cite both reports where they disagree), the TVS 2025 sales collapse, and the fact that no model-level sales data exists.
- [x] *(rules done 2026-10-14; new EV models still open)* **EV guide section:** whether e-bikes need registration (pedal e-bikes exempt; 5 kW slab), imports vs registrations, VAT 5% to 2030. Use `ownership/ev-rules-and-market.md` and `history/electric.md` as leads for new EVs (Yadea via Runner, Walton Takyon).
- [x] *(bike-page line done for 5 brands 2026-10-14; legend pages still open)* **Brand history line** on bike pages ("in Bangladesh since…": BHL 2013, ACI-Yamaha 2016, Rancon-Suzuki 2012, Niloy-Hero 2014) and short history on the 4 used-only legend pages (RX100, CG125, CBZ, H100S). Dated company facts only, no pre-2013 lore.
- [ ] **Small anchors:** fuel price history Jan 2024 → Sep 2026 (+36%) on /cost or /changes; check `dealers.json` hotlines (Suzuki 16638, Yamaha 16533).
- Do not use: the Keeway/Benelli/Kawasaki/KTM "upcoming" tables, empty Walton rows, 2015-2019 duty fragments, the "Tk 518 tax token" item, Indian warranty figures.

## New-owner and maintenance pages (added 2026-10-13)

`/owner/` and `/maintenance/` (+ `/bn/` twins) are live with generic starter content. Posts live in `src/lib/maintenance-posts.ts`; keep slugs stable. The owner rewrites the text over time, so add content in the same shape and mark nothing "coming soon".

- [x] *(done 2026-10-14)* **Series 2: seasonal and "before it breaks".** Spark plug check; coolant and radiator (liquid-cooled bikes); clutch and throttle cable free play and lube; headlight bulb and fuse swap; washing the bike without damaging it; long-term parking and storage; winter starting.
- [x] *(done 2026-10-14)* **Series 3: buying and owning smart.** Service schedule explained (what the 1st, 2nd and 3rd free services cover); what a fair workshop bill looks like and how to spot upselling; genuine vs duplicate parts and how to tell; fuel and mileage habits that save money; warranty: what voids it.
- [x] *(done 2026-10-14)* **Series 4: safety and riding skills.** Helmet buying and care (ISI/DOT marks, replacing after a crash); riding in rain and fog; night riding; emergency braking; pillion and luggage load; what to do after a crash or breakdown (documents, insurance, police).
- [ ] **Series 5: model-specific cheat sheets.** One page per top seller (tyre pressure, oil grade and quantity, chain slack, service interval) from the manual, linked from `/bikes/[id]`. Needs the owner to verify each figure against the manual.
- [ ] **Post features.** Photos or short videos per step (owner's own); a printable monthly checklist; "ask a mechanic" Q&A; link each `/bikes/[id]` page to the relevant guides; bike-specific ThrottleIQ intervals once the app exposes them.
- [x] *(done 2026-10-14)* **`/owner/` additions.** First-service booking checklist; insurance for new owners (link to the guide); theft prevention and what to do if the bike is stolen; a "first month" timeline.
- [ ] **Needs the owner.** Review and personally rewrite the 8 starter posts; supply photos; confirm the ThrottleIQ description and add a store or download link when one exists (the card currently links to the GitHub repo).

## Bike spotlights and comments (added 2026-10-15)

Spotlight posts live in `src/lib/spotlight-posts.ts` and render at `/spotlight/` and `/spotlight/<slug>/` (+ `/bn/` twins, sitemap, footer link). Prices, mileage, power and scores in the text are read from `bikes.json`, so they never go stale; quiz figures come from `docs/each bike speciality.html` (regenerate it if `match.ts` changes). `tests/spotlight.test.ts` fails if a bike repeats, a week has other than 5 bikes, or a week repeats a category.

- [x] *(done 2026-10-15)* **Week 1:** Lifan Glint 100 (budget), Hero HF Deluxe (mileage and running cost), Yamaha FZS FI V4 (resale), Suzuki GSX-R150 (most fun), Royal Enfield Meteor 350 (highway).
- [ ] **Weekly spotlight, every week.** Publish 5 bikes that win 5 different categories of section 3 of `docs/each bike speciality.html` (budget, resale, mileage, looks, reliability, cheap to maintain, fun, highway, Dhaka traffic, first bike, pillion/family, broken roads, safety, value). Add them with the next `week` number. Never repeat a bike until every bike has had a week (the test enforces this); when a category winner is already used, take the best unused bike in that category. Suggested week 2: Hero Splendor+ (value for money), Honda Shine 100 (Dhaka traffic / first bike), Honda Dream 110 (reliability), TVS Raider 125 (broken roads), Yamaha R15 V4 (looks). Pick the rival for each from `POPULAR_COMPARISONS` where one exists.
- [ ] **Email OTP for commenters (later).** Today comments are name + email + text, sent through the feedback form (`FeedbackForm kind="comment"`) and published only when the owner copies them into `src/data/comments.json`; the email is not verified. Add one-time-code email verification before a comment is accepted. The site is static, so this needs a third-party service (e.g. a form service with email confirmation, or a small serverless function); the owner picks it (`Todo_owner.md`). Keep the email out of the repo and off the page.
- [ ] **Owner reviews (after OTP).** Once commenters are verified, let people write a review of a bike they own (rating, km ridden, real mileage, what broke), shown on `/bikes/[id]` and its spotlight post, moderated the same way. Reuse the "I own this" report fields in `src/lib/report.ts`.

## P2 — Engineering

- [x] **Per-bike Bangla URLs** (`/bn/bikes/[id]`) *(done 2026-10-13)* so Google indexes the Bangla pages. Today the language is client-side only.
- [x] **Static OG/meta for client pages.** *Done: each listed route's `page.tsx` has a `metadata` export (verified 2026-10-13).* `/`, `/bikes`, `/match`, `/compare`, `/cost` and `/saved` are client components with only the layout's default metadata. Split them into a server `page.tsx` (with metadata) plus a client view.
- [x] *(unit tests done 2026-10-14; route sweep is tools/qa, not CI)* **Tests.** Unit-test `matchBikes` (budget ceiling, no scooters when `gearless:"no"`, the seat-height penalty), `ownershipCost` (renewal maths for the 2-year plan) and `formatLakh`. Playwright smoke test for every route at 390px and 1440px, failing on horizontal overflow.
- [x] *(done 2026-10-14; open: quiz pre-selected defaults, compare add-slot Escape drops focus)* **Accessibility pass.** Keyboard-only run through the quiz, compare add-slot and search combobox. Check focus rings, colour contrast of `text-faint` (likely under 4.5:1), and the switch markup in `/bikes` (a button nested in a label).
- [x] ~~**Performance.**~~ *Done: slim index plus per-bike files.* `bikes.json` (≈200 KB) ships to every client page. Split it into a slim list index plus per-bike details loaded on the detail page.
- [ ] **Data pipeline.** Write a script that re-scrapes BikeBD price pages monthly and opens a PR with the diffs. Fold in `scripts/validate-data.mjs`.
- [ ] **Analytics hooks** (privacy-friendly, e.g. Plausible/Umami) for quiz completion, most-compared pairs and the cost calculator. Waiting on the owner to choose a provider.

## Documentation

- [x] **Write a PRD in ASD-STE100 format.** *Draft done 2026-10-13 in `PRD.md`; owner review and a check against the real STE dictionary are open.* Cover the matchmaker, compare, cost and guide features and the data pipeline: problem, users, goals and non-goals, functional and non-functional requirements, constraints and success metrics. Follow ASD-STE100 (Simplified Technical English): use only approved words and their approved meanings, keep procedural sentences to 20 words or fewer and descriptive sentences to 25 or fewer, write one instruction per sentence, use the active voice, and use the imperative for procedures. Save it as `PRD.md`.
