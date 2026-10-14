/**
 * The one payment engine: what each way of paying (cash, 0% card EMI, an interest-bearing loan) really costs.
 * Used by /cost, the quiz's EMI mode and every "/month" figure. Pure — no DOM, safe to unit-test.
 */

/** Equal monthly instalment on a reducing-balance loan. */
export function loanEmi(principal: number, annualPct: number, months: number): number {
  if (principal <= 0 || months <= 0) return 0;
  const r = annualPct / 100 / 12;
  if (r === 0) return principal / months;
  const f = Math.pow(1 + r, months);
  return (principal * r * f) / (f - 1);
}

/** Largest principal that `monthly` repays over `months` (the inverse of loanEmi). */
export function maxPrincipal(monthly: number, annualPct: number, months: number): number {
  if (monthly <= 0 || months <= 0) return 0;
  const r = annualPct / 100 / 12;
  return r === 0 ? monthly * months : (monthly * (1 - Math.pow(1 + r, -months))) / r;
}

export type PathKey = "cash" | "card" | "loan";

/**
 * APPROX, UNVERIFIED: BD banks and showrooms charge a one-off processing fee on card EMI and bike loans, typically
 * 1-3% of the amount financed (no single published rate). We default to 1.5% and let the user change it on /cost.
 */
export const DEFAULT_FEE_PCT = 1.5;

/**
 * Example terms; banks and dealers differ. 0% card EMI is only offered up to `cardMonths` (12). Longer plans are a
 * bank or dealer loan: APPROX, UNVERIFIED 14% a year on a reducing balance (no single published rate).
 */
export const PAY_TERMS = { cardMonths: 12, loanDownPct: 30, loanPct: 14, loanMonths: 24 };

export type PayTerms = {
  /** Ex-showroom price of the bike (a used bike has no card EMI or loan). */
  price: number;
  /** BRTA registration, paid in cash upfront whichever way you pay. */
  brta: number;
  /** 0% card EMI tenure in months (3, 6, 12…). */
  cardMonths: number;
  /** Processing fee the bank or dealer charges on the financed amount, %. */
  feePct: number;
  loanDownPct: number;
  loanPct: number;
  loanMonths: number;
};

export type PathResult = {
  /** Cash you must have before you can ride it home. */
  upfront: number;
  /** Instalment after purchase (0 for cash). */
  emi: number;
  emiMonths: number;
  /** Processing fee, paid upfront and part of `extra`. */
  fee: number;
  /** Money paid beyond the price and BRTA: interest plus fees. */
  extra: number;
  total: number;
};

/** Finance `financed` of `price` over `months`: the rest of the price, BRTA and the fee are paid in cash first. */
function financePath(price: number, brta: number, financed: number, months: number, annualPct: number, feePct: number): PathResult {
  const fee = (financed * feePct) / 100;
  const emi = loanEmi(financed, annualPct, months);
  const interest = annualPct > 0 ? Math.max(0, emi * months - financed) : 0;
  return { upfront: price - financed + brta + fee, emi, emiMonths: months, fee, extra: interest + fee, total: price + brta + interest + fee };
}

export function payPaths(t: PayTerms): Record<PathKey, PathResult> {
  const cash = { upfront: t.price + t.brta, emi: 0, emiMonths: 0, fee: 0, extra: 0, total: t.price + t.brta };
  const card = financePath(t.price, t.brta, t.price, t.cardMonths, 0, t.feePct);
  const down = (t.price * Math.min(100, Math.max(0, t.loanDownPct))) / 100;
  const loan = financePath(t.price, t.brta, t.price - down, t.loanMonths, t.loanPct, t.feePct);
  return { cash, card, loan };
}

/** The "/month" shown next to a price on bike, compare, cost and home pages: 0% card EMI on the ex-showroom price. */
export const cardEmi = (price: number) => loanEmi(price, 0, PAY_TERMS.cardMonths);

/** Interest rate for an EMI plan of `months`: 0% card EMI up to PAY_TERMS.cardMonths, a loan beyond. */
const planPct = (months: number) => (months > PAY_TERMS.cardMonths ? PAY_TERMS.loanPct : 0);

/**
 * Quiz EMI mode: finance as much of the price as `monthly` repays over `months`; the rest of the price, BRTA and the
 * fee are the cash needed now. Same maths as payPaths, so the quiz and /cost agree.
 */
export const emiPlan = (price: number, brta: number, monthly: number, months: number, feePct = DEFAULT_FEE_PCT) =>
  financePath(price, brta, Math.min(price, maxPrincipal(monthly, planPct(months), months)), months, planPct(months), feePct);

/** Highest on-road price (bike + BRTA) that `cash` now plus `monthly` × `months` reaches, the fee taken out. */
export const emiCeiling = (cash: number, monthly: number, months: number, feePct = DEFAULT_FEE_PCT) =>
  Math.round(cash + maxPrincipal(monthly, planPct(months), months) * (1 - feePct / 100));
