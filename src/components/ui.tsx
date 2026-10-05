"use client";

import Link from "next/link";
import { useState } from "react";
import { Check, Heart, Plus, Share2 } from "lucide-react";
import type { BikeLite } from "@/lib/types";
import { CATEGORIES, ccLabel, formatLakh } from "@/lib/bikes";
import { useStore } from "@/lib/store";
import { useLang } from "@/lib/i18n";
import { BikeArt } from "./BikeArt";

export function CompareButton({ id, size = "md" }: { id: string; size?: "sm" | "md" }) {
  const { compare, toggleCompare, ready } = useStore();
  const { t } = useLang();
  const on = ready && compare.includes(id);
  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleCompare(id);
      }}
      aria-pressed={on}
      className={`inline-flex items-center gap-1.5 rounded-lg font-medium transition-colors ${
        size === "sm" ? "h-8 px-2.5 text-[12.5px]" : "h-10 px-3.5 text-[14px]"
      } ${on ? "bg-brand-soft text-brand" : "bg-surface-2 text-ink-2 hover:bg-surface-3"}`}
    >
      {on ? <Check size={size === "sm" ? 14 : 16} /> : <Plus size={size === "sm" ? 14 : 16} />}
      {on ? t("common.added") : t("common.compare")}
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

export function BikeCard({ bike, footer, badge }: { bike: BikeLite; footer?: React.ReactNode; badge?: React.ReactNode }) {
  const { lang, t } = useLang();
  return (
    <Link
      href={`/bikes/${bike.id}/`}
      className="group card relative flex flex-col overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:border-line-strong hover:shadow-md"
    >
      <div className="relative bg-surface-2/60 px-5 pt-5">
        <div className="absolute left-4 top-4 z-10 flex flex-wrap gap-1.5 pr-10">
          {badge}
          {bike.status === "used-only" && (
            <span className="rounded-full bg-warn-soft px-2 py-0.5 text-[11.5px] font-semibold text-warn">{t("common.usedOnly")}</span>
          )}
          {bike.hasOffer && (
            <span className="rounded-full bg-signal-soft px-2 py-0.5 text-[11.5px] font-semibold text-signal">{lang === "bn" ? "অফার চলছে" : "Offer running"}</span>
          )}
        </div>
        <div className="absolute right-3 top-3 z-10">
          <SaveButton id={bike.id} />
        </div>
        <BikeArt bike={bike} className="mx-auto w-full max-w-[300px] transition-transform duration-300 group-hover:scale-[1.03]" />
      </div>
      <div className="flex flex-1 flex-col gap-3 p-5 pt-4">
        <div>
          <p className="text-[12.5px] font-medium text-muted">
            {bike.brand} · {ccLabel(bike)} · {lang === "bn" ? CATEGORIES[bike.category].bn : CATEGORIES[bike.category].en}
          </p>
          <h3 className="mt-0.5 text-[17px] font-semibold tracking-tight text-ink">{bike.model}</h3>
        </div>
        <div className="mt-auto flex items-end justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[19px] font-semibold tracking-tight text-ink tnum">{formatLakh(bike.priceBDT, lang)}</p>
            <p className="whitespace-nowrap text-[12.5px] text-muted tnum">
              ~{bike.mileageKmpl[0]}–{bike.mileageKmpl[1]} kmpl · {bike.powerPS} PS
            </p>
          </div>
          <CompareButton id={bike.id} size="sm" />
        </div>
        {footer}
      </div>
    </Link>
  );
}

export function ScoreBar({ value, label, hint, tone = "brand" }: { value: number; label: string; hint?: string; tone?: "brand" | "muted" }) {
  const color = tone === "muted" ? "bg-ink/25" : value >= 8 ? "bg-good" : value >= 6 ? "bg-brand" : value >= 4 ? "bg-warn" : "bg-signal";
  return (
    <div title={hint}>
      <div className="mb-1.5 flex items-baseline justify-between gap-3">
        <span className="text-[13.5px] text-ink-2">{label}</span>
        <span className="text-[13.5px] font-semibold text-ink tnum">{value}/10</span>
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
