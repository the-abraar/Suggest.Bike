import "server-only";
import raw from "@/data/bikes.json";
import type { Bike } from "./types";

/** Full records, including long-form text and Bangla. Only for server components (rendered at build time). */
const FULL = raw as unknown as Bike[];
const byId = new Map(FULL.map((b) => [b.id, b]));
export const getFullBike = (id: string) => byId.get(id);
export const ALL_IDS = FULL.map((b) => b.id);
