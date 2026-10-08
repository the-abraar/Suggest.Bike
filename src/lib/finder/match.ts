import { coloursIn, compactModel, COLOURS, districtsIn, DISTRICTS, includesAny, MUST_HAVES, mentionsModel, normText, PAPERS_NO, PAPERS_YES } from "./normalize";
import type { FinderSubmission, Listing, MatchResult, RequirementResult } from "./types";
import { hash } from "./validate";

/** Listings below this score are never sent to a user. */
export const MIN_SCORE = 60;

const WEIGHTS: Record<string, number> = {
  budget: 25, colour: 15, year: 15, km: 10, district: 10, papers: 10, mustHave: 15, custom: 0,
};

/** Canonical key for de-duplication: URL without query, hash or trailing slash; else a hash of title+price+district. */
export function listingKey(l: Pick<Listing, "url" | "title" | "priceBDT" | "district">): string {
  try {
    const u = new URL(l.url);
    return `${u.hostname.replace(/^www\./, "").toLowerCase()}${u.pathname.replace(/\/+$/, "")}`.toLowerCase();
  } catch {
    return `h:${hash(`${compactModel(l.title)}|${l.priceBDT ?? ""}|${compactModel(l.district ?? "")}`)}`;
  }
}

/** Remove duplicate listings (same key), keeping the first. */
export function dedupe<T extends Pick<Listing, "url" | "title" | "priceBDT" | "district">>(list: T[]): T[] {
  const seen = new Set<string>();
  return list.filter((l) => {
    const k = listingKey(l);
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}

const text = (l: Listing) => [l.title, l.description, l.colour, l.district].filter(Boolean).join(" . ");
const yearFrom = (l: Listing): number | undefined => {
  if (l.year) return l.year;
  const m = normText(`${l.title} ${l.description ?? ""}`).match(/\b(19[6-9]\d|20[0-3]\d)\b/);
  return m ? Number(m[1]) : undefined;
};
const fmt = (n: number) => `৳${n.toLocaleString("en-IN")}`;

/** Scores one listing against a request. Pure and deterministic. */
export function scoreListing(req: FinderSubmission, listing: Listing): MatchResult {
  const hay = text(listing);
  const res: (RequirementResult & { w: number })[] = [];
  const add = (key: string, status: RequirementResult["status"], hard: boolean, note: string, w: number) => res.push({ key, status, hard, note, w });

  // Model is a gate: a different bike is never a match.
  if (mentionsModel(`${listing.title} ${listing.description ?? ""}`, req.model)) add("model", "matched", true, `Ad mentions ${req.model}.`, 0);
  else add("model", "mismatched", true, `Ad does not mention ${req.model}.`, 0);

  if (req.maxBudget) {
    if (listing.priceBDT === undefined) add("budget", "unverifiable", true, "No price on the ad. Ask the seller.", WEIGHTS.budget);
    else if (listing.priceBDT <= req.maxBudget) add("budget", "matched", true, `Asking ${fmt(listing.priceBDT)}, within your ${fmt(req.maxBudget)}.`, WEIGHTS.budget);
    else add("budget", "mismatched", true, `Asking ${fmt(listing.priceBDT)}, over your ${fmt(req.maxBudget)}.`, WEIGHTS.budget);
  }

  if (req.colours.length) {
    const wanted = req.colours.map((c) => COLOURS[c]?.en ?? c).join(" / ");
    const seen = coloursIn(hay);
    if (seen.some((c) => req.colours.includes(c))) add("colour", "matched", false, `Colour matches (${wanted}).`, WEIGHTS.colour);
    else if (seen.length) add("colour", "mismatched", false, `Ad says ${seen.map((c) => COLOURS[c].en).join("/")}, you wanted ${wanted}. Check the photos.`, WEIGHTS.colour);
    else add("colour", "unverifiable", false, "Colour not stated. Check the photos.", WEIGHTS.colour);
  }

  if (req.yearMin !== undefined || req.yearMax !== undefined) {
    const y = yearFrom(listing);
    const range = `${req.yearMin ?? "…"}–${req.yearMax ?? "…"}`;
    if (y === undefined) add("year", "unverifiable", true, `Year not stated. Check the blue book (wanted ${range}).`, WEIGHTS.year);
    else if ((req.yearMin === undefined || y >= req.yearMin) && (req.yearMax === undefined || y <= req.yearMax)) add("year", "matched", true, `Year ${y} is in ${range}.`, WEIGHTS.year);
    else add("year", "mismatched", true, `Year ${y} is outside ${range}.`, WEIGHTS.year);
  }

  if (req.maxKm !== undefined) {
    if (listing.km === undefined) add("km", "unverifiable", false, "Distance not stated. Check the meter (it can be wound back).", WEIGHTS.km);
    else if (listing.km <= req.maxKm) add("km", "matched", false, `${listing.km.toLocaleString("en-IN")} km claimed. Check the meter.`, WEIGHTS.km);
    else add("km", "mismatched", true, `${listing.km.toLocaleString("en-IN")} km, over your ${req.maxKm.toLocaleString("en-IN")} km.`, WEIGHTS.km);
  }

  if (req.districts.length) {
    const wanted = req.districts.map((d) => DISTRICTS[d]?.en ?? d).join(" / ");
    const seen = districtsIn(listing.district ?? hay);
    if (seen.some((d) => req.districts.includes(d))) add("district", "matched", true, `Located in ${wanted}.`, WEIGHTS.district);
    else if (seen.length) add("district", "mismatched", true, `Located in ${seen.map((d) => DISTRICTS[d].en).join("/")}, not ${wanted}.`, WEIGHTS.district);
    else add("district", "unverifiable", true, `Location not clear (wanted ${wanted}). Ask the seller.`, WEIGHTS.district);
  }

  if (req.papers === "clean") {
    if (includesAny(hay, PAPERS_NO)) add("papers", "mismatched", true, "Ad hints at missing papers.", WEIGHTS.papers);
    else if (includesAny(hay, PAPERS_YES)) add("papers", "matched", false, "Seller says papers are clear. Verify the blue book and tax token yourself.", WEIGHTS.papers);
    else add("papers", "unverifiable", false, "Papers not mentioned. Ask to see the blue book and tax token.", WEIGHTS.papers);
  }

  // Must-haves: a hidden detail is never verified from a post, only claimed or contradicted.
  const each = req.mustHaves.length ? WEIGHTS.mustHave / req.mustHaves.length : 0;
  for (const key of req.mustHaves) {
    const m = MUST_HAVES[key];
    if (!m) continue;
    if (includesAny(hay, m.yes)) add(key, "matched", false, `Seller claims: ${m.en}. We cannot verify this from the ad. Inspect it.`, each);
    else if (includesAny(hay, m.no)) add(key, "mismatched", true, `Ad suggests the opposite of: ${m.en}.`, each);
    else add(key, "unverifiable", false, `Not stated: ${m.en}. Ask the seller and inspect it.`, each);
  }

  if (req.custom.trim()) add("custom", "unverifiable", false, `We cannot check this for you: "${req.custom.trim().slice(0, 120)}". Ask the seller.`, 0);

  const scored = res.filter((r) => r.w > 0);
  const total = scored.reduce((a, r) => a + r.w, 0);
  const got = scored.reduce((a, r) => a + r.w * (r.status === "matched" ? 1 : r.status === "unverifiable" ? 0.5 : 0), 0);
  const modelOk = res.find((r) => r.key === "model")?.status === "matched";
  // Hidden details and custom wishes can only be claimed by a seller, never verified from a post, so never show a perfect score.
  const cap = req.mustHaves.length || req.custom.trim() ? 95 : 100;
  const score = modelOk ? Math.min(cap, total ? Math.round((got / total) * 100) : 100) : 0;

  const strip = ({ w: _w, ...r }: RequirementResult & { w: number }): RequirementResult => r;
  const hardBad = res.some((r) => r.hard && r.status === "mismatched");
  return {
    listing,
    score,
    eligible: modelOk && !hardBad && score >= MIN_SCORE,
    matched: res.filter((r) => r.status === "matched").map(strip),
    unverifiable: res.filter((r) => r.status === "unverifiable").map(strip),
    mismatched: res.filter((r) => r.status === "mismatched").map(strip),
  };
}

/** Score, drop duplicates, return best first. Pass onlyEligible to hide weak matches. */
export function rankListings(req: FinderSubmission, listings: Listing[], onlyEligible = true): MatchResult[] {
  const out = dedupe(listings).map((l) => scoreListing(req, l));
  return (onlyEligible ? out.filter((m) => m.eligible) : out).sort((a, b) => b.score - a.score);
}
