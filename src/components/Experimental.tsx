"use client";

import { FlaskConical } from "lucide-react";
import { useTx } from "@/lib/i18n";

/** Small pill for nav items, cards and page headers. */
export function ExperimentalBadge({ soon = false, className = "" }: { soon?: boolean; className?: string }) {
  const tx = useTx();
  return (
    <span className={`inline-flex items-center gap-1 rounded-full bg-warn-soft px-2 py-0.5 text-[11.5px] font-semibold text-warn ${className}`}>
      <FlaskConical size={11} aria-hidden />
      {soon ? tx("Experimental · coming soon", "পরীক্ষামূলক · শীঘ্রই আসছে") : tx("Experimental", "পরীক্ষামূলক")}
    </span>
  );
}

/** Honest disclaimer shown at the top of every Labs tool. */
export function ExperimentalBanner({ children }: { children?: React.ReactNode }) {
  const tx = useTx();
  return (
    <div className="card flex gap-3 border-warn/40 bg-warn-soft/50 p-4 text-[14px] leading-relaxed text-ink-2" role="note">
      <FlaskConical size={18} className="mt-0.5 shrink-0 text-warn" aria-hidden />
      <div>
        <p className="font-semibold text-ink">{tx("Experimental: still being tested.", "পরীক্ষামূলক: এখনও যাচাই চলছে।")}</p>
        <p className="mt-1">
          {children ??
            tx(
              "Results are a guide, not a verdict. Always inspect the bike in person and check the papers before paying.",
              "ফলাফল একটি দিকনির্দেশনা, চূড়ান্ত রায় নয়। টাকা দেওয়ার আগে নিজে বাইক দেখুন ও কাগজপত্র যাচাই করুন।",
            )}
        </p>
      </div>
    </div>
  );
}
