import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, CheckCircle2, ExternalLink, FileText, Info, Scale, ShieldAlert, Users } from "lucide-react";
import guide from "@/data/guide.json";
import { formatBDT } from "@/lib/bikes";

export const metadata: Metadata = {
  title: "Buyer's guide: BRTA registration cost, licence, rules & buying used",
  description:
    "Everything to know before buying a motorcycle in Bangladesh: BRTA registration and 10-year tax token cost, smart driving licence fees and steps, the 375cc rule, road laws and an 11-point used bike checklist.",
};

const TOC = [
  { id: "registration", label: "Registration cost" },
  { id: "licence", label: "Driving licence" },
  { id: "cc", label: "The cc limit" },
  { id: "used", label: "Buying used" },
  { id: "rules", label: "Road rules" },
  { id: "insurance", label: "Insurance" },
  { id: "community", label: "Communities" },
];

const reg = guide.registration;
const lic = guide.licence;

export default function GuidePage() {
  const twoYr = reg.bands.find((b) => b.ccMin > 100)!;
  return (
    <div className="container-x pt-10">
      <p className="eyebrow">Buyer&apos;s guide · updated {guide.meta.compiledOn}</p>
      <h1 className="mt-2 max-w-3xl text-[32px] font-semibold leading-tight tracking-[-0.03em] text-ink sm:text-[44px]">The paperwork, rules and traps — decoded.</h1>
      <p className="mt-3 max-w-2xl text-[16px] leading-relaxed text-muted">
        Fees and rules in Bangladesh change often and are rarely written down in one place. We read the BRTA schedules, gazettes and news so you don&apos;t have to. Always confirm on{" "}
        <a href="https://bsp.brta.gov.bd/" target="_blank" rel="noopener noreferrer" className="text-brand hover:underline">
          bsp.brta.gov.bd
        </a>{" "}
        before paying.
      </p>

      <div className="mt-12 grid grid-cols-[minmax(0,1fr)] gap-12 lg:grid-cols-[200px_minmax(0,1fr)]">
        <nav className="hidden lg:block" aria-label="On this page">
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
          <Section id="registration" icon={<FileText size={20} />} title="What registration really costs" kicker={`As of ${reg.asOf}`}>
            <p>{reg.summary}</p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <Big k="Above 100cc · 10-year tax token" v={formatBDT(twoYr.totalBDT10yr)} sub="Pay once, no renewals for a decade" highlight />
              <Big k="Above 100cc · 2-year tax token" v={formatBDT(twoYr.totalBDT)} sub="Then ~৳2,300 every two years" />
              <Big k="Up to 100cc · 10-year" v={formatBDT(reg.bands[0].totalBDT10yr)} sub="Platina, Splendor+, Shine 100 class" />
              <Big k="Up to 100cc · 2-year" v={formatBDT(reg.bands[0].totalBDT)} sub="Lowest upfront" />
            </div>
            <h3 className="mt-10 text-[17px] font-semibold text-ink">Line by line (above 100cc)</h3>
            <div className="mt-4 overflow-hidden rounded-2xl border border-line bg-surface">
              {reg.breakdowns.above100cc.map((r, i) => (
                <div key={r.item} className={`flex items-start justify-between gap-6 px-4 py-3 text-[14.5px] ${i % 2 ? "bg-surface-2/40" : ""}`}>
                  <span className="text-ink-2">{r.item}</span>
                  <span className="shrink-0 font-semibold text-ink tnum">{formatBDT(r.amountBDT)}</span>
                </div>
              ))}
            </div>
            <Note>Market quotes run ~৳800 above the sum of official components; dealers often add a service charge. Ask for an itemised receipt.</Note>
            <h3 className="mt-10 text-[17px] font-semibold text-ink">The process</h3>
            <Steps items={reg.process} />
          </Section>

          {/* Licence */}
          <Section id="licence" icon={<Scale size={20} />} title="Getting your driving licence" kicker={`BRTA page updated ${lic.sources[0].date}`}>
            <p>
              You need to be {lic.eligibility.minAgeNonProfessional}+ for a non-professional licence ({lic.eligibility.minAgeProfessional}+ for professional, which Pathao/Uber riders need), with at least a{" "}
              {lic.eligibility.minEducation.toLowerCase()} and an NID. {lic.typicalTimeline}
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              {lic.types.map((t) => (
                <Big key={t.type} k={t.type} v={formatBDT(t.feeBDT)} sub={"validityYears" in t && t.validityYears ? `Valid ${t.validityYears} years` : "Start here"} />
              ))}
            </div>
            <h3 className="mt-10 text-[17px] font-semibold text-ink">Step by step</h3>
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
                <h3 className="text-[15px] font-semibold text-ink">Documents</h3>
                <ul className="mt-3 space-y-2">
                  {lic.documents.map((d) => (
                    <li key={d} className="flex gap-2 text-[14px] text-ink-2">
                      <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-brand" /> {d}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text-[15px] font-semibold text-ink">The test</h3>
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

          {/* CC */}
          <Section id="cc" icon={<Info size={20} />} title="How big a bike can you own?" kicker={`Max ${guide.ccPolicy.maxCcForRegularBuyersRegistrable}cc (locally assembled)`}>
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
            <Note>Bottom line: bikes up to 375cc that are assembled in Bangladesh — like Royal Enfield's 350s from IFAD's Cumilla plant — can be registered. Fully imported (CBU) bikes above 165cc are legally murky right now — get the dealer to confirm registrability in writing.</Note>
          </Section>

          {/* Used */}
          <Section id="used" icon={<ShieldAlert size={20} />} title="Buying used without getting cheated" kicker={`${guide.usedChecklist.length} checks`}>
            <p>Most used-bike horror stories in Bangladesh are paper problems, not engine problems. Go through this list before any money changes hands.</p>
            <ol className="mt-6 grid gap-3">
              {guide.usedChecklist.map((c, i) => (
                <li key={c.title} className="flex gap-4 rounded-2xl border border-line bg-surface p-4">
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
          <Section id="rules" icon={<Scale size={20} />} title="Road rules that catch new riders">
            <div className="grid gap-3 sm:grid-cols-2">
              {guide.laws.map((l) => (
                <div key={l.title} className="rounded-2xl border border-line bg-surface p-5">
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
          <Section id="insurance" icon={<ShieldAlert size={20} />} title="Insurance" kicker={guide.insurance.thirdPartyMandatory ? "Mandatory" : "Optional today"}>
            <p>{guide.insurance.summary}</p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <Big k={`Third-party · ${guide.insurance.thirdParty.exampleFor}`} v={`${formatBDT(guide.insurance.thirdParty.exampleAnnualPremiumBDT)}/yr`} sub="IDRA Motor Liability pilot" />
              <Big k="Comprehensive (theft + damage)" v="Ask insurers" sub="No reliable public rate yet" />
            </div>
          </Section>

          {/* Community */}
          <Section id="community" icon={<Users size={20} />} title="Where Bangladeshi riders hang out">
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
            <p className="text-[15px] font-semibold text-ink">Ready to choose?</p>
            <p className="mt-1 text-[14.5px] text-muted">Now that you know the extra costs, let&apos;s find a bike that fits the whole budget.</p>
            <Link href="/match/" className="btn-primary mt-4">
              Find my bike
            </Link>
          </div>

          <details className="group rounded-2xl border border-line bg-surface p-5">
            <summary className="cursor-pointer list-none text-[14px] font-medium text-ink-2">
              Sources ({Object.keys(guide.meta.sourceIndex).length}) <span className="text-faint group-open:hidden">— show</span>
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
        <li key={s} className="flex gap-3 text-[14.5px] text-ink-2">
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
