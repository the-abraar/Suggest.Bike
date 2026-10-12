"use client";

import { FlaskConical } from "lucide-react";
import { useTx } from "@/lib/i18n";

/** Marks figures that are editorial estimates, not measured or distributor-verified. */
export function EstimateBadge({ className = "" }: { className?: string }) {
  const tx = useTx();
  return (
    <span className={`ml-2 inline-flex items-center gap-1 rounded-full bg-warn-soft px-2 py-0.5 align-middle text-[11.5px] font-semibold text-warn ${className}`}>
      <FlaskConical size={11} aria-hidden />
      {tx("Editorial estimate", "সম্পাদকীয় অনুমান")}
    </span>
  );
}
