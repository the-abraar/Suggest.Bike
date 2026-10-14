// /bikes/ pagination: the ?page= param is capped to the catalogue. Run: npm test.
import { test } from "node:test";
import assert from "node:assert/strict";
import { PAGE, pageParam } from "../src/app/bikes/BrowseView";
import { BIKES } from "../src/lib/bikes";

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
