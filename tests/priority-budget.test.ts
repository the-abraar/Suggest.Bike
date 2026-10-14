// More than three priorities raises budgets under ৳3 lakh by 20% (owner rule). Run: npm test.
import { test } from "node:test";
import assert from "node:assert/strict";
import { DEFAULT_ANSWERS, decodeAnswers, encodeAnswers, withPriorityBudget, type Answers } from "../src/lib/match";

const A = (o: Partial<Answers>): Answers => ({ ...DEFAULT_ANSWERS, ...o });
const four: Answers["priorities"] = ["mileage", "comfort", "resale", "safety"];

test("priority budget: >3 priorities under 3 lakh adds 20%", () => {
  assert.equal(withPriorityBudget(A({ budget: 200000, priorities: four })).budget, 240000);
  assert.equal(withPriorityBudget(A({ budget: 200000, priorities: four.slice(0, 3) })).budget, 200000);
  assert.equal(withPriorityBudget(A({ budget: 300000, priorities: four })).budget, 300000);
});

test("priority budget: more than three priorities survive the share URL", () => {
  const a = A({ priorities: four });
  assert.deepEqual(decodeAnswers(new URLSearchParams(encodeAnswers(a)))!.priorities, four);
});
