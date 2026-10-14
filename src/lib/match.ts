import type { BikeLite } from "./types";
import { BIKES, HAS_NETWORKS, avgMileage, formatBDT, networkReach } from "./bikes";
import { MAX_REGISTRABLE_CC, onRoadPrice } from "./cost";
import { emiCeiling, emiPlan, type PathResult } from "./fund";

export type Use = "commute" | "mixed" | "highway" | "rough" | "rideshare" | "fun";
export type Priority = "mileage" | "maintenance" | "performance" | "comfort" | "resale" | "safety" | "style" | "price";
const PRIORITY_IDS: readonly Priority[] = ["mileage", "maintenance", "performance", "comfort", "resale", "safety", "style", "price"];
export type Where = "dhaka" | "city" | "town" | "village";
export type Txt = { en: string; bn: string };

export const EMI_TENURES = [3, 6, 12, 18, 24, 36] as const;
export type Tenure = (typeof EMI_TENURES)[number];

export type Answers = {
  budget: number; // on-road ceiling: bike + BRTA registration (derived with emiCeiling in EMI mode)
  payMode: "total" | "monthly";
  monthly: number;
  down: number; // EMI mode: cash available now (pays BRTA, the processing fee and any down payment)
  tenure: Tenure; // EMI mode: months
  condition: "new" | "any";
  use: Use;
  where: Where;
  height: "short" | "medium" | "tall";
  experience: "first" | "some" | "pro";
  pillion: "rarely" | "sometimes" | "daily";
  gearless: "yes" | "no" | "either";
  priorities: Priority[];
};

/** Bikroy prices are asking prices and bikes usually sell lower, so we count 5% off (APPROX) against the budget. */
export const USED_HAIRCUT = 0.05;
/** Stretch picks may go this far over the on-road budget; they are shown in their own section. */
export const STRETCH = 0.1;
/**
 * Soft budget band: a buyer with ৳4 lakh rarely wants a ৳1.3 lakh bike. An option costing under BAND_LOW of the budget
 * loses the shortfall from its 0–1 fit (a bike at 35% of the budget loses 0.25, about 19 points). Off with "Lowest price".
 */
export const BAND_LOW = 0.6;
/** Score points a bike of another style may trail #3 by and still take its place, so the top 3 is not three of a kind. */
export const DIVERSE_GAP = 5;
/** Shared-link limits for the on-road budget (the quiz slider runs ৳30,000-৳7 lakh) and the EMI inputs. */
export const BUDGET_RANGE = [30000, 1000000] as const;
const MONTHLY_MAX = 60000;

/** Ex-showroom + BRTA registration with the 2-year tax token; lives in cost.ts so every page shares it. */
export { onRoadPrice };

export const DEFAULT_ANSWERS: Answers = {
  budget: 250000,
  payMode: "total",
  monthly: 20000,
  down: 50000,
  tenure: 12,
  condition: "new",
  use: "commute",
  where: "dhaka",
  height: "medium",
  experience: "some",
  pillion: "sometimes",
  gearless: "either",
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
  | "network"
  | "price";

const clamp = (x: number) => Math.max(0, Math.min(1, x));

// Price depends on the option (new or used) and the budget, so score() adds it; here it is neutral.
function features(b: BikeLite): Record<Feature, number> {
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
    network: clamp(networkReach(b.brand) * 0.6 + (s.mechanicFamiliarity / 10) * 0.4),
    price: 0,
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

const WHERE_WEIGHTS: Record<Where, Partial<Record<Feature, number>>> = {
  dhaka: {},
  city: { network: 0.8, maintenance: 0.5 },
  town: { network: 2, maintenance: 1.5 },
  village: { network: 2.5, maintenance: 2, offroad: 1 },
};

function weights(a: Answers) {
  const w: Partial<Record<Feature, number>> = { ...USE_WEIGHTS[a.use] };
  const add = (f: Feature, n: number) => (w[f] = (w[f] ?? 0) + n);
  Object.entries(WHERE_WEIGHTS[HAS_NETWORKS ? a.where : "dhaka"]).forEach(([f, n]) => add(f as Feature, n!));
  a.priorities.forEach((p) => add(p, 2.6));
  if (a.pillion === "daily") add("pillion", 2.5);
  if (a.pillion === "sometimes") add("pillion", 1);
  if (a.experience === "first") add("beginner", 2.5);
  if (a.experience === "some") add("beginner", 0.6);
  return w;
}

export type Band = "great" | "good" | "possible";

export type Match = {
  bike: BikeLite;
  score: number; // internal 0–100, for sorting only; show `band`
  band: Band;
  /** Set when we're recommending a used example of a model that's still on sale. Test with isUsedOption. */
  used?: { age: 1 | 3; price: number };
  /** EMI mode only, new bikes: the plan from fund.ts (cash now, instalment, fee). */
  pay?: PathResult;
  price: number; // ex-showroom (new) or Bikroy asking price (used)
  registration: number; // BRTA registration added on top (0 when used)
  onRoad: number; // price + registration
  cost: number; // what we compare with the budget: onRoad, or the asking price less USED_HAIRCUT when used
  reasons: Txt[];
  warnings: Txt[];
};

/**
 * Height check. Reach = seat height in mm + 0.5 mm for every kg over 130 kg, because a heavy bike is
 * harder to hold up on tiptoes. Warn when reach is over 800 (rider under 165 cm) or 830 (165–175 cm);
 * riders over 175 cm are never warned. So a 790 mm / 139 kg commuter passes a short rider, a 790 mm /
 * 175 kg cruiser or any 805 mm seat does not.
 */
const REACH_LIMIT = { short: 800, medium: 830, tall: Infinity };
const reach = (b: BikeLite) => b.seatHeightMm + Math.max(0, b.weightKg - 130) * 0.5;

const FEATURE_REASON: Record<Feature, (b: BikeLite) => Txt> = {
  mileage: (b) =>
    b.ev
      ? { en: `Real-world ${b.ev.realRangeKm[0]}–${b.ev.realRangeKm[1]} km per charge; electricity costs far less than petrol`, bn: `বাস্তবে প্রতি চার্জে ${b.ev.realRangeKm[0]}–${b.ev.realRangeKm[1]} কিমি; বিদ্যুতের খরচ তেলের চেয়ে অনেক কম` }
      : { en: `Real-world ${b.mileageKmpl[0]}–${b.mileageKmpl[1]} kmpl keeps fuel bills low`, bn: `বাস্তবে ${b.mileageKmpl[0]}–${b.mileageKmpl[1]} kmpl — তেলের খরচ কম` },
  maintenance: (b) =>
    b.scores.mechanicFamiliarity >= 8
      ? { en: "Any local mechanic can service it; parts are everywhere", bn: "যেকোনো লোকাল মিস্ত্রি সার্ভিস করতে পারে; পার্টস সব জায়গায় পাওয়া যায়" }
      : { en: "Easy and cheap to keep running", bn: "চালু রাখা সহজ ও সস্তা" },
  performance: (b) => ({ en: `${b.powerPS} PS — strong pull for its class`, bn: `${b.powerPS} PS — এই ক্লাসে ভালো টান` }),
  comfort: () => ({ en: "Comfortable seat and suspension for long days", bn: "লম্বা সময় চালাতেও আরামদায়ক সিট ও সাসপেনশন" }),
  resale: () => ({ en: "Holds its value well when you sell", bn: "বিক্রির সময় ভালো দাম পাবেন" }),
  safety: (b) =>
    b.brakes.abs === "dual"
      ? { en: "Dual-channel ABS — the safest braking setup here", bn: "ডুয়াল-চ্যানেল ABS — সবচেয়ে নিরাপদ ব্রেকিং" }
      : b.brakes.abs === "single"
        ? { en: "Front ABS for safer panic stops", bn: "সামনে ABS — হঠাৎ ব্রেকে বেশি নিরাপদ" }
        : { en: "Combined braking helps beginners stop straight", bn: "কম্বাইন্ড ব্রেকিং নতুনদের সোজা থামতে সাহায্য করে" },
  style: () => ({ en: "Turns heads — looks the part", bn: "দেখতে দারুণ — নজর কাড়ে" }),
  city: () => ({ en: "Light and nimble in Dhaka traffic", bn: "ঢাকার জ্যামে হালকা ও সহজে চালানো যায়" }),
  highway: () => ({ en: "Stable and relaxed at highway speeds", bn: "হাইওয়ে স্পিডে স্থির ও আরামদায়ক" }),
  offroad: () => ({ en: "Long suspension shrugs off broken roads", bn: "লম্বা সাসপেনশন ভাঙা রাস্তা সহজে সামলায়" }),
  pillion: () => ({ en: "Roomy and stable with a passenger", bn: "পিলিয়নসহ জায়গা আর স্থিরতা ভালো" }),
  reliability: () => ({ en: "Proven, trouble-free engine", bn: "পরীক্ষিত, ঝামেলাহীন ইঞ্জিন" }),
  beginner: () => ({ en: "Forgiving and easy to learn on", bn: "শেখার জন্য সহজ ও ক্ষমাশীল" }),
  network: (b) => ({ en: `${b.brand} showrooms and workshops reach most districts`, bn: `${b.brand}-এর শোরুম ও ওয়ার্কশপ বেশিরভাগ জেলায় আছে` }),
  price: () => ({ en: "Leaves most of your budget in your pocket", bn: "বাজেটের বেশিরভাগ টাকা হাতে থাকে" }),
};

type Option = Pick<Match, "bike" | "price" | "registration" | "onRoad" | "cost" | "used" | "pay">;

/** A used example or a used-only model: asking price, no new registration, no card EMI or bike loan. */
export const isUsedOption = (m: Pick<Match, "bike" | "used">) => !!m.used || m.bike.status === "used-only";

const gearOk = (a: Pick<Answers, "gearless">, b: BikeLite) => !(a.gearless === "no" && b.category === "scooter") && !(a.gearless === "yes" && b.category !== "scooter");
/** The quiz never suggests a bike an individual cannot register in BD (critique section 4: a 748cc import came up for "fun"). */
export const registrable = (b: Pick<BikeLite, "engine">) => b.engine.cc <= MAX_REGISTRABLE_CC;
const usedOption = (bike: BikeLite, price: number, used?: Match["used"]): Option => ({
  bike,
  price,
  used,
  registration: 0, // shortcut: ownership-transfer fee not counted for used bikes (cost.ts does the same); add when sourced
  onRoad: price,
  cost: Math.round(price * (1 - USED_HAIRCUT)),
});

/** Every way to buy each bike, in order of preference: new, then ~1-year-old, then ~3-year-old. */
function options(a: Answers): Option[][] {
  const emi = a.payMode === "monthly";
  const used = a.condition === "any" && !emi; // a private used sale has no card EMI or bike loan
  return BIKES.filter((b) => gearOk(a, b) && registrable(b)).map((b) => {
    if (b.status === "used-only") return used ? [usedOption(b, b.priceBDT)] : [];
    const onRoad = onRoadPrice(b);
    const registration = onRoad - b.priceBDT;
    const pay = emi ? emiPlan(b.priceBDT, registration, a.monthly, a.tenure) : undefined;
    const out: Option[] = [{ bike: b, price: b.priceBDT, registration, onRoad, cost: onRoad, pay }];
    if (used && b.usedPrice) {
      if (b.usedPrice.y1) out.push(usedOption(b, b.usedPrice.y1, { age: 1, price: b.usedPrice.y1 }));
      if (b.usedPrice.y3) out.push(usedOption(b, b.usedPrice.y3, { age: 3, price: b.usedPrice.y3 }));
    }
    return out;
  });
}

/** The preferred way to buy each bike within `ceiling`. On EMI the cash needed now must fit too (a stretch adds that extra cash). */
const candidates = (a: Answers, ceiling: number) =>
  options(a).flatMap((os) => os.find((o) => o.cost <= ceiling && (!o.pay || o.pay.upfront <= a.down + ceiling - a.budget)) ?? []);

function score(a: Answers, o: Option): Match {
  const { bike: b, cost, used } = o;
  const w = weights(a);
  const totalW = Object.values(w).reduce((s, x) => s + (x ?? 0), 0);
  const f = { ...features(b), price: clamp(1 - cost / Math.max(1, a.budget)) };
  const contrib = (Object.keys(w) as Feature[]).map((k) => ({ k, v: (w[k] ?? 0) * f[k], f: f[k] }));
  let s = contrib.reduce((acc, c) => acc + c.v, 0) / totalW;
  const wantsClassic = a.use === "fun" || a.priorities.includes("style");
  const dailyRider = a.use === "commute" || a.use === "rideshare";

  if (!a.priorities.includes("price")) s -= Math.max(0, BAND_LOW - cost / Math.max(1, a.budget));

  const warnings: Txt[] = [];
  const short = o.pay ? o.pay.upfront - a.down : cost - a.budget;
  if (short > 0)
    warnings.push(
      o.pay
        ? { en: `Needs ${formatBDT(short)} more cash now (BRTA, fee and down payment)`, bn: `এখনই আরও ${formatBDT(short)} নগদ লাগবে (BRTA, ফি ও ডাউন পেমেন্ট)` }
        : { en: `${formatBDT(short)} over your budget`, bn: `বাজেটের চেয়ে ${formatBDT(short)} বেশি` },
    );
  const reachOver = reach(b) - REACH_LIMIT[a.height];
  if (reachOver > 0) {
    s -= Math.min(0.18, reachOver * 0.006);
    warnings.push(
      b.weightKg > 150
        ? { en: `${b.seatHeightMm}mm seat and ${b.weightKg} kg — hard to hold up on tiptoes`, bn: `${b.seatHeightMm}mm সিট আর ${b.weightKg} kg — পা পুরো না পৌঁছালে সামলানো কঠিন` }
        : { en: `${b.seatHeightMm}mm seat may leave you on tiptoes`, bn: `${b.seatHeightMm}mm সিট — পা পুরো মাটিতে নাও পৌঁছাতে পারে` },
    );
  }
  if (a.experience === "first" && (b.scores.performance >= 8 || b.weightKg >= 175)) {
    s -= 0.06;
    warnings.push(
      b.weightKg >= 175
        ? { en: `${b.weightKg} kg is heavy for a first bike`, bn: `প্রথম বাইক হিসেবে ${b.weightKg} kg ভারী` }
        : { en: "A lot of power for a first bike", bn: "প্রথম বাইকের জন্য পাওয়ার বেশি" },
    );
  }
  // Decades-old classics and 2-strokes are hobby bikes: near the bottom for daily riders unless they asked for style or fun.
  const hobby = b.status === "used-only" || b.engine.stroke === 2;
  if (hobby && !wantsClassic) s -= dailyRider ? 0.3 : 0.14;
  if (b.status === "used-only") warnings.push({ en: "Old design, discontinued — check papers and parts carefully", bn: "পুরনো ও বন্ধ হওয়া মডেল — কাগজ আর পার্টস ভালোভাবে যাচাই করুন" });
  if (b.engine.stroke === 2) warnings.push({ en: "2-stroke: thirsty and smoky for daily use", bn: "২-স্ট্রোক: প্রতিদিনের জন্য তেল বেশি খায়, ধোঁয়া বেশি" });
  if (used) s -= used.age === 3 ? 0.05 : 0.025;
  if (b.scores.partsAvailability <= 5) warnings.push({ en: "Parts are mostly dealer-only — expect waits", bn: "পার্টস মূলত ডিলারেই পাওয়া যায় — অপেক্ষা করতে হতে পারে" });
  if (b.scores.mechanicFamiliarity <= 4) warnings.push({ en: "Few mechanics outside the dealer know it well", bn: "ডিলারের বাইরে খুব কম মিস্ত্রি এটা ভালো চেনে" });
  if (HAS_NETWORKS && (a.where === "town" || a.where === "village") && networkReach(b.brand) < 0.45) {
    s -= 0.05;
    warnings.push({ en: `Small ${b.brand} network outside big cities`, bn: `বড় শহরের বাইরে ${b.brand}-এর নেটওয়ার্ক ছোট` });
  }
  if (a.use === "highway" && b.engine.cc < 115) {
    s -= 0.08;
    warnings.push({ en: "Will feel strained above 70 km/h", bn: "৭০ km/h এর বেশি গতিতে কষ্ট হবে" });
  }
  if (a.pillion === "daily" && b.scores.pillion <= 4) warnings.push({ en: "Pillion seat is cramped", bn: "পিলিয়ন সিট ছোট" });
  // First, because cards show only the first warning: a new one may not be in stock at all.
  if (b.availability === "unconfirmed" && !used) warnings.unshift({ en: "Availability unconfirmed: ask the showroom if it is in stock", bn: "পাওয়া যাবে কিনা অনিশ্চিত: শোরুমে স্টক আছে কিনা জিজ্ঞেস করুন" });

  const reasons = contrib
    .filter((c) => c.f >= 0.68)
    .sort((x, y) => y.v - x.v)
    .slice(0, 3)
    .map((c) => FEATURE_REASON[c.k](b));
  if (reasons.length < 3 && short <= 0)
    reasons.push(
      isUsedOption(o)
        ? { en: `Fits your budget at ${formatBDT(o.price)} asking`, bn: `চাওয়া দাম ${formatBDT(o.price)} — আপনার বাজেটে মানায়` }
        : { en: `Fits your budget at ${formatBDT(o.onRoad)} on the road`, bn: `অন-রোড ${formatBDT(o.onRoad)} — আপনার বাজেটে মানায়` },
    );

  const sc = Math.round(Math.max(0, Math.min(99, 30 + s * 75)));
  return { ...o, score: sc, band: sc >= BAND.great ? "great" : sc >= BAND.good ? "good" : "possible", reasons, warnings: warnings.slice(0, 2) };
}

/** Internal score cut-offs for the bands users see (roughly the top 40% / next 45% of top-6 results across personas). */
const BAND = { great: 88, good: 78 };

// Ties go to the cheaper option: same fit, more money left over.
const rank = (a: Answers, os: Option[]) => os.map((o) => score(a, o)).sort((x, y) => y.score - x.score || x.cost - y.cost);

/** Best matches whose on-road cost is within the budget, best first, except that #3 may be a close bike of another style. */
export function matchBikes(a: Answers, limit = 6): Match[] {
  const r = rank(a, candidates(a, a.budget));
  const i = r.findIndex((m) => m.bike.category !== r[0].bike.category);
  // The top 3 share a style: the best bike of another style takes #3 if it is nearly as good.
  if (i > 2 && r[2].score - r[i].score <= DIVERSE_GAP) r.splice(2, 0, ...r.splice(i, 1));
  return r.slice(0, limit);
}

/** Up to `n` bikes 0–10% over the on-road budget that are not reachable within it. */
export function stretchPicks(a: Answers, n = 2): Match[] {
  const inBudget = new Set(candidates(a, a.budget).map((o) => o.bike.id));
  return rank(a, candidates(a, a.budget * (1 + STRETCH)).filter((o) => !inBudget.has(o.bike.id))).slice(0, n);
}

/** Empty-state fallback: the cheapest way to buy each bike, cheapest first, ignoring the budget. */
export function cheapestPicks(a: Answers, n = 3): Match[] {
  const cheapest = options(a).flatMap((os) => (os.length ? [os.reduce((x, y) => (y.cost < x.cost ? y : x))] : []));
  return cheapest
    .sort((x, y) => x.cost - y.cost)
    .slice(0, n)
    .map((o) => score(a, o));
}

/** Cheapest new bike matching the gearbox preference — shown when nothing new fits the budget. */
export function cheapestNew(a: Pick<Answers, "gearless">) {
  return BIKES.filter((b) => b.status === "on-sale" && gearOk(a, b) && registrable(b)).sort((x, y) => x.priceBDT - y.priceBDT)[0];
}

export const anyNewFits = (a: Answers) => candidates({ ...a, condition: "new" }, a.budget).length > 0;

/** Compact URL encoding so a result page can be shared. */
export function encodeAnswers(a: Answers) {
  return new URLSearchParams({
    b: String(a.budget),
    pm: a.payMode,
    m: String(a.monthly),
    d: String(a.down),
    t: String(a.tenure),
    c: a.condition,
    u: a.use,
    w: a.where,
    h: a.height,
    e: a.experience,
    p: a.pillion,
    g: a.gearless,
    pr: a.priorities.join("."),
  }).toString();
}

/** Reads a shared link. Values are clamped (Cap rule): the budget to BUDGET_RANGE, the EMI inputs to the quiz limits. */
export function decodeAnswers(q: URLSearchParams): Answers | null {
  const b = Number(q.get("b"));
  if (!b) return null;
  const pick = <T extends string>(v: string | null, opts: readonly T[], d: T) => (opts.includes(v as T) ? (v as T) : d);
  const num = (k: string, lo: number, hi: number, d: number) => Math.min(hi, Math.max(lo, Number(q.get(k)) || d));
  const D = DEFAULT_ANSWERS;
  const tenure = Number(q.get("t")) as Tenure;
  const payMode = pick(q.get("pm"), ["total", "monthly"] as const, D.payMode);
  const budget = Math.min(BUDGET_RANGE[1], Math.max(BUDGET_RANGE[0], b));
  const monthly = num("m", 0, MONTHLY_MAX, Math.round(budget / 12));
  const down = num("d", 0, BUDGET_RANGE[1], 0);
  const t = EMI_TENURES.includes(tenure) ? tenure : D.tenure;
  return {
    budget: payMode === "monthly" ? emiCeiling(down, monthly, t) : budget, // EMI mode: never trust b, derive it
    payMode,
    monthly,
    down,
    tenure: t,
    condition: pick(q.get("c"), ["new", "any"] as const, D.condition),
    use: pick(q.get("u"), ["commute", "mixed", "highway", "rough", "rideshare", "fun"] as const, D.use),
    where: pick(q.get("w"), ["dhaka", "city", "town", "village"] as const, D.where),
    height: pick(q.get("h"), ["short", "medium", "tall"] as const, D.height),
    experience: pick(q.get("e"), ["first", "some", "pro"] as const, D.experience),
    pillion: pick(q.get("p"), ["rarely", "sometimes", "daily"] as const, D.pillion),
    gearless: pick(q.get("g"), ["yes", "no", "either"] as const, D.gearless),
    priorities: [...new Set((q.get("pr") || "").split("."))].filter((x): x is Priority => PRIORITY_IDS.includes(x as Priority)).slice(0, 3),
  };
}
