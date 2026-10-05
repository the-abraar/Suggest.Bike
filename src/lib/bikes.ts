import raw from "@/data/bikes.json";
import type { Bike, Category, ScoreKey } from "./types";

export const BIKES: Bike[] = (raw as Bike[])
  .slice()
  .sort((a, b) => a.brand.localeCompare(b.brand) || a.priceBDT - b.priceBDT);

const byId = new Map(BIKES.map((b) => [b.id, b]));
export const getBike = (id: string) => byId.get(id);

export const BRANDS = Array.from(new Set(BIKES.map((b) => b.brand))).sort();

export const fullName = (b: Bike) => `${b.brand} ${b.model}`;

export const CATEGORIES: Record<Category, { en: string; bn: string; blurb: string }> = {
  commuter: { en: "Commuter", bn: "কমিউটার", blurb: "100–125cc daily runners. Cheap to buy, cheaper to run." },
  street: { en: "Street", bn: "স্ট্রিট", blurb: "The 150–165cc all-rounders most of Bangladesh rides." },
  naked: { en: "Naked", bn: "নেকেড", blurb: "Sharper, faster, more aggressive streetfighters." },
  sport: { en: "Sport", bn: "স্পোর্টস", blurb: "Full fairings, clip-ons, highway speed." },
  adventure: { en: "Adventure", bn: "অ্যাডভেঞ্চার", blurb: "Long suspension for broken roads and village trails." },
  cruiser: { en: "Cruiser", bn: "ক্রুজার", blurb: "Low seat, relaxed posture, easy miles." },
  classic: { en: "Classic", bn: "ক্লাসিক", blurb: "Retro charm — thump, chrome and character." },
  scooter: { en: "Scooter", bn: "স্কুটার", blurb: "Gearless, easy, storage under the seat." },
};

export const SCORE_LABELS: Record<ScoreKey, { en: string; bn: string; hint: string }> = {
  reliability: { en: "Reliability", bn: "নির্ভরযোগ্যতা", hint: "How rarely it leaves you stranded" },
  mechanicFamiliarity: { en: "Mechanic familiarity", bn: "মেকানিক পরিচিতি", hint: "Can the local mistri fix it, or only the dealer?" },
  partsAvailability: { en: "Parts availability", bn: "পার্টস সহজলভ্যতা", hint: "Found in Bangshal & district bazaars, or ordered?" },
  resale: { en: "Resale value", bn: "রিসেল ভ্যালু", hint: "How much you get back when you sell" },
  comfort: { en: "Comfort", bn: "আরাম", hint: "Seat, suspension and posture over an hour" },
  cityHandling: { en: "City handling", bn: "শহরে চালানো", hint: "Dhaka traffic: weight, clutch, heat, turning" },
  highway: { en: "Highway", bn: "হাইওয়ে", hint: "Stability and reserve power at 80–100 km/h" },
  pillion: { en: "Pillion", bn: "পিলিয়ন", hint: "Comfort and stability with a passenger" },
  offroad: { en: "Rough roads", bn: "ভাঙা রাস্তা", hint: "Broken roads, village tracks, flooded patches" },
  performance: { en: "Performance", bn: "পারফরম্যান্স", hint: "Acceleration and outright pace" },
  beginnerFriendly: { en: "Beginner friendly", bn: "নতুনদের জন্য", hint: "Forgiving, light, easy to learn on" },
};

/** Bangladeshi digit grouping: 1,95,000 */
export function formatBDT(n: number) {
  return "৳" + Math.round(n).toLocaleString("en-IN");
}

/** ৳2.65 lakh */
export function formatLakh(n: number) {
  if (n < 100000) return formatBDT(n);
  const l = n / 100000;
  return `৳${(l >= 10 ? l.toFixed(1) : l.toFixed(2)).replace(/\.?0+$/, "")} lakh`;
}

export const avgMileage = (b: Bike) => (b.mileageKmpl[0] + b.mileageKmpl[1]) / 2;

export const absLabel = (b: Bike) =>
  ({ none: "No ABS", single: "Single-channel ABS", dual: "Dual-channel ABS", cbs: "CBS" })[b.brakes.abs];

export const brakeLabel = (b: Bike) =>
  `${b.brakes.front === "disc" ? "Disc" : "Drum"} / ${b.brakes.rear === "disc" ? "Disc" : "Drum"}`;

export const ccLabel = (b: Bike) => `${Math.round(b.engine.cc)}cc`;

/** One overall number used for sorting "best rated". */
export function overall(b: Bike) {
  const s = b.scores;
  return (
    (s.reliability * 1.4 +
      s.mechanicFamiliarity +
      s.partsAvailability +
      s.resale +
      s.comfort +
      s.cityHandling +
      s.highway * 0.8 +
      s.performance * 0.8) /
    8.0
  );
}

export function similarBikes(b: Bike, n = 4) {
  return BIKES.filter((x) => x.id !== b.id)
    .map((x) => {
      const priceGap = Math.abs(Math.log(x.priceBDT / b.priceBDT));
      const ccGap = Math.abs(Math.log(x.engine.cc / b.engine.cc));
      const cat = x.category === b.category ? 0 : 0.35;
      return { x, d: priceGap * 1.2 + ccGap + cat + (x.status !== b.status ? 0.3 : 0) };
    })
    .sort((p, q) => p.d - q.d)
    .slice(0, n)
    .map((p) => p.x);
}

/** Price bands used on the home page and browse filters. */
export const PRICE_BANDS = [
  { id: "u150", label: "Under ৳1.5 lakh", min: 0, max: 150000 },
  { id: "150-250", label: "৳1.5 – 2.5 lakh", min: 150000, max: 250000 },
  { id: "250-400", label: "৳2.5 – 4 lakh", min: 250000, max: 400000 },
  { id: "400p", label: "৳4 lakh +", min: 400000, max: Infinity },
] as const;

const BRAND_COLORS: Record<string, string> = {
  Honda: "#d32f2f",
  Yamaha: "#2448b5",
  Suzuki: "#0f7c8c",
  Bajaj: "#33393f",
  TVS: "#e0592a",
  Hero: "#c2410c",
  KTM: "#f26b0f",
  "Royal Enfield": "#7a2e2e",
  Runner: "#1f7a4d",
  Lifan: "#4a5568",
  GPX: "#0a84c6",
  Keeway: "#7c3aed",
  Haojue: "#9b2c2c",
  Zontes: "#334155",
  Aprilia: "#b91c1c",
  Vespa: "#4f9d8a",
  Benelli: "#166534",
  Walton: "#0369a1",
};

export const brandColor = (brand: string) => BRAND_COLORS[brand] ?? "#475569";
