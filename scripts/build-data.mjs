// Splits src/data/bikes.json into what the browser actually needs:
//   src/data/generated/bikes.index.json  — slim list used by every client page (search, cards, matchmaker, cost)
//   public/data/bikes/<id>.json          — full record, fetched by /compare for the long-form rows
// Runs automatically before `dev`, `build` and `typecheck`.
import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";

const root = new URL("..", import.meta.url);
const bikes = JSON.parse(readFileSync(new URL("src/data/bikes.json", root)));
const OFFER = /offer|discount|campaign|cashback|ছাড়|অফার/i;

const index = bikes.map((b) => {
  const { feel, quirks, braking, mechanicNote, pros, cons, bestFor, sources, priceNote, priceSource, tyres, suspension, bn, parts, ...rest } = b;
  return {
    ...rest,
    taglineBn: bn?.tagline,
    parts: parts.map(({ name, priceBDT, availability }) => ({ name, priceBDT, availability })),
    hasOffer: OFFER.test(priceNote ?? ""),
  };
});

mkdirSync(new URL("src/data/generated/", root), { recursive: true });
writeFileSync(new URL("src/data/generated/bikes.index.json", root), JSON.stringify(index));

rmSync(new URL("public/data/bikes/", root), { recursive: true, force: true });
mkdirSync(new URL("public/data/bikes/", root), { recursive: true });
for (const b of bikes) writeFileSync(new URL(`public/data/bikes/${b.id}.json`, root), JSON.stringify(b));

const kb = (n) => `${Math.round(n / 1024)} KB`;
console.log(`data: ${bikes.length} bikes → index ${kb(JSON.stringify(index).length)}, full ${kb(JSON.stringify(bikes).length)}`);
