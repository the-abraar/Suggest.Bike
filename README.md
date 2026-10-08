# Suggest.Bike

**Bangladesh's motorcycle decision engine.** The site to visit before you buy a bike in Bangladesh. It gives honest, Bangladesh-specific answers: real-world mileage, whether a local *mistri* can fix the bike, what parts cost, and the real monthly cost of owning it.

## What's inside

| Page | What it does |
| --- | --- |
| `/` | Home page with a live "Quick pick" (budget slider and riding style give the top 3 instantly), budget bands, popular match-ups and the editor's shortlist |
| `/match` | A 6-question matchmaker that ranks every bike for you and explains why. Results have a shareable URL. |
| `/bikes` | Browse all bikes. Filter by style, budget, brand, ABS and FI; sort by rating, price, mileage, power or ease of maintenance |
| `/bikes/[id]` | Detail page for each of the 76 bikes: verdict, riding feel, quirks, 11 ownership scores, parts and service prices, full specs, monthly cost, similar bikes and sources |
| `/compare` | Compare up to 3 bikes side by side. Winners get a crown, plus quick verdicts (cheaper to run, quicker, easier to maintain…) |
| `/cost` | True cost of ownership: fuel, servicing, wear parts, BRTA paperwork, insurance and resale loss, as an all-in monthly figure |
| `/fund` | Bike fund: the bike "downloads" as you save (ported from TakaTalks' dream-loader viz), with ETA, a downloadable 4:5 poster, cash vs 0% card EMI vs loan (upfront cash, instalment, interest, budget fit), ways to get there sooner and saving habits. Shareable URL. |
| `/guide` | Buyer's guide: BRTA registration costs, the 10-year tax token, smart licence steps and fees, the 375cc rule, road rules, an 11-point used-bike checklist and rider communities |
| `/labs` | **Experimental.** Labs hub. `/labs/check` is a used-bike checklist made for your model, with a value estimate and photo, video and engine-sound capture (analysed in the browser only). `/labs/listing-check` scores a Bikroy or Facebook listing plus what the seller said. `/labs/finder` is a bike-finder request form, coming soon. Its nightly agent and WhatsApp alerts are in `finder/` (see `finder/README.md`). |
| `/saved` | Shortlist of hearted bikes, stored on the device |

Also included: English/বাংলা toggle, light and dark themes (following the system), a compare tray, a `/` keyboard shortcut for search, an SEO sitemap and robots.txt, and Product JSON-LD on every bike page.

## Run it

```bash
npm install
npm run dev        # http://localhost:3000
```

## Ship it

The site is a fully static export, with no server or database.

```bash
npm run build      # writes plain HTML/CSS/JS to ./out
npm run preview    # serves ./out locally to check it
```

Upload the contents of `out/` to any static host:

- **Namecheap shared hosting:** in cPanel, open File Manager → `public_html/` and upload everything inside `out/`.
- **Netlify / Cloudflare Pages / Vercel:** set the build command to `npm run build` and the output directory to `out`.

Before going live, set the final domain in `src/lib/site.ts`. It's used for canonical URLs and the sitemap.

## Data

- `src/data/bikes.json`: every bike, matching the `Bike` type in `src/lib/types.ts`. Run `node scripts/validate-data.mjs` after editing.
- `src/data/guide.json`: BRTA fees, licence, cc policy, fuel prices, laws, used-bike checklist and communities. Each section lists its sources and an `asOf` date.
- Prices were compiled in October 2026, mostly from BikeBD and official distributor sites. Each bike records `priceAsOf` and `priceSource`.
- Mileage ranges, ownership scores and parts and service prices are **editorial estimates**. They are based on owner reports and BD market knowledge, not measured.

### Updating prices
Edit `priceBDT`, `priceAsOf` and `priceSource` in `bikes.json`, run the validator, then rebuild. Fuel prices are in `guide.json → fuel`.

## Structure

```
src/
  app/            routes (App Router, static export)
  components/     BikeArt (illustrations drawn in code), Header, SearchBox, CompareTray, ui
  lib/            bikes (data helpers), match (recommendation engine), cost (ownership model), fund (savings/EMI/loan maths), i18n, store
  data/           bikes.json, guide.json
prototypes/       the original TSX sketches this grew from
```
