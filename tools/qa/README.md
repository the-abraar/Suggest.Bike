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

`interact.mjs` (375 wide, plus 1280 for the header nav) drives the UI and prints PASS/FAIL per check; exit code 1 on any FAIL. Covers: quiz in full-price and EMI mode (৳30,000 down, 24 months: on-road, bands, stretch), the ৳40,000 empty state reached by moving the budget slider, the EN↔বাংলা toggle keeping query and hash, owner-report validation and the mailto fallback, the bike-page price history block, the EV owner form having no km/l field, `/changes` entries, the header Dealers link and footer Method link (EN, `/bn/`, mobile menu). Screenshots go to `shots/interact/`.

## Keyboard checks

`keyboard.mjs` (375 and 1280, Tab/Enter/Space/arrows only): the quiz end to end with a focus ring on each option, the home search combobox (Banglish query, `aria-expanded`, `aria-activedescendant`, Escape keeps focus, Enter opens the bike), the compare add-slot picking a non-first result, `/bikes` switches (no control nested in a `label`, Space toggles), and a visible focus ring on the first 40 Tab stops of `/` and `/match/`. It also prints (INFO) which quiz options show as selected on first view: the quiz pre-selects `DEFAULT_ANSWERS`.

If port 4173 is taken (another checkout's server), `serve` picks a random port: pass it as `BASE`.

## Page weight

`weight.mjs`: 375 wide, ~1.6 Mbps down, 150 ms RTT, 4× CPU, cold cache per page; KB are compressed bytes as served by `serve@14`.

### Last measured (2026-10-13, after WebP photos)

| Page | JS KB | CSS KB | Font KB | Img KB | DCL ms | Load ms | LCP ms |
|---|---|---|---|---|---|---|---|
| `/bn/` | 276 | 11 | 215 | 0 | 704 | 2677 | 1200 |
| `/bn/match/` | 239 | 11 | 207 | 0 | 686 | 2641 | 1184 |
| `/bn/bikes/` | 245 | 11 | 207 | 0 | 676 | 2496 | 836 |
| `/bn/bikes/bajaj-ct100/` | 307 | 11 | 215 | 92 | 681 | 3134 | 2880 |
| `/bikes/bajaj-ct100/` | 307 | 11 | 182 | 92 | 753 | 2956 | 2812 |
| `/` | 276 | 11 | 182 | 0 | 677 | 2472 | 1256 |

Bangla pages load ~25-33 KB more font than English ones (the Bangla face). The bike photo LCP was 3.19 s with the 1024 px JPG.
