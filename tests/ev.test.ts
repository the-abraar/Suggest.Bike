// EV running cost: build-data derives a petrol-cost-equivalent kmpl; the cost engine must turn it back into electricity Tk/km.
import { test } from "node:test";
import assert from "node:assert/strict";
import guide from "../src/data/guide.json";
import { BIKES } from "../src/lib/bikes";
import { ownershipCost, registrationFor, evBatteryCost, EV_BATTERY, OWNERSHIP_YEARS, DEFAULT_COST_INPUT, type CostBike } from "../src/lib/cost";

const evs = BIKES.filter((b) => b.engine.fuel === "electric");

test("ev: at least one electric bike, each with a derived mileage and range", () => {
  assert.ok(evs.length >= 1);
  for (const b of evs) {
    assert.ok(b.ev && b.mileageKmpl[0] > 0 && b.mileageKmpl[1] >= b.mileageKmpl[0], b.id);
    assert.ok(Math.abs(b.fuelTankL * ((b.mileageKmpl[0] + b.mileageKmpl[1]) / 2) - (b.ev.realRangeKm[0] + b.ev.realRangeKm[1]) / 2) < 3, `${b.id}: tank x mileage = range`);
  }
});

test("ev: energy cost = kWh x 15% loss x tariff per km, ignores the octane slider, no chain/clutch/filters", () => {
  for (const b of evs) {
    const inp = { ...DEFAULT_COST_INPUT, years: 1, kmPerDay: 20 };
    const c = ownershipCost(b as unknown as CostBike, inp);
    const avgRange = (b.ev!.realRangeKm[0] + b.ev!.realRangeKm[1]) / 2;
    const expectPerKm = (b.ev!.batteryKWh * 1.15 * guide.fuel.electricity.tkPerKWh) / avgRange;
    assert.ok(Math.abs(c.fuel / c.km - expectPerKm) / expectPerKm < 0.15, `${b.id}: ${c.fuel / c.km} vs ${expectPerKm}`);
    assert.equal(ownershipCost(b as unknown as CostBike, { ...inp, fuelPrice: 220 }).fuel, c.fuel);
    const petrol = BIKES.find((x) => x.category === b.category && x.engine.fuel !== "electric")!;
    assert.ok(c.wear < ownershipCost(petrol as unknown as CostBike, inp).wear, `${b.id}: EV wear below ${petrol.id}`);
  }
});

// BRTA Sch.1 item 21: an EV's fee slab is set by motor power (up to 5 kW = the up-to-100cc fee). EVs carry cc 0, so
// registrationFor lands in that band; an EV above 5 kW would need a branch to the >100cc band, which this test forces.
test("ev: BRTA registration uses the up-to-100cc band for motors up to 5 kW", () => {
  for (const b of evs) {
    assert.ok(b.ev!.motorW <= guide.registration.ev.motorKWMax * 1000, `${b.id}: motor above 5 kW needs the >100cc band`);
    assert.equal(registrationFor(b.engine.cc).ccMax, 100, b.id);
  }
});

// Owner rule: one traction battery at 30% of the new price, once the ownership period runs past the battery warranty.
test("ev: battery replacement = 30% of price, charged only past the warranty (data months, else 48), in running cost", () => {
  const ev = evs.find((b) => b.ev?.batteryWarrantyMonths === 15);
  assert.ok(ev, "an EV with Walton's 15-month battery warranty");
  for (const years of OWNERSHIP_YEARS) {
    const c = ownershipCost(ev, { ...DEFAULT_COST_INPUT, years });
    const want: number = years * 12 > 15 ? ev.priceBDT * 0.3 : 0;
    assert.equal(c.evBattery, want, `${years}y`);
    assert.equal(c.detail.evBattery?.due, want > 0);
  }
  const c2 = ownershipCost(ev, { ...DEFAULT_COST_INPUT, years: 2 });
  const c1 = ownershipCost(ev, { ...DEFAULT_COST_INPUT, years: 1 });
  assert.ok(c2.running - c1.running >= ev.priceBDT * 0.3, "the battery is part of running cost");

  // No warranty in the data: assume 48 months, so 5 and 10 years pay, 1-4 do not.
  const noWarranty: CostBike = { ...ev, ev: { ...ev.ev!, batteryWarrantyMonths: undefined } };
  assert.equal(EV_BATTERY.defaultWarrantyMonths, 48);
  for (const years of OWNERSHIP_YEARS) assert.equal(evBatteryCost(noWarranty, years, false)!.due, years > 4, `${years}y`);
  assert.equal(evBatteryCost(noWarranty, 1, false)!.assumed, true);
  // A used EV counts as ~3 years old, so a 4-year warranty has 1 year left.
  assert.equal(evBatteryCost(noWarranty, 1, true)!.due, false);
  assert.equal(evBatteryCost(noWarranty, 2, true)!.due, true);
  assert.equal(evBatteryCost(noWarranty, 2, true)!.cost, ev.priceBDT * 0.3, "30% of the new price, not the used price");

  const petrol = BIKES.find((b) => b.engine.fuel !== "electric")!;
  assert.equal(evBatteryCost(petrol, 10, false), null);
  assert.equal(ownershipCost(petrol, { ...DEFAULT_COST_INPUT, years: 10 }).evBattery, 0);
});

test("ev: every EV states a battery warranty in whole months", () => {
  for (const b of evs) assert.ok(Number.isInteger(b.ev?.batteryWarrantyMonths) && b.ev!.batteryWarrantyMonths! > 0, b.id);
});
