"use client";

import Link from "@/components/LangLink";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowRight, X } from "lucide-react";
import { useStore, MAX_COMPARE } from "@/lib/store";
import { useLang } from "@/lib/i18n";
import { BikeArt } from "./BikeArt";

export function CompareTray() {
  const { compare, toggleCompare, clearCompare, ready } = useStore();
  const { t, lang } = useLang();
  const pathname = usePathname();
  // The bike index loads only once something is in the tray, so pages without bike lists do not ship it.
  const [index, setIndex] = useState<typeof import("@/lib/bikes") | null>(null);
  useEffect(() => {
    if (compare.length && !index) import("@/lib/bikes").then(setIndex, () => {});
  }, [compare.length, index]);
  const bikes = index ? compare.map(index.getBike).filter((b) => !!b) : [];
  // Counts bikes that resolve, not raw ids, so a stale id never shows an empty tray (critique B12).
  if (!ready || bikes.length === 0 || pathname?.replace(/^\/bn(?=\/)/, "").startsWith("/compare")) return null;
  const label = (
    <>
      {t("nav.compare")} {bikes.length > 1 && <span className="tnum">({bikes.length})</span>}
      <ArrowRight size={16} />
    </>
  );

  return (
    <>
      {/* In-flow spacer so the fixed tray never hides the end of the page */}
      <div className="h-24" aria-hidden />
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
                  aria-label={lang === "bn" ? `${b.model} সরান` : `Remove ${b.model}`}
                >
                  <X size={14} />
                </button>
              </span>
            ))}
            <span aria-live="polite" className="hidden shrink-0 text-[12.5px] text-muted sm:inline">
              {bikes.length >= MAX_COMPARE
                ? t("common.compareFullHint")
                : lang === "bn" ? (bikes.length === 1 ? "তুলনার জন্য আরও ১–২টি যোগ করুন" : "চাইলে আরও একটি যোগ করুন") : bikes.length === 1 ? "Add 1–2 more to compare" : "Add one more (optional)"}
            </span>
          </div>
          <button onClick={clearCompare} className="btn-ghost h-10 px-3 text-[13.5px]">
            {t("common.clear")}
          </button>
          {bikes.length < 2 ? (
            // Not a link until there are two bikes: a disabled link would still take focus and open on Enter.
            <span aria-disabled="true" className="btn-primary h-10 cursor-not-allowed px-4 text-[14px] opacity-40">
              {label}
            </span>
          ) : (
            <Link href={`/compare/?bikes=${bikes.map((b) => b.id).join(",")}`} className="btn-primary h-10 px-4 text-[14px]">
              {label}
            </Link>
          )}
        </div>
      </div>
    </>
  );
}
