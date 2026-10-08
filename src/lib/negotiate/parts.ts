// Part-by-part negotiation model for a second-hand bike. Pure functions, no React.
// Every amount is either a price from this bike's own parts list or a labelled estimate. A mechanic's quote beats all of it.
import { TYRE_PAIR } from "@/lib/cost";
import type { Bi } from "@/lib/usedcheck/checklist";
import type { BikeLite } from "@/lib/types";

export type PartState = "ok" | "worn" | "bad";
export type PartId = "frontTyre" | "rearTyre" | "brakes" | "chain" | "clutch" | "engine" | "fork" | "shock" | "electrics" | "frame" | "body" | "papers" | "service";

export interface PartDef {
  id: PartId;
  label: Bi;
  /** Where to look and what to do. */
  how: Bi;
  worn: Bi;
  bad: Bi;
  /** Position on the bike drawing (viewBox 300x170). Null = paperwork, shown beside the bike. */
  at: [number, number] | null;
}

export interface Deduction {
  amount: number;
  /** "walk" = we would not buy, the amount is only what you'd ask if you go ahead anyway. */
  kind: "parts" | "estimate" | "walk";
  basis: Bi;
}

const fmt = (n: number) => "৳" + Math.round(n).toLocaleString("en-IN");
const round500 = (n: number) => Math.round(n / 500) * 500;

export function partsFor(b: Pick<BikeLite, "gears" | "engine" | "brakes">): PartDef[] {
  const cvt = b.gears === 0;
  const two = b.engine.stroke === 2;
  const disc = b.brakes.front === "disc";
  return [
    {
      id: "frontTyre", at: [268, 138], label: { en: "Front tyre", bn: "সামনের টায়ার" },
      how: { en: "Look at the tread and the sidewalls. Check the date code (four digits, week and year). Run a hand over it for cracks and flat spots.", bn: "ট্রেড ও পাশের দেয়াল দেখুন। তারিখের কোড (চার অঙ্ক, সপ্তাহ ও বছর) দেখুন। ফাটল ও চ্যাপ্টা জায়গা হাতে ঠেকিয়ে দেখুন।" },
      worn: { en: "Tread low, or more than 5 years old.", bn: "ট্রেড কম, বা ৫ বছরের বেশি পুরনো।" },
      bad: { en: "Cracked, bald or uneven. Replace before riding.", bn: "ফাটা, ক্ষয়ে মসৃণ বা অসম। চালানোর আগে বদলান।" },
    },
    {
      id: "rearTyre", at: [38, 138], label: { en: "Rear tyre", bn: "পেছনের টায়ার" },
      how: { en: "Same as the front. The rear wears faster, and a worn one on a powerful bike is a fall waiting to happen.", bn: "সামনেরটার মতোই। পেছনেরটা বেশি ক্ষয়ে, আর শক্তিশালী বাইকে ক্ষয়া টায়ার পড়ে যাওয়ার ঝুঁকি।" },
      worn: { en: "Tread low, or more than 5 years old.", bn: "ট্রেড কম, বা ৫ বছরের বেশি পুরনো।" },
      bad: { en: "Cracked, bald or uneven.", bn: "ফাটা, ক্ষয়ে মসৃণ বা অসম।" },
    },
    {
      id: "brakes", at: [250, 104], label: { en: "Brakes", bn: "ব্রেক" },
      how: disc
        ? { en: "Look at the pad thickness and the disc for a ridge or blue marks. Squeeze the lever: it should be firm, not spongy. Check the rear brake too.", bn: "প্যাডের পুরুত্ব আর ডিস্কে খাঁজ বা নীল দাগ দেখুন। লিভার চাপুন: শক্ত লাগা উচিত, নরম নয়। পেছনের ব্রেকও দেখুন।" }
        : { en: "Drum brakes: check the lever travel and listen for grinding. Shoes are cheap, but a scored drum is not.", bn: "ড্রাম ব্রেক: লিভারের নড়াচড়া দেখুন, ঘষার শব্দ শুনুন। শু সস্তা, কিন্তু আঁচড় পড়া ড্রাম নয়।" },
      worn: { en: "Pads or shoes thin, a little noise.", bn: "প্যাড বা শু পাতলা, একটু শব্দ।" },
      bad: { en: "Scored disc or drum, soft lever, or it pulls to one side.", bn: "ডিস্ক বা ড্রামে আঁচড়, নরম লিভার, বা একদিকে টানে।" },
    },
    {
      id: "chain", at: [110, 130], label: cvt ? { en: "Drive belt and rollers", bn: "ড্রাইভ বেল্ট ও রোলার" } : { en: "Chain and sprockets", bn: "চেইন ও স্প্রকেট" },
      how: cvt
        ? { en: "Ask when the belt and rollers were last changed. Listen for a rattle on pull-away and watch for a shudder.", bn: "বেল্ট ও রোলার শেষ কবে বদলানো হয়েছে জিজ্ঞেস করুন। চলতে শুরুর সময় ঘটঘট শব্দ বা কাঁপুনি দেখুন।" }
        : { en: "Pull the chain at the rear of the sprocket: it should not lift off the teeth. Look for hooked, shark-fin teeth and rusty links.", bn: "স্প্রকেটের পেছনে চেইন টানুন: দাঁত থেকে উঠে আসা উচিত নয়। বাঁকা, হাঙরের পাখনার মতো দাঁত আর জং ধরা লিংক দেখুন।" },
      worn: { en: "Some slack, dry, a few stiff links.", bn: "কিছুটা ঢিলা, শুকনো, কয়েকটি শক্ত লিংক।" },
      bad: { en: "Lifts off the sprocket, hooked teeth or stuck links.", bn: "স্প্রকেট থেকে উঠে আসে, বাঁকা দাঁত বা আটকে যাওয়া লিংক।" },
    },
    {
      id: "clutch", at: [130, 104], label: cvt ? { en: "CVT clutch", bn: "সিভিটি ক্লাচ" } : { en: "Clutch", bn: "ক্লাচ" },
      how: { en: "In gear on level ground, release the clutch slowly and give gas. The revs should not climb while the bike barely moves. The lever should engage in the middle of its travel.", bn: "সমতল রাস্তায় গিয়ারে ক্লাচ ধীরে ছাড়ুন আর গ্যাস দিন। বাইক প্রায় না নড়ে রেভ বাড়া উচিত নয়। লিভার মাঝামাঝি জায়গায় ধরা উচিত।" },
      worn: { en: "Engages very late, or the lever is heavy.", bn: "অনেক দেরিতে ধরে, বা লিভার ভারী।" },
      bad: { en: "Slips under load, drags in neutral or judders.", bn: "লোডে পিছলায়, নিউট্রালে টানে বা কাঁপে।" },
    },
    {
      id: "engine", at: [165, 112], label: { en: "Engine", bn: "ইঞ্জিন" },
      how: two
        ? { en: "Start it cold. Look at the exhaust smoke (some is normal for a 2-stroke, a thick cloud is not). Listen for knocking or a rattle, and ask about piston, sleeve and rebore history.", bn: "ঠান্ডা অবস্থায় স্টার্ট দিন। এক্সহস্টের ধোঁয়া দেখুন (২-স্ট্রোকে কিছুটা স্বাভাবিক, ঘন মেঘ নয়)। ঠকঠক বা ঘটঘট শুনুন, আর পিস্টন, স্লিভ ও রিবোরের ইতিহাস জিজ্ঞেস করুন।" }
        : { en: "Start it cold. It should catch within a couple of kicks or one press. Look for smoke (white, blue or black), listen for ticking or knocking, and check the oil on the dipstick.", bn: "ঠান্ডা অবস্থায় স্টার্ট দিন। দু-এক কিকে বা একবারেই চালু হওয়া উচিত। ধোঁয়া (সাদা, নীল বা কালো) দেখুন, টিক বা ঠকঠক শুনুন, আর ডিপস্টিকে তেল দেখুন।" },
      worn: { en: "A light tick, a little smoke, hard to start cold.", bn: "হালকা টিক শব্দ, সামান্য ধোঁয়া, ঠান্ডায় স্টার্ট নিতে কষ্ট।" },
      bad: { en: "Knocking, heavy smoke, loses power, or oil mixed in the coolant or air box.", bn: "ঠকঠক, ঘন ধোঁয়া, শক্তি কমে যাওয়া, বা কুল্যান্ট/এয়ার বক্সে তেল মিশে যাওয়া।" },
    },
    {
      id: "fork", at: [228, 78], label: { en: "Front suspension", bn: "সামনের সাসপেনশন" },
      how: { en: "Look at the fork tubes for oil and pitting. Press the front down hard a few times: it should rise smoothly, with no clunk. Turn the bars lock to lock: they should move freely without a notch.", bn: "ফর্ক টিউবে তেল আর গর্ত দেখুন। সামনেটা কয়েকবার জোরে চাপুন: মসৃণভাবে উঠবে, খট শব্দ হবে না। হ্যান্ডেল দুই দিকে পুরো ঘোরান: কোনো খাঁজ ছাড়া মসৃণ হওয়া উচিত।" },
      worn: { en: "A little oil film, a bit soft.", bn: "সামান্য তেলের আস্তরণ, একটু নরম।" },
      bad: { en: "Dripping oil, pitted or bent tubes, a notchy head bearing.", bn: "তেল ঝরছে, টিউবে গর্ত বা বাঁকা, হেড বিয়ারিং খাঁজকাটা।" },
    },
    {
      id: "shock", at: [82, 80], label: { en: "Rear shock", bn: "পেছনের শক" },
      how: { en: "Sit on the seat and bounce. It should settle in one bounce. Look for oil on the shock body.", bn: "সিটে বসে ওঠানামা করুন। একবারেই থিতু হওয়া উচিত। শকের গায়ে তেল দেখুন।" },
      worn: { en: "Bounces twice, a little soft.", bn: "দুবার লাফায়, একটু নরম।" },
      bad: { en: "Oily, bottoms out or keeps bouncing.", bn: "তেলতেলে, নিচে ঠেকে যায় বা লাফাতেই থাকে।" },
    },
    {
      id: "electrics", at: [110, 60], label: { en: "Electrics and battery", bn: "ইলেকট্রিক্স ও ব্যাটারি" },
      how: { en: "Check the headlight (low and high), indicators, brake light, horn and the starter. Look for taped wires under the seat and signs of re-wiring.", bn: "হেডলাইট (লো ও হাই), ইন্ডিকেটর, ব্রেক লাইট, হর্ন ও স্টার্টার দেখুন। সিটের নিচে টেপ মারা তার আর নতুন করে করা ওয়্যারিং দেখুন।" },
      worn: { en: "Weak starter, dim light or an old battery.", bn: "দুর্বল স্টার্টার, ম্লান আলো বা পুরনো ব্যাটারি।" },
      bad: { en: "Lights flicker, charging fails or the wiring is patched.", bn: "আলো কাঁপে, চার্জ হয় না বা তারে জোড়াতালি।" },
    },
    {
      id: "frame", at: [150, 78], label: { en: "Frame and crash signs", bn: "ফ্রেম ও দুর্ঘটনার চিহ্ন" },
      how: { en: "Crouch and look along the bike from the front and back: the wheels should line up. Check for weld marks, fresh paint at the frame joints, bent footpegs and scraped handlebar ends.", bn: "বসে সামনে ও পেছন থেকে বাইকের সারি দেখুন: চাকা এক লাইনে থাকা উচিত। ওয়েল্ডের দাগ, ফ্রেমের জোড়ায় নতুন রং, বাঁকা ফুটরেস্ট আর ঘষা হ্যান্ডেলের মাথা দেখুন।" },
      worn: { en: "Old scrapes or a repaint, but straight.", bn: "পুরনো ঘষা বা রং করা, কিন্তু সোজা।" },
      bad: { en: "Bent, welded or the wheels do not line up. We would walk away.", bn: "বাঁকা, ওয়েল্ড করা বা চাকা এক লাইনে নেই। আমরা সরে আসতাম।" },
    },
    {
      id: "body", at: [185, 56], label: { en: "Paint, tank and body", bn: "রং, ট্যাংক ও বডি" },
      how: { en: "Look at the tank for dents and rust inside (open the cap with a torch). Check the panels for cracks and mismatched colour.", bn: "ট্যাংকে টোল আর ভেতরে জং দেখুন (টর্চ জ্বেলে ক্যাপ খুলে)। প্যানেলে ফাটল ও রঙের গরমিল দেখুন।" },
      worn: { en: "Scratches, small dents or faded panels.", bn: "আঁচড়, ছোট টোল বা ফ্যাকাশে প্যানেল।" },
      bad: { en: "Rust inside the tank, cracked panels or a bad repaint.", bn: "ট্যাংকের ভেতরে জং, ফাটা প্যানেল বা খারাপ রং।" },
    },
    {
      id: "service", at: null, label: { en: "Service history", bn: "সার্ভিসের ইতিহাস" },
      how: { en: "Ask for the service book or bills. Check the oil for colour and smell. No records on a bike that has done many km is a reason to ask for a discount.", bn: "সার্ভিস বুক বা বিল চান। তেলের রং ও গন্ধ দেখুন। অনেক কিমি চলা বাইকের কোনো রেকর্ড না থাকলে ছাড় চাওয়ার কারণ আছে।" },
      worn: { en: "Overdue for a service.", bn: "সার্ভিসের সময় পেরিয়ে গেছে।" },
      bad: { en: "No records and the oil looks neglected.", bn: "কোনো রেকর্ড নেই আর তেলে অবহেলার ছাপ।" },
    },
    {
      id: "papers", at: null, label: { en: "Papers", bn: "কাগজপত্র" },
      how: { en: "Blue book in the seller's name, chassis and engine number matching the book, tax token and fitness up to date. Look up dues on the BRTA portal.", bn: "বিক্রেতার নামে ব্লু বুক, বইয়ের সাথে চেসিস ও ইঞ্জিন নম্বর মিল, ট্যাক্স টোকেন ও ফিটনেস হালনাগাদ। BRTA পোর্টালে বকেয়া দেখুন।" },
      worn: { en: "Tax or fees are due. They become your bill.", bn: "ট্যাক্স বা ফি বকেয়া। এটা আপনার খরচ হবে।" },
      bad: { en: "Not in the seller's name, numbers differ or the book is missing. We would walk away.", bn: "বিক্রেতার নামে নয়, নম্বর মেলে না বা বই নেই। আমরা সরে আসতাম।" },
    },
  ];
}

type DeductBike = Pick<BikeLite, "parts" | "category" | "tyrePairBDT" | "avgServiceCostBDT">;

/** What to take off the price for a part in the given state. `fair` is the expected price of a decent unit. */
export function deduction(b: DeductBike, id: PartId, state: PartState, fair: number): Deduction | null {
  if (state === "ok") return null;
  const bad = state === "bad";
  const part = (name: string) => b.parts.find((p) => p.name === name)?.priceBDT;
  const pct = (worn: number, badP: number, what: Bi): Deduction => {
    const p = bad ? badP : worn;
    return { amount: round500(Math.max(1500, fair * p)), kind: "estimate", basis: { en: `${Math.round(p * 100)}% of the expected price. ${what.en}`, bn: `প্রত্যাশিত দামের ${Math.round(p * 100)}%। ${what.bn}` } };
  };
  const flat = (worn: number, badP: number, what: Bi): Deduction => {
    const n = bad ? badP : worn;
    return { amount: n, kind: "estimate", basis: { en: `${fmt(n)}, a typical workshop price (our assumption). ${what.en}`, bn: `${fmt(n)}, সাধারণ ওয়ার্কশপের দাম (আমাদের ধারণা)। ${what.bn}` } };
  };
  const guess: Bi = { en: "A mechanic's quote will be more accurate.", bn: "মিস্ত্রির কোটেশন আরও সঠিক হবে।" };

  switch (id) {
    case "frontTyre":
    case "rearTyre": {
      const each = (b.tyrePairBDT ?? TYRE_PAIR[b.category]) / 2;
      const n = bad ? each + 300 : each * 0.5;
      return {
        amount: round500(n), kind: "parts",
        basis: { en: `${bad ? "A new tyre, plus fitting," : "Half a new tyre, since it is half worn,"} at about ${fmt(each)} a tyre for this bike.`, bn: `এই বাইকের টায়ার প্রতিটি প্রায় ${fmt(each)} ধরে ${bad ? "একটি নতুন টায়ার ও লাগানোর খরচ" : "অর্ধেক টায়ারের দাম, কারণ অর্ধেক ক্ষয়ে গেছে"}।` },
      };
    }
    case "brakes": {
      const pads = part("Brake pads/shoes (front)");
      if (!pads) return flat(1500, 4500, guess);
      const n = bad ? pads * 2 + 1500 : pads;
      return {
        amount: round500(n), kind: "parts",
        basis: { en: `${bad ? "Front and rear pads, plus ৳1,500 to skim or replace the disc or drum (our assumption)," : "A set of pads,"} at ${fmt(pads)} a set from our parts list.`, bn: `আমাদের পার্টস তালিকার ${fmt(pads)} সেট দরে ${bad ? "সামনে ও পেছনের প্যাড, সাথে ডিস্ক বা ড্রাম ঠিক করতে ৳১,৫০০ (আমাদের ধারণা)" : "এক সেট প্যাড"}।` },
      };
    }
    case "chain": {
      const c = part("Chain & sprocket set");
      if (!c) return flat(1500, 3500, guess);
      const n = bad ? c + 400 : c * 0.6;
      return {
        amount: round500(n), kind: "parts",
        basis: { en: `${bad ? "A new set plus labour" : "60% of a new set"}, with a set at ${fmt(c)} from our parts list.`, bn: `আমাদের পার্টস তালিকার সেট ${fmt(c)} ধরে ${bad ? "নতুন সেট ও মজুরি" : "নতুন সেটের ৬০%"}।` },
      };
    }
    case "clutch": {
      const c = part("Clutch plate set");
      if (!c) return flat(2000, 5000, guess);
      const n = bad ? c + 2500 : c + 800;
      return {
        amount: round500(n), kind: "parts",
        basis: { en: `A clutch plate set at ${fmt(c)} from our parts list, plus ${bad ? "৳2,500 for the basket, cable and labour" : "৳800 labour"} (our assumption).`, bn: `আমাদের পার্টস তালিকার ${fmt(c)} দরে ক্লাচ প্লেট সেট, সাথে ${bad ? "বাস্কেট, কেবল ও মজুরি ৳২,৫০০" : "মজুরি ৳৮০০"} (আমাদের ধারণা)।` },
      };
    }
    case "engine":
      return pct(0.06, 0.18, { en: "A top-end or full overhaul can cost far more, so get a mechanic to listen before you pay.", bn: "টপ-এন্ড বা পুরো ওভারহল অনেক বেশি পড়তে পারে, তাই টাকা দেওয়ার আগে মিস্ত্রিকে শোনান।" });
    case "fork":
      return flat(2500, 7000, { en: "Seals and oil, or a replacement tube.", bn: "সিল ও তেল, বা টিউব বদল।" });
    case "shock":
      return flat(1500, 4500, { en: "A rebuild or a new shock.", bn: "মেরামত বা নতুন শক।" });
    case "electrics":
      return flat(2200, 6000, { en: "A battery, or rewiring in the bad case.", bn: "ব্যাটারি, আর খারাপ হলে নতুন ওয়্যারিং।" });
    case "body":
      return pct(0.02, 0.06, { en: "Paint and panels.", bn: "রং ও প্যানেল।" });
    case "service": {
      const s = b.avgServiceCostBDT;
      const n = bad ? s * 1.5 : s;
      return {
        amount: round500(n), kind: "parts",
        basis: { en: `${bad ? "A service, fresh fluids and a first look-over" : "A service"}, with a dealer service for this model at about ${fmt(s)}.`, bn: `এই মডেলের ডিলার সার্ভিস প্রায় ${fmt(s)} ধরে ${bad ? "সার্ভিস, তেল বদল ও প্রথম পরীক্ষা" : "একটি সার্ভিস"}।` },
      };
    }
    case "frame":
      return bad
        ? { amount: round500(fair * 0.25), kind: "walk", basis: { en: "A bent or welded frame never rides right again. 25% off is what you'd ask if you go ahead anyway, and we would not.", bn: "বাঁকা বা ওয়েল্ড করা ফ্রেম আর কখনো ঠিকমতো চলে না। তবু এগোলে ২৫% কম চাইবেন, কিন্তু আমরা এগোতাম না।" } }
        : pct(0.05, 0.25, { en: "A repaint hides what was under it.", bn: "রং করলে নিচে কী ছিল তা ঢাকা পড়ে।" });
    case "papers":
      return bad
        ? { amount: round500(fair * 0.4), kind: "walk", basis: { en: "Without valid papers you may not be able to transfer or insure it. 40% off is a guide, but the right move is to wait until they are fixed.", bn: "বৈধ কাগজ ছাড়া হস্তান্তর বা বিমা নাও হতে পারে। ৪০% কম একটি আন্দাজ, তবে ঠিক হওয়া পর্যন্ত অপেক্ষা করাই সঠিক।" } }
        : { amount: round500(fair * 0.03), kind: "estimate", basis: { en: "3% of the expected price as a rough allowance. Look up the exact dues on the BRTA portal.", bn: "প্রত্যাশিত দামের ৩% মোটামুটি ধরে। সঠিক বকেয়া BRTA পোর্টালে দেখুন।" } };
  }
}

export interface Negotiation {
  rows: { id: PartId; state: PartState; d: Deduction }[];
  /** Full cost of everything you marked, leaving out walk-away items. */
  total: number;
  /** What you can ask off: the whole amount. */
  askOff: number;
  /** Where deals usually land: about two-thirds, since sellers push back. */
  settleOff: number;
  /** The offer to open with, the price to aim for, and the most to pay. */
  openAt: number;
  target: number;
  walkAbove: number;
  walk: boolean;
}

export const SETTLE_SHARE = 0.65;

export function negotiate(b: DeductBike, states: Partial<Record<PartId, PartState>>, fair: number): Negotiation {
  const rows = (Object.entries(states) as [PartId, PartState][])
    .map(([id, state]) => ({ id, state, d: deduction(b, id, state, fair) }))
    .filter((r): r is { id: PartId; state: PartState; d: Deduction } => r.d !== null);
  const total = rows.filter((r) => r.d.kind !== "walk").reduce((s, r) => s + r.d.amount, 0);
  const floor = Math.max(5000, fair * 0.12);
  const target = Math.max(floor, round500(fair - total));
  const askOff = fair - target;
  const settleOff = round500(askOff * SETTLE_SHARE);
  return {
    rows, total, askOff, settleOff,
    openAt: Math.max(floor, round500(fair - total * 1.15)),
    target,
    walkAbove: Math.max(floor, round500(fair - settleOff)),
    walk: rows.some((r) => r.d.kind === "walk"),
  };
}
