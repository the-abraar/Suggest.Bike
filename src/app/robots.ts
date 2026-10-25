import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";

export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  // /experimental/ previews are noindex and not linked; disallowed so crawlers skip them too.
  return { rules: { userAgent: "*", allow: "/", disallow: "/experimental/" }, sitemap: `${SITE.url}/sitemap.xml` };
}
