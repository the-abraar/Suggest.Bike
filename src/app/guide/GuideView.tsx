"use client";

import Link from "next/link";
import { ArrowUpRight, CheckCircle2, CreditCard, ExternalLink, FileText, Info, Scale, ShieldAlert, Users } from "lucide-react";
import guideEn from "@/data/guide.json";
import guideBn from "@/data/guide.bn.json";
import { formatBDT } from "@/lib/bikes";
import { useLang, useTx } from "@/lib/i18n";

export function GuideView() {
  const { lang } = useLang();
  const tx = useTx();
  const guide = (lang === "bn" ? guideBn : guideEn) as typeof guideEn;
  const reg = guide.registration;
  const lic = guide.licence;
  const above100 = reg.bands.find((b) => b.ccMin > 100)!;

  const TOC = [
    { id: "registration", label: tx("Registration cost", "রেজিস্ট্রেশন খরচ") },
    { id: "licence", label: tx("Driving licence", "ড্রাইভিং লাইসেন্স") },
    { id: "emi", label: tx("Paying in EMI", "কিস্তিতে কেনা") },
    { id: "cc", label: tx("The cc limit", "সিসি সীমা") },
    { id: "used", label: tx("Buying used", "পুরনো বাইক কেনা") },
    { id: "rules", label: tx("Road rules", "রাস্তার নিয়ম") },
    { id: "insurance", label: tx("Insurance", "ইন্স্যুরেন্স") },
    { id: "community", label: tx("Communities", "কমিউনিটি") },
  ];

  return (
    <div className="container-x pt-10">
      <p className="eyebrow">
        {tx("Buyer's guide", "ক্রেতা গাইড")} · {tx("updated", "আপডেট")} {guide.meta.compiledOn}
      </p>
      <h1 className="mt-2 max-w-3xl text-[32px] font-semibold leading-tight tracking-[-0.03em] text-ink sm:text-[44px]">
        {tx("The paperwork, rules and traps — decoded.", "কাগজপত্র, নিয়ম আর ফাঁদ — সহজ ভাষায়।")}
      </h1>
      <p className="mt-3 max-w-2xl text-[16px] leading-relaxed text-muted">
        {tx(
          "Fees and rules in Bangladesh change often and are rarely written down in one place. We read the BRTA schedules, gazettes and news so you don't have to. Always confirm on",
          "বাংলাদেশে ফি আর নিয়ম প্রায়ই বদলায়, আর এক জায়গায় লেখা থাকে না। BRTA-র তালিকা, গেজেট আর খবর আমরা পড়েছি যাতে আপনাকে পড়তে না হয়। টাকা দেওয়ার আগে সবসময় যাচাই করুন",
        )}{" "}
        <a href="https://bsp.brta.gov.bd/" target="_blank" rel="noopener noreferrer" className="text-brand hover:underline">
          bsp.brta.gov.bd
        </a>
        {tx(" before paying.", "-এ।")}
      </p>

      <div className="mt-12 grid grid-cols-[minmax(0,1fr)] gap-12 lg:grid-cols-[200px_minmax(0,1fr)]">
        <nav className="hidden lg:block" aria-label={tx("On this page", "এই পাতায়")}>
          <ul className="sticky top-24 space-y-1 border-l border-line">
            {TOC.map((t) => (
              <li key={t.id}>
                <a href={`#${t.id}`} className="-ml-px block border-l border-transparent py-1.5 pl-4 text-[14px] text-muted transition-colors hover:border-ink hover:text-ink">
                  {t.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="min-w-0 max-w-3xl space-y-20">
          {/* Registration */}
          <Section id="registration" icon={<FileText size={20} />} title={tx("What registration really costs", "রেজিস্ট্রেশনে আসলে কত লাগে")} kicker={`${tx("As of", "তারিখ")} ${reg.asOf}`}>
            <p>{reg.summary}</p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <Big k={tx("Above 100cc · 10-year tax token", "100cc-এর বেশি · ১০ বছরের ট্যাক্স টোকেন")} v={formatBDT(above100.totalBDT10yr)} sub={tx("Pay once, no renewals for a decade", "একবার দিন, দশ বছর নবায়ন নেই")} highlight />
              <Big k={tx("Above 100cc · 2-year tax token", "100cc-এর বেশি · ২ বছরের ট্যাক্স টোকেন")} v={formatBDT(above100.totalBDT)} sub={tx("Then ~৳2,300 every two years", "তারপর প্রতি দুই বছরে ~৳2,300")} />
              <Big k={tx("Up to 100cc · 10-year", "100cc পর্যন্ত · ১০ বছর")} v={formatBDT(reg.bands[0].totalBDT10yr)} sub={tx("Platina, Splendor+, Shine 100 class", "প্লাটিনা, স্প্লেন্ডার+, শাইন 100 শ্রেণি")} />
              <Big k={tx("Up to 100cc · 2-year", "100cc পর্যন্ত · ২ বছর")} v={formatBDT(reg.bands[0].totalBDT)} sub={tx("Lowest upfront", "শুরুতে সবচেয়ে কম")} />
            </div>
            <h3 className="mt-10 text-[17px] font-semibold text-ink">{tx("Line by line (above 100cc)", "খাত অনুযায়ী (100cc-এর বেশি)")}</h3>
            <div className="mt-4 overflow-hidden rounded-2xl border border-line bg-surface">
              {reg.breakdowns.above100cc.map((r, i) => (
                <div key={i} className={`flex items-start justify-between gap-6 px-4 py-3 text-[14.5px] ${i % 2 ? "bg-surface-2/40" : ""}`}>
                  <span className="text-ink-2">{r.item}</span>
                  <span className="shrink-0 font-semibold text-ink tnum">{formatBDT(r.amountBDT)}</span>
                </div>
              ))}
            </div>
            <Note>
              {tx(
                "Market quotes run ~৳800 above the sum of official components; dealers often add a service charge. Ask for an itemised receipt.",
                "বাজারে যে প্যাকেজ বলা হয় তা সরকারি খাতগুলোর যোগফলের চেয়ে ~৳800 বেশি; ডিলাররা প্রায়ই সার্ভিস চার্জ যোগ করে। খাতওয়ারি রসিদ চেয়ে নিন।",
              )}
            </Note>
            <h3 className="mt-10 text-[17px] font-semibold text-ink">{tx("The process", "প্রক্রিয়া")}</h3>
            <Steps items={reg.process} />
          </Section>

          {/* Licence */}
          <Section id="licence" icon={<Scale size={20} />} title={tx("Getting your driving licence", "ড্রাইভিং লাইসেন্স পাওয়া")} kicker={`${tx("BRTA page updated", "BRTA পাতা আপডেট")} ${lic.sources[0].date}`}>
            <p>
              {tx(
                `You need to be ${lic.eligibility.minAgeNonProfessional}+ for a non-professional licence (${lic.eligibility.minAgeProfessional}+ for professional, which Pathao/Uber riders need), with at least a ${lic.eligibility.minEducation.toLowerCase()} and an NID.`,
                `অপেশাদার লাইসেন্সের জন্য বয়স ${lic.eligibility.minAgeNonProfessional}+ (পেশাদার — পাঠাও/উবার রাইডারদের যা লাগে — ${lic.eligibility.minAgeProfessional}+), কমপক্ষে ${lic.eligibility.minEducation} এবং NID লাগবে।`,
              )}{" "}
              {lic.typicalTimeline}
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              {lic.types.map((t) => (
                <Big
                  key={t.type}
                  k={t.type}
                  v={formatBDT(t.feeBDT)}
                  sub={"validityYears" in t && t.validityYears ? tx(`Valid ${t.validityYears} years`, `মেয়াদ ${t.validityYears} বছর`) : tx("Start here", "এখান থেকে শুরু")}
                />
              ))}
            </div>
            <h3 className="mt-10 text-[17px] font-semibold text-ink">{tx("Step by step", "ধাপে ধাপে")}</h3>
            <ol className="mt-4 space-y-3">
              {lic.steps.map((s) => (
                <li key={s.step} className="flex gap-4 rounded-2xl border border-line bg-surface p-4">
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-brand-soft text-[13px] font-semibold text-brand tnum">{s.step}</span>
                  <div>
                    <p className="text-[15px] font-semibold text-ink">{s.title}</p>
                    <p className="mt-0.5 text-[14.5px] leading-relaxed text-muted">{s.detail}</p>
                  </div>
                </li>
              ))}
            </ol>
            <div className="mt-6 grid gap-6 sm:grid-cols-2">
              <div>
                <h3 className="text-[15px] font-semibold text-ink">{tx("Documents", "কাগজপত্র")}</h3>
                <ul className="mt-3 space-y-2">
                  {lic.documents.map((d) => (
                    <li key={d} className="flex gap-2 text-[14px] text-ink-2">
                      <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-brand" /> {d}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text-[15px] font-semibold text-ink">{tx("The test", "পরীক্ষা")}</h3>
                <ul className="mt-3 space-y-2">
                  {lic.exam.components.map((d) => (
                    <li key={d} className="flex gap-2 text-[14px] text-ink-2">
                      <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-brand" /> {d}
                    </li>
                  ))}
                </ul>
                <p className="mt-3 text-[13px] leading-relaxed text-muted">{lic.exam.notes}</p>
              </div>
            </div>
          </Section>

          {/* EMI */}
          <Section id="emi" icon={<CreditCard size={20} />} title={tx("Paying in EMI (installments)", "কিস্তিতে (EMI) কেনা")}>
            <p>
              {tx(
                "Most showrooms advertise 0% EMI: the bike's price split into equal monthly payments on a partner bank's credit card, usually for 3, 6 or 12 months. Longer plans (18–36 months) exist but normally carry interest. This is how Suggest.Bike shows “/month” — the ex-showroom price divided by 12.",
                "বেশিরভাগ শোরুম ০% কিস্তির কথা বলে: পার্টনার ব্যাংকের ক্রেডিট কার্ডে বাইকের দাম সমান মাসিক কিস্তিতে ভাগ — সাধারণত ৩, ৬ বা ১২ মাসে। লম্বা মেয়াদ (১৮–৩৬ মাস) থাকে, তবে সাধারণত সুদসহ। Suggest.Bike-এ “/মাস” মানে শোরুম মূল্যকে ১২ দিয়ে ভাগ।",
              )}
            </p>
            <ul className="mt-5 space-y-3">
              {[
                tx("You need a credit card from a partner bank with enough limit for the whole price.", "পুরো দামের সমান লিমিটসহ পার্টনার ব্যাংকের ক্রেডিট কার্ড লাগবে।"),
                tx("Banks may charge a processing fee, and some showrooms drop cash discounts for EMI buyers — ask for the price both ways.", "ব্যাংক প্রসেসিং ফি নিতে পারে, আর কিছু শোরুম কিস্তিতে কিনলে নগদ ছাড় দেয় না — দুইভাবেই দাম জিজ্ঞেস করুন।"),
                tx("Registration (BRTA) is usually paid upfront in cash, not on EMI.", "রেজিস্ট্রেশন (BRTA) সাধারণত শুরুতেই নগদে দিতে হয়, কিস্তিতে নয়।"),
                tx("No credit card? Some dealers run their own installment plans with a down payment — read the paper for the total you'll pay.", "ক্রেডিট কার্ড নেই? কিছু ডিলারের নিজস্ব কিস্তি আছে, ডাউন পেমেন্টসহ — মোট কত দেবেন কাগজে দেখে নিন।"),
              ].map((x) => (
                <li key={x} className="flex gap-2.5 text-[15px] text-ink-2">
                  <CheckCircle2 size={17} className="mt-0.5 shrink-0 text-brand" /> {x}
                </li>
              ))}
            </ul>
            <Note>
              {tx(
                "Terms differ by bank and change often. Ask the showroom which cards qualify this month, and check your card's EMI page before buying.",
                "শর্ত ব্যাংকভেদে আলাদা ও প্রায়ই বদলায়। এই মাসে কোন কার্ডে চলবে শোরুমে জিজ্ঞেস করুন, আর কেনার আগে আপনার কার্ডের EMI পাতা দেখুন।",
              )}
            </Note>
          </Section>

          {/* CC */}
          <Section
            id="cc"
            icon={<Info size={20} />}
            title={tx("How big a bike can you own?", "কত সিসির বাইক রাখা যায়?")}
            kicker={tx(`Max ${guide.ccPolicy.maxCcForRegularBuyersRegistrable}cc (locally assembled)`, `সর্বোচ্চ ${guide.ccPolicy.maxCcForRegularBuyersRegistrable}cc (দেশে অ্যাসেম্বল)`)}
          >
            <p>{guide.ccPolicy.currentRule}</p>
            <ol className="relative mt-8 space-y-6 border-l border-line pl-6">
              {guide.ccPolicy.history.map((h) => (
                <li key={h.period} className="relative">
                  <span className="absolute -left-[29px] top-1.5 h-2.5 w-2.5 rounded-full border-2 border-bg bg-brand" />
                  <p className="text-[13px] font-semibold text-brand">{h.period}</p>
                  <p className="mt-0.5 text-[14.5px] leading-relaxed text-ink-2">{h.rule}</p>
                </li>
              ))}
            </ol>
            <Note>
              {tx(
                "Bottom line: bikes up to 375cc that are assembled in Bangladesh — like Royal Enfield's 350s from IFAD's Cumilla plant — can be registered. Fully imported (CBU) bikes above 165cc are legally murky right now — get the dealer to confirm registrability in writing.",
                "সারকথা: দেশে অ্যাসেম্বল করা 375cc পর্যন্ত বাইক — যেমন IFAD-এর কুমিল্লা কারখানার রয়্যাল এনফিল্ড 350 — রেজিস্ট্রেশন করা যায়। 165cc-এর বেশি পুরো আমদানি করা (CBU) বাইকের আইনি অবস্থা এখন অস্পষ্ট — রেজিস্ট্রেশন হবে কি না ডিলারের কাছ থেকে লিখিত নিন।",
              )}
            </Note>
          </Section>

          {/* Used */}
          <Section
            id="used"
            icon={<ShieldAlert size={20} />}
            title={tx("Buying used without getting cheated", "ঠকে না গিয়ে পুরনো বাইক কেনা")}
            kicker={tx(`${guide.usedChecklist.length} checks`, `${guide.usedChecklist.length}টি চেক`)}
          >
            <p>
              {tx(
                "Most used-bike horror stories in Bangladesh are paper problems, not engine problems. Go through this list before any money changes hands.",
                "বাংলাদেশে পুরনো বাইকের বেশিরভাগ বিপদ কাগজের, ইঞ্জিনের নয়। টাকা দেওয়ার আগে এই তালিকা মিলিয়ে নিন।",
              )}
            </p>
            <ol className="mt-6 grid gap-3">
              {guide.usedChecklist.map((c, i) => (
                <li key={i} className="flex gap-4 rounded-2xl border border-line bg-surface p-4">
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-surface-2 text-[13px] font-semibold text-ink-2 tnum">{i + 1}</span>
                  <div>
                    <p className="text-[15px] font-semibold text-ink">{c.title}</p>
                    <p className="mt-0.5 text-[14.5px] leading-relaxed text-muted">{c.detail}</p>
                  </div>
                </li>
              ))}
            </ol>
          </Section>

          {/* Rules */}
          <Section id="rules" icon={<Scale size={20} />} title={tx("Road rules that catch new riders", "নতুন রাইডাররা যে নিয়মে ধরা পড়েন")}>
            <div className="grid gap-3 sm:grid-cols-2">
              {guide.laws.map((l, i) => (
                <div key={i} className="rounded-2xl border border-line bg-surface p-5">
                  <p className="text-[15px] font-semibold text-ink">{l.title}</p>
                  <p className="mt-1.5 text-[14px] leading-relaxed text-muted">{l.detail}</p>
                  {l.sources[0] && (
                    <a href={l.sources[0].url} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex items-center gap-1 text-[12.5px] text-faint hover:text-brand">
                      {l.sources[0].publisher} <ArrowUpRight size={12} />
                    </a>
                  )}
                </div>
              ))}
            </div>
          </Section>

          {/* Insurance */}
          <Section
            id="insurance"
            icon={<ShieldAlert size={20} />}
            title={tx("Insurance", "ইন্স্যুরেন্স")}
            kicker={guide.insurance.thirdPartyMandatory ? tx("Mandatory", "বাধ্যতামূলক") : tx("Optional today", "এখন ঐচ্ছিক")}
          >
            <p>{guide.insurance.summary}</p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <Big
                k={`${tx("Third-party", "থার্ড-পার্টি")} · ${guide.insurance.thirdParty.exampleFor}`}
                v={`${formatBDT(guide.insurance.thirdParty.exampleAnnualPremiumBDT)}${tx("/yr", "/বছর")}`}
                sub={tx("IDRA Motor Liability pilot", "IDRA মোটর লায়াবিলিটি পাইলট")}
              />
              <Big k={tx("Comprehensive (theft + damage)", "কম্প্রিহেনসিভ (চুরি + ক্ষতি)")} v={tx("Ask insurers", "বীমা কোম্পানিকে জিজ্ঞেস করুন")} sub={tx("No reliable public rate yet", "নির্ভরযোগ্য প্রকাশ্য রেট এখনো নেই")} />
            </div>
          </Section>

          {/* Community */}
          <Section id="community" icon={<Users size={20} />} title={tx("Where Bangladeshi riders hang out", "বাংলাদেশি রাইডাররা কোথায় আড্ডা দেন")}>
            <div className="grid gap-3 sm:grid-cols-2">
              {guide.communities.map((c) => (
                <a
                  key={c.url}
                  href={c.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center justify-between gap-3 rounded-2xl border border-line bg-surface p-4 transition-colors hover:border-line-strong"
                >
                  <span>
                    <span className="block text-[15px] font-semibold text-ink group-hover:text-brand">{c.name}</span>
                    <span className="block text-[13px] text-muted">{c.kind}</span>
                  </span>
                  <ExternalLink size={16} className="shrink-0 text-faint group-hover:text-brand" />
                </a>
              ))}
            </div>
          </Section>

          <div className="rounded-2xl bg-surface-2 p-6">
            <p className="text-[15px] font-semibold text-ink">{tx("Ready to choose?", "বাছাইয়ের জন্য প্রস্তুত?")}</p>
            <p className="mt-1 text-[14.5px] text-muted">
              {tx("Now that you know the extra costs, let's find a bike that fits the whole budget.", "বাড়তি খরচগুলো জানলেন — এবার পুরো বাজেটে মানানসই বাইক খুঁজি।")}
            </p>
            <Link href="/match/" className="btn-primary mt-4">
              {tx("Find my bike", "আমার বাইক খুঁজুন")}
            </Link>
          </div>

          <details className="group rounded-2xl border border-line bg-surface p-5">
            <summary className="cursor-pointer list-none text-[14px] font-medium text-ink-2">
              {tx("Sources", "তথ্যসূত্র")} ({Object.keys(guide.meta.sourceIndex).length}) <span className="text-faint group-open:hidden">— {tx("show", "দেখুন")}</span>
            </summary>
            <ul className="mt-4 space-y-2">
              {Object.values(guide.meta.sourceIndex).map((s) => (
                <li key={s.url}>
                  <a href={s.url} target="_blank" rel="noopener noreferrer" className="text-[13px] leading-snug text-muted hover:text-brand">
                    {s.title} — <span className="text-faint">{s.publisher}</span>
                  </a>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-[12.5px] leading-relaxed text-faint">{guide.meta.disclaimer}</p>
          </details>
        </div>
      </div>
    </div>
  );
}

function Section({ id, icon, title, kicker, children }: { id: string; icon: React.ReactNode; title: string; kicker?: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-24">
      <div className="flex items-center gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-soft text-brand">{icon}</span>
        {kicker && <span className="text-[13px] font-medium text-muted">{kicker}</span>}
      </div>
      <h2 className="mt-4 text-[26px] font-semibold tracking-tight text-ink">{title}</h2>
      <div className="mt-4 text-[15.5px] leading-relaxed text-ink-2">{children}</div>
    </section>
  );
}

function Big({ k, v, sub, highlight }: { k: string; v: string; sub: string; highlight?: boolean }) {
  return (
    <div className={`rounded-2xl border p-5 ${highlight ? "border-brand bg-brand-soft" : "border-line bg-surface"}`}>
      <p className="text-[12.5px] leading-snug text-muted">{k}</p>
      <p className="mt-1.5 text-[24px] font-semibold tracking-tight text-ink tnum">{v}</p>
      <p className="mt-0.5 text-[12.5px] text-muted">{sub}</p>
    </div>
  );
}

function Steps({ items }: { items: string[] }) {
  return (
    <ol className="mt-4 space-y-3">
      {items.map((s, i) => (
        <li key={i} className="flex gap-3 text-[14.5px] text-ink-2">
          <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-surface-2 text-[12px] font-semibold text-ink-2 tnum">{i + 1}</span>
          <span className="pt-0.5">{s}</span>
        </li>
      ))}
    </ol>
  );
}

function Note({ children }: { children: React.ReactNode }) {
  return (
    <p className="mt-5 flex gap-2.5 rounded-xl bg-warn-soft px-4 py-3 text-[14px] leading-relaxed text-ink-2">
      <Info size={17} className="mt-0.5 shrink-0 text-warn" />
      <span>{children}</span>
    </p>
  );
}
