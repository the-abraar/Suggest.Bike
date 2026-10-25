"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, ShoppingCart, Trash } from "lucide-react";
import { getProduct } from "@/lib/experimental/catalogue";
import { totals, type Zone } from "@/lib/experimental/cart";
import { formatBDT } from "@/lib/bike-utils";
import { ProductArt, QtyStepper, SHOP, TotalsList, priceOf, useShop } from "../shop";

export function CartView() {
  const { lines, set, remove, ready } = useShop();
  const [zone, setZone] = useState<Zone>("dhaka");
  const t = totals(lines, priceOf, zone);

  return (
    <div className="container-x pt-8">
      <h1 className="text-[28px] font-semibold tracking-[-0.02em] text-ink sm:text-[34px]">Your cart</h1>
      {!ready ? null : lines.length === 0 ? (
        <div className="mt-8 flex flex-col items-center rounded-3xl border border-dashed border-line-strong px-6 py-14 text-center">
          <span className="grid h-14 w-14 place-items-center rounded-2xl bg-surface-2 text-muted">
            <ShoppingCart size={26} aria-hidden />
          </span>
          <p className="mt-4 text-[17px] font-semibold text-ink">Your cart is empty</p>
          <p className="mt-1 max-w-sm text-[14.5px] text-muted">Pick your bike in the shop and we will show the oil, tyres and parts that fit it.</p>
          <Link href={SHOP} className="btn-primary mt-5">
            Go to the shop <ArrowRight size={16} aria-hidden />
          </Link>
        </div>
      ) : (
        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start">
          <ul className="divide-y divide-line overflow-hidden rounded-2xl border border-line bg-surface">
            {lines.map((l) => {
              const p = getProduct(l.id)!;
              const label = `${p.name}${l.size ? `, ${l.size}` : ""}`;
              return (
                <li key={l.id + (l.size ?? "")} className="flex gap-3 p-3 sm:gap-4 sm:p-4">
                  <ProductArt p={p} size="sm" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start gap-2">
                      <div className="min-w-0 flex-1">
                        <Link href={`${SHOP}p/${p.id}/`} className="text-[14.5px] font-semibold leading-snug text-ink hover:text-brand">
                          {p.name}
                        </Link>
                        <p className="mt-0.5 text-[12.5px] text-muted">
                          {l.size ? `Size ${l.size} · ` : ""}
                          {formatBDT(p.price)} each
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => remove(l.id, l.size)}
                        className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-muted hover:bg-signal-soft hover:text-signal"
                        aria-label={`Remove ${label}`}
                      >
                        <Trash size={16} aria-hidden />
                      </button>
                    </div>
                    <div className="mt-2 flex items-center justify-between gap-3">
                      <QtyStepper qty={l.qty} onChange={(n) => set(l.id, l.size, n)} label={label} />
                      <span className="text-[15px] font-semibold text-ink tnum">{formatBDT(p.price * l.qty)}</span>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>

          <aside className="rounded-2xl border border-line bg-surface p-4 sm:p-5 lg:sticky lg:top-36" aria-label="Order summary">
            <fieldset>
              <legend className="text-[13px] font-medium text-ink-2">Delivering to</legend>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {(["dhaka", "outside"] as const).map((z) => (
                  <label key={z} className={`flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-2 text-[13.5px] font-medium ${zone === z ? "border-brand bg-brand-soft text-brand" : "border-line text-ink-2"}`}>
                    <input type="radio" name="zone" value={z} checked={zone === z} onChange={() => setZone(z)} className="accent-[var(--brand)]" />
                    {z === "dhaka" ? "Inside Dhaka" : "Outside Dhaka"}
                  </label>
                ))}
              </div>
            </fieldset>
            <div className="mt-4">
              <TotalsList subtotal={t.subtotal} delivery={t.delivery} />
            </div>
            <Link href={`${SHOP}checkout/`} className="btn-primary mt-4 w-full">
              Checkout <ArrowRight size={16} aria-hidden />
            </Link>
            <p className="mt-2 text-center text-[12px] text-faint">Simulated checkout: nothing is charged or sent.</p>
          </aside>
        </div>
      )}
    </div>
  );
}
