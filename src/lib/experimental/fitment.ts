// Experimental marketplace: does a product fit a bike? Pure rules over bikes.json fields. Import only from src/app/experimental.
import type { Bike } from "../types";
import type { Product } from "./catalogue";

/** What fitment needs from a bike; built at build time so client pages never load the full records. */
export type FitBike = {
  id: string;
  name: string;
  category: Bike["category"];
  fuel: Bike["engine"]["fuel"];
  gears: number;
  brakes: Pick<Bike["brakes"], "front" | "rear">;
  tyres?: Bike["tyres"];
  oil?: Pick<NonNullable<Bike["engineOil"]>, "grade" | "spec" | "litres" | "litresWithFilter" | "market">;
};

export const toFitBike = (b: Bike): FitBike => ({
  id: b.id,
  name: `${b.brand} ${b.model}`,
  category: b.category,
  fuel: b.engine.fuel,
  gears: b.gears,
  brakes: { front: b.brakes.front, rear: b.brakes.rear },
  ...(b.tyres && { tyres: b.tyres }),
  ...(b.engineOil && {
    oil: { grade: b.engineOil.grade, spec: b.engineOil.spec, litres: b.engineOil.litres, litresWithFilter: b.engineOil.litresWithFilter, market: b.engineOil.market },
  }),
});

/** "fits" and "no" are about this bike; "unknown" = we lack the data to say; "any" = fits every bike. */
export type Fit = { status: "fits" | "no" | "unknown" | "any"; label: string; sizes?: { end: "front" | "rear"; size: string }[] };

/** "10W-30 / 20W-40" (the manual allows either) -> ["10W-30", "20W-40"]. */
export const oilGrades = (grade: string) => grade.split("/").map((g) => g.trim());
/** Whole bottles to cover one oil change. */
export const bottlesFor = (needL: number, bottleL: number) => Math.ceil(needL / bottleL - 1e-9);
const litres = (n: number) => `${n.toFixed(n * 10 === Math.round(n * 10) ? 1 : 2)} L`;
const isEv = (b: FitBike) => b.fuel === "electric";

export function fitOf(p: Product, b: FitBike): Fit {
  const f = p.fit;
  if (!f) return { status: "any", label: "Fits any bike" };
  switch (f.type) {
    case "oil": {
      if (isEv(b)) return { status: "no", label: "Electric: no engine oil" };
      if (!b.oil) return { status: "unknown", label: "Oil grade not confirmed for this bike yet" };
      return oilGrades(b.oil.grade).includes(f.grade)
        ? { status: "fits", label: `Fits: manual says ${b.oil.grade}, needs ${litres(b.oil.litres)}` }
        : { status: "no", label: `Manual says ${b.oil.grade}` };
    }
    case "tyre": {
      if (!b.tyres) return { status: "unknown", label: "Tyre sizes not confirmed for this bike yet" };
      const sizes = (["front", "rear"] as const).filter((end) => f.sizes.includes(b.tyres![end])).map((end) => ({ end, size: b.tyres![end] }));
      return sizes.length
        ? { status: "fits", label: `Fits ${sizes.map((s) => `${s.end} ${s.size}`).join(", ")}`, sizes }
        : { status: "no", label: `Needs ${b.tyres.front} / ${b.tyres.rear}` };
    }
    case "brake":
      return b.brakes[f.end] === f.kind
        ? { status: "fits", label: `Fits: ${f.end} ${f.kind} brake` }
        : { status: "no", label: `Your ${f.end} brake is a ${b.brakes[f.end]}` };
    case "engine":
      return isEv(b) ? { status: "no", label: "Electric: not needed" } : { status: "fits", label: "Fits: made for your model" };
    case "chain":
      return b.category === "scooter" ? { status: "no", label: "Scooter: no chain" } : { status: "fits", label: "Fits: chain drive" };
    case "clutch":
      return isEv(b) || b.gears === 0 ? { status: "no", label: "No manual clutch" } : { status: "fits", label: "Fits: made for your model" };
  }
}

export type FitPick = { product: Product; qty: number; size?: string; note: string };

/**
 * The "Fits your bike" list: the oil (bottle size with least left over, then fewest bottles), each tyre end, then every
 * fitting part. `oilNote` explains a missing or India-manual oil grade instead of guessing one.
 */
export function picksFor(b: FitBike, products: Product[]): { picks: FitPick[]; oilNote?: string } {
  const picks: FitPick[] = [];
  let oilNote: string | undefined;
  if (isEv(b)) oilNote = "Electric: no engine oil to change.";
  else if (!b.oil) oilNote = "Oil grade not confirmed for this bike yet. Check your owner's manual before you buy oil.";
  else {
    const need = b.oil.litres;
    const best = products
      .filter((p) => fitOf(p, b).status === "fits" && p.fit?.type === "oil")
      .map((p) => {
        const bottle = (p.fit as { litres: number }).litres;
        const qty = bottlesFor(need, bottle);
        return { p, qty, waste: qty * bottle - need, cost: qty * p.price };
      })
      .sort((x, y) => x.waste - y.waste || x.qty - y.qty || x.cost - y.cost)[0];
    if (best) {
      const bottle = (best.p.fit as { litres: number }).litres;
      picks.push({ product: best.p, qty: best.qty, note: `Needs ${litres(need)}: ${best.qty} x ${bottle} L` });
    }
    oilNote =
      `Your manual: ${b.oil.grade}${b.oil.spec ? `, ${b.oil.spec}` : ""}, ${litres(need)} per change` +
      (b.oil.litresWithFilter ? ` (${litres(b.oil.litresWithFilter)} with filter)` : "") +
      (b.oil.market === "India" ? ". From the India-market manual; the BD bike may differ." : ".");
  }
  for (const end of ["front", "rear"] as const) {
    const size = b.tyres?.[end];
    const p = size && products.find((x) => x.fit?.type === "tyre" && x.fit.sizes.includes(size));
    if (p) picks.push({ product: p, qty: 1, size, note: `${end === "front" ? "Front" : "Rear"} ${size}` });
  }
  const cap = (s: string) => s[0].toUpperCase() + s.slice(1);
  for (const p of products) if (p.cat === "parts" && fitOf(p, b).status === "fits") picks.push({ product: p, qty: 1, note: cap(fitOf(p, b).label.replace(/^Fits: /, "")) });
  return { picks, oilNote };
}

/** Product page "Fits:" list over the whole bike catalogue (build time). */
export const bikesThatFit = (p: Product, bikes: FitBike[]) =>
  bikes.flatMap((b) => {
    const f = fitOf(p, b);
    return f.status === "fits" ? [{ id: b.id, name: b.name, sizes: f.sizes }] : [];
  });
