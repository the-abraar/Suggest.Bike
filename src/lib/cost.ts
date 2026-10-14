import guide from "@/data/guide.json";
import type { BikeLite, Category } from "./types";
import { avgMileage } from "./bike-utils";

export const FUEL = {
  octane: guide.fuel.octane,
  petrol: guide.fuel.petrol,
  asOf: guide.fuel.asOf,
  source: guide.fuel.source,
};

const bands = guide.registration.bands;
export function registrationFor(cc: number) {
  return bands.find((b) => cc <= b.ccMax) ?? bands[bands.length - 1];
}
/** Largest engine an individual can register in BD (375cc, guide.json registration bands / ccPolicy). */
export const MAX_REGISTRABLE_CC = bands[bands.length - 1].ccMax;

/**
 * The one on-road price shown everywhere (match, cost, browse, compare, bike page, share card): ex-showroom + BRTA
 * registration with the 2-year tax token, the least you can ride away with. A used-only bike has no new registration,
 * so it is its asking price (ownership transfer not counted).
 */
export const onRoadPrice = (b: Pick<BikeLite, "priceBDT" | "engine" | "status">) =>
  b.status === "used-only" ? b.priceBDT : b.priceBDT + registrationFor(b.engine.cc).totalBDT;

/** Road tax renewal every 2 years (VAT-inclusive), above / up to 100cc. */
const ROAD_TAX_2YR = (cc: number) => (cc <= 100 ? 1000 * 1.15 : 2300);
const THIRD_PARTY_INSURANCE = guide.insurance.thirdParty.exampleAnnualPremiumBDT;

export const TYRE_PAIR: Record<Category, number> = {
  commuter: 5200,
  scooter: 5500,
  street: 7500,
  cruiser: 8500,
  classic: 8000,
  naked: 9500,
  sport: 10000,
  adventure: 11000,
};

/** Spark plug and battery prices by engine size (battery is replaced on time, not distance). */
const SPARK_PLUG = (cc: number) => (cc <= 125 ? 450 : cc <= 200 ? 800 : 1200);
const BATTERY = (cc: number) => (cc <= 125 ? 2400 : cc <= 200 ? 3200 : 4000);

/**
 * Replacement intervals. Set on the short side of what BD owners report, because Dhaka traffic,
 * dust and heat wear things faster than the manuals assume. We would rather overestimate.
 */
export const WEAR_KM = {
  frontPads: 8000,
  rearPads: 10000,
  chain: 15000,
  chainLubePer1000: 300, // chain cleaner and lube spray, ৳ per 1,000 km
  tyres: 20000,
  clutch: 30000,
  airFilter: 12000,
  sparkPlug: 10000,
  batteryMonths: 24,
  minOilChangesPerYear: 2, // oil ages even if you ride little
};

export type CostInput = {
  kmPerDay: number;
  years: number;
  fuelPrice: number;
  taxPlan: "2yr" | "10yr";
  insurance: boolean;
  includeDepreciation: boolean;
  upkeepPerMonth: number; // washing, parking, small fixes
  used: boolean;           // buying second-hand
  usedPrice?: number;      // what you pay for the used bike; defaults to defaultUsedPrice()
};

export const DEFAULT_COST_INPUT: CostInput = {
  kmPerDay: 25,
  years: 3,
  fuelPrice: FUEL.octane,
  taxPlan: "2yr", // same as onRoadPrice; the cost page still offers 10-year
  insurance: true, // cheap (~৳1,000/yr) and expected to become compulsory again; see guide.insurance
  includeDepreciation: true,
  upkeepPerMonth: 500,
  used: false,
};

/** Fraction of purchase price kept per year, driven by the resale score (5 → 0.86/yr, 10 → 0.92/yr). */
/** The fields the cost model reads — satisfied by both full and slim bike records. */
export type CostBike = Pick<BikeLite, "mileageKmpl" | "serviceIntervalKm" | "avgServiceCostBDT" | "engine" | "status" | "priceBDT" | "scores" | "category" | "brakes" | "gears" | "tyrePairBDT" | "usedPrice"> & {
  parts: Pick<BikeLite["parts"][number], "name" | "priceBDT">[];
};

export const yearlyRetention = (b: CostBike) => 0.8 + b.scores.resale * 0.012;

/** Typical asking price for a ~3-year-old example: bikroy data where we have it, otherwise our resale curve. */
export function defaultUsedPrice(b: CostBike) {
  if (b.status === "used-only") return b.priceBDT;
  const seen = b.usedPrice?.y3 ?? b.usedPrice?.y1;
  return seen ?? Math.round((b.priceBDT * Math.pow(yearlyRetention(b), 3)) / 5000) * 5000;
}

/**
 * Money to set aside for problems a second-hand bike hides until after you buy it
 * (worn bearings, tired clutch, leaking seals, electrical faults). Simple air-cooled engines: 5% of
 * the price paid; oil- or liquid-cooled, newer designs: 10%.
 */
export const hiddenRepairRate = (b: Pick<CostBike, "engine">) => (b.engine.cooling === "air" ? 0.05 : 0.1);

/**
 * APPROX: a used bike priced well below its typical asking price usually hides accident damage, a worn engine or
 * paper trouble, so the reserve goes up: 20% when the price is 20–35% below defaultUsedPrice(), 25% when more than 35% below.
 * Returns the reserve rate and how far below the typical price it is (0 when at or above it).
 */
export function usedRepairRate(b: CostBike, price: number) {
  const ref = defaultUsedPrice(b);
  const belowRef = ref > 0 && price > 0 ? Math.max(0, 1 - price / ref) : 0;
  const rate = !belowRef ? hiddenRepairRate(b) : price < ref * 0.65 ? 0.25 : price <= ref * 0.8 ? 0.2 : hiddenRepairRate(b); // compare prices, not 1 - p/r, so exactly 20% below is not lost to float error
  return { rate, belowRef, ref, cheap: rate > hiddenRepairRate(b) };
}

/** Keeping it 10 years = keeping it for life; the page offers exactly these and adds a major overhaul at 10. */
export const OWNERSHIP_YEARS = [1, 2, 3, 4, 5, 10] as const;
export const OVERHAUL_YEARS = 10;

/**
 * APPROX: one major overhaul over 10 years of ~30 km/day with some highway touring, some misuse and missed services.
 * Prices are for a ~150cc bike whose 5 listed parts cost ~৳6,000 together, scaled by this bike's parts basket
 * (brand + size, clamped 0.6–4.5×). Engine, clutch and suspension also scale with distance against the 30 km/day
 * reference (clamped 0.5–3×); wiring and frame age with time. Liquid-cooled +25%, multi-cylinder +40% on the engine.
 * Frame straightening is a ৳8,000 job counted at half because not every bike needs it.
 * shortcut: EVs get no motor/controller/traction-battery line; add one once BD replacement prices are sourced.
 */
export const OVERHAUL = { refKmPerDay: 30, refPartsBDT: 6000, engine: 15000, suspension: 6000, frame: 8000 * 0.5, wiring: 4000 };

export function overhaulCost(b: CostBike, km: number) {
  const O = OVERHAUL;
  const ev = b.engine.fuel === "electric";
  const parts = b.parts.reduce((a, p) => a + p.priceBDT, 0);
  const partsFactor = Math.min(4.5, Math.max(0.6, parts / O.refPartsBDT));
  const kmFactor = Math.min(3, Math.max(0.5, km / (O.refKmPerDay * 365 * OVERHAUL_YEARS)));
  const engineMult = (b.engine.cooling === "liquid" ? 1.25 : 1) * (b.engine.cylinders > 1 ? 1.4 : 1);
  const engine = ev ? 0 : O.engine * partsFactor * engineMult * kmFactor; // top-end/rebuild: piston, rings, valves, gaskets, cam chain
  const clutch = ev ? 0 : (b.parts.find((p) => p.name.toLowerCase().includes("clutch"))?.priceBDT ?? 1800) * kmFactor; // one extra set burnt by misuse, beyond normal wear
  const suspension = O.suspension * partsFactor * kmFactor; // fork seals, oil and bushes, rear shock
  const frame = O.frame * partsFactor;
  const wiring = O.wiring * partsFactor; // harness, switches, regulator-rectifier
  return { engine, clutch, suspension, frame, wiring, total: engine + clutch + suspension + frame + wiring, partsFactor, kmFactor };
}

export function ownershipCost(b: CostBike, inp: CostInput) {
  const buyingUsed = inp.used || b.status === "used-only";
  const price = buyingUsed ? (inp.usedPrice ?? defaultUsedPrice(b)) : b.priceBDT;
  const repair = usedRepairRate(b, price);
  const repairRate = buyingUsed ? repair.rate : 0;
  const hiddenRepairs = price * repairRate;

  const km = inp.kmPerDay * 365 * inp.years;
  // EVs: build-data derives their mileage as a petrol-cost equivalent at the current octane price, so the octane slider must not move it.
  const ev = b.engine.fuel === "electric";
  const fuel = (km / avgMileage(b)) * (ev ? FUEL.octane : inp.fuelPrice);

  const months = inp.years * 12;
  const W = WEAR_KM;

  // Wear is pro-rated: a tyre half worn out has cost you half a tyre, even if you haven't replaced it yet.
  const services = Math.max(km / b.serviceIntervalKm, inp.years * W.minOilChangesPerYear);
  const service = services * b.avgServiceCostBDT;

  const part = (needle: string) => b.parts.find((p) => p.name.toLowerCase().includes(needle))?.priceBDT;
  const pad = part("brake") ?? 600;
  const brakes = (km / W.frontPads) * pad + (km / W.rearPads) * (b.brakes.rear === "disc" ? pad : pad * 0.6);
  // EVs (hub-motor): no chain, clutch, air filter, spark plug or 12 V battery. shortcut: traction-battery wear is not modelled; add it once a BD replacement price is sourced.
  const chain = ev ? 0 : (km / W.chain) * (part("chain") ?? 2500) + (b.gears > 0 ? (km / 1000) * W.chainLubePer1000 : 0);
  const tyres = (km / W.tyres) * (b.tyrePairBDT ?? TYRE_PAIR[b.category]);
  const clutch = ev ? 0 : (km / W.clutch) * (part("clutch") ?? 1800);
  const filters = ev ? 0 : (km / W.airFilter) * (part("air filter") ?? 600) + (km / W.sparkPlug) * SPARK_PLUG(b.engine.cc);
  const battery = ev ? 0 : (months / W.batteryMonths) * BATTERY(b.engine.cc);
  const wear = brakes + chain + tyres + clutch + filters + battery;
  const oh = inp.years >= OVERHAUL_YEARS ? overhaulCost(b, km) : null;
  const overhaul = oh?.total ?? 0;
  const upkeep = inp.upkeepPerMonth * months;

  const reg = registrationFor(b.engine.cc);
  const renewals = Math.max(0, Math.ceil(inp.years / 2) - 1);
  const paperwork =
    buyingUsed
      ? 0
      : inp.taxPlan === "10yr"
        ? reg.totalBDT10yr
        : reg.totalBDT + renewals * ROAD_TAX_2YR(b.engine.cc);
  const insurance = inp.insurance ? THIRD_PARTY_INSURANCE * inp.years : 0;

  const resaleValue = Math.round(price * Math.pow(yearlyRetention(b), inp.years));
  const depreciation = inp.includeDepreciation ? price - resaleValue : 0;

  const running = fuel + service + wear + overhaul + upkeep + hiddenRepairs + insurance;
  const total = running + paperwork + depreciation;

  return {
    km,
    fuel,
    service,
    wear,
    overhaul,
    upkeep,
    hiddenRepairs,
    paperwork,
    insurance,
    depreciation,
    resaleValue,
    running,
    total,
    // Guard zero years / zero km so the UI never shows Infinity or NaN.
    perMonth: months > 0 ? total / months : 0,
    runningPerMonth: months > 0 ? running / months : 0,
    /** Cash you actually spend each month: everything except resale loss (registration spread over the period). */
    pocketPerMonth: months > 0 ? (running + paperwork) / months : 0,
    perKm: km > 0 ? total / km : 0,
    buyingUsed,
    price,
    /** Inputs behind each line, for the "how is this worked out" popovers. */
    detail: {
      services,
      wear: { brakes, chain, tyres, clutch, filters, battery },
      overhaul: oh,
      reg,
      renewals,
      roadTax: ROAD_TAX_2YR(b.engine.cc),
      hiddenRepairRate: repairRate,
      belowRef: buyingUsed ? repair.belowRef : 0,
      cheap: buyingUsed && repair.cheap,
      refUsedPrice: repair.ref,
    },
    onRoad: buyingUsed ? price : inp.taxPlan === "10yr" ? price + reg.totalBDT10yr : onRoadPrice(b),
  };
}

export type CostBreakdown = ReturnType<typeof ownershipCost>;
