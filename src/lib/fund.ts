/**
 * Maths behind /fund: how far someone is from buying their bike, and what each way of paying
 * (cash, 0% card EMI, an interest-bearing loan) really costs. Pure — no DOM, safe to unit-test.
 * Ported from TakaTalks' /viz goal maths (lib/viz/math.ts).
 */

/** Longest horizon we'll simulate before calling a goal unreachable (50 years). */
const MAX_MONTHS = 600;

export const clamp01 = (n: number) => (Number.isFinite(n) ? Math.min(1, Math.max(0, n)) : 0);

export const progress = (saved: number, target: number) => (target > 0 ? clamp01(saved / target) : 0);

/**
 * Months until `saved`, topped up by `monthly` each month and growing at `annualPct`
 * (e.g. a DPS), reaches `target`. 0 if already there, null if it never gets there.
 */
export function monthsToGoal(target: number, saved: number, monthly: number, annualPct = 0): number | null {
  if (saved >= target) return 0;
  const r = Math.pow(1 + annualPct / 100, 1 / 12) - 1;
  let balance = Math.max(0, saved);
  for (let m = 1; m <= MAX_MONTHS; m++) {
    balance = balance * (1 + r) + Math.max(0, monthly);
    if (balance >= target) return m;
  }
  return null;
}

/** Equal monthly instalment on a reducing-balance loan. */
export function loanEmi(principal: number, annualPct: number, months: number): number {
  if (principal <= 0 || months <= 0) return 0;
  const r = annualPct / 100 / 12;
  if (r === 0) return principal / months;
  const f = Math.pow(1 + r, months);
  return (principal * r * f) / (f - 1);
}

export type PathKey = "cash" | "card" | "loan";

export type FundInput = {
  /** Ex-showroom (or used) price of the bike. */
  price: number;
  /** BRTA registration, paid in cash upfront whichever way you pay for the bike. 0 for a used bike. */
  brta: number;
  saved: number;
  monthly: number;
  /** Interest the savings earn, % a year (DPS / savings account). */
  savingsPct: number;
  /** 0% card EMI tenure in months (3, 6, 12…). */
  cardMonths: number;
  /** Processing fee the bank or dealer charges on the financed amount, %. */
  feePct: number;
  loanDownPct: number;
  loanPct: number;
  loanMonths: number;
  /** Fuel, servicing and wear once you own it, per month. */
  runningPerMonth: number;
  /** What you spend on rickshaw/CNG/bus/ride-share today — the bike replaces most of it. */
  transportNow: number;
};

export type PathResult = {
  key: PathKey;
  /** Cash you must have before you can ride it home. */
  upfront: number;
  /** Months of saving until you have `upfront`; null = never at this rate. */
  rideIn: number | null;
  /** Instalment after purchase (0 for cash). */
  emi: number;
  emiMonths: number;
  /** Money paid beyond the price and BRTA: interest plus fees. */
  extra: number;
  total: number;
  /** EMI plus running costs, minus the transport spend the bike replaces. */
  monthlyAfter: number;
  fit: "fits" | "tight" | "over";
};

const fitOf = (need: number, have: number): PathResult["fit"] => (need <= have ? "fits" : need <= have * 1.2 ? "tight" : "over");

export function fundPaths(inp: FundInput): Record<PathKey, PathResult> {
  const net = Math.max(0, inp.runningPerMonth - inp.transportNow);
  const ride = (upfront: number) => monthsToGoal(upfront, inp.saved, inp.monthly, inp.savingsPct);

  const cashUp = inp.price + inp.brta;
  const cash: PathResult = {
    key: "cash",
    upfront: cashUp,
    rideIn: ride(cashUp),
    emi: 0,
    emiMonths: 0,
    extra: 0,
    total: cashUp,
    monthlyAfter: net,
    fit: "fits",
  };

  const cardFee = (inp.price * inp.feePct) / 100;
  const cardEmi = inp.cardMonths > 0 ? inp.price / inp.cardMonths : 0;
  const card: PathResult = {
    key: "card",
    upfront: inp.brta + cardFee,
    rideIn: ride(inp.brta + cardFee),
    emi: cardEmi,
    emiMonths: inp.cardMonths,
    extra: cardFee,
    total: inp.price + inp.brta + cardFee,
    monthlyAfter: cardEmi + net,
    fit: fitOf(cardEmi + net, inp.monthly + inp.transportNow),
  };

  const down = (inp.price * inp.loanDownPct) / 100;
  const principal = inp.price - down;
  const loanFee = (principal * inp.feePct) / 100;
  const lEmi = loanEmi(principal, inp.loanPct, inp.loanMonths);
  const interest = lEmi * inp.loanMonths - principal;
  const loan: PathResult = {
    key: "loan",
    upfront: down + inp.brta + loanFee,
    rideIn: ride(down + inp.brta + loanFee),
    emi: lEmi,
    emiMonths: inp.loanMonths,
    extra: interest + loanFee,
    total: inp.price + inp.brta + interest + loanFee,
    monthlyAfter: lEmi + net,
    fit: fitOf(lEmi + net, inp.monthly + inp.transportNow),
  };

  return { cash, card, loan };
}

// ---------------------------------------------------------------- formatting

/** 27 → "2 yrs 3 mo" / "২ বছর ৩ মাস" (Latin digits, as elsewhere on the site). */
export function fmtDuration(months: number, lang: "en" | "bn"): string {
  const y = Math.floor(months / 12);
  const m = months % 12;
  const parts: string[] = [];
  if (lang === "bn") {
    if (y) parts.push(`${y} বছর`);
    if (m || !y) parts.push(`${m} মাস`);
  } else {
    if (y) parts.push(`${y} yr${y === 1 ? "" : "s"}`);
    if (m || !y) parts.push(`${m} mo`);
  }
  return parts.join(" ");
}

const MONTHS_EN = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const MONTHS_BN = ["জানু", "ফেব্রু", "মার্চ", "এপ্রিল", "মে", "জুন", "জুলাই", "আগস্ট", "সেপ্টে", "অক্টো", "নভে", "ডিসে"];

/** Calendar month `months` from now, e.g. "Mar 2028". */
export function fmtMonthFromNow(months: number, lang: "en" | "bn", from: Date = new Date()): string {
  const d = new Date(from.getFullYear(), from.getMonth() + months, 1);
  return `${(lang === "bn" ? MONTHS_BN : MONTHS_EN)[d.getMonth()]} ${d.getFullYear()}`;
}

export function fmtPct(p: number): string {
  const v = p * 100;
  if (v > 0 && v < 1) return `${v.toFixed(1)}%`;
  return `${Math.floor(v)}%`;
}

/** Pick the message for the highest threshold reached. */
export function tierLine<T>(pct: number, tiers: [number, T][]): T {
  let out = tiers[0][1];
  for (const [at, msg] of tiers) if (pct >= at) out = msg;
  return out;
}
