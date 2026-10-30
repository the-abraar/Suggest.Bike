# Data sources

Where every number on Suggest.Bike comes from. Generated from `src/data/*.json` by `node scripts/sources.mjs` — edit the data, not this file.

**Confidence key:** specs and prices are sourced; real-world mileage ranges, the 1–10 ownership scores, parts prices and service costs are *editorial estimates* informed by the sources below and owner reports.

**Price refresh:** on the 1st of each month `.github/workflows/price-refresh.yml` re-reads the official Bangladesh distributor pages (Bajaj, Honda, Suzuki, Hero, Royal Enfield, Walton, Yamaha) and opens a PR with the changes. Every other price (TVS, Runner, the Chinese brands, used-only bikes, and official pages that load prices in the browser) is on the owner's monthly checklist in that PR. See `docs/price-refresh.md`.

## Bike data — by website

| Site | References |
| --- | ---: |
| bikebd.com | 215 |
| bikroy.com | 88 |
| bajajauto.com | 37 |
| bdhonda.com | 33 |
| suzuki.com.bd | 25 |
| heromotocorp.com | 23 |
| yamahabd.com | 21 |
| library.ymcapps.net | 13 |
| royalenfield.com | 12 |
| motorcyclevalley.com | 11 |
| waltonbd.com | 9 |
| motorcyclebd.com | 8 |
| cdn.bajajauto.com | 6 |
| motorcycle.com.bd | 6 |
| tbsnews.net | 6 |
| motorcycles.runnerautomobiles.com | 6 |
| tvsmotor.com | 5 |
| en.ittefaq.com.bd | 4 |
| bikewale.com | 3 |
| dhakatribune.com | 3 |
| rokomari.com | 3 |
| bongshal.com | 3 |
| bikepartsbd.com | 3 |
| banglarbike.com | 3 |
| mrp.com.bd | 2 |
| deshibiker.com | 2 |
| bikestall.com | 2 |
| motorcyclefair.com | 2 |
| thedailystar.net | 2 |
| banglamotor.net | 1 |
| motobikebd.com | 1 |
| online91.thedailystar.net | 1 |
| suzukicycles.org | 1 |
| suzukimotorcycle.co.in | 1 |
| amarujala.com | 1 |
| bdbiker.com | 1 |
| waltondigitech.com | 1 |
| bikebros.co.jp | 1 |
| observerbd.com | 1 |
| en.wikipedia.org | 1 |

**Primary price source** (the `priceSource` of each bike): bikebd.com 38 (36%), bikroy.com 14 (13%), yamahabd.com 12 (11%), bajajauto.com 10 (9%), bdhonda.com 10 (9%), suzuki.com.bd 8 (7%), heromotocorp.com 5 (5%), royalenfield.com 4 (4%), motorcycles.runnerautomobiles.com 3 (3%), waltonbd.com 3 (3%).

## Bike data — per bike

### Aprilia

- **SXR 160** — ৳4,38,000 as of 2026-10
  - Price: https://bikebd.com/price/aprilia-sxr-160
  - https://bikebd.com/brand/aprilia
  - https://bdbiker.com/price/aprilia-sxr-160-fi-abs

### Bajaj

- **Platina 100** (ES) — ৳1,34,350 as of 2026-10
  - Price: https://www.bajajauto.com/en-bd/bikes/platina-100-es
  - https://www.bikebd.com/price/bajaj-platina-es
  - https://www.bikebd.com/brand/bajaj
  - https://bajajauto.com/en-bd/blogs/blog-bajaj-bike-price-in-bangladesh
  - https://cdn.bajajauto.com/-/media/assets/bajajauto/customer-service/owners-manual/owners-manual-pdf/om-for-website/platina_100-110_om.pdf
- **Platina 110 H** — ৳1,40,100 as of 2026-10
  - Price: https://www.bajajauto.com/en-bd/bikes/platina-110-h
  - https://bikebd.com/price/bajaj-platina-110cc-price-in-bangladesh
  - https://www.bajajauto.com/pdf/platina.pdf
- **CT 100** (ES) — ৳1,20,100 as of 2026-10
  - Price: https://www.bajajauto.com/en-bd/bikes/ct-100-es
  - https://www.bikebd.com/price/bajaj-ct-100-price-in-bangladesh
  - https://www.bikebd.com/brand/bajaj
  - https://www.banglamotor.net/bajaj-ct100-es.html
  - https://cdn.bajajauto.com/pdf/owners-manul-CT%20100%20-110-BSVI-New.pdf
  - Photo: Cherubino, CC BY-SA 3.0 — https://commons.wikimedia.org/wiki/File:Bajaj_CT100.JPG
- **Discover 125** (Disc) — ৳1,62,000 as of 2026-10
  - Price: https://www.bajajauto.com/en-bd/bikes/discover-125-disc
  - https://www.bikebd.com/price/discover-125-price-in-bangladesh
  - https://bajajauto.com/en-bd/blogs/blog-bajaj-bike-price-in-bangladesh
  - https://www.bajajauto.com/en-bd/-/media/globalbajajauto/common-media/owners-manual/discover/110.pdf
  - Used asking prices (2026-10): ~1 yr ৳1,40,000, ~3 yr ৳1,25,000 — https://bikroy.com/bn/motorcycles-and-scooters/bajaj-discover-125, https://bikroy.com/bn/motorcycles-and-scooters/bajaj-discover-125-2025, https://bikroy.com/bn/motorcycles-and-scooters/bajaj-discover-125-2023
- **Discover 110** (Disc) — ৳1,49,600 as of 2026-10
  - Price: https://www.bajajauto.com/en-bd/bikes/discover-110-disc
  - https://www.bikebd.com/price/bajaj-discover-110-disc
  - https://www.bikebd.com/price/bajaj-discover-110-disc/specifications
  - https://www.bajajauto.com/en-bd/-/media/globalbajajauto/common-media/owners-manual/discover/110.pdf
- **Pulsar NS125** — ৳1,69,850 as of 2026-10
  - Price: https://www.bajajauto.com/en-bd/bikes/pulsar-ns125
  - https://www.bikebd.com/price/bajaj-pulsar-ns-125
  - https://bajajauto.com/en-bd/blogs/blog-bajaj-bike-price-in-bangladesh
  - https://www.bajajauto.com/en-bd/blogs/pulsar-ns125-built-for-busy-bangladesh-streets
  - https://www.motorcycle.com.bd/bajaj-pulsar-ns125/
  - https://www.motorcyclebd.com/specs/bajaj-pulsar-ns125/
  - https://cdn.bajajauto.com/-/media/assets/bajajauto/customer-service/owners-manual/owners-manual-pdf/owner-manual-pdf-2026/pulsar-ns125.pdf
  - Used asking prices (2026-10): ~1 yr ৳1,50,000, ~3 yr ৳1,40,000 — https://bikroy.com/bn/motorcycles-and-scooters/bajaj-pulsar-ns125
  - Photo: Kolomoiskii, CC0 — https://commons.wikimedia.org/wiki/File:Bajaj_pulsar_NS_125.jpg
- **Pulsar 150** (Single Disc) — ৳2,05,200 as of 2026-10
  - Price: https://www.bajajauto.com/en-bd/bikes/pulsar-150-sd
  - https://www.bikebd.com/price/pulsar-150-price-in-bangladesh
  - https://bajajauto.com/en-bd/blogs/blog-bajaj-bike-price-in-bangladesh
  - https://www.bajajauto.com/en-bd/-/media/globalbajajauto/common-media/owners-manual/pulsar/150-td.pdf
  - Used asking prices (2026-10): ~1 yr ৳1,70,000, ~3 yr ৳1,50,000 — https://bikroy.com/bn/motorcycles-and-scooters/bajaj-pulsar-150, https://bikroy.com/bn/motorcycles-and-scooters/bajaj-pulsar-150-2025, https://bikroy.com/bn/motorcycles-and-scooters/bajaj-pulsar-150-2023
  - Photo: CAPTAIN RAJU, CC0 — https://commons.wikimedia.org/wiki/File:Bajaj_Pulsar_150_motorcycle_with_a_cat_sitting_on_the_seat_in_2025.02.jpg
- **Pulsar N160** (Fi ABS (Dual Channel)) — ৳2,73,600 as of 2026-10
  - Price: https://www.bajajauto.com/en-bd/bikes/pulsar-n160-dc-abs
  - https://www.bikebd.com/price/new-bajaj-pulsar-n160
  - https://www.bajajauto.com/en-bd/blogs/blog-pulsar-n160-price
  - https://www.bikebd.com/brand/bajaj
  - https://www.bajajauto.com/en-bd/bikes/pulsar-n160
  - https://www.bajajauto.com/en-bd/bikes/pulsar-n160-single-seat
  - https://www.bajajauto.com/en-bd/bikes/pulsar-n160-td
  - https://cdn.bajajauto.com/-/media/assets/bajajauto/customer-service/owners-manual/owners-manual-pdf/owner-manual-pdf-2026/pulsar-n160_twin_disc.pdf
  - Used asking prices (2026-10): ~1 yr ৳2,25,000, ~3 yr ৳2,10,000 — https://bikroy.com/bn/motorcycles-and-scooters/bajaj-pulsar-n160
- **Pulsar NS160** (FI ABS) — ৳1,20,000 as of 2026-10 (used market)
  - Price: https://bikroy.com/bn/motorcycles-and-scooters/bajaj-pulsar-ns-160
  - https://bikebd.com/price/bajaj-pulsar-ns160-fi-abs
  - https://www.bikebd.com/info/bajaj-pulsar-ns160-bike-price-in-bd
  - Used asking prices (2026-10): ~1 yr ৳1,95,000, ~3 yr ৳1,30,000 — https://bikroy.com/bn/motorcycles-and-scooters/bajaj-pulsar-ns-160
- **Avenger Street 160** (ABS) — ৳2,74,000 as of 2026-09
  - Price: https://www.bikebd.com/price/bajaj-avenger-160-abs
  - https://bajajauto.com/en-bd/blogs/blog-bajaj-bike-price-in-bangladesh
  - https://cdn.bajajauto.com/-/media/assets/bajajauto/customer-service/owners-manual/owners-manual-pdf/owner-manual-pdf-2026/avenger-160_pd39.pdf
- **Pulsar N250** — ৳3,60,000 as of 2026-10
  - Price: https://www.bajajauto.com/en-bd/bikes/pulsar-n250
  - https://www.bikebd.com/price/bajaj-pulsar-n250
  - https://bajajauto.com/en-bd/blogs/blog-bajaj-bike-price-in-bangladesh
  - https://cdn.bajajauto.com/-/media/assets/bajajauto/customer-service/owners-manual/owners-manual-pdf/owner-manual-pdf-2026/pulsar-n250.pdf
  - https://www.bajajauto.com/en-bd/-/media/globalbajajauto/common-media/owners-manual/pulsar/250.pdf
  - Used asking prices (2026-10): ~1 yr ৳2,85,000, ~3 yr — — https://bikroy.com/bn/motorcycles-and-scooters/bajaj-pulsar-n250
- **Pulsar F250** — ৳3,45,100 as of 2026-10
  - Price: https://www.bajajauto.com/en-bd/bikes/pulsar-f250
  - https://www.bikebd.com/price/bajaj-pulsar-f250-abs-2024
  - https://www.bikebd.com/price/pulsar-f250
  - https://www.bikebd.com/brand/bajaj
  - https://mrp.com.bd/product/bajaj-pulsar-f250/
  - https://deshibiker.com/baja-pulsar-f250/
  - https://www.bajajauto.com/en-bd/-/media/globalbajajauto/common-media/owners-manual/pulsar/250.pdf
  - Used asking prices (2026-10): ~1 yr ৳3,00,000, ~3 yr — — https://bikroy.com/bn/motorcycles-and-scooters/bajaj-pulsar-f250
- **CT100 (old, 2000s-2010s)** — ৳38,000 as of 2026-10 (used market)
  - Price: https://bikroy.com/bn/motorcycles-and-scooters/bajaj-ct-100
  - https://www.bikebd.com/price/bajaj-ct-100
- **Boxer** (Boxer 100 (BM100) incl. bazaar/clone assembled) — ৳35,000 as of 2026-10 (used market)
  - Price: https://bikroy.com/bn/motorcycles-and-scooters/bajaj-boxer-100
  - https://bikebd.com/price/bajaj-kawasaki-boxer-100/specifications
  - https://bikebd.com/price/bajaj-kawasaki-boxer-100/faq
- **Discover 135** — ৳80,000 as of 2026-10 (used market)
  - Price: https://bikroy.com/bn/motorcycles-and-scooters/bajaj-discover-135
  - https://bikebd.com/price/bajaj-discover-135
  - https://bikebd.com/blog/legendary-discontinued-motorcycles-of-bangladesh
- **Pulsar 135 LS** — ৳48,000 as of 2026-10 (used market)
  - Price: https://bikroy.com/bn/motorcycles-and-scooters/bajaj-pulsar-135-ls
  - https://bikebd.com/price/bajaj-pulsar-135/specifications

### GPX

- **Demon GR165R** — ৳3,14,999 as of 2026-10
  - Price: https://bikebd.com/price/gpx-demon-gr165r
  - https://bikebd.com/brand/gpx
  - https://www.motorcyclevalley.com/overview/gpx-demon-gr165r/
  - https://mrp.com.bd/product/gpx-demon-gr165r/
- **Demon GR165RR** — ৳3,70,000 as of 2026-10
  - Price: https://bikebd.com/price/gpx-demon-gr165rr
  - https://bikebd.com/brand/gpx
  - https://www.motorcyclebd.com/gpx-demon-gr165rr/
  - https://www.motorcyclevalley.com/overview/gpx-demon-gr165rr/

### Haojue

- **DR160** — ৳1,99,500 as of 2026-10
  - Price: https://bikebd.com/price/haojue-dr160
  - https://bikebd.com/blog/haojue-dr-160-8000km-user-review
  - https://bikebd.com/brand/haojue
- **KA135** — ৳1,22,000 as of 2026-10
  - Price: https://www.bikebd.com/price/haojue-ka
  - https://www.bikebd.com/price/haojue-ka/specifications
- **TR150** — ৳1,44,000 as of 2026-10
  - Price: https://www.bikebd.com/price/haojue-tr
  - https://www.bikebd.com/price/haojue-tr/specifications

### Hero

- **Splendor+** — ৳1,25,000 as of 2026-10
  - Price: https://www.heromotocorp.com/en-bd/products/commuter/splendor-plus.html
  - https://www.bikebd.com/price/hero-splendor-plus
  - https://www.heromotocorp.com/en-bd/the-bike/passion-xpro-xtec-110cc-motorcycle-91.html
  - https://www.heromotocorp.com/content/dam/hero-aem-website/bd/en-bd/owners-manual-pdf/spleplusxtec.pdf
  - Photo: Sonachalam 2k Ramalingame, CC BY-SA 4.0 — https://commons.wikimedia.org/wiki/File:Hero_Splendor_Plus_i3s_All_Black_Edition_and_IBS_2023_model_Non-_Xtec_PGM_FI_Model.png
- **HF Deluxe** (Tubeless) — ৳1,15,500 as of 2026-10
  - Price: https://www.heromotocorp.com/en-bd/products/commuter/hf-deluxe-price-in-bangladesh.html
  - https://www.bikebd.com/price/hero-hf-deluxe-price-in-bangladesh
  - https://www.heromotocorp.com/en-bd/the-bike/passion-xpro-xtec-110cc-motorcycle-91.html
  - https://www.heromotocorp.com/content/dam/hero-aem-website/bd/en-bd/owners-manual-pdf/hf-deluxe-new-om.pdf
- **Glamour X 125** — ৳1,67,000 as of 2026-10
  - Price: https://www.heromotocorp.com/en-bd/products/executive/glamour-x-price-in-bangladesh.html
  - https://www.bikebd.com/price/hero-glamour-x-125
  - https://www.dhakatribune.com/business/403965/hero-bangladesh-unveils-glamour-x-125-motorcycle
  - https://www.heromotocorp.com/content/dam/hero-aem-website/bd/en-bd/owners-manual-pdf/Glamour-x.pdf
- **Xtreme 125R** (Single Channel ABS) — ৳1,75,000 as of 2026-09
  - Price: https://www.bikebd.com/price/hero-xtreme-125r
  - https://www.heromotocorp.com/en-bd/the-bike/passion-xpro-xtec-110cc-motorcycle-91.html
  - https://www.heromotocorp.com/content/dam/hero-aem-website/in/service-owner-manual/24_xtreme_125r_feb_2024.pdf
  - Used asking prices (2026-10): ~1 yr ৳1,55,000, ~3 yr — — https://bikroy.com/bn/motorcycles-and-scooters/hero-xtreme-125r
- **Hunk 150R** (Dual Disc ABS) — ৳2,10,000 as of 2026-10
  - Price: https://www.heromotocorp.com/en-bd/products/premium/hunk-150r-price-in-bangladesh.html
  - https://www.bikebd.com/price/hero-hunk-150-price-in-bangladesh
  - https://www.bikebd.com/price/hero-hunk-150r-xtec
  - https://www.heromotocorp.com/content/dam/hero-aem-website/bd/en-bd/owners-manual-pdf/hunk_150r_bangladesh_om.pdf
  - Used asking prices (2026-10): ~1 yr ৳1,75,000, ~3 yr ৳1,35,000 — https://bikroy.com/bn/motorcycles-and-scooters/hero-hunk-150r
- **Thriller 160R 4V** — ৳2,25,000 as of 2026-10
  - Price: https://www.heromotocorp.com/en-bd/products/premium/thriller-160r-4v-price-in-bangladesh.html
  - https://www.bikebd.com/price/hero-xtreme-160r-4v
  - https://www.heromotocorp.com/en-bd/products/premium/thriller-160r-4v.html
  - https://www.bikebd.com/price/hero-xtreme-160r
  - https://www.bikewale.com/hero-bikes/xtreme-160r-4v/reviews/1152746/
  - https://www.heromotocorp.com/content/dam/hero-aem-website/bd/en-bd/owners-manual-pdf/Thriller%20160R%204V_Owner's%20Manual.pdf
  - Used asking prices (2026-10): ~1 yr ৳1,80,000, ~3 yr — — https://bikroy.com/bn/motorcycles-and-scooters/hero-thriller-160r-4v
- **XPulse 200 4V** — ৳3,35,000 as of 2026-09
  - Price: https://www.bikebd.com/price/hero-xpulse-200-4v
  - https://www.heromotocorp.com/en-bd/the-bike/passion-xpro-xtec-110cc-motorcycle-91.html
  - https://www.heromotocorp.com/content/dam/hero-aem-website/bd/en-bd/owners-manual-pdf/Xpulse_200_4V_OM.pdf
  - Photo: MotorideSA, CC BY-SA 4.0 — https://commons.wikimedia.org/wiki/File:Hero_Xpulse_200_4V_Pro.jpg
- **Karizma XMR 210** — ৳4,25,000 as of 2026-09
  - Price: https://www.bikebd.com/price/hero-karizma-xmr-210
  - https://www.heromotocorp.com/en-bd/the-bike/passion-xpro-xtec-110cc-motorcycle-91.html
  - https://www.heromotocorp.com/content/dam/hero-aem-website/bd/en-bd/owners-manual-pdf/Karizma%20XMR_Owner's%20Manual.pdf
- **Xoom 125R** (Fi) — ৳2,15,000 as of 2026-09
  - Price: https://www.bikebd.com/price/hero-xoom-125r
  - https://www.bikebd.com/brand/hero
  - https://www.heromotocorp.com/en-bd/products/scooter/xoom-125r-fi-price-in-bangladesh.html
  - https://www.heromotocorp.com/content/dam/hero-aem-website/bd/en-bd/owners-manual-pdf/Xoom_125R%20FI.pdf
- **XPulse 200 4V Pro** — ৳3,65,000 as of 2026-10
  - Price: https://www.bikebd.com/price/hero-xpulse-200-4v-pro
  - https://bikebd.com/price/hero-xpulse-200-4v-pro/specifications
  - https://www.bikebd.com/blog/hero-xpulse-200-4v-and-xpulse-200-4v-pro-officially-launched-in-bangladesh
  - https://observerbd.com/news/589485
  - https://www.heromotocorp.com/content/dam/hero-aem-website/bd/en-bd/owners-manual-pdf/Xpulse_200_4V_OM.pdf

### Hero Honda

- **CBZ** — ৳45,000 as of 2026-10 (used market)
  - Price: https://bikroy.com/bn/motorcycles-and-scooters/hero-honda-cbz
  - https://www.bikebd.com/price/hero-honda-cbz
  - Photo: Sonachalam 2k Ramalingame, CC BY-SA 4.0 — https://commons.wikimedia.org/wiki/File:Hero_Honda_CBZ_1999_Blue1.jpg

### Honda

- **Shine 100** — ৳1,11,000 as of 2026-10
  - Price: https://www.bdhonda.com/products/shine100
  - https://www.bikebd.com/price/honda-shine-100
  - https://www.bikebd.com/price/honda-shine-100-dlx
  - https://bdhonda.com/media-center/pr-details/280
  - https://bdhonda.com/public/uploads/2026/09/6ab0b1ffebc7e_Shine100_2025.pdf
- **Dream 110** — ৳1,25,000 as of 2026-10
  - Price: https://www.bdhonda.com/products/dream110
  - https://www.bikebd.com/price/honda-dream-110-price-in-bangladesh
  - https://www.bdhonda.com/product/dream-110/index
- **Livo 110** (Disc CBS) — ৳1,45,000 as of 2026-10
  - Price: https://www.bdhonda.com/products/livo
  - https://www.bikebd.com/price/honda-livo-price-in-bd
  - https://www.bdhonda.com/product/livo/index
  - https://bdhonda.com/public/uploads/2026/09/6ab0b1d6af45c_Livo.pdf
  - Used asking prices (2026-10): ~1 yr —, ~3 yr ৳1,15,000 — https://bikroy.com/bn/motorcycles-and-scooters/honda-livo
- **SP125** (Disc) — ৳1,67,000 as of 2026-10
  - Price: https://www.bdhonda.com/products/sp125
  - https://www.bikebd.com/price/honda-sp125-dlx
  - https://www.bikebd.com/blog/honda-sp125-mileage-technology
  - https://www.dhakatribune.com/business/331429/honda-launches-its-first-bs-vi-motorcycle
  - https://bdhonda.com/public/uploads/2026/09/6ab0b156738a3_SP125_2026.pdf
  - Used asking prices (2026-10): ~1 yr ৳1,45,000, ~3 yr ৳1,35,000 — https://bikroy.com/bn/motorcycles-and-scooters/honda-sp-125
- **SP160** (Double Disc ABS) — ৳2,25,000 as of 2026-10
  - Price: https://www.bdhonda.com/products/sp160
  - https://www.bikebd.com/price/honda-sp160
  - https://www.bikebd.com/price/honda-sp160-single-disc
  - https://www.bikebd.com/blog/honda-sp-160-launched-in-bangladesh
  - https://www.motobikebd.com/bikes/honda-sp160
  - https://www.motorcyclevalley.com/overview/honda-sp-160/
  - https://bdhonda.com/public/uploads/2026/09/6ab0b1b8a4172_SP160.pdf
  - Used asking prices (2026-10): ~1 yr ৳1,90,000, ~3 yr — — https://bikroy.com/bn/motorcycles-and-scooters/honda-sp160
  - Photo: Ganesh Mohan T, CC BY-SA 4.0 — https://commons.wikimedia.org/wiki/File:Honda_SP160.jpg
- **X-Blade 160** (Fi ABS) — ৳2,40,000 as of 2026-10
  - Price: https://www.bdhonda.com/products/xblade
  - https://www.bikebd.com/price/honda-x-blade-160-fi-abs
  - https://www.bikebd.com/blog/honda-special-world-cup-discounts
  - https://bdhonda.com/media-center/pr-details/191
  - https://bdhonda.com/public/uploads/2026/09/6ab0b0e1d2cb0_XBLADE_FI.pdf
  - Used asking prices (2026-10): ~1 yr ৳2,10,000, ~3 yr ৳1,70,000 — https://bikroy.com/bn/motorcycles-and-scooters/honda-x-blade
- **Hornet 2.0** — ৳2,89,000 as of 2026-10
  - Price: https://www.bdhonda.com/products/hornet20
  - https://www.bikebd.com/price/honda-hornet-2-0
  - https://www.bikebd.com/blog/honda-special-world-cup-discounts
  - https://bikewale.com/honda-bikes/hornet/reviews/page/2
  - https://bdhonda.com/public/uploads/2026/09/6ab0b2cf2a019_HORNET_2.0.pdf
  - Used asking prices (2026-10): ~1 yr ৳2,40,000, ~3 yr — — https://bikroy.com/bn/motorcycles-and-scooters/honda-hornet-2-0, https://bikroy.com/bn/motorcycles-and-scooters/honda-hornet-2023
  - Photo: Birmallow, CC BY-SA 4.0 — https://commons.wikimedia.org/wiki/File:Honda_Hornet_2.0_Repsol_Edition.jpg
- **NX200** — ৳3,15,000 as of 2026-10
  - Price: https://bdhonda.com/media-center/pr-details/282
  - https://www.bikebd.com/price/honda-nx200
  - https://bikebd.com/blog/honda-nx200-officially-launched-in-bangladesh
  - https://bdhonda.com/public/uploads/2026/09/6ab0b23f05743_NX200.pdf
  - Photo: Ganesh Mohan T, CC BY-SA 4.0 — https://commons.wikimedia.org/wiki/File:Honda_CB200X_4.jpg
- **CBR150R** (ABS (Indonesian)) — ৳6,50,000 as of 2026-10
  - Price: https://www.bdhonda.com/products/cbr150r
  - https://www.bikebd.com/price/new-honda-cbr150r
  - https://bikebd.com/blog/2021-honda-cbr150-r-officially-launched
  - https://www.bdhonda.com/product/cbr-150r/index
  - Photo: Chanokchon, CC BY-SA 4.0 — https://commons.wikimedia.org/wiki/File:2021_Honda_CBR150R_ABS.jpg
- **Dio** (110) — ৳1,57,000 as of 2026-10
  - Price: https://www.bdhonda.com/products/dio
  - https://www.bikebd.com/price/honda-dio-price-in-bangladesh
  - https://www.bdhonda.com/product/dio/index
  - Used asking prices (2026-10): ~1 yr ৳1,75,000, ~3 yr ৳1,60,000 — https://bikroy.com/bn/motorcycles-and-scooters/honda-dio, https://bikroy.com/bn/motorcycles-and-scooters/honda-dio-2023
  - Photo: Ganesh Mohan T, CC BY-SA 4.0 — https://commons.wikimedia.org/wiki/File:Honda_Dio_2.jpg
- **CG125** — ৳50,000 as of 2026-10 (used market)
  - Price: https://bikroy.com/en/ads/c/bangladesh/motorbikes-scooters/used/honda/cg125
  - https://bikebd.com/price/honda-cg-125-2006
  - Photo: SEDJRO SETONDJI, CC BY-SA 4.0 — https://commons.wikimedia.org/wiki/File:Honda_CG125.jpg
- **Benly 125 (CD125T)** — ৳1,80,000 as of 2026-10 (used market)
  - Price: https://bikebd.com/price/honda-cd-125-t-benly-2002
  - https://www.bikebros.co.jp/bikesearch2/1/1010661/?newold=0
- **Rebel 250 (CMX250)** — ৳2,40,000 as of 2026-10 (used market)
  - Price: https://bikebd.com/price/honda-250-rebel-2010
  - https://bikebd.com/price/honda-rebel-250-2007
  - https://bikebd.com/price/honda-rebel-250
- **H100S Super CDI** (H100S (1985-92 two-stroke)) — ৳45,000 as of 2026-10 (used market)
  - Price: https://bikebd.com/price/h100s-super-cdi
  - https://bikebd.com/price/honda-h-100-s-1986
  - https://bikebd.com/blog/honda-h100s-cdi
- **CD80** — ৳40,000 as of 2026-10 (used market)
  - Price: https://bikroy.com/bn/motorcycles-and-scooters/honda-cd80
  - https://www.bikebd.com/price/honda-cd80
  - https://bikebd.com/blog/honda-cd80-best-80cc-bike-in-bangladesh
- **Super Cub** (C-series family (C50/C70/C90 step-throughs)) — ৳50,000 as of 2026-10 (used market)
  - Price: https://bikroy.com/bn/motorcycles-and-scooters/honda-super-cub
  - https://en.wikipedia.org/wiki/Honda_Super_Cub

### KTM

- **Duke 125** (Indian) — ৳3,00,000 as of 2026-10
  - Price: https://bikebd.com/price/ktm-duke-125-price-in-bd
  - https://bikebd.com/brand/ktm
  - https://www.tbsnews.net/node/191338
  - https://www.amarujala.com/automobiles/ktm-india-discontinues-125-duke-and-rc-125-in-indian-market-know-details-2025-04-02
  - Used asking prices (2026-10): ~1 yr —, ~3 yr ৳2,05,000 — https://bikroy.com/bn/motorcycles-and-scooters/ktm-duke-125
  - Photo: Corvettec6r, CC BY-SA 4.0 — https://commons.wikimedia.org/wiki/File:KTM_Duke_125.jpg
- **RC 125** — ৳4,43,000 as of 2026-10
  - Price: https://bikebd.com/price/ktm-rc-125-2022
  - https://bikebd.com/brand/ktm
  - https://www.tbsnews.net/node/191338
  - Photo: Debarshi Ray, CC BY-SA 2.0 — https://www.flickr.com/photos/39423133@N04/48792586571

### Lifan

- **KPR 165R** (EFI) — ৳2,28,000 as of 2026-10
  - Price: https://www.bikebd.com/price/lifan-kpr-165-price-in-bangladesh
  - https://bikebd.com/blog/lifan-kpr-165r-carb-2000km-user-review
  - https://bikebd.com/price/lifan-kpr-165r-carburetor
  - https://banglarbike.com/bike-brands/lifan/lifan-kpr-165r-efi/
- **KPT 150 4V** — ৳2,85,000 as of 2026-10
  - Price: https://bikebd.com/price/lifan-kpt150-4v
  - https://bikebd.com/price/lifan-kpt-150
  - https://banglarbike.com/bike-brands/lifan/lifan-kpt150-4v-price-in-bangladesh/
  - https://www.motorcyclebd.com/lifan-kpt-150-4v/
- **K19** — ৳2,95,000 as of 2026-10
  - Price: https://www.bikebd.com/price/lifan-k19
  - https://www.bikebd.com/price/lifan-k19/specifications
- **Glint 100** — ৳86,000 as of 2026-10
  - Price: https://www.bikebd.com/price/lifan-glint-100
  - https://www.bikebd.com/price/lifan-glint-100/specifications

### Revoo

- **C32-Y** — ৳1,34,900 as of 2026-10
  - Price: https://bikebd.com/price/revoo-c32-y/color
  - https://www.bikebd.com/ev/revoo-c32-y/specifications
  - https://www.bikebd.com/ev/revoo-c32-y
- **A12-S** — ৳1,05,900 as of 2026-10
  - Price: https://bikebd.com/price/revoo-a12-s/specifications
  - https://www.bikebd.com/ev/revoo-a12-s/specifications
  - https://www.thedailystar.net/tech-startup/news/revoo-a10-and-a12-electric-bikes-launched-bangladesh-3843171

### Royal Enfield

- **Hunter 350** (Metro Rebel (Dual Channel ABS)) — ৳3,71,500 as of 2026-10
  - Price: https://www.royalenfield.com/bd/en/motorcycles/hunter-350/
  - https://bikebd.com/price/royal-enfield-hunter-350-abs
  - https://bikebd.com/brand/royal-enfield
  - https://en.ittefaq.com.bd/9332/bangladesh-welcomes-royal-enfield
  - https://www.royalenfield.com/content/dam/open-pdf/royal-enfield-owners-manual-hunter-350_bsvi-english-2026.pdf
  - Used asking prices (2026-10): ~1 yr ৳3,40,000, ~3 yr — — https://bikroy.com/bn/motorcycles-and-scooters/royal-enfield-hunter-350
  - Photo: Pintu dasaundhi, CC BY-SA 4.0 — https://commons.wikimedia.org/wiki/File:Hunter_350_side_view_India_Model.png
- **Classic 350** — ৳4,47,700 as of 2026-10
  - Price: https://www.royalenfield.com/bd/en/motorcycles/classic-350/
  - https://bikebd.com/brand/royal-enfield
  - https://bikebd.com/price/royal-enfield-classic-350-halcon-greenblack
  - https://en.ittefaq.com.bd/9332/bangladesh-welcomes-royal-enfield
  - https://www.royalenfield.com/content/dam/open-pdf/royal-enfield-owners-manual-classic-350-BSVI-english.pdf
  - Used asking prices (2026-10): ~1 yr ৳3,75,000, ~3 yr — — https://bikroy.com/bn/motorcycles-and-scooters/royal-enfield-classic-350
  - Photo: Billyinthedarbies, CC BY-SA 4.0 — https://commons.wikimedia.org/wiki/File:2022Classic350.jpg
- **Bullet 350** — ৳4,17,500 as of 2026-10
  - Price: https://www.royalenfield.com/bd/en/motorcycles/bullet-350/
  - https://bikebd.com/price/royal-enfield-bullet-350
  - https://bikebd.com/brand/royal-enfield
  - https://en.ittefaq.com.bd/9332/bangladesh-welcomes-royal-enfield
  - https://www.royalenfield.com/content/dam/open-pdf/royal-enfield-bullet-350-dual-channel-owners-manual-india.pdf
  - Used asking prices (2026-10): ~1 yr ৳4,10,000, ~3 yr — — https://bikroy.com/bn/motorcycles-and-scooters/royal-enfield-bullet-350
  - Photo: kishjar? from Moscow, Russia (Flickr), CC BY 4.0 — https://commons.wikimedia.org/wiki/File:Royal_Enfield_Bullet_350_(54832566003).jpg
- **Meteor 350** — ৳4,76,000 as of 2026-10
  - Price: https://www.royalenfield.com/bd/en/motorcycles/meteor-350/
  - https://bikebd.com/brand/royal-enfield
  - https://bikebd.com/price/royal-enfield-meteor-350
  - https://en.ittefaq.com.bd/9332/bangladesh-welcomes-royal-enfield
  - https://www.royalenfield.com/content/dam/open-pdf/royal-enfield-owners-manual-meteor-english.pdf
  - Used asking prices (2026-10): ~1 yr ৳4,50,000, ~3 yr — — https://bikroy.com/bn/motorcycles-and-scooters/royal-enfield-meteor-350
  - Photo: UliBe43, CC0 — https://commons.wikimedia.org/wiki/File:Royal_Enfield_Meteor_2021-2.jpg

### Runner

- **Bullet 100 V2** — ৳1,09,000 as of 2026-10
  - Price: https://motorcycles.runnerautomobiles.com/shop/products/bullet-100cc-v2-white
  - https://bikebd.com/price/bullet-100-v2
  - https://bikebd.com/brand/runner
  - https://www.motorcycle.com.bd/runner-bullet-100-v2/
  - https://banglarbike.com/bike-brands/runner/runner-bullet-100-v2/
- **Knight Rider V2** — ৳1,67,000 as of 2026-10
  - Price: https://motorcycles.runnerautomobiles.com/shop/products/runner-knight-rider-150cc-v2-matte-red
  - https://bikebd.com/price/runner-knight-rider-v2
  - https://bikebd.com/brand/runner
  - https://www.bikestall.com/bike/runner-knight-rider-v2-price-in-bd
  - https://www.motorcyclefair.com/runner-knight-rider-v2/
- **Bolt 165R** — ৳1,69,000 as of 2026-10
  - Price: https://motorcycles.runnerautomobiles.com/shop/products/bolt165r-red-black
  - https://www.bikebd.com/price/runner-bolt-165r-price-in-bangladesh
  - https://www.bikebd.com/price/runner-bolt-165r-price-in-bangladesh/specifications
  - https://www.tbsnews.net/feature/wheels/runner-launches-bolt-165-r-124528
  - https://www.thedailystar.net/toggle/news/new-bike-week-1955401

### Suzuki

- **Hayate EP** — ৳1,21,950 as of 2026-10
  - Price: https://www.bikebd.com/price/suzuki-hayate-ep-price-in-bangladesh
  - https://www.suzuki.com.bd/
- **GSX 125** — ৳1,41,950 as of 2026-10
  - Price: https://www.bikebd.com/price/suzuki-gsx-125
  - https://www.bikebd.com/price/suzuki-gsx-125/specifications
  - https://www.suzuki.com.bd/news/launching-of-suzuki-gsx-125-the-all-rounder-bike-3dir82cf9
  - Used asking prices (2026-10): ~1 yr —, ~3 yr ৳80,000 — https://bikroy.com/bn/motorcycles-and-scooters/suzuki-gsx-125
- **Gixxer Monotone** (Monotone (carb)) — ৳1,99,950 as of 2026-10
  - Price: https://www.suzuki.com.bd/product/gixxer-monotone
  - https://www.suzuki.com.bd/
  - https://www.bikebd.com/price/gixxer-price-in-bd
  - https://www.bikebd.com/price/suzuki-gixxer-carb-disc
  - https://www.suzuki.com.bd/product/gixxer-classic-matt
  - Used asking prices (2026-10): ~1 yr ৳1,80,000, ~3 yr ৳1,60,000 — https://bikroy.com/bn/motorcycles-and-scooters/suzuki-gixxer-monotone, https://bikroy.com/bn/motorcycles-and-scooters/suzuki-gixxer-monotone-2025
  - Photo: XalD, CC BY-SA 4.0 — https://commons.wikimedia.org/wiki/File:Suzuki_Gixxer_negra.jpg
- **Gixxer Carb** (Carburettor, Double Disc) — ৳2,37,950 as of 2026-10
  - Price: https://www.suzuki.com.bd/
  - https://suzuki.com.bd/product/gixxer
  - https://www.bikebd.com/price/suzuki-gixxer-carb-disc
- **Gixxer FI ABS** (FI ABS) — ৳2,77,950 as of 2026-10
  - Price: https://suzuki.com.bd/product/gixxer
  - https://www.bikebd.com/price/suzuki-gixxer-abs-price-in-bangladesh
  - https://www.bikebd.com/price/suzuki-gixxer-fi-disc
  - https://www.suzuki.com.bd/
  - Used asking prices (2026-10): ~1 yr ৳2,50,000, ~3 yr ৳2,15,000 — https://bikroy.com/bn/motorcycles-and-scooters/suzuki-gixxer-fi-abs
  - Photo: NahidHossain, CC BY-SA 4.0 — https://commons.wikimedia.org/wiki/File:Suzuki_Gixxer_155cc_DD_black_edition.jpg
- **Gixxer SF** (FI ABS) — ৳3,32,950 as of 2026-10
  - Price: https://suzuki.com.bd/product/gixxer-sf
  - https://www.bikebd.com/price/suzuki-gixxer-sf-price-in-bangladesh
  - https://www.suzuki.com.bd/
  - Used asking prices (2026-10): ~1 yr ৳3,00,000, ~3 yr ৳2,65,000 — https://bikroy.com/bn/motorcycles-and-scooters/suzuki-gixxer-sf
- **Gixxer 250** — ৳3,79,950 as of 2026-10
  - Price: https://www.suzuki.com.bd/
  - https://www.bikebd.com/price/suzuki-gixxer-250
  - https://www.suzuki.com.bd/news/suzuki-bangladesh-unveils-motogp-inspired-fastest-250cc-bikes-the-suzuki-gixxer-250-and-gixxer-sf-250-qx80cbtw
  - https://www.rokomari.com/product/358551/suzuki-ecstar-r5000-10w-40-mineral-1-liter
  - https://bongshal.com/product/suzuki-ecstar-10w-40-4t-engine-oil
  - https://www.bikepartsbd.com/product/suzuki-gixxer-front-brake-pads/
  - Used asking prices (2026-10): ~1 yr ৳3,40,000, ~3 yr — — https://bikroy.com/bn/motorcycles-and-scooters/suzuki-gixxer-250
- **Gixxer SF 250** — ৳4,29,950 as of 2026-10
  - Price: https://www.suzuki.com.bd/
  - https://www.bikebd.com/price/suzuki-gixxer-sf-250
  - https://www.rokomari.com/product/358551/suzuki-ecstar-r5000-10w-40-mineral-1-liter
  - https://bongshal.com/product/suzuki-ecstar-10w-40-4t-engine-oil
  - https://www.bikepartsbd.com/product/suzuki-gixxer-front-brake-pads/
  - Used asking prices (2026-10): ~1 yr ৳3,55,000, ~3 yr — — https://bikroy.com/bn/motorcycles-and-scooters/suzuki-gixxer-sf-250
  - Photo: ShunyaIshiwatari, CC BY-SA 4.0 — https://commons.wikimedia.org/wiki/File:Suzuki_Gixxer_Sf250_%E3%83%88%E3%83%AA%E3%83%88%E3%83%B3%E3%83%96%E3%83%AB%E3%83%BC.jpg
- **V-Strom SX 250** — ৳4,49,950 as of 2026-10
  - Price: https://www.bikebd.com/price/suzuki-v-strom-sx
  - https://www.bikebd.com/price/suzuki-v-strom-sx/specifications
  - https://suzukicycles.org/V-Strom/V-Strom-250SX.shtml
  - https://www.motorcyclebd.com/suzuki-v-strom-sx-250/
  - https://www.rokomari.com/product/358551/suzuki-ecstar-r5000-10w-40-mineral-1-liter
  - https://bongshal.com/product/suzuki-ecstar-10w-40-4t-engine-oil
  - https://www.bikepartsbd.com/product/suzuki-gixxer-front-brake-pads/
  - https://www.suzukimotorcycle.co.in/owner-manuals/download/1
  - Photo: RuinDig/Yuki Uchida, CC BY 4.0 — https://commons.wikimedia.org/wiki/File:Japan-Mobility-Show-2023-RuinDig_507.jpg
- **GSX-R150** (ABS) — ৳5,29,950 as of 2026-10
  - Price: https://www.suzuki.com.bd/
  - https://www.bikebd.com/price/suzuki-gsxr-price-in-bangladesh
  - Used asking prices (2026-10): ~1 yr ৳4,35,000, ~3 yr ৳3,70,000 — https://bikroy.com/bn/motorcycles-and-scooters/suzuki-gsx-r150
  - Photo: Haysnawri10, CC BY-SA 4.0 — https://commons.wikimedia.org/wiki/File:2022_Suzuki_GSX-R150_Mandalika_Limited_Edition.jpg
- **Access 125** (FI Disc) — ৳2,14,950 as of 2026-10
  - Price: https://www.suzuki.com.bd/
  - https://www.suzuki.com.bd/product/access-125
  - https://www.bikebd.com/price/suzuki-access-125
  - Used asking prices (2026-10): ~1 yr ৳1,95,000, ~3 yr ৳1,70,000 — https://bikroy.com/bn/motorcycles-and-scooters/suzuki-access-125, https://bikroy.com/bn/motorcycles-and-scooters/suzuki-access-125-fi-cbs
- **AX-100** — ৳45,000 as of 2026-10 (used market)
  - Price: https://bikebd.com/price/suzuki-ax100
  - https://bikebd.com/price/suzuki-a100
  - https://bikroy.com/bn/motorcycles-and-scooters/suzuki

### TVS

- **Metro Plus** — ৳1,24,999 as of 2026-09
  - Price: https://www.bikebd.com/price/tvs-metro-plus-price-in-bangladesh
  - https://www.bikebd.com/brand/tvs
  - https://www.bikestall.com/bike/tvs-metro-plus
  - Used asking prices (2026-10): ~1 yr ৳1,05,000, ~3 yr ৳80,000 — https://bikroy.com/bn/motorcycles-and-scooters/tvs-metro-plus
- **Radeon** — ৳1,20,999 as of 2026-09
  - Price: https://www.bikebd.com/price/tvs-radeon-price-in-bangladesh
  - https://www.bikebd.com/brand/tvs
  - https://www.motorcycle.com.bd/tvs-radeon-110/
  - https://www.tvsmotor.com/-/media/UpdatedUserManuals2026/Before-April-2025/Motorcycles/Radeon/TVS-Radeon.pdf
- **Stryker 125** — ৳1,44,999 as of 2026-09
  - Price: https://www.bikebd.com/price/tvs-stryker-price-in-bangladesh
  - https://www.bikebd.com/brand/tvs
  - https://www.motorcyclebd.com/tvs-stryker-125/
  - https://www.motorcycle.com.bd/tvs-stryker-125-cc/
  - Used asking prices (2026-10): ~1 yr —, ~3 yr ৳85,000 — https://bikroy.com/bn/motorcycles-and-scooters/tvs-stryker-125
- **Raider 125** (Disc) — ৳1,69,900 as of 2026-09
  - Price: https://www.bikebd.com/price/tvs-raider-125
  - https://www.bikewale.com/tvs-bikes/raider-125/mileage/
  - https://www.bikebd.com/brand/tvs
  - https://www.tvsmotor.com/-/media/UpdatedUserManuals2026/Before-April-2025/Motorcycles/Raider/TVS-Raider.pdf
  - Used asking prices (2026-10): ~1 yr ৳1,30,000, ~3 yr ৳1,15,000 — https://bikroy.com/bn/motorcycles-and-scooters/tvs-raider-125, https://bikroy.com/bn/motorcycles-and-scooters/tvs-raider-125-2025
  - Photo: MotorideSA, CC BY-SA 4.0 — https://commons.wikimedia.org/wiki/File:TVS_Raider_125.jpg
- **Apache RTR 160 2V** (Refresh (X-Connect)) — ৳1,99,900 as of 2026-09
  - Price: https://www.bikebd.com/price/rtr-160-2v-refresh
  - https://www.bikebd.com/brand/tvs
  - https://deshibiker.com/tvs-apache-rtr-160-2v-xonnect-edition/
  - https://www.tvsmotor.com/-/media/UpdatedUserManuals2026/Before-April-2025/Motorcycles/RTR/TVS-Apache-RTR-160-2V---with-Ride-Mode---Non-Connected-Cluster.pdf
  - Used asking prices (2026-10): ~1 yr ৳1,65,000, ~3 yr ৳1,35,000 — https://bikroy.com/bn/motorcycles-and-scooters/tvs-apache-rtr-160-2v-2025, https://bikroy.com/bn/motorcycles-and-scooters/tvs-apache-rtr-160-2v-2023
- **Apache RTR 160 4V** (Single Channel ABS) — ৳2,47,900 as of 2026-09
  - Price: https://www.bikebd.com/price/new-tvs-apache-rtr-160-4v-single-channel-abs
  - https://www.bikebd.com/price/tvs-apache-rtr-160-4v-fi
  - https://www.bikebd.com/brand/tvs
  - https://www.motorcyclebd.com/tvs-apache-rtr-160-4v-smartxconnect-abs/
  - https://www.tvsmotor.com/-/media/UpdatedUserManuals2026/Before-April-2025/Motorcycles/RTR/TVS-Apache-RTR-160-4V---with-Ride-Mode---Non-Connected-Cluster.pdf
  - Used asking prices (2026-10): ~1 yr ৳1,85,000, ~3 yr ৳1,50,000 — https://bikroy.com/bn/motorcycles-and-scooters/tvs-apache-rtr-160-4v, https://bikroy.com/bn/motorcycles-and-scooters/tvs-apache-rtr-160-4v-2025
  - Photo: Ganesh Mohan T, CC BY-SA 4.0 — https://commons.wikimedia.org/wiki/File:Apache_RTR_160_4V.jpg
- **Ntorq 125** — ৳2,04,900 as of 2026-09
  - Price: https://www.bikebd.com/price/tvs-ntorq-125
  - https://www.bikebd.com/brand/tvs
  - https://www.motorcyclebd.com/tvs-ntorq-125/
  - https://www.tvsmotor.com/-/media/UpdatedUserManuals2026/Before-April-2025/Scooters/Ntorq/TVS-Ntorq---Non-Connected-cluster.pdf
  - Used asking prices (2026-10): ~1 yr ৳1,85,000, ~3 yr ৳1,70,000 — https://bikroy.com/bn/motorcycles-and-scooters/tvs-ntorq-125-2025, https://bikroy.com/bn/motorcycles-and-scooters/tvs-ntorq-125-2023
  - Photo: M.parvage, CC BY 4.0 — https://commons.wikimedia.org/wiki/File:TVS_Ntorq_125_blue.jpg

### Vespa

- **VXL 125** (CBS) — ৳3,50,000 as of 2026-10
  - Price: https://bikebd.com/price/vespa-vxl-125-cbs
  - https://www.bikebd.com/brand/vespa
  - https://www.motorcycle.com.bd/vespa-vxl-125/

### Walton

- **Takyon Fusion 25TD** — ৳1,61,999 as of 2026-10
  - Price: https://waltonbd.com/takyon-fusion-25td
  - https://waltonbd.com/takyon
  - https://www.waltondigitech.com/news/countrys-first-brta-approved-walton-e-bike-hits-market-km-cost-10-15-paisa
  - https://www.dhakatribune.com/business/408101/walton-offers-up-to-tk9-600-discount-on-takyon
- **Takyon 1.00** (38Ah) — ৳1,59,999 as of 2026-10
  - Price: https://waltonbd.com/takyon/takyon-1-00-38ah
  - https://waltonbd.com/takyon
  - https://www.bikebd.com/ev-brand/walton
- **Takyon Fusion 1.00 Swift** — ৳1,17,000 as of 2026-10
  - Price: https://waltonbd.com/takyon/takyon-fusion-1-00-swift
  - https://waltonbd.com/takyon

### Yamaha

- **Saluto 125** (UBS Disc) — ৳1,63,500 as of 2026-10
  - Price: https://www.yamahabd.com/products/yamaha-saluto-125-ubs
  - https://www.bikebd.com/price/yamaha-saluto-125-ubs
  - https://www.motorcyclevalley.com/news/yamaha-bike-price-before-eid-ul-adha-2026/
  - https://library.ymcapps.net/library/om/contents/pdf/10/2LP-F8199-EF_02.pdf
  - Used asking prices (2026-10): ~1 yr —, ~3 yr ৳1,15,000 — https://bikroy.com/bn/motorcycles-and-scooters/yamaha-saluto-125
  - Photo: Rainmaker47, CC BY-SA 4.0 — https://commons.wikimedia.org/wiki/File:2015_Yamaha_YC125-4_Saluto.JPG
- **Fazer FI V2** — ৳2,74,000 as of 2026-10
  - Price: https://www.yamahabd.com/products/yamaha-fazer-fi-v2
  - https://www.bikebd.com/price/yamaha-fazer-price-in-bangladesh
  - https://www.motorcyclevalley.com/news/yamaha-bike-price-before-eid-ul-adha-2026/
  - https://library.ymcapps.net/library/om/contents/pdf/10/2WS-F8199-E5_02.pdf
  - Used asking prices (2026-10): ~1 yr ৳2,55,000, ~3 yr ৳2,05,000 — https://bikroy.com/bn/motorcycles-and-scooters/yamaha-fazer-fi-v2
- **FZS FI V4** — ৳2,94,500 as of 2026-10
  - Price: https://www.yamahabd.com/products/yamaha-fzs-v4
  - https://www.bikebd.com/price/yamaha-fzs-v4
  - https://www.motorcyclevalley.com/news/yamaha-bike-price-before-eid-ul-adha-2026/
  - https://library.ymcapps.net/library/om/contents/pdf/10/BJE-F819V-E2_02.pdf
  - Used asking prices (2026-10): ~1 yr ৳2,75,000, ~3 yr ৳2,50,000 — https://bikroy.com/bn/motorcycles-and-scooters/yamaha-fzs-fi-v4, https://bikroy.com/bn/motorcycles-and-scooters/yamaha-yzf-r15-v4
  - Photo: Ganesh Mohan T, CC BY-SA 4.0 — https://commons.wikimedia.org/wiki/File:Yamaha_FZS.jpg
- **FZS V2** (FI Double Disc) — ৳2,34,000 as of 2026-10
  - Price: https://www.yamahabd.com/products/yamaha-fzs-v2
  - https://bikebd.com/price/fzs-v2-price-in-bd
  - https://bikebd.com/price/fzs-v2-price-in-bd/color
  - https://www.yamahabd.com/products
  - https://library.ymcapps.net/library/om/contents/pdf/10/2GS-F8199-EC_02.pdf
- **FZS FI Hybrid** — ৳3,47,500 as of 2026-10
  - Price: https://www.yamahabd.com/products/yamaha-fzs-fi-hybrid
  - https://www.bikebd.com/price/yamaha-fz-s-fi-hybrid-2025
  - https://online91.thedailystar.net/business/news/aci-motors-launches-yamaha-hybrid-motorcycle-4083056
  - https://library.ymcapps.net/library/om/contents/pdf/10/BST-F819V-E1_02.pdf
- **FZ-X** — ৳2,93,500 as of 2026-10
  - Price: https://www.yamahabd.com/products/yamaha-fz-x
  - https://www.bikebd.com/price/yamaha-fz-x-price-in-bangladesh
  - https://www.motorcyclevalley.com/news/yamaha-bike-price-before-eid-ul-adha-2026/
  - https://library.ymcapps.net/library/om/contents/pdf/10/BKH-F819V-E1_02.pdf
  - Used asking prices (2026-10): ~1 yr ৳2,40,000, ~3 yr ৳2,30,000 — https://bikroy.com/bn/motorcycles-and-scooters/yamaha-fz-x
- **FZ25** — ৳3,90,000 as of 2026-10
  - Price: https://www.yamahabd.com/products/yamaha-fz-25
  - https://www.bikebd.com/price/yamaha-fz-25
  - https://www.motorcyclevalley.com/news/yamaha-bike-price-before-eid-ul-adha-2026/
  - https://www.yamahabd.com/products/yamaha-fz-25/
  - https://library.ymcapps.net/library/om/contents/pdf/10/B9X-F819V-E1_02.pdf
- **R15 V4** (Indian-spec) — ৳6,05,000 as of 2026-10
  - Price: https://www.yamahabd.com/products/yamaha-r15-v4
  - https://www.bikebd.com/price/r15-v4-price-in-bangladesh
  - https://www.bikebd.com/price/yamaha-r15m-price-in-bangladesh
  - https://www.motorcyclevalley.com/news/yamaha-bike-price-before-eid-ul-adha-2026/
  - https://library.ymcapps.net/library/om/contents/pdf/10/BPD-F819V-E3_02.pdf
  - Photo: Kamalnath P, CC BY-SA 4.0 — https://commons.wikimedia.org/wiki/File:Yamaha_R15_v4_bike.jpg
- **R15 V3** (Indian Dual ABS) — ৳5,25,000 as of 2026-10
  - Price: https://www.yamahabd.com/products/yamaha-r15-v3
  - https://www.bikebd.com/price/r15-v3-indian-version-price-in-bd
  - https://www.motorcyclevalley.com/news/yamaha-bike-price-before-eid-ul-adha-2026/
  - https://library.ymcapps.net/library/om/contents/pdf/10/B9E-F8199-E1_02.pdf
  - Used asking prices (2026-10): ~1 yr ৳4,85,000, ~3 yr ৳4,10,000 — https://bikroy.com/bn/motorcycles-and-scooters/yamaha-r15-v3, https://bikroy.com/bn/motorcycles-and-scooters/yamaha-r15-v3-2025, https://bikroy.com/bn/motorcycles-and-scooters/yamaha-r15-v3-2023
  - Photo: Akshayanil919, CC BY-SA 4.0 — https://commons.wikimedia.org/wiki/File:Yamaha_R15_V3.0.jpg
- **MT-15 V2** — ৳5,35,000 as of 2026-10
  - Price: https://www.yamahabd.com/products/yamaha-mt-15-v2
  - https://www.bikebd.com/price/yamaha-mt-15-version-20
  - https://www.bikebd.com/price/yamaha-mt-15-price-in-bangladesh
  - https://www.motorcyclevalley.com/news/yamaha-bike-price-before-eid-ul-adha-2026/
  - https://library.ymcapps.net/library/om/contents/pdf/10/BXF-F819V-E6_02.pdf
  - Used asking prices (2026-10): ~1 yr ৳4,25,000, ~3 yr ৳3,55,000 — https://bikroy.com/bn/motorcycles-and-scooters/yamaha-mt-15, https://bikroy.com/bn/motorcycles-and-scooters/yamaha-mt-15-v2
  - Photo: Ganesh Mohan T, CC BY-SA 4.0 — https://commons.wikimedia.org/wiki/File:Yamaha_MT_15_Green_version.jpg
- **XSR155** — ৳5,45,000 as of 2026-10
  - Price: https://www.bikebd.com/price/yamaha-xsr-155-price-in-bangladesh
  - https://www.tbsnews.net/companies/aci-motors-introduces-yamaha-xsr-155-220432
  - https://library.ymcapps.net/library/om/contents/pdf/10/DD4-F819V-E0_02.pdf
  - Photo: Bonel14, CC BY-SA 4.0 — https://commons.wikimedia.org/wiki/File:Yamaha_XSR_155.jpg
- **Ray ZR 125 Fi** (Hybrid) — ৳2,70,000 as of 2026-10
  - Price: https://www.yamahabd.com/products/yamaha-ray-zr-125
  - https://www.bikebd.com/price/yamaha-ray-zr-125-price-in-bangladesh
  - https://www.bikebd.com/brand/yamaha
  - https://www.motorcycle.com.bd/yamaha-ray-zr-street-rally-125-fi/
  - https://www.motorcyclefair.com/yamaha-ray-zr-street-rally-125-fi/
  - https://www.motorcyclebd.com/yamaha-ray-zr-street-rally-125-fi/
  - https://library.ymcapps.net/library/om/contents/pdf/10/BKX-F819V-E2_02.pdf
- **Aerox 155** — ৳5,25,000 as of 2026-10
  - Price: https://www.yamahabd.com/products/yamaha-aerox-155
  - https://www.bikebd.com/price/yamaha-aerox-155
  - https://www.tbsnews.net/node/748346
  - https://library.ymcapps.net/library/om/contents/pdf/10/BLV-F819V-E2_02.pdf
  - Photo: Chanokchon, CC BY-SA 4.0 — https://commons.wikimedia.org/wiki/File:2021_Yamaha_Aerox_155_ABS.jpg
- **RX100** — ৳45,000 as of 2026-10 (used market)
  - Price: https://bikroy.com/bn/ads/bangladesh/motorbikes-scooters/yamaha/rx
  - https://bikebd.com/price/yamaha-rx100
  - Photo: Udaya kumar, CC BY-SA 4.0 — https://commons.wikimedia.org/wiki/File:Yamaha_RX100_genuine.jpg
- **RX 115** — ৳95,000 as of 2026-10 (used market)
  - Price: https://bikroy.com/bn/motorcycles-and-scooters/yamaha-rx-115
  - https://bikroy.com/bn/ads/bangladesh/motorbikes-scooters/yamaha/rx
  - https://www.bikebd.com/price/yamaha-rx-s115
  - Photo: Ali zeb, CC BY-SA 3.0 — https://commons.wikimedia.org/wiki/File:Yamaha_RX_115.jpg
- **RD350** (Rajdoot RD350 (Indian-built, as BikeBD lists)) — ৳3,50,000 as of 2026-10 (used market)
  - Price: https://bikebd.com/price/yamaha-rajdoot-rd350
  - https://bikebd.com/price/yamaha-rajdoot-rd350/specifications
  - https://bikroy.com/bn/motorcycles-and-scooters/yamaha
- **Libero** (Libero G5) — ৳32,000 as of 2026-10 (used market)
  - Price: https://bikroy.com/bn/motorcycles-and-scooters/yamaha-libero
  - https://bikebd.com/price/yamaha-libero-g5/specifications
  - https://bikebd.com/price/yamaha-libero-g5
- **Crux** — ৳35,000 as of 2026-10 (used market)
  - Price: https://bikroy.com/bn/motorcycles-and-scooters/yamaha-crux
  - https://bikebd.com/price/yamaha-crux/specifications
- **YBR125** — ৳40,000 as of 2026-10 (used market)
  - Price: https://bikroy.com/bn/motorcycles-and-scooters/yamaha-ybr125
  - https://www.bikebd.com/price/yamaha-ybr-125-2022

### Zontes

- **ZT155 U** — ৳3,49,000 as of 2026-10
  - Price: https://www.bikebd.com/price/zontes-zt155-u
  - https://www.bikebd.com/price/zontes-zt155-u/specifications
  - https://www.bikebd.com/brand/zontes
  - https://www.tbsnews.net/feature/wheels/zontes-enters-bangladesh-premium-motorcycles-222703

## Dealer & service networks

- **Bajaj** (Uttara Motors Ltd; confidence high, 2026-10-14): https://www.bajajauto.com/en-bd/store-locator
- **TVS** (TVS Auto Bangladesh Ltd; confidence medium, 2026-10-14): https://bangladesh.tvsmotor.com/en/dealers-location
- **Hero** (HMCL Niloy Bangladesh Ltd; confidence high, 2026-10-14): https://www.heromotocorp.com/en-bd/dealers.html, https://www.heromotocorp.com/content/dam/hero-aem-website/in/investors/filing-reports/announcements-disclosures/press-release/20210830054620-Press-Releases.pdf
- **Honda** (Bangladesh Honda Private Limited (BHL); confidence high, 2026-10-14): https://bdhonda.com/dealer-locator, https://bdhonda.com/pages/about-bhl
- **Yamaha** (ACI Motors Ltd; confidence high, 2026-10-14): https://www.yamahabd.com/#dealers, https://www.yamahabd.com/about-us
- **Suzuki** (Rancon Motor Bikes Ltd; confidence high, 2026-10-14): https://www.suzuki.com.bd/dealer, https://suzuki.com.bd/about
- **Royal Enfield** (IFAD Motors Ltd; confidence high, 2026-10-14): https://www.royalenfield.com/bd/en/locate-us/dealers/, https://ifadgroup.com/ifad-motors-ltd
- **KTM** (Runner Automobiles PLC; confidence low, 2026-10-14): https://www.ktm.com/en-bd/find-a-dealer.html
- **Lifan** (Rasel Industries Ltd; confidence medium, 2026-10-14): https://raselindustry.com/distribution-network/

## Buyer's guide (BRTA, licence, fuel, laws)

Compiled 2026-10-06. Fees and rules change; always confirm on brta.gov.bd / bsp.brta.gov.bd or at your BRTA circle office before paying. Figures marked confidence 'medium' or 'low' come from secondary sources or conflicting reports.

- BRTA - Road Transport Rules 2022, Schedule-1 fees (Bangladesh Gazette Extraordinary, 27 Dec 2022), via brta.gov.bd 'বিভিন্ন ফি' — BRTA / Govt of Bangladesh, 2022-12-27  
  https://objectstorage.ap-dcc-gazipur-1.oraclecloud15.com/n/axvjbnqprylg/b/V2Ministry/o/office-brta/2024/12/2e6d2c3e81cd4418882881f35e0e95bd.pdf
- BRTA - বিভিন্ন ফি (fees page) — BRTA  
  https://brta.gov.bd/pages/static-pages/6922dcac933eb65569e11838
- Road Division memo 35.020.031.00.00.025.2011-431: RFID number plate & DRC prices (via brta.gov.bd 'ডিএনপি ও ডিআরসি ফি') — Road Transport & Highways Division, 2012-10-23  
  https://objectstorage.ap-dcc-gazipur-1.oraclecloud15.com/n/axvjbnqprylg/b/V2Ministry/o/office-brta/2024/12/f910dfd1b03241d1907f6cbe46201ccc.pdf
- BRTA - মোটরযানের নিবন্ধন (registration process & documents) — BRTA, 2026-06-30  
  https://brta.gov.bd/pages/static-pages/6922dba7933eb65569e0b9c1
- BRTA - ট্যাক্স টোকেন নবায়ন — BRTA, 2022-03-10  
  https://brta.gov.bd/pages/static-pages/6922e0ab933eb65569e281ad
- BRTA - মালিকানা বদলী (ownership transfer documents) — BRTA, 2026-06-30  
  https://brta.gov.bd/site/page/67a3c40f-6cbb-4340-9873-2c8ba48f7e85/
- BRTA - ড্রাইভিং লাইসেন্স পাওয়ার প্রক্রিয়া (licence process & fees) — BRTA, 2026-06-30  
  https://brta.gov.bd/pages/static-pages/6922e0e7933eb65569e2919e
- BRTA - ড্রাইভিং লাইসেন্স (learner -> written/oral/field test) — BRTA, 2023-05-17  
  https://brta.gov.bd/pages/static-pages/6922e12b933eb65569e2aa50
- BRTA Service Portal (BSP) — BRTA  
  https://bsp.brta.gov.bd/
- BSP - registered vehicle fees / dues lookup — BRTA  
  https://bsp.brta.gov.bd/registeredVehicleFeesIndex?lan=en
- BSP - ownership transfer application — BRTA  
  https://bsp.brta.gov.bd/v/vehicleTransferOwnership/applicationForTransferOwnershipIndex
- Bike registration fee halved — The Daily Star, 2021-02-03  
  https://www.thedailystar.net/business/news/bike-registration-fee-halved-2038333
- Bike Registration Fees in Bangladesh (2, 5, 10 years) — DeshiBiker, 2025-05-11  
  https://deshibiker.com/bike-registration-fees-in-bd/
- How Much is the Road Tax of a Motorcycle in Bangladesh? — DeshiBiker, 2025-05-11  
  https://deshibiker.com/road-tax-of-a-motorcycle-in-bd/
- Motorcycle Registration Fees in Bangladesh by CC [2025 Update] — PDTS, 2024-06-25  
  https://pdts.com.bd/blogs/30
- Motorcycle Registration Procedure In Bangladesh — BikeBD, 2026-10-05  
  https://www.bikebd.com/blog/motorcycle-registration-procedure-in-bangladesh
- What To Do When The Motorcycle Tax Token Validity Exceeds 10 Years? — BikeBD, 2025-11-29  
  https://www.bikebd.com/bn/blog/what-to-do-when-the-motorcycle-tax-token-validity-exceeds-10-years
- How To Get A Motorcycle Driving License - Details and Cost — BikeBD, 2026-10-05  
  https://bikebd.com/blog/driving-license
- Motorcycle ownership transfer process Bangladesh — BikeBD, 2026-10-05  
  https://bikebd.com/blog/motorcycle-ownership-transfer-process-bangladesh
- Motorcycle ownership transfer (Bangla) — bdnews24.com, 2026-08-26  
  https://bangla.bdnews24.com/lifestyle/Jenerakun/74366df2801b
- Govt may drop planned wealth tax, bike and rickshaw AIT — The Daily Star, 2026-06-04  
  https://www.thedailystar.net/business/economy/news/govt-may-drop-planned-wealth-tax-bike-and-rickshaw-ait-4190076
- Fuel prices unchanged for October — Dhaka Tribune, 2026-09-30  
  https://www.dhakatribune.com/bangladesh/power-energy/421056/fuel-prices-unchanged-for-october
- Fuel prices (30 Sep 2026) — bdnews24.com, 2026-09-30  
  https://bdnews24.com/business/f3ub8nrf1p
- Fuel prices rise up to nearly 36% between January and September 2026 — UNB  
  https://www.unb.com.bd/category/Bangladesh/fuel-prices-rise-up-to-nearly-36-between-january-and-september-2026/195927
- Import of 375cc motorcycles on the cards, questions over new policy — Prothom Alo English, 2026-06  
  https://en.prothomalo.com/business/c7d38h8nz8
- দেশে চালানো যাবে ৩৭৫ সিসি পর্যন্ত মোটরসাইকেল — The Daily Star Bangla, 2023-10-11  
  https://bangla.thedailystar.net/news/bangladesh/news-522546
- Import Policy Order 2026-2029 (SRO 308-Law/2026), Bangladesh Gazette Extraordinary, 24 Aug 2026: Annex 1 part A item 8, p. 23876 — Ministry of Commerce, Govt of Bangladesh, 2026-08-24  
  https://objectstorage.ap-dcc-gazipur-1.oraclecloud15.com/n/axvjbnqprylg/b/V2Ministry/o/office-mincom/2026/7/c91ed257-057d-4c4f-8eea-93a413c1ae4c.pdf
- Import Policy Order 2026-2029 (amended text, updated to 24 Sep 2026; posted 30 Sep 2026): Annex 1 part A item 8 unchanged — Ministry of Commerce, Govt of Bangladesh, 2026-09-24  
  https://objectstorage.ap-dcc-gazipur-1.oraclecloud15.com/n/axvjbnqprylg/b/V2Ministry/o/office-mincom/2026/8/0ef3d693-fb24-479c-9f66-77c0dbb356c1.pdf
- ১৬৫ সিসির বেশি বাইক আমদানি করা যাবে না — Desh Rupantor, 2026-08-26  
  https://www.deshrupantor.com/715706/
- এলসির বাইরে মূল্যসীমা ছাড়াই পণ্য আমদানি, বদলে গেলো আমদানি নীতির কাঠামো — Bangla Tribune, 2026-08  
  https://www.banglatribune.com/964670
- BB issues import policy implementation guidelines — The Financial Express, 2026-09-13  
  https://thefinancialexpress.com.bd/bangladesh/bb-issues-import-policy-implementation-guidelines
- Up to 500cc motorbikes can be made locally — The Daily Star  
  https://www.thedailystar.net/business/economy/news/500cc-bikes-can-be-made-locally-3012596
- IDRA motor insurance sees low response amid high premiums, non-compulsory rules — The Business Standard, 2026-02-10  
  https://www.tbsnews.net/node/1357826
- Insurance for bike, other vehicles set to be mandatory again — Prothom Alo English, 2024-03-15  
  https://en.prothomalo.com/bangladesh/gzl00ewg0c
- Penalties for violating rules under the new Road Transport Act — The Business Standard, 2019-11  
  https://www.tbsnews.net/node/21549
- Bikers without helmet will not get fuel — The Daily Ittefaq (English), 2024-05-15  
  https://en.ittefaq.com.bd/8815/bikers-without-helmet-will-not-get-fuel
- How effective is Bangladesh's own motorcycle helmet standard — BikeBD  
  https://www.bikebd.com/blog/how-effective-is-bangladeshs-own-motorcycle-helmet-standard
- Bikers' safety takes backseat with no rule to grade helmets — The Business Standard  
  https://www.tbsnews.net/node/366583
- Motorcycles, three-wheelers banned on Dhaka Elevated Expressway — Dhaka Tribune, 2023-07-08  
  https://www.dhakatribune.com/bangladesh/dhaka/319966/motorcycles-three-wheelers-banned-on-dhaka
- Motorcycles allowed to ply on Padma Bridge from Thursday — Prothom Alo English, 2023-04-18  
  https://en.prothomalo.com/bangladesh/rbjde07nzk
- Motorcycles ply Padma Bridge once again — The Business Standard, 2023-04-20  
  https://www.tbsnews.net/node/619670
- Ride-Sharing Service in Capital: Govt to shut door on outside vehicles — The Daily Star, 2019-02-04  
  https://www.thedailystar.net/backpage/news/govt-shuts-door-outside-vehicles-1697077
- BRTA starts registering ride-sharing firms — The Daily Star  
  https://d11.thedailystar.net/backpage/news/brta-starts-registering-ride-sharing-firms-1765546
- Road Transport Act 2018 (official Bangla text) — Laws of Bangladesh (bdlaws), 2026-10-14  
  https://bdlaws.minlaw.gov.bd/act-print-1262.html
- National emergency service 999 now fully operational — The Financial Express  
  https://thefinancialexpress.com.bd/home/national-emergency-service-999-now-fully-operational
- BRTA: retro-reflective number plate and RFID tag mandatory (Bangla) — Bangla Tribune, 2026-06-24  
  https://www.banglatribune.com/953538
- Motorcycles to get a front number plate for AI-camera detection (Bangla) — The Daily Ittefaq, 2026-08-20  
  https://www.ittefaq.com.bd/805173/
- BRTA notice: online ownership transfer with seller biometrics (Bangla) — Dhaka Times, 2026-09-01  
  https://www.dhakatimes24.com/2026/09/01/411836
- NBR drops direct tax on autorickshaws, motorcycles, expands income tax filing requirements — Dhaka Tribune, 2026-06-06  
  https://www.dhakatribune.com/business/411857/nbr-drops-direct-tax-on-autorickshaws
- Walton launches affordable e-bike — The Business Standard, 2023-02-13  
  https://www.tbsnews.net/economy/corporates/walton-launches-affordable-e-bike-584682
- Electric vehicle makers get VAT, duty waivers — The Daily Star, 2025-06-13  
  https://epfs.thedailystar.net/TDS/2025/06/13/Bangladesh/BUS/5_01/7bb30e796932bd10_01.pdf
- World Manufacturer Identifier (WMI) codes — Wikibooks  
  https://en.wikibooks.org/wiki/Vehicle_Identification_Numbers_(VIN_codes)/World_Manufacturer_Identifier_(WMI)
- ACI Motors launches Yamaha FZS Version 4.0 in Bangladesh — ACI, 2024-09-28  
  https://www.aci-bd.com/events/aci-motors-launches-yamaha-fzs-version-4.0-in-bangladesh.html
- Yamaha FZS FI V3 review — BikeBD  
  https://bikebd.com/blog/yamaha-fzs-fi-v3-review-team-bikebd
- Rancon launches 2019 Gixxer and Gixxer SF in Bangladesh — The Business Standard, 2020-07-01  
  https://www.tbsnews.net/node/100465
- Bangladesh hikes retail electricity price (slab table) — bdnews24.com, 2026-06-03  
  https://bdnews24.com/economy/9efadd3c57ad
- BERC withdraws excess power tariff for up to 75 units — Dhaka Tribune, 2026-06-04  
  https://www.dhakatribune.com/bangladesh/power-energy/411765/berc-withdraws-excess-power-tariff-for-up-to-75
- Wholesale power price cut; retail rates unchanged — The Daily Observer, 2026-08-23  
  https://observerbd.com/news/589536

### Confidence notes from research

- **registration:** medium - statutory fee slabs are confirmed from the gazette; package totals and road-tax amounts come from secondary guides that disagree slightly. BikeBD's itemised table (Oct 2026) still shows pre-2021 registration fees (4,200/5,600), so it was not used for totals.
- **licence:** high for fees and documents (BRTA page updated 30 Jun 2026); medium for timeline
- **ccPolicy:** high for 375cc locally-made registration rule; high for the >165cc CBU import ban (read in the Import Policy Order 2026-2029 gazette and its amended text, checked 2026-10-24)
- **fuel:** high
- **insurance:** high for legal status and pilot premium; low for comprehensive pricing
- **evRules:** medium: pedal exemption and VAT come from news reports of the policy and budget
