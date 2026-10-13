# SEO log

Run log for the SEO agent (`.claude/agents/seo.md`). Newest run at the bottom. Owner: paste Search Console data (queries, impressions, CTR per page) under a dated heading and the next run will use it.

## 2026-10-13: run 1

**Changed**
- Technical audit of the built `out/` (title, description, self-canonical, en/bn/x-default hreflang, `lang`, sitemap membership, orphans) over all 198 pages. Only finding: `/saved/` and `/bn/saved/` were indexable but not in the sitemap; they are per-browser lists, so now `noindex, follow` (`src/app/saved/page.tsx`, `src/app/bn/saved/page.tsx`).
- New page: motorcycle fines, `/guide/motorcycle-fines/` + `/bn/guide/motorcycle-fines/` (`src/app/guide/motorcycle-fines/FinesView.tsx`, both `page.tsx`). 18 offences with jail, fine, licence points and section numbers, plus Q&A sections (helmet fine, licence points, police stop, after an accident, the 2024 draft amendment). Every figure was read in the official Act text at bdlaws (act-print-1262) on 2026-10-13; the 2024 draft from The Business Standard, 13 Mar 2024. Not-legal-advice line and disclaimer link. Linked from `/guide/#rules`.
- `guide.json` + `guide.bn.json`: illegal modification penalty corrected to "1 to 3 years, up to Tk 3 lakh, or both, not bailable" (s.84, s.117) with bdlaws as a second source. The ResearchingStuff lead said "jail plus fine"; the Act says "or both".
- Crawlable popular comparisons: `/compare/<a>-vs-<b>/` + `/bn/compare/<a>-vs-<b>/` for the 8 `POPULAR_COMPARISONS` (`src/app/compare/[pair]/page.tsx`, `src/app/bn/compare/[pair]/page.tsx`, `pairMetadata` in `src/lib/curated.ts`). `CompareView` takes a `pair` prop and prerenders the full table (price, mileage, power, weight, parts) instead of an empty query-string shell. Home and `/compare/` link to the pair URLs; changing bikes on a pair page moves to `/compare/?bikes=`.
- `BN_TWIN` covers `compare/<x>` and `guide/<x>`; sitemap lists the fines page and the 16 pair URLs; `/saved/` stays out.
- Tests (`tests/seo.test.ts`): langHref twins for the new paths; sitemap has the fines page and all pairs in EN and BN, no duplicates, no `/saved/`, every BN URL has its EN twin; every popular pair resolves, with a unique title and its own canonical; `/saved/` stays noindex.

**Checked**
- `scripts/check.sh` (full): all steps pass (Node 26 locally; CI uses 22).
- Re-audit of `out/` (216 pages, 212 in sitemap): no issues left apart from the expected 404 pages.
- `tools/qa`: `qa.mjs` on the new pages, `/`, `/compare/`, `/guide/` at 375/768/1280: no overflow, axe or console problems; tiles read at 375 and 1280. `npm run interact`: all PASS. Pair-page flow (popular link, remove a bike, reload) checked in Playwright. Throttled weight: `/bn/guide/motorcycle-fines/` LCP 888 ms, `/bn/compare/honda-dio-vs-tvs-ntorq-125/` LCP 868 ms. New pages added to the `qa.mjs` default list.
- Dropped as unverified: what happens when licence points run out (only in the 2022 Rules schedule, not re-read); the claim that the Bangla text is authoritative (s.126(2), not re-read); unofficial "Tk 1,000 helmet fine" figures.

**Next (ranked)**
1. Extend the rules pages: speed limits (BRTA 2024 guideline; TBS and Dhaka Tribune disagree on highway limits, so cite both or skip), Dhaka AI-camera e-fines and the fake-SMS warning, licence steps and fees (`/guide/<slug>` + BN). Re-read the 2022 Rules Schedule 4 to add what happens at 0 points.
2. Bike pages → comparison pages: link each bike in `POPULAR_COMPARISONS` to its pair page, and add pairs people search for (e.g. Gixxer vs FZS V3, R15 V4 vs Gixxer SF 250) where both bikes are in `bikes.json`.
3. Search aliases: add common misspellings (palsar, apachi, gixer) to bike `aliases` and check the search box finds them.
4. Share images for `/guide/motorcycle-fines/` and the pair pages (they use the site-wide image today; Bangla ones need `scripts/bn-og.mts`).
5. Owner: Search Console still not set up (see `docs/Todo_owner.md`); without it, choose items by search value, not data.

## 2026-10-14: run 2

**Measurement**
- Owner verified the domain in Google Search Console and submitted `https://suggest.bike/sitemap.xml` on 2026-10-14. URL Inspection: "URL is unknown to Google" (nothing indexed yet). No query data yet.

**Changed**
- New page: speed limits, `/guide/speed-limits/` + `/bn/guide/speed-limits/` (`src/app/guide/speed-limits/SpeedView.tsx`, both `page.tsx`). Every motorcycle limit by road type with the car limit beside it, read from BRTA's own PDF of the Motor Vehicle Speed Limit Guideline 2024 (notification of 7 May 2024, linked from brta.gov.bd > laws). The PDF settles the highway conflict: 50 km/h on national/regional highways and district roads, 60 only on expressways, 30 in towns, 20 on narrow urban roads. The page says why some reports give 60 (Dhaka Tribune, 8 May 2024, described the draft). Speeding penalty from the Act (s.44, s.87); enforcement note from TBS 10 May 2024; Padma Bridge 60 km/h from Prothom Alo 18 Apr 2023.
- New page: driving licence, `/guide/driving-licence/` + BN (`LicenceView.tsx`). Eligibility (Act s.6), 7 steps, documents and fees (৳518 / ৳748 learner, ৳4,497 smart card 10 yr, ৳2,772 professional 5 yr, ৳60 postage) from BRTA's "how to get a driving licence" page (last updated 30 Jun 2026), the ৳5,075 sum labelled as BRTA fees only, riding without a licence (s.66, s.4).
- New page: e-fines, `/guide/e-fines/` + BN (`EFinesView.tsx`). DMP camera offences, how a real notice arrives (registered-post letter; SMS only from 01320-042207 / 01320-042227), payment (both DMP statements shown: appear and pay by bank/MFS, and Upay/CBL), summons or warrant if ignored, fake-SMS checklist (no PIN/OTP, check sender, Delta-3 or 999), and the separate Highway Police auto-fine on the Dhaka-Chattogram highway (bKash/Nagad, amounts and motorcycle coverage not announced). Sources: Dhaka Tribune 3 May, 25 May and 15 Aug 2026.
- All three: as-of 14 Oct 2026, not-legal-advice line and disclaimer link, cross-links to each other and the fines page. Registered in `src/app/sitemap.ts`, `tests/seo.test.ts` (sitemap test now requires all three in EN and BN), `tools/qa/qa.mjs` default pages. `BN_TWIN` already covers `guide/<x>`; Bangla share cards come from `OG_BN` like the fines page.
- `ResearchingStuff/rules/`: Padma Bridge rows in `00-overview.md`, `roads-and-restrictions.md` and `recent-changes-and-news.md` now say motorcycles were allowed back from 20 Apr 2023 (Prothom Alo English, TBS); speed conflict marked resolved with the official figures.

**Dropped as unconfirmable**
- Licence renewal fees: BRTA's renewal page was last updated 16 May 2023 and its figure (৳4,152) does not match the current ৳4,497 smart card fee.
- Licence categories by cc, learner-licence validity, the written/oral test format, the 2022 Rules Schedule 1 fee table (not re-read), RSPS points app (announced May 2026, no launch found), Dhaka Elevated Expressway ban (not re-fetched), e-fine amounts per camera offence (not published), front number plate rule (undecided).

**Checked**
- `scripts/check.sh` (full): all pass. Built `out/`: each new page has its own title, self-canonical, en/bn/x-default hreflang, `lang="bn"` on BN; all six URLs in `sitemap.xml`.
- `tools/qa` `qa.mjs` on the six pages at 375 and 1280: no overflow, axe or console problems; tiles read at 375.

**Next (ranked)**
1. Link the three new pages from `/guide/` (another agent owns `GuideView.tsx`) and from the fines page; check no orphans in `out/`.
2. Bike pages → comparison pages, and more searched pairs (Gixxer vs FZS V3, R15 V4 vs Gixxer SF 250).
3. Search aliases for misspellings (palsar, apachi, gixer).
4. Re-read the 2022 Rules (Schedule 1 fees, Schedule 4 points at zero) and add to the licence and fines pages.
5. In about 2 weeks, ask the owner for Search Console coverage (indexed or not) and first queries; use them to pick titles to tune.
