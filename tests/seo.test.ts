import { test } from "node:test";
import assert from "node:assert/strict";
import { langAlternates, langHref } from "../src/lib/site";
import { productJsonLd } from "../src/lib/bikes";
import bikes from "../src/data/bikes.json";
import type { Bike } from "../src/lib/types";
import sitemap from "../src/app/sitemap";
import { POPULAR_COMPARISONS, pairBySlug, pairHref, pairMetadata, pairSlug } from "../src/lib/curated";

test("langHref maps EN and BN twins and keeps query and hash", () => {
  assert.equal(langHref("/", "bn"), "/bn/");
  assert.equal(langHref("/bn/", "en"), "/");
  assert.equal(langHref("/bn", "en"), "/");
  assert.equal(langHref("/compare/?bikes=a,b#engine", "bn"), "/bn/compare/?bikes=a,b#engine");
  assert.equal(langHref("/bn/compare/?bikes=a,b#engine", "en"), "/compare/?bikes=a,b#engine");
  assert.equal(langHref("/bikes/bajaj-pulsar-n160/", "bn"), "/bn/bikes/bajaj-pulsar-n160/");
  assert.equal(langHref("/bn/bikes/bajaj-pulsar-n160/", "bn"), "/bn/bikes/bajaj-pulsar-n160/");
  for (const p of ["privacy", "terms", "disclaimer", "saved", "feedback", "guide/motorcycle-fines", "compare/a-vs-b"]) assert.equal(langHref(`/${p}/`, "bn"), `/bn/${p}/`);
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

test("Product JSON-LD has an Offer only for bikes on sale", () => {
  const all = bikes as unknown as Bike[];
  const onSale = all.find((b) => b.status === "on-sale")!;
  const used = all.find((b) => b.status === "used-only")!;
  const offer = (productJsonLd(onSale) as { offers?: Record<string, unknown> }).offers;
  assert.equal(offer?.["@type"], "Offer");
  assert.equal(offer?.price, onSale.priceBDT);
  assert.equal(offer?.priceCurrency, "BDT");
  assert.equal("availability" in offer!, false); // no stock data, so no InStock claim
  assert.equal("offers" in productJsonLd(used), false);
  assert.equal(productJsonLd(onSale).description, onSale.tagline);
  assert.equal(productJsonLd(onSale, "bn").description, onSale.bn?.tagline ?? onSale.tagline);
});

test("sitemap lists the fines guide and every popular pair in EN and BN, and not the noindex /saved/", () => {
  const urls = sitemap().map((e) => e.url.replace("https://suggest.bike", ""));
  assert.equal(new Set(urls).size, urls.length, "duplicate sitemap URL");
  const want = ["/guide/motorcycle-fines/", ...POPULAR_COMPARISONS.map(([a, b]) => pairHref(a, b))];
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
