import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { langHref } from "@/lib/site";

type Lang = "en" | "bn";
type Bi = { en: string; bn: string };

/** BRTA "Motor Vehicle Speed Limit Guideline 2024" (notification of 7 May 2024), linked from brta.gov.bd → laws and rules. */
const GUIDELINE_URL = "https://objectstorage.ap-dcc-gazipur-1.oraclecloud15.com/n/axvjbnqprylg/b/V2Ministry/o/office-brta/2024/12/6b812c0217bf470cb1fc3beacd6da9ab.pdf";
const ACT_URL = "https://bdlaws.minlaw.gov.bd/act-print-1262.html";
const AS_OF: Bi = { en: "14 Oct 2026", bn: "14 অক্টোবর 2026" };

// Guideline section 2 table: maximum km/h for motorcycles, with cars for comparison.
const LIMITS: { road: Bi; bike: number; car: number }[] = [
  { road: { en: "Expressway (four or six lanes, divided, with service lanes)", bn: "এক্সপ্রেসওয়ে (সার্ভিস লেনসহ চার বা ছয় লেন, বিভক্ত)" }, bike: 60, car: 80 },
  { road: { en: "National highway, category A (four or six lanes, divided)", bn: "জাতীয় মহাসড়ক, ক্যাটাগরি-এ (চার বা ছয় লেন, বিভক্ত)" }, bike: 50, car: 80 },
  { road: { en: "National highway, category B, and regional highway (two lanes, undivided)", bn: "জাতীয় মহাসড়ক ক্যাটাগরি-বি ও আঞ্চলিক মহাসড়ক (দুই লেন, ডিভাইডার নেই)" }, bike: 50, car: 70 },
  { road: { en: "District road", bn: "জেলা সড়ক" }, bike: 50, car: 60 },
  { road: { en: "Highway where it runs through a city corporation, municipality or district town", bn: "সিটি কর্পোরেশন, পৌরসভা বা জেলা সদরের ভেতর দিয়ে যাওয়া মহাসড়ক" }, bike: 30, car: 40 },
  { road: { en: "Other roads inside a city corporation, municipality or district town", bn: "সিটি কর্পোরেশন, পৌরসভা বা জেলা সদরের অন্য সড়ক" }, bike: 30, car: 40 },
  { road: { en: "Upazila road", bn: "উপজেলা সড়ক" }, bike: 30, car: 40 },
  { road: { en: "Primary urban road (two lanes, undivided)", bn: "শহরের প্রাইমারি সড়ক (দুই লেন, অবিভক্ত)" }, bike: 30, car: 40 },
  { road: { en: "Narrow or shared urban road", bn: "শহরের সরু বা শেয়ার্ড সড়ক" }, bike: 20, car: 30 },
  { road: { en: "Rural road", bn: "গ্রামীণ সড়ক" }, bike: 30, car: 30 },
];

export function SpeedView({ lang }: { lang: Lang }) {
  const t = (b: Bi) => b[lang];
  const tx = (en: string, bn: string) => (lang === "bn" ? bn : en);
  const href = (h: string) => langHref(h, lang);
  const kmh = (n: number) => tx(`${n} km/h`, `${n} কিমি/ঘণ্টা`);
  const a = "text-brand underline underline-offset-2";
  const ext = (url: string, label: string) => (
    <a href={url} target="_blank" rel="noopener noreferrer" className={a}>
      {label}
    </a>
  );

  return (
    <div className="container-x max-w-3xl pt-10">
      <nav aria-label={tx("Breadcrumb", "ব্রেডক্রাম্ব")} className="eyebrow">
        <Link href={href("/guide/")} className="hover:text-brand">
          {tx("Buyer's guide", "ক্রেতা গাইড")}
        </Link>{" "}
        / {tx("Speed limits", "গতিসীমা")}
      </nav>
      <h1 className="mt-2 text-[30px] font-semibold leading-tight tracking-[-0.03em] text-ink sm:text-[40px]">
        {tx("Motorcycle speed limits in Bangladesh", "বাংলাদেশে মোটরসাইকেলের গতিসীমা")}
      </h1>
      <p className="mt-3 text-[16px] leading-relaxed text-muted">
        {tx(
          "BRTA set separate speed limits for each kind of vehicle and road in its Motor Vehicle Speed Limit Guideline 2024, issued on 7 May 2024 under section 44(1) of the Road Transport Act 2018 and in force straight away. Motorcycles get lower limits than cars on every road except rural roads. Checked against BRTA's published copy on ",
          "বিআরটিএ ‘মোটরযান গতিসীমা নির্দেশিকা, ২০২৪’-এ প্রতিটি যান ও সড়কের জন্য আলাদা গতিসীমা ঠিক করেছে। এটি সড়ক পরিবহন আইন, ২০১৮-এর ধারা 44(1) অনুযায়ী 7 মে 2024 জারি হয় এবং সঙ্গে সঙ্গে কার্যকর হয়। গ্রামীণ সড়ক ছাড়া সব সড়কে মোটরসাইকেলের সীমা গাড়ির চেয়ে কম। বিআরটিএ-র প্রকাশিত কপির সঙ্গে মেলানো হয়েছে ",
        )}
        {t(AS_OF)}
        {tx(".", " তারিখে।")}
      </p>

      <section id="table" className="mt-10 scroll-mt-24">
        <h2 className="text-[22px] font-semibold tracking-tight text-ink">{tx("Speed limit for motorcycles, by road", "সড়ক অনুযায়ী মোটরসাইকেলের গতিসীমা")}</h2>
        <ul className="mt-4 divide-y divide-line rounded-2xl border border-line bg-surface">
          {LIMITS.map((l) => (
            <li key={l.road.en} className="flex items-baseline justify-between gap-4 px-4 py-3.5">
              <span className="text-[15px] text-ink">{t(l.road)}</span>
              <span className="shrink-0 text-right">
                <span className="block text-[16px] font-semibold text-ink">{kmh(l.bike)}</span>
                <span className="block text-[12.5px] text-muted">{tx(`car ${l.car}`, `গাড়ি ${l.car}`)}</span>
              </span>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-[14px] leading-relaxed text-muted">
          {tx("Source: BRTA guideline, section 2. Signs posted on a road (at bends, bridges, level crossings, junctions, markets, schools, hospitals) apply where they are lower.", "সূত্র: বিআরটিএ নির্দেশিকা, অনুচ্ছেদ 2। সড়কে লাগানো সাইন (বাঁক, ব্রিজ, লেভেল ক্রসিং, সংযোগস্থল, বাজার, স্কুল, হাসপাতাল) কম হলে সেটাই প্রযোজ্য।")}
        </p>
      </section>

      <section id="dhaka" className="mt-10 scroll-mt-24">
        <h2 className="text-[22px] font-semibold tracking-tight text-ink">{tx("What is the bike speed limit in Dhaka?", "ঢাকায় বাইকের গতিসীমা কত?")}</h2>
        <p className="mt-3 text-[15.5px] leading-relaxed text-ink-2">
          {tx(
            "30 km/h. That covers every road inside a city corporation, municipality or district town, including national and regional highways where they pass through one. On narrow or shared urban roads it is 20 km/h. Cars get 40 km/h on the same roads.",
            "30 কিমি/ঘণ্টা। সিটি কর্পোরেশন, পৌরসভা বা জেলা সদরের ভেতরের সব সড়কে, ভেতর দিয়ে যাওয়া জাতীয় ও আঞ্চলিক মহাসড়কেও এই সীমা। সরু বা শেয়ার্ড শহুরে সড়কে 20 কিমি/ঘণ্টা। একই সড়কে গাড়ির সীমা 40।",
          )}
        </p>
      </section>

      <section id="highway" className="mt-10 scroll-mt-24">
        <h2 className="text-[22px] font-semibold tracking-tight text-ink">{tx("Is the highway limit for bikes 50 or 60 km/h?", "মহাসড়কে বাইকের সীমা 50 না 60 কিমি/ঘণ্টা?")}</h2>
        <p className="mt-3 text-[15.5px] leading-relaxed text-ink-2">
          {tx(
            "50 km/h on national highways, regional highways and district roads; 60 km/h only on expressways. You will find 60 km/h for highways in some reports: Dhaka Tribune wrote that figure on 8 May 2024, but it described the draft BRTA had sent to the ministry. The guideline BRTA issued says 50, and so did ",
            "জাতীয় মহাসড়ক, আঞ্চলিক মহাসড়ক ও জেলা সড়কে 50 কিমি/ঘণ্টা; 60 কিমি/ঘণ্টা শুধু এক্সপ্রেসওয়েতে। কিছু খবরে মহাসড়কে 60 লেখা দেখবেন: ঢাকা ট্রিবিউন 8 মে 2024 এই অঙ্ক দেয়, কিন্তু সেটি ছিল বিআরটিএ-র মন্ত্রণালয়ে পাঠানো খসড়া। জারি করা নির্দেশিকায় 50 আছে, একই কথা লিখেছে ",
          )}
          {ext("https://www.observerbd.com/news.php?id=471546", "Daily Observer (8 May 2024)")}
          {tx(" and ", " ও ")}
          {ext("https://www.tbsnews.net/node/847406", "The Business Standard (10 May 2024)")}
          {tx(". When the two disagree, go by the guideline and the signs on the road.", "। দুটো না মিললে নির্দেশিকা আর সড়কের সাইন মানুন।")}
        </p>
      </section>

      <section id="schools" className="mt-10 scroll-mt-24">
        <h2 className="text-[22px] font-semibold tracking-tight text-ink">{tx("Near schools, hospitals and markets, and in bad weather", "স্কুল, হাসপাতাল, বাজারের কাছে আর খারাপ আবহাওয়ায়")}</h2>
        <p className="mt-3 text-[15.5px] leading-relaxed text-ink-2">
          {tx(
            "Next to schools, religious buildings, hospitals, housing and haats, the local authority or road builder sets the limit, and it can never be above 40 km/h on a national highway or 30 km/h on a regional highway. The limits in the table are for normal conditions only: in storms, harsh sun, heavy rain or fog you must ride at a speed you can control, and stop if you cannot see ahead (guideline 3.2 and 3.4).",
            "স্কুল, ধর্মীয় প্রতিষ্ঠান, হাসপাতাল, আবাসিক এলাকা ও হাট-বাজারের পাশে সীমা ঠিক করে স্থানীয় কর্তৃপক্ষ বা সড়ক নির্মাণকারী প্রতিষ্ঠান, তবে জাতীয় মহাসড়কে তা কখনো 40 আর আঞ্চলিক মহাসড়কে 30 কিমি/ঘণ্টার বেশি হবে না। টেবিলের সীমা শুধু স্বাভাবিক অবস্থার জন্য: ঝড়, প্রখর রোদ, ভারী বৃষ্টি বা কুয়াশায় নিয়ন্ত্রণে রাখা যায় এমন গতিতে চালাতে হবে, আর সামনে দেখা না গেলে থামতে হবে (নির্দেশিকা 3.2 ও 3.4)।",
          )}
        </p>
      </section>

      <section id="fine" className="mt-10 scroll-mt-24">
        <h2 className="text-[22px] font-semibold tracking-tight text-ink">{tx("What is the fine for speeding?", "গতিসীমা ভাঙলে জরিমানা কত?")}</h2>
        <p className="mt-3 text-[15.5px] leading-relaxed text-ink-2">
          {tx(
            "Up to ৳10,000, up to 3 months in jail, or both, and 1 point off your licence (Road Transport Act 2018, s.44 and s.87). A crash that causes loss of life or property through speeding carries more (s.98). BRTA said in May 2024 that enforcement would be gradual: publicity first, mobile courts and police speed guns meanwhile (",
            "সর্বোচ্চ ৳10,000 জরিমানা, সর্বোচ্চ 3 মাস জেল বা দুটোই, আর লাইসেন্স থেকে 1 পয়েন্ট (সড়ক পরিবহন আইন ২০১৮, ধারা 44 ও 87)। অতিরিক্ত গতিতে দুর্ঘটনায় জীবন বা সম্পদের ক্ষতি হলে শাস্তি বেশি (ধারা 98)। বিআরটিএ মে 2024-এ জানায়, প্রয়োগ ধাপে ধাপে হবে: আগে প্রচার, এর মধ্যে মোবাইল কোর্ট ও পুলিশের স্পিড গান (",
          )}
          {ext("https://www.tbsnews.net/node/847406", "TBS, 10 May 2024")}
          {tx("). Since 18 Aug 2026 Highway Police cameras also catch speeding on the Dhaka-Chattogram highway: see ", ")। 18 আগস্ট 2026 থেকে ঢাকা-চট্টগ্রাম মহাসড়কে হাইওয়ে পুলিশের ক্যামেরাও গতিসীমা ভাঙা ধরে: দেখুন ")}
          <Link href={href("/guide/e-fines/")} className={a}>
            {tx("e-fines and fake SMS", "ই-জরিমানা ও ভুয়া এসএমএস")}
          </Link>
          {tx(".", "।")}
        </p>
      </section>

      <section id="padma" className="mt-10 scroll-mt-24">
        <h2 className="text-[22px] font-semibold tracking-tight text-ink">{tx("Speed limit on the Padma Bridge", "পদ্মা সেতুতে গতিসীমা")}</h2>
        <p className="mt-3 text-[15.5px] leading-relaxed text-ink-2">
          {tx(
            "Motorcycles were banned from the bridge in June 2022 and allowed back from 20 April 2023, in the service lane at up to 60 km/h (",
            "জুন 2022-এ সেতুতে মোটরসাইকেল নিষিদ্ধ হয়, 20 এপ্রিল 2023 থেকে আবার অনুমতি পায়, সার্ভিস লেনে সর্বোচ্চ 60 কিমি/ঘণ্টায় (",
          )}
          {ext("https://en.prothomalo.com/bangladesh/rbjde07nzk", "Prothom Alo, 18 Apr 2023")}
          {tx("). Follow the signs at the toll plaza, which may have changed since.", ")। টোল প্লাজার সাইন মানুন, পরে বদলে থাকতে পারে।")}
        </p>
      </section>

      <section className="mt-10 rounded-2xl bg-surface-2 p-5 text-[14px] leading-relaxed text-ink-2">
        <p>
          {tx("Sources: ", "সূত্র: ")}
          {ext(GUIDELINE_URL, tx("BRTA Motor Vehicle Speed Limit Guideline 2024 (official PDF)", "বিআরটিএ মোটরযান গতিসীমা নির্দেশিকা, ২০২৪ (সরকারি পিডিএফ)"))} <ArrowUpRight size={12} className="inline" />
          {" · "}
          {ext(ACT_URL, tx("Road Transport Act 2018 (official text)", "সড়ক পরিবহন আইন, ২০১৮ (সরকারি পাঠ)"))}
          {tx(`, checked ${AS_OF.en}.`, `, ${AS_OF.bn} তারিখে মেলানো।`)}
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
          <Link href={href("/guide/driving-licence/")} className={a}>
            {tx("getting a driving licence", "ড্রাইভিং লাইসেন্স করা")}
          </Link>
          {" · "}
          <Link href={href("/guide/e-fines/")} className={a}>
            {tx("camera e-fines", "ক্যামেরা ই-জরিমানা")}
          </Link>
        </p>
      </section>
    </div>
  );
}
