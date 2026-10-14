// A typo in `related` would silently drop the link on the page, so every slug must exist. Run: npm test.
import { test } from "node:test";
import assert from "node:assert/strict";
import { POSTS } from "../src/lib/maintenance-posts";

test("posts: every related slug points at a real post", () => {
  const slugs = new Set(POSTS.map((p) => p.slug));
  for (const p of POSTS) for (const r of p.related ?? []) assert.ok(slugs.has(r), `${p.slug} links to missing post "${r}"`);
});
