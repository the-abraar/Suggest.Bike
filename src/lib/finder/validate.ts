import { bnDigits, COLOURS, DISTRICTS, MUST_HAVES, normText } from "./normalize";
import type { ConditionPref, FinderRequest, FinderSubmission, Lang, MustHaveKey, PapersPref } from "./types";

export const REQUEST_TTL_DAYS = 60;
export const MAX_CUSTOM = 400;

/** Accepts 01712345678, 8801712345678, +8801712345678, with spaces, dashes or Bangla digits. Returns +8801XXXXXXXXX or null. */
export function normalizeBdPhone(input: string): string | null {
  let d = bnDigits(String(input ?? "")).replace(/[\s\-().]/g, "");
  if (d.startsWith("+")) d = d.slice(1);
  else if (d.startsWith("00")) d = d.slice(2);
  if (d.startsWith("880")) d = d.slice(3);
  else if (d.startsWith("0")) d = d.slice(1);
  // Now expect 1XXXXXXXXX (10 digits), operator digit 3-9.
  return /^1[3-9]\d{8}$/.test(d) ? `+880${d}` : null;
}

/** "+8801712345678" -> "+88017•••••678" for logs. Never log the full number. */
export function maskPhone(p: string): string {
  return p.length > 8 ? `${p.slice(0, 6)}${"•".repeat(p.length - 9)}${p.slice(-3)}` : "•••";
}

/** Stable short hash (FNV-1a, 32-bit, hex). Not cryptographic; use it for dedupe keys and log ids. */
export function hash(s: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(16).padStart(8, "0");
}

export type FieldErrors = Partial<Record<"model" | "whatsapp" | "consent" | "maxBudget" | "yearMin" | "yearMax" | "maxKm" | "custom" | "districts" | "colours", string>>;
export type Validation = { ok: true; value: FinderSubmission } | { ok: false; errors: FieldErrors };

const num = (v: unknown): number | undefined => {
  if (v === undefined || v === null || v === "") return undefined;
  const n = Number(bnDigits(String(v)).replace(/,/g, ""));
  return Number.isFinite(n) ? n : NaN;
};

/**
 * Validates untrusted input (form state, or a request body on the Worker) and returns a clean submission.
 * Error strings are stable English keys' messages; the UI maps field names to Bangla/English text itself.
 */
export function validateSubmission(input: unknown, opts: { requireConsent?: boolean } = {}): Validation {
  const requireConsent = opts.requireConsent ?? true;
  const errors: FieldErrors = {};
  const r = (input && typeof input === "object" ? input : {}) as Record<string, unknown>;

  const model = String(r.model ?? "").replace(/\s+/g, " ").trim().slice(0, 80);
  if (model.length < 2 || !normText(model)) errors.model = "Tell us which model you want.";

  const phone = normalizeBdPhone(String(r.whatsapp ?? ""));
  if (!phone) errors.whatsapp = "Enter a Bangladesh mobile number, like 01712345678.";

  const consent = r.consent === true;
  if (requireConsent && !consent) errors.consent = "Tick the box to allow WhatsApp messages, or we cannot contact you.";

  const maxBudget = num(r.maxBudget);
  if (maxBudget !== undefined && (Number.isNaN(maxBudget) || maxBudget < 10_000 || maxBudget > 50_000_000)) errors.maxBudget = "Budget should be between ৳10,000 and ৳5 crore.";
  const maxKm = num(r.maxKm);
  if (maxKm !== undefined && (Number.isNaN(maxKm) || maxKm < 0 || maxKm > 1_000_000)) errors.maxKm = "Enter a distance in km.";
  const thisYear = new Date().getFullYear();
  const yearMin = num(r.yearMin);
  const yearMax = num(r.yearMax);
  if (yearMin !== undefined && (Number.isNaN(yearMin) || yearMin < 1960 || yearMin > thisYear + 1)) errors.yearMin = "Enter a year like 1998.";
  if (yearMax !== undefined && (Number.isNaN(yearMax) || yearMax < 1960 || yearMax > thisYear + 1)) errors.yearMax = "Enter a year like 2005.";
  if (yearMin !== undefined && yearMax !== undefined && !errors.yearMin && !errors.yearMax && yearMin > yearMax) errors.yearMax = "The latest year must not be before the earliest.";

  const custom = String(r.custom ?? "").trim();
  if (custom.length > MAX_CUSTOM) errors.custom = `Keep it under ${MAX_CUSTOM} characters.`;

  const list = (v: unknown): string[] => (Array.isArray(v) ? v.map(String) : []);
  const colours = list(r.colours).filter((c) => c in COLOURS);
  const districts = list(r.districts).filter((d) => d in DISTRICTS);
  const mustHaves = list(r.mustHaves).filter((m): m is MustHaveKey => m in MUST_HAVES);

  if (Object.keys(errors).length) return { ok: false, errors };

  const papers: PapersPref = r.papers === "clean" ? "clean" : "any";
  const condition: ConditionPref = r.condition === "good" || r.condition === "excellent" ? r.condition : "any";
  const lang: Lang = r.lang === "bn" ? "bn" : "en";
  const bikeId = typeof r.bikeId === "string" && /^[a-z0-9-]{1,80}$/.test(r.bikeId) ? r.bikeId : undefined;

  return {
    ok: true,
    value: {
      model,
      ...(bikeId ? { bikeId } : {}),
      colours: [...new Set(colours)],
      ...(yearMin !== undefined ? { yearMin } : {}),
      ...(yearMax !== undefined ? { yearMax } : {}),
      ...(maxBudget !== undefined ? { maxBudget } : {}),
      ...(maxKm !== undefined ? { maxKm } : {}),
      papers,
      condition,
      districts: [...new Set(districts)],
      mustHaves: [...new Set(mustHaves)],
      custom,
      whatsapp: phone as string,
      consent,
      lang,
    },
  };
}

/** Server-side: turn a validated submission into a stored request. */
export function makeRequest(sub: FinderSubmission, id: string, now: Date = new Date()): FinderRequest {
  return { ...sub, id, createdAt: now.toISOString(), ...(sub.consent ? { consentAt: now.toISOString() } : {}) };
}

export function expiresAt(req: Pick<FinderRequest, "createdAt">): Date {
  return new Date(new Date(req.createdAt).getTime() + REQUEST_TTL_DAYS * 86_400_000);
}

export const isExpired = (req: Pick<FinderRequest, "createdAt">, now: Date = new Date()) => now >= expiresAt(req);

/** Short plain-language summary of a request, e.g. for a WhatsApp message or a log line. */
export function summarize(req: FinderSubmission): string {
  const parts = [req.model];
  if (req.colours.length) parts.push(req.colours.map((c) => COLOURS[c]?.en ?? c).join("/"));
  if (req.maxBudget) parts.push(`under ৳${req.maxBudget.toLocaleString("en-IN")}`);
  return parts.join(", ");
}
