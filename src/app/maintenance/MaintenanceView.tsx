"use client";

import Link from "@/components/LangLink";
import { ThrottleIqCard } from "@/components/ThrottleIqCard";
import { useTx } from "@/lib/i18n";
import { POSTS } from "@/lib/maintenance-posts";

export function MaintenanceView() {
  const tx = useTx();
  return (
    <div className="container-x pt-10">
      <p className="eyebrow">{tx("Maintenance", "রক্ষণাবেক্ষণ")}</p>
      <h1 className="mt-2 max-w-3xl text-[32px] font-semibold leading-tight tracking-[-0.03em] text-ink sm:text-[44px]">
        {tx("Learn to look after your own bike.", "নিজের বাইকের যত্ন নিজেই নিতে শিখুন।")}
      </h1>
      <div className="mt-4 max-w-2xl space-y-3 text-[16px] leading-relaxed text-muted">
        <p>
          {tx(
            "Labour is cheap here, so most of us pay ৳20 or ৳50 at a shop for jobs like chain lube or a tyre pressure check and never learn them. Then one day the chain snaps or a tyre goes flat far from any shop.",
            "আমাদের দেশে শ্রম সস্তা, তাই চেইন লুব বা টায়ারের প্রেসার চেকের মতো কাজে ২০-৫০ টাকা দিয়ে দোকানে যাই, আর নিজে কখনো শিখি না। তারপর একদিন দোকান থেকে অনেক দূরে চেইন ছিঁড়ে যায় বা টায়ার ফ্ল্যাট হয়।",
          )}
        </p>
        <p>
          {tx(
            "Short, plain guides to basic jobs you can do yourself with almost no tools. New ones are added over time.",
            "প্রায় কোনো যন্ত্র ছাড়াই নিজে করা যায় এমন বেসিক কাজের ছোট, সহজ গাইড। সময়ের সাথে নতুন লেখা যোগ হবে।",
          )}
        </p>
      </div>

      <div className="mt-12 max-w-3xl">
        <ul className="space-y-4">
          {POSTS.map((p) => (
            <li key={p.slug}>
              <Link href={`/maintenance/${p.slug}/`} className="block rounded-2xl border border-line bg-surface p-5 transition-colors hover:border-brand">
                <h2 className="text-[18px] font-semibold text-ink">{tx(...p.title)}</h2>
                <p className="mt-1 text-[14.5px] text-muted">{tx(...p.summary)}</p>
                <p className="mt-2 text-[12.5px] text-faint">{p.minutes} {tx("min read", "মিনিটের পড়া")}</p>
              </Link>
            </li>
          ))}
        </ul>
        <ThrottleIqCard className="mt-10" />
      </div>
    </div>
  );
}
