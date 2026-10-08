"use client";

import { useState } from "react";
import { AlertTriangle, Check, CheckCircle2, ClipboardCopy, Flag as FlagIcon, HelpCircle, Mail, OctagonX, Share2, ShieldAlert } from "lucide-react";
import { Approx } from "@/components/ui";
import { formatLakh } from "@/lib/bikes";
import { useLang, useTx } from "@/lib/i18n";
import { SITE } from "@/lib/site";
import type { Assessment, Bi, Flag, Listing, Question, Severity, Verdict } from "@/lib/listingcheck/types";
import { scamReportMailto, summaryText, VERDICT_LABEL } from "@/lib/listingcheck/summary";
import type { ParsedText } from "@/lib/listingcheck/text";

export const VERDICT_STYLE: Record<Verdict, { box: string; text: string; bar: string; Icon: typeof Check }> = {
  worth: { box: "border-good/40 bg-good-soft", text: "text-good", bar: "bg-good", Icon: CheckCircle2 },
  caution: { box: "border-warn/40 bg-warn-soft", text: "text-warn", bar: "bg-warn", Icon: AlertTriangle },
  skip: { box: "border-signal/40 bg-signal-soft", text: "text-signal", bar: "bg-signal", Icon: OctagonX },
};

const SEV: Record<Severity, { en: string; bn: string; cls: string }> = {
  critical: { en: "Deal-breaker", bn: "ডিল-ব্রেকার", cls: "bg-signal text-white" },
  high: { en: "Serious", bn: "গুরুতর", cls: "bg-signal-soft text-signal" },
  medium: { en: "Caution", bn: "সতর্কতা", cls: "bg-warn-soft text-warn" },
  low: { en: "Minor", bn: "সামান্য", cls: "bg-surface-3 text-ink-2" },
};

export function useBi() {
  const { lang } = useLang();
  return (b: Bi) => (lang === "bn" ? b.bn : b.en);
}

export function VerdictBadge({ verdict, size = "md" }: { verdict: Verdict; size?: "sm" | "md" }) {
  const bi = useBi();
  const s = VERDICT_STYLE[verdict];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border font-semibold ${s.box} ${s.text} ${size === "sm" ? "px-2.5 py-0.5 text-[12.5px]" : "px-3 py-1 text-[14px]"}`}>
      <s.Icon size={size === "sm" ? 13 : 15} aria-hidden />
      {bi(VERDICT_LABEL[verdict])}
    </span>
  );
}

function PriceBar({ a }: { a: Assessment }) {
  const tx = useTx();
  const { lang } = useLang();
  const p = a.price;
  if (!p.known) return null;
  const asking = p.asking ?? 0;
  const max = Math.max(p.fairHigh * 1.5, asking * 1.1);
  const pos = (n: number) => `${Math.max(0, Math.min(100, (n / max) * 100))}%`;
  return (
    <div>
      <div className="relative mt-8 h-3 rounded-full bg-surface-3" role="img"
        aria-label={tx(`Usual range ${formatLakh(p.fairLow, lang)} to ${formatLakh(p.fairHigh, lang)}`, `স্বাভাবিক সীমা ${formatLakh(p.fairLow, lang)} থেকে ${formatLakh(p.fairHigh, lang)}`)}>
        <div className="absolute top-0 h-full rounded-full bg-good/70" style={{ left: pos(p.fairLow), width: `calc(${pos(p.fairHigh)} - ${pos(p.fairLow)})` }} />
        {p.asking != null && (
          <div className="absolute -top-6 -translate-x-1/2" style={{ left: pos(asking) }}>
            <div className="whitespace-nowrap rounded bg-ink px-1.5 py-0.5 text-[11px] font-semibold text-bg tnum">{tx("Asking", "চাওয়া")}</div>
            <div className="mx-auto h-8 w-0.5 bg-ink" />
          </div>
        )}
      </div>
      <div className="mt-2 flex justify-between text-[12.5px] text-muted tnum">
        <span>{formatLakh(p.fairLow, lang)}</span>
        <span className="text-good">{tx("usual range", "স্বাভাবিক সীমা")}</span>
        <span>{formatLakh(p.fairHigh, lang)}</span>
      </div>
    </div>
  );
}

export function PriceCard({ a }: { a: Assessment }) {
  const bi = useBi();
  const tx = useTx();
  const { lang } = useLang();
  const p = a.price;
  return (
    <div className="rounded-xl border border-line p-4">
      <h3 className="text-[15px] font-semibold text-ink">{tx("Price check", "দামের তুলনা")}<Approx /></h3>
      {p.known ? (
        <>
          <dl className="mt-3 grid grid-cols-2 gap-3 text-[14px]">
            <div>
              <dt className="text-[12.5px] text-muted">{tx("Asking", "চাওয়া দাম")}</dt>
              <dd className="font-semibold text-ink tnum">{p.asking != null ? formatLakh(p.asking, lang) : "-"}</dd>
            </div>
            <div>
              <dt className="text-[12.5px] text-muted">{tx("Usual middle", "স্বাভাবিক মাঝামাঝি")}</dt>
              <dd className="font-semibold text-ink tnum">{formatLakh(p.fairMid, lang)}</dd>
            </div>
          </dl>
          {p.deltaPct != null && (
            <p className="mt-2 text-[14px] text-ink-2 tnum">
              {p.deltaPct === 0 ? tx("On the usual middle.", "ঠিক মাঝামাঝি।") : p.deltaPct < 0 ? tx(`${Math.round(-p.deltaPct)}% below the usual middle.`, `স্বাভাবিক মাঝামাঝির চেয়ে ${Math.round(-p.deltaPct)}% কম।`) : tx(`${Math.round(p.deltaPct)}% above the usual middle.`, `স্বাভাবিক মাঝামাঝির চেয়ে ${Math.round(p.deltaPct)}% বেশি।`)}
            </p>
          )}
          <PriceBar a={a} />
          <p className="mt-3 text-[13.5px] leading-relaxed text-ink-2">{bi(p.note)}</p>
          <p className="mt-1.5 text-[12.5px] leading-snug text-muted">{bi(p.basis)}</p>
        </>
      ) : (
        <p className="mt-2 text-[14px] text-muted">{bi(p.basis)}</p>
      )}
    </div>
  );
}

function FlagRow({ f }: { f: Flag }) {
  const bi = useBi();
  const tx = useTx();
  return (
    <li className="rounded-xl border border-line p-3">
      <div className="flex flex-wrap items-center gap-2">
        <span className={`rounded-full px-2 py-0.5 text-[11.5px] font-semibold ${SEV[f.severity].cls}`}>{tx(SEV[f.severity].en, SEV[f.severity].bn)}</span>
        {f.fromText && <span className="rounded-full bg-surface-3 px-2 py-0.5 text-[11.5px] font-medium text-ink-2">{tx("found in pasted text", "পেস্ট করা লেখায় পাওয়া")}</span>}
      </div>
      <p className="mt-1.5 text-[14.5px] font-semibold leading-snug text-ink">{bi(f.title)}</p>
      <p className="mt-1 text-[13.5px] leading-relaxed text-ink-2">{bi(f.detail)}</p>
    </li>
  );
}

export function ResultPanel({
  l, a, bikeName, questions, parsed, onApplyText,
}: {
  l: Listing; a: Assessment; bikeName: string; questions: Question[]; parsed: ParsedText; onApplyText: () => void;
}) {
  const tx = useTx();
  const { lang } = useLang();
  const bi = useBi();
  const [copied, setCopied] = useState<"" | "summary" | "questions">("");
  const style = VERDICT_STYLE[a.verdict];
  const flags = a.flags;

  const copy = async (text: string, which: "summary" | "questions") => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(which);
      setTimeout(() => setCopied(""), 1800);
    } catch {}
  };
  const summary = () => summaryText(l, a, bikeName, lang, SITE.url);
  const share = async () => {
    const text = summary();
    if (navigator.share) {
      try {
        await navigator.share({ title: "Suggest.Bike listing check", text });
        return;
      } catch {}
    }
    copy(text, "summary");
  };
  const qText = questions.map((q, i) => `${i + 1}. ${bi(q.text)}`).join("\n");
  const fillable = (parsed.price != null && l.askingBDT == null) || (parsed.km != null && l.km == null) || (parsed.year != null && l.year == null);

  return (
    <div className="grid gap-4" aria-live="polite">
      <div className={`rounded-2xl border p-4 sm:p-5 ${style.box}`}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <VerdictBadge verdict={a.verdict} />
          <p className={`text-[34px] font-semibold leading-none tracking-tight tnum ${style.text}`}>
            {a.score}
            <span className="text-[15px] font-medium text-muted">/100</span>
          </p>
        </div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-surface/70" role="progressbar" aria-valuenow={a.score} aria-valuemin={0} aria-valuemax={100} aria-label={tx("Score", "স্কোর")}>
          <div className={`h-full rounded-full ${style.bar}`} style={{ width: `${a.score}%` }} />
        </div>
        <ul className="mt-3 grid gap-1.5 text-[14px] leading-snug text-ink">
          {a.reasons.map((r, i) => (
            <li key={i} className="flex gap-2"><span aria-hidden className={style.text}>•</span><span className="min-w-0">{bi(r)}</span></li>
          ))}
        </ul>
        <p className="mt-3 text-[12.5px] leading-snug text-ink-2">
          {tx(
            `Confidence: ${a.confidence}.`,
            `নির্ভরযোগ্যতা: ${a.confidence === "high" ? "বেশি" : a.confidence === "medium" ? "মাঝারি" : "কম"}।`,
          )}{" "}
          {a.missing.length > 0 && tx("Not filled in: ", "দেওয়া হয়নি: ")}
          {a.missing.map((m) => bi(m)).join(", ")}
        </p>
      </div>

      <PriceCard a={a} />

      {parsed.signals.length > 0 || parsed.price != null || parsed.km != null || parsed.year != null ? (
        <div className="rounded-xl border border-line p-4">
          <h3 className="text-[15px] font-semibold text-ink">{tx("What the keyword matcher found", "কীওয়ার্ড ম্যাচার যা পেয়েছে")}</h3>
          <p className="mt-1 text-[12.5px] leading-snug text-muted">{tx("Simple keyword matching, not AI. It can miss things or match the wrong word.", "সাধারণ কীওয়ার্ড মেলানো, AI নয়। কিছু বাদ পড়তে বা ভুল শব্দ ধরতে পারে।")}</p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {parsed.price != null && <span className="chip tnum">{tx("price", "দাম")} {formatLakh(parsed.price, lang)}</span>}
            {parsed.km != null && <span className="chip tnum">{parsed.km.toLocaleString("en-US")} km</span>}
            {parsed.year != null && <span className="chip tnum">{parsed.year}</span>}
            {parsed.signals.map((s) => (
              <span key={s.id} className="chip max-w-full"><span className="truncate">&ldquo;{s.match}&rdquo;</span></span>
            ))}
          </div>
          {fillable && (
            <button type="button" onClick={onApplyText} className="btn-secondary mt-3 h-10 text-[14px]">
              {tx("Fill empty form fields from text", "লেখা থেকে ফাঁকা ঘর পূরণ করুন")}
            </button>
          )}
        </div>
      ) : null}

      <div>
        <h3 className="mb-2 flex items-center gap-2 text-[16px] font-semibold text-ink"><ShieldAlert size={17} className="text-signal" aria-hidden />{tx("Red flags", "লাল সংকেত")} <span className="text-[13px] font-medium text-muted">({flags.length})</span></h3>
        {flags.length ? <ul className="grid gap-2">{flags.map((f) => <FlagRow key={f.id} f={f} />)}</ul> : <p className="text-[14px] text-muted">{tx("None found from what you entered. That is not proof the listing is safe.", "আপনার দেওয়া তথ্যে কিছু পাওয়া যায়নি। এর মানে বিজ্ঞাপন নিরাপদ, তা নয়।")}</p>}
      </div>

      <div>
        <h3 className="mb-2 flex items-center gap-2 text-[16px] font-semibold text-ink"><CheckCircle2 size={17} className="text-good" aria-hidden />{tx("Good signs", "ভালো লক্ষণ")} <span className="text-[13px] font-medium text-muted">({a.greens.length})</span></h3>
        {a.greens.length ? (
          <ul className="grid gap-2">
            {a.greens.map((g) => (
              <li key={g.id} className="rounded-xl border border-line p-3">
                <p className="text-[14.5px] font-semibold leading-snug text-ink">{bi(g.title)}</p>
                <p className="mt-1 text-[13.5px] leading-relaxed text-ink-2">{bi(g.detail)}</p>
              </li>
            ))}
          </ul>
        ) : <p className="text-[14px] text-muted">{tx("Nothing confirmed yet. Ask the questions below.", "এখনও কিছু নিশ্চিত নয়। নিচের প্রশ্নগুলো করুন।")}</p>}
      </div>

      <div>
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
          <h3 className="flex items-center gap-2 text-[16px] font-semibold text-ink"><HelpCircle size={17} className="text-brand" aria-hidden />{tx("What to ask next", "পরবর্তীতে যা জিজ্ঞেস করবেন")}</h3>
          <button type="button" onClick={() => copy(qText, "questions")} className="btn-ghost h-9 px-3 text-[13.5px]">
            {copied === "questions" ? <Check size={15} /> : <ClipboardCopy size={15} />}
            {copied === "questions" ? tx("Copied", "কপি হয়েছে") : tx("Copy questions", "প্রশ্ন কপি")}
          </button>
        </div>
        <ol className="grid gap-2">
          {questions.map((q, i) => (
            <li key={q.id} className="flex gap-3 rounded-xl border border-line p-3">
              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-surface-3 text-[12px] font-semibold text-ink-2 tnum">{i + 1}</span>
              <div className="min-w-0">
                <p className="text-[14px] leading-snug text-ink [overflow-wrap:anywhere]">{bi(q.text)}</p>
                {q.source === "model" && <p className="mt-1 text-[12px] font-medium text-brand">{tx("Specific to this model", "এই মডেলের জন্য")}</p>}
                {q.why && <p className="mt-1 text-[12.5px] leading-snug text-muted">{bi(q.why)}</p>}
              </div>
            </li>
          ))}
        </ol>
      </div>

      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={() => copy(summary(), "summary")} className="btn-secondary h-10 text-[14px]">
          {copied === "summary" ? <Check size={16} /> : <ClipboardCopy size={16} />}
          {copied === "summary" ? tx("Copied", "কপি হয়েছে") : tx("Copy summary", "সারাংশ কপি")}
        </button>
        <button type="button" onClick={share} className="btn-secondary h-10 text-[14px]"><Share2 size={16} />{tx("Send to a friend", "বন্ধুকে পাঠান")}</button>
        <a href={scamReportMailto(SITE.contactEmail, l, a, bikeName)} className="btn-ghost h-10 text-[14px] text-signal"><Mail size={16} /><FlagIcon size={14} className="-ml-1" aria-hidden />{tx("Report a scam listing", "স্ক্যাম বিজ্ঞাপন রিপোর্ট")}</a>
      </div>
    </div>
  );
}
