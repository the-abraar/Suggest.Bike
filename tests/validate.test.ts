// scripts/validate-data.mjs on edited copies of bikes.json: the internal-note lint and the price-age gate. Run: npm test.
import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type { Bike } from "../src/lib/types";

const real = (): Bike[] => JSON.parse(readFileSync(new URL("../src/data/bikes.json", import.meta.url), "utf8"));
const validate = (bikes: Bike[], env: Record<string, string> = {}) => {
  const file = join(mkdtempSync(join(tmpdir(), "sb-validate-")), "bikes.json");
  writeFileSync(file, JSON.stringify(bikes));
  const r = spawnSync(process.execPath, [new URL("../scripts/validate-data.mjs", import.meta.url).pathname, file], { encoding: "utf8", env: { ...process.env, ...env } });
  return { code: r.status, out: r.stdout };
};

test("validate: the real data passes", () => assert.equal(validate(real()).code, 0));

test("validate: an internal note in public text fails; the same words in dataNote pass", () => {
  const bikes = real();
  const onSale = bikes.find((b) => b.status === "on-sale")!;
  onSale.variant = "Name as used by the user (unconfirmed)";
  const r = validate(bikes);
  assert.equal(r.code, 1);
  assert.match(r.out, new RegExp(`${onSale.id}: public text contains "user"`));

  const ok = real();
  ok[0].dataNote = "BikeBD data is a placeholder; TODO(owner) confirm with the user";
  assert.equal(validate(ok).code, 0);
});

test("validate: availability is only 'unconfirmed' on an on-sale bike", () => {
  const bikes = real();
  const used = bikes.find((b) => b.status === "used-only")!;
  used.availability = "unconfirmed";
  assert.match(validate(bikes).out, new RegExp(`${used.id}: bad availability`));
});

test("validate: old prices fail only when shown as checked (on sale); PRICE_FAIL_DAYS overrides the limit", () => {
  const bikes = real();
  const onSale = bikes.find((b) => b.status === "on-sale")!;
  const used = bikes.find((b) => b.status === "used-only")!;
  onSale.priceAsOf = used.priceAsOf = "2020-01";
  const r = validate(bikes);
  assert.equal(r.code, 1);
  assert.match(r.out, new RegExp(`- ${onSale.id}: price \\d+d old`));
  assert.doesNotMatch(r.out, new RegExp(`- ${used.id}:`));
  assert.match(r.out, new RegExp(`WARN ${used.id}: used-price estimate`));
  assert.equal(validate(bikes, { PRICE_FAIL_DAYS: "100000" }).code, 0);
  assert.match(validate(real(), { PRICE_FAIL_DAYS: "abc" }).out, /must be numbers/); // a typo must not switch the gate off
});
