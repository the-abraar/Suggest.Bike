// Bike search (English, Bangla script, Banglish typos). Needs the bike index, so the header SearchBox loads it on demand.
import { BIKES, BRANDS, fullName, overall } from "./bikes";

// Keeps Latin letters, digits and Bangla script; Bangla digits are folded to Latin so "এন১৬০" matches "n160".
const BN_DIGITS = "০১২৩৪৫৬৭৮৯";
const norm = (s: string) =>
  s
    .toLowerCase()
    .replace(/[০-৯]/g, (d) => String(BN_DIGITS.indexOf(d)))
    .replace(/[^a-z0-9\u0980-\u09ff]+/g, "");

// Banglish spelling key: first letter, then consonants with doubles collapsed, so "palsar"/"plsar" = "pulsar", "gixar" = "gixxer", "harnet" = "hornet", "classik" = "classic".
const skel = (s: string) => {
  const w = s.replace(/ph/g, "f").replace(/[cq]/g, "k");
  return w[0] + w.slice(1).replace(/(.)\1+/g, "$1").replace(/[aeiouy]/g, "");
};
const fuzzy = (w: string, tokens: string[]) => {
  if (w.length < 4) return false;
  const k = skel(w);
  return tokens.some((t) => (k.length >= 3 ? skel(t).startsWith(k) : skel(t) === k));
};
// "fz v3", "r15 v5": a generation we do not list should still find the family.
const isGen = (w: string) => /^v\d$/.test(w);

// Mileage words with their endings: "mileage", "milage", "mailej", "kmpl", "fuel efficient", "low fuel", "মাইলেজের", "তেল খরচ কম".
const MILEAGE = /(?:mil[ea]+ge|mail[ea]?[gj]|milej|kmpl|km\/l|km[\s-]*per[\s-]*lit|fuel[\s-]*(?:efficien|econom|sav|consum)|(?:low|less)[\s-]*fuel|মাইলেজ|তেল[\s-]*(?:খরচ[\s-]*)?(?:কম|সাশ্র)|কম[\s-]*তেল|জ্বালানি[\s-]*সাশ্র)\S*/i;
const MILEAGE_ALL = new RegExp(MILEAGE.source, "gi");
// Words around a mileage ask that name no bike, dropped with it so "what is the mileage of pulsar" searches "pulsar".
const FILLER = new Set(
  "best top good great high higher highest most more max better average avg real actual bike bikes motorcycle motorcycles of for in on the a an with what whats which is ki koto kon er bhalo valo beshi besi sobcheye sob সবচেয়ে সবচাইতে বেশি ভালো সেরা বাইক মোটরসাইকেল কত কোন কী কি খরচ এর".split(" "),
);
const dropMileage = (q: string) =>
  MILEAGE.test(q) ? q.replace(MILEAGE_ALL, " ").split(/\s+/).filter((w) => w && !FILLER.has(w.toLowerCase())).join(" ") : q;

export function searchBikes(query: string, limit = 7) {
  const q = dropMileage(query);
  const n = norm(q);
  if (!n) return [];
  const words = q.toLowerCase().split(/\s+/).filter(Boolean).map(norm).filter(Boolean);
  // A brand on its own ("honda", "yamha", "hunda") lists that brand in tie-break order, so the misspelt-brand aliases a few
  // old bikes carry cannot push them to the top (critique B8).
  const brand = words.length === 1 && BRANDS.find((br) => norm(br) === n || fuzzy(n, [norm(br)]));
  return BIKES.map((b) => {
    if (brand) return { b, score: b.brand === brand ? 1 : 0 };
    const aliases = (b.aliases ?? []).map(norm);
    const hay = norm(`${b.brand}${b.model}${b.variant ?? ""}${b.category}${Math.round(b.engine.cc)}cc`) + aliases.join("|");
    const name = norm(fullName(b));
    let score = 0;
    if (norm(b.model).startsWith(n)) score += 6;
    if (name.startsWith(n)) score += 5;
    if (name.includes(n)) score += 3;
    if (aliases.some((a) => a.startsWith(n))) score += 4;
    else if (aliases.some((a) => a.includes(n))) score += 2;
    if (words.every((w) => hay.includes(w))) score += 2;
    if (!score) {
      const tokens = `${b.brand} ${b.model} ${b.variant ?? ""} ${(b.aliases ?? []).join(" ")}`.toLowerCase().split(/[\s-]+/).map(norm).filter(Boolean);
      const hit = (w: string) => tokens.some((t) => t.startsWith(w)) || fuzzy(w, tokens);
      if (words.some((w) => !isGen(w)) && words.every((w) => isGen(w) || hit(w))) score = 1;
    }
    return { b, score };
  })
    .filter((x) => x.score > 0)
    // Ties: on-sale bikes first, then the best rated, so "honda" finds the Hornet before a 1980s CD80 (critique B8).
    .sort((a, b) => b.score - a.score || +(a.b.status === "used-only") - +(b.b.status === "used-only") || overall(b.b) - overall(a.b))
    .slice(0, limit)
    .map((x) => x.b);
}

/** "under 2 lakh", "1.5 lac", "২ লাখের নিচে", "150k", "200000": the budget in taka, else null. Bare numbers under 10,000 are
 * model numbers ("n160", "r15"), not budgets. */
export function budgetQuery(q: string): number | null {
  const s = q.toLowerCase().replace(/[০-৯]/g, (d) => String(BN_DIGITS.indexOf(d))).replace(/(\d),(?=\d)/g, "$1");
  for (const m of s.matchAll(/(?<![a-z0-9.])(\d+(?:\.\d+)?)\s*(lakhs?|lacs?|লাখ|লক্ষ|k|hazar|hajar|হাজার)?(?![a-z0-9])/g)) {
    const unit = m[2] ? (/^[lল]/.test(m[2]) ? 1e5 : 1e3) : 1;
    if (!m[2] && +m[1] < 10000) continue;
    const taka = Math.round(+m[1] * unit);
    if (taka >= 20000 && taka <= 1e8) return taka;
  }
  return null;
}

/** "best mileage", "fuel efficient", "মাইলেজ", "best mileage under 1 lakh": the visitor wants the bike list sorted by mileage.
 * A bike named with it ("mileage of pulsar") is a bike lookup instead: searchBikes finds the Pulsar, whose page shows its mileage. */
export const mileageQuery = (q: string) => MILEAGE.test(q) && !searchBikes(q, 1).length;
