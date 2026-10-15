"use client";

import Link from "@/components/LangLink";
import { ArrowLeft, Info } from "lucide-react";
import { FeedbackForm } from "@/components/FeedbackForm";
import { absLabel, formatBDT, fullName, getBike, mileageText, SCORE_LABELS } from "@/lib/bikes";
import { onRoadPrice } from "@/lib/cost";
import { pairsForBike } from "@/lib/curated";
import { commentsFor } from "@/lib/comments";
import { useLang, useTx } from "@/lib/i18n";
import { FORM_ENDPOINT } from "@/lib/site";
import type { Pair } from "@/lib/maintenance-posts";
import { SPOTLIGHTS, spotlightBySlug } from "@/lib/spotlight-posts";
import type { ScoreKey } from "@/lib/types";

const h2 = "text-[22px] font-semibold tracking-tight text-ink";
const SCORES: ScoreKey[] = ["reliability", "resale", "mechanicFamiliarity", "partsAvailability", "comfort", "cityHandling", "highway", "performance"];

export function SpotlightIndex() {
  const tx = useTx();
  const weeks = [...new Set(SPOTLIGHTS.map((s) => s.week))].sort((a, b) => b - a);
  return (
    <div className="container-x pt-10">
      <p className="eyebrow">{tx("Bike spotlights", "বাইক স্পটলাইট")}</p>
      <h1 className="mt-2 max-w-3xl text-[32px] font-semibold leading-tight tracking-[-0.03em] text-ink sm:text-[44px]">
        {tx("Five bikes a week, each the best at one thing.", "প্রতি সপ্তাহে পাঁচটি বাইক, প্রতিটি একটি জিনিসে সেরা।")}
      </h1>
      <p className="mt-4 max-w-2xl text-[16px] leading-relaxed text-muted">
        {tx(
          "Each week we pick five bikes that win different categories on our own data: price, mileage, resale, fun, highway and more. Why each one wins, who it suits, and what it costs you elsewhere.",
          "প্রতি সপ্তাহে আমাদের নিজস্ব ডেটায় আলাদা আলাদা বিভাগে সেরা পাঁচটি বাইক বেছে নিই: দাম, মাইলেজ, রিসেল, মজা, হাইওয়ে আর আরও। কেন জেতে, কার জন্য মানায়, আর অন্য কোথায় ছাড় দিতে হয়।",
        )}
      </p>
      <div className="mt-12 max-w-3xl space-y-10">
        {weeks.map((w) => (
          <section key={w}>
            <h2 className={h2}>{tx(`Week ${w}`, `সপ্তাহ ${w}`)}</h2>
            <ul className="mt-4 space-y-4">
              {SPOTLIGHTS.filter((s) => s.week === w).map((s) => (
                <li key={s.slug}>
                  <Link href={`/spotlight/${s.slug}/`} className="block rounded-2xl border border-line bg-surface p-5 transition-colors hover:border-brand">
                    <p className="text-[12.5px] font-medium text-brand">{tx(...s.wins)}</p>
                    <h3 className="mt-1 text-[18px] font-semibold text-ink">{tx(...s.title)}</h3>
                    <p className="mt-1 text-[14.5px] text-muted">{tx(...s.summary)}</p>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}

export function SpotlightPost({ slug }: { slug: string }) {
  const tx = useTx();
  const { lang } = useLang();
  const post = spotlightBySlug(slug)!;
  const b = getBike(post.bike)!;
  const rival = getBike(post.rival)!;
  const compareHref = pairsForBike(b.id).find((p) => p.other.id === rival.id)?.href ?? `/compare/?bikes=${b.id},${rival.id}`;
  const comments = commentsFor(slug);
  const List = ({ items }: { items: Pair[] }) => (
    <ul className="mt-3 list-disc space-y-2 pl-5 text-[15px] leading-relaxed text-ink-2">
      {items.map((i) => (
        <li key={i[0]}>{tx(...i)}</li>
      ))}
    </ul>
  );
  const facts: [Pair, string][] = [
    [["On-road price", "অন-রোড দাম"], formatBDT(onRoadPrice(b))],
    [["Mileage (real world)", "মাইলেজ (বাস্তবে)"], mileageText(b)],
    [["Power", "শক্তি"], `${b.powerPS} PS`],
    [["Weight", "ওজন"], `${b.weightKg} kg`],
    [["Seat height", "সিটের উচ্চতা"], `${b.seatHeightMm} mm`],
    [["Brakes", "ব্রেক"], absLabel(b, lang)],
  ];
  return (
    <div className="container-x pt-10">
      <Link href="/spotlight/" className="inline-flex items-center gap-1 text-[14px] text-muted hover:text-ink">
        <ArrowLeft size={15} /> {tx("All spotlights", "সব স্পটলাইট")}
      </Link>
      <p className="eyebrow mt-6">
        {tx(`Week ${post.week}`, `সপ্তাহ ${post.week}`)} · {tx(...post.wins)} · {post.minutes} {tx("min read", "মিনিটের পড়া")}
      </p>
      <h1 className="mt-2 max-w-3xl text-[32px] font-semibold leading-tight tracking-[-0.03em] text-ink sm:text-[40px]">{tx(...post.title)}</h1>
      <p className="mt-3 max-w-2xl text-[16px] leading-relaxed text-muted">{tx(...post.summary)}</p>

      <div className="mt-10 max-w-3xl space-y-10">
        <section className="rounded-2xl border border-line bg-surface p-5">
          <h2 className="text-[18px] font-semibold text-ink">{fullName(b)}</h2>
          <dl className="mt-3 grid grid-cols-2 gap-x-6 gap-y-2 text-[14px] sm:grid-cols-3">
            {facts.map(([k, v]) => (
              <div key={k[0]}>
                <dt className="text-muted">{tx(...k)}</dt>
                <dd className="font-semibold text-ink tnum">{v}</dd>
              </div>
            ))}
            {SCORES.map((k) => (
              <div key={k}>
                <dt className="text-muted">{lang === "bn" ? SCORE_LABELS[k].bn : SCORE_LABELS[k].en}</dt>
                <dd className="font-semibold text-ink tnum">{b.scores[k]}/10</dd>
              </div>
            ))}
          </dl>
          <p className="mt-3 text-[12.5px] text-faint">
            {tx(`Price as of ${b.priceAsOf}, with BRTA registration. Scores are ours, out of 10.`, `দাম ${b.priceAsOf} অনুযায়ী, BRTA রেজিস্ট্রেশনসহ। স্কোর আমাদের, ১০-এর মধ্যে।`)}{" "}
            <Link href="/method/" className="underline underline-offset-2">{tx("How we rate", "আমরা কীভাবে রেট করি")}</Link>
          </p>
        </section>
        <section>
          <h2 className={h2}>{tx("Why it wins", "কেন সেরা")}</h2>
          <List items={post.why} />
        </section>
        <section>
          <h2 className={h2}>{tx("Who it suits", "কার জন্য মানায়")}</h2>
          <List items={post.who} />
        </section>
        <section>
          <h2 className={h2}>{tx("Trade-offs", "যেখানে ছাড় দিতে হয়")}</h2>
          <List items={post.tradeoffs} />
        </section>
        <section>
          <h2 className={h2}>{tx("Check it yourself", "নিজে যাচাই করুন")}</h2>
          <ul className="mt-3 space-y-2 text-[15px]">
            <li><Link href={`/bikes/${b.id}/`} className="text-brand underline underline-offset-2">{tx(`${fullName(b)}: full specs, parts prices and owner reports`, `${fullName(b)}: পুরো স্পেক, পার্টসের দাম আর মালিকদের রিপোর্ট`)}</Link></li>
            <li><Link href={compareHref} className="text-brand underline underline-offset-2">{tx(`Compare with the ${fullName(rival)}`, `${fullName(rival)}-এর সাথে তুলনা`)}</Link></li>
            <li><Link href={`/cost/?bike=${b.id}`} className="text-brand underline underline-offset-2">{tx("What it really costs to own each month", "প্রতি মাসে আসলে কত খরচ")}</Link></li>
          </ul>
        </section>
        <p className="flex gap-2.5 rounded-xl bg-warn-soft px-4 py-3 text-[14px] leading-relaxed text-ink-2">
          <Info size={17} className="mt-0.5 shrink-0 text-warn" />
          <span>
            {tx(
              "Rankings come from our own scores and the quiz scorer, not a road test. Showroom prices move often: confirm the price and registration cost with the dealer before you pay.",
              "র‍্যাংকিং আমাদের নিজস্ব স্কোর আর কুইজের হিসাব থেকে, রোড টেস্ট থেকে নয়। শোরুমের দাম প্রায়ই বদলায়: টাকা দেওয়ার আগে ডিলারের কাছে দাম আর রেজিস্ট্রেশন খরচ মিলিয়ে নিন।",
            )}{" "}
            <Link href="/disclaimer/" className="underline underline-offset-2">{tx("Disclaimer", "দায়মুক্তি")}</Link>
          </span>
        </p>
        <section aria-labelledby="comments">
          <h2 id="comments" className={h2}>{tx("Comments", "মন্তব্য")} ({comments.length})</h2>
          {comments.length ? (
            <ul className="mt-4 space-y-4">
              {comments.map((c) => (
                <li key={`${c.date}-${c.name}-${c.text.slice(0, 20)}`} className="rounded-xl border border-line p-4">
                  <p className="text-[13px] text-muted"><span className="font-semibold text-ink">{c.name}</span> · {c.date}</p>
                  <p className="mt-1 whitespace-pre-line text-[15px] leading-relaxed text-ink-2">{c.text}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-[15px] text-muted">{tx("No comments yet. Own this bike or rode one? Tell others.", "এখনো কোনো মন্তব্য নেই। বাইকটি আপনার আছে বা চালিয়েছেন? অন্যদের জানান।")}</p>
          )}
          <h3 className="mt-6 text-[17px] font-semibold text-ink">{tx("Add a comment", "মন্তব্য লিখুন")}</h3>
          {FORM_ENDPOINT && (
            <p className="mt-1 text-[13.5px] text-muted">
              {tx(
                "We read each comment by hand before anything appears. We publish it with your name if it is about bikes and has no insults, phone numbers, or claims about a named person or showroom without proof. Your email is never shown. ",
                "কিছু দেখানোর আগে প্রতিটি মন্তব্য আমরা নিজে পড়ি। মন্তব্য বাইক নিয়ে হলে এবং তাতে গালি, ফোন নম্বর বা প্রমাণ ছাড়া কোনো ব্যক্তি বা শোরুমের বিরুদ্ধে অভিযোগ না থাকলে আপনার নামসহ প্রকাশ করি। আপনার ইমেইল কখনো দেখানো হয় না। ",
              )}
              <Link href="/privacy/" className="underline underline-offset-2">{tx("Privacy", "গোপনীয়তা")}</Link>
            </p>
          )}
          <div className="mt-4">
            <FeedbackForm kind="comment" post={{ slug, title: post.title[0] }} />
          </div>
        </section>
        <section>
          <h2 className={h2}>{tx(`More from week ${post.week}`, `সপ্তাহ ${post.week}-এর আরও`)}</h2>
          <ul className="mt-3 space-y-2 text-[15px]">
            {SPOTLIGHTS.filter((s) => s.week === post.week && s.slug !== slug).map((s) => (
              <li key={s.slug}>
                <Link href={`/spotlight/${s.slug}/`} className="text-brand underline underline-offset-2">{tx(...s.title)}</Link>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
