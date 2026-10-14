// Offer dates: active between startsOn and endsOn inclusive, on Bangladesh dates. Run: npm test.
import { test } from "node:test";
import assert from "node:assert/strict";
import { OFFERS, activeOffer, daysSince, isActive, priceAge, todayBD, type Offer } from "../src/lib/offers";
import fixture from "./fixtures/offers.json";
import { BIKES } from "../src/lib/bikes";

const FIXTURE = fixture.offers as Offer[];
const o = (startsOn: string, endsOn: string, bikeIds = ["x"]): Offer => ({ id: `t-${startsOn}`, bikeIds, type: "discount", title: "t", titleBn: "t", startsOn, endsOn, source: { name: "t", url: null } });

test("offers: isActive is inclusive at both ends and false before and after", () => {
  const x = o("2026-10-13", "2026-10-31");
  assert.equal(isActive(x, "2026-10-12"), false);
  assert.equal(isActive(x, "2026-10-13"), true);
  assert.equal(isActive(x, "2026-10-31"), true);
  assert.equal(isActive(x, "2026-11-01"), false);
});

test("offers: activeOffer picks the running offer for that bike only", () => {
  const list = [o("2026-09-01", "2026-09-30", ["a"]), o("2026-10-01", "2026-10-31", ["a", "b"])];
  assert.equal(activeOffer("a", "2026-10-05", list)?.startsOn, "2026-10-01");
  assert.equal(activeOffer("b", "2026-09-15", list), undefined);
  assert.equal(activeOffer("c", "2026-10-05", list), undefined);
});

test("offers: todayBD uses the Bangladesh date (UTC+6); daysSince counts whole days", () => {
  assert.equal(todayBD(new Date("2026-10-31T18:30:00Z")), "2026-11-01"); // 00:30 in Dhaka: a 31 Oct offer has ended
  assert.equal(todayBD(new Date("2026-10-31T17:59:00Z")), "2026-10-31");
  assert.equal(daysSince("2026-10-01", "2026-11-15"), 45);
});

test("offers: every offer in offers.json and the fixture points at a real bike", () => {
  const ids = new Set(BIKES.map((b) => b.id));
  for (const x of [...OFFERS, ...FIXTURE]) for (const id of x.bikeIds) assert.ok(ids.has(id), `${x.id}: ${id}`);
});

// A fixture, not offers.json: deleting an expired live offer must not turn CI red (critique B14).
test("offers: a fixture offer ending 31 October runs on the 20th and is gone on 1 November", () => {
  assert.ok(activeOffer("bajaj-pulsar-n160", "2026-10-20", FIXTURE));
  assert.equal(activeOffer("bajaj-pulsar-n160", "2026-11-01", FIXTURE), undefined);
});

test("priceAge: amber after 60 days, red after 120, counted from the 1st of the priceAsOf month", () => {
  assert.equal(priceAge("2026-10", "2026-11-30"), "fresh"); // 60 days
  assert.equal(priceAge("2026-10", "2026-12-01"), "aging");
  assert.equal(priceAge("2026-10", "2027-01-29"), "aging"); // 120 days
  assert.equal(priceAge("2026-10", "2027-01-30"), "stale");
});
