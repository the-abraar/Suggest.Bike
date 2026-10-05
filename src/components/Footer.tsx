"use client";

import Link from "next/link";
import { Logo } from "./Logo";
import { T, useLang } from "@/lib/i18n";
import { BIKES, CATEGORIES } from "@/lib/bikes";
import type { Category } from "@/lib/types";

export function Footer() {
  const { t } = useLang();
  const latest = BIKES.map((b) => b.priceAsOf).sort().at(-1);
  return (
    <footer className="mt-24 border-t border-line bg-surface">
      <div className="container-x grid gap-10 py-14 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div className="max-w-sm space-y-4">
          <Logo />
          <p className="text-[14px] leading-relaxed text-muted">
            <T k="footer.tag" />
          </p>
          <p className="text-[12.5px] text-faint">
            {BIKES.length} bikes · prices last checked {latest}
          </p>
        </div>
        <FooterCol title="Decide">
          <FLink href="/match/">{t("nav.match")}</FLink>
          <FLink href="/compare/">{t("nav.compare")}</FLink>
          <FLink href="/cost/">{t("nav.cost")}</FLink>
          <FLink href="/saved/">{t("nav.saved")}</FLink>
        </FooterCol>
        <FooterCol title="Browse">
          {(Object.keys(CATEGORIES) as Category[]).slice(0, 6).map((c) => (
            <FLink key={c} href={`/bikes/?cat=${c}`}>
              {CATEGORIES[c].en}
            </FLink>
          ))}
        </FooterCol>
        <FooterCol title="Learn">
          <FLink href="/guide/#registration">Registration cost</FLink>
          <FLink href="/guide/#licence">Driving licence</FLink>
          <FLink href="/guide/#used">Buying used</FLink>
          <FLink href="/guide/#rules">Road rules</FLink>
          <FLink href="/about/">How we rate</FLink>
        </FooterCol>
      </div>
      <div className="border-t border-line">
        <div className="container-x flex flex-col gap-2 py-6 text-[12.5px] text-faint sm:flex-row sm:justify-between">
          <span>© {new Date().getFullYear()} Suggest.Bike — independent, not affiliated with any manufacturer or dealer.</span>
          <span>Made in Bangladesh 🇧🇩</span>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="eyebrow mb-4">{title}</h3>
      <ul className="space-y-2.5">{children}</ul>
    </div>
  );
}
function FLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <li>
      <Link href={href} className="text-[14px] text-ink-2 transition-colors hover:text-brand">
        {children}
      </Link>
    </li>
  );
}
