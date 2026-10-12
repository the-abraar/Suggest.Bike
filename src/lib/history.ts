// Price history from successive snapshots of src/data/bikes.json (scripts/build-history.ts feeds it git commits).
// Dates are when our data changed, which only approximates when the market price changed.

export type SnapBike = { id: string; brand: string; model: string; priceBDT: number; priceAsOf: string };
export type Snapshot = { date: string; bikes: SnapBike[] }; // date "YYYY-MM-DD"; snapshots oldest first
export type PricePoint = { priceBDT: number; priceAsOf: string; firstSeen: string };
export type ChangeEvent = {
  date: string;
  id: string;
  name: string;
  kind: "up" | "down" | "added" | "removed";
  from?: number;
  to?: number;
  pct?: number; // signed, one decimal
};
export type PriceHistory = { bikes: Record<string, PricePoint[]>; events: ChangeEvent[] };

/** Per-bike price points (only when the price changes) and change events, newest event first. The first snapshot is the baseline: its bikes are not "added". */
export function diffSnapshots(snaps: Snapshot[]): PriceHistory {
  const bikes: Record<string, PricePoint[]> = {};
  const events: ChangeEvent[] = [];
  let prev: Map<string, SnapBike> | null = null;
  for (const s of snaps) {
    const cur = new Map(s.bikes.map((b) => [b.id, b]));
    for (const b of cur.values()) {
      const pts = (bikes[b.id] ??= []);
      const before = prev?.get(b.id);
      const name = `${b.brand} ${b.model}`;
      if (prev && !before) events.push({ date: s.date, id: b.id, name, kind: "added", to: b.priceBDT });
      if (before && before.priceBDT !== b.priceBDT) {
        const pct = Math.round(((b.priceBDT - before.priceBDT) / before.priceBDT) * 1000) / 10;
        events.push({ date: s.date, id: b.id, name, kind: b.priceBDT > before.priceBDT ? "up" : "down", from: before.priceBDT, to: b.priceBDT, pct });
      }
      if (pts.at(-1)?.priceBDT !== b.priceBDT) pts.push({ priceBDT: b.priceBDT, priceAsOf: b.priceAsOf, firstSeen: s.date });
    }
    for (const b of prev?.values() ?? []) {
      if (!cur.has(b.id)) events.push({ date: s.date, id: b.id, name: `${b.brand} ${b.model}`, kind: "removed", from: b.priceBDT });
    }
    prev = cur;
  }
  // Stable sort keeps commit order within a day.
  return { bikes, events: events.map((e, i) => [e, i] as const).sort((a, b) => b[0].date.localeCompare(a[0].date) || b[1] - a[1]).map(([e]) => e) };
}
