"use client";

import { useMemo } from "react";
import { formatBDT } from "@/lib/bikes";
import { useTx } from "@/lib/i18n";
import { Field, Segmented } from "@/components/form";
import { Approx } from "@/components/ui";
import { CONDITIONS, PAPERS, estimateValue, type Condition, type PaperStatus, type ValueBike } from "@/lib/usedcheck/value";

export interface ValueForm { yearMade: number; km: number; owners: number; paper: PaperStatus; condition: Condition }

export function ValuePanel({
  bike,
  form,
  onChange,
  problems,
  coverage,
  nowYear,
}: {
  bike: ValueBike;
  form: ValueForm;
  onChange: (f: ValueForm) => void;
  problems: { dealbreaker: number; serious: number; minor: number };
  coverage: number;
  nowYear: number;
}) {
  const tx = useTx();
  const usedOnly = bike.status === "used-only";
  const res = useMemo(() => estimateValue(bike, { ...form, problems, coverage, nowYear }), [bike, form, problems, coverage, nowYear]);
  const years = Array.from({ length: 41 }, (_, i) => nowYear - i);
  const set = (p: Partial<ValueForm>) => onChange({ ...form, ...p });
  const span = Math.max(1, res.high - res.low);
  const fairPos = ((res.fair - res.low) / span) * 100;

  return (
    <section aria-labelledby="value-h" className="card p-5 sm:p-6">
      <div className="flex flex-wrap items-center gap-2">
        <h2 id="value-h" className="text-[19px] font-semibold tracking-tight text-ink">
          {tx("What is it worth?", "এর দাম কত হওয়া উচিত?")}
        </h2>
        <Approx className="!ml-0" />
      </div>
      <p className="mt-1 text-[14px] text-muted">
        {tx(
          "An estimate from our price data and simple rules. It is not a quote. A bike is worth what a buyer will pay, so check live listings too.",
          "আমাদের দামের তথ্য ও সহজ নিয়ম থেকে একটি আন্দাজ। এটা কোটেশন নয়। ক্রেতা যা দেবেন সেটাই বাইকের দাম, তাই চলতি বিজ্ঞাপনও দেখুন।",
        )}
      </p>

      <div className="mt-5 grid gap-5 sm:grid-cols-2">
        {!usedOnly && (
          <Field label={tx("Year made", "তৈরির সাল")}>
            <select className="input" value={form.yearMade} onChange={(e) => set({ yearMade: Number(e.target.value) })} aria-label={tx("Year made", "তৈরির সাল")}>
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </Field>
        )}
        <Field label={tx("Kilometres on the clock", "মিটারে কিলোমিটার")}>
          <input type="number" inputMode="numeric" min={0} max={999999} step={1000} className="input tnum" value={form.km} aria-label={tx("Kilometres on the clock", "মিটারে কিলোমিটার")} onChange={(e) => set({ km: e.target.value === "" ? 0 : clampKm(Number(e.target.value)) })} />
        </Field>
        <Field label={tx("Owners so far", "এ পর্যন্ত মালিক")}>
          <Segmented
            value={form.owners}
            onChange={(v) => set({ owners: v })}
            options={[1, 2, 3, 4].map((n) => ({ v: n, label: n === 4 ? "4+" : String(n) }))}
          />
        </Field>
        <Field label={tx("Papers", "কাগজপত্র")}>
          <Segmented value={form.paper} onChange={(v) => set({ paper: v })} options={PAPERS.map((p) => ({ v: p.v, label: tx(p.label.en, p.label.bn) }))} />
        </Field>
        <Field label={tx("Overall condition", "সামগ্রিক অবস্থা")}>
          <Segmented value={form.condition} onChange={(v) => set({ condition: v })} options={CONDITIONS.map((p) => ({ v: p.v, label: tx(p.label.en, p.label.bn) }))} />
        </Field>
      </div>
      {usedOnly && (
        <p className="mt-3 text-[13px] text-faint">
          {tx("Year is not asked for this model. It is sold only on the used market, so we start from its typical used price.", "এই মডেলে সাল জিজ্ঞেস করা হয় না। এটা শুধু ব্যবহৃত বাজারে মেলে, তাই সাধারণ ব্যবহৃত দাম থেকে শুরু করি।")}
        </p>
      )}

      <div className="mt-6 rounded-2xl bg-surface-2 p-4 sm:p-5">
        <p className="eyebrow">{tx("Estimated price range", "আনুমানিক দামের পরিসর")}</p>
        <div className="mt-2 grid grid-cols-3 gap-2 text-center sm:gap-4">
          <div>
            <p className="text-[12px] text-muted">{tx("Open near", "শুরু করুন")}</p>
            <p className="text-[17px] font-semibold text-ink tnum sm:text-[20px]">{formatBDT(res.low)}</p>
          </div>
          <div className="rounded-xl bg-surface py-1 shadow-sm">
            <p className="text-[12px] text-brand">{tx("Fair", "ন্যায্য")}</p>
            <p className="text-[19px] font-bold text-ink tnum sm:text-[24px]">{formatBDT(res.fair)}</p>
          </div>
          <div>
            <p className="text-[12px] text-muted">{tx("Walk above", "এর ওপরে নয়")}</p>
            <p className="text-[17px] font-semibold text-ink tnum sm:text-[20px]">{formatBDT(res.high)}</p>
          </div>
        </div>
        <div className="relative mt-4 h-2 rounded-full bg-surface-3" aria-hidden>
          <div className="absolute inset-y-0 rounded-full bg-brand/30" style={{ left: 0, right: 0 }} />
          <div className="absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-brand bg-surface" style={{ left: `${fairPos}%` }} />
        </div>
        <p className="mt-3 text-[13px] text-muted">
          {tx(`The range is about ±${Math.round(res.spreadPct * 100)}% around the fair price. ${coverage < 0.5 ? "It is wider because you have checked less than half of the list." : ""}`, `পরিসর ন্যায্য দামের প্রায় ±${Math.round(res.spreadPct * 100)}%। ${coverage < 0.5 ? "চেকলিস্টের অর্ধেকের কম দেখেছেন বলে এটা বেশি চওড়া।" : ""}`)}
        </p>
        {res.warnings.map((w, i) => (
          <p key={i} className="mt-2 rounded-lg bg-warn-soft px-3 py-2 text-[13.5px] font-medium text-warn" role="note">
            {tx(w.en, w.bn)}
          </p>
        ))}
      </div>

      <h3 className="mt-6 text-[15px] font-semibold text-ink">{tx("How we got there", "কীভাবে এই দাম")}</h3>
      <ul className="mt-2 divide-y divide-line text-[14px]">
        <li className="py-2.5">
          <div className="flex items-baseline justify-between gap-3">
            <span className="font-medium text-ink">{tx("Starting point", "শুরুর দাম")}</span>
            <span className="font-semibold text-ink tnum">{formatBDT(res.base)}</span>
          </div>
          <p className="mt-0.5 text-[13px] text-muted">{tx(res.baseNote.en, res.baseNote.bn)}</p>
        </li>
        {res.adjustments.map((a) => (
          <li key={a.key} className="py-2.5">
            <div className="flex items-baseline justify-between gap-3">
              <span className="font-medium text-ink">{tx(a.label.en, a.label.bn)}</span>
              <span className={`shrink-0 font-semibold tnum ${a.amount < 0 ? "text-signal" : "text-good"}`}>
                {a.amount < 0 ? "−" : "+"}
                {formatBDT(Math.abs(a.amount))} <span className="text-[12px] font-normal text-muted">({a.pct > 0 ? "+" : "−"}{Math.abs(Math.round(a.pct * 1000) / 10)}%)</span>
              </span>
            </div>
            <p className="mt-0.5 text-[13px] text-muted">{tx(a.note.en, a.note.bn)}</p>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-[12.5px] text-faint">
        {tx("Adjustments are added together and applied to the starting point. The result is never allowed to fall below a small salvage floor.", "সমন্বয়গুলো যোগ করে শুরুর দামে বসানো হয়। ফল একটি ছোট স্ক্র্যাপ সীমার নিচে নামে না।")}
      </p>
    </section>
  );
}

const clampKm = (n: number) => Math.min(999999, Math.max(0, Math.round(n)));
