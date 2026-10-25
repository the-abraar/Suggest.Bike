import type { Metadata } from "next";
import { FlaskConical } from "lucide-react";

// Every /experimental/ page: noindex, nofollow (robots.ts also disallows the path; sitemap.ts leaves it out; nothing links here).
export const metadata: Metadata = { robots: { index: false, follow: false } };

export default function ExperimentalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="pb-16">
      <div className="sticky top-16 z-40 border-b border-accent/60 bg-accent-soft">
        <p className="container-x flex items-start gap-2 py-2 text-[13px] font-medium leading-snug text-ink sm:items-center sm:text-[14px]">
          <FlaskConical size={16} className="mt-0.5 shrink-0 text-accent-text sm:mt-0" aria-hidden />
          <span>
            <strong className="font-semibold">Preview only: this shop is not live.</strong> Nothing here is for sale, and nothing you enter is sent anywhere.
          </span>
        </p>
      </div>
      {children}
    </div>
  );
}
