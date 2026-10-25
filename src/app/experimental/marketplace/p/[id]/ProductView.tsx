"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, Check, ChevronRight, Lightbulb, PackageCheck, ShoppingCart, Truck } from "lucide-react";
import { CATS, getProduct } from "@/lib/experimental/catalogue";
import { bikesThatFit, fitOf, type FitBike } from "@/lib/experimental/fitment";
import { MAX_QTY } from "@/lib/experimental/cart";
import { FitBadge, Price, ProductArt, QtyStepper, SHOP, TrustBadge, useShop } from "../../shop";

const SHOW = 18;

export function ProductView({ id, bikes }: { id: string; bikes: FitBike[] }) {
  const p = getProduct(id)!;
  const { add, bikeId, ready } = useShop();
  const bike = ready && bikeId ? bikes.find((b) => b.id === bikeId) : undefined;
  const fit = bike && fitOf(p, bike);
  const sizes = p.fit?.type === "tyre" ? p.fit.sizes : null;
  const [size, setSize] = useState(sizes?.[0]);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState("");
  const [all, setAll] = useState(false);
  const bikeSize = fit?.sizes?.[0]?.size;
  useEffect(() => {
    if (bikeSize) setSize(bikeSize); // preselect the remembered bike's size
  }, [bikeSize]);

  const fits = bikesThatFit(p, bikes);
  const unknown = p.fit?.type === "oil" ? bikes.filter((b) => b.fuel !== "electric" && !b.oil).length : p.fit?.type === "tyre" ? bikes.filter((b) => !b.tyres).length : 0;
  const cat = CATS.find((c) => c.id === p.cat)!;

  return (
    <div className="container-x pt-6">
      <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-[13px] text-muted">
        <Link href={SHOP} className="hover:text-ink">Shop</Link>
        <ChevronRight size={13} aria-hidden />
        <span>{cat.label}</span>
      </nav>

      <div className="mt-5 grid gap-6 md:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:gap-10">
        <div className="mx-auto w-full max-w-[420px] md:max-w-none">
          <ProductArt p={p} size="lg" />
        </div>
        <div className="min-w-0">
          <p className="eyebrow">{cat.label}</p>
          <h1 className="mt-1.5 text-[26px] font-semibold leading-tight tracking-[-0.02em] text-ink sm:text-[32px]">{p.name}</h1>
          <p className="mt-2 text-[15px] text-muted">{p.spec}</p>
          <div className="mt-4">
            <Price n={p.price} big />
          </div>
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1.5">
            <TrustBadge />
            <span className="inline-flex items-center gap-1 text-[12px] font-medium text-ink-2">
              <PackageCheck size={13} aria-hidden />
              Sealed, with batch code
            </span>
            <span className="inline-flex items-center gap-1 text-[12px] font-medium text-ink-2">
              <Truck size={13} aria-hidden />
              Dhaka 1-2 days, elsewhere 3-5
            </span>
          </div>

          <div className="mt-5 rounded-2xl border border-line bg-surface p-4">
            {bike && fit ? (
              <div className="flex flex-wrap items-center gap-2 text-[14px] text-ink-2">
                <span className="font-semibold text-ink">{bike.name}:</span>
                <FitBadge fit={fit} />
                <Link href={`${SHOP}?bike=${bike.id}`} className="ml-auto text-[13px] font-medium text-brand hover:underline">
                  Change bike
                </Link>
              </div>
            ) : (
              <p className="text-[14px] text-muted">
                <Link href={SHOP} className="font-medium text-brand hover:underline">Pick your bike</Link> to check that this fits.
              </p>
            )}

            {sizes && (
              <div className="mt-4">
                <label htmlFor="size" className="text-[13px] font-medium text-ink-2">Size</label>
                <select id="size" className="input mt-1.5" value={size} onChange={(e) => setSize(e.target.value)}>
                  {sizes.map((s) => (
                    <option key={s} value={s}>
                      {s}
                      {fit?.sizes?.some((x) => x.size === s) ? ` (your ${fit.sizes.filter((x) => x.size === s).map((x) => x.end).join(" and ")})` : ""}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="mt-4 flex flex-wrap items-center gap-3">
              <QtyStepper qty={qty} onChange={(n) => setQty(Math.min(MAX_QTY, Math.max(1, n)))} label={p.name} />
              <button
                type="button"
                className="btn-primary flex-1"
                onClick={() => {
                  add(p.id, qty, size);
                  setAdded(`Added ${qty} x ${p.name}${size ? ` ${size}` : ""} to the cart.`);
                }}
              >
                <ShoppingCart size={17} aria-hidden />
                Add to cart
              </button>
            </div>
            <div aria-live="polite">
              {added && (
                <p className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 rounded-xl bg-good-soft px-3 py-2 text-[13.5px] font-medium text-good">
                  <Check size={15} aria-hidden />
                  {added}
                  <Link href={`${SHOP}cart/`} className="inline-flex items-center gap-1 font-semibold underline-offset-2 hover:underline">
                    View cart <ArrowRight size={14} aria-hidden />
                  </Link>
                </p>
              )}
            </div>
          </div>

          <div className="mt-5 rounded-2xl bg-brand-soft p-4">
            <p className="flex items-center gap-1.5 text-[14px] font-semibold text-brand">
              <Lightbulb size={15} aria-hidden />
              Why we&apos;d stock this
            </p>
            <p className="mt-1 text-[14.5px] leading-relaxed text-ink-2">{p.why}</p>
          </div>
        </div>
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        <section aria-labelledby="specs-h">
          <h2 id="specs-h" className="text-[19px] font-semibold text-ink">Specs</h2>
          <dl className="mt-3 overflow-hidden rounded-2xl border border-line bg-surface">
            {p.specs.map(([k, v]) => (
              <div key={k} className="grid grid-cols-[minmax(0,2fr)_minmax(0,3fr)] gap-3 border-b border-line px-4 py-3 text-[14px] last:border-0">
                <dt className="text-muted">{k}</dt>
                <dd className="font-medium text-ink">{v}</dd>
              </div>
            ))}
          </dl>
        </section>
        <section aria-labelledby="fits-h">
          <h2 id="fits-h" className="text-[19px] font-semibold text-ink">
            Fits {p.fit ? `${fits.length} bike${fits.length === 1 ? "" : "s"} in our catalogue` : "any bike"}
          </h2>
          {p.fit ? (
            <>
              <ul className="mt-3 flex flex-wrap gap-1.5">
                {(all ? fits : fits.slice(0, SHOW)).map((b) => (
                  <li key={b.id} className="rounded-full border border-line bg-surface px-2.5 py-1 text-[12.5px] text-ink-2">
                    {b.name}
                    {b.sizes && <span className="text-faint"> · {b.sizes.map((s) => `${s.end} ${s.size}`).join(", ")}</span>}
                  </li>
                ))}
              </ul>
              {fits.length > SHOW && (
                <button type="button" className="mt-2 text-[13.5px] font-medium text-brand hover:underline" onClick={() => setAll(!all)} aria-expanded={all}>
                  {all ? "Show fewer" : `Show all ${fits.length}`}
                </button>
              )}
              {unknown > 0 && (
                <p className="mt-3 text-[13px] text-muted">
                  {unknown} more bike{unknown === 1 ? "" : "s"} have no confirmed {p.fit.type === "oil" ? "oil grade" : "tyre sizes"} in our data yet, so they are not listed.
                </p>
              )}
            </>
          ) : (
            <p className="mt-3 text-[14.5px] text-muted">Not tied to a model: fits every bike and rider.</p>
          )}
        </section>
      </div>
    </div>
  );
}
