"use client";

import { useState } from "react";
import Link from "@/components/LangLink";
import { useTx } from "@/lib/i18n";
import { FORM_ENDPOINT, SITE, track, whatsappUrl } from "@/lib/site";
import { LIMITS, formRoute, reportBody, validateReport, type ReportInput, type ReportKind } from "@/lib/report";

const ERR: Record<string, [string, string]> = {
  message: ["Write a message (up to 2000 characters).", "একটি বার্তা লিখুন (২০০০ অক্ষর পর্যন্ত)।"],
  name: ["Write your name (up to 60 characters, no email address).", "আপনার নাম লিখুন (৬০ অক্ষর পর্যন্ত, ইমেইল ঠিকানা নয়)।"],
  emailNeeded: ["Add your email. It is never shown on the site.", "আপনার ইমেইল দিন। এটি সাইটে কখনো দেখানো হয় না।"],
  email: ["That email doesn't look right.", "ইমেইলটি ঠিক মনে হচ্ছে না।"],
  onRoad: ["On-road price should be between ৳50,000 and ৳30,00,000.", "অন-রোড দাম ৳৫০,০০০ থেকে ৳৩০,০০,০০০-এর মধ্যে হওয়া উচিত।"],
  kmpl: ["Mileage should be between 10 and 120 km/l.", "মাইলেজ ১০ থেকে ১২০ কিমি/লি-এর মধ্যে হওয়া উচিত।"],
  month: ["Pick a past month.", "আগের কোনো মাস বেছে নিন।"],
  showroom: ["Showroom name is too long.", "শোরুমের নাম অনেক লম্বা।"],
  empty: ["Fill in at least the price, mileage or a note.", "অন্তত দাম, মাইলেজ বা একটি মন্তব্য দিন।"],
};

/** Feedback, "I own this" report, or a post comment (name + email + text; shown only after the owner approves it). Posts JSON to FORM_ENDPOINT; with no endpoint feedback opens a prefilled email and comments are closed (formRoute). */
export function FeedbackForm({ kind, bike, post }: { kind: ReportKind; bike?: { id: string; name: string; ev?: boolean }; post?: { slug: string; title: string } }) {
  const tx = useTx();
  const [r, setR] = useState<ReportInput>({ message: "", email: "", name: "", onRoadBDT: "", showroom: "", month: "", kmpl: "" });
  const [gotcha, setGotcha] = useState("");
  const [errs, setErrs] = useState<string[]>([]);
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const set = (k: keyof ReportInput) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setR({ ...r, [k]: e.target.value });
  const subject = kind === "owner" ? `Owner report: ${bike?.name ?? ""}` : kind === "comment" ? `Comment: ${post?.title ?? ""}` : "Suggest.Bike feedback";
  const body = reportBody(kind, r, bike ?? (post && { id: post.slug, name: post.title }));
  const mailto = `mailto:${SITE.contactEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  const route = formRoute(kind, FORM_ENDPOINT);
  const wa = whatsappUrl(kind === "owner" ? `Owner report: ${bike?.name ?? ""}\n` : "Suggest.Bike feedback:\n");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (gotcha) {
      // Spam bot caught by honeypot
      setState("sent");
      return;
    }
    const v = validateReport(kind, r);
    setErrs(v);
    if (v.length) return;
    track(`form-${kind}`);
    if (route !== "endpoint") return void (window.location.href = mailto); // "closed" never renders the form
    setState("sending");
    try {
      const res = await fetch(FORM_ENDPOINT, {
        method: "POST",
        headers: { "content-type": "application/json", accept: "application/json" },
        body: JSON.stringify({ kind, bike: bike?.id ?? "", ...(post ? { post: post.slug } : {}), ...r, _subject: subject, _gotcha: gotcha, ...(r.email ? { _replyto: r.email } : {}) }),
      });
      setState(res.ok ? "sent" : "error");
    } catch {
      setState("error");
    }
  }

  if (state === "sent")
    return (
      <p role="status" className="rounded-xl border border-line-strong p-4 text-[15px] text-ink">
        {kind === "comment" ? tx("Thanks. We read it by hand; if we approve it, it appears here with your name after our next site update.", "ধন্যবাদ। আমরা নিজে পড়ে দেখি; অনুমোদন করলে পরের সাইট আপডেটে আপনার নামসহ এখানে দেখা যাবে।") : tx("Thanks, received. We read every report.", "ধন্যবাদ, পেয়েছি। প্রতিটি রিপোর্ট আমরা পড়ি।")}
      </p>
    );

  if (route === "closed")
    return (
      <p role="status" className="rounded-xl border border-line-strong p-4 text-[15px] text-ink-2">
        {tx("Comments are not open yet. ", "মন্তব্য এখনো চালু হয়নি। ")}
        <Link href="/feedback/" className="text-brand underline underline-offset-2">{tx("Send us feedback instead", "এর বদলে মতামত পাঠান")}</Link>
      </p>
    );

  const field = "block text-[13px] font-medium text-ink-2";
  return (
    <form onSubmit={submit} noValidate className="space-y-4">
      <input
        type="text"
        name="_gotcha"
        value={gotcha}
        onChange={(e) => setGotcha(e.target.value)}
        tabIndex={-1}
        autoComplete="off"
        className="hidden"
        aria-hidden="true"
      />
      {kind === "owner" && (
        <div className="grid gap-4 sm:grid-cols-2">
          <label className={field}>
            {tx("On-road price you paid (৳)", "আপনার দেওয়া অন-রোড দাম (৳)")}
            <input type="number" inputMode="numeric" min={LIMITS.onRoadMin} max={LIMITS.onRoadMax} value={r.onRoadBDT} onChange={set("onRoadBDT")} className="input mt-2 w-full" />
          </label>
          {/* EV owners give their range in the note; km/l limits don't apply */}
          {!bike?.ev && (
            <label className={field}>
              {tx("Real mileage (km/l)", "আসল মাইলেজ (কিমি/লি)")}
              <input type="number" inputMode="decimal" min={LIMITS.kmplMin} max={LIMITS.kmplMax} step="0.5" value={r.kmpl} onChange={set("kmpl")} className="input mt-2 w-full" />
            </label>
          )}
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
      {kind === "comment" && (
        <label className={field}>
          {tx("Your name (shown with your comment)", "আপনার নাম (মন্তব্যের সাথে দেখানো হবে)")}
          <input required autoComplete="name" maxLength={LIMITS.name} value={r.name} onChange={set("name")} className="input mt-2 w-full" />
        </label>
      )}
      <label className={field}>
        {kind === "owner" ? tx("Anything else (optional)", "আর কিছু (ঐচ্ছিক)") : kind === "comment" ? tx("Your comment", "আপনার মন্তব্য") : tx("Your message", "আপনার বার্তা")}
        <textarea rows={kind === "owner" ? 3 : 6} maxLength={LIMITS.message} value={r.message} onChange={set("message")} className="input mt-2 w-full" />
      </label>
      <label className={field}>
        {kind === "comment" ? tx("Email (required, never shown publicly)", "ইমেইল (আবশ্যক, কখনো প্রকাশ করা হয় না)") : tx("Email (optional, only if you want a reply)", "ইমেইল (ঐচ্ছিক, উত্তর চাইলে)")}
        <input type="email" autoComplete="email" required={kind === "comment"} maxLength={LIMITS.email} value={r.email} onChange={set("email")} className="input mt-2 w-full" />
      </label>
      {errs.length > 0 && (
        <ul role="alert" className="list-disc pl-5 text-[13.5px] text-signal">
          {errs.map((k) => <li key={k}>{tx(...(ERR[k] ?? [k, k]))}</li>)}
        </ul>
      )}
      <div className="flex flex-wrap items-center gap-3">
        <button type="submit" disabled={state === "sending"} className="btn-primary">{state === "sending" ? tx("Sending…", "পাঠানো হচ্ছে…") : tx("Send", "পাঠান")}</button>
        {wa && kind !== "comment" && (
          <a href={wa} target="_blank" rel="noopener noreferrer" className="btn-secondary">
            {tx("Or message on WhatsApp", "অথবা হোয়াটসঅ্যাপে লিখুন")}
          </a>
        )}
        <span className="text-[12.5px] text-faint">{FORM_ENDPOINT ? (kind === "comment" ? tx("No account needed. Comments are checked before they appear.", "অ্যাকাউন্ট লাগবে না। মন্তব্য যাচাইয়ের পর দেখানো হয়।") : tx("No account needed. No name or phone asked.", "অ্যাকাউন্ট লাগবে না। নাম বা ফোন চাওয়া হয় না।")) : tx("Opens your email app with this filled in.", "এগুলো লেখা অবস্থায় আপনার ইমেইল অ্যাপ খুলবে।")}</span>
      </div>
      {state === "error" && (
        <p role="alert" className="text-[14px] text-ink-2">
          {tx("Could not send. ", "পাঠানো যায়নি। ")}
          {kind === "comment" ? tx("Please try again later.", "একটু পরে আবার চেষ্টা করুন।") : <a className="text-brand underline" href={mailto}>{tx("Email it instead", "ইমেইলে পাঠান")}</a>}
        </p>
      )}
    </form>
  );
}
