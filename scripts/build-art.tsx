// Pre-renders each bike's illustration to a standalone SVG (light-theme colours) for share images.
// Output: src/data/generated/art.json  { [id]: "data:image/svg+xml;base64,…" }
// Runs in `prebuild` (Next won't let react-dom/server into app routes).
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { BikeArt } from "../src/components/BikeArt";
import type { Bike } from "../src/lib/types";

const root = new URL("..", import.meta.url);
const bikes: Bike[] = JSON.parse(readFileSync(new URL("src/data/bikes.json", root), "utf8"));

const out: Record<string, string> = {};
for (const b of bikes) {
  const svg = renderToStaticMarkup(<BikeArt bike={b} shadow={false} />)
    .replace(/var\(--art-ink\)/g, "#1c2420")
    .replace(/var\(--art-metal\)/g, "#9aa39e")
    .replace(/var\(--art-tyre\)/g, "#1a1f1c")
    .replace(/var\(--signal\)/g, "#e2453c")
    .replace("<svg ", '<svg xmlns="http://www.w3.org/2000/svg" width="800" height="480" ');
  out[b.id] = `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
}
mkdirSync(new URL("src/data/generated/", root), { recursive: true });
writeFileSync(new URL("src/data/generated/art.json", root), JSON.stringify(out));
console.log(`art: ${Object.keys(out).length} share-image illustrations`);
