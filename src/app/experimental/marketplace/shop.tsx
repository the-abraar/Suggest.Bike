"use client";

// Shared client state and UI for the simulated shop. Cart, remembered bike and simulated orders live in localStorage
// (sb-exp-*), wrapped in try/catch like src/lib/store.tsx. Checkout's personal details are never stored.
import Link from "next/link";
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import {
  Backpack, Check, CircleAlert, CircleDot, Cog, Disc, Droplet, Hand, HardHat, Link as LinkIcon, Lock, Minus, Package, Plus,
  Radar, ShieldCheck, Shirt, ShoppingCart, Smartphone, Sparkles, SprayCan, Umbrella, Usb, Wind, X, Zap, type LucideIcon,
} from "lucide-react";
import { getProduct, type Cat, type Product } from "@/lib/experimental/catalogue";
import { addLine, cleanLines, count, removeLine, setQty, type Line, type Zone } from "@/lib/experimental/cart";
import type { Fit } from "@/lib/experimental/fitment";
import { formatBDT } from "@/lib/bike-utils";

export const SHOP = "/experimental/marketplace/";
const CART_KEY = "sb-exp-cart";
const BIKE_KEY = "sb-exp-bike";
const ORDERS_KEY = "sb-exp-orders";
export const MAX_ORDERS = 20;

/** No personal details: only what was bought, the delivery zone and the payment choice. */
export type Order = {
  no: string;
  placedAt: string;
  lines: { name: string; size?: string; qty: number; price: number }[];
  subtotal: number;
  delivery: number;
  total: number;
  zone: Zone;
  payment: "cod" | "bkash";
};

function readJson(key: string): unknown {
  try {
    return JSON.parse(localStorage.getItem(key) || "null");
  } catch {
    return null;
  }
}
function writeJson(key: string, v: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(v));
  } catch {}
}

export const knownLine = (id: string, size?: string) => {
  const p = getProduct(id);
  return !!p && (p.fit?.type === "tyre" ? !!size && p.fit.sizes.includes(size) : size === undefined);
};
export const priceOf = (id: string) => getProduct(id)?.price;

export function readOrders(): Order[] {
  const v = readJson(ORDERS_KEY);
  return Array.isArray(v)
    ? v.filter((o): o is Order => !!o && typeof o.no === "string" && typeof o.placedAt === "string" && Array.isArray(o.lines) && typeof o.total === "number").slice(0, MAX_ORDERS)
    : [];
}
export const saveOrder = (o: Order) => writeJson(ORDERS_KEY, [o, ...readOrders()].slice(0, MAX_ORDERS));
export const clearOrders = () => writeJson(ORDERS_KEY, []);

type Shop = {
  lines: Line[];
  add: (id: string, qty?: number, size?: string) => void;
  set: (id: string, size: string | undefined, qty: number) => void;
  remove: (id: string, size?: string) => void;
  clear: () => void;
  bikeId: string | null;
  setBikeId: (id: string | null) => void;
  ready: boolean;
};
const ShopContext = createContext<Shop>({ lines: [], add() {}, set() {}, remove() {}, clear() {}, bikeId: null, setBikeId() {}, ready: false });
export const useShop = () => useContext(ShopContext);

export function ShopProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<Line[]>([]);
  const [bikeId, setBike] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    setLines(cleanLines(readJson(CART_KEY), knownLine));
    const b = readJson(BIKE_KEY);
    setBike(typeof b === "string" && b.length < 80 ? b : null); // pages check the id against the bike list
    setReady(true);
  }, []);
  useEffect(() => {
    if (ready) writeJson(CART_KEY, lines);
  }, [lines, ready]);
  const setBikeId = useCallback((id: string | null) => {
    setBike(id);
    writeJson(BIKE_KEY, id);
  }, []);
  const add = useCallback((id: string, qty = 1, size?: string) => setLines((l) => addLine(l, id, qty, size)), []);
  const set = useCallback((id: string, size: string | undefined, qty: number) => setLines((l) => setQty(l, id, size, qty)), []);
  const remove = useCallback((id: string, size?: string) => setLines((l) => removeLine(l, id, size)), []);
  const clear = useCallback(() => setLines([]), []);
  return <ShopContext.Provider value={{ lines, add, set, remove, clear, bikeId, setBikeId, ready }}>{children}</ShopContext.Provider>;
}

/** Shop sub-header: name, orders link and cart count. */
export function ShopBar() {
  const { lines, ready } = useShop();
  const n = count(lines);
  return (
    <div className="border-b border-line bg-surface">
      <div className="container-x flex h-12 items-center gap-2">
        <Link href={SHOP} className="mr-auto flex items-center gap-2 rounded-lg text-[15px] font-semibold text-ink">
          <span className="grid h-7 w-7 place-items-center rounded-lg bg-brand text-brand-ink">
            <ShoppingCart size={15} aria-hidden />
          </span>
          Shop <span className="rounded-full bg-accent-soft px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-accent-text">Preview</span>
        </Link>
        <Link href={`${SHOP}orders/`} className="rounded-lg px-2.5 py-1.5 text-[14px] font-medium text-muted hover:text-ink">
          Orders
        </Link>
        <Link
          href={`${SHOP}cart/`}
          className="relative inline-flex h-9 items-center gap-1.5 rounded-xl bg-surface-2 px-3 text-[14px] font-medium text-ink hover:bg-surface-3"
          aria-label={`Cart, ${ready ? n : 0} item${n === 1 ? "" : "s"}`}
        >
          <ShoppingCart size={16} aria-hidden />
          Cart
          {ready && n > 0 && <span className="grid h-5 min-w-5 place-items-center rounded-full bg-brand px-1 text-[11.5px] font-semibold text-brand-ink tnum">{n}</span>}
        </Link>
      </div>
    </div>
  );
}

const ICONS: Record<string, LucideIcon> = {
  oil: Droplet, tyre: CircleDot, brake: Disc, filter: Wind, plug: Zap, chain: LinkIcon, parts: Cog, helmet: HardHat, gloves: Hand,
  jacket: Shirt, rain: Umbrella, lock: Lock, tracker: Radar, spray: SprayCan, care: Sparkles, phone: Smartphone, bag: Backpack, usb: Usb,
  accessory: Package,
};
const TINT: Record<Cat, string> = {
  oil: "bg-accent-soft text-accent-text",
  parts: "bg-brand-soft text-brand",
  tyres: "bg-surface-3 text-ink-2",
  gear: "bg-good-soft text-good",
  security: "bg-signal-soft text-signal",
  care: "bg-brand-soft text-brand",
  accessories: "bg-warn-soft text-warn",
};
/** Drawn placeholder: no photos or logos. The caption is what a real pack would print large (grade and size). */
export function ProductArt({ p, size = "md" }: { p: Product; size?: "sm" | "md" | "lg" }) {
  const Icon = ICONS[p.icon] ?? Package;
  const caption = p.fit?.type === "oil" ? `${p.fit.grade} · ${p.fit.litres} L` : p.fit?.type === "tyre" ? `${p.fit.sizes.length} sizes` : null;
  const box = size === "sm" ? "h-14 w-14 rounded-xl" : size === "lg" ? "aspect-[4/3] w-full rounded-3xl" : "aspect-[4/3] w-full rounded-xl";
  return (
    <div className={`relative grid shrink-0 place-items-center overflow-hidden ${box} ${TINT[p.cat]}`} aria-hidden>
      {size !== "sm" && <span className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-current opacity-[0.07]" />}
      <Icon size={size === "sm" ? 24 : size === "lg" ? 96 : 40} strokeWidth={1.6} />
      {caption && size !== "sm" && (
        <span className={`absolute bottom-2 left-2 rounded-md bg-surface/85 px-1.5 py-0.5 font-semibold text-ink tnum ${size === "lg" ? "text-[15px]" : "text-[11.5px]"}`}>
          {caption}
        </span>
      )}
    </div>
  );
}

export function Price({ n, big = false }: { n: number; big?: boolean }) {
  return (
    <span className="inline-flex items-baseline gap-1.5">
      <span className={`font-semibold text-ink tnum ${big ? "text-[28px] tracking-[-0.02em]" : "text-[16px]"}`}>{formatBDT(n)}</span>
      <span className="text-[11.5px] font-medium text-faint">sample price</span>
    </span>
  );
}

/** Subtotal / delivery / total rows. `delivery` null = not known yet (no district picked). */
export function TotalsList({ subtotal, delivery, note }: { subtotal: number; delivery: number | null; note?: string }) {
  return (
    <dl className="space-y-2 text-[14.5px]">
      <div className="flex justify-between gap-3">
        <dt className="text-muted">Subtotal</dt>
        <dd className="font-medium text-ink tnum">{formatBDT(subtotal)}</dd>
      </div>
      <div className="flex justify-between gap-3">
        <dt className="text-muted">Delivery{note && <span className="text-faint"> ({note})</span>}</dt>
        <dd className="font-medium text-ink tnum">{delivery === null ? "Pick a district" : formatBDT(delivery)}</dd>
      </div>
      <div className="flex items-baseline justify-between gap-3 border-t border-line pt-3">
        <dt className="font-semibold text-ink">Total</dt>
        <dd className="text-right">
          <span className="block text-[20px] font-semibold text-ink tnum">{formatBDT(subtotal + (delivery ?? 0))}</span>
          <span className="text-[11.5px] text-faint">sample prices</span>
        </dd>
      </div>
    </dl>
  );
}

export function TrustBadge() {
  return (
    <span className="inline-flex items-center gap-1 text-[12px] font-medium text-good">
      <ShieldCheck size={13} aria-hidden />
      Genuine, from the official importer
    </span>
  );
}

const FIT_STYLE: Record<Fit["status"], [string, LucideIcon]> = {
  fits: ["bg-good-soft text-good", Check],
  no: ["bg-surface-2 text-muted", X],
  unknown: ["bg-warn-soft text-warn", CircleAlert],
  any: ["bg-brand-soft text-brand", Check],
};
export function FitBadge({ fit }: { fit: Fit }) {
  const [cls, Icon] = FIT_STYLE[fit.status];
  return (
    <span className={`inline-flex max-w-full items-center gap-1 rounded-full px-2 py-0.5 text-[11.5px] font-semibold ${cls}`}>
      <Icon size={12} className="shrink-0" aria-hidden />
      <span className="truncate">{fit.label}</span>
    </span>
  );
}

export function QtyStepper({ qty, onChange, label }: { qty: number; onChange: (n: number) => void; label: string }) {
  return (
    <div className="inline-flex h-10 items-center rounded-xl border border-line-strong bg-surface" role="group" aria-label={`Quantity, ${label}`}>
      <button type="button" onClick={() => onChange(qty - 1)} className="grid h-full w-10 place-items-center rounded-l-xl text-ink-2 hover:bg-surface-2" aria-label={`One less ${label}`}>
        <Minus size={16} aria-hidden />
      </button>
      <span className="w-8 text-center text-[15px] font-semibold text-ink tnum" aria-live="polite">
        {qty}
      </span>
      <button type="button" onClick={() => onChange(qty + 1)} className="grid h-full w-10 place-items-center rounded-r-xl text-ink-2 hover:bg-surface-2" aria-label={`One more ${label}`}>
        <Plus size={16} aria-hidden />
      </button>
    </div>
  );
}
