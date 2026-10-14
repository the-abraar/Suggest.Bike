# Suggest.Bike: independent critique, 14 Oct 2026

Reviewer stance: senior engineer, product and go-to-market. I read the repo docs, then the code. I ran the checks, ran the engines with personas, drove the live site in headless Chromium and spot-checked 12 bikes against the web. Where I disagree with `judge.md` or `GO_TO_MARKET_SCORECARD.md`, I say so.

**What I ran:**

- `scripts/check.sh`: exit 0. Typecheck, stray files, unsafe HTML, validate (107 bikes, 0 problems, 3 warnings), 52 tests (51 pass, 1 skipped) and build (169 Bangla pages tagged).
- Price audit (read-only).
- All 336 sitemap URLs: every one returns 200.
- Live page weight at 375 px, ~1.6 Mbps, 150 ms RTT, 4x CPU.
- axe on 8 live pages.
- Persona runs of `matchBikes` through `tsx`.
- Bad-param and localStorage edge cases on the live site.

The working tree was clean before and after.

---

## 1. Verdict up front

- **What it is:** a static, well-built Bangladesh motorcycle buying guide. It has 107 bikes (84 on sale, 23 used-only), a 7-question matchmaker, compare, an ownership-cost model and BRTA/licence guides, in English and in server-rendered Bangla.
- **Who it is for:** a first-time buyer in Bangladesh with a budget, mostly on a phone, often reading Bangla.
- **The engineering is good.** The product logic is not there yet:
  - For the most common persona (daily commute), the matchmaker gives the same four 100cc bikes at every budget from ৳1.5 lakh to ৳6.5 lakh.
  - The quiz and the `/cost` page compute EMI two different ways.
- **Nothing proves demand.** No analytics, no feedback endpoint, no users, not yet indexed.
- **The market leader already has the headline features.** BikeBD (~1M+ visits a month, est.) already runs a "Find Your Bike" quiz, compare, a Bangla version and a showroom finder.
- **Worth continuing:** yes, but as a narrow wedge (honest on-road and monthly-cost answers in Bangla), not as a 107-bike encyclopedia. Stop adding scope. Fix the engine. Get 20 real buyers through it.
- **My GTM readiness: 51%** (scorecard: 60%).

**Why 51, not 60.**

- The scorecard gives "Product works" 8/10 because the features exist and pass tests. But the core promise is "tell me which bike to buy". For the default persona, that answer ignores the budget. The money maths also disagree between two pages.
- A few public facts are wrong against official pages: Classic 350 ABS, a leaked internal note on the CBX 600P page, and used-only bikes labelled "on-road" with "EMI/mo".
- "Market validation" at 2/10 is generous for zero users, when the incumbent already ships a quiz.
- Ops is a bit better than scored, because the site is now live on HTTPS with a gated deploy.

Net: about 9 points below the scorecard. Detail is in section 14.

---

## 2. Code and architecture

**Structure.** Next 16 App Router, static export to GitHub Pages:

- About 9.9k lines of TS/TSX in `src/` (data excluded), plus 1.3k lines of scripts and tests.
- 48 `page.tsx` files: 24 English routes and 24 thin `/bn/` wrappers.
- Data lives in `src/data/*.json`. The build splits it into a slim index for client pages and one JSON file per bike (`scripts/build-data.mjs`).
- Engines are pure modules: `src/lib/match.ts`, `cost.ts`, `fund.ts`, `offers.ts`, `history.ts`.

For a solo-run, zero-budget, no-server site, these choices fit.

**Data model.**

- `Bike` (`src/lib/types.ts:17-73`) is rich: specs, 11 editorial scores, parts, used prices, Bangla text, aliases and an image.
- Source and date fields exist for every price (`priceAsOf`, `priceSource`).
- **Weakness 1: free-text fields carry provenance notes into user-facing text.** `variant`, `quirks` and `priceNote` mix rider-facing copy with editorial and data notes:
  - `honda-cbx-600p.variant` = "Name as used by the user; likely a 1980s CBX 550/600-class four import (unconfirmed)" (`src/data/bikes.json:15471`). It renders under the H1 (`src/app/bikes/[id]/BikeDetail.tsx:149`).
  - The CD70 `quirks` field says "BikeBD data for CD70 is blank/placeholder". It shows under "Quirks owners talk about".
  - Fix: add a `dataNote` field that is never rendered, and lint the public fields for words like "user", "BikeBD data", "placeholder".
- **Weakness 2: `priceAsOf` is a month string.** All 107 bikes are dated 2026-09 or 2026-10. That includes 23 used-only bikes, some whose own note says no listing was found. A month stamp is not a check.

**Fit of choices.**

- Static plus localStorage is right.
- Server-rendered Bangla under `/bn/`, with hreflang and canonical tags, is right and well done.
- OG images are real PNGs (`/bikes/<id>/og.png` returns `image/png`).
- GitHub Pages is fine at this stage.

**Duplication and drift.** There are three EMI formulas. This breaks the repo's own rule, "Derive: two formulas drift apart" (`CODING_STANDARDS.md`):

| Function | Where | Model |
|---|---|---|
| `emiFor` / `emiBudget` | `src/lib/match.ts:35-39` | 0% up to 12 months, then 10% a year flat. Finances the **on-road** price, including BRTA |
| `loanEmi` / `payPaths` | `src/lib/fund.ts:7-13, 48-63` | Reducing balance at 14% (`src/app/cost/CostView.tsx:344`). BRTA paid upfront in cash, plus a processing fee |
| `emiMonthly` | `src/lib/cost.ts:181` | Price / 12, used on the bike page, compare and home (home passes the **on-road** budget, `src/app/HomeView.tsx:292`) |

Other duplication:

- `ROAD_TAX_2YR` is hard-coded in `src/lib/cost.ts:26`, not read from `guide.json` with a source. This breaks the repo's "Cite" rule.
- `guide.json` and `guide.bn.json` are two 1,421-line copies. Their numbers match today (I diffed every number: 0 differences), but no test guards them.

**Dead or odd code.**

- `payPaths` has no guards for `loanDownPct > 100`. It is unreachable today, because `PAY_TERMS` is fixed.
- `ThrottleIqCard.tsx` promotes the owner's other app from the footer, guides and owner pages, and links to a GitHub repo (`ThrottleIqCard.tsx:6`) whose release is a beta APK.
- `src/lib/maintenance-posts.ts` (790 lines) stores content as code.

**Bundle.**

- Every page ships the full 107-bike index: one chunk of 197 KB raw, 32 KB gzip.
- JS per page is 237-311 KB compressed. Fonts are 182-214 KB.
- `/bikes/` is 965 KB of raw HTML (72 KB gzip).

Details are in section 6.

**Standards adherence.** Mostly good. Engines are pure. Text is escaped. localStorage reads are wrapped in try/catch (`src/lib/store.tsx:25-37`). The breaches:

- "Cap: URL params" (section 4).
- "Derive" (the three EMI formulas above).
- "Cite" (`ROAD_TAX_2YR`).

**Docs drift.**

- `README.md` says 77 bikes and a "6-question matchmaker".
- `PRD.md` FR-M1 says six questions.
- The quiz shows "Question 1 / 7", because `networks.json` is now filled (`HAS_NETWORKS`, `src/lib/bikes.ts:90`).
- The scorecard says "87+ bikes". There are 107.

---

## 3. Bugs, ranked by severity

Every item was verified by reading the code. "Confirmed live" means I reproduced it on https://suggest.bike.

### High

**B1. The matchmaker ignores the budget for the most common uses.** Confirmed (engine run).

- **Where:** `src/lib/match.ts:83` ("Price is not a feature") and `USE_WEIGHTS` at `:106-113`.
- **Scenario:** with default answers and use = commute, the top 4 are Splendor+ (৳1.28L), Platina 100, Platina 110 H and HF Deluxe at budgets of ৳1.5L, ৳2.5L, ৳4L and ৳6.5L.
  - "Mixed" use at ৳2.5L and ৳4L gives the same list.
  - Rideshare at ৳2L and village at ৳2L also give 100cc commuters.
  - The home "Quick pick" uses the same engine (`HomeView.tsx:260`), so a visitor dragging the slider sees nothing change.
- **Why it hurts:** a buyer who says "৳4 lakh, daily commute" gets told to buy a ৳1.28 lakh 97cc bike, with the same reason under every card ("Light and nimble in Dhaka traffic"). Users will read this as broken, and it is the default path.
- **Fix sketch:**
  - Add a segment-fit term. Either ask one question ("What size: 100-125cc / 150-165cc / bigger / not sure"), or score closeness to the budget band as a soft preference only when the user did not pick "cheapest".
  - Diversify the top 3 across segments.
  - Add persona regression tests: the top 3 must differ between ৳1.5L and ৳4L for commute.

**B2. The quiz EMI and the `/cost` EMI disagree, and the quiz hides the upfront cash.** Confirmed (numbers below).

- **Where:** `src/lib/match.ts:35-39` and `src/app/match/MatchView.tsx:684`, against `src/lib/fund.ts:49-60` and `src/app/cost/CostView.tsx:344`.
- **Scenario (Pulsar N160, 30% down, 24 months):**
  - The quiz says **৳10,170/mo**.
  - `/cost` says **৳9,195/mo** plus a ৳96,717 upfront payment.
- **Scenario (12-month card, ৳0 down):**
  - The quiz says ৳23,790/mo and implies no cash is needed.
  - `/cost` says ৳22,800/mo plus **৳15,868 upfront** (BRTA plus a 1.5% fee).
- **Why it hurts:** the quiz finances BRTA, which `fund.ts:26` itself says is paid in cash upfront. So a zero-cash buyer is told a bike is affordable when it is not.
- **Fix sketch:** one engine (`fund.ts`) used by both pages. The quiz takes "cash available now" plus "monthly" and checks both. Show the fee.

**B3. Used-only bikes are shown with "On-road (2-yr tax token)" and an "EMI/mo".** Confirmed live.

- **Where:** `src/app/match/MatchView.tsx:590`, `:596-598` and `:747`. The root cause is `src/lib/match.ts:202`, where `usedOption(b, b.priceBDT)` passes no `used`, so `top.used` is undefined for used-only bikes.
- **Scenario:** `/match/?b=60000&c=any&u=fun&r=1` makes the RX100 (a two-stroke) the "Best match". It shows "On-road (2-yr tax token) ৳45,000 · EMI/mo ৳3,750". Directly below, it says "Asking price on Bikroy".
  - No card EMI exists for a private used sale, and no new registration applies.
  - In EMI mode, used bikes also pass the affordability check through `emiBudget`.
- **Fix:** treat `status === "used-only"` as used everywhere. One helper `isUsedOption(m)`. Hide EMI and exclude used options in monthly mode.

**B4. Wrong or leaked public facts.**

| Bike | Site says | Official / other | Status |
|---|---|---|---|
| RE Classic 350 | Single-channel ABS, rear drum (`bikes.json` id at `:10806`) | royalenfield.com/bd: "Dual Channel ABS", ৳4,47,700 | Confirmed (fetched) |
| Honda CBX 600P | Variant line "Name as used by the user; likely…" under the H1 | Internal note | Confirmed live |
| Bajaj Platina 100 ES | CBS | bajajauto.com/en-bd lists drum/drum, no CBS mentioned | Suspected (Bajaj India calls its CBS "ASB"; the page may just omit it) |
| TVS Apache RTR 160 4V | 147 kg | bikebd page: 143-144 kg | Suspected (no official TVS BD page) |
| Suzuki V-Strom SX 250 | On sale, ৳4,49,950; offer "৳20,000 off" from "Reported by the site owner" | bikebd: ৳4,49,950, "offer price ৳4,29,950". Absent from suzuki.com.bd/bikes, which lists 10 models | Price confirmed. Availability suspect, as the site's own `priceNote` admits |

Fix the data, and add the lint from section 2.

**B5. The "Price checked Oct 2026 · Re-checked monthly" badge stays green forever.** Confirmed (code).

- **Where:** `src/app/bikes/[id]/BikeDetail.tsx:153-157`. Nothing ages it on the client. `Dated.tsx` only ages fuel (45 days) and offers.
- **Why it hurts:**
  - No monthly process exists: no scheduled workflow in `.github/workflows/`, and no owner routine in place.
  - The badge also shows on used-only bikes whose `priceNote` says no listing was found (CBX 750, CBX 600P, CD70).
  - In April 2027 the page will still say "checked Oct 2026, re-checked monthly".
- **Fix:** drop "Re-checked monthly". Turn the dot amber after 60 days and red after 120, on the visitor's clock (same pattern as `FuelAgeNote`). For used-only bikes with no listing, say "estimate", not "checked".

### Medium

**B6. The compare tray silently evicts the oldest bike when you add a 4th.** Confirmed live.

- **Where:** `src/lib/store.tsx:58` (`[...c, id].slice(-MAX_COMPARE)`).
- **Scenario:** I tapped "Compare" on four cards on `/bikes/`. localStorage then held cards 2-4, with no message. Card buttons are never disabled at 3.
- **Fix:** refuse the 4th with a toast ("Compare holds 3; remove one"), or ask which bike to replace.

**B7. Compare accepts duplicate ids, and a shared link wipes your own tray.** Confirmed live.

- **Where:** `src/app/compare/CompareView.tsx:33-37`.
- **Scenario 1:** `?bikes=bajaj-pulsar-n160,bajaj-pulsar-n160` renders "Pulsar N160 vs Pulsar N160". The tray toggles the bike in and out, so it ends empty.
- **Scenario 2:** opening any shared `/compare/?bikes=…` link calls `clearCompare()` and replaces the visitor's own 3 picks.
- **Fix:** `new Set()` the ids. Only seed the tray when it is empty, or ask first.

**B8. A brand search ranks antique used-only bikes first.** Confirmed (ran `searchBikes`).

- **Where:** `src/components/SearchBox.tsx:41-46` and `:55` (ties sorted by price ascending).
- **Scenario:**
  - "honda" gives CD70, CD80, CDI H100S, CG125.
  - "yamha" gives Libero, Crux, YBR125, RX100.
  - The bike people want (Hornet, SP160, FZ) is not shown.
- **Fix:** add a tie-break of on-sale first, then popularity (a hand-set `rank` or `overall()`).

**B9. A deploy cliff in March 2027.** Confirmed (code plus data).

- **Where:** `scripts/validate-data.mjs:48-54` fails any price older than 180 days. 17 bikes are dated 2026-09 and 90 are dated 2026-10.
- **Scenario:** from about 1 March 2027, and fully by about 31 March 2027, `validate` fails and `deploy.yml` blocks every deploy, including urgent code fixes, until about 100 prices are re-checked.
- **Fix:** keep the gate, but fail only on prices shown as "checked". Stagger the refresh, and document a `PRICE_FAIL_DAYS` override for emergency deploys.

**B10. Sticky Bangla redirect.** Confirmed (code). The UX impact is my judgement.

- **Where:** `src/lib/i18n.tsx:74` stores `sb-lang=bn` on any `/bn/` visit. `:83` then redirects every later English URL to its `/bn/` twin.
- **Scenario:** a reader who once opened a shared Bangla link clicks an English Google result and lands in Bangla, with a flash and a redirect.
- **Fix:** store the preference only when the user presses the toggle, not on a passive `/bn/` visit.

### Low

**B11. Uncapped URL params, against the repo's "Cap" rule.** Confirmed live.

- **Where:** `decodeAnswers` (`src/lib/match.ts:326-349`).
- **Scenarios:**
  - `?b=-5&r=1` renders "≤ ৳-5 on-road · Nothing fits ৳-5".
  - `?b=999999999999&r=1` renders "≤ ৳10000000 lakh".
  - `?pr=mileage.mileage.mileage` shows "Fuel economy, Fuel economy, Fuel economy" and triples that weight (`weights()` at `:126`).
  - A hand-edited `pm=monthly&m=2000&t=36&b=150000` shows "৳2,000/mo × 36 · ≤ ৳1.5 lakh". The budget is not recomputed from `emiBudget`.
- **Fix:** clamp `b` to 30,000-1,000,000, de-dup `pr`, and recompute the budget in monthly mode.

**B12. A stale compare id renders an empty tray.** Confirmed live.

- **Where:** `src/components/CompareTray.tsx:15` checks `compare.length`, not the resolved `bikes.length`. `:48` builds the link from the raw ids.
- **Scenario:** a removed bike id in localStorage shows a tray with only "Clear / Compare".

**B13. Buttons nested inside links.** Confirmed (DOM count).

- **Where:** `BikeCard` (`src/components/ui.tsx:119-164`) and `MatchRow` (`MatchView.tsx:721-752`).
- **Scale:** 214 `a button` elements on `/bikes/`, 8 on `/`.
- **Impact:** invalid HTML and a confusing screen-reader experience. axe does not flag it.

**B14. A test bound to live data.** Confirmed.

- **Where:** `tests/offers.test.ts:33-34` asserts the V-Strom offer is active on 2026-10-20.
- **Scenario:** deleting the expired offer from `offers.json` (good hygiene) turns CI red.

**B15. `formatLakh` has no crore and rounds 99,99,999 to "৳100 lakh".** Confirmed. `src/lib/bikes.ts:54-58`. Cosmetic, because the largest price is ৳6.5L, but URL params can trigger it.

**B16. Two "per month" figures for the same thing.** Confirmed. The home slider shows on-road budget / 12 (`HomeView.tsx:292`). The bike page shows ex-showroom / 12 (`BikeDetail.tsx:175`).

**B17. Photo credits omit the licence link.** Confirmed by grep: `licenseUrl` is never rendered. The caption is also CSS-truncated on phones (`BikeDetail.tsx:129-133`). Details are in section 12.

**B18. Possible layout shift on bike pages.** Suspected: CLS. `OfferBox` and `OfferTag` render only after mount (`src/components/Dated.tsx:13-22`), so an active offer inserts a box above the EMI line after paint. I have not measured this.

---

## 4. Corner cases

| Case | What happens | Verdict |
|---|---|---|
| Quiz, zero budget (`b=0`) or text (`b=abc`) | Falls back to question 1 | OK |
| Quiz, negative budget | "≤ ৳-5 on-road", cheapest fallback list | Bug B11 |
| Quiz, huge budget | "৳10000000 lakh"; ranks the same commuters | B11, B1 |
| Quiz, nothing fits (৳30,000 new) | Clear empty state: cheapest 3 with "how far over", nudge to allow used | Good |
| Quiz, ৳30,000 "open to used" | Best match Honda CD70 (a 72cc antique, priced from one Bikes4Sale ad) | Honest but thin |
| Quiz, "fun", ৳7L, used OK | #2 is the Honda CBX 750, a 1980s 748cc import. The site's own guide says the registration limit is 375cc | Risky advice: needs a "papers/registration" hard warning or exclusion |
| Quiz, slider maximum | ৳7L on the slider, ৳10L down payment in EMI mode. The most expensive bike is ৳6.5L | OK |
| Quiz, duplicate priorities via URL | Triple weight | B11 |
| Quiz, rider height | Seat height plus a weight penalty; tall riders never warned (`match.ts:150-157`) | Sensible, documented |
| Compare, 4th bike | Oldest silently dropped | B6 |
| Compare, 4 ids in URL | Truncated to 3; the URL still lists 4 | Minor |
| Compare, duplicates / unknown ids | "N160 vs N160" / empty state with popular pairs | B7 / OK |
| Compare, very long URL | GitHub Pages returns 414 | Acceptable |
| State persistence | `sb-compare` and `sb-saved` survive reloads. Corrupt JSON does not crash (tested `{"bad":`) | Good |
| Stale saved or compare id | Saved page filters it out; the tray shows empty | B12 |
| EMI at 0% interest | `loanEmi` returns principal / months (`fund.ts:10`) | OK |
| EMI with 0 down | Quiz finances BRTA too; `/cost` puts BRTA upfront | B2 |
| EMI rounding | Quiz and bike page round up to ৳10; `/cost` rounds to ৳1; instalments × months ≠ total by a few taka | Cosmetic |
| BDT formatting | `en-IN` grouping: ৳2,85,364 | Correct |
| Lakh/crore | Lakh only; Bangla pages use Latin digits ("৳2.5 লাখ") next to Bangla digits ("১২ মাসের") | Mixed numerals (section 7) |
| Search, Bangla script | পালসার, জিক্সার, হর্নেট, স্প্লেন্ডার, এফজেড, আর১৫ all resolve | Good |
| Search, Banglish typos | "pulser", "apachi" OK; "dicover" (missing s) finds nothing | Partial |
| Search, brand only | Antiques first | B8 |
| Search, natural language ("bike under 2 lakh") | No results. Should route to browse with a price filter | Gap |
| Deep links, bad bike id | `/bikes/nope/` returns a proper 404 page (HTTP 404) | Good |
| Missing images | 72 of 107 bikes have no photo and use a code-drawn illustration. All 35 photo files exist. There is no `onError` fallback | OK today, fragile |
| Very long names | The CBX 600P "variant" note wraps to 2 lines under the H1. Compare H1 "X vs Y vs Z" wraps fine at 375 | Data issue, not layout |
| Stale prices | Build fails at 180 days; the live page shows nothing | B5, B9 |
| Used-only bikes | 23, all dated 2026-10, several "no listing found" | B5 |
| Discontinued but listed "on sale" | KTM Duke 125 / RC 125 stock unconfirmed; V-Strom SX absent from Suzuki BD's list | Needs a status like "availability unconfirmed" |
| Offers past expiry | Hidden on the visitor's BD date (`offers.ts:22-28`, `Dated.tsx`) | Good design |

---

## 5. Data quality and trust

**Spot-check (12 bikes, 14 Oct 2026).** A research agent did the first pass. I re-fetched the Classic 350, Platina 100, V-Strom (BikeBD and Suzuki BD) and BikeBD's homepage myself.

| Bike | Site | Found | Result |
|---|---|---|---|
| Pulsar N160 DC ABS | ৳2,73,600 | ৳2,73,600, bajajauto.com/en-bd | Match |
| Honda Hornet 2.0 | ৳2,89,000 | ৳2,89,000, bdhonda.com | Match |
| Yamaha FZS FI V4 | ৳2,92,500 | ৳2,92,500, bikebd (Oct 2026) | Match (BikeBD only) |
| Yamaha R15 V4 | ৳6,05,000 | ৳6,05,000-6,10,000, bikebd | Match |
| Suzuki Gixxer Monotone | ৳1,99,950 | ৳1,99,950, suzuki.com.bd/bikes | Match (site cites the root URL, not /bikes) |
| TVS Apache RTR 160 4V SC ABS | ৳2,47,900 | ৳2,47,900, bikebd; another BikeBD page says ৳2,69,999 | Match, conflicting; weight 143-144 vs 147 |
| RE Classic 350 | ৳4,47,700, single ABS | ৳4,47,700, **Dual Channel ABS** (official) | **Spec wrong** |
| Hero Splendor+ | ৳1,17,000 | ৳1,17,000, bikebd | Match |
| KTM Duke 125 | ৳3,00,000 | ৳3,00,000, bikebd; no official BD page | Match; availability unproven |
| Suzuki V-Strom SX 250 | ৳4,49,950 | ৳4,49,950, bikebd; not on suzuki.com.bd/bikes | Price matches; availability doubtful |
| Honda CBR150R | ৳6,50,000 | ৳6,50,000, bdhonda.com | Match |
| Bajaj Platina 100 ES | ৳1,34,350, CBS | ৳1,34,350; official specs list drum/drum, no CBS | Price match; CBS suspect |

Fuel (octane ৳165, petrol ৳160, as of 1 Oct 2026) matches the Energy Division revision reported by Dhaka Tribune (30 Sep 2026). The N160 BRTA package (৳11,764) matches the "above 125cc" total reported by the Daily Sun (May 2026).

**What this says:**

- **Prices are transcribed accurately and are fresh as of this month.** That is better than the scorecard's "one stale price" implies: there are 0 prices older than 90 days.
- **Specs are where the errors are.** 2 to 3 of the 12 were wrong or doubtful.
- **Availability is the weakest field.** "On sale" is asserted without a distributor listing.
- **Provenance:** bikebd.com is still the price source for 58 of 107 bikes (54%). bikroy.com covers 14, and distributor sites cover 35. Eight bikes have no second-domain source.
- **The audit's "outlier" gate is weak.** The `classic` category mixes ৳45k used antiques with ৳4.5L Royal Enfields, so RE prices show up as "+795%". Writing any 40-character note passes the gate. It checks the presence of an excuse, not the price.
- **The differentiator is still unverified.** "Real-world mileage", the 11 ownership scores, parts prices and "mechanic familiarity" are editorial estimates. They are labelled honestly (the `Approx` badge, `/method`), but they are the reason the site exists, and no owner or mechanic data backs them. `docs/mistri-panel.md` and the mileage survey are unstarted owner tasks.

**How errors get reported and fixed.**

- Today the paths are a `mailto:` (`BikeDetail.tsx:67-69`), a GitHub issue link that needs an account (`:243`) and WhatsApp to a personal number.
- `FORM_ENDPOINT` is empty (`src/lib/site.ts:16`), so the feedback form also falls back to mailto. Many Bangladeshi Android phones have no mail client set up.
- The repo has 0 issues ever.
- There is no triage routine. Fixes need a code edit, a push and a deploy, by the owner or an agent.

**Liability of wrong prices.**

- The disclaimer and the "confirm with the showroom" lines are adequate for an information site.
- The bigger risk is reputational. One screenshot of a wrong ABS claim in a big Facebook group costs more trust than a legal letter.
- See section 12 for the Consumer Rights Act angle.

---

## 6. SEO and performance

**Indexability: good.**

- `robots.txt` allows everything and points to the sitemap.
- The sitemap has 336 URLs (168 of them `/bn/`), and all return 200.
- Each page has its own `<title>`, description, canonical, `hreflang` en/bn/x-default and per-bike OG images (PNG, 1200x630).
- `/bn/` pages ship real Bangla in the HTML (4,261 Bangla characters on the N160 page before any JS) and `lang="bn"`.
- HTTP and www redirect to the HTTPS apex.
- Search Console is verified (the TXT record is present).
- Not indexed yet: a `site:` search found nothing, which is expected for a 1-day-old submission.

**Gaps:**

- The sitemap has no `<lastmod>`, and every URL says `changefreq weekly`.
- The Product JSON-LD carries an `Offer` with `seller` = the distributor (`src/lib/bikes.ts:125-134`). That is defensible, but it has no `availability`, which Search Console will warn about. A review-type page would do better with author-signed `Review` markup than with merchant-style offers.
- Note: `judge.md` Update 8 says the Offer was removed. It is back. The judge file is stale here.
- **Banglish queries are not targeted.** Real BD searches include "pulsar n160 dam koto" and "bike er dam koto". Titles are English or Bangla script only.
- **Authority gap:** 107 bike pages plus 15 compare pairs against BikeBD's 12-year archive. Expect months before long-tail rankings.

**Measured weight on the live site** (`tools/qa/weight.mjs`, 375 px, ~1.6 Mbps, 150 ms RTT, 4x CPU, cold cache):

| Page | JS KB | Font KB | HTML KB | DCL ms | LCP ms |
|---|---|---|---|---|---|
| `/` | 272 | 182 | 37 | 841 | 1,376 |
| `/bn/` | 272 | 214 | 38 | 1,091 | 1,620 |
| `/bikes/` | 252 | 182 | 71 | 2,435 | **3,360** |
| `/bikes/bajaj-pulsar-n160/` | 311 | 182 | 23 | 765 | 1,880 |
| `/bn/bikes/bajaj-pulsar-n160/` | 311 | 214 | 24 | 1,046 | 2,152 |
| `/match/` | 244 | 182 | 8 | 755 | 1,840 |
| `/cost/` | 237 | 182 | 13 | 782 | 1,024 |

**Core Web Vitals risk:**

- **LCP on `/bikes/` fails the 2.5 s "good" threshold** even on this simulated fast-3G profile. On real rural 3G or a ৳10k Android, expect 4-6 s.
- `/bikes/` renders all 107 cards at once. That makes the page 27,000 px tall at 375 (about 33 screens) with no pagination. This also creates INP risk when filters re-render.
- **Fonts are the cheapest win.** `layout.tsx:13` preloads Hind Siliguri in 4 weights on every English page "because ৳ is in the Bengali block". That is ~150 KB to draw one glyph. Fixes: a system-font fallback for ৳, subsetting, or 2 weights.
- Every page carries the 32 KB gzip bike index, even pages that don't need it, such as the guides.

---

## 7. UI

**Strengths:**

- Clean, modern and consistent: a Geist plus Hind Siliguri pairing, a restrained palette and generous spacing.
- Light and dark themes with no flash (`layout.tsx:32`).
- No horizontal overflow at 375 or 1280.
- The desktop home page, with the live "Quick pick" card, looks like a real product.
- Bangla typography renders well. Line height is comfortable and the headings are not cramped.

**Weaknesses:**

- **The result page buries the answer on a phone.** At 375x812, the first screen of quiz results shows the heading, Share/Start over, five answer chips and the top of an illustration. There is no bike name and no price. The payoff starts below the fold.
- **72 of 107 bikes have no photo.** The code-drawn illustrations are tidy, but they look alike across models. BD buyers want to see the actual bike and colour. This is a trust problem dressed as a design choice.
- **Mixed numerals on Bangla pages:** "১২ মাসের কিস্তিতে ≈ ৳20,840/মাস" (seen on `/bn/`), "৳2.5 লাখ". Pick one rule. Bangla digits for Bangla pages is the safer default for a Bangla-first audience. Latin digits are common on BD commerce sites, but mixing both in one sentence looks unfinished.
- **The compare tray overlaps content** on phones. Behind the translucent tray, page text shows through. At 375 it shows only one truncated chip ("FZS V") of three.
- **The footer shows a raw date:** "oldest price checked 2026-09", not localised (`Footer.tsx:24`).

---

## 8. UX

**Does the quiz help a first-time buyer decide?** Partly.

- Good parts:
  - Plain questions in both languages.
  - An honest on-road ceiling (bike plus BRTA).
  - A height and weight reach check.
  - First-bike warnings.
  - A good empty state.
  - Shareable result URLs.
- But for the default persona the output does not respond to the budget (B1), and every top card gives the same reason. A real buyer with ৳2.5-4 lakh is usually choosing between 150-165cc bikes (N160, FZS, Gixxer, Hornet, Apache 4V). The quiz never shows them unless "mixed", "highway" or "fun" is chosen.
- That is the single biggest product problem. It is invisible in unit tests, because the tests check invariants ("never over budget"), not usefulness.

**Friction:**

- 7 questions, marketed as "60 seconds". That is fine.
- Pre-selected defaults mean "Skip to results" gives a confident answer the user never chose. `decision.md` already suggests starting blank, and I agree.
- Answers auto-advance after 180 ms (`MatchView.tsx:144`). That is quick on touch, but it can surprise keyboard and screen-reader users (section 9).

**Trust signals:**

- Present: source links, price dates, "approx" badges, a `/method` page, a changes log, a disclaimer.
- Missing: a face.
  - `SITE.editor` = "Abrar (The-Abraar)". There are no named mechanics and no owner reviews.
  - Bangladeshi buyers trust a cousin, a mistri, a YouTuber or a Facebook group. `docs/new_judge.md` makes the same point, and I agree.

**After a suggestion:**

- The user can open details, compare, save, see the distributor hotline and locator (`DealersView.tsx:45-60`), and read "Ask the showroom for the on-road price".
- There is no:
  - lead capture
  - "get the best on-road price" request
  - WhatsApp to a showroom
  - test-ride ask
  - price-drop or offer alert
  - way to come back to a result except the URL
- So the user leaves at exactly the moment they become valuable, and the site learns nothing, because analytics are off (`GOATCOUNTER_CODE = ""`, `site.ts:25`).

---

## 9. Accessibility

- **axe (wcag2a/aa/21aa plus best-practice) on 8 live pages:** no serious or critical issues. Only moderate ones: `heading-order` on `/bikes/` and `/feedback/`, and `region` on bike, cost and feedback pages. This is genuinely good.
- **Not caught by axe:**
  - Buttons nested inside links: 214 on `/bikes/` (B13).
  - The budget `<input type="range">` has an `aria-label` but no `aria-valuetext` (`MatchView.tsx:388-398`). Screen readers hear "250000", not "৳2.5 lakh".
  - The CompareTray "Compare" link uses `aria-disabled` plus `pointer-events-none` (`CompareTray.tsx:47-51`). It is still focusable, and Enter opens compare with one bike.
  - Auto-advance on option pick (`setTimeout(next, 180)`) changes the content on selection. **Suspected** issue under WCAG 3.2.2 for screen-reader users. `tools/qa/keyboard.mjs` reports focus rings, but I did not test focus placement after the step changes.
  - Photo captions are truncated with CSS. The full credit is only in the link.
- Skip link, focus styles, `lang` attributes and contrast (axe found none) are all in place.

---

## 10. Testing and verification

**What the tests prove** (52 tests in `tests/`):

- Engine invariants: nothing over budget outside the stretch section, gearless filters, height warnings, empty state, two-strokes never top for commute.
- Cost model: monotonic, no NaN or Infinity.
- On-road totals agree between match and cost.
- EMI known answers.
- `langHref` and hreflang mapping, the sitemap, no orphan pages.
- Search: Banglish and Bangla script.
- Offers: date logic.
- History diffing.

This is a solid set for a static site.

**What they do not prove:**

- **Usefulness.** No persona test asserts that results change with budget (B1).
- **Cross-page agreement on EMI.** The tests check on-road agreement only, which is how B2 slipped through.
- Used-only labelling in the UI (B3).
- Compare-tray behaviour (B6, B7, B12).
- Search ranking for brand-only queries (B8).
- URL param clamping (B11).
- **Data truth.** `validate` checks shape, dates and the presence of notes, not facts. It could not catch Classic 350 ABS.
- **Anything in a real browser in CI.** `tools/qa` (axe, overflow, interact, keyboard, weight) exists and is good, but it runs by hand and is not in `check.sh` or CI.
- Real devices: still zero.
- Human code review: still zero. Nearly all 91 commits are agent rounds, 67 of them in the last two days.

---

## 11. Deploy and operations

| Area | State | Note |
|---|---|---|
| Hosting | GitHub Pages, HTTPS, apex + www redirect | Free; fine at this scale |
| Deploy | Push to `main` → `deploy.yml` (validate, tsc, tests, build, Bangla OG) | Last runs green (`b2232c2`) |
| Rollback | `git revert` + push | Adequate |
| Monitoring | None found | Add UptimeRobot on `/` and `/sitemap.xml` |
| Analytics | **Off**: `GOATCOUNTER_CODE` empty (`site.ts:25`). `track()` calls are no-ops | You cannot learn anything from a launch |
| Feedback | **mailto fallback**: `FORM_ENDPOINT` empty (`site.ts:16`). MX forwards exist (Namecheap eforward) but delivery is untested | Owner task, 30 minutes |
| Search | Console verified, sitemap submitted 14 Oct | Not yet indexed |
| Content updates | Hand-edit `bikes.json`, run `npm run audit:prices`, push | No schedule, no owner calendar |

**Who updates 107 prices every month?** Nobody, today.

- Rough sizing:
  - About 45 bikes have official distributor pages that can be fetched (Bajaj, Honda, Suzuki, Royal Enfield, Hero, Walton). A scheduled Action can diff those and open a PR.
  - The other ~60 (TVS, Yamaha via BikeBD, Lifan, GPX, Runner, Haojue, used-only) need a person. At 2-3 minutes each, that is 2-3 hours a month.
- The 23 used-only bikes need Bikroy checks that a script must not scrape (Bikroy's robots rules and ToS).
- The validator's 180-day gate turns this from "nice to have" into "deploys stop in March 2027" (B9).

---

## 12. Legal and compliance

- **Price disclaimers:** present and plain (`src/components/LegalView.tsx:40-50`), linked from match results and the footer. "Confirm with the showroom" appears on offers. Good. The "Re-checked monthly" claim (B5) works against them.
- **No lawyer review:** the TODO is still in the code (`LegalView.tsx:8`, `:59`).
- **Missing from the legal pages:**
  - operator identity and address
  - governing law
  - a takedown/correction policy with a response time
  - a trademark notice ("brand names belong to their owners")
- **Bangladesh law to check with counsel.** Sourced by the research agent; medium confidence.
  - **Consumer Rights Protection Act 2009, s.44 (misleading advertisement):** this mainly targets sellers, but a "Price checked" badge on an old price is the kind of claim a complaint could cite.
  - **Cyber Security Act 2026:** a July 2026 draft amendment touches online defamation. The `quirks` and `cons` text ("parts nearly unobtainable", "few mechanics") is editorial opinion about brands. Keep it factual and sourced.
  - **Personal Data Protection Ordinance 2025** (reportedly now an Act): applies as soon as a form collects email or phone. Formspree or Web3Forms means a foreign processor. The privacy page should name it.
- **Trademarks:** brand and model names are used to identify products (nominative use), which is normally fine. No brand logos are drawn; `BikeArt` is generic. Low risk.
- **Photos:** 35 Commons photos (26 CC BY-SA 4.0, 3 CC BY 4.0, 2 BY-SA 3.0, 1 BY-SA 2.0, 3 CC0).
  - CC BY and BY-SA require a licence link and a note when changes were made. Photos were converted to WebP and are cropped by `object-cover`.
  - `licenseUrl` exists in the data but is never rendered (B17). This is a cheap fix.
- **Affiliate disclosure:** none needed today. But the About page promises "no sponsored rankings and no affiliate deals with dealers" (`src/app/about/AboutView.tsx:62-63`). Any lead or referral model needs that line reworded first, to "money never changes rankings", before money arrives.
- **Privacy:** no server-side personal data. The privacy page is accurate for today. Other points:
  - GoatCounter's free plan is for non-commercial use, so check its terms before monetising.
  - The WhatsApp number in `site.ts:19` is public. Confirm it is a business number.
- **Public repo.** The repo is public, so all of this is readable by BikeBD and every distributor:
  - `ResearchingStuff/` (66 files headed "local only, not for the website")
  - `judge.md`
  - `docs/new_judge.md` (whose first line calls the site "a well-built brochure that copies prices from BikeBD")
  - the full data set

  This is avoidable reputational and legal ammunition.

---

## 13. Market, demand and marketability

**Market size.**

- Bangladesh sold **466,858 motorcycles in 2025**, up 19% from 392,130 in 2024. The 2022 peak was about 604k.
- 2025 brand shares: Suzuki 20.1%, Yamaha 19.7%, Hero 18.1%, Honda 17.8%, Bajaj 17.6%. TVS collapsed. (Daily Star, 16 Jan 2026, updated 14 Sep 2026; fetched.)
- BRTA new registrations in 2024: about 262k (secondary source, low confidence).
- Drivers: forex and LC easing, the 375cc registration rule (Oct 2023), and ride-hailing (~200k jobs, TBS).

The market is real and recovering. About 450k buyers a year is a decent addressable pool.

**Search demand.**

- No public keyword volumes exist for "bike price in bd" or "বাইকের দাম".
- Proxies (third-party estimates, medium confidence):
  - **bikebd.com: ~1-1.8M visits a month**, about 80% organic, ranked #1 among BD vehicle sites (Similarweb, Ahrefs).
  - motorcyclevalley.com: ~130k a month.
- So the search demand exists, and one incumbent owns most of it.

**Competitors.**

| Competitor | What they have | Quiz | Cost/EMI | Bangla | Dealers | Used |
|---|---|---|---|---|---|---|
| BikeBD (since 2012) | Prices for every model, news, reviews, YouTube, launch coverage | **Yes: "Find Your Bike"** (budget, type, style, cc, use, range). I verified this on their homepage | Fuel cost calculator only | Yes | Showroom finder | No |
| MotorcycleValley | Compare, loan/EMI pages by brand, forum, Q&A | "Quiz!" link | EMI pages | Yes | Showrooms, parts shops | Marketplace |
| Bikroy | ~13.5k live motorbike ads | No | No | Partly | n/a | Yes |
| YouTube | e.g. CHOCOLATE BIKER ~800k subs; many smaller reviewers | n/a | n/a | Bangla video | Showroom tie-ins | Reviews |
| Facebook groups and brand clubs | e.g. Yamaha Riders Club 25k+ riders | n/a | n/a | Bangla | Word of mouth | Buy/sell posts |

**Why would anyone pick Suggest.Bike?** Its genuinely distinct pieces are:

1. A true all-in monthly cost (fuel, service, wear, paperwork, insurance, resale loss).
2. Honest on-road totals and cash-vs-card-vs-loan comparisons.
3. Clean BRTA, licence and fines guides with section numbers.
4. No ads, a clean phone-friendly UI, and Bangla served in the HTML.

These are features, not reasons to switch. Buyers decide through people. The intended moat ("freshness plus owner-verified data") does not exist yet: prices are copied from BikeBD and distributors, and the scores are editorial. **The best positioning:** "the honest monthly-cost and on-road calculator for your shortlist", used next to BikeBD and YouTube, not instead of them.

**Monetisation (realistic, in order):**

1. **Disclosed showroom lead referral.** "Get the on-road price and today's offer from an official showroom", via WhatsApp or a form, routed to a dealer. This fits the use case. It needs dealer agreements, a form backend and PDPO-compliant consent.
2. **Finance referral.** Card EMI runs through 20+ banks. BRAC Bank's Yamaha loan was at 11.99% in 2024 (secondary source). No public affiliate programme was found, so this needs direct deals.
3. **Display ads.** BD CPMs are low. They only matter at BikeBD-like traffic, and they clash with the clean, honest tone.
4. **Sponsored content.** This is how incumbents earn (banners, launch coverage, "offers" posts). It conflicts with the site's own promise.

**Illustrative arithmetic, my assumptions, not data.** If the site influenced 1% of annual buyers (~4.7k) and 20% of those became paid leads at ৳300 each, that is about ৳2.8 lakh a year. Small. Leads only pay at 5-10% share, which means beating BikeBD on reach. So the honest outlook is: this is a side project or a portfolio piece until it proves it can pull traffic.

**Distribution plan (what can actually work):**

- **Facebook first.** `docs/launch-posts.md` has 10 Bangla posts. Many groups ban links, so post the content itself, with image cards ("True monthly cost of the top 5 150cc bikes") and the link in the comments.
- **Creators:** offer YouTubers a per-bike "monthly cost card" image they can show.
- **Search:** Banglish and Bangla long-tail ("N160 on-road dam", "১৫০ সিসি বাইক মাসিক খরচ"). Months, not weeks.
- **One measurable goal for month 1:** 1,000 quiz completions and 20 feedback messages. Without analytics and a form, this cannot even be measured.

---

## 14. GTM percentage breakdown

| Dimension (weight) | Scorecard | Mine | One line |
|---|---|---|---|
| Product works end to end (25) | 8 | **6** | Every feature works, but the core recommendation ignores the budget for the default persona (B1), EMI disagrees across pages (B2), used-only bikes are mislabelled (B3), and some specs are wrong |
| Quality and verification (15) | 7 | **6** | 52 good invariant tests, green CI, axe clean; no usefulness tests, no browser QA in CI, no real device, no human review |
| Security and privacy (15) | 8 | **8** | Static, no PII on a server, escaped text, wrapped localStorage; small surface. Public repo of internal docs is reputational, not security |
| Legal and compliance (10) | 5 | **4** | Drafts in EN and BN; no lawyer, no operator identity, licence links missing, an unbacked "re-checked monthly" claim, an About promise that blocks monetisation |
| Market validation (15) | 2 | **1** | Zero users, zero analytics, not indexed; the incumbent already ships a quiz, compare and Bangla |
| Deploy and operations (10) | 3 | **4** | Live on HTTPS, gated deploy, Search Console; no monitoring, analytics, feedback endpoint or refresh routine; March 2027 deploy cliff |
| Claims honesty (10) | 7 | **6** | Estimates are labelled well; but "Re-checked monthly", green "checked" badges on unlisted used bikes, a leaked internal note, wrong ABS, docs saying 77 bikes and 6 questions |

**Weighted:** (6×25 + 6×15 + 8×15 + 4×10 + 1×15 + 4×10 + 6×10) / 10 = **51.5**.

**Cap:** I would set a cap of **55**: "cannot measure or hear users" (no analytics, no phone-friendly feedback). A launch without either teaches nothing. It does not bind here.

**Final: 51%** (scorecard: 60%).

**Where I disagree with the scorecard and judge.md:**

- **"Product works 8"** confuses features that exist with a product that works. The persona runs are the evidence.
- **"Market 2"** is too high for zero users, given that BikeBD's quiz already exists. `docs/new_judge.md` ("gives nobody a reason to switch") is closer to the truth than `judge.md`.
- **"One stale price":** there are none now. The real data risk is specs and availability, plus the absence of a refresh process.
- **"Offer removed" (Update 8 item 7):** it is back, with a seller.
- **The emphasis on BikeBD source concentration (87%, now 54%)** matters less than the scorecard implies. Transcription is accurate. What is missing is a process and a moat.

---

## 15. What to cut or stop doing

1. **Stop adding scope.** Bikes went 77 → 107 and maintenance posts → 26 in three days of agent rounds. Each new bike adds monthly price upkeep that nobody does yet. Freeze the catalogue until a refresh routine exists.
2. **Cut or quarantine the dubious used-only antiques.** CBX 600P (identity unconfirmed), CBX 750 (748cc), CD70 (one ad), Roadmaster CD200. Keep a handful of iconic used bikes (RX100, CG125) with "estimate" labels. The rest dilute trust and leak into quiz results.
3. **Move `ResearchingStuff/` out of the public repo** (476 KB, 66 files, self-described "local only"). Do the same with `judge.md`, `docs/new_judge.md`, `docs/UI_AUDIT.md`, `docs/HANDOFF.md`, `docs/Todo_agent.md` and `docs/data-needed.html`: put them in a private repo or wiki. Or make this repo private. The site publishes the data anyway.
4. **Merge the judge files.** `judge.md` (13 updates, 290 lines), `docs/new_judge.md`, the scorecard and now this file. One status file, newest first.
5. **Delete two of the three EMI functions** (`emiFor`/`emiBudget`, and `emiMonthly` as a separate model). Keep `fund.ts`.
6. **Remove the "Re-checked monthly" text** until it is true.
7. **Remove or demote the ThrottleIQ cross-promo.** Sending first-time bike buyers to a GitHub repo to sideload a beta APK is off-mission and low-trust.
8. **Drop 2-3 Hind Siliguri weights** from English pages.
9. **Stop optimising the 41-page QA sweep** before a single human has used the site. Real-user sessions beat headless screenshots now.

---

## 16. Top 10 next actions (ordered by value)

| # | Action | Effort | Who |
|---|---|---|---|
| 1 | **Set `GOATCOUNTER_CODE` and a Web3Forms/Formspree `FORM_ENDPOINT`** in `src/lib/site.ts`; send one test mail to `hello@`. Without these, every other step is blind | 30 min | Owner (accounts), agent (push) |
| 2 | **Fix the matcher's usefulness (B1).** Add a size/segment question or a soft budget-band term, diversify the top 3, add persona tests (commute ৳1.5L vs ৳4L must differ) | 0.5-1 day | Owner decides the rule (30 min); agent builds and tests |
| 3 | **One payment engine (B2, B3).** The quiz uses `fund.ts`: BRTA and fee upfront, "cash now" plus "monthly" inputs, no EMI for used or used-only, correct labels | 0.5 day | Agent |
| 4 | **Data fixes now:** Classic 350 → dual ABS; check Platina 100 CBS; remove or fix the CBX 600P variant; move provenance text out of `quirks` into a non-rendered field; mark V-Strom SX and KTM 125s "availability unconfirmed"; cite suzuki.com.bd/bikes | 2-3 h | Agent drafts; owner confirms 3-4 items by phone |
| 5 | **Honest freshness:** remove "Re-checked monthly"; age the price badge on the client (amber >60 d, red >120 d); "estimate" for unlisted used bikes | 2 h | Agent |
| 6 | **Watch 5-10 real first-time buyers** (friends, campus, a showroom floor) do the quiz on their own phones in Bangla. Note where they stall, what they expected, and what they would do next. This is the market validation the score lacks, and it doubles as the real-device test | 1-2 days | Owner |
| 7 | **Monthly refresh routine:** a scheduled Action fetches official Bajaj, Honda, Suzuki, RE and Hero pages and opens a diff PR; the owner spends 2-3 h a month on the rest; stagger dates to avoid the March 2027 cliff (B9) | 1 day build, then 2-3 h/month | Agent builds; owner runs |
| 8 | **Repo hygiene:** make the repo private, or move `ResearchingStuff/` and the judge/audit docs out; update README/PRD counts (107 bikes, 7 questions) | 30 min | Owner (visibility), agent (docs) |
| 9 | **Small UX bug batch:** compare 4th-add toast (B6), de-dup and don't wipe the tray (B7), search tie-break on-sale first (B8), clamp URL params (B11), empty tray (B12), toggle-only language memory (B10), licence links (B17), offers test decoupled from live data (B14), font weights | 0.5-1 day | Agent |
| 10 | **Decide the money question before traffic:** reword the About promise to "money never changes rankings"; pilot one disclosed "Ask an official showroom for today's on-road price" (WhatsApp) with one distributor; lawyer review of privacy, terms and disclaimer, including PDPO consent for that form | 2-4 weeks elapsed | Owner (+ lawyer); agent builds the form |

**Not checked:**

- No real device and no Facebook or Messenger preview debugger.
- CLS was not measured (B18 is suspected).
- I did not verify the Similarweb and Ahrefs traffic figures, the bank EMI terms or the BD law summaries myself. A research agent gathered them, so treat them as medium confidence.
- I did not proofread the Bangla copy beyond spot reads.
- Only 12 of 107 bikes were spot-checked.

**Risk the owner must know:** `validate` will block every deploy from about March 2027 unless prices are re-checked on a staggered schedule.
