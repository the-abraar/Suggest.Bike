import { test } from "node:test";
import assert from "node:assert/strict";
import { formRoute, reportBody, validateReport } from "../src/lib/report";
import { FORM_ENDPOINT } from "../src/lib/site";

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

test("comment needs a name (no email in it), an email and text; body names the post", () => {
  const ok = { message: "Good bike", email: "a@b.co", name: "Rafi" };
  assert.deepEqual(validateReport("comment", ok, now), []);
  assert.deepEqual(validateReport("comment", { ...ok, email: "" }, now), ["emailNeeded"]);
  assert.deepEqual(validateReport("comment", { ...ok, email: "nope" }, now), ["email"]);
  assert.deepEqual(validateReport("comment", { ...ok, name: " " }, now), ["name"]);
  assert.deepEqual(validateReport("comment", { ...ok, name: "a@b.co" }, now), ["name"]);
  assert.deepEqual(validateReport("comment", { ...ok, message: "" }, now), ["message"]);
  const b = reportBody("comment", ok, { id: "some-post", name: "Some post" });
  assert.match(b, /Post: Some post \(some-post\)/);
  assert.match(b, /Name: Rafi/);
});

test("comments go only to the form service the privacy page names; without it they are closed, never mailed", () => {
  assert.equal(formRoute("comment", ""), "closed");
  assert.equal(formRoute("feedback", ""), "mailto");
  assert.equal(formRoute("owner", ""), "mailto");
  for (const k of ["comment", "feedback", "owner"] as const) assert.equal(formRoute(k, "https://formspree.io/f/abc"), "endpoint");
  // LegalView's privacy text names Formspree as the processor of commenters' names and emails: change both together.
  assert.ok(FORM_ENDPOINT === "" || new URL(FORM_ENDPOINT).hostname === "formspree.io", `FORM_ENDPOINT ${FORM_ENDPOINT} is not Formspree; update the privacy page`);
});
