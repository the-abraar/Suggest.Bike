"use client";

import { useEffect, useMemo, useState } from "react";
import { CalendarClock, CheckCircle2, CircleHelp, Lock, Mail, MessageCircle, Radar, Search, ShieldAlert, Trash2, XCircle } from "lucide-react";
import { ExperimentalBadge, ExperimentalBanner } from "@/components/Experimental";
import { Segmented } from "@/components/form";
import { searchBikes } from "@/components/SearchBox";
import { SectionHead } from "@/components/ui";
import { FlowPreview } from "./FlowPreview";
import { formatLakh, fullName } from "@/lib/bikes";
import { useLang, useTx } from "@/lib/i18n";
import { SITE } from "@/lib/site";
import {
  COLOURS, DISTRICTS, MAX_CUSTOM, MUST_HAVES, normalizeBdPhone, REQUEST_TTL_DAYS, summarize, validateSubmission,
  type FieldErrors, type FinderSubmission, type MustHaveKey,
} from "@/lib/finder";

/** Inlined at build time. Unset (the default) means preview mode: nothing is sent anywhere. */
const ENDPOINT = process.env.NEXT_PUBLIC_FINDER_ENDPOINT || "";
const STORE_KEY = "sb-finder-requests";

interface Form {
  model: string;
  bikeId?: string;
  colours: string[];
  yearMin: string;
  yearMax: string;
  maxBudget: string;
  maxKm: string;
  papers: "any" | "clean";
  condition: "any" | "good" | "excellent";
  districts: string[];
  mustHaves: string[];
  custom: string;
  whatsapp: string;
  consent: boolean;
}

const EMPTY: Form = { model: "", colours: [], yearMin: "", yearMax: "", maxBudget: "", maxKm: "", papers: "any", condition: "any", districts: [], mustHaves: [], custom: "", whatsapp: "", consent: false };

type Saved = { at: string; sub: FinderSubmission };
type Status = { kind: "idle" } | { kind: "preview"; sub: FinderSubmission } | { kind: "sending" } | { kind: "sent" } | { kind: "error"; message: string };

const toggle = (list: string[], v: string) => (list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);

export function FinderView() {
  const tx = useTx();
  const { lang } = useLang();
  const [f, setF] = useState<Form>(EMPTY);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [saved, setSaved] = useState<Saved[]>([]);
  const [showSuggest, setShowSuggest] = useState(false);
  const live = ENDPOINT !== "";
  const set = <K extends keyof Form>(k: K, v: Form[K]) => setF((x) => ({ ...x, [k]: v }));

  useEffect(() => {
    try {
      setSaved(JSON.parse(localStorage.getItem(STORE_KEY) || "[]"));
    } catch {}
  }, []);
  const persist = (list: Saved[]) => {
    setSaved(list);
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify(list));
    } catch {}
  };

  const suggestions = useMemo(() => (f.model.trim().length >= 2 ? searchBikes(f.model, 4) : []), [f.model]);
  const phone = normalizeBdPhone(f.whatsapp);

  const errText: Record<keyof FieldErrors, string> = {
    model: tx("Tell us which model you want.", "কোন মডেল চান তা লিখুন।"),
    whatsapp: tx("Enter a Bangladesh mobile number, like 01712345678.", "বাংলাদেশের মোবাইল নম্বর দিন, যেমন 01712345678।"),
    consent: tx("Tick the box to allow WhatsApp messages. Without it we cannot contact you.", "হোয়াটসঅ্যাপ মেসেজের অনুমতি দিতে বক্সে টিক দিন। নাহলে আমরা যোগাযোগ করতে পারব না।"),
    maxBudget: tx("Budget should be between ৳10,000 and ৳5 crore.", "বাজেট ৳১০,০০০ থেকে ৳৫ কোটির মধ্যে হতে হবে।"),
    yearMin: tx("Enter a year like 1998.", "১৯৯৮-এর মতো সাল লিখুন।"),
    yearMax: tx("Enter a year that is not before the first one.", "প্রথম সালের আগের নয়, এমন সাল লিখুন।"),
    maxKm: tx("Enter a distance in km.", "কিলোমিটারে লিখুন।"),
    custom: tx(`Keep it under ${MAX_CUSTOM} characters.`, `${MAX_CUSTOM} অক্ষরের মধ্যে লিখুন।`),
    districts: "",
    colours: "",
  };

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const v = validateSubmission({ ...f, maxBudget: f.maxBudget || undefined, maxKm: f.maxKm || undefined, yearMin: f.yearMin || undefined, yearMax: f.yearMax || undefined, lang });
    if (!v.ok) {
      setErrors(v.errors);
      document.getElementById(`ff-${Object.keys(v.errors)[0]}`)?.scrollIntoView({ block: "center", behavior: "smooth" });
      return;
    }
    setErrors({});
    const sub = v.value;
    if (!live) {
      // Preview mode: the request stays in this browser. Nothing is sent and no search is started.
      persist([{ at: new Date().toISOString(), sub: { ...sub, consent: false, whatsapp: "" } }, ...saved].slice(0, 5));
      setStatus({ kind: "preview", sub });
      return;
    }
    setStatus({ kind: "sending" });
    try {
      const r = await fetch(ENDPOINT, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(sub) });
      if (!r.ok) {
        const body = (await r.json().catch(() => ({}))) as { error?: string };
        setStatus({ kind: "error", message: body.error ?? `HTTP ${r.status}` });
        return;
      }
      setStatus({ kind: "sent" });
    } catch {
      setStatus({ kind: "error", message: tx("Could not reach the server. Check your connection and try again.", "সার্ভারে পৌঁছানো যায়নি। ইন্টারনেট দেখে আবার চেষ্টা করুন।") });
    }
  }

  const mailto = (sub: FinderSubmission) => {
    const body = [
      `Bike finder request (waitlist)`,
      `Model: ${sub.model}`,
      sub.colours.length ? `Colour: ${sub.colours.map((c) => COLOURS[c].en).join(", ")}` : "",
      sub.maxBudget ? `Max budget: ${sub.maxBudget} BDT` : "",
      sub.districts.length ? `Districts: ${sub.districts.map((d) => DISTRICTS[d].en).join(", ")}` : "",
      sub.mustHaves.length ? `Must have: ${sub.mustHaves.map((m) => MUST_HAVES[m].en).join("; ")}` : "",
      sub.custom ? `Notes: ${sub.custom}` : "",
      `WhatsApp: ${sub.whatsapp}`,
    ].filter(Boolean).join("\n");
    return `mailto:${SITE.contactEmail}?subject=${encodeURIComponent("Bike finder waitlist: " + sub.model)}&body=${encodeURIComponent(body)}`;
  };

  const label = "mb-2 block text-[13px] font-medium text-ink-2";
  const hint = "mt-1.5 text-[12.5px] leading-snug text-faint";
  const err = (k: keyof FieldErrors) => (errors[k] ? <p role="alert" className="mt-1.5 text-[13px] font-medium text-warn">{errText[k]}</p> : null);

  return (
    <div className="container-x py-12">
      <SectionHead
        eyebrow={<ExperimentalBadge soon />}
        title={tx("Bike finder: describe it once, we keep looking", "বাইক খুঁজে দেওয়া: একবার লিখুন, আমরা খুঁজতে থাকব")}
        sub={tx(
          "Want a maroon RX 115 with its original cylinder sleeve, clean blue book, under ৳1.6 lakh? Write it down. Once this goes live we will check public listings every midnight and message you on WhatsApp when something fits.",
          "মেরুন রঙের RX 115, আসল সিলিন্ডার স্লিভ, পরিষ্কার ব্লু বুক, ১.৬ লাখের নিচে? লিখে দিন। চালু হলে আমরা প্রতি মাঝরাতে পাবলিক বিজ্ঞাপন দেখব এবং কিছু মিললে হোয়াটসঅ্যাপে জানাব।",
        )}
      />

      <div className="mb-6 space-y-3">
        <ExperimentalBanner>
          {live
            ? tx("We search public listings only and cannot check hidden details from a photo. Always inspect the bike and the papers yourself.", "আমরা শুধু পাবলিক বিজ্ঞাপন খুঁজি এবং ছবি দেখে লুকানো বিষয় যাচাই করতে পারি না। নিজে বাইক ও কাগজ দেখে নিন।")
            : tx("This tool is not live yet. You can fill in the form to see how it will work, but nothing is being searched.", "টুলটি এখনও চালু হয়নি। কেমন কাজ করবে দেখতে ফর্ম পূরণ করতে পারেন, কিন্তু এখন কিছু খোঁজা হচ্ছে না।")}
        </ExperimentalBanner>
        {!live && (
          <div className="card flex gap-3 border-brand/40 bg-brand-soft/50 p-4 text-[14px] leading-relaxed text-ink-2" role="status">
            <CalendarClock size={18} className="mt-0.5 shrink-0 text-brand" aria-hidden />
            <p>
              <span className="font-semibold text-ink">{tx("We're not taking live requests yet.", "আমরা এখনও সরাসরি অনুরোধ নিচ্ছি না।")}</span>{" "}
              {tx("Your request is kept only in this browser. To join the waitlist, send it to us by email after you fill the form.", "আপনার অনুরোধ শুধু এই ব্রাউজারেই থাকে। অপেক্ষা-তালিকায় যোগ দিতে ফর্ম পূরণের পরে আমাদের ইমেইল করুন।")}
            </p>
          </div>
        )}
      </div>

      <div className="mb-6"><FlowPreview /></div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
        <form onSubmit={submit} noValidate className="card space-y-6 p-5 sm:p-6">
          {/* Model */}
          <div>
            <label htmlFor="ff-model" className={label}>{tx("Which bike?", "কোন বাইক?")}</label>
            <div className="relative">
              <Search size={16} className="pointer-events-none absolute left-3.5 top-3.5 text-faint" aria-hidden />
              <input
                id="ff-model"
                className="input pl-10"
                value={f.model}
                maxLength={80}
                autoComplete="off"
                placeholder={tx("e.g. Yamaha RX 115, আরএক্স ১১৫, CG 125", "যেমন Yamaha RX 115, আরএক্স ১১৫, CG 125")}
                onChange={(e) => {
                  setF((x) => ({ ...x, model: e.target.value, bikeId: undefined }));
                  setShowSuggest(true);
                }}
                onBlur={() => setTimeout(() => setShowSuggest(false), 150)}
                aria-invalid={!!errors.model}
              />
              {showSuggest && suggestions.length > 0 && (
                <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-40 overflow-hidden rounded-2xl border border-line bg-surface shadow-lg">
                  {suggestions.map((b) => (
                    <button
                      type="button"
                      key={b.id}
                      onMouseDown={() => {
                        setF((x) => ({ ...x, model: fullName(b), bikeId: b.id }));
                        setShowSuggest(false);
                      }}
                      className="flex w-full items-center gap-3 px-3 py-2.5 text-left hover:bg-surface-2"
                    >
                      <span className="min-w-0 flex-1 truncate text-[14px] font-medium text-ink">{fullName(b)}</span>
                      <span className="text-[13px] text-muted tnum">{formatLakh(b.priceBDT, lang)}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            {err("model")}
            <p className={hint}>{tx("Pick one of our bikes, or type any model, old or rare. Spellings in Bangla or English both work.", "আমাদের বাইক থেকে বেছে নিন, অথবা যেকোনো মডেল লিখুন, পুরনো বা বিরল হলেও চলবে। বাংলা বা ইংরেজি দুইভাবেই লেখা যাবে।")}</p>
          </div>

          {/* Colour */}
          <fieldset>
            <legend className={label}>{tx("Colour (any you would accept)", "রং (যেগুলো মানতে রাজি)")}</legend>
            <div className="flex flex-wrap gap-2">
              {Object.entries(COLOURS).map(([k, c]) => (
                <button type="button" key={k} className="chip" data-active={f.colours.includes(k)} aria-pressed={f.colours.includes(k)} onClick={() => set("colours", toggle(f.colours, k))}>
                  {lang === "bn" ? c.bn : c.en}
                </button>
              ))}
            </div>
            <p className={hint}>{tx("Leave empty if colour does not matter.", "রং নিয়ে আপত্তি না থাকলে খালি রাখুন।")}</p>
          </fieldset>

          {/* Year, budget, km */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <span className={label}>{tx("Year made", "তৈরির সাল")}</span>
              <div className="flex items-center gap-2">
                <input id="ff-yearMin" inputMode="numeric" className="input tnum" placeholder={tx("From", "থেকে")} aria-label={tx("Earliest year", "সবচেয়ে আগের সাল")} value={f.yearMin} onChange={(e) => set("yearMin", e.target.value)} />
                <span className="text-faint">–</span>
                <input id="ff-yearMax" inputMode="numeric" className="input tnum" placeholder={tx("To", "পর্যন্ত")} aria-label={tx("Latest year", "সবচেয়ে পরের সাল")} value={f.yearMax} onChange={(e) => set("yearMax", e.target.value)} />
              </div>
              {err("yearMin")}
              {err("yearMax")}
            </div>
            <div>
              <label htmlFor="ff-maxBudget" className={label}>{tx("Maximum budget (৳)", "সর্বোচ্চ বাজেট (৳)")}</label>
              <input id="ff-maxBudget" inputMode="numeric" className="input tnum" placeholder="160000" value={f.maxBudget} onChange={(e) => set("maxBudget", e.target.value)} />
              {Number(f.maxBudget) >= 10000 && <p className={hint + " tnum"}>{formatLakh(Number(f.maxBudget), lang)}</p>}
              {err("maxBudget")}
            </div>
            <div>
              <label htmlFor="ff-maxKm" className={label}>{tx("Maximum kilometres run", "সর্বোচ্চ কত কিমি চলেছে")}</label>
              <input id="ff-maxKm" inputMode="numeric" className="input tnum" placeholder="50000" value={f.maxKm} onChange={(e) => set("maxKm", e.target.value)} />
              <p className={hint}>{tx("Meters can be wound back. Treat it as a claim.", "মিটার পেছানো যায়। এটাকে বিক্রেতার দাবি হিসেবে ধরুন।")}</p>
              {err("maxKm")}
            </div>
          </div>

          {/* Papers, condition */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <span className={label}>{tx("Papers", "কাগজপত্র")}</span>
              <Segmented value={f.papers} onChange={(v) => set("papers", v)} options={[{ v: "any", label: tx("Any", "যেকোনো") }, { v: "clean", label: tx("Clean blue book", "পরিষ্কার ব্লু বুক") }]} />
            </div>
            <div>
              <span className={label}>{tx("Condition", "অবস্থা")}</span>
              <Segmented value={f.condition} onChange={(v) => set("condition", v)} options={[{ v: "any", label: tx("Any", "যেকোনো") }, { v: "good", label: tx("Good", "ভালো") }, { v: "excellent", label: tx("Excellent", "চমৎকার") }]} />
            </div>
          </div>

          {/* Districts */}
          <fieldset>
            <legend className={label}>{tx("Where? (pick the districts you can go to)", "কোথায়? (যে জেলায় যেতে পারবেন)")}</legend>
            <div className="flex flex-wrap gap-2">
              {Object.entries(DISTRICTS).map(([k, d]) => (
                <button type="button" key={k} className="chip" data-active={f.districts.includes(k)} aria-pressed={f.districts.includes(k)} onClick={() => set("districts", toggle(f.districts, k))}>
                  {lang === "bn" ? d.bn : d.en}
                </button>
              ))}
            </div>
            <p className={hint}>{tx("Leave empty to look anywhere in Bangladesh.", "সারা দেশে খুঁজতে খালি রাখুন।")}</p>
          </fieldset>

          {/* Must-haves */}
          <fieldset>
            <legend className={label}>{tx("Must-haves", "যা অবশ্যই চাই")}</legend>
            <div className="grid gap-2 sm:grid-cols-2">
              {Object.entries(MUST_HAVES).map(([k, m]) => (
                <label key={k} className="flex cursor-pointer items-start gap-2.5 rounded-xl border border-line p-3 text-[14px] text-ink-2 has-[:checked]:border-brand has-[:checked]:bg-brand-soft/50">
                  <input type="checkbox" className="mt-0.5 h-4 w-4 accent-[var(--brand)]" checked={f.mustHaves.includes(k)} onChange={() => set("mustHaves", toggle(f.mustHaves, k))} />
                  <span>{lang === "bn" ? m.bn : m.en}</span>
                </label>
              ))}
            </div>
            <p className={hint}>{tx("We cannot see inside an engine from a photo. For these we show what the seller claims and tell you to ask and inspect.", "ছবি দেখে ইঞ্জিনের ভেতরের অবস্থা বোঝা যায় না। এগুলোর জন্য বিক্রেতা কী দাবি করেছে তা দেখাব, আর জিজ্ঞেস করে পরীক্ষা করতে বলব।")}</p>
          </fieldset>

          <div>
            <label htmlFor="ff-custom" className={label}>{tx("Anything else? (your own requirement)", "আর কিছু? (আপনার নিজের শর্ত)")}</label>
            <textarea id="ff-custom" rows={3} maxLength={MAX_CUSTOM + 50} className="input h-auto py-2.5" value={f.custom} onChange={(e) => set("custom", e.target.value)} placeholder={tx("e.g. original silencer, no welding on the frame, seller in Mirpur", "যেমন আসল সাইলেন্সার, ফ্রেমে ঝালাই নেই, বিক্রেতা মিরপুরে")} />
            <div className="flex justify-between">
              <p className={hint}>{tx("We cannot check this for you. It is shown in the report as a point to ask the seller.", "এটি আমরা যাচাই করতে পারি না। রিপোর্টে বিক্রেতাকে জিজ্ঞেস করার বিষয় হিসেবে দেখানো হবে।")}</p>
              <span className={`${hint} tnum shrink-0 pl-3`}>{f.custom.length}/{MAX_CUSTOM}</span>
            </div>
            {err("custom")}
          </div>

          {/* Contact + consent */}
          <div className="space-y-4 rounded-2xl bg-surface-2 p-4 sm:p-5">
            <div>
              <label htmlFor="ff-whatsapp" className={label}>{tx("Your WhatsApp number", "আপনার হোয়াটসঅ্যাপ নম্বর")}</label>
              <input id="ff-whatsapp" type="tel" inputMode="tel" autoComplete="tel" className="input tnum" placeholder="01712345678" value={f.whatsapp} onChange={(e) => set("whatsapp", e.target.value)} aria-invalid={!!errors.whatsapp} />
              {phone && <p className={hint + " tnum"}>{tx("We will use", "আমরা ব্যবহার করব")} {phone}</p>}
              {err("whatsapp")}
            </div>
            <div id="ff-consent">
              <label className="flex cursor-pointer items-start gap-3 text-[14px] leading-relaxed text-ink-2">
                <input type="checkbox" className="mt-1 h-5 w-5 shrink-0 accent-[var(--brand)]" checked={f.consent} onChange={(e) => set("consent", e.target.checked)} aria-invalid={!!errors.consent} />
                <span>
                  {tx(
                    `I agree that Suggest.Bike may message me on this WhatsApp number about bikes that match this request, at most one message a day, for up to ${REQUEST_TTL_DAYS} days. I can stop any time by replying STOP.`,
                    `আমি সম্মত যে এই অনুরোধের সাথে মেলে এমন বাইকের বিষয়ে Suggest.Bike এই হোয়াটসঅ্যাপ নম্বরে আমাকে মেসেজ পাঠাতে পারে, দিনে সর্বোচ্চ একটি, সর্বোচ্চ ${REQUEST_TTL_DAYS} দিন। যেকোনো সময় STOP লিখে রিপ্লাই দিলে বন্ধ হবে।`,
                  )}
                </span>
              </label>
              {err("consent")}
            </div>
            <div className="flex gap-2.5 text-[13px] leading-relaxed text-muted">
              <Lock size={15} className="mt-0.5 shrink-0" aria-hidden />
              <p>
                {tx(
                  `Privacy: we keep only this request and your number, and use them only to find and message you about this bike. We do not sell or share them and show no ads. They are deleted ${REQUEST_TTL_DAYS} days after you send the request, or sooner if you reply STOP or email ${SITE.contactEmail}.`,
                  `গোপনীয়তা: আমরা শুধু এই অনুরোধ আর আপনার নম্বর রাখি, এবং শুধু এই বাইকের খোঁজ ও মেসেজের জন্য ব্যবহার করি। বিক্রি বা অন্যকে দিই না, বিজ্ঞাপনও দেখাই না। অনুরোধ পাঠানোর ${REQUEST_TTL_DAYS} দিন পরে, অথবা STOP লিখলে বা ${SITE.contactEmail}-এ ইমেইল করলে আগেই মুছে ফেলা হয়।`,
                )}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button type="submit" className="btn-primary" disabled={status.kind === "sending"}>
              <Radar size={16} aria-hidden />
              {live ? (status.kind === "sending" ? tx("Sending…", "পাঠানো হচ্ছে…") : tx("Start looking for it", "খোঁজা শুরু করুন")) : tx("Save my request on this device", "অনুরোধটি এই ডিভাইসে সেভ করুন")}
            </button>
            {!live && <span className="text-[13px] text-muted">{tx("Preview only. Nothing is sent or searched.", "শুধু প্রিভিউ। কিছু পাঠানো বা খোঁজা হয় না।")}</span>}
          </div>

          {status.kind === "preview" && (
            <div className="card space-y-3 border-good/40 bg-good-soft/50 p-4 text-[14px] text-ink-2" role="status">
              <p className="flex items-center gap-2 font-semibold text-ink"><CheckCircle2 size={18} className="text-good" aria-hidden />{tx("Saved on this device only.", "শুধু এই ডিভাইসে সেভ হয়েছে।")}</p>
              <p>{tx("We're not taking live requests yet, so no search is running and nobody has been told. Your request: ", "আমরা এখনও সরাসরি অনুরোধ নিচ্ছি না, তাই কোনো খোঁজ চলছে না এবং কাউকে জানানো হয়নি। আপনার অনুরোধ: ")}<span className="font-medium text-ink">{summarize(status.sub)}</span></p>
              <a className="btn-secondary" href={mailto(status.sub)}>
                <Mail size={16} aria-hidden />{tx("Email it to join the waitlist", "অপেক্ষা-তালিকায় যোগ দিতে ইমেইল করুন")}
              </a>
              <p className="text-[12.5px] text-muted">{tx("This opens your email app with the details filled in, including your number. You can edit it before sending.", "এতে আপনার ইমেইল অ্যাপ খুলবে, বিবরণসহ (নম্বরও আছে)। পাঠানোর আগে বদলাতে পারবেন।")}</p>
            </div>
          )}
          {status.kind === "sent" && (
            <p className="card flex gap-2 border-good/40 bg-good-soft/50 p-4 text-[14px] font-medium text-ink" role="status"><CheckCircle2 size={18} className="shrink-0 text-good" aria-hidden />{tx("Request received. We will check tonight at midnight and message you on WhatsApp if something fits.", "অনুরোধ পেয়েছি। আজ মাঝরাতে দেখব এবং কিছু মিললে হোয়াটসঅ্যাপে জানাব।")}</p>
          )}
          {status.kind === "error" && (
            <p className="card flex gap-2 border-warn/40 bg-warn-soft/50 p-4 text-[14px] text-ink" role="alert"><ShieldAlert size={18} className="shrink-0 text-warn" aria-hidden />{status.message}</p>
          )}
        </form>

        <aside className="space-y-6">
          <section className="card p-5 sm:p-6" aria-labelledby="how">
            <h3 id="how" className="text-[17px] font-semibold tracking-tight text-ink">{tx("How it will work", "কীভাবে কাজ করবে")}</h3>
            <ol className="mt-4 space-y-4">
              {[
                [tx("You describe the bike", "আপনি বাইকটির বিবরণ দেন"), tx("Model, colour, budget, papers, places, and your own must-haves.", "মডেল, রং, বাজেট, কাগজ, জায়গা আর আপনার নিজের শর্ত।")],
                [tx("Every midnight (Dhaka time)", "প্রতি মাঝরাতে (ঢাকার সময়)"), tx("We search public listings for it. A new night, a fresh look.", "আমরা পাবলিক বিজ্ঞাপনে খুঁজি। প্রতি রাতে নতুন করে।")],
                [tx("Each listing is scored", "প্রতিটি বিজ্ঞাপনে স্কোর দেওয়া হয়"), tx("0 to 100, with three lists: matches, things to ask the seller, and what does not fit.", "০ থেকে ১০০, সাথে তিনটি তালিকা: যা মিলেছে, বিক্রেতাকে যা জিজ্ঞেস করবেন, আর যা মেলেনি।")],
                [tx("WhatsApp message", "হোয়াটসঅ্যাপ মেসেজ"), tx("Only if you agreed, at most one a day, with a link to the ad.", "শুধু আপনি সম্মত হলে, দিনে সর্বোচ্চ একটি, বিজ্ঞাপনের লিংকসহ।")],
                [tx(`Stops after ${REQUEST_TTL_DAYS} days`, `${REQUEST_TTL_DAYS} দিন পরে বন্ধ`), tx("Or right away when you reply STOP. Your details are then deleted.", "অথবা STOP লিখলেই। তারপর আপনার তথ্য মুছে ফেলা হয়।")],
              ].map(([t, d], i) => (
                <li key={i} className="flex gap-3">
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-brand-soft text-[13px] font-semibold text-brand tnum">{i + 1}</span>
                  <span className="text-[14px] leading-relaxed text-muted"><span className="block font-semibold text-ink">{t}</span>{d}</span>
                </li>
              ))}
            </ol>
          </section>

          <section className="card p-5 sm:p-6" aria-labelledby="limits">
            <h3 id="limits" className="text-[17px] font-semibold tracking-tight text-ink">{tx("What the match report tells you", "ম্যাচ রিপোর্ট কী বলে")}</h3>
            <ul className="mt-3 space-y-2.5 text-[14px] leading-relaxed text-muted">
              <li className="flex gap-2.5"><CheckCircle2 size={17} className="mt-0.5 shrink-0 text-good" aria-hidden /><span><b className="text-ink">{tx("Matches", "মিলেছে")}</b>: {tx("the ad says so (price, colour, year, place).", "বিজ্ঞাপনে তা-ই লেখা (দাম, রং, সাল, জায়গা)।")}</span></li>
              <li className="flex gap-2.5"><CircleHelp size={17} className="mt-0.5 shrink-0 text-warn" aria-hidden /><span><b className="text-ink">{tx("Ask the seller / inspect", "বিক্রেতাকে জিজ্ঞেস করুন / পরীক্ষা করুন")}</b>: {tx("the ad is silent, or only the seller claims it.", "বিজ্ঞাপনে কিছু নেই, অথবা শুধু বিক্রেতার দাবি।")}</span></li>
              <li className="flex gap-2.5"><XCircle size={17} className="mt-0.5 shrink-0 text-muted" aria-hidden /><span><b className="text-ink">{tx("Does not fit", "মেলেনি")}</b>: {tx("the ad says something different.", "বিজ্ঞাপনে অন্য কথা লেখা।")}</span></li>
            </ul>
            <h4 className="mt-5 text-[14px] font-semibold text-ink">{tx("Honest limits", "সৎ সীমাবদ্ধতা")}</h4>
            <ul className="mt-2 list-disc space-y-1.5 pl-5 text-[13.5px] leading-relaxed text-muted">
              <li>{tx("We search public listings only. Private groups and Facebook Marketplace are not searched.", "আমরা শুধু পাবলিক বিজ্ঞাপন খুঁজি। প্রাইভেট গ্রুপ আর ফেসবুক মার্কেটপ্লেস খোঁজা হয় না।")}</li>
              <li>{tx("A hidden detail, like an original cylinder sleeve, cannot be verified from a photo or a post. Even a 90+ score means \"worth a look\", not \"safe to buy\".", "আসল সিলিন্ডার স্লিভের মতো লুকানো বিষয় ছবি বা পোস্ট দেখে যাচাই করা যায় না। ৯০+ স্কোরেরও মানে \"দেখার মতো\", \"কিনে ফেলা নিরাপদ\" নয়।")}</li>
              <li>{tx("We may miss ads, or find none for a rare bike. Silence does not mean it is not for sale.", "আমরা কিছু বিজ্ঞাপন মিস করতে পারি, বিরল বাইকে হয়তো কিছুই পাব না। কিছু না পাওয়ার মানে এই নয় যে বিক্রি হচ্ছে না।")}</li>
              <li>{tx("Never pay in advance. Check the blue book, tax token and chassis number in person.", "আগাম টাকা দেবেন না। নিজে গিয়ে ব্লু বুক, ট্যাক্স টোকেন আর চেসিস নম্বর মিলিয়ে নিন।")}</li>
            </ul>
          </section>

          {saved.length > 0 && (
            <section className="card p-5 sm:p-6" aria-labelledby="mine">
              <h3 id="mine" className="flex items-center gap-2 text-[17px] font-semibold tracking-tight text-ink"><MessageCircle size={17} aria-hidden />{tx("Saved on this device", "এই ডিভাইসে সেভ করা")}</h3>
              <ul className="mt-3 divide-y divide-line">
                {saved.map((s, i) => (
                  <li key={s.at} className="flex items-center justify-between gap-3 py-2.5 text-[14px]">
                    <span className="min-w-0 truncate text-ink-2">{summarize(s.sub)}</span>
                    <button type="button" className="btn-ghost h-9 px-2.5" aria-label={tx("Delete this saved request", "সেভ করা অনুরোধটি মুছুন")} onClick={() => persist(saved.filter((_, j) => j !== i))}>
                      <Trash2 size={15} aria-hidden />
                    </button>
                  </li>
                ))}
              </ul>
              <p className={hint}>{tx("Stored only in this browser. Your WhatsApp number is not saved here.", "শুধু এই ব্রাউজারে আছে। আপনার হোয়াটসঅ্যাপ নম্বর এখানে সেভ হয় না।")}</p>
            </section>
          )}
        </aside>
      </div>
    </div>
  );
}
