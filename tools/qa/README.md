# Browser QA

Real-browser pass over key pages: horizontal overflow, axe (serious/critical), console/page errors, and viewport-sized screenshot tiles. Not part of `scripts/check.sh`.

```sh
npm run build                      # repo root, produces out/
npx --yes serve@14 out -l 4173 &   # serve the static export
cd tools/qa && npm install && npx playwright install chromium
node qa.mjs                        # all pages, 375/768/1280
PAGES=/,/bikes/ WIDTHS=375,1280 node qa.mjs   # subset
BASE=http://localhost:4173 node qa.mjs        # other origin
```

Output: `tools/qa/shots/<page>_<width>_t<N>.png` (real viewport size: 375x812, 768x1024, 1280x800; first screen plus up to 3 more) and `shots/index.txt` (page, width, tile, overflow/axe/console results). Exit code is 1 if any page has overflow, axe or console problems.
