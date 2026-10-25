import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ShoppingCart } from "lucide-react";

export const metadata: Metadata = { title: "Experiments", description: "Unlisted previews of ideas for Suggest.Bike. Not live." };

export default function Page() {
  return (
    <div className="container-x pt-10">
      <p className="eyebrow">Unlisted</p>
      <h1 className="mt-2 text-[32px] font-semibold leading-tight tracking-[-0.03em] text-ink sm:text-[44px]">Experiments</h1>
      <p className="mt-3 max-w-2xl text-[16px] leading-relaxed text-muted">
        Clickable previews of ideas we have not decided on. They are simulated in your browser, hidden from search and not linked from the site.
      </p>
      <ul className="mt-10 grid max-w-3xl gap-4">
        <li>
          <Link href="/experimental/marketplace/" className="group flex items-start gap-4 rounded-2xl border border-line bg-surface p-5 transition-colors hover:border-brand">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-brand-soft text-brand">
              <ShoppingCart size={22} aria-hidden />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[18px] font-semibold text-ink">Marketplace preview</span>
              <span className="mt-1 block text-[14.5px] text-muted">
                What a Suggest.Bike shop for oil, parts, tyres and gear might feel like: pick your bike, see what fits, check out. Fully simulated: nothing is sold or sent.
              </span>
            </span>
            <ArrowRight size={18} className="mt-1 shrink-0 text-muted transition-transform group-hover:translate-x-0.5 group-hover:text-brand" aria-hidden />
          </Link>
        </li>
      </ul>
    </div>
  );
}
