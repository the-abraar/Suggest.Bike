"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Plus, RotateCcw, Trash2 } from "lucide-react";
import { BIKES, BRANDS, formatLakh, fullName, getBike } from "@/lib/bikes";
import { useLang, useTx } from "@/lib/i18n";
import type { Bike, BikeLite } from "@/lib/types";
import { assess, emptyListing } from "@/lib/listingcheck/engine";
import { buildQuestions, type BikeNotes } from "@/lib/listingcheck/questions";
import { rankListings } from "@/lib/listingcheck/compare";
import { platformName } from "@/lib/listingcheck/summary";
import { parseListingText } from "@/lib/listingcheck/text";
import type { Behaviours, Listing, Platform } from "@/lib/listingcheck/types";
import { ExperimentalBadge, ExperimentalBanner } from "./Experimental";
import { Check, Choice, Field, NumInput, Section } from "./controls";
import { ResultPanel, VerdictBadge, useBi } from "./Result";

const KEY = "sb-listingcheck-v1";
const MAX = 3;
const LABELS = ["A", "B", "C"];

interface Saved { listings: Listing[]; active: number }

function load(): Saved | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const s = JSON.parse(raw) as Saved;
    if (!Array.isArray(s.listings) || !s.listings.length) return null;
    // merge onto defaults so older drafts keep working when fields are added
    const listings = s.listings.slice(0, MAX).map((l, i) => ({ ...emptyListing(l.id || `l${i}`, l.label || LABELS[i]), ...l, behaviours: { ...emptyListing("x", "x").behaviours, ...(l.behaviours || {}) } }));
    return { listings, active: Math.min(Math.max(0, s.active | 0), listings.length - 1) };
  } catch {
    return null;
  }
}

const PLATFORMS: Platform[] = ["bikroy", "fb-marketplace", "fb-group", "showroom", "friend", "other"];

export function ListingCheckView() {
  const params = useSearchParams();
  const tx = useTx();
  const { lang } = useLang();
  const bi = useBi();
  const [listings, setListings] = useState<Listing[]>(() => [emptyListing("l0", "A")]);
  const [active, setActive] = useState(0);
  const [ready, setReady] = useState(false);
  const [notes, setNotes] = useState<Record<string, BikeNotes | null>>({});
  const resultRef = useRef<HTMLDivElement>(null);

  // Load the saved draft, then apply ?bike= to the listing that has no model yet.
  useEffect(() => {
    const s = load();
    let ls = s?.listings ?? [emptyListing("l0", "A")];
    let act = s?.active ?? 0;
    const pb = getBike(params.get("bike") || "");
    if (pb) {
      const i = ls[act].bikeId ? -1 : act;
      if (i >= 0) ls = ls.map((l, k) => (k === i ? { ...l, bikeId: pb.id } : l));
      else if (ls.length < MAX) { ls = [...ls, { ...emptyListing(`l${Date.now()}`, LABELS[ls.length]), bikeId: pb.id }]; act = ls.length - 1; }
    }
    setListings(ls);
    setActive(act);
    setReady(true);
  }, [params]);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(KEY, JSON.stringify({ listings, active } satisfies Saved));
    } catch {}
  }, [listings, active, ready]);

  // Full bike record (quirks, mechanicNote) comes from the static per-bike JSON, same as /compare.
  const ids = Array.from(new Set(listings.map((l) => l.bikeId).filter(Boolean)));
  useEffect(() => {
    ids.forEach((id) => {
      if (id in notes) return;
      fetch(`/data/bikes/${id}.json`)
        .then((r) => (r.ok ? (r.json() as Promise<Bike>) : null))
        .then((b) => setNotes((n) => ({ ...n, [id]: b ? { quirks: b.quirks, mechanicNote: b.mechanicNote, bn: b.bn ? { quirks: b.bn.quirks, mechanicNote: b.bn.mechanicNote } : undefined } : null })))
        .catch(() => setNotes((n) => ({ ...n, [id]: null })));
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ids.join(",")]);

  const nowYear = new Date().getFullYear();
  const cur = listings[Math.min(active, listings.length - 1)];
  const patch = (p: Partial<Listing>) => setListings((ls) => ls.map((l, i) => (i === active ? { ...l, ...p } : l)));
  const patchB = (p: Partial<Behaviours>) => patch({ behaviours: { ...cur.behaviours, ...p } });

  const results = useMemo(
    () =>
      listings.map((l) => {
        const bike: BikeLite | undefined = getBike(l.bikeId);
        const a = assess(l, bike, { nowYear });
        return { l, bike, a, parsed: parseListingText(l.text, nowYear) };
      }),
    [listings, nowYear],
  );
  const res = results[Math.min(active, results.length - 1)];
  const bikeName = res.bike ? fullName(res.bike) : "";
  const questions = useMemo(() => buildQuestions(res.l, res.a, notes[res.l.bikeId] ?? null), [res, notes]);
  const ranks = useMemo(() => rankListings(results.map((r) => r.a)), [results]);

  const addListing = () => {
    if (listings.length >= MAX) return;
    setListings((ls) => [...ls, emptyListing(`l${Date.now()}`, LABELS[ls.length])]);
    setActive(listings.length);
  };
  const removeActive = () => {
    if (listings.length === 1) {
      setListings([emptyListing("l0", "A")]);
      return;
    }
    const next = listings.filter((_, i) => i !== active).map((l, i) => ({ ...l, label: LABELS[i] }));
    setListings(next);
    setActive(Math.max(0, active - 1));
  };
  const reset = () => patch({ ...emptyListing(cur.id, cur.label) });
  const applyText = () => {
    const p = res.parsed;
    patch({ askingBDT: cur.askingBDT ?? p.price, km: cur.km ?? p.km, year: cur.year ?? p.year });
  };

  const platformLabel: Record<Platform, string> = {
    bikroy: "Bikroy", "fb-marketplace": "Facebook Marketplace", "fb-group": tx("Facebook group", "ফেসবুক গ্রুপ"),
    showroom: tx("Showroom / dealer", "শোরুম / ডিলার"), friend: tx("Friend / known person", "বন্ধু / পরিচিত"), other: tx("Other", "অন্যান্য"),
  };
  const yn = (): { v: "yes" | "no" | "unknown"; label: string }[] => [
    { v: "yes", label: tx("Yes", "হ্যাঁ") }, { v: "no", label: tx("No", "না") }, { v: "unknown", label: tx("Not sure", "জানি না") },
  ];

  return (
    <div className="container-x py-6 sm:py-10">
      <div className="max-w-3xl">
        <ExperimentalBadge />
        <h1 className="mt-3 text-[28px] font-semibold tracking-tight text-ink sm:text-[36px]">{tx("Listing check", "লিস্টিং চেক")}</h1>
        <p className="mt-2 text-[15.5px] leading-relaxed text-muted">
          {tx(
            "Found a used bike on Bikroy or Facebook? Enter what the post says and what the seller said or did. You get a verdict, a price check, red flags and the questions to ask next. You can also compare up to 3 listings.",
            "বিক্রয়.কম বা ফেসবুকে পুরনো বাইক পেয়েছেন? পোস্টে কী লেখা আর বিক্রেতা কী বলেছেন বা করেছেন তা দিন। পাবেন ফলাফল, দামের তুলনা, লাল সংকেত ও পরের প্রশ্নের তালিকা। ৩টি পর্যন্ত বিজ্ঞাপন পাশাপাশি তুলনাও করা যায়।",
          )}
        </p>
      </div>
      <div className="mt-5 max-w-3xl">
        <ExperimentalBanner>
          {tx(
            "This is a rule-based checklist with hand-set weights and approximate price ranges. It is not AI, it does not read the marketplace, and it cannot know if a seller is honest. A good score is not a guarantee: always see the bike, check the papers at BRTA and pay only at the transfer.",
            "এটি হাতে ঠিক করা ওজন ও আনুমানিক দামের সীমা দিয়ে চলা নিয়মভিত্তিক চেকলিস্ট। এটি AI নয়, মার্কেটপ্লেস পড়ে না, আর বিক্রেতা সৎ কিনা জানতে পারে না। ভালো স্কোর নিশ্চয়তা নয়: বাইক দেখুন, BRTA-তে কাগজ যাচাই করুন আর হস্তান্তরের সময়ই টাকা দিন।",
          )}
        </ExperimentalBanner>
      </div>

      {/* listing tabs */}
      <div className="mt-6 flex flex-wrap items-center gap-2" role="tablist" aria-label={tx("Listings", "বিজ্ঞাপন")}>
        {listings.map((l, i) => {
          const r = results[i];
          return (
            <button
              key={l.id}
              role="tab"
              aria-selected={i === active}
              data-active={i === active}
              onClick={() => setActive(i)}
              className="chip h-10 cursor-pointer px-3.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            >
              {tx("Listing", "বিজ্ঞাপন")} {l.label}
              <span className="tnum text-muted">· {r.a.score}</span>
            </button>
          );
        })}
        {listings.length < MAX && (
          <button type="button" onClick={addListing} className="btn-ghost h-10 px-3 text-[14px]">
            <Plus size={16} />
            {tx("Add another to compare", "তুলনার জন্য আরেকটি যোগ করুন")}
          </button>
        )}
      </div>

      <div className="mt-4 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,440px)] lg:items-start">
        {/* ---------------- form ---------------- */}
        <div className="grid min-w-0 gap-4" role="tabpanel">
          <Section title={tx("The post", "পোস্টের তথ্য")} sub={tx("Copy these from the marketplace ad.", "মার্কেটপ্লেসের বিজ্ঞাপন থেকে দিন।")}>
            <Choice legend={tx("Where did you find it?", "কোথায় পেয়েছেন?")} value={cur.platform} options={PLATFORMS.map((p) => ({ v: p, label: platformLabel[p] }))} onChange={(v) => patch({ platform: v })} />
            <Field label={tx("Bike model", "বাইকের মডেল")}>
              {(id) => (
                <select id={id} className="input" value={cur.bikeId} onChange={(e) => patch({ bikeId: e.target.value })}>
                  <option value="">{tx("Not in the list / not sure", "তালিকায় নেই / নিশ্চিত নই")}</option>
                  {BRANDS.map((b) => (
                    <optgroup key={b} label={b}>
                      {BIKES.filter((x) => x.brand === b).map((x) => (
                        <option key={x.id} value={x.id}>{x.model}{x.status === "used-only" ? ` (${tx("used-only", "শুধু পুরনো")})` : ""}</option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              )}
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label={tx("Asking price (Tk)", "চাওয়া দাম (টাকা)")} hint={cur.askingBDT ? formatLakh(cur.askingBDT, lang) : undefined}>
                {(id) => <NumInput id={id} value={cur.askingBDT} onChange={(n) => patch({ askingBDT: n })} placeholder="150000" />}
              </Field>
              <Field label={tx("Km on meter", "মিটারের কিমি")}>
                {(id) => <NumInput id={id} value={cur.km} onChange={(n) => patch({ km: n })} placeholder="20000" />}
              </Field>
              <Field label={tx("Model year", "মডেল সাল")}>
                {(id) => <NumInput id={id} value={cur.year} onChange={(n) => patch({ year: n })} placeholder={String(nowYear - 3)} />}
              </Field>
              <Field label={tx("Owners so far", "মালিক কতজন")}>
                {(id) => <NumInput id={id} value={cur.owners} onChange={(n) => patch({ owners: n })} placeholder="1" />}
              </Field>
              <Field label={tx("Photos in the post", "পোস্টে ছবির সংখ্যা")}>
                {(id) => <NumInput id={id} value={cur.photos} onChange={(n) => patch({ photos: n })} placeholder="6" />}
              </Field>
              <Field label={tx("Post age (days)", "পোস্ট কতদিনের (দিন)")}>
                {(id) => <NumInput id={id} value={cur.postAgeDays} onChange={(n) => patch({ postAgeDays: n })} placeholder="3" />}
              </Field>
            </div>
            <Field label={tx("Location", "এলাকা")}>
              {(id) => <input id={id} className="input" value={cur.location} onChange={(e) => patch({ location: e.target.value })} placeholder={tx("e.g. Mirpur, Dhaka", "যেমন মিরপুর, ঢাকা")} />}
            </Field>
            <Field label={tx("Post link or ad ID (optional)", "পোস্টের লিংক বা আইডি (ঐচ্ছিক)")} hint={tx("Only kept in your browser for your own reference. We never open it.", "শুধু আপনার ব্রাউজারে থাকে, আপনার সুবিধার জন্য। আমরা এটি খুলি না।")}>
              {(id) => <input id={id} className="input" value={cur.link} onChange={(e) => patch({ link: e.target.value })} placeholder="https://" inputMode="url" />}
            </Field>
            <Choice legend={tx("Do the photos look like internet / stock pictures?", "ছবিগুলো কি ইন্টারনেট / স্টক ছবির মতো?")} value={cur.stockPhotos} options={yn()} onChange={(v) => patch({ stockPhotos: v })} />
            <Choice
              legend={tx("Reason for sale (as told)", "বিক্রির কারণ (যেমন বলেছে)")}
              value={cur.reason}
              options={[
                { v: "none", label: tx("Not told", "বলেনি") },
                { v: "upgrading", label: tx("Upgrading", "নতুন কিনছে") },
                { v: "abroad", label: tx("Going abroad", "বিদেশ যাচ্ছে") },
                { v: "not-using", label: tx("Not using it", "চালায় না") },
                { v: "study", label: tx("Study / job move", "পড়াশোনা / চাকরি") },
                { v: "money", label: tx("Needs money", "টাকার দরকার") },
                { v: "gov-transfer", label: tx("Army / police transfer", "সেনা / পুলিশ বদলি") },
                { v: "other", label: tx("Other", "অন্যান্য") },
              ]}
              onChange={(v) => patch({ reason: v })}
            />
          </Section>

          <Section title={tx("Papers", "কাগজপত্র")} sub={tx("Ask for photos of the originals. Do not trust a word without a photo.", "আসল কাগজের ছবি চান। ছবি ছাড়া মুখের কথায় ভরসা করবেন না।")}>
            <Choice
              legend={tx("Blue book / registration", "ব্লু বুক / রেজিস্ট্রেশন")}
              value={cur.blueBook}
              options={[
                { v: "yes", label: tx("Has it", "আছে") },
                { v: "processing", label: tx("\"Under process\"", "\"প্রসেসে আছে\"") },
                { v: "no", label: tx("No papers", "নেই") },
                { v: "unknown", label: tx("Not told", "বলেনি") },
              ]}
              onChange={(v) => patch({ blueBook: v })}
            />
            <Choice legend={tx("Is the seller the name on the papers?", "কাগজের নামই কি বিক্রেতা?")} value={cur.nameMatchesSeller} options={yn()} onChange={(v) => patch({ nameMatchesSeller: v })} />
            <Choice
              legend={tx("Tax token", "ট্যাক্স টোকেন")}
              value={cur.taxToken}
              options={[
                { v: "valid", label: tx("Valid", "বৈধ") },
                { v: "expired", label: tx("Expired", "মেয়াদ শেষ") },
                { v: "no", label: tx("None", "নেই") },
                { v: "unknown", label: tx("Not told", "বলেনি") },
              ]}
              onChange={(v) => patch({ taxToken: v })}
            />
            <Choice legend={tx("Smart card (digital registration)", "স্মার্ট কার্ড (ডিজিটাল রেজিস্ট্রেশন)")} value={cur.smartCard} options={yn()} onChange={(v) => patch({ smartCard: v })} />
            <Field label={tx("Year shown on the papers (if known)", "কাগজে লেখা সাল (জানা থাকলে)")}>
              {(id) => <NumInput id={id} value={cur.regYear} onChange={(n) => patch({ regYear: n })} placeholder={String(nowYear - 3)} />}
            </Field>
          </Section>

          <Section title={tx("The seller", "বিক্রেতা")}>
            <div className="grid grid-cols-2 gap-3">
              <Field label={tx("Seller account age (months)", "অ্যাকাউন্ট কত মাসের")}>
                {(id) => <NumInput id={id} value={cur.sellerAccountMonths} onChange={(n) => patch({ sellerAccountMonths: n })} placeholder="12" />}
              </Field>
              <Field label={tx("Other ads by the seller", "বিক্রেতার অন্য বিজ্ঞাপন")}>
                {(id) => <NumInput id={id} value={cur.otherAds} onChange={(n) => patch({ otherAds: n })} placeholder="0" />}
              </Field>
            </div>
            <fieldset className="grid min-w-0 gap-2">
              <legend className="mb-1 text-[13.5px] font-medium text-ink-2">{tx("What the seller said or did (tick all that apply)", "বিক্রেতা যা বলেছে বা করেছে (প্রযোজ্যগুলো টিক দিন)")}</legend>
              <Check checked={cur.behaviours.wantsAdvance} onChange={(v) => patchB({ wantsAdvance: v })} label={tx("Wants advance / bKash / Nagad before I see the bike", "বাইক দেখার আগে অগ্রিম / বিকাশ / নগদ চায়")} />
              <Check checked={cur.behaviours.refusesInspection} onChange={(v) => patchB({ refusesInspection: v })} label={tx("Refuses a mechanic check or test ride", "মেকানিক দেখাতে বা টেস্ট রাইড দিতে মানা করে")} />
              <Check checked={cur.behaviours.refusesPaperPhoto} onChange={(v) => patchB({ refusesPaperPhoto: v })} label={tx("Will not send a photo of the papers", "কাগজের ছবি দিতে চায় না")} />
              <Check checked={cur.behaviours.urgencyPressure} onChange={(v) => patchB({ urgencyPressure: v })} label={tx("Pushes me to hurry (\"other buyers coming\")", "তাড়া দেয় (\"অন্য ক্রেতা আসছে\")")} />
              <Check checked={cur.behaviours.courierOffer} onChange={(v) => patchB({ courierOffer: v })} label={tx("Offers courier / delivery outside Dhaka", "কুরিয়ার / ঢাকার বাইরে ডেলিভারি দিতে চায়")} />
              <Check checked={cur.behaviours.oddMeeting} onChange={(v) => patchB({ oddMeeting: v })} label={tx("Wants to meet only at night or in an empty place", "শুধু রাতে বা ফাঁকা জায়গায় দেখা করতে চায়")} />
              <Check checked={cur.behaviours.claimsOwnerButManyAds} onChange={(v) => patchB({ claimsOwnerButManyAds: v })} label={tx("Says \"personal use\" but seems to be a dealer", "\"নিজের ব্যবহার\" বলে, কিন্তু ডিলার মনে হয়")} />
              <Check checked={cur.behaviours.welcomesInspection} onChange={(v) => patchB({ welcomesInspection: v })} label={tx("Happily said \"bring your own mechanic\"", "খুশি মনে বলেছে \"নিজের মেকানিক আনুন\"")} />
            </fieldset>
          </Section>

          <Section
            title={tx("Paste the chat or post text", "চ্যাট বা পোস্টের লেখা পেস্ট করুন")}
            sub={tx(
              "English, Bangla or Banglish (\"paper nai\", \"advance dite hobe\", \"urgent\", \"bkash\"). A keyword matcher looks for prices, km, year and warning phrases. It is simple matching, not AI.",
              "ইংরেজি, বাংলা বা বাংলিশ (\"paper nai\", \"advance dite hobe\", \"urgent\", \"bkash\")। কীওয়ার্ড ম্যাচার দাম, কিমি, সাল ও সতর্ক বাক্য খোঁজে। এটি সাধারণ মেলানো, AI নয়।",
            )}
          >
            <Field label={tx("Chat or post text", "চ্যাট বা পোস্টের লেখা")}>
              {(id) => (
                <textarea id={id} rows={6} className="input h-auto min-h-[140px] py-3 leading-relaxed" value={cur.text} onChange={(e) => patch({ text: e.target.value })}
                  placeholder={tx("Pulsar 150, 2021, 18000 km, price 1.2 lakh. Paper under process. Advance 5000 bkash then I will send...", "পালসার ১৫০, ২০২১, ১৮০০০ কিমি, দাম ১.২ লাখ। পেপার প্রসেসে আছে। আগে ৫০০০ বিকাশ করলে...")} />
              )}
            </Field>
            <p className="rounded-xl bg-surface-2 p-3 text-[13px] leading-snug text-ink-2">
              <span className="font-semibold text-ink">{tx("Coming soon: ", "শীঘ্রই আসছে: ")}</span>
              {tx("Paste a Bikroy link and we fill it in. Not available yet: for now, copy the details by hand. We do not read pages from your browser.", "বিক্রয়.কম-এর লিংক পেস্ট করলে আমরা ফর্ম পূরণ করে দেব। এখনও চালু হয়নি: আপাতত হাতে লিখে দিন। আমরা আপনার ব্রাউজার থেকে পেজ পড়ি না।")}
            </p>
          </Section>

          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={reset} className="btn-ghost h-10 text-[14px]"><RotateCcw size={15} />{tx("Clear this listing", "এই বিজ্ঞাপন পরিষ্কার")}</button>
            {listings.length > 1 && <button type="button" onClick={removeActive} className="btn-ghost h-10 text-[14px] text-signal"><Trash2 size={15} />{tx("Remove listing", "বিজ্ঞাপন সরান")} {cur.label}</button>}
          </div>
          <p className="text-[12.5px] text-muted">{tx("Your drafts are saved in this browser only (nothing is sent anywhere).", "আপনার খসড়া শুধু এই ব্রাউজারে সেভ থাকে (কোথাও পাঠানো হয় না)।")}</p>
        </div>

        {/* ---------------- result ---------------- */}
        <div ref={resultRef} className="min-w-0 lg:sticky lg:top-20 lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto lg:pr-1">
          <h2 className="mb-3 text-[20px] font-semibold tracking-tight text-ink">{tx("Result", "ফলাফল")}: {tx("Listing", "বিজ্ঞাপন")} {cur.label}{bikeName ? ` · ${bikeName}` : ""}</h2>
          <ResultPanel l={res.l} a={res.a} bikeName={bikeName} questions={questions} parsed={res.parsed} onApplyText={applyText} />
        </div>
      </div>

      {/* ---------------- compare ---------------- */}
      {listings.length >= 2 && (
        <section className="mt-10" aria-labelledby="cmp-h">
          <h2 id="cmp-h" className="text-[22px] font-semibold tracking-tight text-ink">{tx("Side by side", "পাশাপাশি তুলনা")}</h2>
          <p className="mt-1 max-w-2xl text-[14px] leading-relaxed text-muted">
            {tx(
              "Ranked by risk first (60%) and value for money (40%). A price far below the usual range is not counted as a bargain.",
              "আগে ঝুঁকি (৬০%), তারপর দামের মূল্য (৪০%) দিয়ে সাজানো। স্বাভাবিকের অনেক নিচের দাম সুযোগ হিসেবে ধরা হয় না।",
            )}
          </p>
          <ol className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {[...results.keys()].sort((x, y) => ranks[x].rank - ranks[y].rank).map((i) => {
              const r = results[i];
              const rk = ranks[i];
              const top = rk.rank === 1;
              const worst = r.a.flags.slice(0, 3);
              return (
                <li key={r.l.id} className={`card min-w-0 p-4 ${top && r.a.verdict !== "skip" ? "border-brand ring-2 ring-brand/20" : ""}`}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-[12.5px] font-semibold text-muted tnum">#{rk.rank} · {tx("Listing", "বিজ্ঞাপন")} {r.l.label}{top && r.a.verdict !== "skip" ? ` · ${tx("best of these", "এগুলোর মধ্যে সেরা")}` : ""}</p>
                      <p className="mt-0.5 truncate text-[16px] font-semibold text-ink">{r.bike ? fullName(r.bike) : tx("Unnamed bike", "নামহীন বাইক")}</p>
                      <p className="text-[12.5px] text-muted">{platformName(r.l.platform)}{r.l.location ? ` · ${r.l.location}` : ""}</p>
                    </div>
                    <p className="text-[26px] font-semibold leading-none text-ink tnum">{r.a.score}</p>
                  </div>
                  <div className="mt-3"><VerdictBadge verdict={r.a.verdict} size="sm" /></div>
                  <dl className="mt-3 grid grid-cols-2 gap-2 text-[13.5px]">
                    <div><dt className="text-[12px] text-muted">{tx("Asking", "চাওয়া")}</dt><dd className="font-semibold text-ink tnum">{r.l.askingBDT ? formatLakh(r.l.askingBDT, lang) : "-"}</dd></div>
                    <div><dt className="text-[12px] text-muted">{tx("vs usual", "স্বাভাবিকের তুলনায়")}</dt><dd className="font-semibold text-ink tnum">{r.a.price.deltaPct != null ? `${r.a.price.deltaPct > 0 ? "+" : ""}${Math.round(r.a.price.deltaPct)}%` : "-"}</dd></div>
                    <div><dt className="text-[12px] text-muted">{tx("Risk", "ঝুঁকি")}</dt><dd className="font-semibold text-ink tnum">{rk.risk}/100</dd></div>
                    <div><dt className="text-[12px] text-muted">{tx("Value", "মূল্য")}</dt><dd className="font-semibold text-ink tnum">{rk.value}/100</dd></div>
                  </dl>
                  {worst.length > 0 && (
                    <ul className="mt-3 grid gap-1 text-[13px] leading-snug text-ink-2">
                      {worst.map((f) => <li key={f.id} className="flex gap-1.5"><span aria-hidden className="text-signal">•</span><span className="min-w-0">{bi(f.title)}</span></li>)}
                    </ul>
                  )}
                  <button type="button" onClick={() => { setActive(i); resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }); }} className="btn-ghost mt-3 h-9 px-3 text-[13.5px]">
                    {tx("Open details", "বিস্তারিত দেখুন")}
                  </button>
                </li>
              );
            })}
          </ol>
          {results.every((r) => r.a.verdict === "skip") && (
            <p className="mt-3 rounded-xl bg-signal-soft p-3 text-[14px] text-signal">{tx("None of these listings is worth pursuing as they stand. Keep looking.", "বর্তমান অবস্থায় এগুলোর কোনোটিই এগোনোর মতো নয়। খুঁজতে থাকুন।")}</p>
          )}
        </section>
      )}
    </div>
  );
}
