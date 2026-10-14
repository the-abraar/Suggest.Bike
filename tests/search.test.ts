// Search: Banglish typos and Bangla script find the right bike. Run: npm test.
import { test } from "node:test";
import assert from "node:assert/strict";
import { getBike } from "../src/lib/bikes";
import { searchBikes } from "../src/components/SearchBox";

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
