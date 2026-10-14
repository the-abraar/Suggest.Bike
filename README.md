# Suggest.Bike

**Bangladesh's motorcycle decision engine.** The site to visit before you buy a bike in Bangladesh. It gives honest, Bangladesh-specific answers: real-world mileage, whether a local *mistri* can fix the bike, what parts cost, and the real monthly cost of owning it.

## What's inside

| Page | What it does |
| --- | --- |
| `/` | Home page with a live "Quick pick" (budget slider and riding style give the top 3 instantly), budget bands, popular match-ups and the editor's shortlist |
| `/match` | A 7-question matchmaker (6 while there is no district network data) that ranks every bike for you and explains why. Results have a shareable URL. |
| `/bikes` | Browse all bikes. Filter by style, budget, brand, ABS and FI; sort by rating, price, mileage, power or ease of maintenance |
| `/bikes/[id]` | Detail page for each of the 103 bikes (84 on sale, 19 used-only): verdict, riding feel, quirks, 11 ownership scores, parts and service prices, full specs, monthly cost, similar bikes and sources |
| `/compare` | Compare up to 3 bikes side by side. Measured specs mark the lowest/highest value; editorial scores are shown without a winner. Quick verdicts use only measured numbers (price, running cost, power-to-weight, mileage) |
| `/cost` | True cost of ownership: fuel, servicing, wear parts, BRTA paperwork, insurance and resale loss, as an all-in monthly figure, plus cash vs 0% card EMI vs loan (cash upfront, instalment, interest, total) |
| `/guide` | Buyer's guide: BRTA registration costs, the 10-year tax token, smart licence steps and fees, the 375cc rule, road rules, an 11-point used-bike checklist and rider communities |
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

Live at **https://suggest.bike** on GitHub Pages. Every push to `main` runs `.github/workflows/deploy.yml`, which builds and publishes `out/`. `public/CNAME` holds the custom domain.

DNS (Namecheap → Advanced DNS; delete the parking records and the URL redirect first):

| Type  | Host | Value                  |
|-------|------|------------------------|
| A     | @    | 185.199.108.153        |
| A     | @    | 185.199.109.153        |
| A     | @    | 185.199.110.153        |
| A     | @    | 185.199.111.153        |
| CNAME | www  | the-abraar.github.io.  |

The domain lives in `src/lib/site.ts` (canonical URLs, sitemap) and `public/CNAME`. Change both if it ever moves.

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
  lib/            bikes (catalogue index), bike-utils (data-free helpers: formats, labels, JSON-LD), search, match (recommendation engine),
                  cost (ownership model), fund (cash/card EMI/loan maths), curated (pairs, page titles), i18n, store
  data/           bikes.json, guide.json
```
