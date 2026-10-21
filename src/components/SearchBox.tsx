"use client";

import { useRouter } from "next/navigation";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { Search } from "lucide-react";
import { CATEGORIES, ccLabel, formatLakh, fullName } from "@/lib/bike-utils";
import { useLang } from "@/lib/i18n";
import { langHref } from "@/lib/site";
import { BikeArt } from "./BikeArt";

// The search engine carries the bike index (~30 KB gzip): loaded on first focus or keystroke, so pages that do not list
// bikes (guides, legal, about) never download it. A failed load is retried on the next focus or keystroke.
type SearchMod = typeof import("@/lib/search");

export function SearchBox({ compact = false, autoFocus = false, large = false }: { compact?: boolean; autoFocus?: boolean; large?: boolean }) {
  const router = useRouter();
  const { t, lang } = useLang();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [idx, setIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const listId = useId();
  const [engine, setEngine] = useState<SearchMod | null>(null);
  const load = () => engine || import("@/lib/search").then(setEngine, () => {});
  // "under 2 lakh" is a budget and "best mileage" a sort, not bike names: offer the bike list filtered/sorted instead of "no bikes match".
  const budget = useMemo(() => (engine ? engine.budgetQuery(q) : null), [q, engine]);
  const mileage = useMemo(() => !!engine?.mileageQuery(q), [q, engine]);
  const intent = !!budget || mileage;
  const results = useMemo(() => (engine && !intent ? engine.searchBikes(q) : []), [q, engine, intent]);

  useEffect(() => setIdx(0), [q]);
  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (!boxRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);
  useEffect(() => {
    if (!compact) return;
    const onKey = (e: KeyboardEvent) => {
      const el = document.activeElement;
      if (e.key === "/" && !(el instanceof HTMLInputElement) && !(el instanceof HTMLTextAreaElement)) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [compact]);

  const go = (path: string) => {
    setOpen(false);
    setQ("");
    inputRef.current?.blur();
    router.push(langHref(path, lang));
  };
  const intentPath = `/bikes/?${[budget && `price=u${budget}`, mileage && "sort=mileage"].filter(Boolean).join("&")}`;

  return (
    <div ref={boxRef} className="relative" onBlur={(e) => !e.currentTarget.contains(e.relatedTarget) && setOpen(false)}>
      <div className="relative">
        <Search size={large ? 20 : 17} className={`pointer-events-none absolute top-1/2 -translate-y-1/2 text-faint ${large ? "left-5" : "left-3.5"}`} />
        <input
          ref={inputRef}
          autoFocus={autoFocus}
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setOpen(true);
            load();
          }}
          onFocus={() => {
            setOpen(true);
            load();
          }}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") {
              e.preventDefault();
              if (!open) return setOpen(true);
              setIdx((i) => Math.min(i + 1, results.length - 1));
            } else if (e.key === "ArrowUp") {
              e.preventDefault();
              setIdx((i) => Math.max(i - 1, 0));
            } else if (e.key === "Enter" && intent) {
              go(intentPath);
            } else if (e.key === "Enter" && results[idx]) {
              go(`/bikes/${results[idx].id}/`);
            } else if (e.key === "Escape") {
              setOpen(false); // keep focus: keyboard users stay in the field (ARIA combobox pattern)
            }
          }}
          placeholder={compact ? t("home.search").split("—")[0].trim() + "…" : t("home.search")}
          className={
            large
              ? "h-16 w-full rounded-2xl border border-line-strong bg-surface pl-14 pr-4 text-[17px] text-ink shadow-md outline-none transition placeholder:text-faint focus:border-brand focus:ring-4 focus:ring-brand/15"
              : `input ${compact ? "h-10 pl-10 pr-9 text-[14px] bg-surface-2 border-transparent focus:bg-surface" : "pl-10"}`
          }
          role="combobox"
          aria-expanded={open && (results.length > 0 || intent)}
          aria-controls={listId}
          aria-activedescendant={open && q && (intent || results[idx]) ? `${listId}-${intent ? 0 : idx}` : undefined}
          aria-autocomplete="list"
          aria-label={lang === "bn" ? "বাইক খুঁজুন" : "Search bikes"}
        />
        {compact && !q && (
          <kbd className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 rounded-md border border-line-strong bg-surface px-1.5 text-[11px] font-medium text-faint">
            /
          </kbd>
        )}
      </div>
      {open && q && engine && (
        <div
          id={listId}
          role="listbox"
          className="absolute left-0 right-0 top-[calc(100%+8px)] z-50 overflow-hidden rounded-2xl border border-line bg-surface shadow-lg animate-fade"
        >
          {intent ? (
            <button
              id={`${listId}-0`}
              role="option"
              tabIndex={-1}
              aria-selected
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => go(intentPath)}
              className="flex w-full items-center gap-3 bg-surface-2 px-4 py-3 text-left text-[14.5px] font-medium text-ink"
            >
              {lang === "bn"
                ? `${budget ? `অন-রোড সর্বোচ্চ ${formatLakh(budget, "bn")} দামের সব বাইক` : "সব বাইক"}${mileage ? ", সবচেয়ে বেশি মাইলেজ আগে" : ""}`
                : `${budget ? `All bikes up to ${formatLakh(budget)} on-road` : "All bikes"}${mileage ? ", best mileage first" : ""}`}
            </button>
          ) : results.length === 0 ? (
            <p className="px-4 py-5 text-sm text-muted">
              {lang === "bn" ? `“${q}” এর সাথে কোনো বাইক মেলেনি। ইয়ামাহা বা অ্যাপাচির মতো নাম লিখে দেখুন।` : `No bikes match “${q}”. Try a brand like Yamaha or a model like Apache.`}
            </p>
          ) : (
            results.map((b, i) => (
              <button
                key={b.id}
                id={`${listId}-${i}`}
                role="option"
                tabIndex={-1}
                aria-selected={i === idx}
                onMouseDown={(e) => e.preventDefault()} // keep focus in the input so the box's onBlur does not close the list mid-click
                onMouseEnter={() => setIdx(i)}
                onClick={() => go(`/bikes/${b.id}/`)}
                className={`flex w-full items-center gap-3 px-3 py-2.5 text-left ${i === idx ? "bg-surface-2" : ""}`}
              >
                <span className="h-9 w-14 shrink-0">
                  <BikeArt bike={b} shadow={false} className="h-full w-full" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[14.5px] font-medium text-ink">{fullName(b)}</span>
                  <span className="block text-[12.5px] text-muted">
                    {ccLabel(b)} · {lang === "bn" ? CATEGORIES[b.category].bn : CATEGORIES[b.category].en}
                  </span>
                </span>
                <span className="text-[13.5px] font-semibold text-ink-2 tnum">{formatLakh(b.priceBDT, lang)}</span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
