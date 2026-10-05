# Todo — owner

Things only you can do: decisions, accounts, money, relationships and work out in the real world. The agent work that depends on them is noted in `Todo_agent.md`.

## Before launch

- [ ] **Decide the domain spelling.** You bought `suugest.bike` (double "u"); the brand on the site reads "suggest.bike". Either buy `suggest.bike` too and redirect one to the other, or rebrand to match. Then set `src/lib/site.ts → SITE.url`.
- [ ] **Hosting.** Static files only. Namecheap shared hosting works: upload `out/` to `public_html/`. Free and faster alternatives: Cloudflare Pages or Netlify (Cloudflare has edge servers close to Bangladesh). Turn on HTTPS.
- [ ] **Spot-check prices in person or by phone.** Call or visit 3–4 showrooms (Uttara Motors/Bajaj, ACI/Yamaha, BHL/Honda, Rancon/Suzuki, IFAD/Royal Enfield). Check the 10 most-viewed bikes against our numbers. Showroom offers move faster than any website.
- [ ] **Get a real BRTA registration receipt** for a 150cc and, if you can, a 350cc bike. Ask a friend who registered recently, or a dealer. This replaces the "medium/low confidence" totals.
- [ ] **Legal footer.** Add a short disclaimer, a privacy note (we only use the browser's own storage, no tracking yet) and a contact email. A trademark note too: brand names are used for identification only.
- [ ] **Create the `hello@suugest.bike` mailbox.** Every "Report wrong price" link on the site sends mail there (change it in `src/lib/site.ts`). Also consider a Facebook page. That feedback loop is the moat.

## Data you're best placed to collect

- [ ] **Talk to 10–20 mechanics** (Bangshal, Mirpur, Jatrabari, and one or two district towns). Ask which engines they're comfortable with, which parts are hard to find, and typical labour rates. This turns "mechanic familiarity" from an estimate into the site's unique data.
- [ ] **Owner mileage survey.** A Google Form shared in BD bike Facebook groups: model, city/highway split, kmpl, problems. Even 300 responses would make the mileage numbers defensible.
- [ ] **Verify the dealer and service-centre numbers** in `src/data/networks.json` with each distributor. The matchmaker's "I live outside Dhaka" weighting depends on them.
- [ ] **More photos.** The site now uses only freely licensed Wikimedia Commons photos (with credit) and falls back to illustrations elsewhere. For full coverage, either shoot bikes at showrooms (with permission) or get press kits from distributors. Get written permission to use them.

## Growth

- [ ] **Facebook first.** BD bike culture lives in Facebook groups (BikeBD Official, BD BikerZ, brand owner clubs). Seed it with genuinely useful posts: "true monthly cost of the 5 most popular 150cc bikes", shared as images with a link.
- [ ] **YouTube and creator partnerships.** Offer reviewers the compare and cost tools to embed or reference. Keep the "no paid placement" promise public.
- [ ] **Decide the business model early** so it doesn't erode trust later. Options, from least to most risky for credibility:
  - Bangla-language sponsorship that is clearly marked
  - Paid "verified dealer" listings that are kept separate from the rankings
  - Lead referrals to dealers, disclosed
  - Insurance/EMI partner referrals

  Never let money touch the matchmaker ranking.
- [ ] **Pick an analytics provider** (privacy-friendly: Plausible, Umami or Cloudflare Web Analytics). Then the agent can wire up event tracking.

## Later

- [ ] **Partnerships with BRTA-adjacent services** (licence-test coaching, registration agents). Only ones you have vetted.
- [ ] **A Bangla-first social presence.** Most first-time buyers are more comfortable reading Bangla.
- [ ] **A monthly review routine:** fuel price changes (BPC's automatic pricing), new launches, and discontinued models.
