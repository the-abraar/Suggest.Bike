// Regenerates SOURCES.md from the data files. Run: node scripts/sources.mjs
import { readFileSync, writeFileSync } from "node:fs";

const read = (p) => JSON.parse(readFileSync(new URL(p, import.meta.url)));
const bikes = read("../src/data/bikes.json");
const guide = read("../src/data/guide.json");

const host = (u) => {
  try {
    return new URL(u).hostname.replace(/^www\./, "");
  } catch {
    return u;
  }
};

const out = [];
out.push("# Data sources", "");
out.push(
  "Where every number on Suggest.Bike comes from. Generated from `src/data/*.json` by `node scripts/sources.mjs` — edit the data, not this file.",
  "",
  "**Confidence key:** specs and prices are sourced; real-world mileage ranges, the 1–10 ownership scores, parts prices and service costs are *editorial estimates* informed by the sources below and owner reports.",
  "",
);

// Domain summary
const allUrls = bikes.flatMap((b) => [b.priceSource, ...b.sources]).filter((u) => u?.startsWith("http"));
const counts = {};
for (const u of allUrls) counts[host(u)] = (counts[host(u)] || 0) + 1;
out.push("## Bike data — by website", "", "| Site | References |", "| --- | ---: |");
Object.entries(counts)
  .sort((a, b) => b[1] - a[1])
  .forEach(([h, n]) => out.push(`| ${h} | ${n} |`));
out.push("");

// Per bike
out.push("## Bike data — per bike", "");
const brands = [...new Set(bikes.map((b) => b.brand))].sort();
for (const brand of brands) {
  out.push(`### ${brand}`, "");
  for (const b of bikes.filter((x) => x.brand === brand)) {
    out.push(`- **${b.model}**${b.variant ? ` (${b.variant})` : ""} — ৳${b.priceBDT.toLocaleString("en-IN")} as of ${b.priceAsOf}${b.status === "used-only" ? " (used market)" : ""}`);
    out.push(`  - Price: ${b.priceSource}`);
    const rest = [...new Set(b.sources)].filter((u) => u !== b.priceSource);
    rest.forEach((u) => out.push(`  - ${u}`));
  }
  out.push("");
}

// Guide
out.push("## Buyer's guide (BRTA, licence, fuel, laws)", "", `Compiled ${guide.meta.compiledOn}. ${guide.meta.disclaimer}`, "");
for (const s of Object.values(guide.meta.sourceIndex)) {
  out.push(`- ${s.title} — ${s.publisher ?? ""}${s.date ? `, ${s.date}` : ""}  \n  ${s.url}`);
}
out.push("");
out.push("### Confidence notes from research", "");
for (const [k, v] of Object.entries(guide)) {
  if (v && typeof v === "object" && typeof v.confidence === "string") out.push(`- **${k}:** ${v.confidence}`);
}
out.push("");

writeFileSync(new URL("../SOURCES.md", import.meta.url), out.join("\n"));
console.log(`SOURCES.md written: ${bikes.length} bikes, ${Object.keys(guide.meta.sourceIndex).length} guide sources`);
