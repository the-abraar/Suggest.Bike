# Google Search Console setup for suggest.bike

Owner-only steps: they need your Google and Namecheap logins. The whole setup takes about 20 minutes, plus waiting for DNS.

State on 2026-10-13 (checked with `dig` and `curl`):
- `https://suggest.bike` is live on GitHub Pages. `http://` and `www.` both redirect (301) to `https://suggest.bike/`.
- `robots.txt` allows everything and points to `https://suggest.bike/sitemap.xml`.
- The live sitemap has 194 URLs. The local `main` branch has one commit that isn't pushed yet (SEO run 1); after you push it, the sitemap lists 212 URLs, including the fines page and the comparison pages.
- No Google verification record exists yet. The only TXT record is Namecheap's email (SPF) record. Keep it.

## 0. Before you start

Push `main` first, so Google reads the newest sitemap:

```bash
git push origin main
```

Wait until the deploy workflow on GitHub (Actions → Deploy) is green. Then check the URL count:

```bash
curl -s https://suggest.bike/sitemap.xml | grep -c "<loc>"   # expect 212
```

## 1. Add the site as a Domain property

1. Open https://search.google.com/search-console and sign in with the Google account that should own the site. Use an account you'll keep, not a temporary one.
2. Click the property menu (top left) → **Add property**.
3. Choose **Domain** (the left box), not "URL prefix". Type `suggest.bike` only: no `https://`, no `www`, no trailing slash.
4. Click **Continue**. Google shows a TXT record like `google-site-verification=AbC123...`. Click **Copy**. Leave this tab open.

Why Domain: one property then covers `https://`, `http://`, `www.` and any subdomain. The site redirects all of them to `https://suggest.bike/`, so you see every version in one place.

## 2. Add the TXT record in Namecheap

1. Open https://ap.www.namecheap.com → **Domain List** → **Manage** next to `suggest.bike` → **Advanced DNS** tab.
2. Under **Host Records**, click **Add New Record** and fill it in:

| Field | Value |
|-------|-------|
| Type  | `TXT Record` |
| Host  | `@` |
| Value | the whole `google-site-verification=...` string, without quotes |
| TTL   | `Automatic` |

3. Click the green check mark to save.

Don't touch the existing records: the 4 `A` records (185.199.108-111.153), the `www` CNAME (`the-abraar.github.io.`) and the SPF TXT record (`v=spf1 include:spf.efwd.registrar-servers.com ~all`). A domain can have several TXT records, so the new one sits next to the SPF record.

Common mistakes:
- Host typed as `suggest.bike` instead of `@`. Namecheap then creates `suggest.bike.suggest.bike`, and verification fails.
- The value pasted with quotes, a space, or only the part after `=`.
- Deleting or editing the SPF record. That breaks the `hello@suggest.bike` email forward.

## 3. Check the record, then verify

DNS usually updates in 5 to 30 minutes; sometimes it takes a few hours. Check it from your terminal:

```bash
dig +short TXT suggest.bike @8.8.8.8
```

When the output includes the `google-site-verification=...` line, go back to the Search Console tab and click **Verify**. If it says "Verification failed", wait 30 minutes and click **Verify** again. The tab can be closed in the meantime: open Search Console again, pick the unverified property, and you get the same record.

After it verifies, **keep the TXT record forever**. Google re-checks it from time to time, and the property loses its verification if the record is gone.

## 4. Submit the sitemap

1. In the new `suggest.bike` property, open **Indexing → Sitemaps** in the left menu.
2. Under "Add a new sitemap", enter `https://suggest.bike/sitemap.xml` (if the box already shows the domain, type only `sitemap.xml`) and click **Submit**.
3. Refresh after a few minutes. The status should say **Success**, with about 212 discovered pages.

If it says **Couldn't fetch**: that's common for a brand-new property and usually clears within a day. Check that `curl -sI https://suggest.bike/sitemap.xml` returns `200`, then wait. Submit again only if it still fails after 2 days.

You only submit once. Every deploy rewrites the same `sitemap.xml`, and Google re-reads it by itself.

## 5. Ask Google to index the key pages first

Google crawls a new site slowly. Push the most useful pages to the front of the queue:

1. Paste a URL into the **Inspect** bar at the top of Search Console and press Enter.
2. Wait for the result ("URL is not on Google" is normal at this stage), then click **Request indexing**.
3. Repeat for each page below. Google allows only about 10 requests a day, so do them in this order and continue the next day:

```
https://suggest.bike/
https://suggest.bike/bn/
https://suggest.bike/bikes/
https://suggest.bike/bn/bikes/
https://suggest.bike/guide/
https://suggest.bike/bn/guide/
https://suggest.bike/guide/motorcycle-fines/
https://suggest.bike/bn/guide/motorcycle-fines/
https://suggest.bike/cost/
https://suggest.bike/compare/
```

Don't request every bike page: the sitemap covers them. Requesting the same URL again doesn't make it faster.

## 6. Add Bing (5 minutes, also covers DuckDuckGo and Yahoo)

1. Open https://www.bing.com/webmasters and sign in. A Google account works.
2. Choose **Import from Google Search Console**, allow access, and select `suggest.bike`.
3. Bing copies the verification and the sitemap. No DNS change is needed.

## 7. What to expect in the first weeks

- **Days 1-3:** the Performance report is empty. Data starts 2-3 days after verification.
- **Weeks 1-4:** **Indexing → Pages** fills slowly. These statuses are normal and need no action:
  - *Discovered – currently not indexed* or *Crawled – currently not indexed*: Google hasn't got to the page or isn't sure about it yet. Common for a new site.
  - *Excluded by 'noindex' tag* for `/saved/` and `/bn/saved/`: intended. They only show a list stored in the visitor's browser.
  - *Page with redirect* for `http://` or `www.` URLs: intended.
  - *Not found (404)* for old or mistyped URLs: fine, unless the URL is one of ours from the sitemap.
- Things to report to the SEO agent (paste the message into `docs/seo-log.md`):
  - *Duplicate, Google chose different canonical than user*
  - *Server error (5xx)*
  - *Blocked by robots.txt*
  - Any sitemap URL with a 404
  - Any message under **Security & Manual actions**: these are rare, but serious.
- Search Console emails the owner about real problems, so turn the emails on: **Settings** (bottom left) → **Email preferences** → check that "suggest.bike" is selected.

## 8. Once a month: give the SEO agent the data

The SEO agent can't log in, so it needs these numbers from you.

1. Open **Performance → Search results**. Set **Date** to **Last 28 days**. Turn on all four boxes at the top: Total clicks, Total impressions, Average CTR, Average position.
2. On the **Queries** tab, click **Export** (top right) → **Download CSV**. Do the same on the **Pages** tab. Both come in one zip file.
3. Paste the top 25 rows of each into `docs/seo-log.md` under a dated heading, like this:

```markdown
## Search Console 2026-11-13 (last 28 days)

Totals: clicks 120, impressions 4,300, CTR 2.8%, position 24.1

### Queries
| Query | Clicks | Impressions | CTR | Position |
|-------|--------|-------------|-----|----------|
| pulsar n160 price in bd | 14 | 380 | 3.7% | 8.2 |

### Pages
| Page | Clicks | Impressions | CTR | Position |
|------|--------|-------------|-----|----------|
| https://suggest.bike/bikes/bajaj-pulsar-n160/ | 20 | 610 | 3.3% | 9.0 |
```

You can also drop the CSV files into the scratchpad and ask Claude to make the table. Don't commit the raw CSVs.

The SEO agent then improves titles and descriptions for pages with many impressions but a low CTR, and adds content for queries that land on the wrong page.

## 9. Don't

- Don't use **Removals** unless something private got indexed. It hides pages; it doesn't fix them.
- Don't change `robots.txt` or add `noindex` by hand. Ask the SEO agent, which adds a regression test in `tests/seo.test.ts`.
- Don't pay for "SEO packages", backlinks or Search Console "boosts". Link schemes can get the site demoted.
- Don't add a second property for `www.suggest.bike` or `http://`. The Domain property already covers them.
- Don't give other people the **Owner** role. If someone else needs access, use **Settings → Users and permissions → Add user**, with **Restricted** access.

## Done checklist

- [ ] `main` pushed and the deploy is green; the sitemap has about 212 URLs
- [ ] Domain property `suggest.bike` added
- [ ] TXT record added in Namecheap, and SPF record left as it was
- [ ] Verified, with the TXT record kept
- [ ] Sitemap submitted, status Success
- [ ] Indexing requested for the 10 key pages (over 1-2 days)
- [ ] Bing imported from Search Console
- [ ] Email alerts on
- [ ] Calendar reminder: monthly export to `docs/seo-log.md`

When the first five are done, tick the Search Console item in `docs/Todo_owner.md`.
