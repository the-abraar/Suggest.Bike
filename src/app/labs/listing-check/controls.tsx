"use client";

import { useId } from "react";

export function Field({ label, hint, children }: { label: React.ReactNode; hint?: React.ReactNode; children: (id: string) => React.ReactNode }) {
  const id = useId();
  return (
    <div className="min-w-0">
      <label htmlFor={id} className="mb-1.5 block text-[13.5px] font-medium text-ink-2">
        {label}
      </label>
      {children(id)}
      {hint && <p className="mt-1.5 text-[12.5px] leading-snug text-muted">{hint}</p>}
    </div>
  );
}

export function numFrom(s: string): number | null {
  const d = s.replace(/[০-৯]/g, (c) => String("০১২৩৪৫৬৭৮৯".indexOf(c))).replace(/[^\d]/g, "");
  return d === "" ? null : Math.min(Number(d), 99999999);
}

export function NumInput({ id, value, onChange, placeholder }: { id: string; value: number | null; onChange: (n: number | null) => void; placeholder?: string }) {
  return (
    <input id={id} className="input tnum" inputMode="numeric" autoComplete="off" placeholder={placeholder} value={value ?? ""} onChange={(e) => onChange(numFrom(e.target.value))} />
  );
}

export function Choice<T extends string>({
  legend, value, options, onChange,
}: {
  legend: React.ReactNode; value: T; options: { v: T; label: string }[]; onChange: (v: T) => void;
}) {
  return (
    <fieldset className="min-w-0">
      <legend className="mb-1.5 text-[13.5px] font-medium text-ink-2">{legend}</legend>
      <div role="radiogroup" className="flex flex-wrap gap-1.5">
        {options.map((o) => (
          <button
            key={o.v}
            type="button"
            role="radio"
            aria-checked={value === o.v}
            data-active={value === o.v}
            onClick={() => onChange(o.v)}
            className="chip h-9 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          >
            {o.label}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

export function Check({ checked, onChange, label, hint }: { checked: boolean; onChange: (v: boolean) => void; label: React.ReactNode; hint?: React.ReactNode }) {
  const id = useId();
  return (
    <div className="flex items-start gap-3 rounded-xl border border-line bg-surface p-3 has-[:checked]:border-brand has-[:checked]:bg-brand-soft">
      <input id={id} type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="mt-0.5 h-5 w-5 shrink-0 accent-[var(--brand)]" />
      <label htmlFor={id} className="min-w-0 cursor-pointer text-[14px] leading-snug text-ink">
        {label}
        {hint && <span className="mt-0.5 block text-[12.5px] text-muted">{hint}</span>}
      </label>
    </div>
  );
}

export function Section({ title, sub, children }: { title: React.ReactNode; sub?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="card p-4 sm:p-5">
      <h2 className="text-[17px] font-semibold tracking-tight text-ink">{title}</h2>
      {sub && <p className="mt-1 text-[13.5px] leading-snug text-muted">{sub}</p>}
      <div className="mt-4 grid gap-4">{children}</div>
    </section>
  );
}
