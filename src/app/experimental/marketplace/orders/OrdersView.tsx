"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, Check, Package } from "lucide-react";
import { formatBDT } from "@/lib/bike-utils";
import { SHOP, clearOrders, readOrders, type Order } from "../shop";

// Simulated tracking: the status moves on by the clock since the order was "placed".
const STEPS: [string, number][] = [["Placed", 0], ["Packed", 2], ["Shipped", 10], ["Delivered", 60]]; // minutes

export function OrdersView() {
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [now, setNow] = useState(0);
  useEffect(() => {
    setOrders(readOrders());
    setNow(Date.now());
    const t = setInterval(() => setNow(Date.now()), 15000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="container-x pt-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-[28px] font-semibold tracking-[-0.02em] text-ink sm:text-[34px]">Your orders</h1>
          <p className="mt-1 text-[13.5px] text-muted">Simulated: kept on this device only, and the status moves on by the clock (packed after 2 min, shipped after 10, delivered after 60).</p>
        </div>
        {!!orders?.length && (
          <button
            type="button"
            className="btn-ghost h-9 text-[13.5px]"
            onClick={() => {
              clearOrders();
              setOrders([]);
            }}
          >
            Clear simulated orders
          </button>
        )}
      </div>

      {orders && orders.length === 0 && (
        <div className="mt-8 flex flex-col items-center rounded-3xl border border-dashed border-line-strong px-6 py-14 text-center">
          <span className="grid h-14 w-14 place-items-center rounded-2xl bg-surface-2 text-muted">
            <Package size={26} aria-hidden />
          </span>
          <p className="mt-4 text-[17px] font-semibold text-ink">No orders yet</p>
          <p className="mt-1 text-[14.5px] text-muted">Place a simulated order and it shows up here.</p>
          <Link href={SHOP} className="btn-primary mt-5">Go to the shop <ArrowRight size={16} aria-hidden /></Link>
        </div>
      )}

      <ul className="mt-6 space-y-4">
        {orders?.map((o) => {
          const mins = (now - new Date(o.placedAt).getTime()) / 6e4;
          const at = STEPS.filter(([, m]) => mins >= m).length - 1;
          return (
            <li key={o.no} className="rounded-2xl border border-line bg-surface p-4 sm:p-5">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="text-[16px] font-semibold text-ink tnum">{o.no}</p>
                <p className="text-[13px] text-muted">
                  {new Date(o.placedAt).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })} · {o.payment === "cod" ? "Cash on delivery" : "bKash"} ·{" "}
                  <span className="font-semibold text-ink tnum">{formatBDT(o.total)}</span>
                </p>
              </div>
              <ol className="mt-4 grid grid-cols-4 gap-1" aria-label={`Status: ${STEPS[Math.max(0, at)][0]}`}>
                {STEPS.map(([name], i) => (
                  <li key={name} className="min-w-0">
                    <div className={`h-1.5 rounded-full ${i <= at ? "bg-good" : "bg-surface-3"}`} />
                    <p className={`mt-1.5 flex items-center gap-1 truncate text-[12px] font-medium sm:text-[13px] ${i <= at ? "text-good" : "text-faint"}`}>
                      {i <= at && <Check size={12} className="shrink-0" aria-hidden />}
                      {name}
                    </p>
                  </li>
                ))}
              </ol>
              <p className="mt-3 text-[13px] text-muted">
                {o.lines.map((l) => `${l.qty} x ${l.name}${l.size ? ` (${l.size})` : ""}`).join(" · ")}
              </p>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
