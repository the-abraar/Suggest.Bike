# Suggest.Bike: Product Requirements Document

Written in ASD-STE100 style. Status: draft, 2026-10-13, matchmaker and payment sections updated 2026-10-14. Facts come from `README.md`, `judge.md` and the code. The owner has not reviewed this draft.

## 1. Problem

Bangladeshi buyers choose a motorcycle with poor information. Most reviews come from India. They ignore local mileage, parts cost, mechanic skill and BRTA fees. Buyers cannot see the true monthly cost of a bike. Prices change often and sources disagree.

## 2. Users

- **First-time buyer.** Has a budget. Does not know which bike fits.
- **Upgrader.** Owns a bike. Wants to compare two or three models.
- **Used-bike buyer.** Needs a checklist and a resale estimate.
- **Bangla reader.** Needs every page in Bangla.
- **Owner.** Needs service and maintenance advice.

## 3. Goals

1. Give a ranked shortlist in seven questions or fewer.
2. Show the all-in monthly cost of each bike.
3. Show the source and date of each price.
4. Keep every page in English and Bangla.
5. Run as a static site with no server and no database.

## 4. Non-goals

- Do not sell bikes. Do not list used bikes for sale.
- Do not give legal or financial advice. Show the "not legal advice" notice.
- Do not show a bike as available if no source confirms it.
- Do not track users. Do not store personal data on a server.
- Do not claim measured data for editorial estimates.

## 5. Functional requirements

### 5.1 Matchmaker (`/match`)

- FR-M1. The system shall ask seven questions (six while there is no district network data) and rank every bike.
- FR-M2. The system shall not rank a bike above the budget ceiling.
- FR-M3. The system shall not show a scooter when the rider wants a geared bike.
- FR-M4. The system shall penalize a bike when the seat height does not fit the rider.
- FR-M5. The system shall give a reason for each result.
- FR-M6. The system shall give a shareable URL for the result.
- FR-M7. In EMI mode, the system shall ask for the cash available now, a monthly instalment and a term. It shall count BRTA registration and the processing fee as cash paid upfront. It shall show a bike only when the cash and the instalment both fit. It shall use the payment engine of /cost (`src/lib/fund.ts`).
- FR-M8. The system shall rank a bike that costs less than 60% of the budget lower, but still show it. When the user picks "Lowest price", the system shall not do this.
- FR-M9. When the top three bikes have the same style, and a bike of another style scores within 5 points of the third, the system shall put that bike third.
- FR-M10. The system shall not show EMI or "on-road" for a used or used-only bike. EMI mode shall not show used bikes.
- FR-M11. The system shall clamp values from a shared URL: the budget to ৳30,000–৳10,00,000 and the EMI inputs to the quiz limits. It shall ignore repeated priorities. In EMI mode, it shall calculate the budget from the EMI inputs.

### 5.2 Compare (`/compare`)

- FR-C1. The system shall compare up to three bikes side by side.
- FR-C2. The system shall mark the lowest and highest value of each measured specification.
- FR-C3. The system shall show editorial scores without a winner.
- FR-C4. The system shall base quick verdicts only on measured numbers.

### 5.3 Cost (`/cost`)

- FR-K1. The system shall calculate fuel, service, wear parts, paperwork, insurance and resale loss.
- FR-K2. The system shall show one all-in monthly figure.
- FR-K3. The system shall show cash, 0% card EMI and loan as three options. For each option it shall show the upfront cash, the instalment, the interest and the total. For a used bike it shall show cash only.
- FR-K6. Every "/month" figure next to a price shall be the 12-month 0% card EMI on the ex-showroom price, from `src/lib/fund.ts`.
- FR-K4. The system shall use the used-market price of a bike when one exists.
- FR-K5. The system shall return zero, not an infinite value, when distance or years is zero.

### 5.4 Guide (`/guide`)

- FR-G1. The system shall show BRTA registration costs, tax token, licence steps and fees, and the cc policy.
- FR-G2. The system shall show an `asOf` date and sources for each section.
- FR-G3. The system shall show a used-bike checklist.
- FR-G4. The system shall mark draft policy as "not enacted". It shall never show draft policy as law.

### 5.5 Bike pages and browse

- FR-B1. The system shall give each bike a page with a verdict, scores, parts and service prices, specifications, sources and similar bikes.
- FR-B2. The system shall let the user filter by style, budget, brand, ABS and fuel injection.
- FR-B3. The system shall mark estimates with an "estimate" badge.
- FR-B4. The system shall give a "report a wrong price" link on each bike page.

### 5.6 Language and themes

- FR-L1. The system shall give every page in English and in Bangla.
- FR-L2. The system shall give Bangla pages their own URL under `/bn/`, with `hreflang` links.
- FR-L3. The system shall follow the light or dark theme of the device.

### 5.7 Owner pages

- FR-O1. The system shall give a new-owner guide at `/owner/`.
- FR-O2. The system shall give maintenance posts at `/maintenance/`. A post slug shall not change.

## 6. Data pipeline

- DP-1. Each bike shall record `priceBDT`, `priceAsOf` and `priceSource`.
- DP-2. Run `npm run validate` before each build. The validator shall fail the build when a price is more than 180 days old.
- DP-3. The validator shall fail when a price is more than 40% from its category median and the bike has no `priceNote`.
- DP-4. Run `npm run audit:prices` to list stale prices, single-source bikes and outliers.
- DP-5. The build shall generate `src/data/generated` and `public/data/bikes` from `src/data`. Edit the source files only.
- DP-6. A person shall check a price against its source before editing. Do not edit data to pass a check.

## 7. Non-functional requirements

- NFR-1. The site shall be a static export (Next.js) that GitHub Pages can host.
- NFR-2. The site shall show no horizontal scroll at 375, 768 and 1280 pixels.
- NFR-3. The site shall have no serious or critical axe violations.
- NFR-4. Text shall have a contrast ratio of at least 4.5:1.
- NFR-5. Each page shall load only the data it needs (a slim index plus one file per bike).
- NFR-6. The deploy shall pass these gates in order: validate, typecheck, tests, build.

## 8. Constraints

- Node 22. No Python. No ESLint. The TypeScript compiler is the linter.
- Mileage, mechanic scores, parts prices and service networks are editorial estimates.
- A lawyer has not reviewed the legal pages.
- The domain DNS needs the owner.

## 9. Success metrics

| Metric | Target | Status |
| --- | --- | --- |
| Bikes with a price younger than 90 days | 100% | Not measured here |
| Bikes with a second-domain source | 100% | 6 of 83 have none (`npm run audit:prices`, 2026-10-13) |
| Match completion rate | To set after analytics | No analytics yet |
| Pages with Bangla twin | 100% | Not measured here |
| Deploy gates green | Always | Run `scripts/check.sh` to confirm |

## 10. Open questions

- Which privacy-friendly analytics provider shall the site use?
- Which service shall receive feedback form posts?
- What shall the business model be?
- Shall the hidden used-bike finder stay?
