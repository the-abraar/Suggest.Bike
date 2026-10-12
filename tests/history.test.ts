import { test } from "node:test";
import assert from "node:assert/strict";
import { diffSnapshots, type SnapBike } from "../src/lib/history";
import bikes from "../src/data/bikes.json";

// Fixture ids and fields come from the real data so they fail if the data shape drifts.
const [a, b, c] = (bikes as SnapBike[]).slice(0, 3).map(({ id, brand, model, priceBDT, priceAsOf }) => ({ id, brand, model, priceBDT, priceAsOf }));

test("diffSnapshots dedupes unchanged prices and records ups, downs, adds and removals", () => {
  const h = diffSnapshots([
    { date: "2026-07-01", bikes: [a, b] },
    { date: "2026-07-20", bikes: [{ ...a, priceAsOf: "2026-07" }, b] }, // re-check, same price: no new point
    { date: "2026-09-05", bikes: [{ ...a, priceBDT: a.priceBDT + 5000, priceAsOf: "2026-09" }, c] }, // a up, b removed, c added
    { date: "2026-09-30", bikes: [{ ...a, priceBDT: a.priceBDT - 1000, priceAsOf: "2026-09" }, c] }, // a down
  ]);
  assert.deepEqual(h.bikes[a.id], [
    { priceBDT: a.priceBDT, priceAsOf: a.priceAsOf, firstSeen: "2026-07-01" },
    { priceBDT: a.priceBDT + 5000, priceAsOf: "2026-09", firstSeen: "2026-09-05" },
    { priceBDT: a.priceBDT - 1000, priceAsOf: "2026-09", firstSeen: "2026-09-30" },
  ]);
  assert.equal(h.bikes[b.id].length, 1);
  assert.deepEqual(
    h.events.map((e) => [e.date, e.kind, e.id]),
    [
      ["2026-09-30", "down", a.id],
      ["2026-09-05", "removed", b.id],
      ["2026-09-05", "added", c.id],
      ["2026-09-05", "up", a.id],
    ],
  );
  const up = h.events.find((e) => e.kind === "up")!;
  assert.equal(up.pct, Math.round((5000 / a.priceBDT) * 1000) / 10);
  assert.equal(up.name, `${a.brand} ${a.model}`);
});

test("diffSnapshots treats the first snapshot as a baseline and handles a single snapshot", () => {
  const h = diffSnapshots([{ date: "2026-10-13", bikes: [a, b] }]);
  assert.deepEqual(h.events, []);
  assert.deepEqual(h.bikes[a.id], [{ priceBDT: a.priceBDT, priceAsOf: a.priceAsOf, firstSeen: "2026-10-13" }]);
  assert.deepEqual(diffSnapshots([]), { bikes: {}, events: [] });
});
