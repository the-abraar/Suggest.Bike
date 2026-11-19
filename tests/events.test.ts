import { test } from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { EVENTS } from "../src/lib/site";

const files = (dir: string): string[] =>
  readdirSync(dir, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? files(join(dir, e.name)) : /\.tsx?$/.test(e.name) ? [join(dir, e.name)] : []));
const src = files("src").map((f) => readFileSync(f, "utf8")).join("\n");

test("every track() event name is in EVENTS, and every EVENTS name is sent somewhere", () => {
  const used = new Set([...src.matchAll(/\btrack\("([^"]+)"\)/g)].map((m) => m[1]));
  for (const name of used) assert.ok((EVENTS as readonly string[]).includes(name), `track("${name}") is not in EVENTS`);
  for (const name of EVENTS) {
    // form-<kind> events are sent through track(`form-${kind}`) in FeedbackForm.
    const sent = used.has(name) || (name.startsWith("form-") && src.includes("track(`form-${kind}`)"));
    assert.ok(sent, `EVENTS lists "${name}" but nothing sends it`);
  }
});
