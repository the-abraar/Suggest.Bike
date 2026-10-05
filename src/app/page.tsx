"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowRight, BadgeCheck, Fuel, Gauge, ShieldCheck, Sparkles, Wallet, Wrench } from "lucide-react";
import { BIKES, BRANDS, CATEGORIES, PRICE_BANDS, formatBDT, formatLakh, fullName } from "@/lib/bikes";
import { matchBikes, DEFAULT_ANSWERS, encodeAnswers, type Use } from "@/lib/match";
import { popularPairs } from "@/lib/curated";
import { FUEL, ownershipCost, DEFAULT_COST_INPUT, registrationFor, emiMonthly } from "@/lib/cost";
import { useLang, useTx, L } from "@/lib/i18n";
import { BikeArt } from "@/components/BikeArt";
import { SearchBox } from "@/components/SearchBox";
import { BikeCard, SectionHead } from "@/components/ui";
import type { Category } from "@/lib/types";

const QUICK_USES: { id: Use; en: string; bn: string }[] = [
  { id: "commute", en: "Daily commute", bn: "প্রতিদিন যাতায়াত" },
  { id: "mixed", en: "City + highway", bn: "শহর + হাইওয়ে" },
  { id: "rideshare", en: "Pathao / Uber", bn: "পাঠাও / উবার" },
  { id: "fun", en: "Speed & style", bn: "স্পিড ও স্টাইল" },
  { id: "rough", en: "Rough roads", bn: "ভাঙা রাস্তা" },
];

export default function Home() {
  const { t, lang } = useLang();
  const tx = useTx();
  const onSale = BIKES.filter((b) => b.status === "on-sale");

  return (
    <>
      {/* ---------------- Hero ---------------- */}
      <section className="relative overflow-hidden">
        <div className="bg-grid pointer-events-none absolute inset-0 opacity-70" />
        <div className="container-x relative grid grid-cols-[minmax(0,1fr)] items-center gap-12 pb-16 pt-10 sm:pt-16 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:pb-24 lg:pt-20">
          <div className="animate-rise">
            <span className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1 text-[12.5px] font-medium text-ink-2 shadow-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-signal" />
              {t("home.kicker")}
            </span>
            <h1 className="mt-6 text-[40px] font-semibold leading-[1.04] tracking-[-0.035em] text-ink sm:text-[56px] lg:text-[64px]">
              {t("home.title1")}
              <br />
              <span className="text-brand">{t("home.title2")}</span>
            </h1>
            <p className="mt-5 max-w-xl text-[17px] leading-relaxed text-muted">{t("home.sub")}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/match/" className="btn-primary h-12 px-5 text-[15.5px]">
                <Sparkles size={18} />
                {t("home.cta")}
              </Link>
              <Link href="/bikes/" className="btn-secondary h-12 px-5 text-[15.5px]">
                {t("home.cta2")}
              </Link>
            </div>
            <div className="mt-8 max-w-xl">
              <SearchBox />
            </div>
          </div>
          <QuickPick />
        </div>
      </section>

      {/* ---------------- Trust strip ---------------- */}
      <section className="border-y border-line bg-surface">
        <div className="container-x grid grid-cols-2 gap-y-6 py-7 md:grid-cols-4">
          <TrustStat value={String(onSale.length)} label={<L en="bikes on sale, tracked" bn="টি বাইক বিক্রি হচ্ছে" />} />
          <TrustStat value={String(BRANDS.length)} label={<L en="brands in Bangladesh" bn="টি ব্র্যান্ড" />} />
          <TrustStat value={`৳${FUEL.octane}/L`} label={<L en={`octane price, ${monthName(FUEL.asOf)}`} bn="অকটেনের বর্তমান সরকারি দাম" />} />
          <TrustStat value="0" label={<L en="paid placements. Ever." bn="টি পেইড র‍্যাঙ্কিং। কখনো না।" />} />
        </div>
      </section>

      {/* ---------------- Budget bands ---------------- */}
      <section className="container-x mt-20">
        <SectionHead
          eyebrow={tx("Shop by budget", "বাজেট অনুযায়ী")}
          title={<L en="What can my money buy?" bn="আমার বাজেটে কী পাব?" />}
          sub={<L en="Ex-showroom prices. Add roughly ৳12–21k for BRTA registration." bn="শোরুম মূল্য। BRTA রেজিস্ট্রেশনের জন্য আরও ১২–২১ হাজার টাকা ধরুন।" />}
        />
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {PRICE_BANDS.map((band) => {
            const inBand = onSale.filter((b) => b.priceBDT >= band.min && b.priceBDT < band.max);
            const art = [...inBand].sort((a, b) => b.scores.resale + b.scores.reliability - (a.scores.resale + a.scores.reliability))[0];
            return (
              <Link
                key={band.id}
                href={`/bikes/?price=${band.id}`}
                className="group card flex flex-col p-4 transition-all hover:-translate-y-0.5 hover:border-line-strong hover:shadow-md sm:p-5"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-x-2">
                  <h3 className="text-[15px] font-semibold tracking-tight text-ink sm:text-[17px]">{lang === "bn" ? band.labelBn : band.label}</h3>
                  <span className="text-[13px] text-muted tnum">{tx(`${inBand.length} bikes`, `${inBand.length}টি বাইক`)}</span>
                </div>
                {art && <BikeArt bike={art} className="my-3 w-full transition-transform duration-300 group-hover:scale-[1.04]" />}
                <p className="mt-auto hidden text-[13px] text-muted sm:block">
                  {tx("e.g.", "যেমন")} {inBand.slice(0, 3).map((b) => b.model).join(", ")}
                </p>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ---------------- Why ---------------- */}
      <section className="container-x mt-24">
        <SectionHead
          eyebrow={tx("Why Suggest.Bike", "কেন Suggest.Bike")}
          title={<L en="The things showrooms won't tell you" bn="যে কথা শোরুম বলবে না" />}
          sub={
            <L
              en="Spec sheets are the same everywhere. What decides whether you'll love a bike in Bangladesh is everything after you ride it home."
              bn="স্পেক শিট সব জায়গায় একই। বাংলাদেশে একটা বাইক ভালো লাগবে কি না, সেটা ঠিক করে বাড়ি নিয়ে যাওয়ার পরের সবকিছু।"
            />
          }
        />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Why icon={<Fuel size={20} />} title={<L en="Real mileage" bn="আসল মাইলেজ" />}>
            <L en="Owner-reported kmpl in Dhaka traffic — not the brochure number." bn="ঢাকার জ্যামে মালিকদের পাওয়া মাইলেজ — ব্রোশিওরের নয়।" />
          </Why>
          <Why icon={<Wrench size={20} />} title={<L en="Mistri score" bn="মিস্ত্রি স্কোর" />}>
            <L en="Can the mechanic in your thana fix it, or is it dealer-only?" bn="আপনার এলাকার মিস্ত্রি পারবে, নাকি শুধু ডিলার?" />
          </Why>
          <Why icon={<Wallet size={20} />} title={<L en="Parts prices" bn="পার্টসের দাম" />}>
            <L en="Brake pads, chain sets, clutch plates — priced for every bike." bn="ব্রেক প্যাড, চেইন সেট, ক্লাচ প্লেট — প্রতিটা বাইকের দাম।" />
          </Why>
          <Why icon={<Gauge size={20} />} title={<L en="True monthly cost" bn="মাসিক আসল খরচ" />}>
            <L en="Fuel, service, wear, BRTA paperwork and resale — one honest number." bn="তেল, সার্ভিস, পার্টস, BRTA আর রিসেল — একটা সৎ সংখ্যা।" />
          </Why>
        </div>
      </section>

      {/* ---------------- Popular comparisons ---------------- */}
      <section className="container-x mt-24">
        <SectionHead
          eyebrow={tx("Head to head", "মুখোমুখি")}
          title={<L en="The debates everyone has" bn="যে তর্ক সবাই করে" />}
          action={
            <Link href="/compare/" className="btn-ghost text-brand">
              <L en="Build your own" bn="নিজে তুলনা করুন" /> <ArrowRight size={16} />
            </Link>
          }
        />
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {popularPairs().map(([a, b]) => (
            <Link
              key={a.id + b.id}
              href={`/compare/?bikes=${a.id},${b.id}`}
              className="group card overflow-hidden transition-all hover:-translate-y-0.5 hover:border-line-strong hover:shadow-md"
            >
              <div className="relative grid grid-cols-2 bg-surface-2/60 px-2 pt-3">
                <BikeArt bike={a} shadow={false} className="w-full" />
                <BikeArt bike={b} shadow={false} className="w-full -scale-x-100" />
                <span className="absolute left-1/2 top-1/2 grid h-8 w-8 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-line bg-surface text-[11px] font-bold text-muted shadow-sm">
                  VS
                </span>
              </div>
              <div className="flex items-center justify-between gap-2 p-3 sm:p-4">
                <p className="text-[13px] font-medium leading-snug text-ink sm:text-[14px]">
                  {a.model} <span className="text-faint">{tx("vs", "বনাম")}</span> {b.model}
                </p>
                <ArrowRight size={16} className="hidden shrink-0 text-faint transition-transform sm:block group-hover:translate-x-0.5 group-hover:text-brand" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ---------------- Categories ---------------- */}
      <section className="container-x mt-24">
        <SectionHead eyebrow={tx("Browse by style", "ধরন অনুযায়ী")} title={<L en="What kind of rider are you?" bn="আপনি কেমন রাইডার?" />} />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {(Object.keys(CATEGORIES) as Category[]).map((c) => {
            const list = BIKES.filter((b) => b.category === c);
            const sample = list.find((b) => b.status === "on-sale") ?? list[0];
            if (!sample) return null;
            return (
              <Link
                key={c}
                href={`/bikes/?cat=${c}`}
                className="group card flex flex-col p-4 transition-all hover:-translate-y-0.5 hover:border-line-strong hover:shadow-md"
              >
                <BikeArt bike={sample} shadow={false} className="w-full transition-transform duration-300 group-hover:scale-[1.05]" />
                <div className="mt-2 flex items-baseline justify-between">
                  <h3 className="text-[15.5px] font-semibold text-ink">
                    <L en={CATEGORIES[c].en} bn={CATEGORIES[c].bn} />
                  </h3>
                  <span className="text-[12.5px] text-muted tnum">{list.length}</span>
                </div>
                <p className="mt-1 text-[12.5px] leading-snug text-muted">{lang === "bn" ? CATEGORIES[c].blurbBn : CATEGORIES[c].blurb}</p>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ---------------- Guide teaser ---------------- */}
      <section className="container-x mt-24">
        <div className="card grid grid-cols-[minmax(0,1fr)] gap-10 overflow-hidden p-8 sm:p-10 lg:grid-cols-[1fr_1.2fr]">
          <div>
            <p className="eyebrow mb-3">{tx("Before you pay", "টাকা দেওয়ার আগে")}</p>
            <h2 className="text-[28px] font-semibold tracking-tight text-ink">
              <L en="The paperwork, decoded." bn="কাগজপত্র, সহজ ভাষায়।" />
            </h2>
            <p className="mt-3 text-[15.5px] leading-relaxed text-muted">
              <L
                en="BRTA registration, the 10-year tax token, smart licence fees, the 375cc rule, paying in EMI, and an 11-point checklist for buying used without getting cheated."
                bn="BRTA রেজিস্ট্রেশন, ১০ বছরের ট্যাক্স টোকেন, স্মার্ট লাইসেন্স ফি, ৩৭৫সিসি নিয়ম, কিস্তিতে কেনা, আর ঠকে না গিয়ে পুরনো বাইক কেনার ১১টি চেকলিস্ট।"
              />
            </p>
            <Link href="/guide/" className="btn-primary mt-6">
              <L en="Read the buyer's guide" bn="ক্রেতা গাইড পড়ুন" /> <ArrowRight size={16} />
            </Link>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <GuideFact k={formatBDT(registrationFor(150).totalBDT10yr)} v={<L en="Registration + 10-yr tax, 150cc" bn="রেজিস্ট্রেশন + ১০ বছর ট্যাক্স, ১৫০সিসি" />} href="/guide/#registration" />
            <GuideFact k="৳4,497" v={<L en="Smart driving licence (non-pro)" bn="স্মার্ট ড্রাইভিং লাইসেন্স" />} href="/guide/#licence" />
            <GuideFact k="375cc" v={<L en="Max for locally assembled bikes" bn="দেশে তৈরি বাইকের সর্বোচ্চ সিসি" />} href="/guide/#cc" />
            <GuideFact k="11" v={<L en="Checks before buying used" bn="পুরনো বাইক কেনার আগে চেক" />} href="/guide/#used" />
          </div>
        </div>
      </section>

      {/* ---------------- Top rated ---------------- */}
      <TopPicks />

      {/* ---------------- Final CTA ---------------- */}
      <section className="container-x mt-24">
        <div className="relative overflow-hidden rounded-3xl bg-brand px-8 py-14 text-center sm:px-16">
          <svg className="pointer-events-none absolute -right-16 -top-16 h-72 w-72 opacity-20" viewBox="0 0 100 100" aria-hidden>
            <circle cx="50" cy="50" r="50" fill="var(--signal)" />
          </svg>
          <h2 className="relative text-[30px] font-semibold tracking-tight text-brand-ink sm:text-[38px]">
            <L en="Still not sure? Answer 7 questions." bn="এখনো নিশ্চিত নন? ৭টি প্রশ্নের উত্তর দিন।" />
          </h2>
          <p className="relative mx-auto mt-3 max-w-lg text-[16px] text-brand-ink/80">
            <L en="We'll rank every bike in Bangladesh for you, and tell you why." bn="আমরা বাংলাদেশের সব বাইক আপনার জন্য র‍্যাঙ্ক করব, কারণসহ।" />
          </p>
          <Link href="/match/" className="btn relative mt-8 h-12 bg-surface px-6 text-ink shadow-lg hover:bg-surface-2">
            <Sparkles size={18} className="text-brand" /> {t("home.cta")}
          </Link>
        </div>
      </section>
    </>
  );
}

function monthName(iso: string) {
  return new Date(iso + "T00:00:00").toLocaleString("en", { month: "short", year: "numeric" });
}

/* Hero card: live, three-second recommendation */
function QuickPick() {
  const { lang } = useLang();
  const tx = useTx();
  const [budget, setBudget] = useState(250000);
  const [use, setUse] = useState<Use>("commute");
  const [scooter, setScooter] = useState(false);
  // Geared by default: most BD buyers mean a motorcycle; scooters are one tap away.
  const answers = { ...DEFAULT_ANSWERS, budget, use, gearless: scooter ? ("yes" as const) : ("no" as const) };
  const top = useMemo(() => matchBikes(answers, 3), [budget, use, scooter]); // eslint-disable-line react-hooks/exhaustive-deps
  const min = 100000;
  const max = 700000;
  const fill = ((budget - min) / (max - min)) * 100;

  return (
    <div className="card animate-rise p-5 shadow-lg sm:p-6" style={{ animationDelay: "120ms" }}>
      <div className="flex items-center justify-between">
        <p className="text-[14px] font-semibold text-ink">{tx("Quick pick", "দ্রুত সাজেশন")}</p>
        <span className="inline-flex items-center gap-1 text-[12px] font-medium text-good">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-good" /> {tx("Live", "লাইভ")}
        </span>
      </div>
      <div className="mt-4">
        <div className="flex items-baseline justify-between">
          <label htmlFor="qp-budget" className="text-[13px] text-muted">
            {tx("My budget", "আমার বাজেট")}
          </label>
          <span className="text-[22px] font-semibold tracking-tight text-ink tnum">{formatLakh(budget, lang)}</span>
        </div>
        <input
          id="qp-budget"
          type="range"
          className="range mt-1"
          min={min}
          max={max}
          step={5000}
          value={budget}
          style={{ ["--fill" as string]: `${fill}%` }}
          onChange={(e) => setBudget(Number(e.target.value))}
        />
        <p className="text-right text-[11.5px] text-faint tnum">
          {tx(`≈ ${formatBDT(emiMonthly(budget))}/mo on 12-month EMI`, `১২ মাসের কিস্তিতে ≈ ${formatBDT(emiMonthly(budget))}/মাস`)}
        </p>
      </div>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {QUICK_USES.map((u) => (
          <button key={u.id} className="chip" data-active={use === u.id} onClick={() => setUse(u.id)}>
            {lang === "bn" ? u.bn : u.en}
          </button>
        ))}
        <button className="chip" data-active={scooter} onClick={() => setScooter((x) => !x)} aria-pressed={scooter}>
          {tx("Scooter", "স্কুটার")}
        </button>
      </div>
      <div className="mt-5 space-y-2">
        {top.map((m, i) => {
          const monthly = ownershipCost(m.bike, { ...DEFAULT_COST_INPUT, includeDepreciation: false }).runningPerMonth;
          return (
            <Link
              key={m.bike.id}
              href={`/bikes/${m.bike.id}/`}
              className="group flex items-center gap-3 rounded-xl border border-transparent p-2 transition-colors hover:border-line hover:bg-surface-2"
            >
              <span className="w-5 text-center text-[13px] font-semibold text-faint tnum">{i + 1}</span>
              <span className="h-12 w-20 shrink-0">
                <BikeArt bike={m.bike} shadow={false} className="h-full w-full" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[14.5px] font-semibold text-ink">{fullName(m.bike)}</span>
                <span className="block truncate text-[12.5px] text-muted">{m.reasons[0]?.[lang]}</span>
              </span>
              <span className="text-right">
                <span className="block text-[14px] font-semibold text-ink tnum">{formatLakh(m.price, lang)}</span>
                <span className="block text-[11.5px] text-muted tnum">
                  ~{formatBDT(monthly)}
                  {tx("/mo to run", "/মাস চালাতে")}
                </span>
              </span>
            </Link>
          );
        })}
        {top.length === 0 && (
          <p className="py-6 text-center text-[14px] text-muted">
            {tx("Nothing new at this budget — try the full matcher, which includes used bikes.", "এই বাজেটে নতুন কিছু নেই — পুরো ম্যাচারে পুরনো বাইকও দেখুন।")}
          </p>
        )}
      </div>
      <Link
        href={`/match/?${encodeAnswers(answers)}`}
        className="mt-4 flex items-center justify-center gap-1.5 rounded-xl bg-surface-2 py-2.5 text-[13.5px] font-medium text-ink-2 transition-colors hover:bg-surface-3"
      >
        {tx("Refine with a few more questions", "আরও কয়েকটি প্রশ্নে ঠিক করুন")} <ArrowRight size={15} />
      </Link>
    </div>
  );
}

function TrustStat({ value, label }: { value: string; label: React.ReactNode }) {
  return (
    <div className="px-2">
      <p className="text-[26px] font-semibold tracking-tight text-ink tnum">{value}</p>
      <p className="text-[13.5px] text-muted">{label}</p>
    </div>
  );
}

function Why({ icon, title, children }: { icon: React.ReactNode; title: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="card p-6">
      <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-soft text-brand">{icon}</span>
      <h3 className="mt-4 text-[16.5px] font-semibold text-ink">{title}</h3>
      <p className="mt-1.5 text-[14.5px] leading-relaxed text-muted">{children}</p>
    </div>
  );
}

function GuideFact({ k, v, href }: { k: string; v: React.ReactNode; href: string }) {
  return (
    <Link href={href} className="group rounded-2xl border border-line bg-surface-2/60 p-5 transition-colors hover:border-line-strong hover:bg-surface-2">
      <p className="text-[24px] font-semibold tracking-tight text-ink tnum">{k}</p>
      <p className="mt-1 text-[13.5px] text-muted">{v}</p>
    </Link>
  );
}

function TopPicks() {
  const { lang } = useLang();
  const tx = useTx();
  const picks = [
    { id: "hero-splendor-plus", badge: "Cheapest to run", badgeBn: "চালাতে সবচেয়ে সস্তা" },
    { id: "bajaj-pulsar-n160", badge: "Best all-rounder", badgeBn: "সেরা অলরাউন্ডার" },
    { id: "yamaha-fzs-fi-v4", badge: "Safest resale", badgeBn: "রিসেলে সবচেয়ে নিরাপদ" },
    { id: "royal-enfield-hunter-350", badge: "Most character", badgeBn: "সবচেয়ে বেশি চরিত্র" },
  ]
    .map((p) => ({ ...p, bike: BIKES.find((b) => b.id === p.id) }))
    .filter((p) => p.bike);
  return (
    <section className="container-x mt-24">
      <SectionHead
        eyebrow={tx("Editor's shortlist", "আমাদের বাছাই")}
        title={<L en="If you made us choose" bn="আমাদের পছন্দ" />}
        action={
          <Link href="/bikes/" className="btn-ghost text-brand">
            <L en="See all bikes" bn="সব বাইক" /> <ArrowRight size={16} />
          </Link>
        }
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {picks.map((p) => (
          <BikeCard
            key={p.id}
            bike={p.bike!}
            badge={
              <span className="inline-flex items-center gap-1 rounded-full bg-brand px-2 py-0.5 text-[11.5px] font-semibold text-brand-ink">
                {p.badge === "Safest resale" ? <ShieldCheck size={12} /> : <BadgeCheck size={12} />}
                {lang === "bn" ? p.badgeBn : p.badge}
              </span>
            }
          />
        ))}
      </div>
    </section>
  );
}
