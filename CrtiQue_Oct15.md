# Suggest.Bike: independent critique, 15 Oct 2026

Reviewer stance: senior engineer, product and go-to-market. Scope: branch `oct14-int` at `648c8f1` (31 commits since the baseline critique `a38083c`), built locally. None of it is pushed. The live site at https://suggest.bike runs `origin/main`, which has also moved on (4 commits this branch does not have; see N1). I used the live site only to see production and to check sources.

**What I ran:**

- `scripts/check.sh` with Node 22: exit 0. Typecheck, stray files, unsafe HTML, validate (103 bikes, 0 problems, 3 warnings), 84 tests (83 pass, 1 skipped), build (440 static pages, `lang="bn"` set on 166).
- `tools/qa` against the local build: `interact.mjs` 39 PASS / 0 FAIL, `keyboard.mjs` 53 PASS / 0 FAIL, `qa.mjs` on 9 key pages at 375 and 1280 (0 overflow, 0 axe serious/critical, 0 console errors), `weight.mjs` on 8 local and 6 live pages.
- My own Playwright checks: offer CLS with the clock moved to 5 Nov 2026, the price badge on 10 Mar 2027, pagination and back navigation, the full compare tray at 375, EMI mode with ৳0 cash.
- Persona runs of `matchBikes`, `searchBikes`, `fund.ts` and `decodeAnswers` through `tsx`, from scripts in my scratch folder.
- `npm run refresh:prices -- --dry-run` against the live distributor sites: 62 official prices on 38 pages, 62 unchanged, 0 errors.
- Price spot-check: 22 bikes, 24 prices (7 official model pages, Suzuki's 10-model list, 5 BikeBD pages).
- `git merge-tree` of this branch against `origin/main`. This is a dry run that writes no refs and no files.

The working tree was clean before and after.

---

## 0. Since 2026-10-14

Status words: **Fixed** (verified in code, and run where possible), **Partly fixed**, **Still open**, **No longer applies**. "N" numbers are new findings in section 3.

### 0.1 Bugs B1-B18

| # | Baseline finding | Status | Evidence |
|---|---|---|---|
| B1 | Matcher ignores the budget for commuters | **Mostly fixed** | Soft budget band `src/lib/match.ts:39` and `:241`; top-3 diversity `:315`. Commute at ৳4 lakh now gives SP160, FZS V2, Access 125 and FZS V4. At ৳1.5 lakh it gives 100cc commuters. The test is at `tests/engines.test.ts:387`. But the default ৳2.5 lakh answer is still two ৳1.46-1.52 lakh Platinas, and the diversity rule puts a "Good match" EV scooter above a "Great match" Raider (N3) |
| B2 | Quiz EMI and `/cost` EMI disagree | **Partly fixed** | One engine: `src/lib/fund.ts:89-94`, used by the quiz (`match.ts:217`) and `/cost` (`src/app/cost/CostView.tsx:347`). The card case agrees: N160, 12 months, ৳15,868 now plus ৳22,800 a month on both. The loan case still disagrees: the quiz finances 100% of the price, while `/cost` assumes 30% down (N2) |
| B3 | Used-only bikes shown with on-road and EMI | **Fixed** | `isUsedOption` at `match.ts:195`. Used bikes are left out of EMI mode at `:212`. Labels at `src/app/match/MatchView.tsx:597`, `:604`, `:703`, `:764` and `src/app/compare/CompareView.tsx:253`. Test at `tests/engines.test.ts:370` |
| B4 | Wrong or leaked public facts | **Partly fixed** | Classic 350 now has dual ABS, which matches royalenfield.com/bd. CBX 600P was removed. V-Strom SX 250 is flagged `availability: "unconfirmed"`. **Still open:** the Platina 100 ES still shows "CBS" (its `dataNote` is an owner TODO). The Apache RTR 160 4V still says 147 kg, and bikebd said 143 kg on 15 Oct |
| B5 | "Price checked" badge green forever; "Re-checked monthly" | **Fixed** | `src/components/Dated.tsx:85-97` and `src/lib/offers.ts:34-37`, used at `src/app/bikes/[id]/BikeDetail.tsx:167`. Used-only bikes say "Used-price estimate". With the clock at 10 Mar 2027, the N160 badge reads "· may be out of date". The phrase "Re-checked monthly" is gone from the UI. It survives only in `docs/launch-posts.md:3` |
| B6 | Compare tray evicts the oldest bike on a 4th add | **Fixed** | `src/lib/store.tsx:12` refuses a 4th. `src/components/ui.tsx:34-50` disables the button with the label "Compare full" (21 disabled buttons on `/bikes/` with 3 in the tray). Residual: the explanation is hidden on phones (N12) |
| B7 | Duplicate ids; a shared link wipes the tray | **Fixed** | `store.tsx:10` de-dups and drops unknown ids. `CompareView.tsx:35-42` seeds the tray only when it is empty or already identical. interact PASS |
| B8 | Brand search ranks antiques first | **Fixed** | `src/lib/search.ts:31-33` and `:53`. "honda" now gives SP125, SP160, Hornet 2.0, Dream 110, X-Blade… "yamha" gives FZS V4 first |
| B9 | Deploy cliff in March 2027 | **Partly fixed** | Only on-sale prices fail now: `scripts/validate-data.mjs:58-66`. There is an emergency override at `.github/workflows/deploy.yml:8-12`, `:37-39`. The monthly bot confirms 41 bikes. The other **43 on-sale bikes** still need the owner. Without the owner's batches, 10 of them (7 TVS, Avenger 160, Splendor+, Knight Rider V2) fail the gate from 1 Mar 2027, and 33 more from 31 Mar 2027 |
| B10 | Sticky Bangla redirect | **Fixed** | `src/lib/i18n.tsx:74-80`. Only the toggle stores `sb-lang`. interact PASS ("a /bn/ visit does not store a language") |
| B11 | Uncapped URL params | **Fixed** | `match.ts:365-386`. `b=-5` becomes ৳30,000. `b=999999999999` becomes ৳10 lakh. `pr` is de-duplicated and capped at 3. The EMI budget is derived, not read from `b`. Residual: the derived EMI budget is not clamped (N13) |
| B12 | A stale compare id shows an empty tray | **Fixed** | `src/components/CompareTray.tsx:20-22` counts resolved bikes |
| B13 | Buttons nested inside links | **Fixed** | Stretched-link cards at `ui.tsx:150` and `MatchView.tsx:743`. I measured 0 `a button` on `/bikes/` |
| B14 | Test bound to live offer data | **Fixed** | `tests/offers.test.ts:5`, `:37-38` use `tests/fixtures/offers.json` |
| B15 | `formatLakh` has no crore | **Fixed** | `src/lib/bike-utils.ts:44-51`. Test at `tests/engines.test.ts:314` |
| B16 | Two "per month" figures | **Fixed** | One `cardEmi` (`fund.ts:80`) on the ex-showroom price, used by `HomeView.tsx:296`, `BikeDetail.tsx:185`, `CompareView.tsx:253` and `CostView.tsx:287` |
| B17 | Photo licence link missing; caption truncated | **Fixed** | `BikeDetail.tsx:128-146` adds the author, a licence link and "resized, converted to WebP and cropped". The caption wraps below the photo on phones (screenshot checked) |
| B18 | Offer box shifts the bike page | **Partly fixed** | Offers prerender for the build date: `Dated.tsx:20-27`, `next.config.ts:11`. I measured CLS 0 today and with the clock at 5 Nov (offer expired), unthrottled. Two cases remain: an offer that starts after the build still mounts late, and an expired offer stays in the static HTML for clients that do not run JS (N15) |

### 0.2 Corner-case rows

| Case (baseline) | Now | Status |
|---|---|---|
| Quiz `b=0` / `b=abc` | Falls back to question 1 | OK, unchanged |
| Negative budget | Clamped to ৳30,000 | Fixed |
| Huge budget | Clamped to ৳10 lakh. Ranks MT-15, XSR155, Aerox, R15 as "possible" | Fixed |
| Nothing fits ৳30,000 new | Clear empty state, cheapest 3 | OK |
| ৳30,000 "open to used" (was CD70) | CD70 removed. Now nothing fits even with used; the cheapest fallback shows | No longer applies |
| "Fun", ৳7 lakh, used OK (was CBX 750) | `registrable()` at `match.ts:199`, `:213`. CBX 750 removed. Top: Karizma XMR, Gixxer SF 250, XSR155 | Fixed |
| Slider maximum | Unchanged | OK |
| Duplicate priorities via URL | De-duplicated | Fixed |
| Rider height | Unchanged | OK |
| Compare, 4th bike | Refused | Fixed |
| Compare, 4 ids in URL | Truncated to 3; the URL keeps 4 until edited | Still open (minor) |
| Compare, duplicate / unknown ids | De-duplicated / dropped | Fixed |
| Very long compare URL | n/a | Acceptable |
| State persistence, corrupt JSON | Wrapped reads (`store.tsx:34-41`) | OK |
| Stale saved / compare id | Filtered | Fixed |
| EMI at 0% interest | `loanEmi` principal/months (`fund.ts:10`) | OK |
| EMI with 0 down | BRTA and fee are now cash. With ৳0 cash nothing ever fits, yet the chip says "≤ ৳4.1 lakh on-road" | Changed: N5 |
| EMI rounding | Everything rounds to ৳1 via `formatBDT`. Instalments × months can differ from the total by a few taka | Cosmetic |
| BDT grouping | ৳2,85,364 | OK |
| Lakh/crore | Crore added. Bangla pages still mix Latin and Bangla digits | Partly fixed |
| Bangla-script search | পালসার, হোন্ডা, ইয়ামাহা resolve | OK |
| Banglish typos | "pulser", "apachi", "hunda", "gixer" work. "dicover" still finds nothing | Still open |
| Brand-only search | On-sale first | Fixed |
| Natural language ("bike under 2 lakh") | Still no results | Still open |
| Bad bike id | HTTP 404 page, local and live | OK |
| Missing images | 68 of 103 bikes use illustrations; still no `onError` fallback | Still open (low) |
| Very long names | CBX 600P removed | No longer applies |
| Stale prices | Badge ages; gate fails only on-sale prices | Fixed |
| Used-only bikes | 19, labelled as estimates | Fixed |
| Discontinued but listed "on sale" | 5 bikes flagged "Availability unconfirmed" on cards, the bike page and quiz warnings. But the matcher still ranks them #1 (N4) | Partly fixed |
| Offers past expiry | Hidden on the visitor's BD date | OK (see N15) |

### 0.3 Data-quality table (baseline 12 bikes, re-checked 15 Oct)

| Bike | Site now | Found today | Status |
|---|---|---|---|
| Pulsar N160 DC ABS | ৳2,73,600 | ৳2,73,600 bajajauto.com/en-bd | Match |
| Honda Hornet 2.0 | ৳2,89,000 | ৳2,89,000 bdhonda.com | Match |
| Yamaha FZS FI V4 | ৳2,92,500 | ৳2,92,500 bikebd | Match (BikeBD only) |
| Yamaha R15 V4 | ৳6,05,000 | ৳6,05,000 bikebd | Match |
| Suzuki Gixxer Monotone | ৳1,99,950 | ৳1,99,950 suzuki.com.bd/bikes | Match; the bot reads `/bikes` |
| TVS Apache RTR 160 4V SC ABS | ৳2,47,900, 147 kg | ৳2,47,900; bikebd "Weight is 143 KG" | Price match; **weight still open** |
| RE Classic 350 | Dual ABS, ৳4,47,700 | Dual Channel ABS | **Fixed** |
| Hero Splendor+ | ৳1,17,000 | ৳1,17,000 bikebd | Match; now flagged unconfirmed |
| KTM Duke 125 | ৳3,00,000 | ৳3,00,000 bikebd | Match; now flagged unconfirmed |
| Suzuki V-Strom SX 250 | ৳4,49,950 | ৳4,49,950, offer ৳4,29,950 bikebd; not on suzuki.com.bd/bikes | Price match; flagged; offer box mismatch (N8) |
| Honda CBR150R | ৳6,50,000 | Confirmed "same" by the bot dry-run on bdhonda.com | Match |
| Bajaj Platina 100 ES | ৳1,34,350, CBS | ৳1,34,350; official specs still drum/drum, no CBS | Price match; **CBS still open** |

Other baseline data findings:

| Finding | Now |
|---|---|
| BikeBD supplies 54% of price sources | 52/103 = 50% (validate warns above 50%). Still the single biggest source |
| "Outlier" gate checks for an excuse, not the price | Unchanged (`validate-data.mjs:70-79`) |
| Provenance notes in public text | Partly fixed: `dataNote` exists and is stripped by `scripts/build-data.mjs:24` (0 occurrences in the built HTML or JSON). But the lint misses most cases (N6) |
| Differentiator data (mileage, mechanic scores, parts) unverified | Still open. The mistri panel and mileage survey have not started |

### 0.4 SEO and performance gaps

| Gap | Status | Evidence |
|---|---|---|
| Sitemap has no `<lastmod>` | **Fixed** | `src/app/sitemap.ts:16-44`. 318 of 330 URLs have one; legal and about pages have none, on purpose |
| `changefreq weekly` everywhere | **Fixed** | Removed (`sitemap.ts:42`) |
| Product `Offer` without `availability` | **Fixed, but a new claim** | `bike-utils.ts:119-129` adds `InStock` and skips unconfirmed bikes. Asserting stock the site cannot see is a new honesty issue (N7) |
| Banglish queries not targeted | **Fixed** | Titles and descriptions use "dam koto" / "er dam koto?" (`src/lib/curated.ts:70-96`). But the brand drops out of titles (N10) |
| Authority gap against BikeBD | Still open | Not a code problem |
| `/bikes/` LCP fails 2.5 s | **Fixed (local)** | Local `/bikes/` LCP 616 ms against 3,212 ms live, same throttle profile. Local and live are not equal hosts |
| All 107 cards on `/bikes/` | **Fixed** | 24 cards, "Show more" and a `<details>` list of every bike. HTML is 244 KB raw / 16 KB gzip (live: 965 / 71) |
| Hind Siliguri on English pages | **Fixed** | English pages load 29 KB of fonts (live: 182). `/bn/` loads 124 KB (live: 214) |
| Bike index on every page | **Partly fixed** | Guides no longer load it up front, but JS transferred is unchanged: `/guide/` 270 KB local vs 271 live, because the logo link prefetches home (N14) |
| Not indexed yet | Still open | Owner task in Search Console |

### 0.5 Cut list

| # | Baseline cut | Status |
|---|---|---|
| 1 | Stop adding scope | **Partly.** The branch shrank the catalogue from 107 to 103. Meanwhile `main` gained 4 used-bike guides, a "priority bump" rule, a used-bike reserve on `/cost` and Throttle IQ card edits (N1) |
| 2 | Cut dubious used-only antiques | **Fixed.** CBX 600P, CBX 750, CD70 and Roadmaster CD200 removed |
| 3 | Move `ResearchingStuff/` and judge docs out of the public repo | **Still open.** The repo is public (GitHub API returns 200 without auth). 69 tracked internal files. `dataNote` "TODO(owner)" text is public in `src/data/bikes.json` too |
| 4 | Merge the judge files | **Still open.** There are now `judge.md`, `docs/new_judge.md`, `CrtiQue_Oct14.md`, the scorecard and this file |
| 5 | Delete two of the three EMI functions | **Fixed in the branch.** `emiFor`, `emiBudget` and `emiMonthly` are gone (grep finds 0). `main` still has `emiFor`, and its latest matcher commit builds on it |
| 6 | Remove "Re-checked monthly" | **Fixed** in the UI. Still in `docs/launch-posts.md:3` |
| 7 | Demote the Throttle IQ cross-promo | **Fixed in the branch.** The card was deleted; a footer link remains (`src/components/Footer.tsx:10`). `main` modified the card again, which is a modify/delete conflict |
| 8 | Drop Hind Siliguri weights | **Fixed** |
| 9 | Stop polishing the QA sweep before humans use the site | **Not followed.** `tools/qa/interact.mjs` grew by 58 lines. Still zero real-user sessions |

### 0.6 Top-10 actions

| # | Baseline action | Status |
|---|---|---|
| 1 | GoatCounter code and a form endpoint | **Still open.** `src/lib/site.ts:16` and `:25` are empty. WhatsApp is set (`site.ts:19`) |
| 2 | Fix the matcher's usefulness | **Mostly done** (B1; N3 and N4 remain) |
| 3 | One payment engine | **Done for card EMI; the loan down payment is missing** (N2) |
| 4 | Data fixes | **Partly done.** Classic 350 fixed, CBX 600P removed, availability flagged. Platina CBS, Apache weight and provenance in `quirks` remain |
| 5 | Honest freshness | **Done** |
| 6 | Watch 5-10 real buyers | **Not done** |
| 7 | Monthly refresh routine | **Built, not live.** Script, workflow and doc are good, and the dry-run works today. It has never run in Actions, it is not on `main`, the "Actions may create PRs" setting is off, and the owner's 62-item checklist has not started |
| 8 | Repo hygiene and doc counts | **Half done.** README and PRD now say 103 bikes and 7 questions. The repo is still public |
| 9 | Small UX bug batch | **Done** (B6, B7, B8, B10, B11, B12, B14, B17, fonts) |
| 10 | Decide the money question; lawyer | **Not done.** `src/app/about/AboutView.tsx:63` still promises "no affiliate deals"; no lawyer |

---

## 1. Verdict up front

- **What it is:** a static Bangladesh motorcycle buying guide. It has 103 bikes (84 new, 19 used-only), a 7-question matcher, compare, an ownership-cost and payment engine, dealers and guides, in English and server-rendered Bangla.
- **Who it is for:** a first-time buyer with a budget, on a phone, often reading Bangla.
- **This round was real work, and most of it holds.** 15 of 18 baseline bugs are fixed in code, and the other 3 are partly fixed. Fonts are down 84%, the `/bikes/` HTML is down 75%, and a working price-refresh bot exists.
- **It is not shipped, and it no longer merges cleanly.** `main` moved on with a contradicting matcher rule. Four files conflict.
- **New money bug:** the quiz's 18-36-month loans finance 100% of the price. Banks want 10-30% down.
- **Still nobody is using it.** Analytics and the form endpoint are still empty, and BikeBD now adds an AI assistant to its quiz.
- **Continue:** yes, as a narrow "honest on-road and monthly cost" wedge. Merge, measure, then talk to buyers.
- **My GTM readiness: 55%** for this branch once it is merged and deployed (production today: about 51%).

**Against the scorecard's 51%.** The scorecard scores production, and production has not changed, so 51 is still right for what users see today. For this branch, the weighted score is 58.5. Product, quality, legal, ops and honesty each gain a point, because the default-path bugs (budget-blind matching, mismatched EMI, used-only EMI, the leaked note, the eternal green badge) are fixed and verified. It does not reach 58.5, because the scorecard's own cap of 55 still binds. The site still cannot measure anything: there is no analytics, and the form falls back to mailto. I would move the cap's wording from "cannot hear users" to "cannot measure users": the WhatsApp link (`site.ts:19`) now gives a phone-friendly way to reach the owner. Until GoatCounter is on, no amount of code moves the number.

---

## 2. Code and architecture

**What changed structurally (good):**

- **Data-free helpers split out.** `src/lib/bike-utils.ts` (177 lines) holds formats, labels and JSON-LD, so the layout, header and guides import it without the bike index. `src/lib/bikes.ts` is now 32 lines.
- **Lazy index.** Search (`src/lib/search.ts`) loads on the first focus (`src/components/SearchBox.tsx:25`). The compare tray imports the index only when it has bikes (`CompareTray.tsx:16-19`). The store validates ids against a tiny `bikes.ids.json` (`store.tsx:4`).
- **One payment engine.** `src/lib/fund.ts` (94 lines) has `financePath`, `payPaths`, `emiPlan`, `emiCeiling` and `cardEmi`. It is pure and tested. This is the right shape.
- **`dataNote` is stripped at build** (`scripts/build-data.mjs:24`). I confirmed 0 occurrences in `out/` and `public/data/bikes/*.json`.
- **`scripts/price-refresh.ts` (265 lines) is well designed:**
  - pure `check`, `apply` and `body` functions with an injected fetcher;
  - one regex parser per distributor, each pinned by trimmed live markup in `tests/fixtures/price-refresh/`;
  - robots.txt honoured (`:210-245`), 2 s between requests, a clear User-Agent;
  - a ±30% "suspect" guard, and a test that fails when an official-sourced bike is missing from `OFFICIAL`.
  - The JSON round-trips byte-identical, so bot PRs will be small.

**What is still weak:**

- **The branch and `main` have diverged (N1).** This is the biggest architecture and process problem now. Two lines of development are changing the same engine with opposite rules.
- **The matcher is a hand-tuned score with interacting constants:** `BAND_LOW` 0.6, `DIVERSE_GAP` 5, `BAND` 88/78, hobby penalties of 0.3/0.14, and others. Each was tuned to pass one persona test. N3 shows two of them interacting badly: a 5-point diversity gap straddles the 88-point "great" line.
- **`MatchView.tsx` is 790 lines,** with copy, layout and pay logic mixed. That is manageable, but it is where conflicts with `main` land.
- **`ROAD_TAX_2YR` is still hard-coded** at `src/lib/cost.ts:28`, which breaks the "Cite" rule.
- **No test guards `guide.json` against `guide.bn.json`.**
- **`src/lib/maintenance-posts.ts` is now 839 lines** of content stored as code.
- **No human has reviewed the code.** All 31 commits in this round are agent co-authored (`Co-Authored-By: Claude` in every message).

**Standards adherence:**

- "Derive" is now honoured for EMI.
- "Cap" is honoured for URL params and compare. Saved bikes are uncapped, but only known ids can be added through the UI.
- "Cite" is still breached by `ROAD_TAX_2YR` and by the 14% loan rate and 1.5% fee. Both are labelled APPROX, which is acceptable.

---

## 3. Bugs, ranked by severity

Each item is Confirmed (traced or reproduced) or Suspected.

### High

**N1. The branch cannot merge cleanly into `main`, and `main` carries a contradicting matcher rule.** Confirmed (`git merge-tree`).

- **Where:** `origin/main` has 4 commits made after `a38083c`, on 15 Oct between 01:36 and 01:50:
  - `5faae19`: a docs page (`docs/each bike speciality.html`).
  - `6e98af2`: "Match: allow any number of priorities; >3 raises budgets under 3 lakh by 20%". It adds `PRIORITY_BUMP` and removes the 3-priority cap. It sits next to `emiFor`, which this branch deleted.
  - `39f3ed8`: 4 used-bike inspection guides.
  - `aafd7e5`: a used-bike reserve on `/cost` and Throttle IQ card changes.
- **Conflicts:**
  - `src/lib/match.ts`
  - `src/app/match/MatchView.tsx`
  - `src/app/cost/CostView.tsx`
  - `src/components/ThrottleIqCard.tsx` (modify/delete)
- **Failure scenario:**
  - A hurried merge either drops features that are live today (the `/cost` reserve, the priority rule) or brings the old EMI code back.
  - Deploying this branch as is would remove 8 live URLs (the 4 used-check guides in EN and BN) from the site and the sitemap.
  - Separately, `PRIORITY_BUMP` silently raises a buyer's budget by 20%. That breaks the site's own "never over your budget" invariant (`tests/engines.test.ts:31`, `:42`).
- **Fix sketch:**
  - Owner decides the priority rule first. My advice: drop the bump, and if more priorities should matter, show "you asked for a lot; these cost more" as a stretch section.
  - Rebase `oct14-int` onto `main`, keep the 4 guides, and re-delete the card.
  - Re-run `check.sh`, `interact` and `keyboard`, then push.
  - One trunk from now on.

**N2. Quiz loan plans finance 100% of the price, so "cash now" is far too low for 18-36 months.** Confirmed (engine run).

- **Where:** `src/lib/fund.ts:89-90`. `emiPlan` finances `min(price, maxPrincipal(...))` with no down payment. `/cost` uses `PAY_TERMS.loanDownPct = 30` (`fund.ts:34`, `CostView.tsx:347`).
- **Scenario (Pulsar N160, ৳20,000/mo, 24 months):**
  - The quiz says "৳15,868 cash now (BRTA ৳11,764 + fee ৳4,104), then ৳13,136/mo × 24", and the bike fits.
  - `/cost` says ৳96,717 cash now and ৳9,195/mo.
  - Real BD bike loans cap financing at 70-90%. A BikeBD post on BRAC Bank's Honda deal says 20% down for men and 10% for women. Reports on EBL say 70% of the price, and on City Bank's City Bike Loan up to 80%. All of these are secondary sources.
  - So a buyer with ৳20k cash is told a 24-month loan works when a bank would want roughly ৳55-82k down.
- **Why it hurts:** this is the B2 failure ("zero-cash buyer told it's affordable") moved from card EMI to loans. The test at `tests/engines.test.ts:355` passes only because it feeds both pages the same cash.
- **Fix sketch:**
  - For `months > cardMonths`, finance `min(price × (1 − loanDownPct/100), maxPrincipal(...))`.
  - Add a persona test: N160, 24 months, ৳20k cash must not fit.
  - About one line plus a test.

### Medium

**N3. The diversity rule puts a "Good match" above a "Great match" on the default path.** Confirmed (engine run and screenshot).

- **Where:** `match.ts:313-316` with `DIVERSE_GAP = 5` (`:41`). The bands are at `:305` (great ≥ 88).
- **Scenario (default quiz: ৳2.5 lakh, commute, either gearbox):**
  - #1 Platina 110 H (93) and #2 Platina 100 (92).
  - #3 Walton Takyon Fusion 25TD, an EV scooter scored 85 ("Good match"), with the warning "Parts are mostly dealer-only — expect waits".
  - #4 TVS Raider 125, scored 89 ("Great match").
  - "Compare top 3" then compares two Platinas and the Walton.
- **Fix sketch:** swap only when the candidate is in the same band as #3 and carries no parts or network warning. Or show it as a labelled "Different style" pick under the top 3.

**N4. Bikes flagged "availability unconfirmed" win #1, and the home page hides the flag.** Confirmed.

- **Where:** `match.ts:286` adds a warning but no score change. The home Quick pick (`src/app/HomeView.tsx:313-337`) shows `reasons[0]` and never shows warnings.
- **Scenario:**
  - Hero Splendor+ is flagged unconfirmed and has a BikeBD-only price.
  - It is #1 for commute at ৳1.3, ৳1.5 and ৳2 lakh, and for rideshare at ৳2 lakh.
  - On the home page at ৳1.5 or ৳2 lakh, the #1 pick is a bike the site itself says may not be sold, with no badge.
- **Fix sketch:** a small penalty (about −0.08), or rank unconfirmed bikes after confirmed ones with the same band. Show the badge in Quick pick.

**N5. EMI mode with ৳0 cash: nothing ever fits, but the header promises "≤ ৳4.1 lakh on-road".** Confirmed (browser).

- **Where:** `fund.ts:93-94`. `emiCeiling` treats cash and loan as interchangeable, but BRTA cannot be financed. `match.ts:229` then requires `upfront ≤ down`.
- **Scenario:**
  - `/match/?…&pm=monthly&m=20000&d=0&t=24&r=1` shows the chip "৳20,000/mo × 24 + ৳0 cash · ≤ ৳4.1 lakh on-road", then "Nothing fits — yet."
  - The fallback (`MatchView.tsx:471`, `cheapestPicks`) lists the cheapest bikes (Lifan Glint 100), not the bikes ~৳16k of cash would unlock.
  - "No savings, ৳10-20k a month" is a very common Bangladeshi buyer.
- **Fix sketch:** when `down` is below the cheapest BRTA + fee, say "You need at least ৳12-16k in cash for BRTA and fees". Then show matches for that cash, and take the header ceiling from the binding limit.

**N6. Provenance text still shows under "Quirks owners talk about".** Confirmed (grep of the public fields).

- **Where:**
  - The lint regex `validate-data.mjs:11` catches only `user|BikeBD data|placeholder|unconfirmed|TODO|FIXME`. `\buser\b` does not even match "users".
  - The heading is at `BikeDetail.tsx:342`.
- **Examples in public `quirks` and `braking` text:**
  - `haojue-ka135`, `haojue-tr150`, `lifan-glint-100`, `lifan-k19`, `runner-bolt-165r`: "bikebd's spec table and review disagree…"
  - `suzuki-ax100`: "Power (7.88 BHP) from BikeBD; torque, weight… approx, unverified".
  - `honda-cdi-h100s` and `honda-cd80`: the same kind of note.
- **Why it hurts:** it reads as the site's notes about its sources, not owner experience, and it names the main competitor as the reference.
- **Fix sketch:** move these lines to `dataNote` or a separate "Data notes" line. Widen the lint to `bikebd|owner|source|spec table`.

**N7. JSON-LD claims `InStock` from a seller the site has not checked.** Confirmed in code; Search Console impact Suspected.

- **Where:** `bike-utils.ts:119-129`. Every on-sale bike that is not flagged gets `availability: InStock` and `seller: <distributor>`.
- **Why it hurts:**
  - The site cannot see stock. This is the same class of claim as the old "Re-checked monthly".
  - Google may read the page as a merchant listing and warn about missing shipping and returns details (not verified; Search Console has no data yet).
- **Fix sketch:** drop `availability` and `seller`. Or drop `offers` and use editorial Product or Review markup with a named author.

**N8. The V-Strom SX 250 page contradicts itself.** Confirmed (screenshot).

- **Where:**
  - `src/data/offers.json:10`, `:14`: regular ৳4,50,000, offer ৳4,30,000, source "Reported by the site owner", no URL.
  - The headline is ৳4,49,950, and BikeBD's offer is ৳4,29,950.
  - The page shows "Sold by Rancon Motorbikes Ltd" (`BikeDetail.tsx:253`) beside "The distributor does not list this model now" (`:197-204`).
  - A green "Price checked" badge, "Offer" and "Availability unconfirmed" all sit in the first screen.
- **Fix sketch:**
  - `validate` checks that `offer.regularPriceBDT` equals the bike's price.
  - Hide offers and "Sold by" on unconfirmed bikes.
  - Require a source URL for offers.

### Low

**N9. Search substring noise and gaps.** Confirmed (engine run).

- `search.ts:40` (`name.includes(n)`) makes "r15" return the R15 V3 and V4, then Pulsar 150 ("pulsa**r15**0"), XSR155, CBR150R and TR150.
- "dicover" and "bike under 2 lakh" return nothing.
- Fix: match on word starts for substrings; route price phrases to `/bikes/?price=`.

**N10. Bike titles drop the brand to keep the tail.** Confirmed.

- `curated.ts:76` tries "model + long tail" before "full name + shorter tail".
- So the N160 page is titled "Pulsar N160 price in BD, on-road cost and EMI (dam koto)", without "Bajaj". The same happens to other long names.
- Most BD queries include the brand.
- Fix: order the candidates so the full name with a shorter tail wins. Consider moving "(dam koto)" to the description only.

**N11. Back from a bike after "Show more" loses the scroll position.** Confirmed (Playwright).

- On `/bikes/`, I pressed Show more twice (72 cards, `?page=3`), opened card 61, then pressed Back.
- 72 cards came back, but `scrollY` was 65. The buyer has to scroll past 60 cards again.
- Pagination itself works: the URL, reload and back all keep the count.
- Fix: save the scroll position in `sessionStorage` and restore it after the cards render.

**N12. The "Compare holds 3" explanation is hidden on phones.** Confirmed.

- `CompareTray.tsx:52` is `hidden … sm:inline` on an `aria-live` region, so phone screen-reader users hear nothing.
- The disabled button's reason is only in `title` (`ui.tsx:44`).
- Fix: make the hint `sr-only` on phones, not `hidden`.

**N13. The derived EMI budget is not clamped.** Confirmed. `match.ts:374`: `d=1000000&m=60000&t=36` shows "≤ ৳27.3 lakh". This is cosmetic.

**N14. The lazy index saves nothing once the page is idle.** Confirmed (weight).

- `/guide/` transfers 270 KB of JS against 279 KB on `/`, because the logo `Link` prefetches home. `tools/qa/README.md` admits this.
- On metered phone data, bytes still cost money.
- Fix: `prefetch={false}` on home links from pages that do not list bikes.

**N15. Offer prerender edge cases.** Suspected (by code; I measured CLS 0 unthrottled).

- An offer whose `startsOn` is after the last deploy still mounts after paint.
- An expired offer stays in the static HTML, as seen by Facebook link previews and other clients that do not run JS, until the next deploy (`Dated.tsx:20-27`).
- Deploys happen only on a push.
- Fix: a cheap scheduled weekly rebuild, or no offers in prerendered HTML at all.

**N16. Small leftovers.**

- The footer still prints a raw "oldest price checked 2026-09" (`Footer.tsx:25`).
- The answer chip shows lowercase English "Pillion: sometimes" (`MatchView.tsx:512`).
- The validate warning text is copy-pasted for all three settings (`validate-data.mjs:116`).
- Quiz options still auto-advance after 180 ms (`MatchView.tsx:144`), which is Suspected under WCAG 3.2.2.

**Checked and found sound:** `isUsedOption` and its call sites; the cash-now check in `candidates` (equivalent to the ceiling when financing is capped); `compareIds` and `toggleIn`; the shared-link tray rule; `pageParam` clamping; the price-badge ageing thresholds (counted from the 1st of the month, as validate does); hydration safety of `BUILD_DAY`; `PRICE_FAIL_DAYS` (a non-number fails; 0 fails everything, which is harmless); the robots.txt matcher; sitemap `lastmod` (latest of `priceAsOf` and the history `firstSeen`, with full git history in `deploy.yml:29`).

---

## 4. Corner cases

| Case | Result (this branch) | Verdict |
|---|---|---|
| Quiz budget ৳0 / text | Question 1 | OK |
| Quiz `b=-5` | ৳30,000, empty state, cheapest 3 | OK |
| Quiz `b=999999999999` | ৳10 lakh, ranks the 150cc Yamahas as "possible" (scores 66-70) | OK |
| Commute ৳1.5 lakh vs ৳4 lakh | 100cc commuters vs SP160, FZS V2, Access 125, FZS V4 | Fixed |
| Default ৳2.5 lakh | Platina 110 H, Platina 100, Walton EV (Good) above Raider (Great) | N3 |
| Highway ৳1.5 lakh | All "possible" (62-67), with a ">70 km/h strain" warning | Honest |
| Max budget, "lowest price" priority | 100cc commuters at ৳4 lakh: the band is off, by design | OK |
| EMI ৳10k/mo, ৳30k cash, 12 months | Splendor+ (৳12,419 now), Platina 100 (৳27,914 now), HF Deluxe | Correct cash check |
| EMI ৳0 cash | Nothing fits; header says ≤ ৳4.1 lakh | N5 |
| EMI 24 months, ৳20k/mo | 100% financed; ৳15,868 cash now | N2 |
| EMI ৳10 lakh cash, ৳60k/mo, 36 months | Platina 100 on a 36-month loan; the cash is never used to cut interest | Same root as N2 |
| Legacy shared EMI link without `d` | `d` defaults to 0, so "Nothing fits" | Low, no users yet |
| 0% card EMI | price/12, fee 1.5% upfront | OK |
| Rounding | ৳1 everywhere | OK |
| Lakh, crore, ৳99,99,999 | "৳1 crore" | OK |
| Bangla pages' numerals | "৳2,85,364" next to "২ বছরের" | Still mixed |
| Compare 4th / duplicates / stale / shared link with full tray | Refused / de-duplicated / dropped / tray left alone | OK |
| Compare 4 ids in URL | Shows 3; the URL keeps 4 | Minor |
| Search: Bangla script, Banglish | OK; "dicover" fails; "r15" is noisy | N9 |
| Bad bike id | 404 | OK |
| Missing image file | No `onError` fallback | Low |
| Stale prices (clock 10 Mar 2027) | Red badge "may be out of date"; validate would fail on-sale prices | OK, and the gate still bites (B9) |
| Used-only bike page | "Used-price estimate", no EMI, "Bikroy asking" | OK |
| Unconfirmed availability | Badge, bike-page note, first quiz warning; still ranked #1; home shows nothing | N4 |
| Offer expired (clock 5 Nov) | Hidden after mount, CLS 0 | OK (N15 for no-JS clients) |
| Pagination `?page=abc` / `-3` / `999` | 1 / 1 / last page | OK |
| Pagination back navigation | Count kept, scroll lost | N11 |

---

## 5. Data quality and trust

**Spot-check (15 Oct, 22 bikes and 24 prices, all match):**

| Source | Bikes | Result |
|---|---|---|
| bajajauto.com/en-bd | Pulsar N160 ৳2,73,600; Platina 100 ৳1,34,350 | Match |
| bdhonda.com | Hornet 2.0 ৳2,89,000; SP160 ৳1,99,000 / ৳2,25,000 | Match |
| suzuki.com.bd/bikes | All 10 listed models (Gixxer 250 ৳3,79,950 … GSX 125 ৳1,41,950) | Match |
| royalenfield.com/bd | Hunter 350 Rebel ৳3,71,500 | Match |
| heromotocorp.com/en-bd | Hunk 150R DD ৳1,98,000 / DD ABS ৳2,10,000 | Match |
| waltonbd.com | Takyon Fusion 25TD ৳1,61,999 | Match |
| bikebd.com | FZS V4 ৳2,92,500; R15 V4 ৳6,05,000; Apache 4V SC ABS ৳2,47,900; Duke 125 ৳3,00,000; Splendor+ ৳1,17,000 | Match |

The bot dry-run confirms all 62 official prices on 38 pages (41 headline prices) with 0 changes.

**What this says:**

- **Prices are accurate today.** Transcription has never been the problem.
- **Specs are still where errors are.** Two items have been open since the baseline (Platina CBS, Apache weight), both waiting on the owner.
- **Availability** is now handled honestly in labels but not in ranking (N4).
- **Sourcing:** bikebd.com 52 (50%), bikroy.com 14, bajajauto 10, bdhonda 10, suzuki 8, Hero 4, RE 4, Walton 1. Every Yamaha and TVS price depends on BikeBD.
- **Freshness is now a process on paper:**
  - 41 bikes are confirmed automatically each month.
  - 62 (43 on sale, 19 used) go on a 4-week owner checklist at 2-3 minutes each.
  - The bot has never run in GitHub Actions. The owner part has not started.
- **The differentiator is still unproven.** Real-world mileage, mechanic familiarity and parts availability are editorial estimates (labelled APPROX). No owner survey or mistri panel exists.

**How errors get fixed:**

- Readers can report through WhatsApp (now set, `site.ts:19`, shown in the footer, the feedback page and both forms), a mailto, or a GitHub issue.
- `FORM_ENDPOINT` is still empty, so the form opens an email app.
- Every fix is still a JSON edit, a push and a deploy, by the owner or an agent.
- There is no triage log or response-time promise (`LegalView.tsx:11` TODO).

---

## 6. SEO and performance

**Indexability:**

- `robots.txt` allows everything and points to the sitemap.
- The sitemap has 330 URLs (165 EN + 165 BN), 318 of them with `lastmod`.
- Canonical and `hrefLang` en, bn and x-default are on every page checked.
- OG images point to `/bikes/<id>/og.png`. Live returns `image/png` for EN and BN. Locally, `/bn/` cards need `npm run og:bn`, which only runs in deploy.
- HTTP and www redirect to the HTTPS apex (301).
- A missing bike returns 404.
- Production's sitemap still has 346 URLs, no `lastmod`, and the 4 removed bikes. Those 8 URLs will 404 after deploy. That is fine before indexing.

**Structured data:** Product plus Breadcrumb. The Offer now carries `InStock`; I would remove it (N7).

**Titles:** they target "dam koto" and "দাম কত" (good for Banglish and Bangla search) but drop the brand on long names (N10). No title carries the site name.

**Page weight** (`tools/qa/weight.mjs`, 375 px, ~1.6 Mbps, 150 ms RTT, 4× CPU, cold cache; KB compressed). Local `serve` and GitHub Pages are different hosts, so compare bytes more than milliseconds.

| Page | Branch JS / font / HTML KB | Branch LCP ms | Live JS / font / HTML KB | Live LCP ms |
|---|---|---|---|---|
| `/` | 279 / 29 / 21 | 692 | 273 / 182 / 37 | 1,880 |
| `/bn/` | 279 / 124 / 22 | 1,088 | 273 / 214 / 38 | 2,004 |
| `/bikes/` | 257 / 29 / 16 | 616 | 252 / 182 / 71 | 3,212 |
| `/bikes/bajaj-pulsar-n160/` | 315 / 29 / 19 | 712 | 314 / 182 / 23 | 1,892 |
| `/bn/bikes/bajaj-pulsar-n160/` | 315 / 124 / 20 | 1,052 | n/m | n/m |
| `/match/` | 248 / 29 / 7 | 644 | 245 / 182 / 8 | 1,724 |
| `/cost/` | 240 / 29 / 11 | 704 | n/m | n/m |
| `/guide/` | 270 / 29 / 21 | 684 | 271 / 182 / 24 | 972 |

(n/m = not measured live.)

**Reading:**

- Fonts and HTML are real wins: about 150 KB less on every English page.
- JS did not move. The site still ships 240-315 KB of JS on every page. On real rural 3G (0.5-1 Mbps) the home page's ~360 KB total is a 3-6 s full load, though LCP is text and arrives early.
- The next win is JS: prefetch control (N14) and checking what the 280 KB actually is.

---

## 7. UI

**Better:**

- The credits wrap and link their licences.
- The price badge shows its age in words, not only colour.
- "Availability unconfirmed" pills appear on cards and pages.
- `/bikes/` is no longer 33 phone screens long.
- Clean at 375 and 1280: no overflow, axe clean.

**Still weak:**

- **The quiz result's first phone screen still has no bike name and no price.** It shows the heading, Share, 5 answer chips and the top of an illustration (screenshot at 375x812).
- **The compare tray covers content at 375** and truncates chips to one word ("Pulsa…"). Seen on the EMI empty-state screenshot.
- **The V-Strom page's first screen stacks** "Availability unconfirmed", a green "Price checked", "Offer" and an offer box with a different regular price. That is too many signals, and they disagree (N8).
- **68 of 103 bikes are illustrations.** They are tidy, but they look alike.
- **Mixed numerals** on Bangla pages.
- **Raw date in the footer** (N16).

---

## 8. UX

**Does the quiz now help a first-time buyer decide?** Mostly, yes:

- Budget now matters.
- EMI mode asks for "cash available now" and checks it.
- Used and used-only options are labelled honestly.
- Unconfirmed bikes warn first.

**Remaining friction:**

- **Default answers are still pre-selected.** `keyboard.mjs` reports them selected on first view. "Skip to results" gives a confident answer the user never chose. `decision.md` suggests starting blank; I agree.
- **Two common money personas get wrong or useless answers:** "no savings" (N5) and "bank loan" (N2).
- **The default top 3 is odd** (N3), and the home page hides warnings (N4).
- **After a suggestion, nothing new.** There is still no "ask this showroom", no price or offer alert and no way to save a result except the URL. Saved bikes live in one browser.
- **Pagination** loses the scroll position on Back (N11).

**Trust signals:** better (aging badge, estimate labels, licences, takedown text). There is still no face: no named mechanics, no owner reviews, and the editor is named only on `/about`.

---

## 9. Accessibility

- **axe:** 0 serious or critical issues on 9 key pages at 375 and 1280 (EN, BN, results, compare, cost).
- **Keyboard:** 53 checks pass, including the quiz with a focus ring on each option, the search combobox, the compare add-slot and the `/bikes` switches.
- **Fixed:** buttons inside links (0 on `/bikes/`); the slider now announces "৳2.5 lakh" (`MatchView.tsx:396`); the tray's "Compare" is a `span`, not a focusable disabled link, below 2 bikes (`CompareTray.tsx:61-65`).
- **Open:**
  - The compare-full explanation is hidden on phones (N12).
  - Auto-advance after 180 ms on option pick (`MatchView.tsx:144`) is Suspected under WCAG 3.2.2. I did not test screen-reader focus placement.
  - Disabled "Compare full" buttons leave the tab order, so keyboard users get no reason.

---

## 10. Testing and verification

**What the tests prove** (84 tests, 83 pass, 1 skipped, against 52 at baseline):

- Persona tests: budgets change results, rideshare and village picks.
- The B2 scenarios.
- B3 used options never carry EMI.
- The 375cc limit.
- The diversity rule.
- URL clamping.
- `formatLakh` crore.
- Store tray rules.
- Search ranking for brands.
- Price-refresh parsers against pinned markup, and `OFFICIAL` coverage.
- The validate gate, `PRICE_FAIL_DAYS` and the `dataNote` lint.
- JSON-LD shape.
- Sitemap `lastmod`.

This is a strong suite for a static site.

**What they do not prove:**

- **Loan cash** (N2). The "agree" test feeds both engines the same cash, which hides the different down-payment rules.
- **Band order on screen** (N3). The diversity test checks that two styles appear, not that a "Good" never sits above a "Great".
- **Unconfirmed bikes at #1** (N4), and the ৳0-cash header (N5).
- **The merge with `main`** (N1). Every green check here is on a branch that does not include production's code.
- **The bot in Actions.** It has never run on GitHub. My local dry-run is the only live evidence, and it passed.
- **Browser QA in CI.** I ran `tools/qa` by hand (interact 39/39, keyboard 53/53, qa clean). It is still not in `check.sh` or CI.
- **Real devices and real users:** still zero.
- **Human code review:** still zero.

---

## 11. Deploy and operations

| Area | State | Note |
|---|---|---|
| Hosting | GitHub Pages, HTTPS, apex + www redirect | Fine |
| Deploy | Push to `main` → `deploy.yml` (validate, tsc, tests, build, Bangla OG) | Unchanged. Now has a `price_fail_days` input for emergencies |
| Branching | **`oct14-int` 31 commits ahead, `main` 4 commits ahead, 4 conflicts** | The top ops risk (N1) |
| Price refresh | `.github/workflows/price-refresh.yml`, 1st of the month 09:17 Dhaka, one bot PR | Never run in Actions. Schedules run only from the default branch, so nothing happens until merged |
| Bot PR creation | Needs "Allow GitHub Actions to create and approve pull requests" | Off, per `docs/price-refresh.md`. Not listed in `docs/Todo_owner.md`'s "Blocked on you" |
| Bot PR CI | `GITHUB_TOKEN` PRs do not trigger `check.yml` | Documented. `deploy.yml` still validates after merge |
| Bot branch | Force-pushed monthly; unmerged fixes on it are lost; ticked boxes are overwritten if the PR is still open | Documented. Acceptable |
| Owner workload | 62 manual checks a month (43 on sale, 19 used), 2-3 hours | Not started. The first batch shows "due 2026-10-22" in the dry-run |
| Monitoring | None | Add UptimeRobot on `/` and `/sitemap.xml` |
| Analytics | **Off** (`site.ts:25`) | Blocks learning anything |
| Feedback | WhatsApp set; form falls back to mailto (`site.ts:16`) | Half done |
| Rollback | `git revert` + push | Adequate |

---

## 12. Legal and compliance

**Added this round:** a trademark notice, a correction and takedown process, and photo licence terms (`src/components/LegalView.tsx`). The licence links on bike pages are now right for CC BY and BY-SA.

**Still open:**

- No lawyer review (`LegalView.tsx:8`, `:64`).
- No operator name or postal address (`:9`).
- No governing law (`:10`).
- No response time (`:11`).
- `AboutView.tsx:63` still says "no affiliate deals with dealers". It must be reworded before any lead or referral deal.

**New claim risks:**

- **`InStock` in JSON-LD** (N7).
- **An offer sourced "Reported by the site owner"** with no URL, on a bike whose availability the site itself doubts (N8). Under the Consumer Rights Protection Act 2009 the seller carries most of the risk, but a published "save ৳20,000" with no source is the kind of thing a complaint quotes.
- **Public repo:**
  - `ResearchingStuff/`, `judge.md`, `docs/new_judge.md` and the critiques are public.
  - So are `dataNote` lines like "TODO(owner): … Confirm with TVS Auto Bangladesh".
  - It is not illegal, but it is free ammunition for competitors and distributors.
- **Data protection:** PDPO consent and a named processor will be needed the moment `FORM_ENDPOINT` is set. The privacy page covers this "if enabled".
- **The WhatsApp number is public.** Confirm it is a business line.

**Good practice to keep:** the refresh script honours robots.txt, identifies itself, and never fetches Bikroy or BikeBD (`docs/price-refresh.md`).

---

## 13. Market, demand and marketability

**Market.**

- About 467k motorcycles were sold in 2025 (Daily Star, cited at baseline).
- TBS reports the market reviving after five years of decline.
- A Daily Star supplement puts the 2022 peak near 640k and 2024 at about 384k.
- The 100-125cc commuter segment is the volume.
- Demand is real and recovering. Treat the figures as approximate: sources disagree.

**Competitors (checked 15 Oct):**

| Competitor | What they have | Gap Suggest.Bike could fill |
|---|---|---|
| **BikeBD** | "Find Your Bike" quiz: budget (6 bands), petrol or EV, style, cc, use (commute, highway, ride sharing, touring, family), EV range. Also "**Ask Mr.BikeBD**" AI assistant, compare, Bangla, showroom lists, iOS and Android apps, fuel cost calculator. Estimated ~1M+ visits a month (baseline estimate, not re-verified) | No EMI or loan calculator and no all-in monthly cost seen on its homepage |
| **BikeValy** (bikevaly.com, Rajshahi) | Price lists by brand, cc, brake type and body; compare; reviews; news; showrooms; a Bangla link. Its `www` HTTPS certificate is broken (served over HTTP) | Weak tech; same content model |
| **MotorcycleValley** | Compare, EMI pages by brand, forum, Q&A (baseline) | — |
| **Bikroy** | Used listings | No guidance |
| **YouTube** | The Bengal Rider (~675k subscribers, Qoruz, Jul 2026), CHOCOLATE BIKER (~802k, vidIQ, Jun 2025), MotorCycle Lover (~262k), SARDAR VLOGS (~173k), Nawaz Motovlog. These are third-party counts | Creators need numbers they can show: monthly-cost cards |
| **Facebook groups** | BD Bikerz (since 2007), brand owner clubs, many buy-sell groups | Many ban links; post the content itself |

**Honest positioning:** the quiz is not a differentiator. BikeBD's is broader and now has an AI assistant. What BikeBD lacks, and this site has, is a credible **"cash now + monthly + true running cost"** answer for a shortlist, in Bangla, with no ads. After N2 and N5 are fixed, that is the wedge:

> "Can I afford this bike? Here is the cash you need today, the instalment, and what it costs to run."

**Monetisation, in order of fit:**

1. **Finance referral.** Banks run motorcycle-loan tie-ups with distributors (BikeBD reports a BHL–BRAC Bank MoU; City Bank, EBL and BRAC offer bike loans). A "check your loan" hand-off with disclosed referral pay fits the wedge best. There is no public affiliate programme, so this needs direct deals.
2. **Disclosed showroom lead.** "Get today's on-road price from an official showroom" by WhatsApp. It needs traffic numbers first, which needs analytics.
3. **Display ads.** BD CPMs are low and ads clash with the "no ads" tone. Not worth it before BikeBD-scale traffic.
4. **Sponsored content.** This is how incumbents earn, and it breaks the site's promise.

Arithmetic stays as at baseline: about ৳3 lakh a year at a 1% share. This is a side project until it proves it can pull traffic.

**Marketability today:** no analytics, so no Facebook post can be measured. `docs/launch-posts.md` is ready, but posting before GoatCounter is on wastes the one first impression.

---

## 14. GTM percentage breakdown

Scored for this branch once it is merged and deployed. Production today stays at about 51.

| Dimension (weight) | Scorecard | Mine | One line |
|---|---|---|---|
| Product works end to end (25) | 6 | **7** | The budget-aware matcher, one payment engine, honest used and availability labels, and clamped links all work. The loan cash is wrong (N2), ৳0 cash is a dead end (N5), and the default top 3 is odd (N3, N4) |
| Quality and verification (15) | 6 | **7** | 84 tests including personas and parser fixtures; browser QA passes 92 checks by hand; the price bot works on live pages today. No CI browser QA, no real device, no human review, and the branch does not include production code |
| Security and privacy (15) | 8 | **8** | Static site, no server PII, escaped text, wrapped storage; the bot workflow is scoped to `contents` and `pull-requests` write. Unchanged |
| Legal and compliance (10) | 4 | **5** | Trademark, takedown and licence text added, and licence links rendered. Still no lawyer, no operator identity or governing law, and the About promise blocks monetisation |
| Market validation (15) | 1 | **1** | Zero users and zero analytics. BikeBD added an AI assistant to an already broader quiz |
| Deploy and operations (10) | 4 | **5** | Monthly refresh bot, staggered checklist and emergency override are built and documented. But they are not on `main`, never ran in Actions, the branch conflicts, and there is no monitoring or analytics |
| Claims honesty (10) | 6 | **7** | "Re-checked monthly" is gone, badges age, used prices are "estimates", the leaked note and wrong ABS are fixed. New or remaining: `InStock`, the V-Strom offer and "Sold by" contradiction, Platina CBS, provenance in "quirks" |

**Weighted:** (7×25 + 7×15 + 8×15 + 5×10 + 1×15 + 5×10 + 7×10) / 10 = **58.5**.

**Cap: 55.** The site cannot measure users: there is no analytics, and the form falls back to mailto. WhatsApp now gives a way to hear from them, so I restate the cap's reason, but it still binds.

**Final: 55%** (scorecard: 51%, which remains right for production).

**Where I disagree with the scorecard and `judge.md`:**

- **Scorecard cap note:** "The quiz gives commuters the same three 100cc bikes at every budget (`src/lib/match.ts:83`)" is true in production, false in this branch. Update it when the merge lands.
- **Scorecard status check:** "87+ bikes" is stale. There are 103.
- **`judge.md` Update 13:** "Score unchanged at 60%" is stale against the scorecard's own 51.
- **`judge.md`:** it treats the Product Offer as a rich-result win. I think `InStock` from a non-seller is a liability (N7).
- **`tools/qa/README.md`:** "after the bundle split" is honest that prefetch undoes the JS saving. But the commit title "Keep the bike index off pages that do not list bikes" oversells it: JS transferred did not drop.
- **Nobody tracks that `main` and the agent branches are drifting apart.** That is now the main risk, not data.

---

## 15. What to cut or stop doing

1. **Stop parallel development on `main` and agent branches.** One trunk. Agents branch from the current `main` and merge within a day.
2. **Drop `PRIORITY_BUMP` from `main`.** Silently adding 20% to a stated budget contradicts the site's core promise.
3. **Delete the Throttle IQ card again** when merging. Keep the footer link.
4. **Remove `InStock` and `seller` from JSON-LD.**
5. **Remove offers with no source URL.** Hide offers and "Sold by" on unconfirmed bikes.
6. **Move provenance text out of `quirks` and `braking`.** Widen the lint.
7. **Freeze scope:** no new bikes, guides or tools until analytics shows what people use. `main` added 4 guides this week.
8. **Stop growing `tools/qa`.** Watch five humans instead.
9. **Make the repo private,** or move `ResearchingStuff/`, the judge files and critiques out.
10. **Merge the status files** into one `judge.md`, newest first. Delete `docs/new_judge.md` after merging its points.

---

## 16. Top 10 next actions, ordered by value

| # | Action | Effort | Who |
|---|---|---|---|
| 1 | **Decide the priority rule, then rebase `oct14-int` onto `main`.** Resolve the 4 conflicts (keep the 4 used-check guides and the `/cost` reserve; drop the bump; re-delete the card). Run `check.sh`, `interact` and `keyboard`, then push. Production gets every B-fix only after this | 15 min decision; 2-4 h | Owner decides; agent merges |
| 2 | **Set `GOATCOUNTER_CODE` and `FORM_ENDPOINT`** (`src/lib/site.ts:25`, `:16`) and send one test message to `hello@`. This lifts the cap | 30 min | Owner (accounts); agent (wire, 10 min) |
| 3 | **Fix loan cash in the quiz (N2):** a loan finances at most `(1 − loanDownPct)` of the price; add the N160 24-month persona test | 1 h | Agent |
| 4 | **Fix the default path:** band-safe diversity (N3); unconfirmed bikes ranked below confirmed ones and badged in Quick pick (N4); a ৳0-cash message with the minimum cash and real options (N5) | 2-3 h | Owner approves the rules (15 min); agent builds and tests |
| 5 | **Turn on "Allow GitHub Actions to create and approve pull requests",** run `price-refresh` once by hand after the merge, review and merge its PR | 30 min | Owner |
| 6 | **Watch 5-10 first-time buyers** use the quiz and `/cost` on their own phones, in Bangla. Ask: what would you do next? Real-device test and market validation in one | 1-2 days | Owner |
| 7 | **Start the monthly owner batch:** first the 10 September-dated on-sale bikes (7 TVS, Avenger 160, Splendor+, Knight Rider V2), which turn amber on 1 Nov and fail the gate on 1 Mar 2027 | 2-3 h a month | Owner |
| 8 | **Claims batch:** Platina CBS and Apache weight by phone; V-Strom availability; drop the unsourced offer; move provenance out of `quirks`; remove `InStock`; fix titles to keep the brand (N10) | Owner 1 h of calls; agent 1-2 h | Both |
| 9 | **Repo hygiene:** make the repo private (the site publishes the data anyway) or move internal docs out; merge the status files | 30 min | Owner (visibility); agent (docs) |
| 10 | **Money and legal before traffic:** reword the About promise to "money never changes rankings"; lawyer review with operator identity and governing law; pilot one disclosed loan or showroom hand-off with one distributor or bank | 2-4 weeks elapsed | Owner + lawyer; agent builds the hand-off |

**Not checked:**

- No real device, no screen reader, no Facebook share-debugger preview.
- CLS measured only unthrottled.
- Search Console has no data.
- Bank loan terms, YouTube subscriber counts and BikeBD traffic come from secondary or third-party sources (medium confidence).
- BikeBD's homepage was read through a fetch summary, not a browser.
- I did not proofread the Bangla copy.
- Only 22 of 103 bikes were checked by hand, plus the bot's 62 official prices.

**Risk the owner must know:** this round's fixes are invisible until `oct14-int` is reconciled with `main`. The two now disagree on how the matcher treats a buyer's budget.
