"use client";

// Things that depend on today's date. The site is a static export, so the build date goes stale:
// each of these compares against the visitor's clock after mount and renders nothing before that (no hydration mismatch).
import { useEffect, useState } from "react";
import { Tag } from "lucide-react";
import { formatBDT } from "@/lib/bikes";
import { FUEL } from "@/lib/cost";
import { activeOffer, daysSince, priceAge, todayBD } from "@/lib/offers";
import { useLang, useTx } from "@/lib/i18n";

/** Today in Bangladesh as YYYY-MM-DD, or "" during prerender and the first client render. */
function useToday() {
  const [today, setToday] = useState("");
  useEffect(() => setToday(todayBD()), []);
  return today;
}

export function useActiveOffer(bikeId: string) {
  const today = useToday();
  return today ? activeOffer(bikeId, today) : undefined;
}

const longDate = (iso: string, lang: "en" | "bn") =>
  new Date(`${iso}T00:00:00`).toLocaleDateString(lang === "bn" ? "bn-BD" : "en-GB", { day: "numeric", month: "long", year: "numeric" });

/** Small "Offer" pill for cards and compare columns; only while an offer in offers.json is running. */
export function OfferTag({ bikeId, className = "" }: { bikeId: string; className?: string }) {
  const tx = useTx();
  const o = useActiveOffer(bikeId);
  if (!o) return null;
  return <span className={`rounded-full bg-accent px-2 py-0.5 text-[11.5px] font-bold text-accent-ink ${className}`}>{tx("Offer", "অফার")}</span>;
}

/** "This month's offer" box for the bike page. */
export function OfferBox({ bikeId }: { bikeId: string }) {
  const { lang } = useLang();
  const tx = useTx();
  const o = useActiveOffer(bikeId);
  if (!o) return null;
  const saving = o.regularPriceBDT && o.offerPriceBDT ? o.regularPriceBDT - o.offerPriceBDT : 0;
  return (
    <div className="mt-4 max-w-md rounded-xl border border-line bg-accent-soft p-4">
      <p className="flex items-center gap-1.5 text-[12.5px] font-semibold uppercase tracking-wide text-accent-text">
        <Tag size={13} aria-hidden /> {tx("This month's offer", "এই মাসের অফার")}
      </p>
      <p className="mt-1 text-[16px] font-semibold text-ink">{lang === "bn" ? o.titleBn : o.title}</p>
      {o.offerPriceBDT && (
        <p className="mt-1 text-[14px] text-ink-2 tnum">
          <strong className="text-[20px] font-semibold text-ink">{formatBDT(o.offerPriceBDT)}</strong>
          {o.regularPriceBDT && <s className="ml-2 text-ink-2">{formatBDT(o.regularPriceBDT)}</s>}
          {saving > 0 && <span className="ml-2 font-semibold text-ink">{tx(`save ${formatBDT(saving)}`, `${formatBDT(saving)} সাশ্রয়`)}</span>}
        </p>
      )}
      <p className="mt-1.5 text-[13px] text-ink-2">
        {tx("Until", "চলবে")} {longDate(o.endsOn, lang)}
        {lang === "bn" ? " পর্যন্ত" : ""}
        {o.where ? ` · ${o.where}` : ""}
      </p>
      <p className="mt-1 text-[12px] text-ink-2">
        {tx("Source", "সূত্র")}:{" "}
        {o.source.url ? (
          <a href={o.source.url} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">
            {o.source.name}
          </a>
        ) : (
          o.source.name
        )}
        {". "}
        {tx("Confirm with the showroom before paying.", "টাকা দেওয়ার আগে শোরুমে নিশ্চিত হোন।")}
      </p>
    </div>
  );
}

/**
 * "Price checked Oct 2026" (or "Used-price estimate" for used-only bikes). The dot is neutral until mount, then ages on the
 * visitor's date: green, amber after 60 days, red after 120, with words so colour is not the only signal.
 */
export function PriceBadge({ asOf, label, estimate }: { asOf: string; label: string; estimate: boolean }) {
  const tx = useTx();
  const today = useToday();
  const age = today ? priceAge(asOf, today) : null;
  const dot = { fresh: "bg-good", aging: "bg-warn", stale: "bg-signal" }[age ?? "fresh"];
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-surface-2 px-2.5 py-1 text-[12px] font-medium text-ink-2">
      <span className={`h-1.5 w-1.5 rounded-full ${age ? dot : "bg-faint"}`} aria-hidden />
      {estimate ? tx("Used-price estimate", "পুরনো বাইকের আনুমানিক দাম") : tx("Price checked", "দাম যাচাই")} {label}
      {age === "aging" && <span className="text-warn">{tx("· may have changed", "· বদলাতে পারে")}</span>}
      {age === "stale" && <span className="text-signal">{tx("· may be out of date", "· পুরনো হতে পারে")}</span>}
    </span>
  );
}

/** Warns when the fuel price in guide.json is older than 45 days on the visitor's date. */
export function FuelAgeNote({ className = "" }: { className?: string }) {
  const { lang } = useLang();
  const tx = useTx();
  const today = useToday();
  if (!today || daysSince(FUEL.asOf, today) <= 45) return null;
  const d = longDate(FUEL.asOf, lang);
  return (
    <p role="note" className={`rounded-lg bg-warn-soft px-3 py-2 text-[12.5px] font-medium text-warn ${className}`}>
      {tx(`Fuel price as of ${d}, may be out of date. Set today's price with the slider.`, `তেলের দাম ${d} তারিখের, পুরনো হতে পারে। আজকের দাম স্লাইডারে দিন।`)}
    </p>
  );
}
