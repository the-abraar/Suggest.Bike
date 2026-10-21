// /bikes/ pagination: the ?page= param is capped to the catalogue. Run: npm test.
import { test } from "node:test";
import assert from "node:assert/strict";
import { PAGE, byMileage, pageParam, sortParam } from "../src/app/bikes/BrowseView";
import { BIKES, avgMileage, overall } from "../src/lib/bikes";

test("pageParam reads ?page= and clamps it to 1..last page", () => {
  const last = Math.ceil(BIKES.length / PAGE);
  assert.ok(last >= 2, "the catalogue spans more than one page");
  assert.equal(pageParam(null, BIKES.length), 1);
  assert.equal(pageParam("2", BIKES.length), 2);
  assert.equal(pageParam("2.7", BIKES.length), 2);
  for (const bad of ["0", "-3", "abc", ""]) assert.equal(pageParam(bad, BIKES.length), 1, bad);
  for (const big of ["9999", "Infinity"]) assert.equal(pageParam(big, BIKES.length), last, big);
  assert.equal(pageParam("3", 0), 1); // an empty list still has page 1
});

test("sortParam reads ?sort= (search \"best mileage\" links ?sort=mileage); unknown values fall back", () => {
  assert.equal(sortParam("mileage"), "mileage");
  for (const bad of [null, "", "MILEAGE", "drop table", "toString"]) assert.equal(sortParam(bad), "recommended", String(bad));
});

test("byMileage: best km/l first, EVs (petrol-cost equivalent, not km/l) after every petrol bike, ties best rated first", () => {
  const list = [...BIKES].sort(byMileage);
  const firstEv = list.findIndex((b) => b.engine.fuel === "electric");
  assert.ok(firstEv > 0 && list.slice(firstEv).every((b) => b.engine.fuel === "electric"), "EVs last");
  const petrol = list.slice(0, firstEv);
  for (let i = 1; i < petrol.length; i++) {
    const [a, b] = [petrol[i - 1], petrol[i]];
    assert.ok(avgMileage(a) > avgMileage(b) || (avgMileage(a) === avgMileage(b) && overall(a) >= overall(b)), `${a.id} before ${b.id}`);
  }
});
