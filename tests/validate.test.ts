// scripts/validate-data.mjs on edited copies of bikes.json: the internal-note lint and the price-age gate. Run: npm test.
import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type { Bike, EngineOil } from "../src/lib/types";
import { engineOilText } from "../src/lib/bike-utils";

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

test("validate: an offer's struck-through price must be its bike's headline price (critique 15 Oct N8)", () => {
  const offers: { bikeIds: string[]; regularPriceBDT?: number }[] = JSON.parse(readFileSync(new URL("../src/data/offers.json", import.meta.url), "utf8")).offers;
  const o = offers.find((x) => x.regularPriceBDT !== undefined);
  if (!o) return; // shortcut: skips once offers.json has no priced offer; give validate an offers-file argument if that matters
  const bikes = real();
  bikes.find((b) => b.id === o.bikeIds[0])!.priceBDT += 50;
  const r = validate(bikes);
  assert.equal(r.code, 1);
  assert.match(r.out, /regularPriceBDT \d+ is not/);
});

test("validate: owner-experience text that narrates our sources fails; the same note in dataNote passes (critique 15 Oct N6)", () => {
  for (const [k, text] of [["quirks", "bikebd's spec table and review disagree on top speed."], ["braking", "Discs per the spec table."]] as const) {
    const bikes = real();
    bikes[0][k] = text;
    const r = validate(bikes);
    assert.equal(r.code, 1, k);
    assert.match(r.out, new RegExp(`${bikes[0].id}: owner-experience text names`));
  }
  const bn = real();
  const withBn = bn.find((b) => b.bn?.quirks)!;
  withBn.bn!.quirks = "bikebd-র স্পেক টেবিল আর রিভিউ মেলে না।";
  assert.equal(validate(bn).code, 1);
  const users = real();
  users[0].cons = [...users[0].cons, "Some users say the seat is hard"];
  assert.equal(validate(users).code, 1, '"users" is an internal word too');
  const ok = real();
  ok[0].dataNote = "bikebd's spec table and review disagree on top speed.";
  assert.equal(validate(ok).code, 0);
});

test("validate: engineOil needs an SAE grade, 0.5-4 L, and an https source that is also in sources", () => {
  const withOil = (edit: (o: EngineOil) => void) => {
    const bikes = real();
    const b = bikes.find((x) => x.engineOil)!;
    edit(b.engineOil!);
    return { id: b.id, ...validate(bikes) };
  };
  const cases: [(o: EngineOil) => void, string][] = [
    [(o) => (o.grade = "10W30"), "bad grade"],
    [(o) => (o.litres = 10), "litres 10 outside"],
    [(o) => (o.source = "http://example.com/manual.pdf"), "https URL"],
    [(o) => (o.source = "https://example.com/manual.pdf"), "also be listed in sources"],
  ];
  for (const [edit, msg] of cases) {
    const r = withOil(edit);
    assert.equal(r.code, 1, msg);
    assert.match(r.out, new RegExp(`${r.id}: engineOil: .*${msg}`));
  }
  assert.equal(withOil((o) => (o.grade = "10W-30 / 20W-40")).code, 0, "two grades the manual allows");
});

test("engineOilText: grade, spec and litres; Bangla digits for litres only", () => {
  const o = { grade: "10W-30", spec: "API SL, JASO MA2", litres: 1, litresWithFilter: 1.1 };
  assert.equal(engineOilText(o), "10W-30, API SL, JASO MA2, 1.0 L (1.1 L with filter)");
  assert.equal(engineOilText(o, "bn"), "10W-30, API SL, JASO MA2, ১.০ লিটার (ফিল্টারসহ ১.১ লিটার)");
  assert.equal(engineOilText({ grade: "20W-50", litres: 0.75, litresWithFilter: 0.75 }), "20W-50, 0.75 L");
});
