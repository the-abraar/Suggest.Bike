import type { Bike } from "./types";
import { BIKES, avgMileage, formatBDT } from "./bikes";

export type Use = "commute" | "mixed" | "highway" | "rough" | "rideshare" | "fun";
export type Priority = "mileage" | "maintenance" | "performance" | "comfort" | "resale" | "safety" | "style";

export type Answers = {
  budget: number;
  condition: "new" | "any";
  use: Use;
  height: "short" | "medium" | "tall";
  experience: "first" | "some" | "pro";
  pillion: "rarely" | "sometimes" | "daily";
  gearless: "yes" | "no" | "either";
  priorities: Priority[];
};

export const DEFAULT_ANSWERS: Answers = {
  budget: 250000,
  condition: "new",
  use: "commute",
  height: "medium",
  experience: "some",
  pillion: "sometimes",
  gearless: "no",
  priorities: [],
};

type Feature =
  | "mileage"
  | "maintenance"
  | "performance"
  | "comfort"
  | "resale"
  | "safety"
  | "style"
  | "city"
  | "highway"
  | "offroad"
  | "pillion"
  | "reliability"
  | "beginner"
  | "budgetFit";

const clamp = (x: number) => Math.max(0, Math.min(1, x));

function features(b: Bike, a: Answers): Record<Feature, number> {
  const s = b.scores;
  const absScore = { dual: 1, single: 0.75, cbs: 0.4, none: 0.1 }[b.brakes.abs] + (b.brakes.front === "disc" ? 0 : -0.1);
  const styleCat = { sport: 1, naked: 0.9, classic: 0.9, cruiser: 0.8, adventure: 0.85, street: 0.55, scooter: 0.45, commuter: 0.2 }[b.category];
  return {
    mileage: clamp((avgMileage(b) - 25) / 45),
    maintenance: clamp((s.mechanicFamiliarity + s.partsAvailability + s.reliability) / 30 - (b.avgServiceCostBDT - 800) / 12000),
    performance: s.performance / 10,
    comfort: s.comfort / 10,
    resale: s.resale / 10,
    safety: clamp(absScore),
    style: clamp(styleCat * 0.7 + (s.performance / 10) * 0.3),
    city: s.cityHandling / 10,
    highway: s.highway / 10,
    offroad: s.offroad / 10,
    pillion: s.pillion / 10,
    reliability: s.reliability / 10,
    beginner: s.beginnerFriendly / 10,
    budgetFit: clamp(1 - Math.abs(Math.log(b.priceBDT / a.budget)) * 1.1),
  };
}

const USE_WEIGHTS: Record<Use, Partial<Record<Feature, number>>> = {
  commute: { city: 3, mileage: 2, maintenance: 1.5, comfort: 1 },
  mixed: { city: 1.5, highway: 1.5, comfort: 1.2, mileage: 1, reliability: 1 },
  highway: { highway: 3, comfort: 2, performance: 1.5, safety: 1 },
  rough: { offroad: 3, comfort: 1.2, reliability: 1.2, maintenance: 1 },
  rideshare: { mileage: 3, maintenance: 2.5, pillion: 2, reliability: 1.5, city: 1 },
  fun: { performance: 3, style: 1.8, highway: 0.8, city: 0.5 },
};

function weights(a: Answers) {
  const w: Partial<Record<Feature, number>> = { ...USE_WEIGHTS[a.use], budgetFit: 2.2 };
  const add = (f: Feature, n: number) => (w[f] = (w[f] ?? 0) + n);
  a.priorities.forEach((p) => add(p, 2.6));
  if (a.pillion === "daily") add("pillion", 2.5);
  if (a.pillion === "sometimes") add("pillion", 1);
  if (a.experience === "first") add("beginner", 2.5);
  if (a.experience === "some") add("beginner", 0.6);
  return w;
}

export type Match = {
  bike: Bike;
  score: number; // 0–100
  reasons: string[];
  warnings: string[];
};

const SEAT_LIMIT = { short: 785, medium: 815, tall: 9999 };

const FEATURE_REASON: Record<Feature, (b: Bike) => string> = {
  mileage: (b) => `Real-world ${b.mileageKmpl[0]}–${b.mileageKmpl[1]} kmpl keeps fuel bills low`,
  maintenance: (b) =>
    b.scores.mechanicFamiliarity >= 8 ? "Any local mechanic can service it; parts are everywhere" : "Easy and cheap to keep running",
  performance: (b) => `${b.powerPS} PS — strong pull for its class`,
  comfort: () => "Comfortable seat and suspension for long days",
  resale: () => "Holds its value well when you sell",
  safety: (b) => (b.brakes.abs === "dual" ? "Dual-channel ABS — the safest braking setup here" : b.brakes.abs === "single" ? "Front ABS for safer panic stops" : "Combined braking helps beginners stop straight"),
  style: () => "Turns heads — looks the part",
  city: () => "Light and nimble in Dhaka traffic",
  highway: () => "Stable and relaxed at highway speeds",
  offroad: () => "Long suspension shrugs off broken roads",
  pillion: () => "Roomy and stable with a passenger",
  reliability: () => "Proven, trouble-free engine",
  beginner: () => "Forgiving and easy to learn on",
  budgetFit: (b) => `Fits your budget at ${formatBDT(b.priceBDT)}`,
};

export function matchBikes(a: Answers, limit = 6): Match[] {
  const w = weights(a);
  const totalW = Object.values(w).reduce((s, x) => s + (x ?? 0), 0);

  const pool = BIKES.filter((b) => {
    if (b.priceBDT > a.budget * 1.06) return false;
    if (a.condition === "new" && b.status === "used-only") return false;
    if (a.gearless === "no" && b.category === "scooter") return false;
    if (a.gearless === "yes" && b.category !== "scooter") return false;
    return true;
  });

  const scored = pool.map((b) => {
    const f = features(b, a);
    const contrib = (Object.keys(w) as Feature[]).map((k) => ({ k, v: (w[k] ?? 0) * f[k], w: w[k] ?? 0, f: f[k] }));
    let s = contrib.reduce((acc, c) => acc + c.v, 0) / totalW;

    const warnings: string[] = [];
    const seatOver = b.seatHeightMm - SEAT_LIMIT[a.height];
    if (seatOver > 0) {
      s -= Math.min(0.18, seatOver * 0.003);
      warnings.push(`${b.seatHeightMm}mm seat may leave you on tiptoes`);
    }
    if (a.experience === "first" && (b.scores.performance >= 8 || b.weightKg >= 175)) {
      s -= 0.06;
      warnings.push(b.weightKg >= 175 ? `${b.weightKg} kg is heavy for a first bike` : "A lot of power for a first bike");
    }
    if (b.priceBDT > a.budget) {
      s -= 0.05;
      warnings.push(`${formatBDT(b.priceBDT - a.budget)} over your budget`);
    }
    if (b.scores.partsAvailability <= 5) warnings.push("Parts are mostly dealer-only — expect waits");
    if (b.scores.mechanicFamiliarity <= 4) warnings.push("Few mechanics outside the dealer know it well");
    if (a.use === "highway" && b.engine.cc < 115) {
      s -= 0.08;
      warnings.push("Will feel strained above 70 km/h");
    }
    if (a.pillion === "daily" && b.scores.pillion <= 4) warnings.push("Pillion seat is cramped");

    const reasons = contrib
      .filter((c) => c.f >= 0.68 && c.k !== "budgetFit")
      .sort((x, y) => y.v - x.v)
      .slice(0, 3)
      .map((c) => FEATURE_REASON[c.k](b));
    if (reasons.length < 3 && b.priceBDT <= a.budget) reasons.push(FEATURE_REASON.budgetFit(b));

    return { bike: b, raw: s, reasons, warnings: warnings.slice(0, 2) };
  });

  scored.sort((x, y) => y.raw - x.raw);
  return scored.slice(0, limit).map((m) => ({
    bike: m.bike,
    score: Math.round(Math.max(40, Math.min(99, 30 + m.raw * 75))),
    reasons: m.reasons,
    warnings: m.warnings,
  }));
}

/** Compact URL encoding so a result page can be shared. */
export function encodeAnswers(a: Answers) {
  return new URLSearchParams({
    b: String(a.budget),
    c: a.condition,
    u: a.use,
    h: a.height,
    e: a.experience,
    p: a.pillion,
    g: a.gearless,
    pr: a.priorities.join("."),
  }).toString();
}

export function decodeAnswers(q: URLSearchParams): Answers | null {
  const b = Number(q.get("b"));
  if (!b) return null;
  const pick = <T extends string>(v: string | null, opts: readonly T[], d: T) => (opts.includes(v as T) ? (v as T) : d);
  const D = DEFAULT_ANSWERS;
  return {
    budget: b,
    condition: pick(q.get("c"), ["new", "any"] as const, D.condition),
    use: pick(q.get("u"), ["commute", "mixed", "highway", "rough", "rideshare", "fun"] as const, D.use),
    height: pick(q.get("h"), ["short", "medium", "tall"] as const, D.height),
    experience: pick(q.get("e"), ["first", "some", "pro"] as const, D.experience),
    pillion: pick(q.get("p"), ["rarely", "sometimes", "daily"] as const, D.pillion),
    gearless: pick(q.get("g"), ["yes", "no", "either"] as const, D.gearless),
    priorities: (q.get("pr") || "")
      .split(".")
      .filter((x): x is Priority => ["mileage", "maintenance", "performance", "comfort", "resale", "safety", "style"].includes(x))
      .slice(0, 3),
  };
}
