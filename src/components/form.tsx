"use client";

import { useMemo, useState } from "react";
import { formatBDT, formatLakh, fullName } from "@/lib/bikes";
import { useLang, useTx } from "@/lib/i18n";
import { BikeArt } from "@/components/BikeArt";
import { searchBikes } from "@/components/SearchBox";
import type { BikeLite } from "@/lib/types";

/** Form controls shared by the calculator pages (/cost, /fund). */

export function BikePicker({ bike, onPick }: { bike: BikeLite; onPick: (b: BikeLite) => void }) {
  const { lang } = useLang();
  const tx = useTx();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const results = useMemo(() => searchBikes(q, 6), [q]);
  return (
    <div className="relative">
      <p className="mb-2 text-[13px] font-medium text-ink-2">{tx("Bike", "বাইক")}</p>
      {!open ? (
        <button onClick={() => setOpen(true)} className="flex w-full items-center gap-3 rounded-xl border border-line-strong p-2.5 text-left transition-colors hover:border-ink/30">
          <span className="h-10 w-16 shrink-0">
            <BikeArt bike={bike} shadow={false} className="h-full w-full" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-[14.5px] font-semibold text-ink">{fullName(bike)}</span>
            <span className="block text-[12.5px] text-muted tnum">{formatBDT(bike.priceBDT)}</span>
          </span>
          <span className="text-[12.5px] font-medium text-brand">{tx("Change", "বদলান")}</span>
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
            placeholder={tx("Search a bike…", "বাইক খুঁজুন…")}
            aria-label={tx("Search a bike", "বাইক খুঁজুন")}
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
                  <span className="text-[13px] text-muted tnum">{formatLakh(b.priceBDT, lang)}</span>
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export function Field({ label, value, children }: { label: string; value?: string; children: React.ReactNode }) {
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

export function Range({ min, max, step, value, onChange, label }: { min: number; max: number; step: number; value: number; onChange: (v: number) => void; label: string }) {
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

export function Switch({ on, onChange, label, sub }: { on: boolean; onChange: (v: boolean) => void; label: string; sub: string }) {
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


/** Taka amount box; shows the lakh-grouped value underneath as you type. */
export function MoneyInput({ value, onChange, label, step = 1000 }: { value: number; onChange: (v: number) => void; label: string; step?: number }) {
  return (
    <input
      type="number"
      inputMode="numeric"
      min={0}
      step={step}
      className="input h-11 tnum"
      value={value}
      aria-label={label}
      onChange={(e) => onChange(e.target.value === "" ? 0 : Math.max(0, Number(e.target.value)))}
    />
  );
}

/** Pill-style single choice, as used for New/Used and tenure pickers. */
export function Segmented<T extends string | number | boolean>({ options, value, onChange }: { options: { v: T; label: string }[]; value: T; onChange: (v: T) => void }) {
  return (
    <div className="grid gap-1 rounded-xl bg-surface-2 p-1" style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}>
      {options.map((o) => (
        <button
          key={String(o.v)}
          onClick={() => onChange(o.v)}
          aria-pressed={value === o.v}
          className={`h-9 rounded-lg text-[13.5px] font-medium transition-all ${value === o.v ? "bg-surface text-ink shadow-sm" : "text-muted hover:text-ink"}`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
