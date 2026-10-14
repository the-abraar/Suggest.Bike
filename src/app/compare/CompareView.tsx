"use client";

import Link from "@/components/LangLink";
import { useEffect, useMemo, useState } from "react";
import { Plus, Search, X } from "lucide-react";
import { BIKES, SCORE_LABELS, avgMileage, ccLabel, formatBDT, formatLakh, fullName, getBike, mileageText, partLabel, tagline } from "@/lib/bikes";
import { DEFAULT_COST_INPUT, onRoadPrice, ownershipCost } from "@/lib/cost";
import { cardEmi } from "@/lib/fund";
import { isUsedOption } from "@/lib/match";
import { OfferTag } from "@/components/Dated";
import { pairHref, popularPairs } from "@/lib/curated";
import { langHref } from "@/lib/site";
import { compareIds, useStore, MAX_COMPARE } from "@/lib/store";
import { useLang, useTx } from "@/lib/i18n";
import type { Bike, BikeLite, ScoreKey } from "@/lib/types";
import { BikeArt } from "@/components/BikeArt";
import { searchBikes } from "@/lib/search";
import { Approx, ShareButton, WithSearchParams } from "@/components/ui";

/** `pair`: a popular pair page (/compare/a-vs-b/), prerendered with both bikes instead of reading the query string. */
export function CompareView({ pair }: { pair?: string[] }) {
  if (pair) return <Compare params={new URLSearchParams({ bikes: pair.join(",") })} pair={pair} />;
  return <WithSearchParams render={(params) => <Compare params={params} />} />;
}

function Compare({ params, pair }: { params: URLSearchParams; pair?: string[] }) {
  const { lang } = useLang();
  const tx = useTx();
  const { compare, setCompare, ready } = useStore();
  const [ids, setIds] = useState<string[]>(pair ?? []);
  const [ownsTray, setOwnsTray] = useState(false);

  // URL wins on first load; otherwise fall back to the compare tray. A shared link fills the tray only when it is empty
  // (or already the same bikes), so opening one never replaces the visitor's own picks (critique B7).
  useEffect(() => {
    if (!ready) return;
    const fromUrl = compareIds((params.get("bikes") || "").split(","));
    const owns = !fromUrl.length || !compare.length || fromUrl.join() === compare.join();
    setIds(fromUrl.length ? fromUrl : compare);
    setOwnsTray(owns);
    if (owns && fromUrl.length) setCompare(fromUrl);
  }, [ready, params]); // eslint-disable-line react-hooks/exhaustive-deps

  const update = (next: string[]) => {
    setIds(next);
    if (ownsTray) setCompare(next);
    // A pair page that changes bikes moves to the generic /compare/ URL so the address matches what is shown.
    const base = pair ? langHref("/compare/", lang) : window.location.pathname;
    window.history.replaceState(null, "", next.length ? `${base}?bikes=${next.join(",")}` : base);
  };

  const bikes = ids.map((id) => getBike(id)).filter((b): b is BikeLite => !!b);

  return (
    <div className="container-x pt-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-[32px] font-semibold tracking-[-0.03em] text-ink sm:text-[40px]">
            {bikes.length >= 2
              ? bikes.map((b, i) => (
                  <span key={b.id}>
                    {i > 0 && <span className="text-faint"> {tx("vs", "বনাম")} </span>}
                    {b.model}
                  </span>
                ))
              : tx("Compare bikes", "বাইক তুলনা")}
          </h1>
          <p className="mt-1.5 text-[15.5px] text-muted">
            {tx("Side by side, including the things spec sheets leave out. The lowest and highest measured values are marked.", "পাশাপাশি তুলনা — স্পেক শিটে যা থাকে না সেটাও। মাপা মানগুলোর সর্বনিম্ন ও সর্বোচ্চ চিহ্নিত।")}
          </p>
        </div>
        {bikes.length >= 2 && <ShareButton title={`${bikes.map((b) => b.model).join(" vs ")} — Suggest.Bike`} className="border border-line-strong bg-surface" />}
      </div>

      {/* slots */}
      <div className="sticky top-16 z-30 -mx-4 mt-8 border-b border-line bg-bg/90 px-4 pb-4 pt-3 backdrop-blur-xl sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
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
                <p className="flex flex-wrap items-center gap-1.5 text-[13px] text-muted tnum">
                  {formatLakh(onRoadPrice(b), lang)} {b.status === "used-only" ? tx("used", "পুরনো") : tx("on-road", "অন-রোড")}
                  <OfferTag bikeId={b.id} />
                </p>
              </div>
              <button
                onClick={() => update(ids.filter((x) => x !== b.id))}
                className="grid h-7 w-7 shrink-0 place-items-center rounded-lg text-faint hover:bg-surface-2 hover:text-ink sm:h-8 sm:w-8"
                aria-label={tx(`Remove ${b.model}`, `${b.model} সরান`)}
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

      {bikes.length < 2 ? <EmptyState /> : <Table bikes={bikes} />}
    </div>
  );
}

function AddSlot({ exclude, onPick }: { exclude: string[]; onPick: (id: string) => void }) {
  const { lang } = useLang();
  const tx = useTx();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const results = useMemo(() => (q ? searchBikes(q, 8) : []).filter((b) => !exclude.includes(b.id)), [q, exclude]);
  if (!open)
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-line-strong text-[14px] font-medium text-muted transition-colors hover:border-brand hover:text-brand sm:h-[74px]"
      >
        <Plus size={18} /> {tx("Add a bike", "বাইক যোগ করুন")}
      </button>
    );
  return (
    <div className="relative" onBlur={(e) => !e.currentTarget.contains(e.relatedTarget) && setOpen(false)}>
      <div className="relative">
        <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-faint" />
        <input
          autoFocus
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && results[0]) onPick(results[0].id);
            if (e.key === "Escape") setOpen(false);
          }}
          placeholder={tx("Type a bike name…", "বাইকের নাম লিখুন…")}
          aria-label={tx("Add a bike", "বাইক যোগ করুন")}
          className="input h-12 rounded-2xl pl-10 sm:h-[74px]"
        />
      </div>
      {results.length > 0 && (
        <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-50 overflow-hidden rounded-2xl border border-line bg-surface shadow-lg">
          {results.map((b) => (
            <button key={b.id} onMouseDown={(e) => e.preventDefault()} onClick={() => onPick(b.id)} className="flex w-full items-center gap-3 px-3 py-2.5 text-left hover:bg-surface-2 focus-visible:bg-surface-2">
              <span className="h-8 w-12 shrink-0">
                <BikeArt bike={b} shadow={false} className="h-full w-full" />
              </span>
              <span className="min-w-0 flex-1 truncate text-[14px] font-medium text-ink">{fullName(b)}</span>
              <span className="text-[13px] text-muted tnum">{formatLakh(onRoadPrice(b), lang)}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function EmptyState() {
  const tx = useTx();
  return (
    <div className="mt-10">
      <p className="eyebrow mb-4">{tx("Or start with a popular match-up", "অথবা জনপ্রিয় তুলনা দিয়ে শুরু করুন")}</p>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {popularPairs().map(([a, b]) => (
          <Link
            key={a.id + b.id}
            href={pairHref(a.id, b.id)}
            className="card flex items-center justify-between gap-3 p-4 text-left transition-all hover:border-line-strong hover:shadow-md"
          >
            <span className="text-[14.5px] font-medium text-ink">
              {a.model} <span className="text-faint">{tx("vs", "বনাম")}</span> {b.model}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}

/* ---------------- Comparison table ---------------- */

type Better = "high" | "low" | null;

/** Marks the lowest (better="low") or highest value. Only for measured specs, never editorial scores. */
function extremes(values: (number | null)[], better: Better) {
  if (!better) return values.map(() => false);
  const nums = values.filter((v): v is number => v !== null);
  if (nums.length < 2) return values.map(() => false);
  const best = better === "high" ? Math.max(...nums) : Math.min(...nums);
  const allSame = nums.every((n) => n === best);
  return values.map((v) => !allSame && v === best);
}

/** Long-form text isn't in the slim index; fetch the full records only when comparing. */
function useFullBikes(ids: string[]) {
  const [full, setFull] = useState<Record<string, Bike>>({});
  const key = ids.join(",");
  useEffect(() => {
    let alive = true;
    Promise.all(ids.map((id) => fetch(`/data/bikes/${id}.json`).then((r) => (r.ok ? (r.json() as Promise<Bike>) : null)).catch(() => null))).then((list) => {
      if (!alive) return;
      setFull(Object.fromEntries(list.filter((b): b is Bike => !!b).map((b) => [b.id, b])));
    });
    return () => {
      alive = false;
    };
  }, [key]); // eslint-disable-line react-hooks/exhaustive-deps
  return full;
}

type RowSpec = { label: React.ReactNode; values: React.ReactNode[]; nums?: (number | null)[]; better?: Better; hint?: string };

function Table({ bikes }: { bikes: BikeLite[] }) {
  const { lang } = useLang();
  const tx = useTx();
  const full = useFullBikes(bikes.map((b) => b.id));
  const costs = bikes.map((b) => ownershipCost(b, DEFAULT_COST_INPUT));
  const cols = { gridTemplateColumns: `repeat(${bikes.length}, minmax(0, 1fr))` };
  const abs = lang === "bn" ? ({ none: "ABS নেই", single: "১-চ্যানেল ABS", dual: "২-চ্যানেল ABS", cbs: "CBS" } as const) : ({ none: "no ABS", single: "1-ch ABS", dual: "2-ch ABS", cbs: "CBS" } as const);
  // EVs: their mileageKmpl and fuelTankL are derived petrol-cost equivalents, so show range and battery instead.
  const anyEv = bikes.some((b) => b.ev);
  const range = (b: BikeLite) => Math.round(b.ev ? (b.ev.realRangeKm[0] + b.ev.realRangeKm[1]) / 2 : b.fuelTankL * avgMileage(b));
  const drum = (t: "disc" | "drum") => (t === "disc" ? tx("Disc", "ডিস্ক") : tx("Drum", "ড্রাম"));

  const blocks: { title: React.ReactNode; rows: RowSpec[] }[] = [
    {
      title: tx("Money", "টাকা"),
      rows: [
        {
          label: tx("On-road, with 2-year tax token", "অন-রোড, ২ বছরের ট্যাক্স টোকেনসহ"),
          values: bikes.map((b) => (
            <>
              {formatBDT(onRoadPrice(b))}
              {b.status === "used-only" && <span className="block text-[12px] font-normal text-muted">{tx("used, asking price", "পুরনো, চাওয়া দাম")}</span>}
              <OfferTag bikeId={b.id} className="mt-1 inline-block" />
            </>
          )),
          nums: bikes.map((b) => onRoadPrice(b)),
          better: "low",
        },
        { label: tx("Ex-showroom", "শোরুম মূল্য"), values: bikes.map((b) => (b.status === "used-only" ? "—" : formatBDT(b.priceBDT))) },
        {
          label: tx("12-month card EMI", "১২ মাসের কার্ড কিস্তি"),
          values: bikes.map((b) => (isUsedOption({ bike: b }) ? "—" : `${formatBDT(cardEmi(b.priceBDT))}${tx("/mo", "/মাস")}`)),
        },
        {
          label: tx("Running cost / month (25 km/day)", "চলার খরচ / মাস (দিনে ২৫ km)"),
          values: costs.map((c) => formatBDT(c.runningPerMonth)),
          nums: costs.map((c) => Math.round(c.runningPerMonth)),
          better: "low",
        },
        {
          label: tx("True cost / month incl. resale loss (3 yrs)", "আসল খরচ / মাস, রিসেল লসসহ (৩ বছর)"),
          values: costs.map((c) => formatBDT(c.perMonth)),
        },
        {
          label: tx("Used price, ~1 year old (bikroy)", "পুরনো দাম, ~১ বছর (bikroy)"),
          values: bikes.map((b) => (b.usedPrice?.y1 ? formatBDT(b.usedPrice.y1) : "—")),
        },
        { label: tx("Est. resale after 3 years", "৩ বছর পর আনুমানিক রিসেল"), values: costs.map((c) => formatBDT(c.resaleValue)) },
        {
          label: tx("Periodic service", "নিয়মিত সার্ভিস"),
          values: bikes.map((b) => `${formatBDT(b.avgServiceCostBDT)} / ${b.serviceIntervalKm.toLocaleString("en-IN")} km`),
        },
      ],
    },
    {
      title: tx("Engine & performance", "ইঞ্জিন ও পারফরম্যান্স"),
      rows: [
        { label: tx("Engine", "ইঞ্জিন"), values: bikes.map((b) => (b.ev ? tx(`Electric · ${b.ev.motorW / 1000} kW motor`, `ইলেকট্রিক · ${b.ev.motorW / 1000} kW মোটর`) : `${ccLabel(b)} · ${b.engine.fuel === "fi" ? "FI" : tx("Carb", "কার্ব")} · ${b.engine.cooling}-cooled`)) },
        { label: tx("Power", "পাওয়ার"), values: bikes.map((b) => `${b.powerPS} PS`), nums: bikes.map((b) => b.powerPS), better: "high" },
        { label: tx("Torque", "টর্ক"), values: bikes.map((b) => `${b.torqueNm} Nm`), nums: bikes.map((b) => b.torqueNm), better: "high" },
        {
          label: tx("Power-to-weight", "পাওয়ার-টু-ওয়েট"),
          values: bikes.map((b) => `${Math.round((b.powerPS / b.weightKg) * 1000)} PS/t`),
          nums: bikes.map((b) => Math.round((b.powerPS / b.weightKg) * 1000)),
          better: "high",
        },
        { label: tx("Gearbox", "গিয়ারবক্স"), values: bikes.map((b) => (b.gears ? tx(`${b.gears}-speed`, `${b.gears}-স্পিড`) : "CVT")) },
        {
          label: (
            <>
              {anyEv ? tx("Real-world mileage / range", "আসল মাইলেজ / রেঞ্জ") : tx("Real-world mileage", "আসল মাইলেজ")}
              <Approx />
            </>
          ),
          values: bikes.map(mileageText),
          nums: bikes.map((b) => (b.ev ? null : avgMileage(b))),
          better: "high",
        },
        {
          label: anyEv ? tx("Range per tank / charge", "এক ট্যাংক / চার্জে রেঞ্জ") : tx("Range per tank", "এক ট্যাংকে রেঞ্জ"),
          values: bikes.map((b) => `≈ ${range(b)} km`),
          nums: bikes.map(range),
          better: anyEv && bikes.some((b) => !b.ev) ? null : "high", // a tank and a charge are not comparable
        },
      ],
    },
    {
      title: tx("Body & safety", "বডি ও নিরাপত্তা"),
      rows: [
        { label: tx("Kerb weight", "ওজন"), values: bikes.map((b) => `${b.weightKg} kg`), nums: bikes.map((b) => b.weightKg), better: "low" },
        {
          label: tx("Seat height", "সিটের উচ্চতা"),
          values: bikes.map((b) => `${b.seatHeightMm} mm`),
          nums: bikes.map((b) => b.seatHeightMm),
          better: "low",
          hint: tx("Lower is easier to flat-foot", "নিচু হলে পা মাটিতে রাখা সহজ"),
        },
        {
          label: tx("Ground clearance", "গ্রাউন্ড ক্লিয়ারেন্স"),
          values: bikes.map((b) => (b.groundClearanceMm ? `${b.groundClearanceMm} mm` : "—")),
          nums: bikes.map((b) => b.groundClearanceMm ?? null),
          better: "high",
        },
        {
          label: anyEv ? tx("Fuel tank / battery", "ফুয়েল ট্যাংক / ব্যাটারি") : tx("Fuel tank", "ফুয়েল ট্যাংক"),
          values: bikes.map((b) => (b.ev ? `${b.ev.batteryKWh} kWh` : `${b.fuelTankL} L`)),
          nums: bikes.map((b) => (b.ev ? null : b.fuelTankL)),
          better: "high",
        },
        {
          label: tx("Brakes", "ব্রেক"),
          values: bikes.map((b) => `${drum(b.brakes.front)}/${drum(b.brakes.rear)} · ${abs[b.brakes.abs]}`),
        },
        {
          label: tx("Tyres", "টায়ার"),
          values: bikes.map((b) => (b.tubeless ? tx("Tubeless", "টিউবলেস") : tx("Tube-type", "টিউব"))),
        },
      ],
    },
    {
      title: (
        <>
          {tx("Ownership scores", "মালিকানা স্কোর")}
          <span className="mt-0.5 block text-[12.5px] font-normal text-muted">
            {tx("Editorial scores, not measurements: no winner declared.", "সম্পাদকীয় স্কোর, মাপা নয়: কোনো বিজয়ী ঘোষণা নেই।")}{" "}
            <Link href="/method/" className="text-brand underline underline-offset-2">{tx("See method", "পদ্ধতি দেখুন")}</Link>
          </span>
        </>
      ),
      rows: (Object.keys(SCORE_LABELS) as ScoreKey[]).map((k) => ({
        label: lang === "bn" ? SCORE_LABELS[k].bn : SCORE_LABELS[k].en,
        hint: lang === "bn" ? SCORE_LABELS[k].hintBn : SCORE_LABELS[k].hint,
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
      title: (
        <>
          {tx("Parts prices", "পার্টসের দাম")}
          <Approx />
        </>
      ),
      rows: bikes[0].parts.map((p, idx) => ({
        label: bikes.every((b) => partLabel(b, p.name, lang) === partLabel(bikes[0], p.name, lang))
          ? partLabel(bikes[0], p.name, lang)
          : bikes.map((b) => partLabel(b, p.name, lang)).join(" / "),
        values: bikes.map((b) => (b.parts[idx] ? formatBDT(b.parts[idx].priceBDT) : "—")),
      })),
    },
  ];

  const markMap = blocks.map((bl) => bl.rows.map((r) => (r.nums ? extremes(r.nums, r.better ?? null) : r.values.map(() => false))));
  const two = bikes.length === 2;
  const markLabel = (better: Better) =>
    better === "low" ? tx(two ? "↓ lower" : "↓ lowest", two ? "↓ কম" : "↓ সবচেয়ে কম") : tx(two ? "↑ higher" : "↑ highest", two ? "↑ বেশি" : "↑ সবচেয়ে বেশি");

  const text = (b: BikeLite, k: "feel" | "quirks" | "mechanicNote") => {
    const f = full[b.id];
    if (!f) return null;
    return (lang === "bn" ? f.bn?.[k] : undefined) ?? f[k];
  };
  const bestFor = (b: BikeLite) => {
    const f = full[b.id];
    if (!f) return null;
    return ((lang === "bn" ? f.bn?.bestFor : undefined) ?? f.bestFor).join(" · ");
  };

  return (
    <>
      <Verdict bikes={bikes} />

      <div className="mt-8 grid gap-4" style={cols}>
        {bikes.map((b) => (
          <Link key={b.id} href={`/bikes/${b.id}/`} className="group rounded-2xl bg-surface-2/60 p-3 sm:p-6">
            <BikeArt bike={b} className="w-full transition-transform group-hover:scale-[1.03]" />
            <p className="mt-2 hidden text-center text-[13px] leading-snug text-muted sm:block sm:text-[14px]">{tagline(b, lang)}</p>
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
                  const mark = markMap[bi][ri][i];
                  return (
                    <div key={i} className={`flex flex-wrap items-center gap-x-1.5 text-[14px] tnum text-ink sm:text-[15px] ${mark ? "font-semibold" : ""}`}>
                      {v}
                      {mark && <span className="text-[12px] font-medium text-muted">{markLabel(r.better ?? null)}</span>}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </Block>
      ))}

      <Block title={tx("On the road", "রাস্তায়")}>
        <TextRow bikes={bikes} cols={cols} label={tx("How it feels", "চালাতে কেমন")} values={bikes.map((b) => text(b, "feel"))} />
        <TextRow bikes={bikes} cols={cols} label={tx("Quirks", "সমস্যা যা বলা হয়")} values={bikes.map((b) => text(b, "quirks"))} tone="warn" />
        <TextRow bikes={bikes} cols={cols} label={tx("Mechanic's note", "মেকানিকের কথা")} values={bikes.map((b) => text(b, "mechanicNote"))} />
        <TextRow bikes={bikes} cols={cols} label={tx("Best for", "যাদের জন্য সেরা")} values={bikes.map(bestFor)} />
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

/** Columns on desktop; stacked with bike names on phones so long text stays readable. */
function TextRow({ bikes, label, values, cols, tone }: { bikes: BikeLite[]; label: string; values: (string | null)[]; cols: React.CSSProperties; tone?: "warn" }) {
  const cls = `text-[14px] leading-relaxed ${tone === "warn" ? "text-warn" : "text-ink-2"}`;
  return (
    <div className="border-b border-line py-4 last:border-0">
      <p className="mb-2 text-[12.5px] text-muted">{label}</p>
      <div className="hidden gap-4 sm:grid" style={cols}>
        {values.map((v, i) => (v === null ? <Skeleton key={i} /> : <p key={i} className={cls}>{v}</p>))}
      </div>
      <div className="space-y-3 sm:hidden">
        {values.map((v, i) => (
          <div key={i}>
            <p className="text-[12.5px] font-semibold text-ink">{bikes[i].model}</p>
            {v === null ? <Skeleton /> : <p className={cls}>{v}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}

function Skeleton() {
  return (
    <div className="space-y-2 py-1" aria-hidden>
      <div className="h-3 w-full animate-pulse rounded bg-surface-3" />
      <div className="h-3 w-4/5 animate-pulse rounded bg-surface-3" />
    </div>
  );
}

/** Quick verdicts from measured numbers only (price, running cost, power, mileage). */
function Verdict({ bikes }: { bikes: BikeLite[] }) {
  const tx = useTx();
  const petrol = bikes.filter((b) => !b.ev);
  const pick = (f: (b: BikeLite) => number, high = true, list = bikes) => {
    const vals = list.map(f);
    const best = high ? Math.max(...vals) : Math.min(...vals);
    if (vals.every((v) => v === best)) return null;
    return list[vals.indexOf(best)];
  };
  const items = [
    { k: tx("Cheaper to buy", "কিনতে সস্তা"), b: pick((b) => onRoadPrice(b), false) },
    { k: tx("Cheaper to run", "চালাতে সস্তা"), b: pick((b) => ownershipCost(b, DEFAULT_COST_INPUT).runningPerMonth, false) },
    { k: tx("Quicker", "বেশি দ্রুত"), b: pick((b) => b.powerPS / b.weightKg) },
    { k: tx("Better mileage", "মাইলেজ বেশি"), b: petrol.length > 1 ? pick(avgMileage, true, petrol) : null }, // kmpl means nothing for an EV
  ].filter((x) => x.b);

  return (
    <section className="mt-8">
      <div className="card grid gap-px overflow-hidden bg-line sm:grid-cols-2 lg:grid-cols-4">
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
