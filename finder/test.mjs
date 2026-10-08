// Self-test for the Bike finder. Run: npx tsx finder/test.mjs
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import * as Finder from "../src/lib/finder/index.ts";
import * as Agent from "./agent.ts";
import * as Stores from "./store.ts";
import * as Fx from "./sources/fixtures.ts";
import * as Wa from "./whatsapp.ts";
import * as Bk from "./sources/bikroy.ts";
// tsx loads .ts as CommonJS under .mjs, so named imports are taken from the namespace objects.
const { coloursIn, dedupe, listingKey, makeRequest, maskPhone, mentionsModel, normalizeBdPhone, scoreListing, validateSubmission, isExpired, rankListings } = Finder.default ?? Finder;
const { runOnce } = Agent.default ?? Agent;
const { MemoryStore } = Stores.default ?? Stores;
const { fixturesAdapter } = Fx.default ?? Fx;
const { dryRunMessenger } = Wa.default ?? Wa;
const { parseBikroyHtml, robotsAllows } = Bk.default ?? Bk;

const here = dirname(fileURLToPath(import.meta.url));
const listings = JSON.parse(readFileSync(join(here, "fixtures/listings.json"), "utf8"));
const requests = JSON.parse(readFileSync(join(here, "fixtures/requests.json"), "utf8"));
let n = 0;
const t = (name, fn) => Promise.resolve(fn()).then(() => { n++; console.log("ok -", name); }, (e) => { console.error("FAIL -", name); throw e; });

await t("model aliases: English, Banglish and Bangla", () => {
  for (const s of ["Yamaha RX 115 maroon", "rx115 for sale", "RX-115", "আরএক্স ১১৫ বিক্রি", "ইয়ামাহা আরএক্স১১৫", "Yamaha rx 115"]) assert.ok(mentionsModel(s, "RX 115"), s);
  assert.ok(mentionsModel("rx115", "আরএক্স ১১৫"));
  assert.ok(!mentionsModel("RX1150 spare", "RX 115"));
  assert.ok(!mentionsModel("Pulsar 150", "RX 115"));
  assert.ok(mentionsModel("পালসার 150 কালো", "Pulsar 150"));
});

await t("colour synonyms", () => {
  assert.deepEqual(coloursIn("Deep red, original"), ["maroon"]);
  assert.deepEqual(coloursIn("মেরুন রং"), ["maroon"]);
  assert.ok(coloursIn("maroon with red stripes").includes("red"));
  assert.deepEqual(coloursIn("কালো"), ["black"]);
});

await t("BD phone normalisation", () => {
  for (const p of ["01712345678", "+8801712345678", "8801712345678", "017-1234 5678", "০১৭১২৩৪৫৬৭৮", "008801712345678"]) assert.equal(normalizeBdPhone(p), "+8801712345678", p);
  for (const p of ["", "01212345678", "0171234567", "+919812345678", "abc"]) assert.equal(normalizeBdPhone(p), null, p);
  assert.ok(!maskPhone("+8801712345678").includes("1234567"));
});

await t("validation", () => {
  const bad = validateSubmission({ model: "", whatsapp: "123", consent: false });
  assert.equal(bad.ok, false);
  assert.ok(bad.errors.model && bad.errors.whatsapp && bad.errors.consent);
  const ok = validateSubmission({ model: " RX  115 ", whatsapp: "01712345678", consent: true, colours: ["maroon", "bogus"], maxBudget: "160000", districts: ["dhaka"], mustHaves: ["original-sleeve", "x"], yearMin: "1995", yearMax: 2002 });
  assert.equal(ok.ok, true);
  assert.equal(ok.value.model, "RX 115");
  assert.equal(ok.value.whatsapp, "+8801712345678");
  assert.deepEqual(ok.value.colours, ["maroon"]);
  assert.deepEqual(ok.value.mustHaves, ["original-sleeve"]);
  assert.equal(validateSubmission({ model: "RX", whatsapp: "01712345678", consent: true, yearMin: 2005, yearMax: 1999 }).ok, false);
  assert.equal(validateSubmission({ model: "RX", whatsapp: "01712345678", consent: false }, { requireConsent: false }).ok, true);
});

const req = requests[0];

await t("scoring: matched / unverifiable / mismatched", () => {
  const best = scoreListing(req, listings[0]);
  assert.ok(best.eligible && best.score >= 90 && best.score <= 95);
  assert.ok(best.matched.some((r) => r.key === "original-sleeve"));
  assert.ok(best.unverifiable.some((r) => r.key === "custom"));
  const blue = scoreListing(req, listings[2]);
  assert.ok(blue.mismatched.some((r) => r.key === "colour"));
  assert.ok(blue.unverifiable.some((r) => r.key === "original-sleeve"));
  assert.ok(blue.eligible, "soft colour mismatch is still eligible");
  assert.ok(!scoreListing(req, listings[3]).eligible, "rebored contradicts a must-have");
  assert.ok(!scoreListing(req, listings[4]).eligible, "over budget");
  assert.equal(scoreListing(req, listings[5]).score, 0, "RX1150 is not RX115");
  assert.equal(scoreListing(req, listings[6]).score, 0, "different bike");
});

await t("dedupe by URL and hash", () => {
  assert.equal(listingKey(listings[0]), listingKey(listings[1]));
  assert.equal(dedupe(listings).length, listings.length - 1);
  assert.equal(listingKey({ url: "not a url", title: "RX 115", priceBDT: 1, district: "Dhaka" }), listingKey({ url: "also bad", title: "rx115", priceBDT: 1, district: "dhaka" }));
  assert.equal(rankListings(req, listings).length, 2);
});

await t("expiry after 60 days", () => {
  assert.ok(!isExpired(makeRequest(validateSubmission({ model: "RX 115", whatsapp: "01712345678", consent: true }).value, "a", new Date("2026-10-01")), new Date("2026-11-20")));
  assert.ok(isExpired({ createdAt: "2026-08-01T00:00:00Z" }, new Date("2026-10-09")));
});

await t("agent: dry run, consent, expiry, one message a day", async () => {
  const sent = [];
  const messenger = { send: async (r, m) => { sent.push(r.id); return { ok: true, dryRun: false }; } };
  const store = new MemoryStore(requests);
  const sources = [fixturesAdapter(join(here, "fixtures/listings.json"))];
  const now = new Date("2026-10-09T18:00:00Z");
  const r1 = await runOnce({ store, sources, messenger, now });
  assert.deepEqual(sent, ["fx-1"], "only the consenting, unexpired request is messaged");
  assert.equal(r1.skipped.length, 2);
  // Same night again: the 24 hour limit applies even though 2 matches remain.
  const r2 = await runOnce({ store, sources, messenger, now: new Date(now.getTime() + 3600_000) });
  assert.equal(sent.length, 1);
  assert.match(r2.results[0].deferred, /24 hours/);
  // Next night: the next best match goes out, the first is not repeated.
  const r3 = await runOnce({ store, sources, messenger, now: new Date(now.getTime() + 86_400_000) });
  assert.equal(sent.length, 2);
  assert.ok(!r3.results[0].newMatches.some((m) => m.listing.url.endsWith("rx115-maroon-dhaka")));
  // Opt-out closes the request.
  const { phones } = await store.load();
  for (const k of Object.keys(phones)) phones[k].optedOut = true;
  await runOnce({ store, sources, messenger, now: new Date(now.getTime() + 3 * 86_400_000) });
  assert.equal(sent.length, 2);
});

await t("agent: dry-run messenger records nothing", async () => {
  const store = new MemoryStore(requests);
  await runOnce({ store, sources: [fixturesAdapter(join(here, "fixtures/listings.json"))], messenger: dryRunMessenger, persist: false, now: new Date("2026-10-09T18:00:00Z") });
  const { requests: after, phones } = await store.load();
  assert.equal(after[0].state.notified.length, 0);
  assert.ok(Object.values(phones).every((p) => !p.lastMessageAt && !p.optedOut));
});

await t("bikroy: robots.txt and parsing (synthetic markup)", () => {
  assert.equal(robotsAllows("User-agent: *\nDisallow: /en/ads/", "/en/ads/bangladesh/x"), false);
  assert.equal(robotsAllows("User-agent: googlebot\nDisallow: /\nUser-agent: *\nDisallow: /admin", "/en/ads/x"), true);
  const html = '<a href="/en/ad/yamaha-rx-115-dhaka-1?x=1"><h2>Yamaha RX 115</h2><div>Tk 1,55,000</div></a><a href="/en/about">About</a>';
  const [l] = parseBikroyHtml(html);
  assert.equal(l.url, "https://bikroy.com/en/ad/yamaha-rx-115-dhaka-1");
  assert.equal(l.priceBDT, 155000);
  assert.equal(parseBikroyHtml(html).length, 1);
});

console.log(`\n${n} checks passed`);
