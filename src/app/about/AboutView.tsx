"use client";

import Link from "next/link";
import { SCORE_LABELS } from "@/lib/bikes";
import { useLang, useTx } from "@/lib/i18n";
import { SITE } from "@/lib/site";
import type { ScoreKey } from "@/lib/types";

export function AboutView() {
  const { lang } = useLang();
  const tx = useTx();
  return (
    <div className="container-x max-w-3xl pt-12">
      <p className="eyebrow">{tx("About", "আমাদের কথা")}</p>
      <h1 className="mt-2 text-[32px] font-semibold leading-tight tracking-[-0.03em] text-ink sm:text-[44px]">{tx("How we rate bikes", "আমরা কীভাবে বাইক রেট করি")}</h1>
      <div className="mt-6 space-y-5 text-[16px] leading-relaxed text-ink-2">
        <p>
          {tx(
            "Suggest.Bike exists because buying a bike in Bangladesh means asking ten people and getting eleven answers. Brochures tell you peak power; nobody tells you whether the mechanic in your thana has seen the engine before, or what a chain set costs in Bangshal.",
            "বাংলাদেশে বাইক কিনতে গেলে দশজনকে জিজ্ঞেস করলে এগারোটা উত্তর পাওয়া যায় — সেজন্যই Suggest.Bike। ব্রোশিওর পাওয়ার বলে; কিন্তু আপনার থানার মিস্ত্রি ইঞ্জিনটা আগে দেখেছে কি না, বা বংশালে চেইন সেটের দাম কত — কেউ বলে না।",
          )}
        </p>
        <p>
          <strong className="text-ink">{tx("Prices", "দাম")}</strong>{" "}
          {tx(
            "are ex-showroom figures from official distributors and BikeBD. Each bike page shows the month we last checked and a link to the source. Used prices are typical asking prices on bikroy.com. Showrooms run offers constantly — always confirm before paying.",
            "অফিশিয়াল ডিস্ট্রিবিউটর ও BikeBD থেকে শোরুম মূল্য। প্রতিটি বাইকের পাতায় কোন মাসে যাচাই করা হয়েছে আর উৎসের লিংক আছে। পুরনো বাইকের দাম bikroy.com-এর সাধারণ চাওয়া দাম। শোরুমে প্রায়ই অফার চলে — টাকা দেওয়ার আগে নিশ্চিত হোন।",
          )}
        </p>
        <p>
          <strong className="text-ink">{tx("Mileage", "মাইলেজ")}</strong>{" "}
          {tx(
            "is the real-world range owners report in mixed Bangladeshi traffic, not the brand's claimed figure. It's an estimate, and we mark it as one.",
            "বাংলাদেশের মিশ্র ট্রাফিকে মালিকরা যা পান সেই বাস্তব পরিসর — কোম্পানির দাবি নয়। এটা আনুমানিক, আর আমরা সেভাবেই চিহ্নিত করি।",
          )}
        </p>
        <p>
          <strong className="text-ink">{tx("Ownership scores", "মালিকানা স্কোর")}</strong>{" "}
          {tx(
            "are editorial, 1–10, built from owner reviews, Bangladeshi motorcycle sites and riding communities:",
            "আমাদের মূল্যায়ন, ১–১০, মালিকদের রিভিউ, দেশি মোটরসাইকেল সাইট আর রাইডিং কমিউনিটি থেকে:",
          )}
        </p>
      </div>
      <dl className="mt-6 overflow-hidden rounded-2xl border border-line bg-surface">
        {(Object.keys(SCORE_LABELS) as ScoreKey[]).map((k, i) => (
          <div key={k} className={`grid grid-cols-[minmax(130px,40%)_1fr] gap-4 px-4 py-3 text-[14.5px] ${i % 2 ? "bg-surface-2/40" : ""}`}>
            <dt className="font-medium text-ink">{lang === "bn" ? SCORE_LABELS[k].bn : SCORE_LABELS[k].en}</dt>
            <dd className="text-muted">{lang === "bn" ? SCORE_LABELS[k].hintBn : SCORE_LABELS[k].hint}</dd>
          </div>
        ))}
      </dl>
      <div className="mt-8 space-y-5 text-[16px] leading-relaxed text-ink-2">
        <p>
          <strong className="text-ink">{tx("The matchmaker", "ম্যাচমেকার")}</strong>{" "}
          {tx(
            "filters by your budget (or monthly EMI), gearbox preference and new/used, then weights those scores by how and where you'll ride — commuters get city handling and mileage, highway riders get stability and comfort, Pathao riders get running cost and durability, and district or village riders get brands with a wider service network. It penalises seats too tall for your height, bikes too much for a first-timer, and decades-old classics for daily use.",
            "আপনার বাজেট (বা মাসিক কিস্তি), গিয়ার পছন্দ আর নতুন/পুরনো দিয়ে ছাঁকে, তারপর কীভাবে ও কোথায় চালাবেন সে অনুযায়ী স্কোরের গুরুত্ব ঠিক করে — কমিউটারদের জন্য শহরে চালানো ও মাইলেজ, হাইওয়ে রাইডারদের জন্য স্থিরতা ও আরাম, পাঠাও রাইডারদের জন্য খরচ ও টেকসইতা, আর জেলা বা গ্রামের রাইডারদের জন্য বড় সার্ভিস নেটওয়ার্কের ব্র্যান্ড। উচ্চতার তুলনায় উঁচু সিট, নতুনদের জন্য বেশি শক্তিশালী বাইক, আর প্রতিদিনের জন্য কয়েক দশক পুরনো ক্লাসিক — এগুলোতে নম্বর কমে।",
          )}
        </p>
        <p>
          <strong className="text-ink">{tx("No one pays for placement.", "কেউ টাকা দিয়ে র‍্যাঙ্কিং কেনে না।")}</strong>{" "}
          {tx("There are no sponsored rankings and no affiliate deals with dealers.", "কোনো স্পনসরড র‍্যাঙ্কিং নেই, ডিলারদের সাথে কোনো কমিশন চুক্তিও নেই।")}
        </p>
        <p>
          {tx("Spotted a wrong price or spec? That's the fastest way to make this better for everyone —", "ভুল দাম বা স্পেক দেখেছেন? সবার জন্য এটা ভালো করার সবচেয়ে দ্রুত উপায় —")}{" "}
          <a href={`mailto:${SITE.contactEmail}`} className="text-brand hover:underline">
            {SITE.contactEmail}
          </a>
          .
        </p>
      </div>
      <Link href="/match/" className="btn-primary mt-10">
        {tx("Try the matchmaker", "ম্যাচমেকার চালান")}
      </Link>
    </div>
  );
}
