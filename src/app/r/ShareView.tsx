"use client";

import { useEffect } from "react";
import Link from "@/components/LangLink";
import { BikeArt } from "@/components/BikeArt";
import { getBike } from "@/lib/bikes";
import { useLang } from "@/lib/i18n";
import { shareCard } from "@/lib/share";
import { track } from "@/lib/site";

/** Landing page of a shared quiz result: the sharer's top bike, and the quiz with that bike kept for "compare with a friend". */
export function ShareView({ id }: { id: string }) {
  const { lang } = useLang();
  const b = getBike(id)!;
  const c = shareCard(b, lang);
  useEffect(() => track("share-landing"), []);
  return (
    <div className="container-x min-w-0 max-w-3xl pt-12">
      <p className="eyebrow">{c.meta}</p>
      <h1 className="mt-2 text-[30px] font-semibold leading-tight tracking-[-0.03em] text-ink sm:text-[40px]">{c.title}</h1>
      <BikeArt bike={b} className="mx-auto mt-6 w-full max-w-[420px]" />
      <p className="mt-6 text-[16px] leading-relaxed text-ink-2">{c.description}</p>
      <div className="mt-6 flex flex-wrap gap-3">
        <Link href={`/match/?vs=${encodeURIComponent(b.id)}`} className="btn-primary h-12 px-5 text-[15.5px]">
          {lang === "bn" ? "কুইজ দিন, তারপর মিলিয়ে দেখুন" : "Take the quiz, then compare"}
        </Link>
        <Link href={`/bikes/${b.id}/`} className="btn-secondary h-12 px-5 text-[15.5px]">
          {lang === "bn" ? `${b.model}-এর পুরো তথ্য` : `${b.model} in detail`}
        </Link>
      </div>
    </div>
  );
}
