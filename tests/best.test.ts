import { test } from "node:test";
import assert from "node:assert/strict";
import bikes from "../src/data/bikes.json";
import guide from "../src/data/guide.json";
import sitemap from "../src/app/sitemap";
import { langHref } from "../src/lib/site";
import { CLASS_150, INTENTS, LANDING_PATHS, bestPicks, faqJsonLd, landing, monthlyCost, type Landing } from "../src/lib/best";
import { BIKES, getBike } from "../src/lib/bikes";
import { matchBikes } from "../src/lib/match";
import type { BikeLite } from "../src/lib/types";

const RAW = bikes as unknown as BikeLite[];
const byId = new Map(RAW.map((b) => [b.id, b]));
const BANDS = guide.registration.bands;
const latin = (s: string) => s.replace(/[০-৯]/g, (d) => String("০১২৩৪৫৬৭৮৯".indexOf(d)));
// On-road worked out straight from the JSON (not via cost.ts): ex-showroom + the 2-year package of the bike's cc band.
const rawOnRoad = (b: BikeLite) => b.priceBDT + (BANDS.find((x) => b.engine.cc <= x.ccMax) ?? BANDS[BANDS.length - 1]).totalBDT;

/** Every ৳ figure the site may print on these pages: bikes.json prices, guide.json fees, and the cost engine's monthly figure. */
const ALLOWED = new Set<number>([
  ...RAW.flatMap((b) => [b.priceBDT, rawOnRoad(b)]),
  ...BIKES.map(monthlyCost), // EVs get their mileage at build time, so the engine reads the built records
  ...BANDS.flatMap((x) => [x.totalBDT, x.totalBDT10yr, x.totalBDT10yr - x.totalBDT]), // the last: "10-year token costs ৳X more"
]);
const text = (p: Landing) => [p.title, p.description, p.h1, p.intro, p.note ?? "", ...p.rows.flatMap((r) => [r.name, ...r.cells]), ...p.faq.flat()].join("\n");
const pages = LANDING_PATHS.flatMap((path) => (["en", "bn"] as const).map((lang) => ({ path, lang, p: landing(path, lang)! })));

test("every landing page builds in EN and BN with a title, description, rows and FAQ", () => {
  assert.equal(LANDING_PATHS.length, 10);
  for (const { path, lang, p } of pages) {
    assert.ok(p, `${path} ${lang}`);
    assert.ok(p.title && p.description.length > 50, `${path} ${lang}: description`);
    assert.ok(p.rows.length > 0 && p.faq.length >= 3, `${path} ${lang}: rows and FAQ`);
    if (lang === "bn") assert.match(p.h1, /[ঀ-৿]/, `${path}: Bangla h1`);
  }
});

test("every ৳ amount on the landing pages comes from bikes.json, guide.json or the cost engine", () => {
  for (const { path, lang, p } of pages) {
    let s = latin(text(p));
    const intent = INTENTS.find((i) => path === `/best/${i.slug}/`);
    // "৳2 lakh" / "২ লাখ টাকা" are the page's own budget input, so they must equal it.
    for (const m of s.matchAll(/৳(\d+(?:\.\d+)?) lakh|(\d+(?:\.\d+)?) লাখ টাকা/g)) {
      assert.equal(Number(m[1] ?? m[2]) * 100000, intent?.answers.budget, `${path} ${lang}: "${m[0]}"`);
    }
    s = s.replace(/৳\d+(?:\.\d+)? lakh/g, "");
    const amounts = [...s.matchAll(/৳([\d,]+)/g)].map((m) => Number(m[1].replace(/,/g, "")));
    assert.ok(amounts.length > 0, `${path} ${lang}: has prices`);
    for (const n of amounts) assert.ok(ALLOWED.has(n), `${path} ${lang}: ৳${n} is not a figure from the data`);
  }
});

test("best pages show the match engine's top 5, each priced from bikes.json", () => {
  for (const i of INTENTS) {
    const r = bestPicks(i.slug)!;
    assert.deepEqual(r.picks.map((m) => m.bike.id), matchBikes(r.answers, 5).map((m) => m.bike.id));
    for (const lang of ["en", "bn"] as const) {
      const p = landing(`/best/${i.slug}/`, lang)!;
      p.rows.forEach((row, k) => {
        const b = byId.get(row.href!.split("/")[2])!;
        assert.equal(b.id, r.picks[k].bike.id, `${i.slug}: row ${k}`);
        assert.equal(latin(row.cells[0]), `৳${rawOnRoad(b).toLocaleString("en-IN")}`, `${i.slug} ${b.id}: on-road`);
        assert.equal(latin(row.cells[1]), `৳${monthlyCost(getBike(b.id)!).toLocaleString("en-IN")}`, `${i.slug} ${b.id}: monthly`);
      });
    }
  }
});

test("the 150cc list is every on-sale 140-165cc bike, cheapest first, inside BRTA's 126-165cc band", () => {
  const p = landing("/150cc-price-list/", "en")!;
  assert.equal(CLASS_150.max, BANDS.find((x) => 150 <= x.ccMax)!.ccMax);
  const want = RAW.filter((b) => b.status === "on-sale" && b.engine.cc >= CLASS_150.min && b.engine.cc <= CLASS_150.max).sort((a, b) => rawOnRoad(a) - rawOnRoad(b));
  assert.deepEqual(p.rows.map((r) => r.href), want.map((b) => `/bikes/${b.id}/`));
});

test("the BRTA page lists every guide.json registration band", () => {
  const p = landing("/brta-registration-cost-2026/", "en")!;
  assert.deepEqual(p.rows.map((r) => r.cells), BANDS.map((b) => [`৳${b.totalBDT.toLocaleString("en-IN")}`, `৳${b.totalBDT10yr.toLocaleString("en-IN")}`]));
  assert.ok(p.note?.includes("brta.gov.bd"), "points readers to BRTA to confirm");
});

test("FAQ JSON-LD mirrors the visible FAQ with valid schema.org types", () => {
  for (const { p } of pages) {
    const ld = faqJsonLd(p);
    assert.equal(ld["@type"], "FAQPage");
    assert.deepEqual(ld.mainEntity.map((q) => [q.name, q.acceptedAnswer.text]), p.faq);
    for (const q of ld.mainEntity) assert.deepEqual([q["@type"], q.acceptedAnswer["@type"]], ["Question", "Answer"]);
  }
});

test("landing pages are in the sitemap in EN and BN, and map to their /bn/ twin", () => {
  const urls = new Set(sitemap().map((e) => e.url));
  for (const path of LANDING_PATHS) {
    assert.ok(urls.has(`https://suggest.bike${path}`), path);
    assert.ok(urls.has(`https://suggest.bike/bn${path}`), `/bn${path}`);
    assert.equal(langHref(path, "bn"), `/bn${path}`);
  }
});
