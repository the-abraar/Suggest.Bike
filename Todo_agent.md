# Todo — agent

Work an AI coding agent can pick up without the owner. Ordered by impact. Each item names the files involved and what "done" means. Run `node scripts/validate-data.mjs`, `npx tsc --noEmit` and `npm run build` before calling anything done. If data changes, run `node scripts/sources.mjs` too.

## P0 — Trust and correctness

- [ ] **Re-check the data the research flagged as shaky.** Fix it in `src/data/bikes.json` and update `priceAsOf`/`sources`:
  - Hornet 2.0: BD-spec power/torque (16.6 PS / 15.9 Nm per BikeBD vs 17.03 / 16.1 used).
  - TVS Stryker 125: gears, tank and seat height. Metro Plus: kerb weight. Discover 125: tank (8 L vs 11 L).
  - Hunk 150R: power/torque. Saluto: carb vs FI. XSR155: ABS. Access 125: brakes. SP160: ABS on the single-disc variant.
  - Vespa VXL: carb vs FI. KTM Duke 125 / RC 125: still in stock in BD? (India discontinued both in 2025.)
  - Conflicting prices: Gixxer Monotone, X-Blade, Ray ZR 125, R15 V4 BS7.
- [ ] **Show a "how sure are we" marker.** Add an optional `confidence` (`"high" | "medium" | "low"`) per field group to the `Bike` type. Show a small "estimate" badge next to mileage and parts prices on `/bikes/[id]` and `/compare`.
- [ ] **Registration cost for 250–350cc.** Find a real itemised receipt, or a BRTA source, for a >165cc registration. Update `guide.json → registration.bands` and drop the "low" confidence.
- [ ] **CBU >165cc import status** under Import Policy Order 2026–29. Settle the conflicting reports (Dhaka Times vs Desh Rupantor/Bangla Tribune) from the gazette PDF, then update `guide.json → ccPolicy` and the guide copy.
- [ ] **Translate bike content into Bangla.** Add `bn` versions of `tagline`, `feel`, `quirks`, `braking`, `mechanicNote`, `pros`, `cons` and `bestFor`, either as optional `*Bn` fields or a parallel `bikes.bn.json`. Today a Bangla visitor gets an English bike page.
- [ ] **Translate generated strings.** Match reasons and warnings (`src/lib/match.ts`), compare row labels, the cost page and the guide page are English-only. Move them into `src/lib/i18n.tsx`.

## P1 — Product

- [ ] **Electric bikes.** The schema can't describe EVs (cc, stroke, carb/FI). Add `powertrain: "ice" | "ev"` with battery kWh, range and charge time. Then add Revoo, Walton Takyon, etc., and a "cost per km vs petrol" comparison.
- [ ] **Used-market prices for on-sale bikes.** Add "1-year-old" and "3-year-old" used prices (from bikroy.com listings) next to the resale estimate. This replaces the formula in `src/lib/cost.ts → yearlyRetention`.
- [ ] **Price history.** Store `priceHistory: { month, priceBDT }[]` and draw a small sparkline on the detail page. People want to know whether to wait.
- [ ] **Matchmaker: city/region question.** Dealer and service network matters outside Dhaka/Chattogram. Weight `mechanicFamiliarity`/`partsAvailability` higher for district riders. Needs dealer-count data per brand (see the owner todo).
- [ ] **Matchmaker: EMI / monthly budget mode.** Many buyers think "৳8k a month", not "৳2.5 lakh". Let them enter a monthly budget and convert it using typical bank and dealer EMI terms.
- [ ] **Women riders / scooter path.** Add a dedicated landing section: seat height filter, weight, scooter comparisons, and a guide to scooter licensing.
- [ ] **Shareable compare images.** Generate an OG image for `/compare?bikes=…` and `/bikes/[id]` so links look good on Facebook and Messenger, where BD bike talk happens. Use `next/og` at build time, since this is a static export.
- [ ] **"Report a wrong price" button** on each bike page. It should open a prefilled form or `mailto:` with the bike id and current price.
- [ ] **Real photos.** Let `Bike` carry `image?: { src, credit, license }`. Make `BikeArt` fall back to the illustration. Keep the 5:3 frame.

## P2 — Engineering

- [ ] **Per-bike Bangla URLs** (`/bn/bikes/[id]`) so Google indexes the Bangla pages. Today the language is client-side only.
- [ ] **Static OG/meta for client pages.** `/`, `/bikes`, `/match`, `/compare`, `/cost` and `/saved` are client components with only the layout's default metadata. Split them into a server `page.tsx` (with metadata) plus a client view.
- [ ] **Tests.** Unit-test `matchBikes` (budget ceiling, no scooters when `gearless:"no"`, the seat-height penalty), `ownershipCost` (renewal maths for the 2-year plan) and `formatLakh`. Playwright smoke test for every route at 390px and 1440px, failing on horizontal overflow.
- [ ] **Accessibility pass.** Keyboard-only run through the quiz, compare add-slot and search combobox. Check focus rings, colour contrast of `text-faint` (likely under 4.5:1), and the switch markup in `/bikes` (a button nested in a label).
- [ ] **Performance.** `bikes.json` (≈200 KB) ships to every client page. Split it into a slim list index plus per-bike details loaded on the detail page.
- [ ] **Data pipeline.** Write a script that re-scrapes BikeBD price pages monthly and opens a PR with the diffs. Fold in `scripts/validate-data.mjs`.
- [ ] **Analytics hooks** (privacy-friendly, e.g. Plausible/Umami) for quiz completion, most-compared pairs and the cost calculator. Waiting on the owner to choose a provider.
