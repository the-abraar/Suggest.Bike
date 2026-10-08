// Shared by the website (form), the nightly agent (finder/) and the Cloudflare Worker (finder/worker/).
// Pure TypeScript: no DOM, no Node, no React, no JSON imports. Use relative imports only.

export type MustHaveKey = "original-sleeve" | "unmodified" | "single-owner" | "original-paint" | "service-history";
export type PapersPref = "any" | "clean";
export type ConditionPref = "any" | "good" | "excellent";
export type Lang = "en" | "bn";

/** What the user types into the form (after validation and normalisation). */
export interface FinderSubmission {
  /** Free text, e.g. "Yamaha RX 115". Always present. */
  model: string;
  /** Set when the user picked a bike from the Suggest.Bike data; optional. */
  bikeId?: string;
  colours: string[]; // canonical colour keys, see COLOURS
  yearMin?: number;
  yearMax?: number;
  maxBudget?: number; // BDT
  maxKm?: number;
  papers: PapersPref;
  condition: ConditionPref;
  districts: string[]; // canonical district keys, empty = anywhere
  mustHaves: MustHaveKey[];
  custom: string; // free-text extra requirement, max 400 chars
  whatsapp: string; // +8801XXXXXXXXX
  consent: boolean; // explicit WhatsApp consent
  lang: Lang;
}

/** A stored request (server-side). The server assigns id and dates. */
export interface FinderRequest extends FinderSubmission {
  id: string;
  createdAt: string; // ISO
  consentAt?: string; // ISO, set by the server when consent === true
}

export interface Listing {
  source: string; // adapter name
  url: string;
  title: string;
  description?: string;
  priceBDT?: number;
  year?: number;
  km?: number;
  colour?: string; // free text as shown on the ad
  district?: string; // free text as shown on the ad
  postedAt?: string;
}

export type ReqStatus = "matched" | "unverifiable" | "mismatched";

export interface RequirementResult {
  key: string; // "model" | "budget" | "colour" | "year" | "km" | "district" | "papers" | "original-sleeve" | ... | "custom"
  status: ReqStatus;
  /** Hard requirements make a listing ineligible when mismatched. */
  hard: boolean;
  /** English note; the UI/agent can show it as is. */
  note: string;
}

export interface MatchResult {
  listing: Listing;
  score: number; // 0-100
  eligible: boolean; // no hard mismatch and score >= MIN_SCORE
  matched: RequirementResult[];
  unverifiable: RequirementResult[];
  mismatched: RequirementResult[];
}
