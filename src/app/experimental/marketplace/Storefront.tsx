"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Check, ChevronRight, Search, ShoppingCart, Truck, Undo2, X } from "lucide-react";
import { WithSearchParams } from "@/components/ui";
import { searchBikes } from "@/lib/search";
import { CATS, PRODUCTS, type Cat, type Product } from "@/lib/experimental/catalogue";
import { fitOf, picksFor, type FitBike } from "@/lib/experimental/fitment";
import { formatBDT } from "@/lib/bike-utils";
import { FitBadge, Price, ProductArt, SHOP, TrustBadge, useShop } from "./shop";

export function Storefront({ bikes }: { bikes: FitBike[] }) {
  return <WithSearchParams render={(p) => <Store bikes={bikes} param={p.get("bike")} />} />;
}

function Store({ bikes, param }: { bikes: FitBike[]; param: string | null }) {
  const router = useRouter();
  const { bikeId, setBikeId, ready, add } = useShop();
  const byId = useMemo(() => new Map(bikes.map((b) => [b.id, b])), [bikes]);
  const urlBike = param ? byId.get(param) : undefined; // unknown ids from a URL are ignored
  const bike = urlBike ?? (ready && bikeId ? byId.get(bikeId) : undefined);
  const [cat, setCat] = useState<Cat | "all">("all");
  const [onlyFits, setOnlyFits] = useState(false);
  const [said, setSaid] = useState(""); // aria-live "added" message
  const [flash, setFlash] = useState<string | null>(null);

  // The URL wins and is remembered; a remembered bike is written into the URL so the page can be shared.
  useEffect(() => {
    if (!ready) return;
    if (urlBike) {
      if (urlBike.id !== bikeId) setBikeId(urlBike.id);
    } else if (bike) router.replace(`${SHOP}?bike=${bike.id}`, { scroll: false });
  }, [ready, urlBike, bike, bikeId, setBikeId, router]);

  const pick = (id: string | null) => {
    setBikeId(id);
    router.replace(id ? `${SHOP}?bike=${id}` : SHOP, { scroll: false });
  };
  const addOne = (p: Product, qty = 1, size?: string) => {
    add(p.id, qty, size);
    setSaid(`Added ${qty} x ${p.name}${size ? ` ${size}` : ""} to the cart.`);
    setFlash(p.id + (size ?? ""));
    setTimeout(() => setFlash(null), 1400);
  };

  const shown = PRODUCTS.filter((p) => (cat === "all" || p.cat === cat) && (!onlyFits || !bike || ["fits", "any"].includes(fitOf(p, bike).status)));

  return (
    <div className="container-x pt-8 sm:pt-10">
      <p className="sr-only" aria-live="polite">
        {said}
      </p>
      <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr] lg:items-end">
        <div>
          <p className="eyebrow">Suggest.Bike shop</p>
          <h1 className="mt-2 text-[30px] font-semibold leading-[1.1] tracking-[-0.03em] text-ink sm:text-[42px]">Oil, parts and gear that fit your bike.</h1>
          <p className="mt-3 max-w-xl text-[15.5px] leading-relaxed text-muted">
            Pick your bike and we match the oil grade from its owner&apos;s manual, its tyre sizes and its brake type. Every item sealed and from the official importer.
          </p>
          <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-[13px] font-medium text-ink-2">
            <li className="inline-flex items-center gap-1.5"><Truck size={15} className="text-brand" aria-hidden />Dhaka ৳60, elsewhere ৳120</li>
            <li className="inline-flex items-center gap-1.5"><Check size={15} className="text-brand" aria-hidden />Cash on delivery</li>
            <li className="inline-flex items-center gap-1.5"><Undo2 size={15} className="text-brand" aria-hidden />7-day returns if it does not fit</li>
          </ul>
        </div>
        <BikeChooser bike={bike} byId={byId} onPick={pick} />
      </div>

      {bike && <FitsSection bike={bike} onAdd={addOne} flash={flash} />}

      <section className="mt-12" aria-labelledby="all-h">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h2 id="all-h" className="text-[22px] font-semibold tracking-[-0.02em] text-ink">
            {cat === "all" ? "Shop everything" : CATS.find((c) => c.id === cat)?.label}
          </h2>
          <label className={`inline-flex items-center gap-2 text-[14px] font-medium ${bike ? "text-ink-2" : "text-faint"}`}>
            <input type="checkbox" className="h-4 w-4 accent-[var(--brand)]" checked={onlyFits && !!bike} disabled={!bike} onChange={(e) => setOnlyFits(e.target.checked)} />
            Only show what fits {bike ? "my bike" : "(pick a bike first)"}
          </label>
        </div>
        <div className="no-scrollbar -mx-4 mt-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0" role="group" aria-label="Categories">
          {[{ id: "all" as const, label: "All" }, ...CATS].map((c) => (
            <button key={c.id} type="button" className="chip shrink-0" data-active={cat === c.id} aria-pressed={cat === c.id} onClick={() => setCat(c.id)}>
              {c.label}
            </button>
          ))}
        </div>
        {shown.length === 0 ? (
          <p className="mt-8 rounded-2xl border border-dashed border-line-strong p-8 text-center text-[15px] text-muted">Nothing in this category fits your bike yet.</p>
        ) : (
          <ul className="mt-5 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
            {shown.map((p) => (
              <ProductCard key={p.id} p={p} bike={bike} onAdd={addOne} flash={flash === p.id} />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function BikeChooser({ bike, byId, onPick }: { bike?: FitBike; byId: Map<string, FitBike>; onPick: (id: string | null) => void }) {
  const [q, setQ] = useState("");
  const [editing, setEditing] = useState(false);
  const results = useMemo(() => (q.trim() ? searchBikes(q, 6).filter((b) => byId.has(b.id)) : []), [q, byId]);
  if (bike && !editing)
    return (
      <div className="rounded-2xl border border-line bg-surface p-4 sm:p-5">
        <p className="eyebrow">Shopping for</p>
        <div className="mt-1.5 flex items-center gap-3">
          <p className="min-w-0 flex-1 truncate text-[19px] font-semibold text-ink">{bike.name}</p>
          <button type="button" className="btn-secondary h-9 px-3 text-[13.5px]" onClick={() => setEditing(true)}>
            Change
          </button>
          <button type="button" className="grid h-9 w-9 place-items-center rounded-xl text-muted hover:bg-surface-2 hover:text-ink" aria-label="Clear bike" onClick={() => onPick(null)}>
            <X size={17} aria-hidden />
          </button>
        </div>
        <p className="mt-1 text-[13px] text-muted">
          {bike.oil ? `Oil ${bike.oil.grade}` : bike.fuel === "electric" ? "Electric" : "Oil grade not confirmed"}
          {bike.tyres && ` · Tyres ${bike.tyres.front} / ${bike.tyres.rear}`} · {bike.brakes.front} / {bike.brakes.rear} brakes
        </p>
      </div>
    );
  return (
    <div className="rounded-2xl border border-line bg-surface p-4 sm:p-5">
      <label htmlFor="bike-q" className="text-[15px] font-semibold text-ink">
        Shop for your bike
      </label>
      <div className="relative mt-2">
        <Search size={17} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-faint" aria-hidden />
        <input
          id="bike-q"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && results[0]) onPick(results[0].id);
            if (e.key === "Escape" && bike) setEditing(false);
          }}
          placeholder="Pulsar N160, Livo, FZS…"
          autoComplete="off"
          maxLength={60}
          className="input pl-10"
          autoFocus={editing}
        />
      </div>
      {results.length > 0 ? (
        <ul className="mt-2 divide-y divide-line overflow-hidden rounded-xl border border-line" aria-label="Matching bikes">
          {results.map((b) => (
            <li key={b.id}>
              <button
                type="button"
                className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-[14px] font-medium text-ink hover:bg-surface-2"
                onClick={() => {
                  onPick(b.id);
                  setEditing(false);
                  setQ("");
                }}
              >
                <span className="min-w-0 flex-1 truncate">{byId.get(b.id)!.name}</span>
                <ChevronRight size={15} className="text-faint" aria-hidden />
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-2 text-[13px] text-muted">{q.trim() ? "No bike found. Try the model name." : "We remember your pick on this device only."}</p>
      )}
    </div>
  );
}

function FitsSection({ bike, onAdd, flash }: { bike: FitBike; onAdd: (p: Product, qty?: number, size?: string) => void; flash: string | null }) {
  const { picks, oilNote } = picksFor(bike, PRODUCTS);
  const total = picks.reduce((s, x) => s + x.product.price * x.qty, 0);
  return (
    <section className="mt-10 rounded-3xl border border-line bg-surface p-4 sm:p-6" aria-labelledby="fits-h">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="eyebrow">Matched to your manual</p>
          <h2 id="fits-h" className="mt-1 text-[22px] font-semibold tracking-[-0.02em] text-ink">Fits your {bike.name}</h2>
        </div>
        {picks.length > 1 && (
          <button type="button" className="btn-primary h-10 text-[14px]" onClick={() => picks.forEach((x) => onAdd(x.product, x.qty, x.size))}>
            <ShoppingCart size={16} aria-hidden />
            Add all · {formatBDT(total)}
          </button>
        )}
      </div>
      {oilNote && (
        <p className={`mt-3 rounded-xl px-3 py-2 text-[13.5px] ${bike.oil ? "bg-surface-2 text-ink-2" : "bg-warn-soft text-warn"}`}>
          <span className="font-semibold">Engine oil: </span>
          {oilNote}
        </p>
      )}
      <ul className="mt-4 grid gap-2 md:grid-cols-2">
        {picks.map((x) => {
          const key = x.product.id + (x.size ?? "");
          return (
            <li key={key} className="flex items-center gap-3 rounded-2xl border border-line p-2.5">
              <ProductArt p={x.product} size="sm" />
              <div className="min-w-0 flex-1">
                <Link href={`${SHOP}p/${x.product.id}/`} className="line-clamp-1 text-[14px] font-semibold text-ink hover:text-brand">
                  {x.product.name}
                </Link>
                <p className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[12.5px] text-muted">
                  <span className="inline-flex items-center gap-1 font-semibold text-good">
                    <Check size={12} aria-hidden />
                    {x.note}
                  </span>
                  <span className="tnum">{x.qty > 1 ? `${x.qty} x ${formatBDT(x.product.price)}` : formatBDT(x.product.price)}</span>
                </p>
              </div>
              <button
                type="button"
                onClick={() => onAdd(x.product, x.qty, x.size)}
                className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl transition-colors ${flash === key ? "bg-good-soft text-good" : "bg-brand-soft text-brand hover:bg-brand hover:text-brand-ink"}`}
                aria-label={`Add ${x.qty} x ${x.product.name}${x.size ? ` ${x.size}` : ""} to cart`}
              >
                {flash === key ? <Check size={18} aria-hidden /> : <ShoppingCart size={17} aria-hidden />}
              </button>
            </li>
          );
        })}
      </ul>
      <p className="mt-3 text-[12px] text-faint">Sample prices. Parts are generic by type here; a real order would be matched to your exact model and year.</p>
    </section>
  );
}

function ProductCard({ p, bike, onAdd, flash }: { p: Product; bike?: FitBike; onAdd: (p: Product) => void; flash: boolean }) {
  const fit = bike ? fitOf(p, bike) : undefined;
  const href = `${SHOP}p/${p.id}/`;
  return (
    <li className="relative flex flex-col rounded-2xl border border-line bg-surface p-2.5 transition-colors hover:border-line-strong sm:p-3">
      <ProductArt p={p} />
      <div className="mt-2.5 flex min-w-0 flex-1 flex-col">
        {fit && fit.status !== "any" && (
          <div className="mb-1.5">
            <FitBadge fit={fit} />
          </div>
        )}
        <Link href={href} className="line-clamp-2 text-[14px] font-semibold leading-snug text-ink after:absolute after:inset-0 after:rounded-2xl hover:text-brand sm:text-[14.5px]">
          {p.name}
        </Link>
        <p className="mt-1 line-clamp-2 text-[12.5px] leading-snug text-muted">{p.spec}</p>
        <div className="mt-auto pt-2.5">
          <Price n={p.price} />
          <div className="mt-1 hidden sm:block">
            <TrustBadge />
          </div>
          {p.fit?.type === "tyre" ? (
            <Link href={href} className="btn-secondary relative z-10 mt-2.5 h-9 w-full px-2 text-[13.5px]" aria-label={`Choose a size: ${p.name}`}>
              Choose size
            </Link>
          ) : (
            <button
              type="button"
              onClick={() => onAdd(p)}
              className={`btn relative z-10 mt-2.5 h-9 w-full px-2 text-[13.5px] ${flash ? "bg-good-soft text-good" : "bg-brand text-brand-ink hover:bg-brand-strong"}`}
              aria-label={`Add ${p.name} to cart`}
            >
              {flash ? <Check size={15} aria-hidden /> : <ShoppingCart size={15} aria-hidden />}
              {flash ? "Added" : "Add to cart"}
            </button>
          )}
        </div>
      </div>
    </li>
  );
}
