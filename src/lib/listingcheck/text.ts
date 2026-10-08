import data from "@/data/listingcheck/signals.json";

/**
 * Rule-based keyword parser for pasted chat / post text.
 * It is NOT AI. It lower-cases the text, converts Bangla digits, then runs regular expressions
 * (English, Bangla script and Banglish) from src/data/listingcheck/signals.json.
 * It can miss things and it can match the wrong thing. The UI always shows what was matched.
 */
export type SignalId = keyof typeof data.signals;

export interface ParsedText {
  price: number | null;
  km: number | null;
  year: number | null;
  signals: { id: SignalId; match: string }[];
}

const BN_DIGITS = "০১২৩৪৫৬৭৮৯";
export function normaliseText(s: string): string {
  return s
    .replace(/[০-৯]/g, (d) => String(BN_DIGITS.indexOf(d)))
    .replace(/(\d),(?=\d)/g, "$1")
    .toLowerCase();
}

const COMPILED = Object.entries(data.signals).map(([id, pats]) => ({
  id: id as SignalId,
  res: (pats as string[]).map((p) => new RegExp(p, "iu")),
}));

const UNIT = "(lakh|lac|lakhs|lacs|লাখ|লক্ষ|hajar|hazar|হাজার|k)";
const unitMul = (u: string | undefined) => {
  if (!u) return 1;
  if (/lakh|lac|লাখ|লক্ষ/.test(u)) return 100000;
  if (/hajar|hazar|হাজার|^k$/.test(u)) return 1000;
  return 1;
};

/** Finds money amounts like "1.2 lakh", "85000 tk", "৳ 1,25,000", "85k". Skips amounts that follow advance/bKash words. */
export function extractPrice(norm: string): number | null {
  const re = new RegExp(`(?:(৳)\\s*)?(\\d+(?:\\.\\d+)?)\\s*${UNIT}?\\s*(${data.currencyMarkers})?`, "giu");
  const notCtx = new RegExp(`${data.notPriceContextBefore}[^\\d]{0,18}$`, "iu");
  const priceCtx = new RegExp(`${data.priceContextBefore}[^\\d]{0,14}$`, "iu");
  const cands: { v: number; score: number; idx: number }[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(norm))) {
    const num = parseFloat(m[2]);
    const mul = unitMul(m[3]);
    const marked = !!(m[1] || m[4]);
    const v = Math.round(num * mul);
    const before = norm.slice(Math.max(0, m.index - 24), m.index);
    const after = norm.slice(m.index + m[0].length, m.index + m[0].length + 8);
    if (notCtx.test(before)) continue;
    if (/^\s*(km|কিমি|k\.m|kilo|cc|ঃ|kmpl|year|বছর|yr|%|th\b|ta\b)/iu.test(after)) continue;
    if (m[3] && /^k$/i.test(m[3]) && /^\s*(m|কিমি)/i.test(after)) continue;
    if (v < 15000 || v > 1500000) continue;
    if (!m[3] && !marked && /^(19|20)\d\d$/.test(m[2])) continue; // looks like a year
    let score = 0;
    if (marked) score += 3;
    if (m[3]) score += 2;
    if (priceCtx.test(before)) score += 3;
    if (!marked && !m[3] && !priceCtx.test(before)) score -= 1; // bare number: weak
    cands.push({ v, score, idx: m.index });
  }
  if (!cands.length) return null;
  cands.sort((a, b) => b.score - a.score || a.idx - b.idx);
  return cands[0].score > 0 ? cands[0].v : null;
}

export function extractKm(norm: string): number | null {
  const m = norm.match(/(\d+(?:\.\d+)?)\s*(k|হাজার|hajar|hazar)?\s*(?:km|kms|কিমি|কি\.মি|kilometer|kilometre|কিলোমিটার)(?![a-z])/iu);
  if (!m) return null;
  const v = parseFloat(m[1]) * (m[2] ? 1000 : 1);
  return v >= 0 && v < 400000 ? Math.round(v) : null;
}

export function extractYear(norm: string, nowYear: number): number | null {
  const all = [...norm.matchAll(/(?<![\d.])((?:19|20)\d\d)(?![\d])/g)].map((x) => parseInt(x[1], 10));
  const ok = all.filter((y) => y >= 1985 && y <= nowYear + 1);
  // prefer a year that is near a "model|year|reg|সাল|মডেল" keyword
  const near = norm.match(/(?:model|year|reg(?:istration)?|সাল|মডেল|rejistration)\D{0,12}((?:19|20)\d\d)/iu);
  if (near) {
    const y = parseInt(near[1], 10);
    if (y >= 1985 && y <= nowYear + 1) return y;
  }
  return ok[0] ?? null;
}

export function parseListingText(raw: string, nowYear = new Date().getFullYear()): ParsedText {
  const norm = normaliseText(raw || "");
  const signals: ParsedText["signals"] = [];
  for (const { id, res } of COMPILED) {
    for (const re of res) {
      const m = norm.match(re);
      if (m) {
        signals.push({ id, match: m[0].trim().slice(0, 60) });
        break;
      }
    }
  }
  // "bring your mechanic" must not fire when the same text also refuses inspection
  const has = (id: SignalId) => signals.some((s) => s.id === id);
  const out = has("refusesInspection") ? signals.filter((s) => s.id !== "inspectionOk") : signals;
  return { price: extractPrice(norm), km: extractKm(norm), year: extractYear(norm, nowYear), signals: out };
}
