"use client";

import Link from "@/components/LangLink";
import { useLang, useTx } from "@/lib/i18n";
import { langHref } from "@/lib/site";

/** Static stand-in for a page that was live and is gone: old links and bookmarks land here and move on to the bike list. */
export function RetiredBike() {
  const { lang } = useLang();
  const tx = useTx();
  return (
    <div className="container-x grid min-h-[60vh] place-items-center text-center">
      {/* React hoists this into <head>, so the exported HTML redirects without JS. */}
      <meta httpEquiv="refresh" content={`0; url=${langHref("/bikes/", lang)}`} />
      <div>
        <h1 className="text-[24px] font-semibold text-ink">{tx("This bike is no longer listed.", "এই বাইকটি আর তালিকায় নেই।")}</h1>
        <p className="mt-2 text-[15px] text-muted">
          {tx("We removed this old used-only model because its price and parts could not be checked.", "পুরনো এই মডেলের দাম আর পার্টস যাচাই করা যায়নি, তাই এটি সরিয়ে দিয়েছি।")}
        </p>
        <div className="mt-6 flex justify-center">
          <Link href="/bikes/" className="btn-primary">
            {tx("See all bikes", "সব বাইক দেখুন")}
          </Link>
        </div>
      </div>
    </div>
  );
}
