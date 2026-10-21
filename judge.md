# Launch-readiness judgement: Suggest.Bike

> **Current go-to-market score: 55% (cap 55).** The verdict below is the original 2026-10-12 audit. For the current score, gaps and next steps see the latest update at the bottom, *Update (2026-10-19, review round)*, and `../GO_TO_MARKET_SCORECARD.md`.

Audited 2026-10-12 against `main` @ `d56bb02`. Checks run: `npm run validate` (77 bikes, 0 problems), `npx tsc --noEmit` (0 errors), `npm run build` (173 static pages, OK), `npx tsx finder/test.mjs` (10/10). Also checked live DNS, GitHub Pages and Bikroy.

## Verdict

**About 55% ready.** The code is in good shape: it builds cleanly, the static export is solid, and the UI audit items are closed. As a content site it is **about 80% ready for a soft launch**. As a real product it is **about 35% ready**. The main gaps:

- **It is not live.** The domain is still parked at Namecheap.
- **No legal pages.** There is no privacy policy, terms or disclaimer, even though the site gives money and legal (BRTA) advice and records microphone audio.
- **The main selling points are unverified.** Mileage, mechanic scores, parts prices and the service network are editorial guesses. `networks.json` is `{}`, yet a quiz step depends on it.
- **No data refresh.** Nothing keeps prices fresh, and about 87% of price sources point to one competitor, BikeBD.
- **No business basics.** There are no analytics, no feedback system beyond `mailto:`, and no business model.
- **The Bike finder is not a working product.** Its scraper returns nothing against live Bikroy, and its ToS position is unreviewed.

Fix blockers 1 to 4 below, hide the finder, and the site can soft-launch in about 1 to 2 weeks.

---

## Critical blockers (ranked)

### 1. The site is not deployed or reachable
- **Evidence:**
  - `dig suggest.bike` returns `192.64.119.138`.
  - `http://suggest.bike` returns `302` from `X-Served-By: Namecheap URL Forward`.
  - `www` is a CNAME to `parkingpage.namecheap.com`.
  - The GitHub Pages API shows `cname: suggest.bike` and `https_enforced: false`.
  - The `deploy` workflow succeeded (run 38222157807), so the build is published but unreachable.
- **Why it blocks launch:** nobody can reach the site.
- **Fix:**
  1. In Namecheap, delete the URL-redirect and parking records.
  2. Add the 4 GitHub `A` records and `www` CNAME `the-abraar.github.io.` (README table).
  3. Wait for GitHub to verify the domain, then tick **Enforce HTTPS**.
  4. Verify the domain at the GitHub account level, so nobody can take over the Pages domain.
  5. Add an uptime check (UptimeRobot, free) on `/` and `/sitemap.xml`.

### 2. No legal pages: privacy, terms or disclaimer
- **Evidence:**
  - `src/app/` has no `privacy`, `terms` or `disclaimer` route.
  - `Footer.tsx` has only a trademark line.
  - The "Legal footer" item in `Todo_owner.md` is unchecked.
  - The site gives cost, EMI, loan and legal advice (BRTA fees, the 375cc rule).
  - `/labs/check` records microphone audio (`MediaZone.tsx:378`).
  - `/labs/finder` collects WhatsApp numbers.
  - Wikimedia CC BY-SA photos carry licence obligations.
- **Why it blocks launch:** liability for wrong prices, advice or legal-fee figures. Collecting phone numbers without a privacy notice runs against Meta's WhatsApp Business Policy (a privacy policy URL is required) and Bangladesh's 2025 personal-data rules (verify current status). It also makes the site look untrustworthy.
- **Fix:**
  1. Add static `/privacy/`, `/terms/` and `/disclaimer/` pages in EN and BN. Cover what is stored, that it stays in `localStorage` only, that mic analysis runs in the browser, what the finder collects, the 65-day retention, deletion on request, and that prices and estimates are not advice.
  2. Link them from the footer, the finder consent box and the labs pages.
  3. Add them to `sitemap.ts`.
  4. Get a one-time lawyer review in BD before the finder goes live.

### 3. Data accuracy on the core selling points is unverified, and nothing keeps it fresh
- **Evidence:**
  - The README says mileage, scores, parts and service prices are "**editorial estimates** … not measured".
  - `src/data/networks.json` is `{}`, yet the "Where will you ride" quiz step (`src/lib/match.ts`) and the bike-page network box depend on it.
  - The `Todo_agent.md` P0 list of shaky specs is entirely open: Hornet 2.0 power, Stryker, Discover tank, Saluto FI, XSR155 ABS, SP160 ABS, Vespa FI, and conflicting prices for Gixxer Monotone, X-Blade, Ray ZR and R15 V4.
  - `ktm-duke-125` and `ktm-rc-125` are marked `on-sale` with a "still in stock?" question open.
  - `zontes-zt155-u` has `priceAsOf: 2026-02`, 8 months old.
  - Registration for 250–350cc is "low confidence", and the CBU >165cc import policy is "conflicting" (`guide.json`).
  - `scripts/validate-data.mjs` checks shape only. It does not check `priceAsOf` age, source URLs or `bn` completeness.
  - `Footer.tsx` shows the **newest** `priceAsOf` ("prices last checked …"), which hides the stale ones.
- **Why it blocks launch:** the whole pitch is "honest, BD-specific answers". In BD Facebook groups, one wrong price or ABS claim gets screenshotted and kills trust (`UI_AUDIT.md` M5 makes the same point). Prices move monthly with showroom offers.
- **Fix:**
  1. **Now:** resolve the P0 list. Set the KTM 125s to `used-only` or confirm stock. Re-price Zontes. Hide the network box and the quiz "Where" weighting until `networks.json` has data; do not show "not verified yet" as a feature.
  2. **Staleness gate:** in `validate-data.mjs`, fail if `priceAsOf` is more than 60 days old or `priceSource` is missing, and warn if older than 30 days. Run `npm run validate` in `deploy.yml` before the build.
  3. **Footer:** show the oldest date, or "N prices older than 30 days".
  4. **Monthly refresh:** a scheduled GitHub Action fetches distributor price pages (Bajaj/Uttara, ACI/Yamaha, BHL/Honda, Rancon/Suzuki, Hero, Runner), diffs them against `bikes.json` and opens a PR. A human approves it. Owner showroom calls cover the top 10 bikes (`Todo_owner.md`).
  5. **Owner data collection:** the mileage survey (aim for 300 responses) and 10–20 mechanic interviews. Add a per-field `confidence` value and show it.

### 4. Price data provenance: most prices come from one competitor
- **Evidence:**
  - `priceSource` hosts: bikebd.com 67 of 77; distributor sites 6; bikroy 4.
  - `SOURCES.md`: 192 references to bikebd.com.
  - Used prices (40 bikes) come from bikroy listings.
  - The repo is **public** (`gh api … visibility: public`), and full records ship at `public/data/bikes/*.json`.
- **Why it blocks launch:** individual facts are not copyrightable. Systematically copying a competitor's compiled database is still a ToS and database-right risk, and a reputational one: BikeBD is the incumbent and can call it out publicly. Being one hop behind BikeBD also means the data is always staler than theirs.
- **Fix:**
  1. Re-source each `priceSource` to the official distributor page or a dated distributor price list (photo or PDF). Keep BikeBD only as a cross-check reference.
  2. Read the BikeBD and Bikroy ToS. If either forbids reuse, drop those as sources, or ask for permission or a partnership.
  3. Accept that the dataset is public. The moat is freshness plus owner-verified data, not secrecy. Consider making the repo private, since the data is published on the site anyway.

### 5. Bike finder: a public "coming soon" page with no working backend, a broken scraper and an unclear legal basis
- **Evidence:**
  - `finder/README.md`: "nothing here is live".
  - `FinderView.tsx:19` runs in preview mode when `NEXT_PUBLIC_FINDER_ENDPOINT` is unset. The fallback is a `mailto:` that puts the user's WhatsApp number in an email (`FinderView.tsx:115–126`).
  - **Scraper is broken live:** `bikroy.ts:94,102` requests `/en/ads/bangladesh/motorbikes-scooters?query=…`. Bikroy answers `301 → /motorcycles-and-scooters`, which drops the query, and `parseBikroyHtml` finds **0** `/ad/` links (the page is JS-rendered).
  - Bikroy `robots.txt` disallows `/*?*query=` for Bingbot, which shows they don't want search-URL crawling. Their ToS is unreviewed.
  - The Worker is not deployed (`finder/worker/index.ts:2`). There is no WhatsApp Business account or approved template.
  - The opt-out cannot be reversed: the Worker returns 409 "message us from WhatsApp to resume", but the webhook only handles STOP (`index.ts:108,131`). The STOP confirmation reply is a TODO (`:135`). There is no user-facing delete endpoint.
  - The raw phone number is stored in the `req:` record (`index.ts:112`), despite the hashed key.
  - `/labs/finder/` is in `sitemap.ts` and the nav.
- **Why it blocks launch:** this blocks the finder only, not the site. Shipping it live as-is would mean scraping that is likely against ToS, a feature that returns nothing, and PII collection without a privacy policy.
- **Fix:**
  1. **For launch:** remove `/labs/finder/` from the sitemap and nav, or turn it into a plain waitlist (a model and district only, no phone number) until steps 2–5 are done.
  2. Replace scraping with legal supply. In order of preference: (a) a Bikroy partner or affiliate feed (ask them), (b) a "paste a listing link" flow, (c) sellers posting directly to Suggest.Bike. If Bikroy grants permission, rewrite the adapter against their real URL and data format and add a live contract test.
  3. Deploy the Worker. Add a Cloudflare Rate Limiting rule and Turnstile on `POST /requests`. Add `RESUME` handling and a STOP confirmation reply. Add `DELETE /requests?phone=` with an OTP over WhatsApp.
  4. Set up a verified Meta Business account and approved EN and BN Utility templates, then do a dry run for 2 weeks with staff numbers only.
  5. Only then set `FINDER_ENABLED`, `FINDER_LIVE` and `NEXT_PUBLIC_FINDER_ENDPOINT`.

---

## Major gaps

1. **No analytics, so success cannot be measured.** *Status 2026-10-19: still open. `GOATCOUNTER_CODE` is empty (`src/lib/site.ts:28`).*
   - Evidence: nothing in `src/` (grep for `analytics`, `plausible` or `gtag` finds nothing); the owner todo is unchecked.
   - Fix: add Cloudflare Web Analytics or Plausible (one script tag in `layout.tsx`). Track these events: quiz completed, compare pair, cost-calculator use, "report wrong price" click, share. Mention it in `/privacy`.
2. **Bangla is invisible to Google.** *Status 2026-10-19: fixed. `/bn/` routes with hreflang and a server-rendered `lang="bn"` since Update 10. The evidence below is out of date.*
   - Evidence: the language toggle is client-side only (`localStorage sb-lang`), `<html lang="en">` is fixed (`layout.tsx:35`), there are no `/bn/` routes and no `hreflang`. Most BD queries are in Bangla or Banglish ("pulsar n160 dam koto").
   - Fix: generate `/bn/...` static routes from the same components with server-rendered `bn` text, add `alternates.languages` (hreflang) both ways, and add the BN URLs to the sitemap.
3. **Client pages have no SEO metadata.** *Status 2026-10-19: fixed in Update 5. Every page checked live has its own title and canonical.*
   - Evidence: `/`, `/bikes`, `/match`, `/compare`, `/cost` and `/saved` all render the default title, and `rel="canonical"` count is 0 in `out/index.html`, `out/bikes/`, `out/compare/` and `out/match/`. This matches the open P2 item in `Todo_agent.md`.
   - Fix: split each page into a server `page.tsx` that exports `metadata` (title, description, canonical) and a client `*View.tsx`, the same pattern as `about/` and `guide/`.
4. **Share images may fail on GitHub Pages.** *Status 2026-10-19: fixed. Share cards are `.png` files served as `image/png`, EN and BN. Facebook's Sharing Debugger has still not been run.*
   - Evidence: the OG images are extension-less (`out/opengraph-image`, `out/bikes/*/opengraph-image`). `public/.htaccess` forces `image/png`, but that file only works on Apache; **GitHub Pages ignores it** and serves them as `application/octet-stream`. Facebook and Messenger previews are the growth loop (`UI_AUDIT.md` M6).
   - Fix: test with the Facebook Sharing Debugger after DNS is live. If previews fail, emit `.png` files at build time (`scripts/build-art.tsx`) and point `openGraph.images` at them, or host on Cloudflare Pages and set a `_headers` rule.
5. **Product JSON-LD misrepresents the site as a seller.** *Status 2026-10-19: fixed in Update 5 (`Offer` removed, `url` and `image` added).*
   - Evidence: `bikes/[id]/page.tsx:33` emits an `Offer` with `InStock` and no seller, URL or image. Google may flag it as invalid merchant-listing markup.
   - Fix: drop `offers`, or use `AggregateOffer` with `offerCount` and no availability. Add `image` (the photo or OG URL).
6. **Feedback works only through `mailto:`.** *Status 2026-10-19: partly fixed. `/feedback/` and WhatsApp exist, but `FORM_ENDPOINT` is empty (`src/lib/site.ts:19`), so Send still opens an email app.*
   - Evidence: the feedback links in `BikeDetail.tsx:60`, `Footer.tsx:49` and the listing-check scam report are all `mailto:`. On many Android phones in BD there is no mail client, so the tap does nothing. MX records exist (Namecheap eforward), but the `hello@` forward is unverified.
   - Fix: confirm the `hello@` forward. Add a small form posting to the same Worker (`POST /feedback`, stored in KV) or to a Google Form, plus a Facebook page or Messenger link. Review it weekly.
7. **No tests on the decision engines, and CI doesn't gate.** *Status 2026-10-19: fixed. `tests/` covers the engines, and `deploy.yml` runs validate, tsc, tests and build before it deploys.*
   - Evidence: the only tests are `finder/test.mjs`. There are none for `src/lib/match.ts`, `cost.ts`, `fund.ts`, `listingcheck/engine.ts`, `negotiate/parts.ts` or `usedcheck/value.ts`. `deploy.yml` runs only `npm ci && npm run build`, with no validate step.
   - Fix:
     1. Add `npm run validate` and `npm run typecheck` steps to `deploy.yml`.
     2. Add one `scripts/selftest.mjs` (node:assert, run with tsx) covering the H6 persona (৳1 lakh + used + commute must not put a 2-stroke at #1), the budget ceiling, `gearless:"no"` (no scooters), the 2yr vs 10yr tax maths and `emiMonthly`.
     3. Add a curl smoke test of every route against `out/`, served locally.
8. **No business model, and a public promise that limits it.** *Status 2026-10-19: still open. The promises are "no affiliate deals with dealers" (`src/app/about/AboutView.tsx:63`) and "0 paid placements. Ever." (`src/app/HomeView.tsx:72`).*
   - Evidence: `AboutView.tsx` promises "no sponsored rankings and no affiliate deals with dealers", and `Todo_owner.md` "decide the business model" is unchecked.
   - Fix: choose a model before traffic arrives. The best fit is clearly labelled sponsorship plus disclosed dealer or insurance lead referrals, kept outside the ranking code. Write a public "how we make money" section on `/about`. Re-word the promise to "money never touches rankings" so it allows disclosed referrals.
9. **No distribution.** *Status 2026-10-19: still open. 10 Facebook posts are drafted in `docs/launch-posts.md`, but the site links no Facebook page, and Bing shows no results for `site:suggest.bike`.*
   - Evidence: no Facebook page, no social links, no content calendar (`Todo_owner.md` Growth is all unchecked).
   - Fix: create a Facebook page first. Post weekly "true monthly cost of the top 5 150cc bikes" image cards that link to bike pages. Seed 3–5 BD bike groups and offer creators the compare and cost links.
10. **EV gap.** *Status 2026-10-19: fixed. `engine.fuel: "electric"` with an `ev` spec; 5 electric bikes are listed.* The schema can't describe electric bikes (`types.ts`: cc, carb/FI), and EVs are a growing segment in BD (Revoo, Walton). Add `powertrain` with battery, range and charge-time fields after launch.
11. **Docs and repo drift.** *Status 2026-10-19: these four items are fixed (README count, `HANDOFF.md` gone, worktrees pruned, duplicate deleted).*
    - `README.md:12` says 76 bikes; there are 77.
    - `HANDOFF.md` expects "about 165 pages"; there are 173. It also points at a dead scratchpad path.
    - Three stale agent worktrees sit in `.claude/worktrees/`.
    - `src/app/labs/listing-check/Experimental.tsx` duplicates `src/components/Experimental.tsx`.
    - Fix: update the docs, prune the worktrees with `git worktree prune`, and delete the duplicate file.

---

## Launch path (in order)

1. **Days 1–2:** point the DNS at GitHub Pages, enforce HTTPS, verify the domain, add an uptime monitor. Confirm the `hello@suggest.bike` forward works. *Status 2026-10-19: DNS and HTTPS done (Update 11). No uptime monitor is recorded, and the `hello@` forward is still untested.*
2. **Days 1–3:** pull or hide `/labs/finder/` (sitemap and nav). Hide the network box and the "Where" weighting until `networks.json` is filled. Mark KTM 125s and the other uncertain bikes correctly. *Status 2026-10-19: done (finder hidden; `networks.json` filled for 9 brands in Update 11).*
3. **Days 2–4:** add the `/privacy`, `/terms` and `/disclaimer` pages (EN and BN) and link them everywhere. Fix the Product JSON-LD. *Status 2026-10-19: done, except the lawyer review.*
4. **Days 2–7:** fix the data. Resolve the P0 shaky-spec list. Re-source prices to distributors. Call showrooms for the top 10 bikes. Add the staleness gate to `validate-data.mjs` and run validate and typecheck in `deploy.yml`. *Status 2026-10-19: mostly done (age and outlier gates, deploy gates, spec fixes). Still open: showroom calls, 2 `TODO(owner)` spec notes in `bikes.json`, and bikebd.com is still 54 of 107 price sources.*
5. **Days 4–7:** add analytics, the feedback form and server metadata or canonicals for client pages. Verify OG previews in the Facebook debugger, and switch to `.png` files if needed. *Status 2026-10-19: canonicals and PNG share cards done. Analytics and the form endpoint are still empty; the Facebook debugger has not been run.*
6. **Day 7:** run the engine self-test and the route smoke test. **Soft launch:** a Facebook page plus 2–3 group posts. Watch analytics and corrections for 2 weeks. *Status 2026-10-19: self-test and route checks done. Soft launch not started.*
7. **Weeks 2–4:** a monthly price-refresh Action that opens PRs; the owner mileage survey and mechanic interviews; per-field `confidence`; `/bn/` routes with hreflang. *Status 2026-10-19: the price-refresh Action and `/bn/` routes exist, but the Action cannot open its PR yet (see the 2026-10-19 update). The mileage survey and mechanic interviews have not started.*
8. **Month 2:** decide and publish the business model; start sponsorship or referral talks. Finder v2 only with a legal listing supply (partner feed, paste-link or seller posts), the deployed Worker with Turnstile and deletion, and an approved WhatsApp template. *Status 2026-10-19: not started.*
9. **Ongoing:** a monthly review of fuel prices, new launches and discontinued models, plus a weekly corrections triage.


---

## Progress log (2026-10-12, Claude session)

**Done:** nothing changed in this session. No edits made.

**Next, in value order:**
1. Blocker 1: fix DNS (delete the Namecheap redirect, add the 4 GitHub A records and the www CNAME, enforce HTTPS). Owner-only, no code.
2. Blocker 2: add `/privacy`, `/terms`, `/disclaimer` in EN and BN, and link them from `Footer.tsx`. I held back because the text needs the owner's review.
3. Hide the finder (`/labs/finder`) until the scraper works.
4. Fill `networks.json` or remove the quiz step that depends on it.


### Update 2 (supersedes "nothing changed" above; agent-made, not reviewed by a human)

**Done (agent reported `tsc --noEmit` clean and `npm run build` OK; not re-run by me, not viewed in a browser):** `/privacy`, `/terms`, `/disclaimer` added in EN and BN (`src/components/LegalView.tsx`, three thin `page.tsx` wrappers), linked from the footer and added to the sitemap. The finder is removed from the sitemap and the `/labs` list and set `noindex`; code kept. Contact uses the existing `SITE.contactEmail`.

**Still open:**
1. A Bangladesh lawyer must review the legal texts (`TODO(owner)` in `LegalView.tsx`).
2. `/labs/finder/` is still reachable by URL, and has no consent box linking to the privacy page.
3. Legal pages not linked from the header.
4. Blocker 1 (DNS and HTTPS) is untouched and is owner-only.


### Update 3 (agent-made; results are the agents' own reports unless stated)

**Done (agent reported validate, tsc, build and finder tests 10/10 all pass; not viewed in a browser):** the finder consent checkbox already existed; a link to `/privacy` was added inside its label. Privacy and Terms links in `ExperimentalBanner`. `HAS_NETWORKS` flag in `src/lib/bikes.ts`: while `networks.json` is empty the quiz skips the network step, results chip and network weighting are off, and the "small network" warning and bike-page network box are hidden. New `EstimateBadge` ("Editorial estimate", EN and BN) on the Owning and Parts sections; mileage labels say "(estimate)"; the footer shows the oldest price date.

**Still open:** DNS (owner-only); lawyer review of the legal text; the P0 spec list; stale KTM and Zontes prices; re-sourcing prices away from BikeBD; `validate-data.mjs` age check and `deploy.yml` gates; labs pages that do not use `ExperimentalBanner` have no legal links.


### Update 4 (agent-made; agents' own reports, not yet independently re-run)

**Done (agent reported tsc, finder tests 10 checks, and build pass):** `scripts/validate-data.mjs` checks price age from `priceAsOf` (warn over 90 days, fail over 180; `PRICE_WARN_DAYS` and `PRICE_FAIL_DAYS` override) and warns when one domain supplies over 50% of price sources. `deploy.yml` runs validate, `tsc --noEmit` and finder tests before build.

**ACTION NEEDED:** `npm run validate` now exits 1, so deploy is blocked, because `zontes-zt155-u` has `priceAsOf` 2026-02 (253 days old). Re-source it. Setting `PRICE_FAIL_DAYS=300` also clears it but lets the staleness through. KTM is not stale (this supersedes the earlier KTM note). **Source concentration:** bikebd.com supplies 67 of 77 price sources (87%); suzuki.com.bd 5, bikroy.com 4, bdhonda.com 1. The agent only read the headings of blockers 3-8, so some code-side items there may remain.


### Update 5 (agent-made, round 6; agents' own reports unless marked)

**Done (agent runs: tsc, finder tests 10/10, build all pass; `validate` fails only on the known stale bike):** `npm run validate` now prints how to re-source on a stale-price failure. Server `page.tsx` with title, description and canonical added for `/`, `/bikes`, `/match`, `/compare`, `/cost`, `/saved` (client code moved to `*View.tsx`). **Product JSON-LD `Offer` removed** (adds `url` and `image`), which may affect price rich results. Prefilled GitHub-issue feedback link (needs a GitHub account) next to mailto in `BikeDetail` and footer. `ExperimentalBanner` links Privacy, Terms, Disclaimer on all four labs pages. Duplicate `listing-check/Experimental.tsx` deleted; README bike count fixed to 77.

**Still open:** DNS (owner-only); lawyer review; re-source `zontes-zt155-u` (deploy gate fails until then); re-source away from BikeBD (87%); analytics and `/bn/` routes with hreflang (need a provider choice and a large build); a feedback form or endpoint (needs a backend); OG PNG output (test on the live host); engine self-tests; mobile layout checked from CSS only, not in a browser.


### Update 6 (agent-made: independent verification, security review, fixes; agents' own reports unless marked)

**Independent re-run confirmed:** `tsc`, finder tests (10 checks), build; `validate` exits 1 only on `zontes-zt155-u` (253 days old), and warns that bikebd.com supplies 87% of price sources. No changes this round.


### Update 7 (agent-made, priority round; agents' own reports unless marked)

**Done (agent runs: `npm test` 31 new engine tests plus 10 finder checks; `tsc` clean; build passes, 176 pages; `validate` fails only on `zontes-zt155-u`; not re-run by me):**
- **Tests:** `tests/engines.test.ts` (31 cases) covers match, cost, EMI, BRTA and fund, listingcheck (Bangla digits), the used-bike audio analyser and negotiate. **Bug found and fixed:** `ownershipCost` in `src/lib/cost.ts` returned Infinity for cost per km when km was 0 and for per-month figures when years was 0; it now returns 0.
- **Price audit:** `npm run audit:prices` (`--out`, `--check-urls`, `--stale-days`, `--outlier`); worklist written to `docs/price-resourcing-worklist.md`. Of 77 bikes: 1 stale (`zontes-zt155-u`, 253 days); 67 sourced from bikebd.com (87%); 23 bikes have no source on another domain; **15 price outliers more than 40% from their category median** (worst: `yamaha-aerox-155` +116%, `aprilia-sxr-160` +81%, `honda-cbr150r` +64%), which may be data errors or genuine premium models. Only 4 of 72 unique price URLs were link-checked (all reachable).
- **Real-browser QA** (Playwright and axe-core in the scratchpad `qa_sb`, built site served locally, 18 pages at 375, 768 and 1280 px): the agent's final re-run shows 0 horizontal overflow, 0 console errors and 0 axe serious or critical violations. Fixes: header overflow by 14 px at 1280 px on every page (`Header.tsx` search box `xl:w-40`); red text contrast (light-theme `--signal` darkened to `#c42b22`); inline links in about, cost and fund now underlined; zero-value rows on `/cost` no longer dimmed; compare-tray hint text colour; `/labs/listing-check` "Add another" button moved out of `role="tablist"`.
- I looked at 3 of the screenshots myself (home and a bike page at 375 px, quiz step): no obvious breakage; the full-page captures are too small to judge fine detail.

**Still open:** DNS (owner-only); lawyer review of the legal texts; re-source `zontes-zt155-u` (deploy gate blocks until fixed) and review the 15 outliers; re-source away from BikeBD; analytics and `/bn/` routes with hreflang; OG PNG output; a feedback form needs a backend; `ERR_ABORTED` requests were filtered out as prefetch cancellations and not investigated; language toggle checked on only the home page by the agent; the `Under 5'5"` option in the quiz showed a check mark and raised card in one screenshot, probably a leftover hover or focus state, unconfirmed; real-device testing; the finder remains hidden and its scraper does not work.


---

## Update 8: go-to-market scoring (2026-10-12)

**Score: 60% (was 55%).** Stage: Soft-launch candidate, blocked on owner tasks.

**Cap:** 65: not reachable (domain parked) and the deploy gate is red.

**Dimension scores (0-10):** Product 8, Quality 7, Security 8, Legal 5, Market 2, Ops 3, Honesty 7. Rubric and the other five projects: `../GO_TO_MARKET_SCORECARD.md`.

**Basis and limits:** my judgement from this file's audit, the agents' reports, and independent re-runs of tests and builds. No real-device, real-user or real-host testing has happened, and nothing is committed. Agent-written code has had no human review. Treat the score as +/- 10 points.

### Gaps and flaws, ranked

1. **Not live.** DNS still points at a parking page; HTTPS not enforced; no uptime check.
2. **Deploy gate is red** until `zontes-zt155-u` (253 days old) is re-sourced or the threshold is deliberately changed.
3. **Data trust.** 87% of price sources are one site (bikebd.com); 23 bikes have no second source; 15 prices are more than 40% off their category median (worst: `yamaha-aerox-155` +116%, `aprilia-sxr-160` +81%, `honda-cbr150r` +64%). Mileage, mechanic scores, parts prices and service networks are editorial estimates (now labelled).
4. **Legal.** Privacy, terms and disclaimer exist in EN and BN but no lawyer has reviewed them; they give cost, loan and BRTA advice and the mic check records audio in-browser.
5. **No way to learn anything.** No analytics, no feedback backend (only mailto and a GitHub-issue link that needs an account), no business model.
6. **Finder is hidden, not fixed.** Its scraper returns nothing against live Bikroy; its terms-of-service position is unreviewed. It is still reachable by URL.
7. **Product JSON-LD `Offer` was removed**, so price rich results will not appear.
8. **Never tested on a real phone.** Checks ran in headless Chromium; one quiz option looked selected in a screenshot (probably leftover hover or focus, unconfirmed).
9. No Bangla `/bn/` routes with hreflang; no OG images.

### What to do next, in order

1. **You:** fix DNS (delete the Namecheap redirect and parking records, add the 4 GitHub A records and the www CNAME), wait for GitHub to verify, enforce HTTPS, verify the domain at the account level, add an uptime check.
2. **You:** re-source `zontes-zt155-u` from an official or dated source and update `priceBDT`, `priceSource`, `priceAsOf`; then go through `docs/price-resourcing-worklist.md` (the 15 outliers first). Do not edit data to pass the check.
3. **You:** get a Bangladesh lawyer to review `/privacy`, `/terms`, `/disclaimer` (see the `TODO(owner)` in `LegalView.tsx`).
4. **You:** commit and push; open the site on a real Android phone and an iPhone and walk the quiz, a bike page, `/cost` and `/labs/check`.
5. **Code:** add privacy-respecting analytics once a provider is chosen; a feedback path that does not need a GitHub account; `/bn/` routes with hreflang; OG images after testing on the live host.
6. **Code or content:** a second source for the 23 single-source bikes; extend `validate-data.mjs` to fail on outliers needing a note.
7. **Decide:** a business model (affiliate, listings, ads) and whether to keep the finder at all.
8. **Soft launch:** after steps 1-4, launch to a small audience, watch what people use, then fix data where users look.

### Update 9 (2026-10-12, stopped at the 70% usage ceiling)

**Done this round:** retro guardrails (`scripts/check.sh`, pre-commit hook `.githooks/pre-commit`, CI workflow, `AGENTS.md`, `CODING_STANDARDS.md`); orphaned worktrees removed (Suggest.Bike); all work committed and pushed to `origin/main`. Usage mirror `../usage.md` is live (status line writes the 5-hour and 7-day percentages); read it before starting a round.

**I was in the middle of:** nothing half-done. The last action was this log. No uncommitted work remains apart from this file.

**Not verified:** the GitHub CI workflows have never run; the pre-commit hook has never blocked a real commit; no real-device, real-user or real-host testing.
**Next, first:** `zontes-zt155-u` re-source (deploy workflow gates on `npm run validate`, so pushes to `main` will fail that gate until fixed); DNS; lawyer review; then the other items in Update 8.

### Update 10 (2026-10-13)

**Done:** dropped `zontes-zt155-u` (deploy gate green); `validate-data.mjs` now fails on a >40% category-median price outlier with no `priceNote` (all 15 now have one; FZ25 and NS125 prices corrected from fetched BikeBD pages); 21 of 23 single-source bikes now have a second-domain source (URLs fetched and checked for the model name; `haojue-dr160`, `hero-honda-cbz` still single-source); Hornet 2.0, Hunk 150R power/torque and Stryker gears corrected (BikeBD only, medium confidence); `/bn/` and `/bn/bikes/[id]/` Bangla routes with hreflang (sitemap too); `/feedback/` form.
**Not verified:** second-source pages were checked for status and model name only, not for matching price. Vespa VXL, Knight Rider V2 and KPT 150 4V differ from other sites by more than 5%; noted in `priceNote`, prices unchanged. `/feedback/` falls back to mailto until `NEXT_PUBLIC_FEEDBACK_ENDPOINT` is set at build time (owner: pick Formspree/Web3Forms/Worker). `/bn/` pages use the client i18n layer on the English-URL internal links; Bangla `<html lang>` is set by script. Not tested in a real browser.
**Still open (P0):** Metro Plus weight, Discover 125 tank, XSR155 ABS, Access 125 brakes, SP160 single-disc ABS, Stryker seat height/tank, RC 125 stock, price conflicts (Gixxer Monotone, X-Blade, Ray ZR 125, R15 V4 BS7).

### Update 11 (2026-10-14, 7 parallel agents, merged and checked)

**Live:** suggest.bike serves from GitHub Pages with HTTPS; Search Console verified and sitemap submitted 2026-10-14 (pages not yet crawled). The parked-domain cap no longer applies.
**Done:** price fixes on 11 bikes and spec fixes on 11 (Dio ৳1,57,000; RC 125 ৳4,43,000; N250/F250 official; CT100 no longer copies Platina); 4 cheap volume bikes added (87 total); guide: TIN/PSR and IDRA pilot marked unconfirmed, 5 law cards with Act sections, used checklist 11 → 15, EV section; new `/guide/speed-limits/`, `/guide/driving-licence/`, `/guide/e-fines/` (EN+BN, BRTA 2024 guideline settles 50 km/h highways); 18 maintenance posts (26 total) and 4 `/owner/` sections; `networks.json` for 9 brands from official locators (unknown brands now neutral, not "small"); hotlines checked; "sold officially since" line for 5 brands; Banglish typo search; keyboard-usable compare add-slot and search combobox; 41-page QA sweep live and local (0 overflow, 0 axe serious, 0 console errors); `docs/launch-posts.md` with 10 Bangla Facebook posts.
**Open (owner):** Formspree URL, GoatCounter code, WhatsApp number (all empty in `src/lib/site.ts`); lawyer review; real-phone walk; proofread Bangla in the new posts; Suzuki "since" year (2013 vs 2012); helmet marks (BSTI?); quiz pre-selected defaults (product call).
**Open (data):** TVS specs (no official BD source), Suzuki weights, XSR155/SP160 ABS, Vespa VXL fuel system, Ray ZR 125 hybrid or not, Runner/GPX/Haojue networks; bikebd.com still 56% of price sources.
**Not verified:** Facebook link previews of the share cards; real devices.

### Update 12 (2026-10-14): status check, no code changed

Checked: last commit adds the Honda Super Cub (after Update 11); working tree clean. I did not re-run `scripts/check.sh` this round.
**Score:** unchanged at 60%, cap 75. Live on suggest.bike over HTTPS; Search Console sitemap submitted, pages not yet crawled.
**Still blocked on the owner:** Formspree URL, GoatCounter code and WhatsApp number (empty in `src/lib/site.ts`); lawyer review; real-phone walk; Bangla proofreading; the data items listed under Update 11 "Open (data)".
**Next, first:** set the three site.ts values, then walk the live site on a real phone.

### Update 13 (2026-10-14, agent round, pushed `68ec058`)

Done (`scripts/check.sh` exit 0): WhatsApp set in `src/lib/site.ts` (8801327045005); `validate-data.mjs` now warns when the feedback endpoint, analytics code or WhatsApp is empty; `hero-honda-cbz` has a second source. Verified correct, no change: Discover 125 tank 8 L and price, X-Blade price.
**Unresolved, needs an official source:** Metro Plus weight (bikebd says 138 kg vs our 116, page unreliable), Stryker seat height and tank, Access 125 brake layout, Gixxer Monotone price, Ray ZR 125 and R15 V4 prices (not fetched), `haojue-dr160` second source.
**Still open for the owner:** Formspree/Web3Forms endpoint, GoatCounter code, lawyer review, real-phone walk. Score unchanged at 60%.

### Update 14 (2026-10-15, agent round)

Done (`scripts/check.sh` exit 0): spotlight week 2 (Splendor+ value, Shine 100 Dhaka traffic, Dream 110 reliability, Raider 125 broken roads, R15 V4 looks; quiz claims pass the test); /method market snapshot citing The Daily Star and TBS side by side; /cost octane history line (UNB, +35% Jan → Sep 2026); 5 dealer hotlines re-found on official pages; price-history sparkline on bike pages (2+ points); home low-seat and scooter section plus `/bikes/?seat=low`; `npm run diff:bikebd` report script (robots.txt, 2 s delay, report only).
**Found:** BikeBD differs from us on `ktm-rc-125` (৳3,70,000 vs our ৳4,43,000) and `gpx-demon-gr165r` (৳3,24,000 vs ৳3,14,999). Not changed: needs an official source. Splendor+ (a week-2 pick) is still "availability unconfirmed"; its post says to confirm stock.
**Not verified:** the new home section and the sparkline were not checked in a real browser (tools/qa not run). The Bangla post text has not been proofread. No new EV models.
**Score:** unchanged at 60%.

### Update 15 (2026-10-16, agent round)

Done (`scripts/check.sh` exit 0): spotlight week 3, five new posts: Platina 100 (cheap to maintain), Radeon (first bike), Glamour X 125 (pillion and family), Pulsar N250 (safety: braking), NX200 (highway). Every figure is read from `bikes.json`; each `bestCase` was found by searching the quiz and is re-checked by `tests/spotlight.test.ts`. The section-3 picks Bajaj CT 100 and Suzuki V-Strom SX 250 never come first at their own price, so the next unused bike in each category was taken.
**Fixed:** the GitHub Pages deploy had failed since 15 Oct (`scripts/bn-og.mts` imported helpers that moved from `src/lib/bikes` to `src/lib/bike-utils`), so the live site was three commits behind. `tsconfig.json` now includes `**/*.mts`, so the typecheck catches this.
**Not verified:** the deploy itself (it runs on push); the Bangla post text has not been proofread.


### Update 16 (2026-10-16, agent round)

Done (`scripts/check.sh` exit 0; deploy run 38930206340 green; suggest.bike serves `0c86b3d`): committed Update 15's work. The deploy fix is `cf77b94`: with the `bike-utils` import fixed, `npm run og:bn` then failed its own self-check on the 4 retired-bike `/bn/` pages (their metadata had no `openGraph`, so they fell back to the English `/og.png`); `retiredMetadata` now sets it. The full deploy sequence (validate, tsc, tests, build, og:bn) passed locally before the push: 108 cards, 194 `/bn/` pages checked. Week 3 spotlight is `0c86b3d`; every hard-coded claim in its text (CBS/ABS level, tube or tubeless, seat-height rank, price direction against the rival, score comparisons) was checked against `bikes.json`.
**Browser QA (live site, Playwright Chromium, 375 and 1280, EN and `/bn/`):** 20 pages (home, spotlight index, week 2 and 3 posts, /method, /cost, Pulsar N250 bike page, `/bikes/?seat=low`): 40 of 40 with 0 overflow, 0 axe serious or critical, 0 console errors. `interact.mjs` 52 PASS after one fix: check B6 read the compare tray before it mounted (a test race, not a site bug; `5040b09`). I looked at element shots of the low-seat section, market snapshot table, octane line, price sparkline and a Bangla week-3 post: no breakage found.
**Hotlines (`658cc68`):** GPX service line +880 1324-418726 (Speedoz Central Service Center, https://speedoz.com.bd/contact-us/); Haojue service line 01730-730651 (Karnaphuli Tejgaon workshop, https://www.karnaphuli.com/areas-of-activities/motor-cycles). Shown as a second "Service" link on `/dealers/` and the bike-page dealer card. Lifan: Rasel Industries' service page lists independent workshops, not a service hotline; its contact line is unchanged.
**Not verified:** the numbers were read from the pages, not called. Facebook pages were not checked. The Bangla post text has not been proofread. The price-history line can read "since Oct 2026 · was … in Oct 2026" when all changes fall in one month; not changed.


### Update 17 (2026-10-18, agent round)

**Hotlines:** Runner 09611222000 (Runner Group contact page, https://www.runnerbd.com/runner-group/contact.php; the page also lists 16273 marked "Mobile Only", not used). TVS: no Bangladesh hotline on an official page (bangladesh.tvsmotor.com shows only the Hosur, India headquarters line; the 01919-194222 seen in third-party directories is not official), so left empty. Lifan: unchanged (no official service hotline). Numbers were read from pages, not called.
**Fixed:** price-history line now reads "Oct 2026: ৳A → ৳B" when the last three changes fall in one month (was "since Oct · was … in Oct").
**Bangla proofread (spotlight posts):** "বাজেট এর নিজের" (15 posts) became "বাজেট এই বাইকের নিজের"; Dream 110 title "থামতে জানে না" (also reads as "can't brake") became "চলতেই থাকে". Doubtful, not changed: "অন্যের ঝামেলাসহ পুরনো বাইক" (Glint), "পিছলায়" (Splendor+), loanword-heavy "রিসেল" and "মনোশক"; needs a native reader.
**Git:** 7 merged local branches deleted with `-d`; `git worktree prune` run. `GOATCOUNTER_CODE` untouched.


## Update (2026-10-19, review round)

Read-only review of the live site and the repo at `a7bf0ec`. There are no new commits since the 2026-10-18 hardening round. Checked: GitHub Actions history and settings; the live site in Playwright at 375 and 1280 px (home, a bike page, compare, quiz, `/bn/`, a Bangla bike page, 404, dealers, cost, feedback), with 0 horizontal overflow and 0 console errors; sitemap (378 URLs), robots, share tags and page weight; and a dry run of the monthly price refresh against the live distributor pages. `scripts/check.sh` was not re-run, because no code changed and CI is green on `a7bf0ec`.

**Score:** 55% (cap 55), unchanged. Dimension scores are also unchanged: Product 7, Quality 7, Security 8, Legal 5, Market 1, Ops 5, Honesty 7 (`../GO_TO_MARKET_SCORECARD.md`).

**Still open from the last round:**
- `GOATCOUNTER_CODE` and `FORM_ENDPOINT` are still empty (`src/lib/site.ts:19`, `:28`). The live home page loads no counter, and Send on `/feedback/` opens an email app.
- "0 paid placements. Ever." (`src/app/HomeView.tsx:72`) and "no affiliate deals with dealers" (`src/app/about/AboutView.tsx:63`) are unchanged.
- The repo is still public, with 84 tracked internal files (critiques, research, this file).

**Bugs found:**
1. **The Pulsar F250 price is ৳20,000 too high.** The site shows ৳3,65,100 with "Price checked Oct 2026" and bajajauto.com as the source (`src/data/bikes.json:1949`). bajajauto.com/en-bd/bikes/pulsar-f250 shows ৳3,45,100 today. The price refresh dry run found this as the only change among 64 official prices; the other 63 match.
2. **The monthly price refresh cannot open its pull request.** The repo setting "Allow GitHub Actions to create and approve pull requests" is off (`can_approve_pull_request_reviews: false` in the Actions settings API). On 1 November the job will push `bot/price-refresh` and then fail at `gh pr create` (`.github/workflows/price-refresh.yml:50`), so no PR reaches you. The scraper itself works: the dry run read 40 distributor pages with 0 failures. Also, a PR opened with the Actions token does not start `check.yml`; `deploy.yml` still runs its gates when you merge.
3. **The 404 page shows the home page's title** ("Suggest.Bike — Find the right motorcycle in Bangladesh"), and `/bn/` addresses get the English 404 page. Small.

**Price spot check:** 6 of 6 match their source today: Pulsar N160 ৳2,73,600 (bajajauto.com), Livo ৳1,45,000 (bdhonda.com), and Apache RTR 160 4V ৳2,47,900, Splendor+ ৳1,17,000, R15 V4 ৳6,05,000 and FZS V4 ৳2,92,500 (bikebd.com). The suzuki.com.bd Gixxer SF page loads its price in the browser only, so curl could not check it.

**Gaps, ranked:**
1. **No analytics (critical).** Nothing can be measured, so no post, SEO change or feature can be judged. First flagged 12 Oct; it is a 10-minute owner task.
2. **No revenue model, and public promises block the obvious ones (critical).** Dealer leads, finance referrals and sponsored offers are how comparable sites earn. "0 paid placements. Ever." rules out even a labelled sponsor slot.
3. **No evidence anyone can find the site (high).** Bing returns "There are no results" for `site:suggest.bike`. Search Console coverage has not been checked since the sitemap went in on 14 Oct. The 10 Facebook posts in `docs/launch-posts.md` are drafted, but the site links no Facebook page. BikeBD holds the top results for the same queries.
4. **The selling points are still editorial estimates (high).** Real mileage, mistri scores and parts prices are labelled "Editorial estimate". The owner mileage survey and mechanic panel have not started.
5. **The correction loop is half-built (medium).** `FORM_ENDPOINT` is empty, so the feedback and "I own this" forms open an email app, which many Android phones in BD lack. WhatsApp works.
6. **No step after the decision, and no reason to come back (medium).** A bike page ends at a distributor hotline. There is no "get a showroom quote", price-drop alert or newsletter. The one offer in `src/data/offers.json` is hidden because its bike is "availability unconfirmed", so the offers feature shows nothing.
7. **The quiz answers for you (medium).** Answers start pre-selected and "Skip to results" ranks bikes on a ৳2.5 lakh Dhaka commuter the user never chose (`src/app/match/MatchView.tsx:110`, `:171`). At 375 px the first results screen shows the heading, chips and a drawing, but no bike name or price.
8. **Legal pages are unreviewed drafts (medium).** No lawyer review; the terms name no operator, address or governing law (`src/components/LegalView.tsx:8-11`).
9. **The public repo shows strategy and critiques to competitors (medium).** 84 internal files, including this one, `CrtiQue_*.md`, `ResearchingStuff/` and the owner todo list.
10. **Bangla pages mix digit systems (low).** The Bangla Pulsar N160 page prints all 37 ৳ amounts in Latin digits (৳2,85,364), while dates and counts use Bangla digits (অক্টো ২০২৬, ১২ মাসের). It reads as machine-made.

Also still true, lower down: about 270 KB of gzipped JS per page; 72 of 107 bikes have a drawing, not a photo; "bike under 2 lakh" and "best mileage" in search return nothing; the home page says "88 bikes on sale" while the footer says "107 bikes"; the footer links ThrottleIQ's GitHub repo; `docs/Todo_owner.md` still lists DNS hosting and the WhatsApp number as open, though both are done.

**Next, in order:**
1. **You (5 min):** in GitHub, Settings → Actions → General, tick "Allow GitHub Actions to create and approve pull requests". Then open Actions → price-refresh → Run workflow. It should open a PR that fixes the F250 price. Review it per `docs/price-refresh.md` and merge it (merging deploys).
2. **You (15 min):** create the GoatCounter and Formspree accounts and give the agent the code and URL (steps in `docs/Todo_owner.md`). Do this before any Facebook post.
3. **You (30 min):** check Search Console coverage, import the site into Bing Webmaster Tools from Search Console, create the Facebook page, and post the first two launch posts once analytics is on.
4. **You (decision):** pick a business model. If it includes leads or sponsorship, reword the promises to "money never touches the rankings". **Agent:** then build a disclosed "get a showroom quote" form.
5. **Agent (about 2 h, needs your OK to push):** a proper 404 title and Bangla 404 text; Bangla digits for every number on `/bn/`; route searches like "under 2 lakh" to the budget filter; one "Edit answers" line on quiz results so the top bike shows on the first screen.
6. **You:** lawyer review plus operator name and address in the terms; one walk-through on a real Android phone and an iPhone.

**Not checked:** Google Search Console coverage (owner login); Facebook's Sharing Debugger; real phones and low-end CPU speed (only transfer sizes were measured); whether an uptime monitor exists; whether mail to `hello@suggest.bike` arrives; the Bangla text by a native reader; BikeBD's rankings for our target queries (search engines block scripted queries); the ৳165/L octane figure.


### Update 18 (2026-10-20, agent round: next-step 5)

Done (`scripts/check.sh` exit 0; `npm run og:bn` 108 cards, 194 `/bn/` pages checked; `interact.mjs` 53 PASS, `keyboard.mjs` 57 PASS; `qa.mjs` on 8 pages at 375 and 1280: 0 overflow, axe or console problems):
- **404:** title "Page not found · Suggest.Bike" (`src/app/not-found.tsx` now exports metadata). On `/bn/…` addresses the one `404.html` shows the Bangla text, `lang="bn"` and the title "পাতা পাওয়া যায়নি · Suggest.Bike" (set on the client in `NotFoundView.tsx`).
- **Digits:** `formatBDT` and `formatLakh` print Bangla digits on Bangla pages (`৳২,৮৫,৩৬৪`, `৳২.৬৫ লাখ`), including page descriptions, Bangla share cards, price-band labels, home stats and spotlight posts (৳ amounts and "N/১০" scores). Not changed: hand-written Bangla copy (guides, cost page notes, `priceNoteBn` in `bikes.json`) and km, cc and mileage figures still use Latin digits; that needs an editorial pass, since model names like "R15 V4" must keep Latin digits.
- **Search:** "under 2 lakh", "1.5 lac", "150k", "২ লাখের নিচে" offer "All bikes up to ৳2 lakh on-road", which opens `/bikes/?price=u200000` with a removable "Up to ৳2 lakh" chip (`budgetQuery` in `src/lib/search.ts`, tested). "best mileage" still returns nothing.
- **Quiz results at 375 px:** only the budget chip shows (the other answer chips from 640 px up), and the on-road price sits under the model name, so the top bike's name and price are on the first screen.

- **2026-10-21, mileage search:** "best mileage", "mileage", "milage", "fuel efficient", "low fuel", "kmpl", "মাইলেজ", "সবচেয়ে বেশি মাইলেজ" and "কম তেল" offer "All bikes, best mileage first", which opens `/bikes/?sort=mileage` (or `/bn/bikes/?sort=mileage`) with the existing "Best mileage" sort over `mileageKmpl` in `bikes.json`; no new figures. With a budget ("best mileage under 1 lakh") it adds `price=u100000`. `/bikes/` now reads and writes `?sort=`. Fixed on the way: on mount `/bikes/` wrote the empty filters' URL over `?cat=`/`?price=`/`?sort=`, which could reset them. `mileageQuery` and `sortParam` tested; `scripts/check.sh` exit 0; `interact.mjs` 55/55 (new EN and BN search check), `keyboard.mjs` 57 PASS, `qa.mjs` on `/`, `/bikes/`, `/bn/bikes/` at 375 and 1280 clean.
