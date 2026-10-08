// Used-bike value estimate. Pure and client-side. It is an estimate built from the site's own price data and
// simple adjustments, not a market quote. Every adjustment is returned so the page can explain it.
import { yearlyRetention, type CostBike } from "@/lib/cost";
import type { Bi } from "./checklist";

export type PaperStatus = "clean" | "dues" | "weak" | "missing";
export type Condition = "excellent" | "good" | "fair" | "poor";

export interface ValueInput {
  yearMade: number;
  km: number;
  owners: number;
  paper: PaperStatus;
  condition: Condition;
  /** Counts of checklist problems the user ticked. */
  problems: { dealbreaker: number; serious: number; minor: number };
  /** 0-1: how much of the checklist has been checked. Low coverage widens the range. */
  coverage: number;
  nowYear: number;
}

export type ValueBike = Pick<CostBike, "priceBDT" | "status" | "scores" | "usedPrice" | "engine" | "mileageKmpl" | "serviceIntervalKm" | "avgServiceCostBDT" | "category" | "brakes" | "gears" | "tyrePairBDT" | "parts">;

export interface Adjustment { key: string; label: Bi; note: Bi; pct: number; amount: number }

export interface ValueResult {
  low: number;
  fair: number;
  high: number;
  base: number;
  baseNote: Bi;
  adjustments: Adjustment[];
  spreadPct: number;
  /** Plain-language flags, e.g. "paper problem: you may not be able to transfer ownership". */
  warnings: Bi[];
}

/** Assumed riding per year in Bangladesh. An editorial assumption, shown to the user. */
export const KM_PER_YEAR = 7000;
const FLOOR_SHARE = 0.12;
const round500 = (n: number) => Math.round(n / 500) * 500;
const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));
const fmt = (n: number) => Math.round(n).toLocaleString("en-US");

/** Price of a typical well-kept example at `age` years, built from the new price, y1 and y3 listings, and the resale curve. */
export function agedPrice(b: ValueBike, age: number): { price: number; note: Bi } {
  const ret = clamp(yearlyRetention(b as CostBike), 0.8, 0.95);
  const p0 = b.priceBDT;
  const y1 = b.usedPrice?.y1 ?? null;
  const y3 = b.usedPrice?.y3 ?? null;
  const p1 = y1 ?? p0 * ret;
  const p3 = y3 ?? p0 * ret ** 3;
  // Yearly keep-rate after year 3, from the y1 -> y3 slope, kept between 0.82 and 0.95.
  const tail = clamp(Math.sqrt(p3 / p1), 0.82, 0.95);
  let price: number;
  if (age <= 0) price = p0;
  else if (age <= 1) price = p0 + (p1 - p0) * age;
  else if (age <= 3) price = p1 + ((p3 - p1) * (age - 1)) / 2;
  else price = p3 * tail ** (age - 3);
  const seen = y1 !== null || y3 !== null;
  return {
    price,
    note: seen
      ? { en: `From listings we saw: about ৳${fmt(p1)} at 1 year and ৳${fmt(p3)} at 3 years, followed along the same curve.`, bn: `আমাদের দেখা বিজ্ঞাপন থেকে: ১ বছরে প্রায় ৳${fmt(p1)}, ৩ বছরে ৳${fmt(p3)}, একই বক্ররেখা ধরে।` }
      : { en: `No listings seen for this model. Using its resale score: about ${Math.round(ret * 100)}% of value kept each year.`, bn: `এই মডেলের বিজ্ঞাপন পাইনি। রিসেল স্কোর থেকে: প্রতি বছর মূল্যের প্রায় ${Math.round(ret * 100)}% থাকে।` },
  };
}

export function estimateValue(b: ValueBike, inp: ValueInput): ValueResult {
  const usedOnly = b.status === "used-only";
  const age = clamp(inp.nowYear - inp.yearMade, 0, 60);
  const warnings: Bi[] = [];
  const adjustments: Adjustment[] = [];

  let base: number;
  let baseNote: Bi;
  if (usedOnly) {
    base = b.priceBDT;
    baseNote = {
      en: `Discontinued bike. Starting from the typical used price we list, ৳${fmt(base)}, for a decent unit. Age is not used because all of them are old.`,
      bn: `বন্ধ হয়ে যাওয়া বাইক। আমাদের তালিকার সাধারণ ব্যবহৃত দাম ৳${fmt(base)} থেকে শুরু, মোটামুটি ভালো বাইকের জন্য। সবগুলোই পুরনো, তাই বয়স ধরিনি।`,
    };
  } else {
    const a = agedPrice(b, age);
    base = a.price;
    baseNote = { en: `A typical example made ${inp.yearMade} (${age} year${age === 1 ? "" : "s"} old). ${a.note.en}`, bn: `${inp.yearMade} সালের একটি সাধারণ বাইক (${age} বছর পুরনো)। ${a.note.bn}` };
  }

  const add = (key: string, pct: number, label: Bi, note: Bi) => {
    if (pct === 0) return;
    adjustments.push({ key, label, note, pct, amount: Math.round(base * pct) });
  };

  // Kilometres, compared with what a bike of this age usually has.
  const expected = usedOnly ? 50000 : Math.max(age, 1) * KM_PER_YEAR;
  const kmDelta = inp.km - expected;
  const kmWeight = usedOnly ? 0.5 : 1; // odometers on very old bikes are weak evidence
  const kmPct = clamp((-kmDelta / 1000) * 0.004 * kmWeight, -0.15, 0.1);
  add(
    "km",
    Math.round(kmPct * 1000) / 1000,
    { en: kmDelta > 0 ? "Higher km than usual" : "Lower km than usual", bn: kmDelta > 0 ? "স্বাভাবিকের চেয়ে বেশি কিমি" : "স্বাভাবিকের চেয়ে কম কিমি" },
    {
      en: `${fmt(inp.km)} km against about ${fmt(expected)} km expected${usedOnly ? "" : ` (${fmt(KM_PER_YEAR)} km a year, our assumption)`}. Each 1,000 km away from that moves the price 0.4%${usedOnly ? ", halved because old odometers are unreliable" : ""}.`,
      bn: `${fmt(inp.km)} কিমি, স্বাভাবিক প্রায় ${fmt(expected)} কিমি${usedOnly ? "" : ` (বছরে ${fmt(KM_PER_YEAR)} কিমি, আমাদের ধারণা)`}। প্রতি ১,০০০ কিমি ব্যবধানে দাম ০.৪% বদলায়${usedOnly ? ", পুরনো ওডোমিটার ভরসাযোগ্য নয় বলে অর্ধেক" : ""}।`,
    },
  );

  const ownerPct = inp.owners <= 1 ? 0 : inp.owners === 2 ? -0.03 : inp.owners === 3 ? -0.06 : -0.1;
  add(
    "owners",
    ownerPct,
    { en: `${inp.owners} owners so far`, bn: `এ পর্যন্ত ${inp.owners} জন মালিক` },
    { en: "Each extra owner is one more person who may have skipped servicing, and buyers pay less for it.", bn: "প্রতিটি বাড়তি মালিক মানে আরেকজন যিনি সার্ভিস এড়িয়ে যেতে পারেন, আর ক্রেতারা কম দাম দেন।" },
  );

  const paperPct = { clean: 0, dues: -0.03, weak: -0.25, missing: -0.4 }[inp.paper];
  add(
    "paper",
    paperPct,
    { clean: { en: "", bn: "" }, dues: { en: "Dues to pay", bn: "বকেয়া মেটাতে হবে" }, weak: { en: "Weak papers", bn: "দুর্বল কাগজ" }, missing: { en: "Papers missing or not the seller's", bn: "কাগজ নেই বা বিক্রেতার নামে নয়" } }[inp.paper],
    {
      clean: { en: "", bn: "" },
      dues: { en: "Unpaid tax token or fees become your bill. We take 3% off as a rough allowance. Look up the exact amount on the BRTA portal.", bn: "বকেয়া ট্যাক্স টোকেন বা ফি আপনার খরচ হবে। মোটামুটি ধরে ৩% কমিয়েছি। সঠিক অঙ্ক BRTA পোর্টালে দেখুন।" },
      weak: { en: "Photocopies, a gap in the owner chain or a number that does not quite match. Fixing this costs time and money, and may not be possible.", bn: "ফটোকপি, মালিকের ধারায় ফাঁক বা নম্বরে সামান্য গরমিল। ঠিক করতে সময় ও টাকা লাগে, আর নাও হতে পারে।" },
      missing: { en: "Without valid papers you may not be able to transfer or insure the bike. Most buyers would not pay this price.", bn: "বৈধ কাগজ ছাড়া হস্তান্তর বা বিমা নাও করা যেতে পারে। বেশিরভাগ ক্রেতা এই দামে কিনবেন না।" },
    }[inp.paper],
  );
  if (inp.paper === "missing" || inp.paper === "weak") {
    warnings.push({ en: "The paper problem matters more than the price. Do not pay until ownership can be transferred.", bn: "কাগজের সমস্যা দামের চেয়ে বড়। হস্তান্তর নিশ্চিত না হওয়া পর্যন্ত টাকা দেবেন না।" });
  }

  const condPct = { excellent: 0.05, good: 0, fair: -0.07, poor: -0.18 }[inp.condition];
  add(
    "condition",
    condPct,
    { excellent: { en: "Excellent condition", bn: "চমৎকার অবস্থা" }, good: { en: "", bn: "" }, fair: { en: "Fair condition", bn: "মোটামুটি অবস্থা" }, poor: { en: "Poor condition", bn: "খারাপ অবস্থা" } }[inp.condition],
    { excellent: { en: "Original paint, no wear to speak of.", bn: "আসল রং, উল্লেখযোগ্য ক্ষয় নেই।" }, good: { en: "", bn: "" }, fair: { en: "Visible wear, scratches or tired parts.", bn: "দৃশ্যমান ক্ষয়, আঁচড় বা ক্লান্ত পার্টস।" }, poor: { en: "Needs work before it is reliable.", bn: "ভরসা করার আগে মেরামত লাগবে।" } }[inp.condition],
  );

  const { dealbreaker, serious, minor } = inp.problems;
  const probPct = -clamp(dealbreaker * 0.2 + serious * 0.05 + minor * 0.01, 0, 0.5);
  add(
    "problems",
    Math.round(probPct * 1000) / 1000,
    { en: "Problems found in the checklist", bn: "চেকলিস্টে পাওয়া সমস্যা" },
    {
      en: `${dealbreaker} dealbreaker, ${serious} serious, ${minor} minor. Taken as 20%, 5% and 1% each, up to 50% in total. Get a real quote for the repair and use that instead if you can.`,
      bn: `${dealbreaker}টি ডিলব্রেকার, ${serious}টি গুরুতর, ${minor}টি ছোট। প্রতিটির জন্য ২০%, ৫% ও ১%, মোট সর্বোচ্চ ৫০%। পারলে মেরামতের আসল কোটেশন নিয়ে সেটাই ধরুন।`,
    },
  );
  if (dealbreaker > 0) warnings.push({ en: "You ticked a dealbreaker. The price below is only for if you decide to go ahead anyway. The safe choice is to walk away.", bn: "আপনি একটি ডিলব্রেকার চিহ্নিত করেছেন। নিচের দাম শুধু তখনই যদি তবু এগোতে চান। নিরাপদ পথ হলো সরে আসা।" });

  const sum = adjustments.reduce((s, a) => s + a.pct, 0);
  const floor = Math.max(5000, base * FLOOR_SHARE);
  const fair = Math.max(floor, base * (1 + clamp(sum, -0.85, 0.2)));

  // The range is wider when we have less data or you checked less.
  const noListings = !usedOnly && b.usedPrice?.y1 == null && b.usedPrice?.y3 == null;
  const spreadPct = 0.08 + (noListings ? 0.04 : 0) + (inp.coverage < 0.5 ? 0.03 : 0) + (usedOnly ? 0.04 : 0);
  const low = Math.max(floor * 0.9, fair * (1 - spreadPct));
  const high = fair * (1 + spreadPct);

  return { low: round500(low), fair: round500(fair), high: round500(high), base: round500(base), baseNote, adjustments, spreadPct, warnings };
}

export const CONDITIONS: { v: Condition; label: Bi }[] = [
  { v: "excellent", label: { en: "Excellent", bn: "চমৎকার" } },
  { v: "good", label: { en: "Good", bn: "ভালো" } },
  { v: "fair", label: { en: "Fair", bn: "মোটামুটি" } },
  { v: "poor", label: { en: "Poor", bn: "খারাপ" } },
];

export const PAPERS: { v: PaperStatus; label: Bi }[] = [
  { v: "clean", label: { en: "All clean", bn: "সব ঠিক" } },
  { v: "dues", label: { en: "Dues unpaid", bn: "বকেয়া আছে" } },
  { v: "weak", label: { en: "Weak", bn: "দুর্বল" } },
  { v: "missing", label: { en: "Missing", bn: "নেই" } },
];
