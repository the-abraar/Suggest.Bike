// Experimental marketplace preview: fitment rules, cart math and catalogue coverage of bikes.json. Run: npm test.
import { test } from "node:test";
import assert from "node:assert/strict";
import bikes from "../src/data/bikes.json";
import type { Bike } from "../src/lib/types";
import { PRODUCTS, getProduct } from "../src/lib/experimental/catalogue";
import { bikesThatFit, bottlesFor, fitOf, picksFor, toFitBike } from "../src/lib/experimental/fitment";
import { DELIVERY, DIVISIONS, MAX_LINES, MAX_QTY, addLine, bdMobile, cleanLines, count, removeLine, setQty, totals, zoneFor } from "../src/lib/experimental/cart";
import robots from "../src/app/robots";
import sitemap from "../src/app/sitemap";

const ALL = (bikes as unknown as Bike[]).map(toFitBike);
const find = (pred: (b: (typeof ALL)[number]) => boolean, what: string) => {
  const b = ALL.find(pred);
  assert.ok(b, `fixture: a bike with ${what} exists in bikes.json`);
  return b!;
};
const P = (id: string) => {
  const p = getProduct(id);
  assert.ok(p, id);
  return p!;
};

test("catalogue: 35-45 products, unique ids, every price positive", () => {
  assert.ok(PRODUCTS.length >= 35 && PRODUCTS.length <= 45, `${PRODUCTS.length}`);
  assert.equal(new Set(PRODUCTS.map((p) => p.id)).size, PRODUCTS.length);
  for (const p of PRODUCTS) assert.ok(p.price > 0 && p.why && p.specs.length, p.id);
});

test("catalogue: 0.8 L and 1 L oil in every grade bikes.json names, and a tyre for every size", () => {
  for (const b of ALL) {
    for (const g of b.oil?.grade.split("/").map((s) => s.trim()) ?? []) {
      for (const l of [0.8, 1]) assert.ok(PRODUCTS.some((p) => p.fit?.type === "oil" && p.fit.grade === g && p.fit.litres === l), `${b.id}: ${g} ${l} L`);
    }
    for (const end of ["front", "rear"] as const) {
      const size = b.tyres?.[end];
      if (size) assert.ok(PRODUCTS.some((p) => p.fit?.type === "tyre" && p.fit.sizes.includes(size)), `${b.id}: ${end} ${size}`);
    }
  }
});

test("fitment: oil fits by the manual's grade only, with whole bottles suggested", () => {
  const b = find((x) => x.fuel !== "electric" && x.oil?.grade === "10W-30" && x.oil.litres === 1, "10W-30, 1 L");
  assert.equal(fitOf(P("oil-10w30-1l"), b).status, "fits");
  assert.match(fitOf(P("oil-10w30-1l"), b).label, /needs 1\.0 L/);
  assert.equal(fitOf(P("oil-20w50-1l"), b).status, "no");
  const { picks } = picksFor(b, PRODUCTS);
  assert.equal(picks[0].product.id, "oil-10w30-1l"); // 1 x 1 L beats 2 x 0.8 L (0.6 L left over)
  assert.equal(picks[0].qty, 1);
  assert.equal(bottlesFor(1.25, 0.8), 2);
  assert.equal(bottlesFor(1.0, 1), 1);
  assert.equal(bottlesFor(0.8, 0.8), 1);
  // "either grade" manuals match both
  assert.equal(fitOf(P("oil-20w50-1l"), { ...b, oil: { ...b.oil!, grade: "10W-30 / 20W-50" } }).status, "fits");
});

test("fitment: no engineOil means 'not confirmed', never a guessed grade; EVs need none", () => {
  const b = find((x) => x.fuel !== "electric" && !x.oil, "no engineOil");
  for (const p of PRODUCTS.filter((p) => p.cat === "oil")) {
    assert.deepEqual(fitOf(p, b), { status: "unknown", label: "Oil grade not confirmed for this bike yet" });
  }
  const { picks, oilNote } = picksFor(b, PRODUCTS);
  assert.ok(!picks.some((x) => x.product.cat === "oil"));
  assert.match(oilNote!, /not confirmed/);
  const ev = find((x) => x.fuel === "electric", "electric");
  assert.equal(fitOf(P("oil-10w30-1l"), ev).status, "no");
  assert.equal(fitOf(P("spark-plug"), ev).status, "no");
  assert.equal(fitOf(P("air-filter"), b).status, "fits");
});

test("fitment: tyres match the bike's front and rear sizes", () => {
  const b = find((x) => x.tyres?.front === "100/80-17" && x.tyres.rear === "130/70-17", "100/80-17 + 130/70-17");
  const narrow = fitOf(P("tyre-street-17-narrow"), b);
  assert.equal(narrow.status, "fits");
  assert.deepEqual(narrow.sizes, [{ end: "front", size: "100/80-17" }]);
  assert.deepEqual(fitOf(P("tyre-street-17-wide"), b).sizes, [{ end: "rear", size: "130/70-17" }]);
  assert.equal(fitOf(P("tyre-scooter"), b).status, "no");
  const tyres = picksFor(b, PRODUCTS).picks.filter((x) => x.product.cat === "tyres");
  assert.deepEqual(tyres.map((x) => [x.product.id, x.size]), [["tyre-street-17-narrow", "100/80-17"], ["tyre-street-17-wide", "130/70-17"]]);
  assert.ok(bikesThatFit(P("tyre-street-17-narrow"), ALL).some((x) => x.id === b.id));
  const noTyres = find((x) => !x.tyres, "no tyre sizes");
  assert.equal(fitOf(P("tyre-street-17-narrow"), noTyres).status, "unknown");
});

test("fitment: disc pads vs drum shoes follow each end's brake", () => {
  const disc = find((x) => x.brakes.front === "disc" && x.brakes.rear === "drum", "front disc, rear drum");
  assert.equal(fitOf(P("pads-front-disc"), disc).status, "fits");
  assert.equal(fitOf(P("shoes-front-drum"), disc).status, "no");
  assert.equal(fitOf(P("shoes-rear-drum"), disc).status, "fits");
  assert.equal(fitOf(P("pads-rear-disc"), disc).status, "no");
  const drum = find((x) => x.brakes.front === "drum" && x.brakes.rear === "drum", "drum/drum");
  const parts = picksFor(drum, PRODUCTS).picks.map((x) => x.product.id);
  assert.ok(parts.includes("shoes-front-drum") && parts.includes("shoes-rear-drum") && !parts.some((id) => id.startsWith("pads-")));
  const scooter = find((x) => x.category === "scooter" && x.fuel !== "electric", "petrol scooter");
  assert.equal(fitOf(P("chain-kit"), scooter).status, "no");
  assert.equal(fitOf(P("helmet-full-face"), scooter).status, "any");
});

test("cart: add merges same product and size, qty capped, set below 1 removes", () => {
  let c = addLine([], "oil-10w30-1l");
  c = addLine(c, "oil-10w30-1l", 2);
  c = addLine(c, "tyre-scooter", 1, "90/90-12");
  c = addLine(c, "tyre-scooter", 1, "100/80-12");
  assert.deepEqual(c, [{ id: "oil-10w30-1l", qty: 3 }, { id: "tyre-scooter", size: "90/90-12", qty: 1 }, { id: "tyre-scooter", size: "100/80-12", qty: 1 }]);
  assert.equal(count(c), 5);
  assert.equal(setQty(c, "oil-10w30-1l", undefined, 99)[0].qty, MAX_QTY);
  assert.equal(setQty(c, "oil-10w30-1l", undefined, 0).length, 2);
  assert.deepEqual(removeLine(c, "tyre-scooter", "90/90-12").map((l) => l.size), [undefined, "100/80-12"]);
  let full: ReturnType<typeof addLine> = [];
  for (let i = 0; i < MAX_LINES + 5; i++) full = addLine(full, `x${i}`);
  assert.equal(full.length, MAX_LINES);
});

test("cart: subtotal, delivery (Dhaka 60, outside 120, none when empty) and total", () => {
  const price = (id: string) => getProduct(id)?.price;
  const c = addLine(addLine([], "oil-10w30-1l", 2), "chain-lube");
  const sub = 2 * P("oil-10w30-1l").price + P("chain-lube").price;
  assert.deepEqual(totals(c, price, "dhaka"), { subtotal: sub, delivery: 60, total: sub + 60 });
  assert.deepEqual(totals(c, price, "outside"), { subtotal: sub, delivery: 120, total: sub + 120 });
  assert.deepEqual(totals([], price, "outside"), { subtotal: 0, delivery: 0, total: 0 });
  assert.deepEqual(DELIVERY, { dhaka: 60, outside: 120 });
  assert.equal(zoneFor("Dhaka"), "dhaka");
  assert.equal(zoneFor("Gazipur"), "outside");
});

test("cart: stored lines are cleaned (corrupt, unknown, bad size), never throw", () => {
  const known = (id: string, size?: string) => {
    const p = getProduct(id);
    return !!p && (p.fit?.type === "tyre" ? !!size && p.fit.sizes.includes(size) : size === undefined);
  };
  assert.deepEqual(cleanLines("nope", known), []);
  assert.deepEqual(cleanLines(null, known), []);
  assert.deepEqual(
    cleanLines([{ id: "chain-lube", qty: 2 }, { id: "chain-lube", qty: 1 }, { id: "gone", qty: 1 }, { id: "tyre-scooter", size: "999", qty: 1 }, { id: "tyre-scooter", qty: 1 }, 5, { id: "u-lock", qty: "2" }, { id: "u-lock", qty: -4 }], known),
    [{ id: "chain-lube", qty: 3 }, { id: "u-lock", qty: 1 }],
  );
});

test("checkout: BD mobile numbers 01[3-9] + 8 digits, 64 districts", () => {
  assert.equal(bdMobile("01712345678"), "01712345678");
  assert.equal(bdMobile("+880 1712-345678"), "01712345678");
  assert.equal(bdMobile("8801312345678"), "01312345678");
  for (const bad of ["01212345678", "0171234567", "017123456789", "1712345678", "0171234567a", ""]) assert.equal(bdMobile(bad), null, bad);
  assert.equal(Object.values(DIVISIONS).flat().length, 64);
  assert.ok(DIVISIONS.Dhaka.includes("Dhaka"));
});

test("experimental pages stay out of search: robots disallows, sitemap omits", () => {
  const rules = [robots().rules].flat();
  assert.ok(rules.some((r) => [r?.disallow].flat().includes("/experimental/")));
  assert.ok(!sitemap().some((e) => e.url.includes("/experimental")));
});
