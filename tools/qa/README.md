# Browser QA

Real-browser pass over key pages: horizontal overflow, axe (serious/critical), console/page errors, and viewport-sized screenshot tiles. Not part of `scripts/check.sh`.

```sh
npm run build                      # repo root, produces out/
npx --yes serve@14 out -l 4173 &   # serve the static export
cd tools/qa && npm install && npx playwright install chromium
node qa.mjs                        # one page per route template (EN + /bn/), 375/768/1280, light
SCHEME=dark node qa.mjs            # OS dark setting (Playwright colorScheme)
SCHEME=dark-saved node qa.mjs      # OS light, dark chosen with the header toggle (localStorage sb-theme)
PAGES=/,/bikes/ WIDTHS=375,1280 node qa.mjs   # subset
BASE=https://suggest.bike OUT=shots/live node qa.mjs   # live site, own output folder
npm run interact                   # interaction checks (below)
npm run keyboard                   # keyboard-only checks (below)
PAGES=/bn/,/bikes/bajaj-ct100/ npm run weight # throttled page weight (below)
```

Output: `tools/qa/shots/<scheme>/<page>_<width>_t<N>.png` (real viewport size: 375x812, 768x1024, 1280x800; first screen plus up to 3 more) and `shots/<scheme>/index.txt` (page, width, tile, overflow/axe/console results). A page whose `data-theme` does not match the scheme counts as a console problem. Exit code is 1 if any page has overflow, axe or console problems.

## Interaction checks

`interact.mjs` (375 wide, plus 1280 for the header nav) drives the UI and prints PASS/FAIL per check; exit code 1 on any FAIL. Covers: quiz in full-price and EMI mode (৳60,000 cash, 24 months: on-road, bands, stretch), the kinds multi-select (EV only: only electric results, `k=ev` in the URL, the last kind cannot be unselected), EMI with ৳0 cash naming the least cash needed and its matches, the ৳40,000 empty state reached by moving the budget slider, the EN↔বাংলা toggle keeping query and hash, owner-report validation and the mailto fallback, the bike-page price history block, the EV owner form having no km/l field, `/changes` entries, the header Dealers link and footer Method link (EN, `/bn/`, mobile menu), that a `/bn/` visit does not store a language, the compare tray (a 4th pick refused, duplicate and stale ids, a shared link leaving a full tray alone, `/compare/` with no bikes writing the tray into its URL, the tray in sessionStorage so a new tab or an old localStorage pair starts empty, no button inside a link on `/` and `/bikes/`), `/bikes/` pagination (24 cards, "Show more" to 48 with `?page=2`, a name filter searching the whole catalogue, the by-brand list linking every bike), the home Quick pick badging an availability-unconfirmed bike (the scenario is found by scanning scooter/motorcycle, every use and every budget step), a removed bike's old URL (`/bikes/honda-cd70/`, EN and BN) redirecting to the bike list, the home search list painting over Quick pick (the hero columns stack at 375), and spotlight comments saying "not open yet" with no form while `FORM_ENDPOINT` is empty (EN and BN). Screenshots go to `shots/interact/`.

## Keyboard checks

`keyboard.mjs` (375 and 1280, Tab/Enter/Space/arrows only): the quiz end to end with a focus ring on each option (Space toggles a kind without leaving the step), the home search combobox (Banglish query, `aria-expanded`, `aria-activedescendant`, Escape keeps focus, Enter opens the bike), the compare add-slot picking a non-first result, `/bikes` switches (no control nested in a `label`, Space toggles), and a visible focus ring on the first 40 Tab stops of `/` and `/match/`. It also prints (INFO) which quiz options show as selected on first view: the quiz pre-selects `DEFAULT_ANSWERS`.

If port 4173 is taken (another checkout's server), `serve` picks a random port: pass it as `BASE`.

## Page weight

`weight.mjs`: 375 wide, ~1.6 Mbps down, 150 ms RTT, 4× CPU, cold cache per page; KB are compressed bytes as served by `serve@14`.

### Last measured (2026-10-15, after the bundle split, font trim and /bikes/ pagination)

Local `out/` served by `serve@14`; two interleaved runs, before and after on the same browser build.

| Page | JS KB | Font KB | HTML KB | DCL ms | Load ms | LCP ms (before) |
|---|---|---|---|---|---|---|
| `/` | 279 | 29 | 21 | 467 | 1830 | 698 (1282) |
| `/bn/` | 279 | 124 | 22 | 459 | 2301 | 1110 (1202) |
| `/bikes/` | 257 | 29 | 16 | 453 | 1783 | 608 (2912) |
| `/bikes/bajaj-pulsar-n160/` | 315 | 29 | 19 | 458 | 1848 | 724 (1258) |
| `/match/` | 248 | 29 | 7 | 447 | 1851 | 650 (1248) |

English pages no longer load Hind Siliguri (৳ uses the system Bengali font); `/bn/` loads its 400 and 600 weights. `/bikes/` ships 24 cards (244 KB raw HTML, was 925 KB). JS totals include the routes Next prefetches after load: guides and legal pages no longer load the bike index up front, but prefetching the logo's home route still fetches it once the page is idle. The bike photo LCP was 3.19 s with the 1024 px JPG (2026-10-13).
