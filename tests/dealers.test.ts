import { test } from "node:test";
import assert from "node:assert/strict";
import { BIKES } from "../src/lib/bikes";
import { DEALERS } from "../src/lib/dealers";

test("dealer entries are keyed by real brands and carry a source and date", () => {
  const brands = new Set(BIKES.map((b) => b.brand));
  for (const [brand, d] of Object.entries(DEALERS)) {
    assert.ok(brands.has(brand), `dealers.json brand not in bikes: ${brand}`);
    assert.match(d.sourceUrl, /^https:\/\//, brand);
    assert.match(d.site, /^https:\/\//, brand);
    assert.match(d.checked, /^\d{4}-\d{2}-\d{2}$/, brand);
    if (d.hotline) assert.match(d.hotline, /^[+\d][\d -]{3,}$/, brand);
  }
});
