"use client";

import Link from "@/components/LangLink";
import { useState } from "react";
import { AlertTriangle, ArrowRight, Calculator, Check, ChevronRight, ExternalLink, Flag, Info, MapPin, Minus, Wrench } from "lucide-react";
import {
  CATEGORIES,
  SCORE_LABELS,
  absLabel,
  bnNumerals,
  brakeLabel,
  ccLabel,
  engineOilText,
  formatBDT,
  formatLakh,
  fullName,
  HAS_NETWORKS,
  networkFor,
  partLabel,
  similarBikes,
} from "@/lib/bikes";
import { DEFAULT_COST_INPUT, onRoadPrice, ownershipCost } from "@/lib/cost";
import { cardEmi } from "@/lib/fund";
import { FuelAgeNote, OfferBox, OfferTag, PriceBadge } from "@/components/Dated";
import { useLang, useTx } from "@/lib/i18n";
import { SITE, issueUrl } from "@/lib/site";
import { pairBySlug, pairHref, pairSlug, pairsForBike } from "@/lib/curated";
import type { Bike, Part, ScoreKey } from "@/lib/types";
import type { PricePoint } from "@/lib/history";
import { EstimateBadge } from "@/components/Experimental";
import { FeedbackForm } from "@/components/FeedbackForm";
import { AskShowroom, DealerCard } from "@/app/dealers/DealersView";
import { dealerFor } from "@/lib/dealers";
import { BikeArt } from "@/components/BikeArt";
import { Approx, BikeCard, CompareButton, SaveButton, ScoreBar, ShareButton } from "@/components/ui";

const AVAIL: Record<Part["availability"], { en: string; bn: string; cls: string }> = {
  everywhere: { en: "Everywhere", bn: "সব জায়গায়", cls: "bg-good-soft text-good" },
  common: { en: "Common", bn: "সহজলভ্য", cls: "bg-brand-soft text-brand" },
  "dealer-only": { en: "Dealer only", bn: "শুধু ডিলারে", cls: "bg-warn-soft text-warn" },
  rare: { en: "Rare", bn: "দুর্লভ", cls: "bg-signal-soft text-signal" },
};

const monthLabel = (ym: string, lang: "en" | "bn") => {
  const d = new Date(`${ym}-01T00:00:00`);
  return isNaN(+d) ? ym : d.toLocaleString(lang === "bn" ? "bn-BD" : "en", { month: "short", year: "numeric" });
};

export function BikeDetail({ bike }: { bike: Bike & { priceHistory?: PricePoint[] } }) {
  const hist = bike.priceHistory ?? [];
  const { lang, t } = useLang();
  const tx = useTx();
  const [showPhoto, setShowPhoto] = useState(true);
  const used = bike.status === "used-only";
  const bn = lang === "bn" && bike.bn ? bike.bn : null;
  const txt = {
    tagline: bn?.tagline ?? bike.tagline,
    feel: bn?.feel ?? bike.feel,
    quirks: bn?.quirks ?? bike.quirks,
    braking: bn?.braking ?? bike.braking,
    mechanicNote: bn?.mechanicNote ?? bike.mechanicNote,
    pros: bn?.pros ?? bike.pros,
    cons: bn?.cons ?? bike.cons,
    bestFor: bn?.bestFor ?? bike.bestFor,
    priceNote: (bn?.priceNote ?? bike.priceNote) || undefined,
  };
  const net = networkFor(bike.brand);
  const reportBody = `Bike: ${fullName(bike)} (${bike.id})\nPage: ${SITE.url}/bikes/${bike.id}/\nPrice on Suggest.Bike: ${formatBDT(bike.priceBDT, lang)} (checked ${bike.priceAsOf})\n\nWhat's wrong / correct value:\n\nWhere you saw it (showroom, link):\n`;
  const reportTitle = `Price/spec correction: ${fullName(bike)}`;
    const reportHref = `mailto:${SITE.contactEmail}?subject=${encodeURIComponent(reportTitle)}&body=${encodeURIComponent(reportBody)}`;
  const ev = bike.ev;
  const oil = bike.engineOil;
  const braking: [string, string] = [tx("Braking", "ব্রেকিং"), bike.brakes.abs === "none" ? tx("No ABS", "ABS নেই") : bike.brakes.abs === "cbs" ? "CBS" : bike.brakes.abs === "dual" ? tx("2-ch ABS", "২-চ্যানেল ABS") : tx("1-ch ABS", "১-চ্যানেল ABS")];
  const keySpecs: [string, string, string?][] = ev ? [
    [tx("Real range (estimate)", "আসল রেঞ্জ (অনুমান)"), `${ev.realRangeKm[0]}–${ev.realRangeKm[1]}`, "km"],
    [tx("Motor", "মোটর"), `${ev.motorW / 1000}`, "kW"],
    [tx("Battery", "ব্যাটারি"), `${ev.batteryKWh}`, "kWh"],
    [tx("Charge time", "চার্জ সময়"), `${ev.chargeHours}`, tx("h", "ঘণ্টা")],
    [tx("Weight", "ওজন"), `${bike.weightKg}`, "kg"],
    [tx("Seat height", "সিটের উচ্চতা"), `${bike.seatHeightMm}`, "mm"],
    [tx("Top speed", "সর্বোচ্চ গতি"), `${bike.topSpeedKmh ?? "?"}`, "km/h"],
    braking,
  ] : [
    [tx("Real mileage (estimate)", "আসল মাইলেজ (অনুমান)"), `${bike.mileageKmpl[0]}–${bike.mileageKmpl[1]}`, "kmpl"],
    [tx("Engine", "ইঞ্জিন"), `${Math.round(bike.engine.cc)}`, "cc"],
    [tx("Power", "পাওয়ার"), `${bike.powerPS}`, "PS"],
    [tx("Torque", "টর্ক"), `${bike.torqueNm}`, "Nm"],
    [tx("Weight", "ওজন"), `${bike.weightKg}`, "kg"],
    [tx("Seat height", "সিটের উচ্চতা"), `${bike.seatHeightMm}`, "mm"],
    [tx("Fuel tank", "ফুয়েল ট্যাংক"), `${bike.fuelTankL}`, "L"],
    braking,
  ];

  return (
    <div className="pb-8">
      {/* ---------- Hero ---------- */}
      <section className="border-b border-line bg-surface">
        <div className="container-x pb-10 pt-6">
          <nav className="flex items-center gap-1 text-[13px] text-muted" aria-label="Breadcrumb">
            <Link href="/bikes/" className="hover:text-ink">
              {tx("All bikes", "সব বাইক")}
            </Link>
            <ChevronRight size={14} className="text-faint" />
            <Link href={`/bikes/?brand=${encodeURIComponent(bike.brand)}`} className="hover:text-ink">
              {bike.brand}
            </Link>
            <ChevronRight size={14} className="text-faint" />
            <span className="truncate text-ink-2">{bike.model}</span>
          </nav>

          <div className="mt-6 grid grid-cols-[minmax(0,1fr)] items-center gap-8 lg:grid-cols-[1.15fr_1fr] lg:gap-14">
            <figure className="relative overflow-hidden rounded-3xl bg-surface-2/70">
              {bike.image && showPhoto ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={bike.image.src} alt={`${fullName(bike)} photo`} width={800} height={480} className="aspect-[5/3] w-full object-cover animate-fade" loading="eager" fetchPriority="high" />
              ) : (
                <div className="p-6 sm:p-10">
                  <BikeArt bike={bike} className="mx-auto w-full max-w-[560px] animate-rise" />
                </div>
              )}
              {bike.image && (
                <div className="absolute left-3 top-3 flex gap-1 rounded-xl bg-surface/90 p-1 text-[12px] font-medium shadow-sm backdrop-blur">
                  <button onClick={() => setShowPhoto(true)} className={`rounded-lg px-2.5 py-1 ${showPhoto ? "bg-surface-3 text-ink" : "text-muted"}`}>
                    {tx("Photo", "ছবি")}
                  </button>
                  <button onClick={() => setShowPhoto(false)} className={`rounded-lg px-2.5 py-1 ${!showPhoto ? "bg-surface-3 text-ink" : "text-muted"}`}>
                    {tx("Illustration", "ইলাস্ট্রেশন")}
                  </button>
                </div>
              )}
              {/* CC BY / BY-SA need the licence link and a note of changes (critique B17); wraps, never truncated, below the photo on phones */}
              <figcaption className="px-3 py-1.5 text-[11px] leading-snug text-muted sm:absolute sm:bottom-2 sm:right-3 sm:max-w-[85%] sm:rounded-md sm:bg-surface/80 sm:px-1.5 sm:py-0.5 sm:backdrop-blur">
                {bike.image && showPhoto ? (
                  <>
                    {tx("Photo", "ছবি")}:{" "}
                    <a href={bike.image.sourcePage} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-ink">
                      {bike.image.author}
                    </a>
                    {" · "}
                    {bike.image.licenseUrl ? (
                      <a href={bike.image.licenseUrl} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-ink">
                        {bike.image.license}
                      </a>
                    ) : (
                      bike.image.license
                    )}
                    {" · "}
                    {tx("resized, converted to WebP and cropped", "আকার বদলানো, WebP-তে রূপান্তর ও ক্রপ করা")}
                  </>
                ) : (
                  tx("Illustration", "ইলাস্ট্রেশন")
                )}
              </figcaption>
            </figure>
            <div className="animate-rise" style={{ animationDelay: "80ms" }}>
              <div className="flex flex-wrap items-center gap-2 text-[13px] font-medium text-muted">
                <span>{bike.brand}</span>
                <span className="text-faint">·</span>
                <span>{lang === "bn" ? CATEGORIES[bike.category].bn : CATEGORIES[bike.category].en}</span>
                <span className="text-faint">·</span>
                <span>{ccLabel(bike)}</span>
                {used && <span className="rounded-full bg-warn-soft px-2 py-0.5 text-[11.5px] font-semibold text-warn">{tx("Used market only", "শুধু পুরনো বাজারে")}</span>}
                {bike.availability === "unconfirmed" && <span className="rounded-full bg-warn-soft px-2 py-0.5 text-[11.5px] font-semibold text-warn">{t("common.availUnconfirmed")}</span>}
              </div>
              <h1 className="mt-2 text-[34px] font-semibold leading-tight tracking-[-0.03em] text-ink sm:text-[44px]">{bike.model}</h1>
              {bike.variant && <p className="mt-1 text-[14.5px] text-muted">{bike.variant}</p>}
              <p className="mt-4 text-[17px] leading-relaxed text-ink-2">{txt.tagline}</p>

              <div className="mt-6 flex flex-wrap items-center gap-2">
                <PriceBadge asOf={bike.priceAsOf} label={monthLabel(bike.priceAsOf, lang)} estimate={used} />
                <OfferTag bikeId={bike.id} className="px-2.5 py-1 text-[12px]" />
              </div>
              <div className="mt-3 flex flex-wrap items-end gap-x-8 gap-y-3">
                <div>
                  <p className="text-[12.5px] text-muted">{used ? tx("Typical used price", "সাধারণ পুরনো দাম") : tx("On-road, with 2-year tax token", "অন-রোড, ২ বছরের ট্যাক্স টোকেনসহ")}</p>
                  <p className="text-[34px] font-semibold tracking-tight text-ink tnum">{formatBDT(onRoadPrice(bike), lang)}</p>
                </div>
                {!used && (
                  <div className="pb-1.5">
                    <p className="text-[12.5px] text-muted">{tx("Ex-showroom", "শোরুম মূল্য")}</p>
                    <p className="text-[18px] font-semibold text-ink-2 tnum">{formatBDT(bike.priceBDT, lang)}</p>
                  </div>
                )}
              </div>
              <OfferBox bikeId={bike.id} />
              {!used && (
                <p className="mt-2 text-[14px] text-ink-2">
                  {tx("or about", "অথবা প্রায়")} <strong className="font-semibold text-ink tnum">{formatBDT(cardEmi(bike.priceBDT), lang)}</strong>
                  {tx("/month on 12-month card EMI", "/মাস — ১২ মাসের কার্ড কিস্তিতে")}{" "}
                  <Link href="/guide/#emi" className="text-[12.5px] text-brand underline underline-offset-2">
                    {tx("how EMI works", "কিস্তি কীভাবে কাজ করে")}
                  </Link>
                </p>
              )}
              <p className="mt-1.5 text-[14px]">
                <Link href={`/cost/?bike=${bike.id}${used ? "&used=1" : ""}#pay`} className="font-medium text-brand underline underline-offset-2">
                  {tx("Cash, card EMI or loan? Compare what each costs →", "নগদ, কার্ড কিস্তি না লোন? কোনটায় কত খরচ দেখুন →")}
                </Link>
              </p>
              {bike.availability === "unconfirmed" && (
                <p className="mt-2 text-[13.5px] leading-relaxed text-warn">
                  {tx(
                    "The distributor does not list this model now, or its stock in Bangladesh is unproven. Ask the showroom whether they have one before you plan on it.",
                    "ডিস্ট্রিবিউটর এখন এই মডেল তালিকায় রাখেনি, অথবা বাংলাদেশে স্টক আছে কিনা নিশ্চিত নয়। ভরসা করার আগে শোরুমে জিজ্ঞেস করুন আছে কিনা।",
                  )}
                </p>
              )}
              {txt.priceNote && <p className="mt-2 text-[13.5px] leading-relaxed text-muted">{txt.priceNote}</p>}
              {bike.variants && bike.variants.length > 0 && (
                <table className="mt-3 w-full max-w-md text-[13px]">
                  <caption className="mb-1 text-left text-[12px] font-medium text-muted">{tx("Variants and prices", "ভ্যারিয়েন্ট ও দাম")}</caption>
                  <tbody>
                    {bike.variants.map((v) => (
                      <tr key={v.name} className="border-t border-line">
                        <th scope="row" className="py-1.5 pr-3 text-left font-normal text-ink-2">
                          {v.name}
                          {v.abs && v.abs !== "none" && <span className="ml-1.5 text-[11.5px] text-muted">{absLabel({ brakes: { ...bike.brakes, abs: v.abs } }, lang)}</span>}
                        </th>
                        <td className="py-1.5 text-right font-semibold text-ink tnum">
                          <a href={v.priceSource} target="_blank" rel="noopener noreferrer" className="hover:underline">
                            {formatBDT(v.priceBDT, lang)}
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
              {hist.length > 0 && (
                <p className="mt-2 text-[13px] text-muted">
                  <span className="font-medium text-ink-2">{tx("Price history", "দামের ইতিহাস")}:</span>{" "}
                  {hist.length > 1 && <Sparkline values={hist.map((p) => p.priceBDT)} />}{" "}
                  {hist.length > 1 && new Set(hist.slice(-3).map((p) => p.firstSeen.slice(0, 7))).size === 1
                    ? // all recent changes in one month: "since Oct · was … in Oct" reads oddly
                      `${monthLabel(hist[hist.length - 1].firstSeen.slice(0, 7), lang)}: ` +
                      hist.slice(-3).map((p) => formatBDT(p.priceBDT, lang)).join(" → ")
                    : hist.length > 1
                    ? hist
                        .slice(-3)
                        .reverse()
                        .map((p, i) => {
                          const [price, m] = [formatBDT(p.priceBDT, lang), monthLabel(p.firstSeen.slice(0, 7), lang)];
                          return i === 0 ? tx(`${price} since ${m}`, `${m} থেকে ${price}`) : tx(`was ${price} in ${m}`, `আগে ${price} (${m})`);
                        })
                        .join(" · ")
                    : tx(`unchanged since ${monthLabel(hist[0].firstSeen.slice(0, 7), lang)}`, `${monthLabel(hist[0].firstSeen.slice(0, 7), lang)} থেকে অপরিবর্তিত`)}{" "}
                  <Link href="/changes/" className="text-[12.5px] text-brand underline underline-offset-2">
                    {tx("dates are when our data changed · what changed", "তারিখ মানে আমাদের ডেটা বদলের সময় · কী বদলেছে")}
                  </Link>
                </p>
              )}
              <p className="mt-2 text-[12px] text-faint">
                {bike.priceSource.startsWith("http") && (
                  <a href={bike.priceSource} target="_blank" rel="noopener noreferrer" className="underline decoration-line-strong underline-offset-2 hover:text-ink">
                    {tx("Price source", "দামের উৎস")}
                  </a>
                )}
                {bike.distributor && bike.availability !== "unconfirmed" && (
                  <>
                    {" · "}
                    {tx("Sold by", "বিক্রেতা")} {bike.distributor}
                  </>
                )}
                {" · "}
                <a href={reportHref} className="inline-flex items-center gap-1 underline decoration-line-strong underline-offset-2 hover:text-ink">
                  <Flag size={11} /> {tx("Report wrong price", "ভুল দাম জানান")}
                </a>
                {" · "}
                <a href={issueUrl(reportTitle, reportBody)} target="_blank" rel="noopener noreferrer" className="underline decoration-line-strong underline-offset-2 hover:text-ink">
                  {tx("or on GitHub", "অথবা GitHub-এ")}
                </a>
              </p>

              <div className="mt-6 flex flex-wrap gap-2">
                <CompareButton id={bike.id} />
                <SaveButton id={bike.id} withLabel />
                <Link href={`/cost/?bike=${bike.id}`} className="inline-flex h-10 items-center gap-1.5 rounded-lg bg-surface-2 px-3.5 text-[14px] font-medium text-ink-2 hover:bg-surface-3">
                  <Calculator size={16} /> {tx("True cost", "আসল খরচ")}
                </Link>
                <ShareButton title={`${fullName(bike)} — Suggest.Bike`} text={txt.tagline} />
              </div>
            </div>
          </div>

          {/* key specs */}
          <dl className="mt-10 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-4 lg:grid-cols-8">
            {keySpecs.map(([k, v, u], i) => (
              <div key={k} className="bg-surface px-4 py-4">
                <dt className="text-[12px] text-muted">
                  {k}
                  {i === 0 && <Approx />}
                </dt>
                <dd className="mt-1 text-[18px] font-semibold tracking-tight text-ink tnum">
                  {lang === "bn" ? bnNumerals(v) : v}
                  {u && <span className="ml-1 text-[12.5px] font-medium text-muted">{u}</span>}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* ---------- Body ---------- */}
      <div className="container-x mt-12 grid grid-cols-[minmax(0,1fr)] gap-12 lg:grid-cols-[minmax(0,1fr)_340px]">
        {/* On phones the money card comes first — it's the question everyone asks. */}
        <aside className="order-first lg:sticky lg:top-24 lg:order-none lg:col-start-2 lg:row-start-1 lg:self-start">
          <MonthlyCard bike={bike} />
        </aside>

        <div className="min-w-0 space-y-14 lg:col-start-1 lg:row-start-1">
          <Section title={tx("The verdict", "আমাদের রায়")}>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-line bg-surface p-5">
                <p className="mb-3 text-[13px] font-semibold text-good">{tx("Why you'll love it", "কেন ভালো লাগবে")}</p>
                <ul className="space-y-2.5">
                  {txt.pros.map((p) => (
                    <li key={p} className="flex gap-2.5 text-[14.5px] leading-snug text-ink-2">
                      <Check size={17} className="mt-0.5 shrink-0 text-good" /> {p}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-2xl border border-line bg-surface p-5">
                <p className="mb-3 text-[13px] font-semibold text-signal">{tx("What might annoy you", "কী বিরক্ত করতে পারে")}</p>
                <ul className="space-y-2.5">
                  {txt.cons.map((p) => (
                    <li key={p} className="flex gap-2.5 text-[14.5px] leading-snug text-ink-2">
                      <Minus size={17} className="mt-0.5 shrink-0 text-signal" /> {p}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="mt-5 flex flex-wrap items-center gap-2">
              <span className="text-[13px] text-muted">{tx("Best for", "যাদের জন্য সেরা")}:</span>
              {txt.bestFor.map((b) => (
                <span key={b} className="rounded-full bg-brand-soft px-3 py-1 text-[13px] font-medium text-brand">
                  {b}
                </span>
              ))}
            </div>
          </Section>

          <Section title={tx("How it rides", "চালাতে কেমন")}>
            <div className="space-y-5 text-[15.5px] leading-relaxed text-ink-2">
              <p>{txt.feel}</p>
              <div className="flex gap-3 rounded-2xl border border-warn/25 bg-warn-soft p-4">
                <AlertTriangle size={19} className="mt-0.5 shrink-0 text-warn" />
                <div>
                  <p className="text-[13px] font-semibold text-warn">{tx("Quirks owners talk about", "মালিকরা যা বলেন")}</p>
                  <p className="mt-1 text-[14.5px] text-ink-2">{txt.quirks}</p>
                </div>
              </div>
              <p>
                <span className="font-semibold text-ink">{tx("Brakes", "ব্রেক")}:</span> {txt.braking}
              </p>
            </div>
          </Section>

          <Section
            title={<>{tx("Owning it in Bangladesh", "বাংলাদেশে মালিকানা")}<EstimateBadge /></>}
            sub={tx(
              "Scored 1–10 by Suggest.Bike from owner reports, Bangladeshi bike sites and rider communities. These are editorial judgements, not lab measurements.",
              "মালিকদের অভিজ্ঞতা, দেশি বাইক সাইট ও রাইডার কমিউনিটি থেকে Suggest.Bike-এর ১–১০ স্কোর। এগুলো আমাদের মূল্যায়ন, ল্যাবে মাপা নয়।",
            )}
          >
            <div className="grid gap-x-10 gap-y-5 sm:grid-cols-2">
              {(Object.keys(SCORE_LABELS) as ScoreKey[]).map((k) => (
                <ScoreBar key={k} value={bike.scores[k]} label={lang === "bn" ? SCORE_LABELS[k].bn : SCORE_LABELS[k].en} hint={lang === "bn" ? SCORE_LABELS[k].hintBn : SCORE_LABELS[k].hint} />
              ))}
            </div>
            <p className="mt-4 text-[12.5px] text-muted">
              {tx("Strong 8–10 · OK 5–7 · Weak 1–4. Editorial estimate —", "ভালো ৮–১০ · মাঝারি ৫–৭ · দুর্বল ১–৪। সম্পাদকীয় অনুমান —")}{" "}
              <Link href="/method/" className="text-brand underline underline-offset-2">{tx("how we score", "আমরা কীভাবে স্কোর করি")}</Link>
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <div className="flex gap-3 rounded-2xl bg-surface-2 p-4">
                <Wrench size={19} className="mt-0.5 shrink-0 text-brand" />
                <div>
                  <p className="text-[13px] font-semibold text-ink">{tx("Mechanic's note", "মেকানিকের কথা")}</p>
                  <p className="mt-1 text-[14.5px] leading-relaxed text-ink-2">{txt.mechanicNote}</p>
                </div>
              </div>
              {HAS_NETWORKS && <div className="flex gap-3 rounded-2xl bg-surface-2 p-4">
                <MapPin size={19} className="mt-0.5 shrink-0 text-brand" />
                <div className="min-w-0">
                  <p className="text-[13px] font-semibold text-ink">{tx(`${bike.brand} network in Bangladesh`, `বাংলাদেশে ${bike.brand}-এর নেটওয়ার্ক`)}</p>
                  {net ? (
                    <>
                      <p className="mt-1 text-[14.5px] leading-relaxed text-ink-2">
                        {[
                          net.showrooms ? tx(`~${net.showrooms} showrooms`, `~${net.showrooms}টি শোরুম`) : null,
                          net.serviceCentres ? tx(`~${net.serviceCentres} service centres`, `~${net.serviceCentres}টি সার্ভিস সেন্টার`) : null,
                          net.allDivisions ? tx("in all 8 divisions", "৮টি বিভাগেই") : net.divisions.length ? tx(`in ${net.divisions.length} of 8 divisions`, `৮টির মধ্যে ${net.divisions.length}টি বিভাগে`) : null,
                        ]
                          .filter(Boolean)
                          .join(" · ") || tx("Coverage not confirmed — ask the distributor.", "কভারেজ নিশ্চিত নয় — ডিস্ট্রিবিউটরকে জিজ্ঞেস করুন।")}
                      </p>
                      <p className="mt-1 text-[12.5px] text-muted">
                        {net.distributor}
                        {net.dealerLocatorUrl && (
                          <>
                            {" · "}
                            <a href={net.dealerLocatorUrl} target="_blank" rel="noopener noreferrer" className="text-brand underline underline-offset-2">
                              {tx("Find a dealer", "ডিলার খুঁজুন")}
                            </a>
                          </>
                        )}
                      </p>
                      {net.since && net.sinceSource && (
                        <p className="mt-1 text-[12.5px] text-muted">
                          <a href={net.sinceSource} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">
                            {tx(`Sold officially in Bangladesh since ${net.since}`, `বাংলাদেশে অফিশিয়ালি বিক্রি হচ্ছে ${net.since} সাল থেকে`)}
                          </a>
                        </p>
                      )}
                    </>
                  ) : (
                    <p className="mt-1 text-[14.5px] text-ink-2">{tx("We haven't verified this brand's network yet.", "এই ব্র্যান্ডের নেটওয়ার্ক এখনো যাচাই করা হয়নি।")}</p>
                  )}
                </div>
              </div>}
            </div>
          </Section>

          {bike.usedPrice && (bike.usedPrice.y1 || bike.usedPrice.y3) && (
            <Section title={tx("Buying it used", "পুরনো কিনলে")} sub={tx("Typical asking prices on bikroy.com for clean bikes with papers. Deals usually close 5–10% lower.", "bikroy.com-এ কাগজসহ ভালো অবস্থার বাইকের সাধারণ চাওয়া দাম। আসল দাম সাধারণত ৫–১০% কমে ঠিক হয়।")}>
              <div className="grid grid-cols-3 gap-px overflow-hidden rounded-2xl border border-line bg-line">
                <UsedCell k={tx("New", "নতুন")} v={formatBDT(bike.priceBDT, lang)} />
                <UsedCell k={tx("~1 year old", "~১ বছরের পুরনো")} v={bike.usedPrice.y1 ? formatBDT(bike.usedPrice.y1, lang) : "—"} sub={bike.usedPrice.y1 ? `−${Math.round((1 - bike.usedPrice.y1 / bike.priceBDT) * 100)}%` : undefined} />
                <UsedCell k={tx("~3 years old", "~৩ বছরের পুরনো")} v={bike.usedPrice.y3 ? formatBDT(bike.usedPrice.y3, lang) : "—"} sub={bike.usedPrice.y3 ? `−${Math.round((1 - bike.usedPrice.y3 / bike.priceBDT) * 100)}%` : undefined} />
              </div>
              <p className="mt-2 text-[12.5px] text-faint">
                {tx("Checked", "যাচাই")} {monthLabel(bike.usedPrice.asOf, lang)} ·{" "}
                <Link href="/guide/#used" className="text-brand underline underline-offset-2">
                  {tx("11 checks before buying used", "পুরনো কেনার আগে ১১টি চেক")}
                </Link>
              </p>
            </Section>
          )}

          <Section
            title={<>{tx("Parts & service prices", "পার্টস ও সার্ভিসের দাম")}<EstimateBadge /></>}
            sub={tx("Approximate Dhaka market prices. District prices are usually within ±15%.", "আনুমানিক ঢাকার বাজারদর। জেলায় সাধারণত ±১৫%।")}
          >
            <div className="overflow-hidden rounded-2xl border border-line bg-surface">
              <table className="w-full text-left text-[14.5px]">
                <thead>
                  <tr className="border-b border-line bg-surface-2/60 text-[12.5px] text-muted">
                    <th className="px-4 py-3 font-medium">{tx("Part", "পার্টস")}</th>
                    <th className="px-4 py-3 font-medium">{tx("Availability", "পাওয়া যায়")}</th>
                    <th className="px-4 py-3 text-right font-medium">
                      {tx("Price", "দাম")}
                      <Approx />
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {bike.parts.map((p, i) => {
                    const note = (bn?.partNotes?.[i] ?? p.note) || null;
                    return (
                      <tr key={p.name}>
                        <td className="px-4 py-3.5">
                          <span className="text-ink">{partLabel(bike, p.name, lang)}</span>
                          {note && <span className="mt-0.5 block text-[12.5px] leading-snug text-muted">{note}</span>}
                        </td>
                        <td className="px-4 py-3.5">
                          <span className={`whitespace-nowrap rounded-full px-2 py-0.5 text-[12px] font-semibold ${AVAIL[p.availability].cls}`}>{AVAIL[p.availability][lang]}</span>
                        </td>
                        <td className="px-4 py-3.5 text-right font-semibold text-ink tnum">{formatBDT(p.priceBDT, lang)}</td>
                      </tr>
                    );
                  })}
                  <tr className="bg-surface-2/40">
                    <td className="px-4 py-3.5 text-ink">
                      {tx("Periodic service", "নিয়মিত সার্ভিস")}
                      <span className="mt-0.5 block text-[12.5px] text-muted">
                        {tx(`every ~${bike.serviceIntervalKm.toLocaleString("en-IN")} km, incl. engine oil`, `প্রতি ~${bike.serviceIntervalKm.toLocaleString("en-IN")} km, ইঞ্জিন অয়েলসহ`)}
                      </span>
                      {oil && (
                        <span className="mt-1 block text-[12.5px] leading-snug text-muted">
                          {tx("Engine oil: ", "ইঞ্জিন অয়েল: ")}
                          <span className="font-medium text-ink-2">{engineOilText(oil, lang)}</span>
                          {" · "}
                          <a href={oil.source} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-ink">
                            {oil.market === "BD" ? tx("owner's manual", "ওনার্স ম্যানুয়াল") : tx("India owner's manual", "ভারতের ওনার্স ম্যানুয়াল")}
                          </a>
                          {oil.market === "India" && tx("; the BD bike may differ, so check yours", "; বাংলাদেশের বাইকে ভিন্ন হতে পারে, নিজেরটা মিলিয়ে নিন")}
                          {" · "}
                          <Link href="/maintenance/engine-oil/" className="text-brand underline underline-offset-2">
                            {tx("How to check and change it", "কীভাবে দেখবেন ও বদলাবেন")}
                          </Link>
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3.5" />
                    <td className="px-4 py-3.5 text-right font-semibold text-ink tnum">{formatBDT(bike.avgServiceCostBDT, lang)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Section>

          <BuyAndReport bike={bike} />

          <Section title={tx("Full specifications", "সম্পূর্ণ স্পেসিফিকেশন")}>
            <SpecTable bike={bike} />
          </Section>

          {bike.sources.length > 0 && (
            <Section title={tx("Sources", "তথ্যসূত্র")}>
              <ul className="space-y-2">
                {bike.sources.map((s) => (
                  <li key={s}>
                    <a href={s} target="_blank" rel="noopener noreferrer" className="inline-flex max-w-full items-center gap-1.5 text-[13.5px] text-muted hover:text-brand">
                      <ExternalLink size={13} className="shrink-0" />
                      <span className="truncate">{s.replace(/^https?:\/\/(www\.)?/, "")}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </Section>
          )}
        </div>
      </div>

      {pairsForBike(bike.id).length > 0 && (
        <section className="container-x mt-20">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <div>
              <h2 className="text-[22px] font-semibold tracking-tight text-ink sm:text-[24px]">
                {tx(`Popular ${bike.model} comparisons`, `${bike.model}-এর জনপ্রিয় তুলনা`)}
              </h2>
              <p className="mt-1 text-[14px] text-muted">
                {tx(
                  "Side-by-side on-road price, real mileage, specs and true monthly cost.",
                  "অন-রোড দাম, আসল মাইলেজ, স্পেক ও মাসিক খরচের সরাসরি তুলনা।",
                )}
              </p>
            </div>
            <Link href={`/compare/?bikes=${bike.id}`} className="text-[13px] font-medium text-brand hover:underline">
              {tx("All comparisons →", "সব তুলনা →")}
            </Link>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {pairsForBike(bike.id).map((p) => (
              <Link
                key={p.href}
                href={p.href}
                className="group card flex items-center justify-between gap-3 p-4 transition-all hover:-translate-y-0.5 hover:border-line-strong hover:shadow-md"
              >
                <div className="min-w-0">
                  <p className="truncate text-[14.5px] font-semibold text-ink group-hover:text-brand">
                    {bike.model} <span className="font-normal text-muted">{tx("vs", "বনাম")}</span> {p.other.model}
                  </p>
                  <p className="mt-0.5 text-[12.5px] text-muted">
                    {p.other.brand} · {formatBDT(p.other.priceBDT, lang)}
                  </p>
                </div>
                <ArrowRight size={16} className="shrink-0 text-faint transition-transform group-hover:translate-x-0.5 group-hover:text-brand" />
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="container-x mt-20">
        <h2 className="mb-6 text-[24px] font-semibold tracking-tight text-ink">{tx("Also consider", "এগুলোও দেখুন")}</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {similarBikes(bike).map((s) => {
            const popularSlug = pairBySlug(pairSlug(bike.id, s.id))
              ? pairHref(bike.id, s.id)
              : pairBySlug(pairSlug(s.id, bike.id))
                ? pairHref(s.id, bike.id)
                : null;
            const targetHref = popularSlug || `/compare/?bikes=${bike.id},${s.id}`;
            return (
              <BikeCard
                key={s.id}
                bike={s}
                footer={
                  <Link
                    href={targetHref}
                    className="relative z-10 -mx-5 -mb-5 mt-1 flex items-center justify-between border-t border-line px-5 py-3 text-[13px] font-medium text-brand hover:bg-surface-2"
                  >
                    {tx(`Compare with ${bike.model}`, `${bike.model}-এর সাথে তুলনা`)} <ArrowRight size={14} />
                  </Link>
                }
              />
            );
          })}
        </div>
      </section>
    </div>
  );
}

/** "Where to buy" from official distributor data, plus the owner report form. */
function BuyAndReport({ bike }: { bike: Bike }) {
  const tx = useTx();
  const dealer = dealerFor(bike.brand);
  return (
    <>
      {bike.status !== "used-only" && (
        <Section title={tx("Where to buy", "কোথায় কিনবেন")} sub={tx("From the official distributor's own website only.", "শুধু অফিশিয়াল ডিস্ট্রিবিউটরের নিজের ওয়েবসাইট থেকে।")}>
          {dealer ? <DealerCard brand={bike.brand} d={dealer} compact /> : <p className="text-[14.5px] text-ink-2">{tx("We have not verified an official distributor for this brand.", "এই ব্র্যান্ডের অফিশিয়াল ডিস্ট্রিবিউটর এখনো যাচাই করা হয়নি।")}</p>}
          <AskShowroom />
          <p className="mt-3 text-[13px] text-muted">
            {tx("Prices change often. Seen a different price at a showroom?", "দাম প্রায়ই বদলায়। শোরুমে অন্য দাম দেখেছেন?")}{" "}
            <Link href="/dealers/" className="text-brand underline underline-offset-2">{tx("All distributors", "সব ডিস্ট্রিবিউটর")}</Link>
          </p>
        </Section>
      )}
      <Section title={tx("I own this bike", "আমার এই বাইক আছে")} sub={tx("Report what you really paid on-road, where, when, and the mileage you get. No account needed; this is how our numbers get corrected.", "অন-রোডে আসলে কত দিয়েছেন, কোথায়, কবে, আর কত মাইলেজ পান জানান। অ্যাকাউন্ট লাগবে না; এভাবেই আমাদের সংখ্যা ঠিক হয়।")}>
        <details className="rounded-2xl border border-line bg-surface p-4">
          <summary className="cursor-pointer text-[14.5px] font-medium text-brand">{tx("Report my on-road price and real mileage", "আমার অন-রোড দাম ও আসল মাইলেজ জানাই")}</summary>
          <div className="mt-4">
            <FeedbackForm kind="owner" bike={{ id: bike.id, name: fullName(bike), ev: bike.engine.fuel === "electric" }} />
          </div>
        </details>
        <p className="mt-2 text-[12.5px] text-faint">
          <Link href="/method/" className="underline underline-offset-2">{tx("How reports are used", "রিপোর্ট কীভাবে ব্যবহার হয়")}</Link>
        </p>
      </Section>
    </>
  );
}

/** Price trend, oldest to newest, points evenly spaced (dates are when our data changed); the text beside it carries the figures. */
function Sparkline({ values }: { values: number[] }) {
  const [w, h] = [64, 16];
  const [lo, hi] = [Math.min(...values), Math.max(...values)];
  const pts = values.map((v, i) => `${((i / (values.length - 1)) * w).toFixed(1)},${(hi === lo ? h / 2 : h - 1 - ((v - lo) / (hi - lo)) * (h - 2)).toFixed(1)}`).join(" ");
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} aria-hidden="true" className="inline-block align-middle text-brand">
      <polyline points={pts} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

function UsedCell({ k, v, sub }: { k: string; v: string; sub?: string }) {
  return (
    <div className="bg-surface px-4 py-4">
      <p className="text-[12px] text-muted">{k}</p>
      <p className="mt-1 text-[17px] font-semibold tracking-tight text-ink tnum">{v}</p>
      {sub && <p className="text-[12px] text-faint tnum">{sub}</p>}
    </div>
  );
}

function Section({ title, sub, children }: { title: React.ReactNode; sub?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-[22px] font-semibold tracking-tight text-ink">{title}</h2>
      {sub && <p className="mt-1 text-[14px] text-muted">{sub}</p>}
      <div className="mt-5">{children}</div>
    </section>
  );
}

function SpecTable({ bike }: { bike: Bike }) {
  const { lang } = useLang();
  const tx = useTx();
  const e = bike.engine;
  const ev = bike.ev;
  const rows: [string, string | undefined][] = ev ? [
    [tx("Motor", "মোটর"), tx(`${ev.motorW} W rated${ev.peakMotorW ? `, ${ev.peakMotorW} W peak` : ""}`, `${ev.motorW} W রেটেড${ev.peakMotorW ? `, ${ev.peakMotorW} W পিক` : ""}`)],
    [tx("Battery", "ব্যাটারি"), `${ev.battery} (${ev.batteryKWh} kWh)`],
    [tx("Claimed range", "দাবি করা রেঞ্জ"), `${ev.rangeKm} km`],
    [tx("Real range (estimate)", "আসল রেঞ্জ (অনুমান)"), `${ev.realRangeKm[0]}–${ev.realRangeKm[1]} km`],
    [tx("Charge time", "চার্জ সময়"), tx(`${ev.chargeHours} hours`, `${ev.chargeHours} ঘণ্টা`)],
    [tx("Max torque", "সর্বোচ্চ টর্ক"), `${bike.torqueNm} Nm`],
    [tx("Top speed", "সর্বোচ্চ গতি"), bike.topSpeedKmh ? `${bike.topSpeedKmh} km/h` : undefined],
    [tx("Kerb weight", "কার্ব ওজন"), `${bike.weightKg} kg`],
    [tx("Seat height", "সিটের উচ্চতা"), `${bike.seatHeightMm} mm`],
    [tx("Ground clearance", "গ্রাউন্ড ক্লিয়ারেন্স"), bike.groundClearanceMm ? `${bike.groundClearanceMm} mm` : undefined],
    [tx("Brakes", "ব্রেক"), `${brakeLabel(bike, lang)} · ${absLabel(bike, lang)}`],
    [tx("Tyres", "টায়ার"), bike.tyres ? `${bike.tyres.front} / ${bike.tyres.rear}, ${bike.tubeless ? tx("tubeless", "টিউবলেস") : tx("tube-type", "টিউব")}` : undefined],
    [tx("Distributor", "ডিস্ট্রিবিউটর"), bike.distributor],
  ] : [
    [tx("Engine", "ইঞ্জিন"), `${e.cc}cc, ${e.cylinders}-cylinder, ${e.stroke}-stroke${e.valves ? `, ${e.valves}-valve` : ""}`],
    [tx("Cooling", "কুলিং"), (lang === "bn" ? { air: "এয়ার-কুলড", oil: "এয়ার ও অয়েল-কুলড", liquid: "লিকুইড-কুলড" }[e.cooling] : { air: "Air-cooled", oil: "Air- and oil-cooled", liquid: "Liquid-cooled" }[e.cooling]) + (e.coolingTech ? ` · ${e.coolingTech}` : "")],
    [tx("Fuel system", "ফুয়েল সিস্টেম"), e.fuel === "fi" ? tx("Fuel injection", "ফুয়েল ইনজেকশন") : tx("Carburettor", "কার্বুরেটর")],
    [tx("Max power", "সর্বোচ্চ পাওয়ার"), `${bike.powerPS} PS${bike.powerRpm ? ` @ ${bike.powerRpm.toLocaleString()} rpm` : ""}`],
    [tx("Max torque", "সর্বোচ্চ টর্ক"), `${bike.torqueNm} Nm${bike.torqueRpm ? ` @ ${bike.torqueRpm.toLocaleString()} rpm` : ""}`],
    [tx("Gearbox", "গিয়ারবক্স"), bike.gears === 0 ? tx("CVT automatic", "CVT অটোমেটিক") : tx(`${bike.gears}-speed manual`, `${bike.gears}-স্পিড ম্যানুয়াল`)],
    [tx("Top speed", "সর্বোচ্চ গতি"), bike.topSpeedKmh ? tx(`${bike.topSpeedKmh} km/h (approx.)`, `${bike.topSpeedKmh} km/h (আনুমানিক)`) : undefined],
    [tx("Real-world mileage (estimate)", "আসল মাইলেজ (অনুমান)"), `${bike.mileageKmpl[0]}–${bike.mileageKmpl[1]} kmpl`],
    [tx("Range on a full tank", "ফুল ট্যাংকে রেঞ্জ"), `≈ ${Math.round(bike.fuelTankL * bike.mileageKmpl[0])}–${Math.round(bike.fuelTankL * bike.mileageKmpl[1])} km`],
    [tx("Kerb weight", "কার্ব ওজন"), `${bike.weightKg} kg`],
    [tx("Seat height", "সিটের উচ্চতা"), `${bike.seatHeightMm} mm`],
    [tx("Ground clearance", "গ্রাউন্ড ক্লিয়ারেন্স"), bike.groundClearanceMm ? `${bike.groundClearanceMm} mm` : undefined],
    [tx("Fuel tank", "ফুয়েল ট্যাংক"), `${bike.fuelTankL} L`],
    [tx("Brakes", "ব্রেক"), `${brakeLabel(bike, lang)} · ${absLabel(bike, lang)}`],
    [
      tx("Tyres", "টায়ার"),
      bike.tyres
        ? `${bike.tyres.front} / ${bike.tyres.rear}, ${bike.tubeless ? tx("tubeless", "টিউবলেস") : tx("tube-type", "টিউব")}`
        : bike.tubeless
          ? tx("Tubeless", "টিউবলেস")
          : tx("Tube-type", "টিউব"),
    ],
    [tx("Suspension", "সাসপেনশন"), bike.suspension ? `${bike.suspension.front} / ${bike.suspension.rear}` : undefined],
    [tx("Distributor", "ডিস্ট্রিবিউটর"), bike.distributor],
    [tx("Assembled in Bangladesh", "বাংলাদেশে অ্যাসেম্বল"), bike.assembledInBD === undefined ? undefined : bike.assembledInBD ? tx("Yes", "হ্যাঁ") : tx("No (imported)", "না (আমদানি)")],
  ];
  return (
    <dl className="overflow-hidden rounded-2xl border border-line bg-surface">
      {rows
        .filter((r): r is [string, string] => !!r[1])
        .map(([k, v], i) => (
          <div key={k} className={`grid grid-cols-[minmax(120px,40%)_1fr] gap-4 px-4 py-3 text-[14.5px] ${i % 2 ? "bg-surface-2/40" : ""}`}>
            <dt className="text-muted">{k}</dt>
            {/* tyre sizes stay Latin, as printed on the tyre */}
            <dd className="text-ink">{lang === "bn" && k !== "টায়ার" ? bnNumerals(v) : v}</dd>
          </div>
        ))}
    </dl>
  );
}

function MonthlyCard({ bike }: { bike: Bike }) {
  const { lang } = useLang();
  const tx = useTx();
  const [km, setKm] = useState(25);
  const c = ownershipCost(bike, { ...DEFAULT_COST_INPUT, kmPerDay: km, includeDepreciation: false });
  const fill = ((km - 5) / (120 - 5)) * 100;
  const months = DEFAULT_COST_INPUT.years * 12;
  const rows = [
    { k: tx("Fuel", "তেল"), v: c.fuel / months },
    { k: tx("Service", "সার্ভিস"), v: c.service / months },
    { k: tx("Wear parts", "ক্ষয়যোগ্য পার্টস"), v: c.wear / months },
    { k: tx("Washing & parking", "ধোয়া ও পার্কিং"), v: c.upkeep / months },
    ...(c.hiddenRepairs ? [{ k: tx("Hidden used-bike repairs", "পুরনো বাইকের লুকানো মেরামত"), v: c.hiddenRepairs / months }] : []),
    ...(c.evBattery ? [{ k: tx("EV battery replacement", "EV ব্যাটারি বদল"), v: c.evBattery / months }] : []),
    ...(c.insurance ? [{ k: tx("Third-party insurance", "থার্ড-পার্টি ইন্স্যুরেন্স"), v: c.insurance / months }] : []),
  ];
  return (
    <div className="card p-5 shadow-md">
      <p className="text-[13px] font-semibold text-ink">{tx("Monthly running cost", "মাসিক চলার খরচ")}</p>
      <p className="mt-2 text-[34px] font-semibold tracking-tight text-ink tnum">{formatBDT(c.runningPerMonth, lang)}</p>
      <p className="text-[12.5px] text-muted">
        {tx(`at ${km} km/day, octane ৳${DEFAULT_COST_INPUT.fuelPrice}/L`, `দিনে ${km} km, অকটেন ৳${DEFAULT_COST_INPUT.fuelPrice}/লিটার`)}
      </p>
      <FuelAgeNote className="mt-2" />
      <input
        type="range"
        className="range mt-4"
        min={5}
        max={120}
        step={5}
        value={km}
        aria-label={tx("Kilometres per day", "দিনে কত কিলোমিটার")}
        style={{ ["--fill" as string]: `${fill}%` }}
        onChange={(e) => setKm(Number(e.target.value))}
      />
      <div className="flex justify-between text-[11.5px] text-faint">
        <span>5 km</span>
        <span>{tx("120 km/day", "দিনে ১২০ km")}</span>
      </div>
      <div className="mt-4 space-y-2 border-t border-line pt-4">
        {rows.map((r) => (
          <div key={r.k} className="flex justify-between text-[14px]">
            <span className="text-muted">{r.k}</span>
            <span className="font-medium text-ink tnum">{formatBDT(r.v, lang)}</span>
          </div>
        ))}
      </div>
      <Link href={`/cost/?bike=${bike.id}`} className="btn-primary mt-5 w-full">
        {tx("Full 3-year cost", "৩ বছরের পূর্ণ খরচ")} <ArrowRight size={16} />
      </Link>
      <p className="mt-3 flex gap-1.5 text-[12px] leading-snug text-faint">
        <Info size={13} className="mt-0.5 shrink-0" />
        {tx(
          "Excludes the bike itself, registration and resale loss — see the full calculator. Service and parts are estimates.",
          "বাইকের দাম, রেজিস্ট্রেশন ও রিসেল লস ধরা হয়নি — পূর্ণ হিসাব দেখুন। সার্ভিস ও পার্টসের খরচ আনুমানিক।",
        )}
      </p>
      <p className="mt-4 border-t border-line pt-4 text-[13px] text-muted">
        {formatLakh(onRoadPrice(bike), lang)} {tx("on-road", "অন-রোড")} · {fullName(bike)}
      </p>
    </div>
  );
}
