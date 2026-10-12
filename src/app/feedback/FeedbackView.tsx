"use client";

import { useState } from "react";
import { useTx } from "@/lib/i18n";
import { SITE } from "@/lib/site";

// Set NEXT_PUBLIC_FEEDBACK_ENDPOINT at build time to any JSON-accepting form endpoint (Formspree, Web3Forms, a Worker).
// shortcut: with no endpoint it falls back to a mailto link; set one before launch so phones without a mail client work.
const ENDPOINT = process.env.NEXT_PUBLIC_FEEDBACK_ENDPOINT;

export function FeedbackView() {
  const tx = useTx();
  const [message, setMessage] = useState("");
  const [contact, setContact] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const body = `${message}\n\nContact: ${contact || "-"}\nPage: ${typeof document === "undefined" ? "" : document.referrer || "-"}`;
  const mailto = `mailto:${SITE.contactEmail}?subject=${encodeURIComponent("Suggest.Bike feedback")}&body=${encodeURIComponent(body)}`;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!message.trim()) return;
    if (!ENDPOINT) return void (window.location.href = mailto);
    setState("sending");
    try {
      const r = await fetch(ENDPOINT, { method: "POST", headers: { "content-type": "application/json", accept: "application/json" }, body: JSON.stringify({ message, contact, referrer: document.referrer }) });
      setState(r.ok ? "sent" : "error");
    } catch {
      setState("error");
    }
  }

  return (
    <div className="container-x max-w-2xl pt-12">
      <p className="eyebrow">{tx("Feedback", "মতামত")}</p>
      <h1 className="mt-2 text-[32px] font-semibold leading-tight tracking-[-0.03em] text-ink sm:text-[44px]">{tx("Tell us what's wrong", "কী ভুল আছে জানান")}</h1>
      <p className="mt-4 text-[16px] leading-relaxed text-ink-2">
        {tx("Wrong price, missing bike, confusing page. No account needed. Say which bike or page.", "ভুল দাম, বাদ পড়া বাইক বা বিভ্রান্তিকর পাতা। অ্যাকাউন্ট লাগবে না। কোন বাইক বা পাতা, তা লিখুন।")}
      </p>
      {state === "sent" ? (
        <p role="status" className="mt-8 rounded-xl border border-line-strong p-4 text-[15px] text-ink">{tx("Thanks, received.", "ধন্যবাদ, পেয়েছি।")}</p>
      ) : (
        <form onSubmit={submit} className="mt-8 space-y-4">
          <label className="block text-[13px] font-medium text-ink-2">
            {tx("Your message", "আপনার বার্তা")}
            <textarea required rows={6} maxLength={2000} value={message} onChange={(e) => setMessage(e.target.value)} className="input mt-2 w-full" />
          </label>
          <label className="block text-[13px] font-medium text-ink-2">
            {tx("Phone or email (optional, only if you want a reply)", "ফোন বা ইমেইল (ঐচ্ছিক, উত্তর চাইলে)")}
            <input value={contact} maxLength={120} onChange={(e) => setContact(e.target.value)} className="input mt-2 w-full" />
          </label>
          <button type="submit" disabled={state === "sending"} className="btn-primary">{state === "sending" ? tx("Sending…", "পাঠানো হচ্ছে…") : tx("Send", "পাঠান")}</button>
          {state === "error" && (
            <p role="alert" className="text-[14px] text-ink-2">
              {tx("Could not send. ", "পাঠানো যায়নি। ")}
              <a className="text-brand underline" href={mailto}>{tx("Email it instead", "ইমেইলে পাঠান")}</a>
            </p>
          )}
        </form>
      )}
    </div>
  );
}
