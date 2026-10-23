// Weekly bike spotlights: each week, 5 bikes that each win a different segment of "Best in BD by segment"
// (docs/each bike speciality.html, section 3). Prices, mileage, power and scores are read from bikes.json at build
// time, so the text never drifts from the data. Each post's quiz claim is its `bestCase`, which a test re-runs against match.ts.
import { bnDigits, formatBDT, getBike } from "./bikes";
import { onRoadPrice } from "./cost";
import type { Pair } from "./maintenance-posts";
import type { Answers } from "./match";

export type Spotlight = {
  slug: string;
  week: number;
  updated: string;
  minutes: number;
  bike: string; // bikes.json id
  rival: string; // the bike it is most often weighed against; linked as a comparison
  /** The quiz answers the text says it comes first for, with the budget at its on-road price; tests/spotlight.test.ts re-runs them. */
  bestCase: Partial<Answers>;
  wins: Pair; // the segment it wins
  title: Pair;
  summary: Pair;
  why: Pair[];
  who: Pair[];
  tradeoffs: Pair[];
};

const bike = (id: string) => {
  const b = getBike(id);
  if (!b) throw new Error(`spotlight: unknown bike id ${id}`);
  return b;
};
const road = (id: string) => formatBDT(onRoadPrice(bike(id)));
const kmpl = (id: string) => bike(id).mileageKmpl.join("-");
const ps = (id: string) => bike(id).powerPS;
const sc = (id: string) => bike(id).scores;
const gap = (a: string, b: string) => formatBDT(Math.abs(onRoadPrice(bike(a)) - onRoadPrice(bike(b))));

const GLINT = "lifan-glint-100";
const HF = "hero-hf-deluxe";
const FZS = "yamaha-fzs-fi-v4";
const GSXR = "suzuki-gsx-r150";
const METEOR = "royal-enfield-meteor-350";
const fzsUsed = bike(FZS).usedPrice;
const SPLENDOR = "hero-splendor-plus";
const SHINE = "honda-shine-100";
const DREAM = "honda-dream-110";
const RAIDER = "tvs-raider-125";
const R15 = "yamaha-r15-v4";
const PLATINA = "bajaj-platina-100";
const RADEON = "tvs-radeon";
const GLAMOUR = "hero-glamour-x-125";
const N250 = "bajaj-pulsar-n250";
const NX200 = "honda-nx200";
const BULLET = "runner-bullet-100-v2";
const CT = "bajaj-ct100";
const SP125 = "honda-sp125";
const F250 = "bajaj-pulsar-f250";
const APACHE4V = "tvs-apache-rtr-160-4v";
const svc = (id: string) => `${bike(id).serviceIntervalKm.toLocaleString("en-IN")} km`;
const samePrice = (a: string, b: string) => onRoadPrice(bike(a)) === onRoadPrice(bike(b));
/** "less" or "more": how a's on-road price compares with b's, so a gap sentence stays true when prices move. */
const lessMore = (a: string, b: string): Pair => (onRoadPrice(bike(a)) <= onRoadPrice(bike(b)) ? ["less", "কম"] : ["more", "বেশি"]);
const sp125Used = bike(SP125).usedPrice;

const POSTS: Spotlight[] = [
  {
    slug: "lifan-glint-100-cheapest-new-bike",
    bestCase: { use: "commute", where: "dhaka", experience: "first", pillion: "sometimes" },
    week: 1,
    updated: "2026-10-15",
    minutes: 4,
    bike: GLINT,
    rival: "honda-shine-100",
    wins: ["Budget: cheapest new bike", "বাজেট: সবচেয়ে সস্তা নতুন বাইক"],
    title: ["Lifan Glint 100: the cheapest new bike in Bangladesh", "Lifan Glint 100: বাংলাদেশের সবচেয়ে সস্তা নতুন বাইক"],
    summary: [
      `At ${road(GLINT)} on the road it is the lowest price for a brand-new motorcycle on our list. Here is what that money buys, and what it does not.`,
      `অন-রোড ${road(GLINT)}, আমাদের তালিকায় একদম নতুন মোটরসাইকেলের সবচেয়ে কম দাম। এই টাকায় কী পাচ্ছেন আর কী পাচ্ছেন না, তা এখানে।`,
    ],
    why: [
      [
        `Price. ${road(GLINT)} on the road (showroom price plus BRTA registration). The next cheapest new bike, the Runner Bullet 100 V2, costs ${gap(GLINT, "runner-bullet-100-v2")} more.`,
        `দাম। অন-রোড ${road(GLINT)} (শোরুমের দাম আর BRTA রেজিস্ট্রেশন মিলিয়ে)। এর পরের সস্তা নতুন বাইক Runner Bullet 100 V2-এর দাম ${gap(GLINT, "runner-bullet-100-v2")} বেশি।`,
      ],
      [
        `It is not bare. ${ps(GLINT)} PS, ${bike(GLINT).weightKg} kg, a ${bike(GLINT).fuelTankL} L tank and a front disc brake, which many costlier 100cc bikes skip.`,
        `একেবারে খালি নয়। ${ps(GLINT)} PS, ${bike(GLINT).weightKg} কেজি, ${bike(GLINT).fuelTankL} লিটারের ট্যাংক আর সামনে ডিস্ক ব্রেক, যা অনেক দামি ১০০সিসি বাইকেও থাকে না।`,
      ],
      [
        "A simple carburettor 100cc engine. Local mechanics know this kind of engine, so basic work does not need the dealer.",
        "সহজ কার্বুরেটর ১০০সিসি ইঞ্জিন। এ ধরনের ইঞ্জিন লোকাল মেকানিকরা চেনেন, তাই সাধারণ কাজে ডিলারের কাছে যেতে হয় না।",
      ],
    ],
    who: [
      [
        "In our quiz, with the budget set at its own on-road price, it comes first for: a daily commute in Dhaka, a first bike, a pillion now and then.",
        "আমাদের কুইজে বাজেট এই বাইকের নিজের অন-রোড দামে রাখলে এটি প্রথম হয় এই উত্তরে: ঢাকায় রোজকার যাতায়াত, প্রথম বাইক, মাঝে মাঝে পেছনে একজন।",
      ],
      [
        "Riders who want a new bike, not someone else's problems, and cannot stretch past a lakh, for short errands and town trips.",
        "যাঁরা অন্যের ঝামেলাসহ পুরনো বাইক নয়, নতুন বাইক চান কিন্তু এক লাখের বেশি খরচ করা সম্ভব নয়, ছোট কাজ আর শহরের ভেতরে চলার জন্য।",
      ],
    ],
    tradeoffs: [
      [
        `Resale is the weak point: ${sc(GLINT).resale}/10 on our scale. Expect to lose much more of the price when you sell than on a Hero or Honda.`,
        `রিসেল দুর্বল: আমাদের স্কেলে ${sc(GLINT).resale}/১০। বিক্রির সময় Hero বা Honda-র চেয়ে অনেক বেশি দাম হারাবেন।`,
      ],
      [
        `Reliability ${sc(GLINT).reliability}/10 and parts availability ${sc(GLINT).partsAvailability}/10, against ${sc("honda-shine-100").reliability}/10 and ${sc("honda-shine-100").partsAvailability}/10 for the Honda Shine 100, which costs ${gap(GLINT, "honda-shine-100")} more on the road.`,
        `নির্ভরযোগ্যতা ${sc(GLINT).reliability}/১০ আর পার্টস পাওয়া ${sc(GLINT).partsAvailability}/১০; Honda Shine 100-এ এগুলো ${sc("honda-shine-100").reliability}/১০ আর ${sc("honda-shine-100").partsAvailability}/১০, দাম অন-রোড ${gap(GLINT, "honda-shine-100")} বেশি।`,
      ],
      [
        `Real-world mileage ${kmpl(GLINT)} km/l, below the ${kmpl(HF)} km/l of the frugal Hero 100s. Over a few years the fuel bill eats part of the saving.`,
        `বাস্তবে মাইলেজ ${kmpl(GLINT)} কিমি/লি, সাশ্রয়ী Hero ১০০সিসি বাইকগুলোর ${kmpl(HF)} কিমি/লি-এর চেয়ে কম। কয়েক বছরে তেলের খরচ সাশ্রয়ের একটা অংশ খেয়ে ফেলে।`,
      ],
      [
        "Tube-type tyres (a puncture means a roadside repair, not a quick plug), and the seat height is listed as both 775 and 810 mm, so sit on one before you buy.",
        "টিউবওয়ালা টায়ার (পাংচার হলে প্লাগ দিয়ে সারানো যায় না, টিউব সারাতে হয়), আর সিটের উচ্চতা কোথাও ৭৭৫, কোথাও ৮১০ মিমি লেখা, তাই কেনার আগে বসে দেখুন।",
      ],
    ],
  },
  {
    slug: "hero-hf-deluxe-best-mileage",
    bestCase: { use: "commute", where: "dhaka", pillion: "rarely", priorities: ["mileage", "resale"] },
    week: 1,
    updated: "2026-10-15",
    minutes: 4,
    bike: HF,
    rival: "hero-splendor-plus",
    wins: ["Mileage and low running cost", "মাইলেজ আর কম চালানোর খরচ"],
    title: ["Hero HF Deluxe: the most km per litre for the least money", "Hero HF Deluxe: সবচেয়ে কম টাকায় লিটারে সবচেয়ে বেশি কিলোমিটার"],
    summary: [
      `${kmpl(HF)} km/l in real riding, the joint best of any petrol bike we list, and joint cheapest of all to keep running.`,
      `বাস্তবে ${kmpl(HF)} কিমি/লি, আমাদের তালিকার পেট্রোল বাইকগুলোর মধ্যে যৌথভাবে সেরা, আর চালিয়ে রাখার খরচে যৌথভাবে সবচেয়ে সস্তা।`,
    ],
    why: [
      [
        `Mileage. ${kmpl(HF)} km/l real-world. Only an electric scooter beats it on our list; among petrol bikes it ties with the Splendor+ and the Bajaj 100s.`,
        `মাইলেজ। বাস্তবে ${kmpl(HF)} কিমি/লি। আমাদের তালিকায় শুধু একটি ইলেকট্রিক স্কুটার এর চেয়ে এগিয়ে; পেট্রোল বাইকের মধ্যে Splendor+ আর Bajaj-এর ১০০সিসি বাইকগুলোর সাথে সমান।`,
      ],
      [
        `Joint cheapest to maintain on our list (with the Splendor+): a service every ${bike(HF).serviceIntervalKm.toLocaleString("en-IN")} km at about ${formatBDT(bike(HF).avgServiceCostBDT)}, mechanic familiarity ${sc(HF).mechanicFamiliarity}/10 and parts availability ${sc(HF).partsAvailability}/10.`,
        `আমাদের তালিকায় রক্ষণাবেক্ষণে যৌথভাবে সবচেয়ে সস্তা (Splendor+-এর সাথে): প্রতি ${bike(HF).serviceIntervalKm.toLocaleString("en-IN")} কিমিতে সার্ভিস, খরচ মোটামুটি ${formatBDT(bike(HF).avgServiceCostBDT)}; মেকানিক চেনে ${sc(HF).mechanicFamiliarity}/১০, পার্টস পাওয়া ${sc(HF).partsAvailability}/১০।`,
      ],
      [
        `Reliability ${sc(HF).reliability}/10. It uses the same 97cc engine as the Splendor+, one of the most proven engines on Bangladeshi roads.`,
        `নির্ভরযোগ্যতা ${sc(HF).reliability}/১০। Splendor+-এর একই ৯৭সিসি ইঞ্জিন, বাংলাদেশের রাস্তায় সবচেয়ে পরীক্ষিত ইঞ্জিনগুলোর একটি।`,
      ],
    ],
    who: [
      [
        "In our quiz, with the budget set at its own on-road price, it comes first for: Dhaka commuting, rarely a pillion, with mileage and resale as priorities.",
        "আমাদের কুইজে বাজেট এই বাইকের নিজের অন-রোড দামে রাখলে এটি প্রথম হয় এই উত্তরে: ঢাকায় যাতায়াত, পেছনে কেউ কম বসেন, আর অগ্রাধিকার মাইলেজ ও রিসেল।",
      ],
      [
        "Delivery and ride-share riders who count every litre, students, and anyone whose bike is a tool, not a hobby.",
        "যে ডেলিভারি আর রাইড-শেয়ার চালকরা প্রতিটি লিটার হিসাব করেন, ছাত্রছাত্রী, আর যাঁদের কাছে বাইক শখ নয়, কাজের যন্ত্র।",
      ],
    ],
    tradeoffs: [
      [
        "Drum brakes at both ends and no CBS. Fine in town traffic, weak at highway speed. Leave more gap than you think.",
        "সামনে-পেছনে দুটোই ড্রাম ব্রেক, CBS নেই। শহরের ভিড়ে চলে, হাইওয়ের গতিতে দুর্বল। যতটা ভাবেন তার চেয়ে বেশি দূরত্ব রাখুন।",
      ],
      [
        `${ps(HF)} PS, 4 gears and a top speed around ${bike(HF).topSpeedKmh} km/h. Highway score ${sc(HF).highway}/10: this is not a long-distance bike.`,
        `${ps(HF)} PS, ৪টি গিয়ার আর সর্বোচ্চ গতি প্রায় ${bike(HF).topSpeedKmh} কিমি/ঘণ্টা। হাইওয়ে স্কোর ${sc(HF).highway}/১০: দূরের পথের বাইক নয়।`,
      ],
      [
        `Basic seat and suspension (comfort ${sc(HF).comfort}/10). The Splendor+ has the same engine with a little more comfort and better resale (${sc("hero-splendor-plus").resale}/10 vs ${sc(HF).resale}/10) for ${gap(HF, "hero-splendor-plus")} more on the road.`,
        `সাধারণ সিট আর সাসপেনশন (আরাম ${sc(HF).comfort}/১০)। Splendor+-এ একই ইঞ্জিন, একটু বেশি আরাম আর ভালো রিসেল (${sc("hero-splendor-plus").resale}/১০ বনাম ${sc(HF).resale}/১০), অন-রোড ${gap(HF, "hero-splendor-plus")} বেশি দামে।`,
      ],
    ],
  },
  {
    slug: "yamaha-fzs-fi-v4-best-resale",
    bestCase: { use: "commute", where: "dhaka", height: "short", pillion: "rarely", priorities: ["maintenance", "resale", "safety", "style"] },
    week: 1,
    updated: "2026-10-15",
    minutes: 4,
    bike: FZS,
    rival: "suzuki-gixxer-fi-abs",
    wins: ["Resale value", "রিসেল ভ্যালু"],
    title: ["Yamaha FZS FI V4: the 150cc that holds its value best", "Yamaha FZS FI V4: যে ১৫০সিসি বাইকের দাম সবচেয়ে কম পড়ে"],
    summary: [
      `Resale ${sc(FZS).resale}/10, the joint top score on our list, on a reliable, easy 150cc. You pay more up front and get more back when you sell.`,
      `রিসেল ${sc(FZS).resale}/১০, আমাদের তালিকার যৌথ সর্বোচ্চ, সাথে নির্ভরযোগ্য আর সহজ একটি ১৫০সিসি। শুরুতে বেশি দেন, বিক্রির সময় বেশি ফেরত পান।`,
    ],
    why: [
      [
        `Resale ${sc(FZS).resale}/10, shared among new bikes only with the Splendor+ and the R15 V4.${fzsUsed?.y1 && fzsUsed.y3 ? ` In ${fzsUsed.listingsSeen} used listings we checked (${fzsUsed.asOf}), one-year-old bikes asked about ${formatBDT(fzsUsed.y1)} and three-year-old ones about ${formatBDT(fzsUsed.y3)}, against ${formatBDT(bike(FZS).priceBDT)} new.` : ""}`,
        `রিসেল ${sc(FZS).resale}/১০, নতুন বাইকের মধ্যে এই স্কোর আছে শুধু Splendor+ আর R15 V4-এর।${fzsUsed?.y1 && fzsUsed.y3 ? ` আমাদের দেখা ${fzsUsed.listingsSeen}টি পুরনো বাইকের বিজ্ঞাপনে (${fzsUsed.asOf}) এক বছরের পুরনোর চাওয়া দাম প্রায় ${formatBDT(fzsUsed.y1)}, তিন বছরের প্রায় ${formatBDT(fzsUsed.y3)}; নতুনের দাম ${formatBDT(bike(FZS).priceBDT)}।` : ""}`,
      ],
      [
        `Reliability ${sc(FZS).reliability}/10, mechanic familiarity ${sc(FZS).mechanicFamiliarity}/10, parts ${sc(FZS).partsAvailability}/10. The FZ family is the 150cc platform Bangladeshi mechanics know best after the Pulsar.`,
        `নির্ভরযোগ্যতা ${sc(FZS).reliability}/১০, মেকানিক চেনে ${sc(FZS).mechanicFamiliarity}/১০, পার্টস ${sc(FZS).partsAvailability}/১০। Pulsar-এর পরে FZ পরিবারকেই বাংলাদেশের মেকানিকরা সবচেয়ে ভালো চেনেন।`,
      ],
      [
        `Easy to live with: ${bike(FZS).seatHeightMm} mm seat, ${bike(FZS).weightKg} kg, a fat rear tyre, front ABS and a rear disc. Beginner-friendly ${sc(FZS).beginnerFriendly}/10.`,
        `সাথে থাকা সহজ: ${bike(FZS).seatHeightMm} মিমি সিট, ${bike(FZS).weightKg} কেজি, মোটা পেছনের টায়ার, সামনে ABS আর পেছনে ডিস্ক। নতুনদের জন্য ${sc(FZS).beginnerFriendly}/১০।`,
      ],
    ],
    who: [
      [
        "In our quiz, with the budget set at its own on-road price, it comes first for: a Dhaka commute, a shorter rider, rarely a pillion, with low maintenance, resale, safety and style as priorities.",
        "আমাদের কুইজে বাজেট এই বাইকের নিজের অন-রোড দামে রাখলে এটি প্রথম হয় এই উত্তরে: ঢাকায় যাতায়াত, কম উচ্চতার চালক, পেছনে কেউ কম বসেন, আর অগ্রাধিকার কম রক্ষণাবেক্ষণ, রিসেল, নিরাপত্তা ও স্টাইল।",
      ],
      [
        "Buyers who plan to sell or upgrade in two or three years, and first-time 150cc owners who want something that will not surprise them.",
        "যাঁরা দুই-তিন বছর পর বিক্রি বা বদলাতে চান, আর যাঁরা প্রথমবার ১৫০সিসি কিনছেন এবং কোনো ঝামেলা চান না।",
      ],
    ],
    tradeoffs: [
      [
        `Modest power: ${ps(FZS)} PS. It runs out of breath above 100 km/h. The Gixxer FI ABS makes ${ps("suzuki-gixxer-fi-abs")} PS for ${gap(FZS, "suzuki-gixxer-fi-abs")} less on the road, but its resale is ${sc("suzuki-gixxer-fi-abs").resale}/10.`,
        `শক্তি মাঝারি: ${ps(FZS)} PS। ১০০ কিমি/ঘণ্টার ওপরে দম ফুরিয়ে যায়। Gixxer FI ABS দেয় ${ps("suzuki-gixxer-fi-abs")} PS, অন-রোড ${gap(FZS, "suzuki-gixxer-fi-abs")} কমে, কিন্তু তার রিসেল ${sc("suzuki-gixxer-fi-abs").resale}/১০।`,
      ],
      [
        `${road(FZS)} on the road is a lot for its power. You are paying for the badge, the network and the resale.`,
        `অন-রোড ${road(FZS)} এর শক্তির তুলনায় অনেক। আপনি টাকা দিচ্ছেন নাম, সার্ভিস নেটওয়ার্ক আর রিসেলের জন্য।`,
      ],
      [
        `Mileage ${kmpl(FZS)} km/l, normal for a 150. Some owners find the seat hard after an hour.`,
        `মাইলেজ ${kmpl(FZS)} কিমি/লি, ১৫০সিসির জন্য স্বাভাবিক। কিছু মালিকের মতে এক ঘণ্টা পর সিট শক্ত লাগে।`,
      ],
    ],
  },
  {
    slug: "suzuki-gsx-r150-most-fun",
    bestCase: { use: "fun", height: "short", experience: "some", pillion: "rarely", priorities: ["performance"] },
    week: 1,
    updated: "2026-10-15",
    minutes: 4,
    bike: GSXR,
    rival: "yamaha-r15-v4",
    wins: ["Most fun to ride", "চালাতে সবচেয়ে মজা"],
    title: ["Suzuki GSX-R150: the most fun you can have on a 150", "Suzuki GSX-R150: ১৫০সিসিতে সবচেয়ে বেশি মজা"],
    summary: [
      `${ps(GSXR)} PS in a ${bike(GSXR).weightKg} kg bike with dual-channel ABS. It tops our fun, looks and braking lists, and asks a lot in return.`,
      `${bike(GSXR).weightKg} কেজির বাইকে ${ps(GSXR)} PS, সাথে ডুয়াল-চ্যানেল ABS। আমাদের মজা, লুক আর ব্রেকিং তিন তালিকারই শীর্ষে, তবে বদলে অনেক কিছু চায়।`,
    ],
    why: [
      [
        `The most powerful 150 on sale: ${ps(GSXR)} PS from a liquid-cooled DOHC engine that pulls to over 10,000 rpm, and a performance score of ${sc(GSXR).performance}/10.`,
        `বিক্রি হওয়া ১৫০সিসির মধ্যে সবচেয়ে শক্তিশালী: লিকুইড-কুলড DOHC ইঞ্জিন থেকে ${ps(GSXR)} PS, ১০,০০০ আরপিএম-এর ওপরেও টানে; পারফরম্যান্স স্কোর ${sc(GSXR).performance}/১০।`,
      ],
      [
        `Light: ${bike(GSXR).weightKg} kg, ${bike("yamaha-r15-v4").weightKg - bike(GSXR).weightKg} kg less than the R15 V4, which also makes less power (${ps("yamaha-r15-v4")} PS) and costs ${gap(GSXR, "yamaha-r15-v4")} more on the road.`,
        `হালকা: ${bike(GSXR).weightKg} কেজি, R15 V4-এর চেয়ে ${bike("yamaha-r15-v4").weightKg - bike(GSXR).weightKg} কেজি কম; R15 V4-এর শক্তিও কম (${ps("yamaha-r15-v4")} PS), দাম অন-রোড ${gap(GSXR, "yamaha-r15-v4")} বেশি।`,
      ],
      [
        "Dual-channel ABS with discs at both ends, the top braking setup on our list. Six gears.",
        "দুই চাকাতেই ডিস্ক আর ডুয়াল-চ্যানেল ABS, আমাদের তালিকার সেরা ব্রেকিং সেটআপ। ৬টি গিয়ার।",
      ],
    ],
    who: [
      [
        "A specialist: in our quiz, with the budget set at its own on-road price, it comes first for: riding for fun, a shorter rider with some experience, rarely a pillion, with performance as the priority.",
        "বিশেষজ্ঞ বাইক: আমাদের কুইজে বাজেট এই বাইকের নিজের অন-রোড দামে রাখলে এটি প্রথম হয় এই উত্তরে: শখে চালানো, কিছুটা অভিজ্ঞ ও কম উচ্চতার চালক, পেছনে কেউ কম বসেন, আর অগ্রাধিকার পারফরম্যান্স।",
      ],
      [
        "Weekend riders with a second way to get to work, and experienced riders who want a light sport bike more than a status badge.",
        "যাঁরা ছুটির দিনে চালান আর অফিসে যাওয়ার অন্য উপায় আছে, আর অভিজ্ঞ চালক যাঁরা নামের চেয়ে হালকা স্পোর্ট বাইক বেশি চান।",
      ],
    ],
    tradeoffs: [
      [
        `Parts and mechanics: availability ${sc(GSXR).partsAvailability}/10 and familiarity ${sc(GSXR).mechanicFamiliarity}/10. Brake pads and the air filter are dealer-only, a clutch plate set is rare, and imported parts can take weeks.`,
        `পার্টস আর মেকানিক: পাওয়া ${sc(GSXR).partsAvailability}/১০, মেকানিক চেনে ${sc(GSXR).mechanicFamiliarity}/১০। ব্রেক প্যাড আর এয়ার ফিল্টার শুধু ডিলারের কাছে, ক্লাচ প্লেট সেট দুষ্প্রাপ্য, আমদানির পার্টস আসতে কয়েক সপ্তাহ লাগতে পারে।`,
      ],
      [
        `Peaky in traffic: weak below 7,000 rpm, so Dhaka jams mean constant gear changes. Comfort ${sc(GSXR).comfort}/10, pillion ${sc(GSXR).pillion}/10.`,
        `ভিড়ে কষ্ট: ৭,০০০ আরপিএম-এর নিচে দুর্বল, তাই ঢাকার জ্যামে বারবার গিয়ার বদলাতে হয়। আরাম ${sc(GSXR).comfort}/১০, পেছনের যাত্রী ${sc(GSXR).pillion}/১০।`,
      ],
      [
        `Resale ${sc(GSXR).resale}/10, against ${sc("yamaha-r15-v4").resale}/10 for the R15 V4. A service costs about ${formatBDT(bike(GSXR).avgServiceCostBDT)}, and mileage is ${kmpl(GSXR)} km/l.`,
        `রিসেল ${sc(GSXR).resale}/১০, R15 V4-এর ${sc("yamaha-r15-v4").resale}/১০। প্রতি সার্ভিসে খরচ প্রায় ${formatBDT(bike(GSXR).avgServiceCostBDT)}, মাইলেজ ${kmpl(GSXR)} কিমি/লি।`,
      ],
    ],
  },
  {
    slug: "royal-enfield-meteor-350-best-highway",
    bestCase: { use: "highway", height: "short", experience: "some", priorities: ["comfort"] },
    week: 1,
    updated: "2026-10-15",
    minutes: 4,
    bike: METEOR,
    rival: "royal-enfield-classic-350",
    wins: ["Highway cruising", "হাইওয়ে ক্রুজিং"],
    title: ["Royal Enfield Meteor 350: the best highway bike you can buy new", "Royal Enfield Meteor 350: নতুন কেনা যায় এমন সেরা হাইওয়ে বাইক"],
    summary: [
      `Highway ${sc(METEOR).highway}/10 and comfort ${sc(METEOR).comfort}/10, the top pair on our list, and the best for a pillion too. Clumsy in Dhaka traffic.`,
      `হাইওয়ে ${sc(METEOR).highway}/১০ আর আরাম ${sc(METEOR).comfort}/১০, আমাদের তালিকায় সবার ওপরে, পেছনের যাত্রীর জন্যও সেরা। ঢাকার ভিড়ে অস্বস্তিকর।`,
    ],
    why: [
      [
        `Highway ${sc(METEOR).highway}/10 with comfort ${sc(METEOR).comfort}/10. A ${bike(METEOR).engine.cc.toFixed(0)}cc engine with ${bike(METEOR).torqueNm} Nm of torque at low rpm makes 80-90 km/h effortless.`,
        `হাইওয়ে ${sc(METEOR).highway}/১০, আরাম ${sc(METEOR).comfort}/১০। ${bike(METEOR).engine.cc.toFixed(0)}সিসি ইঞ্জিনের কম আরপিএম-এ ${bike(METEOR).torqueNm} Nm টর্ক, তাই ৮০-৯০ কিমি/ঘণ্টা একদম সহজ।`,
      ],
      [
        `Best for two: pillion ${sc(METEOR).pillion}/10, also the top of our pillion and family list. A ${bike(METEOR).fuelTankL} L tank and a service every ${bike(METEOR).serviceIntervalKm.toLocaleString("en-IN")} km.`,
        `দুজনের জন্য সেরা: পেছনের যাত্রী ${sc(METEOR).pillion}/১০, আমাদের পিলিয়ন আর পরিবার তালিকারও শীর্ষে। ${bike(METEOR).fuelTankL} লিটারের ট্যাংক, সার্ভিস প্রতি ${bike(METEOR).serviceIntervalKm.toLocaleString("en-IN")} কিমিতে।`,
      ],
      [
        `A low ${bike(METEOR).seatHeightMm} mm seat, so shorter riders can put both feet down, plus dual-channel ABS and discs at both ends.`,
        `নিচু ${bike(METEOR).seatHeightMm} মিমি সিট, কম উচ্চতার চালকও দুই পা মাটিতে রাখতে পারেন; সাথে ডুয়াল-চ্যানেল ABS আর দুই চাকায় ডিস্ক।`,
      ],
    ],
    who: [
      [
        "A specialist: in our quiz, with the budget set at its own on-road price, it comes first for: highway riding, a shorter rider with some experience, with comfort as the priority.",
        "বিশেষজ্ঞ বাইক: আমাদের কুইজে বাজেট এই বাইকের নিজের অন-রোড দামে রাখলে এটি প্রথম হয় এই উত্তরে: হাইওয়েতে চালানো, কিছুটা অভিজ্ঞ ও কম উচ্চতার চালক, আর অগ্রাধিকার আরাম।",
      ],
      [
        "Riders who travel between cities, often with a passenger, and who have a dealer within reach for service.",
        "যাঁরা শহর থেকে শহরে যান, প্রায়ই সাথে একজন থাকেন, আর যাঁদের কাছাকাছি সার্ভিসের জন্য ডিলার আছে।",
      ],
    ],
    tradeoffs: [
      [
        `Heavy: ${bike(METEOR).weightKg} kg with feet-forward pegs and wide bars. City handling ${sc(METEOR).cityHandling}/10; slow U-turns and lane-splitting are awkward, and it gets hot in jams.`,
        `ভারী: ${bike(METEOR).weightKg} কেজি, পা সামনের দিকে আর চওড়া হ্যান্ডেল। শহরে চালানো ${sc(METEOR).cityHandling}/১০; ধীরে ইউ-টার্ন আর গাড়ির ফাঁক দিয়ে যাওয়া কঠিন, জ্যামে গরম হয়।`,
      ],
      [
        `Small service network: mechanic familiarity ${sc(METEOR).mechanicFamiliarity}/10, and most parts are dealer-only. A service costs about ${formatBDT(bike(METEOR).avgServiceCostBDT)}.`,
        `সার্ভিস নেটওয়ার্ক ছোট: মেকানিক চেনে ${sc(METEOR).mechanicFamiliarity}/১০, বেশিরভাগ পার্টস শুধু ডিলারের কাছে। প্রতি সার্ভিসে খরচ প্রায় ${formatBDT(bike(METEOR).avgServiceCostBDT)}।`,
      ],
      [
        `Mileage ${kmpl(METEOR)} km/l. The Classic 350 costs ${gap(METEOR, "royal-enfield-classic-350")} less on the road and resells better (${sc("royal-enfield-classic-350").resale}/10 vs ${sc(METEOR).resale}/10), but it is a step down for long rides. Registration for bikes above 165cc is our least certain cost; check it with the dealer.`,
        `মাইলেজ ${kmpl(METEOR)} কিমি/লি। Classic 350 অন-রোড ${gap(METEOR, "royal-enfield-classic-350")} কম আর রিসেল ভালো (${sc("royal-enfield-classic-350").resale}/১০ বনাম ${sc(METEOR).resale}/১০), কিন্তু দূরের পথে এক ধাপ পিছিয়ে। ১৬৫সিসির বেশি বাইকের রেজিস্ট্রেশন খরচ আমাদের সবচেয়ে অনিশ্চিত হিসাব; ডিলারের কাছে মিলিয়ে নিন।`,
      ],
    ],
  },
  {
    slug: "hero-splendor-plus-best-value",
    bestCase: { use: "commute", where: "town", experience: "first", pillion: "sometimes", priorities: ["resale", "price"] },
    week: 2,
    updated: "2026-10-15",
    minutes: 4,
    bike: SPLENDOR,
    rival: "bajaj-platina-100",
    wins: ["Value for money", "টাকার সেরা মূল্য"],
    title: ["Hero Splendor+: the most bike per taka", "Hero Splendor+: প্রতি টাকায় সবচেয়ে বেশি বাইক"],
    summary: [
      `Top reliability, top resale and some of the lowest running costs on our list, for ${road(SPLENDOR)} on the road. Slow and basic, and that is the deal.`,
      `আমাদের তালিকার সেরা নির্ভরযোগ্যতা, সেরা রিসেল আর প্রায় সবচেয়ে কম চালানোর খরচ, অন-রোড ${road(SPLENDOR)}-এ। ধীর আর সাধারণ, এটাই চুক্তি।`,
    ],
    why: [
      [
        `Reliability ${sc(SPLENDOR).reliability}/10 and resale ${sc(SPLENDOR).resale}/10. Only the FZS FI V4 and the R15 V4 match that resale among new bikes, and both cost far more.`,
        `নির্ভরযোগ্যতা ${sc(SPLENDOR).reliability}/১০, রিসেল ${sc(SPLENDOR).resale}/১০। নতুন বাইকের মধ্যে এই রিসেল আছে শুধু FZS FI V4 আর R15 V4-এর, যাদের দাম অনেক বেশি।`,
      ],
      [
        `Cheap to run: ${kmpl(SPLENDOR)} km/l real-world, a service every ${bike(SPLENDOR).serviceIntervalKm.toLocaleString("en-IN")} km at about ${formatBDT(bike(SPLENDOR).avgServiceCostBDT)}, mechanic familiarity ${sc(SPLENDOR).mechanicFamiliarity}/10 and parts ${sc(SPLENDOR).partsAvailability}/10.`,
        `চালাতে সস্তা: বাস্তবে ${kmpl(SPLENDOR)} কিমি/লি, প্রতি ${bike(SPLENDOR).serviceIntervalKm.toLocaleString("en-IN")} কিমিতে সার্ভিস, খরচ প্রায় ${formatBDT(bike(SPLENDOR).avgServiceCostBDT)}; মেকানিক চেনে ${sc(SPLENDOR).mechanicFamiliarity}/১০, পার্টস ${sc(SPLENDOR).partsAvailability}/১০।`,
      ],
      [
        `Against its usual rival, the Bajaj Platina 100: the same mileage, resale ${sc(SPLENDOR).resale}/10 vs ${sc("bajaj-platina-100").resale}/10, tubeless tyres, and ${gap(SPLENDOR, "bajaj-platina-100")} less on the road.`,
        `সাধারণ প্রতিদ্বন্দ্বী Bajaj Platina 100-এর তুলনায়: একই মাইলেজ, রিসেল ${sc(SPLENDOR).resale}/১০ বনাম ${sc("bajaj-platina-100").resale}/১০, টিউবলেস টায়ার, আর অন-রোড ${gap(SPLENDOR, "bajaj-platina-100")} কম।`,
      ],
    ],
    who: [
      [
        "In our quiz, with the budget set at its own on-road price, it comes first for: commuting in a district town, a first bike, a pillion now and then, with resale and lowest price as priorities.",
        "আমাদের কুইজে বাজেট এই বাইকের নিজের অন-রোড দামে রাখলে এটি প্রথম হয় এই উত্তরে: জেলা শহরে যাতায়াত, প্রথম বাইক, মাঝে মাঝে পেছনে একজন, আর অগ্রাধিকার রিসেল ও সবচেয়ে কম দাম।",
      ],
      [
        "Buyers who want a bike that costs little, breaks rarely and sells easily, and who ride mostly in town.",
        "যাঁরা এমন বাইক চান যার দাম কম, নষ্ট হয় কম আর সহজে বিক্রি হয়, আর যাঁরা বেশিরভাগ শহরের ভেতরে চালান।",
      ],
    ],
    tradeoffs: [
      [
        "Check it is in stock first. Hero Bangladesh lists the model but shows no price, so our price comes from one review site. Confirm the price and stock at a showroom.",
        "আগে স্টকে আছে কিনা দেখুন। Hero বাংলাদেশ মডেলটি দেখায় কিন্তু দাম দেখায় না, তাই আমাদের দাম একটি রিভিউ সাইট থেকে। শোরুমে দাম আর স্টক মিলিয়ে নিন।",
      ],
      [
        "Drum brakes at both ends and no CBS, on thin tyres that skate in the wet. Leave a big gap in rain.",
        "সামনে-পেছনে ড্রাম ব্রেক, CBS নেই, আর সরু টায়ার ভেজা রাস্তায় পিছলায়। বৃষ্টিতে অনেক দূরত্ব রাখুন।",
      ],
      [
        `${ps(SPLENDOR)} PS and 4 gears, top speed about ${bike(SPLENDOR).topSpeedKmh} km/h. Highway ${sc(SPLENDOR).highway}/10, and it struggles on flyovers with a pillion. The HF Deluxe has the same engine for ${gap(SPLENDOR, HF)} less, with lower resale.`,
        `${ps(SPLENDOR)} PS আর ৪টি গিয়ার, সর্বোচ্চ গতি প্রায় ${bike(SPLENDOR).topSpeedKmh} কিমি/ঘণ্টা। হাইওয়ে ${sc(SPLENDOR).highway}/১০, পেছনে কেউ থাকলে ফ্লাইওভারে কষ্ট হয়। HF Deluxe-এ একই ইঞ্জিন, দাম ${gap(SPLENDOR, HF)} কম, রিসেল কম।`,
      ],
    ],
  },
  {
    slug: "honda-shine-100-best-for-dhaka-traffic",
    bestCase: { use: "commute", where: "dhaka", experience: "first", priorities: ["maintenance"] },
    week: 2,
    updated: "2026-10-15",
    minutes: 4,
    bike: SHINE,
    rival: HF,
    wins: ["Dhaka traffic", "ঢাকার ট্রাফিক"],
    title: ["Honda Shine 100: the easiest bike to thread through Dhaka traffic", "Honda Shine 100: ঢাকার ট্রাফিকে চালাতে সবচেয়ে সহজ বাইক"],
    summary: [
      `${bike(SHINE).weightKg} kg, city handling ${sc(SHINE).cityHandling}/10 and fuel injection, for ${road(SHINE)} on the road. Made for jams, not highways.`,
      `${bike(SHINE).weightKg} কেজি, শহরে চালানো ${sc(SHINE).cityHandling}/১০ আর ফুয়েল ইনজেকশন, অন-রোড ${road(SHINE)}-এ। জ্যামের জন্য তৈরি, হাইওয়ের জন্য নয়।`,
    ],
    why: [
      [
        `Light: ${bike(SHINE).weightKg} kg, the lightest motorcycle we list (scooters aside). City handling ${sc(SHINE).cityHandling}/10, the top score, so it is easy to push, turn and stop in a jam.`,
        `হালকা: ${bike(SHINE).weightKg} কেজি, আমাদের তালিকার সবচেয়ে হালকা মোটরসাইকেল (স্কুটার বাদে)। শহরে চালানো ${sc(SHINE).cityHandling}/১০, সর্বোচ্চ স্কোর, তাই জ্যামে ঠেলা, ঘোরানো আর থামানো সহজ।`,
      ],
      [
        "Fuel injection, the only one on our list under ৳1.3 lakh. No carburettor to clean, and it copes better with bad petrol and cold starts.",
        "ফুয়েল ইনজেকশন, আমাদের তালিকায় ১.৩ লাখের নিচে একমাত্র। কার্বুরেটর পরিষ্কারের ঝামেলা নেই, খারাপ পেট্রোল আর ঠান্ডায় স্টার্ট নিতে সুবিধা।",
      ],
      [
        `Beginner-friendly ${sc(SHINE).beginnerFriendly}/10, a ${bike(SHINE).seatHeightMm} mm seat, reliability ${sc(SHINE).reliability}/10 and CBS, which brakes both wheels from the left lever.`,
        `নতুনদের জন্য ${sc(SHINE).beginnerFriendly}/১০, ${bike(SHINE).seatHeightMm} মিমি সিট, নির্ভরযোগ্যতা ${sc(SHINE).reliability}/১০, আর CBS, যা বাম লিভারেই দুই চাকায় ব্রেক দেয়।`,
      ],
    ],
    who: [
      [
        "In our quiz, with the budget set at its own on-road price, it comes first for: a daily commute in Dhaka, a first bike, a pillion now and then, with low maintenance as the priority.",
        "আমাদের কুইজে বাজেট এই বাইকের নিজের অন-রোড দামে রাখলে এটি প্রথম হয় এই উত্তরে: ঢাকায় রোজকার যাতায়াত, প্রথম বাইক, মাঝে মাঝে পেছনে একজন, আর অগ্রাধিকার কম রক্ষণাবেক্ষণ।",
      ],
      [
        "New riders, office commuters on short city routes, and anyone who spends more time in jams than at speed.",
        "নতুন চালক, শহরের ছোট রুটে অফিস যাতায়াতকারী, আর যাঁরা গতির চেয়ে জ্যামে বেশি সময় কাটান।",
      ],
    ],
    tradeoffs: [
      [
        `${ps(SHINE)} PS and 4 gears, highway ${sc(SHINE).highway}/10. Overtaking buses on a highway takes planning.`,
        `${ps(SHINE)} PS আর ৪টি গিয়ার, হাইওয়ে ${sc(SHINE).highway}/১০। হাইওয়েতে বাস ওভারটেক করতে আগে থেকে পরিকল্পনা লাগে।`,
      ],
      [
        `Drum brakes at both ends; they feel wooden with a pillion. Thin seat foam (comfort ${sc(SHINE).comfort}/10) gets tiring after an hour.`,
        `সামনে-পেছনে ড্রাম ব্রেক; পেছনে কেউ থাকলে কম কাজ করে। পাতলা সিট (আরাম ${sc(SHINE).comfort}/১০) এক ঘণ্টা পর ক্লান্তিকর।`,
      ],
      [
        `Mileage ${kmpl(SHINE)} km/l, against ${kmpl(HF)} km/l for the Hero HF Deluxe, which also resells better (${sc(HF).resale}/10 vs ${sc(SHINE).resale}/10) and costs ${gap(SHINE, HF)} more on the road.`,
        `মাইলেজ ${kmpl(SHINE)} কিমি/লি; Hero HF Deluxe-এর ${kmpl(HF)} কিমি/লি, তার রিসেলও ভালো (${sc(HF).resale}/১০ বনাম ${sc(SHINE).resale}/১০), দাম অন-রোড ${gap(SHINE, HF)} বেশি।`,
      ],
    ],
  },
  {
    slug: "honda-dream-110-most-reliable",
    bestCase: { use: "mixed", where: "town", pillion: "sometimes", priorities: ["maintenance", "safety"] },
    week: 2,
    updated: "2026-10-15",
    minutes: 4,
    bike: DREAM,
    rival: "honda-livo-110",
    wins: ["Reliability", "নির্ভরযোগ্যতা"],
    title: ["Honda Dream 110: the bike that just keeps going", "Honda Dream 110: যে বাইক চলতেই থাকে"],
    summary: [
      `Reliability ${sc(DREAM).reliability}/10 with mechanic familiarity ${sc(DREAM).mechanicFamiliarity}/10, for ${road(DREAM)} on the road. Plain to look at, easy to keep alive anywhere.`,
      `নির্ভরযোগ্যতা ${sc(DREAM).reliability}/১০, মেকানিক চেনে ${sc(DREAM).mechanicFamiliarity}/১০, অন-রোড ${road(DREAM)}-এ। দেখতে সাধারণ, যেকোনো জায়গায় সচল রাখা সহজ।`,
    ],
    why: [
      [
        `One of only three bikes on our list with top reliability (${sc(DREAM).reliability}/10) and top mechanic familiarity (${sc(DREAM).mechanicFamiliarity}/10). The other two are Hero's 97cc pair.`,
        `আমাদের তালিকায় মাত্র তিনটি বাইকের সর্বোচ্চ নির্ভরযোগ্যতা (${sc(DREAM).reliability}/১০) আর সর্বোচ্চ মেকানিক পরিচিতি (${sc(DREAM).mechanicFamiliarity}/১০) দুটোই আছে। বাকি দুটি Hero-র ৯৭সিসি জুটি।`,
      ],
      [
        `A simple ${bike(DREAM).engine.cc}cc carburettor engine with ${ps(DREAM)} PS, a little more pull than the 100s. Parts availability ${sc(DREAM).partsAvailability}/10, and a service costs about ${formatBDT(bike(DREAM).avgServiceCostBDT)}.`,
        `সহজ ${bike(DREAM).engine.cc}সিসি কার্বুরেটর ইঞ্জিন, ${ps(DREAM)} PS, ১০০সিসির চেয়ে একটু বেশি টান। পার্টস পাওয়া ${sc(DREAM).partsAvailability}/১০, প্রতি সার্ভিসে খরচ প্রায় ${formatBDT(bike(DREAM).avgServiceCostBDT)}।`,
      ],
      [
        `A low ${bike(DREAM).seatHeightMm} mm seat, ${bike(DREAM).weightKg} kg, CBS and tubeless tyres. Beginner-friendly ${sc(DREAM).beginnerFriendly}/10.`,
        `নিচু ${bike(DREAM).seatHeightMm} মিমি সিট, ${bike(DREAM).weightKg} কেজি, CBS আর টিউবলেস টায়ার। নতুনদের জন্য ${sc(DREAM).beginnerFriendly}/১০।`,
      ],
    ],
    who: [
      [
        "In our quiz, with the budget set at its own on-road price, it comes first for: a mix of town and highway riding from a district town, a pillion now and then, with low maintenance and safety as priorities.",
        "আমাদের কুইজে বাজেট এই বাইকের নিজের অন-রোড দামে রাখলে এটি প্রথম হয় এই উত্তরে: জেলা শহর থেকে শহর আর হাইওয়ে মিলিয়ে চালানো, মাঝে মাঝে পেছনে একজন, আর অগ্রাধিকার কম রক্ষণাবেক্ষণ ও নিরাপত্তা।",
      ],
      [
        "Riders far from a dealer who need any mechanic to fix it, and anyone who wants years of daily use with no surprises.",
        "যাঁরা ডিলার থেকে দূরে থাকেন আর যেকোনো মেকানিকের হাতে সারাতে চান, আর যাঁরা বছরের পর বছর ঝামেলা ছাড়া রোজ চালাতে চান।",
      ],
    ],
    tradeoffs: [
      [
        "The carburettor needs cleaning and tuning now and then, more often after bad petrol.",
        "কার্বুরেটর মাঝে মাঝে পরিষ্কার আর টিউন করতে হয়, খারাপ পেট্রোলের পর আরও ঘন ঘন।",
      ],
      [
        `Drum brakes at both ends, 4 gears, and vibration above 70 km/h. Highway ${sc(DREAM).highway}/10, comfort ${sc(DREAM).comfort}/10.`,
        `সামনে-পেছনে ড্রাম ব্রেক, ৪টি গিয়ার, আর ৭০ কিমি/ঘণ্টার ওপরে কাঁপুনি। হাইওয়ে ${sc(DREAM).highway}/১০, আরাম ${sc(DREAM).comfort}/১০।`,
      ],
      [
        `Plain, dated looks and resale ${sc(DREAM).resale}/10. The Livo 110 has the same engine size and a front disc for ${gap(DREAM, "honda-livo-110")} more on the road.`,
        `সাধারণ, পুরনো ধাঁচের লুক আর রিসেল ${sc(DREAM).resale}/১০। Livo 110-এ একই সিসির ইঞ্জিন আর সামনে ডিস্ক, অন-রোড ${gap(DREAM, "honda-livo-110")} বেশি।`,
      ],
    ],
  },
  {
    slug: "tvs-raider-125-best-for-broken-roads",
    bestCase: { use: "rough", where: "dhaka", experience: "some", pillion: "rarely", priorities: ["performance", "resale"] },
    week: 2,
    updated: "2026-10-15",
    minutes: 4,
    bike: RAIDER,
    rival: "hero-xtreme-125r",
    wins: ["Broken roads", "ভাঙা রাস্তা"],
    title: ["TVS Raider 125: a light 125 for broken roads and city jams", "TVS Raider 125: ভাঙা রাস্তা আর শহরের জ্যামের হালকা ১২৫"],
    summary: [
      `${bike(RAIDER).groundClearanceMm} mm of ground clearance, an adjustable monoshock and ${bike(RAIDER).weightKg} kg, for ${road(RAIDER)} on the road. The firm ride is the price.`,
      `${bike(RAIDER).groundClearanceMm} মিমি গ্রাউন্ড ক্লিয়ারেন্স, অ্যাডজাস্টেবল মনোশক আর ${bike(RAIDER).weightKg} কেজি, অন-রোড ${road(RAIDER)}-এ। বদলে শক্ত রাইড।`,
    ],
    why: [
      [
        `${bike(RAIDER).groundClearanceMm} mm of ground clearance and a 5-step adjustable rear monoshock, so potholes and speed breakers do not scrape the underside.`,
        `${bike(RAIDER).groundClearanceMm} মিমি গ্রাউন্ড ক্লিয়ারেন্স আর ৫ ধাপে অ্যাডজাস্ট করা যায় এমন পেছনের মনোশক, তাই গর্ত আর স্পিড ব্রেকারে নিচে ঘষা লাগে না।`,
      ],
      [
        `Light for a 125: ${bike(RAIDER).weightKg} kg, ${bike("hero-xtreme-125r").weightKg - bike(RAIDER).weightKg} kg less than the Hero Xtreme 125R, with city handling ${sc(RAIDER).cityHandling}/10, the top score.`,
        `১২৫সিসি হিসেবে হালকা: ${bike(RAIDER).weightKg} কেজি, Hero Xtreme 125R-এর চেয়ে ${bike("hero-xtreme-125r").weightKg - bike(RAIDER).weightKg} কেজি কম; শহরে চালানো ${sc(RAIDER).cityHandling}/১০, সর্বোচ্চ স্কোর।`,
      ],
      [
        `${ps(RAIDER)} PS, 5 gears, a front disc with CBS and tubeless tyres, at ${gap(RAIDER, "hero-xtreme-125r")} less than the Xtreme 125R on the road.`,
        `${ps(RAIDER)} PS, ৫টি গিয়ার, সামনে ডিস্ক আর CBS, টিউবলেস টায়ার; অন-রোড Xtreme 125R-এর চেয়ে ${gap(RAIDER, "hero-xtreme-125r")} কম।`,
      ],
    ],
    who: [
      [
        "In our quiz, with the budget set at its own on-road price, it comes first for: rough roads around Dhaka, a rider with some experience, rarely a pillion, with performance and resale as priorities.",
        "আমাদের কুইজে বাজেট এই বাইকের নিজের অন-রোড দামে রাখলে এটি প্রথম হয় এই উত্তরে: ঢাকার আশেপাশের খারাপ রাস্তা, কিছুটা অভিজ্ঞ চালক, পেছনে কেউ কম বসেন, আর অগ্রাধিকার পারফরম্যান্স ও রিসেল।",
      ],
      [
        "Young riders who want a sporty 125 that survives bad roads, and commuters whose route mixes jams with broken stretches.",
        "যে তরুণ চালকরা খারাপ রাস্তায় টিকে থাকা স্পোর্টি ১২৫ চান, আর যাঁদের রুটে জ্যাম আর ভাঙা রাস্তা দুটোই আছে।",
      ],
    ],
    tradeoffs: [
      [
        `Firm ride and a hard seat on long trips (comfort ${sc(RAIDER).comfort}/10). It is a road bike with good clearance, not an off-roader (off-road ${sc(RAIDER).offroad}/10).`,
        `শক্ত রাইড, লম্বা পথে সিট শক্ত লাগে (আরাম ${sc(RAIDER).comfort}/১০)। এটি ভালো ক্লিয়ারেন্সের রোড বাইক, অফ-রোডার নয় (অফ-রোড ${sc(RAIDER).offroad}/১০)।`,
      ],
      [
        `A ${bike(RAIDER).fuelTankL} L tank and some vibration above 80 km/h, so highway runs are short (highway ${sc(RAIDER).highway}/10).`,
        `${bike(RAIDER).fuelTankL} লিটারের ট্যাংক আর ৮০ কিমি/ঘণ্টার ওপরে কিছুটা কাঁপুনি, তাই হাইওয়ে যাত্রা ছোট (হাইওয়ে ${sc(RAIDER).highway}/১০)।`,
      ],
      [
        `A short split pillion seat that makes carrying loads awkward. Mileage ${kmpl(RAIDER)} km/l, and a carburettor where the Xtreme 125R has fuel injection and single-channel ABS.`,
        `পেছনের আলাদা সিট ছোট, মালপত্র নেওয়া কঠিন। মাইলেজ ${kmpl(RAIDER)} কিমি/লি, আর কার্বুরেটর; Xtreme 125R-এ ফুয়েল ইনজেকশন আর সিঙ্গেল-চ্যানেল ABS।`,
      ],
    ],
  },
  {
    slug: "yamaha-r15-v4-best-looking",
    bestCase: { use: "mixed", pillion: "rarely", priorities: ["style", "resale"], looks: ["sport"] },
    week: 2,
    updated: "2026-10-15",
    minutes: 4,
    bike: R15,
    rival: "suzuki-gixxer-sf-fi-abs",
    wins: ["Looks and style", "লুক আর স্টাইল"],
    title: ["Yamaha R15 V4: the sport bike everyone turns to look at", "Yamaha R15 V4: যে স্পোর্ট বাইকের দিকে সবাই ফিরে তাকায়"],
    summary: [
      `The top looks score on our list (shared with the GSX-R150), resale ${sc(R15).resale}/10 and dual-channel ABS, for ${road(R15)} on the road.`,
      `আমাদের তালিকায় লুকে সর্বোচ্চ (GSX-R150-এর সাথে), রিসেল ${sc(R15).resale}/১০ আর ডুয়াল-চ্যানেল ABS, অন-রোড ${road(R15)}-এ।`,
    ],
    why: [
      [
        "Looks: a full fairing, USD fork and the R-series face. In our quiz's style measure it ties with the GSX-R150 for first place.",
        "লুক: পুরো ফেয়ারিং, USD ফর্ক আর R-সিরিজের চেহারা। আমাদের কুইজের স্টাইল হিসাবে GSX-R150-এর সাথে যৌথভাবে প্রথম।",
      ],
      [
        `It holds its value: resale ${sc(R15).resale}/10 and reliability ${sc(R15).reliability}/10, where the GSX-R150 has ${sc(GSXR).resale}/10 and ${sc(GSXR).reliability}/10.`,
        `দাম ধরে রাখে: রিসেল ${sc(R15).resale}/১০, নির্ভরযোগ্যতা ${sc(R15).reliability}/১০; GSX-R150-এর ${sc(GSXR).resale}/১০ আর ${sc(GSXR).reliability}/১০।`,
      ],
      [
        `${ps(R15)} PS, 6 gears, ${bike(R15).weightKg} kg, discs at both ends with dual-channel ABS. Performance ${sc(R15).performance}/10.`,
        `${ps(R15)} PS, ৬টি গিয়ার, ${bike(R15).weightKg} কেজি, দুই চাকায় ডিস্ক আর ডুয়াল-চ্যানেল ABS। পারফরম্যান্স ${sc(R15).performance}/১০।`,
      ],
    ],
    who: [
      [
        "In our quiz, with the budget set at its own on-road price, it comes first for: a mix of Dhaka and highway riding, rarely a pillion, with style (a sport look) and resale as priorities.",
        "আমাদের কুইজে বাজেট এই বাইকের নিজের অন-রোড দামে রাখলে এটি প্রথম হয় এই উত্তরে: ঢাকা আর হাইওয়ে মিলিয়ে চালানো, পেছনে কেউ কম বসেন, আর অগ্রাধিকার স্টাইল (স্পোর্ট লুক) ও রিসেল।",
      ],
      [
        "Riders who want a sport bike that looks the part and will sell well later, and who have the budget for its running costs.",
        "যাঁরা দেখতে আসল স্পোর্ট বাইক চান যা পরে ভালো দামে বিক্রি হবে, আর যাঁদের চালানোর খরচ বহনের বাজেট আছে।",
      ],
    ],
    tradeoffs: [
      [
        `The price: ${road(R15)} on the road, ${gap(R15, "suzuki-gixxer-sf-fi-abs")} more than the Gixxer SF FI ABS, which looks similar but makes ${ps("suzuki-gixxer-sf-fi-abs")} PS.`,
        `দাম: অন-রোড ${road(R15)}, Gixxer SF FI ABS-এর চেয়ে ${gap(R15, "suzuki-gixxer-sf-fi-abs")} বেশি; সেটি দেখতে কাছাকাছি, তবে শক্তি ${ps("suzuki-gixxer-sf-fi-abs")} PS।`,
      ],
      [
        `Hard work in traffic: comfort ${sc(R15).comfort}/10, pillion ${sc(R15).pillion}/10, and the radiator fan blows heat onto your legs in jams.`,
        `ভিড়ে কষ্ট: আরাম ${sc(R15).comfort}/১০, পেছনের যাত্রী ${sc(R15).pillion}/১০, আর জ্যামে রেডিয়েটরের ফ্যান পায়ে গরম বাতাস দেয়।`,
      ],
      [
        `A service costs about ${formatBDT(bike(R15).avgServiceCostBDT)} and mechanic familiarity is ${sc(R15).mechanicFamiliarity}/10. It is a big theft target, so budget for a good lock or a tracker.`,
        `প্রতি সার্ভিসে খরচ প্রায় ${formatBDT(bike(R15).avgServiceCostBDT)}, মেকানিক চেনে ${sc(R15).mechanicFamiliarity}/১০। চুরির বড় লক্ষ্য, তাই ভালো লক বা ট্র্যাকারের খরচ ধরুন।`,
      ],
    ],
  },
  {
    slug: "bajaj-platina-100-cheap-to-maintain",
    bestCase: { use: "commute", where: "town", experience: "some", pillion: "sometimes", priorities: ["maintenance", "mileage"] },
    week: 3,
    updated: "2026-10-16",
    minutes: 4,
    bike: PLATINA,
    rival: "bajaj-ct100",
    wins: ["Cheap to maintain", "রক্ষণাবেক্ষণে সস্তা"],
    title: ["Bajaj Platina 100: cheap to keep running", "Bajaj Platina 100: চালু রাখতে কম খরচ"],
    summary: [
      `Every mechanic knows it and every shop has its parts. A service every ${svc(PLATINA)} costs about ${formatBDT(bike(PLATINA).avgServiceCostBDT)}, and it does ${kmpl(PLATINA)} km/l, for ${road(PLATINA)} on the road.`,
      `প্রত্যেক মেকানিক এটা চেনেন, প্রত্যেক দোকানে এর পার্টস আছে। প্রতি ${svc(PLATINA)}-এ সার্ভিসে খরচ প্রায় ${formatBDT(bike(PLATINA).avgServiceCostBDT)}, মাইলেজ ${kmpl(PLATINA)} কিমি/লি, অন-রোড ${road(PLATINA)}।`,
    ],
    why: [
      [
        `Mechanic familiarity ${sc(PLATINA).mechanicFamiliarity}/10 and parts availability ${sc(PLATINA).partsAvailability}/10, the top of our scale. A breakdown in a district town is a short wait, not a trip to Dhaka.`,
        `মেকানিক চেনেন ${sc(PLATINA).mechanicFamiliarity}/১০, পার্টস পাওয়া যায় ${sc(PLATINA).partsAvailability}/১০, আমাদের স্কেলের সর্বোচ্চ। জেলা শহরে নষ্ট হলে অল্প অপেক্ষা, ঢাকায় যেতে হয় না।`,
      ],
      [
        `Reliability ${sc(PLATINA).reliability}/10 and real-world mileage of ${kmpl(PLATINA)} km/l from ${ps(PLATINA)} PS, so fuel is a small part of the monthly bill.`,
        `নির্ভরযোগ্যতা ${sc(PLATINA).reliability}/১০, আর ${ps(PLATINA)} PS থেকে বাস্তবে ${kmpl(PLATINA)} কিমি/লি, তাই মাসিক খরচে তেলের ভাগ কম।`,
      ],
      [
        `Against the cheaper Bajaj CT 100: the same Bajaj 100 cc engine family, but CBS (linked brakes), comfort ${sc(PLATINA).comfort}/10 vs ${sc("bajaj-ct100").comfort}/10 and resale ${sc(PLATINA).resale}/10 vs ${sc("bajaj-ct100").resale}/10, for ${gap(PLATINA, "bajaj-ct100")} more.`,
        `সস্তা Bajaj CT 100-এর তুলনায়: একই Bajaj ১০০ সিসি ইঞ্জিন পরিবার, কিন্তু CBS (একসাথে কাজ করা ব্রেক), আরাম ${sc(PLATINA).comfort}/১০ বনাম ${sc("bajaj-ct100").comfort}/১০, রিসেল ${sc(PLATINA).resale}/১০ বনাম ${sc("bajaj-ct100").resale}/১০, দাম ${gap(PLATINA, "bajaj-ct100")} বেশি।`,
      ],
    ],
    who: [
      [
        "In our quiz, with the budget set at its own on-road price, it comes first for: commuting in a district town, some riding experience, a pillion now and then, with low maintenance and mileage as priorities.",
        "আমাদের কুইজে বাজেট এই বাইকের নিজের অন-রোড দামে রাখলে এটি প্রথম হয় এই উত্তরে: জেলা শহরে যাতায়াত, কিছুটা চালানোর অভিজ্ঞতা, মাঝে মাঝে পেছনে একজন, আর অগ্রাধিকার কম রক্ষণাবেক্ষণ ও মাইলেজ।",
      ],
      [
        "Riders who put a lot of kilometres on a bike every month and want each service and repair to be cheap and quick.",
        "যাঁরা প্রতি মাসে অনেক কিলোমিটার চালান আর চান প্রতিটি সার্ভিস ও মেরামত সস্তা ও দ্রুত হোক।",
      ],
    ],
    tradeoffs: [
      [
        "Drum brakes at both ends and tube tyres. CBS helps, but stopping distances are long and a puncture means a roadside repair. Keep your distance in the rain.",
        "দুই চাকাতেই ড্রাম ব্রেক আর টিউব টায়ার। CBS কিছুটা সাহায্য করে, তবু থামতে দূরত্ব বেশি লাগে, আর পাংচার হলে রাস্তায় সারাতে হয়। বৃষ্টিতে বেশি দূরত্ব রাখুন।",
      ],
      [
        `${ps(PLATINA)} PS and a top speed of about ${bike(PLATINA).topSpeedKmh} km/h: highway ${sc(PLATINA).highway}/10. It is a town bike; long highway runs with a pillion are slow work.`,
        `${ps(PLATINA)} PS আর সর্বোচ্চ গতি প্রায় ${bike(PLATINA).topSpeedKmh} কিমি/ঘণ্টা: হাইওয়ে ${sc(PLATINA).highway}/১০। এটা শহরের বাইক; পেছনে কাউকে নিয়ে লম্বা হাইওয়ে যাত্রা ধীর হয়।`,
      ],
    ],
  },
  {
    slug: "tvs-radeon-best-first-bike",
    bestCase: { use: "commute", where: "dhaka", experience: "first", pillion: "rarely", priorities: ["comfort"] },
    week: 3,
    updated: "2026-10-16",
    minutes: 4,
    bike: RADEON,
    rival: "hero-hf-deluxe",
    wins: ["First bike", "প্রথম বাইক"],
    title: ["TVS Radeon: an easy, comfortable first bike", "TVS Radeon: সহজ আর আরামদায়ক প্রথম বাইক"],
    summary: [
      `A ${bike(RADEON).seatHeightMm} mm seat, linked brakes and a soft ride make it easy to learn on. Beginner-friendly ${sc(RADEON).beginnerFriendly}/10, for ${road(RADEON)} on the road.`,
      `${bike(RADEON).seatHeightMm} মিমি সিট, একসাথে কাজ করা ব্রেক আর নরম রাইড, তাই শেখা সহজ। নতুনদের জন্য ${sc(RADEON).beginnerFriendly}/১০, অন-রোড ${road(RADEON)}।`,
    ],
    why: [
      [
        `The seat is ${bike(RADEON).seatHeightMm} mm high, among the lowest of the cheap commuters, so most new riders can put both feet down at a signal.`,
        `সিটের উচ্চতা ${bike(RADEON).seatHeightMm} মিমি, সস্তা কমিউটারগুলোর মধ্যে সবচেয়ে নিচুগুলোর একটি, তাই বেশিরভাগ নতুন চালক সিগন্যালে দুই পা মাটিতে রাখতে পারেন।`,
      ],
      [
        `CBS links the brakes, so a panicked grab of one lever still uses both. Comfort ${sc(RADEON).comfort}/10 and city handling ${sc(RADEON).cityHandling}/10 make Dhaka's stop-start traffic less tiring.`,
        `CBS দুই ব্রেককে জুড়ে দেয়, তাই ভয়ে একটা লিভার চাপলেও দুটোই কাজ করে। আরাম ${sc(RADEON).comfort}/১০ আর শহরে চালানো ${sc(RADEON).cityHandling}/১০, তাই ঢাকার থামা-চলা জ্যামে কম ক্লান্তি।`,
      ],
      [
        `Against the Hero HF Deluxe: CBS (the HF has none), comfort ${sc(RADEON).comfort}/10 vs ${sc("hero-hf-deluxe").comfort}/10 and pillion ${sc(RADEON).pillion}/10 vs ${sc("hero-hf-deluxe").pillion}/10, for ${gap(RADEON, "hero-hf-deluxe")} more on the road.`,
        `Hero HF Deluxe-এর তুলনায়: CBS (HF-এ নেই), আরাম ${sc(RADEON).comfort}/১০ বনাম ${sc("hero-hf-deluxe").comfort}/১০, পেছনের আসন ${sc(RADEON).pillion}/১০ বনাম ${sc("hero-hf-deluxe").pillion}/১০, অন-রোড ${gap(RADEON, "hero-hf-deluxe")} বেশি।`,
      ],
    ],
    who: [
      [
        "In our quiz, with the budget set at its own on-road price, it comes first for: commuting in Dhaka, a first bike, rarely a pillion, with comfort as the priority.",
        "আমাদের কুইজে বাজেট এই বাইকের নিজের অন-রোড দামে রাখলে এটি প্রথম হয় এই উত্তরে: ঢাকায় যাতায়াত, প্রথম বাইক, পেছনে কেউ খুব কম, আর অগ্রাধিকার আরাম।",
      ],
      [
        "New riders, shorter riders, and anyone who wants a gentle bike for learning in city traffic.",
        "নতুন চালক, কম উচ্চতার চালক, আর যাঁরা শহরের জ্যামে শেখার জন্য একটা শান্ত বাইক চান।",
      ],
    ],
    tradeoffs: [
      [
        `Resale ${sc(RADEON).resale}/10, against ${sc("hero-hf-deluxe").resale}/10 for the HF Deluxe: expect less back when you sell it to move up to a bigger bike.`,
        `রিসেল ${sc(RADEON).resale}/১০, HF Deluxe-এর ${sc("hero-hf-deluxe").resale}/১০: বড় বাইকে যাওয়ার সময় বিক্রি করলে কম টাকা ফেরত পাবেন।`,
      ],
      [
        `Drum brakes front and rear. Mechanic familiarity ${sc(RADEON).mechanicFamiliarity}/10: fine in cities, but fewer village mechanics know it than know a Bajaj or a Hero.`,
        `সামনে-পেছনে ড্রাম ব্রেক। মেকানিক চেনেন ${sc(RADEON).mechanicFamiliarity}/১০: শহরে ঠিক আছে, কিন্তু গ্রামে Bajaj বা Hero-র চেয়ে কম মেকানিক এটা চেনেন।`,
      ],
    ],
  },
  {
    slug: "hero-glamour-x-125-best-for-pillion",
    bestCase: { use: "mixed", where: "dhaka", experience: "first", pillion: "daily", priorities: ["performance"] },
    week: 3,
    updated: "2026-10-16",
    minutes: 4,
    bike: GLAMOUR,
    rival: "honda-sp125",
    wins: ["Pillion and family", "পেছনের যাত্রী ও পরিবার"],
    title: ["Hero Glamour X 125: the commuter that carries two", "Hero Glamour X 125: দুজনের জন্য কমিউটার"],
    summary: [
      `Pillion ${sc(GLAMOUR).pillion}/10 and comfort ${sc(GLAMOUR).comfort}/10, with ${ps(GLAMOUR)} PS to keep up with traffic when two are on board, for ${road(GLAMOUR)} on the road.`,
      `পেছনের আসন ${sc(GLAMOUR).pillion}/১০, আরাম ${sc(GLAMOUR).comfort}/১০, আর দুজন থাকলেও জ্যামে তাল রাখতে ${ps(GLAMOUR)} PS, অন-রোড ${road(GLAMOUR)}।`,
    ],
    why: [
      [
        `Pillion ${sc(GLAMOUR).pillion}/10, one of the best scores among commuters, and comfort ${sc(GLAMOUR).comfort}/10. A daily ride with a passenger is the job it is built for.`,
        `পেছনের আসন ${sc(GLAMOUR).pillion}/১০, কমিউটারদের মধ্যে সেরাগুলোর একটি, আর আরাম ${sc(GLAMOUR).comfort}/১০। প্রতিদিন একজন যাত্রী নিয়ে চলাই এর কাজ।`,
      ],
      [
        `${ps(GLAMOUR)} PS and ${bike(GLAMOUR).torqueNm} Nm, a front disc with CBS, and tubeless tyres: enough pull for two up on a flyover, and braking that suits the extra weight.`,
        `${ps(GLAMOUR)} PS আর ${bike(GLAMOUR).torqueNm} Nm, সামনে ডিস্ক সঙ্গে CBS, আর টিউবলেস টায়ার: দুজন নিয়ে ফ্লাইওভারে ওঠার মতো শক্তি, আর বাড়তি ওজনের সঙ্গে মানানসই ব্রেক।`,
      ],
      [
        `Against the Honda SP125: ${samePrice(GLAMOUR, "honda-sp125") ? "the same on-road price" : `${gap(GLAMOUR, "honda-sp125")} apart on the road`}, pillion ${sc(GLAMOUR).pillion}/10 vs ${sc("honda-sp125").pillion}/10, comfort ${sc(GLAMOUR).comfort}/10 vs ${sc("honda-sp125").comfort}/10 and ${ps(GLAMOUR)} vs ${ps("honda-sp125")} PS.`,
        `Honda SP125-এর তুলনায়: ${samePrice(GLAMOUR, "honda-sp125") ? "অন-রোড দাম একই" : `অন-রোড দামে পার্থক্য ${gap(GLAMOUR, "honda-sp125")}`}, পেছনের আসন ${sc(GLAMOUR).pillion}/১০ বনাম ${sc("honda-sp125").pillion}/১০, আরাম ${sc(GLAMOUR).comfort}/১০ বনাম ${sc("honda-sp125").comfort}/১০, শক্তি ${ps(GLAMOUR)} বনাম ${ps("honda-sp125")} PS।`,
      ],
    ],
    who: [
      [
        "In our quiz, with the budget set at its own on-road price, it comes first for: mixed riding from Dhaka, a first bike, a pillion every day, with performance as the priority.",
        "আমাদের কুইজে বাজেট এই বাইকের নিজের অন-রোড দামে রাখলে এটি প্রথম হয় এই উত্তরে: ঢাকা থেকে মিশ্র চালানো, প্রথম বাইক, প্রতিদিন পেছনে একজন, আর অগ্রাধিকার পারফরম্যান্স।",
      ],
      [
        "Couples and small families who ride two up every day and want a bit more power than a 100 cc commuter.",
        "দম্পতি আর ছোট পরিবার, যাঁরা প্রতিদিন দুজন মিলে চলেন আর ১০০ সিসি কমিউটারের চেয়ে একটু বেশি শক্তি চান।",
      ],
    ],
    tradeoffs: [
      [
        `The SP125 is the safer long-term bet: reliability ${sc("honda-sp125").reliability}/10 vs ${sc(GLAMOUR).reliability}/10, resale ${sc("honda-sp125").resale}/10 vs ${sc(GLAMOUR).resale}/10, and ${kmpl("honda-sp125")} km/l vs ${kmpl(GLAMOUR)}.`,
        `দীর্ঘমেয়াদে SP125 বেশি নিরাপদ বাছাই: নির্ভরযোগ্যতা ${sc("honda-sp125").reliability}/১০ বনাম ${sc(GLAMOUR).reliability}/১০, রিসেল ${sc("honda-sp125").resale}/১০ বনাম ${sc(GLAMOUR).resale}/১০, আর মাইলেজ ${kmpl("honda-sp125")} বনাম ${kmpl(GLAMOUR)} কিমি/লি।`,
      ],
      [
        `Mechanic familiarity ${sc(GLAMOUR).mechanicFamiliarity}/10 and parts ${sc(GLAMOUR).partsAvailability}/10: fine near a Hero dealer, harder in small towns. A service costs about ${formatBDT(bike(GLAMOUR).avgServiceCostBDT)}.`,
        `মেকানিক চেনেন ${sc(GLAMOUR).mechanicFamiliarity}/১০, পার্টস ${sc(GLAMOUR).partsAvailability}/১০: Hero ডিলারের কাছে সমস্যা নেই, ছোট শহরে কঠিন। সার্ভিসে খরচ প্রায় ${formatBDT(bike(GLAMOUR).avgServiceCostBDT)}।`,
      ],
    ],
  },
  {
    slug: "bajaj-pulsar-n250-safest-braking",
    bestCase: { use: "mixed", where: "dhaka", experience: "some", pillion: "daily", priorities: ["performance", "safety"] },
    week: 3,
    updated: "2026-10-16",
    minutes: 4,
    bike: N250,
    rival: "yamaha-fz25",
    wins: ["Safety: braking", "নিরাপত্তা: ব্রেকিং"],
    title: ["Bajaj Pulsar N250: dual-channel ABS for the money", "Bajaj Pulsar N250: এই দামে ডুয়াল-চ্যানেল ABS"],
    summary: [
      `Disc brakes at both ends with dual-channel ABS, ${ps(N250)} PS and a pillion score of ${sc(N250).pillion}/10, for ${road(N250)} on the road.`,
      `দুই চাকাতেই ডিস্ক ব্রেক সঙ্গে ডুয়াল-চ্যানেল ABS, ${ps(N250)} PS আর পেছনের আসন ${sc(N250).pillion}/১০, অন-রোড ${road(N250)}।`,
    ],
    why: [
      [
        "Dual-channel ABS keeps both wheels from locking in a hard stop, the top level of braking safety in our quiz (dual ABS, then single ABS, then CBS, then none). On wet roads and with a pillion, that matters most.",
        "ডুয়াল-চ্যানেল ABS জোরে ব্রেক করলে দুই চাকাকেই লক হতে দেয় না; আমাদের কুইজে ব্রেকিং নিরাপত্তার সর্বোচ্চ স্তর (ডুয়াল ABS, তারপর সিঙ্গেল ABS, তারপর CBS, তারপর কিছুই না)। ভেজা রাস্তায় আর পেছনে কেউ থাকলে এটাই সবচেয়ে জরুরি।",
      ],
      [
        `${ps(N250)} PS and ${bike(N250).torqueNm} Nm, highway ${sc(N250).highway}/10 and comfort ${sc(N250).comfort}/10: it overtakes cleanly with two on board.`,
        `${ps(N250)} PS আর ${bike(N250).torqueNm} Nm, হাইওয়ে ${sc(N250).highway}/১০, আরাম ${sc(N250).comfort}/১০: দুজন নিয়েও সহজে ওভারটেক করে।`,
      ],
      [
        `Against the Yamaha FZ25 (also dual ABS): ${ps(N250)} vs ${ps("yamaha-fz25")} PS, pillion ${sc(N250).pillion}/10 vs ${sc("yamaha-fz25").pillion}/10 and resale ${sc(N250).resale}/10 vs ${sc("yamaha-fz25").resale}/10, for ${gap(N250, "yamaha-fz25")} less on the road.`,
        `Yamaha FZ25-এর তুলনায় (এতেও ডুয়াল ABS): শক্তি ${ps(N250)} বনাম ${ps("yamaha-fz25")} PS, পেছনের আসন ${sc(N250).pillion}/১০ বনাম ${sc("yamaha-fz25").pillion}/১০, রিসেল ${sc(N250).resale}/১০ বনাম ${sc("yamaha-fz25").resale}/১০, অন-রোড ${gap(N250, "yamaha-fz25")} কম।`,
      ],
    ],
    who: [
      [
        "In our quiz, with the budget set at its own on-road price, it comes first for: mixed riding from Dhaka, some riding experience, a pillion every day, with performance and safety as priorities.",
        "আমাদের কুইজে বাজেট এই বাইকের নিজের অন-রোড দামে রাখলে এটি প্রথম হয় এই উত্তরে: ঢাকা থেকে মিশ্র চালানো, কিছুটা অভিজ্ঞতা, প্রতিদিন পেছনে একজন, আর অগ্রাধিকার পারফরম্যান্স ও নিরাপত্তা।",
      ],
      [
        "Riders moving up from a 150 cc bike who carry a passenger often and want the best brakes they can buy at this price.",
        "যাঁরা ১৫০ সিসি থেকে বড় বাইকে যাচ্ছেন, প্রায়ই পেছনে কাউকে নেন, আর এই দামে সবচেয়ে ভালো ব্রেক চান।",
      ],
    ],
    tradeoffs: [
      [
        `${bike(N250).weightKg} kg and city handling ${sc(N250).cityHandling}/10: heavy in a jam and in tight lanes. Beginner-friendly only ${sc(N250).beginnerFriendly}/10; not a first bike.`,
        `${bike(N250).weightKg} কেজি আর শহরে চালানো ${sc(N250).cityHandling}/১০: জ্যামে আর সরু গলিতে ভারী লাগে। নতুনদের জন্য মাত্র ${sc(N250).beginnerFriendly}/১০; প্রথম বাইক হিসেবে নয়।`,
      ],
      [
        `${kmpl(N250)} km/l and a service of about ${formatBDT(bike(N250).avgServiceCostBDT)} every ${svc(N250)}: running costs are a big step up from a 150.`,
        `মাইলেজ ${kmpl(N250)} কিমি/লি আর প্রতি ${svc(N250)}-এ সার্ভিসে প্রায় ${formatBDT(bike(N250).avgServiceCostBDT)}: ১৫০ সিসির তুলনায় চালানোর খরচ অনেক বেশি।`,
      ],
    ],
  },
  {
    slug: "honda-nx200-best-for-highway",
    bestCase: { use: "highway", where: "dhaka", experience: "some", pillion: "rarely", priorities: [] },
    week: 3,
    updated: "2026-10-16",
    minutes: 4,
    bike: NX200,
    rival: "hero-xpulse-200-4v",
    wins: ["Highway cruising", "হাইওয়েতে চলা"],
    title: ["Honda NX200: an upright tourer for the highway", "Honda NX200: হাইওয়ের জন্য সোজা হয়ে বসার ট্যুরার"],
    summary: [
      `Highway ${sc(NX200).highway}/10 and comfort ${sc(NX200).comfort}/10, dual-channel ABS and an upright seat, for ${road(NX200)} on the road.`,
      `হাইওয়ে ${sc(NX200).highway}/১০, আরাম ${sc(NX200).comfort}/১০, ডুয়াল-চ্যানেল ABS আর সোজা হয়ে বসার আসন, অন-রোড ${road(NX200)}।`,
    ],
    why: [
      [
        `Highway ${sc(NX200).highway}/10 with comfort ${sc(NX200).comfort}/10: an upright riding position and ${ps(NX200)} PS make a long day on the Dhaka-Chattogram road less tiring than on a sport bike.`,
        `হাইওয়ে ${sc(NX200).highway}/১০, আরাম ${sc(NX200).comfort}/১০: সোজা হয়ে বসার ভঙ্গি আর ${ps(NX200)} PS, তাই ঢাকা-চট্টগ্রাম রাস্তায় সারাদিন চালানো স্পোর্ট বাইকের চেয়ে কম ক্লান্তিকর।`,
      ],
      [
        `Dual-channel ABS and reliability ${sc(NX200).reliability}/10, with ${kmpl(NX200)} km/l, good for its size.`,
        `ডুয়াল-চ্যানেল ABS আর নির্ভরযোগ্যতা ${sc(NX200).reliability}/১০, সঙ্গে ${kmpl(NX200)} কিমি/লি, এই আকারের বাইকের জন্য ভালো।`,
      ],
      [
        `Against the Hero XPulse 200 4V: dual vs single-channel ABS, highway ${sc(NX200).highway}/10 vs ${sc("hero-xpulse-200-4v").highway}/10, tubeless tyres, and ${gap(NX200, "hero-xpulse-200-4v")} less on the road.`,
        `Hero XPulse 200 4V-এর তুলনায়: ডুয়াল বনাম সিঙ্গেল-চ্যানেল ABS, হাইওয়ে ${sc(NX200).highway}/১০ বনাম ${sc("hero-xpulse-200-4v").highway}/১০, টিউবলেস টায়ার, আর অন-রোড ${gap(NX200, "hero-xpulse-200-4v")} কম।`,
      ],
    ],
    who: [
      [
        "In our quiz, with the budget set at its own on-road price, it comes first for: mostly highway riding from Dhaka, some riding experience, rarely a pillion, and no other priority.",
        "আমাদের কুইজে বাজেট এই বাইকের নিজের অন-রোড দামে রাখলে এটি প্রথম হয় এই উত্তরে: ঢাকা থেকে বেশিরভাগ হাইওয়েতে চালানো, কিছুটা অভিজ্ঞতা, পেছনে কেউ খুব কম, আর অন্য কোনো অগ্রাধিকার নেই।",
      ],
      [
        "Riders who travel between cities often and want comfort and good brakes more than speed or off-road ability.",
        "যাঁরা প্রায়ই এক শহর থেকে আরেক শহরে যান আর গতি বা অফরোডের চেয়ে আরাম আর ভালো ব্রেক বেশি চান।",
      ],
    ],
    tradeoffs: [
      [
        `Off-road ${sc(NX200).offroad}/10 against ${sc("hero-xpulse-200-4v").offroad}/10 for the XPulse: it looks like an adventure bike, but for broken village roads and trails the XPulse is the better tool.`,
        `অফরোড ${sc(NX200).offroad}/১০, XPulse-এর ${sc("hero-xpulse-200-4v").offroad}/১০: দেখতে অ্যাডভেঞ্চার বাইক, কিন্তু ভাঙা গ্রামের রাস্তা আর কাঁচা পথে XPulse ভালো।`,
      ],
      [
        `A ${bike(NX200).seatHeightMm} mm seat, mechanic familiarity ${sc(NX200).mechanicFamiliarity}/10 and parts ${sc(NX200).partsAvailability}/10: check the seat height in person, and expect to rely on Honda dealers for service.`,
        `${bike(NX200).seatHeightMm} মিমি সিট, মেকানিক চেনেন ${sc(NX200).mechanicFamiliarity}/১০, পার্টস ${sc(NX200).partsAvailability}/১০: শোরুমে বসে সিটের উচ্চতা দেখে নিন, আর সার্ভিসের জন্য Honda ডিলারের ওপর নির্ভর করতে হবে।`,
      ],
    ],
  },
  {
    slug: "runner-bullet-100-v2-cheap-new-bike",
    bestCase: { use: "commute", where: "dhaka", experience: "first", pillion: "sometimes", priorities: ["price"] },
    week: 4,
    updated: "2026-10-24",
    minutes: 4,
    bike: BULLET,
    rival: GLINT,
    wins: ["Budget: cheapest new bike", "বাজেট: সবচেয়ে সস্তা নতুন বাইক"],
    title: ["Runner Bullet 100 V2: a cheap new bike with tubeless tyres", "Runner Bullet 100 V2: টিউবলেস টায়ারসহ সস্তা নতুন বাইক"],
    summary: [
      `${road(BULLET)} on the road, one of the lowest prices for a new bike on our list, from a Bangladeshi assembler. Here is what it gives over the even cheaper Lifan Glint 100.`,
      `অন-রোড ${road(BULLET)}, আমাদের তালিকায় নতুন বাইকের সবচেয়ে কম দামগুলোর একটি, দেশে সংযোজিত। আরও সস্তা Lifan Glint 100-এর চেয়ে এতে কী বেশি, তা এখানে।`,
    ],
    why: [
      [
        `Price. ${road(BULLET)} on the road (showroom price plus BRTA registration), ${gap(BULLET, "honda-shine-100")} ${lessMore(BULLET, "honda-shine-100")[0]} than the Honda Shine 100.`,
        `দাম। অন-রোড ${road(BULLET)} (শোরুমের দাম আর BRTA রেজিস্ট্রেশন মিলিয়ে), Honda Shine 100-এর চেয়ে ${gap(BULLET, "honda-shine-100")} ${lessMore(BULLET, "honda-shine-100")[1]}।`,
      ],
      [
        "Tubeless tyres and a front disc brake. A puncture can be plugged at a roadside shop, which the tube-type Glint cannot do.",
        "টিউবলেস টায়ার আর সামনে ডিস্ক ব্রেক। পাংচার হলে রাস্তার দোকানে প্লাগ দিয়ে সারানো যায়, টিউবওয়ালা Glint-এ তা যায় না।",
      ],
      [
        `Against the Lifan Glint 100: mechanic familiarity ${sc(BULLET).mechanicFamiliarity}/10 vs ${sc(GLINT).mechanicFamiliarity}/10 and parts ${sc(BULLET).partsAvailability}/10 vs ${sc(GLINT).partsAvailability}/10, for ${gap(BULLET, GLINT)} ${lessMore(BULLET, GLINT)[0]} on the road.`,
        `Lifan Glint 100-এর তুলনায়: মেকানিক চেনেন ${sc(BULLET).mechanicFamiliarity}/১০ বনাম ${sc(GLINT).mechanicFamiliarity}/১০, পার্টস ${sc(BULLET).partsAvailability}/১০ বনাম ${sc(GLINT).partsAvailability}/১০, অন-রোড ${gap(BULLET, GLINT)} ${lessMore(BULLET, GLINT)[1]}।`,
      ],
    ],
    who: [
      [
        "In our quiz, with the budget set at its own on-road price, it comes first for: a daily commute in Dhaka, a first bike, a pillion now and then, with low price as the priority.",
        "আমাদের কুইজে বাজেট এই বাইকের নিজের অন-রোড দামে রাখলে এটি প্রথম হয় এই উত্তরে: ঢাকায় রোজকার যাতায়াত, প্রথম বাইক, মাঝে মাঝে পেছনে একজন, আর অগ্রাধিকার কম দাম।",
      ],
      [
        "Riders on the tightest budget who want a new bike for short city trips and errands.",
        "যাঁদের বাজেট সবচেয়ে কম আর শহরের ছোট যাতায়াত ও কাজের জন্য নতুন বাইক চান।",
      ],
    ],
    tradeoffs: [
      [
        `${ps(BULLET)} PS and a top speed of about ${bike(BULLET).topSpeedKmh} km/h: highway ${sc(BULLET).highway}/10. It is a town bike.`,
        `${ps(BULLET)} PS আর সর্বোচ্চ গতি প্রায় ${bike(BULLET).topSpeedKmh} কিমি/ঘণ্টা: হাইওয়ে ${sc(BULLET).highway}/১০। এটা শহরের বাইক।`,
      ],
      [
        `Reliability ${sc(BULLET).reliability}/10 and resale ${sc(BULLET).resale}/10, against ${sc("honda-shine-100").reliability}/10 and ${sc("honda-shine-100").resale}/10 for the Honda Shine 100.`,
        `নির্ভরযোগ্যতা ${sc(BULLET).reliability}/১০ আর রিসেল ${sc(BULLET).resale}/১০; Honda Shine 100-এ ${sc("honda-shine-100").reliability}/১০ আর ${sc("honda-shine-100").resale}/১০।`,
      ],
      [
        `Real-world mileage ${kmpl(BULLET)} km/l, below the ${kmpl(HF)} km/l of the frugal Hero 100s.`,
        `বাস্তবে মাইলেজ ${kmpl(BULLET)} কিমি/লি, সাশ্রয়ী Hero ১০০সিসি বাইকগুলোর ${kmpl(HF)} কিমি/লি-এর চেয়ে কম।`,
      ],
    ],
  },
  {
    slug: "bajaj-ct-100-high-mileage",
    bestCase: { use: "commute", where: "dhaka", height: "short", experience: "some", pillion: "sometimes", priorities: ["mileage"] },
    week: 4,
    updated: "2026-10-24",
    minutes: 4,
    bike: CT,
    rival: HF,
    wins: ["Mileage and low running cost", "মাইলেজ আর কম চালানোর খরচ"],
    title: ["Bajaj CT 100: a plain 100 cc that sips fuel", "Bajaj CT 100: কম তেলে চলা সাদামাটা ১০০ সিসি"],
    summary: [
      `${kmpl(CT)} km/l in real riding, parts in every bazaar and a service of about ${formatBDT(bike(CT).avgServiceCostBDT)}, for ${road(CT)} on the road.`,
      `বাস্তবে ${kmpl(CT)} কিমি/লি, সব বাজারে পার্টস আর সার্ভিসে প্রায় ${formatBDT(bike(CT).avgServiceCostBDT)}, অন-রোড ${road(CT)}।`,
    ],
    why: [
      [
        `Real-world mileage ${kmpl(CT)} km/l from ${ps(CT)} PS, in the same band as the Hero HF Deluxe (${kmpl(HF)} km/l), among the best of the petrol bikes on our list.`,
        `${ps(CT)} PS থেকে বাস্তবে ${kmpl(CT)} কিমি/লি, Hero HF Deluxe-এর (${kmpl(HF)} কিমি/লি) সমান সারিতে, আমাদের তালিকার পেট্রোল বাইকের মধ্যে সেরাগুলোর একটি।`,
      ],
      [
        `Mechanic familiarity ${sc(CT).mechanicFamiliarity}/10 and parts ${sc(CT).partsAvailability}/10, with a service every ${svc(CT)} at about ${formatBDT(bike(CT).avgServiceCostBDT)}.`,
        `মেকানিক চেনেন ${sc(CT).mechanicFamiliarity}/১০, পার্টস ${sc(CT).partsAvailability}/১০, আর প্রতি ${svc(CT)}-এ সার্ভিসে প্রায় ${formatBDT(bike(CT).avgServiceCostBDT)}।`,
      ],
      [
        `A ${bike(CT).fuelTankL} L tank against ${bike(HF).fuelTankL} L on the HF Deluxe, ${bike(CT).groundClearanceMm} mm of ground clearance and ${bike(CT).weightKg} kg.`,
        `${bike(CT).fuelTankL} লিটারের ট্যাংক (HF Deluxe-এ ${bike(HF).fuelTankL} লিটার), ${bike(CT).groundClearanceMm} মিমি গ্রাউন্ড ক্লিয়ারেন্স আর ${bike(CT).weightKg} কেজি।`,
      ],
    ],
    who: [
      [
        "In our quiz, with the budget set at its own on-road price, it comes first for: commuting in Dhaka, a shorter rider, some riding experience, a pillion now and then, with mileage as the priority.",
        "আমাদের কুইজে বাজেট এই বাইকের নিজের অন-রোড দামে রাখলে এটি প্রথম হয় এই উত্তরে: ঢাকায় যাতায়াত, কম উচ্চতার চালক, কিছুটা অভিজ্ঞতা, মাঝে মাঝে পেছনে একজন, আর অগ্রাধিকার মাইলেজ।",
      ],
      [
        "Riders who count every litre: long daily commutes, delivery and errand work.",
        "যাঁরা প্রতি লিটারের হিসাব রাখেন: লম্বা রোজকার যাতায়াত, ডেলিভারি আর কাজের চলাচল।",
      ],
    ],
    tradeoffs: [
      [
        `The Hero HF Deluxe costs ${gap(HF, CT)} ${lessMore(HF, CT)[0]} on the road, has tubeless tyres, and scores reliability ${sc(HF).reliability}/10 vs ${sc(CT).reliability}/10 and resale ${sc(HF).resale}/10 vs ${sc(CT).resale}/10. Ride both.`,
        `Hero HF Deluxe-এর অন-রোড দাম ${gap(HF, CT)} ${lessMore(HF, CT)[1]}, টিউবলেস টায়ার, আর নির্ভরযোগ্যতা ${sc(HF).reliability}/১০ বনাম ${sc(CT).reliability}/১০, রিসেল ${sc(HF).resale}/১০ বনাম ${sc(CT).resale}/১০। দুটোই চালিয়ে দেখুন।`,
      ],
      [
        "Drum brakes at both ends with no CBS, and tube-type tyres. Keep your distance, and expect a roadside tube repair after a puncture.",
        "দুই চাকাতেই ড্রাম ব্রেক, CBS নেই, আর টিউবওয়ালা টায়ার। দূরত্ব রেখে চালান, আর পাংচার হলে রাস্তায় টিউব সারাতে হবে।",
      ],
      [
        `${ps(CT)} PS and ${bike(CT).gears} gears: highway ${sc(CT).highway}/10 and comfort ${sc(CT).comfort}/10. It is built for short, slow trips.`,
        `${ps(CT)} PS আর ${bike(CT).gears}টি গিয়ার: হাইওয়ে ${sc(CT).highway}/১০, আরাম ${sc(CT).comfort}/১০। এটি ছোট আর ধীর যাত্রার জন্য।`,
      ],
    ],
  },
  {
    slug: "honda-sp125-holds-its-value",
    bestCase: { use: "mixed", where: "dhaka", height: "short", experience: "first", pillion: "sometimes", priorities: ["resale"] },
    week: 4,
    updated: "2026-10-24",
    minutes: 4,
    bike: SP125,
    rival: GLAMOUR,
    wins: ["Resale value", "রিসেল ভ্যালু"],
    title: ["Honda SP125: a 125 that holds its value", "Honda SP125: দাম ধরে রাখা ১২৫"],
    summary: [
      `Resale ${sc(SP125).resale}/10 and reliability ${sc(SP125).reliability}/10, with fuel injection and ${kmpl(SP125)} km/l, for ${road(SP125)} on the road.`,
      `রিসেল ${sc(SP125).resale}/১০, নির্ভরযোগ্যতা ${sc(SP125).reliability}/১০, ফুয়েল ইনজেকশন আর ${kmpl(SP125)} কিমি/লি, অন-রোড ${road(SP125)}।`,
    ],
    why: [
      [
        `Resale ${sc(SP125).resale}/10.${sp125Used?.y1 && sp125Used.y3 ? ` In ${sp125Used.listingsSeen} used listings we checked (${sp125Used.asOf}), one-year-old bikes asked about ${formatBDT(sp125Used.y1)} and three-year-old ones about ${formatBDT(sp125Used.y3)}, against ${formatBDT(bike(SP125).priceBDT)} new.` : ""}`,
        `রিসেল ${sc(SP125).resale}/১০।${sp125Used?.y1 && sp125Used.y3 ? ` আমাদের দেখা ${sp125Used.listingsSeen}টি পুরনো বাইকের বিজ্ঞাপনে (${sp125Used.asOf}) এক বছরের পুরনোর চাওয়া দাম প্রায় ${formatBDT(sp125Used.y1)}, তিন বছরের প্রায় ${formatBDT(sp125Used.y3)}; নতুনের দাম ${formatBDT(bike(SP125).priceBDT)}।` : ""}`,
      ],
      [
        `Reliability ${sc(SP125).reliability}/10, fuel injection, a front disc with CBS and tubeless tyres, and ${kmpl(SP125)} km/l.`,
        `নির্ভরযোগ্যতা ${sc(SP125).reliability}/১০, ফুয়েল ইনজেকশন, সামনে ডিস্ক সঙ্গে CBS, টিউবলেস টায়ার, আর ${kmpl(SP125)} কিমি/লি।`,
      ],
      [
        `Against the Hero Glamour X 125: ${samePrice(SP125, GLAMOUR) ? "the same on-road price" : `${gap(SP125, GLAMOUR)} apart on the road`}, reliability ${sc(SP125).reliability}/10 vs ${sc(GLAMOUR).reliability}/10, resale ${sc(SP125).resale}/10 vs ${sc(GLAMOUR).resale}/10, and ${kmpl(SP125)} vs ${kmpl(GLAMOUR)} km/l.`,
        `Hero Glamour X 125-এর তুলনায়: ${samePrice(SP125, GLAMOUR) ? "অন-রোড দাম একই" : `অন-রোড দামে পার্থক্য ${gap(SP125, GLAMOUR)}`}, নির্ভরযোগ্যতা ${sc(SP125).reliability}/১০ বনাম ${sc(GLAMOUR).reliability}/১০, রিসেল ${sc(SP125).resale}/১০ বনাম ${sc(GLAMOUR).resale}/১০, মাইলেজ ${kmpl(SP125)} বনাম ${kmpl(GLAMOUR)} কিমি/লি।`,
      ],
    ],
    who: [
      [
        "In our quiz, with the budget set at its own on-road price, it comes first for: mixed riding from Dhaka, a shorter rider, a first bike, a pillion now and then, with resale as the priority.",
        "আমাদের কুইজে বাজেট এই বাইকের নিজের অন-রোড দামে রাখলে এটি প্রথম হয় এই উত্তরে: ঢাকা থেকে মিশ্র চালানো, কম উচ্চতার চালক, প্রথম বাইক, মাঝে মাঝে পেছনে একজন, আর অগ্রাধিকার রিসেল।",
      ],
      [
        "Riders who plan to move up to a bigger bike in a few years and want most of their money back when they sell.",
        "যাঁরা কয়েক বছর পরে বড় বাইকে যেতে চান আর বিক্রির সময় বেশিরভাগ টাকা ফেরত চান।",
      ],
    ],
    tradeoffs: [
      [
        `Pillion ${sc(SP125).pillion}/10 and comfort ${sc(SP125).comfort}/10, against ${sc(GLAMOUR).pillion}/10 and ${sc(GLAMOUR).comfort}/10 on the Glamour X: the rear feels firm with a passenger.`,
        `পেছনের আসন ${sc(SP125).pillion}/১০, আরাম ${sc(SP125).comfort}/১০; Glamour X-এ ${sc(GLAMOUR).pillion}/১০ আর ${sc(GLAMOUR).comfort}/১০: পেছনে কেউ থাকলে শক্ত লাগে।`,
      ],
      [
        `Thin tyres and no ABS (CBS only). A service costs about ${formatBDT(bike(SP125).avgServiceCostBDT)} every ${svc(SP125)}.`,
        `সরু টায়ার, ABS নেই (শুধু CBS)। প্রতি ${svc(SP125)}-এ সার্ভিসে প্রায় ${formatBDT(bike(SP125).avgServiceCostBDT)}।`,
      ],
    ],
  },
  {
    slug: "bajaj-pulsar-f250-faired-looks",
    bestCase: { use: "mixed", where: "dhaka", experience: "some", pillion: "sometimes", priorities: ["style"], looks: ["sport"] },
    week: 4,
    updated: "2026-10-24",
    minutes: 4,
    bike: F250,
    rival: "suzuki-gixxer-sf-250",
    wins: ["Looks and style", "লুক আর স্টাইল"],
    title: ["Bajaj Pulsar F250: a half-faired 250 that looks the part", "Bajaj Pulsar F250: চোখে পড়ার মতো হাফ-ফেয়ারিং ২৫০"],
    summary: [
      `A half fairing, ${ps(F250)} PS and dual-channel ABS, for ${road(F250)} on the road, ${gap(F250, "suzuki-gixxer-sf-250")} ${lessMore(F250, "suzuki-gixxer-sf-250")[0]} than the Suzuki Gixxer SF 250.`,
      `হাফ ফেয়ারিং, ${ps(F250)} PS আর ডুয়াল-চ্যানেল ABS, অন-রোড ${road(F250)}, Suzuki Gixxer SF 250-এর চেয়ে ${gap(F250, "suzuki-gixxer-sf-250")} ${lessMore(F250, "suzuki-gixxer-sf-250")[1]}।`,
    ],
    why: [
      [
        `A faired sport look with ${ps(F250)} PS and ${bike(F250).torqueNm} Nm behind it. Our looks ranking puts it just behind the Suzuki GSX-R150 and Yamaha R15 V4, which cost ${road(GSXR)} and ${road(R15)} on the road.`,
        `${ps(F250)} PS আর ${bike(F250).torqueNm} Nm-সহ ফেয়ারিংওয়ালা স্পোর্ট লুক। আমাদের লুক র‍্যাংকিংয়ে এটি Suzuki GSX-R150 আর Yamaha R15 V4-এর ঠিক পরে, যাদের অন-রোড দাম ${road(GSXR)} আর ${road(R15)}।`,
      ],
      [
        `Disc brakes at both ends with dual-channel ABS, highway ${sc(F250).highway}/10 and comfort ${sc(F250).comfort}/10: the fairing earns its keep on the highway.`,
        `দুই চাকাতেই ডিস্ক ব্রেক সঙ্গে ডুয়াল-চ্যানেল ABS, হাইওয়ে ${sc(F250).highway}/১০, আরাম ${sc(F250).comfort}/১০: হাইওয়েতে ফেয়ারিং সত্যিই কাজে লাগে।`,
      ],
      [
        `Against the Gixxer SF 250: ${ps(F250)} vs ${ps("suzuki-gixxer-sf-250")} PS, pillion ${sc(F250).pillion}/10 vs ${sc("suzuki-gixxer-sf-250").pillion}/10, comfort ${sc(F250).comfort}/10 vs ${sc("suzuki-gixxer-sf-250").comfort}/10, and a service of about ${formatBDT(bike(F250).avgServiceCostBDT)} vs ${formatBDT(bike("suzuki-gixxer-sf-250").avgServiceCostBDT)}.`,
        `Gixxer SF 250-এর তুলনায়: শক্তি ${ps(F250)} বনাম ${ps("suzuki-gixxer-sf-250")} PS, পেছনের আসন ${sc(F250).pillion}/১০ বনাম ${sc("suzuki-gixxer-sf-250").pillion}/১০, আরাম ${sc(F250).comfort}/১০ বনাম ${sc("suzuki-gixxer-sf-250").comfort}/১০, আর সার্ভিসে প্রায় ${formatBDT(bike(F250).avgServiceCostBDT)} বনাম ${formatBDT(bike("suzuki-gixxer-sf-250").avgServiceCostBDT)}।`,
      ],
    ],
    who: [
      [
        "In our quiz, with the budget set at its own on-road price, it comes first for: mixed riding from Dhaka, some riding experience, a pillion now and then, with looks as the priority and a sport look chosen.",
        "আমাদের কুইজে বাজেট এই বাইকের নিজের অন-রোড দামে রাখলে এটি প্রথম হয় এই উত্তরে: ঢাকা থেকে মিশ্র চালানো, কিছুটা অভিজ্ঞতা, মাঝে মাঝে পেছনে একজন, আর অগ্রাধিকার লুক, স্পোর্ট ধাঁচ বেছে নিয়ে।",
      ],
      [
        "Riders who want a faired bike that still carries a passenger and handles a long highway day.",
        "যাঁরা ফেয়ারিংওয়ালা বাইক চান, যেটা পেছনে যাত্রী নিতে পারে আর হাইওয়েতে সারাদিন চলতে পারে।",
      ],
    ],
    tradeoffs: [
      [
        `${bike(F250).weightKg} kg and city handling ${sc(F250).cityHandling}/10: heavy and hot in a jam. Beginner-friendly only ${sc(F250).beginnerFriendly}/10; not a first bike.`,
        `${bike(F250).weightKg} কেজি আর শহরে চালানো ${sc(F250).cityHandling}/১০: জ্যামে ভারী আর গরম। নতুনদের জন্য মাত্র ${sc(F250).beginnerFriendly}/১০; প্রথম বাইক হিসেবে নয়।`,
      ],
      [
        `${kmpl(F250)} km/l and a service of about ${formatBDT(bike(F250).avgServiceCostBDT)} every ${svc(F250)}. Fairing panels are costly to replace after a fall.`,
        `মাইলেজ ${kmpl(F250)} কিমি/লি আর প্রতি ${svc(F250)}-এ সার্ভিসে প্রায় ${formatBDT(bike(F250).avgServiceCostBDT)}। পড়ে গেলে ফেয়ারিং বদলাতে খরচ বেশি।`,
      ],
    ],
  },
  {
    slug: "tvs-apache-rtr-160-4v-broken-roads",
    bestCase: { use: "rough", where: "dhaka", experience: "some", pillion: "rarely", priorities: ["performance"] },
    week: 4,
    updated: "2026-10-24",
    minutes: 4,
    bike: APACHE4V,
    rival: "bajaj-pulsar-n160",
    wins: ["Broken roads", "ভাঙা রাস্তা"],
    title: ["TVS Apache RTR 160 4V: a sharp 160 with room underneath", "TVS Apache RTR 160 4V: নিচে জায়গাওয়ালা চটপটে ১৬০"],
    summary: [
      `${bike(APACHE4V).groundClearanceMm} mm of ground clearance, ${ps(APACHE4V)} PS and ${bike(APACHE4V).weightKg} kg, for ${road(APACHE4V)} on the road.`,
      `${bike(APACHE4V).groundClearanceMm} মিমি গ্রাউন্ড ক্লিয়ারেন্স, ${ps(APACHE4V)} PS আর ${bike(APACHE4V).weightKg} কেজি, অন-রোড ${road(APACHE4V)}।`,
    ],
    why: [
      [
        `${bike(APACHE4V).groundClearanceMm} mm of ground clearance against ${bike("bajaj-pulsar-n160").groundClearanceMm} mm on the Pulsar N160, and a rear monoshock: speed breakers and broken patches are less of a worry.`,
        `${bike(APACHE4V).groundClearanceMm} মিমি গ্রাউন্ড ক্লিয়ারেন্স (Pulsar N160-এ ${bike("bajaj-pulsar-n160").groundClearanceMm} মিমি) আর পেছনে মনোশক: স্পিড ব্রেকার আর ভাঙা অংশে চিন্তা কম।`,
      ],
      [
        `${bike(APACHE4V).weightKg} kg against ${bike("bajaj-pulsar-n160").weightKg} kg for the N160, with city handling ${sc(APACHE4V).cityHandling}/10 vs ${sc("bajaj-pulsar-n160").cityHandling}/10, so it is easy to place around holes and through jams.`,
        `${bike(APACHE4V).weightKg} কেজি (N160 ${bike("bajaj-pulsar-n160").weightKg} কেজি), শহরে চালানো ${sc(APACHE4V).cityHandling}/১০ বনাম ${sc("bajaj-pulsar-n160").cityHandling}/১০, তাই গর্ত এড়িয়ে আর জ্যামের মধ্যে চালানো সহজ।`,
      ],
      [
        `${ps(APACHE4V)} PS vs ${ps("bajaj-pulsar-n160")} PS, performance ${sc(APACHE4V).performance}/10 and resale ${sc(APACHE4V).resale}/10, for ${gap(APACHE4V, "bajaj-pulsar-n160")} ${lessMore(APACHE4V, "bajaj-pulsar-n160")[0]} than the N160 on the road.`,
        `শক্তি ${ps(APACHE4V)} বনাম ${ps("bajaj-pulsar-n160")} PS, পারফরম্যান্স ${sc(APACHE4V).performance}/১০, রিসেল ${sc(APACHE4V).resale}/১০, অন-রোড N160-এর চেয়ে ${gap(APACHE4V, "bajaj-pulsar-n160")} ${lessMore(APACHE4V, "bajaj-pulsar-n160")[1]}।`,
      ],
    ],
    who: [
      [
        "In our quiz, with the budget set at its own on-road price, it comes first for: rough roads around Dhaka, some riding experience, rarely a pillion, with performance as the priority.",
        "আমাদের কুইজে বাজেট এই বাইকের নিজের অন-রোড দামে রাখলে এটি প্রথম হয় এই উত্তরে: ঢাকার আশেপাশের খারাপ রাস্তা, কিছুটা অভিজ্ঞতা, পেছনে কেউ খুব কম, আর অগ্রাধিকার পারফরম্যান্স।",
      ],
      [
        "Riders who want a quick 160 for broken city roads and the odd weekend ride.",
        "যাঁরা ভাঙা শহুরে রাস্তা আর মাঝে মাঝে ছুটির দিনের রাইডের জন্য চটপটে ১৬০ চান।",
      ],
    ],
    tradeoffs: [
      [
        "Single-channel ABS where the N160 has dual-channel, and a carburettor where the N160 has fuel injection.",
        "সিঙ্গেল-চ্যানেল ABS, যেখানে N160-এ ডুয়াল-চ্যানেল; আর কার্বুরেটর, যেখানে N160-এ ফুয়েল ইনজেকশন।",
      ],
      [
        `Pillion ${sc(APACHE4V).pillion}/10 vs ${sc("bajaj-pulsar-n160").pillion}/10 and firm suspension (comfort ${sc(APACHE4V).comfort}/10). It is a road bike with good clearance, not an off-roader (off-road ${sc(APACHE4V).offroad}/10).`,
        `পেছনের আসন ${sc(APACHE4V).pillion}/১০ বনাম ${sc("bajaj-pulsar-n160").pillion}/১০, আর শক্ত সাসপেনশন (আরাম ${sc(APACHE4V).comfort}/১০)। এটি ভালো ক্লিয়ারেন্সের রোড বাইক, অফ-রোডার নয় (অফ-রোড ${sc(APACHE4V).offroad}/১০)।`,
      ],
      [
        `Mileage ${kmpl(APACHE4V)} km/l and a service of about ${formatBDT(bike(APACHE4V).avgServiceCostBDT)} every ${svc(APACHE4V)}.`,
        `মাইলেজ ${kmpl(APACHE4V)} কিমি/লি আর প্রতি ${svc(APACHE4V)}-এ সার্ভিসে প্রায় ${formatBDT(bike(APACHE4V).avgServiceCostBDT)}।`,
      ],
    ],
  },
];

// Bangla halves: ৳ amounts and "N/১০" scores get Bangla digits; other numbers stay as written ("R15 V4" keeps Latin).
const bnNums = ([en, bn]: Pair): Pair => [en, bn.replace(/৳[\d,.]+|\d+(?:\.\d+)?(?=\/১০)/g, bnDigits)];
export const SPOTLIGHTS: Spotlight[] = POSTS.map((s) => ({
  ...s,
  wins: bnNums(s.wins),
  title: bnNums(s.title),
  summary: bnNums(s.summary),
  why: s.why.map(bnNums),
  who: s.who.map(bnNums),
  tradeoffs: s.tradeoffs.map(bnNums),
}));

export const spotlightBySlug = (slug: string) => SPOTLIGHTS.find((s) => s.slug === slug);
