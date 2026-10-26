import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { bnNumerals, formatBDT } from "@/lib/bike-utils";
import { langHref } from "@/lib/site";

type Lang = "en" | "bn";
type Bi = { en: string; bn: string };

/** BRTA's own "how to get a driving licence" page (page says last updated 30 Jun 2026). */
const BRTA_URL = "https://brta.gov.bd/pages/static-pages/6922e0e7933eb65569e2919e";
const BSP_URL = "https://bsp.brta.gov.bd/";
const ACT_URL = "https://bdlaws.minlaw.gov.bd/act-print-1262.html";
const AS_OF: Bi = { en: "14 Oct 2026", bn: "১৪ অক্টোবর ২০২৬" };

// Fees as BRTA lists them, paid online only (no bank counter).
const FEES: { what: Bi; bdt: number }[] = [
  { what: { en: "Learner licence, one category (motorcycle only)", bn: "শিক্ষানবিশ লাইসেন্স, এক ক্যাটাগরি (শুধু মোটরসাইকেল)" }, bdt: 518 },
  { what: { en: "Learner licence, two categories (for example motorcycle and car)", bn: "শিক্ষানবিশ লাইসেন্স, দুই ক্যাটাগরি (যেমন মোটরসাইকেল ও কার)" }, bdt: 748 },
  { what: { en: "Smart card, non-professional (valid 10 years)", bn: "স্মার্ট কার্ড, অপেশাদার (মেয়াদ ১০ বছর)" }, bdt: 4497 },
  { what: { en: "Smart card, professional (valid 5 years)", bn: "স্মার্ট কার্ড, পেশাদার (মেয়াদ ৫ বছর)" }, bdt: 2772 },
  { what: { en: "Postage for the card", bn: "কার্ড ডাকে পাঠানোর খরচ" }, bdt: 60 },
];
const [LEARNER_ONE, , SMART_NONPRO, , POSTAGE] = FEES.map((f) => f.bdt);

export function LicenceView({ lang }: { lang: Lang }) {
  const t = (b: Bi) => (lang === "bn" ? bnNumerals(b.bn) : b.en);
  const tx = (en: string, bn: string) => (lang === "bn" ? bnNumerals(bn) : en);
  const href = (h: string) => langHref(h, lang);
  const a = "text-brand underline underline-offset-2";
  const ext = (url: string, label: string) => (
    <a href={url} target="_blank" rel="noopener noreferrer" className={a}>
      {label}
    </a>
  );
  const total = formatBDT(LEARNER_ONE + SMART_NONPRO + POSTAGE, lang);

  const steps: Bi[] = [
    {
      en: "Make an account on the BRTA Service Portal (BSP) with your NID. Fill in your division, district and thana: the thana decides which BRTA circle office handles your licence.",
      bn: "এনআইডি দিয়ে বিআরটিএ সার্ভিস পোর্টালে (BSP) অ্যাকাউন্ট খুলুন। বিভাগ, জেলা ও থানা পূরণ করুন: থানা অনুযায়ী ঠিক হয় কোন বিআরটিএ সার্কেল অফিস আপনার লাইসেন্স দেখবে।",
    },
    {
      en: "Apply for a learner licence online. Upload a photo (up to 150 KB), a medical certificate from a registered doctor, your NID, your class 8 (or higher) certificate, and a utility bill if you live somewhere other than your NID address (each up to 600 KB). Pay the learner fee online.",
      bn: "অনলাইনে শিক্ষানবিশ লাইসেন্সের আবেদন করুন। ছবি (সর্বোচ্চ ১৫০ কেবি), রেজিস্টার্ড ডাক্তারের মেডিকেল সার্টিফিকেট, এনআইডি, ৮ম শ্রেণি (বা বেশি) পাসের সনদ, আর এনআইডির ঠিকানা ছাড়া অন্য কোথাও থাকলে ইউটিলিটি বিল (প্রতিটি সর্বোচ্চ ৬০০ কেবি) আপলোড করুন। শিক্ষানবিশ ফি অনলাইনে দিন।",
    },
    {
      en: "Practise. The Act lets you ride on a learner licence where it applies (s.4); a learner licence carries no points (s.11).",
      bn: "অনুশীলন করুন। আইনে প্রযোজ্য ক্ষেত্রে শিক্ষানবিশ লাইসেন্সে চালানোর সুযোগ আছে (ধারা ৪); শিক্ষানবিশ লাইসেন্সে পয়েন্ট থাকে না (ধারা ১১)।",
    },
    {
      en: "On your test date, go in person with the learner licence and documents. BRTA takes your biometrics and checks your fingerprint against the NID server before you can sit the driving skills test.",
      bn: "পরীক্ষার দিন শিক্ষানবিশ লাইসেন্স ও কাগজপত্র নিয়ে নিজে উপস্থিত হন। বিআরটিএ বায়োমেট্রিক তথ্য নেয় এবং এনআইডি সার্ভার থেকে আঙুলের ছাপ মিলিয়ে তবেই দক্ষতা যাচাই পরীক্ষায় বসতে দেয়।",
    },
    {
      en: "The result comes within one working day, online and by SMS.",
      bn: "ফল এক কর্মদিবসের মধ্যে অনলাইনে ও এসএমএসে জানানো হয়।",
    },
    {
      en: "If you passed, upload a scan of the learner licence with the pass seal (and any attachment that was wrong the first time) and pay the smart card fee plus postage online, by mobile or online banking. BRTA does not take this fee at a bank counter.",
      bn: "পাস করলে পাস সিলসহ শিক্ষানবিশ লাইসেন্সের স্ক্যান (আর আগে কোনো কাগজ ভুল দিলে সেটাও) আপলোড করুন এবং স্মার্ট কার্ডের ফি ও ডাক খরচ অনলাইনে, মোবাইল বা অনলাইন ব্যাংকিংয়ে দিন। ব্যাংকের কাউন্টারে এই ফি নেওয়া হয় না।",
    },
    {
      en: "Once approved, print the temporary authorisation slip from your BSP account, laminate it and carry it while riding until the smart card arrives by post.",
      bn: "অনুমোদনের পর BSP অ্যাকাউন্ট থেকে অস্থায়ী অনুমতিপত্র (স্লিপ) প্রিন্ট করে লেমিনেট করুন, স্মার্ট কার্ড ডাকে না আসা পর্যন্ত চালানোর সময় সঙ্গে রাখুন।",
    },
  ];

  return (
    <div className="container-x max-w-3xl pt-10">
      <nav aria-label={tx("Breadcrumb", "ব্রেডক্রাম্ব")} className="eyebrow">
        <Link href={href("/guide/")} className="hover:text-brand">
          {tx("Buyer's guide", "ক্রেতা গাইড")}
        </Link>{" "}
        / {tx("Driving licence", "ড্রাইভিং লাইসেন্স")}
      </nav>
      <h1 className="mt-2 text-[30px] font-semibold leading-tight tracking-[-0.03em] text-ink sm:text-[40px]">
        {tx("How to get a motorcycle driving licence in Bangladesh", "মোটরসাইকেলের ড্রাইভিং লাইসেন্স করার নিয়ম")}
      </h1>
      <p className="mt-3 text-[16px] leading-relaxed text-muted">
        {tx(
          "Learner licence, driving test, then the smart card: the steps and fees as BRTA publishes them, with the Road Transport Act 2018 sections behind them. Checked against BRTA's page on ",
          "শিক্ষানবিশ লাইসেন্স, ড্রাইভিং পরীক্ষা, তারপর স্মার্ট কার্ড: বিআরটিএ যেভাবে প্রকাশ করেছে সেই ধাপ ও ফি, সঙ্গে সড়ক পরিবহন আইন, ২০১৮-এর ধারা। বিআরটিএ-র পাতার সঙ্গে মেলানো হয়েছে ",
        )}
        {t(AS_OF)}
        {tx(".", " তারিখে।")}
      </p>

      <section id="who" className="mt-10 scroll-mt-24">
        <h2 className="text-[22px] font-semibold tracking-tight text-ink">{tx("Who can get a licence?", "কারা লাইসেন্স পেতে পারেন?")}</h2>
        <p className="mt-3 text-[15.5px] leading-relaxed text-ink-2">
          {tx(
            "You must be at least 18 for a non-professional licence (21 for a professional one), have passed class 8 or equivalent, be physically and mentally fit, and pass the driving competence test (Act s.6). The licence is personal and cannot be transferred. BRTA says police verification is not currently needed.",
            "অপেশাদার লাইসেন্সের জন্য বয়স কমপক্ষে ১৮ (পেশাদারের জন্য ২১), ৮ম শ্রেণি বা সমমান পাস, শারীরিক ও মানসিকভাবে সুস্থ, এবং ড্রাইভিং দক্ষতা পরীক্ষায় উত্তীর্ণ হতে হবে (আইন ধারা ৬)। লাইসেন্স ব্যক্তিগত, হস্তান্তর করা যায় না। বিআরটিএ জানাচ্ছে, এখন পুলিশ ভেরিফিকেশন লাগে না।",
          )}
        </p>
      </section>

      <section id="steps" className="mt-10 scroll-mt-24">
        <h2 className="text-[22px] font-semibold tracking-tight text-ink">{tx("Step by step", "ধাপে ধাপে")}</h2>
        <ol className="mt-3 list-decimal space-y-2 pl-5 text-[15.5px] leading-relaxed text-ink-2">
          {steps.map((s) => (
            <li key={s.en}>{t(s)}</li>
          ))}
        </ol>
        <p className="mt-3 text-[14px] leading-relaxed text-muted">
          {tx("Apply at ", "আবেদন: ")}
          {ext(BSP_URL, "bsp.brta.gov.bd")}
          {tx(". Professional licence applicants must also upload a dope test report.", "। পেশাদার লাইসেন্সের আবেদনকারীদের ডোপ টেস্ট রিপোর্টও আপলোড করতে হয়।")}
        </p>
      </section>

      <section id="fees" className="mt-10 scroll-mt-24">
        <h2 className="text-[22px] font-semibold tracking-tight text-ink">{tx("How much does a motorcycle licence cost?", "মোটরসাইকেলের লাইসেন্স করতে খরচ কত?")}</h2>
        <ul className="mt-4 divide-y divide-line rounded-2xl border border-line bg-surface">
          {FEES.map((f) => (
            <li key={f.what.en} className="flex items-baseline justify-between gap-4 px-4 py-3.5">
              <span className="text-[15px] text-ink">{t(f.what)}</span>
              <span className="shrink-0 text-[16px] font-semibold text-ink">{formatBDT(f.bdt, lang)}</span>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-[15.5px] leading-relaxed text-ink-2">
          {tx(
            `For a motorcycle-only, non-professional licence that adds up to ${total} in BRTA fees (learner, smart card and postage), if you pass the test first time. Payment gateway charges, the medical certificate and any driving school are extra.`,
            `শুধু মোটরসাইকেলের অপেশাদার লাইসেন্সে বিআরটিএ ফি মিলিয়ে (শিক্ষানবিশ, স্মার্ট কার্ড ও ডাক খরচ) মোট ${total}, যদি প্রথমবারেই পাস করেন। পেমেন্ট গেটওয়ের চার্জ, মেডিকেল সার্টিফিকেট আর ড্রাইভিং স্কুলের খরচ আলাদা।`,
          )}
        </p>
      </section>

      <section id="no-licence" className="mt-10 scroll-mt-24">
        <h2 className="text-[22px] font-semibold tracking-tight text-ink">{tx("What if you ride without a licence?", "লাইসেন্স ছাড়া চালালে কী হয়?")}</h2>
        <p className="mt-3 text-[15.5px] leading-relaxed text-ink-2">
          {tx(
            "Up to ৳25,000, up to 6 months in jail, or both (Act s.66). Riding on an expired licence counts the same (s.4). Every full licence starts with 12 points, and most riding offences cut one (s.11): see ",
            "সর্বোচ্চ ৳২৫,০০০ জরিমানা, সর্বোচ্চ ৬ মাস জেল বা দুটোই (আইন ধারা ৬৬)। মেয়াদোত্তীর্ণ লাইসেন্সে চালানোও একই (ধারা ৪)। প্রতিটি পূর্ণ লাইসেন্সে ১২ পয়েন্ট থাকে, বেশিরভাগ চালানো-সংক্রান্ত অপরাধে ১ পয়েন্ট কাটা যায় (ধারা ১১): দেখুন ",
          )}
          <Link href={href("/guide/motorcycle-fines/")} className={a}>
            {tx("motorcycle fines and points", "মোটরসাইকেলের জরিমানা ও পয়েন্ট")}
          </Link>
          {tx(".", "।")}
        </p>
      </section>

      <section className="mt-10 rounded-2xl bg-surface-2 p-5 text-[14px] leading-relaxed text-ink-2">
        <p>
          {tx("Sources: ", "সূত্র: ")}
          {ext(BRTA_URL, tx("BRTA: how to get a driving licence", "বিআরটিএ: ড্রাইভিং লাইসেন্স পাওয়ার প্রক্রিয়া"))} <ArrowUpRight size={12} className="inline" />
          {" · "}
          {ext(ACT_URL, tx("Road Transport Act 2018 (official text)", "সড়ক পরিবহন আইন, ২০১৮ (সরকারি পাঠ)"))}
          {tx(`, checked ${AS_OF.en}. Fees change; BRTA's page is the final word.`, `, ${AS_OF.bn} তারিখে মেলানো। ফি বদলাতে পারে; বিআরটিএ-র পাতাই চূড়ান্ত।`)}
        </p>
        <p className="mt-2">
          {tx("This is a plain-language summary, not legal advice. See the ", "এটি সহজ ভাষায় সারাংশ, আইনি পরামর্শ নয়। দেখুন ")}
          <Link href={href("/disclaimer/")} className={a}>
            {tx("disclaimer", "দায়মুক্তি")}
          </Link>
          {tx(".", "।")}
        </p>
        <p className="mt-2">
          {tx("More: ", "আরও: ")}
          <Link href={href("/guide/motorcycle-fines/")} className={a}>
            {tx("all motorcycle fines", "মোটরসাইকেলের সব জরিমানা")}
          </Link>
          {" · "}
          <Link href={href("/guide/#registration")} className={a}>
            {tx("registration and tax token cost", "রেজিস্ট্রেশন ও ট্যাক্স টোকেন খরচ")}
          </Link>
          {" · "}
          <Link href={href("/guide/speed-limits/")} className={a}>
            {tx("speed limits", "গতিসীমা")}
          </Link>
          {" · "}
          <Link href={href("/guide/e-fines/")} className={a}>
            {tx("camera e-fines", "ক্যামেরা ই-জরিমানা")}
          </Link>
          {" · "}
          <Link href={href("/cost/")} className={a}>
            {tx("true cost of a bike", "বাইকের আসল খরচ")}
          </Link>
        </p>
      </section>
    </div>
  );
}
