"use client";

import Link from "next/link";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Briefcase,
  Check,
  Copy,
  Flame,
  Gauge,
  Mountain,
  RotateCcw,
  Route,
  Scale,
  Sparkles,
  TriangleAlert,
  Users,
} from "lucide-react";
import { DEFAULT_ANSWERS, decodeAnswers, encodeAnswers, matchBikes, type Answers, type Priority, type Use } from "@/lib/match";
import { CATEGORIES, ccLabel, formatBDT, formatLakh, fullName } from "@/lib/bikes";
import { ownershipCost, DEFAULT_COST_INPUT } from "@/lib/cost";
import { L, useLang } from "@/lib/i18n";
import { useStore } from "@/lib/store";
import { BikeArt } from "@/components/BikeArt";
import { CompareButton, SaveButton } from "@/components/ui";

type Opt<T> = { id: T; en: string; bn: string; sub?: string; subBn?: string; icon?: React.ReactNode };

const USES: Opt<Use>[] = [
  { id: "commute", en: "Daily commute", bn: "প্রতিদিন যাতায়াত", sub: "Office, campus, bazaar — mostly city", subBn: "অফিস, ক্যাম্পাস, বাজার — মূলত শহরে", icon: <Briefcase size={20} /> },
  { id: "mixed", en: "City + weekend highway", bn: "শহর + ছুটির দিনে হাইওয়ে", sub: "Dhaka on weekdays, home district on Fridays", subBn: "সপ্তাহে ঢাকা, শুক্রবার গ্রামের বাড়ি", icon: <Route size={20} /> },
  { id: "highway", en: "Long highway rides", bn: "লম্বা হাইওয়ে রাইড", sub: "Tours, Cox's Bazar, Sylhet trips", subBn: "ট্যুর, কক্সবাজার, সিলেট", icon: <Gauge size={20} /> },
  { id: "rough", en: "Village & broken roads", bn: "গ্রাম ও ভাঙা রাস্তা", sub: "Mud, potholes, unpaved tracks", subBn: "কাদা, গর্ত, কাঁচা রাস্তা", icon: <Mountain size={20} /> },
  { id: "rideshare", en: "Pathao / Uber / delivery", bn: "পাঠাও / উবার / ডেলিভারি", sub: "Earning money — every taka counts", subBn: "আয়ের জন্য — প্রতিটা টাকা গুরুত্বপূর্ণ", icon: <Users size={20} /> },
  { id: "fun", en: "Speed, style & fun", bn: "স্পিড, স্টাইল ও মজা", sub: "I want to enjoy every ride", subBn: "প্রতিটা রাইড উপভোগ করতে চাই", icon: <Flame size={20} /> },
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

const STEPS = 6;

export default function MatchPage() {
  return (
    <Suspense>
      <Matchmaker />
    </Suspense>
  );
}

function Matchmaker() {
  const params = useSearchParams();
  const [a, setA] = useState<Answers>(DEFAULT_ANSWERS);
  const [step, setStep] = useState(0); // 0..STEPS-1 = questions, STEPS = results
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const decoded = decodeAnswers(params);
    if (decoded) {
      setA(decoded);
      setStep(params.get("r") === "1" ? STEPS : 2);
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
  if (step === STEPS) return <Results a={a} onEdit={(s) => setStep(s)} onRestart={() => { setA(DEFAULT_ANSWERS); setStep(0); window.history.replaceState(null, "", window.location.pathname); }} />;

  const next = () => setStep((s) => Math.min(STEPS, s + 1));
  const back = () => setStep((s) => Math.max(0, s - 1));

  return (
    <div className="container-x max-w-3xl pb-10 pt-10 sm:pt-14">
      {/* progress */}
      <div className="flex items-center justify-between text-[13px] text-muted">
        <span>
          <L en="Question" bn="প্রশ্ন" /> <span className="font-semibold text-ink tnum">{step + 1}</span> / {STEPS}
        </span>
        <button onClick={() => setStep(STEPS)} className="font-medium text-brand hover:underline">
          <L en="Skip to results" bn="সরাসরি ফলাফল" />
        </button>
      </div>
      <div className="mt-3 flex gap-1.5">
        {Array.from({ length: STEPS }).map((_, i) => (
          <div key={i} className="h-1 flex-1 overflow-hidden rounded-full bg-surface-3">
            <div className={`h-full rounded-full bg-brand transition-all duration-500 ${i <= step ? "w-full" : "w-0"}`} />
          </div>
        ))}
      </div>

      <div key={step} className="mt-10 animate-rise">
        {step === 0 && <BudgetStep a={a} set={set} />}
        {step === 1 && (
          <Question title={<L en="What will you mostly use it for?" bn="মূলত কী কাজে ব্যবহার করবেন?" />}>
            <div className="grid gap-3 sm:grid-cols-2">
              {USES.map((u) => (
                <OptionCard key={u.id} active={a.use === u.id} onClick={() => { set("use", u.id); setTimeout(next, 180); }} icon={u.icon} opt={u} />
              ))}
            </div>
          </Question>
        )}
        {step === 2 && (
          <Question title={<L en="Gears or gearless?" bn="গিয়ার নাকি গিয়ারলেস?" />} sub={<L en="Scooters are easier in jams; geared bikes go further on highways." bn="জ্যামে স্কুটার সহজ; হাইওয়েতে গিয়ার বাইক ভালো।" />}>
            <div className="grid gap-3 sm:grid-cols-3">
              {(
                [
                  { id: "no", en: "Geared motorcycle", bn: "গিয়ার মোটরসাইকেল", sub: "Classic choice, more control", subBn: "সাধারণ পছন্দ, বেশি নিয়ন্ত্রণ" },
                  { id: "yes", en: "Scooter", bn: "স্কুটার", sub: "No clutch, storage, easy", subBn: "ক্লাচ নেই, স্টোরেজ, সহজ" },
                  { id: "either", en: "Show me both", bn: "দুটোই দেখান", sub: "I'm open", subBn: "আমি খোলা মনে আছি" },
                ] as Opt<Answers["gearless"]>[]
              ).map((o) => (
                <OptionCard key={o.id} active={a.gearless === o.id} onClick={() => { set("gearless", o.id); setTimeout(next, 180); }} opt={o} />
              ))}
            </div>
          </Question>
        )}
        {step === 3 && (
          <Question title={<L en="Tell us about you" bn="আপনার সম্পর্কে বলুন" />} sub={<L en="So we can check you'll reach the ground and won't be overwhelmed." bn="যাতে পা মাটিতে পৌঁছায় আর বাইকটা সামলাতে পারেন।" />}>
            <p className="mb-3 text-[14px] font-medium text-ink-2">
              <L en="Your height" bn="আপনার উচ্চতা" />
            </p>
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
            <p className="mb-3 mt-8 text-[14px] font-medium text-ink-2">
              <L en="Riding experience" bn="চালানোর অভিজ্ঞতা" />
            </p>
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
        {step === 4 && (
          <Question title={<L en="How often will someone ride behind you?" bn="পেছনে কত ঘন ঘন কেউ বসবে?" />}>
            <div className="grid gap-3 sm:grid-cols-3">
              {(
                [
                  { id: "rarely", en: "Rarely", bn: "কদাচিৎ", sub: "Mostly solo", subBn: "বেশিরভাগ একা" },
                  { id: "sometimes", en: "Sometimes", bn: "মাঝে মাঝে", sub: "Friends, weekends", subBn: "বন্ধু, ছুটির দিন" },
                  { id: "daily", en: "Every day", bn: "প্রতিদিন", sub: "Spouse, kids, passengers", subBn: "স্ত্রী/স্বামী, বাচ্চা, যাত্রী" },
                ] as Opt<Answers["pillion"]>[]
              ).map((o) => (
                <OptionCard key={o.id} active={a.pillion === o.id} onClick={() => { set("pillion", o.id); setTimeout(next, 180); }} opt={o} />
              ))}
            </div>
          </Question>
        )}
        {step === 5 && (
          <Question title={<L en="What matters most?" bn="সবচেয়ে গুরুত্বপূর্ণ কী?" />} sub={<L en="Pick up to three." bn="সর্বোচ্চ তিনটি বাছুন।" />}>
            <div className="flex flex-wrap gap-2">
              {PRIORITIES.map((p) => {
                const on = a.priorities.includes(p.id);
                const full = !on && a.priorities.length >= 3;
                return (
                  <button
                    key={p.id}
                    disabled={full}
                    onClick={() => set("priorities", on ? a.priorities.filter((x) => x !== p.id) : [...a.priorities, p.id])}
                    className={`inline-flex h-12 items-center gap-2 rounded-xl border px-4 text-[15px] font-medium transition-all disabled:opacity-40 ${
                      on ? "border-brand bg-brand-soft text-brand" : "border-line-strong bg-surface text-ink-2 hover:border-ink/30"
                    }`}
                  >
                    {on && <Check size={16} />}
                    <L en={p.en} bn={p.bn} />
                  </button>
                );
              })}
            </div>
          </Question>
        )}
      </div>

      <div className="mt-12 flex items-center justify-between border-t border-line pt-6">
        <button onClick={back} className={`btn-ghost ${step === 0 ? "invisible" : ""}`}>
          <ArrowLeft size={17} /> <L en="Back" bn="পেছনে" />
        </button>
        {step < STEPS - 1 ? (
          <button onClick={next} className="btn-primary px-6">
            <L en="Continue" bn="পরবর্তী" /> <ArrowRight size={17} />
          </button>
        ) : (
          <button onClick={next} className="btn-primary px-6">
            <Sparkles size={17} /> <L en="Show my matches" bn="আমার ম্যাচ দেখান" />
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
  const min = 50000;
  const max = 700000;
  const fill = ((a.budget - min) / (max - min)) * 100;
  return (
    <Question title={<L en="What's your budget?" bn="আপনার বাজেট কত?" />} sub={<L en="The most you'd pay for the bike itself. We'll add registration separately." bn="শুধু বাইকের জন্য সর্বোচ্চ কত দেবেন। রেজিস্ট্রেশন আলাদা।" />}>
      <div className="card p-6 sm:p-8">
        <p className="text-center text-[44px] font-semibold tracking-[-0.03em] text-ink tnum sm:text-[56px]">{formatBDT(a.budget)}</p>
        <p className="text-center text-[14px] text-muted">{formatLakh(a.budget)}</p>
        <input
          type="range"
          className="range mt-6"
          min={min}
          max={max}
          step={5000}
          value={a.budget}
          aria-label="Budget"
          style={{ ["--fill" as string]: `${fill}%` }}
          onChange={(e) => set("budget", Number(e.target.value))}
        />
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          {[130000, 180000, 250000, 350000, 500000].map((v) => (
            <button key={v} className="chip" data-active={a.budget === v} onClick={() => set("budget", v)}>
              {formatLakh(v)}
            </button>
          ))}
        </div>
      </div>
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <OptionCard compact active={a.condition === "new"} onClick={() => set("condition", "new")} opt={{ id: "new", en: "Brand new only", bn: "শুধু নতুন", sub: "Warranty, free services", subBn: "ওয়ারেন্টি, ফ্রি সার্ভিস" }} />
        <OptionCard compact active={a.condition === "any"} onClick={() => set("condition", "any")} opt={{ id: "any", en: "Open to used classics", bn: "পুরনো ক্লাসিকও চলবে", sub: "CG125, RX100 and other legends", subBn: "CG125, RX100 ইত্যাদি" }} />
      </div>
    </Question>
  );
}

/* ---------------- Results ---------------- */

function Results({ a, onEdit, onRestart }: { a: Answers; onEdit: (step: number) => void; onRestart: () => void }) {
  const { lang } = useLang();
  const { compare, toggleCompare, clearCompare } = useStore();
  const matches = useMemo(() => matchBikes(a, 6), [a]);
  const [copied, setCopied] = useState(false);
  const [top, ...rest] = matches;
  const use = USES.find((u) => u.id === a.use)!;

  const share = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {}
  };
  const compareTop3 = () => {
    clearCompare();
    matches.slice(0, 3).forEach((m) => toggleCompare(m.bike.id));
  };

  return (
    <div className="container-x pb-10 pt-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow mb-2">
            <L en="Your matches" bn="আপনার ম্যাচ" />
          </p>
          <h1 className="text-[30px] font-semibold tracking-[-0.03em] text-ink sm:text-[40px]">
            {top ? <L en="Here's what we'd buy in your shoes." bn="আপনার জায়গায় থাকলে আমরা এগুলো কিনতাম।" /> : <L en="Nothing fits — yet." bn="কিছু মিলছে না — এখনো।" />}
          </h1>
        </div>
        <div className="flex gap-2">
          <button onClick={share} className="btn-secondary h-10 px-3.5 text-[14px]">
            {copied ? <Check size={16} /> : <Copy size={16} />} {copied ? "Link copied" : "Share"}
          </button>
          <button onClick={onRestart} className="btn-ghost h-10 px-3.5 text-[14px]">
            <RotateCcw size={16} /> <L en="Start over" bn="আবার শুরু" />
          </button>
        </div>
      </div>

      {/* answers summary */}
      <div className="mt-6 flex flex-wrap gap-2">
        <EditChip onClick={() => onEdit(0)}>
          ≤ {formatLakh(a.budget)} · {a.condition === "new" ? "new" : "new or used"}
        </EditChip>
        <EditChip onClick={() => onEdit(1)}>{lang === "bn" ? use.bn : use.en}</EditChip>
        <EditChip onClick={() => onEdit(2)}>{a.gearless === "yes" ? "Scooter" : a.gearless === "no" ? "Geared" : "Geared or scooter"}</EditChip>
        <EditChip onClick={() => onEdit(3)}>
          {{ short: "Under 5′5″", medium: "5′5″–5′9″", tall: "Over 5′9″" }[a.height]} · {{ first: "first bike", some: "some experience", pro: "experienced" }[a.experience]}
        </EditChip>
        <EditChip onClick={() => onEdit(4)}>Pillion: {a.pillion}</EditChip>
        {a.priorities.length > 0 && <EditChip onClick={() => onEdit(5)}>{a.priorities.join(", ")}</EditChip>}
      </div>

      {!top ? (
        <div className="card mt-10 px-6 py-16 text-center">
          <p className="text-[17px] font-semibold text-ink">No bikes fit all of that.</p>
          <p className="mt-1 text-[14.5px] text-muted">Try raising the budget, allowing used bikes, or choosing “show me both”.</p>
          <button className="btn-primary mt-6" onClick={() => onEdit(0)}>
            Adjust budget
          </button>
        </div>
      ) : (
        <>
          {/* Top match */}
          <div className="card mt-8 grid grid-cols-[minmax(0,1fr)] overflow-hidden shadow-md lg:grid-cols-[1.1fr_1fr]">
            <div className="relative bg-surface-2/70 p-6 sm:p-10">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-brand px-3 py-1 text-[12.5px] font-semibold text-brand-ink">
                <Sparkles size={13} /> <L en="Best match" bn="সেরা ম্যাচ" />
              </span>
              <BikeArt bike={top.bike} className="mx-auto mt-4 w-full max-w-[480px] animate-rise" />
            </div>
            <div className="flex flex-col p-6 sm:p-8">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[13px] font-medium text-muted">
                    {top.bike.brand} · {ccLabel(top.bike)} · {CATEGORIES[top.bike.category].en}
                  </p>
                  <h2 className="mt-1 text-[30px] font-semibold leading-tight tracking-tight text-ink">{top.bike.model}</h2>
                </div>
                <MatchRing value={top.score} />
              </div>
              <p className="mt-3 text-[15px] leading-relaxed text-ink-2">{top.bike.tagline}</p>
              <ul className="mt-5 space-y-2.5">
                {top.reasons.map((r) => (
                  <li key={r} className="flex gap-2.5 text-[14.5px] text-ink-2">
                    <Check size={17} className="mt-0.5 shrink-0 text-good" /> {r}
                  </li>
                ))}
                {top.warnings.map((w) => (
                  <li key={w} className="flex gap-2.5 text-[14.5px] text-ink-2">
                    <TriangleAlert size={16} className="mt-0.5 shrink-0 text-warn" /> {w}
                  </li>
                ))}
              </ul>
              <div className="mt-6 grid grid-cols-3 gap-4 border-t border-line pt-5">
                <MiniStat k="Price" v={formatLakh(top.bike.priceBDT)} />
                <MiniStat k="Mileage" v={`${top.bike.mileageKmpl[0]}–${top.bike.mileageKmpl[1]}`} />
                <MiniStat k="Running/mo" v={formatBDT(ownershipCost(top.bike, { ...DEFAULT_COST_INPUT, includeDepreciation: false }).runningPerMonth)} />
              </div>
              <div className="mt-6 flex flex-wrap gap-2">
                <Link href={`/bikes/${top.bike.id}/`} className="btn-primary">
                  <L en="See full details" bn="বিস্তারিত দেখুন" /> <ArrowRight size={16} />
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
                <h2 className="text-[22px] font-semibold tracking-tight text-ink">
                  <L en="Also great for you" bn="আপনার জন্য আরও ভালো" />
                </h2>
                <Link href={`/compare/?bikes=${matches.slice(0, 3).map((m) => m.bike.id).join(",")}`} onClick={compareTop3} className="btn-secondary h-10 px-4 text-[14px]">
                  <Scale size={16} /> <L en="Compare top 3" bn="সেরা ৩টি তুলনা" />
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
                        <span className="text-[13px] font-semibold text-brand tnum">{m.score}% match</span>
                      </div>
                      <p className="mt-1 text-[13.5px] text-muted">
                        {m.reasons.slice(0, 2).join(" · ")}
                      </p>
                      {m.warnings[0] && (
                        <p className="mt-1 flex items-center gap-1.5 text-[13px] text-warn">
                          <TriangleAlert size={13} /> {m.warnings[0]}
                        </p>
                      )}
                    </div>
                    <div className="col-span-2 flex items-center justify-between gap-3 sm:col-span-1 sm:flex-col sm:items-end">
                      <span className="text-[18px] font-semibold text-ink tnum">{formatLakh(m.bike.priceBDT)}</span>
                      <CompareButton id={m.bike.id} size="sm" />
                    </div>
                  </Link>
                ))}
              </div>
            </>
          )}
          <p className="mt-8 text-[13px] text-faint">
            {compare.length > 0 ? `${compare.length} in your compare tray. ` : ""}Rankings are computed from our 11 ownership scores, your answers and current prices — no brand pays for placement.
          </p>
        </>
      )}
    </div>
  );
}

function EditChip({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <button onClick={onClick} className="chip h-9 gap-2 pr-2.5" title="Edit">
      {children}
      <span className="text-[11.5px] font-semibold text-brand">Edit</span>
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
    <div className="relative h-[68px] w-[68px] shrink-0" aria-label={`${value}% match`}>
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
