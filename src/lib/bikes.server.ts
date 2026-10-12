import "server-only";
import raw from "@/data/generated/bikes.full.json"; // EV mileage/tank derived by scripts/build-data.mjs
import history from "@/data/generated/price-history.json"; // from git by scripts/build-history.ts
import type { PriceHistory } from "./history";
import type { Bike } from "./types";

/** Full records, including long-form text and Bangla. Only for server components (rendered at build time). */
const FULL = raw as unknown as Bike[];
const HIST = history as PriceHistory;
const byId = new Map(FULL.map((b) => [b.id, { ...b, priceHistory: HIST.bikes[b.id] ?? [] }]));
export const getFullBike = (id: string) => byId.get(id);
export const ALL_IDS = FULL.map((b) => b.id);
