import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { formatBDT } from "@/lib/bike-utils";
import { langHref } from "@/lib/site";

type Lang = "en" | "bn";
type Bi = { en: string; bn: string };

/** Official Act text; every row below was read there on AS_OF. */
export const ACT_URL = "https://bdlaws.minlaw.gov.bd/act-print-1262.html";
const AS_OF: Bi = { en: "13 Oct 2026", bn: "13 অক্টোবর 2026" };

// Maximums from the Road Transport Act 2018 (Act 47 of 2018). rule = section broken, sec = penalty section.
type Fine = { what: Bi; rule: string; sec: string; jail?: Bi; fineBDT: number; points?: number; noBail?: boolean };
const months = (n: number): Bi => ({ en: `up to ${n} month${n > 1 ? "s" : ""} in jail`, bn: `সর্বোচ্চ ${n} মাস জেল` });
const years = (n: number): Bi => ({ en: `up to ${n} years in jail`, bn: `সর্বোচ্চ ${n} বছর জেল` });

const GROUPS: { title: Bi; rows: Fine[] }[] = [
  {
    title: { en: "On the road", bn: "রাস্তায় চালানোর সময়" },
    rows: [
      { what: { en: "No helmet (rider or pillion)", bn: "হেলমেট ছাড়া (চালক বা পেছনের আরোহী)" }, rule: "49", sec: "92(1)", jail: months(3), fineBDT: 10000, points: 1 },
      { what: { en: "More than one pillion", bn: "একজনের বেশি সহযাত্রী" }, rule: "49", sec: "92(1)", jail: months(3), fineBDT: 10000, points: 1 },
      { what: { en: "Riding against the traffic (wrong way)", bn: "উল্টো পথে চালানো" }, rule: "49", sec: "92(1)", jail: months(3), fineBDT: 10000, points: 1 },
      { what: { en: "Riding on the footpath", bn: "ফুটপাত দিয়ে চালানো" }, rule: "49", sec: "92(1)", jail: months(3), fineBDT: 10000, points: 1 },
      { what: { en: "Riding drunk or on drugs", bn: "মদ বা মাদক সেবন করে চালানো" }, rule: "49", sec: "92(1)", jail: months(3), fineBDT: 10000, points: 1 },
      { what: { en: "Using a mobile phone while riding", bn: "চালানোর সময় মোবাইল ফোন ব্যবহার" }, rule: "49", sec: "92(2)", jail: months(1), fineBDT: 5000, points: 1 },
      { what: { en: "Ignoring a traffic signal or sign", bn: "ট্রাফিক সিগন্যাল বা সাইন অমান্য" }, rule: "42", sec: "85", jail: months(1), fineBDT: 10000, points: 1 },
      { what: { en: "Speeding, reckless riding or dangerous overtaking", bn: "গতিসীমা ভাঙা, বেপরোয়া চালানো বা বিপজ্জনক ওভারটেকিং" }, rule: "44", sec: "87", jail: months(3), fineBDT: 10000, points: 1 },
      { what: { en: "Loud horn or noise, or a horn in a silent zone", bn: "উচ্চ শব্দের হর্ন বা নীরব এলাকায় হর্ন" }, rule: "45", sec: "88", jail: months(3), fineBDT: 10000, points: 1 },
      { what: { en: "Parking or stopping where it is not allowed", bn: "নিষিদ্ধ জায়গায় পার্কিং বা থামানো" }, rule: "47", sec: "90", fineBDT: 5000, points: 1 },
    ],
  },
  {
    title: { en: "Papers and the bike itself", bn: "কাগজপত্র ও বাইক" },
    rows: [
      { what: { en: "No valid driving licence", bn: "বৈধ ড্রাইভিং লাইসেন্স নেই" }, rule: "4, 5", sec: "66", jail: months(6), fineBDT: 25000 },
      { what: { en: "No registration or no number plate", bn: "রেজিস্ট্রেশন বা নম্বর প্লেট নেই" }, rule: "16", sec: "72", jail: months(6), fineBDT: 50000 },
      { what: { en: "No tax token, or an expired one", bn: "ট্যাক্স টোকেন নেই বা মেয়াদ শেষ" }, rule: "26", sec: "76", fineBDT: 10000 },
      { what: { en: "Buyer does not register the bike in their name within 60 days", bn: "কেনার 60 দিনের মধ্যে নিজের নামে রেজিস্ট্রেশন (মালিকানা বদলি) না করা" }, rule: "21", sec: "74", jail: months(1), fineBDT: 5000 },
      {
        what: { en: "Changing the bike against its approved specification (exhaust, lights, brakes and so on)", bn: "অনুমোদিত স্পেসিফিকেশনের বাইরে পরিবর্তন (এক্সজস্ট, লাইট, ব্রেক ইত্যাদি)" },
        rule: "40",
        sec: "84",
        jail: { en: "1 to 3 years in jail", bn: "1 থেকে 3 বছর জেল" },
        fineBDT: 300000,
        noBail: true,
      },
    ],
  },
  {
    title: { en: "Accidents", bn: "দুর্ঘটনা" },
    rows: [
      { what: { en: "Not telling the police or not getting the injured to hospital after a crash", bn: "দুর্ঘটনার পর থানায় না জানানো বা আহতকে হাসপাতালে না নেওয়া" }, rule: "62(1)", sec: "95", jail: months(1), fineBDT: 20000, points: 1 },
      { what: { en: "A crash that causes loss of life or property through speeding or reckless riding", bn: "অতিরিক্ত গতি বা বেপরোয়া চালানোয় দুর্ঘটনায় জীবন বা সম্পদের ক্ষতি" }, rule: "98", sec: "98", jail: years(3), fineBDT: 300000, noBail: true },
      { what: { en: "Death or serious injury caused by reckless or negligent riding", bn: "বেপরোয়া বা অবহেলায় চালিয়ে কারও মৃত্যু বা গুরুতর আঘাত" }, rule: "105", sec: "105", jail: years(5), fineBDT: 500000, noBail: true },
    ],
  },
];

/** "up to 3 months in jail, up to ৳10,000 fine, or both" in either language. */
export function penaltyText(f: Fine, lang: Lang) {
  const fine = lang === "bn" ? `সর্বোচ্চ ${formatBDT(f.fineBDT)} জরিমানা` : `up to ${formatBDT(f.fineBDT)} fine`;
  const s = f.jail ? (lang === "bn" ? `${f.jail.bn}, ${fine} বা দুটোই` : `${f.jail.en}, ${fine}, or both`) : fine;
  return lang === "en" ? s[0].toUpperCase() + s.slice(1) : s;
}
export const FINES = GROUPS.flatMap((g) => g.rows);

export function FinesView({ lang }: { lang: Lang }) {
  const t = (b: Bi) => b[lang];
  const tx = (en: string, bn: string) => (lang === "bn" ? bn : en);
  const href = (h: string) => langHref(h, lang);
  const sec = (s: string) => tx(`s.${s}`, `ধারা ${s}`);
  const a = "text-brand underline underline-offset-2";
  const actLink = (
    <a href={ACT_URL} target="_blank" rel="noopener noreferrer" className={a}>
      {tx("Road Transport Act 2018 (official text)", "সড়ক পরিবহন আইন, ২০১৮ (সরকারি পাঠ)")}
    </a>
  );

  return (
    <div className="container-x max-w-3xl pt-10">
      <nav aria-label={tx("Breadcrumb", "ব্রেডক্রাম্ব")} className="eyebrow">
        <Link href={href("/guide/")} className="hover:text-brand">
          {tx("Buyer's guide", "ক্রেতা গাইড")}
        </Link>{" "}
        / {tx("Fines", "জরিমানা")}
      </nav>
      <h1 className="mt-2 text-[30px] font-semibold leading-tight tracking-[-0.03em] text-ink sm:text-[40px]">
        {tx("Motorcycle fines and penalties in Bangladesh", "মোটরসাইকেলের জরিমানা ও শাস্তি: বাংলাদেশের আইন")}
      </h1>
      <p className="mt-3 text-[16px] leading-relaxed text-muted">
        {tx(
          "Every fine below is the maximum the Road Transport Act 2018 allows, with the section number so you can check it yourself. The officer or court decides the actual amount, which can be lower. Checked against the official text on ",
          "নিচের প্রতিটি জরিমানা সড়ক পরিবহন আইন, ২০১৮-তে দেওয়া সর্বোচ্চ সীমা, সঙ্গে ধারা নম্বর, যাতে আপনি নিজে মিলিয়ে দেখতে পারেন। আসল অঙ্ক ঠিক করেন কর্মকর্তা বা আদালত, যা কমও হতে পারে। সরকারি পাঠের সঙ্গে মেলানো হয়েছে ",
        )}
        {t(AS_OF)}
        {tx(".", " তারিখে।")}
      </p>

      <section id="helmet" className="mt-10 scroll-mt-24">
        <h2 className="text-[22px] font-semibold tracking-tight text-ink">{tx("How much is the fine for riding without a helmet?", "হেলমেট ছাড়া বাইক চালালে জরিমানা কত?")}</h2>
        <p className="mt-3 text-[15.5px] leading-relaxed text-ink-2">
          {tx(
            "Up to ৳10,000, up to 3 months in jail, or both, and 1 point off the rider's licence (s.92(1)). The rule covers both people: the Act says the rider and the pillion must both wear a helmet properly, and a motorcycle may carry only one pillion (s.49). Carrying two pillions has the same penalty.",
            "সর্বোচ্চ ৳10,000 জরিমানা, সর্বোচ্চ 3 মাস জেল বা দুটোই, আর চালকের লাইসেন্স থেকে 1 পয়েন্ট কাটা (ধারা 92(1))। নিয়মটা দুজনের জন্যই: আইন বলছে চালক ও পেছনের আরোহী দুজনকেই যথাযথভাবে হেলমেট পরতে হবে, আর মোটরসাইকেলে একজনের বেশি সহযাত্রী নেওয়া যাবে না (ধারা 49)। দুজন সহযাত্রী নিলেও একই শাস্তি।",
          )}
        </p>
      </section>

      <section id="table" className="mt-10 scroll-mt-24">
        <h2 className="text-[22px] font-semibold tracking-tight text-ink">{tx("All motorcycle fines at a glance", "এক নজরে মোটরসাইকেলের সব জরিমানা")}</h2>
        {GROUPS.map((g) => (
          <div key={g.title.en} className="mt-6">
            <h3 className="text-[16px] font-semibold text-ink">{t(g.title)}</h3>
            <ul className="mt-2 divide-y divide-line rounded-2xl border border-line bg-surface">
              {g.rows.map((f) => (
                <li key={f.what.en} className="px-4 py-3.5">
                  <p className="text-[15px] font-medium text-ink">{t(f.what)}</p>
                  <p className="mt-1 text-[14.5px] leading-relaxed text-ink-2">
                    {penaltyText(f, lang)}
                    {f.points ? tx(`, 1 licence point`, `, লাইসেন্স থেকে 1 পয়েন্ট`) : ""}
                    {f.noBail ? tx(". Not bailable", "। জামিন অযোগ্য") : ""}
                  </p>
                  <p className="mt-0.5 text-[12.5px] text-muted">
                    {f.rule === f.sec ? sec(f.sec) : `${tx("Rule", "নিয়ম")} ${sec(f.rule)} · ${tx("penalty", "শাস্তি")} ${sec(f.sec)}`}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        ))}
        <p className="mt-4 text-[14px] leading-relaxed text-muted">
          {tx(
            "Doing the same offence again after being punished for it: up to double the maximum, and never less than double the earlier punishment (s.100).",
            "শাস্তি পাওয়ার পর একই অপরাধ আবার করলে: সর্বোচ্চ শাস্তির দ্বিগুণ পর্যন্ত, আর আগের শাস্তির দ্বিগুণের কম নয় (ধারা 100)।",
          )}
        </p>
      </section>

      <section id="points" className="mt-10 scroll-mt-24">
        <h2 className="text-[22px] font-semibold tracking-tight text-ink">{tx("What are licence points?", "লাইসেন্সের পয়েন্ট কী?")}</h2>
        <p className="mt-3 text-[15.5px] leading-relaxed text-ink-2">
          {tx(
            "Every driving licence except a learner licence starts with 12 points (s.11). Most riding offences above also cut 1 point. The rules made under the Act set what happens as points run out.",
            "শিক্ষানবিশ ছাড়া প্রতিটি ড্রাইভিং লাইসেন্সে 12 পয়েন্ট থাকে (ধারা 11)। ওপরের বেশিরভাগ চালানো-সংক্রান্ত অপরাধে 1 পয়েন্ট করে কাটা যায়। পয়েন্ট শেষ হলে কী হবে, তা আইনের অধীন বিধিমালায় ঠিক করা।",
          )}
        </p>
      </section>

      <section id="police-stop" className="mt-10 scroll-mt-24">
        <h2 className="text-[22px] font-semibold tracking-tight text-ink">{tx("What happens when the police stop you?", "পুলিশ থামালে কী হয়?")}</h2>
        <ol className="mt-3 list-decimal space-y-2 pl-5 text-[15.5px] leading-relaxed text-ink-2">
          <li>
            {tx(
              "For the common offences (no licence, no registration, illegal changes, speeding, helmet and other riding rules, not helping after a crash) an officer of sub-inspector or sergeant rank or above writes a charge. You get a copy and sign or thumbprint it (s.108(1)).",
              "সাধারণ অপরাধগুলোর জন্য (লাইসেন্স নেই, রেজিস্ট্রেশন নেই, অবৈধ পরিবর্তন, গতিসীমা, হেলমেটসহ চালানোর নিয়ম, দুর্ঘটনার পর সাহায্য না করা) সাব-ইন্সপেক্টর বা সার্জেন্ট বা তার ওপরের কর্মকর্তা অভিযোগ লেখেন। আপনি একটি কপি পান এবং তাতে সই বা টিপসই দেন (ধারা 108(1))।",
            )}
          </li>
          <li>
            {tx(
              "In areas BRTA has notified, the officer can fine you on the spot. The amount is written on a form and you get a receipt when you pay (s.113(1)-(2)). Ask for it.",
              "BRTA ঘোষিত এলাকায় কর্মকর্তা ঘটনাস্থলেই জরিমানা করতে পারেন। অঙ্কটা ফরমে লেখা হয় আর টাকা দিলে আপনি রসিদ পান (ধারা 113(1)-(2))। রসিদ চেয়ে নিন।",
            )}
          </li>
          <li>
            {tx(
              "If you refuse the charge copy or do not pay, the bike can be sent to the nearest police station and is released after the fine is paid (s.113(3)).",
              "অভিযোগের কপি নিতে অস্বীকার করলে বা জরিমানা না দিলে বাইক নিকটস্থ থানায় পাঠানো যায়, জরিমানা দিলে ছাড়া হয় (ধারা 113(3))।",
            )}
          </li>
        </ol>
        <p className="mt-4 rounded-xl border border-line bg-surface p-3.5 text-[14px] leading-relaxed text-ink-2">
          {tx("In Dhaka and along major highways, cameras now register speeding and violations automatically. See how notices arrive, payment options and how to spot scam SMS in our ", "ঢাকা ও প্রধান মহাসড়কগুলোতে ক্যামেরা এখন নিজে থেকেই গতি ও অন্যান্য লঙ্ঘন ধরে ফেলে। নোটিশ কীভাবে আসে, কীভাবে দিতে হয় আর ভুয়া এসএমএস কীভাবে চিনবেন দেখুন আমাদের ")}
          <Link href={href("/guide/e-fines/")} className={a}>
            {tx("Dhaka AI-camera e-fines guide", "ঢাকার এআই ক্যামেরা ই-জরিমানা গাইডে")}
          </Link>
          {tx(".", "।")}
        </p>
      </section>

      <section id="accident" className="mt-10 scroll-mt-24">
        <h2 className="text-[22px] font-semibold tracking-tight text-ink">{tx("What must you do after an accident?", "দুর্ঘটনার পর কী করতে হবে?")}</h2>
        <p className="mt-3 text-[15.5px] leading-relaxed text-ink-2">
          {tx(
            "Tell the nearest police station straight away (and the fire service or a hospital where needed), and get anyone injured to a hospital as fast as possible (s.62(1)). Not doing this: up to ৳20,000, up to 1 month in jail, or both (s.95). Crashes that kill or seriously injure someone fall under s.105 and the Penal Code; offences under ss.84, 98 and 105 are not bailable (s.117).",
            "সঙ্গে সঙ্গে নিকটস্থ থানায় জানান (দরকার হলে ফায়ার সার্ভিস বা হাসপাতালেও), আর আহত কাউকে যত দ্রুত সম্ভব হাসপাতালে নিন (ধারা 62(1))। না করলে: সর্বোচ্চ ৳20,000 জরিমানা, সর্বোচ্চ 1 মাস জেল বা দুটোই (ধারা 95)। কারও মৃত্যু বা গুরুতর আঘাত হলে ধারা 105 ও দণ্ডবিধি প্রযোজ্য; ধারা 84, 98 ও 105-এর অপরাধ জামিন অযোগ্য (ধারা 117)।",
          )}
        </p>
      </section>

      <section id="changes" className="mt-10 scroll-mt-24">
        <h2 className="text-[22px] font-semibold tracking-tight text-ink">{tx("Were the fines cut in 2024?", "2024-এ কি জরিমানা কমানো হয়েছে?")}</h2>
        <p className="mt-3 text-[15.5px] leading-relaxed text-ink-2">
          {tx(
            "Not as far as the law shows. On 13 March 2024 the cabinet gave in-principle approval to a draft Road Transport (Amendment) Act that would, among other things, cut the signal-breaking fine from ৳10,000 to ৳2,000. A draft is not law: the official text we checked on ",
            "আইনে এখনো তা দেখা যায় না। 13 মার্চ 2024 মন্ত্রিসভা সড়ক পরিবহন (সংশোধন) আইনের একটি খসড়ায় নীতিগত অনুমোদন দেয়, যাতে অন্য বিষয়ের সঙ্গে সিগন্যাল অমান্যের জরিমানা ৳10,000 থেকে ৳2,000 করার প্রস্তাব ছিল। খসড়া আইন নয়: ",
          )}
          {t(AS_OF)}
          {tx(" still shows the original figures used on this page (", " তারিখে আমরা যে সরকারি পাঠ দেখেছি তাতে এখনো এই পাতার মূল অঙ্কগুলোই আছে (")}
          <a href="https://www.tbsnews.net/node/808630" target="_blank" rel="noopener noreferrer" className={a}>
            The Business Standard, 13 Mar 2024
          </a>
          ).
        </p>
      </section>

      <section className="mt-10 rounded-2xl bg-surface-2 p-5 text-[14px] leading-relaxed text-ink-2">
        <p>
          {tx("Source: ", "সূত্র: ")}
          {actLink} <ArrowUpRight size={12} className="inline" />
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
          <Link href={href("/guide/speed-limits/")} className={a}>
            {tx("motorcycle speed limits", "মোটরসাইকেলের গতিসীমা")}
          </Link>
          {" · "}
          <Link href={href("/guide/driving-licence/")} className={a}>
            {tx("getting a driving licence", "ড্রাইভিং লাইসেন্স করা")}
          </Link>
          {" · "}
          <Link href={href("/guide/e-fines/")} className={a}>
            {tx("AI-camera e-fines & fake SMS", "ক্যামেরা ই-জরিমানা ও ভুয়া এসএমএস")}
          </Link>
          {" · "}
          <Link href={href("/guide/#registration")} className={a}>
            {tx("registration & tax token", "রেজিস্ট্রেশন ও ট্যাক্স টোকেন")}
          </Link>
          {" · "}
          <Link href={href("/guide/#used")} className={a}>
            {tx("buying used", "পুরনো বাইক কেনা")}
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
