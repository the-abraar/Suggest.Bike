# Todo — owner

Things only you can do: decisions, accounts, money, relationships and work out in the real world. The agent work that depends on them is noted in `Todo_agent.md`.

## Blocked on you (2026-10-14)

The agent is waiting on these. Send the value (or the answer) and it wires it in.

- [ ] **Formspree URL** for `FORM_ENDPOINT` in `src/lib/site.ts` (steps below). Until then the feedback and "I own this" forms open an email app, which fails on phones without one.
- [ ] **GoatCounter code** for `GOATCOUNTER_CODE` (steps below). Set it before the first Facebook post, or that traffic can't be measured.
- [ ] **WhatsApp number** for `WHATSAPP`, or say "skip".
- [ ] **Data answers:** open `docs/data-needed.html` in a browser, fill each row (value, unsure, or both options), press "Download answers" and give the agent the JSON file.
- [ ] **Quiz defaults:** the quiz shows default answers as already selected (budget ৳2.5 lakh, brand new, daily commute, etc.). Keep, or start every step blank?
- [ ] **Search Console:** in URL Inspection, press "Request indexing" for `/`, `/bn/`, `/bikes/`, `/bn/bikes/`, `/guide/`, `/bn/guide/` (about 10 a day allowed). Check the sitemap status again around 2026-10-18.
- [ ] **Lawyer review** of `/privacy/`, `/terms/`, `/disclaimer/` (EN and BN) and the law cards on `/guide/` and `/guide/*/`.
- [ ] **Real phones:** walk the quiz, a bike page, `/compare/`, `/cost/` and `/bn/` on one Android and one iPhone.
- [ ] **Proofread the Bangla** in the 18 new maintenance posts, the `/owner/` sections and the three new rules pages.
- [ ] **Before each Facebook post** (`docs/launch-posts.md`): open the linked page that day and fix any number that moved (Hunk 150R went up ৳3,000 on 2026-10-14).
- [ ] **Check `hello@suggest.bike` forwarding** by sending one test email to it.
- [ ] **Two suspected spec errors** (critique B4; each bike's `dataNote` in `src/data/bikes.json` has the detail). Platina 100 ES: does it have CBS? bajajauto.com/en-bd lists drum/drum with no CBS; if not, set `brakes.abs` to `"none"`. Apache RTR 160 4V: 147 kg in the data, 143-144 kg on bikebd; ask TVS Auto Bangladesh.
- [ ] **Availability:** ask the distributor or a showroom whether these are still sold new: Suzuki V-Strom SX 250, Bajaj Avenger 160, KTM Duke 125 and RC 125, Hero Splendor+. Each shows "Availability unconfirmed" until you remove `"availability": "unconfirmed"` (on sale) or set `status` (gone).
- [ ] **More than three priorities** (2026-10-15): the quiz takes any number again, but the 20% budget raise for more than three was dropped, because it showed bikes over the buyer's own budget. If many priorities should change the results, say how (for example a labelled "these cost more" section) and the agent builds it.
- [ ] **Offers without a source link:** the V-Strom SX 250 offer ("reported by the site owner", no URL) is hidden while the bike is "availability unconfirmed", and its prices now match the ৳4,49,950 headline (৳4,29,950 offer). Decide whether every offer needs a source URL; if yes, the agent makes `validate` require one.
- [ ] **Legal page gaps** (TODO comments at the top of `src/components/LegalView.tsx`): operator name and postal address, governing law, and a response time you can keep for corrections and takedowns.

## Before launch

- [x] **Domain.** `suggest.bike` (Namecheap), set in `src/lib/site.ts → SITE.url`.
- [ ] **Hosting.** GitHub Pages via `.github/workflows/deploy.yml` (every push to `main` deploys `out/`). Point Namecheap DNS at GitHub (README → Deploy), then tick "Enforce HTTPS" in repo Settings → Pages.
- [ ] **Spot-check prices in person or by phone.** Call or visit 3–4 showrooms (Uttara Motors/Bajaj, ACI/Yamaha, BHL/Honda, Rancon/Suzuki, IFAD/Royal Enfield). Check the 10 most-viewed bikes against our numbers. Showroom offers move faster than any website.
- [ ] **Get a real BRTA registration receipt** for a 150cc and, if you can, a 350cc bike. Ask a friend who registered recently, or a dealer. This replaces the "medium/low confidence" totals.
- [ ] **Legal footer.** Add a short disclaimer, a privacy note (we only use the browser's own storage, no tracking yet) and a contact email. A trademark note too: brand names are used for identification only.
- [ ] **Create the `hello@suggest.bike` mailbox.** Every "Report wrong price" link on the site sends mail there (change it in `src/lib/site.ts`). Also consider a Facebook page. That feedback loop is the moat.

- [ ] **Create a Formspree form** (free tier, formspree.io) sending to `hello@suggest.bike`, then paste its URL (`https://formspree.io/f/xxxx`) into `FORM_ENDPOINT` in `src/lib/site.ts`. Until then the feedback and "I own this" forms open a prefilled email, which fails on phones without a mail app.
- [ ] **Create a GoatCounter account** (goatcounter.com, free for non-commercial use, no cookies) with the code `suggestbike`, then set `GOATCOUNTER_CODE` in `src/lib/site.ts`. The privacy page already covers it ("if enabled"). Form submits are counted as `form-feedback` / `form-owner` events.
- [ ] **Set the WhatsApp number**: put your number, international digits only (e.g. `8801XXXXXXXXX`, no `+` or spaces), into `WHATSAPP` in `src/lib/site.ts`. Until then no WhatsApp link shows; once set, the feedback page, both forms and the footer get a `wa.me` link with a prefilled message. Use a number you are happy to have public.
- [ ] **Confirm the distributor hotlines** in `src/data/dealers.json` by calling each one once, and ask Runner whether it distributes Vespa and Aprilia (not confirmed on an official page). Update `checked`.

## Data you're best placed to collect

- [ ] **Recruit a named mistri panel** (protocol: `docs/mistri-panel.md`). 5–8 mechanics, paid per session, named on `/method` with their consent. This is what turns the mechanic, parts and reliability scores from one editor's guess into published data.
- [ ] **Approach showrooms for lead deals** only after there is traffic to show (GoatCounter numbers). Pitch: a disclosed "Ask this showroom" button on bike pages, paid per lead, kept separate from rankings (see Growth). Start with one distributor that already has a showroom locator (Bajaj/Uttara, Honda/BHL, Suzuki/Rancon). Disclose any deal on `/method`.

- [ ] **Talk to 10–20 mechanics** (Bangshal, Mirpur, Jatrabari, and one or two district towns). Ask which engines they're comfortable with, which parts are hard to find, and typical labour rates. This turns "mechanic familiarity" from an estimate into the site's unique data.
- [ ] **Owner mileage survey.** A Google Form shared in BD bike Facebook groups: model, city/highway split, kmpl, problems. Even 300 responses would make the mileage numbers defensible.
- [ ] **Verify the dealer and service-centre numbers** in `src/data/networks.json` with each distributor. The matchmaker's "I live outside Dhaka" weighting depends on them.
- [ ] **More photos.** The site now uses only freely licensed Wikimedia Commons photos (with credit) and falls back to illustrations elsewhere. For full coverage, either shoot bikes at showrooms (with permission) or get press kits from distributors. Get written permission to use them.

## How to add a showroom offer

Offers live in `src/data/offers.json` (your editor autocompletes the fields from `offers.schema.json`). Add one object to `offers`:

- `id`: unique, lowercase with dashes, e.g. `honda-sp160-2026-11-cashback`.
- `bikeIds`: bike ids from `src/data/bikes.json` (the part after `/bikes/` in the page URL).
- `type`: `discount`, `free-registration`, `cashback`, `emi`, `exchange`, `gift` or `other`.
- `title` and `titleBn`: one short line each, e.g. "৳20,000 off until 31 October".
- `regularPriceBDT` and `offerPriceBDT`: required for a `discount` (offer must be lower); optional otherwise.
- `startsOn` and `endsOn`: dates as `YYYY-MM-DD`; `endsOn` is the last day. The site shows the offer only between these dates, using the visitor's date in Bangladesh, so it disappears by itself without a redeploy.
- `where` (optional, leave out if unknown), `source` (`name`, and `url` or `null`), `notes` (optional).

Then run `npm run validate`: it fails on unknown bike ids, bad dates, `endsOn` before `startsOn`, a discount that isn't cheaper or a `regularPriceBDT` that is not the bike's `priceBDT`, and only warns about offers that have ended (delete those when convenient). The matcher keeps ranking on the regular price.

## How to approve a comment

Comments on `/spotlight/` posts arrive the same way as feedback: in the Formspree inbox (or as an email to `hello@suggest.bike` while `FORM_ENDPOINT` is empty), with the subject "Comment: <post title>". Each has the post slug, a name, an email and the text. Nothing appears on the site until you add it.

1. Read it. Skip spam, insults, phone numbers, and anything that names or accuses a private person or a specific showroom without proof.
2. Open `src/data/comments.json` and add one entry per approved comment:
   `{ "post": "hero-hf-deluxe-best-mileage", "name": "Rafi", "date": "2026-10-20", "text": "Getting 65 km/l in Mirpur traffic." }`
   `post` is the slug from the message; `date` is the day you approve it. **Never copy the email.** Fix nothing in the text except removing a phone number or email.
3. Run `npm test` (it rejects a wrong slug, an extra field or an email address in the text), commit and push. The comment shows after the deploy.
4. To remove a comment later (someone asks), delete its entry and push.

## Weekly spotlight

- [ ] **Each week:** the agent drafts 5 new bike spotlights (see `Todo_agent.md`, "Weekly spotlight"). Read them, check the prices against the showroom like any Facebook post, then share the week on Facebook. Week 1 (2026-10-15): Lifan Glint 100, Hero HF Deluxe, Yamaha FZS FI V4, Suzuki GSX-R150, Royal Enfield Meteor 350.
- [ ] **Proofread the Bangla** of the Week 1 spotlights.
- [ ] **Later: pick an email OTP service** for commenters (needed before owner reviews; the site is static, so it must be a hosted service). Tell the agent which one.

## Growth

- [ ] **Facebook first.** BD bike culture lives in Facebook groups (BikeBD Official, BD BikerZ, brand owner clubs). Seed it with genuinely useful posts: "true monthly cost of the 5 most popular 150cc bikes", shared as images with a link.
- [ ] **YouTube and creator partnerships.** Offer reviewers the compare and cost tools to embed or reference. Keep the "no paid placement" promise public.
- [ ] **Decide the business model early** so it doesn't erode trust later. Options, from least to most risky for credibility:
  - Bangla-language sponsorship that is clearly marked
  - Paid "verified dealer" listings that are kept separate from the rankings
  - Lead referrals to dealers, disclosed
  - Insurance/EMI partner referrals

  Never let money touch the matchmaker ranking.
- [x] **Pick an analytics provider.** GoatCounter is wired in (see "Create a GoatCounter account" above).

## Later

- [ ] **Partnerships with BRTA-adjacent services** (licence-test coaching, registration agents). Only ones you have vetted.
- [ ] **A Bangla-first social presence.** Most first-time buyers are more comfortable reading Bangla.
- [ ] **A monthly review routine:** fuel price changes (BPC's automatic pricing), new launches, and discontinued models.

## On hold (owner decides when)

- **Soft launch and distribution.** Share with users and post hand-written answers in Facebook bike groups once the owner feels the site is ready. Not before.
- **Score freeze.** The judge score stays "unvalidated" until there is outside evidence (real sessions, owner reports, a dealer reply). Agents don't raise it in the meantime.
- **Mass-market gap.** Not actionable: bike prices keep rising and the catalogue follows the market.

## Search (for the SEO agent, `.claude/agents/seo.md`)

- [x] *(done 2026-10-14: verified via domain provider, sitemap submitted)* Verify suggest.bike in Google Search Console (DNS TXT record) and submit `https://suggest.bike/sitemap.xml`. Also Bing Webmaster Tools (it can import from Search Console). Step-by-step: `docs/seo_google.md`.
- [ ] Once a month, paste the top queries, impressions and CTR into `docs/seo-log.md`, so the SEO agent can pick what to improve.
