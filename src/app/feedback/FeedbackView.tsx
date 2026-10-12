"use client";

import Link from "next/link";
import { useTx } from "@/lib/i18n";
import { FeedbackForm } from "@/components/FeedbackForm";

export function FeedbackView() {
  const tx = useTx();
  return (
    <div className="container-x max-w-2xl pt-12">
      <p className="eyebrow">{tx("Feedback", "মতামত")}</p>
      <h1 className="mt-2 text-[32px] font-semibold leading-tight tracking-[-0.03em] text-ink sm:text-[44px]">{tx("Tell us what's wrong", "কী ভুল আছে জানান")}</h1>
      <p className="mt-4 text-[16px] leading-relaxed text-ink-2">
        {tx("Wrong price, missing bike, confusing page. No account needed. Say which bike or page. Own a bike? Use the \"I own this\" form on its page to report your on-road price and real mileage.", "ভুল দাম, বাদ পড়া বাইক বা বিভ্রান্তিকর পাতা। অ্যাকাউন্ট লাগবে না। কোন বাইক বা পাতা, তা লিখুন। বাইক আছে? তার পাতার \"আমার এই বাইক আছে\" ফর্মে আপনার অন-রোড দাম ও আসল মাইলেজ জানান।")}{" "}
        <Link href="/method/" className="text-brand underline underline-offset-2">{tx("How reports are used", "রিপোর্ট কীভাবে ব্যবহার হয়")}</Link>
      </p>
      <div className="mt-8">
        <FeedbackForm kind="feedback" />
      </div>
    </div>
  );
}
