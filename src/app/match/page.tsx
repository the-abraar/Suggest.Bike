"use client";

import Link from "next/link";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Briefcase,
  Building2,
  Check,
  Flame,
  Gauge,
  Home as HomeIcon,
  Info,
  Mountain,
  RotateCcw,
  Route,
  Scale,
  Sparkles,
  Store,
  Trees,
  TriangleAlert,
  Users,
} from "lucide-react";
import {
  DEFAULT_ANSWERS,
  EMI_MONTHS,
  anyNewFits,
  cheapestNew,
  decodeAnswers,
  encodeAnswers,
  matchBikes,
  type Answers,
  type Priority,
  type Use,
  type Where,
} from "@/lib/match";
import { CATEGORIES, ccLabel, formatBDT, formatLakh, fullName, tagline } from "@/lib/bikes";
import { ownershipCost, DEFAULT_COST_INPUT, emiMonthly } from "@/lib/cost";
import { useLang, useTx } from "@/lib/i18n";
import { useStore } from "@/lib/store";
import { BikeArt } from "@/components/BikeArt";
import { CompareButton, SaveButton, ShareButton } from "@/components/ui";

type Opt<T> = { id: T; en: string; bn: string; sub?: string; subBn?: string; icon?: React.ReactNode };

const USES: Opt<Use>[] = [
  { id: "commute", en: "Daily commute", bn: "প্রতিদিন যাতায়াত", sub: "Office, campus, bazaar — mostly city", subBn: "অফিস, ক্যাম্পাস, বাজার — মূলত শহরে", icon: <Briefcase size={20} /> },
  { id: "mixed", en: "City + weekend highway", bn: "শহর + ছুটির দিনে হাইওয়ে", sub: "Dhaka on weekdays, home district on Fridays", subBn: "সপ্তাহে ঢাকা, শুক্রবার গ্রামের বাড়ি", icon: <Route size={20} /> },
  { id: "highway", en: "Long highway rides", bn: "লম্বা হাইওয়ে রাইড", sub: "Tours, Cox's Bazar, Sylhet trips", subBn: "ট্যুর, কক্সবাজার, সিলেট", icon: <Gauge size={20} /> },
  { id: "rough", en: "Village & broken roads", bn: "গ্রাম ও ভাঙা রাস্তা", sub: "Mud, potholes, unpaved tracks", subBn: "কাদা, গর্ত, কাঁচা রাস্তা", icon: <Mountain size={20} /> },
  { id: "rideshare", en: "Pathao / Uber / delivery", bn: "পাঠাও / উবার / ডেলিভারি", sub: "Earning money — every taka counts", subBn: "আয়ের জন্য — প্রতিটা টাকা গুরুত্বপূর্ণ", icon: <Users size={20} /> },
  { id: "fun", en: "Speed, style & fun", bn: "স্পিড, স্টাইল ও মজা", sub: "I want to enjoy every ride", subBn: "প্রতিটা রাইড উপভোগ করতে চাই", icon: <Flame size={20} /> },
];

const WHERES: Opt<Where>[] = [
  { id: "dhaka", en: "Dhaka", bn: "ঢাকা", sub: "Every brand's showroom is near", subBn: "সব ব্র্যান্ডের শোরুম কাছেই", icon: <Building2 size={20} /> },
  { id: "city", en: "Another big city", bn: "অন্য বড় শহর", sub: "Chattogram, Sylhet, Khulna, Rajshahi…", subBn: "চট্টগ্রাম, সিলেট, খুলনা, রাজশাহী…", icon: <Store size={20} /> },
  { id: "town", en: "District or upazila town", bn: "জেলা বা উপজেলা শহর", sub: "Service network matters more", subBn: "সার্ভিস নেটওয়ার্ক বেশি গুরুত্বপূর্ণ", icon: <HomeIcon size={20} /> },
  { id: "village", en: "Village", bn: "গ্রাম", sub: "Local mistri + tough roads", subBn: "লোকাল মিস্ত্রি + কঠিন রাস্তা", icon: <Trees size={20} /> },
];

const PRIORITIES: Opt<Priority>[] = [
  { id: "mileage", en: "Fuel economy", bn: "মাইলেজ" },
  { id: "maintenance", en: "Cheap, easy maintenance", bn: "সহজ ও সস্তা মেইনটেন্যান্স" },
  { id: "performance", en: "Power & acceleration", bn: "পাওয়ার ও এক্সেলারেশন" },
  { id: "comfort", en: "Comfort", bn: "আরাম" },
  { id: "resale", en: "Resale value", bn: "রিসেল ভ্যালু" },
  { id: "safety", en: "Safety (ABS)", bn: "নিরাপত্তা (ABS)" },
  { id: "style", en: "Looks & style", bn: "লুক ও স্টাইল" },
];

const STEPS = 7;

export default function MatchPage() {
  return (
    <Suspense>
      <Matchmaker />
    </Suspense>
  );
}

function Matchmaker() {
  const params = useSearchParams();
  const tx = useTx();
  const [a, setA] = useState<Answers>(DEFAULT_ANSWERS);
  const [step, setStep] = useState(0); // 0..STEPS-1 = questions, STEPS = results
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const decoded = decodeAnswers(params);
    if (decoded) {
      setA(decoded);
      setStep(params.get("r") === "1" ? STEPS : 3);
    }
    setLoaded(true);
  }, [params]);

  useEffect(() => {
    if (!loaded) return;
    window.scrollTo({ top: 0, behavior: "smooth" });
    if (step === STEPS) window.history.replaceState(null, "", `?${encodeAnswers(a)}&r=1`);
  }, [step]); // eslint-disable-line react-hooks/exhaustive-deps

  const set = <K extends keyof Answers>(k: K, v: Answers[K]) => setA((x) => ({ ...x, [k]: v }));

  if (!loaded) return <div className="min-h-[70vh]" />;
  if (step === STEPS)
    return (
      <Results
        a={a}
        onEdit={(s) => setStep(s)}
        onRestart={() => {
          setA(DEFAULT_ANSWERS);
          setStep(0);
          window.history.replaceState(null, "", window.location.pathname);
        }}
      />
    );

  const next = () => setStep((s) => Math.min(STEPS, s + 1));
  const back = () => setStep((s) => Math.max(0, s - 1));
  const pickAndNext = <K extends keyof Answers>(k: K, v: Answers[K]) => {
    set(k, v);
    setTimeout(next, 180);
  };

  return (
    <div className="container-x max-w-3xl pb-10 pt-10 sm:pt-14">
      {/* progress */}
      <div className="flex items-center justify-between text-[13px] text-muted">
        <span>
          {tx("Question", "প্রশ্ন")} <span className="font-semibold text-ink tnum">{step + 1}</span> / {STEPS}
        </span>
        <button onClick={() => setStep(STEPS)} className="font-medium text-brand hover:underline">
          {tx("Skip to results", "সরাসরি ফলাফল")}
        </button>
      </div>
      <div className="mt-3 flex gap-1.5" aria-hidden>
        {Array.from({ length: STEPS }).map((_, i) => (
          <div key={i} className="h-1 flex-1 overflow-hidden rounded-full bg-surface-3">
            <div className={`h-full rounded-full bg-brand transition-all duration-500 ${i <= step ? "w-full" : "w-0"}`} />
          </div>
        ))}
      </div>

      <div key={step} className="mt-10 animate-rise">
        {step === 0 && <BudgetStep a={a} set={set} />}
        {step === 1 && (
          <Question title={tx("What will you mostly use it for?", "মূলত কী কাজে ব্যবহার করবেন?")}>
            <div className="grid gap-3 sm:grid-cols-2">
              {USES.map((u) => (
                <OptionCard key={u.id} active={a.use === u.id} onClick={() => pickAndNext("use", u.id)} icon={u.icon} opt={u} />
              ))}
            </div>
          </Question>
        )}
        {step === 2 && (
          <Question
            title={tx("Where will you ride and service it?", "কোথায় চালাবেন ও সার্ভিস করাবেন?")}
            sub={tx("Outside the big cities, a brand's workshop network and the local mistri matter more than specs.", "বড় শহরের বাইরে স্পেকের চেয়ে ব্র্যান্ডের ওয়ার্কশপ আর লোকাল মিস্ত্রি বেশি গুরুত্বপূর্ণ।")}
          >
            <div className="grid gap-3 sm:grid-cols-2">
              {WHERES.map((w) => (
                <OptionCard key={w.id} active={a.where === w.id} onClick={() => pickAndNext("where", w.id)} icon={w.icon} opt={w} />
              ))}
            </div>
          </Question>
        )}
        {step === 3 && (
          <Question title={tx("Gears or gearless?", "গিয়ার নাকি গিয়ারলেস?")} sub={tx("Scooters are easier in jams; geared bikes go further on highways.", "জ্যামে স্কুটার সহজ; হাইওয়েতে গিয়ার বাইক ভালো।")}>
            <div className="grid gap-3 sm:grid-cols-3">
              {(
                [
                  { id: "no", en: "Geared motorcycle", bn: "গিয়ার মোটরসাইকেল", sub: "Classic choice, more control", subBn: "সাধারণ পছন্দ, বেশি নিয়ন্ত্রণ" },
                  { id: "yes", en: "Scooter", bn: "স্কুটার", sub: "No clutch, storage, easy", subBn: "ক্লাচ নেই, স্টোরেজ, সহজ" },
                  { id: "either", en: "Show me both", bn: "দুটোই দেখান", sub: "I'm open", subBn: "দুটোতেই রাজি" },
                ] as Opt<Answers["gearless"]>[]
              ).map((o) => (
                <OptionCard key={o.id} active={a.gearless === o.id} onClick={() => pickAndNext("gearless", o.id)} opt={o} />
              ))}
            </div>
          </Question>
        )}
        {step === 4 && (
          <Question title={tx("Tell us about you", "আপনার সম্পর্কে বলুন")} sub={tx("So we can check you'll reach the ground and won't be overwhelmed.", "যাতে পা মাটিতে পৌঁছায় আর বাইকটা সামলাতে পারেন।")}>
            <p className="mb-3 text-[14px] font-medium text-ink-2">{tx("Your height", "আপনার উচ্চতা")}</p>
            <div className="grid gap-3 sm:grid-cols-3">
              {(
                [
                  { id: "short", en: "Under 5′5″", bn: "৫′৫″ এর কম", sub: "< 165 cm" },
                  { id: "medium", en: "5′5″ – 5′9″", bn: "৫′৫″ – ৫′৯″", sub: "165–175 cm" },
                  { id: "tall", en: "Over 5′9″", bn: "৫′৯″ এর বেশি", sub: "> 175 cm" },
                ] as Opt<Answers["height"]>[]
              ).map((o) => (
                <OptionCard key={o.id} compact active={a.height === o.id} onClick={() => set("height", o.id)} opt={o} />
              ))}
            </div>
            <p className="mb-3 mt-8 text-[14px] font-medium text-ink-2">{tx("Riding experience", "চালানোর অভিজ্ঞতা")}</p>
            <div className="grid gap-3 sm:grid-cols-3">
              {(
                [
                  { id: "first", en: "This is my first bike", bn: "এটাই প্রথম বাইক" },
                  { id: "some", en: "I've ridden a while", bn: "কিছুদিন চালিয়েছি" },
                  { id: "pro", en: "Years of riding", bn: "অনেক বছরের অভিজ্ঞতা" },
                ] as Opt<Answers["experience"]>[]
              ).map((o) => (
                <OptionCard key={o.id} compact active={a.experience === o.id} onClick={() => set("experience", o.id)} opt={o} />
              ))}
            </div>
          </Question>
        )}
        {step === 5 && (
          <Question title={tx("How often will someone ride behind you?", "পেছনে কত ঘন ঘন কেউ বসবে?")}>
            <div className="grid gap-3 sm:grid-cols-3">
              {(
                [
                  { id: "rarely", en: "Rarely", bn: "কদাচিৎ", sub: "Mostly solo", subBn: "বেশিরভাগ একা" },
                  { id: "sometimes", en: "Sometimes", bn: "মাঝে মাঝে", sub: "Friends, weekends", subBn: "বন্ধু, ছুটির দিন" },
                  { id: "daily", en: "Every day", bn: "প্রতিদিন", sub: "Spouse, kids, passengers", subBn: "স্বামী/স্ত্রী, বাচ্চা, যাত্রী" },
                ] as Opt<Answers["pillion"]>[]
              ).map((o) => (
                <OptionCard key={o.id} active={a.pillion === o.id} onClick={() => pickAndNext("pillion", o.id)} opt={o} />
              ))}
            </div>
          </Question>
        )}
        {step === 6 && (
          <Question title={tx("What matters most?", "সবচেয়ে গুরুত্বপূর্ণ কী?")} sub={tx("Pick up to three.", "সর্বোচ্চ তিনটি বাছুন।")}>
            <div className="flex flex-wrap gap-2">
              {PRIORITIES.map((p) => {
                const on = a.priorities.includes(p.id);
                const full = !on && a.priorities.length >= 3;
                return (
                  <button
                    key={p.id}
                    disabled={full}
                    aria-pressed={on}
                    onClick={() => set("priorities", on ? a.priorities.filter((x) => x !== p.id) : [...a.priorities, p.id])}
                    className={`inline-flex h-12 items-center gap-2 rounded-xl border px-4 text-[15px] font-medium transition-all disabled:opacity-40 ${
                      on ? "border-brand bg-brand-soft text-brand" : "border-line-strong bg-surface text-ink-2 hover:border-ink/30"
                    }`}
                  >
                    {on && <Check size={16} />}
                    {tx(p.en, p.bn)}
                  </button>
                );
              })}
            </div>
          </Question>
        )}
      </div>

      <div className="mt-12 flex items-center justify-between border-t border-line pt-6">
        <button onClick={back} className={`btn-ghost ${step === 0 ? "invisible" : ""}`}>
          <ArrowLeft size={17} /> {tx("Back", "পেছনে")}
        </button>
        {step < STEPS - 1 ? (
          <button onClick={next} className="btn-primary px-6">
            {tx("Continue", "পরবর্তী")} <ArrowRight size={17} />
          </button>
        ) : (
          <button onClick={next} className="btn-primary px-6">
            <Sparkles size={17} /> {tx("Show my matches", "আমার ম্যাচ দেখান")}
          </button>
        )}
      </div>
    </div>
  );
}

function Question({ title, sub, children }: { title: React.ReactNode; sub?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div>
      <h1 className="text-[28px] font-semibold leading-tight tracking-[-0.025em] text-ink sm:text-[36px]">{title}</h1>
      {sub && <p className="mt-2 text-[16px] text-muted">{sub}</p>}
      <div className="mt-8">{children}</div>
    </div>
  );
}

function OptionCard<T>({ opt, active, onClick, icon, compact }: { opt: Opt<T>; active: boolean; onClick: () => void; icon?: React.ReactNode; compact?: boolean }) {
  const { lang } = useLang();
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={`group relative flex w-full items-start gap-3.5 rounded-2xl border text-left transition-all ${compact ? "p-4" : "p-5"} ${
        active ? "border-brand bg-brand-soft shadow-[0_0_0_1px_var(--brand)]" : "border-line bg-surface hover:border-line-strong hover:shadow-md"
      }`}
    >
      {icon && <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${active ? "bg-brand text-brand-ink" : "bg-surface-2 text-ink-2"}`}>{icon}</span>}
      <span className="min-w-0 flex-1">
        <span className="block text-[15.5px] font-semibold text-ink">{lang === "bn" ? opt.bn : opt.en}</span>
        {opt.sub && <span className="mt-0.5 block text-[13.5px] leading-snug text-muted">{lang === "bn" && opt.subBn ? opt.subBn : opt.sub}</span>}
      </span>
      <span className={`grid h-5 w-5 shrink-0 place-items-center rounded-full border transition-all ${active ? "border-brand bg-brand text-brand-ink" : "border-line-strong"}`}>
        {active && <Check size={12} strokeWidth={3} />}
      </span>
    </button>
  );
}

function BudgetStep({ a, set }: { a: Answers; set: <K extends keyof Answers>(k: K, v: Answers[K]) => void }) {
  const { lang } = useLang();
  const tx = useTx();
  const monthly = a.payMode === "monthly";
  const [min, max, step] = monthly ? [5000, 60000, 500] : [50000, 700000, 5000];
  const value = monthly ? a.monthly : a.budget;
  const fill = ((value - min) / (max - min)) * 100;
  const setValue = (v: number) => {
    if (monthly) {
      set("monthly", v);
      set("budget", v * EMI_MONTHS);
    } else {
      set("budget", v);
      set("monthly", emiMonthly(v));
    }
  };
  const presets = monthly ? [8000, 12000, 18000, 25000, 40000] : [130000, 180000, 250000, 350000, 500000];

  return (
    <Question
      title={tx("What's your budget?", "আপনার বাজেট কত?")}
      sub={tx("The most you'd pay for the bike itself. We'll add registration separately.", "শুধু বাইকের জন্য সর্বোচ্চ কত দেবেন। রেজিস্ট্রেশন আলাদা।")}
    >
      <div className="mb-4 grid grid-cols-2 gap-1 rounded-xl bg-surface-2 p-1 sm:w-fit">
        {(["total", "monthly"] as const).map((m) => (
          <button
            key={m}
            onClick={() => set("payMode", m)}
            aria-pressed={a.payMode === m}
            className={`h-10 rounded-lg px-4 text-[14px] font-medium transition-all ${a.payMode === m ? "bg-surface text-ink shadow-sm" : "text-muted hover:text-ink"}`}
          >
            {m === "total" ? tx("Full price", "পুরো দাম") : tx("Monthly (EMI)", "মাসিক (কিস্তি)")}
          </button>
        ))}
      </div>
      <div className="card p-6 sm:p-8">
        <p className="text-center text-[44px] font-semibold tracking-[-0.03em] text-ink tnum sm:text-[56px]">
          {formatBDT(value)}
          {monthly && <span className="text-[20px] font-medium text-muted">{tx("/mo", "/মাস")}</span>}
        </p>
        <p className="text-center text-[14px] text-muted">
          {monthly
            ? tx(`× ${EMI_MONTHS} months = bikes up to ${formatLakh(a.budget, lang)}`, `× ${EMI_MONTHS} মাস = ${formatLakh(a.budget, lang)} পর্যন্ত বাইক`)
            : formatLakh(a.budget, lang)}
        </p>
        <input
          type="range"
          className="range mt-6"
          min={min}
          max={max}
          step={step}
          value={value}
          aria-label={tx("Budget", "বাজেট")}
          style={{ ["--fill" as string]: `${fill}%` }}
          onChange={(e) => setValue(Number(e.target.value))}
        />
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          {presets.map((v) => (
            <button key={v} className="chip" data-active={value === v} onClick={() => setValue(v)}>
              {monthly ? `${formatBDT(v)}${tx("/mo", "/মাস")}` : formatLakh(v, lang)}
            </button>
          ))}
        </div>
        {monthly && (
          <p className="mx-auto mt-5 flex max-w-md gap-2 text-[12.5px] leading-relaxed text-muted">
            <Info size={14} className="mt-0.5 shrink-0" />
            {tx(
              "Most showrooms offer 0% EMI for up to 12 months on partner-bank credit cards; banks may add a processing fee. Without a credit card, ask about the dealer's own installment plan.",
              "বেশিরভাগ শোরুমে পার্টনার ব্যাংকের ক্রেডিট কার্ডে ১২ মাস পর্যন্ত ০% কিস্তি পাওয়া যায়; ব্যাংক প্রসেসিং ফি নিতে পারে। ক্রেডিট কার্ড না থাকলে ডিলারের নিজস্ব কিস্তি সুবিধা জিজ্ঞেস করুন।",
            )}
          </p>
        )}
      </div>
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <OptionCard compact active={a.condition === "new"} onClick={() => set("condition", "new")} opt={{ id: "new", en: "Brand new only", bn: "শুধু নতুন", sub: "Warranty, free services", subBn: "ওয়ারেন্টি, ফ্রি সার্ভিস" }} />
        <OptionCard
          compact
          active={a.condition === "any"}
          onClick={() => set("condition", "any")}
          opt={{ id: "any", en: "Open to used", bn: "পুরনো হলেও চলবে", sub: "1–3 year old bikes from bikroy prices", subBn: "bikroy-এর দামে ১–৩ বছরের পুরনো বাইক" }}
        />
      </div>
    </Question>
  );
}

/* ---------------- Results ---------------- */

function Results({ a, onEdit, onRestart }: { a: Answers; onEdit: (step: number) => void; onRestart: () => void }) {
  const { lang } = useLang();
  const tx = useTx();
  const { compare, toggleCompare, clearCompare } = useStore();
  const matches = useMemo(() => matchBikes(a, 6), [a]);
  const [top, ...rest] = matches;
  const use = USES.find((u) => u.id === a.use)!;
  const where = WHERES.find((w) => w.id === a.where)!;
  const noNew = !anyNewFits(a);
  const cheapest = cheapestNew(a);

  const compareTop3 = () => {
    clearCompare();
    matches.slice(0, 3).forEach((m) => toggleCompare(m.bike.id));
  };
  const usedLabel = (age: 1 | 3) => (age === 1 ? tx("Used · ~1 year old", "পুরনো · ~১ বছর") : tx("Used · ~3 years old", "পুরনো · ~৩ বছর"));

  return (
    <div className="container-x pb-10 pt-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow mb-2">{tx("Your matches", "আপনার ম্যাচ")}</p>
          <h1 className="text-[30px] font-semibold tracking-[-0.03em] text-ink sm:text-[40px]">
            {top ? tx("Here's what we'd buy in your shoes.", "আপনার জায়গায় থাকলে আমরা এগুলো কিনতাম।") : tx("Nothing fits — yet.", "কিছু মিলছে না — এখনো।")}
          </h1>
        </div>
        <div className="flex gap-2">
          <ShareButton title={tx("My bike matches — Suggest.Bike", "আমার বাইক ম্যাচ — Suggest.Bike")} text={top ? fullName(top.bike) : undefined} className="border border-line-strong bg-surface" />
          <button onClick={onRestart} className="btn-ghost h-10 px-3.5 text-[14px]">
            <RotateCcw size={16} /> {tx("Start over", "আবার শুরু")}
          </button>
        </div>
      </div>

      {/* answers summary */}
      <div className="mt-6 flex flex-wrap gap-2">
        <EditChip onClick={() => onEdit(0)}>
          {a.payMode === "monthly" ? `${formatBDT(a.monthly)}${tx("/mo EMI", "/মাস কিস্তি")}` : `≤ ${formatLakh(a.budget, lang)}`} · {a.condition === "new" ? tx("new", "নতুন") : tx("new or used", "নতুন বা পুরনো")}
        </EditChip>
        <EditChip onClick={() => onEdit(1)}>{lang === "bn" ? use.bn : use.en}</EditChip>
        <EditChip onClick={() => onEdit(2)}>{lang === "bn" ? where.bn : where.en}</EditChip>
        <EditChip onClick={() => onEdit(3)}>{a.gearless === "yes" ? tx("Scooter", "স্কুটার") : a.gearless === "no" ? tx("Geared", "গিয়ার") : tx("Geared or scooter", "গিয়ার বা স্কুটার")}</EditChip>
        <EditChip onClick={() => onEdit(4)}>
          {lang === "bn"
            ? `${{ short: "৫′৫″ এর কম", medium: "৫′৫″–৫′৯″", tall: "৫′৯″ এর বেশি" }[a.height]} · ${{ first: "প্রথম বাইক", some: "কিছু অভিজ্ঞতা", pro: "অভিজ্ঞ" }[a.experience]}`
            : `${{ short: "Under 5′5″", medium: "5′5″–5′9″", tall: "Over 5′9″" }[a.height]} · ${{ first: "first bike", some: "some experience", pro: "experienced" }[a.experience]}`}
        </EditChip>
        <EditChip onClick={() => onEdit(5)}>
          {tx("Pillion", "পিলিয়ন")}: {lang === "bn" ? { rarely: "কদাচিৎ", sometimes: "মাঝে মাঝে", daily: "প্রতিদিন" }[a.pillion] : a.pillion}
        </EditChip>
        {a.priorities.length > 0 && <EditChip onClick={() => onEdit(6)}>{a.priorities.map((p) => tx(PRIORITIES.find((x) => x.id === p)!.en, PRIORITIES.find((x) => x.id === p)!.bn)).join(", ")}</EditChip>}
      </div>

      {noNew && cheapest && (
        <div className="mt-6 flex flex-wrap items-center gap-3 rounded-2xl border border-warn/30 bg-warn-soft p-4 text-[14.5px] text-ink-2">
          <Info size={18} className="shrink-0 text-warn" />
          <span className="min-w-0 flex-1">
            {tx(
              `Nothing new fits ${formatLakh(a.budget, lang)}. The cheapest new option is the ${fullName(cheapest)} at ${formatBDT(cheapest.priceBDT)}${a.condition === "new" ? " — or allow used bikes." : "."}`,
              `${formatLakh(a.budget, lang)}-এ নতুন কিছু মেলে না। সবচেয়ে কম দামের নতুন বাইক ${fullName(cheapest)} — ${formatBDT(cheapest.priceBDT)}${a.condition === "new" ? "। অথবা পুরনো বাইকও দেখুন।" : "।"}`,
            )}
          </span>
          <Link href={`/bikes/${cheapest.id}/`} className="text-[13.5px] font-medium text-brand hover:underline">
            {tx("See it", "দেখুন")}
          </Link>
        </div>
      )}

      {!top ? (
        <div className="card mt-10 px-6 py-16 text-center">
          <p className="text-[17px] font-semibold text-ink">{tx("No bikes fit all of that.", "সব শর্তে কোনো বাইক মেলেনি।")}</p>
          <p className="mt-1 text-[14.5px] text-muted">
            {tx("Try raising the budget, allowing used bikes, or choosing “show me both”.", "বাজেট বাড়ান, পুরনো বাইক চালু করুন, অথবা “দুটোই দেখান” বেছে নিন।")}
          </p>
          <button className="btn-primary mt-6" onClick={() => onEdit(0)}>
            {tx("Adjust budget", "বাজেট বদলান")}
          </button>
        </div>
      ) : (
        <>
          {/* Top match */}
          <div className="card mt-8 grid grid-cols-[minmax(0,1fr)] overflow-hidden shadow-md lg:grid-cols-[1.1fr_1fr]">
            <div className="relative bg-surface-2/70 p-6 sm:p-10">
              <div className="flex flex-wrap gap-1.5">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-brand px-3 py-1 text-[12.5px] font-semibold text-brand-ink">
                  <Sparkles size={13} /> {tx("Best match", "সেরা ম্যাচ")}
                </span>
                {top.used && <span className="rounded-full bg-warn-soft px-3 py-1 text-[12.5px] font-semibold text-warn">{usedLabel(top.used.age)}</span>}
              </div>
              <BikeArt bike={top.bike} className="mx-auto mt-4 w-full max-w-[480px] animate-rise" />
            </div>
            <div className="flex flex-col p-6 sm:p-8">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[13px] font-medium text-muted">
                    {top.bike.brand} · {ccLabel(top.bike)} · {lang === "bn" ? CATEGORIES[top.bike.category].bn : CATEGORIES[top.bike.category].en}
                  </p>
                  <h2 className="mt-1 text-[30px] font-semibold leading-tight tracking-tight text-ink">{top.bike.model}</h2>
                </div>
                <MatchRing value={top.score} />
              </div>
              <p className="mt-3 text-[15px] leading-relaxed text-ink-2">{tagline(top.bike, lang)}</p>
              <ul className="mt-5 space-y-2.5">
                {top.reasons.map((r) => (
                  <li key={r.en} className="flex gap-2.5 text-[14.5px] text-ink-2">
                    <Check size={17} className="mt-0.5 shrink-0 text-good" /> {r[lang]}
                  </li>
                ))}
                {top.warnings.map((w) => (
                  <li key={w.en} className="flex gap-2.5 text-[14.5px] text-ink-2">
                    <TriangleAlert size={16} className="mt-0.5 shrink-0 text-warn" /> {w[lang]}
                  </li>
                ))}
              </ul>
              <div className="mt-6 grid grid-cols-3 gap-4 border-t border-line pt-5">
                <MiniStat k={top.used ? tx("Used price", "পুরনো দাম") : tx("Price", "দাম")} v={formatLakh(top.price, lang)} />
                <MiniStat k={tx("Mileage", "মাইলেজ")} v={`${top.bike.mileageKmpl[0]}–${top.bike.mileageKmpl[1]}`} />
                <MiniStat
                  k={top.used ? tx("Running/mo", "চলার খরচ/মাস") : tx("EMI/mo", "কিস্তি/মাস")}
                  v={formatBDT(top.used ? ownershipCost(top.bike, { ...DEFAULT_COST_INPUT, includeDepreciation: false }).runningPerMonth : emiMonthly(top.price))}
                />
              </div>
              <div className="mt-6 flex flex-wrap gap-2">
                <Link href={`/bikes/${top.bike.id}/`} className="btn-primary">
                  {tx("See full details", "বিস্তারিত দেখুন")} <ArrowRight size={16} />
                </Link>
                <CompareButton id={top.bike.id} />
                <SaveButton id={top.bike.id} withLabel />
              </div>
            </div>
          </div>

          {/* Runners-up */}
          {rest.length > 0 && (
            <>
              <div className="mt-12 flex flex-wrap items-end justify-between gap-3">
                <h2 className="text-[22px] font-semibold tracking-tight text-ink">{tx("Also great for you", "আপনার জন্য আরও ভালো")}</h2>
                <Link href={`/compare/?bikes=${matches.slice(0, 3).map((m) => m.bike.id).join(",")}`} onClick={compareTop3} className="btn-secondary h-10 px-4 text-[14px]">
                  <Scale size={16} /> {tx("Compare top 3", "সেরা ৩টি তুলনা")}
                </Link>
              </div>
              <div className="mt-5 grid gap-3">
                {rest.map((m, i) => (
                  <Link
                    key={m.bike.id}
                    href={`/bikes/${m.bike.id}/`}
                    className="group card grid grid-cols-[88px_1fr] items-center gap-4 p-4 transition-all hover:border-line-strong hover:shadow-md sm:grid-cols-[28px_140px_1fr_auto] sm:gap-6 sm:p-5"
                  >
                    <span className="hidden text-center text-[15px] font-semibold text-faint tnum sm:block">{i + 2}</span>
                    <BikeArt bike={m.bike} shadow={false} className="w-full" />
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-baseline gap-x-3">
                        <h3 className="text-[17px] font-semibold text-ink">{fullName(m.bike)}</h3>
                        <span className="text-[13px] font-semibold text-brand tnum">
                          {m.score}% {tx("match", "ম্যাচ")}
                        </span>
                        {m.used && <span className="rounded-full bg-warn-soft px-2 py-0.5 text-[11.5px] font-semibold text-warn">{usedLabel(m.used.age)}</span>}
                      </div>
                      <p className="mt-1 text-[13.5px] text-muted">{m.reasons.slice(0, 2).map((r) => r[lang]).join(" · ")}</p>
                      {m.warnings[0] && (
                        <p className="mt-1 flex items-center gap-1.5 text-[13px] text-warn">
                          <TriangleAlert size={13} className="shrink-0" /> {m.warnings[0][lang]}
                        </p>
                      )}
                    </div>
                    <div className="col-span-2 flex items-center justify-between gap-3 sm:col-span-1 sm:flex-col sm:items-end">
                      <span className="text-right">
                        <span className="block text-[18px] font-semibold text-ink tnum">{formatLakh(m.price, lang)}</span>
                        {!m.used && (
                          <span className="block text-[12px] text-muted tnum">
                            {formatBDT(emiMonthly(m.price))}
                            {tx("/mo EMI", "/মাস কিস্তি")}
                          </span>
                        )}
                      </span>
                      <CompareButton id={m.bike.id} size="sm" />
                    </div>
                  </Link>
                ))}
              </div>
            </>
          )}
          <p className="mt-8 text-[13px] text-faint">
            {compare.length > 0 ? tx(`${compare.length} in your compare tray. `, `তুলনার তালিকায় ${compare.length}টি। `) : ""}
            {tx(
              "Rankings are computed from our 11 ownership scores, your answers and current prices — no brand pays for placement. EMI shown as a plain 12-month split.",
              "র‍্যাঙ্কিং আমাদের ১১টি মালিকানা স্কোর, আপনার উত্তর আর বর্তমান দাম থেকে হিসাব করা — কোনো ব্র্যান্ড টাকা দিয়ে জায়গা কেনে না। কিস্তি দেখানো হয়েছে ১২ মাসে সমান ভাগ করে।",
            )}
          </p>
        </>
      )}
    </div>
  );
}

function EditChip({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  const tx = useTx();
  return (
    <button onClick={onClick} className="chip h-9 gap-2 pr-2.5">
      {children}
      <span className="text-[11.5px] font-semibold text-brand">{tx("Edit", "বদলান")}</span>
    </button>
  );
}

function MiniStat({ k, v }: { k: string; v: string }) {
  return (
    <div>
      <p className="text-[12px] text-muted">{k}</p>
      <p className="mt-0.5 text-[16px] font-semibold text-ink tnum">{v}</p>
    </div>
  );
}

function MatchRing({ value }: { value: number }) {
  const r = 26;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative h-[68px] w-[68px] shrink-0" aria-label={`${value}%`}>
      <svg viewBox="0 0 64 64" className="h-full w-full -rotate-90">
        <circle cx="32" cy="32" r={r} fill="none" stroke="var(--surface-3)" strokeWidth="6" />
        <circle
          cx="32"
          cy="32"
          r={r}
          fill="none"
          stroke="var(--brand)"
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - value / 100)}
          style={{ transition: "stroke-dashoffset 1s cubic-bezier(.2,.7,.2,1)" }}
        />
      </svg>
      <span className="absolute inset-0 grid place-items-center text-[15px] font-semibold text-ink tnum">{value}%</span>
    </div>
  );
}
