"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, X } from "lucide-react";
import { getBike } from "@/lib/bikes";
import { useStore, MAX_COMPARE } from "@/lib/store";
import { useLang } from "@/lib/i18n";
import { BikeArt } from "./BikeArt";

export function CompareTray() {
  const { compare, toggleCompare, clearCompare, ready } = useStore();
  const { t } = useLang();
  const pathname = usePathname();
  if (!ready || compare.length === 0 || pathname?.startsWith("/compare")) return null;
  const bikes = compare.map(getBike).filter((b) => !!b);

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-4 z-40 flex justify-center px-4 animate-rise">
      <div className="pointer-events-auto flex w-full max-w-2xl items-center gap-3 rounded-2xl border border-line bg-surface/95 p-2.5 pl-4 shadow-lg backdrop-blur-xl">
        <div className="flex min-w-0 flex-1 items-center gap-2 overflow-x-auto no-scrollbar">
          {bikes.map((b) => (
            <span key={b.id} className="flex shrink-0 items-center gap-2 rounded-xl bg-surface-2 py-1 pl-1.5 pr-1">
              <span className="h-7 w-11">
                <BikeArt bike={b} shadow={false} className="h-full w-full" />
              </span>
              <span className="max-w-[9rem] truncate text-[13px] font-medium text-ink">{b.model}</span>
              <button
                onClick={() => toggleCompare(b.id)}
                className="grid h-6 w-6 place-items-center rounded-lg text-muted hover:bg-surface-3 hover:text-ink"
                aria-label={`Remove ${b.model}`}
              >
                <X size={14} />
              </button>
            </span>
          ))}
          {bikes.length < MAX_COMPARE && (
            <span className="hidden shrink-0 text-[12.5px] text-faint sm:inline">{bikes.length === 1 ? "Add 1–2 more to compare" : "Add one more (optional)"}</span>
          )}
        </div>
        <button onClick={clearCompare} className="btn-ghost h-10 px-3 text-[13.5px]">
          {t("common.clear")}
        </button>
        <Link
          href={`/compare/?bikes=${compare.join(",")}`}
          className={`btn-primary h-10 px-4 text-[14px] ${bikes.length < 2 ? "pointer-events-none opacity-40" : ""}`}
          aria-disabled={bikes.length < 2}
        >
          {t("nav.compare")} {bikes.length > 1 && <span className="tnum">({bikes.length})</span>}
          <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  );
}
