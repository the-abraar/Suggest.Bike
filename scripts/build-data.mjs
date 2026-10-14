// Splits src/data/bikes.json into what the browser actually needs:
//   src/data/generated/bikes.index.json  — slim list for client pages that list bikes (cards, matchmaker, cost); the header
//                                          search and compare tray import it on demand, so guides and legal pages skip it
//   src/data/generated/bikes.full.json   — full records for server components (detail pages)
//   src/data/generated/bikes.ids.json    — ids only, for the compare/saved store in the layout (every page)
//   public/data/bikes/<id>.json          — full record, fetched by /compare for the long-form rows
// Runs automatically before `dev`, `build` and `typecheck`.
import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";

const root = new URL("..", import.meta.url);
const guide = JSON.parse(readFileSync(new URL("src/data/guide.json", root)));

// EVs carry no kmpl or tank. Derive a petrol-cost equivalent so the cost, match and compare engines work unchanged:
// electricity Tk/km = battery kWh x charging loss x tariff / real range; equivalent kmpl = octane Tk/L / that.
const CHARGE_LOSS = 1.15; // shortcut: flat 15% charger + battery loss; replace with per-model figures if a source gives them
const evTkPerKm = (ev, range) => (ev.batteryKWh * CHARGE_LOSS * guide.fuel.electricity.tkPerKWh) / range;
const derive = (b) => {
  if (b.engine.fuel !== "electric") return b;
  const eq = (r) => Math.round(guide.fuel.octane / evTkPerKm(b.ev, r));
  const mileageKmpl = [eq(b.ev.realRangeKm[0]), eq(b.ev.realRangeKm[1])];
  const avgRange = (b.ev.realRangeKm[0] + b.ev.realRangeKm[1]) / 2;
  return { ...b, mileageKmpl, fuelTankL: Math.round((avgRange / ((mileageKmpl[0] + mileageKmpl[1]) / 2)) * 100) / 100 };
};
// dataNote holds editorial and owner notes: dropped here so no page, payload or public JSON ever carries it.
const bikes = JSON.parse(readFileSync(new URL("src/data/bikes.json", root))).map(({ dataNote, ...b }) => derive(b));

const index = bikes.map((b) => {
  const { feel, quirks, braking, mechanicNote, pros, cons, bestFor, sources, priceNote, priceSource, tyres, suspension, bn, parts, variants, outlierNote, ...rest } = b;
  return {
    ...rest,
    taglineBn: bn?.tagline,
    parts: parts.map(({ name, priceBDT, availability }) => ({ name, priceBDT, availability })),
  };
});

mkdirSync(new URL("src/data/generated/", root), { recursive: true });
writeFileSync(new URL("src/data/generated/bikes.index.json", root), JSON.stringify(index));
writeFileSync(new URL("src/data/generated/bikes.full.json", root), JSON.stringify(bikes));
writeFileSync(new URL("src/data/generated/bikes.ids.json", root), JSON.stringify(bikes.map((b) => b.id)));

rmSync(new URL("public/data/bikes/", root), { recursive: true, force: true });
mkdirSync(new URL("public/data/bikes/", root), { recursive: true });
for (const b of bikes) writeFileSync(new URL(`public/data/bikes/${b.id}.json`, root), JSON.stringify(b));

const kb = (n) => `${Math.round(n / 1024)} KB`;
console.log(`data: ${bikes.length} bikes → index ${kb(JSON.stringify(index).length)}, full ${kb(JSON.stringify(bikes).length)}`);
