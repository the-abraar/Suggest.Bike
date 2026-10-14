"use client";

import { usePathname, useRouter } from "next/navigation";
import { langHref } from "./site";
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";

export type Lang = "en" | "bn";

const DICT = {
  "nav.match": { en: "Find my bike", bn: "আমার বাইক খুঁজুন" },
  "nav.browse": { en: "All bikes", bn: "সব বাইক" },
  "nav.compare": { en: "Compare", bn: "তুলনা" },
  "nav.cost": { en: "True cost", bn: "আসল খরচ" },
  "nav.guide": { en: "Buyer's guide", bn: "ক্রেতা গাইড" },
  "nav.dealers": { en: "Dealers", bn: "ডিলার" },
  "nav.method": { en: "Method", bn: "পদ্ধতি" },
  "nav.saved": { en: "Saved", bn: "সংরক্ষিত" },
  "nav.menu": { en: "Menu", bn: "মেনু" },

  "home.kicker": { en: "Bangladesh's motorcycle decision engine", bn: "বাংলাদেশের মোটরসাইকেল সিদ্ধান্তের প্ল্যাটফর্ম" },
  "home.title1": { en: "Don't buy a bike", bn: "বাইক কেনার আগে" },
  "home.title2": { en: "before you've been here.", bn: "একবার এখানে আসুন।" },
  "home.sub": {
    en: "Honest, Bangladesh-specific answers: real mileage, what the local mistri thinks, what parts cost in Bangshal, and what you'll actually spend each month.",
    bn: "বাংলাদেশের জন্য সৎ উত্তর: আসল মাইলেজ, লোকাল মিস্ত্রি কী বলে, বংশালে পার্টসের দাম, আর প্রতি মাসে আসলে কত খরচ হবে।",
  },
  "home.cta": { en: "Find my bike in 60 seconds", bn: "৬০ সেকেন্ডে আমার বাইক খুঁজুন" },
  "home.cta2": { en: "Browse all bikes", bn: "সব বাইক দেখুন" },
  "home.search": { en: "Search any bike — Pulsar, R15, Apache…", bn: "যেকোনো বাইক খুঁজুন — পালসার, R15, অ্যাপাচি…" },

  "match.title": { en: "Let's find your bike", bn: "চলুন আপনার বাইক খুঁজি" },
  "match.step": { en: "Step", bn: "ধাপ" },
  "match.of": { en: "of", bn: "এর" },
  "match.next": { en: "Continue", bn: "পরবর্তী" },
  "match.back": { en: "Back", bn: "পেছনে" },
  "match.see": { en: "Show my matches", bn: "আমার ম্যাচ দেখান" },
  "match.restart": { en: "Start over", bn: "আবার শুরু" },

  "common.compare": { en: "Compare", bn: "তুলনা" },
  "common.added": { en: "Added", bn: "যুক্ত" },
  "common.compareFull": { en: "Compare full", bn: "তুলনা পূর্ণ" },
  "common.compareFullHint": { en: "Compare holds 3 bikes. Remove one to add another.", bn: "তুলনায় ৩টি বাইক রাখা যায়। আরেকটি যোগ করতে একটি সরান।" },
  "common.save": { en: "Save", bn: "সেভ" },
  "common.saved": { en: "Saved", bn: "সেভড" },
  "common.details": { en: "Full details", bn: "বিস্তারিত" },
  "common.mileage": { en: "Real mileage", bn: "আসল মাইলেজ" },
  "common.price": { en: "Price", bn: "দাম" },
  "common.usedOnly": { en: "Used market", bn: "ব্যবহৃত বাজার" },
  "common.availUnconfirmed": { en: "Availability unconfirmed", bn: "পাওয়া যাবে কিনা অনিশ্চিত" },
  "common.compareNow": { en: "Compare now", bn: "এখনই তুলনা করুন" },
  "common.clear": { en: "Clear", bn: "মুছুন" },
  "common.selected": { en: "selected", bn: "নির্বাচিত" },
  "price.onRoad": { en: "on-road, with 2-year tax token", bn: "অন-রোড, ২ বছরের ট্যাক্স টোকেনসহ" },
  "price.exShowroom": { en: "ex-showroom", bn: "শোরুম মূল্য" },
  "price.usedAsking": { en: "used, asking price", bn: "পুরনো, চাওয়া দাম" },

  "footer.tag": {
    en: "Built for Bangladeshi riders. On-road prices are ex-showroom plus BRTA registration with a 2-year tax token; prices change often — always confirm with the showroom before paying.",
    bn: "বাংলাদেশি রাইডারদের জন্য তৈরি। অন-রোড দাম = শোরুম মূল্য + ২ বছরের ট্যাক্স টোকেনসহ BRTA রেজিস্ট্রেশন; দাম প্রায়ই বদলায় — টাকা দেওয়ার আগে শোরুমে নিশ্চিত হোন।",
  },
} as const;

export type DictKey = keyof typeof DICT;

type Ctx = { lang: Lang; setLang: (l: Lang) => void; t: (k: DictKey) => string };
const LangContext = createContext<Ctx>({ lang: "en", setLang: () => {}, t: (k) => DICT[k].en });

export function LangProvider({ children }: { children: ReactNode }) {
  // /bn/... pages are the indexable Bangla copy: the URL decides the language there, not localStorage.
  const onBn = /^\/bn(\/|$)/.test(usePathname());
  const router = useRouter();
  const [lang, setLangState] = useState<Lang>(onBn ? "bn" : "en");

  useEffect(() => {
    if (onBn) {
      setLangState("bn");
      try { localStorage.setItem("sb-lang", "bn"); } catch {} // keep Bangla when the reader follows an English-URL link
      return;
    }
    try {
      const saved = localStorage.getItem("sb-lang");
      if (saved !== "bn" && saved !== "en") return;
      const here = location.pathname + location.search + location.hash;
      const twin = saved === "bn" ? langHref(here, "bn") : here;
      // A Bangla reader on an English URL goes to its /bn/ twin; pages without one switch in place.
      if (twin !== here) router.replace(twin);
      else setLangState(saved);
    } catch {}
  }, [onBn, router]);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    try {
      localStorage.setItem("sb-lang", l);
    } catch {}
  }, []);

  const t = useCallback((k: DictKey) => DICT[k][lang], [lang]);
  return <LangContext.Provider value={{ lang, setLang, t }}>{children}</LangContext.Provider>;
}

export const useLang = () => useContext(LangContext);

/** Inline translator for strings that aren't worth a dictionary key: tx("Price", "দাম"). */
export function useTx() {
  const { lang } = useLang();
  return useCallback((en: string, bn: string) => (lang === "bn" ? bn : en), [lang]);
}

/** For server components: <T k="nav.match" /> */
export function T({ k }: { k: DictKey }) {
  const { t } = useLang();
  return <>{t(k)}</>;
}

/** Inline bilingual text when a string isn't worth a dictionary key. */
export function L({ en, bn }: { en: ReactNode; bn: ReactNode }) {
  const { lang } = useLang();
  return <>{lang === "bn" ? bn : en}</>;
}
