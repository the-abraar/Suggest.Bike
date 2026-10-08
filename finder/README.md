# Bike finder (experimental, coming soon)

A user describes a bike in detail on `/labs/finder/`. An agent searches public listings every midnight (Asia/Dhaka) and, when something fits, sends one WhatsApp message.

**Status: nothing here is live.** The site runs in preview mode (the form works, the request stays in the browser, no search runs). Everything below is built, tested on fixtures and documented, but not deployed.

## Layers

| Layer | Where | Notes |
| --- | --- | --- |
| Web form | `src/app/labs/finder/` | Static-safe. Posts JSON to `NEXT_PUBLIC_FINDER_ENDPOINT` when set, else preview mode. |
| Schema, normaliser, matcher | `src/lib/finder/` | Pure TypeScript. Shared by the site, the agent and the Worker. |
| Nightly agent | `finder/run.ts`, `finder/agent.ts` | Node + tsx. Global `fetch` only, no new dependencies. |
| Sources | `finder/sources/` | `fixtures` (tests) and `bikroy` (off by default). |
| WhatsApp | `finder/whatsapp.ts` | Official Cloud API, template messages. Dry run by default. |
| Scheduler | `.github/workflows/finder-nightly.yml` | 18:00 UTC = 00:00 Dhaka. Off until enabled. |
| Request API | `finder/worker/` | Cloudflare Worker reference. Not deployed. |

## Try it

```bash
npx tsx finder/test.mjs                       # self-test (10 checks)
npx tsx finder/run.ts --dry-run --fixtures    # demo match report, no network, nothing written
npx tsx finder/run.ts                         # dry run on finder/data/requests.json with enabled sources
FINDER_LIVE=1 npx tsx finder/run.ts           # REAL sends. Needs WHATSAPP_* env vars. See below.
npx tsx finder/run.ts --optout 01712345678    # file store: mark a number as opted out
npx tsx finder/run.ts --forget 01712345678    # file store: delete that number's requests and state
```

Env vars are listed in `finder/.env.example`. The scripts do not read `.env` themselves; use `node --env-file=finder/.env` or export them. Add the helper scripts to `package.json` if wanted, for example `"finder": "tsx finder/run.ts"` and `"finder:test": "tsx finder/test.mjs"`.

## How a listing is scored

`scoreListing(request, listing)` returns three lists plus a score from 0 to 100.

- **matched**: the ad states it (price within budget, colour, year in range, district, "blue book clear").
- **unverifiable**: the ad is silent, or only the seller claims it. These say "ask the seller" or "inspect". Every hidden detail (original cylinder sleeve, unmodified, single owner, original paint, service history) is at best a claim, never verified. Custom free-text requirements are always unverifiable.
- **mismatched**: the ad says something different.

Rules:
- The **model is a gate**. If the ad does not mention the model (English, Banglish or Bangla spelling), the score is 0. `rx115` matches "RX 115" and "আরএক্স ১১৫" but not "RX1150".
- **Hard** requirements (model, budget, year, km, district, "papers missing", and a must-have the ad contradicts, such as "rebored") make a listing ineligible when mismatched. Colour and unstated details are soft.
- Matched counts 1, unverifiable 0.5, mismatched 0, weighted: budget 25, colour 15, year 15, km 10, district 10, papers 10, must-haves 15.
- If the request has must-haves or a custom note the score is capped at 95, because those can never be verified from a post.
- Eligible means no hard mismatch and score of at least 60 (`MIN_SCORE`).
- De-duplication uses the listing URL (host + path, no query or fragment), or a hash of title, price and district when there is no valid URL.

## Message rules

- Only with `consent: true` (an unticked-by-default checkbox on the form), and never to an opted-out number. Opt-out is per number: STOP closes every request from that number.
- Dry run unless `FINDER_LIVE=1`. `--dry-run` or `--fixtures` always force a dry run. A dry run writes nothing back to the store.
- At most **1 message per number per 24 hours**, at most `FINDER_MAX_MESSAGES` (default 30) per run. A message carries the single best new match plus "+N more". The others wait for the next night.
- A listing is never sent twice to the same request.
- Requests **expire after 60 days** and are then skipped.
- Logs (`finder/data/run.log` for the file store, stdout always) contain request ids, counts and **masked** numbers (`+88017•••••678`). `log()` also masks any number it finds in its payload.

### WhatsApp template (owner action)

Messages outside the 24-hour customer window must use an approved template. Create one in Meta Business Manager, category **Utility** (or Marketing if Meta reclassifies it), English and optionally Bangla:

```
Bike finder: a new match for your request "{{1}}".
{{2}}
{{3}}
Always inspect the bike and check the papers before paying. Reply STOP to stop these messages.
```

Set `WHATSAPP_TEMPLATE`, `WHATSAPP_TEMPLATE_BN` (optional), `WHATSAPP_PHONE_ID`, `WHATSAPP_TOKEN` (a permanent system-user token). Template approval and a verified WhatsApp Business account take days; start early. Meta charges per conversation and the rules change, so check current pricing.

## Sources and terms of service

**Owner must do this before enabling any live source.**

- **Bikroy**: `finder/sources/bikroy.ts` is OFF unless `FINDER_BIKROY=1`. **Read Bikroy's terms of service and robots.txt first** and decide whether automated access is permitted for this purpose. If in doubt, ask Bikroy for permission or an API/partner feed. The adapter is polite (identifying User-Agent, robots.txt check, 4 s between requests, 2 pages per search, backs off on 403/429, one fetch per distinct query per run), public pages only, no images, no login. The kill switch is `FINDER_DISABLE_BIKROY=1` or an empty file named `finder/KILL`. **Its HTML parser is untested against the live site** (only a synthetic fixture), and the search URL is a best guess. Expect to adjust it.
- **Facebook Marketplace and groups are NOT scraped**, and there is no adapter for them. Facebook's terms forbid automated collection and the content is behind login. Do not add one.
- Other options that are safer: a partner feed, a manual "paste a listing link" flow, or sellers posting directly to Suggest.Bike.
- To add a source, implement `SourceAdapter { name; search(req): Promise<Listing[]> }` and add it to the list in `finder/run.ts`. Return `[]` on any failure.

## Storage

The agent talks to a `Store` (`finder/types.ts`).

1. **FileStore** (default): `finder/data/requests.json` (array of requests) and `state.json`. Git-ignored. Good for development.
2. **HttpStore**: set `FINDER_API` and `FINDER_ADMIN_TOKEN`. Reads and writes through the Worker's `/admin/state`. Recommended for production.
3. Alternatives you can implement in about 40 lines each: a **GitHub issue** per request (private repo; the form would need a proxy, as a browser cannot create issues without a token), or a **Google Sheet** via Apps Script web app (form posts to the script URL, the agent reads the sheet as CSV). Both hold personal data on a third party, so treat access as sensitive.

## Cloudflare Worker setup (owner action)

```bash
cd finder/worker
cp wrangler.toml.example wrangler.toml
npx wrangler kv namespace create FINDER_KV     # paste the id into wrangler.toml
npx wrangler secret put ADMIN_TOKEN            # long random string
npx wrangler secret put WHATSAPP_VERIFY_TOKEN  # any string; paste the same into Meta's webhook setup
npx wrangler secret put WHATSAPP_APP_SECRET    # from the Meta app
npx wrangler deploy
```

Then:
1. Build the site with `NEXT_PUBLIC_FINDER_ENDPOINT=https://<worker>/requests`. The page then switches from preview to live mode.
2. In Meta, set the webhook URL to `https://<worker>/whatsapp/webhook` and subscribe to `messages`. An incoming "STOP" (also "unsubscribe", "cancel", "quit", "বন্ধ", "স্টপ") marks the number opted out.
3. Add `FINDER_API` and `FINDER_ADMIN_TOKEN` to GitHub secrets and set the variable `FINDER_ENABLED=true`.

The Worker accepts `POST /requests` only from `SITE_ORIGIN`, rejects bodies over 8 KB, validates with the shared schema, and limits each IP to 5 requests per hour (KV is eventually consistent, so add a Cloudflare Rate Limiting rule for a hard limit). It is typed without `@cloudflare/workers-types` so the root `npm run typecheck` needs no extra packages.

The Worker file imports the shared code from `../../src/lib/finder`, so `wrangler` bundles it directly.

## Privacy and retention

- Collected: the request fields and a WhatsApp number, plus the time consent was given. No names, no addresses, no accounts.
- Used only to search and to message that number about that request.
- Not sold, not shared, no ads, no analytics on this page.
- **Retention**: requests auto-delete from KV 65 days after creation (60-day life plus 5 days grace). Match history inside state keeps at most 20 links per request and goes with it.
- **Deletion on request**: reply STOP (opt-out stops all messages at once), or email the contact address. To delete a number by hand: file store, `--forget <number>`; Worker, find the keys with `npx wrangler kv key list --binding FINDER_KV --prefix req:` and remove them with `kv key delete`, and delete the `phone:<id>` key (`phoneId` = first 24 hex of SHA-256 of `+8801...`). Keep the opt-out record if the person asked to stop, so we never message them again.
- Numbers are used as storage keys only after hashing (`phone:<id>`); the raw number lives inside the request record.
- GitHub Actions logs are visible to repo collaborators. The agent logs only masked numbers.
- No secrets in the repo: tokens go in GitHub/Worker secrets. `finder/.gitignore` excludes `data/`, `.env`, `wrangler.toml`.
- Check Bangladesh's data-protection and telecom rules and Meta's WhatsApp Business policy before launch. This README is not legal advice.

## Known gaps

- Bikroy parser and URL unverified live.
- No reply message on STOP (the Worker has a TODO; it needs a free-form send within the 24-hour window).
- Opt-out and expiry reach the Worker via the agent's state write; there is no per-request delete API for users yet.
- The scoring reads titles and descriptions only. It never inspects photos.
- Per-IP rate limiting on KV is approximate.
