import { bnDigits, formatBDT, fullName } from "./bike-utils";
import { DEFAULT_COST_INPUT, ownershipCost, type CostBike } from "./cost";
import { SITE } from "./site";
import type { BikeLite } from "./types";

type Lang = "en" | "bn";
/** The only bike fields a share card may read: public catalogue data, never the sharer's quiz answers. */
export type ShareBike = Pick<BikeLite, "id" | "brand" | "model"> & CostBike;

/**
 * Link shared from a quiz result: the top bike's id and ?src=share only. Budget, height, experience and the rest of the
 * answers stay on the sharer's phone (tests/share.test.ts).
 */
export const shareUrl = (id: string, lang: Lang) => `${SITE.url}${lang === "bn" ? "/bn" : ""}/r/${encodeURIComponent(id)}/?src=share`;

/** Running cost a month before resale loss, at the cost page defaults: the same figure as the home page's quick pick. */
export const shareMonthly = (b: CostBike) => Math.round(ownershipCost(b, { ...DEFAULT_COST_INPUT, includeDepreciation: false }).runningPerMonth);

/** Share-card text for /r/<id>/ and its og.png (scripts/bn-og.mts); built from the bike record alone. */
export function shareCard(b: ShareBike, lang: Lang) {
  const m = formatBDT(shareMonthly(b), lang);
  const km = DEFAULT_COST_INPUT.kmPerDay;
  return lang === "bn"
    ? {
        title: `আমার জন্য সেরা: ${fullName(b)} · মাসে ${m}`,
        description: `Suggest.Bike কুইজে আমার ১ নম্বর বাইক ${fullName(b)}। দিনে ${bnDigits(String(km))} কিমি চালালে মাসে প্রায় ${m} চলার খরচ (রিসেলের ক্ষতি বাদে)। আপনার জন্য কোনটি? কুইজ দিয়ে মিলিয়ে দেখুন।`,
        meta: `আমার জন্য সেরা · ${b.brand}`,
        model: b.model,
        price: `মাসে ${m}`,
        suffix: " চলার খরচ",
        ex: `দিনে ${bnDigits(String(km))} কিমি, রিসেলের ক্ষতি বাদে`,
        spec: "আপনার জন্য কোনটি? কুইজ দিয়ে মিলিয়ে দেখুন",
      }
    : {
        title: `My best match: ${fullName(b)} · ${m} a month`,
        description: `${fullName(b)} came first for me in the Suggest.Bike quiz. About ${m} a month to run at ${km} km a day (before resale loss). Which one is yours? Take the quiz and compare.`,
        meta: `My best match · ${b.brand}`,
        model: b.model,
        price: `${m} a month`,
        suffix: " to run",
        ex: `At ${km} km a day, before resale loss`,
        spec: "Which one is yours? Take the quiz and compare",
      };
}
