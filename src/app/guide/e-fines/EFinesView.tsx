import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { langHref } from "@/lib/site";
import { bnNumerals } from "@/lib/bike-utils";

type Lang = "en" | "bn";
type Bi = { en: string; bn: string };

// DMP notices as reported by Dhaka Tribune; Highway Police system as announced to Dhaka Tribune. All read on AS_OF.
const DT_AUTO = { url: "https://www.dhakatribune.com/bangladesh/409248/e-traffic-auto-notices-for-violations-warrant-if", label: "Dhaka Tribune, 3 May 2026" };
const DT_FAKE = { url: "https://www.dhakatribune.com/bangladesh/dhaka/411077/dmp-warns-against-fake-traffic-fine-messages", label: "Dhaka Tribune, 25 May 2026" };
const DT_HIGHWAY = { url: "https://www.dhakatribune.com/bangladesh/417540/auto-fine-system-coming-to-dhaka-chittagong", label: "Dhaka Tribune, 15 Aug 2026" };
const AS_OF: Bi = { en: "14 Oct 2026", bn: "১৪ অক্টোবর ২০২৬" };
/** The only numbers DMP says it sends e-fine SMS from. */
const DMP_SMS = ["01320-042207", "01320-042227"];

const OFFENCES: Bi[] = [
  { en: "Running a red light or crossing the stop line", bn: "লাল বাতি অমান্য বা স্টপ লাইন পার হওয়া" },
  { en: "Riding on the wrong side", bn: "উল্টো দিকে চালানো" },
  { en: "Illegal parking or blocking the left lane", bn: "অবৈধ পার্কিং বা বাম লেন আটকে রাখা" },
  { en: "Picking up passengers in a way that blocks traffic", bn: "যত্রতত্র যাত্রী তুলে যান চলাচলে বাধা" },
  { en: "No registration or fitness certificate", bn: "রেজিস্ট্রেশন বা ফিটনেস সনদ না থাকা" },
];

export function EFinesView({ lang }: { lang: Lang }) {
  const t = (b: Bi) => (lang === "bn" ? bnNumerals(b.bn) : b.en);
  const tx = (en: string, bn: string) => (lang === "bn" ? bnNumerals(bn) : en);
  const href = (h: string) => langHref(h, lang);
  const a = "text-brand underline underline-offset-2";
  const ext = (s: { url: string; label: string }) => (
    <a href={s.url} target="_blank" rel="noopener noreferrer" className={a}>
      {s.label}
    </a>
  );
  const nums = DMP_SMS.join(tx(" and ", " ও "));

  return (
    <div className="container-x max-w-3xl pt-10">
      <nav aria-label={tx("Breadcrumb", "ব্রেডক্রাম্ব")} className="eyebrow">
        <Link href={href("/guide/")} className="hover:text-brand">
          {tx("Buyer's guide", "ক্রেতা গাইড")}
        </Link>{" "}
        / {tx("E-fines", "ই-জরিমানা")}
      </nav>
      <h1 className="mt-2 text-[30px] font-semibold leading-tight tracking-[-0.03em] text-ink sm:text-[40px]">
        {tx("Camera e-fines in Dhaka, and how to spot a fake fine SMS", "ঢাকায় ক্যামেরায় ই-জরিমানা, আর ভুয়া জরিমানার এসএমএস চেনার উপায়")}
      </h1>
      <p className="mt-3 text-[16px] leading-relaxed text-muted">
        {tx(
          "Dhaka Metropolitan Police (DMP) now files traffic cases from CCTV and AI-camera footage, and fake fine messages are going round. Here is how a real notice reaches you, how to pay, and what DMP will never ask for, from DMP's public notices as reported in the press. Checked on ",
          "ঢাকা মহানগর পুলিশ (ডিএমপি) এখন সিসিটিভি ও এআই ক্যামেরার ফুটেজ দেখে ট্রাফিক মামলা দিচ্ছে, আর ভুয়া জরিমানার বার্তাও ঘুরছে। আসল নোটিশ কীভাবে আসে, কীভাবে টাকা দেবেন, আর ডিএমপি কী কখনো চায় না, সংবাদমাধ্যমে প্রকাশিত ডিএমপির বিজ্ঞপ্তি থেকে। মেলানো হয়েছে ",
        )}
        {t(AS_OF)}
        {tx(".", " তারিখে।")}
      </p>

      <section id="what" className="mt-10 scroll-mt-24">
        <h2 className="text-[22px] font-semibold tracking-tight text-ink">{tx("What does the camera catch?", "ক্যামেরা কী কী ধরে?")}</h2>
        <p className="mt-3 text-[15.5px] leading-relaxed text-ink-2">
          {tx(
            "DMP's traffic division has put AI-enabled cameras at signals and other key spots in Dhaka. The footage feeds an e-traffic prosecution system that files a digital case against the vehicle. DMP named these offences (",
            "ডিএমপির ট্রাফিক বিভাগ ঢাকার সিগন্যাল ও গুরুত্বপূর্ণ জায়গায় এআই ক্যামেরা বসিয়েছে। সেই ফুটেজ থেকে ই-ট্রাফিক প্রসিকিউশন সিস্টেম গাড়ির বিরুদ্ধে ডিজিটাল মামলা দেয়। ডিএমপি যেসব অপরাধের কথা বলেছে (",
          )}
          {ext(DT_AUTO)}
          {tx("):", "):")}
        </p>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-[15.5px] leading-relaxed text-ink-2">
          {OFFENCES.map((o) => (
            <li key={o.en}>{t(o)}</li>
          ))}
        </ul>
        <p className="mt-3 text-[15.5px] leading-relaxed text-ink-2">
          {tx("The fine amounts are the ones in the Road Transport Act 2018: see ", "জরিমানার অঙ্ক সড়ক পরিবহন আইন, ২০১৮ অনুযায়ী: দেখুন ")}
          <Link href={href("/guide/motorcycle-fines/")} className={a}>
            {tx("motorcycle fines", "মোটরসাইকেলের জরিমানা")}
          </Link>
          {tx(".", "।")}
        </p>
      </section>

      <section id="notice" className="mt-10 scroll-mt-24">
        <h2 className="text-[22px] font-semibold tracking-tight text-ink">{tx("How does a real e-fine notice arrive?", "আসল ই-জরিমানার নোটিশ কীভাবে আসে?")}</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-[15.5px] leading-relaxed text-ink-2">
          <li>
            {tx(
              "By letter, sent by registered post to the address on the vehicle's registration, signed by an officer of the traffic division or the Traffic Technical Unit.",
              "চিঠিতে, গাড়ির রেজিস্ট্রেশনের ঠিকানায় রেজিস্টার্ড ডাকে, ট্রাফিক বিভাগ বা ট্রাফিক টেকনিক্যাল ইউনিটের কর্মকর্তার সইসহ।",
            )}
          </li>
          <li>
            {tx(`By SMS only when needed, and only from ${nums}.`, `দরকার হলে এসএমএসেও, তবে শুধু ${nums} নম্বর থেকে।`)}
          </li>
        </ul>
        <p className="mt-3 text-[15.5px] leading-relaxed text-ink-2">
          {tx(
            "Because the letter goes to the registered address, a bike still in the seller's name sends your fines to them. One more reason to finish the ownership transfer (the buyer has 60 days, Act s.21). Source: ",
            "চিঠি যেহেতু রেজিস্ট্রেশনের ঠিকানায় যায়, বাইক বিক্রেতার নামে থাকলে আপনার জরিমানার নোটিশ তাঁর কাছে যাবে। মালিকানা বদলি শেষ করার এটা আরেকটা কারণ (ক্রেতার হাতে ৬০ দিন, আইন ধারা ২১)। সূত্র: ",
          )}
          {ext(DT_FAKE)}
          {tx(".", "।")}
        </p>
      </section>

      <section id="pay" className="mt-10 scroll-mt-24">
        <h2 className="text-[22px] font-semibold tracking-tight text-ink">{tx("How do you pay, and what if you ignore it?", "কীভাবে টাকা দেবেন, আর না দিলে কী হয়?")}</h2>
        <p className="mt-3 text-[15.5px] leading-relaxed text-ink-2">
          {tx(
            "DMP's first notice (3 May 2026) said to appear at DMP headquarters or the traffic division named in the notice and settle the case there, paying through a bank or mobile financial service. Its later warning (25 May 2026) named Upay and CBL as the approved online platforms. If you do not appear and pay, DMP will seek a summons or an arrest warrant through a special metropolitan magistrate (",
            "ডিএমপির প্রথম বিজ্ঞপ্তি (৩ মে ২০২৬) বলেছিল, নোটিশে উল্লেখিত ডিএমপি সদর দপ্তর বা ট্রাফিক বিভাগে গিয়ে ব্যাংক বা মোবাইল আর্থিক সেবার মাধ্যমে টাকা দিয়ে মামলা নিষ্পত্তি করতে। পরের সতর্কবার্তায় (২৫ মে ২০২৬) অনুমোদিত অনলাইন মাধ্যম হিসেবে উপায় ও সিবিএল-এর নাম আছে। হাজির হয়ে টাকা না দিলে ডিএমপি স্পেশাল মেট্রোপলিটন ম্যাজিস্ট্রেটের মাধ্যমে সমন বা গ্রেপ্তারি পরোয়ানা চাইবে (",
          )}
          {ext(DT_AUTO)}
          {tx("). Follow the instructions printed on your own notice.", ")। নিজের নোটিশে লেখা নির্দেশনা মানুন।")}
        </p>
      </section>

      <section id="fake" className="mt-10 scroll-mt-24">
        <h2 className="text-[22px] font-semibold tracking-tight text-ink">{tx("How to spot a fake traffic fine SMS", "ভুয়া ট্রাফিক জরিমানার এসএমএস চেনার উপায়")}</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-[15.5px] leading-relaxed text-ink-2">
          <li>{tx(`DMP sends e-fine SMS only from ${nums}. Any other sender is not DMP.`, `ডিএমপি ই-জরিমানার এসএমএস পাঠায় শুধু ${nums} থেকে। অন্য নম্বর থেকে এলে সেটা ডিএমপি নয়।`)}</li>
          <li>{tx("DMP never asks for a PIN, password, OTP or any other banking secret.", "ডিএমপি কখনো পিন, পাসওয়ার্ড, ওটিপি বা ব্যাংকিংয়ের কোনো গোপন তথ্য চায় না।")}</li>
          <li>{tx("Do not pay or share personal details outside the official process. If someone asks you to pay for a CCTV case, check with the nearest police station or traffic division.", "সরকারি প্রক্রিয়ার বাইরে টাকা দেবেন না বা ব্যক্তিগত তথ্য দেবেন না। কেউ সিসিটিভি মামলার টাকা চাইলে নিকটস্থ থানা বা ট্রাফিক বিভাগে যাচাই করুন।")}</li>
          <li>{tx(`Questions about a camera case: DMP's Delta-3 desk on ${nums}, or 999.`, `ক্যামেরা মামলা নিয়ে প্রশ্ন: ডিএমপির ডেল্টা-৩, ${nums}, অথবা ৯৯৯।`)}</li>
        </ul>
        <p className="mt-3 text-[14px] leading-relaxed text-muted">
          {tx("Source: DMP warning, ", "সূত্র: ডিএমপির সতর্কবার্তা, ")}
          {ext(DT_FAKE)}
          {tx("; ", "; ")}
          {ext(DT_AUTO)}
          {tx(".", "।")}
        </p>
      </section>

      <section id="highway" className="mt-10 scroll-mt-24">
        <h2 className="text-[22px] font-semibold tracking-tight text-ink">{tx("Auto-fines on the Dhaka-Chattogram highway", "ঢাকা-চট্টগ্রাম মহাসড়কে অটো জরিমানা")}</h2>
        <p className="mt-3 text-[15.5px] leading-relaxed text-ink-2">
          {tx(
            "This is a separate system, run by the Highway Police, not DMP. From 18 August 2026 its AI cameras on the Dhaka-Chattogram highway detect speeding, illegal parking and riding against the traffic; the case is sent by SMS to the registered owner, payable by bKash or Nagad. The fine amounts were not announced, and the announcement did not say whether motorcycles are covered (",
            "এটি আলাদা ব্যবস্থা, চালায় হাইওয়ে পুলিশ, ডিএমপি নয়। ১৮ আগস্ট ২০২৬ থেকে ঢাকা-চট্টগ্রাম মহাসড়কে এর এআই ক্যামেরা অতিরিক্ত গতি, অবৈধ পার্কিং ও উল্টো পথে চালানো ধরে; মামলার তথ্য এসএমএসে নিবন্ধিত মালিকের কাছে যায়, টাকা দেওয়া যায় বিকাশ বা নগদে। জরিমানার অঙ্ক ঘোষণা করা হয়নি, মোটরসাইকেলও এর আওতায় কি না তা ঘোষণায় বলা হয়নি (",
          )}
          {ext(DT_HIGHWAY)}
          {tx("). Highway speed limits: ", ")। মহাসড়কের গতিসীমা: ")}
          <Link href={href("/guide/speed-limits/")} className={a}>
            {tx("speed limits for motorcycles", "মোটরসাইকেলের গতিসীমা")}
          </Link>
          {tx(".", "।")}
        </p>
      </section>

      <section className="mt-10 rounded-2xl bg-surface-2 p-5 text-[14px] leading-relaxed text-ink-2">
        <p>
          {tx("Sources: ", "সূত্র: ")}
          {ext(DT_AUTO)} <ArrowUpRight size={12} className="inline" />
          {" · "}
          {ext(DT_FAKE)}
          {" · "}
          {ext(DT_HIGHWAY)}
          {tx(`, read ${AS_OF.en}. These are press reports of DMP and Highway Police notices.`, `, ${AS_OF.bn} তারিখে পড়া। এগুলো ডিএমপি ও হাইওয়ে পুলিশের বিজ্ঞপ্তি নিয়ে প্রকাশিত সংবাদ।`)}
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
          <Link href={href("/guide/#used")} className={a}>
            {tx("buying used and ownership transfer", "পুরনো বাইক কেনা ও মালিকানা বদলি")}
          </Link>
        </p>
      </section>
    </div>
  );
}
