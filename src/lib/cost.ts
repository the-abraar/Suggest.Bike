import guide from "@/data/guide.json";
import type { Bike, Category } from "./types";
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

const TYRE_PAIR: Record<Category, number> = {
  commuter: 5200,
  scooter: 5500,
  street: 7500,
  cruiser: 8500,
  classic: 8000,
  naked: 9500,
  sport: 10000,
  adventure: 11000,
};

export type CostInput = {
  kmPerDay: number;
  years: number;
  fuelPrice: number;
  taxPlan: "2yr" | "10yr";
  insurance: boolean;
  includeDepreciation: boolean;
};

export const DEFAULT_COST_INPUT: CostInput = {
  kmPerDay: 25,
  years: 3,
  fuelPrice: FUEL.octane,
  taxPlan: "10yr",
  insurance: false,
  includeDepreciation: true,
};

/** Fraction of purchase price kept per year, driven by the resale score (5 → 0.86/yr, 10 → 0.92/yr). */
export const yearlyRetention = (b: Bike) => 0.8 + b.scores.resale * 0.012;

export function ownershipCost(b: Bike, inp: CostInput) {
  const km = inp.kmPerDay * 365 * inp.years;
  const fuel = (km / avgMileage(b)) * inp.fuelPrice;

  const services = Math.floor(km / b.serviceIntervalKm);
  const service = services * b.avgServiceCostBDT;

  const part = (needle: string) => b.parts.find((p) => p.name.toLowerCase().includes(needle))?.priceBDT;
  const chain = Math.floor(km / 18000) * (part("chain") ?? 2500);
  const brakes = Math.floor(km / 10000) * (part("brake") ?? 600);
  const tyres = Math.floor(km / 25000) * TYRE_PAIR[b.category];
  const wear = chain + brakes + tyres + Math.floor(km / 30000) * (part("clutch") ?? 1800);

  const reg = registrationFor(b.engine.cc);
  const paperwork =
    b.status === "used-only"
      ? 0
      : inp.taxPlan === "10yr"
        ? reg.totalBDT10yr
        : reg.totalBDT + Math.max(0, Math.ceil(inp.years / 2) - 1) * ROAD_TAX_2YR(b.engine.cc);
  const insurance = inp.insurance ? THIRD_PARTY_INSURANCE * inp.years : 0;

  const resaleValue = Math.round(b.priceBDT * Math.pow(yearlyRetention(b), inp.years));
  const depreciation = inp.includeDepreciation ? b.priceBDT - resaleValue : 0;

  const running = fuel + service + wear + insurance;
  const total = running + paperwork + depreciation;
  const months = inp.years * 12;

  return {
    km,
    fuel,
    service,
    wear,
    paperwork,
    insurance,
    depreciation,
    resaleValue,
    running,
    total,
    perMonth: total / months,
    runningPerMonth: running / months,
    perKm: total / km,
    onRoad: b.priceBDT + (b.status === "used-only" ? 0 : inp.taxPlan === "10yr" ? reg.totalBDT10yr : reg.totalBDT),
  };
}

export type CostBreakdown = ReturnType<typeof ownershipCost>;
