"use client";

import { ArrowUpRight, Gauge } from "lucide-react";
import type { ReactNode } from "react";
import { useTx } from "@/lib/i18n";

export const THROTTLE_IQ_URL = "https://github.com/blankframe-tech/ThrottleIQ";

/** title/body override the default pitch for pages with a different angle (e.g. the cost page). */
export function ThrottleIqCard({ className = "", title, body }: { className?: string; title?: string; body?: ReactNode }) {
  const tx = useTx();
  return (
    <aside className={`flex gap-4 rounded-2xl border border-brand bg-brand-soft p-5 ${className}`}>
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-surface text-brand">
        <Gauge size={20} />
      </span>
      <div>
        <h3 className="text-[17px] font-semibold text-ink">{title ?? tx("Track it with ThrottleIQ", "ThrottleIQ দিয়ে হিসাব রাখুন")}</h3>
        <div className="mt-1 text-[14.5px] leading-relaxed text-ink-2">
          {body ?? tx(
            "ThrottleIQ is our free app for riders: log how much you ride and it tells you when the next service, oil change or chain lube is due. Nothing slips your mind.",
            "ThrottleIQ রাইডারদের জন্য আমাদের অ্যাপ: কত চালালেন লিখে রাখুন, আর পরের সার্ভিস, অয়েল চেঞ্জ বা চেইন লুব কবে লাগবে সেটা সে মনে করিয়ে দেবে। কিছু ভুলে যাবেন না।",
          )}
        </div>
        <a href={THROTTLE_IQ_URL} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex items-center gap-1 text-[14px] font-semibold text-brand underline underline-offset-2">
          {tx("Get ThrottleIQ", "ThrottleIQ নিন")} <ArrowUpRight size={15} />
        </a>
      </div>
    </aside>
  );
}
