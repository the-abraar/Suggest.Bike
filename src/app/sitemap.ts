import type { MetadataRoute } from "next";
import { BIKES } from "@/lib/bikes";
import { SITE } from "@/lib/site";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = ["", "match/", "bikes/", "compare/", "cost/", "guide/", "method/", "dealers/", "about/", "feedback/", "privacy/", "terms/", "disclaimer/"].map((p) => ({ url: `${SITE.url}/${p}`, changeFrequency: "weekly" as const, priority: p ? 0.8 : 1 }));
  const bikes = BIKES.map((b) => ({ url: `${SITE.url}/bikes/${b.id}/`, changeFrequency: "monthly" as const, priority: 0.7 }));
  const bn = ["", "match/", "bikes/", "compare/", "cost/", "guide/", "method/", "dealers/", "about/", ...BIKES.map((b) => `bikes/${b.id}/`)].map((p) => ({ url: `${SITE.url}/bn/${p}`, changeFrequency: "monthly" as const, priority: 0.5 }));
  return [...pages, ...bikes, ...bn];
}
