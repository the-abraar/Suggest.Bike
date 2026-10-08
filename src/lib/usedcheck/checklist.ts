// Builds the used-bike checklist for one model, and scores it. Pure functions: no React, no browser APIs.
import base from "@/data/usedcheck/base.json";
import type { Bike, BikeLite } from "@/lib/types";

export type Bi = { en: string; bn: string };
export type Severity = "dealbreaker" | "serious" | "minor";
export type Tick = "ok" | "problem";
export type Ticks = Record<string, Tick | undefined>;
export type SectionId = "papers" | "body" | "engine" | "ride" | "brakes" | "electrics" | "wear" | "model";

export interface CheckItem {
  id: string;
  section: SectionId;
  severity: Severity;
  title: Bi;
  how: Bi;
  red: Bi;
  fine: Bi;
  /** Suggested photo/video/audio shot that documents this item. */
  shot: string | null;
  /** "model" = from this bike's own data (quirks, parts); "base" = general inspection. */
  origin: "base" | "model";
}

export interface Shot { id: string; title: Bi; note: Bi }
export interface Section { id: SectionId; title: Bi; items: CheckItem[] }

export const SEV_WEIGHT: Record<Severity, number> = { dealbreaker: 5, serious: 3, minor: 1 };
const SEV: Record<string, Severity> = { d: "dealbreaker", s: "serious", m: "minor" };

type RawItem = {
  id: string; s: string; v: string; when?: string[]; shot: string | null;
  t: Bi; h: Bi; r: Bi; f: Bi;
};
type RawShot = { id: string; t: Bi; note: Bi; when?: string[] };

/** Tags decide which base items apply to a bike. */
export function bikeTags(b: Pick<BikeLite, "category" | "status" | "engine" | "brakes" | "gears">): Set<string> {
  const t = new Set<string>();
  t.add(b.engine.stroke === 2 ? "2t" : "4t");
  t.add(b.engine.fuel);
  if (b.engine.cooling === "liquid") t.add("liquid");
  if (b.category === "scooter" || b.gears === 0) t.add("scooter");
  else t.add("geared");
  if (b.status === "used-only") t.add("used-only");
  if (b.brakes.front === "disc" || b.brakes.rear === "disc") t.add("disc");
  if (b.brakes.front === "drum" || b.brakes.rear === "drum") t.add("drum");
  if (b.brakes.abs === "single" || b.brakes.abs === "dual") t.add("abs");
  return t;
}

const applies = (when: string[] | undefined, tags: Set<string>) => !when || when.every((w) => tags.has(w));

/** Split a free-text quirks string into sentences. English and Bangla must split into the same count to be paired. */
export function splitSentences(text: string): string[] {
  return text
    .split(/;\s+|।\s*|\.\s+(?=[A-Z0-9])/)
    .map((s) => s.trim().replace(/[.।]+$/, "").trim())
    .filter((s) => s.length > 3);
}

const SERIOUS_WORDS = /paper|odometer|tamper|fake|non-genuine|chassis|engine number|mismatch|বাতিল|কাগজ|টেম্পার|নকল|নম্বর/i;

type FullText = Pick<Bike, "quirks" | "mechanicNote" | "bn"> & { parts?: Bike["parts"] };

/** Model-specific items, built only from the bike's own record (quirks, parts availability). Nothing is invented. */
export function modelItems(full: FullText | null): CheckItem[] {
  if (!full) return [];
  const out: CheckItem[] = [];
  const cap = (x: string) => x.charAt(0).toUpperCase() + x.slice(1);
  const en = splitSentences(full.quirks).map(cap);
  const bnText = full.bn?.quirks;
  const bn = bnText ? splitSentences(bnText) : [];
  const paired = bn.length === en.length;
  const howModel: Bi = {
    en: "Owners report this for this model. Ask the seller about it and look for it on the test ride.",
    bn: "এই মডেলে মালিকরা এটা জানিয়েছেন। বিক্রেতাকে জিজ্ঞেস করুন আর টেস্ট রাইডে খেয়াল করুন।",
  };
  if (en.length > 0 && (paired || !bnText)) {
    en.forEach((s, i) => {
      const bnS = paired && bn[i] ? bn[i] : s;
      out.push({
        id: `q${i}`, section: "model", origin: "model", shot: null,
        severity: SERIOUS_WORDS.test(s) || SERIOUS_WORDS.test(bnS) ? "serious" : "minor",
        title: { en: s, bn: bnS },
        how: howModel,
        red: { en: "The problem is present on this unit, or the seller dismisses it.", bn: "এই বাইকে সমস্যাটি আছে, অথবা বিক্রেতা গুরুত্ব দেন না।" },
        fine: { en: "Not present, or already fixed and billed.", bn: "নেই, অথবা ঠিক করা হয়েছে ও বিল আছে।" },
      });
    });
  } else if (full.quirks) {
    out.push({
      id: "q-all", section: "model", origin: "model", shot: null, severity: "minor",
      title: { en: full.quirks, bn: bnText ?? full.quirks },
      how: howModel,
      red: { en: "Any of these is present on this unit.", bn: "এর কোনোটি এই বাইকে আছে।" },
      fine: { en: "None present, or fixed and billed.", bn: "কোনোটি নেই, অথবা ঠিক করা ও বিল আছে।" },
    });
  }
  const scarce = (full.parts ?? []).filter((p) => p.availability === "dealer-only" || p.availability === "rare");
  if (scarce.length) {
    const names = scarce.map((p) => p.name.toLowerCase()).join(", ");
    out.push({
      id: "m-parts", section: "model", origin: "model", shot: null, severity: "minor",
      title: { en: `Hard-to-find parts are fitted: ${names}`, bn: `দুর্লভ বা শুধু ডিলারের পার্টস লাগানো আছে কি না: ${names}` },
      how: { en: "Our parts list marks these as dealer-only or rare. Check they are fitted, not worn, and ask where the seller bought them.", bn: "আমাদের পার্টস তালিকায় এগুলো শুধু ডিলারের বা দুর্লভ। লাগানো ও অক্ষত আছে কি না দেখুন আর কোথা থেকে কিনেছেন জিজ্ঞেস করুন।" },
      red: { en: "Missing or worn, and the seller does not know where to get a replacement.", bn: "নেই বা ক্ষয়ে গেছে, আর বিক্রেতা কোথায় পাওয়া যায় জানেন না।" },
      fine: { en: "Fitted, in good shape, or a known source for spares.", bn: "লাগানো, ভালো অবস্থায়, বা বদলানোর জানা উৎস আছে।" },
    });
  }
  return out;
}

export function buildChecklist(bike: Pick<BikeLite, "category" | "status" | "engine" | "brakes" | "gears">, full: FullText | null): { sections: Section[]; items: CheckItem[]; shots: Shot[] } {
  const tags = bikeTags(bike);
  const baseItems: CheckItem[] = (base.items as RawItem[])
    .filter((r) => applies(r.when, tags))
    .map((r) => ({ id: r.id, section: r.s as SectionId, severity: SEV[r.v], title: r.t, how: r.h, red: r.r, fine: r.f, shot: r.shot, origin: "base" as const }));
  const items = [...baseItems, ...modelItems(full)];
  const shots = (base.shots as RawShot[]).filter((s) => applies(s.when, tags)).map((s) => ({ id: s.id, title: s.t, note: s.note }));
  const sections: Section[] = (base.sections as { id: SectionId; t: Bi }[])
    .map((s) => ({ id: s.id, title: s.t, items: items.filter((i) => i.section === s.id) }))
    .filter((s) => s.items.length > 0);
  return { sections, items, shots };
}

export type Verdict = "walk" | "negotiate" | "decent" | "unsure";

export interface Trust {
  score: number | null;      // 0-100, share of checked weight that is fine; null when nothing checked
  coverage: number;          // 0-1, share of total weight checked
  checked: number;
  total: number;
  problems: number;
  dealbreakers: number;
  serious: number;
  minor: number;
  verdict: Verdict;
}

export function trust(items: CheckItem[], ticks: Ticks): Trust {
  let totalW = 0, checkedW = 0, problemW = 0, checked = 0, problems = 0, dealbreakers = 0, serious = 0, minor = 0;
  for (const it of items) {
    const w = SEV_WEIGHT[it.severity];
    totalW += w;
    const t = ticks[it.id];
    if (!t) continue;
    checked++;
    checkedW += w;
    if (t === "problem") {
      problems++;
      problemW += w;
      if (it.severity === "dealbreaker") dealbreakers++;
      else if (it.severity === "serious") serious++;
      else minor++;
    }
  }
  const coverage = totalW ? checkedW / totalW : 0;
  const score = checkedW ? Math.round(100 * (1 - problemW / checkedW)) : null;
  let verdict: Verdict;
  if (dealbreakers > 0) verdict = "walk";
  else if (coverage < 0.5) verdict = "unsure";
  else if (serious >= 4 || (score ?? 100) < 60) verdict = "walk";
  else if (serious >= 1 || (score ?? 100) < 90) verdict = "negotiate";
  else verdict = "decent";
  return { score, coverage, checked, total: items.length, problems, dealbreakers, serious, minor, verdict };
}

/** Compact share code: one char per item in list order. o = ok, p = problem, - = not checked. */
export const encodeTicks = (items: CheckItem[], ticks: Ticks) => items.map((i) => (ticks[i.id] === "ok" ? "o" : ticks[i.id] === "problem" ? "p" : "-")).join("");
export function decodeTicks(items: CheckItem[], code: string): Ticks {
  const out: Ticks = {};
  items.forEach((it, i) => {
    const c = code[i];
    if (c === "o") out[it.id] = "ok";
    else if (c === "p") out[it.id] = "problem";
  });
  return out;
}
