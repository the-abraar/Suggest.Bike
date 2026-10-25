"use client";

// Simulated checkout. The form lives in React state only: name, phone and address are never written to storage or sent.
// No payment credential fields of any kind (no PIN, OTP or wallet number), by design.
import Link from "next/link";
import { useState, type ReactNode } from "react";
import { ArrowLeft, ArrowRight, Banknote, CircleCheck, Info, MessageSquareText, ShieldCheck, Smartphone } from "lucide-react";
import { getProduct } from "@/lib/experimental/catalogue";
import { DIVISIONS, bdMobile, totals, zoneFor } from "@/lib/experimental/cart";
import { formatBDT } from "@/lib/bike-utils";
import { SHOP, TotalsList, priceOf, saveOrder, useShop, type Order } from "../shop";

type Form = { name: string; phone: string; division: string; district: string; address: string; note: string; payment: "cod" | "bkash" };
const EMPTY: Form = { name: "", phone: "", division: "", district: "", address: "", note: "", payment: "cod" };

const day = (d: Date) => d.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });
const eta = (o: Order) => {
  const [a, b] = o.zone === "dhaka" ? [1, 2] : [3, 5];
  const t = new Date(o.placedAt).getTime();
  return `${day(new Date(t + a * 864e5))} to ${day(new Date(t + b * 864e5))}`;
};

function errorsOf(f: Form) {
  const e: Partial<Record<keyof Form, string>> = {};
  if (f.name.trim().length < 2) e.name = "Enter your name.";
  if (!bdMobile(f.phone)) e.phone = "Enter a Bangladesh mobile number: 11 digits starting 013 to 019.";
  if (!f.division) e.division = "Pick a division.";
  if (!f.district) e.district = "Pick a district.";
  if (f.address.trim().length < 5) e.address = "Enter a delivery address.";
  return e;
}

export function CheckoutView() {
  const { lines, clear, ready } = useShop();
  const [f, setF] = useState<Form>(EMPTY);
  const [tried, setTried] = useState(false);
  const [step, setStep] = useState<"form" | "code">("form");
  const [code, setCode] = useState("");
  const [codeErr, setCodeErr] = useState(false);
  const [done, setDone] = useState<Order | null>(null);

  const zone = f.district ? zoneFor(f.district) : null;
  const t = totals(lines, priceOf, zone ?? "dhaka");
  const errs = errorsOf(f);
  const put = (k: keyof Form) => (e: { target: { value: string } }) => setF((x) => ({ ...x, [k]: e.target.value, ...(k === "division" && { district: "" }) }));

  const place = () => {
    const o: Order = {
      no: `SB-${String(Math.floor(100000 + Math.random() * 900000))}`,
      placedAt: new Date().toISOString(),
      lines: lines.map((l) => ({ name: getProduct(l.id)!.name, size: l.size, qty: l.qty, price: priceOf(l.id)! })),
      ...t,
      zone: zone!,
      payment: f.payment,
    };
    saveOrder(o); // items, totals, zone and payment type only
    clear();
    setF(EMPTY); // drop the personal details from memory too
    setDone(o);
    window.scrollTo({ top: 0 });
  };

  if (done) return <Confirmation o={done} />;
  if (!ready) return <div className="container-x min-h-[50vh] pt-8" />;
  if (!lines.length)
    return (
      <div className="container-x pt-8">
        <h1 className="text-[28px] font-semibold tracking-[-0.02em] text-ink">Checkout</h1>
        <p className="mt-4 text-[15px] text-muted">Your cart is empty.</p>
        <Link href={SHOP} className="btn-primary mt-5">Go to the shop <ArrowRight size={16} aria-hidden /></Link>
      </div>
    );

  const summary = (
    <aside className="rounded-2xl border border-line bg-surface p-4 sm:p-5 lg:sticky lg:top-36" aria-label="Order summary">
      <p className="text-[15px] font-semibold text-ink">Order summary</p>
      <ul className="mt-3 space-y-2 border-b border-line pb-3 text-[13.5px]">
        {lines.map((l) => {
          const p = getProduct(l.id)!;
          return (
            <li key={l.id + (l.size ?? "")} className="flex justify-between gap-3">
              <span className="min-w-0 text-ink-2">
                {l.qty} x {p.name}
                {l.size && <span className="text-faint"> · {l.size}</span>}
              </span>
              <span className="shrink-0 font-medium text-ink tnum">{formatBDT(p.price * l.qty)}</span>
            </li>
          );
        })}
      </ul>
      <div className="mt-3">
        <TotalsList subtotal={t.subtotal} delivery={zone ? t.delivery : null} note={zone ? (zone === "dhaka" ? "inside Dhaka" : "outside Dhaka") : undefined} />
      </div>
      <Link href={`${SHOP}cart/`} className="mt-3 inline-flex items-center gap-1 text-[13px] font-medium text-brand hover:underline">
        <ArrowLeft size={14} aria-hidden /> Edit cart
      </Link>
    </aside>
  );

  if (step === "code")
    return (
      <div className="container-x pt-8">
        <div className="mx-auto max-w-md rounded-3xl border border-line bg-surface p-5 sm:p-7">
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-brand-soft text-brand">
            <MessageSquareText size={22} aria-hidden />
          </span>
          <h1 className="mt-4 text-[22px] font-semibold tracking-[-0.02em] text-ink">Confirm your cash order</h1>
          <p className="mt-2 text-[14.5px] leading-relaxed text-muted">
            A real shop would text a 4-digit code to {bdMobile(f.phone)!.replace(/^(\d{3})\d{5}/, "$1•••••")} so we know the order is really yours.
          </p>
          <p className="mt-3 flex gap-2 rounded-xl bg-warn-soft px-3 py-2 text-[13.5px] font-medium text-warn">
            <Info size={16} className="mt-0.5 shrink-0" aria-hidden />
            Simulated: no text was sent. Type any 4 digits.
          </p>
          <form
            className="mt-5"
            noValidate
            onSubmit={(e) => {
              e.preventDefault();
              if (/^\d{4}$/.test(code)) place();
              else setCodeErr(true);
            }}
          >
            <label htmlFor="code" className="text-[13px] font-medium text-ink-2">Confirmation code (simulated)</label>
            <input
              id="code"
              className="input mt-1.5 text-center text-[20px] tracking-[0.5em] tnum"
              inputMode="numeric"
              autoComplete="off"
              maxLength={4}
              value={code}
              onChange={(e) => {
                setCode(e.target.value.replace(/\D/g, "").slice(0, 4));
                setCodeErr(false);
              }}
              aria-invalid={codeErr}
              aria-describedby={codeErr ? "code-err" : undefined}
              autoFocus
            />
            {codeErr && <p id="code-err" className="mt-1.5 text-[13px] font-medium text-signal">Type 4 digits.</p>}
            <button type="submit" className="btn-primary mt-4 w-full">Confirm and place order (simulated)</button>
            <button type="button" className="btn-ghost mt-2 w-full" onClick={() => setStep("form")}>
              <ArrowLeft size={16} aria-hidden /> Back to details
            </button>
          </form>
        </div>
      </div>
    );

  return (
    <div className="container-x pt-8">
      <h1 className="text-[28px] font-semibold tracking-[-0.02em] text-ink sm:text-[34px]">Checkout</h1>
      <p className="mt-1 flex items-center gap-1.5 text-[13.5px] text-muted">
        <ShieldCheck size={15} className="text-good" aria-hidden />
        What you type stays on this page. It is not saved or sent, and is wiped when the order is placed.
      </p>
      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start">
        <form
          noValidate
          className="space-y-6"
          onSubmit={(e) => {
            e.preventDefault();
            setTried(true);
            if (Object.keys(errs).length) {
              const el = document.getElementById(`f-${Object.keys(errs)[0]}`);
              el?.focus({ preventScroll: true });
              el?.scrollIntoView({ block: "center" }); // centred: the sticky header and banner would cover it at the top
              return;
            }
            if (f.payment === "cod") setStep("code");
            else place();
          }}
        >
          <section className="rounded-2xl border border-line bg-surface p-4 sm:p-5">
            <h2 className="text-[16px] font-semibold text-ink">Delivery details</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Field id="name" label="Full name" err={tried ? errs.name : undefined}>
                <input id="f-name" className="input" value={f.name} onChange={put("name")} maxLength={60} autoComplete="off" {...aria("name", tried && errs.name)} />
              </Field>
              <Field id="phone" label="Mobile number" hint="01XXXXXXXXX" err={tried ? errs.phone : undefined}>
                <input id="f-phone" className="input tnum" value={f.phone} onChange={put("phone")} maxLength={16} inputMode="tel" autoComplete="off" placeholder="017XXXXXXXX" {...aria("phone", tried && errs.phone)} />
              </Field>
              <Field id="division" label="Division" err={tried ? errs.division : undefined}>
                <select id="f-division" className="input" value={f.division} onChange={put("division")} {...aria("division", tried && errs.division)}>
                  <option value="">Choose…</option>
                  {Object.keys(DIVISIONS).map((d) => <option key={d}>{d}</option>)}
                </select>
              </Field>
              <Field id="district" label="District" err={tried ? errs.district : undefined}>
                <select id="f-district" className="input" value={f.district} onChange={put("district")} disabled={!f.division} {...aria("district", tried && errs.district)}>
                  <option value="">{f.division ? "Choose…" : "Pick a division first"}</option>
                  {(DIVISIONS[f.division] ?? []).map((d) => <option key={d}>{d}</option>)}
                </select>
              </Field>
              <div className="sm:col-span-2">
                <Field id="address" label="Address" hint="House, road, area" err={tried ? errs.address : undefined}>
                  <textarea id="f-address" className="input h-20 resize-none py-2.5" value={f.address} onChange={put("address")} maxLength={200} autoComplete="off" {...aria("address", tried && errs.address)} />
                </Field>
              </div>
              <div className="sm:col-span-2">
                <Field id="note" label="Delivery note (optional)">
                  <input id="f-note" className="input" value={f.note} onChange={put("note")} maxLength={120} autoComplete="off" placeholder="Call before coming, gate code…" />
                </Field>
              </div>
            </div>
          </section>

          <fieldset className="rounded-2xl border border-line bg-surface p-4 sm:p-5">
            <legend className="sr-only">Payment</legend>
            <p className="text-[16px] font-semibold text-ink" aria-hidden>Payment</p>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              <PayOption on={f.payment === "cod"} onPick={() => setF((x) => ({ ...x, payment: "cod" }))} icon={<Banknote size={18} aria-hidden />} title="Cash on delivery" sub="Pay the rider in cash" />
              <PayOption on={f.payment === "bkash"} onPick={() => setF((x) => ({ ...x, payment: "bkash" }))} icon={<Smartphone size={18} aria-hidden />} title="bKash" sub="Pay on bKash's own page" />
            </div>
            <p className="mt-3 flex gap-2 rounded-xl bg-surface-2 px-3 py-2.5 text-[13.5px] leading-relaxed text-ink-2">
              <Info size={16} className="mt-0.5 shrink-0 text-brand" aria-hidden />
              {f.payment === "cod"
                ? "Next, we would text you a 4-digit code to confirm the order. Nothing is charged until the rider hands it over."
                : "You would be sent to bKash's own page to pay, and come back here after. This shop would never ask for your PIN or a code. In this preview no payment page opens and nothing is charged."}
            </p>
          </fieldset>

          <button type="submit" className="btn-primary h-12 w-full text-[16px]">
            {f.payment === "cod" ? "Continue (simulated)" : "Place order (simulated)"}
            <ArrowRight size={17} aria-hidden />
          </button>
        </form>
        {summary}
      </div>
    </div>
  );
}

const aria = (k: string, err: string | false | undefined) => ({ "aria-invalid": !!err, "aria-describedby": err ? `e-${k}` : undefined });

function Field({ id, label, hint, err, children }: { id: string; label: string; hint?: string; err?: string; children: ReactNode }) {
  return (
    <div>
      <label htmlFor={`f-${id}`} className="mb-1.5 flex items-baseline justify-between gap-2 text-[13px] font-medium text-ink-2">
        {label}
        {hint && <span className="text-[12px] font-normal text-faint">{hint}</span>}
      </label>
      {children}
      {err && <p id={`e-${id}`} className="mt-1.5 text-[13px] font-medium text-signal">{err}</p>}
    </div>
  );
}

function PayOption({ on, onPick, icon, title, sub }: { on: boolean; onPick: () => void; icon: ReactNode; title: string; sub: string }) {
  return (
    <label className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition-colors ${on ? "border-brand bg-brand-soft" : "border-line hover:border-line-strong"}`}>
      <input type="radio" name="payment" checked={on} onChange={onPick} className="accent-[var(--brand)]" />
      <span className={on ? "text-brand" : "text-muted"}>{icon}</span>
      <span>
        <span className="block text-[14.5px] font-semibold text-ink">{title}</span>
        <span className="block text-[12.5px] text-muted">{sub}</span>
      </span>
    </label>
  );
}

function Confirmation({ o }: { o: Order }) {
  return (
    <div className="container-x pt-8">
      <div className="mx-auto max-w-xl">
        <div className="rounded-3xl border border-line bg-surface p-5 text-center sm:p-8">
          <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-good-soft text-good">
            <CircleCheck size={30} aria-hidden />
          </span>
          <h1 className="mt-4 text-[26px] font-semibold tracking-[-0.02em] text-ink">Order placed (simulated)</h1>
          <p className="mt-1 text-[15px] text-muted">
            Order <span className="font-semibold text-ink tnum">{o.no}</span> · {o.payment === "cod" ? "Cash on delivery" : "bKash"}
          </p>
          <p className="mt-3 inline-block rounded-xl bg-surface-2 px-3 py-2 text-[14px] text-ink-2">
            Would arrive <span className="font-semibold text-ink">{eta(o)}</span>
          </p>
          <ul className="mt-5 space-y-2 border-y border-line py-4 text-left text-[14px]">
            {o.lines.map((l, i) => (
              <li key={i} className="flex justify-between gap-3">
                <span className="text-ink-2">
                  {l.qty} x {l.name}
                  {l.size && <span className="text-faint"> · {l.size}</span>}
                </span>
                <span className="shrink-0 font-medium text-ink tnum">{formatBDT(l.price * l.qty)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-4 text-left">
            <TotalsList subtotal={o.subtotal} delivery={o.delivery} note={o.zone === "dhaka" ? "inside Dhaka" : "outside Dhaka"} />
          </div>
          <p className="mt-5 rounded-xl bg-accent-soft px-4 py-3 text-[14.5px] font-semibold text-ink">
            Nothing was ordered, charged or sent. Your details were never saved or sent anywhere.
          </p>
          <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-center">
            <Link href={`${SHOP}orders/`} className="btn-secondary">See simulated orders</Link>
            <Link href={SHOP} className="btn-primary">Back to the shop</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
