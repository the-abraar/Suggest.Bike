"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CheckCircle2, CircleHelp, Moon, Pause, Play, Search, XCircle } from "lucide-react";
import { useTx } from "@/lib/i18n";

const STEPS = 4;

/** A scripted walkthrough of the finished product. Everything here is a mock-up with made-up data, labelled as such. */
export function FlowPreview() {
  const tx = useTx();
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(true);

  useEffect(() => {
    if (!playing) return;
    if (typeof matchMedia !== "undefined" && matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setInterval(() => setStep((s) => (s + 1) % STEPS), 5500);
    return () => clearInterval(id);
  }, [playing]);

  const titles = [
    tx("1 · You describe it", "১ · আপনি লিখে দেন"),
    tx("2 · Midnight search", "২ · মাঝরাতের খোঁজ"),
    tx("3 · WhatsApp ping", "৩ · হোয়াটসঅ্যাপে খবর"),
    tx("4 · You go see it", "৪ · গিয়ে দেখেন"),
  ];

  return (
    <section className="card overflow-hidden" aria-labelledby="flow-h">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line p-5 sm:px-6">
        <div>
          <h2 id="flow-h" className="text-[19px] font-semibold tracking-tight text-ink">{tx("See how it will feel", "কেমন লাগবে দেখুন")}</h2>
          <p className="mt-1 text-[13.5px] text-muted">{tx("A sample run with made-up data. Nothing below is a real listing.", "বানানো তথ্য দিয়ে একটি নমুনা। নিচের কিছুই আসল বিজ্ঞাপন নয়।")}</p>
        </div>
        <button type="button" className="btn-ghost h-9 gap-1.5 px-3 text-[13px]" onClick={() => setPlaying((p) => !p)} aria-label={playing ? tx("Pause the demo", "ডেমো থামান") : tx("Play the demo", "ডেমো চালান")}>
          {playing ? <Pause size={14} aria-hidden /> : <Play size={14} aria-hidden />}
          {playing ? tx("Pause", "থামান") : tx("Play", "চালান")}
        </button>
      </div>

      <div role="tablist" aria-label={tx("Steps", "ধাপ")} className="grid grid-cols-2 border-b border-line sm:grid-cols-4">
        {titles.map((t, i) => (
          <button
            key={i}
            role="tab"
            aria-selected={step === i}
            onClick={() => { setStep(i); setPlaying(false); }}
            className={`px-3 py-3 text-left text-[13px] font-semibold transition-colors ${step === i ? "bg-brand-soft text-brand" : "text-muted hover:bg-surface-2"}`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="grid min-h-[340px] gap-6 p-5 sm:p-6 md:grid-cols-[1fr_300px]" role="tabpanel" key={step}>
        <div className="animate-fade space-y-4 self-center">
          {step === 0 && <StepRequest />}
          {step === 1 && <StepSearch />}
          {step === 2 && <StepReport />}
          {step === 3 && <StepNext />}
        </div>
        <Phone step={step} />
      </div>
    </section>
  );
}

function Chip({ children }: { children: React.ReactNode }) {
  return <span className="rounded-full bg-surface-2 px-2.5 py-1 text-[12.5px] font-medium text-ink-2">{children}</span>;
}

function StepRequest() {
  const tx = useTx();
  return (
    <>
      <h3 className="text-[22px] font-semibold tracking-tight text-ink">{tx("Say it the way you'd tell a friend.", "বন্ধুকে যেভাবে বলতেন, সেভাবেই লিখুন।")}</h3>
      <div className="card space-y-3 bg-surface-2/50 p-4">
        <p className="text-[15px] font-semibold text-ink">Yamaha RX 115</p>
        <div className="flex flex-wrap gap-2">
          <Chip>{tx("Maroon", "মেরুন")}</Chip><Chip>1996–2002</Chip><Chip>{tx("Under ৳1.6 lakh", "১.৬ লাখের নিচে")}</Chip><Chip>{tx("Dhaka · Chattogram", "ঢাকা · চট্টগ্রাম")}</Chip><Chip>{tx("Clean blue book", "পরিষ্কার ব্লু বুক")}</Chip>
        </div>
        <p className="rounded-lg bg-surface p-3 text-[14px] italic text-ink-2">“{tx("Original cylinder sleeve, never rebored. Stock exhaust.", "আসল সিলিন্ডার স্লিভ, কখনো রিবোর হয়নি। স্টক এক্সহস্ট।")}”</p>
      </div>
      <p className="text-[14.5px] leading-relaxed text-muted">{tx("Tick the WhatsApp box once, and you're done. No account, no app.", "একবার হোয়াটসঅ্যাপের বাক্সে টিক দিন, ব্যস। অ্যাকাউন্ট বা অ্যাপ লাগবে না।")}</p>
    </>
  );
}

function StepSearch() {
  const tx = useTx();
  const rows = [
    [tx("Public listings scanned", "পাবলিক বিজ্ঞাপন দেখা হয়েছে"), "412"],
    [tx("Mention RX 115", "RX 115 উল্লেখ আছে"), "9"],
    [tx("Inside your budget and places", "বাজেট ও এলাকার মধ্যে"), "3"],
    [tx("Say \"rebored\" or \"modified\"", "\"রিবোর\" বা \"মডিফাইড\" লেখা"), tx("1 dropped", "১টি বাদ")],
  ];
  return (
    <>
      <h3 className="flex items-center gap-2 text-[22px] font-semibold tracking-tight text-ink"><Moon size={20} className="text-brand" aria-hidden />{tx("While you sleep.", "আপনি যখন ঘুমিয়ে।")}</h3>
      <p className="text-[14.5px] leading-relaxed text-muted">{tx("Every midnight (Dhaka time) we look again. Most nights there's nothing, and that's fine: we keep going for 60 days.", "প্রতি মাঝরাতে (ঢাকার সময়) আবার খুঁজি। বেশিরভাগ রাতে কিছু থাকে না, সমস্যা নেই: ৬০ দিন চলতে থাকে।")}</p>
      <ul className="card divide-y divide-line">
        {rows.map(([a, b]) => (
          <li key={a} className="flex items-center justify-between gap-3 px-4 py-2.5 text-[14px]"><span className="flex items-center gap-2 text-ink-2"><Search size={14} className="text-faint" aria-hidden />{a}</span><b className="text-ink tnum">{b}</b></li>
        ))}
      </ul>
    </>
  );
}

function StepReport() {
  const tx = useTx();
  return (
    <>
      <h3 className="text-[22px] font-semibold tracking-tight text-ink">{tx("A match report, not just a link.", "শুধু লিংক নয়, একটি ম্যাচ রিপোর্ট।")}</h3>
      <div className="card space-y-3 p-4">
        <div className="flex items-center justify-between"><span className="text-[14px] font-semibold text-ink">{tx("Match score", "ম্যাচ স্কোর")}</span><span className="rounded-full bg-good-soft px-2.5 py-0.5 text-[13px] font-bold text-good tnum">88 / 100</span></div>
        <ul className="space-y-2 text-[14px] text-ink-2">
          <li className="flex gap-2"><CheckCircle2 size={16} className="mt-0.5 shrink-0 text-good" aria-hidden />{tx("Maroon, 1999, ৳1.45 lakh, Mirpur", "মেরুন, ১৯৯৯, ১.৪৫ লাখ, মিরপুর")}</li>
          <li className="flex gap-2"><CircleHelp size={16} className="mt-0.5 shrink-0 text-warn" aria-hidden />{tx("Original sleeve: the ad is silent. Ask for the engine-open history.", "আসল স্লিভ: বিজ্ঞাপনে কিছু নেই। ইঞ্জিন খোলার ইতিহাস জিজ্ঞেস করুন।")}</li>
          <li className="flex gap-2"><XCircle size={16} className="mt-0.5 shrink-0 text-muted" aria-hidden />{tx("Aftermarket silencer mentioned", "আফটারমার্কেট সাইলেন্সারের কথা আছে")}</li>
        </ul>
      </div>
    </>
  );
}

function StepNext() {
  const tx = useTx();
  return (
    <>
      <h3 className="text-[22px] font-semibold tracking-tight text-ink">{tx("Then verify it properly.", "তারপর ঠিকমতো যাচাই করুন।")}</h3>
      <p className="text-[14.5px] leading-relaxed text-muted">{tx("The report can't see inside the engine, so it hands you over to the tools that help you check the bike and the seller.", "রিপোর্ট ইঞ্জিনের ভেতর দেখতে পারে না, তাই বাইক আর বিক্রেতা যাচাইয়ের টুলে পাঠিয়ে দেয়।")}</p>
      <div className="grid gap-3 sm:grid-cols-2">
        <Link href="/labs/check/?bike=yamaha-rx-115" className="card p-4 text-[14px] transition-colors hover:border-line-strong"><b className="block text-ink">{tx("RX 115 checklist", "RX 115 চেকলিস্ট")}</b><span className="text-muted">{tx("What to check in person", "সামনাসামনি কী দেখবেন")}</span></Link>
        <Link href="/labs/listing-check/?bike=yamaha-rx-115" className="card p-4 text-[14px] transition-colors hover:border-line-strong"><b className="block text-ink">{tx("Listing check", "বিজ্ঞাপন যাচাই")}</b><span className="text-muted">{tx("Is the seller and price sane?", "বিক্রেতা ও দাম ঠিক আছে?")}</span></Link>
      </div>
    </>
  );
}

/** Phone mock-up that follows the step. */
function Phone({ step }: { step: number }) {
  const tx = useTx();
  const show = step >= 2;
  return (
    <div className="mx-auto w-full max-w-[300px] self-center rounded-[28px] border-4 border-ink/80 bg-surface-2 p-3" aria-hidden>
      <div className="mb-2 flex items-center gap-2 rounded-xl bg-good px-3 py-2 text-[12.5px] font-semibold text-white"><span className="grid h-6 w-6 place-items-center rounded-full bg-white/25">S</span>Suggest.Bike</div>
      <div className="min-h-[200px] space-y-2 text-[12.5px] leading-snug">
        {!show && <p className="mt-16 text-center text-faint">{step === 0 ? tx("Waiting for your request…", "আপনার অনুরোধের অপেক্ষায়…") : tx("00:00 · searching…", "০০:০০ · খোঁজা হচ্ছে…")}</p>}
        {show && (
          <>
            <p className="animate-fade rounded-xl rounded-tl-sm bg-surface p-2.5 text-ink-2">
              {tx("New match for your RX 115 (maroon): 88/100. ৳1.45 lakh, Mirpur. Ask about the sleeve before you go.", "আপনার RX 115 (মেরুন)-এর নতুন ম্যাচ: ৮৮/১০০। ১.৪৫ লাখ, মিরপুর। যাওয়ার আগে স্লিভের কথা জিজ্ঞেস করুন।")}
              <span className="mt-1 block text-brand">bikroy.com/…</span>
            </p>
            <p className="ml-auto w-fit rounded-xl rounded-tr-sm bg-good-soft px-2.5 py-1.5 text-ink-2">{tx("Thanks!", "ধন্যবাদ!")}</p>
            <p className="text-center text-[11px] text-faint">{tx("Reply STOP any time to end alerts", "যেকোনো সময় STOP লিখে বন্ধ করুন")}</p>
          </>
        )}
      </div>
    </div>
  );
}
