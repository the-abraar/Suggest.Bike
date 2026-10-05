import raw from "@/data/generated/bikes.index.json";
import networks from "@/data/networks.json";
import type { BikeLite, BrandNetwork, Category, ScoreKey } from "./types";

/** Slim records for client pages. Full records: lib/bikes.server.ts (build time) or /data/bikes/<id>.json (runtime). */
export const BIKES: BikeLite[] = (raw as unknown as BikeLite[])
  .slice()
  .sort((a, b) => a.brand.localeCompare(b.brand) || a.priceBDT - b.priceBDT);

const byId = new Map(BIKES.map((b) => [b.id, b]));
export const getBike = (id: string) => byId.get(id);

export const BRANDS = Array.from(new Set(BIKES.map((b) => b.brand))).sort();

export const fullName = (b: Pick<BikeLite, "brand" | "model">) => `${b.brand} ${b.model}`;

export const CATEGORIES: Record<Category, { en: string; bn: string; blurb: string; blurbBn: string }> = {
  commuter: { en: "Commuter", bn: "কমিউটার", blurb: "100–125cc daily runners. Cheap to buy, cheaper to run.", blurbBn: "100–125cc প্রতিদিনের বাইক। কিনতে সস্তা, চালাতে আরও সস্তা।" },
  street: { en: "Street", bn: "স্ট্রিট", blurb: "The 150–165cc all-rounders most of Bangladesh rides.", blurbBn: "150–165cc অলরাউন্ডার — বাংলাদেশের বেশিরভাগ মানুষ যা চালায়।" },
  naked: { en: "Naked", bn: "নেকেড", blurb: "Sharper, faster, more aggressive streetfighters.", blurbBn: "আরও ধারালো, দ্রুত, আগ্রাসী স্ট্রিটফাইটার।" },
  sport: { en: "Sport", bn: "স্পোর্টস", blurb: "Full fairings, clip-ons, highway speed.", blurbBn: "ফুল ফেয়ারিং, ক্লিপ-অন হ্যান্ডেল, হাইওয়ে স্পিড।" },
  adventure: { en: "Adventure", bn: "অ্যাডভেঞ্চার", blurb: "Long suspension for broken roads and village trails.", blurbBn: "ভাঙা রাস্তা আর গ্রামের পথের জন্য লম্বা সাসপেনশন।" },
  cruiser: { en: "Cruiser", bn: "ক্রুজার", blurb: "Low seat, relaxed posture, easy miles.", blurbBn: "নিচু সিট, আরামদায়ক বসা, সহজ লম্বা পথ।" },
  classic: { en: "Classic", bn: "ক্লাসিক", blurb: "Retro charm — thump, chrome and character.", blurbBn: "রেট্রো আকর্ষণ — থাম্প, ক্রোম আর চরিত্র।" },
  scooter: { en: "Scooter", bn: "স্কুটার", blurb: "Gearless, easy, storage under the seat.", blurbBn: "গিয়ারলেস, সহজ, সিটের নিচে জায়গা।" },
};

export const SCORE_LABELS: Record<ScoreKey, { en: string; bn: string; hint: string; hintBn: string }> = {
  reliability: { en: "Reliability", bn: "নির্ভরযোগ্যতা", hint: "How rarely it leaves you stranded", hintBn: "কতটা কম রাস্তায় ফেলে যায়" },
  mechanicFamiliarity: { en: "Mechanic familiarity", bn: "মেকানিক পরিচিতি", hint: "Can the local mistri fix it, or only the dealer?", hintBn: "লোকাল মিস্ত্রি পারবে, নাকি শুধু ডিলার?" },
  partsAvailability: { en: "Parts availability", bn: "পার্টস সহজলভ্যতা", hint: "Found in Bangshal & district bazaars, or ordered?", hintBn: "বংশাল আর জেলার বাজারে পাওয়া যায়, নাকি অর্ডার দিতে হয়?" },
  resale: { en: "Resale value", bn: "রিসেল ভ্যালু", hint: "How much you get back when you sell", hintBn: "বিক্রির সময় কত ফেরত পাবেন" },
  comfort: { en: "Comfort", bn: "আরাম", hint: "Seat, suspension and posture over an hour", hintBn: "এক ঘণ্টা চালালে সিট, সাসপেনশন ও বসার আরাম" },
  cityHandling: { en: "City handling", bn: "শহরে চালানো", hint: "Dhaka traffic: weight, clutch, heat, turning", hintBn: "ঢাকার জ্যাম: ওজন, ক্লাচ, গরম, ঘোরানো" },
  highway: { en: "Highway", bn: "হাইওয়ে", hint: "Stability and reserve power at 80–100 km/h", hintBn: "80–100 km/h-এ স্থিরতা ও বাড়তি পাওয়ার" },
  pillion: { en: "Pillion", bn: "পিলিয়ন", hint: "Comfort and stability with a passenger", hintBn: "পিলিয়নসহ আরাম ও স্থিরতা" },
  offroad: { en: "Rough roads", bn: "ভাঙা রাস্তা", hint: "Broken roads, village tracks, flooded patches", hintBn: "ভাঙা রাস্তা, গ্রামের পথ, পানি জমা জায়গা" },
  performance: { en: "Performance", bn: "পারফরম্যান্স", hint: "Acceleration and outright pace", hintBn: "এক্সেলারেশন ও গতি" },
  beginnerFriendly: { en: "Beginner friendly", bn: "নতুনদের জন্য", hint: "Forgiving, light, easy to learn on", hintBn: "ক্ষমাশীল, হালকা, শেখা সহজ" },
};

/** Bangladeshi digit grouping: 1,95,000 */
export function formatBDT(n: number) {
  return "৳" + Math.round(n).toLocaleString("en-IN");
}

/** ৳2.65 lakh / ৳2.65 লাখ */
export function formatLakh(n: number, lang: "en" | "bn" = "en") {
  if (n < 100000) return formatBDT(n);
  const l = n / 100000;
  return `৳${(l >= 10 ? l.toFixed(1) : l.toFixed(2)).replace(/\.?0+$/, "")} ${lang === "bn" ? "লাখ" : "lakh"}`;
}

export const avgMileage = (b: Pick<BikeLite, "mileageKmpl">) => (b.mileageKmpl[0] + b.mileageKmpl[1]) / 2;

export const absLabel = (b: Pick<BikeLite, "brakes">, lang: "en" | "bn" = "en") =>
  lang === "bn"
    ? { none: "ABS নেই", single: "সিঙ্গেল-চ্যানেল ABS", dual: "ডুয়াল-চ্যানেল ABS", cbs: "CBS" }[b.brakes.abs]
    : { none: "No ABS", single: "Single-channel ABS", dual: "Dual-channel ABS", cbs: "CBS" }[b.brakes.abs];

export const brakeLabel = (b: Pick<BikeLite, "brakes">, lang: "en" | "bn" = "en") => {
  const w = (t: "disc" | "drum") => (lang === "bn" ? (t === "disc" ? "ডিস্ক" : "ড্রাম") : t === "disc" ? "Disc" : "Drum");
  return `${w(b.brakes.front)} / ${w(b.brakes.rear)}`;
};

/** Scooters (CVT) have a belt and clutch shoes, not a chain and clutch plates. */
export function partLabel(b: Pick<BikeLite, "gears">, name: string, lang: "en" | "bn" = "en") {
  const cvt = b.gears === 0;
  const map: Record<string, [string, string]> = {
    "Brake pads/shoes (front)": ["Brake pads/shoes (front)", "ব্রেক প্যাড/শু (সামনে)"],
    "Chain & sprocket set": cvt ? ["Drive belt", "ড্রাইভ বেল্ট"] : ["Chain & sprocket set", "চেইন-স্প্রকেট সেট"],
    "Air filter": ["Air filter", "এয়ার ফিল্টার"],
    "Engine oil change": ["Engine oil change", "ইঞ্জিন অয়েল পরিবর্তন"],
    "Clutch plate set": cvt ? ["Clutch shoes", "ক্লাচ শু"] : ["Clutch plate set", "ক্লাচ প্লেট সেট"],
  };
  const m = map[name];
  return m ? m[lang === "bn" ? 1 : 0] : name;
}

export const tagline = (b: Pick<BikeLite, "tagline" | "taglineBn">, lang: "en" | "bn") => (lang === "bn" && b.taglineBn ? b.taglineBn : b.tagline);

export const NETWORKS = networks as Record<string, BrandNetwork>;
export const networkFor = (brand: string): BrandNetwork | undefined => NETWORKS[brand];

/** 0–1: how easy it is to find a showroom/workshop outside Dhaka. Unknown brands are treated as small networks. */
export function networkReach(brand: string) {
  const n = NETWORKS[brand];
  if (!n) return 0.3;
  const centres = n.serviceCentres ?? n.showrooms ?? 0;
  const div = n.allDivisions ? 1 : Math.min(1, n.divisions.length / 8);
  return Math.min(1, 0.15 + Math.min(centres, 300) / 300 * 0.55 + div * 0.3);
}

/** Brands whose every model is used-only (e.g. "Hero Honda") get a "(used)" suffix in filters. */
export const brandLabel = (brand: string) => (BIKES.filter((b) => b.brand === brand).every((b) => b.status === "used-only") ? `${brand} (used)` : brand);

export const ccLabel = (b: Pick<BikeLite, "engine">) => `${Math.round(b.engine.cc)}cc`;

/** One overall number used for sorting "best rated". */
export function overall(b: BikeLite) {
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

export function similarBikes(b: Pick<BikeLite, "id" | "priceBDT" | "engine" | "category" | "status">, n = 4) {
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
  { id: "u150", label: "Under ৳1.5 lakh", labelBn: "৳1.5 লাখের নিচে", min: 0, max: 150000 },
  { id: "150-250", label: "৳1.5 – 2.5 lakh", labelBn: "৳1.5 – 2.5 লাখ", min: 150000, max: 250000 },
  { id: "250-400", label: "৳2.5 – 4 lakh", labelBn: "৳2.5 – 4 লাখ", min: 250000, max: 400000 },
  { id: "400p", label: "৳4 lakh +", labelBn: "৳4 লাখ +", min: 400000, max: Infinity },
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
