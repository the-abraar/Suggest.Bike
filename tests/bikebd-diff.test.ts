// BikeBD diff report (scripts/bikebd-diff.ts): parser pinned to a trimmed live page; report never guesses. No network.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { bikebdPrice, diff, report } from "../scripts/bikebd-diff";
import type { Bike } from "../scripts/price-refresh";

test("bikebd-diff: reads the JSON-LD Offer price; a changed layout yields null, never a guess", () => {
  assert.equal(bikebdPrice(readFileSync(new URL("fixtures/bikebd/tvs-radeon.html", import.meta.url), "utf8")), 120999);
  assert.equal(bikebdPrice("<html>Price in Bangladesh is Tk 120,999</html>"), null);
});

test("bikebd-diff: only bikebd sources, differences first, unreadable pages reported", async () => {
  const b = (id: string, priceBDT: number, priceSource: string): Bike => ({ id, brand: "X", model: id, status: "on-sale", priceBDT, priceAsOf: "2026-09", priceSource });
  const bikes = [b("same", 100, "https://www.bikebd.com/price/same"), b("up", 100, "https://bikebd.com/price/up"), b("gone", 100, "https://www.bikebd.com/price/gone"), b("official", 100, "https://bdhonda.com/x")];
  const pages: Record<string, string | number> = {
    "https://www.bikebd.com/price/same": '"@type":"Offer","price":"100"',
    "https://bikebd.com/price/up": '"@type":"Offer","price":"110"',
    "https://www.bikebd.com/price/gone": 404,
  };
  const rows = await diff(bikes, async (u) => pages[u] ?? 0);
  assert.deepEqual(rows.map((r) => [r.id, r.note]), [["same", "same"], ["up", "differs"], ["gone", "HTTP 404"]]);
  const md = report(rows, "2026-10-15");
  assert.ok(md.indexOf("`up`") < md.indexOf("`gone`") && md.indexOf("`gone`") < md.indexOf("`same`"));
  assert.match(md, /\| `up` \| 100 \(2026-09\) \| 110 \| 10\.0% \|/);
});
