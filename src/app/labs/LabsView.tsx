"use client";

import Link from "next/link";
import { ArrowRight, Radar, Scale, ShieldCheck, Wrench } from "lucide-react";
import { ExperimentalBadge } from "@/components/Experimental";
import { SectionHead } from "@/components/ui";
import { useTx } from "@/lib/i18n";
import { LAB_TOOLS } from "@/lib/labs";

const ICONS = { shield: ShieldCheck, wrench: Wrench, scale: Scale, radar: Radar };

export function LabsView() {
  const tx = useTx();
  const lang = tx("en", "bn") as "en" | "bn";
  return (
    <div className="container-x py-12">
      <SectionHead
        eyebrow={<ExperimentalBadge soon />}
        title={tx("Labs: buying a used bike without getting burned", "ল্যাবস: পুরনো বাইক কিনে ঠকে না যাওয়ার উপায়")}
        sub={tx(
          "New tools for the second-hand market. They are experimental, so expect rough edges. Tell us what is wrong and we will fix it.",
          "সেকেন্ড-হ্যান্ড বাজারের জন্য নতুন টুল। এগুলো পরীক্ষামূলক, তাই কিছু ত্রুটি থাকতে পারে। ভুল জানালে আমরা ঠিক করব।",
        )}
      />
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {LAB_TOOLS.map((tool) => {
          const Icon = ICONS[tool.icon];
          return (
            <Link key={tool.slug} href={tool.href} className="card group flex flex-col gap-4 p-6 transition-all hover:-translate-y-0.5 hover:border-line-strong hover:shadow-md">
              <div className="flex items-center justify-between">
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-surface-2 text-brand">
                  <Icon size={22} />
                </span>
                <ExperimentalBadge soon={tool.status === "soon"} />
              </div>
              <div>
                <h3 className="text-[18px] font-semibold tracking-tight text-ink">{tool.title[lang]}</h3>
                <p className="mt-2 text-[14.5px] leading-relaxed text-muted">{tool.blurb[lang]}</p>
              </div>
              <span className="mt-auto inline-flex items-center gap-1.5 text-[14px] font-semibold text-brand">
                {tool.status === "soon" ? tx("See the plan", "পরিকল্পনা দেখুন") : tx("Try the preview", "প্রিভিউ চালান")}
                <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" />
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
