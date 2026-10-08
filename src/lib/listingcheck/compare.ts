import type { Assessment } from "./types";

export interface Ranked { index: number; value: number; risk: number; rank: number; composite: number }

/**
 * Value index 0-100: how much you pay relative to the fair mid price. 50 = fair. Cheaper is higher,
 * but a price far below fair is capped at 50 because that is a scam pattern, not a bargain.
 * Risk index 0-100 = 100 - score.
 * Rank by composite = 0.6 * score + 0.4 * value. Risk dominates on purpose.
 */
export function valueIndex(a: Assessment): number {
  const d = a.price.deltaPct;
  if (!a.price.known || d == null) return 40;
  const v = Math.max(0, Math.min(100, 50 - d * 1.5));
  return a.price.band === "far-below" ? Math.min(v, 50) : Math.round(v);
}

export function rankListings(list: Assessment[]): Ranked[] {
  const rows = list.map((a, index) => {
    const value = valueIndex(a);
    return { index, value, risk: 100 - a.score, rank: 0, composite: 0.6 * a.score + 0.4 * value };
  });
  const sorted = [...rows].sort((x, y) => y.composite - x.composite);
  sorted.forEach((r, i) => (r.rank = i + 1));
  return rows;
}
