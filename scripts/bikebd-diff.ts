// Re-reads every bikes.json price whose priceSource is a bikebd.com page and prints a Markdown diff report.
// Changes no data: a person checks each difference at its source (and an official page first) before editing bikes.json.
// Honours robots.txt, one request every 2 s (liveGet from price-refresh). Usage: tsx scripts/bikebd-diff.ts [--out report.md]
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { liveGet, type Bike, type Get } from "./price-refresh";

const UA = "suggest-bike-bikebd-diff/1 (+https://suggest.bike; monthly price check, one request every 2 s)";

/** The schema.org Offer price BikeBD puts in each price page's JSON-LD; null when the layout changed. */
export const bikebdPrice = (html: string) => {
  const m = html.match(/"@type":"Offer"[^}]*?"price":"(\d+)"/);
  return m ? Number(m[1]) : null;
};

export type Row = { id: string; url: string; ours: number; asOf: string; theirs: number | null; note: string };

export async function diff(bikes: Bike[], get: Get): Promise<Row[]> {
  const rows: Row[] = [];
  for (const b of bikes.filter((x) => /(^|\.)bikebd\.com$/.test(new URL(x.priceSource).hostname))) {
    const page = await get(b.priceSource);
    const theirs = typeof page === "string" ? bikebdPrice(page) : null;
    const note = typeof page === "number" ? (page ? `HTTP ${page}` : "network error or robots.txt") : theirs === null ? "no Offer price on the page (used-only page or new layout)" : theirs === b.priceBDT ? "same" : "differs";
    rows.push({ id: b.id, url: b.priceSource, ours: b.priceBDT, asOf: b.priceAsOf, theirs, note });
  }
  return rows;
}

export function report(rows: Row[], date: string) {
  const pct = (r: Row) => (r.theirs ? `${(((r.theirs - r.ours) / r.ours) * 100).toFixed(1)}%` : "");
  const line = (r: Row) => `| \`${r.id}\` | ${r.ours} (${r.asOf}) | ${r.theirs ?? "-"} | ${pct(r)} | ${r.note} | ${r.url} |`;
  const rank = (r: Row) => (r.note === "differs" ? 0 : r.note === "same" ? 2 : 1); // differences first, matches last
  const sorted = [...rows].sort((a, b) => rank(a) - rank(b));
  const n = (k: string) => rows.filter((r) => r.note === k).length;
  return [
    `# BikeBD price diff (${date})`,
    "",
    `${rows.length} bikes cite a bikebd.com price page: ${n("differs")} differ, ${n("same")} match, ${rows.length - n("differs") - n("same")} could not be read. Nothing was changed; re-check each difference at an official page first, then update \`priceBDT\`, \`priceAsOf\` and \`priceSource\` together.`,
    "",
    "| Bike | Ours (as of) | BikeBD | Change | Status | Page |",
    "|---|---|---|---|---|---|",
    ...sorted.map(line),
    "",
  ].join("\n");
}

async function main() {
  const argv = process.argv.slice(2);
  const out = argv.includes("--out") ? argv[argv.indexOf("--out") + 1] : undefined;
  const bikes: Bike[] = JSON.parse(readFileSync(new URL("../src/data/bikes.json", import.meta.url), "utf8"));
  const md = report(await diff(bikes, liveGet(UA)), new Date().toISOString().slice(0, 10));
  if (out) writeFileSync(out, md); else process.stdout.write(md);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) main().catch((e) => { console.error(e); process.exit(1); });
