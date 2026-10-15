// Sanity-checks src/data/bikes.json. Run: node scripts/validate-data.mjs [other-bikes.json] (the argument is for tests)
import { readFileSync } from "node:fs";

const bikes = JSON.parse(readFileSync(process.argv[2] ?? new URL("../src/data/bikes.json", import.meta.url)));
const CATS = ["commuter", "street", "sport", "naked", "adventure", "cruiser", "classic", "scooter"];
const COLS = ["legendary", "old-school"];
const SCORES = ["reliability", "mechanicFamiliarity", "partsAvailability", "resale", "comfort", "cityHandling", "highway", "pillion", "offroad", "performance", "beginnerFriendly"];
const errors = [];
const ids = new Set();
// Words that mark a note for us, not the rider. "unverified" is allowed: it is the public APPROX marker (CODING_STANDARDS "Cite").
const INTERNAL = /\b(users?|BikeBD data|placeholder|unconfirmed|TODO|FIXME)\b/i;
// Owner-experience text must not narrate our sources (critique 15 Oct N6: "bikebd's spec table and review disagree…" under
// "Quirks owners talk about"). Citations belong in priceNote, sources and dataNote, which this check skips.
const EDITORIAL = ["tagline", "feel", "quirks", "braking", "mechanicNote", "pros", "cons", "bestFor"];
const PROVENANCE = /bikebd|spec table|স্পেক টেবিল|স্পেস টেবিল/i;

for (const b of bikes) {
  const e = (m) => errors.push(`${b.id ?? "?"}: ${m}`);
  if (!/^[a-z0-9-]+$/.test(b.id)) e("bad id");
  if (ids.has(b.id)) e("duplicate id");
  ids.add(b.id);
  if (!CATS.includes(b.category)) e(`bad category ${b.category}`);
  for (const c of b.collections ?? []) if (!COLS.includes(c)) e(`bad collection ${c}`);
  if (b.engine?.stroke === 2 && !b.collections?.includes("old-school")) e("two-stroke must be in the old-school collection");
  if (!["on-sale", "used-only"].includes(b.status)) e("bad status");
  if (!Number.isFinite(b.priceBDT) || b.priceBDT < 20000 || b.priceBDT > 3000000) e(`implausible price ${b.priceBDT}`);
  const isEv = b.engine?.fuel === "electric";
  if (isEv) {
    // EVs: no cc, kmpl or tank in the data (build-data derives a petrol-cost equivalent); the ev block must be complete.
    if (b.engine.cc !== 0 || "mileageKmpl" in b || "fuelTankL" in b) e("electric: engine.cc must be 0 and mileageKmpl/fuelTankL omitted");
    const v = b.ev ?? {};
    for (const k of ["motorW", "batteryKWh", "rangeKm", "chargeHours"]) if (!(typeof v[k] === "number" && v[k] > 0)) e(`electric: missing ev.${k}`);
    if (!(typeof v.battery === "string" && v.battery.length > 3)) e("electric: missing ev.battery");
    if (v.batteryWarrantyMonths !== undefined && !(Number.isInteger(v.batteryWarrantyMonths) && v.batteryWarrantyMonths > 0 && v.batteryWarrantyMonths <= 120)) e("electric: bad ev.batteryWarrantyMonths (whole months, 1-120)");
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
  if (b.availability !== undefined && !(b.availability === "unconfirmed" && b.status === "on-sale")) e(`bad availability ${b.availability} (only "unconfirmed", on an on-sale bike)`);
  if (b.dataNote !== undefined && typeof b.dataNote !== "string") e("dataNote must be a string");
  // Rendered text must not carry editorial or provenance notes (critique B4: "Name as used by the user…" under an H1).
  const pub = [b.variant, b.priceNote, b.tagline, b.feel, b.quirks, b.braking, b.mechanicNote, b.pros, b.cons, b.bestFor, b.parts?.map((p) => p.note), b.variants?.map((v) => v.name), b.bn];
  const leak = JSON.stringify(pub).match(INTERNAL);
  if (leak) e(`public text contains "${leak[0]}": move editorial or provenance notes to dataNote`);
  const named = JSON.stringify(EDITORIAL.flatMap((k) => [b[k], b.bn?.[k]])).match(PROVENANCE);
  if (named) e(`owner-experience text names "${named[0]}": say what the rider should check, and keep the source in dataNote`);
}
// Price age: priceAsOf is "YYYY-MM"; treated as month start. Thresholds overridable via env:
// PRICE_FAIL_DAYS is the emergency-deploy override (docs/price-refresh.md), not a fix for stale prices.
// Only prices the bike page shows as "checked" (on sale) fail; used-only prices are labelled estimates, so they only warn.
const WARN_DAYS = +(process.env.PRICE_WARN_DAYS ?? 90), FAIL_DAYS = +(process.env.PRICE_FAIL_DAYS ?? 180);
const warnings = [], domains = {};
if (!Number.isFinite(WARN_DAYS) || !Number.isFinite(FAIL_DAYS)) errors.push(`PRICE_WARN_DAYS / PRICE_FAIL_DAYS must be numbers (got ${process.env.PRICE_WARN_DAYS}, ${process.env.PRICE_FAIL_DAYS})`); // NaN would switch the gate off
for (const b of bikes) {
  const t = Date.parse(`${b.priceAsOf}-01`);
  if (Number.isNaN(t)) { errors.push(`${b.id}: bad priceAsOf ${b.priceAsOf}`); continue; }
  const age = Math.floor((Date.now() - t) / 864e5);
  if (age > FAIL_DAYS && b.status === "on-sale") errors.push(`${b.id}: price ${age}d old (priceAsOf ${b.priceAsOf}, fail >${FAIL_DAYS}d)`);
  else if (age > FAIL_DAYS) warnings.push(`${b.id}: used-price estimate ${age}d old (priceAsOf ${b.priceAsOf}); re-check current listings`);
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
// Old is only a warning: BD fuel prices reset monthly and a busy month must not block every deploy; /cost shows its own "may be out of date" note.
const FUEL_DAYS = +(process.env.FUEL_WARN_DAYS ?? 45);
for (const [name, asOf] of [["fuel", guide.fuel?.asOf], ["electricity tariff", guide.fuel?.electricity?.asOf]]) {
  const age = Math.floor((Date.now() - Date.parse(asOf)) / 864e5);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(asOf ?? "") || !(age >= -1)) /* -1: asOf is a Bangladesh date, the clock may be UTC */ errors.push(`guide.json ${name}: bad or future asOf ${asOf}`);
  else if (age > FUEL_DAYS) warnings.push(`guide.json ${name}: asOf ${asOf} is ${age}d old (warn >${FUEL_DAYS}d); re-check the official price and update the value and asOf`);
}
if (!(guide.fuel?.electricity?.tkPerKWh > 0)) errors.push("guide.json fuel.electricity.tkPerKWh missing (EV running cost)");
// Offers (hand-edited, src/data/offers.json). A past offer is only a warning: the site hides it by date on its own.
const OFFER_TYPES = ["discount", "free-registration", "cashback", "emi", "exchange", "gift", "other"];
const isDate = (s) => typeof s === "string" && /^\d{4}-\d{2}-\d{2}$/.test(s) && new Date(`${s}T00:00:00Z`).toISOString().startsWith(s);
const todayBD = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Dhaka" });
const offerIds = new Set();
for (const o of JSON.parse(readFileSync(new URL("../src/data/offers.json", import.meta.url))).offers ?? []) {
  const e = (m) => errors.push(`offers.json ${o.id ?? "?"}: ${m}`);
  if (!/^[a-z0-9-]+$/.test(o.id ?? "") || offerIds.has(o.id)) e("missing, bad or duplicate id");
  offerIds.add(o.id);
  if (!Array.isArray(o.bikeIds) || !o.bikeIds.length) e("bikeIds must list at least one bike");
  for (const id of o.bikeIds ?? []) if (!ids.has(id)) e(`unknown bike id ${id}`);
  if (!OFFER_TYPES.includes(o.type)) e(`bad type ${o.type} (one of ${OFFER_TYPES.join(", ")})`);
  for (const k of ["title", "titleBn"]) if (!(typeof o[k] === "string" && o[k].length >= 5)) e(`missing ${k}`);
  if (!isDate(o.startsOn) || !isDate(o.endsOn)) e(`dates must be real YYYY-MM-DD (startsOn ${o.startsOn}, endsOn ${o.endsOn})`);
  else if (o.endsOn < o.startsOn) e(`endsOn ${o.endsOn} is before startsOn ${o.startsOn}`);
  else if (o.endsOn < todayBD) warnings.push(`offers.json ${o.id}: ended ${o.endsOn}; the site hides it, delete it when convenient`);
  for (const k of ["regularPriceBDT", "offerPriceBDT"]) if (o[k] !== undefined && !(Number.isInteger(o[k]) && o[k] >= 20000)) e(`bad ${k} ${o[k]}`);
  if (o.type === "discount" && !(o.offerPriceBDT < o.regularPriceBDT)) e("discount needs offerPriceBDT lower than regularPriceBDT");
  // The struck-through price must be the headline price on the same page (critique 15 Oct N8: ৳4,50,000 vs ৳4,49,950).
  if (o.regularPriceBDT !== undefined) for (const id of o.bikeIds ?? []) { const b = bikes.find((x) => x.id === id); if (b && b.priceBDT !== o.regularPriceBDT) e(`regularPriceBDT ${o.regularPriceBDT} is not ${id}'s price ${b.priceBDT}`); }
  if (!(typeof o.source?.name === "string" && o.source.name.length >= 2)) e("missing source.name");
  if (o.source?.url != null) try { if (!/^https?:$/.test(new URL(o.source.url).protocol)) e("source.url must be http(s)"); } catch { e("bad source.url"); }
}
for (const [d, n] of Object.entries(domains))
  if (n / bikes.length > 0.5) warnings.push(`source concentration: ${d} supplies ${n}/${bikes.length} (${Math.round((100 * n) / bikes.length)}%) of price sources`);
// Unset launch settings in src/lib/site.ts: forms fall back to mailto and analytics stays off, so say so.
const site = readFileSync(new URL("../src/lib/site.ts", import.meta.url), "utf8");
const UNSET = { FORM_ENDPOINT: "feedback falls back to mailto", GOATCOUNTER_CODE: "analytics off", WHATSAPP: "no WhatsApp link" };
for (const [k, why] of Object.entries(UNSET))
  if (new RegExp(`export const ${k}: string = "";`).test(site)) warnings.push(`site.ts ${k} is empty (${why}); see docs/Todo_owner.md`);
warnings.forEach((w) => console.log("WARN", w));
console.log(`${bikes.length} bikes checked, ${errors.length} problems`);
if (errors.some((x) => /price \d+d old/.test(x)))
  console.log("\nTo fix stale prices: re-source each listed bike. Find its current price on the official distributor page or a dated distributor price list, then update priceBDT, priceSource and priceAsOf (YYYY-MM) in src/data/bikes.json. Do not just raise PRICE_FAIL_DAYS: it is only for an emergency deploy (docs/price-refresh.md).\n");
errors.forEach((x) => console.log(" -", x));
process.exit(errors.length ? 1 : 0);
