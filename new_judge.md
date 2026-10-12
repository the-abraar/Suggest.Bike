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
