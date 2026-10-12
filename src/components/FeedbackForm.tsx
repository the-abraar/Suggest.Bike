"use client";

import { useState } from "react";
import { useTx } from "@/lib/i18n";
import { FORM_ENDPOINT, SITE, track } from "@/lib/site";
import { LIMITS, reportBody, validateReport, type ReportInput, type ReportKind } from "@/lib/report";

const ERR: Record<string, [string, string]> = {
  message: ["Write a message (up to 2000 characters).", "একটি বার্তা লিখুন (২০০০ অক্ষর পর্যন্ত)।"],
  email: ["That email doesn't look right.", "ইমেইলটি ঠিক মনে হচ্ছে না।"],
  onRoad: ["On-road price should be between ৳50,000 and ৳30,00,000.", "অন-রোড দাম ৳৫০,০০০ থেকে ৳৩০,০০,০০০-এর মধ্যে হওয়া উচিত।"],
  kmpl: ["Mileage should be between 10 and 120 km/l.", "মাইলেজ ১০ থেকে ১২০ কিমি/লি-এর মধ্যে হওয়া উচিত।"],
  month: ["Pick a past month.", "আগের কোনো মাস বেছে নিন।"],
  showroom: ["Showroom name is too long.", "শোরুমের নাম অনেক লম্বা।"],
  empty: ["Fill in at least the price, mileage or a note.", "অন্তত দাম, মাইলেজ বা একটি মন্তব্য দিন।"],
};

/** Feedback or "I own this" report. Posts JSON to FORM_ENDPOINT; with no endpoint it opens a prefilled email. */
export function FeedbackForm({ kind, bike }: { kind: ReportKind; bike?: { id: string; name: string } }) {
  const tx = useTx();
  const [r, setR] = useState<ReportInput>({ message: "", email: "", onRoadBDT: "", showroom: "", month: "", kmpl: "" });
  const [errs, setErrs] = useState<string[]>([]);
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const set = (k: keyof ReportInput) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setR({ ...r, [k]: e.target.value });
  const subject = kind === "owner" ? `Owner report: ${bike?.name ?? ""}` : "Suggest.Bike feedback";
  const body = reportBody(kind, r, bike);
  const mailto = `mailto:${SITE.contactEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const v = validateReport(kind, r);
    setErrs(v);
    if (v.length) return;
    track(`form-${kind}`);
    if (!FORM_ENDPOINT) return void (window.location.href = mailto);
    setState("sending");
    try {
      const res = await fetch(FORM_ENDPOINT, {
        method: "POST",
        headers: { "content-type": "application/json", accept: "application/json" },
        body: JSON.stringify({ kind, bike: bike?.id ?? "", ...r, _subject: subject, ...(r.email ? { _replyto: r.email } : {}) }),
      });
      setState(res.ok ? "sent" : "error");
    } catch {
      setState("error");
    }
  }

  if (state === "sent") return <p role="status" className="rounded-xl border border-line-strong p-4 text-[15px] text-ink">{tx("Thanks, received. We read every report.", "ধন্যবাদ, পেয়েছি। প্রতিটি রিপোর্ট আমরা পড়ি।")}</p>;

  const field = "block text-[13px] font-medium text-ink-2";
  return (
    <form onSubmit={submit} noValidate className="space-y-4">
      {kind === "owner" && (
        <div className="grid gap-4 sm:grid-cols-2">
          <label className={field}>
            {tx("On-road price you paid (৳)", "আপনার দেওয়া অন-রোড দাম (৳)")}
            <input type="number" inputMode="numeric" min={LIMITS.onRoadMin} max={LIMITS.onRoadMax} value={r.onRoadBDT} onChange={set("onRoadBDT")} className="input mt-2 w-full" />
          </label>
          <label className={field}>
            {tx("Real mileage (km/l)", "আসল মাইলেজ (কিমি/লি)")}
            <input type="number" inputMode="decimal" min={LIMITS.kmplMin} max={LIMITS.kmplMax} step="0.5" value={r.kmpl} onChange={set("kmpl")} className="input mt-2 w-full" />
          </label>
          <label className={field}>
            {tx("Showroom or district", "শোরুম বা জেলা")}
            <input maxLength={LIMITS.showroom} value={r.showroom} onChange={set("showroom")} className="input mt-2 w-full" />
          </label>
          <label className={field}>
            {tx("Month you bought it", "কেনার মাস")}
            <input type="month" value={r.month} onChange={set("month")} className="input mt-2 w-full" />
          </label>
        </div>
      )}
      <label className={field}>
        {kind === "owner" ? tx("Anything else (optional)", "আর কিছু (ঐচ্ছিক)") : tx("Your message", "আপনার বার্তা")}
        <textarea rows={kind === "owner" ? 3 : 6} maxLength={LIMITS.message} value={r.message} onChange={set("message")} className="input mt-2 w-full" />
      </label>
      <label className={field}>
        {tx("Email (optional, only if you want a reply)", "ইমেইল (ঐচ্ছিক, উত্তর চাইলে)")}
        <input type="email" maxLength={LIMITS.email} value={r.email} onChange={set("email")} className="input mt-2 w-full" />
      </label>
      {errs.length > 0 && (
        <ul role="alert" className="list-disc pl-5 text-[13.5px] text-signal">
          {errs.map((k) => <li key={k}>{tx(...(ERR[k] ?? [k, k]))}</li>)}
        </ul>
      )}
      <div className="flex flex-wrap items-center gap-3">
        <button type="submit" disabled={state === "sending"} className="btn-primary">{state === "sending" ? tx("Sending…", "পাঠানো হচ্ছে…") : tx("Send", "পাঠান")}</button>
        <span className="text-[12.5px] text-faint">{FORM_ENDPOINT ? tx("No account needed. No name or phone asked.", "অ্যাকাউন্ট লাগবে না। নাম বা ফোন চাওয়া হয় না।") : tx("Opens your email app with this filled in.", "এগুলো লেখা অবস্থায় আপনার ইমেইল অ্যাপ খুলবে।")}</span>
      </div>
      {state === "error" && (
        <p role="alert" className="text-[14px] text-ink-2">
          {tx("Could not send. ", "পাঠানো যায়নি। ")}
          <a className="text-brand underline" href={mailto}>{tx("Email it instead", "ইমেইলে পাঠান")}</a>
        </p>
      )}
    </form>
  );
}
