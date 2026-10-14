// Monthly price refresh (scripts/price-refresh.ts): parsers pinned to trimmed live pages, OFFICIAL kept in step with
// bikes.json, and the rules that decide which prices get written. No network. Run: npm test.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import bikesJson from "../src/data/bikes.json";
import { LISTS, OFFICIAL, PARSERS, apply, body, check, listKeys, robotsAllows, type Bike } from "../scripts/price-refresh";

const fx = (f: string) => readFileSync(new URL(`fixtures/price-refresh/${f}`, import.meta.url), "utf8");
const host = (u: string) => new URL(u).hostname.replace(/^www\./, "");
const bikes = bikesJson as unknown as Bike[];

test("price-refresh: each distributor parser reads its trimmed live page", () => {
  const cases: [string, string, { name: string; price: number }[]][] = [
    ["bajajauto.com", "bajaj-pulsar-n160-dc-abs.html", [{ name: "PULSAR N160", price: 273600 }]],
    ["bdhonda.com", "honda-sp160.html", [{ name: "Single Disc", price: 199000 }, { name: "Double Disc ABS", price: 225000 }]],
    ["bdhonda.com", "honda-sp125.html", [{ name: "SP 125", price: 167000 }]], // value="167,000": Honda sometimes writes commas
    ["suzuki.com.bd", "suzuki-bikes.html", [{ name: "GIXXER 250", price: 379950 }, { name: "GIXXER", price: 237950 }, { name: "GIXXER MONOTONE", price: 199950 }]],
    ["royalenfield.com", "re-bullet-350.html", [{ name: "Black Gold", price: 437500 }, { name: "Standard - Maroon", price: 417500 }]],
    ["royalenfield.com", "re-hunter-350.html", [{ name: "Rebel Blue", price: 371500 }]],
    ["heromotocorp.com", "hero-hunk-150r.html", [{ name: "Hunk 150R DD", price: 198000 }, { name: "Hunk 150R DD ABS", price: 210000 }]],
    ["waltonbd.com", "walton-takyon-fusion-25td.html", [{ name: "TAKYON FUSION 25TD", price: 161999 }]],
  ];
  for (const [h, file, want] of cases) assert.deepEqual(PARSERS[h](fx(file)), want, file);
  assert.deepEqual(PARSERS["bajajauto.com"]("<html>redesigned page</html>"), [], "an unknown layout yields no rows, never a guess");
});

test("price-refresh: each model list yields the slugs or names the availability check looks up", () => {
  const cases: [string, string, string[]][] = [
    ["bajajauto.com", "bajaj-pulsar-n160-dc-abs.html", ["pulsar-n160", "pulsar-n160-dc-abs", "platina-100-es"]],
    ["bdhonda.com", "honda-sp160.html", ["sp160", "sp125", "shine100dx"]],
    ["suzuki.com.bd", "suzuki-bikes.html", ["gixxer 250", "gixxer", "gixxer monotone"]],
    ["royalenfield.com", "re-bullet-350.html", ["bullet-350", "hunter-350", "classic-350"]],
    ["heromotocorp.com", "hero-hunk-150r.html", ["hunk-150r", "splendor-plus", "xtreme-125r-abs"]], // the last is only in an escaped JSON attribute
    ["waltonbd.com", "walton-takyon-fusion-25td.html", ["takyon-fusion-25td", "takyon-fusion-25tr"]],
  ];
  for (const [h, file, want] of cases) assert.deepEqual([...listKeys(fx(file), LISTS[h][0])], want, file);
});

test("price-refresh: robots.txt rules for User-agent * are honoured", () => {
  const re = "User-agent: *\nAllow: *\nAllow: /bd*\nDisallow: /in/en/twins*\n";
  assert.equal(robotsAllows(re, "/bd/en/motorcycles/bullet-350/"), true);
  assert.equal(robotsAllows(re, "/in/en/twins-650/"), false);
  assert.equal(robotsAllows("User-agent: Bytespider\nDisallow: /\n\nUser-agent: *\nDisallow:\n", "/products/sp160"), true);
  assert.equal(robotsAllows("User-agent: foo\nUser-agent: *\nDisallow: /api/ # private\n", "/api/x"), false, "consecutive User-agent lines share rules");
  assert.equal(robotsAllows("User-agent: *\nDisallow: /*.php$\n", "/a.php"), false);
  assert.equal(robotsAllows("User-agent: *\nDisallow: /*.php$\n", "/a.php?x"), true);
  assert.equal(robotsAllows("", "/anything"), true);
});

// Official pages that render these prices in the browser only, so no fetch can read them; they stay on the owner's checklist.
const BROWSER_ONLY = new Set([
  "royal-enfield-classic-350|",
  "royal-enfield-meteor-350|", "royal-enfield-meteor-350|Base", "royal-enfield-meteor-350|Stellar Matt Grey", "royal-enfield-meteor-350|Aurora Red", "royal-enfield-meteor-350|Supernova Black",
  "suzuki-gixxer-fi-abs|", "suzuki-gixxer-fi-abs|Fuel Injection, Double Disc", "suzuki-gixxer-fi-abs|Fuel Injection, Double Disc ABS",
]);

test("price-refresh: OFFICIAL covers every price taken from a distributor page and names only real bikes", () => {
  const keys = OFFICIAL.map(([id, v]) => `${id}|${v}`);
  assert.equal(new Set(keys).size, keys.length, "duplicate OFFICIAL row");
  for (const [id, v, url] of OFFICIAL) {
    const b = bikes.find((x) => x.id === id);
    assert.ok(b, `OFFICIAL names unknown bike ${id}`);
    assert.ok(!v || b.variants?.some((x) => x.name === v), `${id}: no variant "${v}" in bikes.json`);
    assert.ok(PARSERS[host(url)] && LISTS[host(url)], `${id}: no parser for ${url}`);
  }
  for (const b of bikes)
    for (const [v, src] of [["", b.priceSource], ...(b.variants ?? []).map((x) => [x.name, x.priceSource])]) {
      const k = `${b.id}|${v}`;
      if (PARSERS[host(src)] && !BROWSER_ONLY.has(k)) assert.ok(keys.includes(k), `${k} is priced from ${src} but missing from OFFICIAL`);
    }
  for (const k of BROWSER_ONLY) assert.ok(!keys.includes(k), `${k} is in OFFICIAL; drop it from BROWSER_ONLY`);
});

test("price-refresh: changes are written, confirmed headline prices bump priceAsOf, suspect, missing and unfetched are left alone", async () => {
  const data = structuredClone(bikes);
  const bike = (id: string) => data.find((b) => b.id === id)!;
  const N160 = "https://www.bajajauto.com/en-bd/bikes/pulsar-n160-dc-abs", P150TD = "https://www.bajajauto.com/en-bd/bikes/pulsar-150-td";
  const SP160 = "https://www.bdhonda.com/products/sp160", BULLET = "https://www.royalenfield.com/bd/en/motorcycles/bullet-350/";
  const WALTON = "https://waltonbd.com/takyon-fusion-25td", HUNK = "https://www.heromotocorp.com/en-bd/products/premium/hunk-150r-price-in-bangladesh.html";
  // Prices pinned here so the test does not move when the data does; the ids come from bikes.json.
  Object.assign(bike("bajaj-pulsar-n160"), { priceBDT: 273600, priceAsOf: "2026-01" });
  Object.assign(bike("honda-sp160"), { priceBDT: 225000, priceAsOf: "2026-01" });
  Object.assign(bike("royal-enfield-bullet-350"), { priceBDT: 417500, priceAsOf: "2026-01" });
  Object.assign(bike("bajaj-pulsar-150"), { priceAsOf: "2026-01" });
  bike("honda-sp160").variants!.find((v) => v.name === "Single Disc")!.priceBDT = 195000;
  bike("bajaj-pulsar-150").variants!.find((v) => v.name === "Twin Disc")!.priceBDT = 280000;
  const pages: Record<string, string | number> = {
    [N160]: fx("bajaj-pulsar-n160-dc-abs.html").replace("273,600", "280,000"), // +2%: written
    [P150TD]: fx("bajaj-pulsar-n160-dc-abs.html"), // variant only: price written, priceAsOf not bumped
    [SP160]: fx("honda-sp160.html"),
    [BULLET]: fx("re-bullet-350.html").replace("4,17,500", "9,17,500"), // +120%: likely a page error, not written
    [WALTON]: 404,
    [HUNK]: 0,
    [LISTS["bajajauto.com"][0]]: fx("bajaj-pulsar-n160-dc-abs.html"),
  };
  const official: typeof OFFICIAL = [
    ["bajaj-pulsar-n160", "", N160, ""],
    ["bajaj-pulsar-150", "Twin Disc", P150TD, ""],
    ["honda-sp160", "", SP160, "Double Disc ABS"],
    ["honda-sp160", "Single Disc", SP160, "Single Disc"],
    ["royal-enfield-bullet-350", "", BULLET, "Standard - Maroon"],
    ["walton-takyon-fusion-25td", "", WALTON, ""],
    ["hero-hunk-150r", "", HUNK, "Hunk 150R DD ABS"],
  ];
  const fetched: string[] = [];
  const { checks, lists } = await check(data, async (u) => { fetched.push(u); return pages[u] ?? 0; }, official);
  assert.deepEqual(checks.map((c) => c.status), ["changed", "changed", "same", "changed", "suspect", "missing", "error"]);
  assert.equal(fetched.filter((u) => u === SP160).length, 1, "a page shared by several rows is fetched once");

  apply(data, checks, "2027-01");
  assert.deepEqual([bike("bajaj-pulsar-n160").priceBDT, bike("bajaj-pulsar-n160").priceAsOf, bike("bajaj-pulsar-n160").priceSource], [280000, "2027-01", N160]);
  assert.equal(bike("honda-sp160").priceAsOf, "2027-01", "an unchanged but confirmed headline price is re-dated");
  assert.equal(bike("honda-sp160").variants!.find((v) => v.name === "Single Disc")!.priceBDT, 199000);
  assert.deepEqual([bike("bajaj-pulsar-150").variants!.find((v) => v.name === "Twin Disc")!.priceBDT, bike("bajaj-pulsar-150").priceAsOf], [273600, "2026-01"]);
  assert.deepEqual([bike("royal-enfield-bullet-350").priceBDT, bike("royal-enfield-bullet-350").priceAsOf], [417500, "2026-01"]);
  assert.equal(bike("walton-takyon-fusion-25td").priceAsOf, bikes.find((b) => b.id === "walton-takyon-fusion-25td")!.priceAsOf);

  const md = body(data, checks, lists, new Date("2027-01-01T03:17:00Z"), official);
  assert.match(md, /\| Bajaj Pulsar N160 \| \(headline\) \| ৳2,73,600 \| ৳2,80,000 \| changed \|/);
  assert.match(md, /walton-takyon-fusion-25td`\): page gone \(HTTP 404\)/, "a vanished page flags availability, not the data");
  assert.match(md, /bdhonda\.com: model list .* did not load/);
  const todo = md.split("\n").filter((l) => l.startsWith("- [ ] "));
  assert.equal(todo.length, data.length - 2, "every bike without a confirmed headline price is on the checklist");
  assert.ok(!todo.some((l) => /`(bajaj-pulsar-n160|honda-sp160)`/.test(l)) && todo.some((l) => l.includes("`royal-enfield-bullet-350`")));
  assert.deepEqual(md.match(/^### Week \d, due \S+/gm), ["### Week 1, due 2027-01-08", "### Week 2, due 2027-01-15", "### Week 3, due 2027-01-22", "### Week 4, due 2027-01-29"]);
});
