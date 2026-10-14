import { test } from "node:test";
import assert from "node:assert/strict";
import { BIKES, getBike } from "../src/lib/bikes";
import { DEFAULT_COST_INPUT, OWNERSHIP_YEARS, defaultUsedPrice, overhaulCost, ownershipCost, usedRepairRate, type CostBike } from "../src/lib/cost";

const bike = (id: string) => {
  const b = getBike(id);
  assert.ok(b, `${id} missing from src/data/bikes.json`);
  return b as CostBike;
};

test("cost: used price well below the typical price raises the hidden-repair reserve to 20% / 25%", () => {
  for (const id of ["bajaj-platina-100", "bajaj-pulsar-ns160"]) {
    const b = bike(id);
    const ref = defaultUsedPrice(b);
    const base = b.engine.cooling === "air" ? 0.05 : 0.1;
    const at = (f: number) => ownershipCost(b, { ...DEFAULT_COST_INPUT, used: true, usedPrice: Math.round(ref * f) });
    assert.equal(at(1).detail.hiddenRepairRate, base, id);
    assert.equal(at(0.85).detail.hiddenRepairRate, base, id); // 15% below: normal haggling
    assert.equal(at(0.8).detail.hiddenRepairRate, 0.2, id); // 20% below
    assert.equal(at(0.65).detail.hiddenRepairRate, 0.2, id); // 35% below: still the 20% band
    assert.equal(at(0.6).detail.hiddenRepairRate, 0.25, id);
    assert.equal(at(1.2).detail.hiddenRepairRate, base, id); // above typical: no extra
    assert.equal(at(0.8).detail.cheap, true, id); // drives the "not a normal price" warning
    assert.equal(at(0.85).detail.cheap, false, id);
    const c = at(0.6);
    assert.equal(c.hiddenRepairs, c.price * 0.25);
    assert.ok(Math.abs(c.detail.belowRef - 0.4) < 0.001);
  }
  // price 0 (empty input) never divides into nonsense
  assert.equal(usedRepairRate(bike("bajaj-platina-100"), 0).belowRef, 0);
  // buying new: no reserve, whatever the used data says
  assert.equal(ownershipCost(bike("bajaj-pulsar-n160"), DEFAULT_COST_INPUT).detail.hiddenRepairRate, 0);
});

test("cost: ownership years are exactly 1-5 and 10; only 10 adds a major overhaul, counted in running and per-month math", () => {
  assert.deepEqual([...OWNERSHIP_YEARS], [1, 2, 3, 4, 5, 10]);
  const b = bike("bajaj-pulsar-n160");
  const c = (o = {}) => ownershipCost(b, { ...DEFAULT_COST_INPUT, ...o });
  for (const years of [1, 2, 3, 4, 5]) assert.equal(c({ years }).overhaul, 0, `${years} yr`);
  const ten = c({ years: 10, kmPerDay: 30 });
  assert.ok(ten.overhaul > 10000 && ten.overhaul < 100000, `overhaul ${ten.overhaul}`);
  assert.equal(ten.overhaul, overhaulCost(b, ten.km).total);
  assert.ok(Math.abs(ten.running - (ten.fuel + ten.service + ten.wear + ten.overhaul + ten.upkeep + ten.hiddenRepairs + ten.insurance)) < 1e-6);
  assert.ok(Math.abs(ten.perMonth * 120 - ten.total) < 1e-6);
  assert.ok(Math.abs(ten.perKm * ten.km - ten.total) < 1e-6);
  assert.equal(ten.km, 30 * 365 * 10);
  // more riding, bigger overhaul; a bigger bike's parts cost more
  assert.ok(c({ years: 10, kmPerDay: 80 }).overhaul > ten.overhaul);
  assert.ok(c({ years: 10, kmPerDay: 5 }).overhaul < ten.overhaul);
  const big = BIKES.filter((x) => x.engine.fuel !== "electric").sort((x, y) => y.engine.cc - x.engine.cc)[0] as CostBike;
  assert.ok(overhaulCost(big, ten.km).total > overhaulCost(bike("bajaj-platina-100"), ten.km).total);
  // EVs: no engine or clutch work
  const ev = BIKES.find((x) => x.engine.fuel === "electric") as CostBike;
  const e = overhaulCost(ev, ten.km);
  assert.equal(e.engine + e.clutch, 0);
  for (const x of BIKES) assert.ok(Number.isFinite(ownershipCost(x as CostBike, { ...DEFAULT_COST_INPUT, years: 10 }).total), x.id);
});
