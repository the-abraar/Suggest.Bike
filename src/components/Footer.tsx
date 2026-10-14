"use client";

import Link from "@/components/LangLink";
import { Logo } from "./Logo";
import { T, useLang } from "@/lib/i18n";
import { CATEGORIES } from "@/lib/bike-utils";
import type { Category } from "@/lib/types";
import { whatsappUrl } from "@/lib/site";
// The owner's other project: a plain footer link only, no cards in guides (critique section 15 item 7).
const THROTTLE_IQ_URL = "https://github.com/blankframe-tech/ThrottleIQ";

/** count and oldest price date come from the server layout, so the footer does not ship the bike index. */
export function Footer({ count, latest }: { count: number; latest: string }) {
  const { t, lang } = useLang();
  const tx = (en: string, bn: string) => (lang === "bn" ? bn : en);
  return (
    <footer className="mt-24 border-t border-line bg-surface">
      <div className="container-x grid gap-10 py-14 md:grid-cols-[1.4fr_1fr_1fr_1fr_1fr]">
        <div className="max-w-sm space-y-4">
          <Logo />
          <p className="text-[14px] leading-relaxed text-muted">
            <T k="footer.tag" />
          </p>
          <p className="text-[12.5px] text-faint">
            {lang === "bn" ? `${count}টি বাইক · সবচেয়ে পুরনো দাম যাচাই ${latest}` : `${count} bikes · oldest price checked ${latest}`}
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
        <FooterCol title={tx("New bike owner", "নতুন বাইক নিয়ে কী করবেন")}>
          <FLink href="/owner/">{tx("What to do after buying", "কেনার পর কী করবেন")}</FLink>
          <FLink href="/owner/#breakin">{tx("Engine break-in", "ইঞ্জিন ব্রেক-ইন")}</FLink>
          <FLink href="/owner/#checks">{tx("Basic checks", "বেসিক চেক")}</FLink>
          <FLink href="/owner/#registration">{tx("Register or not?", "রেজিস্ট্রেশন লাগবে?")}</FLink>
          <FLink href="/owner/#accessories">{tx("Accessories to buy", "কোন অ্যাকসেসরিজ কিনবেন")}</FLink>
        </FooterCol>
        <FooterCol title={tx("Maintenance", "রক্ষণাবেক্ষণ")}>
          <FLink href="/maintenance/">{tx("Maintenance guides", "রক্ষণাবেক্ষণ গাইড")}</FLink>
          <li>
            <a href={THROTTLE_IQ_URL} target="_blank" rel="noopener noreferrer" className="text-[14px] text-ink-2 transition-colors hover:text-brand">
              ThrottleIQ app
            </a>
          </li>
        </FooterCol>
        <FooterCol title={tx("Learn", "জানুন")}>
          <FLink href="/guide/#registration">{tx("Registration cost", "রেজিস্ট্রেশন খরচ")}</FLink>
          <FLink href="/guide/#licence">{tx("Driving licence", "ড্রাইভিং লাইসেন্স")}</FLink>
          <FLink href="/guide/#emi">{tx("Paying in EMI", "কিস্তিতে কেনা")}</FLink>
          <FLink href="/guide/#used">{tx("Buying used", "পুরনো বাইক কেনা")}</FLink>
          <FLink href="/guide/#rules">{tx("Road rules", "রাস্তার নিয়ম")}</FLink>
          <FLink href="/method/">{tx("How we rate", "আমরা কীভাবে রেট করি")}</FLink>
          <FLink href="/changes/">{tx("Price changes", "দামের পরিবর্তন")}</FLink>
          <FLink href="/dealers/">{tx("Where to buy", "কোথায় কিনবেন")}</FLink>
          <FLink href="/feedback/">{tx("Report a mistake", "ভুল জানান")}</FLink>
          {whatsappUrl("") && (
            <li>
              <a href={whatsappUrl("Suggest.Bike: ")} target="_blank" rel="noopener noreferrer" className="text-[14px] text-ink-2 transition-colors hover:text-brand">
                {tx("WhatsApp us", "হোয়াটসঅ্যাপে লিখুন")}
              </a>
            </li>
          )}
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
          <span className="flex shrink-0 gap-4">
            <Link href="/privacy/" className="hover:text-brand">{tx("Privacy", "গোপনীয়তা")}</Link>
            <Link href="/terms/" className="hover:text-brand">{tx("Terms", "শর্ত")}</Link>
            <Link href="/disclaimer/" className="hover:text-brand">{tx("Disclaimer", "দায়মুক্তি")}</Link>
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
