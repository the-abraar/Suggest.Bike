/**
 * What each way of paying (cash, 0% card EMI, an interest-bearing loan) really costs.
 * Used by the payment comparison on /cost. Pure — no DOM, safe to unit-test.
 */

/** Equal monthly instalment on a reducing-balance loan. */
export function loanEmi(principal: number, annualPct: number, months: number): number {
  if (principal <= 0 || months <= 0) return 0;
  const r = annualPct / 100 / 12;
  if (r === 0) return principal / months;
  const f = Math.pow(1 + r, months);
  return (principal * r * f) / (f - 1);
}

export type PathKey = "cash" | "card" | "loan";

/**
 * APPROX, UNVERIFIED: BD banks and showrooms charge a one-off processing fee on card EMI and bike loans, typically
 * 1-3% of the amount financed (no single published rate). We default to 1.5% and let the user change it on /cost.
 */
export const DEFAULT_FEE_PCT = 1.5;

export type PayTerms = {
  /** Ex-showroom (or used) price of the bike. */
  price: number;
  /** BRTA registration, paid in cash upfront whichever way you pay. 0 for a used bike. */
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
  /** Money paid beyond the price and BRTA: interest plus fees. */
  extra: number;
  total: number;
};

export function payPaths(t: PayTerms): Record<PathKey, PathResult> {
  const cash = { upfront: t.price + t.brta, emi: 0, emiMonths: 0, extra: 0, total: t.price + t.brta };

  const cardFee = (t.price * t.feePct) / 100;
  const cardEmi = t.cardMonths > 0 ? t.price / t.cardMonths : 0;
  const card = { upfront: t.brta + cardFee, emi: cardEmi, emiMonths: t.cardMonths, extra: cardFee, total: t.price + t.brta + cardFee };

  const down = (t.price * t.loanDownPct) / 100;
  const principal = t.price - down;
  const loanFee = (principal * t.feePct) / 100;
  const lEmi = loanEmi(principal, t.loanPct, t.loanMonths);
  const interest = Math.max(0, lEmi * t.loanMonths - principal);
  const loan = { upfront: down + t.brta + loanFee, emi: lEmi, emiMonths: t.loanMonths, extra: interest + loanFee, total: t.price + t.brta + interest + loanFee };

  return { cash, card, loan };
}
