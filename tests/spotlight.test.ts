// Spotlights read bikes.json at load time; these catch a renamed bike id, a repeated pick or a bad approved comment.
import { test } from "node:test";
import assert from "node:assert/strict";
import { SPOTLIGHTS } from "../src/lib/spotlight-posts";
import { COMMENTS } from "../src/lib/comments";
import { getBike } from "../src/lib/bikes";

test("spotlights: real bikes, unique slugs, never the same bike or category twice", () => {
  assert.equal(new Set(SPOTLIGHTS.map((s) => s.slug)).size, SPOTLIGHTS.length, "duplicate slug");
  assert.equal(new Set(SPOTLIGHTS.map((s) => s.bike)).size, SPOTLIGHTS.length, "bike repeated before all are covered");
  for (const w of new Set(SPOTLIGHTS.map((s) => s.week))) {
    const week = SPOTLIGHTS.filter((s) => s.week === w);
    assert.equal(week.length, 5, `week ${w} should have 5 bikes`);
    assert.equal(new Set(week.map((s) => s.wins[0])).size, 5, `week ${w} repeats a category`);
  }
  for (const s of SPOTLIGHTS) {
    assert.ok(getBike(s.bike) && getBike(s.rival), `${s.slug}: unknown bike or rival`);
    const text = JSON.stringify([s.title, s.summary, s.why, s.who, s.tradeoffs]);
    assert.doesNotMatch(text, /undefined|NaN|null/, s.slug);
  }
});

test("approved comments point at a spotlight and carry no email", () => {
  const slugs = new Set(SPOTLIGHTS.map((s) => s.slug));
  for (const c of COMMENTS) {
    assert.deepEqual(Object.keys(c).sort(), ["date", "name", "post", "text"], "only post, name, date, text (never email)");
    assert.ok(slugs.has(c.post), `comment on missing post ${c.post}`);
    assert.match(c.date, /^\d{4}-\d{2}-\d{2}$/);
    assert.ok(c.name.trim() && c.text.trim());
    assert.doesNotMatch(c.name + c.text, /[^\s@]+@[^\s@]+\.[^\s@]+/, "email address in a public comment");
  }
});
