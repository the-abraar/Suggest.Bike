"use client";

import Link from "next/link";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ArrowRight, Info } from "lucide-react";
import { BIKES, formatBDT, formatLakh, fullName, getBike } from "@/lib/bikes";
import { DEFAULT_COST_INPUT, FUEL, ownershipCost, registrationFor, type CostInput } from "@/lib/cost";
import { L } from "@/lib/i18n";
import { BikeArt } from "@/components/BikeArt";
import { searchBikes } from "@/components/SearchBox";
import type { Bike } from "@/lib/types";

export default function CostPage() {
  return (
    <Suspense>
      <Cost />
    </Suspense>
  );
}

const SEGMENTS = [
  { k: "fuel", label: "Fuel", color: "var(--brand)" },
  { k: "service", label: "Servicing", color: "#4f8fd6" },
  { k: "wear", label: "Wear parts", color: "#d99a2b" },
  { k: "paperwork", label: "BRTA paperwork", color: "#8b6fd1" },
  { k: "insurance", label: "Insurance", color: "#2bb3a8" },
  { k: "depreciation", label: "Resale loss", color: "var(--signal)" },
] as const;

function Cost() {
  const params = useSearchParams();
  const [bike, setBike] = useState<Bike>(() => getBike("bajaj-pulsar-n160") ?? BIKES[0]);
  const [inp, setInp] = useState<CostInput>(DEFAULT_COST_INPUT);

  useEffect(() => {
    const b = getBike(params.get("bike") || "");
    if (b) setBike(b);
  }, [params]);

  const c = useMemo(() => ownershipCost(bike, inp), [bike, inp]);
  const set = <K extends keyof CostInput>(k: K, v: CostInput[K]) => setInp((x) => ({ ...x, [k]: v }));

  const cheaper = useMemo(
    () =>
      BIKES.filter((b) => b.id !== bike.id && b.status === "on-sale" && b.category === bike.category)
        .map((b) => ({ b, c: ownershipCost(b, inp) }))
        .sort((x, y) => x.c.perMonth - y.c.perMonth)
        .slice(0, 4),
    [bike, inp],
  );

  const pick = (b: Bike) => {
    setBike(b);
    window.history.replaceState(null, "", `?bike=${b.id}`);
  };

  return (
    <div className="container-x pt-10">
      <h1 className="text-[32px] font-semibold tracking-[-0.03em] text-ink sm:text-[40px]">
        <L en="What will it really cost?" bn="আসলে কত খরচ হবে?" />
      </h1>
      <p className="mt-1.5 max-w-2xl text-[15.5px] text-muted">
        <L
          en="The sticker price is just the start. Fuel, servicing, chains and tyres, BRTA paperwork and what you lose at resale — all in one honest monthly number."
          bn="শোরুমের দাম শুধু শুরু। তেল, সার্ভিস, চেইন-টায়ার, BRTA কাগজপত্র আর বিক্রির সময় যা হারাবেন — সব মিলিয়ে একটা সৎ মাসিক সংখ্যা।"
        />
      </p>

      <div className="mt-10 grid grid-cols-[minmax(0,1fr)] gap-8 lg:grid-cols-[380px_minmax(0,1fr)]">
        {/* inputs */}
        <div className="card h-fit space-y-7 p-6 lg:sticky lg:top-24">
          <BikePicker bike={bike} onPick={pick} />

          <Field label="Riding per day" value={`${inp.kmPerDay} km`}>
            <Range min={5} max={150} step={5} value={inp.kmPerDay} onChange={(v) => set("kmPerDay", v)} label="Kilometres per day" />
            <p className="mt-1 text-[12px] text-faint">≈ {(inp.kmPerDay * 30).toLocaleString("en-IN")} km a month. Pathao riders often do 100+.</p>
          </Field>

          <Field label="How long you'll keep it">
            <div className="grid grid-cols-5 gap-1 rounded-xl bg-surface-2 p-1">
              {[1, 2, 3, 4, 5].map((y) => (
                <button
                  key={y}
                  onClick={() => set("years", y)}
                  className={`h-9 rounded-lg text-[14px] font-medium transition-all ${inp.years === y ? "bg-surface text-ink shadow-sm" : "text-muted hover:text-ink"}`}
                >
                  {y} yr
                </button>
              ))}
            </div>
          </Field>

          <Field label="Octane price" value={`৳${inp.fuelPrice}/L`}>
            <Range min={120} max={220} step={1} value={inp.fuelPrice} onChange={(v) => set("fuelPrice", v)} label="Fuel price" />
            <p className="mt-1 text-[12px] text-faint">
              Govt price is ৳{FUEL.octane}/L ({FUEL.asOf}).{" "}
              {inp.fuelPrice !== FUEL.octane && (
                <button className="font-medium text-brand hover:underline" onClick={() => set("fuelPrice", FUEL.octane)}>
                  Reset
                </button>
              )}
            </p>
          </Field>

          {bike.status === "on-sale" && (
            <Field label="Road tax">
              <div className="grid grid-cols-2 gap-1 rounded-xl bg-surface-2 p-1">
                {(["10yr", "2yr"] as const).map((p) => (
                  <button
                    key={p}
                    onClick={() => set("taxPlan", p)}
                    className={`h-9 rounded-lg text-[13.5px] font-medium transition-all ${inp.taxPlan === p ? "bg-surface text-ink shadow-sm" : "text-muted hover:text-ink"}`}
                  >
                    {p === "10yr" ? "10 years upfront" : "Every 2 years"}
                  </button>
                ))}
              </div>
            </Field>
          )}

          <div className="space-y-1">
            <Switch on={inp.insurance} onChange={(v) => set("insurance", v)} label="Third-party insurance" sub="Optional in BD · ~৳1,006/yr" />
            <Switch on={inp.includeDepreciation} onChange={(v) => set("includeDepreciation", v)} label="Count resale loss" sub="What the bike loses in value" />
          </div>
        </div>

        {/* output */}
        <div className="min-w-0 space-y-6">
          <div className="card overflow-hidden">
            <div className="grid gap-6 p-6 sm:grid-cols-[1fr_auto] sm:p-8">
              <div>
                <p className="text-[14px] text-muted">
                  {fullName(bike)} · {inp.years} {inp.years === 1 ? "year" : "years"} · {c.km.toLocaleString("en-IN")} km
                </p>
                <p className="mt-2 text-[48px] font-semibold leading-none tracking-[-0.03em] text-ink tnum sm:text-[60px]">{formatBDT(c.perMonth)}</p>
                <p className="mt-2 text-[15px] text-muted">
                  <L en="per month, all-in" bn="প্রতি মাসে, সব মিলিয়ে" />
                </p>
              </div>
              <div className="grid grid-cols-3 gap-6 sm:grid-cols-1 sm:gap-4 sm:text-right">
                <Kpi k="Total" v={formatLakh(c.total)} />
                <Kpi k="Per km" v={`৳${c.perKm.toFixed(2)}`} />
                <Kpi k="Running only / mo" v={formatBDT(c.runningPerMonth)} />
              </div>
            </div>

            {/* stacked bar */}
            <div className="px-6 pb-6 sm:px-8 sm:pb-8">
              <div className="flex h-4 overflow-hidden rounded-full bg-surface-3">
                {SEGMENTS.map((s) => {
                  const v = c[s.k];
                  if (!v) return null;
                  return <div key={s.k} title={`${s.label}: ${formatBDT(v)}`} style={{ width: `${(v / c.total) * 100}%`, background: s.color }} className="h-full transition-all duration-500 first:rounded-l-full last:rounded-r-full" />;
                })}
              </div>
              <div className="mt-6 grid gap-x-8 gap-y-3 sm:grid-cols-2">
                {SEGMENTS.map((s) => {
                  const v = c[s.k];
                  return (
                    <div key={s.k} className={`flex items-center justify-between gap-3 text-[14.5px] ${v ? "" : "opacity-40"}`}>
                      <span className="flex items-center gap-2.5 text-ink-2">
                        <span className="h-2.5 w-2.5 rounded-full" style={{ background: s.color }} />
                        {s.label}
                      </span>
                      <span className="font-medium text-ink tnum">
                        {formatBDT(v)} <span className="text-[12.5px] font-normal text-faint">· {formatBDT(v / (inp.years * 12))}/mo</span>
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <Fact k="Buy today" v={formatBDT(c.onRoad)} sub={bike.status === "on-sale" ? `ex-showroom + ${formatBDT(c.onRoad - bike.priceBDT)} BRTA` : "used price, plus transfer fee"} />
            <Fact k={`Worth after ${inp.years} yr`} v={formatBDT(c.resaleValue)} sub="estimated, decent condition" />
            <Fact k="Fuel per month" v={`${Math.round(c.km / (inp.years * 12) / ((bike.mileageKmpl[0] + bike.mileageKmpl[1]) / 2))} L`} sub={`at ${bike.mileageKmpl[0]}–${bike.mileageKmpl[1]} kmpl`} />
          </div>

          {cheaper.length > 0 && (
            <div className="card p-6">
              <h2 className="text-[17px] font-semibold tracking-tight text-ink">
                <L en="Same style, compared on the same terms" bn="একই ধরনের বাইক, একই হিসাবে" />
              </h2>
              <div className="mt-4 divide-y divide-line">
                {cheaper.map(({ b, c: cc }) => {
                  const diff = cc.perMonth - c.perMonth;
                  return (
                    <button key={b.id} onClick={() => pick(b)} className="flex w-full items-center gap-4 py-3 text-left transition-colors hover:bg-surface-2/50">
                      <span className="h-10 w-16 shrink-0">
                        <BikeArt bike={b} shadow={false} className="h-full w-full" />
                      </span>
                      <span className="min-w-0 flex-1 truncate text-[14.5px] font-medium text-ink">{fullName(b)}</span>
                      <span className="text-[14.5px] font-semibold text-ink tnum">{formatBDT(cc.perMonth)}/mo</span>
                      <span className={`w-24 text-right text-[13px] font-medium tnum ${diff < 0 ? "text-good" : "text-signal"}`}>
                        {diff < 0 ? "−" : "+"}
                        {formatBDT(Math.abs(diff))}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <p className="flex gap-2 text-[12.5px] leading-relaxed text-faint">
            <Info size={14} className="mt-0.5 shrink-0" />
            Fuel uses the middle of the real-world mileage range. Wear parts assume a chain set every 18,000 km, brake pads every 10,000 km, tyres every 25,000 km and a clutch every 30,000 km. Resale uses our resale score
            (≈ {Math.round((1 - (0.8 + bike.scores.resale * 0.012)) * 100)}% value lost per year for this bike). Registration: {registrationFor(bike.engine.cc).label}, from BRTA fee schedules.{" "}
            <Link href="/guide/#registration" className="text-brand hover:underline">
              Breakdown
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

function BikePicker({ bike, onPick }: { bike: Bike; onPick: (b: Bike) => void }) {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const results = useMemo(() => searchBikes(q, 6), [q]);
  return (
    <div className="relative">
      <p className="mb-2 text-[13px] font-medium text-ink-2">Bike</p>
      {!open ? (
        <button onClick={() => setOpen(true)} className="flex w-full items-center gap-3 rounded-xl border border-line-strong p-2.5 text-left transition-colors hover:border-ink/30">
          <span className="h-10 w-16 shrink-0">
            <BikeArt bike={bike} shadow={false} className="h-full w-full" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-[14.5px] font-semibold text-ink">{fullName(bike)}</span>
            <span className="block text-[12.5px] text-muted tnum">{formatBDT(bike.priceBDT)}</span>
          </span>
          <span className="text-[12.5px] font-medium text-brand">Change</span>
        </button>
      ) : (
        <>
          <input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onBlur={() => setTimeout(() => setOpen(false), 150)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && results[0]) {
                onPick(results[0]);
                setOpen(false);
                setQ("");
              }
              if (e.key === "Escape") setOpen(false);
            }}
            placeholder="Search a bike…"
            className="input h-[62px]"
          />
          {results.length > 0 && (
            <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-50 overflow-hidden rounded-2xl border border-line bg-surface shadow-lg">
              {results.map((b) => (
                <button
                  key={b.id}
                  onMouseDown={() => {
                    onPick(b);
                    setOpen(false);
                    setQ("");
                  }}
                  className="flex w-full items-center gap-3 px-3 py-2.5 text-left hover:bg-surface-2"
                >
                  <span className="min-w-0 flex-1 truncate text-[14px] font-medium text-ink">{fullName(b)}</span>
                  <span className="text-[13px] text-muted tnum">{formatLakh(b.priceBDT)}</span>
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function Field({ label, value, children }: { label: string; value?: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between">
        <span className="text-[13px] font-medium text-ink-2">{label}</span>
        {value && <span className="text-[15px] font-semibold text-ink tnum">{value}</span>}
      </div>
      {children}
    </div>
  );
}

function Range({ min, max, step, value, onChange, label }: { min: number; max: number; step: number; value: number; onChange: (v: number) => void; label: string }) {
  return (
    <input
      type="range"
      className="range"
      min={min}
      max={max}
      step={step}
      value={value}
      aria-label={label}
      style={{ ["--fill" as string]: `${((value - min) / (max - min)) * 100}%` }}
      onChange={(e) => onChange(Number(e.target.value))}
    />
  );
}

function Switch({ on, onChange, label, sub }: { on: boolean; onChange: (v: boolean) => void; label: string; sub: string }) {
  return (
    <button role="switch" aria-checked={on} onClick={() => onChange(!on)} className="flex w-full items-center justify-between gap-3 rounded-xl py-2 text-left">
      <span>
        <span className="block text-[14px] font-medium text-ink-2">{label}</span>
        <span className="block text-[12px] text-faint">{sub}</span>
      </span>
      <span className={`relative h-6 w-10 shrink-0 rounded-full transition-colors ${on ? "bg-brand" : "bg-surface-3"}`}>
        <span className={`absolute left-0 top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${on ? "translate-x-[18px]" : "translate-x-0.5"}`} />
      </span>
    </button>
  );
}

function Kpi({ k, v }: { k: string; v: string }) {
  return (
    <div>
      <p className="text-[12.5px] text-muted">{k}</p>
      <p className="text-[18px] font-semibold tracking-tight text-ink tnum">{v}</p>
    </div>
  );
}

function Fact({ k, v, sub }: { k: string; v: string; sub: string }) {
  return (
    <div className="card p-5">
      <p className="text-[12.5px] text-muted">{k}</p>
      <p className="mt-1 text-[22px] font-semibold tracking-tight text-ink tnum">{v}</p>
      <p className="mt-0.5 text-[12.5px] text-faint">{sub}</p>
    </div>
  );
}
