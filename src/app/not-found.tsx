"use client";

import Link from "next/link";
import { useTx } from "@/lib/i18n";

export default function NotFound() {
  const tx = useTx();
  return (
    <div className="container-x grid min-h-[60vh] place-items-center text-center">
      <div>
        <p className="text-[64px] font-semibold tracking-tight text-faint tnum">404</p>
        <h1 className="mt-2 text-[24px] font-semibold text-ink">{tx("This road doesn't go anywhere.", "এই রাস্তা কোথাও যায় না।")}</h1>
        <p className="mt-2 text-[15px] text-muted">{tx("The page moved, or the bike isn't sold any more.", "পাতাটা সরানো হয়েছে, অথবা বাইকটা আর বিক্রি হয় না।")}</p>
        <div className="mt-6 flex justify-center gap-2">
          <Link href="/" className="btn-primary">
            {tx("Home", "হোম")}
          </Link>
          <Link href="/bikes/" className="btn-secondary">
            {tx("All bikes", "সব বাইক")}
          </Link>
        </div>
      </div>
    </div>
  );
}
