import Link from "@/components/LangLink";
import { faqJsonLd, LANDING_PATHS, landingLabel, type Landing } from "@/lib/best";

/** Server-rendered search landing page (src/lib/best.ts builds the content; no client state). */
export function LandingView({ page: p, lang }: { page: Landing; lang: "en" | "bn" }) {
  const tx = (en: string, bn: string) => (lang === "bn" ? bn : en);
  return (
    <div className="container-x min-w-0 max-w-4xl pt-12">
      {/* safe-html: JSON.stringify of build-time data, escaped to prevent script breakout */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd(p)).replace(/</g, "\\u003c") }} />
      <h1 className="text-[30px] font-semibold leading-tight tracking-[-0.03em] text-ink sm:text-[40px]">{p.h1}</h1>
      <p className="mt-4 text-[16px] leading-relaxed text-ink-2">{p.intro}</p>

      <div className="mt-8 overflow-x-auto rounded-2xl border border-line bg-surface">
        <table className="w-full text-left text-[14.5px]">
          <thead className="bg-surface-2/60 text-[12.5px] text-muted">
            <tr>
              {p.head.map((h) => (
                <th key={h} scope="col" className="px-4 py-3 font-semibold">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {p.rows.map((r) => (
              <tr key={r.name} className="border-t border-line">
                <th scope="row" className="px-4 py-3 font-semibold text-ink">
                  {r.href ? (
                    <Link href={r.href} className="text-brand underline underline-offset-2">
                      {r.name}
                    </Link>
                  ) : (
                    r.name
                  )}
                </th>
                {r.cells.map((c, i) => (
                  <td key={i} className="whitespace-nowrap px-4 py-3 text-ink-2 tnum">
                    {c}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {p.note && <p className="mt-3 text-[13.5px] text-muted">{p.note}</p>}
      {p.cta && (
        <p className="mt-6">
          <Link href={p.cta.href} className="btn-primary h-11 px-4 text-[15px]">
            {p.cta.label}
          </Link>
        </p>
      )}

      {p.faq.length > 0 && (
        <section className="mt-12">
          <h2 className="text-[22px] font-semibold tracking-tight text-ink">{tx("Questions", "প্রশ্ন ও উত্তর")}</h2>
          <dl className="mt-4 space-y-5">
            {p.faq.map(([q, a]) => (
              <div key={q}>
                <dt className="font-semibold text-ink">{q}</dt>
                <dd className="mt-1 leading-relaxed text-ink-2">{a}</dd>
              </div>
            ))}
          </dl>
        </section>
      )}

      <p className="mt-10 text-[13px] text-muted">
        {tx("Prices and fees change; this is not financial or legal advice. ", "দাম ও ফি বদলায়; এটি আর্থিক বা আইনি পরামর্শ নয়। ")}
        <Link href="/disclaimer/" className="underline underline-offset-2">
          {tx("Disclaimer", "দায়মুক্তি")}
        </Link>
      </p>

      <nav className="mt-10 border-t border-line pt-6" aria-label={tx("More lists", "আরও তালিকা")}>
        <h2 className="eyebrow">{tx("More lists", "আরও তালিকা")}</h2>
        <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-[14.5px]">
          {LANDING_PATHS.filter((x) => x !== p.path).map((x) => (
            <li key={x}>
              <Link href={x} className="text-ink-2 underline underline-offset-2 hover:text-brand">
                {landingLabel(x, lang)}
              </Link>
            </li>
          ))}
          <li>
            <Link href="/bikes/" className="text-ink-2 underline underline-offset-2 hover:text-brand">
              {tx("All bikes and prices", "সব বাইক ও দাম")}
            </Link>
          </li>
        </ul>
      </nav>
    </div>
  );
}
