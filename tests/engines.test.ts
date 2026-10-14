// Self-tests for the pure logic in src/lib. Run: npm test (node:test via tsx).
import { test } from "node:test";
import assert from "node:assert/strict";
import { BIKES, HAS_NETWORKS, avgMileage, formatLakh, getBike, networkReach } from "../src/lib/bikes";
import {
  matchBikes,
  minCashNow,
  withCash,
  anyNewFits,
  cheapestNew,
  cheapestPicks,
  stretchPicks,
  onRoadPrice,
  encodeAnswers,
  decodeAnswers,
  isUsedOption,
  registrable,
  BUDGET_RANGE,
  DEFAULT_ANSWERS,
  BAND_LOW,
  DIVERSE_GAP,
  STRETCH,
  type Answers,
  type Match,
} from "../src/lib/match";
import { MAX_REGISTRABLE_CC, registrationFor, yearlyRetention, defaultUsedPrice, ownershipCost, DEFAULT_COST_INPUT, type CostBike } from "../src/lib/cost";
import { DEFAULT_FEE_PCT, PAY_TERMS, cardEmi, emiCeiling, emiPlan, loanEmi, maxPrincipal, payPaths } from "../src/lib/fund";

const A = (o: Partial<Answers> = {}): Answers => ({ ...DEFAULT_ANSWERS, ...o });
const BAND_ORDER = { great: 0, good: 1, possible: 2 } as const;
const unsure = (m: Match) => m.bike.availability === "unconfirmed" && !isUsedOption(m);
const family = (m: Match) => `${m.bike.brand} ${m.bike.model.split(" ")[0]}`;
/** Warnings that keep a bike from jumping the ranking (match.ts canJump). */
const blocks = (m: Match) => m.warnings.some((w) => /Parts are|Few mechanics|network outside|Availability unconfirmed/.test(w.en));
const bike = (id: string) => getBike(id)! as unknown as CostBike & typeof BIKES[number];

// ---------------- match engine ----------------
test("match: results are sorted, bounded and within the on-road budget", () => {
  const a = A({ budget: 200000 });
  const r = matchBikes(a, 6);
  assert.ok(r.length > 0 && r.length <= 6);
  for (let i = 0; i < r.length; i++) assert.ok(r[i].score >= 0 && r[i].score <= 99 && ["great", "good", "possible"].includes(r[i].band));
  // best band first, never "Good" above "Great" (critique 15 Oct N3); after the top 3, by score within a band
  for (let i = 1; i < r.length; i++) assert.ok(BAND_ORDER[r[i - 1].band] <= BAND_ORDER[r[i].band], `${r[i - 1].bike.id} above ${r[i].bike.id}`);
  for (let i = 4; i < r.length; i++) if (r[i - 1].band === r[i].band && !unsure(r[i - 1])) assert.ok(r[i - 1].score >= r[i].score);
  // a bike moved up into the top 3 trails a confirmed bike it passed by at most DIVERSE_GAP
  for (let i = 0; i < 3; i++) for (const m of r.slice(i + 1)) if (!unsure(m) && m.band === r[i]?.band) assert.ok(m.score - r[i].score <= DIVERSE_GAP, m.bike.id);
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
test("match: budget band is soft — a bike far under the budget scores lower but stays; inside the band the budget does not matter", () => {
  const at = (budget: number, o: Partial<Answers> = {}) => new Map(matchBikes(A({ budget, ...o }), 1000).map((m) => [m.bike.id, m]));
  const lo = at(150000), hi = at(600000), hi2 = at(650000);
  const cheap = [...lo.values()].filter((m) => !m.used && m.cost < BAND_LOW * 600000);
  assert.ok(cheap.length > 0);
  for (const m of cheap) assert.ok(hi.get(m.bike.id)!.score < m.score, m.bike.id);
  // two budgets whose band both bikes sit in score them the same
  for (const m of hi.values()) if (m.cost >= BAND_LOW * 650000) assert.equal(hi2.get(m.bike.id)!.score, m.score, m.bike.id);
  // "Lowest price" turns the band off: the cheaper bike wins on a big budget
  const cheapest = matchBikes(A({ budget: 400000, priorities: ["price"] }), 1)[0];
  assert.ok(cheapest.cost < BAND_LOW * 400000, cheapest.bike.id);
});
test("match: EMI mode checks cash now and the instalment, for new bikes only", () => {
  const emiA = (down: number, monthly: number, tenure: Answers["tenure"], o: Partial<Answers> = {}) =>
    A({ payMode: "monthly", down, monthly, tenure, budget: emiCeiling(down, monthly, tenure), condition: "any", ...o });
  for (const [down, monthly, tenure] of [[50000, 20000, 12], [60000, 8000, 24], [100000, 15000, 36], [30000, 30000, 6]] as const) {
    const a = emiA(down, monthly, tenure);
    const r = matchBikes(a, 1000);
    assert.ok(r.length > 0, `${down}/${monthly}/${tenure}`);
    for (const m of r) {
      assert.ok(!isUsedOption(m) && m.pay, m.bike.id);
      assert.ok(m.pay.upfront <= down && m.pay.emi <= monthly + 1e-6, m.bike.id);
      assert.ok(m.pay.upfront >= m.registration + m.pay.fee, m.bike.id); // BRTA and the fee are never financed
    }
    for (const m of stretchPicks(a)) assert.ok(m.pay && m.pay.upfront <= down + a.budget * STRETCH && m.pay.upfront > down, m.bike.id);
  }
  // no cash: every new bike needs BRTA in cash, so nothing fits and the fallback says how much cash is missing
  const broke = emiA(0, 40000, 12);
  assert.equal(matchBikes(broke).length, 0);
  assert.ok(/more cash now/.test(cheapestPicks(broke, 1)[0].warnings[0].en));
});
test("N5: with ৳0 cash the budget promises nothing, and minCashNow is the least cash that unlocks a bike", () => {
  for (const tenure of [12, 24] as const) {
    const a = A({ payMode: "monthly", down: 0, monthly: 20000, tenure, budget: emiCeiling(0, 20000, tenure) });
    assert.equal(a.budget, 0, `${tenure} mo: the header must not say "≤ ৳4.1 lakh on-road" with no cash`);
    assert.equal(matchBikes(a).length, 0);
    const floor = minCashNow(a);
    assert.ok(Number.isFinite(floor) && floor > 0, `${tenure}`);
    const at = (down: number) => matchBikes(withCash(a, down), 1000);
    assert.ok(at(Math.ceil(floor)).length > 0, `${tenure}: ${floor} unlocks nothing`);
    assert.equal(at(Math.floor(floor) - 1).length, 0, `${tenure}: less than ${floor} still fits`);
    for (const m of at(Math.ceil(floor / 1000) * 1000)) assert.ok(m.pay!.upfront <= Math.ceil(floor / 1000) * 1000, m.bike.id);
  }
  // card EMI: the floor is BRTA plus the fee on the cheapest bike, ৳12-20k; a loan adds 30% of the price
  const card = minCashNow(A({ payMode: "monthly", down: 0, monthly: 20000, tenure: 12 }));
  assert.ok(card > 8000 && card < 20000, `${card}`);
  assert.ok(minCashNow(A({ payMode: "monthly", down: 0, monthly: 20000, tenure: 24 })) > card + 25000);
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
test("match: never suggests a bike over 375cc (BRTA registration limit), at any budget, use or condition", () => {
  assert.equal(MAX_REGISTRABLE_CC, 375);
  assert.equal(registrable({ engine: { ...bike("royal-enfield-classic-350").engine, cc: 748 } }), false);
  assert.equal(registrable(bike("royal-enfield-classic-350")), true);
  for (const use of ["fun", "highway", "mixed"] as const)
    for (const condition of ["new", "any"] as const) {
      const a = A({ budget: BUDGET_RANGE[1], use, condition, priorities: ["performance"] });
      for (const m of [...matchBikes(a, 1000), ...stretchPicks(a, 1000), ...cheapestPicks(a, 1000)]) assert.ok(m.bike.engine.cc <= 375, `${use} ${condition}: ${m.bike.id}`);
    }
});
test("match: an availability-unconfirmed bike, bought new, leads its warnings with that; a used example does not", () => {
  const flagged = BIKES.filter((b) => b.availability === "unconfirmed");
  assert.ok(flagged.length > 0, "fixture: no bike carries availability unconfirmed");
  const all = matchBikes(A({ budget: BUDGET_RANGE[1], condition: "any", use: "mixed", priorities: ["price"] }), 1000);
  const hits = all.filter((m) => m.bike.availability === "unconfirmed");
  assert.ok(hits.length > 0);
  for (const m of hits) assert.equal(/Availability unconfirmed/.test(m.warnings[0]?.en ?? ""), !m.used, m.bike.id);
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
  assert.deepEqual(d.priorities, ["safety", "mileage", "comfort", "style"]);
});

// ---------------- cost / EMI / BRTA ----------------
test("cardEmi: the one '/month' figure is payPaths' 12-month 0% card EMI on the ex-showroom price", () => {
  assert.equal(PAY_TERMS.cardMonths, 12);
  assert.equal(cardEmi(120000), 10000);
  assert.equal(cardEmi(0), 0);
  for (const id of ["bajaj-platina-100", "bajaj-pulsar-n160"]) {
    const b = bike(id);
    assert.equal(cardEmi(b.priceBDT), payPaths({ price: b.priceBDT, brta: onRoadPrice(b) - b.priceBDT, feePct: DEFAULT_FEE_PCT, ...PAY_TERMS }).card.emi);
  }
});
test("maxPrincipal is the inverse of loanEmi; guards", () => {
  assert.equal(maxPrincipal(10000, 0, 12), 120000);
  for (const [m, pct, n] of [[9000, 14, 24], [5000, 10, 36], [20000, 0, 6]]) assert.ok(Math.abs(loanEmi(maxPrincipal(m, pct, n), pct, n) - m) < 1e-6);
  assert.equal(maxPrincipal(0, 14, 24), 0);
  assert.equal(maxPrincipal(1000, 14, 0), 0);
});
test("loanEmi: zero-interest split, known answer, monotonic, guards", () => {
  assert.equal(loanEmi(120000, 0, 12), 10000);
  assert.ok(Math.abs(loanEmi(100000, 12, 12) - 8884.88) < 0.01); // standard 1%/month, 12 months
  assert.ok(loanEmi(100000, 15, 24) > loanEmi(100000, 10, 24));
  assert.ok(loanEmi(100000, 12, 12) * 12 > 100000);
  assert.equal(loanEmi(0, 10, 12), 0);
  assert.equal(loanEmi(1000, 10, 0), 0);
});
test("payPaths: cash is cheapest, card adds only the fee, loan adds interest; zero terms are safe", () => {
  const p = payPaths({ price: 120000, brta: 10000, cardMonths: 12, feePct: 2, loanDownPct: 30, loanPct: 14, loanMonths: 24 });
  assert.equal(p.cash.total, 130000);
  assert.equal(p.card.emi, 10000);
  assert.equal(p.card.extra, 2400);
  assert.ok(p.loan.extra > p.card.extra && p.loan.total > p.card.total);
  assert.equal(p.loan.upfront, 36000 + 10000 + 84000 * 0.02);
  const z = payPaths({ price: 0, brta: 0, cardMonths: 0, feePct: 0, loanDownPct: 0, loanPct: 0, loanMonths: 0 });
  for (const k of ["cash", "card", "loan"] as const) assert.ok(Number.isFinite(z[k].total) && z[k].total === 0, k);
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

// ---------------- one on-road price, fee default ----------------
test("on-road: match and cost agree (2-year token default) for petrol, EV and used-only bikes", () => {
  const ev = BIKES.find((b) => b.engine.fuel === "electric") as CostBike | undefined;
  const usedOnly = BIKES.find((b) => b.status === "used-only") as CostBike | undefined;
  assert.ok(ev && usedOnly, "fixtures need an EV and a used-only bike in src/data/bikes.json");
  assert.equal(DEFAULT_COST_INPUT.taxPlan, "2yr");
  assert.equal(DEFAULT_COST_INPUT.insurance, true);
  for (const b of [bike("bajaj-platina-100"), bike("bajaj-pulsar-n160"), ev, usedOnly]) assert.equal(ownershipCost(b, DEFAULT_COST_INPUT).onRoad, onRoadPrice(b));
  const n160 = bike("bajaj-pulsar-n160");
  assert.equal(onRoadPrice(n160), n160.priceBDT + registrationFor(n160.engine.cc).totalBDT);
  assert.equal(onRoadPrice(usedOnly), usedOnly.priceBDT); // no new registration on a used-only bike
  assert.equal(ownershipCost(n160, { ...DEFAULT_COST_INPUT, taxPlan: "10yr" }).onRoad, n160.priceBDT + registrationFor(n160.engine.cc).totalBDT10yr);
});
test("payPaths: the default processing fee is charged on the amount financed and counted in each EMI total", () => {
  assert.equal(DEFAULT_FEE_PCT, 1.5);
  const p = payPaths({ price: 200000, brta: 11764, cardMonths: 12, feePct: DEFAULT_FEE_PCT, loanDownPct: 30, loanPct: 14, loanMonths: 24 });
  assert.equal(p.card.extra, 3000); // 1.5% of 2,00,000
  assert.equal(p.card.total, 200000 + 11764 + 3000);
  assert.equal(p.card.upfront, 11764 + 3000);
  const loanFee = 140000 * 0.015; // on the financed 70%, not on the down payment
  assert.ok(Math.abs(p.loan.extra - (p.loan.emi * 24 - 140000) - loanFee) < 1e-6);
  assert.ok(p.card.total > p.cash.total);
});

// ---------------- gaps from docs/Todo_agent.md P2 Tests ----------------
test("match: seat-height penalty lowers the score of the same bike for a short rider", () => {
  const byId = (h: Answers["height"]) => new Map(matchBikes(A({ budget: 900000, height: h }), 1000).map((m) => [m.bike.id, m]));
  const short = byId("short"), tall = byId("tall");
  const hit = [...short.values()].filter((m) => m.warnings.some((w) => /tiptoes/.test(w.en)));
  assert.ok(hit.length > 0);
  // the score is rounded, so a few mm over the limit can round to no change
  for (const m of hit) assert.ok(m.score <= tall.get(m.bike.id)!.score, m.bike.id);
  assert.ok(hit.filter((m) => m.score < tall.get(m.bike.id)!.score).length >= hit.length / 2);
});
test("cost: 2-year plan renews road tax every 2 years after the first registration", () => {
  for (const id of ["bajaj-platina-100", "bajaj-pulsar-n160"]) {
    const b = bike(id);
    const paper = (years: number) => ownershipCost(b, { ...DEFAULT_COST_INPUT, taxPlan: "2yr", years }).paperwork;
    const renewal = b.engine.cc <= 100 ? 1150 : 2300; // ROAD_TAX_2YR in src/lib/cost.ts
    assert.equal(paper(1), registrationFor(b.engine.cc).totalBDT);
    assert.equal(paper(2), paper(1));
    assert.equal(paper(3), paper(1) + renewal);
    assert.equal(paper(4), paper(1) + renewal);
    assert.equal(paper(5), paper(1) + 2 * renewal);
  }
});
test("formatLakh: plain taka under a lakh; 2 decimals under 10 lakh, 1 above; trailing zeros trimmed; Bangla unit", () => {
  assert.equal(formatLakh(99999), "৳99,999");
  assert.equal(formatLakh(100000), "৳1 lakh");
  assert.equal(formatLakh(265000), "৳2.65 lakh");
  assert.equal(formatLakh(250000), "৳2.5 lakh");
  assert.equal(formatLakh(1250000), "৳12.5 lakh");
  assert.equal(formatLakh(265000, "bn"), "৳2.65 লাখ");
});
test("formatLakh: crore from 100 lakh, including amounts that round up to it (critique B15)", () => {
  assert.equal(formatLakh(9940000), "৳99.4 lakh");
  assert.equal(formatLakh(9999999), "৳1 crore");
  assert.equal(formatLakh(10000000), "৳1 crore");
  assert.equal(formatLakh(12500000), "৳1.25 crore");
  assert.equal(formatLakh(250000000, "bn"), "৳25 কোটি");
});

test("network: a brand with no official count is neutral, not flagged as a small network", () => {
  assert.equal(networkReach("No Such Brand"), 0.5);
  assert.ok(networkReach("No Such Brand") >= 0.45); // match.ts warns town/village riders below 0.45
  assert.ok(networkReach("Bajaj") > networkReach("KTM"));
});

// ---------------- one payment engine (critique B2, B3, B16) ----------------
const n160 = () => {
  const b = bike("bajaj-pulsar-n160");
  return { b, brta: onRoadPrice(b) - b.priceBDT, paths: payPaths({ price: b.priceBDT, brta: onRoadPrice(b) - b.priceBDT, feePct: DEFAULT_FEE_PCT, ...PAY_TERMS }) };
};
const near = (x: number, y: number, what: string) => assert.ok(Math.abs(x - y) < 1e-6, `${what}: ${x} vs ${y}`);
test("B2 scenario: Pulsar N160, 30% down, 24 months — /cost and the quiz both say ৳9,195/mo after ৳96,717 upfront", () => {
  const { b, brta, paths } = n160();
  assert.equal(b.priceBDT, 273600, "fixture: update the expected figures when the N160 price changes");
  assert.equal(Math.round(paths.loan.emi), 9195);
  assert.equal(Math.round(paths.loan.upfront), 96717);
  const quiz = emiPlan(b.priceBDT, brta, paths.loan.emi, 24);
  near(quiz.emi, paths.loan.emi, "emi");
  near(quiz.upfront, paths.loan.upfront, "upfront");
});
test("N2: a loan (over 12 months) finances at most 70% of the price, so the quiz's cash now matches /cost", () => {
  const { b, brta, paths } = n160();
  // ৳20,000/mo over 24 months could repay the whole price, but a bank still wants 30% down: same cash as /cost
  const quiz = emiPlan(b.priceBDT, brta, 20000, 24);
  near(quiz.upfront, paths.loan.upfront, "upfront");
  near(quiz.emi, paths.loan.emi, "emi");
  assert.ok(quiz.upfront >= b.priceBDT * PAY_TERMS.loanDownPct / 100 + brta);
  for (const t of [18, 24, 36] as const) assert.ok(emiPlan(b.priceBDT, brta, 1e6, t).upfront >= b.priceBDT * 0.3 + brta, `${t} mo`);
  // card EMI (12 months or less) still finances it all
  assert.equal(emiPlan(b.priceBDT, brta, 1e6, 12).upfront, paths.card.upfront);
  const has = (down: number) =>
    matchBikes(A({ payMode: "monthly", down, monthly: 20000, tenure: 24, budget: emiCeiling(down, 20000, 24) }), 1000).some((m) => m.bike.id === b.id);
  assert.equal(has(20000), false); // was offered with ৳15,868 cash before the fix
  assert.equal(has(Math.ceil(paths.loan.upfront)), true);
  // the ceiling never promises more than ৳20k cash can put down
  assert.ok(emiCeiling(20000, 20000, 24) < 20000 / 0.3);
});
test("B2 scenario: 12-month card, no cash — ৳22,800/mo plus ৳15,868 upfront, so a zero-cash buyer cannot get it", () => {
  const { b, brta, paths } = n160();
  assert.equal(Math.round(paths.card.emi), 22800);
  assert.equal(Math.round(paths.card.upfront), 15868); // BRTA 11,764 + 1.5% fee 4,104
  const quiz = emiPlan(b.priceBDT, brta, 22800, 12);
  assert.equal(quiz.emi, paths.card.emi);
  assert.equal(quiz.upfront, paths.card.upfront);
  const has = (down: number) =>
    matchBikes(A({ payMode: "monthly", down, monthly: 22800, tenure: 12, budget: emiCeiling(down, 22800, 12) }), 1000).some((m) => m.bike.id === b.id);
  assert.equal(has(0), false);
  assert.equal(has(15868), true);
});
test("quiz and /cost agree: the quiz's plan for a bike equals payPaths for the same price, cash and term", () => {
  for (const id of ["bajaj-platina-100", "bajaj-pulsar-n160", "yamaha-fzs-v2-dd"]) {
    const b = bike(id);
    const brta = onRoadPrice(b) - b.priceBDT;
    const paths = payPaths({ price: b.priceBDT, brta, feePct: DEFAULT_FEE_PCT, ...PAY_TERMS });
    for (const [key, tenure] of [["card", PAY_TERMS.cardMonths], ["loan", PAY_TERMS.loanMonths]] as [keyof typeof paths, Answers["tenure"]][]) {
      const p = paths[key];
      const down = Math.ceil(p.upfront) + 1; // a taka of slack for float rounding at the exact boundary
      const a = A({ payMode: "monthly", down, monthly: p.emi, tenure, budget: emiCeiling(down, p.emi, tenure), gearless: "either" });
      const m = matchBikes(a, 1000).find((x) => x.bike.id === id);
      assert.ok(m?.pay, `${id} ${key} not offered`);
      for (const k of ["upfront", "emi", "fee", "total"] as const) near(m.pay[k], p[k], `${id} ${key} ${k}`);
    }
  }
});
test("B3: used and used-only options never carry EMI or a registration, and EMI mode leaves them out", () => {
  const usedOnly = BIKES.find((b) => b.status === "used-only")!;
  assert.ok(usedOnly, "fixture needs a used-only bike in src/data/bikes.json");
  assert.equal(isUsedOption({ bike: usedOnly }), true);
  assert.equal(isUsedOption({ bike: bike("bajaj-pulsar-n160") }), false);
  assert.equal(isUsedOption({ bike: bike("bajaj-pulsar-n160"), used: { age: 1, price: 1 } }), true);
  const total = matchBikes(A({ budget: 200000, condition: "any" }), 1000);
  const used = total.filter(isUsedOption);
  assert.ok(used.some((m) => m.bike.status === "used-only") && used.some((m) => m.used));
  for (const m of used) assert.ok(!m.pay && m.registration === 0 && m.onRoad === m.price && !m.reasons.some((r) => /on the road/.test(r.en)), m.bike.id);
  const emi = matchBikes(A({ budget: emiCeiling(700000, 60000, 12), payMode: "monthly", down: 700000, monthly: 60000, tenure: 12, condition: "any" }), 1000);
  assert.ok(emi.length > 0 && !emi.some(isUsedOption));
});

// ---------------- matcher usefulness (critique B1) ----------------
const top3 = (o: Partial<Answers>) => matchBikes(A(o), 3);
const ids = (r: Match[]) => r.map((m) => m.bike.id);
test("persona: commute at ৳1.5 lakh and at ৳4 lakh get different top 3; the bigger budget reaches bikes the smaller cannot", () => {
  const lo = top3({ use: "commute", budget: 150000 }), hi = top3({ use: "commute", budget: 400000 });
  assert.equal(lo.length, 3);
  assert.notDeepEqual(ids(lo), ids(hi));
  assert.ok(hi.filter((m) => m.cost > 150000).length >= 2, ids(hi).join());
});
test("persona: mixed use at ৳2.5 lakh and at ৳4 lakh get different top 3", () => {
  assert.notDeepEqual(ids(top3({ use: "mixed", budget: 250000 })), ids(top3({ use: "mixed", budget: 400000 })));
});
test("persona: home quick pick (geared) changes with the slider", () => {
  const qp = (budget: number) => ids(top3({ use: "commute", budget, gearless: "no" }));
  assert.notDeepEqual(qp(150000), qp(400000));
});
test("persona: rideshare at ৳2 lakh gets frugal, mechanic-friendly bikes that carry a passenger", () => {
  for (const m of top3({ use: "rideshare", budget: 200000 })) {
    assert.ok(m.bike.status === "on-sale" && m.bike.engine.stroke !== 2, m.bike.id);
    assert.ok(m.bike.ev || avgMileage(m.bike) >= 55, `${m.bike.id} mileage`);
    assert.ok(m.bike.scores.mechanicFamiliarity >= 8 && m.bike.scores.pillion >= 6, m.bike.id);
  }
});
test("persona: village at ৳2 lakh gets bikes any local mechanic knows, from brands with a wide network", () => {
  for (const o of [{ use: "rough" }, { use: "commute", where: "village" }] as Partial<Answers>[])
    for (const m of top3({ ...o, budget: 200000 })) {
      assert.ok(m.bike.category !== "scooter" && m.bike.scores.mechanicFamiliarity >= 8, `${JSON.stringify(o)} ${m.bike.id}`);
      if (HAS_NETWORKS) assert.ok(networkReach(m.bike.brand) >= 0.45, m.bike.id);
    }
});
test("match: the top 3 span two styles unless no other style is in #3's band, within DIVERSE_GAP and free of service warnings", () => {
  let mixed = 0;
  for (const use of ["commute", "mixed", "highway", "rough", "rideshare", "fun"] as const)
    for (const budget of [150000, 250000, 400000, 650000]) {
      const r = matchBikes(A({ use, budget }), 1000);
      if (r.length < 4) continue;
      if (new Set(r.slice(0, 3).map((m) => m.bike.category)).size > 1) mixed++;
      else
        for (const m of r.slice(3))
          if (m.bike.category !== r[0].bike.category) assert.ok(m.band !== r[2].band || r[2].score - m.score > DIVERSE_GAP || blocks(m), `${use} ${budget} ${m.bike.id}`);
    }
  assert.ok(mixed >= 14, `only ${mixed} of 24 personas get a mixed top 3`);
});
test("persona N3: the default ৳2.5 lakh commute gives three model lines, all Great, and no warned EV above a Great bike", () => {
  const r = matchBikes(A({}), 6);
  assert.equal(new Set(r.slice(0, 3).map(family)).size, 3, ids(r).join());
  assert.ok(r.slice(0, 3).every((m) => m.band === "great" && !blocks(m)), ids(r).join());
  for (const use of ["commute", "mixed", "highway", "rough", "rideshare", "fun"] as const)
    for (const budget of [150000, 250000, 400000, 650000]) {
      const t = matchBikes(A({ use, budget }), 3);
      // a repeated model line in the top 3 means no other line was close enough to take its place
      for (let k = 1; k < t.length; k++) if (t.slice(0, k).some((m) => family(m) === family(t[k]))) assert.ok(t[k].band !== "great" || matchBikes(A({ use, budget }), 1000).slice(3).every((m) => family(m) === family(t[k]) || m.band !== t[k].band || t[k].score - m.score > DIVERSE_GAP || blocks(m)), `${use} ${budget}`);
    }
});
test("persona N4: an availability-unconfirmed bike never leads a confirmed bike of the same band", () => {
  const splendor = bike("hero-splendor-plus");
  assert.equal(splendor.availability, "unconfirmed", "fixture: Hero Splendor+ is no longer flagged; pick another flagged bike");
  for (const o of [{ budget: 130000 }, { budget: 150000 }, { budget: 200000 }, { use: "rideshare", budget: 200000 }, { budget: 150000, gearless: "no" }] as Partial<Answers>[]) {
    const r = matchBikes(A(o), 1000);
    assert.notEqual(r[0].bike.id, splendor.id, JSON.stringify(o));
    for (let i = 1; i < r.length; i++) if (r[i].band === r[i - 1].band) assert.ok(!unsure(r[i - 1]) || unsure(r[i]), `${JSON.stringify(o)} ${r[i - 1].bike.id}`);
  }
});

// ---------------- shared links are clamped (critique B11) ----------------
test("decodeAnswers: clamps the budget, de-duplicates priorities and derives the EMI budget", () => {
  const d = (q: string) => decodeAnswers(new URLSearchParams(q))!;
  assert.equal(d("b=-5&r=1").budget, 30000);
  assert.equal(d("b=999999999999&r=1").budget, 1000000);
  assert.equal(d("b=Infinity").budget, 1000000);
  assert.equal(decodeAnswers(new URLSearchParams("b=abc")), null);
  assert.equal(decodeAnswers(new URLSearchParams("b=0")), null);
  assert.deepEqual(d("b=200000&pr=mileage.mileage.mileage").priorities, ["mileage"]);
  assert.deepEqual(d("b=200000&pr=price.safety.price.style.comfort").priorities, ["price", "safety", "style", "comfort"]);
  assert.equal(d(`b=200000&pr=${"mileage.safety.x.".repeat(500)}price`).priorities.length, 3); // de-dup bounds the list
  const m = d("pm=monthly&m=2000&t=36&b=150000");
  assert.equal(m.budget, emiCeiling(0, 2000, 36));
  assert.ok(m.budget < 150000);
  const big = d("pm=monthly&m=999999999&d=99999999999&t=12&b=1");
  assert.equal(big.monthly, 60000);
  assert.equal(big.down, 1000000);
  assert.equal(big.budget, emiCeiling(1000000, 60000, 12));
  assert.equal(d("pm=monthly&m=-500&d=-9&b=200000").down, 0);
  const a = A({ payMode: "monthly", down: 40000, monthly: 9000, tenure: 24, budget: emiCeiling(40000, 9000, 24) });
  assert.deepEqual(decodeAnswers(new URLSearchParams(encodeAnswers(a))), a);
});
