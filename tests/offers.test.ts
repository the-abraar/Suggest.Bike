// Offer dates: active between startsOn and endsOn inclusive, on Bangladesh dates. Run: npm test.
import { test } from "node:test";
import assert from "node:assert/strict";
import { OFFERS, activeOffer, daysSince, isActive, todayBD, type Offer } from "../src/lib/offers";
import { BIKES } from "../src/lib/bikes";

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

test("offers: seed data points at real bikes and expires after 31 October 2026", () => {
  const ids = new Set(BIKES.map((b) => b.id));
  for (const x of OFFERS) for (const id of x.bikeIds) assert.ok(ids.has(id), `${x.id}: ${id}`);
  assert.ok(activeOffer("suzuki-v-strom-sx-250", "2026-10-20"));
  assert.equal(activeOffer("suzuki-v-strom-sx-250", "2026-11-01"), undefined);
});
