"use client";

import { FlaskConical } from "lucide-react";
import { useTx } from "@/lib/i18n";

// Local copy of the Labs badge/banner (the shared one lives in src/components/Experimental.tsx on feat/labs-foundation).
// When that branch is merged, replace this file's contents with: export { ExperimentalBadge, ExperimentalBanner } from "@/components/Experimental";

export function ExperimentalBadge({ className = "" }: { className?: string }) {
  const tx = useTx();
  return (
    <span className={`inline-flex items-center gap-1 rounded-full bg-warn-soft px-2 py-0.5 text-[11.5px] font-semibold text-warn ${className}`}>
      <FlaskConical size={11} aria-hidden />
      {tx("Experimental", "পরীক্ষামূলক")}
    </span>
  );
}

export function ExperimentalBanner({ children }: { children?: React.ReactNode }) {
  const tx = useTx();
  return (
    <div className="card flex gap-3 border-warn/40 bg-warn-soft/50 p-4 text-[14px] leading-relaxed text-ink-2" role="note">
      <FlaskConical size={18} className="mt-0.5 shrink-0 text-warn" aria-hidden />
      <div className="min-w-0">
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
