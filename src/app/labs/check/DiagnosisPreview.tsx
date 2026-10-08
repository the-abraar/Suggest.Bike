"use client";

import { useState } from "react";
import { Camera, FileAudio, ScanSearch, Video } from "lucide-react";
import { useTx } from "@/lib/i18n";

type Tab = "photo" | "video" | "sound" | "report";

/** Mock-up of the planned AI diagnosis. All numbers and findings are made up and labelled as a sample. */
export function DiagnosisPreview() {
  const tx = useTx();
  const [tab, setTab] = useState<Tab>("photo");
  const tabs: { id: Tab; icon: typeof Camera; label: string }[] = [
    { id: "photo", icon: Camera, label: tx("Photos", "ছবি") },
    { id: "video", icon: Video, label: tx("Walk-around", "ঘুরে দেখা") },
    { id: "sound", icon: FileAudio, label: tx("Engine sound", "ইঞ্জিনের শব্দ") },
    { id: "report", icon: ScanSearch, label: tx("The report", "রিপোর্ট") },
  ];

  return (
    <section className="card overflow-hidden print:hidden" aria-labelledby="diag-h">
      <div className="p-5 sm:p-6">
        <div className="flex flex-wrap items-center gap-2">
          <h2 id="diag-h" className="text-[19px] font-semibold tracking-tight text-ink">{tx("Coming next: let the AI take a first look", "আসছে: AI আগে একবার দেখে নেবে")}</h2>
          <span className="rounded-full bg-warn-soft px-2 py-0.5 text-[11.5px] font-semibold text-warn">{tx("Sample, not a real analysis", "নমুনা, আসল বিশ্লেষণ নয়")}</span>
        </div>
        <p className="mt-2 max-w-2xl text-[14.5px] leading-relaxed text-muted">{tx("Here is what we're building. Today your files stay on your phone and only the sound statistics above are real. Below is a mock-up with made-up findings.", "আমরা যা বানাচ্ছি তা এখানে। আজ আপনার ফাইল ফোনেই থাকে, আর উপরের শব্দের পরিসংখ্যানই শুধু আসল। নিচে বানানো ফলাফলসহ একটি মকআপ।")}</p>
      </div>

      <div role="tablist" className="flex border-y border-line">
        {tabs.map(({ id, icon: Icon, label }) => (
          <button key={id} role="tab" aria-selected={tab === id} onClick={() => setTab(id)} className={`flex flex-1 items-center justify-center gap-1.5 px-2 py-3 text-[13px] font-semibold transition-colors ${tab === id ? "bg-brand-soft text-brand" : "text-muted hover:bg-surface-2"}`}>
            <Icon size={15} aria-hidden /><span className="truncate">{label}</span>
          </button>
        ))}
      </div>

      <div role="tabpanel" className="animate-fade p-5 sm:p-6" key={tab}>
        {tab === "photo" && <Photo />}
        {tab === "video" && <Walk />}
        {tab === "sound" && <Sound />}
        {tab === "report" && <Report />}
      </div>
    </section>
  );
}

function Pin({ n, x, y }: { n: number; x: string; y: string }) {
  return <span className="absolute grid h-6 w-6 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-signal text-[12px] font-bold text-white shadow ring-2 ring-white" style={{ left: x, top: y }}>{n}</span>;
}

function Photo() {
  const tx = useTx();
  return (
    <div className="grid gap-5 md:grid-cols-2">
      <div className="relative aspect-[5/3] rounded-xl bg-surface-3" aria-hidden>
        <svg viewBox="0 0 250 150" className="h-full w-full text-ink/25"><circle cx="55" cy="105" r="28" fill="none" stroke="currentColor" strokeWidth="5" /><circle cx="195" cy="105" r="28" fill="none" stroke="currentColor" strokeWidth="5" /><path d="M55 105 L100 60 L150 60 L195 105 M100 60 L90 40 L120 40 M130 75 h35 v22 h-35z" fill="none" stroke="currentColor" strokeWidth="5" strokeLinejoin="round" /></svg>
        <Pin n={1} x="52%" y="55%" /><Pin n={2} x="22%" y="70%" /><Pin n={3} x="30%" y="40%" />
      </div>
      <ul className="space-y-3 text-[14px] leading-relaxed text-ink-2">
        <li><b className="text-ink">1 · </b>{tx("Fresh paint overspray near the engine mount. Possible repaint after a fall.", "ইঞ্জিন মাউন্টের কাছে নতুন রঙের ছিটা। পড়ে যাওয়ার পর রং করা হতে পারে।")}</li>
        <li><b className="text-ink">2 · </b>{tx("Fork seal looks oily. Ask to see it cleaned and re-checked.", "ফর্ক সিল তেলতেলে দেখাচ্ছে। পরিষ্কার করে আবার দেখতে বলুন।")}</li>
        <li><b className="text-ink">3 · </b>{tx("Chassis photo is too blurry to read. Retake it in daylight.", "চেসিসের ছবি পড়ার মতো নয়। দিনের আলোয় আবার তুলুন।")}</li>
      </ul>
    </div>
  );
}

const DOT = { good: "bg-good", warn: "bg-warn", signal: "bg-signal" } as const;

function Walk() {
  const tx = useTx();
  const marks = [[tx("Cold start", "ঠান্ডা স্টার্ট"), "0:12", "good"], [tx("Smoke colour", "ধোঁয়ার রং"), "0:31", "warn"], [tx("Chain slack", "চেইন ঢিলা"), "0:58", "good"], [tx("Frame weld", "ফ্রেমের ওয়েল্ড"), "1:20", "signal"]] as const;
  return (
    <div>
      <p className="text-[14px] text-muted">{tx("Film a 90-second walk-around. We'd mark the moments that matter, so you don't re-watch it.", "৯০ সেকেন্ডের ভিডিও করুন। যেসব মুহূর্ত জরুরি আমরা চিহ্নিত করে দিতাম, যাতে আবার পুরোটা দেখতে না হয়।")}</p>
      <div className="relative mt-4 h-2 rounded-full bg-surface-3" aria-hidden>
        {marks.map(([, t, c]) => { const [m, s] = t.split(":").map(Number); return <span key={t} className={`absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full ring-2 ring-white ${DOT[c]}`} style={{ left: `${((m * 60 + s) / 90) * 100}%` }} />; })}
      </div>
      <ul className="mt-5 grid gap-2 sm:grid-cols-2">
        {marks.map(([l, t, c]) => <li key={t} className="flex items-center justify-between rounded-lg bg-surface-2 px-3 py-2 text-[14px]"><span className="flex items-center gap-2 text-ink-2"><span className={`h-2.5 w-2.5 rounded-full ${DOT[c]}`} aria-hidden />{l}</span><b className="text-ink tnum">{t}</b></li>)}
      </ul>
    </div>
  );
}

function Sound() {
  const tx = useTx();
  const bars = Array.from({ length: 48 }, (_, i) => 18 + Math.abs(Math.sin(i * 0.7)) * 40 + (i > 30 && i < 36 ? 30 : 0));
  return (
    <div className="grid gap-5 md:grid-cols-2">
      <div>
        <div className="flex h-24 items-center gap-[3px]" aria-hidden>
          {bars.map((h, i) => <span key={i} className={`w-full rounded-full ${i > 30 && i < 36 ? "bg-warn" : "bg-brand/70"}`} style={{ height: `${h}%` }} />)}
        </div>
        <p className="mt-2 text-[12.5px] text-faint">{tx("Idle, then a rev. The amber part is the one the AI would flag.", "আইডল, তারপর রেভ। হলুদ অংশটিই AI চিহ্নিত করত।")}</p>
      </div>
      <ul className="space-y-3 text-[14px] leading-relaxed text-ink-2">
        <li>{tx("Idle is steady, with no hunting.", "আইডল স্থির, ওঠানামা নেই।")}</li>
        <li><b className="text-warn">{tx("A rhythmic tick under rev.", "রেভে নিয়মিত টিক শব্দ।")}</b> {tx("Often valves or a tired piston. Worth a mechanic's ear.", "প্রায়ই ভাল্ব বা ক্লান্ত পিস্টন। মিস্ত্রিকে শোনানো ভালো।")}</li>
        <li>{tx("Compared with healthy samples of the same model.", "একই মডেলের ভালো বাইকের নমুনার সাথে তুলনা করে।")}</li>
      </ul>
    </div>
  );
}

function Report() {
  const tx = useTx();
  return (
    <div className="grid gap-5 md:grid-cols-[1fr_1fr]">
      <div className="card bg-surface-2/50 p-5">
        <p className="text-[12.5px] font-semibold uppercase tracking-wide text-muted">{tx("Sample value", "নমুনা দাম")}</p>
        <p className="mt-1 text-[28px] font-semibold tracking-tight text-ink tnum">৳1.38 – 1.52 {tx("lakh", "লাখ")}</p>
        <p className="mt-1 text-[13.5px] text-muted">{tx("Down ৳8,000 for the repaint sign. Down ৳5,000 for the engine tick.", "রঙের চিহ্নের জন্য ৮,০০০ টাকা কম। ইঞ্জিনের টিকের জন্য ৫,০০০ টাকা কম।")}</p>
      </div>
      <div className="space-y-2 text-[14px] text-ink-2">
        <p className="font-semibold text-ink">{tx("Verdict: negotiate, after a mechanic listens to it.", "রায়: দরদাম করুন, আগে মিস্ত্রিকে শুনিয়ে নিন।")}</p>
        <p>{tx("Then it hands you the three questions to ask the seller and the two things to inspect first.", "তারপর বিক্রেতাকে করার তিনটি প্রশ্ন আর আগে দেখার দুটি জিনিস দিয়ে দেয়।")}</p>
      </div>
    </div>
  );
}
