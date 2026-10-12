// EV running cost: build-data derives a petrol-cost-equivalent kmpl; the cost engine must turn it back into electricity Tk/km.
import { test } from "node:test";
import assert from "node:assert/strict";
import guide from "../src/data/guide.json";
import { BIKES } from "../src/lib/bikes";
import { ownershipCost, registrationFor, DEFAULT_COST_INPUT, type CostBike } from "../src/lib/cost";

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
