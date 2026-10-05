import type { BikeLite } from "./types";
import { BIKES, avgMileage, formatBDT, networkReach } from "./bikes";

export type Use = "commute" | "mixed" | "highway" | "rough" | "rideshare" | "fun";
export type Priority = "mileage" | "maintenance" | "performance" | "comfort" | "resale" | "safety" | "style";
export type Where = "dhaka" | "city" | "town" | "village";
export type Txt = { en: string; bn: string };

export type Answers = {
  budget: number; // total the buyer can pay for the bike (derived from monthly × 12 in EMI mode)
  payMode: "total" | "monthly";
  monthly: number;
  condition: "new" | "any";
  use: Use;
  where: Where;
  height: "short" | "medium" | "tall";
  experience: "first" | "some" | "pro";
  pillion: "rarely" | "sometimes" | "daily";
  gearless: "yes" | "no" | "either";
  priorities: Priority[];
};

export const EMI_MONTHS = 12;

export const DEFAULT_ANSWERS: Answers = {
  budget: 250000,
  payMode: "total",
  monthly: 20000,
  condition: "new",
  use: "commute",
  where: "dhaka",
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
  | "network"
  | "budgetFit";

const clamp = (x: number) => Math.max(0, Math.min(1, x));

function features(b: BikeLite, price: number, a: Answers): Record<Feature, number> {
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
    budgetFit: clamp(1 - Math.abs(Math.log(price / a.budget)) * 1.1),
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
  const w: Partial<Record<Feature, number>> = { ...USE_WEIGHTS[a.use], budgetFit: 2.2 };
  const add = (f: Feature, n: number) => (w[f] = (w[f] ?? 0) + n);
  Object.entries(WHERE_WEIGHTS[a.where]).forEach(([f, n]) => add(f as Feature, n!));
  a.priorities.forEach((p) => add(p, 2.6));
  if (a.pillion === "daily") add("pillion", 2.5);
  if (a.pillion === "sometimes") add("pillion", 1);
  if (a.experience === "first") add("beginner", 2.5);
  if (a.experience === "some") add("beginner", 0.6);
  return w;
}

export type Match = {
  bike: BikeLite;
  score: number; // 0–100
  /** Set when we're recommending a used example of a model that's still on sale. */
  used?: { age: 1 | 3; price: number };
  price: number; // what the buyer would actually pay
  reasons: Txt[];
  warnings: Txt[];
};

const SEAT_LIMIT = { short: 785, medium: 815, tall: 9999 };

const FEATURE_REASON: Record<Feature, (b: BikeLite, price: number) => Txt> = {
  mileage: (b) => ({
    en: `Real-world ${b.mileageKmpl[0]}–${b.mileageKmpl[1]} kmpl keeps fuel bills low`,
    bn: `বাস্তবে ${b.mileageKmpl[0]}–${b.mileageKmpl[1]} kmpl — তেলের খরচ কম`,
  }),
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
  budgetFit: (_b, price) => ({ en: `Fits your budget at ${formatBDT(price)}`, bn: `${formatBDT(price)} — আপনার বাজেটে মানায়` }),
};

/** Candidates: new bikes, plus (when open to used) classics and used examples of current models. */
function candidates(a: Answers) {
  const cap = a.budget * 1.06;
  const gearOk = (b: BikeLite) => !(a.gearless === "no" && b.category === "scooter") && !(a.gearless === "yes" && b.category !== "scooter");
  const out: { bike: BikeLite; price: number; used?: Match["used"] }[] = [];
  for (const b of BIKES) {
    if (!gearOk(b)) continue;
    if (b.status === "on-sale" && b.priceBDT <= cap) out.push({ bike: b, price: b.priceBDT });
    else if (a.condition === "any" && b.status === "used-only" && b.priceBDT <= cap) out.push({ bike: b, price: b.priceBDT });
    else if (a.condition === "any" && b.status === "on-sale" && b.usedPrice) {
      // Over budget new — would a lightly used one fit?
      const { y1, y3 } = b.usedPrice;
      if (y1 && y1 <= cap) out.push({ bike: b, price: y1, used: { age: 1, price: y1 } });
      else if (y3 && y3 <= cap) out.push({ bike: b, price: y3, used: { age: 3, price: y3 } });
    }
  }
  return out;
}

export function matchBikes(a: Answers, limit = 6): Match[] {
  const w = weights(a);
  const totalW = Object.values(w).reduce((s, x) => s + (x ?? 0), 0);
  const wantsClassic = a.use === "fun" || a.priorities.includes("style");

  const scored = candidates(a).map(({ bike: b, price, used }) => {
    const f = features(b, price, a);
    const contrib = (Object.keys(w) as Feature[]).map((k) => ({ k, v: (w[k] ?? 0) * f[k], f: f[k] }));
    let s = contrib.reduce((acc, c) => acc + c.v, 0) / totalW;

    const warnings: Txt[] = [];
    const seatOver = b.seatHeightMm - SEAT_LIMIT[a.height];
    if (seatOver > 0) {
      s -= Math.min(0.18, seatOver * 0.003);
      warnings.push({ en: `${b.seatHeightMm}mm seat may leave you on tiptoes`, bn: `${b.seatHeightMm}mm সিট — পা পুরো মাটিতে নাও পৌঁছাতে পারে` });
    }
    if (a.experience === "first" && (b.scores.performance >= 8 || b.weightKg >= 175)) {
      s -= 0.06;
      warnings.push(
        b.weightKg >= 175
          ? { en: `${b.weightKg} kg is heavy for a first bike`, bn: `প্রথম বাইক হিসেবে ${b.weightKg} kg ভারী` }
          : { en: "A lot of power for a first bike", bn: "প্রথম বাইকের জন্য পাওয়ার বেশি" },
      );
    }
    if (price > a.budget) {
      s -= 0.05;
      warnings.push({ en: `${formatBDT(price - a.budget)} over your budget`, bn: `বাজেটের চেয়ে ${formatBDT(price - a.budget)} বেশি` });
    }
    if (b.status === "used-only") {
      // Decades-old classics are hobby bikes, not sensible daily transport.
      if (!wantsClassic) s -= 0.14;
      warnings.push({ en: "Old design, discontinued — check papers and parts carefully", bn: "পুরনো ও বন্ধ হওয়া মডেল — কাগজ আর পার্টস ভালোভাবে যাচাই করুন" });
    }
    if (b.engine.stroke === 2 && !wantsClassic) {
      s -= 0.04;
      warnings.push({ en: "2-stroke: thirsty and smoky for daily use", bn: "২-স্ট্রোক: প্রতিদিনের জন্য তেল বেশি খায়, ধোঁয়া বেশি" });
    }
    if (used) s -= used.age === 3 ? 0.05 : 0.025;
    if (b.scores.partsAvailability <= 5) warnings.push({ en: "Parts are mostly dealer-only — expect waits", bn: "পার্টস মূলত ডিলারেই পাওয়া যায় — অপেক্ষা করতে হতে পারে" });
    if (b.scores.mechanicFamiliarity <= 4) warnings.push({ en: "Few mechanics outside the dealer know it well", bn: "ডিলারের বাইরে খুব কম মিস্ত্রি এটা ভালো চেনে" });
    if ((a.where === "town" || a.where === "village") && networkReach(b.brand) < 0.45) {
      s -= 0.05;
      warnings.push({ en: `Small ${b.brand} network outside big cities`, bn: `বড় শহরের বাইরে ${b.brand}-এর নেটওয়ার্ক ছোট` });
    }
    if (a.use === "highway" && b.engine.cc < 115) {
      s -= 0.08;
      warnings.push({ en: "Will feel strained above 70 km/h", bn: "৭০ km/h এর বেশি গতিতে কষ্ট হবে" });
    }
    if (a.pillion === "daily" && b.scores.pillion <= 4) warnings.push({ en: "Pillion seat is cramped", bn: "পিলিয়ন সিট ছোট" });

    const reasons = contrib
      .filter((c) => c.f >= 0.68 && c.k !== "budgetFit")
      .sort((x, y) => y.v - x.v)
      .slice(0, 3)
      .map((c) => FEATURE_REASON[c.k](b, price));
    if (reasons.length < 3 && price <= a.budget) reasons.push(FEATURE_REASON.budgetFit(b, price));

    return { bike: b, price, used, raw: s, reasons, warnings: warnings.slice(0, 2) };
  });

  scored.sort((x, y) => y.raw - x.raw);
  return scored.slice(0, limit).map((m) => ({
    bike: m.bike,
    price: m.price,
    used: m.used,
    score: Math.round(Math.max(40, Math.min(99, 30 + m.raw * 75))),
    reasons: m.reasons,
    warnings: m.warnings,
  }));
}

/** Cheapest new bike matching the gearbox preference — shown when nothing new fits the budget. */
export function cheapestNew(a: Pick<Answers, "gearless">) {
  return BIKES.filter((b) => b.status === "on-sale" && !(a.gearless === "no" && b.category === "scooter") && !(a.gearless === "yes" && b.category !== "scooter")).sort(
    (x, y) => x.priceBDT - y.priceBDT,
  )[0];
}

export const anyNewFits = (a: Answers) => candidates({ ...a, condition: "new" }).length > 0;

/** Compact URL encoding so a result page can be shared. */
export function encodeAnswers(a: Answers) {
  return new URLSearchParams({
    b: String(a.budget),
    pm: a.payMode,
    m: String(a.monthly),
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

export function decodeAnswers(q: URLSearchParams): Answers | null {
  const b = Number(q.get("b"));
  if (!b) return null;
  const pick = <T extends string>(v: string | null, opts: readonly T[], d: T) => (opts.includes(v as T) ? (v as T) : d);
  const D = DEFAULT_ANSWERS;
  return {
    budget: b,
    payMode: pick(q.get("pm"), ["total", "monthly"] as const, D.payMode),
    monthly: Number(q.get("m")) || Math.round(b / EMI_MONTHS),
    condition: pick(q.get("c"), ["new", "any"] as const, D.condition),
    use: pick(q.get("u"), ["commute", "mixed", "highway", "rough", "rideshare", "fun"] as const, D.use),
    where: pick(q.get("w"), ["dhaka", "city", "town", "village"] as const, D.where),
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
