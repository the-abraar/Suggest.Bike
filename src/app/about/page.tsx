import type { Metadata } from "next";
import Link from "next/link";
import { SCORE_LABELS } from "@/lib/bikes";
import type { ScoreKey } from "@/lib/types";

export const metadata: Metadata = {
  title: "How we rate bikes",
  description: "How Suggest.Bike scores motorcycles for Bangladesh, where prices come from, and how the matchmaker works.",
};

export default function AboutPage() {
  return (
    <div className="container-x max-w-3xl pt-12">
      <p className="eyebrow">About</p>
      <h1 className="mt-2 text-[32px] font-semibold leading-tight tracking-[-0.03em] text-ink sm:text-[44px]">How we rate bikes</h1>
      <div className="mt-6 space-y-5 text-[16px] leading-relaxed text-ink-2">
        <p>
          Suggest.Bike exists because buying a bike in Bangladesh means asking ten people and getting eleven answers. Brochures tell you peak power; nobody tells you whether the mechanic in your
          thana has seen the engine before, or what a chain set costs in Bangshal.
        </p>
        <p>
          <strong className="text-ink">Prices</strong> are ex-showroom figures from official distributors and BikeBD. Each bike page shows the month we last checked and a link to the
          source. Showrooms run offers constantly — always confirm before paying.
        </p>
        <p>
          <strong className="text-ink">Mileage</strong> is the real-world range owners report in mixed Bangladeshi traffic, not the brand&apos;s claimed figure.
        </p>
        <p>
          <strong className="text-ink">Ownership scores</strong> are editorial, 1–10, built from owner reviews, Bangladeshi motorcycle sites and riding communities:
        </p>
      </div>
      <dl className="mt-6 overflow-hidden rounded-2xl border border-line bg-surface">
        {(Object.keys(SCORE_LABELS) as ScoreKey[]).map((k, i) => (
          <div key={k} className={`grid grid-cols-[180px_1fr] gap-4 px-4 py-3 text-[14.5px] ${i % 2 ? "bg-surface-2/40" : ""}`}>
            <dt className="font-medium text-ink">{SCORE_LABELS[k].en}</dt>
            <dd className="text-muted">{SCORE_LABELS[k].hint}</dd>
          </div>
        ))}
      </dl>
      <div className="mt-8 space-y-5 text-[16px] leading-relaxed text-ink-2">
        <p>
          <strong className="text-ink">The matchmaker</strong> filters by your budget, gearbox preference and new/used, then weights those scores by how you&apos;ll ride — commuters get city handling
          and mileage, highway riders get stability and comfort, Pathao riders get running cost and durability — and penalises seats too tall for your height or bikes too much for a first-timer.
        </p>
        <p>
          <strong className="text-ink">No one pays for placement.</strong> There are no sponsored rankings and no affiliate deals with dealers.
        </p>
        <p>
          Spotted a wrong price or spec? That&apos;s the fastest way to make this better for everyone — tell us and we&apos;ll fix it.
        </p>
      </div>
      <Link href="/match/" className="btn-primary mt-10">
        Try the matchmaker
      </Link>
    </div>
  );
}
