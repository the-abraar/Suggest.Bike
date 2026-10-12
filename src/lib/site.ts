/** Prefilled GitHub issue: a feedback path for phones with no mail client. Needs a GitHub account. */
export const issueUrl = (title: string, body = "") =>
  `https://github.com/the-abraar/Suggest.Bike/issues/new?title=${encodeURIComponent(title)}&body=${encodeURIComponent(body)}`;

export const SITE = {
  name: "Suggest.Bike",
  url: "https://suggest.bike",
  // Inbox for price corrections and feedback. Create this mailbox before launch (see Todo_owner.md).
  contactEmail: "hello@suggest.bike",
  description:
    "Bangladesh's motorcycle decision engine — find the right bike for your budget, compare real-world mileage, parts prices, mechanic familiarity and true monthly cost.",
  editor: "Abrar (The-Abraar)",
};

/** Formspree-compatible JSON endpoint (e.g. https://formspree.io/f/xxxx). Empty: forms open a prefilled email instead. See Todo_owner.md. */
export const FORM_ENDPOINT: string = "";

/** GoatCounter site code (the "xxx" in xxx.goatcounter.com). Empty: no analytics script is loaded. See Todo_owner.md. */
export const GOATCOUNTER_CODE: string = "";

/** Count a custom GoatCounter event; a no-op when analytics is off or blocked. */
export function track(event: string) {
  const gc = (globalThis as { goatcounter?: { count?: (o: { path: string; event: boolean }) => void } }).goatcounter;
  gc?.count?.({ path: event, event: true });
}

// EN paths that have a server-rendered Bangla twin under /bn/ (Decision 8 in new_judge.md).
const BN_TWIN = /^\/(?:(?:bikes(?:\/[^/]+)?|match|compare|cost|guide|dealers|method|about)\/?)?$/;

/** Internal href in `lang`: adds or strips the /bn prefix, keeping ?query and #hash. Pages without a Bangla twin keep the English URL. */
export function langHref(href: string, lang: "en" | "bn"): string {
  if (!href.startsWith("/")) return href;
  const cut = href.search(/[?#]/);
  const path = cut < 0 ? href : href.slice(0, cut);
  const rest = cut < 0 ? "" : href.slice(cut);
  const en = path.replace(/^\/bn(?=\/|$)/, "") || "/";
  if (lang === "en" || !BN_TWIN.test(en)) return en + rest;
  return (en === "/" ? "/bn/" : `/bn${en}`) + rest;
}

/** Canonical + hreflang (en, bn, x-default) for an EN path and its /bn/ twin. */
export function langAlternates(enPath: string, lang: "en" | "bn" = "en") {
  const bn = langHref(enPath, "bn");
  return { canonical: lang === "bn" ? bn : enPath, languages: { en: enPath, bn, "x-default": enPath } };
}

/** Site-wide share image (app/og.png/route.tsx); bike pages use their own /bikes/<id>/og.png. */
export const OG_IMAGE = { url: "/og.png", width: 1200, height: 630, alt: "Suggest.Bike — find the right motorcycle in Bangladesh" };
/** Next replaces (not merges) a parent's openGraph, so pages that set one spread this first. */
export const OG_BASE = { siteName: SITE.name, type: "website" as const, locale: "en_BD", images: [OG_IMAGE] };
export const OG_BN = { ...OG_BASE, locale: "bn_BD" };
