"use client";

import Link from "@/components/LangLink";
import { WithSearchParams } from "@/components/ui";
import { useEffect, useId, useMemo, useState } from "react";
import { Info } from "lucide-react";
import { BIKES, formatBDT, formatLakh, fullName, getBike } from "@/lib/bikes";
import { DEFAULT_COST_INPUT, EV_BATTERY, FUEL, OVERHAUL_YEARS, OWNERSHIP_YEARS, WEAR_KM, defaultUsedPrice, ownershipCost, registrationFor, type CostBreakdown, type CostInput } from "@/lib/cost";
import { DEFAULT_FEE_PCT, PAY_TERMS, cardEmi, payPaths, type PathKey } from "@/lib/fund";
import { FuelAgeNote } from "@/components/Dated";
import guide from "@/data/guide.json";
import { useLang, useTx, type Lang } from "@/lib/i18n";
import { BikeArt } from "@/components/BikeArt";
import { BikePicker, Field, Range, Switch } from "@/components/form";
import type { BikeLite } from "@/lib/types";

export function CostView() {
  return <WithSearchParams render={(params) => <Cost params={params} />} />;
}

const SEGMENTS = [
  { k: "fuel", en: "Fuel or electricity", bn: "তেল বা বিদ্যুৎ", color: "var(--brand)" },
  { k: "service", en: "Servicing", bn: "সার্ভিসিং", color: "#4f8fd6" },
  { k: "wear", en: "Wear parts", bn: "ক্ষয়যোগ্য পার্টস", color: "#d99a2b" },
  { k: "overhaul", en: "Major overhaul (estimate)", bn: "বড় ওভারহল (আনুমানিক)", color: "#a0522d" },
  { k: "evBattery", en: "EV battery replacement (estimate)", bn: "EV ব্যাটারি বদল (আনুমানিক)", color: "#3a7a8a" },
  { k: "upkeep", en: "Washing & parking", bn: "ধোয়া ও পার্কিং", color: "#c46f9e" },
  { k: "hiddenRepairs", en: "Hidden used-bike repairs", bn: "পুরনো বাইকের লুকানো মেরামত", color: "#7a8a3a" },
  { k: "paperwork", en: "BRTA paperwork", bn: "BRTA কাগজপত্র", color: "#8b6fd1" },
  { k: "insurance", en: "Insurance", bn: "ইন্স্যুরেন্স", color: "#2bb3a8" },
  { k: "depreciation", en: "Resale loss", bn: "রিসেল লস", color: "var(--signal)" },
] as const;

function Cost({ params }: { params: URLSearchParams }) {
  const { lang } = useLang();
  const tx = useTx();
  const [bike, setBike] = useState<BikeLite>(() => getBike("bajaj-pulsar-n160") ?? BIKES[0]);
  const [inp, setInp] = useState<CostInput>(DEFAULT_COST_INPUT);
  // Price typed in for the selected used bike; null = typical market price. Not shared with the comparison list.
  const [paid, setPaid] = useState<number | null>(null);

  useEffect(() => {
    const b = getBike(params.get("bike") || "");
    if (b) setBike(b);
    if (params.get("used") === "1") setInp((x) => ({ ...x, used: true }));
  }, [params]);

  const c = useMemo(() => ownershipCost(bike, { ...inp, usedPrice: paid ?? undefined }), [bike, inp, paid]);
  const usedOnly = bike.status === "used-only";
  const set = <K extends keyof CostInput>(k: K, v: CostInput[K]) => setInp((x) => ({ ...x, [k]: v }));
  const months = inp.years * 12;
  const repairPct = Math.round(c.detail.hiddenRepairRate * 100);
  const belowPct = Math.round(c.detail.belowRef * 100);
  const cheap = c.detail.cheap;
  const checkSlug = usedCheckSlug(bike);
  const how = explain(c, bike, inp, tx, lang);

  const others = useMemo(
    () =>
      BIKES.filter((b) => b.id !== bike.id && b.status === "on-sale" && b.category === bike.category)
        .map((b) => ({ b, c: ownershipCost(b, inp) }))
        .sort((x, y) => x.c.perMonth - y.c.perMonth)
        .slice(0, 4),
    [bike, inp],
  );

  const syncUrl = (b: BikeLite, used: boolean) => window.history.replaceState(null, "", `?bike=${b.id}${used ? "&used=1" : ""}`);
  const pick = (b: BikeLite) => {
    setBike(b);
    setPaid(null);
    syncUrl(b, inp.used);
  };
  const setUsed = (used: boolean) => {
    set("used", used);
    syncUrl(bike, used);
  };

  return (
    <div className="container-x pt-10">
      <h1 className="text-[32px] font-semibold tracking-[-0.03em] text-ink sm:text-[40px]">{tx("What will it really cost?", "আসলে কত খরচ হবে?")}</h1>
      <p className="mt-1.5 max-w-2xl text-[15.5px] text-muted">
        {tx(
          "The sticker price is just the start. Fuel, servicing, chains and tyres, BRTA paperwork and what you lose at resale — all in one honest monthly number.",
          "শোরুমের দাম শুধু শুরু। তেল, সার্ভিস, চেইন-টায়ার, BRTA কাগজপত্র আর বিক্রির সময় যা হারাবেন — সব মিলিয়ে একটা সৎ মাসিক সংখ্যা।",
        )}
      </p>

      <div className="mt-10 grid grid-cols-[minmax(0,1fr)] gap-8 lg:grid-cols-[380px_minmax(0,1fr)]">
        {/* inputs */}
        <div className="card h-fit space-y-7 p-6 lg:sticky lg:top-24">
          <BikePicker bike={bike} onPick={pick} />

          {!usedOnly && (
            <Field label={tx("Buying", "কিনছেন")}>
              <div className="grid grid-cols-2 gap-1 rounded-xl bg-surface-2 p-1">
                {([false, true] as const).map((u) => (
                  <button
                    key={String(u)}
                    onClick={() => setUsed(u)}
                    aria-pressed={inp.used === u}
                    className={`h-9 rounded-lg text-[13.5px] font-medium transition-all ${inp.used === u ? "bg-surface text-ink shadow-sm" : "text-muted hover:text-ink"}`}
                  >
                    {u ? tx("Used", "পুরনো") : tx("New", "নতুন")}
                  </button>
                ))}
              </div>
            </Field>
          )}

          {c.buyingUsed && (
            <Field label={tx("Price you're paying", "যে দামে কিনছেন")}>
              <input
                type="number"
                inputMode="numeric"
                min={0}
                step={1000}
                className="input h-11 tnum"
                value={paid ?? defaultUsedPrice(bike)}
                aria-label={tx("Used bike price in taka", "পুরনো বাইকের দাম (টাকা)")}
                onChange={(e) => setPaid(e.target.value === "" ? 0 : Math.max(0, Number(e.target.value)))}
              />
              <p className="mt-1 text-[12px] text-faint">
                {paid === null
                  ? usedOnly
                    ? tx("Typical price for a decent one.", "ভালো অবস্থার একটার সাধারণ দাম।")
                    : tx("Typical asking price for a ~3-year-old one. Type what the seller wants.", "~৩ বছরের পুরনো একটার সাধারণ চাওয়া দাম। বিক্রেতা যা চাইছেন সেটা লিখুন।")
                  : (
                    <button className="font-medium text-brand underline underline-offset-2" onClick={() => setPaid(null)}>
                      {tx("Reset to typical price", "সাধারণ দামে ফেরত যান")}
                    </button>
                  )}
              </p>
              <p className="mt-2 rounded-lg bg-surface-2 px-3 py-2 text-[12.5px] leading-snug text-ink-2">
                {tx(
                  `+${repairPct}% (${formatBDT(c.hiddenRepairs, lang)}) set aside for problems a used bike hides until later. ${cheap ? `${repairPct}% because the price is ${belowPct}% under the typical ${formatBDT(c.detail.refUsedPrice, lang)} (estimate).` : bike.engine.cooling === "air" ? "5% because a simple air-cooled engine is cheap to put right." : "10% because an air- and oil-cooled or liquid-cooled engine costs more to fix."}`,
                  `পুরনো বাইকের যে সমস্যাগুলো পরে বের হয় তার জন্য +${repairPct}% (${formatBDT(c.hiddenRepairs, lang)}) আলাদা রাখা হয়েছে। ${cheap ? `দাম সাধারণ ${formatBDT(c.detail.refUsedPrice, lang)}-এর চেয়ে ${belowPct}% কম, তাই ${repairPct}% (আনুমানিক)।` : bike.engine.cooling === "air" ? "সাধারণ এয়ার-কুলড ইঞ্জিন ঠিক করতে খরচ কম, তাই ৫%।" : "এয়ার ও অয়েল-কুলড বা লিকুইড-কুলড ইঞ্জিন সারাতে খরচ বেশি, তাই ১০%।"}`,
                )}
              </p>
              {cheap && (
                <div role="alert" className="mt-2 rounded-lg bg-warn-soft px-3 py-2 text-[12.5px] leading-snug text-warn">
                  <p className="font-semibold">{tx("This is not a normal price for this bike", "এই বাইকের জন্য এটা স্বাভাবিক দাম নয়")}</p>
                  <p className="mt-0.5">
                    {tx(
                      `It is ${belowPct}% below the typical ${formatBDT(c.detail.refUsedPrice, lang)}. A bike this cheap often hides accident damage, a worn engine or paper trouble. Check it thoroughly, with a mechanic, before you pay.`,
                      `সাধারণ ${formatBDT(c.detail.refUsedPrice, lang)}-এর চেয়ে ${belowPct}% কম। এত সস্তা বাইকে প্রায়ই দুর্ঘটনার ক্ষতি, ক্ষয়ে যাওয়া ইঞ্জিন বা কাগজের ঝামেলা লুকানো থাকে। টাকা দেওয়ার আগে মেকানিক নিয়ে ভালো করে দেখে নিন।`,
                    )}
                    {checkSlug && (
                      <>
                        {" "}
                        <Link href={`/maintenance/${checkSlug}/`} className="font-medium underline underline-offset-2">
                          {tx("How to check a used bike like this", "এ ধরনের পুরনো বাইক কীভাবে যাচাই করবেন")}
                        </Link>
                      </>
                    )}
                  </p>
                </div>
              )}
            </Field>
          )}

          <Field label={tx("Riding per day", "দিনে কতটা চালাবেন")} value={`${inp.kmPerDay} km`}>
            <Range min={5} max={150} step={5} value={inp.kmPerDay} onChange={(v) => set("kmPerDay", v)} label={tx("Kilometres per day", "দিনে কত কিলোমিটার")} />
            <p className="mt-1 text-[12px] text-faint">
              {tx(`≈ ${(inp.kmPerDay * 30).toLocaleString("en-IN")} km a month. Pathao riders often do 100+.`, `মাসে ≈ ${(inp.kmPerDay * 30).toLocaleString("en-IN")} km। পাঠাও রাইডাররা প্রায়ই দিনে ১০০+ চালান।`)}
            </p>
          </Field>

          <Field label={tx("How long you'll keep it", "কতদিন রাখবেন")}>
            <div className="grid grid-cols-6 gap-1 rounded-xl bg-surface-2 p-1">
              {OWNERSHIP_YEARS.map((y) => (
                <button
                  key={y}
                  onClick={() => set("years", y)}
                  aria-pressed={inp.years === y}
                  className={`h-9 rounded-lg text-[14px] font-medium transition-all ${inp.years === y ? "bg-surface text-ink shadow-sm" : "text-muted hover:text-ink"}`}
                >
                  {y} {tx("yr", "বছর")}
                </button>
              ))}
            </div>
            {inp.years >= OVERHAUL_YEARS && (
              <p className="mt-1 text-[12px] text-faint">
                {tx(
                  "10 years = keeping it for life. Costs cover 10 years and add an estimated major overhaul.",
                  "১০ বছর = আজীবন রাখা। খরচ ১০ বছরের, সাথে একটা বড় ওভারহলের আনুমানিক খরচ।",
                )}
              </p>
            )}
          </Field>

          <Field label={tx("Octane price", "অকটেনের দাম")} value={`${formatBDT(inp.fuelPrice, lang)}/L`}>
            <Range min={120} max={220} step={1} value={inp.fuelPrice} onChange={(v) => set("fuelPrice", v)} label={tx("Fuel price", "তেলের দাম")} />
            <p className="mt-1 text-[12px] text-faint">
              {tx(`Govt price is ৳${FUEL.octane}/L (${FUEL.asOf}).`, `সরকারি দাম ${formatBDT(FUEL.octane, "bn")}/লিটার (${FUEL.asOf})।`)}{" "}
              {tx("In January 2026 it was ৳122/L: up 35% by September", "জানুয়ারি ২০২৬-এ ছিল ৳১২২/লিটার: সেপ্টেম্বরের মধ্যে ৩৫% বেশি")}{" "}
              (<a href="https://www.unb.com.bd/category/Bangladesh/fuel-prices-rise-up-to-nearly-36-between-january-and-september-2026/195927" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">UNB, 21 Sep 2026</a>).{" "}
              {inp.fuelPrice !== FUEL.octane && (
                <button className="font-medium text-brand underline underline-offset-2" onClick={() => set("fuelPrice", FUEL.octane)}>
                  {tx("Reset", "রিসেট")}
                </button>
              )}
            </p>
            <FuelAgeNote className="mt-2" />
          </Field>

          <Field label={tx("Washing, parking & small fixes", "ধোয়া, পার্কিং ও ছোটখাটো খরচ")} value={`${formatBDT(inp.upkeepPerMonth, lang)}${tx("/mo", "/মাস")}`}>
            <Range min={0} max={5000} step={100} value={inp.upkeepPerMonth} onChange={(v) => set("upkeepPerMonth", v)} label={tx("Washing and parking per month", "মাসে ধোয়া ও পার্কিং")} />
            <p className="mt-1 text-[12px] text-faint">
              {tx("Paid garage parking in Dhaka is often ৳1,500–3,000 a month.", "ঢাকায় গ্যারেজ পার্কিং প্রায়ই মাসে ৳১,৫০০–৩,০০০।")}
            </p>
          </Field>

          {!c.buyingUsed && (
            <Field label={tx("Road tax", "রোড ট্যাক্স")}>
              <div className="grid grid-cols-2 gap-1 rounded-xl bg-surface-2 p-1">
                {(["10yr", "2yr"] as const).map((p) => (
                  <button
                    key={p}
                    onClick={() => set("taxPlan", p)}
                    aria-pressed={inp.taxPlan === p}
                    className={`h-9 rounded-lg text-[13.5px] font-medium transition-all ${inp.taxPlan === p ? "bg-surface text-ink shadow-sm" : "text-muted hover:text-ink"}`}
                  >
                    {p === "10yr" ? tx("10 years upfront", "১০ বছর একবারে") : tx("Every 2 years", "প্রতি ২ বছরে")}
                  </button>
                ))}
              </div>
            </Field>
          )}

          <div className="space-y-1">
            <Switch
              on={inp.insurance}
              onChange={(v) => set("insurance", v)}
              label={tx("Third-party insurance", "থার্ড-পার্টি ইন্স্যুরেন্স")}
              sub={tx(
                `On by default · ~৳1,006/yr · not compulsory as of ${INSURANCE_AS_OF}, but a rule to make it compulsory again is pending`,
                `ডিফল্টে চালু · বছরে ~৳১,০০৬ · ${INSURANCE_AS_OF} পর্যন্ত বাধ্যতামূলক নয়, তবে আবার বাধ্যতামূলক করার নিয়ম আসছে`,
              )}
            />
            <Switch
              on={inp.includeDepreciation}
              onChange={(v) => set("includeDepreciation", v)}
              label={tx("Count resale loss", "রিসেল লস ধরুন")}
              sub={tx("What the bike loses in value", "বাইকের দাম যতটা কমে")}
            />
          </div>
        </div>

        {/* output */}
        <div className="min-w-0 space-y-6">
          <div className="card overflow-hidden">
            <div className="grid gap-6 p-6 sm:grid-cols-[1fr_auto] sm:p-8">
              <div>
                <p className="text-[14px] text-muted">
                  {fullName(bike)} · {inp.years} {tx(inp.years === 1 ? "year" : "years", "বছর")} · {c.km.toLocaleString("en-IN")} km
                </p>
                <div className="mt-2 flex flex-wrap items-end gap-x-10 gap-y-5">
                  <div>
                    <p className="text-[48px] font-semibold leading-none tracking-[-0.03em] text-ink tnum sm:text-[60px]">{formatBDT(c.pocketPerMonth, lang)}</p>
                    <p className="mt-2 text-[15px] text-muted">{tx("from your pocket each month", "প্রতি মাসে পকেট থেকে যাবে")}</p>
                  </div>
                  {inp.includeDepreciation && (
                    <div>
                      <p className="text-[30px] font-semibold leading-none tracking-[-0.02em] text-ink-2 tnum sm:text-[36px]">{formatBDT(c.perMonth, lang)}</p>
                      <p className="mt-2 text-[15px] text-muted">{tx("true cost, with resale loss", "আসল খরচ, রিসেল লস সহ")}</p>
                    </div>
                  )}
                </div>
                <p className="mt-3 max-w-md text-[12.5px] leading-snug text-faint">
                  {tx(
                    `Pocket money = fuel, servicing, wear parts, washing/parking, ${c.buyingUsed ? "hidden used-bike repairs" : "BRTA papers"} and insurance. It leaves out only the value the bike loses, which you never pay in cash.`,
                    `পকেট খরচ = তেল, সার্ভিসিং, ক্ষয়যোগ্য পার্টস, ধোয়া/পার্কিং, ${c.buyingUsed ? "পুরনো বাইকের লুকানো মেরামত" : "BRTA কাগজ"} ও ইন্স্যুরেন্স। শুধু বাইকের দাম কমে যাওয়াটা বাদ, যেটা নগদে দিতে হয় না।`,
                  )}
                </p>
              </div>
              <div className="grid grid-cols-3 gap-6 sm:grid-cols-1 sm:gap-4 sm:text-right">
                <Kpi k={tx("Total", "মোট")} v={formatLakh(c.total, lang)} />
                <Kpi k={tx("Per km", "প্রতি km")} v={`৳${c.perKm.toFixed(2)}`} />
                <Kpi k={tx("Running only / mo", "শুধু চলার খরচ / মাস")} v={formatBDT(c.runningPerMonth, lang)} />
              </div>
            </div>

            {/* stacked bar */}
            <div className="px-6 pb-6 sm:px-8 sm:pb-8">
              <div className="flex h-4 overflow-hidden rounded-full bg-surface-3" role="img" aria-label={tx("Cost breakdown", "খরচের ভাগ")}>
                {SEGMENTS.map((s) => {
                  const v = c[s.k];
                  if (!v) return null;
                  return <div key={s.k} title={`${tx(s.en, s.bn)}: ${formatBDT(v, lang)}`} style={{ width: `${(v / c.total) * 100}%`, background: s.color }} className="h-full transition-all duration-500" />;
                })}
              </div>
              <div className="mt-6 grid gap-x-8 gap-y-3 sm:grid-cols-2">
                {SEGMENTS.map((s) => {
                  const v = c[s.k];
                  if ((s.k === "overhaul" || s.k === "evBattery") && !v) return null;
                  const note = how[s.k as keyof typeof how];
                  return (
                    <div key={s.k} className={`flex items-center justify-between gap-3 text-[14.5px]`}>
                      <span className="flex items-center gap-2.5 text-ink-2">
                        <span className="h-2.5 w-2.5 rounded-full" style={{ background: s.color }} />
                        {tx(s.en, s.bn)}
                        {note && <HowPopover label={tx(`How ${s.en.toLowerCase()} is worked out`, `${s.bn} কীভাবে হিসাব করা`)} text={note} />}
                      </span>
                      <span className="font-medium text-ink tnum">
                        {formatBDT(v, lang)}{" "}
                        <span className="text-[12.5px] font-normal text-faint">
                          · {formatBDT(v / months, lang)}
                          {tx("/mo", "/মাস")}
                        </span>
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <Fact
              k={c.buyingUsed ? tx("Buy today", "আজ কিনলে") : inp.taxPlan === "2yr" ? tx("On-road, with 2-year tax token", "অন-রোড, ২ বছরের ট্যাক্স টোকেনসহ") : tx("On-road, with 10-year tax token", "অন-রোড, ১০ বছরের ট্যাক্স টোকেনসহ")}
              v={formatBDT(c.onRoad, lang)}
              sub={!c.buyingUsed ? tx(`ex-showroom ${formatBDT(bike.priceBDT, lang)} + ${formatBDT(c.onRoad - bike.priceBDT, lang)} BRTA`, `শোরুম মূল্য ${formatBDT(bike.priceBDT, lang)} + ${formatBDT(c.onRoad - bike.priceBDT, lang)} BRTA`) : tx("used price, plus transfer fee", "পুরনো দাম, সাথে মালিকানা বদলের ফি")}
            />
            <Fact
              k={tx("Or on 12-month EMI", "অথবা ১২ মাসের কিস্তিতে")}
              v={!c.buyingUsed ? `${formatBDT(cardEmi(bike.priceBDT), lang)}${tx("/mo", "/মাস")}` : "—"}
              sub={c.buyingUsed ? tx("No card EMI on a private sale", "ব্যক্তিগত বিক্রিতে কার্ড কিস্তি নেই") : tx("0% card EMI where offered, plus BRTA upfront", "যেখানে ০% কার্ড কিস্তি আছে; BRTA খরচ শুরুতেই")}
            />
            <Fact k={tx(`Worth after ${inp.years} yr`, `${inp.years} বছর পর দাম`)} v={formatBDT(c.resaleValue, lang)} sub={tx("estimated, decent condition", "আনুমানিক, ভালো অবস্থায়")} />
          </div>

          <PayCompare price={c.buyingUsed ? c.onRoad : bike.priceBDT} brta={c.buyingUsed ? 0 : c.onRoad - bike.priceBDT} used={c.buyingUsed} />

          {others.length > 0 && (
            <div className="card p-6">
              <h2 className="text-[17px] font-semibold tracking-tight text-ink">{c.buyingUsed && !usedOnly ? tx("Same style, also bought used, on the same terms", "একই ধরনের বাইক, পুরনো কিনলে, একই হিসাবে") : tx("Same style, compared on the same terms", "একই ধরনের বাইক, একই হিসাবে")}</h2>
              <div className="mt-4 divide-y divide-line">
                {others.map(({ b, c: cc }) => {
                  const diff = cc.perMonth - c.perMonth;
                  return (
                    <button key={b.id} onClick={() => pick(b)} className="flex w-full items-center gap-4 py-3 text-left transition-colors hover:bg-surface-2/50">
                      {/* hidden on phones so the bike name is not cut to one letter */}
                      <span className="hidden h-10 w-16 shrink-0 sm:block">
                        <BikeArt bike={b} shadow={false} className="h-full w-full" />
                      </span>
                      <span className="min-w-0 flex-1 truncate text-[14.5px] font-medium text-ink">{fullName(b)}</span>
                      <span className="text-[14.5px] font-semibold text-ink tnum">
                        {formatBDT(cc.perMonth, lang)}
                        {tx("/mo", "/মাস")}
                      </span>
                      <span className={`w-20 text-right text-[13px] font-medium tnum sm:w-24 ${diff < 0 ? "text-good" : "text-signal"}`}>
                        {diff < 0 ? "−" : "+"}
                        {formatBDT(Math.abs(diff), lang)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <p className="flex gap-2 text-[12.5px] leading-relaxed text-faint">
            <Info size={14} className="mt-0.5 shrink-0" />
            <span>
              {tx(
                `${bike.ev ? "Electricity uses the middle of the real range per charge, at the BERC home tariff plus 15% charging loss (estimate); EVs skip the chain, clutch, air filter, spark plug and 12 V battery items below." : "Fuel uses the middle of the real-world mileage range."} Servicing (oil, oil filter, labour) every ${bike.serviceIntervalKm.toLocaleString("en-IN")} km and at least twice a year. Wear parts are counted as they wear, on the short side of owner reports: front pads every ${WEAR_KM.frontPads.toLocaleString("en-IN")} km, rear every ${WEAR_KM.rearPads.toLocaleString("en-IN")} km, chain set every ${WEAR_KM.chain.toLocaleString("en-IN")} km plus lube, tyres every ${WEAR_KM.tyres.toLocaleString("en-IN")} km, air filter and spark plug, clutch every ${WEAR_KM.clutch.toLocaleString("en-IN")} km, battery every 2 years. Prices are estimates, rounded up.${c.buyingUsed ? ` Used: ${repairPct}% of the price paid is added for hidden problems, spread over the months you own it.` : ""} Resale uses our resale score (≈ ${Math.round((1 - (0.8 + bike.scores.resale * 0.012)) * 100)}% value lost per year for this bike). Registration: ${registrationFor(bike.engine.cc).label}, from BRTA fee schedules.`,
                `${bike.ev ? "বিদ্যুতের হিসাব প্রতি চার্জে আসল রেঞ্জের মাঝামাঝি ধরে, BERC-এর বাসার রেট আর ১৫% চার্জিং লস (অনুমান) যোগ করে; নিচের চেইন, ক্লাচ, এয়ার ফিল্টার, স্পার্ক প্লাগ ও ১২ V ব্যাটারি EV-তে ধরা হয় না।" : "তেলের হিসাব আসল মাইলেজের মাঝামাঝি ধরে।"} সার্ভিসিং (মবিল, অয়েল ফিল্টার, মজুরি) প্রতি ${bike.serviceIntervalKm.toLocaleString("en-IN")} km-এ, বছরে অন্তত দুবার। ক্ষয়যোগ্য পার্টস যতটা ক্ষয় হয় ততটা ধরা, ওনারদের অভিজ্ঞতার কম দিকটা নিয়ে: সামনের প্যাড ${WEAR_KM.frontPads.toLocaleString("en-IN")} km, পেছনের ${WEAR_KM.rearPads.toLocaleString("en-IN")} km, চেইন সেট ${WEAR_KM.chain.toLocaleString("en-IN")} km আর লুব, টায়ার ${WEAR_KM.tyres.toLocaleString("en-IN")} km, এয়ার ফিল্টার ও স্পার্ক প্লাগ, ক্লাচ ${WEAR_KM.clutch.toLocaleString("en-IN")} km, ব্যাটারি ২ বছরে। দাম আনুমানিক, উপরের দিকে ধরা।${c.buyingUsed ? ` পুরনো বাইক: লুকানো সমস্যার জন্য কেনা দামের ${repairPct}% যোগ করা, মালিকানার মাসগুলোতে ভাগ করে।` : ""} রিসেল আমাদের রিসেল স্কোর থেকে (এই বাইকে বছরে ≈ ${Math.round((1 - (0.8 + bike.scores.resale * 0.012)) * 100)}% দাম কমে)। রেজিস্ট্রেশন: BRTA ফি তালিকা থেকে।`,
              )}{" "}
              <Link href="/guide/#registration" className="text-brand underline underline-offset-2">
                {tx("Breakdown", "বিস্তারিত")}
              </Link>
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}

const INSURANCE_AS_OF = guide.insurance.asOf;

/** Cash vs 0% card EMI vs loan for the same bike (example PAY_TERMS from fund.ts; the fee is set by the user). A private (used) sale is cash only. */
function PayCompare({ price, brta, used }: { price: number; brta: number; used: boolean }) {
  const tx = useTx();
  const { lang } = useLang();
  const [feePct, setFeePct] = useState(DEFAULT_FEE_PCT);
  const p = payPaths({ price, brta, feePct, ...PAY_TERMS });
  const rows: { key: PathKey; label: string }[] = [
    { key: "cash", label: tx("Cash", "নগদ") },
    ...(used
      ? []
      : [
          { key: "card" as const, label: tx(`0% card EMI, ${PAY_TERMS.cardMonths} mo`, `০% কার্ড কিস্তি, ${PAY_TERMS.cardMonths} মাস`) },
          { key: "loan" as const, label: tx(`Loan, ${PAY_TERMS.loanPct}% for ${PAY_TERMS.loanMonths} mo`, `লোন, ${PAY_TERMS.loanPct}% সুদে ${PAY_TERMS.loanMonths} মাস`) },
        ]),
  ];
  return (
    <div id="pay" className="card scroll-mt-24 p-6">
      <h2 className="text-[17px] font-semibold tracking-tight text-ink">{tx("Cash, card EMI or loan", "নগদ, কার্ড কিস্তি না লোন")}</h2>
      {!used && (
        <div className="mt-4 max-w-sm">
          <Field label={tx("Processing fee (card EMI or loan)", "প্রসেসিং ফি (কার্ড কিস্তি বা লোন)")} value={`${feePct}%`}>
            <Range min={0} max={3} step={0.5} value={feePct} onChange={setFeePct} label={tx("Processing fee, percent of the amount financed", "প্রসেসিং ফি, কিস্তির টাকার শতাংশ")} />
            <p className="mt-1 text-[12px] text-faint">{tx("Usually 1–3% of the amount financed (estimate). Ask your bank.", "সাধারণত কিস্তির টাকার ১–৩% (আনুমানিক)। আপনার ব্যাংকে জিজ্ঞেস করুন।")}</p>
          </Field>
        </div>
      )}
      <div className="mt-4 overflow-x-auto" tabIndex={0} role="region" aria-label={tx("Payment options table", "পেমেন্টের বিকল্পের টেবিল")}>
        <table className="w-full min-w-[420px] text-left text-[14px] tnum [&_tr>*:not(:last-child)]:pr-3">
          <thead className="text-[12.5px] text-muted">
            <tr>
              <th className="py-2 font-medium" scope="col">{tx("Way to pay", "কীভাবে")}</th>
              <th className="py-2 font-medium" scope="col">{tx("Cash first", "শুরুতে নগদ")}</th>
              <th className="py-2 font-medium" scope="col">{tx("Then", "তারপর")}</th>
              <th className="py-2 text-right font-medium" scope="col">{tx("Total paid", "মোট")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {rows.map(({ key, label }) => (
              <tr key={key}>
                <th className="py-2.5 font-medium text-ink" scope="row">{label}</th>
                <td className="py-2.5 text-ink-2">{formatBDT(p[key].upfront, lang)}</td>
                <td className="py-2.5 text-ink-2">{p[key].emi > 0 ? `${formatBDT(p[key].emi, lang)}${tx("/mo", "/মাস")} × ${p[key].emiMonths}` : "—"}</td>
                <td className="py-2.5 text-right font-semibold text-ink">
                  {formatBDT(p[key].total, lang)}
                  {p[key].extra > 0 && <span className="block text-[12px] font-normal text-signal">+{formatBDT(p[key].extra, lang)} {tx("interest/fees", "সুদ/ফি")}</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-3 rounded-lg bg-warn-soft px-3 py-2 text-[12.5px] leading-relaxed text-warn">
        {used
          ? tx("A private used sale is paid in cash: there is no card EMI or bike loan.", "ব্যক্তিগতভাবে পুরনো বাইক কিনলে নগদে দিতে হয়: কার্ড কিস্তি বা বাইক লোন নেই।")
          : tx(
              "0% EMI is only with the banks a showroom lists. Some showrooms charge more if you pay by card than in cash, so ask the cash price first.",
              "০% কিস্তি শুধু শোরুমের তালিকাভুক্ত ব্যাংকের কার্ডে। কিছু শোরুম কার্ডে নগদের চেয়ে বেশি দাম নেয়, তাই আগে নগদ দাম জিজ্ঞেস করুন।",
            )}
      </p>
      {!used && (
        <p className="mt-3 text-[12.5px] leading-relaxed text-faint">
          {tx(
            `Example terms: loan with ${PAY_TERMS.loanDownPct}% down, reducing balance. BRTA is paid in cash upfront whichever way you pay. Ask for the total payable in writing; this is not financial advice.`,
            `উদাহরণ: লোনে ${PAY_TERMS.loanDownPct}% ডাউন পেমেন্ট, ক্রমহ্রাসমান ব্যালান্সে সুদ। যেভাবেই কিনুন, BRTA খরচ শুরুতেই নগদে দিতে হয়। মোট কত দিতে হবে লিখিতভাবে চেয়ে নিন; এটি আর্থিক পরামর্শ নয়।`,
          )}{" "}
          <Link href="/guide/#emi" className="text-brand underline underline-offset-2">{tx("How EMI works", "কিস্তি কীভাবে কাজ করে")}</Link>
        </p>
      )}
    </div>
  );
}

/** Used-bike inspection post for this engine type (posts live in src/lib/maintenance-posts.ts); EVs have none. */
function usedCheckSlug(b: BikeLite) {
  const e = b.engine;
  if (e.fuel === "electric") return null;
  if (e.cooling === "liquid") return "used-check-liquid-cooled";
  if (e.fuel === "carb") return "used-check-carb";
  return e.cooling === "air" ? "used-check-air-cooled-fi" : "used-check-oil-cooled-fi";
}

type Tx = ReturnType<typeof useTx>;
const n = (x: number) => Math.round(x).toLocaleString("en-IN");

/** Plain-words formula behind each cost line, with the numbers the engine used. */
function explain(c: CostBreakdown, bike: BikeLite, inp: CostInput, tx: Tx, lang: Lang): Partial<Record<(typeof SEGMENTS)[number]["k"], string>> {
  const d = c.detail;
  const w = d.wear;
  const o = d.overhaul;
  return {
    service: tx(
      `${d.services.toFixed(1)} services × ${formatBDT(bike.avgServiceCostBDT, lang)} each (oil, filter, labour). One every ${n(bike.serviceIntervalKm)} km over ${n(c.km)} km, and at least 2 a year. Estimate.`,
      `${d.services.toFixed(1)}টি সার্ভিস × প্রতিটি ${formatBDT(bike.avgServiceCostBDT, lang)} (মবিল, ফিল্টার, মজুরি)। ${n(c.km)} km-এ প্রতি ${n(bike.serviceIntervalKm)} km-এ একটি, বছরে অন্তত ২টি। আনুমানিক।`,
    ),
    wear: tx(
      `Each part's price × (${n(c.km)} km ÷ its life), counted as it wears: brakes ${formatBDT(w.brakes, lang)}, chain set & lube ${formatBDT(w.chain, lang)}, tyres ${formatBDT(w.tyres, lang)}, clutch ${formatBDT(w.clutch, lang)}, air filter & spark plug ${formatBDT(w.filters, lang)}, battery every 2 years ${formatBDT(w.battery, lang)}. Estimate.`,
      `প্রতিটি পার্টসের দাম × (${n(c.km)} km ÷ তার আয়ু), যতটা ক্ষয় হয় ততটা: ব্রেক ${formatBDT(w.brakes, lang)}, চেইন সেট ও লুব ${formatBDT(w.chain, lang)}, টায়ার ${formatBDT(w.tyres, lang)}, ক্লাচ ${formatBDT(w.clutch, lang)}, এয়ার ফিল্টার ও স্পার্ক প্লাগ ${formatBDT(w.filters, lang)}, ২ বছরে ব্যাটারি ${formatBDT(w.battery, lang)}। আনুমানিক।`,
    ),
    overhaul: o
      ? tx(
          `One big repair over 10 years of ${inp.kmPerDay} km/day (${n(c.km)} km) with some highway trips, some misuse and missed services: engine top-end/rebuild ${formatBDT(o.engine, lang)}, extra clutch plates ${formatBDT(o.clutch, lang)}, suspension rebuild ${formatBDT(o.suspension, lang)}, possible frame straightening ${formatBDT(o.frame, lang)}, wiring ${formatBDT(o.wiring, lang)}. Scaled ×${o.partsFactor.toFixed(2)} for this bike's parts prices and ×${o.kmFactor.toFixed(2)} for distance vs 30 km/day. Estimate.`,
          `১০ বছরে দিনে ${inp.kmPerDay} km (${n(c.km)} km), মাঝে মাঝে হাইওয়ে ট্যুর, কিছু অযত্ন আর বাদ পড়া সার্ভিস ধরে একটা বড় মেরামত: ইঞ্জিন টপ-এন্ড/রিবিল্ড ${formatBDT(o.engine, lang)}, বাড়তি ক্লাচ প্লেট ${formatBDT(o.clutch, lang)}, সাসপেনশন রিবিল্ড ${formatBDT(o.suspension, lang)}, দরকার হলে ফ্রেম সোজা করা ${formatBDT(o.frame, lang)}, ওয়্যারিং ${formatBDT(o.wiring, lang)}। এই বাইকের পার্টসের দামে ×${o.partsFactor.toFixed(2)} আর দিনে ৩০ km-এর তুলনায় দূরত্বে ×${o.kmFactor.toFixed(2)}। আনুমানিক।`,
        )
      : undefined,
    evBattery: d.evBattery?.due
      ? tx(
          `One new traction battery at ${EV_BATTERY.shareOfPrice * 100}% × ${formatBDT(bike.priceBDT, lang)} new price = ${formatBDT(c.evBattery, lang)}, because ${inp.years} year${inp.years === 1 ? "" : "s"} runs past the ${d.evBattery.warrantyMonths}-month battery warranty${d.evBattery.assumed ? " (assumed; makers quote 3–5 years)" : ""}${c.buyingUsed ? ", counting a used bike as ~3 years old" : ""}. Estimate.`,
          `নতুন দাম ${formatBDT(bike.priceBDT, lang)}-এর ${EV_BATTERY.shareOfPrice * 100}% = ${formatBDT(c.evBattery, lang)}-এ একটি নতুন ব্যাটারি, কারণ ${inp.years} বছর ব্যাটারির ${d.evBattery.warrantyMonths} মাসের ওয়ারেন্টি${d.evBattery.assumed ? " (ধরে নেওয়া; কোম্পানিগুলো ৩–৫ বছর বলে)" : ""} পার হয়ে যায়${c.buyingUsed ? ", পুরনো বাইককে ~৩ বছরের ধরে" : ""}। আনুমানিক।`,
        )
      : undefined,
    hiddenRepairs: c.buyingUsed
      ? tx(
          `${Math.round(d.hiddenRepairRate * 100)}% × ${formatBDT(c.price, lang)} paid. 5% for air-cooled, 10% for oil/liquid-cooled; 20% if the price is 20–35% under the typical ${formatBDT(d.refUsedPrice, lang)}, 25% if more. Estimate.`,
          `${Math.round(d.hiddenRepairRate * 100)}% × দেওয়া দাম ${formatBDT(c.price, lang)}। এয়ার-কুলড ৫%, অয়েল/লিকুইড-কুলড ১০%; দাম সাধারণ ${formatBDT(d.refUsedPrice, lang)}-এর চেয়ে ২০–৩৫% কম হলে ২০%, আরও কম হলে ২৫%। আনুমানিক।`,
        )
      : undefined,
    paperwork: c.buyingUsed
      ? tx("Not counted for a used bike: no new registration. The ownership transfer fee is extra.", "পুরনো বাইকে ধরা হয়নি: নতুন রেজিস্ট্রেশন নেই। মালিকানা বদলের ফি আলাদা।")
      : inp.taxPlan === "10yr"
        ? tx(
            `BRTA registration with the 10-year tax token for ${d.reg.label}: ${formatBDT(d.reg.totalBDT10yr, lang)}. From BRTA fee schedules (${guide.registration.asOf}).`,
            `${d.reg.label}-এর ১০ বছরের ট্যাক্স টোকেনসহ BRTA রেজিস্ট্রেশন: ${formatBDT(d.reg.totalBDT10yr, lang)}। BRTA ফি তালিকা থেকে (${guide.registration.asOf})।`,
          )
        : tx(
            `BRTA registration with a 2-year tax token for ${d.reg.label}: ${formatBDT(d.reg.totalBDT, lang)}, plus ${d.renewals} road-tax renewal${d.renewals === 1 ? "" : "s"} × ${formatBDT(d.roadTax, lang)}. From BRTA fee schedules (${guide.registration.asOf}).`,
            `${d.reg.label}-এর ২ বছরের ট্যাক্স টোকেনসহ BRTA রেজিস্ট্রেশন: ${formatBDT(d.reg.totalBDT, lang)}, সাথে ${d.renewals} বার রোড ট্যাক্স নবায়ন × ${formatBDT(d.roadTax, lang)}। BRTA ফি তালিকা থেকে (${guide.registration.asOf})।`,
          ),
  };
}

/** Info button that shows how a line is worked out: on hover, keyboard focus, or tap (iOS does not focus buttons on tap). */
function HowPopover({ label, text }: { label: string; text: string }) {
  const [open, setOpen] = useState(false);
  const id = useId();
  return (
    <span className="group relative inline-flex">
      <button
        type="button"
        aria-label={label}
        aria-expanded={open}
        aria-describedby={id}
        onClick={() => setOpen((x) => !x)}
        onBlur={() => setOpen(false)}
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            setOpen(false);
            e.currentTarget.blur();
          }
        }}
        className="grid h-6 w-6 place-items-center rounded-full text-faint hover:text-ink focus-visible:text-ink"
      >
        <Info size={14} />
      </button>
      <span
        role="tooltip"
        id={id}
        className={`absolute left-0 top-full z-20 mt-1 w-[min(18rem,75vw)] rounded-lg border border-line bg-surface p-3 text-[12.5px] font-normal leading-snug text-ink-2 shadow-lg group-hover:block group-focus-within:block ${open ? "block" : "hidden"}`}
      >
        {text}
      </span>
    </span>
  );
}

function Kpi({ k, v }: { k: string; v: string }) {
  return (
    <div>
      <p className="text-[12.5px] text-muted">{k}</p>
      <p className="text-[18px] font-semibold tracking-tight text-ink tnum">{v}</p>
    </div>
  );
}

function Fact({ k, v, sub }: { k: string; v: string; sub: string }) {
  return (
    <div className="card p-5">
      <p className="text-[12.5px] text-muted">{k}</p>
      <p className="mt-1 text-[22px] font-semibold tracking-tight text-ink tnum">{v}</p>
      <p className="mt-0.5 text-[12.5px] text-faint">{sub}</p>
    </div>
  );
}
