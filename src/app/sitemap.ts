import type { MetadataRoute } from "next";
import guide from "@/data/guide.json";
import history from "@/data/generated/price-history.json"; // from git by scripts/build-history.ts
import { BIKES, getBike } from "@/lib/bikes";
import { DEALERS } from "@/lib/dealers";
import type { PriceHistory } from "@/lib/history";
import { POSTS } from "@/lib/maintenance-posts";
import { SPOTLIGHTS } from "@/lib/spotlight-posts";
import { POPULAR_COMPARISONS, pairSlug } from "@/lib/curated";
import { SITE } from "@/lib/site";
import type { BikeLite } from "@/lib/types";

export const dynamic = "force-static";

const latest = (dates: (string | undefined)[]) => dates.filter((d): d is string => !!d).sort().at(-1); // ISO dates sort as strings
/** The day a bike page last changed: its price-check month, or the day its current price entered our data, whichever is later. */
const bikeLastmod = (b: Pick<BikeLite, "id" | "priceAsOf">) =>
  latest([`${b.priceAsOf}-01`, (history as PriceHistory).bikes[b.id]?.at(-1)?.firstSeen])!;

const CATALOGUE = latest(BIKES.map(bikeLastmod));
const GUIDE = latest([...JSON.stringify(guide).matchAll(/"asOf":"(\d{4}-\d{2}-\d{2})"/g)].map((m) => m[1]));
const POSTS_DATE = latest(POSTS.map((p) => p.updated));
/** A spotlight quotes its bike's live price, so it changes when the post or that bike does. */
const spotlightLastmod = (s: (typeof SPOTLIGHTS)[number]) => {
  const b = getBike(s.bike);
  return latest([s.updated, b && bikeLastmod(b)]);
};
const DEALERS_DATE = latest(Object.values(DEALERS).map((d) => d.checked));

// Every indexable page that has a /bn/ twin, with the date of the data it shows. /saved/ is noindex (a per-browser list), so it
// is not here. About, method, feedback and the legal pages carry no dated data, so they get no lastmod rather than an invented one.
const STATIC: [string, string | undefined][] = [
  ["", CATALOGUE], ["match/", CATALOGUE], ["bikes/", CATALOGUE], ["compare/", CATALOGUE], ["cost/", latest([CATALOGUE, GUIDE])], ["changes/", CATALOGUE],
  ["guide/", GUIDE], ["guide/motorcycle-fines/", GUIDE], ["guide/speed-limits/", GUIDE], ["guide/driving-licence/", GUIDE], ["guide/e-fines/", GUIDE],
  ["owner/", POSTS_DATE], ["maintenance/", POSTS_DATE], ["spotlight/", latest(SPOTLIGHTS.map(spotlightLastmod))], ["dealers/", DEALERS_DATE],
  ["method/", undefined], ["about/", undefined], ["feedback/", undefined], ["privacy/", undefined], ["terms/", undefined], ["disclaimer/", undefined],
];

type Row = [path: string, lastmod: string | undefined, priority: number];

export default function sitemap(): MetadataRoute.Sitemap {
  const en: Row[] = [
    ...STATIC.map(([p, d]): Row => [p, d, p ? 0.8 : 1]),
    ...BIKES.map((b): Row => [`bikes/${b.id}/`, bikeLastmod(b), 0.7]),
    ...POPULAR_COMPARISONS.map(([a, b]): Row => [`compare/${pairSlug(a, b)}/`, latest([getBike(a), getBike(b)].map((x) => x && bikeLastmod(x))), 0.7]),
    ...POSTS.map((p): Row => [`maintenance/${p.slug}/`, p.updated, 0.6]),
    ...SPOTLIGHTS.map((s): Row => [`spotlight/${s.slug}/`, spotlightLastmod(s), 0.6]),
  ];
  // No changeFrequency: it was "weekly" or "monthly" for everything, which says nothing (search engines ignore it).
  const entry = ([path, lastModified, priority]: Row) => ({ url: `${SITE.url}/${path}`, ...(lastModified && { lastModified }), priority });
  return [...en.map(entry), ...en.map(([p, d]): Row => [`bn/${p}`, d, 0.5]).map(entry)];
}
