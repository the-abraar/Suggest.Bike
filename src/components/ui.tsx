"use client";

import Link from "@/components/LangLink";
import { Suspense, useState, type ReactNode } from "react";
import { useSearchParams } from "next/navigation";
import { Check, Heart, Plus, Share2 } from "lucide-react";
import type { BikeLite } from "@/lib/types";
import { CATEGORIES, ccLabel, formatLakh, mileageText } from "@/lib/bikes";
import { useStore, MAX_COMPARE } from "@/lib/store";
import { useLang } from "@/lib/i18n";
import { BikeArt } from "./BikeArt";
import { OfferTag } from "./Dated";
import { onRoadPrice } from "@/lib/cost";

/**
 * Renders a page that reads the query string. The static export prerenders the fallback, i.e. the page with no
 * query string, so the HTML carries real content (Bangla on /bn/) instead of an empty Suspense boundary.
 */
export function WithSearchParams({ render }: { render: (params: URLSearchParams) => ReactNode }) {
  return (
    <Suspense fallback={render(new URLSearchParams())}>
      <ReadSearchParams render={render} />
    </Suspense>
  );
}
function ReadSearchParams({ render }: { render: (params: URLSearchParams) => ReactNode }) {
  return render(useSearchParams());
}

export function CompareButton({ id, size = "md" }: { id: string; size?: "sm" | "md" }) {
  const { compare, toggleCompare, ready } = useStore();
  const { t } = useLang();
  const on = ready && compare.includes(id);
  const full = ready && !on && compare.length >= MAX_COMPARE; // the store refuses a 4th; say so instead of a dead tap
  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleCompare(id);
      }}
      aria-pressed={on}
      disabled={full}
      title={full ? t("common.compareFullHint") : undefined}
      className={`relative z-10 inline-flex items-center gap-1.5 rounded-lg font-medium transition-colors disabled:cursor-not-allowed ${
        size === "sm" ? "h-8 px-2.5 text-[12.5px]" : "h-10 px-3.5 text-[14px]"
      } ${on ? "bg-brand-soft text-brand" : full ? "bg-surface-2 text-muted" : "bg-surface-2 text-ink-2 hover:bg-surface-3"}`}
    >
      {on ? <Check size={size === "sm" ? 14 : 16} /> : <Plus size={size === "sm" ? 14 : 16} />}
      {on ? t("common.added") : full ? t("common.compareFull") : t("common.compare")}
    </button>
  );
}

export function SaveButton({ id, withLabel = false }: { id: string; withLabel?: boolean }) {
  const { saved, toggleSaved, ready } = useStore();
  const { t, lang } = useLang();
  const on = ready && saved.includes(id);
  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleSaved(id);
      }}
      aria-pressed={on}
      aria-label={on ? (lang === "bn" ? "সেভ থেকে সরান" : "Remove from saved") : lang === "bn" ? "বাইক সেভ করুন" : "Save bike"}
      className={`inline-flex items-center justify-center gap-1.5 rounded-lg transition-colors ${
        withLabel ? "h-10 px-3.5 text-[14px] font-medium" : "h-8 w-8"
      } ${on ? "text-signal" : "text-faint hover:text-ink"} ${withLabel ? "bg-surface-2 hover:bg-surface-3" : "hover:bg-surface-2"}`}
    >
      <Heart size={withLabel ? 16 : 17} fill={on ? "currentColor" : "none"} />
      {withLabel && (on ? t("common.saved") : t("common.save"))}
    </button>
  );
}

/** Uses the phone's share sheet (Messenger, WhatsApp, Facebook…) and falls back to copying the link. */
export function ShareButton({ title, text, className = "" }: { title: string; text?: string; className?: string }) {
  const { lang } = useLang();
  const [copied, setCopied] = useState(false);
  const share = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title, text, url });
        return;
      } catch {
        // dismissed — fall through to copy
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {}
  };
  return (
    <button onClick={share} className={`inline-flex h-10 items-center gap-1.5 rounded-lg bg-surface-2 px-3.5 text-[14px] font-medium text-ink-2 hover:bg-surface-3 ${className}`}>
      {copied ? <Check size={16} /> : <Share2 size={16} />}
      {copied ? (lang === "bn" ? "লিংক কপি হয়েছে" : "Link copied") : lang === "bn" ? "শেয়ার" : "Share"}
    </button>
  );
}

/** Marks a number as an editorial estimate rather than a sourced figure. */
export function Approx({ className = "" }: { className?: string }) {
  const { lang } = useLang();
  return (
    <span
      className={`ml-1 inline-flex cursor-help items-center rounded px-1 py-px align-middle text-[10.5px] font-semibold uppercase tracking-wide text-muted ring-1 ring-line-strong ${className}`}
      title={lang === "bn" ? "আনুমানিক — মালিকদের অভিজ্ঞতা ও বাজার থেকে, মাপা নয়" : "Estimate — based on owner reports and market prices, not measured"}
    >
      {lang === "bn" ? "আনুমানিক" : "approx"}
    </span>
  );
}

/**
 * The card is a div, not a link: the model name's link stretches over the card (after:inset-0) and the Save, Compare and
 * footer controls sit above it (z-10), so no button is nested inside a link (critique B13).
 */
export function BikeCard({ bike, footer, badge }: { bike: BikeLite; footer?: React.ReactNode; badge?: React.ReactNode }) {
  const { lang, t } = useLang();
  return (
    <div className="group card relative flex overflow-hidden sm:flex-col transition-all duration-200 hover:-translate-y-0.5 hover:border-line-strong hover:shadow-md">
      {/* Phones: compact row (art left) so the 80-bike list is not 40 screens long */}
      <div className="absolute right-3 top-3 z-10">
        <SaveButton id={bike.id} />
      </div>
      <div className="relative flex w-[38%] shrink-0 items-center bg-surface-2/60 px-2 py-6 sm:block sm:w-auto sm:px-5 sm:pb-0 sm:pt-5">
        <div className="pointer-events-none absolute left-2 top-2 z-10 flex flex-wrap gap-1.5 sm:left-4 sm:top-4 sm:pr-10">
          {badge}
          {bike.status === "used-only" && (
            <span className="rounded-full bg-warn-soft px-2 py-0.5 text-[11.5px] font-semibold text-warn">{t("common.usedOnly")}</span>
          )}
          {bike.availability === "unconfirmed" && (
            <span className="rounded-full bg-warn-soft px-2 py-0.5 text-[11.5px] font-semibold text-warn">{t("common.availUnconfirmed")}</span>
          )}
          <OfferTag bikeId={bike.id} />
        </div>
        <BikeArt bike={bike} className="mx-auto w-full max-w-[300px] transition-transform duration-300 group-hover:scale-[1.03]" />
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-3 p-4 sm:p-5 sm:pt-4">
        <div className="pr-8 sm:pr-0">
          <p className="text-[12.5px] font-medium text-muted">
            {bike.brand} · {ccLabel(bike)} · {lang === "bn" ? CATEGORIES[bike.category].bn : CATEGORIES[bike.category].en}
          </p>
          <h3 className="mt-0.5 text-[17px] font-semibold tracking-tight text-ink">
            <Link href={`/bikes/${bike.id}/`} className="after:absolute after:inset-0 after:content-['']">
              <span className="sr-only">{bike.brand} </span>
              {bike.model}
            </Link>
          </h3>
        </div>
        <div className="mt-auto flex flex-wrap items-end justify-between gap-x-3 gap-y-2">
          <div className="min-w-0">
            <p className="text-[19px] font-semibold tracking-tight text-ink tnum">{formatLakh(onRoadPrice(bike), lang)}</p>
            <p className="text-[12px] text-muted tnum">
              {bike.status === "used-only" ? (
                t("price.usedAsking")
              ) : (
                <>
                  {t("price.onRoad")} · <span className="whitespace-nowrap">{`${t("price.exShowroom")} ${formatLakh(bike.priceBDT, lang)}`}</span>
                </>
              )}
            </p>
            <p className="whitespace-nowrap text-[12.5px] text-muted tnum">
              ~{mileageText(bike)} · {bike.powerPS} PS
            </p>
          </div>
          <CompareButton id={bike.id} size="sm" />
        </div>
        {footer}
      </div>
    </div>
  );
}

/** Editorial scores are too coarse for 1-point differences, so they are shown as bands (see /method). */
export const scoreBand = (v: number): [string, string] => (v >= 8 ? ["Strong", "ভালো"] : v >= 5 ? ["OK", "মাঝারি"] : ["Weak", "দুর্বল"]);

export function ScoreBar({ value, label, hint, tone = "brand" }: { value: number; label: string; hint?: string; tone?: "brand" | "muted" }) {
  const { lang } = useLang();
  const color = tone === "muted" ? "bg-ink/25" : value >= 8 ? "bg-good" : value >= 5 ? "bg-brand" : "bg-warn";
  const band = scoreBand(value);
  return (
    <div title={hint}>
      <div className="mb-1.5 flex items-baseline justify-between gap-3">
        <span className="text-[13.5px] text-ink-2">{label}</span>
        <span className="text-[13.5px] font-semibold text-ink">
          {lang === "bn" ? band[1] : band[0]} <span className="text-[11.5px] font-normal text-faint tnum">{value}/10</span>
        </span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-surface-3">
        <div className={`h-full rounded-full ${color} animate-grow`} style={{ width: `${value * 10}%` }} />
      </div>
    </div>
  );
}

export function SectionHead({ eyebrow, title, sub, action }: { eyebrow?: React.ReactNode; title: React.ReactNode; sub?: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div className="max-w-2xl">
        {eyebrow && <p className="eyebrow mb-2">{eyebrow}</p>}
        <h2 className="text-[26px] font-semibold tracking-tight text-ink sm:text-[30px]">{title}</h2>
        {sub && <p className="mt-2 text-[15.5px] leading-relaxed text-muted">{sub}</p>}
      </div>
      {action}
    </div>
  );
}
