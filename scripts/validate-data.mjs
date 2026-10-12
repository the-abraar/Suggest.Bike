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
  const isEv = b.engine?.fuel === "electric";
  if (isEv) {
    // EVs: no cc, kmpl or tank in the data (build-data derives a petrol-cost equivalent); the ev block must be complete.
    if (b.engine.cc !== 0 || "mileageKmpl" in b || "fuelTankL" in b) e("electric: engine.cc must be 0 and mileageKmpl/fuelTankL omitted");
    const v = b.ev ?? {};
    for (const k of ["motorW", "batteryKWh", "rangeKm", "chargeHours"]) if (!(typeof v[k] === "number" && v[k] > 0)) e(`electric: missing ev.${k}`);
    if (!(typeof v.battery === "string" && v.battery.length > 3)) e("electric: missing ev.battery");
    if (!(Array.isArray(v.realRangeKm) && v.realRangeKm[0] > 0 && v.realRangeKm[1] >= v.realRangeKm[0] && v.realRangeKm[1] <= v.rangeKm)) e("electric: bad ev.realRangeKm (must not exceed claimed rangeKm)");
  } else {
    if (!(b.engine?.cc > 40 && b.engine.cc < 1000)) e("bad cc");
    if (!["carb", "fi"].includes(b.engine?.fuel)) e(`bad engine.fuel ${b.engine?.fuel}`);
    if (b.ev) e("ev block on a non-electric bike");
    if (!(Array.isArray(b.mileageKmpl) && b.mileageKmpl[0] > 10 && b.mileageKmpl[1] >= b.mileageKmpl[0] && b.mileageKmpl[1] < 110)) e("bad mileage");
  }
  for (const k of ["powerPS", "torqueNm", "weightKg", "seatHeightMm", ...(isEv ? [] : ["fuelTankL"]), "serviceIntervalKm", "avgServiceCostBDT"])
    if (!(typeof b[k] === "number" && b[k] > 0)) e(`missing ${k}`);
  for (const v of b.variants ?? []) {
    if (!(typeof v.name === "string" && v.name.length > 1)) e("variant without name");
    if (!(Number.isFinite(v.priceBDT) && v.priceBDT > 20000 && Math.abs(v.priceBDT - b.priceBDT) / b.priceBDT < 0.5)) e(`variant ${v.name}: implausible price ${v.priceBDT}`);
    if (v.abs !== undefined && !["none", "single", "dual", "cbs"].includes(v.abs)) e(`variant ${v.name}: bad abs`);
    try { new URL(v.priceSource); } catch { e(`variant ${v.name}: bad priceSource`); }
  }
  for (const s of SCORES) if (!Number.isInteger(b.scores?.[s]) || b.scores[s] < 1 || b.scores[s] > 10) e(`bad score ${s}`);
  for (const k of ["tagline", "feel", "quirks", "braking", "mechanicNote"]) if (typeof b[k] !== "string" || b[k].length < 10) e(`thin ${k}`);
  for (const k of ["pros", "cons", "bestFor", "parts", "sources"]) if (!Array.isArray(b[k]) || !b[k].length) e(`empty ${k}`);
}
// Price age: priceAsOf is "YYYY-MM"; treated as month start. Thresholds overridable via env.
const WARN_DAYS = +(process.env.PRICE_WARN_DAYS ?? 90), FAIL_DAYS = +(process.env.PRICE_FAIL_DAYS ?? 180);
const warnings = [], domains = {};
for (const b of bikes) {
  const t = Date.parse(`${b.priceAsOf}-01`);
  if (Number.isNaN(t)) { errors.push(`${b.id}: bad priceAsOf ${b.priceAsOf}`); continue; }
  const age = Math.floor((Date.now() - t) / 864e5);
  if (age > FAIL_DAYS) errors.push(`${b.id}: price ${age}d old (priceAsOf ${b.priceAsOf}, fail >${FAIL_DAYS}d)`);
  else if (age > WARN_DAYS) warnings.push(`${b.id}: price ${age}d old (priceAsOf ${b.priceAsOf}, warn >${WARN_DAYS}d)`);
  try { const d = new URL(b.priceSource).hostname.replace(/^www\./, ""); domains[d] = (domains[d] ?? 0) + 1; } catch { errors.push(`${b.id}: bad priceSource`); }
}
// Outliers: price more than 40% from the category median must explain itself in priceNote.
const median = (a) => { const s = [...a].sort((x, y) => x - y), m = s.length >> 1; return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; };
const med = {};
for (const c of CATS) { const p = bikes.filter((b) => b.category === c).map((b) => b.priceBDT); if (p.length) med[c] = median(p); }
for (const b of bikes) {
  const dev = (b.priceBDT - med[b.category]) / med[b.category];
  const why = b.outlierNote ?? b.priceNote;
  if (Math.abs(dev) > 0.4 && !(typeof why === "string" && why.length >= 40))
    errors.push(`${b.id}: price ${Math.round(dev * 100)}% from ${b.category} median with no explanation; say why in outlierNote (or priceNote), after checking a second source`);
}
// Fuel price: the cost page multiplies by it, so a stale figure skews every running cost. Same for the electricity tariff (EVs).
const guide = JSON.parse(readFileSync(new URL("../src/data/guide.json", import.meta.url)));
const FUEL_DAYS = +(process.env.FUEL_FAIL_DAYS ?? 45);
for (const [name, asOf] of [["fuel", guide.fuel?.asOf], ["electricity tariff", guide.fuel?.electricity?.asOf]]) {
  const age = Math.floor((Date.now() - Date.parse(asOf)) / 864e5);
  if (!(age >= -1)) /* -1: asOf is a Bangladesh date, the clock may be UTC */ errors.push(`guide.json ${name}: bad asOf ${asOf}`);
  else if (age > FUEL_DAYS) errors.push(`guide.json ${name}: asOf ${asOf} is ${age}d old (fail >${FUEL_DAYS}d); re-check the official price and update the value and asOf`);
}
if (!(guide.fuel?.electricity?.tkPerKWh > 0)) errors.push("guide.json fuel.electricity.tkPerKWh missing (EV running cost)");
for (const [d, n] of Object.entries(domains))
  if (n / bikes.length > 0.5) warnings.push(`source concentration: ${d} supplies ${n}/${bikes.length} (${Math.round((100 * n) / bikes.length)}%) of price sources`);
warnings.forEach((w) => console.log("WARN", w));
console.log(`${bikes.length} bikes checked, ${errors.length} problems`);
if (errors.some((x) => /price \d+d old/.test(x)))
  console.log("\nTo fix stale prices: re-source each listed bike. Find its current price on the official distributor page or a dated distributor price list, then update priceBDT, priceSource and priceAsOf (YYYY-MM) in src/data/bikes.json. Do not just raise PRICE_FAIL_DAYS.\n");
errors.forEach((x) => console.log(" -", x));
process.exit(errors.length ? 1 : 0);
