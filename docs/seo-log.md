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
