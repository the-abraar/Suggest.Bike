// Weekly bike spotlights: each week, 5 bikes that each win a different segment of "Best in BD by segment"
// (docs/each bike speciality.html, section 3). Prices, mileage, power and scores are read from bikes.json at build
// time, so the text never drifts from the data. Each post's quiz claim is its `bestCase`, which a test re-runs against match.ts.
import { formatBDT, getBike } from "./bikes";
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

export const SPOTLIGHTS: Spotlight[] = [
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
        "আমাদের কুইজে বাজেট এর নিজের অন-রোড দামে রাখলে এটি প্রথম হয় এই উত্তরে: ঢাকায় রোজকার যাতায়াত, প্রথম বাইক, মাঝে মাঝে পেছনে একজন।",
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
        "আমাদের কুইজে বাজেট এর নিজের অন-রোড দামে রাখলে এটি প্রথম হয় এই উত্তরে: ঢাকায় যাতায়াত, পেছনে কেউ কম বসেন, আর অগ্রাধিকার মাইলেজ ও রিসেল।",
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
        "আমাদের কুইজে বাজেট এর নিজের অন-রোড দামে রাখলে এটি প্রথম হয় এই উত্তরে: ঢাকায় যাতায়াত, কম উচ্চতার চালক, পেছনে কেউ কম বসেন, আর অগ্রাধিকার কম রক্ষণাবেক্ষণ, রিসেল, নিরাপত্তা ও স্টাইল।",
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
        "বিশেষজ্ঞ বাইক: আমাদের কুইজে বাজেট এর নিজের অন-রোড দামে রাখলে এটি প্রথম হয় এই উত্তরে: শখে চালানো, কিছুটা অভিজ্ঞ ও কম উচ্চতার চালক, পেছনে কেউ কম বসেন, আর অগ্রাধিকার পারফরম্যান্স।",
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
        "বিশেষজ্ঞ বাইক: আমাদের কুইজে বাজেট এর নিজের অন-রোড দামে রাখলে এটি প্রথম হয় এই উত্তরে: হাইওয়েতে চালানো, কিছুটা অভিজ্ঞ ও কম উচ্চতার চালক, আর অগ্রাধিকার আরাম।",
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
];

export const spotlightBySlug = (slug: string) => SPOTLIGHTS.find((s) => s.slug === slug);
