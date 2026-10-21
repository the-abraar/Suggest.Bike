// Search: Banglish typos and Bangla script find the right bike. Run: npm test.
import { test } from "node:test";
import assert from "node:assert/strict";
import { BIKES, getBike } from "../src/lib/bikes";
import { budgetQuery, mileageQuery, searchBikes } from "../src/lib/search";

const ids = (q: string, limit = 7) => searchBikes(q, limit).map((b) => b.id);
const cases: [string, string][] = [
  ["palsar", "bajaj-pulsar-150"],
  ["plsar", "bajaj-pulsar-150"],
  ["apachi", "tvs-apache-rtr-160-2v"],
  ["apachee", "tvs-apache-rtr-160-4v"],
  ["gixer", "suzuki-gixxer-monotone"],
  ["gixar", "suzuki-gixxer-fi-abs"],
  ["fz v3", "yamaha-fzs-fi-v4"],
  ["r15", "yamaha-r15-v4"],
  ["yamha r15", "yamaha-r15-v3"],
  ["hornit", "honda-hornet-2-0"],
  ["harnet", "honda-hornet-2-0"],
  ["suzki gixxer", "suzuki-gixxer-250"],
  ["classik", "royal-enfield-classic-350"],
  ["পালসার", "bajaj-pulsar-n160"],
  ["অ্যাপাচি", "tvs-apache-rtr-160-2v"],
  ["জিক্সার", "suzuki-gixxer-sf-fi-abs"],
  ["হর্নেট", "honda-hornet-2-0"],
  ["discovar", "bajaj-discover-125"],
  ["radier", "tvs-raider-125"],
  ["xtream", "hero-xtreme-125r"],
  ["ntork", "tvs-ntorq-125"],
  ["platena", "bajaj-platina-100"],
  ["jixer", "suzuki-gixxer-fi-abs"],
  ["পালসার ১৬০", "bajaj-pulsar-n160"],
  ["জিকসার", "suzuki-gixxer-fi-abs"],
];

test("search: Banglish misspellings and Bangla script find the bike", () => {
  for (const [q, id] of cases) {
    assert.ok(getBike(id), `fixture id ${id} missing from src/data`);
    assert.ok(ids(q).includes(id), `"${q}" should find ${id}, got ${ids(q).join(", ")}`);
  }
});
test("search: exact matches rank first and fuzzy stays narrow", () => {
  assert.deepEqual(ids("r15", 2).sort(), ["yamaha-r15-v3", "yamaha-r15-v4"]);
  assert.ok(ids("palsar").every((id) => id.startsWith("bajaj-pulsar")));
  assert.deepEqual(ids("hornit"), ["honda-hornet-2-0"]);
  assert.deepEqual(ids("xyzq"), []);
  assert.deepEqual(ids("v3"), ["yamaha-r15-v3"]); // a lone generation token is not a fuzzy wildcard
  assert.deepEqual(ids("  "), []);
});
test("search: a brand-only query lists on-sale bikes before used-only antiques (critique B8)", () => {
  for (const q of ["honda", "yamha", "hunda", "suzki", "bajaj", "hero"]) {
    const found = searchBikes(q);
    const firstUsed = found.findIndex((b) => b.status === "used-only");
    assert.ok(found.length > 0 && found[0].status === "on-sale", `"${q}": ${found.map((b) => b.id).join(", ")}`);
    if (firstUsed >= 0) assert.ok(found.slice(firstUsed).every((b) => b.status === "used-only"), `"${q}": used-only bikes must trail on ties`);
  }
});

test("budgetQuery: lakh, lac, k, Bangla and plain amounts are budgets; model numbers are not", () => {
  for (const [q, want] of [["under 2 lakh", 200000], ["bike under 1.5 lac", 150000], ["২ লাখের নিচে", 200000], ["150k", 150000], ["2,00,000", 200000]] as const)
    assert.equal(budgetQuery(q), want, q);
  for (const q of ["n160", "r15 v4", "pulsar 150", "160cc", "ktm 390", "honda"]) assert.equal(budgetQuery(q), null, q);
});

test("mileageQuery: mileage and fuel-economy intent in English, Banglish and Bangla; bike names are not", () => {
  for (const q of ["best mileage", "mileage", "milage bike", "fuel efficient", "fuel economy", "low fuel", "kmpl", "মাইলেজ", "সবচেয়ে বেশি মাইলেজ", "কম তেল খরচ"])
    assert.ok(mileageQuery(q), q);
  for (const q of ["pulsar", "hero hf deluxe", "splendor", "n160", "fz", "under 2 lakh", "পালসার"]) assert.ok(!mileageQuery(q), q);
  // Every catalogue name must still search as a name, not turn into the mileage list.
  for (const b of BIKES) assert.ok(!mileageQuery(`${b.brand} ${b.model} ${b.variant ?? ""}`), b.id);
});
