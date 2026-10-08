import guide from "@/data/guide.json";
import type { BikeLite, Category } from "./types";
import { avgMileage } from "./bikes";

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
  taxPlan: "10yr",
  insurance: false,
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

export function ownershipCost(b: CostBike, inp: CostInput) {
  const buyingUsed = inp.used || b.status === "used-only";
  const price = buyingUsed ? (inp.usedPrice ?? defaultUsedPrice(b)) : b.priceBDT;
  const hiddenRepairs = buyingUsed ? price * hiddenRepairRate(b) : 0;

  const km = inp.kmPerDay * 365 * inp.years;
  const fuel = (km / avgMileage(b)) * inp.fuelPrice;

  const months = inp.years * 12;
  const W = WEAR_KM;

  // Wear is pro-rated: a tyre half worn out has cost you half a tyre, even if you haven't replaced it yet.
  const services = Math.max(km / b.serviceIntervalKm, inp.years * W.minOilChangesPerYear);
  const service = services * b.avgServiceCostBDT;

  const part = (needle: string) => b.parts.find((p) => p.name.toLowerCase().includes(needle))?.priceBDT;
  const pad = part("brake") ?? 600;
  const brakes = (km / W.frontPads) * pad + (km / W.rearPads) * (b.brakes.rear === "disc" ? pad : pad * 0.6);
  const chain = (km / W.chain) * (part("chain") ?? 2500) + (b.gears > 0 ? (km / 1000) * W.chainLubePer1000 : 0);
  const tyres = (km / W.tyres) * (b.tyrePairBDT ?? TYRE_PAIR[b.category]);
  const clutch = (km / W.clutch) * (part("clutch") ?? 1800);
  const filters = (km / W.airFilter) * (part("air filter") ?? 600) + (km / W.sparkPlug) * SPARK_PLUG(b.engine.cc);
  const battery = (months / W.batteryMonths) * BATTERY(b.engine.cc);
  const wear = brakes + chain + tyres + clutch + filters + battery;
  const upkeep = inp.upkeepPerMonth * months;

  const reg = registrationFor(b.engine.cc);
  const paperwork =
    buyingUsed
      ? 0
      : inp.taxPlan === "10yr"
        ? reg.totalBDT10yr
        : reg.totalBDT + Math.max(0, Math.ceil(inp.years / 2) - 1) * ROAD_TAX_2YR(b.engine.cc);
  const insurance = inp.insurance ? THIRD_PARTY_INSURANCE * inp.years : 0;

  const resaleValue = Math.round(price * Math.pow(yearlyRetention(b), inp.years));
  const depreciation = inp.includeDepreciation ? price - resaleValue : 0;

  const running = fuel + service + wear + upkeep + hiddenRepairs + insurance;
  const total = running + paperwork + depreciation;

  return {
    km,
    fuel,
    service,
    wear,
    upkeep,
    hiddenRepairs,
    paperwork,
    insurance,
    depreciation,
    resaleValue,
    running,
    total,
    perMonth: total / months,
    runningPerMonth: running / months,
    /** Cash you actually spend each month: everything except resale loss (registration spread over the period). */
    pocketPerMonth: (running + paperwork) / months,
    perKm: total / km,
    buyingUsed,
    price,
    onRoad: price + (buyingUsed ? 0 : inp.taxPlan === "10yr" ? reg.totalBDT10yr : reg.totalBDT),
  };
}

export type CostBreakdown = ReturnType<typeof ownershipCost>;

/**
 * Card EMI as sold at BD showrooms: the price split over N months, usually 0% for 3–12 months
 * with partner-bank credit cards (bank processing fees vary). We show the plain split and say so.
 */
export const emiMonthly = (price: number, months = 12) => Math.ceil(price / months / 10) * 10;
