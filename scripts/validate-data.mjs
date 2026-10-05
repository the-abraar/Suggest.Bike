// Sanity-checks src/data/bikes.json. Run: node scripts/validate-data.mjs
import { readFileSync } from "node:fs";

const bikes = JSON.parse(readFileSync(new URL("../src/data/bikes.json", import.meta.url)));
const CATS = ["commuter", "street", "sport", "naked", "adventure", "cruiser", "classic", "scooter"];
const SCORES = ["reliability", "mechanicFamiliarity", "partsAvailability", "resale", "comfort", "cityHandling", "highway", "pillion", "offroad", "performance", "beginnerFriendly"];
const errors = [];
const ids = new Set();

for (const b of bikes) {
  const e = (m) => errors.push(`${b.id ?? "?"}: ${m}`);
  if (!/^[a-z0-9-]+$/.test(b.id)) e("bad id");
  if (ids.has(b.id)) e("duplicate id");
  ids.add(b.id);
  if (!CATS.includes(b.category)) e(`bad category ${b.category}`);
  if (!["on-sale", "used-only"].includes(b.status)) e("bad status");
  if (!Number.isFinite(b.priceBDT) || b.priceBDT < 20000 || b.priceBDT > 3000000) e(`implausible price ${b.priceBDT}`);
  if (!(b.engine?.cc > 40 && b.engine.cc < 1000)) e("bad cc");
  for (const k of ["powerPS", "torqueNm", "weightKg", "seatHeightMm", "fuelTankL", "serviceIntervalKm", "avgServiceCostBDT"])
    if (!(typeof b[k] === "number" && b[k] > 0)) e(`missing ${k}`);
  if (!(Array.isArray(b.mileageKmpl) && b.mileageKmpl[0] > 10 && b.mileageKmpl[1] >= b.mileageKmpl[0] && b.mileageKmpl[1] < 110)) e("bad mileage");
  for (const s of SCORES) if (!Number.isInteger(b.scores?.[s]) || b.scores[s] < 1 || b.scores[s] > 10) e(`bad score ${s}`);
  for (const k of ["tagline", "feel", "quirks", "braking", "mechanicNote"]) if (typeof b[k] !== "string" || b[k].length < 10) e(`thin ${k}`);
  for (const k of ["pros", "cons", "bestFor", "parts", "sources"]) if (!Array.isArray(b[k]) || !b[k].length) e(`empty ${k}`);
}
console.log(`${bikes.length} bikes checked, ${errors.length} problems`);
errors.forEach((x) => console.log(" -", x));
process.exit(errors.length ? 1 : 0);
