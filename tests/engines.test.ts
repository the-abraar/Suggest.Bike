// Self-tests for the pure logic in src/lib. Run: npm test (node:test via tsx).
import { test } from "node:test";
import assert from "node:assert/strict";
import { BIKES, HAS_NETWORKS, formatLakh, getBike, networkReach } from "../src/lib/bikes";
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
import { DEFAULT_FEE_PCT, loanEmi, payPaths } from "../src/lib/fund";

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
  assert.deepEqual(d.priorities, ["safety", "mileage", "comfort", "style"]);
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

test("network: a brand with no official count is neutral, not flagged as a small network", () => {
  assert.equal(networkReach("No Such Brand"), 0.5);
  assert.ok(networkReach("No Such Brand") >= 0.45); // match.ts warns town/village riders below 0.45
  assert.ok(networkReach("Bajaj") > networkReach("KTM"));
});
