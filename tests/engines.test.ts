// Self-tests for the pure logic in src/lib. Run: npm test (node:test via tsx).
import { test } from "node:test";
import assert from "node:assert/strict";
import { BIKES, HAS_NETWORKS, getBike } from "../src/lib/bikes";
import {
  matchBikes,
  anyNewFits,
  cheapestNew,
  cheapestPicks,
  stretchPicks,
  emiBudget,
  emiFor,
  onRoadPrice,
  encodeAnswers,
  decodeAnswers,
  DEFAULT_ANSWERS,
  EMI_FLAT_RATE,
  STRETCH,
  type Answers,
} from "../src/lib/match";
import { emiMonthly, registrationFor, yearlyRetention, defaultUsedPrice, ownershipCost, DEFAULT_COST_INPUT, type CostBike } from "../src/lib/cost";
import { loanEmi, monthsToGoal, progress } from "../src/lib/fund";
import { normaliseText, parseListingText, extractPrice, extractKm, extractYear } from "../src/lib/listingcheck/text";
import { assess, emptyListing, BASE_SCORE } from "../src/lib/listingcheck/engine";
import { valueIndex, rankListings } from "../src/lib/listingcheck/compare";
import { priceBand, valueAtAge, kmAdjust } from "../src/lib/listingcheck/price";
import { analyseSamples } from "../src/lib/usedcheck/audio";
import { negotiate, deduction } from "../src/lib/negotiate/parts";

const A = (o: Partial<Answers> = {}): Answers => ({ ...DEFAULT_ANSWERS, ...o });
const bike = (id: string) => getBike(id)! as unknown as CostBike & typeof BIKES[number];

// ---------------- match engine ----------------
test("match: results are sorted, bounded and within the on-road budget", () => {
  const a = A({ budget: 200000 });
  const r = matchBikes(a, 6);
  assert.ok(r.length > 0 && r.length <= 6);
  for (let i = 0; i < r.length; i++) {
    assert.ok(r[i].score >= 0 && r[i].score <= 99 && ["great", "good", "possible"].includes(r[i].band));
    if (i) assert.ok(r[i - 1].score >= r[i].score);
  }
  assert.equal(matchBikes(a, 2).length, 2);
});
test("match: on-road ceiling — nothing over budget outside stretch; stretch is ≤10% over and capped at 2", () => {
  for (const budget of [120000, 180000, 250000, 400000]) {
    const a = A({ budget, condition: "any" });
    for (const m of matchBikes(a, 1000)) {
      assert.ok(m.cost <= budget, `${m.bike.id} ${m.cost} > ${budget}`);
      if (!m.used && m.bike.status === "on-sale") assert.equal(m.onRoad, onRoadPrice(m.bike));
    }
    const s = stretchPicks(a);
    assert.ok(s.length <= 2);
    for (const m of s) assert.ok(m.cost > budget && m.cost <= budget * (1 + STRETCH));
  }
  // A bike whose ex-showroom price fits but whose on-road price does not is excluded.
  const b = BIKES.find((x) => x.status === "on-sale")!;
  assert.ok(!matchBikes(A({ budget: b.priceBDT, gearless: "either" }), 1000).some((m) => m.bike.id === b.id && !m.used));
});
test("match: cheaper bike is not penalised (score is independent of how much budget is left)", () => {
  const lo = matchBikes(A({ budget: 150000 }), 1000);
  const hi = new Map(matchBikes(A({ budget: 600000 }), 1000).map((m) => [m.bike.id, m.score]));
  assert.ok(lo.length > 0);
  for (const m of lo) if (!m.used) assert.equal(hi.get(m.bike.id), m.score, m.bike.id);
});
test("match: EMI budget math (0% up to 12 months, flat interest beyond) and instalment round-trip", () => {
  assert.equal(emiBudget(50000, 10000, 12), 170000);
  assert.equal(emiBudget(0, 10000, 3), 30000);
  assert.equal(emiBudget(0, 12000, 24), Math.round(288000 / (1 + EMI_FLAT_RATE * 2)));
  assert.ok(emiBudget(0, 10000, 36) < 360000);
  assert.equal(emiFor(170000, 50000, 12), 10000);
  assert.equal(emiFor(10000, 50000, 12), 0);
  const budget = emiBudget(40000, 9000, 24);
  assert.ok(emiFor(budget, 40000, 24) <= 9010);
});
test("match: empty state — budget below cheapest on-road returns no matches but cheapest fallbacks with how far over", () => {
  const a = A({ budget: 30000 });
  assert.equal(matchBikes(a).length, 0);
  const f = cheapestPicks(a, 3);
  assert.equal(f.length, 3);
  assert.ok(f.every((m, i) => m.cost > a.budget && (!i || f[i - 1].cost <= m.cost)));
  assert.ok(/over your budget/.test(f[0].warnings[0].en));
  const used = cheapestPicks(A({ budget: 30000, condition: "any" }), 3);
  assert.ok(used[0].cost < f[0].cost);
});
test("match: 2-stroke / old classic is never the top pick for commute or rideshare, but can be for fun", () => {
  for (const use of ["commute", "rideshare"] as const)
    for (const budget of [90000, 130000, 200000]) {
      const top = matchBikes(A({ budget, use, condition: "any" }), 1)[0];
      if (top) assert.ok(top.bike.engine.stroke !== 2 && top.bike.status !== "used-only", `${use} ${budget}: ${top.bike.id}`);
    }
  const rx = matchBikes(A({ budget: 130000, use: "commute", condition: "any" }), 1000).find((m) => m.bike.engine.stroke === 2);
  if (rx) assert.ok(rx.warnings.some((w) => /2-stroke/.test(w.en)) || rx.warnings.length === 2);
});
test("match: height uses seat + weight; tall riders are never warned", () => {
  const warned = (h: Answers["height"]) => matchBikes(A({ budget: 900000, height: h }), 1000).filter((m) => m.warnings.some((w) => /tiptoes/.test(w.en))).length;
  assert.equal(warned("tall"), 0);
  assert.ok(warned("short") > warned("medium"));
});
test("match: gearless=no never returns scooters; yes returns only scooters", () => {
  assert.ok(matchBikes(A({ gearless: "no", budget: 400000 }), 50).every((m) => m.bike.category !== "scooter"));
  const yes = matchBikes(A({ gearless: "yes", budget: 400000 }), 50);
  assert.ok(yes.length > 0 && yes.every((m) => m.bike.category === "scooter"));
});
test("match: new-only never returns used-only or used examples", () => {
  assert.ok(matchBikes(A({ condition: "new", budget: 300000 }), 50).every((m) => m.bike.status === "on-sale" && !m.used));
});
test("match: bigger budget never shrinks the candidate pool; zero budget is empty", () => {
  const n = (b: number) => matchBikes(A({ budget: b }), 1000).length;
  assert.equal(n(0), 0);
  assert.ok(n(100000) <= n(150000) && n(150000) <= n(300000) && n(300000) <= n(900000));
  assert.equal(anyNewFits(A({ budget: 1 })), false);
  assert.equal(anyNewFits(A({ budget: 9e6 })), true);
});
test("match: H6 persona (1 lakh, used OK, commute) does not put a 2-stroke or old classic at #1", () => {
  const top = matchBikes(A({ budget: 100000, condition: "any", use: "commute", experience: "first" }), 6);
  assert.ok(top.length > 0);
  assert.notEqual(top[0].bike.engine.stroke, 2);
  assert.notEqual(top[0].bike.status, "used-only");
});
test("match: priorities and use change the ranking (mileage vs performance)", () => {
  const eco = matchBikes(A({ budget: 400000, use: "rideshare", priorities: ["mileage"] }), 1)[0].bike;
  const fun = matchBikes(A({ budget: 400000, use: "fun", priorities: ["performance"] }), 1)[0].bike;
  assert.ok(eco.mileageKmpl[0] > fun.mileageKmpl[0]);
  assert.ok(fun.powerPS > eco.powerPS);
});
test("match: HAS_NETWORKS off => 'where' answer is ignored (same ranking, no network warnings)", { skip: HAS_NETWORKS }, () => {
  const ids = (w: Answers["where"]) => matchBikes(A({ budget: 300000, where: w }), 10).map((m) => `${m.bike.id}:${m.score}`);
  assert.deepEqual(ids("village"), ids("dhaka"));
  assert.deepEqual(ids("town"), ids("dhaka"));
  for (const m of matchBikes(A({ budget: 300000, where: "village" }), 50)) {
    assert.ok(!m.warnings.some((w) => /network/i.test(w.en)));
    assert.ok(!m.reasons.some((w) => /showrooms and workshops/i.test(w.en)));
  }
});
test("match: cheapestNew respects gearbox; encode/decode round-trips; bad params fall back", () => {
  const c = cheapestNew({ gearless: "no" });
  assert.ok(c && c.category !== "scooter");
  assert.ok(BIKES.filter((b) => b.status === "on-sale" && b.category !== "scooter").every((b) => b.priceBDT >= c!.priceBDT));
  const a = A({ budget: 175000, use: "highway", priorities: ["safety", "comfort"], where: "town" });
  assert.deepEqual(decodeAnswers(new URLSearchParams(encodeAnswers(a))), a);
  assert.equal(decodeAnswers(new URLSearchParams("")), null);
  const d = decodeAnswers(new URLSearchParams("b=100000&u=nonsense&pr=safety.x.mileage.comfort.style"))!;
  assert.equal(d.use, DEFAULT_ANSWERS.use);
  assert.deepEqual(d.priorities, ["safety", "mileage", "comfort"]);
});

// ---------------- cost / EMI / BRTA ----------------
test("emiMonthly: known answers, rounds up to ৳10, zero price", () => {
  assert.equal(emiMonthly(120000, 12), 10000);
  assert.equal(emiMonthly(100001, 12), 8340); // 8333.4 -> 8340
  assert.equal(emiMonthly(0), 0);
  assert.ok(emiMonthly(200000, 6) > emiMonthly(200000, 12));
});
test("loanEmi: zero-interest split, known answer, monotonic, guards", () => {
  assert.equal(loanEmi(120000, 0, 12), 10000);
  assert.ok(Math.abs(loanEmi(100000, 12, 12) - 8884.88) < 0.01); // standard 1%/month, 12 months
  assert.ok(loanEmi(100000, 15, 24) > loanEmi(100000, 10, 24));
  assert.ok(loanEmi(100000, 12, 12) * 12 > 100000);
  assert.equal(loanEmi(0, 10, 12), 0);
  assert.equal(loanEmi(1000, 10, 0), 0);
});
test("fund: monthsToGoal and progress", () => {
  assert.equal(monthsToGoal(100000, 100000, 0), 0);
  assert.equal(monthsToGoal(100000, 0, 10000), 10);
  assert.equal(monthsToGoal(100000, 0, 0), null);
  assert.ok(monthsToGoal(100000, 0, 10000, 8)! <= 10);
  assert.equal(progress(5, 0), 0);
  assert.equal(progress(150, 100), 1);
});
test("BRTA: registrationFor picks the right band and totals grow with size", () => {
  assert.equal(registrationFor(100).totalBDT, 10664);
  assert.equal(registrationFor(101).totalBDT, 11764);
  assert.equal(registrationFor(0).ccMax, 100);
  assert.equal(registrationFor(99999).ccMax, 375); // above the top band falls back to the last
  for (const cc of [80, 110, 160, 300]) assert.ok(registrationFor(cc).totalBDT10yr > registrationFor(cc).totalBDT);
});
test("cost: retention curve known answers and used-price default", () => {
  const s = (resale: number) => ({ scores: { resale } }) as unknown as CostBike;
  assert.ok(Math.abs(yearlyRetention(s(5)) - 0.86) < 1e-9);
  assert.ok(Math.abs(yearlyRetention(s(10)) - 0.92) < 1e-9);
  const stub = { status: "on-sale", priceBDT: 200000, scores: { resale: 5 } } as unknown as CostBike;
  assert.equal(defaultUsedPrice(stub), 125000); // 200000*0.86^3 = 127,219 -> nearest 5,000
  assert.equal(defaultUsedPrice({ ...stub, usedPrice: { y1: null, y3: 111000, asOf: "", sources: [] } } as CostBike), 111000);
  assert.equal(defaultUsedPrice({ ...stub, status: "used-only" } as CostBike), 200000);
});
test("cost: ownershipCost is monotonic in km, years, fuel price; paperwork rules hold", () => {
  const b = bike("bajaj-platina-100");
  const c = (o = {}) => ownershipCost(b, { ...DEFAULT_COST_INPUT, ...o });
  assert.ok(c({ kmPerDay: 50 }).total > c({ kmPerDay: 25 }).total);
  assert.ok(c({ years: 5 }).total > c({ years: 3 }).total);
  assert.ok(c({ fuelPrice: 140 }).fuel > c({ fuelPrice: 120 }).fuel);
  assert.ok(c({ insurance: true }).total > c({ insurance: false }).total);
  assert.equal(c({ taxPlan: "10yr" }).paperwork, registrationFor(b.engine.cc).totalBDT10yr);
  assert.equal(c({ taxPlan: "2yr", years: 2 }).paperwork, registrationFor(b.engine.cc).totalBDT);
  assert.equal(c({ includeDepreciation: false }).depreciation, 0);
  const x = c();
  assert.ok(Math.abs(x.perMonth * 36 - x.total) < 1e-6);
  // used: no registration cost, hidden-repair reserve = 5% (air-cooled) of what you pay
  const u = c({ used: true });
  assert.equal(u.paperwork, 0);
  assert.equal(u.hiddenRepairs, u.price * 0.05);
  assert.ok(u.price < b.priceBDT);
  assert.equal(u.hiddenRepairs > 0, true);
});
test("cost: all bikes produce finite non-negative totals; zero km/years do not yield NaN or Infinity", () => {
  for (const b of BIKES) {
    const r = ownershipCost(b as unknown as CostBike, DEFAULT_COST_INPUT);
    assert.ok(Number.isFinite(r.total) && r.total > 0, b.id);
    assert.ok(r.fuel > 0 && r.wear > 0, b.id);
  }
  for (const o of [{ kmPerDay: 0 }, { years: 0 }]) {
    const r = ownershipCost(bike("bajaj-platina-100"), { ...DEFAULT_COST_INPUT, ...o });
    for (const k of ["perKm", "perMonth", "runningPerMonth", "pocketPerMonth"] as const) assert.ok(Number.isFinite(r[k]), `${JSON.stringify(o)} ${k}`);
  }
  assert.equal(ownershipCost(bike("bajaj-platina-100"), { ...DEFAULT_COST_INPUT, kmPerDay: 0 }).fuel, 0);
});

// ---------------- listingcheck ----------------
test("normaliseText: Bangla digits, thousands separators, case", () => {
  assert.equal(normaliseText("১২৩৪৫৬৭৮৯০"), "1234567890");
  assert.equal(normaliseText("১,২৫,০০০ ABC"), "125000 abc");
  assert.equal(normaliseText(""), "");
});
test("parse: price/km/year in English, Bangla digits and units", () => {
  const p = parseListingText("দাম ১,২৫,০০০ টাকা, ৪৫০০ কিমি, মডেল ২০২২", 2026);
  assert.deepEqual([p.price, p.km, p.year], [125000, 4500, 2022]);
  assert.equal(extractPrice(normaliseText("১.২ লাখ")), 120000);
  assert.equal(extractPrice("85k tk"), 85000);
  assert.equal(extractPrice("85000 tk"), 85000);
  assert.equal(extractKm("12k km"), 12000);
  assert.equal(extractKm(normaliseText("১২ হাজার কিমি")), 12000);
  assert.equal(extractYear("registered 1975", 2026), null); // before 1985
  assert.equal(extractYear("model 2019, bought 2021", 2026), 2019); // keyword wins
});
test("parse: empty/garbage input is safe; km and year are not mistaken for price", () => {
  const e = parseListingText("", 2026);
  assert.deepEqual([e.price, e.km, e.year, e.signals.length], [null, null, null, 0]);
  assert.equal(parseListingText(undefined as unknown as string, 2026).price, null);
  assert.equal(parseListingText("2022 model 12000 km", 2026).price, null);
  assert.equal(parseListingText("only 500 tk", 2026).price, null); // below the 15,000 floor
});
test("parse: advance/bKash wording is flagged and the advance amount is not the price", () => {
  const p = parseListingText("advance bkash 5000 then 90000 tk", 2026);
  assert.equal(p.price, 90000);
  assert.ok(p.signals.some((s) => s.id === "advance"));
});
test("priceBand thresholds are ordered and monotonic", () => {
  const order = ["far-below", "below", "fair", "above", "far-above"];
  let prev = -1;
  for (let d = -80; d <= 80; d += 1) {
    const i = order.indexOf(priceBand(d));
    assert.ok(i >= prev);
    prev = i;
  }
  assert.equal(priceBand(-30), "far-below");
  assert.equal(priceBand(0), "fair");
  assert.equal(priceBand(22), "far-above");
});
test("valueAtAge / kmAdjust: value falls with age, floor at 20%, km effect capped", () => {
  const b = bike("bajaj-platina-100");
  let prev = Infinity;
  for (let age = 0; age <= 20; age++) {
    const v = valueAtAge(b, age).v;
    assert.ok(v <= prev + 1e-6, `age ${age}`);
    assert.ok(v >= b.priceBDT * 0.2 - 1e-6);
    prev = v;
  }
  assert.equal(kmAdjust(3, null), 1);
  assert.ok(kmAdjust(3, 100000) >= 0.85 && kmAdjust(3, 100000) < 1);
  assert.ok(kmAdjust(3, 0) <= 1.08 + 1e-9 && kmAdjust(3, 0) > 1);
});
test("assess: empty listing = base score; advance forces Skip; unknown bike has no price band", () => {
  const empty = assess(emptyListing("a", "A"), null, { nowYear: 2026 });
  assert.equal(empty.score, BASE_SCORE);
  assert.equal(empty.price.known, false);
  const scam = emptyListing("b", "B");
  scam.text = "send advance by bkash first";
  const s = assess(scam, null, { nowYear: 2026 });
  assert.ok(s.score <= 34);
  assert.equal(s.verdict, "skip");
  const flagged = emptyListing("c", "C");
  flagged.behaviours.wantsAdvance = true;
  assert.ok(assess(flagged, null, { nowYear: 2026 }).score <= 34);
});
test("assess: a far-below price is penalised relative to a fair price", () => {
  const b = bike("bajaj-pulsar-150") ?? BIKES.find((x) => x.status === "on-sale")!;
  const mid = assess({ ...emptyListing("m", "M"), bikeId: b.id, year: 2023, askingBDT: null }, b, { nowYear: 2026 }).price.fairMid;
  const at = (asking: number) => assess({ ...emptyListing("x", "X"), bikeId: b.id, year: 2023, askingBDT: asking }, b, { nowYear: 2026 });
  const fair = at(mid), cheap = at(Math.round(mid * 0.4));
  assert.equal(fair.price.band, "fair");
  assert.equal(cheap.price.band, "far-below");
  assert.ok(cheap.score < fair.score);
  assert.ok(cheap.score <= 69); // one high flag: never "Worth"
});
test("valueIndex / rankListings: bounds, far-below cap, risk dominates, empty list", () => {
  const mk = (score: number, deltaPct: number | null, band: string, known = true) => ({ score, price: { known, deltaPct, band } }) as never;
  assert.equal(valueIndex(mk(60, null, "unknown", false)), 40);
  assert.equal(valueIndex(mk(60, 0, "fair")), 50);
  assert.equal(valueIndex(mk(60, -100, "far-below")), 50); // scam-pattern cap
  assert.equal(valueIndex(mk(60, -20, "below")), 80);
  assert.equal(valueIndex(mk(60, 500, "far-above")), 0);
  assert.ok(valueIndex(mk(60, -10, "fair")) > valueIndex(mk(60, 5, "fair")));
  assert.deepEqual(rankListings([]), []);
  const r = rankListings([mk(40, -20, "below"), mk(80, 0, "fair"), mk(80, 15, "above")]);
  assert.deepEqual(r.map((x) => x.rank), [3, 1, 2]);
  assert.equal(new Set(r.map((x) => x.rank)).size, r.length);
});

// ---------------- usedcheck audio ----------------
const tone = (hz: number, sec: number, amp: number, sr = 8000) => Float32Array.from({ length: sr * sec }, (_, i) => amp * Math.sin((2 * Math.PI * hz * i) / sr));
test("analyseSamples: steady 100 Hz tone", () => {
  const r = analyseSamples(tone(100, 20, 0.5), 8000);
  assert.equal(r.steadiness, "steady");
  assert.ok(r.steadinessCv < 0.05);
  assert.ok(Math.abs(r.dominantHz! - 100) <= 4);
  assert.ok(r.bands.low > 0.9);
  assert.ok(Math.abs(r.bands.low + r.bands.mid + r.bands.high - 1) < 1e-6);
  assert.equal(r.flags.length, 0);
  assert.ok(r.rmsSeries.length <= 120 && r.rmsSeries.every((v) => v >= 0 && v <= 1));
});
test("analyseSamples: band placement follows frequency", () => {
  assert.ok(analyseSamples(tone(600, 10, 0.4), 8000).bands.mid > 0.9);
  assert.ok(analyseSamples(tone(3000, 10, 0.4), 8000).bands.high > 0.9);
});
test("analyseSamples: pulsing amplitude is less steady than constant", () => {
  const sr = 8000, x = tone(120, 20, 1);
  for (let i = 0; i < x.length; i++) x[i] *= 0.5 + 0.45 * Math.sign(Math.sin((2 * Math.PI * 1.7 * i) / sr)); // 1.7 Hz surge
  const r = analyseSamples(x, sr);
  assert.ok(r.steadinessCv > 0.15);
  assert.notEqual(r.steadiness, "steady");
});
test("analyseSamples: silence and empty are too-quiet and never throw; short clip and clipping are flagged", () => {
  for (const x of [new Float32Array(0), new Float32Array(8000 * 20)]) {
    const r = analyseSamples(x, 8000);
    assert.equal(r.steadiness, "too-quiet");
    assert.equal(r.dominantHz, null);
    assert.ok(r.flags.some((f) => f.id === "quiet"));
    assert.ok(Number.isFinite(r.steadinessCv));
  }
  assert.ok(analyseSamples(tone(100, 3, 0.5), 8000).flags.some((f) => f.id === "short"));
  const loud = analyseSamples(tone(100, 20, 1), 8000);
  assert.ok(loud.clippedPct > 0.5 && loud.flags.some((f) => f.id === "clip"));
});
test("analyseSamples: only the first 60 s are analysed", () => {
  const r = analyseSamples(tone(100, 70, 0.5, 4000), 4000);
  assert.equal(r.analysedSec, 60);
  assert.ok(r.durationSec > 60 && r.flags.some((f) => f.id === "trimmed"));
});

// ---------------- negotiate ----------------
test("negotiate: no problems => ask nothing; deductions are monotonic ok<worn<bad", () => {
  const b = bike("bajaj-platina-100");
  const fair = 100000;
  const n0 = negotiate(b, {}, fair);
  assert.equal(n0.total, 0);
  assert.equal(n0.target, fair);
  assert.equal(n0.askOff, 0);
  assert.equal(n0.walk, false);
  const ids = ["frontTyre", "rearTyre", "brakes", "chain", "clutch", "engine", "fork", "shock", "electrics", "body", "service"] as const;
  for (const id of ids) {
    assert.equal(deduction(b, id, "ok", fair), null);
    const w = deduction(b, id, "worn", fair)!.amount, d = deduction(b, id, "bad", fair)!.amount;
    assert.ok(w > 0 && d >= w, `${id}: worn ${w} bad ${d}`);
  }
});
test("negotiate: ordering openAt <= target <= walkAbove <= fair; floor holds; walk-away items", () => {
  const b = bike("bajaj-platina-100");
  const n = negotiate(b, { chain: "worn", brakes: "bad", engine: "worn" }, 100000);
  assert.ok(n.total > 0);
  assert.ok(n.openAt <= n.target && n.target <= n.walkAbove && n.walkAbove <= 100000);
  assert.ok(Math.abs(n.settleOff - Math.round((n.askOff * 0.65) / 500) * 500) <= 500);
  const everything = negotiate(b, { engine: "bad", electrics: "bad", fork: "bad", shock: "bad", body: "bad" }, 40000);
  assert.ok(everything.target >= Math.max(5000, 40000 * 0.12));
  const walk = negotiate(b, { frame: "bad" }, 100000);
  assert.equal(walk.walk, true);
  assert.equal(walk.total, 0); // walk-away items are not priced into the ask
  assert.equal(negotiate(b, { papers: "bad" }, 100000).walk, true);
  assert.ok(Number.isFinite(negotiate(b, { chain: "bad" }, 0).target)); // zero fair price
});
