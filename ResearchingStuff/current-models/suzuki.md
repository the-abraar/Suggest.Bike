# Suzuki (Bangladesh) - current models

Distributor/assembler: Rancon Motor Bikes Ltd (RMBL) per footer of [suzuki.com.bd](https://suzuki.com.bd/) (accessed 2026-10-13). Hotline 16638 (same page).

Primary source: Suzuki Bangladesh's own site data API ([products list](https://api-v2.suzuki.com.bd/api/user/products), [per-model e.g. gixxer-sf](https://api-v2.suzuki.com.bd/api/user/products/slug/gixxer-sf), all fetched 2026-10-13). Price = `variant.price` of the default colour variant shown on suzuki.com.bd at fetch time. The API exposes ONE default variant per model; other colours/variants may differ. Official site publishes no top speed, no real-world mileage, no warranty text on the product pages.

## Official fact table

| Model | Price BDT (suzuki.com.bd 2026-10-13) | Fuel | Brakes (site) | cc | Power / Torque | Official mileage claim (km/L) | Tyres F/R | Seat mm | Kerb kg | Tank L | Ground clr mm | Gearbox | Colours (count) | Stock flag | Source |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| GIXXER MONOTONE | 199,950 | Carburetor | Single Disc | 154.9 | 14.8ps@8000rpm / 14Nm@6000rpm | - | 100/80-17-Tubeless / 140/60-17-Radial Tubeless | 780 | 135 | 12 | 160 | 5-Speed, MT | 7 | stockRemaining=2 | [api](https://api-v2.suzuki.com.bd/api/user/products/slug/gixxer-monotone) |
| GIXXER CLASSIC MATT | 205,950 | Carburetor | Single Disc | 154.9 | - / - | - | - / - | - | - | - | - | - | 2 | stockRemaining=14 | [api](https://api-v2.suzuki.com.bd/api/user/products/slug/gixxer-classic-matt) |
| GIXXER | 237,950 | Carburetor | Double Disc | 155 | 13.6ps@8000rpm / 13.8 Nm@6000rpm | 64 | 100/80-17-Tubeless / 140/60R-17-Radial Tubeless | 795 | 141 | 12 | 160 | 5 speed, MT | 3 | stockRemaining=7 | [api](https://api-v2.suzuki.com.bd/api/user/products/slug/gixxer) |
| GIXXER SF | 332,950 | Fuel Injection | Double Disc – Abs | 155 | 13.6ps@8000rpm / 13.8 Nm@6000rpm | 64 | 100/80-17-Tubeless / 140/60R-17-Radial Tubeless | 795 | 148 | 12 | 165 | 5 speed, MT | 4 | stockRemaining=0 | [api](https://api-v2.suzuki.com.bd/api/user/products/slug/gixxer-sf) |
| GIXXER 250 | 379,950 | Fuel Injection | Dual Channel Abs | 249 | 26.5ps@9300rpm / 22.2Nm@7300rpm | 36+ | 110/70R17M/C 54S / 150/60R17M/C 66S | 800 mm | 156 kg | 12 L | 165 mm | 6 Speed, MT | 4 | stockRemaining=17 | [api](https://api-v2.suzuki.com.bd/api/user/products/slug/gixxer-250) |
| GIXXER SF 250 | 429,950 | Fuel Injection | Dual Channel Abs | 249 | 26.5ps@9300rpm / 22.2Nm@7300rpm | 38 | - / - | 800 mm | 161 kg | 12 L | 165 mm | 6 Speed, MT | 5 | stockRemaining=12 | [api](https://api-v2.suzuki.com.bd/api/user/products/slug/gixxer-sf-250) |
| GSX-R150 | 529,950 | Fuel Injection | Dual Channel Abs | 147.3 | 19.2ps@10500rpm / 14.0 Nm@9000rpm | 45 | 90/80-17M/C Tubeless / 130/70-17M/C Tubeless | - | 131 | 11 | 160 | 6-Speed, return | 2 | stockRemaining=13 | [api](https://api-v2.suzuki.com.bd/api/user/products/slug/gsx-r150) |
| GSX 125 | 141,950 | Carburetor | Single Disc | 125 | 10.45ps@9000rpm / 9.2 Nm@7000rpm | 60 | 2.75/18 Tubeless / 90/90/18 Tubeless | - | 126 | 14.2 | 167 | 5-Speed, Constant Mesh | 3 | stockRemaining=18 | [api](https://api-v2.suzuki.com.bd/api/user/products/slug/gsx-125) |
| ACCESS 125 | 214,950 | Fuel Injection | Single Disc | 124 | 8.7 ps @6,750 rpm / 10.2Nm@5,000rpm | - | 90/90-12 Tubeless / 90/100-10 Tubeless | 773 | 102 | 5 | 160 | CVT | 3 | stockRemaining=2 | [api](https://api-v2.suzuki.com.bd/api/user/products/slug/access-125) |
| HAYATE EP | 121,950 | Carburetor | Drum | 110 | - / - | 85 | - / - | - | - | - | - | - | 4 | stockRemaining=12 | [api](https://api-v2.suzuki.com.bd/api/user/products/slug/hayate-ep) |

### Internal inconsistencies on Suzuki's own pages (flag, do not resolve by guessing)
- Gixxer (carb, double disc) page: highlight says 14.1 PS but the spec table says 13.6 ps @ 8000 rpm; fuel system field reads "Fuel Injection / Carburetor" while the variant attribute says Carburetor. Front brake text says "Disc/ABS" while variant brake says "Double Disc" (no ABS). [source](https://api-v2.suzuki.com.bd/api/user/products/slug/gixxer) (2026-10-13)
- Gixxer SF page: page says 'All-New Gixxer SF 155'; spec 13.6 ps / 13.8 Nm, kerb 148 kg, FI, ABS on disc variant is described as 'Single Channel ABS' (key-info text) while the variant label reads 'Double Disc - ABS'. Claimed 64 km/L is a lab-style figure; owner reports below are ~40-45. [source](https://api-v2.suzuki.com.bd/api/user/products/slug/gixxer-sf) (2026-10-13)
- Gixxer Monotone: 14.8 ps / 14 Nm, 154.9 cc, kerb 135 kg, rear brake listed as Drum; Gixxer Classic Matt page has only highlights (154.9 cc, 14.8 PS), no table. [monotone](https://api-v2.suzuki.com.bd/api/user/products/slug/gixxer-monotone), [classic-matt](https://api-v2.suzuki.com.bd/api/user/products/slug/gixxer-classic-matt) (2026-10-13)
- Gixxer SF 250: the BRAKE block holds the tyre sizes and no brake sizes (data-entry error on the site).
- Stock flag `stockRemaining=0` on the Gixxer SF default colour at fetch time = default colour out of stock on the website, not discontinuation.

## Launch history, prices at launch (official news)
- 'Gixxer Fi Disc series' launch news lists retail prices: Carb Disc 224,950; Fi-Disc 236,950; Fi ABS 266,950; SF Fi-Disc 297,950; SF Fi ABS 322,950 BDT. Page text says 'presented on 30th July (Sunday)' without a year while the page date shows March 30, 2024: conflicting, year UNVERIFIED. [source](https://suzuki.com.bd/news/suzuki-bangladesh-has-launched-new-suzuki-gixxer-fi-disc-series-fggdi15em) (2026-10-13)
- Price drift today vs that launch list: Gixxer SF FI ABS 322,950 -> 332,950 (+10,000); Gixxer carb double disc 224,950 -> 237,950 (+13,000) (compare table above with the launch news). Computed from the two cited pages.

## Market context
- Suzuki was #1 brand by calendar-2025 units in Daily Star's report: 93,838 units, 20.1% share. [Daily Star, 16 Jan 2026](https://www.thedailystar.net/news/japanese-brands-take-the-lead-motorcycle-market-recovers-4082151) (2026-10-13). TBS's differently-dated count gives Suzuki 19.08% instead. [TBS](https://www.tbsnews.net/node/1479086) (2026-10-13). 2024 share 19.3%, +8% growth. [Daily Star 18 Jan 2025](https://www.thedailystar.net/business/economy/news/motorcycle-sales-hit-six-year-low-3802466) (2026-10-13). No model split by Suzuki published; Gixxer family is widely named a best seller but no unit figure was found.

## Owner reports (Bangladesh)
- Gixxer SF FI 155, ~2,000 km Dhaka owner: mileage ~40-45 km/L; praises low/mid torque; cons: 795 mm seat tall for short riders, headlight, seat comfort; top speed reports 107 and 127 km/h (two owners). [bikebd ownership review](https://www.bikebd.com/blog/suzuki-gixxer-sf-ownership-review), [2000 km review](https://bikebd.com/blog/suzuki-gixxer-sf-fi-155cc-2000km-ride-review) (2026-10-13, via search summary; owner blogs on an aggregator, self-selected).
- Not found: long-term reliability data, warranty duration (Suzuki's site only links a 'Warranty Policy' page; not read).

## Price cross-check from aggregator (bikebd.com/bike-price-in-bd, 2026-10-13)
Gixxer Monotone 205,950; Gixxer Carb Disc 237,950; Gixxer FI Disc 251,950; New Gixxer Fi ABS 282,950; Gixxer SF FI Disc 319,950; New Gixxer SF Fi ABS 332,950; GSX-R150 ABS 529,950; Gixxer 250 379,950; Gixxer SF 250 429,950; V-Strom SX 250 449,950; GSX 125 141,950; Hayate EP 121,950; Access 125 FI CBS 214,950. [bikebd listing](https://www.bikebd.com/bike-price-in-bd). Official site shows Gixxer Monotone at 199,950 and Classic Matt 205,950: the aggregator's Monotone figure (205,950) is therefore stale/mismatched; V-Strom SX 250 is on the aggregator but not on the official 10-model list fetched.

## Not covered / unverified
CBU vs CKD status (bikebd lists Suzuki Gixxer SF as assembled/made 'N/A'; Suzuki site says RMBL, Dhaka-area assembly not confirmed on pages read), Burgman, top speed, launch year of each model, warranty length.

## Sources
- https://suzuki.com.bd/ , https://api-v2.suzuki.com.bd/api/user/products (accessed 2026-10-13)
- https://www.thedailystar.net/news/japanese-brands-take-the-lead-motorcycle-market-recovers-4082151
- https://www.tbsnews.net/node/1479086
- https://bikebd.com/blog/suzuki-gixxer-sf-fi-155cc-2000km-ride-review