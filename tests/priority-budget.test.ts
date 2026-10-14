// Any number of priorities, and the budget stays what the buyer chose (critique 15 Oct N1: a hidden 20% raise broke "never over budget"). Run: npm test.
import { test } from "node:test";
import assert from "node:assert/strict";
import { DEFAULT_ANSWERS, decodeAnswers, encodeAnswers, matchBikes, type Answers } from "../src/lib/match";

const A = (o: Partial<Answers>): Answers => ({ ...DEFAULT_ANSWERS, ...o });
const many: Answers["priorities"] = ["mileage", "comfort", "resale", "safety", "style"];

test("priority budget: more than three priorities never raise the budget", () => {
  for (const budget of [150000, 200000, 290000]) {
    const a = A({ budget, priorities: many, condition: "any" });
    const r = matchBikes(a, 1000);
    assert.ok(r.length > 0, `${budget}`);
    for (const m of r) assert.ok(m.cost <= budget, `${m.bike.id} ${m.cost} > ${budget}`);
  }
});

test("priority budget: more than three priorities survive the share URL", () => {
  const a = A({ priorities: many });
  assert.deepEqual(decodeAnswers(new URLSearchParams(encodeAnswers(a)))!.priorities, many);
});
