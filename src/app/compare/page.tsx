"use client";

import Link from "next/link";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Crown, Plus, Search, X } from "lucide-react";
import { BIKES, SCORE_LABELS, avgMileage, ccLabel, formatBDT, formatLakh, fullName, getBike } from "@/lib/bikes";
import { DEFAULT_COST_INPUT, ownershipCost, registrationFor } from "@/lib/cost";
import { popularPairs } from "@/lib/curated";
import { useStore, MAX_COMPARE } from "@/lib/store";
import { L, useLang } from "@/lib/i18n";
import type { Bike, ScoreKey } from "@/lib/types";
import { BikeArt } from "@/components/BikeArt";
import { searchBikes } from "@/components/SearchBox";

export default function ComparePage() {
  return (
    <Suspense>
      <Compare />
    </Suspense>
  );
}

function Compare() {
  const params = useSearchParams();
  const { compare, toggleCompare, clearCompare, ready } = useStore();
  const [ids, setIds] = useState<string[]>([]);

  // URL wins on first load; otherwise fall back to the compare tray.
  useEffect(() => {
    if (!ready) return;
    const fromUrl = (params.get("bikes") || "").split(",").filter((id) => getBike(id));
    const initial = (fromUrl.length ? fromUrl : compare).slice(0, MAX_COMPARE);
    setIds(initial);
    clearCompare();
    initial.forEach((id) => toggleCompare(id));
  }, [ready, params]); // eslint-disable-line react-hooks/exhaustive-deps

  const update = (next: string[]) => {
    setIds(next);
    clearCompare();
    next.forEach((id) => toggleCompare(id));
    window.history.replaceState(null, "", next.length ? `?bikes=${next.join(",")}` : window.location.pathname);
  };

  const bikes = ids.map((id) => getBike(id)!).filter(Boolean);

  return (
    <div className="container-x pt-10">
      <h1 className="text-[32px] font-semibold tracking-[-0.03em] text-ink sm:text-[40px]">
        {bikes.length >= 2 ? (
          bikes.map((b, i) => (
            <span key={b.id}>
              {i > 0 && <span className="text-faint"> vs </span>}
              {b.model}
            </span>
          ))
        ) : (
          <L en="Compare bikes" bn="বাইক তুলনা" />
        )}
      </h1>
      <p className="mt-1.5 text-[15.5px] text-muted">
        <L en="Side by side, including the things spec sheets leave out. Winners are highlighted." bn="পাশাপাশি তুলনা — স্পেক শিটে যা থাকে না সেটাও। বিজয়ী হাইলাইট করা।" />
      </p>

      {/* slots */}
      <div className={`sticky top-16 z-30 -mx-4 mt-8 border-b border-line bg-bg/90 px-4 pb-4 pt-3 backdrop-blur-xl sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8`}>
        <div
          className="grid grid-cols-[repeat(var(--m),minmax(0,1fr))] gap-2 sm:grid-cols-[repeat(var(--d),minmax(0,1fr))] sm:gap-3"
          style={{ ["--m" as string]: Math.max(bikes.length, 1), ["--d" as string]: Math.min(MAX_COMPARE, Math.max(bikes.length + 1, 2)) }}
        >
          {bikes.map((b) => (
            <div key={b.id} className="card relative flex items-center gap-2 p-2.5 sm:gap-3 sm:p-3">
              <span className="hidden h-12 w-20 shrink-0 sm:block">
                <BikeArt bike={b} shadow={false} className="h-full w-full" />
              </span>
              <div className="min-w-0 flex-1">
                <Link href={`/bikes/${b.id}/`} className="block truncate text-[13.5px] font-semibold text-ink hover:text-brand sm:text-[14.5px]">
                  <span className="hidden sm:inline">{b.brand} </span>
                  {b.model}
                </Link>
                <p className="text-[13px] text-muted tnum">{formatLakh(b.priceBDT)}</p>
              </div>
              <button
                onClick={() => update(ids.filter((x) => x !== b.id))}
                className="grid h-7 w-7 shrink-0 place-items-center rounded-lg text-faint hover:bg-surface-2 hover:text-ink sm:h-8 sm:w-8"
                aria-label={`Remove ${b.model}`}
              >
                <X size={16} />
              </button>
            </div>
          ))}
          {bikes.length < MAX_COMPARE && (
            <div className="col-span-full sm:col-span-1">
              <AddSlot exclude={ids} onPick={(id) => update([...ids, id])} />
            </div>
          )}
        </div>
      </div>

      {bikes.length < 2 ? <EmptyState onPick={(pair) => update(pair)} /> : <Table bikes={bikes} />}
    </div>
  );
}

function AddSlot({ exclude, onPick }: { exclude: string[]; onPick: (id: string) => void }) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const results = useMemo(() => (q ? searchBikes(q, 8) : BIKES.filter((b) => b.status === "on-sale").slice(0, 0)).filter((b) => !exclude.includes(b.id)), [q, exclude]);
  if (!open)
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex h-12 w-full items-center justify-center sm:h-[74px] sm:min-h-[74px] gap-2 rounded-2xl border-2 border-dashed border-line-strong text-[14px] font-medium text-muted transition-colors hover:border-brand hover:text-brand"
      >
        <Plus size={18} /> <L en="Add a bike" bn="বাইক যোগ করুন" />
      </button>
    );
  return (
    <div className="relative">
      <div className="relative">
        <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-faint" />
        <input
          autoFocus
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && results[0]) onPick(results[0].id);
            if (e.key === "Escape") setOpen(false);
          }}
          placeholder="Type a bike name…"
          className="input h-12 rounded-2xl pl-10 sm:h-[74px]"
        />
      </div>
      {results.length > 0 && (
        <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-50 overflow-hidden rounded-2xl border border-line bg-surface shadow-lg">
          {results.map((b) => (
            <button key={b.id} onMouseDown={() => onPick(b.id)} className="flex w-full items-center gap-3 px-3 py-2.5 text-left hover:bg-surface-2">
              <span className="h-8 w-12 shrink-0">
                <BikeArt bike={b} shadow={false} className="h-full w-full" />
              </span>
              <span className="min-w-0 flex-1 truncate text-[14px] font-medium text-ink">{fullName(b)}</span>
              <span className="text-[13px] text-muted tnum">{formatLakh(b.priceBDT)}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function EmptyState({ onPick }: { onPick: (ids: string[]) => void }) {
  return (
    <div className="mt-10">
      <p className="eyebrow mb-4">
        <L en="Or start with a popular match-up" bn="অথবা জনপ্রিয় তুলনা দিয়ে শুরু করুন" />
      </p>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {popularPairs().map(([a, b]) => (
          <button
            key={a.id + b.id}
            onClick={() => onPick([a.id, b.id])}
            className="card flex items-center justify-between gap-3 p-4 text-left transition-all hover:border-line-strong hover:shadow-md"
          >
            <span className="text-[14.5px] font-medium text-ink">
              {a.model} <span className="text-faint">vs</span> {b.model}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ---------------- Comparison table ---------------- */

type Better = "high" | "low" | null;

function winners(values: (number | null)[], better: Better) {
  if (!better) return values.map(() => false);
  const nums = values.filter((v): v is number => v !== null);
  if (nums.length < 2) return values.map(() => false);
  const best = better === "high" ? Math.max(...nums) : Math.min(...nums);
  const allSame = nums.every((n) => n === best);
  return values.map((v) => !allSame && v === best);
}

type RowSpec = { label: React.ReactNode; values: React.ReactNode[]; nums?: (number | null)[]; better?: Better; hint?: string };

function Table({ bikes }: { bikes: Bike[] }) {
  const { lang } = useLang();
  const costs = bikes.map((b) => ownershipCost(b, DEFAULT_COST_INPUT));
  const cols = { gridTemplateColumns: `repeat(${bikes.length}, minmax(0, 1fr))` };
  const abs = { none: "no ABS", single: "1-ch ABS", dual: "2-ch ABS", cbs: "CBS" } as const;

  const blocks: { title: React.ReactNode; rows: RowSpec[] }[] = [
    {
      title: <L en="Money" bn="টাকা" />,
      rows: [
        { label: "Price", values: bikes.map((b) => formatBDT(b.priceBDT)), nums: bikes.map((b) => b.priceBDT), better: "low" },
        {
          label: "On-road (10-yr tax token)",
          values: bikes.map((b) => (b.status === "used-only" ? "Used — transfer only" : formatBDT(b.priceBDT + registrationFor(b.engine.cc).totalBDT10yr))),
        },
        { label: "Running cost / month (25 km/day)", values: costs.map((c) => formatBDT(c.runningPerMonth)), nums: costs.map((c) => Math.round(c.runningPerMonth)), better: "low" },
        { label: "True cost / month incl. resale loss (3 yrs)", values: costs.map((c) => formatBDT(c.perMonth)), nums: costs.map((c) => Math.round(c.perMonth)), better: "low" },
        { label: "Est. resale after 3 years", values: costs.map((c) => formatBDT(c.resaleValue)) },
        { label: "Periodic service", values: bikes.map((b) => `${formatBDT(b.avgServiceCostBDT)} / ${b.serviceIntervalKm.toLocaleString("en-IN")} km`) },
      ],
    },
    {
      title: <L en="Engine & performance" bn="ইঞ্জিন ও পারফরম্যান্স" />,
      rows: [
        { label: "Engine", values: bikes.map((b) => `${ccLabel(b)} · ${b.engine.fuel === "fi" ? "FI" : "Carb"} · ${b.engine.cooling}-cooled`) },
        { label: "Power", values: bikes.map((b) => `${b.powerPS} PS`), nums: bikes.map((b) => b.powerPS), better: "high" },
        { label: "Torque", values: bikes.map((b) => `${b.torqueNm} Nm`), nums: bikes.map((b) => b.torqueNm), better: "high" },
        { label: "Power-to-weight", values: bikes.map((b) => `${Math.round((b.powerPS / b.weightKg) * 1000)} PS/tonne`), nums: bikes.map((b) => Math.round((b.powerPS / b.weightKg) * 1000)), better: "high" },
        { label: "Gearbox", values: bikes.map((b) => (b.gears ? `${b.gears}-speed` : "CVT")) },
        { label: "Real-world mileage", values: bikes.map((b) => `${b.mileageKmpl[0]}–${b.mileageKmpl[1]} kmpl`), nums: bikes.map(avgMileage), better: "high" },
        { label: "Range per tank", values: bikes.map((b) => `≈ ${Math.round(b.fuelTankL * avgMileage(b))} km`), nums: bikes.map((b) => Math.round(b.fuelTankL * avgMileage(b))), better: "high" },
      ],
    },
    {
      title: <L en="Body & safety" bn="বডি ও নিরাপত্তা" />,
      rows: [
        { label: "Kerb weight", values: bikes.map((b) => `${b.weightKg} kg`), nums: bikes.map((b) => b.weightKg), better: "low" },
        { label: "Seat height", values: bikes.map((b) => `${b.seatHeightMm} mm`), nums: bikes.map((b) => b.seatHeightMm), better: "low", hint: "Lower is easier to flat-foot" },
        { label: "Ground clearance", values: bikes.map((b) => (b.groundClearanceMm ? `${b.groundClearanceMm} mm` : "—")), nums: bikes.map((b) => b.groundClearanceMm ?? null), better: "high" },
        { label: "Fuel tank", values: bikes.map((b) => `${b.fuelTankL} L`), nums: bikes.map((b) => b.fuelTankL), better: "high" },
        {
          label: "Brakes",
          values: bikes.map((b) => `${b.brakes.front === "disc" ? "Disc" : "Drum"}/${b.brakes.rear === "disc" ? "Disc" : "Drum"} · ${abs[b.brakes.abs]}`),
          nums: bikes.map((b) => ({ none: 0, cbs: 1, single: 2, dual: 3 })[b.brakes.abs] * 2 + (b.brakes.front === "disc" ? 1 : 0)),
          better: "high",
        },
        { label: "Tyres", values: bikes.map((b) => (b.tubeless ? "Tubeless" : "Tube-type")), nums: bikes.map((b) => (b.tubeless ? 1 : 0)), better: "high" },
      ],
    },
    {
      title: <L en="Ownership scores" bn="মালিকানা স্কোর" />,
      rows: (Object.keys(SCORE_LABELS) as ScoreKey[]).map((k) => ({
        label: lang === "bn" ? SCORE_LABELS[k].bn : SCORE_LABELS[k].en,
        hint: SCORE_LABELS[k].hint,
        nums: bikes.map((b) => b.scores[k]),
        better: "high" as const,
        values: bikes.map((b) => (
          <span key={b.id} className="flex w-full items-center gap-2.5">
            <span className="w-9 shrink-0">{b.scores[k]}/10</span>
            <span className="hidden h-1.5 flex-1 overflow-hidden rounded-full bg-surface-3 sm:block">
              <span className="block h-full rounded-full bg-brand" style={{ width: `${b.scores[k] * 10}%` }} />
            </span>
          </span>
        )),
      })),
    },
    {
      title: <L en="Parts prices" bn="পার্টসের দাম" />,
      rows: bikes[0].parts.map((p, idx) => ({
        label: p.name,
        values: bikes.map((b) => (b.parts[idx] ? formatBDT(b.parts[idx].priceBDT) : "—")),
        nums: bikes.map((b) => b.parts[idx]?.priceBDT ?? null),
        better: "low" as const,
      })),
    },
  ];

  const tally = bikes.map(() => 0);
  const winMap = blocks.map((bl) =>
    bl.rows.map((r) => {
      const w = r.nums ? winners(r.nums, r.better ?? null) : r.values.map(() => false);
      w.forEach((x, i) => x && (tally[i] += 1));
      return w;
    }),
  );
  const leader = tally.indexOf(Math.max(...tally));

  return (
    <>
      <Verdict bikes={bikes} tally={tally} leader={leader} />

      <div className="mt-8 grid gap-4" style={cols}>
        {bikes.map((b) => (
          <Link key={b.id} href={`/bikes/${b.id}/`} className="group rounded-2xl bg-surface-2/60 p-3 sm:p-6">
            <BikeArt bike={b} className="w-full transition-transform group-hover:scale-[1.03]" />
            <p className="mt-2 text-center text-[13px] leading-snug text-muted sm:text-[14px]">{b.tagline}</p>
          </Link>
        ))}
      </div>

      {blocks.map((bl, bi) => (
        <Block key={bi} title={bl.title}>
          {bl.rows.map((r, ri) => (
            <div key={ri} className="border-b border-line py-3.5 last:border-0">
              <p className="mb-1.5 text-[12.5px] text-muted" title={r.hint}>
                {r.label}
              </p>
              <div className="grid gap-4" style={cols}>
                {r.values.map((v, i) => {
                  const win = winMap[bi][ri][i];
                  return (
                    <div key={i} className={`flex items-center gap-1.5 text-[14px] tnum sm:text-[15px] ${win ? "font-semibold text-good" : "text-ink"}`}>
                      {v}
                      {win && <Crown size={14} className="shrink-0" aria-label="Winner" />}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </Block>
      ))}

      <Block title={<L en="On the road" bn="রাস্তায়" />}>
        <TextRow cols={cols} label="How it feels" values={bikes.map((b) => b.feel)} />
        <TextRow cols={cols} label="Quirks" values={bikes.map((b) => b.quirks)} tone="warn" />
        <TextRow cols={cols} label="Mechanic's note" values={bikes.map((b) => b.mechanicNote)} />
        <TextRow cols={cols} label="Best for" values={bikes.map((b) => b.bestFor.join(" · "))} />
      </Block>
    </>
  );
}

function Block({ title, children }: { title: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="card mt-6 px-5 py-2 sm:px-6">
      <h2 className="border-b border-line py-4 text-[17px] font-semibold tracking-tight text-ink">{title}</h2>
      {children}
    </section>
  );
}

function TextRow({ label, values, cols, tone }: { label: string; values: string[]; cols: React.CSSProperties; tone?: "warn" }) {
  return (
    <div className="border-b border-line py-4 last:border-0">
      <p className="mb-2 text-[12.5px] text-muted">{label}</p>
      <div className="grid gap-4" style={cols}>
        {values.map((v, i) => (
          <p key={i} className={`text-[13.5px] leading-relaxed sm:text-[14px] ${tone === "warn" ? "text-warn" : "text-ink-2"}`}>
            {v}
          </p>
        ))}
      </div>
    </div>
  );
}

function Verdict({ bikes, tally, leader }: { bikes: Bike[]; tally: number[]; leader: number }) {
  const pick = (f: (b: Bike) => number, high = true) => {
    const vals = bikes.map(f);
    const best = high ? Math.max(...vals) : Math.min(...vals);
    if (vals.every((v) => v === best)) return null;
    return bikes[vals.indexOf(best)];
  };
  const items = [
    { k: "Cheaper to run", b: pick((b) => ownershipCost(b, DEFAULT_COST_INPUT).runningPerMonth, false) },
    { k: "Quicker", b: pick((b) => b.powerPS / b.weightKg) },
    { k: "Easier to maintain", b: pick((b) => b.scores.mechanicFamiliarity + b.scores.partsAvailability + b.scores.reliability) },
    { k: "Better resale", b: pick((b) => b.scores.resale) },
    { k: "Comfier with a pillion", b: pick((b) => b.scores.pillion + b.scores.comfort) },
    { k: "Better on bad roads", b: pick((b) => b.scores.offroad) },
  ].filter((x) => x.b);

  return (
    <section className="mt-8 grid grid-cols-[minmax(0,1fr)] gap-4 lg:grid-cols-[1fr_1.4fr]">
      <div className="card flex flex-col justify-center bg-brand p-6 text-brand-ink" style={{ background: "var(--brand)" }}>
        <p className="text-[13px] font-medium opacity-80">
          <L en="Wins the most categories" bn="সবচেয়ে বেশি ক্যাটাগরিতে জয়ী" />
        </p>
        <p className="mt-1 text-[26px] font-semibold tracking-tight">{fullName(bikes[leader])}</p>
        <p className="mt-1 text-[14px] opacity-80 tnum">
          {bikes.map((b, i) => `${b.model} ${tally[i]}`).join("  ·  ")}
        </p>
        <p className="mt-4 text-[13px] leading-relaxed opacity-80">
          <L en="Counting wins isn't everything — read the quick verdicts to see which wins matter to you." bn="শুধু জয় গোনা যথেষ্ট নয় — আপনার কাছে কোনটা গুরুত্বপূর্ণ দেখুন।" />
        </p>
      </div>
      <div className="card grid gap-px overflow-hidden bg-line sm:grid-cols-2">
        {items.map((x) => (
          <div key={x.k} className="bg-surface p-4">
            <p className="text-[12.5px] text-muted">{x.k}</p>
            <p className="mt-0.5 text-[15px] font-semibold text-ink">{x.b!.model}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
