import raw from "@/data/generated/bikes.index.json";
import type { BikeLite } from "./types";

// Data-free helpers live in ./bike-utils; re-exported so pages that already need the index import one module.
export * from "./bike-utils";

/** Slim records for client pages. Full records: lib/bikes.server.ts (build time) or /data/bikes/<id>.json (runtime). */
export const BIKES: BikeLite[] = (raw as unknown as BikeLite[])
  .slice()
  .sort((a, b) => a.brand.localeCompare(b.brand) || a.priceBDT - b.priceBDT);

const byId = new Map(BIKES.map((b) => [b.id, b]));
export const getBike = (id: string) => byId.get(id);

export const BRANDS = Array.from(new Set(BIKES.map((b) => b.brand))).sort();

/** Brands whose every model is used-only (e.g. "Hero Honda") get a "(used)" suffix in filters. */
export const brandLabel = (brand: string) => (BIKES.filter((b) => b.brand === brand).every((b) => b.status === "used-only") ? `${brand} (used)` : brand);

export function similarBikes(b: Pick<BikeLite, "id" | "priceBDT" | "engine" | "category" | "status">, n = 4) {
  return BIKES.filter((x) => x.id !== b.id)
    .map((x) => {
      const priceGap = Math.abs(Math.log(x.priceBDT / b.priceBDT));
      // EVs have cc 0: treat them as ~110cc scooters so the log stays finite.
      const ccGap = Math.abs(Math.log((x.engine.cc || 110) / (b.engine.cc || 110)));
      const cat = x.category === b.category ? 0 : 0.35;
      return { x, d: priceGap * 1.2 + ccGap + cat + (x.status !== b.status ? 0.3 : 0) };
    })
    .sort((p, q) => p.d - q.d)
    .slice(0, n)
    .map((p) => p.x);
}
