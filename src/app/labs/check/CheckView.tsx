"use client";

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Check, ChevronDown, Printer, RotateCcw, ShieldAlert, ShieldCheck, ShieldQuestion, TriangleAlert } from "lucide-react";
import { BIKES, fullName, getBike } from "@/lib/bikes";
import { useTx } from "@/lib/i18n";
import { BikePicker } from "@/components/form";
import { ExperimentalBadge, ExperimentalBanner } from "@/components/Experimental";
import { ShareButton } from "@/components/ui";
import { buildChecklist, decodeTicks, encodeTicks, trust, type CheckItem, type Severity, type Tick, type Ticks, type Verdict } from "@/lib/usedcheck/checklist";
import type { Bike, BikeLite } from "@/lib/types";
import { MediaZone } from "./MediaZone";
import { ValuePanel, type ValueForm } from "./ValuePanel";

export function CheckView() {
  return (
    <Suspense>
      <Check_ />
    </Suspense>
  );
}

const DEFAULT_BIKE = "bajaj-pulsar-150";
const KEY = (id: string) => `sb-check-v1:${id}`;

type Saved = { t: Ticks; f: ValueForm };

function load(id: string): Saved | null {
  try {
    const raw = localStorage.getItem(KEY(id));
    if (!raw) return null;
    const j = JSON.parse(raw) as Saved;
    return j && typeof j === "object" && j.t ? j : null;
  } catch {
    return null;
  }
}

function defaultForm(b: BikeLite, nowYear: number): ValueForm {
  return { yearMade: nowYear - 3, km: b.status === "used-only" ? 50000 : 21000, owners: 1, paper: "clean", condition: "good" };
}

function Check_() {
  const params = useSearchParams();
  const tx = useTx();
  const nowYear = useMemo(() => new Date().getFullYear(), []);

  const [bike, setBike] = useState<BikeLite>(() => getBike(DEFAULT_BIKE) ?? BIKES[0]);
  const [fullRaw, setFull] = useState<Bike | null>(null);
  const [fs, setFs] = useState<{ id: string; status: "ready" | "failed" } | null>(null);
  // Only trust a record that belongs to the bike on screen.
  const full = fullRaw && fullRaw.id === bike.id ? fullRaw : null;
  const fullState: "loading" | "ready" | "failed" = fs && fs.id === bike.id ? fs.status : "loading";
  const [ticks, setTicks] = useState<Ticks>({});
  const [form, setForm] = useState<ValueForm>(() => defaultForm(bike, nowYear));
  const ready = useRef(false); // set once the URL / storage state for the current bike has been applied
  const pendingCode = useRef<string | null>(null);
  const initDone = useRef(false);

  // First load: pick the bike from ?bike= and remember a shared tick code.
  useEffect(() => {
    if (initDone.current) return;
    initDone.current = true;
    const id = params.get("bike");
    const b = id ? getBike(id) : undefined;
    if (b) {
      setBike(b);
      setForm(defaultForm(b, nowYear));
    }
    pendingCode.current = b ? params.get("c") : null;
  }, [params, nowYear]);

  // Load the full record (quirks, parts) for the model-specific section.
  useEffect(() => {
    let alive = true;
    ready.current = false;
    fetch(`/data/bikes/${bike.id}.json`)
      .then((r) => (r.ok ? (r.json() as Promise<Bike>) : Promise.reject(new Error("bad"))))
      .then((j) => {
        if (!alive) return;
        setFull(j);
        setFs({ id: bike.id, status: "ready" });
      })
      .catch(() => {
        if (alive) setFs({ id: bike.id, status: "failed" });
      });
    return () => {
      alive = false;
    };
  }, [bike.id]);

  const { sections, items, shots } = useMemo(() => buildChecklist(bike, full), [bike, full]);

  // When the checklist for this bike is final, restore a shared code or saved progress.
  useEffect(() => {
    if (fullState === "loading") return;
    const code = pendingCode.current;
    pendingCode.current = null;
    const saved = load(bike.id);
    setTicks(code ? decodeTicks(items, code) : (saved?.t ?? {}));
    setForm(saved?.f ?? defaultForm(bike, nowYear));
    ready.current = true;
    // `items` is derived from bike and full; fullState changes exactly when it is final.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fullState, bike.id]);

  // Save progress and keep the share link current.
  useEffect(() => {
    if (!ready.current) return;
    try {
      localStorage.setItem(KEY(bike.id), JSON.stringify({ t: ticks, f: form } satisfies Saved));
    } catch {}
    try {
      const u = new URL(window.location.href);
      u.searchParams.set("bike", bike.id);
      const code = encodeTicks(items, ticks);
      if (/[op]/.test(code)) u.searchParams.set("c", code);
      else u.searchParams.delete("c");
      window.history.replaceState(null, "", u.toString());
    } catch {}
  }, [ticks, form, bike.id, items]);

  const set = useCallback((id: string, t: Tick) => setTicks((p) => ({ ...p, [id]: p[id] === t ? undefined : t })), []);
  const reset = () => {
    setTicks({});
    setForm(defaultForm(bike, nowYear));
  };

  const tr = useMemo(() => trust(items, ticks), [items, ticks]);
  const problems = useMemo(() => ({ dealbreaker: tr.dealbreakers, serious: tr.serious, minor: tr.minor }), [tr.dealbreakers, tr.serious, tr.minor]);

  const pickBike = (b: BikeLite) => {
    if (b.id === bike.id) return;
    setBike(b);
  };

  return (
    <div className="container-x py-8 sm:py-12">
      <div className="flex flex-wrap items-center gap-2">
        <ExperimentalBadge />
        <span className="eyebrow">{tx("Labs", "ল্যাবস")}</span>
      </div>
      <h1 className="mt-2 text-[28px] font-bold leading-tight tracking-tight text-ink sm:text-[36px]">{tx("Used-bike check", "পুরনো বাইক যাচাই")}</h1>
      <p className="mt-2 max-w-2xl text-[15.5px] leading-relaxed text-muted">
        {tx(
          "Pick the model. Get a checklist made for it, tick what you find at the seller's place, and see a price range for what it should cost.",
          "মডেল বাছুন। সেটির জন্য বানানো চেকলিস্ট পাবেন। বিক্রেতার কাছে যা পান টিক দিন, আর দেখুন দাম কত হওয়া উচিত।",
        )}
      </p>
      <div className="mt-5 print:hidden">
        <ExperimentalBanner />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-start">
        <div className="min-w-0 space-y-6">
          <div className="card p-5 print:hidden sm:p-6">
            <BikePicker bike={bike} onPick={pickBike} />
            <ModelFacts bike={bike} />
          </div>
          <p className="hidden text-[18px] font-semibold text-ink print:block">
            {fullName(bike)} · {new Date().toLocaleDateString()}
          </p>

          {fullState === "failed" && (
            <p className="rounded-xl bg-warn-soft p-3.5 text-[14px] text-warn" role="status">
              {tx("We could not load this model's own notes, so the section for known problems is missing. The general checklist still works.", "এই মডেলের নিজস্ব তথ্য লোড করা যায়নি, তাই পরিচিত সমস্যার অংশ নেই। সাধারণ চেকলিস্ট কাজ করছে।")}
            </p>
          )}

          <div className="space-y-5">
            {sections.map((s) => (
              <SectionCard key={s.id} title={tx(s.title.en, s.title.bn)} items={s.items} ticks={ticks} onTick={set} note={s.id === "model" && full ? tx(full.mechanicNote, full.bn?.mechanicNote ?? full.mechanicNote) : undefined} />
            ))}
            {fullState === "loading" && <p className="text-[13.5px] text-muted">{tx("Loading this model's notes…", "এই মডেলের তথ্য লোড হচ্ছে…")}</p>}
          </div>
          <p className="text-[12.5px] text-faint">
            {tx(
              "Paperwork items follow our Buyer's guide (BRTA and BSP, checked 6 Oct 2026). Inspection steps are general good practice. The known-problem items come from owner reports in our bike data, not from tests.",
              "কাগজের অংশ আমাদের ক্রেতা গাইড (BRTA ও BSP, ৬ অক্টোবর ২০২৬ যাচাই) অনুসারে। পরিদর্শনের ধাপ সাধারণ ভালো নিয়ম। পরিচিত সমস্যার অংশ আমাদের বাইক তথ্যে মালিকদের অভিজ্ঞতা থেকে, পরীক্ষা থেকে নয়।",
            )}
          </p>
        </div>

        <aside className="min-w-0 space-y-6 lg:sticky lg:top-20">
          <TrustCard tr={tr} onReset={reset} bikeName={fullName(bike)} />
        </aside>
      </div>

      <div className="mt-6 space-y-6">
        <ValuePanel bike={bike} form={form} onChange={setForm} problems={problems} coverage={tr.coverage} nowYear={nowYear} />
        <MediaZone shots={shots} items={items} />
      </div>
    </div>
  );
}

function ModelFacts({ bike }: { bike: BikeLite }) {
  const tx = useTx();
  const e = bike.engine;
  const bits = [
    `${Math.round(e.cc)}cc`,
    e.stroke === 2 ? tx("2-stroke", "২-স্ট্রোক") : tx("4-stroke", "৪-স্ট্রোক"),
    e.cooling === "liquid" ? tx("liquid-cooled", "লিকুইড-কুলড") : e.cooling === "oil" ? tx("oil-cooled", "অয়েল-কুলড") : tx("air-cooled", "এয়ার-কুলড"),
    e.fuel === "fi" ? tx("fuel injection", "ফুয়েল ইনজেকশন") : tx("carburettor", "কার্বুরেটর"),
    bike.gears === 0 ? tx("CVT scooter", "CVT স্কুটার") : tx(`${bike.gears}-speed`, `${bike.gears}-গিয়ার`),
    bike.brakes.abs === "none" || bike.brakes.abs === "cbs" ? tx("no ABS", "ABS নেই") : tx("ABS", "ABS"),
  ];
  return (
    <div className="mt-3">
      <p className="text-[13px] text-muted">
        {tx("The checklist adapts to: ", "চেকলিস্ট মানিয়ে নেয়: ")}
        {bits.join(" · ")}
        {bike.status === "used-only" && ` · ${tx("sold only second-hand", "শুধু সেকেন্ড-হ্যান্ড মেলে")}`}
      </p>
    </div>
  );
}

const SEV_STYLE: Record<Severity, string> = {
  dealbreaker: "bg-signal-soft text-signal",
  serious: "bg-warn-soft text-warn",
  minor: "bg-surface-2 text-muted",
};

function SectionCard({ title, items, ticks, onTick, note }: { title: string; items: CheckItem[]; ticks: Ticks; onTick: (id: string, t: Tick) => void; note?: string }) {
  const tx = useTx();
  const done = items.filter((i) => ticks[i.id]).length;
  return (
    <section className="card overflow-hidden" aria-label={title}>
      <header className="flex items-center justify-between gap-3 border-b border-line bg-surface-2/60 px-4 py-3 sm:px-5">
        <h2 className="text-[16.5px] font-semibold text-ink">{title}</h2>
        <span className="shrink-0 text-[12.5px] text-muted tnum">
          {done}/{items.length}
        </span>
      </header>
      {note && <p className="border-b border-line px-4 py-3 text-[13.5px] leading-relaxed text-muted sm:px-5">{tx("Servicing: ", "সার্ভিস: ")}{note}</p>}
      <ul className="divide-y divide-line">
        {items.map((it) => (
          <ItemRow key={it.id} it={it} tick={ticks[it.id]} onTick={onTick} />
        ))}
      </ul>
    </section>
  );
}

function ItemRow({ it, tick, onTick }: { it: CheckItem; tick: Tick | undefined; onTick: (id: string, t: Tick) => void }) {
  const tx = useTx();
  const sevLabel = { dealbreaker: tx("Dealbreaker", "ডিলব্রেকার"), serious: tx("Serious", "গুরুতর"), minor: tx("Minor", "ছোট") }[it.severity];
  return (
    <li className="px-4 py-3.5 sm:px-5">
      <div className="flex flex-wrap items-start gap-x-2 gap-y-1">
        <span className={`mt-0.5 inline-flex shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold ${SEV_STYLE[it.severity]}`}>{sevLabel}</span>
        <p className="min-w-0 flex-1 basis-48 text-[14.5px] font-medium leading-snug text-ink">{tx(it.title.en, it.title.bn)}</p>
      </div>
      <div className="mt-2.5 flex flex-wrap items-center gap-2 print:hidden" role="group" aria-label={tx(`Result for: ${it.title.en}`, `ফলাফল: ${it.title.bn}`)}>
        <button type="button" aria-pressed={tick === "ok"} onClick={() => onTick(it.id, "ok")} className={`inline-flex h-9 items-center gap-1.5 rounded-lg border px-3 text-[13.5px] font-medium transition-colors ${tick === "ok" ? "border-good bg-good-soft text-good" : "border-line-strong text-ink-2 hover:bg-surface-2"}`}>
          <Check size={15} aria-hidden /> {tx("Fine", "ঠিক আছে")}
        </button>
        <button type="button" aria-pressed={tick === "problem"} onClick={() => onTick(it.id, "problem")} className={`inline-flex h-9 items-center gap-1.5 rounded-lg border px-3 text-[13.5px] font-medium transition-colors ${tick === "problem" ? "border-signal bg-signal-soft text-signal" : "border-line-strong text-ink-2 hover:bg-surface-2"}`}>
          <TriangleAlert size={15} aria-hidden /> {tx("Problem", "সমস্যা")}
        </button>
        <span className="text-[12.5px] text-faint">{tick ? "" : tx("Not checked", "দেখা হয়নি")}</span>
      </div>
      <p className="mt-1 hidden text-[13px] text-ink-2 print:block">{tick === "ok" ? tx("Fine", "ঠিক আছে") : tick === "problem" ? tx("PROBLEM", "সমস্যা") : tx("Not checked", "দেখা হয়নি")}</p>
      <details className="group mt-2 print:hidden">
        <summary className="inline-flex cursor-pointer list-none items-center gap-1 text-[13px] font-medium text-brand">
          <ChevronDown size={14} className="transition-transform group-open:rotate-180" aria-hidden /> {tx("How to check", "কীভাবে দেখবেন")}
        </summary>
        <dl className="mt-2 space-y-2 rounded-xl bg-surface-2 p-3 text-[13.5px] leading-relaxed text-ink-2">
          <div>
            <dt className="font-semibold text-ink">{tx("How", "কীভাবে")}</dt>
            <dd>{tx(it.how.en, it.how.bn)}</dd>
          </div>
          <div>
            <dt className="font-semibold text-signal">{tx("Red flag", "বিপদ সংকেত")}</dt>
            <dd>{tx(it.red.en, it.red.bn)}</dd>
          </div>
          <div>
            <dt className="font-semibold text-good">{tx("Fine", "ঠিক আছে")}</dt>
            <dd>{tx(it.fine.en, it.fine.bn)}</dd>
          </div>
        </dl>
      </details>
    </li>
  );
}

const VERDICT: Record<Verdict, { en: string; bn: string; tone: string; Icon: typeof ShieldCheck; sub: { en: string; bn: string } }> = {
  walk: { en: "Walk away", bn: "সরে আসুন", tone: "text-signal", Icon: ShieldAlert, sub: { en: "A dealbreaker or too many serious problems.", bn: "ডিলব্রেকার বা অনেক গুরুতর সমস্যা আছে।" } },
  negotiate: { en: "Negotiate hard", bn: "কঠিন দরাদরি করুন", tone: "text-warn", Icon: ShieldQuestion, sub: { en: "Real problems found. Use them to bring the price down.", bn: "আসল সমস্যা পাওয়া গেছে। এগুলো দিয়ে দাম কমান।" } },
  decent: { en: "Looks decent", bn: "মোটামুটি ভালো", tone: "text-good", Icon: ShieldCheck, sub: { en: "Nothing serious found in what you checked.", bn: "যা দেখেছেন তাতে গুরুতর কিছু নেই।" } },
  unsure: { en: "Not enough checked", bn: "যথেষ্ট দেখা হয়নি", tone: "text-muted", Icon: ShieldQuestion, sub: { en: "Check at least half of the list by importance before judging.", bn: "রায় দেওয়ার আগে গুরুত্ব অনুযায়ী অন্তত অর্ধেক তালিকা দেখুন।" } },
};

function TrustCard({ tr, onReset, bikeName }: { tr: ReturnType<typeof trust>; onReset: () => void; bikeName: string }) {
  const tx = useTx();
  const v = VERDICT[tr.verdict];
  return (
    <section className="card p-5" aria-labelledby="trust-h">
      <p id="trust-h" className="eyebrow">{tx("Trust summary", "ভরসার সারাংশ")}</p>
      <div className={`mt-2 flex items-center gap-2.5 ${v.tone}`} role="status">
        <v.Icon size={30} aria-hidden />
        <p className="text-[24px] font-bold leading-tight">{tx(v.en, v.bn)}</p>
      </div>
      <p className="mt-1 text-[14px] text-muted">{tx(v.sub.en, v.sub.bn)}</p>
      <dl className="mt-4 grid grid-cols-3 gap-2 text-center">
        <div className="rounded-xl bg-surface-2 p-2.5">
          <dd className="text-[22px] font-bold text-ink tnum">{tr.score ?? "–"}</dd>
          <dt className="text-[11.5px] text-muted">{tx("Score of 100", "১০০-তে স্কোর")}</dt>
        </div>
        <div className="rounded-xl bg-surface-2 p-2.5">
          <dd className={`text-[22px] font-bold tnum ${tr.dealbreakers ? "text-signal" : "text-ink"}`}>{tr.dealbreakers}</dd>
          <dt className="text-[11.5px] text-muted">{tx("Dealbreakers", "ডিলব্রেকার")}</dt>
        </div>
        <div className="rounded-xl bg-surface-2 p-2.5">
          <dd className="text-[22px] font-bold text-ink tnum">{tr.serious}</dd>
          <dt className="text-[11.5px] text-muted">{tx("Serious", "গুরুতর")}</dt>
        </div>
      </dl>
      <div className="mt-4">
        <div className="flex justify-between text-[12.5px] text-muted">
          <span>{tx("Checked", "দেখা হয়েছে")}</span>
          <span className="tnum">{tr.checked}/{tr.total}</span>
        </div>
        <div className="mt-1 h-2 overflow-hidden rounded-full bg-surface-3" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(tr.coverage * 100)} aria-label={tx("Share of the list checked, weighted by importance", "তালিকার কতটা দেখা হয়েছে, গুরুত্ব অনুযায়ী")}>
          <div className="h-full rounded-full bg-brand transition-all" style={{ width: `${Math.round(tr.coverage * 100)}%` }} />
        </div>
        <p className="mt-1 text-[12px] text-faint">{tx("Weighted by importance: dealbreakers count most.", "গুরুত্ব অনুযায়ী ওজন: ডিলব্রেকারের মান সবচেয়ে বেশি।")}</p>
      </div>
      <p className="mt-3 text-[12.5px] text-faint">{tx("The score is the share of what you checked that is fine. It is a guide, not a verdict.", "স্কোর হলো যা দেখেছেন তার কতটা ঠিক। এটা দিকনির্দেশনা, চূড়ান্ত রায় নয়।")}</p>
      <div className="mt-4 flex flex-wrap gap-2 print:hidden">
        <ShareButton title={`${bikeName}: ${tx("used-bike check", "পুরনো বাইক যাচাই")}`} text={`${tx(v.en, v.bn)} (${tr.checked}/${tr.total})`} />
        <button type="button" onClick={() => window.print()} className="inline-flex h-10 items-center gap-1.5 rounded-lg bg-surface-2 px-3.5 text-[14px] font-medium text-ink-2 hover:bg-surface-3">
          <Printer size={16} aria-hidden /> {tx("Print", "প্রিন্ট")}
        </button>
        <button type="button" onClick={onReset} className="inline-flex h-10 items-center gap-1.5 rounded-lg px-3 text-[14px] font-medium text-muted hover:bg-surface-2">
          <RotateCcw size={15} aria-hidden /> {tx("Start over", "আবার শুরু")}
        </button>
      </div>
      <p className="mt-3 text-[12px] text-faint print:hidden">{tx("Progress is saved on this device for each bike. The share link carries your ticks.", "অগ্রগতি প্রতিটি বাইকের জন্য এই ডিভাইসে সেভ থাকে। শেয়ার লিংকে আপনার টিকগুলোও থাকে।")}</p>
    </section>
  );
}
