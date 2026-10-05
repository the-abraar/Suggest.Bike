"use client";

import Link from "next/link";
import { Logo } from "./Logo";
import { T, useLang } from "@/lib/i18n";
import { BIKES, CATEGORIES } from "@/lib/bikes";
import { SITE } from "@/lib/site";
import type { Category } from "@/lib/types";

export function Footer() {
  const { t, lang } = useLang();
  const tx = (en: string, bn: string) => (lang === "bn" ? bn : en);
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
            {lang === "bn" ? `${BIKES.length}টি বাইক · দাম সর্বশেষ যাচাই ${latest}` : `${BIKES.length} bikes · prices last checked ${latest}`}
          </p>
        </div>
        <FooterCol title={tx("Decide", "সিদ্ধান্ত")}>
          <FLink href="/match/">{t("nav.match")}</FLink>
          <FLink href="/compare/">{t("nav.compare")}</FLink>
          <FLink href="/cost/">{t("nav.cost")}</FLink>
          <FLink href="/saved/">{t("nav.saved")}</FLink>
        </FooterCol>
        <FooterCol title={tx("Browse", "ব্রাউজ")}>
          {(Object.keys(CATEGORIES) as Category[]).slice(0, 6).map((c) => (
            <FLink key={c} href={`/bikes/?cat=${c}`}>
              {lang === "bn" ? CATEGORIES[c].bn : CATEGORIES[c].en}
            </FLink>
          ))}
        </FooterCol>
        <FooterCol title={tx("Learn", "জানুন")}>
          <FLink href="/guide/#registration">{tx("Registration cost", "রেজিস্ট্রেশন খরচ")}</FLink>
          <FLink href="/guide/#licence">{tx("Driving licence", "ড্রাইভিং লাইসেন্স")}</FLink>
          <FLink href="/guide/#emi">{tx("Paying in EMI", "কিস্তিতে কেনা")}</FLink>
          <FLink href="/guide/#used">{tx("Buying used", "পুরনো বাইক কেনা")}</FLink>
          <FLink href="/guide/#rules">{tx("Road rules", "রাস্তার নিয়ম")}</FLink>
          <FLink href="/about/">{tx("How we rate", "আমরা কীভাবে রেট করি")}</FLink>
          <li>
            <a href={`mailto:${SITE.contactEmail}?subject=${encodeURIComponent("Suggest.Bike feedback")}`} className="text-[14px] text-ink-2 transition-colors hover:text-brand">
              {tx("Report a mistake", "ভুল জানান")}
            </a>
          </li>
        </FooterCol>
      </div>
      <div className="border-t border-line">
        <div className="container-x flex flex-col gap-2 py-6 text-[12.5px] text-faint sm:flex-row sm:justify-between">
          <span>
            © {new Date().getFullYear()} Suggest.Bike —{" "}
            {tx(
              "independent, not affiliated with any manufacturer or dealer. Brand names are used only to identify bikes.",
              "স্বাধীন, কোনো নির্মাতা বা ডিলারের সাথে যুক্ত নয়। ব্র্যান্ডের নাম শুধু বাইক চেনাতে ব্যবহার করা হয়েছে।",
            )}
          </span>
          <span className="shrink-0">{tx("Made in Bangladesh", "বাংলাদেশে তৈরি")} 🇧🇩</span>
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
