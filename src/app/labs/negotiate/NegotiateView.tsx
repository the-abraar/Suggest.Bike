"use client";

import Link from "next/link";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Check, ChevronRight, Copy, RotateCcw, ShieldAlert } from "lucide-react";
import { BikePicker } from "@/components/form";
import { ExperimentalBadge, ExperimentalBanner } from "@/components/Experimental";
import { Approx, SectionHead } from "@/components/ui";
import { BIKES, formatBDT, fullName, getBike } from "@/lib/bikes";
import { useLang, useTx } from "@/lib/i18n";
import { SETTLE_SHARE, negotiate, partsFor, type PartDef, type PartId, type PartState } from "@/lib/negotiate/parts";
import type { BikeLite } from "@/lib/types";
import { estimateValue } from "@/lib/usedcheck/value";

export function NegotiateView() {
  return (
    <Suspense>
      <Inner />
    </Suspense>
  );
}

interface Form { yearMade: number; km: number; owners: number; asking: number | null }
type States = Partial<Record<PartId, PartState>>;

const KEY = "sb-negotiate-v1:";
const defaults = (b: BikeLite, nowYear: number): Form => ({ yearMade: b.status === "used-only" ? 2000 : nowYear - 3, km: b.status === "used-only" ? 50000 : 21000, owners: 1, asking: null });

function load(id: string): { f: Form; s: States } | null {
  try {
    const raw = localStorage.getItem(KEY + id);
    return raw ? (JSON.parse(raw) as { f: Form; s: States }) : null;
  } catch {
    return null;
  }
}

const DOT: Record<PartState | "none", string> = {
  ok: "bg-good text-white border-good",
  worn: "bg-warn text-white border-warn",
  bad: "bg-signal text-white border-signal",
  none: "bg-surface text-ink border-brand",
};

function Inner() {
  const tx = useTx();
  const { lang } = useLang();
  const params = useSearchParams();
  const nowYear = useMemo(() => new Date().getFullYear(), []);
  const [bike, setBike] = useState<BikeLite>(() => getBike("yamaha-rx-115") ?? BIKES[0]);
  const [form, setForm] = useState<Form>(() => defaults(bike, nowYear));
  const [states, setStates] = useState<States>({});
  const [sel, setSel] = useState<PartId>("engine");
  const [copied, setCopied] = useState(false);
  const loaded = useRef(false);
  const initDone = useRef(false);

  useEffect(() => {
    if (initDone.current) return;
    initDone.current = true;
    const b = getBike(params.get("bike") ?? "");
    if (b) setBike(b);
  }, [params]);

  // Restore saved progress whenever the model changes.
  useEffect(() => {
    loaded.current = false;
    const s = load(bike.id);
    setForm(s?.f ?? defaults(bike, nowYear));
    setStates(s?.s ?? {});
    loaded.current = true;
  }, [bike, nowYear]);

  useEffect(() => {
    if (!loaded.current) return;
    try {
      localStorage.setItem(KEY + bike.id, JSON.stringify({ f: form, s: states }));
    } catch {}
  }, [bike.id, form, states]);

  const parts = useMemo(() => partsFor(bike), [bike]);
  const part = parts.find((p) => p.id === sel) ?? parts[0];
  const L = <T extends { en: string; bn: string }>(x: T) => (lang === "bn" ? x.bn : x.en);

  const value = useMemo(
    () => estimateValue(bike, { yearMade: form.yearMade, km: form.km, owners: form.owners, paper: "clean", condition: "good", problems: { dealbreaker: 0, serious: 0, minor: 0 }, coverage: 1, nowYear }),
    [bike, form.yearMade, form.km, form.owners, nowYear],
  );
  const neg = useMemo(() => negotiate(bike, states, value.fair), [bike, states, value.fair]);
  const marked = Object.keys(states).length;

  const setState = (id: PartId, s: PartState) => setStates((cur) => ({ ...cur, [id]: cur[id] === s ? undefined : s }));
  const nextPart = () => setSel(parts[(parts.findIndex((p) => p.id === sel) + 1) % parts.length].id);
  const reset = () => setStates({});

  const partLabel = (id: PartId) => L(parts.find((p) => p.id === id)!.label);
  const stateLabel = (s: PartState) => (s === "ok" ? tx("Fine", "ঠিক আছে") : s === "worn" ? tx("Worn", "ক্ষয়া") : tx("Bad", "খারাপ"));

  const summary = () => {
    const lines = [
      `${fullName(bike)} · ${tx("expected price", "প্রত্যাশিত দাম")} ${formatBDT(value.low)}–${formatBDT(value.high)}`,
      ...neg.rows.map((r) => `- ${partLabel(r.id)} (${stateLabel(r.state)}): ${tx("take off", "কমান")} ${formatBDT(r.d.amount)}`),
      `${tx("Open at", "শুরু")} ${formatBDT(neg.openAt)} · ${tx("aim for", "লক্ষ্য")} ${formatBDT(neg.target)} · ${tx("walk above", "এর বেশি হলে সরে আসুন")} ${formatBDT(neg.walkAbove)}`,
      "suggest.bike/labs/negotiate",
    ];
    return lines.join("\n");
  };
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(summary());
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {}
  };

  const asking = form.asking;
  const verdict = neg.walk
    ? { tone: "signal", t: tx("Walk away, or wait until the paper and frame problems are fixed.", "সরে আসুন, বা কাগজ ও ফ্রেমের সমস্যা মেটা পর্যন্ত অপেক্ষা করুন।") }
    : asking == null || asking <= 0
      ? null
      : asking <= neg.target
        ? { tone: "good", t: tx("The asking price is already at or below our target. Check the papers and take it.", "চাওয়া দাম আমাদের লক্ষ্যের সমান বা কম। কাগজ দেখে নিয়ে নিন।") }
        : asking <= neg.walkAbove
          ? { tone: "warn", t: tx(`Negotiate. Ask for ${formatBDT(asking - neg.openAt)} off, and expect to settle near ${formatBDT(Math.max(neg.target, asking - Math.round((asking - neg.target) * SETTLE_SHARE)))}.`, `দরদাম করুন। ${formatBDT(asking - neg.openAt)} কম চান, আর প্রায় ${formatBDT(Math.max(neg.target, asking - Math.round((asking - neg.target) * SETTLE_SHARE)))}-এ রফা হবে ধরে নিন।`) }
          : { tone: "signal", t: tx(`Too high. Even after haggling you'd pay ${formatBDT(asking - neg.walkAbove)} over what we'd pay. Walk unless they come down.`, `অনেক বেশি। দরদামের পরেও আমাদের হিসেবের চেয়ে ${formatBDT(asking - neg.walkAbove)} বেশি দিতে হবে। দাম না কমালে সরে আসুন।`) };

  const num = "input h-11 w-full tnum";
  const label = "mb-1.5 block text-[13px] font-medium text-ink-2";

  return (
    <div className="container-x py-12">
      <SectionHead
        eyebrow={<ExperimentalBadge />}
        title={tx("Second-hand bike check: what to knock off the price", "সেকেন্ড-হ্যান্ড বাইক যাচাই: দাম কতটা কমানো যায়")}
        sub={tx(
          "Pick the model, then tap each part on the bike as you inspect it. Mark it fine, worn or bad and we show how much you can ask off, and the price to aim for.",
          "মডেল বেছে নিন, তারপর পরীক্ষা করার সময় বাইকের প্রতিটি অংশে ট্যাপ করুন। ঠিক, ক্ষয়া বা খারাপ চিহ্নিত করলে কত কমানো যায় আর কত দামে কিনবেন তা দেখাব।",
        )}
      />
      <div className="mb-6">
        <ExperimentalBanner>
          {tx(
            "Amounts come from this model's parts prices on the site, plus labelled estimates for labour and for things like the engine. They are a starting point for a conversation. A mechanic's quote beats them.",
            "অঙ্কগুলো সাইটে থাকা এই মডেলের পার্টসের দাম আর মজুরি ও ইঞ্জিনের মতো জিনিসের চিহ্নিত আন্দাজ থেকে। এগুলো আলোচনার শুরুর বিন্দু। মিস্ত্রির কোটেশন এর চেয়ে ভালো।",
          )}
        </ExperimentalBanner>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
        <div className="space-y-6">
          <section className="card space-y-5 p-5 sm:p-6" aria-label={tx("The bike", "বাইক")}>
            <BikePicker bike={bike} onPick={setBike} />
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <label>
                <span className={label}>{tx("Year made", "তৈরির সাল")}</span>
                <input type="number" inputMode="numeric" className={num} min={1980} max={nowYear} value={form.yearMade} onChange={(e) => setForm({ ...form, yearMade: Math.min(nowYear, Math.max(1980, Number(e.target.value) || nowYear)) })} />
              </label>
              <label>
                <span className={label}>{tx("Km on the meter", "মিটারে কিমি")}</span>
                <input type="number" inputMode="numeric" className={num} min={0} step={1000} value={form.km} onChange={(e) => setForm({ ...form, km: Math.max(0, Number(e.target.value) || 0) })} />
              </label>
              <label>
                <span className={label}>{tx("Owners so far", "মালিক সংখ্যা")}</span>
                <input type="number" inputMode="numeric" className={num} min={1} max={8} value={form.owners} onChange={(e) => setForm({ ...form, owners: Math.min(8, Math.max(1, Number(e.target.value) || 1)) })} />
              </label>
              <label>
                <span className={label}>{tx("Seller's price (৳)", "বিক্রেতার দাম (৳)")}</span>
                <input type="number" inputMode="numeric" className={num} min={0} step={1000} placeholder={tx("optional", "ঐচ্ছিক")} value={form.asking ?? ""} onChange={(e) => setForm({ ...form, asking: e.target.value === "" ? null : Math.max(0, Number(e.target.value) || 0) })} />
              </label>
            </div>
          </section>

          <section className="card p-5 sm:p-6" aria-labelledby="map-h">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 id="map-h" className="text-[19px] font-semibold tracking-tight text-ink">{tx("Tap a part", "একটি অংশে ট্যাপ করুন")}</h2>
              <button type="button" className="btn-ghost h-9 gap-1.5 px-3 text-[13px]" onClick={reset} disabled={marked === 0}>
                <RotateCcw size={14} aria-hidden />{tx("Clear all", "সব মুছুন")}
              </button>
            </div>

            <div className="relative mx-auto mt-4 aspect-[300/170] w-full max-w-[560px] rounded-xl bg-surface-2/60">
              <BikeDrawing />
              {parts.filter((p) => p.at).map((p, i) => (
                <Hotspot key={p.id} p={p} n={i + 1} state={states[p.id]} active={sel === p.id} name={L(p.label)} onPick={() => setSel(p.id)} />
              ))}
            </div>

            <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label={tx("All parts", "সব অংশ")}>
              {parts.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setSel(p.id)}
                  aria-pressed={sel === p.id}
                  className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-[13px] font-medium transition-colors ${sel === p.id ? "border-brand bg-brand-soft text-brand" : "border-line text-ink-2 hover:bg-surface-2"}`}
                >
                  <span className={`h-2.5 w-2.5 rounded-full border ${DOT[states[p.id] ?? "none"]}`} aria-hidden />
                  {L(p.label)}
                </button>
              ))}
            </div>

            <PartPanel
              key={part.id}
              part={part}
              state={states[part.id]}
              onState={(s) => setState(part.id, s)}
              onNext={nextPart}
              amount={neg.rows.find((r) => r.id === part.id)?.d}
            />
          </section>
        </div>

        <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
          <section className="card p-5 sm:p-6" aria-labelledby="price-h">
            <h2 id="price-h" className="text-[13px] font-semibold uppercase tracking-wide text-muted">{tx("Expected price, decent unit", "প্রত্যাশিত দাম, ভালো অবস্থার বাইক")}<Approx /></h2>
            <p className="mt-1 text-[28px] font-semibold tracking-tight text-ink tnum">{formatBDT(value.low)} – {formatBDT(value.high)}</p>
            <p className="mt-1 text-[13.5px] leading-relaxed text-muted">{tx("For a bike like this in fair shape with clean papers, before we take anything off for what you find.", "এমন একটি বাইক মোটামুটি ভালো অবস্থায় ও পরিষ্কার কাগজসহ, আপনার পাওয়া সমস্যার জন্য কিছু কমানোর আগে।")}</p>
            <details className="mt-2 text-[13px] text-muted">
              <summary className="cursor-pointer font-medium text-ink-2">{tx("How we got this", "কীভাবে হিসাব")}</summary>
              <p className="mt-2 leading-relaxed">{L(value.baseNote)}</p>
              {value.adjustments.map((a) => <p key={a.key} className="mt-2 leading-relaxed"><b className="text-ink-2">{L(a.label)}:</b> {L(a.note)}</p>)}
            </details>
          </section>

          <section className="card p-5 sm:p-6" aria-labelledby="neg-h" aria-live="polite">
            <h2 id="neg-h" className="text-[17px] font-semibold tracking-tight text-ink">{tx("Your negotiation", "আপনার দরদাম")}</h2>
            {marked === 0 ? (
              <p className="mt-3 text-[14px] leading-relaxed text-muted">{tx("Nothing marked yet. Tap a part, then choose Fine, Worn or Bad. The amounts show up here.", "এখনও কিছু চিহ্নিত হয়নি। একটি অংশে ট্যাপ করে ঠিক, ক্ষয়া বা খারাপ বেছে নিন। অঙ্ক এখানে দেখা যাবে।")}</p>
            ) : (
              <>
                <dl className="mt-3 grid grid-cols-3 gap-2 text-center">
                  <Stat k={tx("Open at", "শুরু করুন")} v={formatBDT(neg.openAt)} />
                  <Stat k={tx("Aim for", "লক্ষ্য")} v={formatBDT(neg.target)} strong />
                  <Stat k={tx("Walk above", "এর বেশি নয়")} v={formatBDT(neg.walkAbove)} />
                </dl>
                <p className="mt-3 text-[14px] leading-relaxed text-ink-2">
                  {tx(`You can ask off up to ${formatBDT(neg.askOff)}, the full cost of what you marked. Sellers rarely give all of it: expect about ${formatBDT(neg.settleOff)} off.`, `আপনি সর্বোচ্চ ${formatBDT(neg.askOff)} কম চাইতে পারেন, যা চিহ্নিত সব কিছুর পুরো খরচ। বিক্রেতারা সবটা কমান না: প্রায় ${formatBDT(neg.settleOff)} কমার আশা করুন।`)}
                </p>
                {verdict && (
                  <p className={`mt-3 flex gap-2 rounded-xl p-3 text-[14px] font-medium leading-relaxed ${verdict.tone === "good" ? "bg-good-soft text-ink" : verdict.tone === "warn" ? "bg-warn-soft text-ink" : "bg-signal-soft text-ink"}`} role="status">
                    <ShieldAlert size={17} className="mt-0.5 shrink-0" aria-hidden />{verdict.t}
                  </p>
                )}
                <ul className="mt-4 divide-y divide-line text-[13.5px]">
                  {neg.rows.map((r) => (
                    <li key={r.id} className="py-2.5">
                      <button type="button" className="flex w-full items-center justify-between gap-3 text-left" onClick={() => setSel(r.id)}>
                        <span className="flex min-w-0 items-center gap-2 text-ink-2"><span className={`h-2.5 w-2.5 shrink-0 rounded-full border ${DOT[r.state]}`} aria-hidden /><span className="truncate">{partLabel(r.id)}</span></span>
                        <b className={`shrink-0 tnum ${r.d.kind === "walk" ? "text-signal" : "text-ink"}`}>{r.d.kind === "walk" ? tx("walk away", "সরে আসুন") : `− ${formatBDT(r.d.amount)}`}</b>
                      </button>
                    </li>
                  ))}
                </ul>
                <button type="button" onClick={copy} className="btn-ghost mt-3 h-10 w-full gap-2 text-[13.5px]">
                  {copied ? <Check size={15} aria-hidden /> : <Copy size={15} aria-hidden />}
                  {copied ? tx("Copied", "কপি হয়েছে") : tx("Copy this for the seller chat", "বিক্রেতার সাথে চ্যাটের জন্য কপি করুন")}
                </button>
              </>
            )}
          </section>

          <div className="card p-4 text-[13.5px] leading-relaxed text-muted">
            {tx("Want the full inspection list with a trust score?", "ট্রাস্ট স্কোরসহ পূর্ণ পরীক্ষার তালিকা চান?")}{" "}
            <Link href={`/labs/check/?bike=${bike.id}`} className="font-semibold text-brand">{tx("Open the checklist", "চেকলিস্ট খুলুন")}</Link>
            {" · "}
            <Link href={`/labs/listing-check/?bike=${bike.id}`} className="font-semibold text-brand">{tx("Check the listing", "বিজ্ঞাপন যাচাই")}</Link>
          </div>
        </aside>
      </div>
    </div>
  );
}

function Stat({ k, v, strong = false }: { k: string; v: string; strong?: boolean }) {
  return (
    <div className={`rounded-xl px-1.5 py-2.5 ${strong ? "bg-brand-soft" : "bg-surface-2"}`}>
      <dt className="text-[11.5px] font-medium text-muted">{k}</dt>
      <dd className={`mt-0.5 text-[15px] font-semibold tnum ${strong ? "text-brand" : "text-ink"}`}>{v}</dd>
    </div>
  );
}

function Hotspot({ p, n, state, active, name, onPick }: { p: PartDef; n: number; state?: PartState; active: boolean; name: string; onPick: () => void }) {
  const [x, y] = p.at!;
  return (
    <button
      type="button"
      onClick={onPick}
      aria-label={name}
      aria-pressed={active}
      title={name}
      className={`absolute grid h-7 w-7 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border-2 text-[12px] font-bold shadow-sm transition-transform hover:scale-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink ${DOT[state ?? "none"]} ${active ? "scale-125 ring-4 ring-brand/30" : ""}`}
      style={{ left: `${(x / 300) * 100}%`, top: `${(y / 170) * 100}%` }}
    >
      {state === "ok" ? <Check size={14} aria-hidden /> : n}
    </button>
  );
}

function BikeDrawing() {
  return (
    <svg viewBox="0 0 300 170" className="h-full w-full text-ink/30" fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="65" cy="120" r="32" />
      <circle cx="235" cy="120" r="32" />
      <path d="M65 120 L100 80 L150 80 L180 120 M100 80 L88 60 L125 60 L150 80 M150 80 L205 50 L225 52 M205 50 L235 120 M215 38 L240 40" />
      <path d="M118 112 h52 v22 h-52z" />
      <path d="M130 52 q25 -16 58 -4" />
    </svg>
  );
}

function PartPanel({ part, state, onState, onNext, amount }: { part: PartDef; state?: PartState; onState: (s: PartState) => void; onNext: () => void; amount?: { amount: number; kind: string; basis: { en: string; bn: string } } }) {
  const tx = useTx();
  const { lang } = useLang();
  const L = (x: { en: string; bn: string }) => (lang === "bn" ? x.bn : x.en);
  const opts: { s: PartState; t: string; d: string; cls: string }[] = [
    { s: "ok", t: tx("Looks fine", "ঠিক আছে"), d: tx("Nothing to take off.", "কিছু কমানোর নেই।"), cls: "border-good bg-good-soft" },
    { s: "worn", t: tx("Worn", "ক্ষয়া"), d: L(part.worn), cls: "border-warn bg-warn-soft" },
    { s: "bad", t: tx("Bad", "খারাপ"), d: L(part.bad), cls: "border-signal bg-signal-soft" },
  ];
  return (
    <div className="mt-5 animate-fade rounded-2xl border border-line p-4 sm:p-5" aria-live="polite">
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-[18px] font-semibold tracking-tight text-ink">{L(part.label)}</h3>
        <button type="button" onClick={onNext} className="btn-ghost h-8 shrink-0 gap-1 px-2.5 text-[13px]">{tx("Next part", "পরের অংশ")}<ChevronRight size={14} aria-hidden /></button>
      </div>
      <p className="mt-1.5 text-[14px] leading-relaxed text-muted"><b className="text-ink-2">{tx("How to check: ", "কীভাবে দেখবেন: ")}</b>{L(part.how)}</p>
      <div className="mt-4 grid gap-2 sm:grid-cols-3" role="group" aria-label={tx("What did you find?", "কী পেলেন?")}>
        {opts.map((o) => (
          <button key={o.s} type="button" aria-pressed={state === o.s} onClick={() => onState(o.s)} className={`rounded-xl border-2 p-3 text-left transition-colors ${state === o.s ? o.cls : "border-line hover:bg-surface-2"}`}>
            <span className="block text-[14px] font-semibold text-ink">{o.t}</span>
            <span className="mt-0.5 block text-[12.5px] leading-snug text-muted">{o.d}</span>
          </button>
        ))}
      </div>
      {amount && (
        <p className="mt-4 rounded-xl bg-surface-2 p-3 text-[14px] leading-relaxed text-ink-2">
          <b className="block text-[16px] tnum text-ink">{amount.kind === "walk" ? tx("We'd walk away. If you go ahead anyway, ask ", "আমরা সরে আসতাম। তবু এগোলে চান ") : tx("Ask off ", "কমান ")}{formatBDT(amount.amount)}</b>
          {L(amount.basis)}
        </p>
      )}
    </div>
  );
}
