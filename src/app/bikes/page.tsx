"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { SlidersHorizontal, X } from "lucide-react";
import { BIKES, BRANDS, CATEGORIES, PRICE_BANDS, avgMileage, brandLabel, overall } from "@/lib/bikes";
import { L, useLang, useTx } from "@/lib/i18n";
import { BikeCard } from "@/components/ui";
import { searchBikes } from "@/components/SearchBox";
import type { Category } from "@/lib/types";

type Sort = "recommended" | "price-asc" | "price-desc" | "mileage" | "power" | "reliability";
const SORTS: { id: Sort; label: string; bn: string }[] = [
  { id: "recommended", label: "Best rated", bn: "সেরা রেটিং" },
  { id: "price-asc", label: "Price: low to high", bn: "দাম: কম থেকে বেশি" },
  { id: "price-desc", label: "Price: high to low", bn: "দাম: বেশি থেকে কম" },
  { id: "mileage", label: "Best mileage", bn: "সেরা মাইলেজ" },
  { id: "power", label: "Most powerful", bn: "সবচেয়ে শক্তিশালী" },
  { id: "reliability", label: "Easiest to maintain", bn: "মেইনটেন্যান্স সবচেয়ে সহজ" },
];

type Filters = {
  q: string;
  cats: Category[];
  price: string;
  brands: string[];
  abs: boolean;
  fi: boolean;
  includeUsed: boolean;
  sort: Sort;
};

const EMPTY: Filters = { q: "", cats: [], price: "", brands: [], abs: false, fi: false, includeUsed: true, sort: "recommended" };

export default function BrowsePage() {
  return (
    <Suspense>
      <Browse />
    </Suspense>
  );
}

function Browse() {
  const params = useSearchParams();
  const { lang } = useLang();
  const tx = useTx();
  const [f, setF] = useState<Filters>(EMPTY);
  const [sheet, setSheet] = useState(false);

  // Hydrate from URL (links from home/footer use ?cat=, ?price=, ?brand=); ignore our own replaceState writes.
  const written = useRef<string | null>(null);
  useEffect(() => {
    if (written.current !== null && params.toString() === written.current) return;
    const cat = params.get("cat");
    const brand = params.get("brand");
    setF((x) => ({
      ...x,
      cats: cat && cat in CATEGORIES ? [cat as Category] : [],
      price: params.get("price") ?? "",
      brands: brand ? [brand] : [],
      q: params.get("q") ?? "",
    }));
    written.current = params.toString();
  }, [params]);

  // Keep URL shareable
  useEffect(() => {
    if (written.current === null) return;
    const p = new URLSearchParams();
    if (f.cats.length === 1) p.set("cat", f.cats[0]);
    if (f.price) p.set("price", f.price);
    if (f.brands.length === 1) p.set("brand", f.brands[0]);
    if (f.q) p.set("q", f.q);
    const qs = p.toString();
    if (qs === written.current) return;
    written.current = qs;
    window.history.replaceState(null, "", qs ? `?${qs}` : window.location.pathname);
  }, [f]);

  useEffect(() => {
    document.body.style.overflow = sheet ? "hidden" : "";
  }, [sheet]);

  const results = useMemo(() => {
    let list = f.q ? searchBikes(f.q, 100) : BIKES;
    const band = PRICE_BANDS.find((b) => b.id === f.price);
    list = list.filter(
      (b) =>
        (!f.cats.length || f.cats.includes(b.category)) &&
        (!band || (b.priceBDT >= band.min && b.priceBDT < band.max)) &&
        (!f.brands.length || f.brands.includes(b.brand)) &&
        (!f.abs || b.brakes.abs === "single" || b.brakes.abs === "dual") &&
        (!f.fi || b.engine.fuel === "fi") &&
        (f.includeUsed || b.status === "on-sale"),
    );
    const sorted = [...list];
    const by: Record<Sort, (a: (typeof list)[0], b: (typeof list)[0]) => number> = {
      recommended: (a, b) => overall(b) - overall(a),
      "price-asc": (a, b) => a.priceBDT - b.priceBDT,
      "price-desc": (a, b) => b.priceBDT - a.priceBDT,
      mileage: (a, b) => avgMileage(b) - avgMileage(a),
      power: (a, b) => b.powerPS - a.powerPS,
      reliability: (a, b) =>
        b.scores.mechanicFamiliarity + b.scores.partsAvailability + b.scores.reliability - (a.scores.mechanicFamiliarity + a.scores.partsAvailability + a.scores.reliability),
    };
    if (!(f.q && f.sort === "recommended")) sorted.sort(by[f.sort]);
    return sorted;
  }, [f]);

  const activeCount = f.cats.length + f.brands.length + (f.price ? 1 : 0) + (f.abs ? 1 : 0) + (f.fi ? 1 : 0) + (f.includeUsed ? 0 : 1);
  const toggle = <K extends "cats" | "brands">(k: K, v: Filters[K][number]) =>
    setF((x) => ({ ...x, [k]: (x[k] as string[]).includes(v) ? (x[k] as string[]).filter((y) => y !== v) : [...(x[k] as string[]), v] }));

  const panel = (
    <div className="space-y-7">
      <FilterGroup title={<L en="Style" bn="ধরন" />}>
        <div className="flex flex-wrap gap-1.5">
          {(Object.keys(CATEGORIES) as Category[]).map((c) => (
            <button key={c} className="chip" data-active={f.cats.includes(c)} onClick={() => toggle("cats", c)}>
              {lang === "bn" ? CATEGORIES[c].bn : CATEGORIES[c].en}
            </button>
          ))}
        </div>
      </FilterGroup>
      <FilterGroup title={<L en="Budget" bn="বাজেট" />}>
        <div className="flex flex-wrap gap-1.5">
          {PRICE_BANDS.map((b) => (
            <button key={b.id} className="chip" data-active={f.price === b.id} onClick={() => setF((x) => ({ ...x, price: x.price === b.id ? "" : b.id }))}>
              {lang === "bn" ? b.labelBn : b.label}
            </button>
          ))}
        </div>
      </FilterGroup>
      <FilterGroup title={<L en="Brand" bn="ব্র্যান্ড" />}>
        <div className="flex flex-wrap gap-1.5">
          {BRANDS.map((b) => (
            <button key={b} className="chip" data-active={f.brands.includes(b)} onClick={() => toggle("brands", b)}>
              {brandLabel(b)}
            </button>
          ))}
        </div>
      </FilterGroup>
      <FilterGroup title={<L en="Must have" bn="থাকতেই হবে" />}>
        <div className="space-y-1">
          <Toggle on={f.abs} onChange={(v) => setF((x) => ({ ...x, abs: v }))} label="ABS" />
          <Toggle on={f.fi} onChange={(v) => setF((x) => ({ ...x, fi: v }))} label={tx("Fuel injection", "ফুয়েল ইনজেকশন")} />
          <Toggle on={f.includeUsed} onChange={(v) => setF((x) => ({ ...x, includeUsed: v }))} label={tx("Include used-market classics", "পুরনো বাজারের ক্লাসিকও দেখাও")} />
        </div>
      </FilterGroup>
      {activeCount > 0 && (
        <button className="text-[13.5px] font-medium text-brand hover:underline" onClick={() => setF((x) => ({ ...EMPTY, sort: x.sort, q: x.q }))}>
          <L en="Reset filters" bn="ফিল্টার মুছুন" />
        </button>
      )}
    </div>
  );

  return (
    <div className="container-x pt-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-[32px] font-semibold tracking-[-0.03em] text-ink sm:text-[40px]">
            <L en="Every bike in Bangladesh" bn="বাংলাদেশের সব বাইক" />
          </h1>
          <p className="mt-1.5 text-[15.5px] text-muted">
            <L en="Honest scores, real mileage and current prices." bn="সৎ স্কোর, আসল মাইলেজ আর বর্তমান দাম।" />
          </p>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-[minmax(0,1fr)] gap-10 lg:grid-cols-[260px_minmax(0,1fr)]">
        <aside className="hidden lg:block">
          <div className="sticky top-24">{panel}</div>
        </aside>

        <div className="min-w-0">
          <div className="mb-5 flex flex-wrap items-center gap-2">
            <input
              value={f.q}
              onChange={(e) => setF((x) => ({ ...x, q: e.target.value }))}
              placeholder={tx("Filter by name…", "নাম দিয়ে খুঁজুন…")}
              className="input h-10 max-w-xs flex-1 text-[14px]"
              aria-label={tx("Filter by name", "নাম দিয়ে খুঁজুন")}
            />
            <button className="btn-secondary h-10 px-3.5 text-[14px] lg:hidden" onClick={() => setSheet(true)}>
              <SlidersHorizontal size={16} /> {tx("Filters", "ফিল্টার")} {activeCount > 0 && <span className="rounded-full bg-brand px-1.5 text-[11px] text-brand-ink">{activeCount}</span>}
            </button>
            <div className="ml-auto flex items-center gap-2">
              <span className="text-[13.5px] text-muted tnum">{tx(`${results.length} bikes`, `${results.length}টি বাইক`)}</span>
              <select
                value={f.sort}
                onChange={(e) => setF((x) => ({ ...x, sort: e.target.value as Sort }))}
                className="h-10 cursor-pointer rounded-xl border border-line-strong bg-surface px-3 text-[14px] text-ink outline-none focus:border-brand"
                aria-label={tx("Sort", "সাজান")}
              >
                {SORTS.map((s) => (
                  <option key={s.id} value={s.id}>
                    {lang === "bn" ? s.bn : s.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {results.length === 0 ? (
            <div className="card grid place-items-center px-6 py-20 text-center">
              <p className="text-[17px] font-semibold text-ink">{tx("No bikes match those filters", "এই ফিল্টারে কোনো বাইক নেই")}</p>
              <p className="mt-1 text-[14.5px] text-muted">{tx("Try widening your budget or removing a brand.", "বাজেট বাড়ান বা কোনো ব্র্যান্ড সরিয়ে দেখুন।")}</p>
              <button className="btn-secondary mt-5" onClick={() => setF(EMPTY)}>
                {tx("Reset everything", "সব রিসেট")}
              </button>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {results.map((b) => (
                <BikeCard key={b.id} bike={b} />
              ))}
            </div>
          )}
        </div>
      </div>

      {sheet && (
        <div className="fixed inset-0 z-[60] lg:hidden" role="dialog" aria-modal="true" aria-label={tx("Filters", "ফিল্টার")}>
          <div className="absolute inset-0 bg-black/40 animate-fade" onClick={() => setSheet(false)} />
          <div className="absolute inset-x-0 bottom-0 max-h-[85dvh] overflow-y-auto rounded-t-3xl bg-bg p-6 pb-28 shadow-lg animate-rise">
            <div className="mb-6 flex items-center justify-between">
              <p className="text-[18px] font-semibold text-ink">{tx("Filters", "ফিল্টার")}</p>
              <button onClick={() => setSheet(false)} className="grid h-9 w-9 place-items-center rounded-xl hover:bg-surface-2" aria-label={tx("Close", "বন্ধ")}>
                <X size={18} />
              </button>
            </div>
            {panel}
            <div className="fixed inset-x-0 bottom-0 border-t border-line bg-bg p-4">
              <button className="btn-primary w-full" onClick={() => setSheet(false)}>
                {tx(`Show ${results.length} bikes`, `${results.length}টি বাইক দেখুন`)}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function FilterGroup({ title, children }: { title: React.ReactNode; children: React.ReactNode }) {
  return (
    <div>
      <p className="eyebrow mb-3">{title}</p>
      {children}
    </div>
  );
}

function Toggle({ on, onChange, label }: { on: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button role="switch" aria-checked={on} onClick={() => onChange(!on)} className="flex w-full items-center justify-between gap-3 rounded-lg py-1.5 text-left text-[14px] text-ink-2">
      {label}
      <span className={`relative h-6 w-10 shrink-0 rounded-full transition-colors ${on ? "bg-brand" : "bg-surface-3"}`}>
        <span className={`absolute left-0 top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${on ? "translate-x-[18px]" : "translate-x-0.5"}`} />
      </span>
    </button>
  );
}
