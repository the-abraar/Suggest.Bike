"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, ArrowRight, Calculator, Check, ChevronRight, ExternalLink, Info, Minus, Wrench } from "lucide-react";
import {
  CATEGORIES,
  SCORE_LABELS,
  absLabel,
  brakeLabel,
  ccLabel,
  formatBDT,
  formatLakh,
  fullName,
  getBike,
  similarBikes,
} from "@/lib/bikes";
import { DEFAULT_COST_INPUT, ownershipCost, registrationFor } from "@/lib/cost";
import { useLang, L } from "@/lib/i18n";
import type { Bike, Part, ScoreKey } from "@/lib/types";
import { BikeArt } from "@/components/BikeArt";
import { BikeCard, CompareButton, SaveButton, ScoreBar } from "@/components/ui";

const AVAIL: Record<Part["availability"], { label: string; cls: string }> = {
  everywhere: { label: "Everywhere", cls: "bg-good-soft text-good" },
  common: { label: "Common", cls: "bg-brand-soft text-brand" },
  "dealer-only": { label: "Dealer only", cls: "bg-warn-soft text-warn" },
  rare: { label: "Rare", cls: "bg-signal-soft text-signal" },
};

export function BikeDetail({ id }: { id: string }) {
  const bike = getBike(id)!;
  const { lang } = useLang();
  const reg = registrationFor(bike.engine.cc);
  const used = bike.status === "used-only";
  const router = useRouter();

  return (
    <div className="pb-8">
      {/* ---------- Hero ---------- */}
      <section className="border-b border-line bg-surface">
        <div className="container-x pb-10 pt-6">
          <nav className="flex items-center gap-1 text-[13px] text-muted" aria-label="Breadcrumb">
            <Link href="/bikes/" className="hover:text-ink">
              <L en="All bikes" bn="সব বাইক" />
            </Link>
            <ChevronRight size={14} className="text-faint" />
            <Link href={`/bikes/?brand=${encodeURIComponent(bike.brand)}`} className="hover:text-ink">
              {bike.brand}
            </Link>
            <ChevronRight size={14} className="text-faint" />
            <span className="truncate text-ink-2">{bike.model}</span>
          </nav>

          <div className="mt-6 grid grid-cols-[minmax(0,1fr)] items-center gap-8 lg:grid-cols-[1.15fr_1fr] lg:gap-14">
            <div className="relative rounded-3xl bg-surface-2/70 p-6 sm:p-10">
              <BikeArt bike={bike} className="mx-auto w-full max-w-[560px] animate-rise" />
              <span className="absolute bottom-4 right-5 text-[11px] text-faint">Illustration</span>
            </div>
            <div className="animate-rise" style={{ animationDelay: "80ms" }}>
              <div className="flex flex-wrap items-center gap-2 text-[13px] font-medium text-muted">
                <span>{bike.brand}</span>
                <span className="text-faint">·</span>
                <span>{lang === "bn" ? CATEGORIES[bike.category].bn : CATEGORIES[bike.category].en}</span>
                <span className="text-faint">·</span>
                <span>{ccLabel(bike)}</span>
                {used && <span className="rounded-full bg-warn-soft px-2 py-0.5 text-[11.5px] font-semibold text-warn">Used market only</span>}
              </div>
              <h1 className="mt-2 text-[34px] font-semibold leading-tight tracking-[-0.03em] text-ink sm:text-[44px]">{bike.model}</h1>
              {bike.variant && <p className="mt-1 text-[14.5px] text-muted">{bike.variant}</p>}
              <p className="mt-4 text-[17px] leading-relaxed text-ink-2">{bike.tagline}</p>

              <div className="mt-6 flex flex-wrap items-end gap-x-8 gap-y-3">
                <div>
                  <p className="text-[12.5px] text-muted">{used ? "Typical used price" : "Ex-showroom price"}</p>
                  <p className="text-[34px] font-semibold tracking-tight text-ink tnum">{formatBDT(bike.priceBDT)}</p>
                </div>
                {!used && (
                  <div className="pb-1.5">
                    <p className="text-[12.5px] text-muted">On-road (with 10-yr tax token)</p>
                    <p className="text-[18px] font-semibold text-ink-2 tnum">≈ {formatBDT(bike.priceBDT + reg.totalBDT10yr)}</p>
                  </div>
                )}
              </div>
              {bike.priceNote && <p className="mt-2 text-[13.5px] leading-relaxed text-muted">{bike.priceNote}</p>}
              <p className="mt-2 text-[12px] text-faint">
                Price checked {bike.priceAsOf}
                {bike.priceSource.startsWith("http") && (
                  <>
                    {" · "}
                    <a href={bike.priceSource} target="_blank" rel="noopener noreferrer" className="underline decoration-line-strong underline-offset-2 hover:text-ink">
                      source
                    </a>
                  </>
                )}
                {bike.distributor && <> · Sold by {bike.distributor}</>}
              </p>

              <div className="mt-6 flex flex-wrap gap-2">
                <CompareButton id={bike.id} />
                <SaveButton id={bike.id} withLabel />
                <Link href={`/cost/?bike=${bike.id}`} className="inline-flex h-10 items-center gap-1.5 rounded-lg bg-surface-2 px-3.5 text-[14px] font-medium text-ink-2 hover:bg-surface-3">
                  <Calculator size={16} /> <L en="True cost" bn="আসল খরচ" />
                </Link>
              </div>
            </div>
          </div>

          {/* key specs */}
          <dl className="mt-10 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-4 lg:grid-cols-8">
            <KeySpec k="Real mileage" v={`${bike.mileageKmpl[0]}–${bike.mileageKmpl[1]}`} u="kmpl" />
            <KeySpec k="Engine" v={`${Math.round(bike.engine.cc)}`} u="cc" />
            <KeySpec k="Power" v={`${bike.powerPS}`} u="PS" />
            <KeySpec k="Torque" v={`${bike.torqueNm}`} u="Nm" />
            <KeySpec k="Weight" v={`${bike.weightKg}`} u="kg" />
            <KeySpec k="Seat height" v={`${bike.seatHeightMm}`} u="mm" />
            <KeySpec k="Fuel tank" v={`${bike.fuelTankL}`} u="L" />
            <KeySpec k="Braking" v={bike.brakes.abs === "none" ? "No ABS" : bike.brakes.abs === "cbs" ? "CBS" : bike.brakes.abs === "dual" ? "2-ch ABS" : "1-ch ABS"} />
          </dl>
        </div>
      </section>

      {/* ---------- Body ---------- */}
      <div className="container-x mt-12 grid grid-cols-[minmax(0,1fr)] gap-12 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="min-w-0 space-y-14">
          <Section title={<L en="The verdict" bn="আমাদের রায়" />}>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-line bg-surface p-5">
                <p className="mb-3 text-[13px] font-semibold text-good">
                  <L en="Why you'll love it" bn="কেন ভালো লাগবে" />
                </p>
                <ul className="space-y-2.5">
                  {bike.pros.map((p) => (
                    <li key={p} className="flex gap-2.5 text-[14.5px] leading-snug text-ink-2">
                      <Check size={17} className="mt-0.5 shrink-0 text-good" /> {p}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-2xl border border-line bg-surface p-5">
                <p className="mb-3 text-[13px] font-semibold text-signal">
                  <L en="What might annoy you" bn="কী বিরক্ত করতে পারে" />
                </p>
                <ul className="space-y-2.5">
                  {bike.cons.map((p) => (
                    <li key={p} className="flex gap-2.5 text-[14.5px] leading-snug text-ink-2">
                      <Minus size={17} className="mt-0.5 shrink-0 text-signal" /> {p}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="mt-5 flex flex-wrap items-center gap-2">
              <span className="text-[13px] text-muted">
                <L en="Best for" bn="যাদের জন্য সেরা" />:
              </span>
              {bike.bestFor.map((b) => (
                <span key={b} className="rounded-full bg-brand-soft px-3 py-1 text-[13px] font-medium text-brand">
                  {b}
                </span>
              ))}
            </div>
          </Section>

          <Section title={<L en="How it rides" bn="চালাতে কেমন" />}>
            <div className="space-y-5 text-[15.5px] leading-relaxed text-ink-2">
              <p>{bike.feel}</p>
              <div className="flex gap-3 rounded-2xl border border-warn/25 bg-warn-soft p-4">
                <AlertTriangle size={19} className="mt-0.5 shrink-0 text-warn" />
                <div>
                  <p className="text-[13px] font-semibold text-warn">
                    <L en="Quirks owners talk about" bn="মালিকরা যা বলেন" />
                  </p>
                  <p className="mt-1 text-[14.5px] text-ink-2">{bike.quirks}</p>
                </div>
              </div>
              <p>
                <span className="font-semibold text-ink">
                  <L en="Brakes" bn="ব্রেক" />:
                </span>{" "}
                {bike.braking}
              </p>
            </div>
          </Section>

          <Section
            title={<L en="Owning it in Bangladesh" bn="বাংলাদেশে মালিকানা" />}
            sub={<L en="Scored 1–10 by Suggest.Bike from owner reports, mechanics and reviews." bn="মালিক, মেকানিক ও রিভিউ থেকে ১–১০ স্কোর।" />}
          >
            <div className="grid gap-x-10 gap-y-5 sm:grid-cols-2">
              {(Object.keys(SCORE_LABELS) as ScoreKey[]).map((k) => (
                <ScoreBar key={k} value={bike.scores[k]} label={lang === "bn" ? SCORE_LABELS[k].bn : SCORE_LABELS[k].en} hint={SCORE_LABELS[k].hint} />
              ))}
            </div>
            <div className="mt-6 flex gap-3 rounded-2xl bg-surface-2 p-4">
              <Wrench size={19} className="mt-0.5 shrink-0 text-brand" />
              <div>
                <p className="text-[13px] font-semibold text-ink">
                  <L en="Mechanic's note" bn="মেকানিকের কথা" />
                </p>
                <p className="mt-1 text-[14.5px] leading-relaxed text-ink-2">{bike.mechanicNote}</p>
              </div>
            </div>
          </Section>

          <Section
            title={<L en="Parts & service prices" bn="পার্টস ও সার্ভিসের দাম" />}
            sub={<L en="Approximate Dhaka market prices. District prices are usually within ±15%." bn="আনুমানিক ঢাকার বাজারদর। জেলায় সাধারণত ±১৫%।" />}
          >
            <div className="overflow-hidden rounded-2xl border border-line bg-surface">
              <table className="w-full text-left text-[14.5px]">
                <thead>
                  <tr className="border-b border-line bg-surface-2/60 text-[12.5px] text-muted">
                    <th className="px-4 py-3 font-medium">Part</th>
                    <th className="px-4 py-3 font-medium">Availability</th>
                    <th className="px-4 py-3 text-right font-medium">Price</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {bike.parts.map((p) => (
                    <tr key={p.name}>
                      <td className="px-4 py-3.5">
                        <span className="text-ink">{p.name}</span>
                        {p.note && <span className="mt-0.5 block text-[12.5px] leading-snug text-muted">{p.note}</span>}
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={`whitespace-nowrap rounded-full px-2 py-0.5 text-[12px] font-semibold ${AVAIL[p.availability].cls}`}>{AVAIL[p.availability].label}</span>
                      </td>
                      <td className="px-4 py-3.5 text-right font-semibold text-ink tnum">{formatBDT(p.priceBDT)}</td>
                    </tr>
                  ))}
                  <tr className="bg-surface-2/40">
                    <td className="px-4 py-3.5 text-ink">
                      Periodic service
                      <span className="mt-0.5 block text-[12.5px] text-muted">every ~{bike.serviceIntervalKm.toLocaleString("en-IN")} km, incl. engine oil</span>
                    </td>
                    <td className="px-4 py-3.5" />
                    <td className="px-4 py-3.5 text-right font-semibold text-ink tnum">{formatBDT(bike.avgServiceCostBDT)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Section>

          <Section title={<L en="Full specifications" bn="সম্পূর্ণ স্পেসিফিকেশন" />}>
            <SpecTable bike={bike} />
          </Section>

          {bike.sources.length > 0 && (
            <Section title={<L en="Sources" bn="তথ্যসূত্র" />}>
              <ul className="space-y-2">
                {bike.sources.map((s) => (
                  <li key={s}>
                    <a href={s} target="_blank" rel="noopener noreferrer" className="inline-flex max-w-full items-center gap-1.5 text-[13.5px] text-muted hover:text-brand">
                      <ExternalLink size={13} className="shrink-0" />
                      <span className="truncate">{s.replace(/^https?:\/\/(www\.)?/, "")}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </Section>
          )}
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <MonthlyCard bike={bike} />
        </aside>
      </div>

      <section className="container-x mt-20">
        <div className="mb-6 flex items-end justify-between gap-4">
          <h2 className="text-[24px] font-semibold tracking-tight text-ink">
            <L en="Also consider" bn="এগুলোও দেখুন" />
          </h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {similarBikes(bike).map((s) => (
            <BikeCard
              key={s.id}
              bike={s}
              footer={
                <span
                  role="link"
                  tabIndex={0}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    router.push(`/compare/?bikes=${bike.id},${s.id}`);
                  }}
                  className="-mx-5 -mb-5 mt-1 flex cursor-pointer items-center justify-between border-t border-line px-5 py-3 text-[13px] font-medium text-brand hover:bg-surface-2"
                >
                  Compare with {bike.model} <ArrowRight size={14} />
                </span>
              }
            />
          ))}
        </div>
      </section>
    </div>
  );
}

function KeySpec({ k, v, u }: { k: string; v: string; u?: string }) {
  return (
    <div className="bg-surface px-4 py-4">
      <dt className="text-[12px] text-muted">{k}</dt>
      <dd className="mt-1 text-[18px] font-semibold tracking-tight text-ink tnum">
        {v}
        {u && <span className="ml-1 text-[12.5px] font-medium text-muted">{u}</span>}
      </dd>
    </div>
  );
}

function Section({ title, sub, children }: { title: React.ReactNode; sub?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-[22px] font-semibold tracking-tight text-ink">{title}</h2>
      {sub && <p className="mt-1 text-[14px] text-muted">{sub}</p>}
      <div className="mt-5">{children}</div>
    </section>
  );
}

function SpecTable({ bike }: { bike: Bike }) {
  const e = bike.engine;
  const rows: [string, string | undefined][] = [
    ["Engine", `${e.cc}cc, ${e.cylinders}-cylinder, ${e.stroke}-stroke${e.valves ? `, ${e.valves}-valve` : ""}`],
    ["Cooling", { air: "Air-cooled", oil: "Oil-cooled", liquid: "Liquid-cooled" }[e.cooling]],
    ["Fuel system", e.fuel === "fi" ? "Fuel injection" : "Carburettor"],
    ["Max power", `${bike.powerPS} PS${bike.powerRpm ? ` @ ${bike.powerRpm.toLocaleString()} rpm` : ""}`],
    ["Max torque", `${bike.torqueNm} Nm${bike.torqueRpm ? ` @ ${bike.torqueRpm.toLocaleString()} rpm` : ""}`],
    ["Gearbox", bike.gears === 0 ? "CVT automatic" : `${bike.gears}-speed manual`],
    ["Top speed", bike.topSpeedKmh ? `${bike.topSpeedKmh} km/h (approx.)` : undefined],
    ["Real-world mileage", `${bike.mileageKmpl[0]}–${bike.mileageKmpl[1]} kmpl`],
    ["Range on a full tank", `≈ ${Math.round(bike.fuelTankL * bike.mileageKmpl[0])}–${Math.round(bike.fuelTankL * bike.mileageKmpl[1])} km`],
    ["Kerb weight", `${bike.weightKg} kg`],
    ["Seat height", `${bike.seatHeightMm} mm`],
    ["Ground clearance", bike.groundClearanceMm ? `${bike.groundClearanceMm} mm` : undefined],
    ["Fuel tank", `${bike.fuelTankL} L`],
    ["Brakes", `${brakeLabel(bike)} · ${absLabel(bike)}`],
    ["Tyres", bike.tyres ? `${bike.tyres.front} / ${bike.tyres.rear}${bike.tubeless ? ", tubeless" : ", tube-type"}` : bike.tubeless ? "Tubeless" : "Tube-type"],
    ["Suspension", bike.suspension ? `${bike.suspension.front} / ${bike.suspension.rear}` : undefined],
    ["Distributor", bike.distributor],
    ["Assembled in Bangladesh", bike.assembledInBD === undefined ? undefined : bike.assembledInBD ? "Yes" : "No (imported)"],
  ];
  return (
    <dl className="overflow-hidden rounded-2xl border border-line bg-surface">
      {rows
        .filter((r): r is [string, string] => !!r[1])
        .map(([k, v], i) => (
          <div key={k} className={`grid grid-cols-[minmax(120px,40%)_1fr] gap-4 px-4 py-3 text-[14.5px] ${i % 2 ? "bg-surface-2/40" : ""}`}>
            <dt className="text-muted">{k}</dt>
            <dd className="text-ink">{v}</dd>
          </div>
        ))}
    </dl>
  );
}

function MonthlyCard({ bike }: { bike: Bike }) {
  const [km, setKm] = useState(25);
  const c = ownershipCost(bike, { ...DEFAULT_COST_INPUT, kmPerDay: km, includeDepreciation: false });
  const fill = ((km - 5) / (120 - 5)) * 100;
  const months = DEFAULT_COST_INPUT.years * 12;
  const rows = [
    { k: "Fuel", v: c.fuel / months },
    { k: "Service", v: c.service / months },
    { k: "Wear parts", v: c.wear / months },
  ];
  return (
    <div className="card p-5 shadow-md">
      <p className="text-[13px] font-semibold text-ink">
        <L en="Monthly running cost" bn="মাসিক চলার খরচ" />
      </p>
      <p className="mt-2 text-[34px] font-semibold tracking-tight text-ink tnum">{formatBDT(c.runningPerMonth)}</p>
      <p className="text-[12.5px] text-muted">at {km} km/day, octane ৳{DEFAULT_COST_INPUT.fuelPrice}/L</p>
      <input
        type="range"
        className="range mt-4"
        min={5}
        max={120}
        step={5}
        value={km}
        aria-label="Kilometres per day"
        style={{ ["--fill" as string]: `${fill}%` }}
        onChange={(e) => setKm(Number(e.target.value))}
      />
      <div className="flex justify-between text-[11.5px] text-faint">
        <span>5 km</span>
        <span>120 km/day</span>
      </div>
      <div className="mt-4 space-y-2 border-t border-line pt-4">
        {rows.map((r) => (
          <div key={r.k} className="flex justify-between text-[14px]">
            <span className="text-muted">{r.k}</span>
            <span className="font-medium text-ink tnum">{formatBDT(r.v)}</span>
          </div>
        ))}
      </div>
      <Link href={`/cost/?bike=${bike.id}`} className="btn-primary mt-5 w-full">
        <L en="Full 3-year cost" bn="৩ বছরের পূর্ণ খরচ" /> <ArrowRight size={16} />
      </Link>
      <p className="mt-3 flex gap-1.5 text-[12px] leading-snug text-faint">
        <Info size={13} className="mt-0.5 shrink-0" /> Excludes the bike itself, registration and resale loss — see the full calculator.
      </p>
      <p className="mt-4 border-t border-line pt-4 text-[13px] text-muted">
        Price {formatLakh(bike.priceBDT)} · {fullName(bike)}
      </p>
    </div>
  );
}
