"use client";

import Link from "next/link";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ArrowRight, Bike, CalendarClock, CreditCard, Download, Info, Landmark, PiggyBank, Wallet } from "lucide-react";
import { BIKES, formatBDT, formatLakh, fullName, getBike } from "@/lib/bikes";
import { DEFAULT_COST_INPUT, defaultUsedPrice, ownershipCost } from "@/lib/cost";
import { fmtDuration, fmtMonthFromNow, fmtPct, fundPaths, monthsToGoal, progress, tierLine, type PathKey, type PathResult } from "@/lib/fund";
import { useLang, useTx } from "@/lib/i18n";
import { BikeArt } from "@/components/BikeArt";
import { BikePicker, Field, MoneyInput, Range, Segmented } from "@/components/form";
import { ShareButton } from "@/components/ui";
import { HERO, POSTER, drawHero, drawPoster, loadFonts, readTheme, svgToImage } from "@/components/fund/loader";
import type { BikeLite } from "@/lib/types";

export function FundView() {
  return (
    <Suspense>
      <Fund />
    </Suspense>
  );
}

const TIERS: [number, { en: string; bn: string }][] = [
  [0, { en: "Booting up the dream…", bn: "স্বপ্ন চালু হচ্ছে…" }],
  [0.1, { en: "Wheels downloaded 🛞", bn: "চাকা ডাউনলোড হয়েছে 🛞" }],
  [0.25, { en: "Engine installed ⚙️", bn: "ইঞ্জিন বসানো হয়েছে ⚙️" }],
  [0.5, { en: "Halfway! Tank and seat fitted ⛽", bn: "অর্ধেক পথ! ট্যাংক আর সিট লাগানো ⛽" }],
  [0.75, { en: "Paint job and polish ✨", bn: "রং আর পালিশ চলছে ✨" }],
  [0.9, { en: "Almost there — testing the horn 📯", bn: "প্রায় শেষ — হর্ন টেস্ট চলছে 📯" }],
  [1, { en: "Ready to ride! 🎉", bn: "চালানোর জন্য প্রস্তুত! 🎉" }],
];

/** Illustrative only, for the "what if it earned interest" tip; the user's own rate goes in the slider. */
const EXAMPLE_SAVINGS_PCT = 7;

const num = (v: string | null, fallback: number) => {
  const n = Number(v);
  return v !== null && v !== "" && Number.isFinite(n) && n >= 0 ? n : fallback;
};

function Fund() {
  const params = useSearchParams();
  const { lang } = useLang();
  const tx = useTx();

  const [bike, setBike] = useState<BikeLite>(() => getBike("bajaj-pulsar-n160") ?? BIKES[0]);
  const [used, setUsed] = useState(false);
  const [saved, setSaved] = useState(40000);
  const [monthly, setMonthly] = useState(8000);
  const [savingsPct, setSavingsPct] = useState(0);
  const [transportNow, setTransportNow] = useState(0);
  const [cardMonths, setCardMonths] = useState(12);
  const [feePct, setFeePct] = useState(0);
  const [loanDownPct, setLoanDownPct] = useState(30);
  const [loanPct, setLoanPct] = useState(14);
  const [loanMonths, setLoanMonths] = useState(24);

  // Restore a shared link once on load; until then, don't overwrite the URL with defaults.
  const [restored, setRestored] = useState(false);
  useEffect(() => {
    if (restored) return;
    const b = getBike(params.get("bike") || "");
    if (b) setBike(b);
    if (params.get("used") === "1") setUsed(true);
    setSaved((x) => num(params.get("saved"), x));
    setMonthly((x) => num(params.get("monthly"), x));
    setRestored(true);
  }, [params, restored]);

  // Keep the URL shareable without adding history entries.
  useEffect(() => {
    if (!restored) return;
    const q = new URLSearchParams({ bike: bike.id, saved: String(saved), monthly: String(monthly) });
    if (used) q.set("used", "1");
    window.history.replaceState(null, "", `?${q}`);
  }, [restored, bike, saved, monthly, used]);

  const usedOnly = bike.status === "used-only";
  const buyingUsed = used || usedOnly;
  const own = useMemo(() => ownershipCost(bike, { ...DEFAULT_COST_INPUT, used: buyingUsed }), [bike, buyingUsed]);
  const price = buyingUsed ? defaultUsedPrice(bike) : bike.priceBDT;
  const brta = own.onRoad - own.price;
  const target = price + brta;
  const pct = progress(saved, target);
  const left = Math.max(0, target - saved);

  const paths = useMemo(
    () =>
      fundPaths({
        price,
        brta,
        saved,
        monthly,
        savingsPct,
        cardMonths,
        feePct,
        loanDownPct,
        loanPct,
        loanMonths,
        runningPerMonth: own.runningPerMonth,
        transportNow,
      }),
    [price, brta, saved, monthly, savingsPct, cardMonths, feePct, loanDownPct, loanPct, loanMonths, own.runningPerMonth, transportNow],
  );
  const eta = paths.cash.rideIn;
  const etaText = eta === null ? tx("Start saving!", "জমানো শুরু করুন!") : eta === 0 ? tx("Done! 🎉", "সম্পূর্ণ! 🎉") : fmtDuration(eta, lang);
  const tier = tierLine(pct, TIERS);

  return (
    <div className="container-x pt-10">
      <h1 className="text-[32px] font-semibold tracking-[-0.03em] text-ink sm:text-[40px]">{tx("How close is your next bike?", "পরের বাইক থেকে আপনি কত দূরে?")}</h1>
      <p className="mt-1.5 max-w-2xl text-[15.5px] text-muted">
        {tx(
          "Watch your bike download as you save. See when you can ride it home, whether a card EMI or a loan gets you there sooner, and exactly what that costs.",
          "জমানোর সাথে সাথে আপনার বাইক ডাউনলোড হতে দেখুন। কবে বাড়ি নিয়ে যেতে পারবেন, কার্ড কিস্তি বা লোনে আগে পাবেন কিনা, আর তাতে ঠিক কত খরচ — সব এক জায়গায়।",
        )}
      </p>

      <div className="mt-10 grid grid-cols-[minmax(0,1fr)] gap-8 lg:grid-cols-[380px_minmax(0,1fr)]">
        {/* inputs */}
        <div className="card h-fit space-y-7 p-6 lg:sticky lg:top-24">
          <BikePicker bike={bike} onPick={setBike} />

          {!usedOnly && (
            <Field label={tx("Buying", "কিনছেন")}>
              <Segmented
                options={[
                  { v: false, label: tx("New", "নতুন") },
                  { v: true, label: tx("Used", "পুরনো") },
                ]}
                value={used}
                onChange={setUsed}
              />
            </Field>
          )}

          <Field label={tx("Saved so far", "এ পর্যন্ত জমেছে")} value={formatBDT(saved)}>
            <MoneyInput value={saved} onChange={setSaved} label={tx("Saved so far in taka", "এ পর্যন্ত জমানো টাকা")} />
          </Field>

          <Field label={tx("You can save each month", "মাসে জমাতে পারবেন")} value={formatBDT(monthly)}>
            <Range min={0} max={50000} step={500} value={Math.min(monthly, 50000)} onChange={setMonthly} label={tx("Saving per month", "মাসিক সঞ্চয়")} />
            <p className="mt-1 text-[12px] text-faint">{tx("Be honest — what's left after rent, food and family.", "সৎ থাকুন — ভাড়া, খাবার আর পরিবারের খরচের পর যা থাকে।")}</p>
          </Field>

          <Field label={tx("You spend on getting around now", "এখন যাতায়াতে খরচ")} value={`${formatBDT(transportNow)}${tx("/mo", "/মাস")}`}>
            <Range min={0} max={15000} step={250} value={transportNow} onChange={setTransportNow} label={tx("Current transport spend per month", "এখন মাসে যাতায়াত খরচ")} />
            <p className="mt-1 text-[12px] text-faint">{tx("Rickshaw, CNG, bus, Pathao/Uber. The bike replaces most of it.", "রিকশা, সিএনজি, বাস, পাঠাও/উবার। বাইক এর বেশিরভাগটা বাঁচাবে।")}</p>
          </Field>

          <Field label={tx("Interest on your savings", "সঞ্চয়ে সুদ")} value={`${savingsPct}%`}>
            <Range min={0} max={12} step={0.5} value={savingsPct} onChange={setSavingsPct} label={tx("Savings interest per year", "বছরে সঞ্চয়ের সুদ")} />
            <p className="mt-1 text-[12px] text-faint">{tx("A DPS or savings account. Leave 0 if it sits in cash or bKash.", "DPS বা সেভিংস অ্যাকাউন্ট। নগদ বা বিকাশে রাখলে 0 রাখুন।")}</p>
          </Field>
        </div>

        {/* output */}
        <div className="min-w-0 space-y-6">
          <LoaderCard bike={bike} pct={pct} saved={saved} target={target} left={left} eta={eta} etaText={etaText} tier={tx(tier.en, tier.bn)} />

          <p className="text-[13px] text-muted">
            {tx("Goal", "লক্ষ্য")}: <span className="font-medium text-ink-2 tnum">{formatBDT(price)}</span> {buyingUsed ? tx("typical used price", "সাধারণ পুরনো দাম") : tx("ex-showroom", "শোরুম মূল্য")}
            {brta > 0 && (
              <>
                {" + "}
                <span className="font-medium text-ink-2 tnum">{formatBDT(brta)}</span> {tx("BRTA registration (10-year tax token)", "BRTA রেজিস্ট্রেশন (১০ বছরের ট্যাক্স টোকেন)")}
              </>
            )}
            {" · "}
            <Link href={`/bikes/${bike.id}/`} className="text-brand hover:underline">
              {tx("Bike details", "বাইকের বিস্তারিত")}
            </Link>
          </p>

          <Paths
            paths={paths}
            monthly={monthly}
            transportNow={transportNow}
            running={own.runningPerMonth}
            buyingUsed={buyingUsed}
            terms={{ cardMonths, setCardMonths, feePct, setFeePct, loanDownPct, setLoanDownPct, loanPct, setLoanPct, loanMonths, setLoanMonths }}
          />

          <SpeedUps bike={bike} buyingUsed={buyingUsed} saved={saved} monthly={monthly} savingsPct={savingsPct} target={target} eta={eta} running={own.runningPerMonth} transportNow={transportNow} />

          <Habits />

          <p className="flex gap-2 text-[12.5px] leading-relaxed text-faint">
            <Info size={14} className="mt-0.5 shrink-0" />
            <span>
              {tx(
                `Prices are ex-showroom (or a typical ~3-year-old asking price when buying used). Running costs come from our ownership model at ${DEFAULT_COST_INPUT.kmPerDay} km a day: fuel, servicing, wear parts and washing/parking. Card EMI is the plain split of the price; loan instalments use a reducing balance. Loan rate, down payment and fees are example terms — banks and dealers differ, so ask for the total payable in writing. Nothing here is financial advice.`,
                `দাম শোরুম মূল্য (পুরনো কিনলে ~৩ বছরের পুরনো একটার সাধারণ চাওয়া দাম)। চালানোর খরচ আমাদের মালিকানা হিসাব থেকে, দিনে ${DEFAULT_COST_INPUT.kmPerDay} km ধরে: তেল, সার্ভিসিং, ক্ষয়যোগ্য পার্টস আর ধোয়া/পার্কিং। কার্ড কিস্তি মানে দামকে সমান ভাগ; লোনের কিস্তি রিডিউসিং ব্যালান্সে। লোনের সুদ, ডাউন পেমেন্ট আর ফি উদাহরণ মাত্র — ব্যাংক ও ডিলারভেদে আলাদা, তাই মোট কত দিতে হবে লিখিতভাবে নিন। এটা আর্থিক পরামর্শ নয়।`,
              )}{" "}
              <Link href="/guide/#emi" className="text-brand hover:underline">
                {tx("How EMI works", "কিস্তি কীভাবে কাজ করে")}
              </Link>
              {" · "}
              <Link href={`/cost/?bike=${bike.id}${buyingUsed && !usedOnly ? "&used=1" : ""}`} className="text-brand hover:underline">
                {tx("Full running cost", "চালানোর পুরো খরচ")}
              </Link>
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- the loader

function LoaderCard({ bike, pct, saved, target, left, eta, etaText, tier }: { bike: BikeLite; pct: number; saved: number; target: number; left: number; eta: number | null; etaText: string; tier: string }) {
  const { lang } = useLang();
  const tx = useTx();
  const artRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [img, setImg] = useState<HTMLImageElement | null>(null);
  const [themeKey, setThemeKey] = useState(0);
  const [shown, setShown] = useState(0);

  // Redraw when the site theme flips, since the canvas reads the CSS colours.
  useEffect(() => {
    const mo = new MutationObserver(() => setThemeKey((k) => k + 1));
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => mo.disconnect();
  }, []);

  useEffect(() => {
    const svg = artRef.current?.querySelector("svg");
    if (!svg) return;
    let live = true;
    svgToImage(svg)
      .then((i) => live && setImg(i))
      .catch(() => live && setImg(null));
    return () => {
      live = false;
    };
  }, [bike.id, themeKey]);

  // Ease the bar towards the new value, like a download catching up.
  const shownRef = useRef(0);
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    const tick = () => {
      const s = shownRef.current;
      const next = reduced || Math.abs(pct - s) < 0.001 ? pct : s + (pct - s) * 0.14;
      shownRef.current = next;
      setShown(next);
      if (next !== pct) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [pct]);

  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    if (c.width !== HERO.W * dpr) {
      c.width = HERO.W * dpr;
      c.height = HERO.H * dpr;
    }
    const ctx = c.getContext("2d");
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    drawHero(ctx, img, shown, readTheme());
  }, [img, shown, themeKey]);

  const done = pct >= 1;
  const statLabelEta = eta ? tx(`Ready · ${fmtMonthFromNow(eta, "en")}`, `প্রস্তুত · ${fmtMonthFromNow(eta, "bn")}`) : tx("Ready in", "প্রস্তুত");

  const downloadPoster = async () => {
    await loadFonts();
    const c = document.createElement("canvas");
    c.width = POSTER.W;
    c.height = POSTER.H;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    drawPoster(ctx, {
      img,
      pct,
      theme: readTheme(),
      eyebrow: tx("Bike fund · loading", "বাইক ফান্ড · লোড হচ্ছে"),
      title: fullName(bike),
      subtitle: tx("Downloading, one taka at a time", "টাকায় টাকায় ডাউনলোড হচ্ছে"),
      loading: done ? tx("DOWNLOAD COMPLETE", "ডাউনলোড সম্পূর্ণ") : tx("LOADING…", "লোড হচ্ছে…"),
      pctLabel: fmtPct(pct),
      amounts: `${formatLakh(saved, lang)} / ${formatLakh(target, lang)}`,
      tier,
      stats: [
        { label: tx("Saved", "জমেছে"), value: formatLakh(saved, lang) },
        { label: tx("To go", "বাকি"), value: formatLakh(left, lang) },
        { label: statLabelEta, value: etaText, highlight: true },
      ],
      mark: "suggest.bike/fund",
    });
    c.toBlob((blob) => {
      if (!blob) return;
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `bike-fund-${bike.id}.png`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 2000);
    }, "image/png");
  };

  return (
    <div className="card overflow-hidden p-6 sm:p-8">
      <div ref={artRef} hidden aria-hidden>
        <BikeArt bike={bike} shadow={false} />
      </div>
      <p className={`text-center text-[12px] font-medium text-brand ${lang === "bn" ? "" : "font-mono uppercase tracking-[0.14em]"}`}>{tx("Dream loader · v1.0", "স্বপ্ন লোড হচ্ছে · v1.0")}</p>
      <p className="mt-1 text-center text-[22px] font-semibold tracking-tight text-ink sm:text-[26px]">{fullName(bike)}</p>

      <canvas
        ref={canvasRef}
        className="mt-4 block h-auto w-full"
        style={{ aspectRatio: `${HERO.W} / ${HERO.H}` }}
        role="img"
        aria-label={tx(`${fullName(bike)}: ${fmtPct(pct)} saved`, `${fullName(bike)}: ${fmtPct(pct)} জমেছে`)}
      />

      <div className="mt-4 flex items-end justify-between gap-4">
        <div className="min-w-0">
          <p className={`text-[13px] font-medium text-muted ${lang === "bn" ? "" : "font-mono tracking-wide"}`}>{done ? tx("DOWNLOAD COMPLETE", "ডাউনলোড সম্পূর্ণ") : tx("LOADING…", "লোড হচ্ছে…")}</p>
          <p className="mt-1 font-mono text-[13px] text-muted tnum">
            {formatLakh(saved, lang)} / {formatLakh(target, lang)}
          </p>
        </div>
        <p className="text-[56px] font-semibold leading-none tracking-[-0.04em] text-brand tnum sm:text-[72px]">{fmtPct(pct)}</p>
      </div>
      <p className="mt-3 text-right text-[15px] font-semibold text-ink">{tier}</p>

      <div className="mt-5 grid grid-cols-3 gap-2 sm:gap-3">
        <Stat label={tx("Saved", "জমেছে")} value={formatLakh(saved, lang)} />
        <Stat label={tx("To go", "বাকি")} value={formatLakh(left, lang)} />
        <Stat label={statLabelEta} value={etaText} highlight />
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        <button onClick={downloadPoster} className="inline-flex h-10 items-center gap-1.5 rounded-lg bg-brand px-3.5 text-[14px] font-medium text-brand-ink hover:bg-brand-strong">
          <Download size={16} />
          {tx("Download poster", "পোস্টার ডাউনলোড")}
        </button>
        <ShareButton title={tx(`My ${fullName(bike)} fund`, `আমার ${fullName(bike)} ফান্ড`)} text={tx(`${fmtPct(pct)} of the way to my ${fullName(bike)}`, `আমার ${fullName(bike)}-এর ${fmtPct(pct)} পথ পেরিয়েছি`)} />
      </div>
    </div>
  );
}

function Stat({ label, value, highlight = false }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={`rounded-xl px-2 py-3 text-center sm:px-3 ${highlight ? "bg-brand text-brand-ink" : "bg-surface-2"}`}>
      <p className={`truncate font-mono text-[10.5px] font-medium uppercase tracking-wide sm:text-[11.5px] ${highlight ? "opacity-85" : "text-muted"}`}>{label}</p>
      <p className={`mt-1 truncate text-[16px] font-semibold tracking-tight tnum sm:text-[20px] ${highlight ? "" : "text-ink"}`}>{value}</p>
    </div>
  );
}

// ---------------------------------------------------------------- ways to pay

type Terms = {
  cardMonths: number;
  setCardMonths: (v: number) => void;
  feePct: number;
  setFeePct: (v: number) => void;
  loanDownPct: number;
  setLoanDownPct: (v: number) => void;
  loanPct: number;
  setLoanPct: (v: number) => void;
  loanMonths: number;
  setLoanMonths: (v: number) => void;
};

const PATH_META: Record<PathKey, { icon: React.ReactNode; en: string; bn: string; subEn: string; subBn: string }> = {
  cash: { icon: <Wallet size={18} />, en: "Save, then pay cash", bn: "জমিয়ে নগদে কিনুন", subEn: "Cheapest. Best cash-price bargaining.", subBn: "সবচেয়ে সস্তা। নগদে দরদাম ভালো হয়।" },
  card: { icon: <CreditCard size={18} />, en: "0% credit-card EMI", bn: "০% ক্রেডিট কার্ড কিস্তি", subEn: "Needs a partner-bank card with enough limit.", subBn: "পর্যাপ্ত লিমিটসহ পার্টনার ব্যাংকের কার্ড লাগবে।" },
  loan: { icon: <Landmark size={18} />, en: "Bank or dealer loan", bn: "ব্যাংক বা ডিলার লোন", subEn: "Down payment now, interest on the rest.", subBn: "এখন ডাউন পেমেন্ট, বাকিটায় সুদ।" },
};

function Paths({ paths, monthly, transportNow, running, buyingUsed, terms }: { paths: Record<PathKey, PathResult>; monthly: number; transportNow: number; running: number; buyingUsed: boolean; terms: Terms }) {
  const { lang } = useLang();
  const tx = useTx();
  const keys: PathKey[] = buyingUsed ? ["cash", "loan"] : ["cash", "card", "loan"];
  const verdict = recommend(paths, buyingUsed, monthly, lang);

  const when = (m: number | null) => (m === null ? tx("Not at this rate", "এই হারে নয়") : m === 0 ? tx("Today", "আজই") : `${fmtDuration(m, lang)} · ${fmtMonthFromNow(m, lang)}`);
  const fitLabel = { fits: tx("Fits your budget", "বাজেটে আঁটে"), tight: tx("Tight", "টানাটানি"), over: tx("Over budget", "বাজেটের বাইরে") };
  const fitClass = { fits: "bg-good-soft text-good", tight: "bg-warn-soft text-warn", over: "bg-signal-soft text-signal" };

  return (
    <section className="space-y-4" aria-labelledby="paths-h">
      <div>
        <h2 id="paths-h" className="text-[20px] font-semibold tracking-tight text-ink">
          {tx("Ways to get it home", "বাড়ি আনার উপায়")}
        </h2>
        <p className="mt-1 text-[14.5px] leading-relaxed text-ink-2">{verdict}</p>
      </div>

      <div className={`grid gap-4 ${keys.length === 3 ? "xl:grid-cols-3" : "md:grid-cols-2"}`}>
        {keys.map((k) => {
          const p = paths[k];
          const m = PATH_META[k];
          return (
            <div key={k} className="card flex flex-col p-5">
              <div className="flex items-center gap-2 text-brand">
                {m.icon}
                <h3 className="text-[15.5px] font-semibold text-ink">{tx(m.en, m.bn)}</h3>
              </div>
              <p className="mt-0.5 text-[12.5px] text-faint">{tx(m.subEn, m.subBn)}</p>

              <dl className="mt-4 space-y-2.5 text-[14px]">
                <Row k={tx("Ride home", "বাড়ি আনবেন")} v={when(p.rideIn)} strong />
                <Row k={tx("Cash needed first", "শুরুতে নগদ লাগবে")} v={formatBDT(p.upfront)} />
                {p.emi > 0 && <Row k={tx(`Then ${p.emiMonths} months of`, `তারপর ${p.emiMonths} মাস`)} v={`${formatBDT(p.emi)}${tx("/mo", "/মাস")}`} />}
                <Row k={tx("Extra you pay", "বাড়তি খরচ")} v={p.extra > 0 ? formatBDT(p.extra) : tx("Nothing", "কিছু না")} tone={p.extra > 0 ? "bad" : "good"} />
                <Row k={tx("Total", "মোট")} v={formatBDT(p.total)} />
              </dl>

              {k !== "cash" && (
                <div className="mt-4 border-t border-line pt-4">
                  <span className={`inline-block rounded-full px-2 py-0.5 text-[11.5px] font-semibold ${fitClass[p.fit]}`}>{fitLabel[p.fit]}</span>
                  <p className="mt-1.5 text-[12.5px] leading-snug text-muted">
                    {tx(
                      `Instalment + ${formatBDT(running)} running cost${transportNow ? ` − ${formatBDT(transportNow)} you no longer spend on transport` : ""} = ${formatBDT(p.monthlyAfter)}/mo, against the ${formatBDT(monthly + transportNow)} you have.`,
                      `কিস্তি + ${formatBDT(running)} চালানোর খরচ${transportNow ? ` − ${formatBDT(transportNow)} যাতায়াত খরচ যা আর লাগবে না` : ""} = মাসে ${formatBDT(p.monthlyAfter)}, আপনার হাতে ${formatBDT(monthly + transportNow)}।`,
                    )}
                  </p>
                </div>
              )}

              <div className="mt-auto pt-4">
                {k === "card" && (
                  <Field label={tx("EMI length", "কিস্তির মেয়াদ")}>
                    <Segmented
                      options={[3, 6, 12].map((n) => ({ v: n, label: tx(`${n} mo`, `${n} মাস`) }))}
                      value={terms.cardMonths}
                      onChange={terms.setCardMonths}
                    />
                  </Field>
                )}
                {k === "loan" && (
                  <div className="space-y-4">
                    <Field label={tx("Down payment", "ডাউন পেমেন্ট")} value={`${terms.loanDownPct}%`}>
                      <Range min={10} max={70} step={5} value={terms.loanDownPct} onChange={terms.setLoanDownPct} label={tx("Down payment percent", "ডাউন পেমেন্ট শতাংশ")} />
                    </Field>
                    <Field label={tx("Interest rate", "সুদের হার")} value={`${terms.loanPct}%`}>
                      <Range min={0} max={30} step={0.5} value={terms.loanPct} onChange={terms.setLoanPct} label={tx("Annual interest rate", "বার্ষিক সুদের হার")} />
                    </Field>
                    <Field label={tx("Loan length", "লোনের মেয়াদ")}>
                      <Segmented
                        options={[12, 24, 36].map((n) => ({ v: n, label: tx(`${n} mo`, `${n} মাস`) }))}
                        value={terms.loanMonths}
                        onChange={terms.setLoanMonths}
                      />
                    </Field>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {(keys.includes("card") || keys.includes("loan")) && (
        <div className="card p-5">
          <Field label={tx("Processing fee (card or loan)", "প্রসেসিং ফি (কার্ড বা লোন)")} value={`${terms.feePct}%`}>
            <Range min={0} max={5} step={0.25} value={terms.feePct} onChange={terms.setFeePct} label={tx("Processing fee percent", "প্রসেসিং ফি শতাংশ")} />
          </Field>
          <p className="mt-1 text-[12px] text-faint">
            {tx(
              "Some banks charge a fee on EMI conversions and loans, and some showrooms drop their cash discount for EMI buyers. Ask for both prices.",
              "কিছু ব্যাংক EMI বা লোনে ফি নেয়, আর কিছু শোরুম কিস্তিতে কিনলে নগদ ছাড় দেয় না। দুইভাবেই দাম জিজ্ঞেস করুন।",
            )}
          </p>
        </div>
      )}
    </section>
  );
}

function Row({ k, v, strong = false, tone }: { k: string; v: string; strong?: boolean; tone?: "good" | "bad" }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className="text-muted">{k}</dt>
      <dd className={`text-right tnum ${strong ? "font-semibold text-ink" : "font-medium text-ink-2"} ${tone === "bad" ? "!text-signal" : tone === "good" ? "!text-good" : ""}`}>{v}</dd>
    </div>
  );
}

/** One plain-language recommendation from the three paths. */
function recommend(paths: Record<PathKey, PathResult>, buyingUsed: boolean, monthly: number, lang: "en" | "bn"): string {
  const t = (en: string, bn: string) => (lang === "bn" ? bn : en);
  const { cash, card, loan } = paths;
  if (cash.rideIn === 0) return t("You already have enough. Pay cash, and ask the showroom for a cash discount.", "আপনার কাছে যথেষ্ট আছে। নগদে কিনুন, আর শোরুমে নগদ ছাড় চান।");
  if (monthly <= 0) return t("Set a monthly saving amount to see when each option gets you riding.", "প্রতি মাসে কত জমাবেন দিন, তাহলে প্রতিটা উপায়ে কবে পাবেন দেখাবে।");
  const cashM = cash.rideIn ?? Infinity;
  if (cashM <= 3) return t(`Just keep saving — cash gets you there in ${fmtDuration(cashM, lang)} with nothing extra to pay.`, `জমাতে থাকুন — ${fmtDuration(cashM, lang)} পরেই নগদে পাবেন, বাড়তি এক টাকাও লাগবে না।`);
  if (!buyingUsed && card.fit === "fits" && card.rideIn !== null && card.rideIn < cashM) {
    return t(
      `With a credit card that qualifies, 0% EMI puts you on the bike ${fmtDuration(cashM - card.rideIn, lang)} sooner${card.extra ? ` for ${formatBDT(card.extra)} in fees` : " at no extra cost"}, and the instalments fit your budget. Never miss one — late card payments carry heavy interest.`,
      `যোগ্য ক্রেডিট কার্ড থাকলে ০% কিস্তিতে ${fmtDuration(cashM - card.rideIn, lang)} আগে বাইক পাবেন${card.extra ? `, ফি ${formatBDT(card.extra)}` : ", বাড়তি খরচ ছাড়াই"}, আর কিস্তি আপনার বাজেটে আঁটে। একটাও মিস করবেন না — দেরিতে দিলে কার্ডের সুদ অনেক।`,
    );
  }
  if (loan.fit !== "over" && loan.rideIn !== null && loan.rideIn < cashM) {
    const monthsOfSaving = Math.ceil(loan.extra / monthly);
    return t(
      `A loan gets you riding ${fmtDuration(cashM - loan.rideIn, lang)} sooner but costs ${formatBDT(loan.extra)} extra — about ${monthsOfSaving} month${monthsOfSaving === 1 ? "" : "s"} of your saving. Worth it only if the bike earns or saves you money (ride-sharing, a long commute).`,
      `লোনে ${fmtDuration(cashM - loan.rideIn, lang)} আগে চালাতে পারবেন, কিন্তু বাড়তি ${formatBDT(loan.extra)} — আপনার প্রায় ${monthsOfSaving} মাসের সঞ্চয়। বাইক দিয়ে আয় বা খরচ বাঁচালে (রাইড শেয়ার, লম্বা যাতায়াত) তবেই লাভ।`,
    );
  }
  return t(
    `The instalments would stretch your budget. Saving for ${fmtDuration(cashM, lang)} and paying cash is the safer road — or look at the speed-ups below.`,
    `কিস্তি আপনার বাজেটে চাপ ফেলবে। ${fmtDuration(cashM, lang)} জমিয়ে নগদে কেনাই নিরাপদ — অথবা নিচের উপায়গুলো দেখুন।`,
  );
}

// ---------------------------------------------------------------- speed-ups

function SpeedUps({ bike, buyingUsed, saved, monthly, savingsPct, target, eta, running, transportNow }: { bike: BikeLite; buyingUsed: boolean; saved: number; monthly: number; savingsPct: number; target: number; eta: number | null; running: number; transportNow: number }) {
  const { lang } = useLang();
  const tx = useTx();
  if (eta === 0) return null;
  const now = eta ?? Infinity;
  const sooner = (m: number | null) => (m === null ? null : now === Infinity ? m : now - m);
  const tips: { icon: React.ReactNode; title: string; body: string; href?: string }[] = [];

  const extra = Math.max(1000, Math.round((monthly * 0.25) / 500) * 500);
  const mExtra = monthsToGoal(target, saved, monthly + extra, savingsPct);
  if (mExtra !== null && (sooner(mExtra) ?? 0) > 0) {
    tips.push({
      icon: <PiggyBank size={18} />,
      title: tx(`Save ${formatBDT(extra)} more a month`, `মাসে আরও ${formatBDT(extra)} জমান`),
      body:
        now === Infinity
          ? tx(`You'd be riding in ${fmtDuration(mExtra, lang)}.`, `${fmtDuration(mExtra, lang)} পরেই চালাবেন।`)
          : tx(`${fmtDuration(sooner(mExtra)!, lang)} sooner — ${fmtMonthFromNow(mExtra, "en")} instead of ${fmtMonthFromNow(now, "en")}.`, `${fmtDuration(sooner(mExtra)!, lang)} আগে — ${fmtMonthFromNow(now, "bn")}-এর বদলে ${fmtMonthFromNow(mExtra, "bn")}।`),
    });
  }

  if (!buyingUsed && bike.status === "on-sale") {
    const usedPrice = defaultUsedPrice(bike);
    const mUsed = monthsToGoal(usedPrice, saved, monthly, savingsPct);
    if (mUsed !== null && usedPrice < target) {
      tips.push({
        icon: <Bike size={18} />,
        title: tx(`Buy a ~3-year-old one for about ${formatLakh(usedPrice, lang)}`, `~৩ বছরের পুরনো একটা কিনুন, প্রায় ${formatLakh(usedPrice, lang)}`),
        body:
          mUsed === 0
            ? tx("You could afford it today. Use our used-bike checklist before paying.", "আজই কেনা যায়। টাকা দেওয়ার আগে আমাদের পুরনো বাইকের চেকলিস্ট দেখুন।")
            : tx(`Ready in ${fmtDuration(mUsed, lang)}. Set aside 5–10% for repairs a used bike hides, and use the checklist.`, `${fmtDuration(mUsed, lang)} পরেই। পুরনো বাইকের লুকানো মেরামতের জন্য ৫–১০% আলাদা রাখুন, আর চেকলিস্ট দেখুন।`),
        href: "/guide/#used",
      });
    }
  }

  const cheaper = BIKES.filter((b) => b.status === "on-sale" && b.category === bike.category && b.id !== bike.id && b.priceBDT <= bike.priceBDT * 0.88)
    .sort((a, b) => b.scores.reliability + b.scores.resale + b.scores.mechanicFamiliarity - (a.scores.reliability + a.scores.resale + a.scores.mechanicFamiliarity) || a.priceBDT - b.priceBDT)[0];
  if (cheaper && !buyingUsed) {
    const cTarget = ownershipCost(cheaper, DEFAULT_COST_INPUT).onRoad;
    const mCheap = monthsToGoal(cTarget, saved, monthly, savingsPct);
    if (mCheap !== null && (sooner(mCheap) ?? 0) > 0) {
      tips.push({
        icon: <ArrowRight size={18} />,
        title: tx(`Or a ${fullName(cheaper)} (${formatLakh(cheaper.priceBDT, lang)})`, `অথবা ${fullName(cheaper)} (${formatLakh(cheaper.priceBDT, lang)})`),
        body:
          mCheap === 0
            ? tx("A well-rated bike of the same style you can afford today.", "একই ধরনের ভালো রেটিংয়ের বাইক, আজই কেনা যায়।")
            : tx(`Same style, well rated, and ${fmtDuration(sooner(mCheap)!, lang)} sooner.`, `একই ধরনের, ভালো রেটিং, আর ${fmtDuration(sooner(mCheap)!, lang)} আগে।`),
        href: `/fund/?bike=${cheaper.id}&saved=${saved}&monthly=${monthly}`,
      });
    }
  }

  if (savingsPct === 0 && now > 6) {
    const mDps = monthsToGoal(target, saved, monthly, EXAMPLE_SAVINGS_PCT);
    if (mDps !== null && (sooner(mDps) ?? 0) > 0) {
      tips.push({
        icon: <Landmark size={18} />,
        title: tx("Let the savings earn something", "সঞ্চয় থেকে কিছু আয় করুন"),
        body: tx(
          `In a DPS or savings account earning ${EXAMPLE_SAVINGS_PCT}% a year, you'd get there ${fmtDuration(sooner(mDps)!, lang)} sooner. Check your bank's current rate and set it above.`,
          `বছরে ${EXAMPLE_SAVINGS_PCT}% সুদের DPS বা সেভিংস অ্যাকাউন্টে রাখলে ${fmtDuration(sooner(mDps)!, lang)} আগে পৌঁছাবেন। আপনার ব্যাংকের বর্তমান হার দেখে উপরে বসান।`,
        ),
      });
    }
  }

  tips.push(
    transportNow > 0
      ? {
          icon: <CalendarClock size={18} />,
          title: transportNow >= running ? tx("The bike will pay for its own fuel", "বাইক নিজের তেলের খরচ নিজেই তুলবে") : tx("Plan for the running cost", "চালানোর খরচের জন্য তৈরি থাকুন"),
          body:
            transportNow >= running
              ? tx(`You spend ${formatBDT(transportNow)} a month getting around; running this bike costs about ${formatBDT(running)}. That ${formatBDT(transportNow - running)} difference is yours to save.`, `আপনি মাসে ${formatBDT(transportNow)} যাতায়াতে খরচ করেন; এই বাইক চালাতে প্রায় ${formatBDT(running)}। পার্থক্যের ${formatBDT(transportNow - running)} আপনার সঞ্চয়।`)
              : tx(`Running it costs about ${formatBDT(running)} a month, ${formatBDT(running - transportNow)} more than you spend on transport now. Budget for that before you buy.`, `চালাতে মাসে প্রায় ${formatBDT(running)}, এখনকার যাতায়াত খরচের চেয়ে ${formatBDT(running - transportNow)} বেশি। কেনার আগেই এটা হিসাবে রাখুন।`),
        }
      : {
          icon: <CalendarClock size={18} />,
          title: tx("Count what you spend on transport", "যাতায়াতে কত খরচ হয় হিসাব করুন"),
          body: tx(`Running this bike costs about ${formatBDT(running)} a month. Add what you now spend on rickshaws, CNG and ride-shares to see what it really changes.`, `এই বাইক চালাতে মাসে প্রায় ${formatBDT(running)}। রিকশা, সিএনজি আর রাইড শেয়ারে এখন কত খরচ হয় যোগ করুন, তাহলে আসল পার্থক্য দেখবেন।`),
        },
  );

  return (
    <section aria-labelledby="speed-h">
      <h2 id="speed-h" className="text-[20px] font-semibold tracking-tight text-ink">
        {tx("Get there sooner", "আরও আগে পৌঁছান")}
      </h2>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {tips.map((t) => {
          const inner = (
            <>
              <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-brand-soft text-brand">{t.icon}</span>
              <span className="min-w-0">
                <span className="block text-[15px] font-semibold text-ink">{t.title}</span>
                <span className="mt-0.5 block text-[13.5px] leading-snug text-muted">{t.body}</span>
              </span>
            </>
          );
          return t.href ? (
            <Link key={t.title} href={t.href} className="card flex gap-3 p-4 transition-colors hover:border-line-strong">
              {inner}
            </Link>
          ) : (
            <div key={t.title} className="card flex gap-3 p-4">
              {inner}
            </div>
          );
        })}
      </div>
    </section>
  );
}

// ---------------------------------------------------------------- habits

function Habits() {
  const tx = useTx();
  const items = [
    tx("Pay yourself first: move the bike money to a separate account or DPS on salary day, before you spend anything.", "আগে নিজেকে দিন: বেতনের দিনেই খরচের আগে বাইকের টাকা আলাদা অ্যাকাউন্ট বা DPS-এ সরান।"),
    tx("Put Eid bonuses, overtime and any side income straight into the fund — one festival bonus can be months of saving.", "ঈদ বোনাস, ওভারটাইম আর বাড়তি আয় সরাসরি ফান্ডে দিন — একটা বোনাসই কয়েক মাসের সঞ্চয়।"),
    tx("Keep the BRTA registration money apart. It's paid in cash upfront, even when the bike is on EMI.", "BRTA রেজিস্ট্রেশনের টাকা আলাদা রাখুন। বাইক কিস্তিতে হলেও এটা শুরুতেই নগদে দিতে হয়।"),
    tx("Watch for showroom offers around Eid and Pohela Boishakh, and always ask for the cash price and the EMI price separately.", "ঈদ ও পহেলা বৈশাখের শোরুম অফারে চোখ রাখুন, আর সবসময় নগদ দাম ও কিস্তির দাম আলাদা করে জিজ্ঞেস করুন।"),
    tx("Selling an old bike or phone? That money goes in the fund, not the wallet.", "পুরনো বাইক বা ফোন বিক্রি করছেন? সেই টাকা ফান্ডে যাবে, মানিব্যাগে নয়।"),
    tx("Leave room for a good helmet, a lock and the first service. Don't spend your last taka on the bike itself.", "ভালো হেলমেট, লক আর প্রথম সার্ভিসের টাকা রাখুন। শেষ টাকাটা বাইকেই খরচ করবেন না।"),
    tx("Avoid informal lenders and loans you can't read. Get the total payable in writing before signing anything.", "অনানুষ্ঠানিক ঋণদাতা আর না বুঝে লোন এড়িয়ে চলুন। সই করার আগে মোট কত দিতে হবে লিখিত নিন।"),
  ];
  return (
    <section className="card p-6" aria-labelledby="habits-h">
      <h2 id="habits-h" className="text-[17px] font-semibold tracking-tight text-ink">
        {tx("Saving habits that work", "যে অভ্যাসগুলো কাজ করে")}
      </h2>
      <ul className="mt-4 space-y-3">
        {items.map((x) => (
          <li key={x} className="flex gap-2.5 text-[14.5px] leading-relaxed text-ink-2">
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />
            {x}
          </li>
        ))}
      </ul>
    </section>
  );
}
