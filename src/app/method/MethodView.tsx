"use client";

import Link from "@/components/LangLink";
import { SCORE_LABELS } from "@/lib/bike-utils";
import { EV_BATTERY, FUEL } from "@/lib/cost";
import { DEFAULT_FEE_PCT, PAY_TERMS } from "@/lib/fund";
// BAND_LOW comes from the server page: importing lib/match here would ship the bike index to this page.
import { useLang, useTx } from "@/lib/i18n";
import { SITE } from "@/lib/site";
import type { ScoreKey } from "@/lib/types";

type Row = { what: [string, string]; how: [string, string]; kind: "sourced" | "estimate" | "derived"; refresh: [string, string] };

const rows = (bandLow: number): Row[] => [
  {
    what: ["Ex-showroom price", "শোরুম মূল্য"],
    how: [
      "Copied from the distributor's own site where it publishes prices, otherwise from BikeBD and other price listings, with the link on each bike page. A second source is checked; differences over 10% are noted on the page.",
      "ডিস্ট্রিবিউটরের নিজের সাইটে দাম থাকলে সেখান থেকে, নইলে BikeBD ও অন্যান্য দামের তালিকা থেকে; প্রতিটি বাইকের পাতায় লিংক আছে। দ্বিতীয় একটি উৎস মিলিয়ে দেখা হয়; ১০%-এর বেশি পার্থক্য হলে পাতায় লেখা থাকে।",
    ],
    kind: "sourced",
    refresh: ["Monthly; the month is shown as \"Price checked\". A build check fails when a price is older than its limit.", "প্রতি মাসে; \"দাম যাচাই\" হিসেবে মাস দেখানো হয়। দাম নির্দিষ্ট সময়ের বেশি পুরনো হলে বিল্ড চেক ব্যর্থ হয়।"],
  },
  {
    what: ["On-road cost", "অন-রোড খরচ"],
    how: [
      "Ex-showroom price plus the BRTA registration package for the engine size (fees, 2-year tax token, number plate and VAT), taken from the BRTA fee schedule and the Road Transport Rules 2022 in our Buyer's guide. The 2-year token is the least you can ride away with; the cost calculator also shows the 10-year option. Dealer handling charges are not included, so ask the showroom. Time-limited showroom offers are shown separately, with their end date and source.",
      "শোরুম মূল্য + ইঞ্জিনের সিসি অনুযায়ী BRTA রেজিস্ট্রেশন প্যাকেজ (ফি, ২ বছরের ট্যাক্স টোকেন, নম্বর প্লেট ও ভ্যাট), ক্রেতা গাইডে দেওয়া BRTA ফি তালিকা ও সড়ক পরিবহন বিধিমালা ২০২২ থেকে। ২ বছরের টোকেনেই সবচেয়ে কম টাকায় বাইক নিয়ে বের হওয়া যায়; খরচের হিসাবে ১০ বছরের বিকল্পও আছে। ডিলারের হ্যান্ডলিং চার্জ ধরা হয়নি, তাই শোরুমে জিজ্ঞেস করুন। সময়সীমিত শোরুম অফার আলাদা দেখানো হয়, শেষ তারিখ ও সূত্রসহ।",
    ],
    kind: "derived",
    refresh: ["When BRTA changes fees; the as-of date is in the guide.", "BRTA ফি বদলালে; তারিখ গাইডে দেওয়া আছে।"],
  },
  {
    what: ["Real-world mileage", "আসল মাইলেজ"],
    how: [
      "A km/l range for mixed Bangladeshi traffic, set by the editor from owner reviews on Bangladeshi bike sites, owner groups and test reports, not the brand's claim. No fuel-log measurements yet.",
      "বাংলাদেশের মিশ্র ট্রাফিকে কিমি/লি পরিসর, দেশি বাইক সাইটের মালিক রিভিউ, মালিকদের গ্রুপ ও টেস্ট রিপোর্ট দেখে সম্পাদক ঠিক করেন; কোম্পানির দাবি নয়। এখনো জ্বালানির লগ থেকে মাপা হয়নি।",
    ],
    kind: "estimate",
    refresh: ["When owner reports disagree with the range.", "মালিকদের রিপোর্ট পরিসরের সাথে না মিললে।"],
  },
  {
    what: ["The 11 ownership scores", "১১টি মালিকানা স্কোর"],
    how: [
      "Each is a 1–10 judgement by the editor, comparing the bike with others in Bangladesh using owner reviews, Bangladeshi bike sites and rider communities. No mechanic panel has rated them yet. On bike pages they are shown as bands: Strong (8–10), OK (5–7), Weak (1–4), because a one-point difference is not meaningful.",
      "প্রতিটি ১–১০ স্কোর সম্পাদকের মূল্যায়ন, মালিকদের রিভিউ, দেশি বাইক সাইট, রাইডার কমিউনিটি দেখে বাংলাদেশের অন্য বাইকের সাথে তুলনা করে। এখনো কোনো মেকানিক প্যানেল এগুলো রেট করেনি। বাইকের পাতায় এগুলো ব্যান্ডে দেখানো হয়: ভালো (৮–১০), মাঝারি (৫–৭), দুর্বল (১–৪), কারণ এক নম্বরের পার্থক্য অর্থবহ নয়।",
    ],
    kind: "estimate",
    refresh: ["When reports or a mechanic panel give reason to change them. A named mechanic panel is planned.", "রিপোর্ট বা মেকানিক প্যানেল থেকে কারণ পেলে। নামসহ মেকানিক প্যানেলের পরিকল্পনা আছে।"],
  },
  {
    what: ["Parts and service prices", "পার্টস ও সার্ভিসের দাম"],
    how: [
      "Typical prices for common parts in Bangshal and district bazaars, from parts shops' online listings and Bangladeshi bike sites, rounded. Genuine and copy parts can differ by 2–3x.",
      "বংশাল ও জেলার বাজারে সাধারণ পার্টসের দাম, পার্টসের দোকানের অনলাইন তালিকা ও দেশি বাইক সাইট থেকে, রাউন্ড করা। আসল আর কপি পার্টসে দাম ২–৩ গুণ পর্যন্ত আলাদা হতে পারে।",
    ],
    kind: "estimate",
    refresh: ["Every few months, or when a report says a price is off.", "কয়েক মাস পরপর, বা কেউ ভুল জানালে।"],
  },
  {
    what: ["Used prices", "পুরনো বাইকের দাম"],
    how: [
      "Typical asking prices for clean ~1- and ~3-year-old bikes with papers on bikroy.com, read by hand. Deals usually close 5–10% lower. Where we have no listings, a resale curve based on the resale score fills in, and the page says so.",
      "bikroy.com-এ কাগজসহ ভালো অবস্থার ~১ ও ~৩ বছরের পুরনো বাইকের সাধারণ চাওয়া দাম, হাতে দেখে নেওয়া। আসল দাম সাধারণত ৫–১০% কমে ঠিক হয়। তালিকা না পেলে রিসেল স্কোর থেকে একটি হিসাব ব্যবহার হয়, আর পাতায় তা লেখা থাকে।",
    ],
    kind: "estimate",
    refresh: ["Monthly with prices, where listings exist.", "দামের সাথে প্রতি মাসে, যেখানে তালিকা আছে।"],
  },
  {
    what: ["Monthly running cost", "মাসিক চলার খরচ"],
    how: [
      `Calculated from your km per month, the mileage range, the government fuel price, service interval and cost, tyre and chain wear, road tax and third-party insurance. An electric bike also pays for one new traction battery, at ${EV_BATTERY.shareOfPrice * 100}% of its new price, once the years you own it run past the battery warranty (${EV_BATTERY.defaultWarrantyMonths} months assumed when the maker gives none; an estimate). The formula is the same everywhere on the site.`,
      `আপনার মাসিক কিমি, মাইলেজ পরিসর, সরকারি জ্বালানির দাম, সার্ভিসের সময় ও খরচ, টায়ার ও চেইনের ক্ষয়, রোড ট্যাক্স ও থার্ড-পার্টি বিমা থেকে হিসাব। ইলেকট্রিক বাইকে মালিকানার সময় ব্যাটারি ওয়ারেন্টি পার হলে একটি নতুন ব্যাটারির খরচ ধরা হয়, নতুন দামের ${EV_BATTERY.shareOfPrice * 100}% (কোম্পানি ওয়ারেন্টি না বললে ${EV_BATTERY.defaultWarrantyMonths} মাস ধরা হয়; আনুমানিক)। পুরো সাইটে একই সূত্র।`,
    ],
    kind: "derived",
    refresh: ["Fuel price checked monthly against the government revision.", "জ্বালানির দাম প্রতি মাসে সরকারি সংশোধনের সাথে মেলানো হয়।"],
  },
  {
    what: ["EMI and upfront cash", "কিস্তি ও শুরুর নগদ"],
    how: [
      `One calculator for the whole site. 0% card EMI splits the ex-showroom price over up to ${PAY_TERMS.cardMonths} months; longer plans are a loan at an assumed ${PAY_TERMS.loanPct}% a year on a reducing balance. BRTA registration and an assumed ${DEFAULT_FEE_PCT}% processing fee are paid in cash before you ride home. The "/month" next to a price is the ${PAY_TERMS.cardMonths}-month card EMI. A used bike is bought in cash: a private sale has no card EMI or bike loan.`,
      `পুরো সাইটে একই হিসাব। ০% কার্ড কিস্তিতে শোরুম মূল্য সর্বোচ্চ ${PAY_TERMS.cardMonths} মাসে ভাগ হয়; এর বেশি মেয়াদ মানে লোন, আমরা বছরে ${PAY_TERMS.loanPct}% ক্রমহ্রাসমান ব্যালান্সে সুদ ধরি। BRTA রেজিস্ট্রেশন আর আনুমানিক ${DEFAULT_FEE_PCT}% প্রসেসিং ফি বাইক বাড়ি নেওয়ার আগে নগদে দিতে হয়। দামের পাশে "/মাস" মানে ${PAY_TERMS.cardMonths} মাসের কার্ড কিস্তি। পুরনো বাইক নগদে কিনতে হয়: ব্যক্তিগত বিক্রিতে কার্ড কিস্তি বা বাইক লোন নেই।`,
    ],
    kind: "derived",
    refresh: ["When banks change typical card EMI terms, loan rates or fees.", "ব্যাংকের সাধারণ কার্ড কিস্তির শর্ত, লোনের সুদ বা ফি বদলালে।"],
  },
  {
    what: ["Match ranking", "ম্যাচ র‍্যাঙ্কিং"],
    how: [
      `Filters by your on-road budget, the kinds of bike you pick (motorcycle, scooter, electric) and new/used. In EMI mode a bike is shown only when your cash now covers BRTA, the fee and any down payment, and the instalment fits your monthly figure; used bikes are left out. It then weights the ownership scores by how and where you ride. If you pick "Looks & style" and name a look (sporty, naked, cruiser and so on), bikes of that shape rank first. It lowers bikes that cost under ${bandLow * 100}% of your budget (unless you pick "Lowest price"), seats too tall for you and bikes too strong for a first bike. Bikes whose availability is unconfirmed go after the confirmed bikes with the same match label. In the top three, a second bike of the same model line gives way to the next close one, and when all three are one style, a close match of another style takes third place, never with a weaker label or a parts or network warning. Bikes above budget appear only in the labelled stretch section. Because it uses the editorial scores, the ranking is only as good as those estimates.`,
      `আপনার অন-রোড বাজেট, বেছে নেওয়া বাইকের ধরন (মোটরসাইকেল, স্কুটার, ইলেকট্রিক) ও নতুন/পুরনো দিয়ে ছাঁকে। কিস্তি মোডে বাইক তখনই দেখায় যখন হাতের নগদে BRTA, ফি ও দরকারি ডাউন পেমেন্ট হয়, আর কিস্তি আপনার মাসিক অঙ্কের মধ্যে থাকে; পুরনো বাইক বাদ। তারপর কীভাবে ও কোথায় চালাবেন সে অনুযায়ী মালিকানা স্কোরের গুরুত্ব ঠিক করে। "লুক ও স্টাইল" বেছে কোনো লুক (স্পোর্টি, নেকেড, ক্রুজার ইত্যাদি) বললে সেই গড়নের বাইক আগে আসে। বাজেটের ${bandLow * 100}%-এর কম দামের বাইকে (আপনি “সবচেয়ে কম দাম” না বাছলে), উঁচু সিটে আর নতুনদের জন্য বেশি শক্তিশালী বাইকে নম্বর কমায়। যে বাইক পাওয়া যাবে কিনা অনিশ্চিত, সেটি একই লেবেলের নিশ্চিত বাইকগুলোর পরে আসে। সেরা তিনটিতে একই মডেল লাইনের দ্বিতীয় বাইক কাছাকাছি নম্বরের পরের বাইককে জায়গা ছেড়ে দেয়, আর তিনটিই একই ধরনের হলে কাছাকাছি নম্বরের অন্য ধরনের একটি বাইক তৃতীয় জায়গা পায়, তবে কখনো দুর্বল লেবেল বা পার্টস/নেটওয়ার্কের সতর্কতা নিয়ে নয়। বাজেটের বেশি বাইক শুধু আলাদা “একটু বেশি” অংশে দেখায়। স্কোর সম্পাদকের মূল্যায়ন, তাই র‍্যাঙ্কিংও ততটাই নির্ভুল।`,
    ],
    kind: "derived",
    refresh: ["Changes when scores or prices change.", "স্কোর বা দাম বদলালে বদলায়।"],
  },
];

const KIND: Record<Row["kind"], [string, string, string]> = {
  sourced: ["Sourced", "উৎসসহ", "bg-good-soft text-good"],
  derived: ["Calculated", "হিসাব করা", "bg-brand/15 text-brand"],
  estimate: ["Editorial estimate", "সম্পাদকীয় অনুমান", "bg-warn-soft text-warn"],
};

/** 2025 brand shares: The Daily Star (calendar 2025, 16 Jan 2026) vs TBS (latest fiscal year, 4 Jul 2026); both re-read 2026-10-15. */
const MARKET: [string, string, string][] = [
  ["Suzuki", "20.1%", "19.08%"],
  ["Yamaha", "19.7%", "20.8%"],
  ["Hero", "18.1%", "17.8%"],
  ["Honda", "17.8%", "~20%"],
  ["Bajaj", "17.6%", "15.7%"],
];

export function MethodView({ bandLow }: { bandLow: number }) {
  const { lang } = useLang();
  const tx = useTx();
  const p = (pair: [string, string]) => (lang === "bn" ? pair[1] : pair[0]);
  return (
    <div className="container-x max-w-3xl pt-12">
      <p className="eyebrow">{tx("Method", "পদ্ধতি")}</p>
      <h1 className="mt-2 text-[32px] font-semibold leading-tight tracking-[-0.03em] text-ink sm:text-[44px]">{tx("How every number is made", "প্রতিটি সংখ্যা কীভাবে তৈরি")}</h1>
      <p className="mt-4 text-[16px] leading-relaxed text-ink-2">
        {tx(
          "Plainly: prices and specs are copied from sources we link. Mileage, the 11 scores, parts prices and used prices are one editor's estimates, not measurements. Use them to shortlist, then check with a showroom, a mechanic and an owner.",
          "সোজা কথায়: দাম ও স্পেক লিংক করা উৎস থেকে নেওয়া। মাইলেজ, ১১টি স্কোর, পার্টস ও পুরনো বাইকের দাম একজন সম্পাদকের অনুমান, মাপা নয়। এগুলো দিয়ে তালিকা ছোট করুন, তারপর শোরুম, মেকানিক ও মালিকের সাথে মিলিয়ে নিন।",
        )}
      </p>

      <div className="mt-8 space-y-4">
        {rows(bandLow).map((r) => (
          <section key={r.what[0]} className="rounded-2xl border border-line bg-surface p-5">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-[18px] font-semibold text-ink">{p(r.what)}</h2>
              <span className={`rounded-full px-2 py-0.5 text-[11.5px] font-semibold ${KIND[r.kind][2]}`}>{lang === "bn" ? KIND[r.kind][1] : KIND[r.kind][0]}</span>
            </div>
            <p className="mt-2 text-[15px] leading-relaxed text-ink-2">{p(r.how)}</p>
            <p className="mt-2 text-[13px] text-muted">
              <strong className="font-medium text-ink-2">{tx("Updated:", "হালনাগাদ:")}</strong> {p(r.refresh)}
            </p>
          </section>
        ))}
      </div>

      <h2 className="mt-10 text-[22px] font-semibold text-ink">{tx("What each score means", "প্রতিটি স্কোরের অর্থ")}</h2>
      <dl className="mt-4 overflow-hidden rounded-2xl border border-line bg-surface">
        {(Object.keys(SCORE_LABELS) as ScoreKey[]).map((k, i) => (
          <div key={k} className={`grid grid-cols-[minmax(130px,40%)_1fr] gap-4 px-4 py-3 text-[14.5px] ${i % 2 ? "bg-surface-2/40" : ""}`}>
            <dt className="font-medium text-ink">{lang === "bn" ? SCORE_LABELS[k].bn : SCORE_LABELS[k].en}</dt>
            <dd className="text-muted">{lang === "bn" ? SCORE_LABELS[k].hintBn : SCORE_LABELS[k].hint}</dd>
          </div>
        ))}
      </dl>

      <h2 className="mt-10 text-[22px] font-semibold text-ink">{tx("The market in 2025, as reported", "২০২৫ সালের বাজার, প্রকাশিত হিসাবে")}</h2>
      <p className="mt-3 text-[15px] leading-relaxed text-ink-2">
        {tx(
          "Two newspapers report brand shares, for different periods, and they disagree, so we show both. The Daily Star counts calendar 2025: 466,858 bikes sold, up 19%. TBS counts the latest fiscal year: 424,304, up more than 8%.",
          "দুটি পত্রিকা ব্র্যান্ডের ভাগ জানিয়েছে, ভিন্ন সময়ের হিসাবে, আর তাদের সংখ্যা মেলে না, তাই দুটোই দেখাচ্ছি। ডেইলি স্টার ২০২৫ পঞ্জিকা বছর ধরে: ৪,৬৬,৮৫৮টি বাইক বিক্রি, ১৯% বেশি। টিবিএস সর্বশেষ অর্থবছর ধরে: ৪,২৪,৩০৪টি, ৮%-এর বেশি বৃদ্ধি।",
        )}
      </p>
      <div className="mt-4 overflow-x-auto rounded-2xl border border-line bg-surface">
        <table className="w-full text-left text-[14.5px]">
          <thead className="text-muted">
            <tr>
              <th scope="col" className="px-4 py-2 font-medium">{tx("Brand", "ব্র্যান্ড")}</th>
              <th scope="col" className="px-4 py-2 font-medium">The Daily Star</th>
              <th scope="col" className="px-4 py-2 font-medium">TBS</th>
            </tr>
          </thead>
          <tbody>
            {MARKET.map(([brand, ds, tbs], i) => (
              <tr key={brand} className={i % 2 ? "" : "bg-surface-2/40"}>
                <th scope="row" className="px-4 py-2 font-medium text-ink">{brand}</th>
                <td className="px-4 py-2 tabular-nums">{ds}</td>
                <td className="px-4 py-2 tabular-nums">{tbs}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <ul className="mt-4 list-disc space-y-2 pl-5 text-[15px] leading-relaxed text-ink-2">
        <li>{tx("TVS sales fell 80% in 2025, to just over 10,000 bikes (The Daily Star).", "২০২৫ সালে TVS-এর বিক্রি ৮০% কমে ১০,০০০-এর সামান্য বেশিতে নেমেছে (ডেইলি স্টার)।")}</li>
        <li>{tx("Suzuki, Yamaha and Honda together sold 58% of all bikes, and the five largest brands more than 93% (The Daily Star).", "Suzuki, Yamaha আর Honda মিলে মোট বিক্রির ৫৮%, আর বড় পাঁচটি ব্র্যান্ড মিলে ৯৩%-এর বেশি (ডেইলি স্টার)।")}</li>
        <li>{tx("We found no published sales figures per model in Bangladesh. Our scores and \"popular\" picks are not based on sales counts.", "বাংলাদেশে মডেলভিত্তিক বিক্রির কোনো প্রকাশিত হিসাব আমরা পাইনি। আমাদের স্কোর আর \"জনপ্রিয়\" বাছাই বিক্রির সংখ্যার ওপর ভিত্তি করে নয়।")}</li>
      </ul>
      <p className="mt-3 text-[13px] text-muted">
        {tx("Sources (checked 15 Oct 2026):", "উৎস (১৫ অক্টোবর ২০২৬ যাচাই):")}{" "}
        <a href="https://www.thedailystar.net/news/japanese-brands-take-the-lead-motorcycle-market-recovers-4082151" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">The Daily Star, 16 Jan 2026</a>
        {" · "}
        <a href="https://www.tbsnews.net/node/1479086" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">TBS, 4 Jul 2026</a>
      </p>

      <div className="mt-10 space-y-5 text-[16px] leading-relaxed text-ink-2">
        <h2 className="text-[22px] font-semibold text-ink">{tx("Sources", "উৎস")}</h2>
        <p>
          {tx(
            "Distributor websites, BikeBD and other Bangladeshi price and spec sites, bikroy.com for used prices, BRTA and the Road Transport Rules for fees, and the government fuel price (now ৳",
            "ডিস্ট্রিবিউটরের ওয়েবসাইট, BikeBD ও অন্যান্য দেশি দাম ও স্পেকের সাইট, পুরনো দামের জন্য bikroy.com, ফির জন্য BRTA ও সড়ক পরিবহন বিধিমালা, আর সরকারি জ্বালানির দাম (এখন অকটেন ৳",
          )}
          {FUEL.octane}
          {tx(`/litre octane, as of ${FUEL.asOf}). Every bike page links its own sources; the full list is in SOURCES.md in the public code repository.`, `/লিটার, ${FUEL.asOf} অনুযায়ী)। প্রতিটি বাইকের পাতায় নিজস্ব উৎসের লিংক আছে; পূর্ণ তালিকা পাবলিক কোড রিপোজিটরির SOURCES.md-এ।`)}{" "}
          <a href="https://github.com/the-abraar/Suggest.Bike/blob/main/SOURCES.md" target="_blank" rel="noopener noreferrer" className="text-brand underline underline-offset-2">SOURCES.md</a>
        </p>

        <h2 className="text-[22px] font-semibold text-ink">{tx("How to correct us", "কীভাবে ভুল ধরিয়ে দেবেন")}</h2>
        <p>
          {tx(
            "Every bike page has an \"I own this\" form: your on-road price, showroom or district, month and real mileage. The feedback form takes anything else. Neither needs an account, and email is optional. Reports are read by the editor; a price or mileage changes when a report comes with a receipt, a link or a second owner saying the same. Changes show up in the next monthly update with a new \"checked\" month.",
            "প্রতিটি বাইকের পাতায় \"আমার এই বাইক আছে\" ফর্ম আছে: আপনার অন-রোড দাম, শোরুম বা জেলা, মাস ও আসল মাইলেজ। অন্য সব কিছুর জন্য মতামত ফর্ম। কোনোটিতেই অ্যাকাউন্ট লাগে না, ইমেইল ঐচ্ছিক। রিপোর্ট সম্পাদক পড়েন; রসিদ, লিংক বা আরেকজন মালিক একই কথা বললে দাম বা মাইলেজ বদলানো হয়। পরের মাসিক আপডেটে নতুন \"যাচাই\" মাসসহ পরিবর্তন দেখা যায়।",
          )}{" "}
          <Link href="/feedback/" className="text-brand underline underline-offset-2">{tx("Send feedback", "মতামত পাঠান")}</Link>
        </p>

        <h2 className="text-[22px] font-semibold text-ink">{tx("Who makes this", "কে বানায়")}</h2>
        <p>
          {tx(
            `Suggest.Bike is made and edited by ${SITE.editor}, an independent developer in Bangladesh. No manufacturer, distributor or dealer pays for placement or reviews the scores before they are published. If that ever changes, it will be disclosed on this page.`,
            `Suggest.Bike বানান ও সম্পাদনা করেন ${SITE.editor}, বাংলাদেশের একজন স্বাধীন ডেভেলপার। কোনো নির্মাতা, ডিস্ট্রিবিউটর বা ডিলার র‍্যাঙ্কিংয়ের জন্য টাকা দেয় না বা প্রকাশের আগে স্কোর দেখে না। কখনো তা বদলালে এই পাতায় জানানো হবে।`,
          )}{" "}
          {tx("Contact:", "যোগাযোগ:")}{" "}
          <a href={`mailto:${SITE.contactEmail}`} className="text-brand underline underline-offset-2">{SITE.contactEmail}</a>
        </p>
        <p className="text-[13.5px] text-muted">
          <Link href="/about/" className="underline underline-offset-2">{tx("About", "আমাদের কথা")}</Link>
          {" · "}
          <Link href="/disclaimer/" className="underline underline-offset-2">{tx("Disclaimer", "দায়মুক্তি")}</Link>
          {" · "}
          <Link href="/dealers/" className="underline underline-offset-2">{tx("Official distributors", "অফিশিয়াল ডিস্ট্রিবিউটর")}</Link>
        </p>
      </div>
    </div>
  );
}
