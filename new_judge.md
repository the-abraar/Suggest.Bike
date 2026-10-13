# Suggest.Bike: new judge (2026-10-13)

Harsh review written 2026-10-13, followed by a log of the build rounds that answer it. Read **Progress log** (the last section) first.

**One line:** a well-built brochure that copies prices from BikeBD, scores bikes with editorial numbers, and gives nobody a reason to switch: 11.8k LOC, 6 half-tools, 76 bikes, no users, no feedback loop and no "next step" at the moment of purchase.

Fact correction: the older `judge.md` says the domain is parked. It is not: `suggest.bike` returns 200 from GitHub Pages (checked 2026-10-13).

---

## 1. The core thesis doesn't hold up

- **Downstream of the incumbent.** 87% of prices come from bikebd.com. Every "source: BikeBD" link sends the user to the competitor, which has years of SEO, a Facebook group, YouTube and showroom contacts.
- **"Honest" claims rest on nothing.** The 11 ownership scores, "real-world mileage", parts prices and mechanic notes are editorial estimates with no author, method or owner data. Every ranking, verdict and crown is a weighted sum of them. One Facebook comment ("Platina doesn't give 70 kmpl, I get 55") breaks the brand, because honesty *is* the pitch.
- **No face.** Bangladeshi buyers trust a cousin, a mistri, a YouTuber or a Facebook group: people. The site is anonymous with an "Editor's shortlist" and no editor.

## 2. Why people won't use it (ranked)

1. **Can't be found.** 76 bike pages against BikeBD's thousands. No `/bn/` routes; the Bangla toggle is client-side so Google sees English only. Real queries ("pulsar 150 dam koto", "১৫০ সিসি বাইক দাম") cannot rank.
2. **Can't be shared.** Bangladesh runs on Facebook and Messenger; there are no OG images, so shared links are bare URLs.
3. **Can't be trusted.** Anonymous, editorial, copied prices.
4. **Dead end at intent.** After match, detail and compare there is no showroom, phone number, current offer, test ride or price alert. Users leave at the point they become valuable, which is also why there is no business model.
5. **No reason to return.** Prices change by hand monthly; no alerts; the shortlist lives in localStorage.

## 3. The matcher is wrong in ways users notice (`src/lib/match.ts`)

- **Budget is ex-showroom, not on-road.** "Total you can pay" admits bikes up to 6% over (`cap = budget * 1.06`) before BRTA registration. A ৳2,00,000 buyer can see a ৳2,12,000 bike that is ~৳2.3L+ on the road. `/cost` already computes `onRoad`; the matcher ignores it.
- **`budgetFit` penalises cheaper bikes symmetrically** (`1 - |log(price/budget)|`). A budget is a ceiling, not a target; the engine quietly upsells.
- **EMI = monthly × 12.** No down payment, no 3/6/18/24/36-month tenures, though the guide says they exist.
- **"Where you live" is silently a no-op** when `networks.json` is empty (`HAS_NETWORKS`), hitting village users hardest.
- **0-100 score is false precision** built from integer 1-10 editorial inputs.
- **Height check is seat height only;** `short` cuts at 785 mm while most commuters sit at 780-800 mm, so the warning is near random. Seat width and weight are ignored.
- **Gearless is binary-excluding;** "either" is the only middle ground.
- **Used mode covers 40 of 76 bikes** and uses Bikroy *asking* prices, which run above selling prices.
- **The 2-stroke RX100 can be recommended** to daily commuters with a −0.04 penalty.

## 4. Data gaps a buyer hits in 30 seconds

- **No electric two-wheelers** (0 of 76), despite fuel rising ~36% in 2026 (the project's own UNB source).
- **One variant per model.** ABS vs non-ABS and single vs dual disc (where the price gaps are) are folded into a `priceNote` string.
- **Chinese brands thin** (Runner 2, Lifan 2, Haojue 1): the budget end, where first-time buyers are.
- **Zontes deleted to turn the deploy gate green** (`32e18f0`), against the old judge's own rule "Do not edit data to pass the check".
- **15 prices >40% off category median**, unreviewed (Aerox +116%). The gate checks age only.
- **Bus factor 1:** one person, one source, monthly.

## 5. Bloat

| Feature | Verdict |
|---|---|
| `/labs/check` engine-sound FFT | Its own code says it "cannot tell you what is wrong with an engine". Users will treat it as diagnosis: liability, no value. |
| `/labs/finder` + `finder/` worker + WhatsApp Cloud API | Scraper returns nothing, ToS unreviewed, hidden but reachable, a second system. |
| `/fund` loader + 4:5 poster | Cute, ported from another project; nobody needs it to choose a bike. |
| `/labs/negotiate`, `/labs/listing-check` | Clever, but serve a used journey the data half-covers. |
| `/compare` crowns | Declare winners from invented scores; amplifies the trust problem. |

Six experiments on an unproven core; the labs hub says "we don't know what this product is".

## 6. Technical gaps

- **Blind:** no analytics; feedback is mailto or a GitHub issue needing an account.
- **Static, no backend:** no crowd data, alerts or feedback store, so the only real moats (owner data, freshness) are impossible.
- **Tests test maths, not truth:** 31 engine tests pass while a +116% outlier ships.
- **JSON-LD without `Offer`:** no price rich results.
- **Agent-written code, no human review, no real-device test;** page weight and TTI on mid-range Android over patchy 4G never measured.
- **Fuel price is a constant** in `guide.json` in a year it moved 36%.

## 7. Unhandled corner cases

- Budget under ৳45k: the cheapest catalogue bike is ৳45,000, so the matcher returns nothing.
- Rideshare ignores Pathao/Uber eligibility.
- Buying for a parent or spouse: no rider-age or confidence questions.
- Showroom offer below the listed price: data wrong on publish day.
- Bike vs CNG vs used car: out of scope (fine), but that is where cost per month matters most.

## 8. Recommended direction

1. **One job:** "The on-road price and real monthly cost of any bike under ৳3 lakh, in Bangla, shareable on WhatsApp/Facebook." Kill labs, finder, fund poster/loader and crowns.
2. **Own a source of truth:** a named mistri panel scoring repairability (moat), and/or owner receipts ("what did you pay on-road, which showroom, which month").
3. **Close at the showroom:** dealer list by district with phone numbers: the best feature and the business model (lead fees).
4. Fix matcher budget logic, then Bangla routes and OG images, then analytics; soft-launch in two Facebook groups.

**Score: ~60%.** Craft is real; product-market fit is untested.

---

## Decisions taken without the owner (2026-10-13)

The owner said "make the decisions and keep building". Each is reversible via git.

1. **Cut, not hide:** delete `/labs/check` (audio/photo capture), `/labs/finder` and the `finder/` worker, the `/labs` hub, and the fund loader/poster. Keep `/labs/negotiate` and `/labs/listing-check`'s useful logic only if it folds into the used-bike section of the bike page or guide; otherwise delete. `/fund`'s cash vs EMI vs loan maths moves into `/cost`.
2. **Compare crowns become neutral "lower / higher" markers** with the scale's source named; no "winner".
3. **Matcher budget = on-road ceiling.** Budget includes BRTA registration; nothing above budget is shown unless the user opts in to "stretch" (shown separately and labelled). Cheaper bikes are not penalised. EMI takes down payment and tenure (3/6/12/18/24/36; 0% only up to 12 months).
4. **Scores shown as bands** (e.g. "Strong / OK / Weak") with a method page, not 0-100.
5. **No fabricated contacts.** Dealer/showroom data only from official distributor pages with a source URL and date; where none is verifiable, link to the distributor's own locator.
6. **Backend-free intake:** feedback and owner reports post to a Formspree-compatible endpoint configured in `src/lib/site.ts`; until the owner sets it, they fall back to a prefilled email. No GitHub account needed. Owner task: create the endpoint.
7. **Analytics:** privacy-friendly GoatCounter script, inert until the owner sets the site code in `src/lib/site.ts`. Owner task: create the account.
8. **Bangla SEO:** real server-rendered `/bn/...` routes with hreflang and Bangla metadata; the toggle navigates between them.
9. **Data:** re-add Zontes with a fresh source; add EVs, variants (ABS/disc) and more Chinese brands only with dated, cited sources; the validate gate fails on unexplained outliers and stale fuel prices, not just stale bike prices.
10. **What code cannot fix** (stays owner work): lawyer review, a named mistri panel, real users, real-device testing, showroom lead deals. Code builds the intake and the method page so these can start.

---

## Progress log

### Round 1 (2026-10-13, started)

Planned, in parallel worktrees: (A) matcher logic, (B) cut bloat, (C) data and gates, (E) trust and purchase journey (method page, dealers, feedback, owner reports, analytics hooks). Round 2: (D) Bangla routes, OG images, JSON-LD Offer, and a real-browser QA pass with page-weight numbers.

#### Round 1, B: cut bloat (merged `6c51f78`)
- Deleted `/labs` (hub, check, finder, listing-check, negotiate) and their libs/data/tests, the `finder/` worker and its nightly workflow, `prototypes/`, `/fund` (loader, poster, `src/components/fund/`), the Experimental badges, and the mic/finder text and 65-day retention line in privacy.
- `/cost#pay` now has a compact cash vs 0% card EMI (12 mo) vs loan (14%, 24 mo, 30% down) table; `fund.ts` keeps only `loanEmi` and `payPaths` (tested).
- Compare: no crowns or "wins most"; measured rows get ↓/↑ markers; editorial rows show values only, with a link to `/method`; four score-only verdicts were removed.
- `src/` went from 11,929 to 5,991 LOC. `check.sh` passed in the agent's worktree (15 tests, 246 pages). Not browser-checked. `check.yml` still sets up Python (unused).

#### Round 1, A: matcher (merged `9350e2b`; on merged main, tsc passes and the tests are listed below)
- The budget is now an **on-road ceiling** (ex-showroom plus the 2-year BRTA registration from `registrationFor`); the 1.06 cap is gone. Up to 2 labelled **stretch** picks (≤10% over). Results show the on-road breakdown and the fee's as-of date.
- `budgetFit` was removed, so **cheaper bikes are no longer penalised**; ties go to the cheaper bike.
- **EMI** asks for down payment and tenure (3-36 months); 0% up to 12 months, flat 10%/yr beyond (marked as an estimate in the UI, `APPROX/UNVERIFIED` in code).
- Scores shown as **bands** (Great 88+, Good 78+, Possible). **Height** uses seat height + 0.5 mm per kg over 130 kg (short >800, medium >830). **Gearless** defaults to "either", and the other options are labelled as filters.
- 2-stroke and used-only classics get −0.30 for commute and rideshare unless fun/style is picked. **Empty state** shows the 3 cheapest options with the gap. **Used** prices are labelled as Bikroy asking prices and given a 5% haircut. "Where you live" now says it isn't used yet. Rideshare tells users to check the app's own rules (no invented rules).
- Skipped "who is riding": it doesn't map onto the weights, so the step was reworded to "Tell us about the rider".
- Risks: the band cut-offs, the 10% rate and the 5% haircut are estimates; not browser-checked at phone width.

#### Round 1, E: trust and the purchase journey (merged `8f0b7ca`; on merged main, tsc passes and 25 tests pass)
- **`/method` (+ `/bn/method`):** how every number is made, each tagged sourced / calculated / editorial, with sources, update cadence and how to correct it. "Who makes this": Abrar (The-Abraar), `hello@suggest.bike`. Linked from the footer, bike pages (under the scores) and About.
- **Score bands** on bike pages (`ScoreBar`: Strong / OK / Weak, with the raw /10 in small text) plus an "Editorial estimate — how we score" link.
- **`/dealers`** from `src/data/dealers.json`, official sources only, with `sourceUrl` and `checked` on each brand. Locator + hotline: Bajaj, Hero, Honda, Suzuki, Lifan (31 districts). Hotline only: Yamaha, GPX, Haojue. Locator only: TVS, Royal Enfield, KTM. Site link only: Runner, Vespa, Aprilia (the last two are flagged "confirm before visiting"). Bike pages get a "Where to buy" block, "Prices are re-checked monthly" and an "I own this bike" report form.
- **`FeedbackForm`** (feedback + owner reports) posts to `FORM_ENDPOINT`, or falls back to a prefilled email; validation lives in `src/lib/report.ts`, tested. **GoatCounter** stays inert until `GOATCOUNTER_CODE` is set; privacy text updated in EN and BN.
- `docs/mistri-panel.md` protocol (6 mechanics, 3 scores, ৳2,000 per session, median published when ≥5 have rated); owner TODOs added to `Todo_owner.md`.
- Merge: `LegalView.tsx` conflicted; kept the new messages and analytics lines and dropped the finder lines. Added `/method`, `/dealers` and `/bn/method` to the sitemap myself.
- Skipped: price alerts (need a backend), the quiz-completed event, a Header nav entry. Only the Honda and Suzuki hotlines were checked first-hand; the rest came via a research subagent and are listed for the owner to call.

#### Round 1, C: data and gates (merged `d6f013d`; full `check.sh` on merged main: all 6 steps pass)
- **76 → 83 bikes.** Zontes ZT155-U is back (৳3,49,000, bikebd, Oct 2026), plus 6 budget Chinese models (Runner Bolt 165R, Haojue KA135 and TR150, Lifan K19 and Glint 100, sourced from bikebd only) and **1 EV**: Walton Takyon Fusion 25TD (৳1,61,999, waltonbd.com). Only one EV: other Walton models don't publish seat height or torque, and Yadea, Revoo and Akij specs contradict themselves. Nothing was invented.
- EV schema: `engine.fuel: "electric"` + an `ev {motorW, batteryKWh, rangeKm, realRangeKm, chargeHours}` block. Cost uses electricity at Tk 9.10/kWh (BERC 201-300 slab, cited) + 15% charging loss (estimate); EVs skip chain, clutch, filter and battery wear items.
- **Outliers:** 18 (the new bikes shifted the medians), each with a note in `docs/price-resourcing-worklist.md`. Two **corrected** from Royal Enfield BD: Classic 350 ৳4,32,500 → ৳4,47,700, Meteor 350 ৳4,83,000 → ৳4,76,000. CBR150R, Gixxer 250 and NS125 confirmed on official pages.
- **Variants** (with a source per price) on 13 bikes, shown as a table on the bike page.
- **bikebd share of headline prices: 87% → 64%** (17 bikes now cite official distributor pages).
- **Gate:** an outlier needs a note of ≥40 characters; fuel and electricity `asOf` fail after 45 days; new EV and variant checks.
- Left for later: the compare page shows a derived kmpl and a "Carb" label for the EV (fixing in round 2); EV registration falls in the ≤100cc BRTA band (no EV fee schedule found); the 7 new petrol bikes have one source each; Bajaj's own N160 prices look swapped; Yamaha, Hero and TVS hide prices.

### Round 2 (started 2026-10-13 01:5x)
Usage before: 5-hour 41%, 7-day 52%. Planned: (D) Bangla `/bn/` routes for all main pages with hreflang, OG images, JSON-LD `Offer`, EV display fixes on compare; then (Q) real-browser QA + page weight on the merged site.

#### Round 2, D: Bangla SEO, OG images, Offer, EV display (merged `da1443e`; full `check.sh` on main: all 6 steps pass)
- **Bangla twins**, server-rendered for home, bikes, every bike page, match, compare, cost, guide, dealers, method and about (92 `/bn/` pages); each has a Bangla `<title>` and description. `scripts/bn-lang.mjs` runs after build and sets `lang="bn"` on every `/bn/` page (it fails the build if one is missing). Canonical + hreflang (en, bn, x-default) on both versions; the sitemap has 188 URLs.
- **The toggle navigates** to the twin URL (`LangLink` / `langHref`), keeping the query string and hash. Someone who saved Bangla as their language is redirected to the Bangla twin.
- **Pages that were empty before JS** (browse, compare, cost, match step 1) now pre-render (`WithSearchParams`).
- **OG images:** 84 real `og.png` files (they used to be extension-less files that GitHub Pages serves as octet-stream); every page has an absolute `og:image`.
- **JSON-LD `Offer`** on on-sale bikes (price, BDT, InStock, NewCondition, distributor as seller). I changed the Offer `url` from the price source (usually bikebd) to our own bike page, so rich results don't hand the click to the competitor.
- **EV:** compare shows motor kW, km/charge and kWh; no carb, kmpl or litres, and no mileage/tank markers. Match and cost use EV wording.
- Remaining: no Bangla for the legal, saved and feedback pages; the JSON-LD description and the OG image text are English; "InStock" is assumed; not yet browser-tested.

#### Round 2, Q: real-browser QA and page weight (merged `db4fe7e`; full `check.sh` on main: all 6 steps pass)
- **A bug no earlier check caught:** the inline theme/language script in `layout.tsx` threw `Invalid regular expression flags` on every page (a template literal swallowed the `\/` escapes), so saved dark mode and Bangla preferences never applied before first paint. Fixed with `String.raw`.
- `qa.mjs` now covers the current site: 18 pages × 375/768/1280 = 54 runs, **0 overflow, 0 axe serious/critical, 0 console errors**.
- **Interaction checks 14/14 pass** (Playwright, 375): quiz in total and EMI mode (on-road, bands, stretch), the ৳40,000 budget empty state (3 cheapest), the EN→বাংলা toggle keeping query and hash, and owner-report validation plus the mailto fallback.
- Other fixes: the compare page no longer marks petrol tank range "higher" than EV range; `/cost#pay` table focusable; method tag contrast; dealer date no longer wraps; unused Geist Mono preload dropped; bike photo gets `fetchPriority="high"`.
- **Page weight** (375, 1.6 Mbps/150 ms RTT, 4× CPU, cold): JS 238-302 KB compressed, CSS 11 KB, fonts 182 KB; **LCP 1.2-3.2 s** (worst: bike page 3.19 s). JS is mostly framework; no small fix.
- My follow-up: the EV owner form no longer asks for km/l (range goes in the note).
- Unverified: dark mode (it could never apply before this fix), `/bn/` page weight, a real form endpoint. Bike photos could be WebP at 800px (~half the size).

---

## Where each criticism stands now (2026-10-13)

| Criticism | Status |
|---|---|
| §1 Downstream of BikeBD | **Reduced.** bikebd share 87% → 64%; Offer/rich results point to our own pages; 17 official sources. Still the main source for 53 bikes. |
| §1 "Honest" rests on nothing | **Partly fixed.** `/method` tags every number as sourced, calculated or editorial; scores shown as bands with a link to the method; owner-report form. Scores are still editorial until the mistri panel runs. |
| §1 No face | **Fixed in code.** Editor byline and contact on `/method` and About. A real face/photo is the owner's call. |
| §2.1 Can't be found | **Fixed in code.** 92 server-rendered `/bn/` pages, `lang="bn"`, hreflang, 188-URL sitemap, pre-rendered pages. Ranking still has to be earned. |
| §2.2 Can't be shared | **Fixed.** 84 real PNG OG images. |
| §2.4 Dead end at intent | **Partly fixed.** `/dealers` + "Where to buy" from official sources (5 brands with locator + hotline). No showroom lead deals yet (owner). |
| §2.5 No reason to return | **Open.** Alerts need a backend; only "re-checked monthly" + feedback. |
| §3 Matcher (all 9 points) | **Fixed** (on-road ceiling, no upsell, EMI tenure/down payment, bands, height+weight, gearless, 2-stroke, empty state, used haircut), with tests. "Who is riding" skipped (doesn't map onto the weights). |
| §4 Data gaps | **Mostly fixed.** 83 bikes, 1 verified EV, 13 bikes with variants, +6 budget Chinese, Zontes re-sourced, outliers noted or corrected, gates on outliers and fuel/electricity age. Only 1 EV; 7 new bikes are single-source. |
| §5 Bloat | **Fixed.** Labs, finder, fund and crowns removed; `src` 11.9k → ~6k LOC before the new features. |
| §6 Blind | **Ready, switched off.** GoatCounter and the form endpoint go live once the owner creates the accounts. |
| §6 Offer, tests vs truth, fuel constant | **Fixed.** Offer added; the data gate checks outliers and fuel/electricity freshness. |
| §6 Real device | **Open (owner).** Headless Chromium only. |
| §7 Corner cases | <45k budget, rideshare (pointer to app rules), showroom offers (dealer prompt): handled. Buying for others: reworded. CNG/car: out of scope. |

**Score: ~72% (was ~60%).** Product and quality are now launch-grade; the cap is everything code can't do: real users, analytics switched on, a lawyer, the mistri panel, real phones.

### Owner-only next steps, in order
1. Push `main` (it deploys via `deploy.yml`) and open the live site on a real Android phone and an iPhone, light and dark mode.
2. Create the Formspree form → `FORM_ENDPOINT`, and GoatCounter → `GOATCOUNTER_CODE` in `src/lib/site.ts`.
3. Call each dealer hotline once (`Todo_owner.md`); ask Runner about Vespa/Aprilia.
4. Lawyer review of `/privacy`, `/terms`, `/disclaimer`.
5. Run the mistri panel (`docs/mistri-panel.md`).
6. Soft-launch in two Facebook groups; read the analytics and owner reports after 2 weeks; fix data where people look.

### Round 3 (2026-10-13 03:50): closing the code-closable gaps
The owner asked for all 12 items plus research, then commit and push. Usage before: 5-hour 44%, 7-day 53%.
Plan: (R) data research: Pulsar N160, second sources, more EVs, BRTA EV fee; (H) price history from git + a "what changed" page + CI checkout depth + Python removed from `check.yml`; (L) Bangla legal/saved/feedback, Bangla JSON-LD and OG, header nav, quiz event, slider minimum, InStock. Then (P): dark mode QA, interaction checks in `tools/qa`, WebP photos, `/bn/` page weight.

#### Round 3, H: price history (merged `04d9fa5`; agent's `check.sh`: all 6 steps pass)
- `scripts/build-history.ts` walks `git log --follow` of `bikes.json`; `src/lib/history.ts` `diffSnapshots` (unit-tested) records a point only when `priceBDT` changes. A shallow clone or missing git prints a warning and falls back to current prices (tested).
- Bike pages show "৳X since <month> · was ৳Y in <month>" or "unchanged since"; `/changes` and `/bn/changes` list 13 events (8 added, 2 up, 2 down, 1 removed), with hreflang, sitemap and footer links. The copy says dates are when our data changed.
- CI: `fetch-depth: 0` in both workflows; `setup-python` removed from `check.yml`; `deploy.yml` now runs `npm run typecheck` (the bare `tsc` would have had no generated JSON on a fresh checkout).
- Limits: all history is from Oct 2026 so far; Zontes shows as removed and re-added (true to history); variant prices are not tracked.

#### Round 3, R: data research (merged `3cfb039`; on merged main: validate passes with 0 problems, 34/34 tests pass)
- **Pulsar N160 was not swapped.** Bajaj BD's own variant pages: Single Seat ৳2,42,000, Twin Disc ৳2,42,600, DC ABS 26 mm fork ৳2,73,600, dual-channel ABS USD ৳2,88,000; bikebd matches. The plain URL is the USD variant, which caused the confusion. Each variant now cites its official page; the Single Seat variant was added.
- **Second sources:** Zontes ZT155-U (TBS) and Runner Bolt 165R (TBS + Daily Star) match, but those are launch-era articles. Haojue KA135/TR150/DR160 and Lifan K19/Glint 100 are still bikebd-only (no official price page; motorcyclevalley lists them as "not available"). bikebd share now 63%.
- **EVs: none added.** The only other Walton model with seat height published (Takyon 1.00) has an implausible weight and specs copied from the 25TD.
- **BRTA EV fee found:** Road Transport Rules 2022, Schedule-1 item 21: ≤5 kW Tk 2,000 (same as ≤100cc), >5 kW Tk 3,000. Now in `guide.registration.ev` (EN+BN); a test fails if an EV over 5 kW is added without a code branch. EV tax token is assumed to match ≤100cc (not covered in the gazette page read).
- Not checked: dead links (`--check-urls` not run). The worklist's hand-written notes section will be lost if it is regenerated.

#### Round 3, L: Bangla remaining + small fixes (merged `b7fe5f4`; full `check.sh` on merged main: all 6 steps pass; 194 sitemap URLs)
- **Bangla twins** for privacy, terms, disclaimer, saved and feedback: `lang="bn"`, Bangla titles, hreflang both ways; links on BN pages stay in `/bn/`. Merge: `sitemap.ts` and `site.ts` conflicted with H (the `/changes` twin); I kept both and left `/bn/saved/` out of the sitemap, as `/saved/` is (per-device page).
- **Bangla JSON-LD** description on `/bn/` bike pages. **Bangla OG images skipped on purpose:** satori (next/og) does no complex-script shaping, so Bangla conjuncts would render broken, and the only Bangla font is woff2, which satori can't read. Recorded as a `shortcut:` in `src/app/bn/bikes/[id]/page.tsx`.
- **Header** gains Dealers/ডিলার and Method/পদ্ধতি (the 2xl search box was narrowed so the row fits at 1536 px). **Quiz event** `match-results` fires once per completed quiz (not for shared links); privacy text updated. **Slider:** total minimum ৳30,000, EMI ৳2,000/mo. **Offer `availability` removed** (no evidence for InStock); tests updated.
- The agent's QA on 7 pages × 3 widths was clean. Not checked: dark mode, the event with analytics on.

#### Round 3, P: dark mode, interaction checks, WebP, `/bn/` weight (merged `0893f56`; full `check.sh` on merged main: all 6 steps pass)
- **QA:** 21 pages × 3 widths in light, OS-dark and saved-dark: 189 runs, **0 overflow, 0 axe serious/critical, 0 console errors**. `qa.mjs` now fails if `data-theme` doesn't match the scheme under test. No dark-mode bugs found; the dark 375 tiles were read by the agent.
- **Fixed at 375 (both themes):** Quick pick and cost "Same style" names were truncated to "Hero …" / one letter (bike art hidden below `sm`); `#pay` table cells ran together (padding added).
- **`tools/qa/interact.mjs`** (`npm run interact`): **24/24 pass**: quiz total/EMI, the ৳40k empty state via the slider, the language toggle, owner form validation and mailto, header links (desktop, Bangla, mobile menu), `/changes`, price history, the EV form without km/l.
- **WebP:** 28 photos, 4.50 MB → 2.49 MB (−45%), via the rerunnable `scripts/webp-photos.mjs`; the JPGs were deleted (the OG route uses illustrations).
- **Page weight** (375, 1.6 Mbps/150 ms, 4× CPU): `/bn/` pages LCP 0.84-1.20 s; bike pages LCP 2.81-2.88 s (EN was 3.19 s); JS 239-307 KB; Bangla pages +25-33 KB font. Table in `tools/qa/README.md`.
- Unverified: real phones; dark tiles at 768/1280 looked at by axe only; 27 of 28 WebP photos not eyeballed; the `#pay` table still scrolls sideways at 375.

---

## Status after round 3 (2026-10-13)

Changes since the round 2 table: §2.5 "no reason to return" is **partly fixed** (price history on every bike + `/changes`, no backend; alerts still need one). §2.1 Bangla coverage is **complete** for every page except the OG images (satori can't shape Bangla). §4: BRTA EV fee **sourced**; N160 **verified**; 5 budget bikes still single-source; still 1 EV. §6 real device: **open (owner)**. Dark mode: **verified headless**.

**Score: ~75%.** What's left is owner-only: real phones, Formspree + GoatCounter accounts, dealer calls, lawyer, mistri panel, real users. See "Owner-only next steps" above.

#### Round 4: Bangla share cards
- **`npm run og:bn`** (`scripts/bn-og.mts` + `scripts/bn-og.html`) runs after the build in `deploy.yml`. It renders the cards in Chromium (Playwright from `tools/qa`, so the main `package.json` gains no dependency) using the site's own Hind Siliguri woff2 from `out/`. It writes `out/bn/og.png` (BN home and every BN section page, via `OG_BN`) and `out/bn/bikes/<id>/og.png` (83 bikes). Same layout as the English cards. The headline is the **on-road** price (`onRoadPrice`) and ex-showroom (শোরুম মূল্য) is the smaller line under it. Used-only bikes show the typical used price. Digits stay Latin, as on BN pages (`formatBDT`).
- **Missing PNGs:** the BN metadata always points at the BN cards. The script fails if any `/bn/` page's og:image is missing or not Bangla, so deploy fails loudly. It is not part of `check.sh` (no browser needed locally), so a local `out/` has 404 BN og:images until you run it. CI caches `~/.cache/ms-playwright` (headless shell only), keyed on `tools/qa/package-lock.json`.
- **Measured locally:** 84 cards in 1.7-3.3 s including browser launch; average 88 KB, max 109 KB (4 cards with detailed art are 101-109 KB, all PNG). I checked the shaping in the home card, CT 100, Takyon (EV) and CG125 (used): reph, pre-base e-kar, ক্লা, স্কু, ট্রি and ঞ্জ all render correctly.
- Not verified: the first CI run (it assumes runner images already have Chromium's system libraries, as they ship Chrome) and how real Facebook/WhatsApp previews look.
