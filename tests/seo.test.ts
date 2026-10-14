import { test } from "node:test";
import assert from "node:assert/strict";
import { langAlternates, langHref } from "../src/lib/site";
import { productJsonLd } from "../src/lib/bikes";
import bikes from "../src/data/bikes.json";
import type { Bike } from "../src/lib/types";
import sitemap from "../src/app/sitemap";
import history from "../src/data/generated/price-history.json"; // every bike id bikes.json has ever had (scripts/build-history.ts)
import { POPULAR_COMPARISONS, RETIRED_BIKES, bikeMetadata, bikeTitle, pairBySlug, pairHref, pairMetadata, pairSlug, pairsForBike } from "../src/lib/curated";

test("langHref maps EN and BN twins and keeps query and hash", () => {
  assert.equal(langHref("/", "bn"), "/bn/");
  assert.equal(langHref("/bn/", "en"), "/");
  assert.equal(langHref("/bn", "en"), "/");
  assert.equal(langHref("/compare/?bikes=a,b#engine", "bn"), "/bn/compare/?bikes=a,b#engine");
  assert.equal(langHref("/bn/compare/?bikes=a,b#engine", "en"), "/compare/?bikes=a,b#engine");
  assert.equal(langHref("/bikes/bajaj-pulsar-n160/", "bn"), "/bn/bikes/bajaj-pulsar-n160/");
  assert.equal(langHref("/bn/bikes/bajaj-pulsar-n160/", "bn"), "/bn/bikes/bajaj-pulsar-n160/");
  for (const p of ["privacy", "terms", "disclaimer", "saved", "feedback", "owner", "maintenance", "maintenance/tyre-pressure", "guide/motorcycle-fines", "guide/e-fines", "compare/a-vs-b"]) {
    assert.equal(langHref(`/${p}/`, "bn"), `/bn/${p}/`);
  }
});

test("langHref leaves pages without a Bangla twin and non-paths alone", () => {
  assert.equal(langHref("/nope/", "bn"), "/nope/");
  assert.equal(langHref("/bikes/a/b/", "bn"), "/bikes/a/b/");
  assert.equal(langHref("/bnx/", "en"), "/bnx/");
  assert.equal(langHref("mailto:x@y.z", "bn"), "mailto:x@y.z");
  assert.equal(langHref("#top", "bn"), "#top");
});

test("langAlternates gives canonical per language and the same hreflang set", () => {
  const langs = { en: "/cost/", bn: "/bn/cost/", "x-default": "/cost/" };
  assert.deepEqual(langAlternates("/cost/"), { canonical: "/cost/", languages: langs });
  assert.deepEqual(langAlternates("/cost/", "bn"), { canonical: "/bn/cost/", languages: langs });
});

// Properties schema.org defines on Product and Offer (https://schema.org/Product, https://schema.org/Offer) that we use.
const PRODUCT_PROPS = ["@context", "@type", "name", "brand", "category", "description", "url", "image", "offers"];
const OFFER_PROPS = ["@type", "price", "priceCurrency", "itemCondition", "url"]; // no availability or seller: the site sees no stock and sells nothing (N7)

test("Product JSON-LD: a list-price Offer only for bikes on sale with confirmed availability, valid schema.org properties", () => {
  const all = bikes as unknown as Bike[];
  const onSale = all.find((b) => b.status === "on-sale" && !b.availability)!;
  const offer = (productJsonLd(onSale) as { offers?: Record<string, unknown> }).offers;
  assert.equal(offer?.["@type"], "Offer");
  assert.equal(offer?.price, onSale.priceBDT);
  assert.equal(offer?.priceCurrency, "BDT");
  assert.ok(!("availability" in offer!) && !("seller" in offer!), "no stock or seller claim");
  assert.equal(offer?.itemCondition, "https://schema.org/NewCondition");
  for (const b of all) {
    const ld = productJsonLd(b) as Record<string, unknown> & { offers?: Record<string, unknown> };
    const sells = b.status === "on-sale" && b.availability !== "unconfirmed" && b.priceBDT > 0;
    assert.equal("offers" in ld, sells, `${b.id}: ${b.status} ${b.availability ?? ""}`);
    for (const k of Object.keys(ld)) assert.ok(PRODUCT_PROPS.includes(k), `${b.id}: Product.${k}`);
    for (const k of Object.keys(ld.offers ?? {})) assert.ok(OFFER_PROPS.includes(k), `${b.id}: Offer.${k}`);
    assert.equal(typeof ld.name, "string");
    assert.match(String(ld.url), /^https:\/\/suggest\.bike\/bikes\/[a-z0-9-]+\/$/);
  }
  assert.ok(all.some((b) => b.availability === "unconfirmed"), "fixture: an unconfirmed bike exists to prove it gets no Offer");
  assert.equal(productJsonLd(onSale).description, onSale.tagline);
  assert.equal(productJsonLd(onSale, "bn").description, onSale.bn?.tagline ?? onSale.tagline);
});

test("sitemap: a real lastmod per dated page, no changefreq, same date for EN and BN twins", () => {
  const all = bikes as unknown as Bike[];
  const entries = sitemap();
  const at = (path: string) => entries.find((e) => e.url === `https://suggest.bike${path}`);
  assert.ok(entries.every((e) => !("changeFrequency" in e)));
  for (const b of all) {
    const d = String(at(`/bikes/${b.id}/`)?.lastModified);
    assert.match(d, /^\d{4}-\d{2}-\d{2}$/, b.id);
    assert.ok(d >= `${b.priceAsOf}-01` && d <= new Date().toISOString().slice(0, 10), `${b.id}: ${d} vs priceAsOf ${b.priceAsOf}`);
    assert.equal(at(`/bn/bikes/${b.id}/`)?.lastModified, d);
  }
  const newest = all.map((b) => String(at(`/bikes/${b.id}/`)?.lastModified)).sort().at(-1);
  assert.equal(at("/bikes/")?.lastModified, newest); // the catalogue page is as new as its newest bike
  assert.match(String(at("/guide/motorcycle-fines/")?.lastModified), /^\d{4}-\d{2}-\d{2}$/);
  for (const p of ["/privacy/", "/terms/", "/about/"]) assert.equal(at(p)?.lastModified, undefined, `${p}: no dated data, no invented lastmod`);
});

test("bike titles use BD search words, stay under 60 characters, and Bangla pages keep Bangla titles", () => {
  const all = bikes as unknown as Bike[];
  const n160 = all.find((b) => b.id === "bajaj-pulsar-n160")!;
  assert.equal(bikeTitle(n160, "en"), "Bajaj Pulsar N160 price in BD and EMI (dam koto)");
  assert.equal(bikeTitle(n160, "bn"), "Bajaj Pulsar N160-এর দাম কত? অন-রোড খরচ ও কিস্তি");
  for (const b of all) {
    const en = bikeTitle(b, "en");
    const bn = bikeTitle(b, "bn");
    assert.ok(en.length <= 60, `${b.id}: "${en}" is ${en.length} characters`);
    assert.ok(bn.length <= 60, `${b.id}: "${bn}" is ${bn.length} characters`);
    assert.ok(en.includes(b.model) && en.endsWith("(dam koto)"), en);
    if (`${b.brand} ${b.model} price in BD (dam koto)`.length <= 60) assert.ok(en.startsWith(b.brand), `${b.id}: "${en}" drops the brand`);
    assert.match(en, b.status === "used-only" ? / used price in BD/ : / price in BD/);
    assert.ok(!(b.status === "used-only" && /EMI|on-road/.test(en)), `${b.id}: a used-only bike has no on-road price or EMI`);
    assert.ok(bn.includes(b.model) && bn.includes("দাম কত"), bn);
  }
  const meta = bikeMetadata(n160, "en");
  assert.deepEqual(meta.title, { absolute: bikeTitle(n160, "en") }); // no " · Suggest.Bike" suffix
  assert.match(String(meta.description), /^Bajaj Pulsar N160 er dam koto\? ৳[\d,]+ on-road in Bangladesh/);
  assert.match(String(bikeMetadata(n160, "bn").description), /^Bajaj Pulsar N160-এর দাম অন-রোড ৳/);
});

test("sitemap lists the fines guide and every popular pair in EN and BN, and not the noindex /saved/", () => {
  const urls = sitemap().map((e) => e.url.replace("https://suggest.bike", ""));
  assert.equal(new Set(urls).size, urls.length, "duplicate sitemap URL");
  const want = ["/guide/motorcycle-fines/", "/guide/speed-limits/", "/guide/driving-licence/", "/guide/e-fines/", ...POPULAR_COMPARISONS.map(([a, b]) => pairHref(a, b))];
  for (const p of want) for (const u of [p, langHref(p, "bn")]) assert.ok(urls.includes(u), `${u} missing from sitemap`);
  assert.ok(!urls.some((u) => u.includes("/saved/")));
  for (const u of urls.filter((u) => u.startsWith("/bn/"))) assert.ok(urls.includes(langHref(u, "en")), `${u} has no EN twin in the sitemap`);
});

test("every popular comparison resolves to two bikes, with its own title and canonical per language", () => {
  const titles = new Set<string>();
  for (const [a, b] of POPULAR_COMPARISONS) {
    const slug = pairSlug(a, b);
    assert.ok(pairBySlug(slug), `${slug}: a bike id is missing from bikes.json`);
    for (const lang of ["en", "bn"] as const) {
      const m = pairMetadata(slug, lang);
      assert.equal(m.alternates?.canonical, lang === "bn" ? `/bn${pairHref(a, b)}` : pairHref(a, b));
      assert.doesNotMatch(String(m.description), /undefined|NaN/);
      titles.add(String(m.title));
    }
  }
  assert.equal(titles.size, POPULAR_COMPARISONS.length * 2, "duplicate pair title");
});

test("/saved/ and /bn/saved/ stay noindex (a per-browser list)", async () => {
  const { readFileSync } = await import("node:fs");
  for (const f of ["src/app/saved/page.tsx", "src/app/bn/saved/page.tsx"]) assert.match(readFileSync(f, "utf8"), /robots: \{ index: false/, f);
});

test("pairsForBike returns matching comparisons with valid other bikes and crawlable hrefs", () => {
  for (const [a, b] of POPULAR_COMPARISONS) {
    const forA = pairsForBike(a);
    const forB = pairsForBike(b);
    assert.ok(forA.some((p) => p.other.id === b && p.href === pairHref(a, b)), `${a} missing pair for ${b}`);
    assert.ok(forB.some((p) => p.other.id === a && p.href === pairHref(a, b)), `${b} missing pair for ${a}`);
  }
});

test("every indexable sitemap URL has a valid /bn/ twin mapping via langHref", () => {
  for (const entry of sitemap()) {
    const url = entry.url.replace("https://suggest.bike", "");
    if (!url.startsWith("/bn/")) {
      const bn = langHref(url, "bn");
      assert.ok(bn.startsWith("/bn/"), `${url} failed to map to /bn/ via langHref (got ${bn})`);
    }
  }
});

test("out/ contains zero orphan pages when built", async () => {
  const { existsSync, readdirSync, statSync, readFileSync } = await import("node:fs");
  const { join, relative } = await import("node:path");
  if (!existsSync("out")) return;

  function getHtmlFiles(dir: string): string[] {
    let results: string[] = [];
    for (const file of readdirSync(dir)) {
      const full = join(dir, file);
      if (statSync(full).isDirectory()) {
        results = results.concat(getHtmlFiles(full));
      } else if (file.endsWith(".html")) {
        results.push(full);
      }
    }
    return results;
  }

  const allHtml = getHtmlFiles("out");
  function fileToPath(f: string) {
    const rel = relative("out", f).replace(/\\/g, "/");
    if (rel === "index.html") return "/";
    if (rel.endsWith("/index.html")) return "/" + rel.slice(0, -10);
    if (rel.endsWith(".html")) return "/" + rel.slice(0, -5);
    return "/" + rel;
  }

  const urlToPathMap = new Map<string, string>();
  for (const f of allHtml) {
    let p = fileToPath(f);
    if (!p.endsWith("/")) p = p + "/";
    urlToPathMap.set(p, f);
  }

  const incoming = new Map<string, Set<string>>();
  for (const p of urlToPathMap.keys()) incoming.set(p, new Set());

  const hrefRegex = /href="([^"#?]+)(?:[#?][^"]*)?"/g;
  for (const [p, f] of urlToPathMap.entries()) {
    const content = readFileSync(f, "utf8");
    let match;
    while ((match = hrefRegex.exec(content)) !== null) {
      let href = match[1];
      if (href.startsWith("http://") || href.startsWith("https://") || href.startsWith("mailto:") || href.startsWith("tel:")) continue;
      if (!href.startsWith("/")) continue;
      if (!href.endsWith("/") && !href.includes(".")) href = href + "/";
      if (incoming.has(href)) incoming.get(href)!.add(p);
    }
  }

  const orphans: string[] = [];
  for (const [p, inc] of incoming.entries()) {
    if (p === "/" || p === "/bn/" || p === "/404/" || p === "/_not-found/" || p.includes("404")) continue;
    if (inc.size === 0) orphans.push(p);
  }
  assert.equal(orphans.length, 0, `Found ${orphans.length} orphan pages: ${orphans.join(", ")}`);
});

test("a bike removed from bikes.json keeps a redirect page, and leaves the sitemap", () => {
  const live = new Set((bikes as Bike[]).map((b) => b.id));
  for (const id of Object.keys(history.bikes)) assert.ok(live.has(id) || RETIRED_BIKES.includes(id), `${id} was published and has no page: add it to RETIRED_BIKES`);
  const urls = sitemap().map((e) => e.url);
  for (const id of RETIRED_BIKES) {
    assert.ok(!live.has(id), `${id} is back in bikes.json; drop it from RETIRED_BIKES`);
    assert.ok(!urls.some((u) => u.includes(`/bikes/${id}/`)), id);
  }
});
