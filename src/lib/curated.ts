import type { Metadata } from "next";
import { formatBDT, getBike, mileageText } from "./bikes";
import { onRoadPrice } from "./cost";
import { langAlternates, OG_BASE, OG_BN } from "./site";
import type { BikeLite } from "./types";

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
  const price = `${formatBDT(onRoadPrice(a))} vs ${formatBDT(onRoadPrice(b))}`;
  const km = `${mileageText(a)} vs ${mileageText(b)}`;
  const title =
    lang === "bn" ? `${a.model} বনাম ${b.model}: বাংলাদেশে দাম, মাইলেজ ও স্পেক` : `${a.model} vs ${b.model}: price, mileage & specs in Bangladesh`;
  const description =
    lang === "bn"
      ? `${a.brand} ${a.model} না ${b.brand} ${b.model}? অন-রোড দাম ${price}, আসল মাইলেজ ${km}, পাওয়ার ${a.powerPS} বনাম ${b.powerPS} PS, ওজন, পার্টস আর মাসিক খরচ পাশাপাশি।`
      : `${a.brand} ${a.model} or ${b.brand} ${b.model}? On-road price ${price}, real mileage ${km}, power ${a.powerPS} vs ${b.powerPS} PS, weight, parts and monthly cost side by side.`;
  return { title, description, alternates: langAlternates(pairHref(a.id, b.id), lang), openGraph: { ...(lang === "bn" ? OG_BN : OG_BASE), title, description } };
}
