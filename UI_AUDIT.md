# UI audit — does Suggest.Bike make sense for buyers in Bangladesh?

**Date:** 2026-10-06 · **Build:** `feat/suggest-bike-v1` · **Method:** I walked six buyer personas through the static build. Mostly at 390 px phone width, since that is where most BD traffic will come from. I used both English and বাংলা, and light and dark themes, and took screenshots of each flow.

## Verdict

**The core idea lands, and so does the information on each page.** The site answers what BD buyers actually ask, and the rest of the market doesn't answer it in one place:

- *Can the local mistri fix it?*
- *What do parts cost?*
- *What's the on-road price after BRTA?*
- *What will I spend each month?*

Amounts in Taka with lakh grouping (৳2,73,600), mileage in kmpl, height in feet, and Pathao/Uber as a use case all read as local.

**It isn't yet a site that *everyone* in BD will use.** Five gaps stand between it and that goal. In order:

1. **Bangla is half-done**, so Bangla readers hit English walls.
2. **No EMI or installment framing.** Many buyers decide on monthly payments.
3. **No "where do I buy and service it" answer** for district buyers.
4. **No real photos.** Buyers here judge looks and colour first.
5. **The used market is thin.** Only 4 used-only bikes, so "open to used" barely changes the matchmaker's results.

One critical bug was found and **fixed during the audit**: the mobile menu opened as an invisible 0-height panel.

---

## What already works for BD buyers

| Area | Why it works here |
| --- | --- |
| **Quick pick on the home page** | Budget slider plus a use chip gives an answer in 3 seconds, before any typing. That matches how people ask in Facebook groups: "2 lakh budget, office use, kon bike?" |
| **On-road price** on every bike | The showroom-vs-registration surprise is the #1 complaint from first-time buyers. Showing "≈ ৳2,94,564 with 10-yr tax token" up front builds trust. |
| **Mechanic and parts scores, parts price table** | Unique to this site. "Everywhere / Dealer only" badges are instantly readable. |
| **Quirks box** (amber) | Honest negatives ("heavy for Dhaka filtering", "engine heat in jams") are what people otherwise only learn from forums. This is the trust-builder. |
| **Monthly running cost** with a km/day slider | Speaks to Pathao/delivery riders and parents paying for a student's bike. |
| **Compare page** with crowns and quick verdicts | "Cheaper to run: Pulsar N160 · Quicker: Apache 4V" is exactly how these debates are settled in BD. |
| **Buyer's guide** | BRTA fees line by line, the 10-year tax token, the 375cc rule and the used-bike paper checklist. High value, and hard to find in one place elsewhere. |
| **Matchmaker questions** | Height in feet, the pillion question (family use is common) and the "Pathao/Uber" option all ring true. |
| **Visual system** | Calm, legible, fast. Dark mode is good for night browsing. The flag-inspired logo reads as local without being kitsch. |

---

## Issues, ranked

### Critical

**C1. Mobile menu didn't open** — *fixed in this audit.*
The header's `backdrop-filter` trapped the fixed overlay inside the 64 px bar. Phone users had no way to reach Compare, True cost or the Guide except through links further down the page. The overlay is now rendered outside `<header>` in `src/components/Header.tsx`, and I re-checked it at 390 px.

### High

**H1. Bangla mode is a patchwork.**
Headings switch to Bangla, but much of the page stays English:
- the parts table headers, availability badges, spec labels and key-spec strip
- match reasons ("Light and nimble in Dhaka traffic"), compare row labels and verdict labels
- the whole cost page and guide page
- prices, which still say "lakh"

Switching language and still hitting English undermines the toggle. For Bangla-first readers (most first-time buyers outside Dhaka) the site will feel "not for me".
**Fix:**
1. Translate all interface labels; there are about 120 strings.
2. Render "লাখ" in Bangla mode.
3. Decide on Bangla vs Latin digits. Latin is fine and common, but be consistent.
4. Then translate the bike write-ups (see `Todo_agent.md`).

**H2. Search ignores Bangla input.**
Typing "পালসার" or "এপাচি" returns nothing: the normaliser strips non-Latin characters. Mixed-script search is normal in BD.
**Fix:** add a `aliases: string[]` field with Bangla spellings and common misspellings ("apachi", "gixer", "fz s"). Match on those as well.

**H3. No EMI or installment view.**
Showroom ads in BD lead with "0% EMI, 6–12 months" and bank card installments. Many buyers' real constraint is "৳8–10k a month".
**Fix:** show "From ৳X/month on 12-month EMI" on cards and detail pages, and add an "I'll pay monthly" mode to the budget question.

**H4. Nothing for district buyers about dealers and service.**
A buyer in Rangpur or Barishal cares first whether a brand has a showroom and workshop nearby. The mechanic score helps, but there's no location dimension.
**Fix:**
1. Add a "Where are you?" question (Dhaka / Chattogram / other city / village).
2. Add per-brand service-network data.
3. Add a simple "dealers by division" list on each bike page.

The data collection is in `Todo_owner.md`.

**H5. On mobile, the money summary is buried.**
On a bike page, the monthly-cost card sits **below the sources list**, about 6,000 px down on a phone. Price and on-road price are at the top, but the "what will I spend" panel, the site's differentiator, is effectively hidden.
**Fix:** on small screens, place the monthly-cost card directly after the key-spec strip (`order-first` on the aside below `lg`). Consider a sticky bottom bar on phones with price, Compare and Save.

**H6. At low budgets the matchmaker recommends decades-old 2-strokes for commuting.**
With ৳1 lakh, "open to used" and "Daily commute", the results are RX100 (77%), CG125, RX 115 and CBZ. Every new bike is just over the 6% budget stretch, so the only candidates left are collector bikes. An RX100 is a cult classic, but it is the wrong answer for a daily commuter: it's a 2-stroke that is thirsty and hard to keep legal and roadworthy. Advice like that will get screenshotted and mocked in groups.
**Fix:**
- Short term: down-weight `status: "used-only"` bikes unless the use is "fun" or a style priority is set.
- When nothing new fits, say so explicitly: "Nothing new fits ৳1 lakh. Cheapest new: Runner Bullet 100 at ৳1.09 lakh."
- Long term: M2, used prices for current models.

### Medium

**M1. Illustrations instead of photos.**
They are consistent and pretty, but every 150cc street bike looks the same, and colour options are part of the decision here. Buyers may read illustrations as "this site hasn't seen the bike".
**Fix:** licensed photos with colour swatches, keeping the illustration as fallback. The data field is described in `Todo_agent.md`.

**M2. "Open to used" is nearly cosmetic.**
Only 4 used-only bikes exist (CG125, RX100, RX 115, CBZ). A buyer with ৳1.2 lakh who would happily buy a 2-year-old Pulsar gets no help.
**Fix:**
1. Add used-price ranges (1-yr and 3-yr old) for every popular on-sale bike.
2. Let the matchmaker recommend "a 2022 FZS at about ৳1.9 lakh" when the budget is below the new price.

**M3. Scooters rank #1 for "Daily commute" on the home Quick pick.**
At ৳2.5 lakh with "Daily commute", the Suzuki Access 125 comes first, because Quick pick uses `gearless: "either"`. Scooters are a minority choice for most BD male buyers. The ranking is defensible, but it reads as odd on first impression and can cost credibility.
**Fix:** default Quick pick to geared bikes and add a small "Scooter" chip. Keep "either" in the full quiz.

**M4. Price freshness isn't visible enough.**
"Price checked 2026-10" sits in 12 px grey text. Prices move with showroom offers and are the most-checked fact.
**Fix:**
- Show a "Checked Oct 2026" pill next to the price.
- Show an "Offer running" badge when `priceNote` mentions an offer.
- Add the "Report wrong price" action.

**M5. Estimates aren't marked as estimates on the page.**
Mileage, scores and parts prices are editorial, and that is disclosed only on `/about` and in the README. A buyer who quotes "Suggest.Bike says ৳320 brake shoes" to a mechanic, and gets told ৳450, loses trust in everything.
**Fix:** a small "approx." tag and a tooltip on those numbers, plus the confidence field described in `Todo_agent.md`.

**M6. Sharing is copy-link only.**
BD bike conversations happen in Messenger, WhatsApp and Facebook groups.
**Fix:** native share (`navigator.share`) on mobile, plus OG preview images for compare and match results. A shared "Pulsar N160 vs Apache 4V" image card is the growth loop.

**M7. Page weight.**
The home page loads about 1.5 MB uncompressed, because all of `bikes.json` ships to the client. On prepaid mobile data in the districts that matters.
**Fix:** a slim list index for cards, with full detail loaded per bike page.

### Low

- **L1. Unclear brand chips.** "Hero Honda" appears as its own brand chip. Label it "Hero Honda (used)", or fold it into the used section.
- **L2. Scooter parts rows are odd.** Scooter records list "Chain & sprocket set" and "Clutch plate set" with a note that these are really belt and clutch shoes. Show the real part names for CVT bikes.
- **L3. Unclear language toggle.** It shows "বাং", which some users may not read as a toggle. "বাংলা" or "EN | বাং" is clearer.
- **L4. Thin compare columns.** On a 390 px phone, comparing 3 bikes gives each column about 110 px. It still fits, but long text rows (feel, quirks) get very tall. Consider swipeable bike tabs for text rows on mobile.
- **L5. Contrast.** `text-faint` captions (price date, illustration label, footnotes) are likely below WCAG AA contrast on the light background.
- **L6. No contact or feedback path anywhere.** For a data product, "this price is wrong" is the most important button.

---

## Persona walkthroughs

| Persona | Goal | Outcome | Friction |
| --- | --- | --- | --- |
| **Rafi, 19, student, Mymensingh, Bangla-first, ৳1.6 lakh** | First bike, cheap to run | Quiz in Bangla works and the results make sense (Platina 100, Splendor+, HF Deluxe, CT 100) | Results text in English (H1); "where to service in Mymensingh" missing (H4); would have liked a used Pulsar (M2) |
| **Karim, 32, Pathao rider, Dhaka** | Lowest cost per km | At ৳2 lakh he gets Platina, Splendor+, HF Deluxe and CT 100: correct for cost per km. The 100 km/day slider works | Wants the EMI view (H3) and used prices (M2) |
| **Nusrat, 27, office commuter, 5′2″** | A scooter she can flat-foot | Gearless + "Under 5′5″" at ৳2.5 lakh: Access 125, Xoom 125R (seat-height warning shown), Ntorq, Dio | No women-rider or scooter landing page; Bangla scooter content missing |
| **Tanvir, 24, enthusiast** | R15 V4 vs Gixxer SF | Compare page is excellent: crowns, power-to-weight, resale | Wants photos and colour options (M1); a share image for his Facebook group (M6) |
| **Mr. Hossain, 45, family upgrade, Barishal** | Safe bike for daily pillion | Pillion "daily" plus safety and comfort at ৳3.2 lakh: NX200, Pulsar N160, FZ-X, Pulsar N250. Sensible | Bangla patchwork (H1), service network unknown (H4), the monthly card hard to find on phone (H5) |
| **Second-hand hunter, ৳1 lakh, daily commute** | Avoid getting cheated | Guide's 11-point checklist is genuinely useful | **Top pick is a 1990s 2-stroke RX100** (see H6); the catalogue barely covers the used market (M2) |

---

## Suggested order of work

1. **This week:**
   - H6 (stop recommending 2-stroke classics to commuters)
   - H5 (move the monthly card up on mobile)
   - M3 (Quick pick defaults to geared)
   - H2 (Bangla aliases in search)
   - L6 (report-wrong-price link)
   - M5 ("approx." tags)
2. **Next 2 weeks:** H1, full interface translation. This is the biggest single unlock for "everyone in BD".
3. **Next month:**
   - H3 (EMI view)
   - M6 (native share and OG images)
   - M7 (slim data bundle)
4. **Needs owner data first:** H4 (dealers and service network), M1 (photos), M2 (used prices).
