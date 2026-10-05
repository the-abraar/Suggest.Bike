"use client";

import Link from "next/link";
import { Heart, Scale } from "lucide-react";
import { getBike } from "@/lib/bikes";
import { useStore } from "@/lib/store";
import { L } from "@/lib/i18n";
import { BikeCard } from "@/components/ui";

export default function SavedPage() {
  const { saved, ready } = useStore();
  const bikes = saved.map((id) => getBike(id)).filter((b) => !!b);

  return (
    <div className="container-x pt-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-[32px] font-semibold tracking-[-0.03em] text-ink sm:text-[40px]">
            <L en="Your shortlist" bn="আপনার পছন্দের তালিকা" />
          </h1>
          <p className="mt-1.5 text-[15.5px] text-muted">
            <L en="Saved on this device. Tap the heart on any bike to add it." bn="এই ডিভাইসে সংরক্ষিত। যেকোনো বাইকে হার্ট চাপুন।" />
          </p>
        </div>
        {bikes.length >= 2 && (
          <Link href={`/compare/?bikes=${bikes.slice(0, 3).map((b) => b.id).join(",")}`} className="btn-primary">
            <Scale size={17} /> <L en={`Compare ${Math.min(3, bikes.length)}`} bn="তুলনা করুন" />
          </Link>
        )}
      </div>

      {ready && bikes.length === 0 ? (
        <div className="card mt-10 grid place-items-center px-6 py-20 text-center">
          <span className="grid h-14 w-14 place-items-center rounded-2xl bg-signal-soft text-signal">
            <Heart size={26} />
          </span>
          <p className="mt-5 text-[18px] font-semibold text-ink">
            <L en="Nothing saved yet" bn="এখনো কিছু সেভ করা হয়নি" />
          </p>
          <p className="mt-1 max-w-sm text-[14.5px] text-muted">
            <L en="Take the 60-second quiz or browse, and tap ♡ on the bikes you like." bn="৬০ সেকেন্ডের কুইজ দিন বা ব্রাউজ করুন, পছন্দের বাইকে ♡ চাপুন।" />
          </p>
          <div className="mt-6 flex gap-2">
            <Link href="/match/" className="btn-primary">
              <L en="Find my bike" bn="আমার বাইক খুঁজুন" />
            </Link>
            <Link href="/bikes/" className="btn-secondary">
              <L en="Browse" bn="ব্রাউজ" />
            </Link>
          </div>
        </div>
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {bikes.map((b) => (
            <BikeCard key={b.id} bike={b} />
          ))}
        </div>
      )}
    </div>
  );
}
