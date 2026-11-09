import { test } from "node:test";
import assert from "node:assert/strict";
import { diffSnapshots, type PriceHistory, type SnapBike } from "../src/lib/history";
import bikes from "../src/data/bikes.json";
import corrections from "../src/data/price-corrections.json";
import history from "../src/data/generated/price-history.json"; // scripts/build-history.ts

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

test("diffSnapshots flags listed corrections and keeps them out of the price points", () => {
  const h = diffSnapshots(
    [
      { date: "2026-10-01", bikes: [a, b] },
      { date: "2026-10-14", bikes: [{ ...a, priceBDT: a.priceBDT + 9000 }, { ...b, priceBDT: b.priceBDT + 2000 }] }, // a: our mistake fixed; b: a real rise
      { date: "2026-10-20", bikes: [{ ...a, priceBDT: a.priceBDT + 9000 }, { ...b, priceBDT: b.priceBDT + 2000 }] },
      { date: "2026-10-25", bikes: [{ ...a, priceBDT: a.priceBDT - 1000 }, { ...b, priceBDT: b.priceBDT + 2000 }] }, // a: second fix
    ],
    [
      { id: a.id, date: "2026-10-14" },
      { id: a.id, date: "2026-10-25" },
    ],
  );
  assert.deepEqual(
    h.events.map((e) => [e.date, e.id, e.priceCorrection ?? false]),
    [
      ["2026-10-25", a.id, true],
      ["2026-10-14", b.id, false],
      ["2026-10-14", a.id, true],
    ],
  );
  // The corrected price replaces the wrong one from when it was first seen, so the sparkline shows no move.
  assert.deepEqual(h.bikes[a.id], [{ priceBDT: a.priceBDT - 1000, priceAsOf: a.priceAsOf, firstSeen: "2026-10-01" }]);
  assert.equal(h.bikes[b.id].length, 2);
});

test("every entry in price-corrections.json flags a real price change in the generated history", () => {
  if (!(history as PriceHistory).events.length) return; // no git history (shallow clone): build-history keeps current prices only
  for (const c of corrections) {
    const e = (history as PriceHistory).events.find((x) => x.id === c.id && x.date === c.date && (x.kind === "up" || x.kind === "down"));
    assert.ok(e, `${c.id} ${c.date}: no price change that day`);
    assert.equal(e.priceCorrection, true, `${c.id} ${c.date}`);
  }
});
