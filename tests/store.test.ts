// Compare tray rules (pure helpers from src/lib/store.tsx). Run: npm test.
import { test } from "node:test";
import assert from "node:assert/strict";
import { BIKES } from "../src/lib/bikes";
import { MAX_COMPARE, compareIds, compareStart, storageFor, toggleIn } from "../src/lib/store";

const [a, b, c, d] = BIKES.map((x) => x.id);

test("compare: a 4th bike is refused, not swapped for the oldest (critique B6)", () => {
  assert.equal(MAX_COMPARE, 3);
  const full = toggleIn(toggleIn(toggleIn([], a), b), c);
  assert.deepEqual(full, [a, b, c]);
  assert.deepEqual(toggleIn(full, d), [a, b, c]);
  assert.deepEqual(toggleIn(full, b), [a, c]); // removing still works when full
});

test("compare: ids are de-duplicated, unknown ids dropped and the list capped (critique B7, B12)", () => {
  assert.deepEqual(compareIds([a, a]), [a]);
  assert.deepEqual(compareIds(["no-such-bike", a, ""]), [a]);
  assert.deepEqual(compareIds([a, b, c, d]), [a, b, c]);
});

test("compare: the URL decides what /compare/ shows; a shared link never replaces the visitor's tray (B7 + URL-first)", () => {
  // Empty tray: the link is shown and seeds the tray.
  assert.deepEqual(compareStart(`${a},${b}`, []), { ids: [a, b], ownsTray: true, seedTray: true, fromTray: false });
  // Visitor's own tray: the link is shown, the tray is left alone and the page may not edit it.
  assert.deepEqual(compareStart(`${a},${b}`, [c]), { ids: [a, b], ownsTray: false, seedTray: false, fromTray: false });
  // Same bikes as the tray: the page owns it.
  assert.equal(compareStart(`${a},${b}`, [a, b]).ownsTray, true);
  // No bikes in the URL: this tab's tray fills it, and the page writes them into the address.
  assert.deepEqual(compareStart(null, [a, b]), { ids: [a, b], ownsTray: true, seedTray: false, fromTray: true });
  assert.deepEqual(compareStart("", []), { ids: [], ownsTray: true, seedTray: false, fromTray: false });
  // Junk, repeats and a 4th id in a link are cleaned before anything is shown or stored.
  assert.deepEqual(compareStart(`${a},${a},no-such-bike,${b},${c},${d}`, []).ids, [a, b, c]);
});

test("compare: the tray is kept in sessionStorage, saved bikes in localStorage (stale pairs never return)", () => {
  const g = globalThis as Record<string, unknown>;
  const before = { s: g.sessionStorage, l: g.localStorage };
  const session = {}, local = {};
  Object.assign(g, { sessionStorage: session, localStorage: local });
  try {
    assert.equal(storageFor("sb-compare"), session);
    assert.equal(storageFor("sb-saved"), local);
  } finally {
    Object.assign(g, { sessionStorage: before.s, localStorage: before.l });
  }
});
