import { test } from "node:test";
import assert from "node:assert/strict";
import { BIKES } from "../src/lib/bikes";
import { DEFAULT_ANSWERS, encodeAnswers } from "../src/lib/match";
import { DEFAULT_COST_INPUT } from "../src/lib/cost";
import { langHref } from "../src/lib/site";
import { shareCard, shareMonthly, shareUrl } from "../src/lib/share";

const ANSWER_KEYS = [...new URLSearchParams(encodeAnswers(DEFAULT_ANSWERS)).keys()];
const latin = (s: string) => s.replace(/[০-৯]/g, (d) => String("০১২৩৪৫৬৭৮৯".indexOf(d)));

test("a shared quiz result link carries the bike id and ?src=share, none of the answers", () => {
  assert.ok(ANSWER_KEYS.includes("b") && ANSWER_KEYS.includes("h"), "fixture: answer keys come from encodeAnswers");
  for (const b of BIKES)
    for (const lang of ["en", "bn"] as const) {
      const u = new URL(shareUrl(b.id, lang));
      assert.equal(u.pathname, `${lang === "bn" ? "/bn" : ""}/r/${b.id}/`);
      assert.deepEqual([...u.searchParams], [["src", "share"]]);
      for (const k of ANSWER_KEYS) assert.ok(!u.searchParams.has(k), `${b.id}: ${k}`);
    }
  assert.equal(langHref("/r/bajaj-pulsar-n160/", "bn"), "/bn/r/bajaj-pulsar-n160/");
});

test("the share card shows only the bike and public numbers: no personal data reaches the image", () => {
  const personal = { patientName: "Rahim Uddin", phone: "01700000000", budget: 123457, height: "short", nid: "1990123456789" };
  for (const b of BIKES)
    for (const lang of ["en", "bn"] as const) {
      const card = shareCard(b, lang);
      // Same card whatever else rides along on the object: it reads bike fields only.
      assert.deepEqual(shareCard({ ...b, ...personal } as typeof b, lang), card);
      const text = latin(Object.values(card).join(" "));
      for (const v of Object.values(personal)) assert.ok(!text.includes(String(v)), `${b.id} ${lang}: ${v}`);
      // Every number is the bike's monthly cost, the km/day default, or part of its name (R15, 125, 2.0).
      const allowed = latin(`${b.brand} ${b.model}`);
      for (const n of text.match(/\d[\d,]*/g) ?? []) {
        const v = Number(n.replace(/,/g, ""));
        assert.ok(v === shareMonthly(b) || v === DEFAULT_COST_INPUT.kmPerDay || v === 1 || allowed.includes(n), `${b.id} ${lang}: ${n}`);
      }
    }
  const bn = shareCard(BIKES[0], "bn").title;
  assert.match(bn, /^আমার জন্য সেরা: .+ · মাসে ৳[০-৯,]+$/);
});
