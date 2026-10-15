// Looks follow-up: a chosen look type steers the "style" priority. Run: npm test.
import { test } from "node:test";
import assert from "node:assert/strict";
import { BIKES } from "../src/lib/bikes";
import { DEFAULT_ANSWERS, LOOKS, LOOK_IDS, decodeAnswers, encodeAnswers, matchBikes, type Answers, type Look } from "../src/lib/match";

const A = (o: Partial<Answers>): Answers => ({ ...DEFAULT_ANSWERS, budget: 600000, use: "mixed", priorities: ["style"], ...o });
const cats = (l: Look) => LOOKS[l] as string[];

test("looks: every look maps to categories that exist in bikes.json", () => {
  const present = new Set(BIKES.map((b) => b.category));
  for (const l of LOOK_IDS) assert.ok(cats(l).every((c) => present.has(c as never)), l);
});

test("looks: picking a look fills the top results with that shape", () => {
  for (const l of ["sport", "naked", "cruiser", "classic", "adventure"] as Look[]) {
    const top = matchBikes(A({ looks: [l] }), 3);
    assert.ok(top.every((m) => cats(l).includes(m.bike.category)), `${l}: ${top.map((m) => m.bike.id)}`);
  }
});

test("looks: several looks keep results inside the chosen shapes", () => {
  const top = matchBikes(A({ looks: ["cruiser", "classic"] }), 4);
  assert.ok(top.every((m) => ["cruiser", "classic"].includes(m.bike.category)), String(top.map((m) => m.bike.id)));
});

test("looks: no look, or looks without the Looks priority, keep the old ranking", () => {
  const ids = (a: Answers) => matchBikes(a).map((m) => m.bike.id + m.score);
  assert.deepEqual(ids(A({ looks: [] })), ids(A({})));
  const plain = A({ priorities: ["mileage"] });
  assert.deepEqual(ids({ ...plain, looks: ["cruiser"] }), ids(plain));
});

test("looks: share URL round-trips, old links decode to no look, junk is dropped", () => {
  const a = A({ looks: ["naked", "adventure"] });
  assert.deepEqual(decodeAnswers(new URLSearchParams(encodeAnswers(a)))!.looks, ["naked", "adventure"]);
  assert.deepEqual(decodeAnswers(new URLSearchParams("b=200000&pr=style"))!.looks, []);
  assert.deepEqual(decodeAnswers(new URLSearchParams("b=200000&pr=style&lk=classic.x.<b>.classic"))!.looks, ["classic"]);
});
