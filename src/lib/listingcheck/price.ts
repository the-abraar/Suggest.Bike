import type { BikeLite } from "@/lib/types";
import type { PriceBand, PriceCheck } from "./types";

export type PriceBike = Pick<BikeLite, "priceBDT" | "status" | "usedPrice" | "scores">;

/** Same idea as yearlyRetention() in src/lib/cost.ts: better resale score keeps more value per year. */
const retention = (b: PriceBike) => 0.8 + b.scores.resale * 0.012;

/** Typical use. Assumption (approx): a Dhaka commuter bike does about 7,000 km a year. */
export const KM_PER_YEAR = 7000;

const round500 = (n: number) => Math.round(n / 500) * 500;

/** Fair used price (centre of the range) by age, before the km adjustment. */
export function valueAtAge(b: PriceBike, age: number): { v: number; basis: "bikroy" | "curve" | "used-only" } {
  if (b.status === "used-only") return { v: b.priceBDT, basis: "used-only" };
  const P = b.priceBDT;
  const y1 = b.usedPrice?.y1 ?? null;
  const y3 = b.usedPrice?.y3 ?? null;
  const ret = retention(b);
  if (y1 == null && y3 == null) return { v: Math.max(P * Math.pow(ret, age), P * 0.2), basis: "curve" };
  // Fill a missing anchor from the curve so interpolation always has two points.
  const a1 = y1 ?? (y3 as number) / Math.pow(ret, 2);
  const a3 = y3 ?? a1 * Math.pow(ret, 2);
  if (age <= 1) return { v: P + (a1 - P) * Math.max(age, 0), basis: "bikroy" };
  const r = Math.min(0.95, Math.max(0.82, Math.pow(a3 / a1, 1 / 2)));
  if (age <= 3) return { v: a1 * Math.pow(r, age - 1), basis: "bikroy" };
  return { v: Math.max(a3 * Math.pow(r, age - 3), P * 0.2), basis: "bikroy" };
}

/** Low km for the age lifts the fair price a little, high km lowers it more (capped). */
export function kmAdjust(age: number, km: number | null): number {
  if (km == null) return 1;
  const expected = Math.max(age, 0.5) * KM_PER_YEAR;
  const diff = km - expected; // positive = more km than usual
  const pct = Math.max(-0.08, Math.min(0.15, (diff / 1000) * 0.005)); // 0.5% per 1,000 km
  return 1 - pct;
}

export function priceBand(deltaPct: number): PriceBand {
  if (deltaPct <= -30) return "far-below";
  if (deltaPct <= -12) return "below";
  if (deltaPct < 8) return "fair";
  if (deltaPct < 22) return "above";
  return "far-above";
}

const NOTES: Record<PriceBand, { en: string; bn: string }> = {
  unknown: { en: "No fair range: pick the model and year to compare the price.", bn: "ন্যায্য দামের সীমা নেই: দাম মেলাতে মডেল ও সাল দিন।" },
  "far-below": {
    en: "Far below the usual range. Real bargains this big are rare; this is the most common scam pattern.",
    bn: "সাধারণ দামের অনেক নিচে। এত বড় ছাড় বিরল; স্ক্যামের সবচেয়ে চেনা ধরন এটাই।",
  },
  below: {
    en: "Below the usual range. Could be a good deal or a hidden problem: check papers and condition closely.",
    bn: "সাধারণ দামের নিচে। ভালো ডিলও হতে পারে, লুকানো সমস্যাও হতে পারে: কাগজ ও বাইকের অবস্থা ভালো করে দেখুন।",
  },
  fair: { en: "Inside the usual range for this model, year and km.", bn: "এই মডেল, সাল ও কিমির জন্য স্বাভাবিক দামের মধ্যে।" },
  above: { en: "Above the usual range. You can negotiate down or look at other listings.", bn: "স্বাভাবিক দামের ওপরে। দর কষাকষি করুন বা অন্য বিজ্ঞাপন দেখুন।" },
  "far-above": { en: "Well above the usual range. Likely overpriced; compare with a similar bike before talking.", bn: "স্বাভাবিক দামের অনেক ওপরে। সম্ভবত বেশি চাওয়া হচ্ছে; কথা বলার আগে অন্য বাইকের সাথে মিলিয়ে নিন।" },
};

export function checkPrice(
  bike: PriceBike | null | undefined,
  o: { asking: number | null; year: number | null; km: number | null; nowYear: number },
): PriceCheck {
  if (!bike) {
    return {
      known: false, fairLow: 0, fairMid: 0, fairHigh: 0, asking: o.asking, deltaPct: null, band: "unknown", ageYears: null,
      basis: { en: "Model not in our list, so no price comparison.", bn: "মডেলটি আমাদের তালিকায় নেই, তাই দামের তুলনা সম্ভব নয়।" },
      note: NOTES.unknown,
    };
  }
  const yearKnown = o.year != null;
  const age = yearKnown ? Math.max(0, o.nowYear - (o.year as number)) : 3;
  const { v, basis } = valueAtAge(bike, age);
  const mid = round500(v * (bike.status === "used-only" ? 1 : kmAdjust(age, o.km)));
  const fairLow = round500(mid * 0.9);
  const fairHigh = round500(mid * 1.05);
  const deltaPct = o.asking != null && mid > 0 ? ((o.asking - mid) / mid) * 100 : null;
  const band: PriceBand = deltaPct == null ? "unknown" : priceBand(deltaPct);
  const src =
    basis === "bikroy"
      ? { en: "Based on Bikroy asking prices for 1-year and 3-year-old bikes, stretched by age and km.", bn: "বিক্রয়.কম-এ ১ ও ৩ বছরের পুরনো বাইকের চাওয়া দাম থেকে, বয়স ও কিমি অনুযায়ী সমন্বয় করা।" }
      : basis === "used-only"
        ? { en: "Typical used price for a decent example of this discontinued model.", bn: "এই বন্ধ হয়ে যাওয়া মডেলের মোটামুটি ভালো অবস্থার সাধারণ পুরনো দাম।" }
        : { en: "No Bikroy sample for this model: estimated from the showroom price and its resale score.", bn: "এই মডেলের বিক্রয়.কম নমুনা নেই: শোরুম দাম ও রিসেল স্কোর থেকে অনুমান।" };
  const extra = yearKnown ? { en: "", bn: "" } : { en: " Year not given, so 3 years is assumed.", bn: " সাল দেওয়া নেই, তাই ৩ বছর ধরা হয়েছে।" };
  return {
    known: true, fairLow, fairMid: mid, fairHigh, asking: o.asking, deltaPct, band, ageYears: yearKnown ? age : null,
    basis: { en: src.en + extra.en, bn: src.bn + extra.bn },
    note: NOTES[band],
  };
}
