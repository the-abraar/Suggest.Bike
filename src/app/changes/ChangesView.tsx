"use client";

import { useState } from "react";
import Link from "@/components/LangLink";
import { BIKES, bnDigits, formatBDT } from "@/lib/bikes";
import history from "@/data/generated/price-history.json"; // from git by scripts/build-history.ts
import type { ChangeEvent, PriceHistory } from "@/lib/history";
import { useLang, useTx } from "@/lib/i18n";

const EVENTS = (history as PriceHistory).events;
const LIVE = new Set(BIKES.map((b) => b.id));
const KIND: Record<ChangeEvent["kind"], [string, string, string]> = {
  up: ["Price up", "দাম বেড়েছে", "bg-signal-soft text-signal"],
  down: ["Price down", "দাম কমেছে", "bg-good-soft text-good"],
  added: ["Added", "যুক্ত হয়েছে", "bg-brand-soft text-brand"],
  removed: ["Removed", "বাদ পড়েছে", "bg-surface-2 text-muted"],
};
const CORRECTION: [string, string, string] = ["Correction", "সংশোধন", "bg-surface-2 text-ink-2 ring-1 ring-line-strong"];
const FILTERS = { all: ["All", "সব"], market: ["Market changes", "বাজারের পরিবর্তন"], corrections: ["Corrections", "সংশোধন"] } as const;
type Filter = keyof typeof FILTERS;

export function ChangesView() {
  const { lang } = useLang();
  const tx = useTx();
  const [filter, setFilter] = useState<Filter>("all");
  const months = new Map<string, ChangeEvent[]>();
  for (const e of EVENTS.filter((e) => filter === "all" || (filter === "corrections") === !!e.priceCorrection)) months.set(e.date.slice(0, 7), [...(months.get(e.date.slice(0, 7)) ?? []), e]);
  const fmtDate = (d: string, opts: Intl.DateTimeFormatOptions) => new Date(`${d}T00:00:00`).toLocaleString(lang === "bn" ? "bn-BD" : "en", opts);
  return (
    <div className="container-x max-w-3xl pt-12">
      <p className="eyebrow">{tx("Changelog", "পরিবর্তনের তালিকা")}</p>
      <h1 className="mt-2 text-[32px] font-semibold leading-tight tracking-[-0.03em] text-ink sm:text-[44px]">{tx("What changed", "কী বদলেছে")}</h1>
      <p className="mt-4 text-[16px] leading-relaxed text-ink-2">
        {tx(
          "Every price change, new bike and removed bike in our data, newest first. Dates are when our data changed, which approximates (and can lag) when the showroom price changed. Changes marked Correction fixed a wrong price of ours; they are not market moves and are left out of the price charts on bike pages.",
          "আমাদের ডেটায় প্রতিটি দাম বদল, নতুন বাইক ও বাদ পড়া বাইক, নতুনগুলো আগে। তারিখ মানে আমাদের ডেটা যখন বদলেছে; শোরুমে দাম বদলের তারিখ এর কাছাকাছি, কিছুটা পরে হতে পারে। \"সংশোধন\" চিহ্নিত পরিবর্তন আমাদের নিজের ভুল দাম ঠিক করেছে; এগুলো বাজারের দাম বদল নয়, তাই বাইকের পাতার দামের চার্টে এগুলো নেই।",
        )}
      </p>
      <div className="mt-6 flex flex-wrap gap-2" role="group" aria-label={tx("Show", "দেখান")}>
        {(Object.keys(FILTERS) as Filter[]).map((f) => (
          <button key={f} type="button" className="chip" data-active={filter === f} aria-pressed={filter === f} onClick={() => setFilter(f)}>
            {lang === "bn" ? FILTERS[f][1] : FILTERS[f][0]}
          </button>
        ))}
      </div>
      {months.size === 0 && (
        <p className="mt-8 text-[15px] text-muted">{filter === "all" ? tx("No changes recorded yet.", "এখনো কোনো পরিবর্তন নেই।") : tx("Nothing here yet.", "এখানে এখনো কিছু নেই।")}</p>
      )}
      {[...months].map(([ym, list]) => (
        <section key={ym} className="mt-8">
          <h2 className="text-[18px] font-semibold text-ink">{fmtDate(`${ym}-01`, { month: "long", year: "numeric" })}</h2>
          <ul className="mt-3 divide-y divide-line rounded-2xl border border-line bg-surface">
            {list.map((e) => {
              const k = e.priceCorrection ? CORRECTION : KIND[e.kind];
              return (
                <li key={`${e.date}-${e.kind}-${e.id}`} className="flex flex-wrap items-center gap-x-3 gap-y-1 px-4 py-3 text-[14px]">
                  <span className={`rounded-full px-2 py-0.5 text-[11.5px] font-semibold ${k[2]}`}>{lang === "bn" ? k[1] : k[0]}</span>
                  {LIVE.has(e.id) ? (
                    <Link href={`/bikes/${e.id}/`} className="font-medium text-ink underline decoration-line-strong underline-offset-2 hover:text-brand">
                      {e.name}
                    </Link>
                  ) : (
                    <span className="font-medium text-ink">{e.name}</span>
                  )}
                  <span className="tnum text-ink-2">
                    {e.from != null && e.to != null ? `${formatBDT(e.from, lang)} → ${formatBDT(e.to, lang)} (${(e.pct ?? 0) > 0 ? "+" : ""}${lang === "bn" ? bnDigits(String(e.pct)) : e.pct}%)` : formatBDT(e.to ?? e.from ?? 0, lang)}
                  </span>
                  <span className="ml-auto text-[12.5px] text-muted">{fmtDate(e.date, { day: "numeric", month: "short" })}</span>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
      <p className="mt-8 text-[13px] text-muted">
        {tx("Where prices come from:", "দাম কোথা থেকে আসে:")}{" "}
        <Link href="/method/" className="text-brand underline underline-offset-2">
          {tx("Method", "পদ্ধতি")}
        </Link>
      </p>
    </div>
  );
}
