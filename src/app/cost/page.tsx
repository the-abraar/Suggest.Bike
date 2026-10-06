"use client";

import Link from "next/link";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Info } from "lucide-react";
import { BIKES, formatBDT, formatLakh, fullName, getBike } from "@/lib/bikes";
import { DEFAULT_COST_INPUT, FUEL, WEAR_KM, defaultUsedPrice, emiMonthly, hiddenRepairRate, ownershipCost, registrationFor, type CostInput } from "@/lib/cost";
import { useLang, useTx } from "@/lib/i18n";
import { BikeArt } from "@/components/BikeArt";
import { searchBikes } from "@/components/SearchBox";
import type { BikeLite } from "@/lib/types";

export default function CostPage() {
  return (
    <Suspense>
      <Cost />
    </Suspense>
  );
}

const SEGMENTS = [
  { k: "fuel", en: "Fuel", bn: "তেল", color: "var(--brand)" },
  { k: "service", en: "Servicing", bn: "সার্ভিসিং", color: "#4f8fd6" },
  { k: "wear", en: "Wear parts", bn: "ক্ষয়যোগ্য পার্টস", color: "#d99a2b" },
  { k: "upkeep", en: "Washing & parking", bn: "ধোয়া ও পার্কিং", color: "#c46f9e" },
  { k: "hiddenRepairs", en: "Hidden used-bike repairs", bn: "পুরনো বাইকের লুকানো মেরামত", color: "#7a8a3a" },
  { k: "paperwork", en: "BRTA paperwork", bn: "BRTA কাগজপত্র", color: "#8b6fd1" },
  { k: "insurance", en: "Insurance", bn: "ইন্স্যুরেন্স", color: "#2bb3a8" },
  { k: "depreciation", en: "Resale loss", bn: "রিসেল লস", color: "var(--signal)" },
] as const;

function Cost() {
  const params = useSearchParams();
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
                    <button className="font-medium text-brand hover:underline" onClick={() => setPaid(null)}>
                      {tx("Reset to typical price", "সাধারণ দামে ফেরত যান")}
                    </button>
                  )}
              </p>
              <p className="mt-2 rounded-lg bg-surface-2 px-3 py-2 text-[12.5px] leading-snug text-ink-2">
                {tx(
                  `+${Math.round(hiddenRepairRate(bike) * 100)}% (${formatBDT(c.hiddenRepairs)}) set aside for problems a used bike hides until later. ${bike.engine.cooling === "air" ? "5% because a simple air-cooled engine is cheap to put right." : "10% because an oil- or liquid-cooled engine costs more to fix."}`,
                  `পুরনো বাইকের যে সমস্যাগুলো পরে বের হয় তার জন্য +${Math.round(hiddenRepairRate(bike) * 100)}% (${formatBDT(c.hiddenRepairs)}) আলাদা রাখা হয়েছে। ${bike.engine.cooling === "air" ? "সাধারণ এয়ার-কুলড ইঞ্জিন ঠিক করতে খরচ কম, তাই 5%।" : "অয়েল বা লিকুইড-কুলড ইঞ্জিন সারাতে খরচ বেশি, তাই 10%।"}`,
                )}
              </p>
            </Field>
          )}

          <Field label={tx("Riding per day", "দিনে কতটা চালাবেন")} value={`${inp.kmPerDay} km`}>
            <Range min={5} max={150} step={5} value={inp.kmPerDay} onChange={(v) => set("kmPerDay", v)} label={tx("Kilometres per day", "দিনে কত কিলোমিটার")} />
            <p className="mt-1 text-[12px] text-faint">
              {tx(`≈ ${(inp.kmPerDay * 30).toLocaleString("en-IN")} km a month. Pathao riders often do 100+.`, `মাসে ≈ ${(inp.kmPerDay * 30).toLocaleString("en-IN")} km। পাঠাও রাইডাররা প্রায়ই দিনে 100+ চালান।`)}
            </p>
          </Field>

          <Field label={tx("How long you'll keep it", "কতদিন রাখবেন")}>
            <div className="grid grid-cols-5 gap-1 rounded-xl bg-surface-2 p-1">
              {[1, 2, 3, 4, 5].map((y) => (
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
          </Field>

          <Field label={tx("Octane price", "অকটেনের দাম")} value={`৳${inp.fuelPrice}/L`}>
            <Range min={120} max={220} step={1} value={inp.fuelPrice} onChange={(v) => set("fuelPrice", v)} label={tx("Fuel price", "তেলের দাম")} />
            <p className="mt-1 text-[12px] text-faint">
              {tx(`Govt price is ৳${FUEL.octane}/L (${FUEL.asOf}).`, `সরকারি দাম ৳${FUEL.octane}/লিটার (${FUEL.asOf})।`)}{" "}
              {inp.fuelPrice !== FUEL.octane && (
                <button className="font-medium text-brand hover:underline" onClick={() => set("fuelPrice", FUEL.octane)}>
                  {tx("Reset", "রিসেট")}
                </button>
              )}
            </p>
          </Field>

          <Field label={tx("Washing, parking & small fixes", "ধোয়া, পার্কিং ও ছোটখাটো খরচ")} value={`${formatBDT(inp.upkeepPerMonth)}${tx("/mo", "/মাস")}`}>
            <Range min={0} max={5000} step={100} value={inp.upkeepPerMonth} onChange={(v) => set("upkeepPerMonth", v)} label={tx("Washing and parking per month", "মাসে ধোয়া ও পার্কিং")} />
            <p className="mt-1 text-[12px] text-faint">
              {tx("Paid garage parking in Dhaka is often ৳1,500–3,000 a month.", "ঢাকায় গ্যারেজ পার্কিং প্রায়ই মাসে ৳1,500–3,000।")}
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
              sub={tx("Optional in BD · ~৳1,006/yr", "বাংলাদেশে ঐচ্ছিক · বছরে ~৳1,006")}
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
                    <p className="text-[48px] font-semibold leading-none tracking-[-0.03em] text-ink tnum sm:text-[60px]">{formatBDT(c.pocketPerMonth)}</p>
                    <p className="mt-2 text-[15px] text-muted">{tx("from your pocket each month", "প্রতি মাসে পকেট থেকে যাবে")}</p>
                  </div>
                  {inp.includeDepreciation && (
                    <div>
                      <p className="text-[30px] font-semibold leading-none tracking-[-0.02em] text-ink-2 tnum sm:text-[36px]">{formatBDT(c.perMonth)}</p>
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
                <Kpi k={tx("Running only / mo", "শুধু চলার খরচ / মাস")} v={formatBDT(c.runningPerMonth)} />
              </div>
            </div>

            {/* stacked bar */}
            <div className="px-6 pb-6 sm:px-8 sm:pb-8">
              <div className="flex h-4 overflow-hidden rounded-full bg-surface-3" role="img" aria-label={tx("Cost breakdown", "খরচের ভাগ")}>
                {SEGMENTS.map((s) => {
                  const v = c[s.k];
                  if (!v) return null;
                  return <div key={s.k} title={`${tx(s.en, s.bn)}: ${formatBDT(v)}`} style={{ width: `${(v / c.total) * 100}%`, background: s.color }} className="h-full transition-all duration-500" />;
                })}
              </div>
              <div className="mt-6 grid gap-x-8 gap-y-3 sm:grid-cols-2">
                {SEGMENTS.map((s) => {
                  const v = c[s.k];
                  return (
                    <div key={s.k} className={`flex items-center justify-between gap-3 text-[14.5px] ${v ? "" : "opacity-40"}`}>
                      <span className="flex items-center gap-2.5 text-ink-2">
                        <span className="h-2.5 w-2.5 rounded-full" style={{ background: s.color }} />
                        {tx(s.en, s.bn)}
                      </span>
                      <span className="font-medium text-ink tnum">
                        {formatBDT(v)}{" "}
                        <span className="text-[12.5px] font-normal text-faint">
                          · {formatBDT(v / months)}
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
              k={tx("Buy today", "আজ কিনলে")}
              v={formatBDT(c.onRoad)}
              sub={!c.buyingUsed ? tx(`ex-showroom + ${formatBDT(c.onRoad - bike.priceBDT)} BRTA`, `শোরুম মূল্য + ${formatBDT(c.onRoad - bike.priceBDT)} BRTA`) : tx("used price, plus transfer fee", "পুরনো দাম, সাথে মালিকানা বদলের ফি")}
            />
            <Fact
              k={tx("Or on 12-month EMI", "অথবা ১২ মাসের কিস্তিতে")}
              v={!c.buyingUsed ? `${formatBDT(emiMonthly(bike.priceBDT))}${tx("/mo", "/মাস")}` : "—"}
              sub={c.buyingUsed ? tx("No card EMI on a private sale", "ব্যক্তিগত বিক্রিতে কার্ড কিস্তি নেই") : tx("0% card EMI where offered, plus BRTA upfront", "যেখানে ০% কার্ড কিস্তি আছে; BRTA খরচ শুরুতেই")}
            />
            <Fact k={tx(`Worth after ${inp.years} yr`, `${inp.years} বছর পর দাম`)} v={formatBDT(c.resaleValue)} sub={tx("estimated, decent condition", "আনুমানিক, ভালো অবস্থায়")} />
          </div>

          {others.length > 0 && (
            <div className="card p-6">
              <h2 className="text-[17px] font-semibold tracking-tight text-ink">{c.buyingUsed && !usedOnly ? tx("Same style, also bought used, on the same terms", "একই ধরনের বাইক, পুরনো কিনলে, একই হিসাবে") : tx("Same style, compared on the same terms", "একই ধরনের বাইক, একই হিসাবে")}</h2>
              <div className="mt-4 divide-y divide-line">
                {others.map(({ b, c: cc }) => {
                  const diff = cc.perMonth - c.perMonth;
                  return (
                    <button key={b.id} onClick={() => pick(b)} className="flex w-full items-center gap-4 py-3 text-left transition-colors hover:bg-surface-2/50">
                      <span className="h-10 w-16 shrink-0">
                        <BikeArt bike={b} shadow={false} className="h-full w-full" />
                      </span>
                      <span className="min-w-0 flex-1 truncate text-[14.5px] font-medium text-ink">{fullName(b)}</span>
                      <span className="text-[14.5px] font-semibold text-ink tnum">
                        {formatBDT(cc.perMonth)}
                        {tx("/mo", "/মাস")}
                      </span>
                      <span className={`w-20 text-right text-[13px] font-medium tnum sm:w-24 ${diff < 0 ? "text-good" : "text-signal"}`}>
                        {diff < 0 ? "−" : "+"}
                        {formatBDT(Math.abs(diff))}
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
                `Fuel uses the middle of the real-world mileage range. Servicing (oil, oil filter, labour) every ${bike.serviceIntervalKm.toLocaleString("en-IN")} km and at least twice a year. Wear parts are counted as they wear, on the short side of owner reports: front pads every ${WEAR_KM.frontPads.toLocaleString("en-IN")} km, rear every ${WEAR_KM.rearPads.toLocaleString("en-IN")} km, chain set every ${WEAR_KM.chain.toLocaleString("en-IN")} km plus lube, tyres every ${WEAR_KM.tyres.toLocaleString("en-IN")} km, air filter and spark plug, clutch every ${WEAR_KM.clutch.toLocaleString("en-IN")} km, battery every 2 years. Prices are estimates, rounded up.${c.buyingUsed ? ` Used: ${Math.round(hiddenRepairRate(bike) * 100)}% of the price paid is added for hidden problems, spread over the months you own it.` : ""} Resale uses our resale score (≈ ${Math.round((1 - (0.8 + bike.scores.resale * 0.012)) * 100)}% value lost per year for this bike). Registration: ${registrationFor(bike.engine.cc).label}, from BRTA fee schedules.`,
                `তেলের হিসাব আসল মাইলেজের মাঝামাঝি ধরে। সার্ভিসিং (মবিল, অয়েল ফিল্টার, মজুরি) প্রতি ${bike.serviceIntervalKm.toLocaleString("en-IN")} km-এ, বছরে অন্তত দুবার। ক্ষয়যোগ্য পার্টস যতটা ক্ষয় হয় ততটা ধরা, ওনারদের অভিজ্ঞতার কম দিকটা নিয়ে: সামনের প্যাড ${WEAR_KM.frontPads.toLocaleString("en-IN")} km, পেছনের ${WEAR_KM.rearPads.toLocaleString("en-IN")} km, চেইন সেট ${WEAR_KM.chain.toLocaleString("en-IN")} km আর লুব, টায়ার ${WEAR_KM.tyres.toLocaleString("en-IN")} km, এয়ার ফিল্টার ও স্পার্ক প্লাগ, ক্লাচ ${WEAR_KM.clutch.toLocaleString("en-IN")} km, ব্যাটারি ২ বছরে। দাম আনুমানিক, উপরের দিকে ধরা।${c.buyingUsed ? ` পুরনো বাইক: লুকানো সমস্যার জন্য কেনা দামের ${Math.round(hiddenRepairRate(bike) * 100)}% যোগ করা, মালিকানার মাসগুলোতে ভাগ করে।` : ""} রিসেল আমাদের রিসেল স্কোর থেকে (এই বাইকে বছরে ≈ ${Math.round((1 - (0.8 + bike.scores.resale * 0.012)) * 100)}% দাম কমে)। রেজিস্ট্রেশন: BRTA ফি তালিকা থেকে।`,
              )}{" "}
              <Link href="/guide/#registration" className="text-brand hover:underline">
                {tx("Breakdown", "বিস্তারিত")}
              </Link>
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}

function BikePicker({ bike, onPick }: { bike: BikeLite; onPick: (b: BikeLite) => void }) {
  const { lang } = useLang();
  const tx = useTx();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const results = useMemo(() => searchBikes(q, 6), [q]);
  return (
    <div className="relative">
      <p className="mb-2 text-[13px] font-medium text-ink-2">{tx("Bike", "বাইক")}</p>
      {!open ? (
        <button onClick={() => setOpen(true)} className="flex w-full items-center gap-3 rounded-xl border border-line-strong p-2.5 text-left transition-colors hover:border-ink/30">
          <span className="h-10 w-16 shrink-0">
            <BikeArt bike={bike} shadow={false} className="h-full w-full" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-[14.5px] font-semibold text-ink">{fullName(bike)}</span>
            <span className="block text-[12.5px] text-muted tnum">{formatBDT(bike.priceBDT)}</span>
          </span>
          <span className="text-[12.5px] font-medium text-brand">{tx("Change", "বদলান")}</span>
        </button>
      ) : (
        <>
          <input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onBlur={() => setTimeout(() => setOpen(false), 150)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && results[0]) {
                onPick(results[0]);
                setOpen(false);
                setQ("");
              }
              if (e.key === "Escape") setOpen(false);
            }}
            placeholder={tx("Search a bike…", "বাইক খুঁজুন…")}
            aria-label={tx("Search a bike", "বাইক খুঁজুন")}
            className="input h-[62px]"
          />
          {results.length > 0 && (
            <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-50 overflow-hidden rounded-2xl border border-line bg-surface shadow-lg">
              {results.map((b) => (
                <button
                  key={b.id}
                  onMouseDown={() => {
                    onPick(b);
                    setOpen(false);
                    setQ("");
                  }}
                  className="flex w-full items-center gap-3 px-3 py-2.5 text-left hover:bg-surface-2"
                >
                  <span className="min-w-0 flex-1 truncate text-[14px] font-medium text-ink">{fullName(b)}</span>
                  <span className="text-[13px] text-muted tnum">{formatLakh(b.priceBDT, lang)}</span>
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function Field({ label, value, children }: { label: string; value?: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between">
        <span className="text-[13px] font-medium text-ink-2">{label}</span>
        {value && <span className="text-[15px] font-semibold text-ink tnum">{value}</span>}
      </div>
      {children}
    </div>
  );
}

function Range({ min, max, step, value, onChange, label }: { min: number; max: number; step: number; value: number; onChange: (v: number) => void; label: string }) {
  return (
    <input
      type="range"
      className="range"
      min={min}
      max={max}
      step={step}
      value={value}
      aria-label={label}
      style={{ ["--fill" as string]: `${((value - min) / (max - min)) * 100}%` }}
      onChange={(e) => onChange(Number(e.target.value))}
    />
  );
}

function Switch({ on, onChange, label, sub }: { on: boolean; onChange: (v: boolean) => void; label: string; sub: string }) {
  return (
    <button role="switch" aria-checked={on} onClick={() => onChange(!on)} className="flex w-full items-center justify-between gap-3 rounded-xl py-2 text-left">
      <span>
        <span className="block text-[14px] font-medium text-ink-2">{label}</span>
        <span className="block text-[12px] text-faint">{sub}</span>
      </span>
      <span className={`relative h-6 w-10 shrink-0 rounded-full transition-colors ${on ? "bg-brand" : "bg-surface-3"}`}>
        <span className={`absolute left-0 top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${on ? "translate-x-[18px]" : "translate-x-0.5"}`} />
      </span>
    </button>
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
