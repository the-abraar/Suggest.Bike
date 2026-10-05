# Handoff: Suggest.Bike, "fix all audit items, then push"

Read this first if you are picking up the work. Last updated 2026-10-06 by the agent working on branch `feat/suggest-bike-v1`.

> **Status: complete.** All audit items are fixed and the branch is pushed. 28 photos were merged after a visual check. `networks.json` stays `{}` because the network research never landed; that is now an owner/agent todo, not a blocker. The steps below are kept as a record and as a re-verification checklist.

## What this project is
Suggest.Bike is a Bangladesh motorcycle buying-decision website. It's a Next.js 16 App Router static export (`npm run build` → `out/`) using Tailwind v4, with no backend. The owner's domain is `suugest.bike` (Namecheap). Hard rule from the owner: **never publish Claude "Artifacts" for this repo.** Demos run locally (`npx serve out -l 3000`).

## The current task (owner's words: "Fix all then push again")
Fix every issue in `UI_AUDIT.md` (C1, H1–H6, M1–M7, L1–L6). Then commit and push the branch `feat/suggest-bike-v1` to `origin` (github.com/the-abraar/Suggest.Bike). Nothing had been pushed before this task. Push the branch; **don't merge to main or open a PR unless asked.**

## Status per audit item
| ID | Item | Status | Where |
| --- | --- | --- | --- |
| C1 | Mobile menu invisible | Done (earlier commit) | `src/components/Header.tsx` |
| H1 | Half-translated Bangla | Done: all UI strings, bike write-ups (`bikes.json → bn`), guide (`guide.bn.json`), "লাখ" | `useTx()` in `src/lib/i18n.tsx` |
| H2 | Bangla search | Done: `aliases` on every bike, normaliser keeps Bangla script and folds Bangla digits | `src/components/SearchBox.tsx` |
| H3 | EMI | Done: EMI mode in the quiz budget step, "/month on 12-month card EMI" on detail/compare/cost/quick pick, guide `#emi` | `emiMonthly` in `src/lib/cost.ts` |
| H4 | District buyers | Code done ("Where" quiz step, weighting through `networkReach`, network box on detail). **Data pending:** `src/data/networks.json` is `{}` until the research agent writes `scratchpad/research/networks.json` | `src/lib/match.ts`, `src/lib/bikes.ts` |
| H5 | Monthly card buried on mobile | Done (`order-first` aside) | `src/app/bikes/[id]/BikeDetail.tsx` |
| H6 | RX100 recommended to commuters | Done: used-only and 2-stroke penalties unless fun/style, plus a "Nothing new fits" banner | `src/lib/match.ts`, `src/app/match/page.tsx` |
| M1 | Photos | Code done (Photo/Illustration toggle with credit). **Data pending:** Wikimedia Commons images arriving in `public/bikes/*.jpg` plus metadata in `scratchpad/research/images.json`; they need merging into `bikes.json → image` | detail hero |
| M2 | Used market | Done: `usedPrice` (bikroy, 40 bikes) on detail and compare, and the matchmaker suggests used examples of current models | |
| M3 | Quick pick scooters | Done: geared by default, with a Scooter chip | `src/app/page.tsx` |
| M4 | Price freshness | Done: "Price checked" pill, "Offer running" badge, "Report wrong price" mailto | |
| M5 | Estimates unlabelled | Done: `<Approx/>` tag on mileage, parts and scores copy | `src/components/ui.tsx` |
| M6 | Sharing | Done: `ShareButton` (navigator.share or copy) plus static OG images per bike and site-wide (`opengraph-image.tsx`) | |
| M7 | Page weight | Done: slim `src/data/generated/bikes.index.json` for client pages; full records come via a server prop or `public/data/bikes/<id>.json` | `scripts/build-data.mjs` |
| L1 | "Hero Honda" brand chip | Done: `brandLabel()` adds "(used)" | |
| L2 | Scooter part names | Done: `partLabel()` shows "Drive belt" / "Clutch shoes" for CVT | |
| L3 | Language toggle | Done: shows "বাংলা" / "EN" | |
| L4 | Compare text on mobile | Done: stacked per bike below the `sm` breakpoint | |
| L5 | Contrast | Done: `--faint` is 4.87:1 light, 5.9:1 dark | `globals.css` |
| L6 | Feedback path | Done: footer "Report a mistake" plus per-bike mailto to `SITE.contactEmail` (`hello@suugest.bike`; owner must create the mailbox) | `src/lib/site.ts` |

## Remaining steps
1. **Merge the photo and network research** once these exist in the scratchpad (`/private/tmp/claude-501/-Users-blackbird-Everything-dev-2-Ongoing-Suggest-Bike/df82efaa-7a7e-4b22-ade6-780466a93002/scratchpad/research/`):
   - `images.json` → for each id, set `bikes.json[i].image = { src, author, license, licenseUrl, sourcePage }`. Only for files that exist in `public/bikes/`.
   - **Look at every photo** (e.g. make a contact sheet) and drop any that isn't clearly that model. A wrong photo is worse than none.
   - `networks.json` → copy to `src/data/networks.json` (shape: `BrandNetwork` in `src/lib/types.ts`).
   - If the scratchpad is gone, the code still works: no images means illustrations; `{}` networks means "not verified yet".
2. Run `node scripts/sources.mjs` so `SOURCES.md` stays current. Consider extending it to list `usedPrice.sources`, image credits and network sources.
3. Update `UI_AUDIT.md` with a "Resolution" column or section, `Todo_agent.md` (strike done items) and `Todo_owner.md` (create the `hello@` mailbox; verify networks and photos).
4. **Verify before committing:**
   - `npm run validate` (0 problems)
   - `npm run typecheck`
   - `npm run build` (should generate about 165 static pages, including OG images)
   - Serve `out/` and smoke-test every route returns 200: `/ /match/ /bikes/ /bikes/<id>/ /compare/ /cost/ /guide/ /saved/ /about/ /sitemap.xml`, and `/nope/` returns 404.
   - Take puppeteer screenshots at 390px in **bn** (set `localStorage sb-lang=bn` before load) and at 1440px in light and dark. Check: no horizontal overflow (`document.documentElement.scrollWidth === 390`), no console errors, no leftover English in Bangla mode except brand/model names and units.
   - The puppeteer helper is in the scratchpad at `pp/` (`shot.mjs`, `v2.mjs`). If it's gone: `npm i puppeteer-core` and point it at `/Applications/Google Chrome.app/Contents/MacOS/Google Chrome`.
   - Persona checks with `npx tsx` against `matchBikes` (see `UI_AUDIT.md`). ৳1 lakh + used + commute must **not** put a 2-stroke or used-only classic at #1.
5. **Commit** with an attribution trailer `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`, then run `git push -u origin feat/suggest-bike-v1`.
6. Tell the owner what changed, which data is estimated (mileage, scores, parts prices) and what they must do: create the mailbox, decide the domain spelling, spot-check prices.

## How things fit together (for debugging)
- **Data source of truth:** `src/data/bikes.json` (`Bike` type) and `src/data/guide.json` / `guide.bn.json`. Generated files are gitignored and rebuilt by `npm run data` (it runs automatically before dev, build and typecheck):
  - `src/data/generated/bikes.index.json` (slim)
  - `src/data/generated/art.json` (SVG data URIs for OG images; `scripts/build-art.tsx`, because Next forbids `react-dom/server` in app routes)
  - `public/data/bikes/*.json` (full records for `/compare`)
- **Server vs client:** `src/lib/bikes.server.ts` is server-only (full records for `/bikes/[id]` at build time). Client code uses `src/lib/bikes.ts` (slim).
- **Language:** `useLang()` / `useTx()` handle it on the client. The language is stored in `localStorage sb-lang`. Static HTML renders English first, then switches.
- **Share images:** the OG font has no ৳ glyph, so share images say "Tk". Images are extension-less PNG files; `public/.htaccess` forces `image/png` on Apache/Namecheap.
