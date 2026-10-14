// Compare tray rules (pure helpers from src/lib/store.tsx). Run: npm test.
import { test } from "node:test";
import assert from "node:assert/strict";
import { BIKES } from "../src/lib/bikes";
import { MAX_COMPARE, compareIds, toggleIn } from "../src/lib/store";

const [a, b, c, d] = BIKES.map((x) => x.id);

test("compare: a 4th bike is refused, not swapped for the oldest (critique B6)", () => {
  assert.equal(MAX_COMPARE, 3);
  const full = toggleIn(toggleIn(toggleIn([], a), b), c);
  assert.deepEqual(full, [a, b, c]);
  assert.deepEqual(toggleIn(full, d), [a, b, c]);
  assert.deepEqual(toggleIn(full, b), [a, c]); // removing still works when full
});

test("compare: ids are de-duplicated, unknown ids dropped and the list capped (critique B7, B12)", () => {
  assert.deepEqual(compareIds([a, a]), [a]);
  assert.deepEqual(compareIds(["no-such-bike", a, ""]), [a]);
  assert.deepEqual(compareIds([a, b, c, d]), [a, b, c]);
});
