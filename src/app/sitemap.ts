import type { MetadataRoute } from "next";
import { BIKES } from "@/lib/bikes";
import { POSTS } from "@/lib/maintenance-posts";
import { POPULAR_COMPARISONS, pairSlug } from "@/lib/curated";
import { SITE } from "@/lib/site";

export const dynamic = "force-static";

// Every indexable page that has a /bn/ twin. /saved/ is noindex (a per-browser list), so it is not here.
const STATIC = ["", "match/", "bikes/", "compare/", "cost/", "guide/", "guide/motorcycle-fines/", "guide/speed-limits/", "guide/driving-licence/", "guide/e-fines/", "owner/", "maintenance/", "method/", "changes/", "dealers/", "about/", "feedback/", "privacy/", "terms/", "disclaimer/"];

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = STATIC.map((p) => ({ url: `${SITE.url}/${p}`, changeFrequency: "weekly" as const, priority: p ? 0.8 : 1 }));
  const bikes = BIKES.map((b) => ({ url: `${SITE.url}/bikes/${b.id}/`, changeFrequency: "monthly" as const, priority: 0.7 }));
  const posts = POSTS.map((p) => `maintenance/${p.slug}/`);
  const pairs = POPULAR_COMPARISONS.map(([a, b]) => `compare/${pairSlug(a, b)}/`);
  const postPages = posts.map((p) => ({ url: `${SITE.url}/${p}`, changeFrequency: "monthly" as const, priority: 0.6 }));
  const compares = pairs.map((p) => ({ url: `${SITE.url}/${p}`, changeFrequency: "monthly" as const, priority: 0.7 }));
  const bn = [...STATIC, ...posts, ...pairs, ...BIKES.map((b) => `bikes/${b.id}/`)].map((p) => ({ url: `${SITE.url}/bn/${p}`, changeFrequency: "monthly" as const, priority: 0.5 }));
  return [...pages, ...bikes, ...compares, ...postPages, ...bn];
}
