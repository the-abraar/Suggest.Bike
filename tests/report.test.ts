import { test } from "node:test";
import assert from "node:assert/strict";
import { reportBody, validateReport } from "../src/lib/report";

const now = new Date("2026-10-13");
const blank = { message: "", email: "" };

test("feedback needs a message and a sane email", () => {
  assert.deepEqual(validateReport("feedback", blank, now), ["message"]);
  assert.deepEqual(validateReport("feedback", { message: "hi", email: "" }, now), []);
  assert.deepEqual(validateReport("feedback", { message: "hi", email: "not-an-email" }, now), ["email"]);
  assert.deepEqual(validateReport("feedback", { message: "x".repeat(2001), email: "" }, now), ["message"]);
});

test("owner report ranges", () => {
  assert.deepEqual(validateReport("owner", { ...blank, onRoadBDT: "215000", kmpl: "48", month: "2026-09" }, now), []);
  assert.deepEqual(validateReport("owner", { ...blank, onRoadBDT: "2150" }, now), ["onRoad"]);
  assert.deepEqual(validateReport("owner", { ...blank, kmpl: "300" }, now), ["kmpl"]);
  assert.deepEqual(validateReport("owner", { ...blank, kmpl: "45", month: "2026-12" }, now), ["month"]); // future
  assert.deepEqual(validateReport("owner", blank, now), ["empty"]);
});

test("body carries bike and fields as plain text", () => {
  const b = reportBody("owner", { ...blank, onRoadBDT: "215000", kmpl: "48" }, { id: "x", name: "Bike X" });
  assert.match(b, /Bike: Bike X \(x\)/);
  assert.match(b, /On-road price paid \(BDT\): 215000/);
  assert.match(b, /Real mileage \(km\/l\): 48/);
});
