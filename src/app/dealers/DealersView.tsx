"use client";

import Link from "@/components/LangLink";
import { ExternalLink, Phone } from "lucide-react";
import { useTx } from "@/lib/i18n";
import { DEALERS, telHref, type Dealer } from "@/lib/dealers";

export function DealersView() {
  const tx = useTx();
  return (
    <div className="container-x max-w-3xl pt-12">
      <p className="eyebrow">{tx("Where to buy", "কোথায় কিনবেন")}</p>
      <h1 className="mt-2 text-[32px] font-semibold leading-tight tracking-[-0.03em] text-ink sm:text-[44px]">{tx("Official distributors", "অফিশিয়াল ডিস্ট্রিবিউটর")}</h1>
      <p className="mt-4 text-[16px] leading-relaxed text-ink-2">
        {tx(
          "Each brand's official Bangladesh distributor, its own showroom locator and its hotline, taken only from the distributor's website (link and date below). We do not list individual showrooms or numbers we could not verify.",
          "প্রতিটি ব্র্যান্ডের বাংলাদেশের অফিশিয়াল ডিস্ট্রিবিউটর, তাদের নিজস্ব শোরুম খোঁজার পাতা ও হটলাইন, শুধু ডিস্ট্রিবিউটরের ওয়েবসাইট থেকে (লিংক ও তারিখ নিচে)। যাচাই করা যায়নি এমন শোরুম বা নম্বর আমরা দিই না।",
        )}
      </p>
      <AskShowroom />
      <div className="mt-8 space-y-4">
        {Object.entries(DEALERS).map(([brand, d]) => (
          <DealerCard key={brand} brand={brand} d={d} />
        ))}
      </div>
      <p className="mt-8 text-[13.5px] text-muted">
        {tx("A number or link wrong?", "কোনো নম্বর বা লিংক ভুল?")}{" "}
        <Link href="/feedback/" className="text-brand underline underline-offset-2">{tx("Tell us", "জানান")}</Link>
      </p>
    </div>
  );
}

/** Prompt shown before contacting a showroom. */
export function AskShowroom() {
  const tx = useTx();
  return (
    <p className="mt-5 rounded-xl bg-surface-2 p-4 text-[14.5px] leading-relaxed text-ink-2">
      <strong className="text-ink">{tx("Ask the showroom for the on-road price and the current offer.", "শোরুমে অন-রোড দাম আর চলতি অফার জিজ্ঞেস করুন।")}</strong>{" "}
      {tx("Ask what the price includes (registration, number plate, tax token), the delivery date, and whether the offer is in writing.", "দামে কী কী আছে (রেজিস্ট্রেশন, নম্বর প্লেট, ট্যাক্স টোকেন), কবে ডেলিভারি, আর অফারটা লিখিত কি না জিজ্ঞেস করুন।")}
    </p>
  );
}

export function DealerCard({ brand, d, compact = false }: { brand: string; d: Dealer; compact?: boolean }) {
  const tx = useTx();
  const a = "inline-flex items-center gap-1 text-brand underline underline-offset-2";
  return (
    <section className={compact ? "" : "rounded-2xl border border-line bg-surface p-5"}>
      {!compact && <h2 className="text-[18px] font-semibold text-ink">{brand}</h2>}
      <p className="mt-1 text-[14.5px] text-ink-2">{d.distributor}</p>
      <p className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[14px]">
        {d.locator ? (
          <a href={d.locator} target="_blank" rel="noopener noreferrer" className={a}><ExternalLink size={13} /> {tx("Find a showroom", "শোরুম খুঁজুন")}</a>
        ) : (
          <a href={d.site} target="_blank" rel="noopener noreferrer" className={a}><ExternalLink size={13} /> {tx("Official site", "অফিশিয়াল সাইট")}</a>
        )}
        {d.hotline && <a href={telHref(d.hotline)} className={a}><Phone size={13} /> {d.hotline}</a>}
      </p>
      {d.note && <p className="mt-2 text-[13px] text-muted">{tx(d.note, d.noteBn ?? d.note)}</p>}
      {!compact && d.districts && (
        <p className="mt-2 text-[13px] text-muted">
          {tx(`Lists dealers in ${d.districts.length} districts: `, `${d.districts.length}টি জেলায় ডিলারের তালিকা: `)}
          {d.districts.join(", ")}
        </p>
      )}
      <p className="mt-2 text-[12px] text-faint">
        {tx("Source", "উৎস")}: <a href={d.sourceUrl} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">{new URL(d.sourceUrl).hostname}</a> · <span className="whitespace-nowrap">{tx("checked", "যাচাই")} {d.checked}</span>
      </p>
    </section>
  );
}
