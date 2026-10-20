import type { Metadata } from "next";
import { ccLabel, formatBDT, fullName, getBike, mileageText } from "./bikes";
import { onRoadPrice } from "./cost";
import { langAlternates, OG_BASE, OG_BN } from "./site";
import type { Bike, BikeLite } from "./types";

/** The comparisons Bangladeshi buyers argue about most. */
export const POPULAR_COMPARISONS: [string, string][] = [
  ["bajaj-pulsar-n160", "tvs-apache-rtr-160-4v"],
  ["yamaha-fzs-fi-v4", "suzuki-gixxer-fi-abs"],
  ["yamaha-r15-v4", "suzuki-gixxer-sf-fi-abs"],
  ["royal-enfield-hunter-350", "royal-enfield-classic-350"],
  ["hero-xpulse-200-4v", "honda-nx200"],
  ["hero-splendor-plus", "bajaj-platina-100"],
  ["honda-hornet-2-0", "yamaha-fzs-fi-v4"],
  ["honda-dio", "tvs-ntorq-125"],
  ["yamaha-r15-v4", "suzuki-gixxer-sf-250"],
  ["bajaj-pulsar-150", "tvs-apache-rtr-160-2v"],
  ["yamaha-r15-v4", "honda-cbr150r"],
  ["bajaj-pulsar-n250", "suzuki-gixxer-250"],
  ["tvs-raider-125", "hero-xtreme-125r"],
  ["suzuki-gixxer-monotone", "yamaha-fzs-v2-dd"],
];

export const popularPairs = () =>
  POPULAR_COMPARISONS.map(([a, b]) => [getBike(a), getBike(b)] as const).filter((p): p is readonly [BikeLite, BikeLite] => !!p[0] && !!p[1]);

/** Crawlable URL of a popular pair (src/app/compare/[pair]); other pairs use /compare/?bikes=a,b. */
export const pairSlug = (a: string, b: string) => `${a}-vs-${b}`;
export const pairHref = (a: string, b: string) => `/compare/${pairSlug(a, b)}/`;
export const pairBySlug = (slug: string) => popularPairs().find(([a, b]) => pairSlug(a.id, b.id) === slug);

/** Popular comparisons that include this bike id. */
export function pairsForBike(id: string) {
  const res: { other: BikeLite; slug: string; href: string }[] = [];
  for (const [a, b] of POPULAR_COMPARISONS) {
    if (a === id) {
      const other = getBike(b);
      if (other) res.push({ other, slug: pairSlug(a, b), href: pairHref(a, b) });
    } else if (b === id) {
      const other = getBike(a);
      if (other) res.push({ other, slug: pairSlug(a, b), href: pairHref(a, b) });
    }
  }
  return res;
}

/** Title, description and hreflang for a popular pair page; every figure comes from bikes.json via the engines. */
export function pairMetadata(slug: string, lang: "en" | "bn"): Metadata {
  const p = pairBySlug(slug);
  if (!p) return {};
  const [a, b] = p;
  const price = `${formatBDT(onRoadPrice(a), lang)} vs ${formatBDT(onRoadPrice(b), lang)}`;
  const km = `${mileageText(a)} vs ${mileageText(b)}`;
  const title =
    lang === "bn" ? `${a.model} বনাম ${b.model}: বাংলাদেশে দাম, মাইলেজ ও স্পেক` : `${a.model} vs ${b.model}: price, mileage & specs in Bangladesh`;
  const description =
    lang === "bn"
      ? `${a.brand} ${a.model} না ${b.brand} ${b.model}? অন-রোড দাম ${price}, আসল মাইলেজ ${km}, পাওয়ার ${a.powerPS} বনাম ${b.powerPS} PS, ওজন, পার্টস আর মাসিক খরচ পাশাপাশি।`
      : `${a.brand} ${a.model} or ${b.brand} ${b.model}? On-road price ${price}, real mileage ${km}, power ${a.powerPS} vs ${b.powerPS} PS, weight, parts and monthly cost side by side.`;
  return { title, description, alternates: langAlternates(pairHref(a.id, b.id), lang), openGraph: { ...(lang === "bn" ? OG_BN : OG_BASE), title, description } };
}

const TITLE_MAX = 60;
/**
 * Bike page title in the words BD buyers search ("pulsar n160 price in bd", "dam koto", "দাম কত"): the full name with the
 * longest tail that fits ~60 characters, and the model alone only when no tail fits. Used as an absolute title: " · Suggest.Bike" would push
 * every one past 60.
 */
export function bikeTitle(b: Pick<Bike, "brand" | "model" | "status">, lang: "en" | "bn") {
  const used = b.status === "used-only";
  const tails =
    lang === "bn"
      ? used ? ["-এর পুরনো বাইকের দাম কত? পার্টস ও মাইলেজ", "-এর পুরনো বাইকের দাম কত?"] : ["-এর দাম কত? অন-রোড খরচ ও কিস্তি", "-এর দাম কত?"]
      : used ? [" used price in BD, parts and mileage (dam koto)", " used price in BD (dam koto)"] : [" price in BD, on-road cost and EMI (dam koto)", " price in BD and EMI (dam koto)", " price in BD (dam koto)"];
  // Brand first: most BD searches name it ("bajaj pulsar n160 price"), so a shorter tail beats dropping it (critique 15 Oct N10).
  const all = [...tails.map((t) => fullName(b) + t), ...tails.map((t) => b.model + t)];
  let picked = all.find((t) => t.length <= TITLE_MAX) ?? all[all.length - 1];
  const brandSuffix = " · Suggest.Bike";
  if (picked.length + brandSuffix.length <= TITLE_MAX) {
    picked += brandSuffix;
  }
  return picked;
}

/**
 * Bikes removed from the catalogue after their pages were live (antique used-only imports, 14 Oct 2026). Their old
 * /bikes/<id>/ URLs stay as static pages that send readers on to the bike list, never a 404 (tests/seo.test.ts
 * fails if a bike leaves bikes.json without an entry here).
 */
export const RETIRED_BIKES: readonly string[] = ["honda-cbx-600p", "honda-cbx-750", "honda-cd70", "roadmaster-cd200"];

export const retiredMetadata = (id: string, lang: "en" | "bn"): Metadata => ({
  title: lang === "bn" ? "এই বাইকটি আর তালিকায় নেই" : "This bike is no longer listed",
  robots: { index: false, follow: true },
  alternates: langAlternates(`/bikes/${id}/`, lang),
  openGraph: lang === "bn" ? OG_BN : OG_BASE, // bn-og.mts fails the deploy if a /bn/ page falls back to the English /og.png
});

/** Title, description, hreflang and share image for a bike page; every figure comes from bikes.json via the engines. */
export function bikeMetadata(b: Bike, lang: "en" | "bn"): Metadata {
  const used = b.status === "used-only";
  const title = bikeTitle(b, lang);
  const description =
    lang === "bn"
      ? `${fullName(b)}-এর দাম ${used ? `পুরনো বাজারে প্রায় ${formatBDT(b.priceBDT, "bn")}` : `অন-রোড ${formatBDT(onRoadPrice(b), "bn")} (২ বছরের ট্যাক্স টোকেনসহ; শোরুম মূল্য ${formatBDT(b.priceBDT, "bn")})`}। ${b.ev ? `আসল রেঞ্জ ${b.ev.realRangeKm[0]}–${b.ev.realRangeKm[1]} কিমি/চার্জ` : `আসল মাইলেজ ${b.mileageKmpl[0]}–${b.mileageKmpl[1]} কিমি/লি`}, পার্টসের দাম, মিস্ত্রির মতামত ও মাসিক খরচ।`
      : used
        ? `${fullName(b)} er dam koto? About ${formatBDT(b.priceBDT)} used in Bangladesh. ${ccLabel(b)}, real-world ${mileageText(b)}, parts prices, mechanic familiarity and monthly running cost. ${b.tagline}`
        : `${fullName(b)} er dam koto? ${formatBDT(onRoadPrice(b))} on-road in Bangladesh with a 2-year tax token (${formatBDT(b.priceBDT)} ex-showroom). ${ccLabel(b)}, real-world ${mileageText(b)}, card EMI and loan cost, parts prices and monthly running cost. ${b.tagline}`;
  // The /bn/ card is rendered after the build by scripts/bn-og.mts (Chromium shapes Bangla; next/og cannot).
  const images = [{ url: `${lang === "bn" ? "/bn" : ""}/bikes/${b.id}/og.png`, width: 1200, height: 630, alt: fullName(b) }];
  return {
    title: { absolute: title },
    description,
    alternates: langAlternates(`/bikes/${b.id}/`, lang),
    openGraph: { ...(lang === "bn" ? OG_BN : OG_BASE), title, description, images },
  };
}
