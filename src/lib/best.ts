import type { Metadata } from "next";
import guide from "@/data/guide.json";
import { BIKES, bnDigits, bnNumerals, ccLabel, formatBDT, fullName, mileageText } from "./bikes";
import { DEFAULT_COST_INPUT, onRoadPrice, ownershipCost, registrationFor } from "./cost";
import { DEFAULT_ANSWERS, encodeAnswers, matchBikes, registrable, type Answers } from "./match";
import { langAlternates, OG_BASE, OG_BN } from "./site";
import type { BikeLite } from "./types";

/**
 * Search landing pages ("best bike under 2 lakh", "150cc price list", "BRTA registration cost"), EN at /<path>/ and BN at /bn/<path>/.
 * Every figure comes from bikes.json and guide.json through the engines (tests/best.test.ts checks each ৳ amount).
 */
type Lang = "en" | "bn";
type Two = [en: string, bn: string];

/** One buyer intent = fixed matchmaker answers; the page shows the engine's top 5 for them. */
type Intent = { slug: string; h1: Two; q: Two; who: Two; answers: Partial<Answers> };

const LAKH = (n: number): Two => [`৳${n} lakh`, `${bnDigits(String(n))} লাখ টাকা`];

export const INTENTS: Intent[] = [
  ...[1, 2, 3].map((n): Intent => ({
    slug: `under-${n}-lakh`,
    h1: [`Best bikes under ${LAKH(n)[0]} on the road`, `${LAKH(n)[1]}র মধ্যে সেরা বাইক`],
    q: [`Which is the best bike under ${LAKH(n)[0]}?`, `${LAKH(n)[1]}র মধ্যে সেরা বাইক কোনটি?`],
    who: [`a new bike whose on-road price fits ${LAKH(n)[0]}, for daily commuting`, `অন-রোড দাম ${LAKH(n)[1]}র মধ্যে, নতুন বাইক, প্রতিদিনের যাতায়াতের জন্য`],
    answers: { budget: n * 100000 },
  })),
  {
    slug: "mileage",
    h1: ["Best mileage bikes in Bangladesh", "সবচেয়ে বেশি মাইলেজের বাইক"],
    q: ["Which bike gives the best mileage?", "কোন বাইকের মাইলেজ সবচেয়ে বেশি?"],
    who: ["petrol bikes and scooters ranked on real-world mileage and low price, any budget", "তেলের বাইক ও স্কুটার, আসল মাইলেজ আর কম দাম ধরে, যেকোনো বাজেটে"],
    answers: { budget: 1000000, kinds: ["motorcycle", "scooter"], priorities: ["mileage", "price"] },
  },
  {
    slug: "scooter",
    h1: ["Best scooters in Bangladesh", "সেরা স্কুটার"],
    q: ["Which is the best scooter?", "সেরা স্কুটার কোনটি?"],
    who: ["petrol scooters up to ৳3 lakh on the road, for city riding", "তেলের স্কুটার, অন-রোড ৩ লাখ টাকা পর্যন্ত, শহরে চালানোর জন্য"],
    answers: { budget: 300000, kinds: ["scooter"] },
  },
  {
    slug: "for-pathao-uber",
    h1: ["Best bikes for Pathao and Uber riders", "পাঠাও ও উবারের জন্য সেরা বাইক"],
    q: ["Which bike is best for Pathao or Uber?", "পাঠাও বা উবারের জন্য কোন বাইক সেরা?"],
    who: ["ride-sharing with a passenger every day, up to ৳2 lakh on the road", "প্রতিদিন যাত্রী নিয়ে রাইড শেয়ার, অন-রোড ২ লাখ টাকা পর্যন্ত"],
    answers: { budget: 200000, use: "rideshare", pillion: "daily" },
  },
  {
    slug: "for-women",
    h1: ["Best bikes for women riders: low seat, light, easy", "নারী রাইডারদের জন্য সেরা বাইক: নিচু সিট, হালকা, সহজ"],
    q: ["Which bike is best for a woman rider?", "নারী রাইডারের জন্য কোন বাইক সেরা?"],
    who: ["a rider under 165 cm on a first bike, up to ৳2.5 lakh on the road (the quiz is the same for everyone)", "১৬৫ সেমির কম উচ্চতা, প্রথম বাইক, অন-রোড ২.৫ লাখ টাকা পর্যন্ত (কুইজ সবার জন্য একই)"],
    answers: { budget: 250000, height: "short", experience: "first" },
  },
  {
    slug: "first-bike",
    h1: ["Best first bike for beginners", "নতুনদের জন্য সেরা প্রথম বাইক"],
    q: ["Which is the best first bike?", "প্রথম বাইক হিসেবে কোনটি সেরা?"],
    who: ["a first-time rider, up to ৳2 lakh on the road", "প্রথমবার বাইক চালাচ্ছেন, অন-রোড ২ লাখ টাকা পর্যন্ত"],
    answers: { budget: 200000, experience: "first" },
  },
];

export const bestHref = (slug: string) => `/best/${slug}/`;
export const REG_PATH = "/brta-registration-cost-2026/";
export const LIST_150_PATH = "/150cc-price-list/";
/** Every landing page's EN path, for the sitemap and the "more lists" links. */
export const LANDING_PATHS = [...INTENTS.map((i) => bestHref(i.slug)), LIST_150_PATH, REG_PATH];

/** Running cost a month, before resale loss: the same figure as the home page's quick pick. */
export const monthlyCost = (b: BikeLite) => Math.round(ownershipCost(b, { ...DEFAULT_COST_INPUT, includeDepreciation: false }).runningPerMonth);

const latest = (xs: string[]) => [...xs].sort().at(-1)!;
/** Month the newest price in a list was checked ("2026-11"). */
const asOf = (bs: BikeLite[]) => latest(bs.map((b) => b.priceAsOf));
const YEAR = latest(BIKES.map((b) => b.priceAsOf)).slice(0, 4);
const REG = guide.registration;
const REG_100 = REG.bands[0];
const REG_ABOVE = REG.bands[REG.bands.length - 1];
const regDay = (lang: Lang) => new Date(`${REG.asOf}T00:00:00`).toLocaleDateString(lang === "bn" ? "bn-BD" : "en-GB", { day: "numeric", month: "long", year: "numeric" });

export type Landing = {
  path: string; // EN path; the BN twin is /bn + path
  title: string;
  description: string;
  h1: string;
  intro: string;
  head: string[];
  rows: { name: string; href?: string; cells: string[] }[];
  note?: string;
  cta?: { href: string; label: string };
  faq: [q: string, a: string][];
};

const pick = (lang: Lang, t: Two) => (lang === "bn" ? bnNumerals(t[1]) : t[0]);
const money = (n: number, lang: Lang) => formatBDT(n, lang);
const month = (ym: string, lang: Lang) => new Date(`${ym}-01T00:00:00`).toLocaleDateString(lang === "bn" ? "bn-BD" : "en-GB", { month: "long", year: "numeric" });
const list = (xs: string[], lang: Lang) => xs.join(lang === "bn" ? ", " : "; ");
const onRoadLine = (lang: Lang) =>
  pick(lang, [
    `On-road = ex-showroom price + BRTA registration with a 2-year tax token (${money(REG_ABOVE.totalBDT, "en")} above 100cc, ${money(REG_100.totalBDT, "en")} up to 100cc, as of ${regDay("en")}). Confirm with the showroom before you pay.`,
    `অন-রোড = শোরুম মূল্য + ২ বছরের ট্যাক্স টোকেনসহ BRTA রেজিস্ট্রেশন (১০০cc-এর বেশি ${money(REG_ABOVE.totalBDT, "bn")}, ১০০cc পর্যন্ত ${money(REG_100.totalBDT, "bn")}, ${regDay("bn")} অনুযায়ী)। টাকা দেওয়ার আগে শোরুমে নিশ্চিত হোন।`,
  ]);

/** The engine's top 5 for an intent, or undefined for an unknown slug. */
export function bestPicks(slug: string) {
  const intent = INTENTS.find((i) => i.slug === slug);
  if (!intent) return undefined;
  const answers: Answers = { ...DEFAULT_ANSWERS, ...intent.answers };
  return { intent, answers, picks: matchBikes(answers, 5) };
}

export function bestPage(slug: string, lang: Lang): Landing | undefined {
  const r = bestPicks(slug);
  if (!r) return undefined;
  const { intent, answers, picks } = r;
  const bikes = picks.map((m) => m.bike);
  const h1 = lang === "bn" ? `${pick(lang, intent.h1)} ${bnDigits(YEAR)}` : `${intent.h1[0]} (${YEAR})`;
  const who = pick(lang, intent.who);
  const top = bikes[0];
  const names = picks.map((m, i) => `${lang === "bn" ? bnDigits(String(i + 1)) : i + 1}. ${fullName(m.bike)} (${money(m.onRoad, lang)})`);
  const checked = bikes.length ? month(asOf(bikes), lang) : "";
  return {
    path: bestHref(slug),
    title: h1,
    description: top
      ? pick(lang, [
          `Suggest.Bike's matchmaker picks for ${who}: ${bikes.slice(0, 3).map(fullName).join(", ")}. On-road price, monthly running cost and mileage, prices checked ${checked}.`,
          `${who}: Suggest.Bike ম্যাচমেকারের বাছাই ${bikes.slice(0, 3).map(fullName).join(", ")}। অন-রোড দাম, মাসিক খরচ ও মাইলেজ, দাম যাচাই ${checked}।`,
        ])
      : pick(lang, [`No new bike in our data fits ${who}.`, `${who}: আমাদের ডেটায় কোনো নতুন বাইক মেলেনি।`]),
    h1,
    intro: pick(lang, [
      `The top ${picks.length} from our matchmaker for ${who}. Ranked by the same engine as the quiz; prices checked ${checked}.`,
      `${who}: আমাদের ম্যাচমেকারের সেরা ${picks.length}টি। কুইজের একই ইঞ্জিনে র‍্যাঙ্ক করা; দাম যাচাই ${checked}।`,
    ]),
    head: lang === "bn" ? ["বাইক", "অন-রোড দাম", "চলার খরচ / মাস", "মাইলেজ", "দাম যাচাই"] : ["Bike", "On-road price", "Running cost / month", "Mileage", "Price checked"],
    rows: picks.map((m) => ({
      name: fullName(m.bike),
      href: `/bikes/${m.bike.id}/`,
      cells: [money(m.onRoad, lang), money(monthlyCost(m.bike), lang), lang === "bn" ? bnDigits(mileageText(m.bike)) : mileageText(m.bike), month(m.bike.priceAsOf, lang)],
    })),
    note:
      picks.length < 5
        ? pick(lang, [`Only ${picks.length} new bike${picks.length === 1 ? "" : "s"} in our data fit${picks.length === 1 ? "s" : ""} this.`, `আমাদের ডেটায় মাত্র ${picks.length}টি নতুন বাইক এতে মেলে।`])
        : undefined,
    cta: { href: `/match/?${encodeAnswers(answers)}&r=1`, label: pick(lang, ["Change the answers in the matchmaker", "ম্যাচমেকারে নিজের উত্তর দিন"]) },
    faq: top
      ? [
          [
            pick(lang, intent.q),
            pick(lang, [`For ${who}, our matchmaker ranks: ${list(names, lang)}. Prices checked ${checked}.`, `${who}: আমাদের ম্যাচমেকারের র‍্যাঙ্ক ${list(names, lang)}। দাম যাচাই ${checked}।`]),
          ],
          [
            pick(lang, [`What does the ${fullName(top)} cost to run each month?`, `${fullName(top)} চালাতে মাসে কত খরচ?`]),
            pick(lang, [
              `About ${money(monthlyCost(top), lang)} a month at ${DEFAULT_COST_INPUT.kmPerDay} km a day: fuel, servicing, wear parts, insurance and upkeep, before resale loss.`,
              `দিনে ${DEFAULT_COST_INPUT.kmPerDay} কিমি চালালে মাসে প্রায় ${money(monthlyCost(top), lang)}: তেল, সার্ভিসিং, ক্ষয়ে যাওয়া পার্টস, ইনস্যুরেন্স ও রক্ষণাবেক্ষণ, রিসেলের ক্ষতি বাদে।`,
            ]),
          ],
          [pick(lang, ["How is the on-road price worked out?", "অন-রোড দাম কীভাবে হিসাব হয়?"]), onRoadLine(lang)],
        ]
      : [],
  };
}

/** The 150cc class: up to the top of BRTA's 126-165cc band (guide.json), from 140cc so 135cc commuters stay out. */
export const CLASS_150 = { min: 140, max: registrationFor(150).ccMax };
/** On-sale bikes in the 150cc class, cheapest on the road first. */
export const bikes150 = () =>
  BIKES.filter((b) => b.status === "on-sale" && registrable(b) && b.engine.cc >= CLASS_150.min && b.engine.cc <= CLASS_150.max).sort((a, b) => onRoadPrice(a) - onRoadPrice(b));

export function list150Page(lang: Lang): Landing {
  const bs = bikes150();
  const checked = month(asOf(bs), lang);
  const [lo, hi] = [bs[0], bs.at(-1)!];
  const h1 = pick(lang, [`150cc bike price list in Bangladesh ${YEAR}`, `১৫০cc বাইকের দামের তালিকা ${YEAR}`]);
  return {
    path: LIST_150_PATH,
    title: h1,
    description: pick(lang, [
      `${bs.length} new ${CLASS_150.min}-${CLASS_150.max}cc bikes from ${money(onRoadPrice(lo), lang)} to ${money(onRoadPrice(hi), lang)} on the road, with ex-showroom price and real mileage. Prices checked ${checked}.`,
      `${bs.length}টি নতুন ${CLASS_150.min}-${CLASS_150.max}cc বাইক, অন-রোড ${money(onRoadPrice(lo), lang)} থেকে ${money(onRoadPrice(hi), lang)}, শোরুম মূল্য ও আসল মাইলেজসহ। দাম যাচাই ${checked}।`,
    ]),
    h1,
    intro: pick(lang, [
      `Every new bike in our data from ${CLASS_150.min}cc to ${CLASS_150.max}cc, cheapest on the road first. Prices checked ${checked}.`,
      `আমাদের ডেটার ${CLASS_150.min}cc থেকে ${CLASS_150.max}cc-এর সব নতুন বাইক, অন-রোড দামে কম থেকে বেশি। দাম যাচাই ${checked}।`,
    ]),
    head: lang === "bn" ? ["বাইক", "cc", "অন-রোড দাম", "শোরুম মূল্য", "মাইলেজ", "দাম যাচাই"] : ["Bike", "cc", "On-road price", "Ex-showroom", "Mileage", "Price checked"],
    rows: bs.map((b) => ({
      name: fullName(b),
      href: `/bikes/${b.id}/`,
      cells: [lang === "bn" ? bnDigits(ccLabel(b)) : ccLabel(b), money(onRoadPrice(b), lang), money(b.priceBDT, lang), lang === "bn" ? bnDigits(mileageText(b)) : mileageText(b), month(b.priceAsOf, lang)],
    })),
    faq: [
      [
        pick(lang, ["What is the cheapest 150cc bike in Bangladesh?", "বাংলাদেশে সবচেয়ে কম দামের ১৫০cc বাইক কোনটি?"]),
        pick(lang, [
          `The ${fullName(lo)} at ${money(onRoadPrice(lo), lang)} on the road (${money(lo.priceBDT, lang)} ex-showroom), price checked ${month(lo.priceAsOf, lang)}.`,
          `${fullName(lo)}, অন-রোড ${money(onRoadPrice(lo), lang)} (শোরুম মূল্য ${money(lo.priceBDT, lang)}), দাম যাচাই ${month(lo.priceAsOf, lang)}।`,
        ]),
      ],
      [
        pick(lang, ["What is the most expensive 150cc bike?", "সবচেয়ে বেশি দামের ১৫০cc বাইক কোনটি?"]),
        pick(lang, [
          `The ${fullName(hi)} at ${money(onRoadPrice(hi), lang)} on the road (${money(hi.priceBDT, lang)} ex-showroom).`,
          `${fullName(hi)}, অন-রোড ${money(onRoadPrice(hi), lang)} (শোরুম মূল্য ${money(hi.priceBDT, lang)})।`,
        ]),
      ],
      [pick(lang, ["How is the on-road price worked out?", "অন-রোড দাম কীভাবে হিসাব হয়?"]), onRoadLine(lang)],
    ],
  };
}

export function regCostPage(lang: Lang): Landing {
  const h1 = pick(lang, [`BRTA motorcycle registration cost ${REG.asOf.slice(0, 4)}`, `BRTA মোটরসাইকেল রেজিস্ট্রেশন খরচ ${REG.asOf.slice(0, 4)}`]);
  const tenYrSaving = REG_ABOVE.totalBDT10yr - REG_ABOVE.totalBDT;
  return {
    path: REG_PATH,
    title: h1,
    description: pick(lang, [
      `Registering a new bike: ${money(REG_100.totalBDT, lang)} up to 100cc and ${money(REG_ABOVE.totalBDT, lang)} above 100cc with a 2-year tax token, or ${money(REG_ABOVE.totalBDT10yr, lang)} with a 10-year token. As of ${regDay("en")}.`,
      `নতুন বাইকের রেজিস্ট্রেশন: ২ বছরের ট্যাক্স টোকেনসহ ১০০cc পর্যন্ত ${money(REG_100.totalBDT, lang)}, ১০০cc-এর বেশি ${money(REG_ABOVE.totalBDT, lang)}; ১০ বছরের টোকেনে ${money(REG_ABOVE.totalBDT10yr, lang)}। ${regDay("bn")} অনুযায়ী।`,
    ]),
    h1,
    intro: pick(lang, [
      `The BRTA package a buyer pays on top of the ex-showroom price, by engine size, as of ${regDay("en")}. BRTA's own fee has two slabs (up to 100cc, above 100cc); the rest is inspection, the smart card, the RFID plate, the tax token, the Trustee Board fee and VAT. Dealers may add a service charge: ask for an itemised receipt.`,
      `শোরুম মূল্যের ওপর ক্রেতা যে BRTA প্যাকেজ দেন, ইঞ্জিনের সাইজ অনুযায়ী, ${regDay("bn")} অনুযায়ী। BRTA-র নিজের ফি দুই ধাপের (১০০cc পর্যন্ত, ১০০cc-এর বেশি); বাকিটা পরিদর্শন, স্মার্ট কার্ড, RFID নম্বরপ্লেট, ট্যাক্স টোকেন, ট্রাস্টি বোর্ড ফি ও ভ্যাট। ডিলার সার্ভিস চার্জ যোগ করতে পারে: খাতওয়ারি রসিদ চেয়ে নিন।`,
    ]),
    head: lang === "bn" ? ["ইঞ্জিন", "২ বছরের ট্যাক্স টোকেনসহ", "১০ বছরের ট্যাক্স টোকেনসহ"] : ["Engine", "With 2-year tax token", "With 10-year tax token"],
    rows: REG.bands.map((b) => ({
      name: lang === "bn" ? bnDigits(`${b.ccMin}-${b.ccMax}cc`) : `${b.ccMin}-${b.ccMax}cc`,
      cells: [money(b.totalBDT, lang), money(b.totalBDT10yr, lang)],
    })),
    note: guide.meta.disclaimer,
    cta: { href: "/guide/#registration", label: pick(lang, ["Line-by-line breakdown and the process", "খাতওয়ারি হিসাব ও প্রক্রিয়া"]) },
    faq: [
      [
        pick(lang, [`How much does it cost to register a motorcycle in ${REG.asOf.slice(0, 4)}?`, `${REG.asOf.slice(0, 4)} সালে মোটরসাইকেল রেজিস্ট্রেশনে কত লাগে?`]),
        pick(lang, [
          `With a 2-year tax token: ${money(REG_100.totalBDT, lang)} up to 100cc, ${money(REG_ABOVE.totalBDT, lang)} above 100cc (as of ${regDay("en")}).`,
          `২ বছরের ট্যাক্স টোকেনসহ: ১০০cc পর্যন্ত ${money(REG_100.totalBDT, lang)}, ১০০cc-এর বেশি ${money(REG_ABOVE.totalBDT, lang)} (${regDay("bn")} অনুযায়ী)।`,
        ]),
      ],
      [
        pick(lang, ["Is a 150cc bike's registration dearer than a 125cc's?", "১৫০cc বাইকের রেজিস্ট্রেশন কি ১২৫cc-এর চেয়ে বেশি?"]),
        pick(lang, [
          `No. Every bike above 100cc up to ${REG_ABOVE.ccMax}cc pays the same package: ${money(REG_ABOVE.totalBDT, lang)} with a 2-year token.`,
          `না। ১০০cc-এর বেশি থেকে ${REG_ABOVE.ccMax}cc পর্যন্ত সব বাইকের প্যাকেজ একই: ২ বছরের টোকেনে ${money(REG_ABOVE.totalBDT, lang)}।`,
        ]),
      ],
      [
        pick(lang, ["2-year or 10-year tax token?", "২ বছর না ১০ বছরের ট্যাক্স টোকেন?"]),
        pick(lang, [
          `Above 100cc the 10-year token costs ${money(tenYrSaving, lang)} more upfront (${money(REG_ABOVE.totalBDT10yr, lang)}) and needs no renewal for a decade.`,
          `১০০cc-এর বেশি হলে ১০ বছরের টোকেনে শুরুতে ${money(tenYrSaving, lang)} বেশি লাগে (${money(REG_ABOVE.totalBDT10yr, lang)}), দশ বছর নবায়ন লাগে না।`,
        ]),
      ],
    ],
  };
}

/** The page for an EN path, in `lang`. */
export const landing = (path: string, lang: Lang) =>
  path === REG_PATH ? regCostPage(lang) : path === LIST_150_PATH ? list150Page(lang) : bestPage(path.replace(/^\/best\/|\/$/g, ""), lang);

export function landingMetadata(p: Landing, lang: Lang): Metadata {
  return {
    title: p.title,
    description: p.description,
    alternates: langAlternates(p.path, lang),
    openGraph: { ...(lang === "bn" ? OG_BN : OG_BASE), title: p.title, description: p.description },
  };
}

export const faqJsonLd = (p: Landing) => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: p.faq.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })),
});

/** Labels for the "more lists" links. */
export const landingLabel = (path: string, lang: Lang) => landing(path, lang)!.h1;
