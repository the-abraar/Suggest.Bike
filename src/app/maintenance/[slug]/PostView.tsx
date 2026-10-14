"use client";

import Link from "@/components/LangLink";
import { ArrowLeft, Info } from "lucide-react";
import { useTx } from "@/lib/i18n";
import { POSTS, postBySlug, type Pair } from "@/lib/maintenance-posts";

export function PostView({ slug }: { slug: string }) {
  const tx = useTx();
  const post = postBySlug(slug)!;
  const List = ({ items, ordered }: { items: Pair[]; ordered?: boolean }) => {
    const Tag = ordered ? "ol" : "ul";
    return (
      <Tag className={`mt-3 space-y-2 pl-5 text-[15px] leading-relaxed text-ink-2 ${ordered ? "list-decimal" : "list-disc"}`}>
        {items.map((i) => (
          <li key={i[0]}>{tx(...i)}</li>
        ))}
      </Tag>
    );
  };
  return (
    <div className="container-x pt-10">
      <Link href="/maintenance/" className="inline-flex items-center gap-1 text-[14px] text-muted hover:text-ink">
        <ArrowLeft size={15} /> {tx("All maintenance guides", "সব রক্ষণাবেক্ষণ গাইড")}
      </Link>
      <p className="eyebrow mt-6">
        {post.minutes} {tx("min read", "মিনিটের পড়া")} · {tx("updated", "আপডেট")} {post.updated}
      </p>
      <h1 className="mt-2 max-w-3xl text-[32px] font-semibold leading-tight tracking-[-0.03em] text-ink sm:text-[40px]">{tx(...post.title)}</h1>
      <p className="mt-3 max-w-2xl text-[16px] leading-relaxed text-muted">{tx(...post.summary)}</p>

      <div className="mt-10 max-w-3xl space-y-10">
        {post.need && (
          <section>
            <h2 className="text-[22px] font-semibold tracking-tight text-ink">{tx("What you need", "যা লাগবে")}</h2>
            <List items={post.need} />
          </section>
        )}
        {post.figures?.map((f) => (
          <figure key={f.image.src}>
            <img src={f.image.src} alt={tx(...f.alt)} width={f.width} height={f.height} loading="lazy" className="mx-auto h-auto max-h-[480px] w-auto max-w-full rounded-2xl border border-line bg-white" />
            <figcaption className="mt-2 text-[13px] leading-relaxed text-muted">
              {tx(...f.caption)} {tx("Image", "ছবি")}:{" "}
              <a href={f.image.sourcePage} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">
                {f.image.author}
              </a>
              {" · "}
              {f.image.licenseUrl ? (
                <a href={f.image.licenseUrl} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">{f.image.license}</a>
              ) : (
                f.image.license
              )}
            </figcaption>
          </figure>
        ))}
        <section>
          <h2 className="text-[22px] font-semibold tracking-tight text-ink">{tx("Steps", "ধাপগুলো")}</h2>
          <List items={post.steps} ordered />
        </section>
        <section>
          <h2 className="text-[22px] font-semibold tracking-tight text-ink">{tx("Common mistakes", "সাধারণ ভুল")}</h2>
          <List items={post.avoid} />
        </section>
        <section>
          <h2 className="text-[22px] font-semibold tracking-tight text-ink">{tx("When to go to a mechanic", "কখন মেকানিকের কাছে যাবেন")}</h2>
          <List items={post.mechanic} />
        </section>
        <p className="flex gap-2.5 rounded-xl bg-warn-soft px-4 py-3 text-[14px] leading-relaxed text-ink-2">
          <Info size={17} className="mt-0.5 shrink-0 text-warn" />
          <span>
            {tx(
              "This is general guidance for typical commuter motorcycles. Your owner's manual is the final word on pressures, intervals and oil grades for your bike. If you are unsure, ask a trusted mechanic.",
              "এটি সাধারণ কমিউটার মোটরসাইকেলের জন্য সাধারণ পরামর্শ। আপনার বাইকের প্রেসার, সময় আর অয়েল গ্রেডে ওনার্স ম্যানুয়ালই শেষ কথা। নিশ্চিত না হলে বিশ্বস্ত মেকানিকের পরামর্শ নিন।",
            )}
          </span>
        </p>
        <section>
          <h2 className="text-[22px] font-semibold tracking-tight text-ink">{tx("More guides", "আরও গাইড")}</h2>
          <ul className="mt-3 space-y-2 text-[15px]">
            {[1, 2, 3, 4, 5].map((n) => POSTS[(POSTS.findIndex((p) => p.slug === slug) + n) % POSTS.length]).map((p) => (
              <li key={p.slug}>
                <Link href={`/maintenance/${p.slug}/`} className="text-brand underline underline-offset-2">{tx(...p.title)}</Link>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
