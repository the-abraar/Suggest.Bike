# Monthly price refresh

How the 103 prices in `src/data/bikes.json` stay fresh. A scheduled Action re-checks the prices that official Bangladesh distributor pages publish (41 bikes). The owner re-checks the rest (about 62) by hand, a quarter each week. This keeps every on-sale price under the 180-day `validate` gate, so deploys do not stop when a whole month's prices age out together (critique B9, March 2027).

## What runs

`.github/workflows/price-refresh.yml` runs at 09:17 Dhaka time on the 1st of each month. You can also start it by hand: Actions → price-refresh → Run workflow. It:

1. runs `npm run refresh:prices` (`scripts/price-refresh.ts`). The script fetches each distributor page in its `OFFICIAL` table plus each distributor's model list. It reads `robots.txt` first, sends a `suggest-bike-price-refresh/1` User-Agent and waits 2 s between requests, so a run takes about 3 minutes.
2. writes these into `bikes.json`:
   - every price the official page confirms or changes, with `priceSource` set to that page;
   - `priceAsOf` set to the current month, but only for bikes whose headline price was confirmed.
3. leaves these unwritten and lists them in the PR instead:
   - a price more than 30% from `bikes.json` (`suspect`: more likely a page or parse error than a real change);
   - a row the page no longer shows (`missing`);
   - a page that failed to load (`error`).
4. regenerates `SOURCES.md`, force-pushes branch `bot/price-refresh` and opens a PR to `main`, or updates it if one is already open. There is only ever one bot PR.

The PR body has four parts:

- **Official prices:** a table with every checked price, bikes.json against the official figure. Changes are listed first.
- **Availability unconfirmed:** on-sale bikes that are missing from the distributor's current model list. The data is not changed; you decide.
- **On the distributor's list, not checked here:** new models or variants the data does not carry.
- **Owner checklist:** every bike whose headline price the run did not confirm, oldest `priceAsOf` first, in four weekly batches with due dates and source links.

It never deploys. `deploy.yml` runs only on a push to `main` or by hand, and GitHub Pages is set to build from that workflow (`build_type: workflow`). The bot pushes only to `bot/price-refresh`. The site changes only when a person merges the PR.

### Coverage

| Distributor | Page read | Bikes |
|---|---|---|
| Bajaj (Uttara Motors) | `bajajauto.com/en-bd/bikes/<model>`, one page per variant | 10 |
| Honda (BHL) | `bdhonda.com/products/<model>`, variant dropdown | 10 |
| Suzuki (Rancon) | `suzuki.com.bd/bikes`, "start from" price per model | 9 |
| Hero (HMCL Niloy) | `heromotocorp.com/en-bd/products/<type>/<model>-price-in-bangladesh.html` | 9 |
| Royal Enfield (IFAD) | `royalenfield.com/bd/en/motorcycles/<model>/` | 2 (Hunter, Bullet) |
| Walton | `waltonbd.com/<model>` | 1 |

Not covered automatically. These stay on the owner checklist:

- **Royal Enfield Classic 350 and Meteor 350; Suzuki Gixxer FI ABS and its FI variants.** Their official pages load prices in the browser, so the HTML has none. Check the official page in a browser.
- **Hero Splendor+.** Hero lists the model, but no BD price page was found.
- **Bajaj Avenger 160, Suzuki V-Strom SX 250.** They are not on the distributor's BD list. The PR flags them every month until the data changes.
- **TVS, Yamaha, KTM, Runner, Lifan, GPX, Haojue, Zontes, Vespa, Aprilia.** No official BD price page is parsed. Prices come from BikeBD.
- **Used-only bikes (Bikroy and others).** Bikroy's and BikeBD's terms and robots rules forbid scraping, so no script may fetch them. Open them in a browser.

## What the owner does each month (2-3 hours)

1. **Merge the bot PR**, around the 1st (about 15 minutes; see below).
2. **Work one checklist batch each week** (about 17 bikes at 2-3 minutes each: 35-50 minutes). For each bike:
   - open its source link in a browser; for TVS and Yamaha, also try the distributor's own page or a showroom;
   - update `priceBDT`, `priceSource` and `priceAsOf` (YYYY-MM) in `src/data/bikes.json`, and any `variants` prices;
   - if the price did not change, still set `priceAsOf` to the current month;
   - for used-only bikes, take the typical asking price from current listings.
3. **Push each batch.** Run `npm run validate` and `node scripts/sources.mjs`, then commit and push to `main` (or open a PR). Tick the batch's boxes in the bot PR description; ticking works even after a merge.
4. **Act on "Availability unconfirmed".** Ask the distributor or a showroom. While you wait, set `"availability": "unconfirmed"` on the bike (its page and card then say so) and note why in `dataNote`. If the model is on sale, remove the field; if it is gone, set `status` or remove the bike in a normal change.

## The price-age gate

`npm run validate` (run by `deploy.yml` and `check.sh`) ages each `priceAsOf` from the first of its month:

- **On-sale bikes** (their page says "Price checked"): a warning after 90 days, an error after 180 days. An error blocks the deploy.
- **Used-only bikes** (their page says "Used-price estimate"): a warning only, however old.

The bike page also ages the badge on the visitor's clock: the dot turns amber after 60 days and red after 120, with a "may be out of date" note.

### Emergency deploy with stale prices

If an urgent code fix must ship while some on-sale prices are past 180 days, raise the limit for that one run:

- **GitHub:** Actions → deploy → Run workflow, and set `price_fail_days` (for example `240`). A push to `main` always uses 180.
- **Locally:** `PRICE_FAIL_DAYS=240 npm run validate` (or `scripts/check.sh`).

A value that is not a number fails the run. This only unblocks the deploy: re-check the listed prices next, because the badges on those pages are red.

## How to merge the bot PR

1. Read the **Official prices** table. For each `changed` row, open the page link and confirm the figure. Check that it is the right variant, and that it is a regular price, not a time-limited offer (offers go in `src/data/offers.json`).
2. For `suspect` and `missing` rows, check the page by hand. Edit `bikes.json` on the PR branch if the change is real.
3. CI does not run on its own: GitHub does not start workflows for pushes or PRs made with `GITHUB_TOKEN`. To run `check.yml` on the PR, close it and reopen it. Or check out `bot/price-refresh`, run `scripts/check.sh` and push any fix.
4. Merge. The push to `main` runs `deploy.yml`, which validates, tests, builds and deploys.
5. Merge or close the PR before the next 1st. The next run force-pushes `bot/price-refresh` from `main`, so commits left on that branch are lost.

## One-time setup

- **Let Actions open PRs.** In Settings → Actions → General → Workflow permissions, tick "Allow GitHub Actions to create and approve pull requests". It is off today, and until it is on, `gh pr create` fails. Leave the default token permission on "Read": the workflow asks for `contents: write` and `pull-requests: write` itself.
- **Scheduled runs pause.** GitHub disables schedules after 60 days with no repository activity. If a month passes with no PR, re-enable the workflow in the Actions tab.

## Running it locally

```sh
npm run refresh:prices -- --dry-run                 # fetch, compare, print the PR body; writes nothing
npm run refresh:prices -- --dry-run --body out.md   # same, body to a file
npm run refresh:prices                              # also writes bikes.json (what the Action does)
```

The list of changes goes to stderr. The script exits 1, writing nothing, when every page fails to load (network down).

## When a distributor redesigns its site

When a redesign breaks a parser, every row for that host shows `missing: ... page lists: nothing`, and its bikes move to the checklist. Nothing wrong is written. To fix a parser:

1. Save the new page and trim it to the price markup in `tests/fixtures/price-refresh/`.
2. Update that host's regex in `PARSERS` (and `LISTS` if the model list changed).
3. Update the expected rows in `tests/price-refresh.test.ts`, then run `npm test`.

Adding a bike priced from an official page: add a row to `OFFICIAL`. `npm test` fails if one is missing or names an unknown bike or variant.
