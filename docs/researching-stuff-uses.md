# What ResearchingStuff/ can do for suggest.bike

Read-only review, 2026-10-13. All 65 files were skimmed; market, rules, ownership, Bajaj, Suzuki, Yamaha, Hero and TVS were read in full, then compared against `src/data/bikes.json`, `src/data/guide.json`, `src/lib/cost.ts`, the `/method` copy and `docs/new_judge.md`. No URL was re-fetched: every "folder says" value is a lead as of 2026-10-13 and needs a fresh check at its source before any edit.

## 1. Quality of the material

An honest, well-flagged research notebook; most of it is not publishable as written. Every file has an access date and inline URLs, and uncertainty is marked (UNVERIFIED, NOT FOUND, CONFLICT, "snippet"). `INDEX.md` itself says "local only, not for the website".

| Area | Sourcing | Reliability | Notes |
|---|---|---|---|
| `rules/` (10 files) | Primary: Road Transport Act 2018 (bdlaws), Rules 2022 gazette, with section numbers | High for statute and penalties | Best material. Speed limits come from news reports of the 2024 BRTA guideline (TBS and Dhaka Tribune disagree on highway limits). Padma Bridge status is stale (see 2B #18). |
| `market/` | Daily Star, TBS, ACI | Medium | Brand shares conflict between sources (flagged). No model-level sales exist; `10-top-sellers` is a hedged shortlist, not data. |
| `current-models/` Bajaj, Suzuki | Official (bajajauto.com/en-bd, Suzuki BD API) | High on the fetch date | Also lists errors on the makers' own pages. |
| `current-models/` Yamaha, Hero | Official specs, BikeBD prices | Medium | |
| `current-models/` Honda, TVS, Runner, Lifan, RE, Haojue, KTM | BikeBD scrape only | Low-medium | Missed Honda's official site (bdhonda.com, already cited in bikes.json). |
| `current-models/` Keeway, Benelli, Kawasaki, Walton | BikeBD scrape | Junk | "None [None]" rows, 0 bhp, unregistrable 300-800cc "upcoming" bikes, empty Walton rows. Do not use. |
| `variants/` | Wikipedia, Indian sites, some BikeBD owner reviews | Low-medium | India-centric; BD variant detail mostly "not found". |
| `history/` | BikeBD blogs, Wikipedia, some news | Low-medium | Company-entry dates are decent; pre-2013 is lore (flagged). |
| `ownership/` | News and BikeBD listings | Low | Service costs, warranty, depreciation, comprehensive insurance all NOT FOUND; oil and tyre prices stale. |
| `industry/` | BikeBD importer pages, Wikipedia | Low-medium | Importer conflicts unresolved. |

**Overtaken by guide.json** (compiled 2026-10-06, newer and better sourced): AIT status, Import Policy Order 2026-29, Padma Bridge. Treat `rules/licence-and-registration.md` and `ownership/duty-tax-and-policy.md` as background only.

**Licensing.** Mostly the research agent's own paraphrase. The `current-models/` tables are copies of BikeBD database fields: cite individual facts, don't republish the tables (it would also deepen the BikeBD dependency). Statute text is safe to paraphrase (the Bangla version is authoritative, s.126(2)). Summarise and link owner reviews and BikeBD blogs, never copy.

## 2. Contradictions and corrections

### A. bikes.json vs an official or same-source page

| # | Bike | Site says | Folder says | Folder file | Action |
|---|---|---|---|---|---|
| 1 | `honda-dio` | ৳1,99,000 (bikebd honda-dio) | ৳1,57,000 on the same page, model year 2018 | current-models/honda.md | Re-check; largest gap (৳42k). |
| 2 | `ktm-rc-125` | ৳3,70,000 (bikebd ktm-rc-125-2022) | ৳4,43,000 on that page | current-models/ktm.md | Re-check. |
| 3 | `bajaj-pulsar-n250` | ৳3,30,100 (bikebd) | Official ৳3,60,000 | current-models/bajaj.md | Use official or name the variant. |
| 4 | `bajaj-pulsar-f250` | ৳3,50,100 (bikebd) | Official ৳3,65,100 (350,100 is the red colour) | same | Same. |
| 5 | Yamaha fazer-fi-v2 / fzs-fi-v4 / fz-x / fzs-fi-hybrid / r15-v4 | 274,000 / 294,500 / 293,500 / 347,500 / 610,000 | 272,000 / 292,500 / 292,500 / 344,500 / 605,000 (same pages) | current-models/yamaha.md | Consistent ৳1-5k offset; run `npm run audit:prices`. |
| 6 | `bajaj-discover-125` | tank 11 L | Official 8 L (2.3 L reserve) | bajaj.md | Fix (affects range). |
| 7 | `bajaj-ct100` | 7.9 PS / 8.3 Nm / 115 kg (Platina's numbers) | Official 7.7 PS / 8.24 Nm / 111 kg | bajaj.md | Fix. |
| 8 | `yamaha-ray-zr-125` | 10.3 Nm | Official 9.7 Nm | yamaha.md | Fix. |
| 9 | `hero-hunk-150r` | 146 kg | Official 148 (DD) / 149 (ABS); 146 is the Xtec | hero.md | Fix. |
| 10 | Small official deltas | NS125 144 kg; Pulsar 150 148 kg, 13.25 Nm; N160 152 kg; GSX-R150 134 kg; Access 125 104 kg, 10 Nm; Platina tank 11 L | 141; 144, 13.4; 154; 131; 102, 10.2; 11.5 L | bajaj.md, suzuki.md | Batch fix. |
| 11 | `suzuki-v-strom-sx-250` | on-sale, ৳4,49,000 | Not in the official 10-model Suzuki API list; BikeBD 449,950 | suzuki.md | Check it's still sold (owner reports a live October offer, so likely yes). |
| 12 | `tvs-apache-rtr-160-4v` | top speed 125 km/h | TVS BD 2019 press release 113; BikeBD 130 | tvs.md | Low priority. |
| 13 | `zontes-zt155-u` distributor | Moto Solution BD Ltd | Mototech Industry distributes; MotoSolution markets (CONFLICT) | industry/importers-and-assemblers.md | Verify. |

### B. guide.json vs the folder

| # | guide.json | Folder | Verdict |
|---|---|---|---|
| 14 | Illegal modifications: up to Tk 3 lakh | Act s.84: 1-3 years jail (min 1 yr) plus up to Tk 3 lakh, non-bailable (rules/penalties-table.md) | Guide understates; fix. |
| 15 | >150cc owners need a TIN | AIT dropped, replaced by return-proof (PSR) for >165cc (Dhaka Tribune, 6 Jun 2026; ownership/duty-tax-and-policy.md) | Verify against the passed Finance Act. |
| 16 | IDRA motor liability pilot "one year from Aug 2025", ৳1,006 used in cost.ts | Same source (TBS, Feb 2026) | Unknown whether it continued past Aug 2026; staleness risk for /cost insurance. |
| 17 | BD BikerZ "est. 2007" | First public meetup 2008 | Trivial. |
| 18 | Padma Bridge allowed again from 20 Apr 2023 | rules/00-overview, roads-and-restrictions, recent-changes say still banned; ownership/touring-and-road-knowledge confirms reopening | Site is right; fix the folder before reuse. |
| 19 | (n/a) | history/bajaj.md: warranty 2 yr / 30,000 km; ownership/finance-warranty-insurance.md: NOT FOUND | Internal conflict; low confidence. |

### C. Folder confirms the site

Fuel prices (octane 165, petrol 160, from 20/21 Sep 2026), BRTA slabs (2,000 / 3,000; EV split at 5 kW), helmet and pillion penalties (s.92(1)), the 375cc rule, insurance not mandatory, mileage ranges. Service intervals, costs and parts prices cannot be confirmed (the folder found nothing), which matches `/method` calling them editorial estimates.

## 3. Ranked use cases

| Rank | Use case | Feeds from | Where | Value | Effort | Risk |
|---|---|---|---|---|---|---|
| 1 | Correct bikes.json and guide.json (2A, 2B #14-16) | current-models/{bajaj,suzuki,yamaha,hero,honda,ktm}, rules/penalties-table, ownership/duty-tax | `bikes.json`, `guide.json` (+ BN), price audit | Trust | S | Low; re-fetch each figure at source first. |
| 2 | Bangla rules-and-fines pages (fines, speed limits, helmet law, licence steps and fees, accident steps, police-stop rights, Dhaka AI-camera e-fines and fake-SMS warning) | rules/* (+ road-transport-act-2018 for section numbers) | `/guide/<slug>` + `/bn/guide/<slug>`, or new `guide.json` sections | High; long-tail SEO BikeBD covers badly (হেলমেট জরিমানা, ট্যাক্স টোকেন, মালিকানা বদলী) | M | Low on facts. Fix Padma first; mark the 2024 amendment "cabinet-approved, not enacted"; don't present draft policy as law; add "not legal advice" and as-of date. |
| 3 | Fill /guide gaps without new routes: speed limits, phone-while-riding (s.92(2)), 12-point demerit system, accident duty (s.62/95, 999), police-stop rights, RFID/front-plate news, Dhaka-Ctg auto-fines | same | `guide.json` `laws[]` (+ BN) | High, cheap | S | Low. |
| 4 | Used-bike checklist additions: online transfer at bsp.brta.gov.bd with seller biometric, same day (BRTA, 1 Sep 2026); late-fine waiver until 29 Oct 2026 (time-boxed); VIN prefixes (ME1 India Yamaha, MD2 Bajaj, MD6 TVS, ME4 Honda India, MBL Hero); FZS V2/V3/V4 visual tells | ownership/used-bike-buying-guide, variants/* | `guide.json` `usedChecklist` | Medium-high | S | Medium; generation facts partly India-derived. |
| 5 | Missing mass-market models: FZS V2 DD ৳2,34,000; Gixxer carb DD ৳2,37,950 and Classic Matt ৳2,05,950; Discover 110 ৳1,49,600; Platina 110 H ৳1,40,100 (official); then Hero Passion Xpro / Xtreme 160R 4V / Pleasure, TVS Max 125 / Metro, Runner Turbo 125, Honda SP160 SD / Shine 100 DX | current-models/* | `bikes.json` | Medium-high | M | Only Bajaj/Suzuki have official sources; skip Keeway/Benelli/Kawasaki. |
| 6 | Market snapshot: brand shares, TVS sales −80% in 2025, Japanese brands rising, no model-level sales data | market/00-market-overview, 10-top-sellers | `/method` or `/about`; possibly resale/parts scores for TVS | Medium | S | Cite both reports where they disagree. |
| 7 | EV explainer and candidate list (EV imports 2,446 → 10,053 vs 261 registered; pedal e-bikes exempt; VAT 5% to 2030; Runner as Yadea agent; Walton Takyon) | ownership/ev-rules-and-market, history/electric, duty file | `/guide` section; leads for `bikes.json` | Medium | M | High staleness; leads only. |
| 8 | Brand history blurbs and used-only legend pages (RX100, CG125, CBZ, H100S) | history/*, industry/importers | BikeDetail; the 4 used-only pages | Low-medium | S-M | Keep to dated company facts (BHL 2013, ACI 2016, Rancon 2012, Niloy 2014). |
| 9 | Ownership/cost anchors: parts sanity check, ride-share income (৳30-50k/month), fuel price history Jan 2024 → Sep 2026 (+36%) | ownership/* | `/cost`, `/changes` | Low-medium | S | Stale except the fuel table. |
| 10 | Dealer and distributor facts (hotlines: Suzuki 16638, Yamaha 16533) | current-models headers, industry | `dealers.json` | Low | S | Low. |
| 11 | Matcher inputs | market, rules | `src/lib/match.ts` | Low | S | Don't encode draft policy. |
| 12 | FAQ structured data | rules/* | JSON-LD | Low (Google limited FAQ rich results in 2023) | S | Do the content, skip the markup. |

**Do not use:** Keeway, Benelli, Kawasaki and KTM "upcoming" tables; empty Walton rows; 2015-2019 duty fragments; the "Tk 518 tax token" item; Indian warranty figures.

## 4. Before reusing any of it

1. Fix the Padma Bridge rows in `rules/00-overview.md`, `rules/roads-and-restrictions.md`, `rules/recent-changes-and-news.md`.
2. Every number is a lead: re-fetch from its cited URL on the day you publish, and record `asOf` and source in the JSON.
3. Prefer official URLs (bajajauto.com/en-bd, api-v2.suzuki.com.bd, yamahabd.com, bdhonda.com, royalenfield.com/bd) over BikeBD.

## 5. Top 5

1. **Correction pass now (S):** Honda Dio, KTM RC 125, Pulsar N250/F250, five Yamaha prices (`npm run audit:prices`); Discover 125 tank, CT100 specs, Ray ZR torque, Hunk 150R weight; s.84 penalty; TIN >150cc vs PSR >165cc.
2. **Extend `guide.json` `laws` (S):** speed limits, phone use, demerit points, accident duty, police-stop rights. EN+BN, no new routes.
3. **Bangla rules-and-fines pages (M)** from `rules/penalties-table.md` and siblings, after the Padma fix.
4. **Cheap volume bikes (M):** FZS V2 DD, Gixxer carb DD and Classic Matt, Discover 110, Platina 110 H first (official sources).
5. **Used-bike checklist update (S):** online transfer with seller biometric, VIN prefixes, FZS/Gixxer generation tells. Plus a short market snapshot on `/method` or `/about`.
