import type { BikeImage } from "./types";

export type Pair = [en: string, bn: string];
export type Figure = { alt: Pair; caption: Pair; width: number; height: number; image: BikeImage };
export type Post = {
  slug: string;
  updated: string;
  minutes: number;
  title: Pair;
  summary: Pair;
  need?: Pair[];
  figures?: Figure[];
  steps: Pair[];
  avoid: Pair[];
  mechanic: Pair[];
  related?: string[]; // slugs shown under "More guides" instead of the default next five
};

// Shared blocks for the four used-bike checklists (used-check-*). Engine-specific steps sit between them.
const USED_PAPERS: Pair[] = [
  ["Ask for the papers before you even look at the bike: the BRTA registration certificate (smart card, or the older blue book), the tax token, the insurance paper and the seller's NID. Motorcycles do not need a fitness certificate, so that is not one to look for.", "বাইক দেখার আগেই কাগজ দেখতে চান: BRTA রেজিস্ট্রেশন সার্টিফিকেট (স্মার্ট কার্ড, বা পুরনো ব্লু বুক), ট্যাক্স টোকেন, ইন্স্যুরেন্সের কাগজ আর বিক্রেতার এনআইডি। মোটরসাইকেলে ফিটনেস সার্টিফিকেট লাগে না, তাই ওটা খোঁজার দরকার নেই।"],
  ["Match the name on the registration to the seller's NID. If the bike is in someone else's name, the registered owner must sign the ownership transfer with you. Without that signature BRTA will not move the bike into your name.", "রেজিস্ট্রেশনের নাম আর বিক্রেতার এনআইডির নাম মিলিয়ে দেখুন। বাইক অন্য কারো নামে থাকলে, মালিকানা বদলের কাগজে আসল মালিককেই আপনার সাথে সই করতে হবে। সেই সই ছাড়া BRTA বাইক আপনার নামে করবে না।"],
  ["Read the chassis number (stamped on the frame, usually near the steering head) and the engine number (on the engine case). Both must match the registration exactly. Filed, re-stamped, painted-over or uneven digits are a reason to walk away.", "চেসিস নম্বর (ফ্রেমে খোদাই করা, সাধারণত হ্যান্ডেলের নিচে স্টিয়ারিং হেডের কাছে) আর ইঞ্জিন নম্বর (ইঞ্জিনের কেসিংয়ে) পড়ুন। দুটোই রেজিস্ট্রেশনের সাথে হুবহু মিলতে হবে। ঘষা, নতুন করে খোদাই করা, রং দিয়ে ঢাকা বা এলোমেলো অক্ষর দেখলে সেখানেই কেনা বাদ দিন।"],
  ["The number plate should be the BRTA-issued digital (retro-reflective) plate with the same number as the papers. A hand-made or mismatched plate needs a clear explanation.", "নম্বর প্লেট হতে হবে BRTA-র দেওয়া ডিজিটাল (রেট্রো-রিফ্লেক্টিভ) প্লেট, আর নম্বর কাগজের সাথে মিলতে হবে। হাতে বানানো বা না-মেলা প্লেট হলে পরিষ্কার ব্যাখ্যা চান।"],
  ["Check the tax token's expiry date. If it has lapsed, the arrears and fines usually land on whoever owns the bike next, so agree who pays before any money changes hands.", "ট্যাক্স টোকেনের মেয়াদ কবে শেষ দেখুন। মেয়াদ পেরিয়ে গেলে বকেয়া আর জরিমানা সাধারণত পরের মালিকের ঘাড়েই পড়ে, তাই টাকা দেওয়ার আগেই ঠিক করুন কে দেবে।"],
  ["Ask whether the bike has pending traffic cases or e-fines, and check yourself on the official online service before paying (our e-fines guide shows how). Unpaid cases follow the bike.", "বাইকের নামে কোনো ট্রাফিক মামলা বা ই-ফাইন বাকি আছে কি না জিজ্ঞেস করুন, আর টাকা দেওয়ার আগে নিজে অফিসিয়াল অনলাইন সেবায় যাচাই করুন (কীভাবে, তা আমাদের ই-ফাইন গাইডে আছে)। বকেয়া মামলা বাইকের সাথেই থেকে যায়।"],
  ["Write a sale receipt with both NID numbers, the date, the price and the chassis and engine numbers, signed by both of you. Then do the ownership transfer at BRTA soon. Until it is done, the bike legally stays in the seller's name.", "একটি বিক্রয় রসিদ লিখুন: দুজনের এনআইডি নম্বর, তারিখ, দাম, চেসিস আর ইঞ্জিন নম্বরসহ, আর দুজনেই সই করুন। তারপর দেরি না করে BRTA-তে মালিকানা বদল করুন। সেটা না হওয়া পর্যন্ত আইনত বাইক বিক্রেতার নামেই থাকে।"],
];
const USED_ENGINE: Pair[] = [
  ["Ask the seller not to start or ride the bike before you arrive, and touch the engine when you get there. It should be cold. A warm engine hides hard starting, smoke and noises.", "বিক্রেতাকে বলুন আপনি পৌঁছানোর আগে যেন বাইক স্টার্ট বা চালানো না হয়, আর গিয়ে ইঞ্জিনে হাত দিয়ে দেখুন। ঠান্ডা থাকা উচিত। গরম ইঞ্জিনে স্টার্টের সমস্যা, ধোঁয়া আর শব্দ লুকিয়ে যায়।"],
  ["Start it and watch the exhaust, then rev it a few times. Thin white vapour on a cool morning that clears in a minute is normal. Blue or grey smoke means it is burning oil (worn rings or valve seals). Black smoke means it is running too rich.", "স্টার্ট দিয়ে সাইলেন্সারের দিকে তাকান, তারপর কয়েকবার রেভ দিন। ঠান্ডা সকালে হালকা সাদা বাষ্প এক মিনিটে মিলিয়ে গেলে স্বাভাবিক। নীল বা ধূসর ধোঁয়া মানে ইঞ্জিন অয়েল পুড়ছে (রিং বা ভালভ সিল ক্ষয়)। কালো ধোঁয়া মানে তেল বেশি পুড়ছে, মিক্সচার রিচ।"],
  ["Listen at idle and as it warms. A light, even ticking is normal. Loud tapping from the top, knocking from the bottom, a rattle for the first seconds after start-up, or grinding are not. Look for oil seeping around the cylinder head and the base of the cylinder.", "আইডলে আর গরম হওয়ার সময় কান পাতুন। হালকা, সমান টিকটিক শব্দ স্বাভাবিক। ওপর থেকে জোরে ঠকঠক, নিচ থেকে ধাক্কার মতো শব্দ, স্টার্টের পর প্রথম কয়েক সেকেন্ড ঝনঝন, বা ঘষার শব্দ ভালো লক্ষণ নয়। সিলিন্ডার হেড আর সিলিন্ডারের গোড়ায় অয়েল চুইয়ে পড়ছে কি না দেখুন।"],
  ["Hard starting together with weak pulling and blue smoke points to a tired top end (low compression). A mechanic can measure compression with a gauge in a few minutes.", "স্টার্ট নিতে কষ্ট, টান কম আর সাথে নীল ধোঁয়া মানে ইঞ্জিনের ওপরের অংশ ক্লান্ত (কম্প্রেশন কম)। মেকানিক গেজ দিয়ে কয়েক মিনিটেই কম্প্রেশন মেপে দিতে পারেন।"],
];
const USED_CHASSIS: Pair[] = [
  ["Clutch slip test: in a high gear at low speed, open the throttle quickly. If the revs jump but the bike barely speeds up, the clutch plates are worn. It should also find neutral easily, and the lever should have a little free play.", "ক্লাচ স্লিপ টেস্ট: উঁচু গিয়ারে কম গতিতে হঠাৎ থ্রটল খুলুন। রেভ লাফিয়ে উঠল কিন্তু বাইক তেমন জোরে গেল না, মানে ক্লাচ প্লেট ক্ষয়ে গেছে। নিউট্রালও সহজে পাওয়া উচিত, আর লিভারে একটু ঢিলা থাকা উচিত।"],
  ["Chain and sprockets: try to pull the chain backwards off the rear sprocket. If it lifts away and shows a big gap, the chain is stretched. Hooked or pointed teeth mean the chain and both sprockets are due.", "চেইন আর স্প্রকেট: পেছনের স্প্রকেটের পেছন দিক থেকে চেইন টেনে তোলার চেষ্টা করুন। অনেকখানি উঠে ফাঁক দেখা গেলে চেইন লম্বা হয়ে গেছে। দাঁত হুকের মতো বা সুচালো হলে চেইন আর দুই স্প্রকেটই বদলানোর সময়।"],
  ["Accident signs: scraped bar ends, levers, footpegs, mirrors or engine cover; dents in the tank; new panels that do not match the rest; welding or fresh paint on the frame. Stand in front and behind: both wheels should line up, and the handlebar should be straight when the front wheel is.", "দুর্ঘটনার চিহ্ন: হ্যান্ডেলের মাথা, লিভার, ফুটপেগ, আয়না বা ইঞ্জিন কাভারে ঘষার দাগ; ট্যাংকে টোল; বাকিগুলোর সাথে না-মেলা নতুন প্যানেল; ফ্রেমে ওয়েল্ডিং বা নতুন রং। সামনে আর পেছনে দাঁড়িয়ে দেখুন: দুই চাকা এক লাইনে থাকা উচিত, আর সামনের চাকা সোজা থাকলে হ্যান্ডেলও সোজা থাকা উচিত।"],
  ["Forks and steering: look at the shiny fork tubes for oil, rust or pitting. Push down on the front a few times; it should rebound smoothly, without clunks. Turn the bar from lock to lock; it should move smoothly, not notchy or loose.", "ফর্ক আর স্টিয়ারিং: ফর্কের চকচকে টিউবে অয়েল, মরচে বা ছোট গর্ত আছে কি না দেখুন। সামনের দিক কয়েকবার চেপে ছাড়ুন; মসৃণভাবে উঠে আসা উচিত, ঠকঠক শব্দ ছাড়া। হ্যান্ডেল এক পাশ থেকে আরেক পাশে ঘোরান; মসৃণ হওয়া উচিত, আটকে আটকে বা ঢিলা নয়।"],
  ["Flood damage, common after the monsoon: dried mud or silt where washing does not reach (under the seat, in the air box, around wiring plugs, behind the headlight), green or white crust on connectors, rust on bolts low on the bike, fog or a water line inside the headlight or meter, a musty smell, and milky engine oil.", "বন্যার ক্ষতি, বর্ষার পর যা প্রায়ই দেখা যায়: যেখানে ধোয়ার পানি পৌঁছায় না সেখানে শুকনো কাদা বা পলি (সিটের নিচে, এয়ার বক্সে, তারের প্লাগের আশপাশে, হেডলাইটের পেছনে), কানেক্টরে সবুজ বা সাদা আস্তর, বাইকের নিচের দিকের বোল্টে মরচে, হেডলাইট বা মিটারের ভেতরে ঝাপসা ভাব বা পানির দাগ, স্যাঁতসেঁতে গন্ধ, আর দুধের মতো ইঞ্জিন অয়েল।"],
  ["Odometer: do not trust the number alone. Both mechanical and digital meters can be wound back. Compare it with the service book stamps and with wear on the grips, footpeg rubbers, gear lever, brake pedal, seat, tyres and chain. Very low kilometres with worn rubber and a stretched chain do not add up.", "ওডোমিটার: শুধু সংখ্যার ওপর ভরসা করবেন না। মেকানিক্যাল আর ডিজিটাল দুই ধরনের মিটারই পিছিয়ে দেওয়া যায়। সার্ভিস বুকের সিলের সাথে মিলিয়ে দেখুন, আর গ্রিপ, ফুটপেগের রাবার, গিয়ার লিভার, ব্রেক প্যাডেল, সিট, টায়ার আর চেইনের ক্ষয়ের সাথে। কিলোমিটার খুব কম অথচ রাবার ক্ষয়ে গেছে আর চেইন ঢিলা, এ হিসাব মেলে না।"],
  ["Test ride with your licence and a helmet on a quiet road. Use every gear up and down, brake firmly once from moderate speed, ride straight with a light grip to feel any pull to one side, and check the horn, lights, indicators, self-start and kick start if fitted.", "নিজের লাইসেন্স আর হেলমেট নিয়ে ফাঁকা রাস্তায় টেস্ট রাইড দিন। সব গিয়ার ওঠানামা করুন, মাঝারি গতি থেকে একবার জোরে ব্রেক করুন, হালকা হাতে সোজা চালিয়ে দেখুন এক পাশে টানে কি না, আর হর্ন, লাইট, ইন্ডিকেটর, সেলফ স্টার্ট আর কিক (থাকলে) পরীক্ষা করুন।"],
  ["Before paying, have a mechanic you trust look it over, not one the seller brings. If anything above worried you, use it to lower the price or walk away.", "টাকা দেওয়ার আগে নিজের বিশ্বস্ত মেকানিক দিয়ে দেখান, বিক্রেতার আনা মেকানিক দিয়ে নয়। ওপরের কোনো কিছু নিয়ে খটকা লাগলে সেটা দেখিয়ে দাম কমান, নয়তো কেনা বাদ দিন।"],
];
const USED_AVOID: Pair[] = [
  ["Jumping at a price far below the usual used price for that model and year. The common reasons are a stolen bike, flood or accident damage, or papers that are missing or cannot be transferred. Be extra careful, or walk away.", "ওই মডেল আর বছরের সাধারণ সেকেন্ড-হ্যান্ড দামের চেয়ে অনেক কম দাম দেখে লাফিয়ে পড়া। এর পেছনে সাধারণত থাকে চুরির বাইক, বন্যা বা দুর্ঘটনার ক্ষতি, অথবা কাগজ নেই বা হস্তান্তর করা যায় না। বাড়তি সাবধান হোন, নয়তো সরে আসুন।"],
  ["Paying an advance to 'hold' the bike before you have seen the original papers and matched the numbers yourself.", "আসল কাগজ দেখা আর নিজে নম্বর মেলানোর আগেই বাইক 'আটকে রাখতে' অগ্রিম টাকা দেওয়া।"],
  ["Buying on 'the papers will come later', or with only a photocopy of the registration.", "'কাগজ পরে দেব' কথায় কেনা, বা শুধু রেজিস্ট্রেশনের ফটোকপি দেখে কেনা।"],
  ["Inspecting at night, in the rain or right after a wash. Water hides leaks, and darkness hides dents and smoke.", "রাতে, বৃষ্টিতে বা সদ্য ধোয়ার পর বাইক দেখা। পানি লিক লুকায়, আর অন্ধকারে টোল আর ধোঁয়া চোখে পড়ে না।"],
];
const USED_MECHANIC: Pair[] = [
  ["Always, before you pay. A short inspection costs far less than buying the wrong bike.", "সবসময়, টাকা দেওয়ার আগে। ছোট একটা পরীক্ষার খরচ ভুল বাইক কেনার ক্ষতির চেয়ে অনেক কম।"],
  ["Blue smoke, knocking, clutch slip or a bike that pulls to one side: get a compression test or frame check and price the repair before you agree.", "নীল ধোঁয়া, ঠকঠক শব্দ, ক্লাচ স্লিপ বা এক পাশে টানা: রাজি হওয়ার আগে কম্প্রেশন টেস্ট বা ফ্রেম চেক করিয়ে মেরামতের খরচ জেনে নিন।"],
];

// Generic starter guides for Bangladesh riders. The owner rewrites these over time; keep slugs stable so links and the sitemap do not break.
export const POSTS: Post[] = [
  {
    slug: "tyre-pressure",
    updated: "2026-10-13",
    minutes: 3,
    title: ["How to check and set tyre pressure", "টায়ারের প্রেসার কীভাবে দেখবেন ও ঠিক করবেন"],
    summary: [
      "Low pressure quietly eats mileage, grip and tyre life. A one-minute monthly check fixes it.",
      "প্রেসার কম থাকলে চুপচাপ মাইলেজ, গ্রিপ আর টায়ারের আয়ু কমে। মাসে এক মিনিটের চেক এটা ঠিক রাখে।",
    ],
    need: [
      ["A tyre pressure gauge (small pen type is fine), or a petrol pump air gauge", "একটি টায়ার প্রেসার গেজ (ছোট পেন টাইপই যথেষ্ট), অথবা পেট্রোল পাম্পের এয়ার গেজ"],
    ],
    steps: [
      ["Check when the tyres are cold: before you ride, or after the bike has stood for a couple of hours.", "টায়ার ঠান্ডা থাকতে মাপুন: রাইডের আগে, অথবা বাইক কয়েক ঘণ্টা দাঁড়িয়ে থাকার পর।"],
      ["Find the recommended pressure in your owner's manual or on the sticker on the swingarm or chain guard. Front and rear are usually different, and it is higher with a pillion.", "ওনার্স ম্যানুয়ালে বা সুইংআর্ম/চেইন গার্ডের স্টিকারে সঠিক প্রেসার লেখা থাকে। সামনে-পেছনে সাধারণত আলাদা, আর পিলিয়ন থাকলে একটু বেশি।"],
      ["Unscrew the valve cap and press the gauge on straight and firmly until the hissing stops. Read the number.", "ভালভের ক্যাপ খুলে গেজ সোজা করে জোরে চেপে ধরুন, হিসহিস শব্দ থামলে সংখ্যাটা পড়ুন।"],
      ["Add air if it is low. If it is high, press the valve pin briefly to let a little out. Measure again.", "কম হলে বাতাস দিন। বেশি হলে ভালভের পিন একটু চেপে কিছু বাতাস ছাড়ুন। আবার মাপুন।"],
      ["Refit the valve cap; it keeps dust and water out. Look over the tread and sidewalls for cracks, nails and stones while you are there.", "ভালভের ক্যাপ আবার লাগান; এতে ধুলা-পানি ঢোকে না। সাথে ট্রেড আর পাশের দেয়ালে ফাটল, পেরেক বা পাথর আছে কি না দেখে নিন।"],
    ],
    avoid: [
      ["Measuring right after a ride. Warm tyres read higher and you will under-inflate.", "রাইডের ঠিক পরে মাপা। গরম টায়ারে রিডিং বেশি আসে, ফলে আসলে প্রেসার কম থেকে যাবে।"],
      ["Judging by eye or by pressing with a thumb. It is not accurate.", "চোখে দেখে বা আঙুলে টিপে আন্দাজ করা। এতে সঠিক বোঝা যায় না।"],
      ["Over-inflating for mileage. You gain little and lose grip, especially on wet roads.", "মাইলেজের আশায় বেশি বাতাস ভরা। লাভ সামান্য, কিন্তু বিশেষ করে ভেজা রাস্তায় গ্রিপ হারান।"],
    ],
    mechanic: [
      ["A tyre that loses air within days: puncture or a faulty valve.", "কয়েক দিনেই বাতাস কমে যায়: পাংচার বা ভালভের সমস্যা।"],
      ["Bulges, deep cracks, or tread worn down to the wear indicator.", "টায়ারে ফোলা অংশ, গভীর ফাটল, বা ট্রেড ক্ষয়ে ওয়্যার ইন্ডিকেটরে পৌঁছে গেছে।"],
    ],
  },
  {
    slug: "chain-clean-and-lube",
    updated: "2026-10-13",
    minutes: 5,
    title: ["Cleaning and lubing your chain", "চেইন পরিষ্কার ও লুব করা"],
    summary: [
      "A dry or gritty chain wears out the sprockets too. Ten minutes every few weeks saves a costly replacement.",
      "শুকনো বা ময়লা চেইন স্প্রকেটকেও নষ্ট করে। কয়েক সপ্তাহে দশ মিনিটের যত্নে দামি বদল এড়ানো যায়।",
    ],
    need: [
      ["Chain lube spray made for motorcycle chains", "মোটরসাইকেলের চেইনের জন্য বানানো চেইন লুব স্প্রে"],
      ["A rag and an old toothbrush; chain cleaner or a little kerosene", "একটি ন্যাকড়া আর পুরনো টুথব্রাশ; চেইন ক্লিনার বা সামান্য কেরোসিন"],
      ["Centre stand or a paddock stand, so the rear wheel can spin", "সেন্টার স্ট্যান্ড বা প্যাডক স্ট্যান্ড, যাতে পেছনের চাকা ঘুরানো যায়"],
    ],
    steps: [
      ["Put the bike on its stand with the engine off and in neutral.", "ইঞ্জিন বন্ধ আর নিউট্রালে রেখে বাইক স্ট্যান্ডে তুলুন।"],
      ["Wipe off the old grease and mud, then scrub the chain with the toothbrush and cleaner. Turn the wheel by hand to reach every link.", "পুরনো গ্রিজ আর কাদা মুছে নিন, তারপর টুথব্রাশ ও ক্লিনার দিয়ে চেইন ঘষুন। চাকা হাতে ঘুরিয়ে সব লিংকে পৌঁছান।"],
      ["Wipe it dry. Lube on a wet chain does not stick.", "শুকনো করে মুছুন। ভেজা চেইনে লুব লাগে না।"],
      ["Spray the lube on the inner side of the lower run of the chain while turning the wheel slowly, one full turn.", "চাকা আস্তে ঘুরিয়ে চেইনের নিচের অংশের ভেতরের দিকে লুব স্প্রে করুন, এক পুরো পাক।"],
      ["Wait 5 to 10 minutes, then wipe off the excess so it does not fling onto the wheel and your clothes.", "৫-১০ মিনিট অপেক্ষা করে বাড়তি লুব মুছে ফেলুন, যাতে চাকা আর কাপড়ে ছিটকে না যায়।"],
      ["Check the slack at the middle of the chain. Most commuter bikes allow about 20 to 30 mm of up-and-down play; your manual gives the exact figure.", "চেইনের মাঝখানে ঢিলা কতটা দেখুন। বেশির ভাগ কমিউটার বাইকে প্রায় ২০-৩০ মিমি ওঠানামা চলে; সঠিক মাপ ম্যানুয়ালে আছে।"],
    ],
    avoid: [
      ["Using engine oil, mustard oil or grease on the chain. They attract dust and make a grinding paste.", "চেইনে ইঞ্জিন অয়েল, সরিষার তেল বা গ্রিজ দেওয়া। এগুলো ধুলা টানে আর ঘষা লাগার পেস্ট বানায়।"],
      ["Getting lube on the tyre or brake disc. It makes them slippery. Keep a rag behind the chain while you spray.", "টায়ার বা ব্রেক ডিস্কে লুব লাগানো। পিছলা হয়ে যায়। স্প্রে করার সময় চেইনের পেছনে ন্যাকড়া ধরুন।"],
      ["Over-tightening the chain. It strains the bearings and the gearbox.", "চেইন বেশি টাইট করা। এতে বিয়ারিং আর গিয়ারবক্সের ওপর চাপ পড়ে।"],
    ],
    mechanic: [
      ["Stiff or kinked links, or a chain that has stretched past the adjustment limit.", "শক্ত বা বাঁকা লিংক, অথবা অ্যাডজাস্টের সীমা ছাড়িয়ে লম্বা হয়ে যাওয়া চেইন।"],
      ["Hooked or shark-fin shaped sprocket teeth. Replace the chain and both sprockets together.", "স্প্রকেটের দাঁত হুকের মতো বা হাঙরের পাখনার মতো হয়ে গেলে। চেইন আর দুই স্প্রকেট একসাথে বদলান।"],
    ],
  },
  {
    slug: "engine-oil",
    updated: "2026-10-25",
    minutes: 5,
    title: ["Checking and changing engine oil", "ইঞ্জিন অয়েল দেখা ও বদলানো"],
    summary: [
      "Engine oil is the cheapest insurance your engine has. Learn to read the level and the colour.",
      "ইঞ্জিনের সবচেয়ে সস্তা ইন্স্যুরেন্স হলো ইঞ্জিন অয়েল। লেভেল আর রং দেখে বুঝতে শিখুন।",
    ],
    need: [
      ["A clean rag and level ground", "একটি পরিষ্কার ন্যাকড়া আর সমতল জায়গা"],
      ["Your owner's manual for the oil grade and change interval", "অয়েলের গ্রেড আর বদলানোর সময়ের জন্য ওনার্স ম্যানুয়াল"],
    ],
    steps: [
      ["Run the engine for a minute or two, switch off, and let the bike stand upright for 2 to 3 minutes so the oil settles.", "এক-দুই মিনিট ইঞ্জিন চালিয়ে বন্ধ করুন, তারপর ২-৩ মিনিট সোজা দাঁড় করিয়ে রাখুন যাতে অয়েল থিতু হয়।"],
      ["Bikes with a dipstick: pull it out, wipe it, put it back in the way your manual says (some are screwed in, some just rest in), pull it out and read the level. It should sit between the two marks.", "ডিপস্টিক থাকলে: টেনে বের করে মুছুন, ম্যানুয়ালে যেভাবে বলা আছে সেভাবে ঢুকান (কোনোটা ঘুরিয়ে লাগে, কোনোটা শুধু বসে), আবার বের করে লেভেল দেখুন। দুই দাগের মাঝখানে থাকা উচিত।"],
      ["Bikes with a sight glass: read the level through the small window on the engine side, with the bike upright.", "সাইট গ্লাস থাকলে: বাইক সোজা রেখে ইঞ্জিনের পাশের ছোট জানালায় লেভেল দেখুন।"],
      ["Look at the oil on the stick. Amber to dark brown is normal. Milky means water or coolant is getting in. Glitter or grit means metal wear.", "স্টিকের অয়েল দেখুন। হালকা সোনালি থেকে গাঢ় বাদামি স্বাভাবিক। দুধের মতো হলে পানি বা কুল্যান্ট ঢুকছে। চকচকে কণা বা কড়কড়ে ময়লা মানে ধাতব ক্ষয়।"],
      ["Top up a little at a time through the filler cap, with the same grade, and re-check. Never go above the upper mark.", "ফিলার ক্যাপ দিয়ে একই গ্রেডের অয়েল অল্প অল্প করে যোগ করে আবার মাপুন। ওপরের দাগ ছাড়াবেন না।"],
      ["Change the oil at the interval in your manual. For many commuter bikes that is around 2,000 to 3,000 km, sooner in heavy traffic or dusty conditions.", "ম্যানুয়ালের নির্দেশমতো অয়েল বদলান। অনেক কমিউটার বাইকে এটা প্রায় ২,০০০-৩,০০০ কিমি, ভারী ট্রাফিক বা ধুলায় আরও আগে।"],
    ],
    avoid: [
      ["Using any oil that is cheap or loose. Buy a sealed bottle of motorcycle oil with the grade your manual lists (for bikes with a wet clutch this is usually JASO MA or MA2), and watch it being poured.", "সস্তা বা খোলা যেকোনো অয়েল ব্যবহার করা। ম্যানুয়ালের গ্রেডের সিল করা মোটরসাইকেল অয়েল কিনুন (ওয়েট ক্লাচ বাইকে সাধারণত JASO MA বা MA2), আর ঢালার সময় নিজে দেখুন।"],
      ["Trusting the label alone. Fake oil in real-looking bottles is common. Buy from a shop that gets its stock from the official importer (Mobil: MJL Bangladesh; Shell: Ranks Petroleum; Motul: Rancon), and use the brand's check where it has one: tilt a Mobil seal and the mark turns from silver to gold, then scan its QR code; scan the QR code on a Motul bottle with the Motul Bangladesh app.", "শুধু লেবেল দেখে বিশ্বাস করা। আসলের মতো দেখতে বোতলে নকল অয়েল প্রায়ই পাওয়া যায়। এমন দোকান থেকে কিনুন যারা অফিসিয়াল আমদানিকারকের কাছ থেকে মাল আনে (Mobil: MJL Bangladesh; Shell: Ranks Petroleum; Motul: Rancon), আর ব্র্যান্ডের নিজের যাচাই থাকলে সেটা করুন: Mobil-এর সিল কাত করলে চিহ্ন রুপালি থেকে সোনালি হয়, তারপর এর QR কোড স্ক্যান করুন; Motul বোতলের QR কোড Motul Bangladesh অ্যাপ দিয়ে স্ক্যান করুন।"],
      ["Overfilling. Too much oil is also bad for the engine.", "বেশি অয়েল ভরা। বেশি হলেও ইঞ্জিনের ক্ষতি।"],
      ["Reading the level on a side stand or a slope. The reading will be wrong.", "সাইড স্ট্যান্ডে বা ঢালে লেভেল দেখা। রিডিং ভুল আসবে।"],
    ],
    mechanic: [
      ["The level keeps dropping between changes: a leak or the engine is burning oil.", "পরপর অয়েল বদলের মাঝে লেভেল কমতেই থাকে: লিক বা ইঞ্জিন অয়েল পোড়াচ্ছে।"],
      ["Milky oil, or a burnt smell. Do not keep riding.", "দুধের মতো অয়েল বা পোড়া গন্ধ। চালাতে থাকবেন না।"],
    ],
  },
  {
    slug: "brakes",
    updated: "2026-10-13",
    minutes: 4,
    title: ["Brake check you can do in two minutes", "দুই মিনিটে ব্রেক চেক"],
    summary: [
      "Brakes are the one part you cannot afford to guess about. Here is what to look, feel and listen for.",
      "ব্রেক এমন জিনিস যেখানে আন্দাজে চলা যায় না। কী দেখবেন, কেমন লাগবে, কী শুনবেন, জেনে নিন।",
    ],
    need: [["A torch for the pads on a dark day", "অন্ধকারে প্যাড দেখার জন্য টর্চ"]],
    steps: [
      ["Squeeze the front lever and press the rear pedal. Both should feel firm, not spongy, and stop short of touching the handlebar.", "সামনের লিভার আর পেছনের পেডাল চাপুন। দুটোই শক্ত লাগা উচিত, নরম নয়, আর লিভার হ্যান্ডেলবারে ঠেকার আগেই থামা উচিত।"],
      ["Disc brakes: look at the pads from the side of the caliper. If there is less than about 2 mm of lining left, or the wear mark has reached the disc, it is time to replace them.", "ডিস্ক ব্রেক: ক্যালিপারের পাশ থেকে প্যাড দেখুন। প্রায় ২ মিমির কম লাইনিং থাকলে বা ওয়্যার মার্ক ডিস্কে পৌঁছালে বদলানোর সময়।"],
      ["Check the brake fluid reservoir (front, and rear if you have one). The level should be between MIN and MAX and the fluid clear to pale yellow.", "ব্রেক ফ্লুইড রিজার্ভার দেখুন (সামনে, আর পেছনে থাকলে সেটাও)। লেভেল MIN আর MAX-এর মাঝে, ফ্লুইড স্বচ্ছ থেকে হালকা হলুদ হওয়া উচিত।"],
      ["Drum brakes: check the free play at the pedal or lever. About 20 to 30 mm at the pedal is common; the adjuster nut at the wheel takes it up. Follow your manual.", "ড্রাম ব্রেক: পেডাল বা লিভারের ফ্রি প্লে দেখুন। পেডালে প্রায় ২০-৩০ মিমি সাধারণ; চাকার কাছের অ্যাডজাস্টার নাট ঘুরিয়ে ঠিক করা যায়। ম্যানুয়াল দেখুন।"],
      ["Roll the bike a few metres and brake gently. Listen for squealing or grinding and feel for pulsing or pulling to one side.", "বাইক কয়েক মিটার ঠেলে আস্তে ব্রেক করুন। কিচকিচ বা ঘষার শব্দ আর কাঁপুনি বা একদিকে টানা আছে কি না বুঝুন।"],
    ],
    avoid: [
      ["Riding on grinding brakes. Metal on metal ruins the disc, which costs far more than pads.", "ঘষা শব্দ নিয়ে চালানো। ধাতুতে ধাতু লাগলে ডিস্ক নষ্ট হয়, যার খরচ প্যাডের চেয়ে অনেক বেশি।"],
      ["Getting oil, chain lube or grease on discs or pads. Wipe the area before you spray anything.", "ডিস্ক বা প্যাডে অয়েল, চেইন লুব বা গ্রিজ লাগানো। কিছু স্প্রে করার আগে জায়গাটা ঢেকে নিন।"],
      ["Topping up fluid with a random type. Use the grade printed on the reservoir cap (usually DOT 3 or DOT 4).", "যেকোনো ফ্লুইড ঢেলে দেওয়া। রিজার্ভারের ক্যাপে ছাপা গ্রেড (সাধারণত DOT 3 বা DOT 4) ব্যবহার করুন।"],
    ],
    mechanic: [
      ["A spongy lever: air in the system. Bleeding the brakes is a mechanic's job.", "লিভার নরম লাগে: সিস্টেমে বাতাস ঢুকেছে। ব্রেক ব্লিড মেকানিকের কাজ।"],
      ["Fluid that is dark or more than about 2 years old; most makers suggest changing it around then.", "ফ্লুইড কালচে হলে বা প্রায় দুই বছরের পুরনো হলে; বেশির ভাগ নির্মাতা এ সময়েই বদলাতে বলেন।"],
    ],
  },
  {
    slug: "battery-and-starting",
    updated: "2026-10-13",
    minutes: 4,
    title: ["Battery care and hard starting", "ব্যাটারির যত্ন ও স্টার্ট না নেওয়া"],
    summary: [
      "Most 'dead bike' mornings are a weak battery or a loose terminal, not the engine. Check these first.",
      "সকালে 'বাইক স্টার্ট হচ্ছে না' এর বেশির ভাগই দুর্বল ব্যাটারি বা ঢিলা টার্মিনাল, ইঞ্জিন নয়। আগে এগুলো দেখুন।",
    ],
    steps: [
      ["Know the signs of a weak battery: a slow, tired crank, a dim headlight at idle, or only a click when you press the starter.", "দুর্বল ব্যাটারির লক্ষণ জানুন: স্টার্টারে ধীর, ক্লান্ত ঘোরা, আইডলে হেডলাইট ম্লান, বা স্টার্টার চাপলে শুধু খট শব্দ।"],
      ["Switch off, then look at the terminals. White or green crust means corrosion. Loose clamps cause starting trouble and charging faults.", "ইঞ্জিন বন্ধ করে টার্মিনাল দেখুন। সাদা বা সবুজ গুঁড়া মানে মরচে। ঢিলা ক্ল্যাম্পে স্টার্টিং আর চার্জিংয়ের সমস্যা হয়।"],
      ["Clean corrosion off with a dry brush or a cloth, tighten the clamps by hand or with a spanner, and refit. Disconnect the negative terminal first and reconnect it last.", "শুকনো ব্রাশ বা কাপড়ে মরচে পরিষ্কার করুন, ক্ল্যাম্প শক্ত করে লাগান। আগে নেগেটিভ টার্মিনাল খুলুন আর সবশেষে লাগান।"],
      ["If your bike has a kick starter, use it. A kick start works even with a flat battery.", "কিক স্টার্টার থাকলে ব্যবহার করুন। ব্যাটারি ফ্ল্যাট হলেও কিক স্টার্ট কাজ করে।"],
      ["Starter in short bursts of a few seconds, with a pause between. Cranking continuously drains the battery and can overheat the starter motor.", "স্টার্টার কয়েক সেকেন্ড করে চাপুন, মাঝে বিরতি দিন। একটানা চাপলে ব্যাটারি শেষ হয় আর স্টার্টার মোটর গরম হতে পারে।"],
      ["If the bike sits unused for weeks, start it and let it run for about ten minutes once a week, or take the battery off and charge it every month or two.", "কয়েক সপ্তাহ বাইক পড়ে থাকলে সপ্তাহে একবার প্রায় দশ মিনিট চালু রাখুন, অথবা ব্যাটারি খুলে মাসে-দুই মাসে একবার চার্জ দিন।"],
    ],
    avoid: [
      ["Adding water to a sealed, maintenance-free battery. Only old-style batteries take distilled water, and only up to the marked level.", "সিল করা মেইনটেন্যান্স-ফ্রি ব্যাটারিতে পানি দেওয়া। শুধু পুরনো ধরনের ব্যাটারিতে ডিস্টিলড ওয়াটার চলে, তাও দাগ পর্যন্ত।"],
      ["Wiring extra horns, LED bars or chargers straight to the battery. Poor wiring drains the battery and can start a fire. Use a fused connection.", "বাড়তি হর্ন, এলইডি বার বা চার্জার সরাসরি ব্যাটারিতে জোড়া। খারাপ ওয়্যারিংয়ে ব্যাটারি শেষ হয় ও আগুন ধরতে পারে। ফিউজসহ সংযোগ দিন।"],
    ],
    mechanic: [
      ["A battery that is two to four years old and weak after charging. It is time to replace it.", "ব্যাটারি দুই থেকে চার বছরের পুরনো আর চার্জ দেওয়ার পরও দুর্বল। বদলানোর সময় হয়েছে।"],
      ["A battery that goes flat again within days: the charging system (regulator or stator) may be faulty.", "কয়েক দিনেই আবার ফ্ল্যাট হয়: চার্জিং সিস্টেম (রেগুলেটর বা স্টেটর) নষ্ট হতে পারে।"],
    ],
  },
  {
    slug: "monsoon-riding-and-care",
    updated: "2026-10-13",
    minutes: 5,
    title: ["Monsoon riding and bike care", "বর্ষায় চালানো ও বাইকের যত্ন"],
    summary: [
      "Rain and waterlogged roads are the toughest months for a bike in Bangladesh. Prepare before, and look after it after.",
      "বাংলাদেশে বর্ষা আর জলাবদ্ধ রাস্তা বাইকের জন্য সবচেয়ে কঠিন সময়। আগে প্রস্তুতি নিন, পরে যত্ন নিন।",
    ],
    steps: [
      ["Before the rains: check tyre tread (the grooves clear water; worn tyres aquaplane), brake pads, lights and the battery terminals.", "বর্ষার আগে: টায়ারের ট্রেড দেখুন (খাঁজ পানি সরায়; ক্ষয়ে যাওয়া টায়ার পিছলে যায়), ব্রেক প্যাড, লাইট আর ব্যাটারি টার্মিনাল।"],
      ["Ride slower and brake earlier and more gently. Wet brakes take a moment to bite: tap them lightly now and then to clear the water.", "ধীরে চালান, আগে আর আস্তে ব্রেক করুন। ভেজা ব্রেক ধরতে একটু সময় নেয়: মাঝে মাঝে হালকা চেপে পানি সরান।"],
      ["Stay off painted road markings, manhole covers, metal plates and the first rain after a dry spell. They are very slippery.", "রাস্তার রং করা দাগ, ম্যানহোলের ঢাকনা, ধাতব পাত আর অনেকদিন পর প্রথম বৃষ্টিতে এগুলো এড়িয়ে চলুন। খুব পিচ্ছিল।"],
      ["Do not ride through deep water. If it is above the exhaust pipe or the hub, turn back or push the bike through with the engine off.", "গভীর পানিতে চালাবেন না। পানি এক্সজস্ট পাইপ বা চাকার হাবের ওপরে উঠলে ঘুরে যান, বা ইঞ্জিন বন্ধ রেখে ঠেলে পার করুন।"],
      ["If the engine stalls in water, do not keep cranking it. Water in the engine can cause serious damage. Push the bike somewhere dry and have a mechanic check the air filter and oil.", "পানিতে ইঞ্জিন বন্ধ হলে বারবার স্টার্ট দেবেন না। ইঞ্জিনে পানি ঢুকলে মারাত্মক ক্ষতি হয়। শুকনো জায়গায় ঠেলে নিয়ে মেকানিককে দিয়ে এয়ার ফিল্টার আর অয়েল দেখান।"],
      ["After a wet or muddy ride: rinse the mud off, dry the bike, and re-lube the chain. Check that the oil is not milky.", "ভেজা বা কাদার রাইডের পর: কাদা ধুয়ে বাইক শুকান আর চেইন আবার লুব করুন। অয়েল দুধের মতো হয়েছে কি না দেখুন।"],
    ],
    avoid: [
      ["Spraying a pressure washer at bearings, the exhaust outlet, the electrics and the air intake.", "বিয়ারিং, এক্সজস্টের মুখ, ইলেকট্রিক্স আর এয়ার ইনটেকে প্রেসার ওয়াশার মারা।"],
      ["Parking in standing water, or uncovered for days in the rain. Rust and electrical faults follow.", "জমা পানিতে পার্ক করা, বা দিনের পর দিন বৃষ্টিতে ঢাকা ছাড়া রাখা। এতে মরচে আর ইলেকট্রিক্যাল সমস্যা হয়।"],
    ],
    mechanic: [
      ["The engine drowned in floodwater: get it checked before you start it again.", "বন্যার পানিতে ইঞ্জিন ডুবে গেলে: আবার স্টার্ট দেওয়ার আগে পরীক্ষা করান।"],
      ["Brakes that stay weak after drying, or electrical faults that keep coming back after rain.", "শুকানোর পরও ব্রেক দুর্বল, বা বৃষ্টির পর বারবার ইলেকট্রিক্যাল সমস্যা।"],
    ],
  },
  {
    slug: "air-filter",
    updated: "2026-10-13",
    minutes: 3,
    title: ["Air filter: the cheap fix for weak pickup", "এয়ার ফিল্টার: পিকআপ কমলে সস্তা সমাধান"],
    summary: [
      "Bangladesh roads are dusty. A clogged filter makes the bike feel lazy and burn more fuel.",
      "আমাদের রাস্তায় ধুলা বেশি। জমে থাকা ফিল্টারে বাইক ঝিমিয়ে যায় আর তেল বেশি খায়।",
    ],
    need: [["A screwdriver, usually Phillips; your toolkit under the seat has one", "একটি স্ক্রু ড্রাইভার, সাধারণত ফিলিপস; সিটের নিচের টুলকিটেই থাকে"]],
    steps: [
      ["Find the air filter box. Usually it is under the seat or behind a side panel; your manual shows the location.", "এয়ার ফিল্টার বক্স খুঁজুন। সাধারণত সিটের নিচে বা সাইড প্যানেলের পেছনে; ম্যানুয়ালে জায়গা দেখানো আছে।"],
      ["Open the cover (a few screws or clips) and slide out the filter element.", "ঢাকনা খুলুন (কয়েকটি স্ক্রু বা ক্লিপ) আর ফিল্টারটা টেনে বের করুন।"],
      ["Hold it to the light. If you cannot see light through the paper, or it is black with dust, it is clogged.", "আলোর দিকে ধরুন। কাগজের ভেতর দিয়ে আলো না দেখা গেলে, বা ধুলায় কালো হলে, ওটা জমে গেছে।"],
      ["Paper filter: tap it gently, and blow air from the inside outwards with a low-pressure pump. Replace it at the interval in your manual or sooner if it stays dirty. Foam filter: wash in soapy water, squeeze dry, and add a little filter oil.", "কাগজের ফিল্টার: আলতো ঝাড়ুন আর ভেতর থেকে বাইরের দিকে কম প্রেসারে বাতাস দিন। ম্যানুয়ালের সময়ে বা বেশি নোংরা থাকলে আগেই বদলান। ফোমের ফিল্টার: সাবান পানিতে ধুয়ে চিপে শুকান, তারপর সামান্য ফিল্টার অয়েল দিন।"],
      ["Refit the element and the cover firmly. A loose cover lets dust into the engine.", "ফিল্টার আর ঢাকনা শক্ত করে লাগান। ঢিলা ঢাকনা দিয়ে ইঞ্জিনে ধুলা ঢোকে।"],
    ],
    avoid: [
      ["Washing a paper filter with water or oil. It ruins it.", "কাগজের ফিল্টার পানি বা তেল দিয়ে ধোয়া। এতে নষ্ট হয়ে যায়।"],
      ["Running without a filter to get 'more power'. Dust wears out the engine quickly.", "'বেশি পাওয়ারের' আশায় ফিল্টার ছাড়া চালানো। ধুলায় ইঞ্জিন দ্রুত ক্ষয় হয়।"],
    ],
    mechanic: [
      ["Black smoke, a rough idle or poor mileage even with a clean filter: the fuel system may need cleaning or tuning.", "ফিল্টার পরিষ্কার থাকার পরও কালো ধোঁয়া, অমসৃণ আইডল বা কম মাইলেজ: ফুয়েল সিস্টেম পরিষ্কার বা টিউন করাতে হতে পারে।"],
    ],
  },
  {
    slug: "toolkit-and-monthly-checklist",
    updated: "2026-10-13",
    minutes: 4,
    title: ["Your toolkit and a 10-minute monthly checklist", "টুলকিট আর মাসিক ১০ মিনিটের চেকলিস্ট"],
    summary: [
      "What to carry for small roadside problems, and a simple monthly routine that ties the other guides together.",
      "রাস্তায় ছোটখাটো সমস্যার জন্য কী সাথে রাখবেন, আর অন্য গাইডগুলো মিলিয়ে সহজ মাসিক রুটিন।",
    ],
    need: [
      ["The factory toolkit under the seat, plus a tyre pressure gauge", "সিটের নিচের কারখানার টুলকিট, সাথে একটি টায়ার প্রেসার গেজ"],
      ["Spare bulb and fuses for your bike, electrical tape, a few cable ties and a rag", "আপনার বাইকের বাড়তি বাল্ব ও ফিউজ, ইলেকট্রিক্যাল টেপ, কয়েকটি ক্যাবল টাই আর একটি ন্যাকড়া"],
      ["A small torch and a phone power bank", "একটি ছোট টর্চ আর ফোনের পাওয়ার ব্যাংক"],
      ["Registration papers and licence. They are required, and the fines are heavy without them.", "রেজিস্ট্রেশনের কাগজ আর লাইসেন্স। এগুলো বাধ্যতামূলক, না থাকলে জরিমানা বেশি।"],
    ],
    steps: [
      ["Tyres: pressure and a look for nails and cracks.", "টায়ার: প্রেসার আর পেরেক-ফাটল দেখা।"],
      ["Chain: clean it if dirty, lube it, and check the slack.", "চেইন: নোংরা হলে পরিষ্কার, লুব, আর ঢিলা মাপা।"],
      ["Engine oil: level and colour; note the km for the next change.", "ইঞ্জিন অয়েল: লেভেল আর রং; পরের বদলের কিমি লিখে রাখুন।"],
      ["Brakes: lever feel, pad thickness, fluid level.", "ব্রেক: লিভারের অনুভূতি, প্যাডের পুরুত্ব, ফ্লুইড লেভেল।"],
      ["Lights, indicators, horn and mirrors.", "লাইট, ইন্ডিকেটর, হর্ন আর মিরর।"],
      ["Battery terminals, and a loose-bolt check: tap or look over the mirrors, footrests, number plate and exhaust bracket.", "ব্যাটারি টার্মিনাল, আর ঢিলা বল্টু দেখা: মিরর, ফুটরেস্ট, নম্বর প্লেট ও এক্সজস্ট ব্র্যাকেট ছুঁয়ে বা দেখে নিন।"],
      ["Keep the service book stamped and keep the receipts. They help warranty claims and the resale price.", "সার্ভিস বইয়ে সিল রাখুন আর রসিদ জমান। ওয়ারেন্টি দাবি আর বিক্রির দামে কাজে লাগে।"],
    ],
    avoid: [
      ["Skipping scheduled services because the bike 'feels fine'. Wear is invisible until it is expensive.", "বাইক 'ঠিক চলছে' বলে নির্ধারিত সার্ভিস বাদ দেওয়া। ক্ষয় চোখে পড়ে না, যতক্ষণ না খরচ বেড়ে যায়।"],
      ["Carrying tools you do not know how to use. Start with the simple jobs in these guides.", "যে যন্ত্র চালাতে জানেন না তা বয়ে বেড়ানো। এই গাইডগুলোর সহজ কাজ দিয়ে শুরু করুন।"],
    ],
    mechanic: [
      ["Anything unusual: a new noise, vibration, smell or warning light. Do not wait for the next service.", "অস্বাভাবিক কিছু: নতুন শব্দ, কাঁপুনি, গন্ধ বা ওয়ার্নিং লাইট। পরের সার্ভিসের জন্য অপেক্ষা করবেন না।"],
    ],
  },
  // Series 2: seasonal and "before it breaks".
  {
    slug: "spark-plug",
    updated: "2026-10-14",
    minutes: 4,
    title: ["Checking your spark plug", "স্পার্ক প্লাগ দেখা"],
    summary: [
      "A worn or dirty plug makes starting hard and pickup weak. The plug also tells you how the engine is running.",
      "পুরনো বা ময়লা প্লাগে স্টার্ট নিতে কষ্ট হয়, পিকআপ কমে যায়। প্লাগ দেখে ইঞ্জিনের অবস্থাও কিছুটা বোঝা যায়।",
    ],
    need: [
      ["The plug spanner from the factory toolkit", "কারখানার টুলকিটের প্লাগ স্প্যানার"],
      ["A clean rag and a small wire brush", "একটি পরিষ্কার ন্যাকড়া আর ছোট তারের ব্রাশ"],
      ["Your owner's manual for the correct plug type and gap", "সঠিক প্লাগের ধরন আর গ্যাপের জন্য ওনার্স ম্যানুয়াল"],
    ],
    steps: [
      ["Work on a cold engine. A hot cylinder head can burn you and damage the threads.", "ইঞ্জিন ঠান্ডা থাকতে কাজ করুন। গরম সিলিন্ডার হেডে হাত পুড়তে পারে, প্যাঁচও নষ্ট হতে পারে।"],
      ["Pull the plug cap off by its cap, not by the wire. Brush or blow away dirt around the plug so nothing falls into the engine.", "প্লাগ ক্যাপ তার ধরে নয়, ক্যাপ ধরে টেনে খুলুন। প্লাগের চারপাশের ময়লা ব্রাশ করে বা ফুঁ দিয়ে সরান, যাতে ইঞ্জিনের ভেতরে কিছু না পড়ে।"],
      ["Unscrew the plug with the spanner and look at the tip.", "স্প্যানার দিয়ে প্লাগ খুলে মাথাটা দেখুন।"],
      ["Light brown or grey: healthy. Dry black soot: a choked air filter or a fuel mixture problem. Wet with oil: see a mechanic.", "হালকা বাদামি বা ধূসর: ঠিক আছে। শুকনো কালো কালি: এয়ার ফিল্টার বন্ধ বা ফুয়েল মিক্সচারে সমস্যা। তেলে ভেজা: মেকানিক দেখান।"],
      ["Clean light deposits with the wire brush. Check the gap against the manual, or ask a mechanic to set it.", "হালকা ময়লা তারের ব্রাশে পরিষ্কার করুন। গ্যাপ ম্যানুয়ালের সাথে মিলিয়ে নিন, না পারলে মেকানিককে দিয়ে ঠিক করান।"],
      ["Screw the plug back in by hand first, then snug it with the spanner. Push the cap on until it clicks.", "প্লাগ আগে হাতে প্যাঁচ দিয়ে বসান, তারপর স্প্যানারে হালকা টাইট দিন। ক্যাপ চাপ দিয়ে 'ক্লিক' না হওয়া পর্যন্ত লাগান।"],
    ],
    avoid: [
      ["Starting the thread with the spanner. A cross-threaded plug can ruin the cylinder head.", "শুরুতেই স্প্যানার দিয়ে প্যাঁচানো। প্যাঁচ বাঁকা হলে সিলিন্ডার হেড নষ্ট হতে পারে।"],
      ["Over-tightening. Snug is enough.", "বেশি টাইট দেওয়া। হালকা টাইটই যথেষ্ট।"],
      ["Fitting any plug that fits the hole. The heat range and type must match the manual.", "ফুটোতে লেগে গেলেই যেকোনো প্লাগ লাগানো। ধরন আর হিট রেঞ্জ ম্যানুয়ালের সাথে মিলতে হবে।"],
    ],
    mechanic: [
      ["An oily or white, blistered plug tip.", "প্লাগের মাথা তেলতেলে, অথবা সাদা হয়ে ফুলে গেছে।"],
      ["A cracked white insulator, or a plug that will not come out easily.", "সাদা অংশে ফাটল, অথবা প্লাগ সহজে খুলছে না।"],
    ],
  },
  {
    slug: "coolant-and-radiator",
    updated: "2026-10-14",
    minutes: 4,
    title: ["Coolant and radiator care (liquid-cooled bikes)", "কুল্যান্ট আর রেডিয়েটরের যত্ন (লিকুইড-কুলড বাইক)"],
    summary: [
      "If your bike has a radiator, low coolant can cook the engine in Dhaka traffic. The check takes one minute.",
      "আপনার বাইকে রেডিয়েটর থাকলে, কুল্যান্ট কম হলে ঢাকার জ্যামে ইঞ্জিন অতিরিক্ত গরম হয়ে যেতে পারে। চেক করতে এক মিনিট লাগে।",
    ],
    need: [
      ["The coolant type named in your owner's manual", "ওনার্স ম্যানুয়ালে লেখা ধরনের কুল্যান্ট"],
      ["A torch and a clean rag", "একটি টর্চ আর পরিষ্কার ন্যাকড়া"],
    ],
    steps: [
      ["Check with the engine cold and the bike upright on level ground.", "ইঞ্জিন ঠান্ডা অবস্থায়, সমতল জায়গায় বাইক সোজা রেখে দেখুন।"],
      ["Find the small plastic reservoir tank. The manual shows where it is.", "ছোট প্লাস্টিকের রিজার্ভার ট্যাংকটি খুঁজুন। কোথায় আছে ম্যানুয়ালে দেখানো থাকে।"],
      ["The level should sit between the low and full marks. Use the torch if the plastic is cloudy.", "লেভেল লো আর ফুল দাগের মাঝে থাকা উচিত। প্লাস্টিক ঘোলা হলে টর্চ মারুন।"],
      ["If it is low, top up the reservoir with the right coolant up to the full mark.", "কম থাকলে সঠিক কুল্যান্ট দিয়ে রিজার্ভার ফুল দাগ পর্যন্ত ভরুন।"],
      ["Look at the radiator fins. Rinse off mud and dead insects with a gentle stream of water from behind.", "রেডিয়েটরের পাতগুলো দেখুন। কাদা আর পোকামাকড় পেছন দিক থেকে হালকা পানির ধারায় ধুয়ে ফেলুন।"],
      ["Watch the temperature gauge or warning light on your next ride in traffic.", "পরের বার জ্যামে চালানোর সময় টেম্পারেচার গেজ বা ওয়ার্নিং লাইট খেয়াল করুন।"],
    ],
    avoid: [
      ["Opening the radiator cap on a hot engine. Boiling coolant can spray out and burn you.", "গরম ইঞ্জিনে রেডিয়েটরের ক্যাপ খোলা। ফুটন্ত কুল্যান্ট ছিটকে এসে পুড়িয়ে দিতে পারে।"],
      ["Topping up with tap water as a habit. Use it only in an emergency, then get the system refilled properly.", "অভ্যাস হিসেবে কলের পানি দেওয়া। শুধু জরুরি অবস্থায় দিন, পরে ঠিকমতো কুল্যান্ট ভরিয়ে নিন।"],
      ["Spraying a pressure washer at the radiator. It bends the fins.", "রেডিয়েটরে প্রেসার ওয়াশার মারা। এতে পাতগুলো বেঁকে যায়।"],
    ],
    mechanic: [
      ["The level drops again within days, or you see drips or a sweet smell under the bike.", "কয়েক দিনেই লেভেল আবার কমে যায়, অথবা বাইকের নিচে ফোঁটা বা মিষ্টি গন্ধ পান।"],
      ["The temperature light comes on or the fan never seems to run. Stop and let the engine cool first.", "টেম্পারেচার লাইট জ্বলে, বা ফ্যান কখনো চলে না মনে হয়। আগে থেমে ইঞ্জিন ঠান্ডা হতে দিন।"],
    ],
  },
  {
    slug: "clutch-and-throttle-cables",
    updated: "2026-10-14",
    minutes: 4,
    title: ["Clutch and throttle cables: free play and lube", "ক্লাচ আর থ্রটলের তার: ফ্রি প্লে ও লুব"],
    summary: [
      "A stiff or badly adjusted cable makes gear changes rough and can be dangerous. Learn to feel when it is right.",
      "শক্ত বা ভুলভাবে অ্যাডজাস্ট করা তারে গিয়ার বদলাতে ঝামেলা হয়, বিপদও হতে পারে। কখন ঠিক আছে, হাতে বুঝতে শিখুন।",
    ],
    need: [
      ["Cable lube spray, or a few drops of light oil", "ক্যাবল লুব স্প্রে, অথবা কয়েক ফোঁটা পাতলা তেল"],
      ["Your owner's manual for the free play figure", "ফ্রি প্লের মাপের জন্য ওনার্স ম্যানুয়াল"],
    ],
    steps: [
      ["Clutch: pull the lever gently until you feel the cable start to pull. That loose travel at the tip is the free play.", "ক্লাচ: লিভার আস্তে টানুন, যতক্ষণ না তার টান খেতে শুরু করে। লিভারের মাথায় ওই ঢিলা অংশটাই ফ্রি প্লে।"],
      ["Compare it with the manual. To adjust, loosen the lock ring at the lever, turn the barrel adjuster, and lock it again.", "ম্যানুয়ালের সাথে মিলিয়ে নিন। অ্যাডজাস্ট করতে লিভারের লক রিং ঢিলা করে ব্যারেল অ্যাডজাস্টার ঘুরিয়ে আবার লক করুন।"],
      ["Throttle: with the engine off, twist and let go. The grip must snap back to closed by itself.", "থ্রটল: ইঞ্জিন বন্ধ রেখে গ্রিপ ঘুরিয়ে ছেড়ে দিন। গ্রিপ নিজে নিজে ঝট করে বন্ধ অবস্থায় ফিরতে হবে।"],
      ["Repeat with the handlebar turned fully left and fully right. It must snap back in every position.", "হ্যান্ডেল পুরো বাঁয়ে আর পুরো ডানে ঘুরিয়ে আবার করুন। সব অবস্থায় ফিরে আসতে হবে।"],
      ["Lube both cables where they enter the lever and grip housing, then work the lever and grip a few times.", "লিভার আর গ্রিপের ঘরে যেখানে তার ঢোকে, সেখানে লুব দিন। তারপর কয়েকবার লিভার আর গ্রিপ নাড়ুন।"],
    ],
    avoid: [
      ["Adjusting the clutch to zero free play. The clutch can slip and wear out.", "ক্লাচের ফ্রি প্লে একেবারে শূন্য করা। এতে ক্লাচ স্লিপ করে আর তাড়াতাড়ি ক্ষয় হয়।"],
      ["Riding with a throttle that sticks open, even slightly.", "থ্রটল একটুও আটকে থাকলে সেটা নিয়ে চালানো।"],
      ["Using grease on cables. It thickens and makes them stiffer.", "তারে গ্রিজ দেওয়া। এটা জমে গিয়ে তার আরও শক্ত করে।"],
    ],
    mechanic: [
      ["Frayed strands at the cable end, or a cable that stays stiff after lube.", "তারের মাথায় সুতা বেরিয়ে গেছে, অথবা লুব দেওয়ার পরও তার শক্ত থাকে।"],
      ["A throttle that does not snap back. Do not ride until it is fixed.", "থ্রটল নিজে ফিরে আসে না। ঠিক না করা পর্যন্ত চালাবেন না।"],
    ],
  },
  {
    slug: "headlight-bulb-and-fuse",
    updated: "2026-10-14",
    minutes: 4,
    title: ["Changing a headlight bulb or a blown fuse", "হেডলাইটের বাল্ব বা ফিউজ বদলানো"],
    summary: [
      "A dead headlight or a blown fuse can leave you stuck at night. Both are usually a ten-minute roadside job.",
      "হেডলাইট বা ফিউজ নষ্ট হলে রাতে আটকে যেতে পারেন। দুটোই সাধারণত রাস্তার পাশে দশ মিনিটের কাজ।",
    ],
    need: [
      ["A spare bulb and spare fuses of the same rating as your bike's", "আপনার বাইকের মতো একই রেটিংয়ের বাড়তি বাল্ব আর ফিউজ"],
      ["The screwdriver from the toolkit, a clean cloth or gloves", "টুলকিটের স্ক্রুড্রাইভার, পরিষ্কার কাপড় বা গ্লাভস"],
    ],
    steps: [
      ["Turn the ignition off and take the key out before you touch any wiring.", "কোনো তারে হাত দেওয়ার আগে ইগনিশন বন্ধ করে চাবি খুলে নিন।"],
      ["Find the fuse box. The manual shows where it is and which fuse runs which circuit.", "ফিউজ বক্স খুঁজুন। কোথায় আছে আর কোন ফিউজ কোন লাইনের, ম্যানুয়ালে দেখানো থাকে।"],
      ["Pull out the suspect fuse. A blown fuse has a broken strip inside. Replace it with one of exactly the same rating, printed on top.", "সন্দেহের ফিউজটা টেনে বের করুন। নষ্ট ফিউজের ভেতরের পাতটা ছেঁড়া থাকে। ওপরে লেখা ঠিক একই রেটিংয়ের ফিউজ লাগান।"],
      ["If the fuse is fine, check the bulb. Open the headlight housing as the manual shows and unplug the connector.", "ফিউজ ঠিক থাকলে বাল্ব দেখুন। ম্যানুয়াল অনুযায়ী হেডলাইটের খোল খুলে কানেক্টর খুলে নিন।"],
      ["Fit the new bulb of the same type and wattage. Hold it by the base, not the glass.", "একই ধরন আর ওয়াটের নতুন বাল্ব লাগান। কাচে নয়, গোড়ায় ধরে লাগান।"],
      ["Test low beam, high beam and indicators before you close everything up.", "সব বন্ধ করার আগে লো বিম, হাই বিম আর ইন্ডিকেটর পরীক্ষা করে নিন।"],
    ],
    avoid: [
      ["Bridging a fuse with wire or foil. It can start a fire.", "তার বা ফয়েল দিয়ে ফিউজ জোড়া দেওয়া। এতে আগুন লাগতে পারে।"],
      ["Fitting a brighter, higher-wattage bulb. It can overload the wiring and dazzle other road users.", "বেশি ওয়াটের, বেশি উজ্জ্বল বাল্ব লাগানো। এতে তারে চাপ পড়ে আর অন্যদের চোখ ধাঁধিয়ে যায়।"],
      ["Touching a halogen bulb's glass with bare fingers. Skin oil shortens its life.", "খালি আঙুলে হ্যালোজেন বাল্বের কাচ ছোঁয়া। হাতের তেলে বাল্বের আয়ু কমে।"],
    ],
    mechanic: [
      ["A new fuse blows again straight away. There is a short circuit to find.", "নতুন ফিউজও সাথে সাথে পুড়ে যায়। কোথাও শর্ট সার্কিট আছে, খুঁজে বের করতে হবে।"],
      ["LED headlights. On many bikes the whole unit is replaced, not a bulb.", "এলইডি হেডলাইট। অনেক বাইকে বাল্ব নয়, পুরো ইউনিট বদলাতে হয়।"],
    ],
  },
  {
    slug: "washing-your-bike",
    updated: "2026-10-14",
    minutes: 4,
    title: ["Washing your bike without damaging it", "বাইক ধোয়ার সময় ক্ষতি এড়ানো"],
    summary: [
      "A careless wash pushes water into bearings and switches. A careful one keeps rust away and shows you problems early.",
      "অসাবধানে ধুলে বিয়ারিং আর সুইচে পানি ঢোকে। সাবধানে ধুলে মরচে দূরে থাকে, আর সমস্যা আগেভাগে চোখে পড়ে।",
    ],
    need: [
      ["Two buckets of water, a soft sponge and a microfibre cloth", "দুই বালতি পানি, নরম স্পঞ্জ আর একটি মাইক্রোফাইবার কাপড়"],
      ["Bike or car shampoo", "বাইক বা গাড়ির শ্যাম্পু"],
      ["A plastic bag and a rubber band for the exhaust end", "এক্সজস্টের মুখের জন্য একটি প্লাস্টিক ব্যাগ আর রাবার ব্যান্ড"],
    ],
    steps: [
      ["Let the engine and exhaust cool down first. Cold water on hot metal can warp parts.", "আগে ইঞ্জিন আর এক্সজস্ট ঠান্ডা হতে দিন। গরম ধাতুতে ঠান্ডা পানি পড়লে অংশ বেঁকে যেতে পারে।"],
      ["Cover the exhaust opening with the bag. Keep water away from the ignition switch and the instrument cluster.", "এক্সজস্টের মুখ ব্যাগ দিয়ে ঢেকে দিন। ইগনিশন সুইচ আর মিটারে পানি দেবেন না।"],
      ["Rinse off loose dust and mud with a gentle flow of water.", "হালকা পানির ধারায় আলগা ধুলা-কাদা ধুয়ে ফেলুন।"],
      ["Wash from the top down with the sponge and shampoo. Rinse the sponge often so grit does not scratch the paint.", "স্পঞ্জ আর শ্যাম্পু দিয়ে ওপর থেকে নিচে ধুন। স্পঞ্জ বারবার ধুয়ে নিন, যাতে বালু রঙে দাগ না ফেলে।"],
      ["Rinse, then dry with the cloth. Remove the exhaust bag.", "পানি দিয়ে ধুয়ে কাপড়ে মুছে শুকান। এক্সজস্টের ব্যাগ খুলে ফেলুন।"],
      ["Ride slowly for a short distance and brake gently a few times to dry the brakes. Lube the chain afterwards.", "অল্প দূর আস্তে চালান, কয়েকবার হালকা ব্রেক করুন যাতে ব্রেক শুকায়। পরে চেইনে লুব দিন।"],
    ],
    avoid: [
      ["Pointing a pressure washer at wheel bearings, the chain, switches or the radiator.", "চাকার বিয়ারিং, চেইন, সুইচ বা রেডিয়েটরে প্রেসার ওয়াশার মারা।"],
      ["Using washing powder or dish soap. They strip wax and dry out rubber.", "কাপড় ধোয়ার পাউডার বা থালা-বাসনের সাবান ব্যবহার। এতে রঙের ওয়াক্স উঠে যায়, রাবার শুকিয়ে যায়।"],
      ["Using kerosene or petrol on the paint or plastic.", "রঙ বা প্লাস্টিকে কেরোসিন বা পেট্রোল দেওয়া।"],
    ],
    mechanic: [
      ["The bike misfires or a light stops working after a wash. Water may be in a connector.", "ধোয়ার পর বাইক মিসফায়ার করে বা কোনো লাইট জ্বলে না। কোনো কানেক্টরে পানি ঢুকে থাকতে পারে।"],
      ["You spot oil leaks, cracks or loose parts once the bike is clean.", "পরিষ্কার করার পর তেল চুঁইয়ে পড়া, ফাটল বা ঢিলা অংশ চোখে পড়ে।"],
    ],
  },
  {
    slug: "long-term-storage",
    updated: "2026-10-14",
    minutes: 4,
    title: ["Parking the bike for weeks or months", "কয়েক সপ্তাহ বা মাসের জন্য বাইক রেখে দেওয়া"],
    summary: [
      "Going abroad or not riding for a while? A little preparation stops a flat battery, rust and chewed wiring.",
      "বিদেশ যাচ্ছেন বা কিছুদিন চালাবেন না? একটু প্রস্তুতি নিলে ব্যাটারি বসে যাওয়া, মরচে আর ইঁদুরে তার কাটা ঠেকানো যায়।",
    ],
    need: [
      ["A breathable bike cover", "বাতাস চলাচল করে এমন বাইক কভার"],
      ["Chain lube and a tyre pressure gauge", "চেইন লুব আর টায়ার প্রেসার গেজ"],
    ],
    steps: [
      ["Wash and dry the bike so dirt and moisture do not sit on the paint and metal.", "বাইক ধুয়ে শুকিয়ে নিন, যাতে ময়লা আর ভেজাভাব রঙ ও ধাতুতে জমে না থাকে।"],
      ["Fill the fuel tank. A full tank leaves less room for moisture and rust inside it.", "তেলের ট্যাংক ভরে রাখুন। ভরা ট্যাংকে ভেতরে আর্দ্রতা আর মরচে কম জমে।"],
      ["Lube the chain and set the tyre pressure to the manual figure.", "চেইনে লুব দিন আর টায়ারের প্রেসার ম্যানুয়াল অনুযায়ী ঠিক করুন।"],
      ["Disconnect the battery's negative terminal, or ask someone to charge it from time to time.", "ব্যাটারির নেগেটিভ টার্মিনাল খুলে রাখুন, অথবা কাউকে মাঝে মাঝে চার্জ দিতে বলুন।"],
      ["Park on the centre stand in a dry, covered place and use the breathable cover.", "শুকনো, ছাউনি দেওয়া জায়গায় সেন্টার স্ট্যান্ডে রেখে বাতাস চলাচলের কভার দিন।"],
      ["Before riding again: reconnect the battery, check tyres, brakes, oil and lights, and ride gently at first.", "আবার চালানোর আগে: ব্যাটারি লাগান, টায়ার, ব্রেক, অয়েল আর লাইট দেখুন, শুরুতে আস্তে চালান।"],
    ],
    avoid: [
      ["Wrapping the bike in a plastic sheet. It traps moisture and causes rust.", "প্লাস্টিকের শিট দিয়ে বাইক মোড়ানো। এতে ভেজাভাব আটকে মরচে ধরে।"],
      ["Starting it for a minute every few days just to idle. It builds moisture without charging the battery. Ride it properly or leave it.", "কয়েক দিন পরপর এক মিনিট স্টার্ট দিয়ে রেখে দেওয়া। এতে ভেতরে আর্দ্রতা জমে, ব্যাটারিও চার্জ হয় না। হয় ঠিকমতো চালান, নয়তো রেখে দিন।"],
      ["Leaving the key or papers with the bike.", "চাবি বা কাগজপত্র বাইকের সাথে রেখে যাওয়া।"],
    ],
    mechanic: [
      ["Rats have nested or chewed wires. Rat damage is common in stored bikes; get the wiring checked.", "ইঁদুর বাসা বেঁধেছে বা তার কেটেছে। রেখে দেওয়া বাইকে এটা প্রায়ই হয়; তার পরীক্ষা করিয়ে নিন।"],
      ["The bike will not start after storage, or runs rough. Old fuel or a dead battery is likely.", "রেখে দেওয়ার পর স্টার্ট নেয় না বা ঝাঁকি দিয়ে চলে। পুরনো তেল বা মরা ব্যাটারি হতে পারে।"],
    ],
  },
  {
    slug: "winter-starting",
    updated: "2026-10-14",
    minutes: 3,
    title: ["Starting the bike on cold winter mornings", "শীতের সকালে বাইক স্টার্ট দেওয়া"],
    summary: [
      "Cold mornings make engines slow to start and batteries weak. The right routine saves the battery and the engine.",
      "ঠান্ডা সকালে ইঞ্জিন দেরিতে স্টার্ট নেয়, ব্যাটারিও দুর্বল থাকে। সঠিক নিয়মে চললে ব্যাটারি আর ইঞ্জিন দুটোই বাঁচে।",
    ],
    steps: [
      ["Know your bike. Carburettor bikes usually have a choke; fuel-injected bikes do not. The manual says which you have.", "নিজের বাইক চিনুন। কার্বুরেটর বাইকে সাধারণত চোক থাকে; ফুয়েল ইনজেকশন বাইকে থাকে না। আপনারটা কোন ধরনের, ম্যানুয়ালে লেখা।"],
      ["Carburettor bike: pull the choke on, keep the throttle closed, and press the starter.", "কার্বুরেটর বাইক: চোক টেনে দিন, থ্রটল বন্ধ রাখুন, তারপর স্টার্টার চাপুন।"],
      ["Fuel-injected bike: turn the key on and wait for the dashboard check to finish, then start without twisting the throttle.", "ফুয়েল ইনজেকশন বাইক: চাবি ঘুরিয়ে মিটারের চেক শেষ হওয়া পর্যন্ত অপেক্ষা করুন, তারপর থ্রটল না ঘুরিয়ে স্টার্ট দিন।"],
      ["Press the starter for a few seconds at a time, then pause. If your bike has a kick starter, use it to spare a weak battery.", "স্টার্টার কয়েক সেকেন্ড করে চাপুন, তারপর থামুন। কিক থাকলে দুর্বল ব্যাটারি বাঁচাতে কিক দিন।"],
      ["Let it idle briefly, push the choke back in as it settles, and ride gently until the engine is warm.", "অল্প সময় আইডলে চলতে দিন, ঠিক হয়ে এলে চোক বন্ধ করুন, আর ইঞ্জিন গরম না হওয়া পর্যন্ত আস্তে চালান।"],
    ],
    avoid: [
      ["Holding the starter button down for a long time. It drains the battery and heats the starter motor.", "লম্বা সময় স্টার্টার বাটন চেপে রাখা। এতে ব্যাটারি শেষ হয় আর স্টার্টার মোটর গরম হয়।"],
      ["Revving a cold engine hard. The oil has not reached every part yet.", "ঠান্ডা ইঞ্জিনে জোরে রেভ দেওয়া। তেল তখনো সব জায়গায় পৌঁছায়নি।"],
      ["Riding off with the choke still on. It wastes fuel and fouls the spark plug.", "চোক চালু রেখেই চলে যাওয়া। এতে তেল নষ্ট হয়, প্লাগে কালি জমে।"],
    ],
    mechanic: [
      ["The bike still struggles to start on most mornings. Get the battery, plug and fuel system checked.", "বেশির ভাগ সকালেই স্টার্ট নিতে কষ্ট হয়। ব্যাটারি, প্লাগ আর ফুয়েল সিস্টেম পরীক্ষা করান।"],
      ["A starter that only clicks, or a battery warning light.", "স্টার্টারে শুধু 'খট' শব্দ হয়, অথবা ব্যাটারির ওয়ার্নিং লাইট জ্বলে।"],
    ],
  },
  // Series 3: buying and owning smart.
  {
    slug: "free-services-explained",
    updated: "2026-10-14",
    minutes: 4,
    title: ["Your free services explained: 1st, 2nd and 3rd", "ফ্রি সার্ভিস বুঝে নিন: ১ম, ২য় আর ৩য়"],
    summary: [
      "Most new bikes come with a few free services. Knowing what each one covers stops you from missing one or paying for what should be free.",
      "বেশির ভাগ নতুন বাইকের সাথে কয়েকটি ফ্রি সার্ভিস থাকে। কোনটায় কী হয় জানলে কোনোটা বাদ পড়ে না, আর ফ্রি জিনিসের জন্য টাকাও দিতে হয় না।",
    ],
    need: [
      ["Your service book or warranty card", "আপনার সার্ভিস বই বা ওয়ারেন্টি কার্ড"],
    ],
    steps: [
      ["Read the service book. It lists when each free service is due, by distance or by date. Usually whichever comes first counts.", "সার্ভিস বই পড়ুন। কোন ফ্রি সার্ভিস কখন, দূরত্ব বা তারিখ ধরে লেখা থাকে। সাধারণত যেটা আগে আসে সেটাই ধরা হয়।"],
      ["First service: the most important one. It usually includes an oil change to flush out running-in metal dust, plus a check of bolts, chain, brakes and cables.", "প্রথম সার্ভিস: সবচেয়ে জরুরি। সাধারণত অয়েল চেঞ্জ হয়, যাতে ব্রেক-ইনের ধাতব গুঁড়া বেরিয়ে যায়। সাথে বল্টু, চেইন, ব্রেক আর তার দেখা হয়।"],
      ["Second and third services: usually a general check and adjustment, often with an air filter clean, spark plug check and another oil change.", "দ্বিতীয় আর তৃতীয় সার্ভিস: সাধারণত পুরো বাইক দেখে অ্যাডজাস্ট করা হয়, অনেক সময় এয়ার ফিল্টার পরিষ্কার, প্লাগ চেক আর আবার অয়েল চেঞ্জ।"],
      ["Ask before the work starts what is free and what you pay for. Often the labour is free but oil and parts are charged.", "কাজ শুরুর আগে জিজ্ঞেস করুন কী ফ্রি আর কিসের টাকা লাগবে। অনেক সময় মজুরি ফ্রি, কিন্তু অয়েল আর পার্টসের দাম দিতে হয়।"],
      ["Make sure the book is stamped and dated each time, and keep the bill.", "প্রতিবার বইয়ে সিল আর তারিখ দেওয়া হয়েছে কি না দেখুন, বিলটা রেখে দিন।"],
    ],
    avoid: [
      ["Missing a free service date. You can lose the free service and may weaken a warranty claim.", "ফ্রি সার্ভিসের তারিখ পার করে ফেলা। ফ্রি সার্ভিস হারাতে পারেন, ওয়ারেন্টি দাবিও দুর্বল হতে পারে।"],
      ["Doing the free services at a local shop. Many warranties need the authorised service centre.", "ফ্রি সার্ভিস পাড়ার দোকানে করানো। অনেক ওয়ারেন্টিতে অনুমোদিত সার্ভিস সেন্টার লাগে।"],
    ],
    mechanic: [
      ["Bring a written list of anything odd you noticed since the last service. Free services are the time to raise it.", "শেষ সার্ভিসের পর অস্বাভাবিক যা খেয়াল করেছেন, লিখে নিয়ে যান। ফ্রি সার্ভিসই সেটা বলার সময়।"],
    ],
  },
  {
    slug: "workshop-bill-and-upselling",
    updated: "2026-10-14",
    minutes: 4,
    title: ["A fair workshop bill, and how to spot upselling", "ন্যায্য ওয়ার্কশপ বিল, আর বাড়তি কাজ চাপানো কীভাবে ধরবেন"],
    summary: [
      "Most mechanics are honest, but a vague job and no estimate is how bills grow. A few habits keep it fair.",
      "বেশির ভাগ মেকানিক সৎ, কিন্তু কাজ অস্পষ্ট আর আগে আনুমানিক খরচ না জানলে বিল বাড়ে। কয়েকটি অভ্যাসে বিল ন্যায্য থাকে।",
    ],
    steps: [
      ["Describe the problem clearly and say what you want done. Ask for an estimate before work starts.", "সমস্যাটা পরিষ্কার করে বলুন আর কী কাজ চান তা জানান। কাজ শুরুর আগে আনুমানিক খরচ জেনে নিন।"],
      ["Ask them to call you before doing anything that is not on the list.", "তালিকার বাইরে কিছু করার আগে আপনাকে ফোন করতে বলুন।"],
      ["Ask for an itemised bill: each part, oil and labour on its own line.", "আলাদা আলাদা হিসাবের বিল চান: প্রতিটি পার্টস, অয়েল আর মজুরি আলাদা লাইনে।"],
      ["Ask for the old parts back. A part that was really worn is easy to show.", "পুরনো পার্টস ফেরত চান। সত্যিই ক্ষয় হয়ে থাকলে দেখানো সহজ।"],
      ["Compare the work with your service book. If a big job is suggested, get a second opinion first.", "কাজের সাথে সার্ভিস বই মিলিয়ে দেখুন। বড় কোনো কাজের কথা বললে আগে আরেকজনের মত নিন।"],
    ],
    avoid: [
      ["Saying 'just fix whatever is needed'. It is an open cheque.", "'যা লাগে করে দেন' বলা। এটা খোলা চেকের মতো।"],
      ["Accepting extras you did not ask for: engine flush, fuel additives, early replacement of parts with life left.", "না চাওয়া বাড়তি কাজ মেনে নেওয়া: ইঞ্জিন ফ্লাশ, তেলে অ্যাডিটিভ, আয়ু বাকি থাকা পার্টস আগেই বদলানো।"],
      ["Paying without checking the bill line by line.", "লাইন ধরে বিল না দেখেই টাকা দেওয়া।"],
    ],
    mechanic: [
      ["Find one mechanic you trust and stay with them. A mechanic who knows your bike's history saves money over time.", "একজন বিশ্বস্ত মেকানিক খুঁজে তাঁর কাছেই যান। যিনি আপনার বাইকের ইতিহাস জানেন, তিনি দীর্ঘমেয়াদে টাকা বাঁচান।"],
    ],
  },
  {
    slug: "genuine-vs-duplicate-parts",
    updated: "2026-10-14",
    minutes: 4,
    title: ["Genuine vs duplicate parts: how to tell", "আসল আর নকল পার্টস: কীভাবে চিনবেন"],
    summary: [
      "Duplicate parts are common and often look the same. On brakes, chains and filters, a fake can cost far more than it saves.",
      "নকল পার্টস বাজারে অনেক, দেখতেও প্রায় একই রকম। ব্রেক, চেইন আর ফিল্টারে নকল জিনিস যা বাঁচায় তার চেয়ে অনেক বেশি ক্ষতি করে।",
    ],
    steps: [
      ["Buy from the brand's authorised dealer or a parts shop they list. Ask for a receipt.", "ব্র্যান্ডের অনুমোদিত ডিলার বা তাদের তালিকাভুক্ত পার্টসের দোকান থেকে কিনুন। রসিদ চেয়ে নিন।"],
      ["Check the box: clean printing, the brand's logo, a part number, and a hologram or seal if the brand uses one.", "বাক্স দেখুন: পরিষ্কার ছাপা, ব্র্যান্ডের লোগো, পার্ট নম্বর, আর ব্র্যান্ড ব্যবহার করলে হলোগ্রাম বা সিল।"],
      ["Compare with the old part: weight, finish, markings and fit. Fakes are often lighter and rougher.", "পুরনো পার্টসের সাথে মিলিয়ে দেখুন: ওজন, ফিনিশ, লেখা আর মাপ। নকল প্রায়ই হালকা আর খসখসে হয়।"],
      ["Engine oil: the cap seal must be intact and the bottle print sharp. Buy from a known shop.", "ইঞ্জিন অয়েল: ক্যাপের সিল অক্ষত আর বোতলের ছাপা স্পষ্ট থাকতে হবে। পরিচিত দোকান থেকে কিনুন।"],
      ["Be wary when the price is far below what others charge.", "অন্যদের চেয়ে দাম অনেক কম হলে সাবধান হোন।"],
    ],
    avoid: [
      ["Saving money on brake pads, brake fluid, chains, tyres or oil filters. These are safety and engine-life parts.", "ব্রেক প্যাড, ব্রেক ফ্লুইড, চেইন, টায়ার বা অয়েল ফিল্টারে টাকা বাঁচানো। এগুলো নিরাপত্তা আর ইঞ্জিনের আয়ুর পার্টস।"],
      ["Letting the shop fit a part you never saw in its box.", "বাক্সে না দেখা পার্টস দোকানকে লাগাতে দেওয়া।"],
    ],
    mechanic: [
      ["Ask the mechanic to show you the new part in its packaging before fitting it.", "লাগানোর আগে নতুন পার্টসটি প্যাকেটসহ দেখাতে বলুন।"],
      ["A new part that fails or wears out unusually fast. It may be a duplicate; take it back with the receipt.", "নতুন পার্টস অস্বাভাবিক দ্রুত নষ্ট বা ক্ষয় হলে। নকল হতে পারে; রসিদসহ ফেরত নিয়ে যান।"],
    ],
  },
  {
    slug: "fuel-and-mileage-habits",
    updated: "2026-10-14",
    minutes: 4,
    title: ["Fuel and mileage habits that save money", "তেল আর মাইলেজ বাঁচানোর অভ্যাস"],
    summary: [
      "How you ride changes mileage more than most add-ons. Smooth riding and basic care cost nothing.",
      "আপনি কীভাবে চালান, তা বেশির ভাগ বাড়তি জিনিসের চেয়ে মাইলেজে বেশি প্রভাব ফেলে। মসৃণ চালানো আর বেসিক যত্নে কোনো খরচ নেই।",
    ],
    steps: [
      ["Measure your real mileage: fill the tank to full, reset the trip meter, ride, then fill to full again. Divide the distance by the litres.", "আসল মাইলেজ মাপুন: ট্যাংক ফুল করে ট্রিপ মিটার শূন্য করুন, চালান, তারপর আবার ফুল করুন। দূরত্বকে লিটার দিয়ে ভাগ করুন।"],
      ["Open and close the throttle smoothly. Hard starts and late braking burn fuel.", "থ্রটল ধীরে খুলুন, ধীরে বন্ধ করুন। হঠাৎ টান আর শেষ মুহূর্তে ব্রেকে তেল পোড়ে।"],
      ["Ride in the right gear. Labouring in a high gear or screaming in a low one both waste fuel.", "সঠিক গিয়ারে চালান। বেশি গিয়ারে টেনে চালানো বা কম গিয়ারে বেশি রেভ, দুটোতেই তেল নষ্ট।"],
      ["Keep tyre pressure right, the chain lubed and the air filter clean.", "টায়ারের প্রেসার ঠিক রাখুন, চেইনে লুব দিন, এয়ার ফিল্টার পরিষ্কার রাখুন।"],
      ["Switch off if you will wait a long time, for example at a long signal or while waiting for someone.", "অনেকক্ষণ দাঁড়াতে হলে ইঞ্জিন বন্ধ করুন, যেমন লম্বা সিগন্যালে বা কারো জন্য অপেক্ষার সময়।"],
      ["Fill up at busy, trusted pumps and ask for the meter to be reset to zero before filling.", "ভিড় থাকা, বিশ্বস্ত পাম্প থেকে তেল নিন, আর ভরার আগে মিটার শূন্য করতে বলুন।"],
    ],
    avoid: [
      ["Buying 'mileage booster' additives or gadgets. Ride and maintain well instead.", "'মাইলেজ বুস্টার' অ্যাডিটিভ বা গ্যাজেট কেনা। এর বদলে ভালোভাবে চালান আর যত্ন নিন।"],
      ["Carrying extra weight you do not need.", "অপ্রয়োজনীয় বাড়তি ওজন বয়ে বেড়ানো।"],
      ["Judging mileage from one tank. Average a few fills.", "এক ট্যাংক দেখে মাইলেজ ঠিক করা। কয়েকবারের গড় নিন।"],
    ],
    mechanic: [
      ["Mileage drops suddenly with no change in how you ride. Check plug, air filter, brakes dragging and tyre pressure.", "চালানোর ধরন না বদলালেও মাইলেজ হঠাৎ কমে যায়। প্লাগ, এয়ার ফিল্টার, ব্রেক আটকে থাকা আর টায়ারের প্রেসার দেখান।"],
      ["Black smoke or a strong smell of petrol.", "কালো ধোঁয়া, অথবা পেট্রোলের তীব্র গন্ধ।"],
    ],
  },
  {
    slug: "warranty-what-voids-it",
    updated: "2026-10-14",
    minutes: 4,
    title: ["Warranty: what can void it", "ওয়ারেন্টি: কিসে বাতিল হতে পারে"],
    summary: [
      "A warranty only helps if you can still claim it. These are the usual ways riders lose it without knowing.",
      "ওয়ারেন্টি তখনই কাজে লাগে, যখন দাবি করা যায়। রাইডাররা না বুঝে সাধারণত যেভাবে এটা হারান, তা নিচে দেওয়া হলো।",
    ],
    need: [
      ["Your warranty card and service book. Terms differ by brand; the card is the final word.", "আপনার ওয়ারেন্টি কার্ড আর সার্ভিস বই। ব্র্যান্ডভেদে শর্ত আলাদা; কার্ডই শেষ কথা।"],
    ],
    steps: [
      ["Read the warranty card once, end to end. Note what is covered, for how long, and what is excluded.", "ওয়ারেন্টি কার্ড একবার পুরোটা পড়ুন। কী কভার করে, কতদিন, আর কী বাদ, লিখে রাখুন।"],
      ["Do every scheduled service on time, at the place the card asks for.", "প্রতিটি নির্ধারিত সার্ভিস সময়মতো, কার্ডে বলা জায়গায় করান।"],
      ["Keep every bill and make sure the service book is stamped.", "সব বিল রাখুন আর সার্ভিস বইয়ে সিল নিশ্চিত করুন।"],
      ["Report a fault as soon as you notice it, in writing if possible, so it is on record within the warranty period.", "সমস্যা চোখে পড়লেই জানান, পারলে লিখিতভাবে, যাতে ওয়ারেন্টির সময়ের মধ্যেই রেকর্ডে থাকে।"],
    ],
    avoid: [
      ["Modifying the exhaust, wiring, lights or engine tuning. Many brands refuse claims on modified parts.", "এক্সজস্ট, তার, লাইট বা ইঞ্জিন টিউনিং বদলানো। অনেক ব্র্যান্ড বদলানো অংশের দাবি নেয় না।"],
      ["Skipping or delaying scheduled services, or using non-genuine parts on covered items.", "নির্ধারিত সার্ভিস বাদ দেওয়া বা দেরি করা, অথবা কভার করা অংশে নকল পার্টস লাগানো।"],
      ["Tampering with the odometer, or letting an unauthorised shop open the engine.", "ওডোমিটারে কারসাজি, বা অনুমোদনহীন দোকানে ইঞ্জিন খোলানো।"],
    ],
    mechanic: [
      ["Before any modification or major repair, ask the authorised service centre whether it affects your warranty.", "কোনো মডিফিকেশন বা বড় মেরামতের আগে অনুমোদিত সার্ভিস সেন্টারে জিজ্ঞেস করুন ওয়ারেন্টিতে প্রভাব পড়বে কি না।"],
      ["Note that crash damage and normal wear items (tyres, pads, chain) are usually not covered.", "মনে রাখুন, দুর্ঘটনার ক্ষতি আর স্বাভাবিক ক্ষয়ের জিনিস (টায়ার, প্যাড, চেইন) সাধারণত কভার হয় না।"],
    ],
  },
  // Series 4: safety and riding skills.
  {
    slug: "helmet-buying-and-care",
    updated: "2026-10-14",
    minutes: 4,
    title: ["Buying a helmet and looking after it", "হেলমেট কেনা আর যত্ন নেওয়া"],
    summary: [
      "The helmet is the one part of your kit that has to work the first time. Fit and certification matter more than looks.",
      "হেলমেট এমন জিনিস যা প্রথমবারেই কাজ করতে হবে। দেখতে কেমন তার চেয়ে মাপ আর সার্টিফিকেশন বেশি জরুরি।",
    ],
    steps: [
      ["Choose a full-face helmet if you can. It protects the chin and jaw, which open-face helmets do not.", "পারলে ফুল-ফেস হেলমেট নিন। এটা থুতনি আর চোয়াল বাঁচায়, ওপেন-ফেস যা পারে না।"],
      ["Check the certification. In Bangladesh, helmets are reported to need BSTI certification to be sold. Also look for an international label such as ECE or DOT. Avoid helmets with no label at all. Our guide \"Helmet labels: BSTI, ECE 22.06 and the rest\" explains each mark.", "সার্টিফিকেশন দেখুন। খবর অনুযায়ী বাংলাদেশে হেলমেট বিক্রির জন্য BSTI সার্টিফিকেশন লাগে। সাথে ECE বা DOT-এর মতো আন্তর্জাতিক লেবেলও খুঁজুন। কোনো লেবেল না থাকলে সেই হেলমেট নেবেন না। কোন চিহ্নের কী মানে, তা আমাদের \"হেলমেটের লেবেল: BSTI, ECE 22.06 আর অন্যগুলো\" গাইডে আছে।"],
      ["Try it on. It should be snug all round, with no pressure points, and must not twist when you shake your head.", "পরে দেখুন। চারপাশে আঁটসাঁট থাকবে কিন্তু কোথাও চাপ লাগবে না, আর মাথা নাড়লে ঘুরে যাবে না।"],
      ["Fasten the strap every ride, so only a finger or two fits under it.", "প্রতিবার স্ট্র্যাপ আটকান, নিচে যেন এক-দুই আঙুলের বেশি না ঢোকে।"],
      ["Clean the visor with water and a soft cloth, and wash the removable liner with mild soap.", "ভাইজর পানি আর নরম কাপড়ে পরিষ্কার করুন, খোলা যায় এমন লাইনার হালকা সাবানে ধুন।"],
      ["Get one for your pillion too.", "পিলিয়নের জন্যও একটা নিন।"],
    ],
    avoid: [
      ["Reusing a helmet after a crash or a hard drop, even if it looks fine. The foam inside may be crushed. Replace it.", "দুর্ঘটনা বা জোরে পড়ে যাওয়ার পর একই হেলমেট আবার পরা, দেখতে ঠিক থাকলেও। ভেতরের ফোম থেঁতলে থাকতে পারে। বদলে ফেলুন।"],
      ["Hanging the helmet on the mirror. It damages the liner and invites theft.", "মিররে হেলমেট ঝুলিয়ে রাখা। এতে লাইনার নষ্ট হয়, চুরিও হয়।"],
      ["Buying second-hand. You cannot know its history.", "পুরনো হেলমেট কেনা। এর অতীত আপনি জানেন না।"],
    ],
    mechanic: [
      ["If the bike's helmet lock is broken or missing, get it fixed so the helmet is not left loose.", "বাইকের হেলমেট লক ভাঙা বা না থাকলে ঠিক করিয়ে নিন, যাতে হেলমেট আলগা পড়ে না থাকে।"],
      ["Replace the helmet when the liner is loose, the strap is worn, or the maker's suggested life is up.", "লাইনার ঢিলা হলে, স্ট্র্যাপ ক্ষয় হলে, বা নির্মাতার বলা মেয়াদ শেষ হলে হেলমেট বদলান।"],
    ],
  },
  {
    slug: "helmet-standards-bsti-ece-22-06",
    updated: "2026-10-14",
    minutes: 5,
    title: ["Helmet labels: BSTI, ECE 22.06 and the rest", "হেলমেটের লেবেল: BSTI, ECE 22.06 আর অন্যগুলো"],
    summary: [
      "What the marks inside a helmet mean, which one the law asks for, and which one we suggest. Law and enforcement notes are as of 14 October 2026. This is general guidance, not legal advice.",
      "হেলমেটের ভেতরের চিহ্নগুলোর মানে কী, আইন কোনটা চায়, আর আমরা কোনটা নিতে বলি। আইন আর প্রয়োগের তথ্য ১৪ অক্টোবর ২০২৬ পর্যন্ত। এটা সাধারণ পরামর্শ, আইনি পরামর্শ নয়।",
    ],
    steps: [
      ["Know the legal rule. Helmets are reported to be on BSTI's mandatory certification list, so a helmet made or imported for sale here must carry BSTI certification (Prothom Alo, 2 April 2026). BSTI certification is the legal requirement. For the exact rule, check with BSTI.", "আইনটা জানুন। খবর অনুযায়ী হেলমেট BSTI-এর বাধ্যতামূলক সার্টিফিকেশন তালিকায় আছে। তাই দেশে বানানো বা আমদানি করা হেলমেট বিক্রি করতে BSTI সার্টিফিকেশন লাগবে (প্রথম আলো, ২ এপ্রিল ২০২৬)। আইনগত শর্ত হলো BSTI সার্টিফিকেশন। সঠিক নিয়ম জানতে BSTI-তে খোঁজ নিন।"],
      ["Know how it is checked today. In our experience, police stops check that you are wearing a helmet, not what its label says. That is no reason to skip the rule. The rule exists so the helmet on your head has passed a test.", "এখন কীভাবে দেখা হয়, জানুন। আমাদের অভিজ্ঞতায় পুলিশ থামালে দেখে আপনি হেলমেট পরেছেন কি না, লেবেলে কী লেখা তা নয়। তাই বলে নিয়ম এড়ানোর কারণ নেই। নিয়মটা আছে যাতে আপনার মাথার হেলমেটটা পরীক্ষায় পাস করা হয়।"],
      ["If you can, choose a helmet that also has ECE 22.06. It is the current version of the UN helmet rule (UN Regulation 22, 06 series). It came into force in January 2021 and has been required for new helmet approvals in Europe since July 2022.", "পারলে এমন হেলমেট নিন যাতে ECE 22.06-ও আছে। এটা জাতিসংঘের হেলমেট নিয়মের (UN Regulation 22, 06 সিরিজ) এখনকার সংস্করণ। ২০২১ সালের জানুয়ারিতে চালু হয়েছে, আর ২০২২ সালের জুলাই থেকে ইউরোপে নতুন হেলমেটের অনুমোদন পেতে এটা লাগে।"],
      ["Why 22.06 is better: it adds an angled impact test that measures how fast the head is made to spin. Most falls hit the head at an angle, not straight on, so the head twists as well as stops. That twisting strains the brain inside the skull and is linked to concussion and serious brain injury.", "22.06 কেন ভালো: এতে কোণ করে আঘাতের একটা পরীক্ষা যোগ হয়েছে, যেটা মাপে মাথা কত জোরে ঘুরে যায়। বেশিরভাগ পড়ে যাওয়ায় মাথায় আঘাত লাগে বাঁকা হয়ে, সোজাসুজি নয়। তাই মাথা থামার সাথে সাথে মোচড়ও খায়। এই মোচড়ে খুলির ভেতরে মস্তিষ্কে টান পড়ে, যা কনকাশন আর গুরুতর ব্রেন ইনজুরির সাথে জড়িত।"],
      ["22.06 also tests at more points around the shell, at both a lower and a higher impact speed, and tests the visor, for example against a small steel ball fired at it at high speed.", "22.06-এ শেলের আরও বেশি জায়গায় পরীক্ষা হয়, কম আর বেশি দুই গতিতেই আঘাত করা হয়। ভাইজরও পরীক্ষা হয়, যেমন জোরে ছোড়া ছোট স্টিলের বলের আঘাতে।"],
      ["Read the ECE label, usually sewn onto the chin strap. Look for an E with a number in a circle. In the long approval number below it, the first two digits show the version: 06 means 22.06, 05 means the older 22.05.", "ECE লেবেল পড়ুন, সাধারণত চিন স্ট্র্যাপে সেলাই করা থাকে। গোল দাগের ভেতরে E আর একটা সংখ্যা খুঁজুন। নিচের লম্বা অনুমোদন নম্বরের প্রথম দুই অঙ্ক সংস্করণ বোঝায়: 06 মানে 22.06, 05 মানে পুরনো 22.05।"],
      ["Other marks you may see: DOT is the US standard and ISI is India's. They show the helmet was made to a recognised test, but they are different tests from ECE 22.06.", "আরও যেসব চিহ্ন দেখবেন: DOT আমেরিকার মান, ISI ভারতের। এগুলো বোঝায় হেলমেট একটা স্বীকৃত পরীক্ষা মেনে বানানো, তবে ECE 22.06-এর পরীক্ষা থেকে এগুলো আলাদা।"],
      ["Buy from an authorised dealer or a shop you trust, and keep the receipt.", "অনুমোদিত ডিলার বা ভরসার দোকান থেকে কিনুন, রসিদ রেখে দিন।"],
    ],
    avoid: [
      ["Trusting a sticker alone. Fake BSTI, ECE and DOT stickers exist. A real ECE label carries a full approval number, not just the letters.", "শুধু স্টিকার দেখে ভরসা করা। BSTI, ECE, DOT-এর নকল স্টিকারও পাওয়া যায়। আসল ECE লেবেলে পুরো অনুমোদন নম্বর থাকে, শুধু অক্ষর নয়।"],
      ["Buying a very cheap helmet from a roadside stall because it has a sticker. Most helmets in the market lack BSTI certification, according to the same report.", "স্টিকার আছে বলে রাস্তার পাশের দোকান থেকে খুব সস্তা হেলমেট কেনা। একই খবর বলছে, বাজারের বেশিরভাগ হেলমেটে BSTI সার্টিফিকেশন নেই।"],
      ["Riding bareheaded because your helmet is not the best one. Any helmet, worn with the strap fastened, beats no helmet.", "হেলমেট সেরা না বলে খালি মাথায় চালানো। স্ট্র্যাপ আটকে পরা যেকোনো হেলমেট, হেলমেট না পরার চেয়ে ভালো।"],
    ],
    mechanic: [
      ["Ask the seller to show the certification label before you pay. If they cannot, buy elsewhere.", "টাকা দেওয়ার আগে বিক্রেতাকে সার্টিফিকেশনের লেবেল দেখাতে বলুন। না পারলে অন্য জায়গা থেকে কিনুন।"],
      ["Replace any helmet after a crash, whatever its label says.", "দুর্ঘটনার পর হেলমেট বদলে ফেলুন, লেবেলে যা-ই লেখা থাকুক।"],
    ],
  },
  {
    slug: "rain-and-fog-riding",
    updated: "2026-10-14",
    minutes: 4,
    title: ["Riding in rain and fog", "বৃষ্টি আর কুয়াশায় চালানো"],
    summary: [
      "Wet roads leave far less room for error, and fog hides you from others. Slow down and make yourself easy to see.",
      "ভেজা রাস্তায় ভুলের সুযোগ অনেক কমে যায়, আর কুয়াশায় অন্যরা আপনাকে দেখতে পায় না। গতি কমান, নিজেকে সহজে দৃশ্যমান রাখুন।",
    ],
    steps: [
      ["Slow down and leave much more space to the vehicle ahead. Braking takes longer on wet roads.", "গতি কমান, সামনের গাড়ি থেকে অনেক বেশি দূরত্ব রাখুন। ভেজা রাস্তায় থামতে বেশি সময় লাগে।"],
      ["Be gentle with throttle, brakes and steering. Do one thing at a time.", "থ্রটল, ব্রেক আর স্টিয়ারিং আলতোভাবে ব্যবহার করুন। একসাথে একটাই কাজ করুন।"],
      ["Avoid painted lines, metal covers and oily patches. They are very slippery when wet, especially in the first rain.", "রাস্তার রঙের দাগ, ধাতুর ঢাকনা আর তেলের দাগ এড়িয়ে চলুন। ভিজলে খুব পিছলা হয়, বিশেষ করে প্রথম বৃষ্টিতে।"],
      ["Treat standing water as a hidden pothole. Go around it if you can, slowly through it if you cannot.", "জমে থাকা পানিকে লুকানো গর্ত ভাবুন। পারলে পাশ দিয়ে যান, না পারলে আস্তে পার হোন।"],
      ["In fog, use your low beam, not high beam. High beam reflects back and blinds you.", "কুয়াশায় লো বিম জ্বালান, হাই বিম নয়। হাই বিম ফিরে এসে আপনার চোখই ধাঁধায়।"],
      ["Wear a bright or reflective jacket and keep the visor clean. If you cannot see, pull over somewhere safe and wait.", "উজ্জ্বল বা রিফ্লেক্টিভ জ্যাকেট পরুন, ভাইজর পরিষ্কার রাখুন। কিছু দেখতে না পেলে নিরাপদ জায়গায় থেমে অপেক্ষা করুন।"],
    ],
    avoid: [
      ["Braking hard while leaned over or turning on a wet road.", "ভেজা রাস্তায় হেলে থাকা বা মোড় নেওয়ার সময় জোরে ব্রেক করা।"],
      ["Sheltering under a flyover in the traffic lane. Stop fully off the road.", "ফ্লাইওভারের নিচে চলার লেনে দাঁড়িয়ে আশ্রয় নেওয়া। পুরোপুরি রাস্তার বাইরে থামুন।"],
      ["Riding with a fogged-up visor. Crack it open slightly or use an anti-fog insert.", "ঝাপসা ভাইজর নিয়ে চালানো। একটু ফাঁক করে দিন বা অ্যান্টি-ফগ ইনসার্ট ব্যবহার করুন।"],
    ],
    mechanic: [
      ["Brakes that feel weak after riding through water, even after a few gentle applications.", "পানি পার হওয়ার পর কয়েকবার হালকা ব্রেক করার পরও ব্রেক দুর্বল লাগে।"],
      ["Tyres with little tread left. Worn tyres are the biggest danger in the wet.", "টায়ারের ট্রেড প্রায় শেষ। ভেজা রাস্তায় ক্ষয়ে যাওয়া টায়ারই সবচেয়ে বড় বিপদ।"],
    ],
  },
  {
    slug: "night-riding",
    updated: "2026-10-14",
    minutes: 3,
    title: ["Riding safely at night", "রাতে নিরাপদে চালানো"],
    summary: [
      "At night you see less and are seen less. Many vehicles and rickshaws have weak or no lights at all.",
      "রাতে আপনি কম দেখেন, অন্যরাও আপনাকে কম দেখে। অনেক গাড়ি আর রিকশায় লাইট দুর্বল বা একেবারেই নেই।",
    ],
    steps: [
      ["Before you leave, check the headlight on both beams, tail light, brake light and indicators.", "বের হওয়ার আগে হেডলাইটের দুই বিম, টেইল লাইট, ব্রেক লাইট আর ইন্ডিকেটর দেখে নিন।"],
      ["Clean your visor. Scratches and dirt turn oncoming lights into glare.", "ভাইজর পরিষ্কার করুন। দাগ আর ময়লায় সামনের গাড়ির আলো চোখ ধাঁধিয়ে দেয়।"],
      ["Ride slower than in daytime, so you can stop within the distance your headlight shows.", "দিনের চেয়ে আস্তে চালান, যাতে হেডলাইটে যতদূর দেখা যায় তার মধ্যেই থামতে পারেন।"],
      ["Dip to low beam for oncoming traffic and when following another vehicle.", "সামনে থেকে গাড়ি এলে আর কারো পেছনে চললে লো বিমে নামান।"],
      ["Expect unlit rickshaws, vans, pedestrians and parked trucks. Look well ahead.", "লাইট ছাড়া রিকশা, ভ্যান, পথচারী আর দাঁড়িয়ে থাকা ট্রাক আশা করুন। অনেক দূর পর্যন্ত চোখ রাখুন।"],
      ["Wear something reflective, and stop for a break if you feel tired.", "রিফ্লেক্টিভ কিছু পরুন, ক্লান্ত লাগলে থেমে বিশ্রাম নিন।"],
    ],
    avoid: [
      ["Using a dark or tinted visor after sunset.", "সন্ধ্যার পর কালো বা টিন্টেড ভাইজর ব্যবহার করা।"],
      ["Keeping high beam on in the city. It blinds others and makes them swerve.", "শহরে হাই বিম জ্বালিয়ে রাখা। এতে অন্যদের চোখ ধাঁধায়, তারা হঠাৎ সরে যায়।"],
      ["Staring into oncoming headlights. Look to the left edge of the road instead.", "সামনের গাড়ির হেডলাইটের দিকে তাকিয়ে থাকা। বরং রাস্তার বাঁ কিনারার দিকে তাকান।"],
    ],
    mechanic: [
      ["A headlight that is dim or points too high or too low. It can be adjusted.", "হেডলাইট ম্লান, বা বেশি ওপরে বা নিচে তাক করা। এটা অ্যাডজাস্ট করা যায়।"],
      ["Lights that flicker or dim when you rev. The charging system may need a check.", "রেভ দিলে লাইট কাঁপে বা কমে যায়। চার্জিং সিস্টেম দেখাতে হতে পারে।"],
    ],
  },
  {
    slug: "emergency-braking",
    updated: "2026-10-14",
    minutes: 4,
    title: ["Emergency braking", "জরুরি ব্রেকিং"],
    summary: [
      "When something pulls out in front of you, there is no time to think. Practise now so your hands know what to do.",
      "সামনে হঠাৎ কিছু চলে এলে ভাবার সময় থাকে না। এখনই অনুশীলন করুন, যাতে হাত-পা নিজেই জানে কী করতে হবে।",
    ],
    steps: [
      ["Learn your bike's brakes from the manual: ABS, a combined system that links both brakes, or neither.", "ম্যানুয়াল থেকে নিজের বাইকের ব্রেক চিনুন: এবিএস, দুই ব্রেক একসাথে জোড়া সিস্টেম (CBS), নাকি কোনোটাই নয়।"],
      ["Use both brakes together. The front brake does most of the stopping.", "দুই ব্রেক একসাথে ব্যবহার করুন। থামানোর বেশির ভাগ কাজ সামনের ব্রেকই করে।"],
      ["Squeeze the front lever progressively, harder as the weight shifts forward. Do not grab it.", "সামনের লিভার ধীরে ধীরে জোরে চাপুন, ওজন সামনে সরার সাথে সাথে আরও জোরে। হঠাৎ খামচে ধরবেন না।"],
      ["Keep the bike upright and look where you want to go, not at the obstacle.", "বাইক সোজা রাখুন, আর বাধার দিকে নয়, যেদিকে যেতে চান সেদিকে তাকান।"],
      ["With ABS, squeeze hard and hold it. Without ABS, if a wheel locks, ease off just enough for it to roll, then squeeze again.", "এবিএস থাকলে জোরে চেপে ধরে রাখুন। না থাকলে চাকা লক হলে একটু ছেড়ে চাকা ঘুরতে দিন, তারপর আবার চাপুন।"],
      ["Practise at low speed in an empty, dry place, then build up slowly.", "ফাঁকা, শুকনো জায়গায় কম গতিতে অনুশীলন করুন, তারপর ধীরে ধীরে গতি বাড়ান।"],
    ],
    avoid: [
      ["Using only the rear brake. It stops you far later.", "শুধু পেছনের ব্রেক ব্যবহার। এতে থামতে অনেক বেশি সময় লাগে।"],
      ["Braking hard while leaned over. Straighten up first if you can.", "হেলে থাকা অবস্থায় জোরে ব্রেক। পারলে আগে সোজা হয়ে নিন।"],
      ["Pulling in the clutch late and stalling in the middle of the road.", "দেরিতে ক্লাচ চেপে রাস্তার মাঝখানে ইঞ্জিন বন্ধ করে ফেলা।"],
    ],
    mechanic: [
      ["A spongy lever, a pull to one side, or a pulsing feel when braking.", "লিভার নরম লাগে, ব্রেক করলে বাইক এক দিকে টানে, অথবা কাঁপুনি লাগে।"],
      ["An ABS warning light that stays on after you start riding.", "চালানো শুরুর পরও এবিএস ওয়ার্নিং লাইট জ্বলে থাকে।"],
    ],
  },
  {
    slug: "pillion-and-luggage",
    updated: "2026-10-14",
    minutes: 4,
    title: ["Carrying a pillion and luggage", "পিলিয়ন আর মালপত্র নিয়ে চালানো"],
    summary: [
      "Extra weight changes how the bike brakes and turns. Set it up for the load and brief your passenger.",
      "বাড়তি ওজনে বাইকের ব্রেক আর মোড় নেওয়ার ধরন বদলে যায়। ওজন অনুযায়ী বাইক ঠিক করুন আর পিলিয়নকে আগে বুঝিয়ে দিন।",
    ],
    steps: [
      ["Check the maximum load in your manual. It includes you, the pillion and all luggage.", "ম্যানুয়ালে সর্বোচ্চ ভার দেখুন। এতে আপনি, পিলিয়ন আর সব মালপত্র মিলিয়ে ধরা হয়।"],
      ["Set the tyre pressure for a loaded bike, as the manual says. It is usually higher with a pillion.", "ম্যানুয়াল অনুযায়ী ভারী বাইকের জন্য টায়ারের প্রেসার ঠিক করুন। পিলিয়ন থাকলে সাধারণত একটু বেশি।"],
      ["Brief your pillion: helmet on, feet on the footrests, hold your waist or the grab rail, and sit still through turns.", "পিলিয়নকে বুঝিয়ে দিন: হেলমেট পরবেন, পা ফুটরেস্টে রাখবেন, আপনার কোমর বা গ্র্যাব রেল ধরবেন, মোড়ে নড়াচড়া করবেন না।"],
      ["Make sure a saree, orna, scarf or bag strap cannot reach the rear wheel or chain. Check the saree guard is fitted.", "শাড়ি, ওড়না, স্কার্ফ বা ব্যাগের ফিতা যেন পেছনের চাকা বা চেইনে না যায়। শাড়ি গার্ড লাগানো আছে কি না দেখুন।"],
      ["Keep luggage low, centred and tied down with proper straps. Nothing wider than the handlebars.", "মালপত্র নিচু আর মাঝখানে রাখুন, ঠিকমতো স্ট্র্যাপ দিয়ে বাঁধুন। হ্যান্ডেলের চেয়ে চওড়া কিছু নয়।"],
      ["Brake earlier and corner slower than when riding alone.", "একা চালানোর চেয়ে আগে ব্রেক করুন, মোড়ে আস্তে চালান।"],
    ],
    avoid: [
      ["Carrying more than one pillion, or a child in front of you.", "একজনের বেশি পিলিয়ন, বা সামনে বাচ্চা বসিয়ে চালানো।"],
      ["Hanging heavy bags from the handlebar. They affect steering.", "হ্যান্ডেলে ভারী ব্যাগ ঝোলানো। এতে স্টিয়ারিংয়ে সমস্যা হয়।"],
      ["Letting the pillion touch the hot exhaust when getting on and off.", "ওঠা-নামার সময় পিলিয়নের পা গরম এক্সজস্টে লাগতে দেওয়া।"],
    ],
    mechanic: [
      ["If you often ride two-up, ask about adjusting the rear suspension preload.", "প্রায়ই দুজন চড়লে পেছনের সাসপেনশনের প্রিলোড অ্যাডজাস্ট করা যায় কি না জিজ্ঞেস করুন।"],
      ["A missing saree guard, loose footrests or a cracked grab rail.", "শাড়ি গার্ড নেই, ফুটরেস্ট ঢিলা, বা গ্র্যাব রেলে ফাটল।"],
    ],
  },
  {
    slug: "after-a-crash-or-breakdown",
    updated: "2026-10-14",
    minutes: 5,
    title: ["What to do after a crash or breakdown", "দুর্ঘটনা বা বাইক বিকল হলে কী করবেন"],
    summary: [
      "Stay safe first, then record what happened. The right steps in the first hour make insurance and police work much easier.",
      "আগে নিরাপদ থাকুন, তারপর কী হয়েছে তার প্রমাণ রাখুন। প্রথম এক ঘণ্টার সঠিক পদক্ষেপে ইন্স্যুরেন্স আর পুলিশের কাজ অনেক সহজ হয়।",
    ],
    need: [
      ["Saved in your phone: 999 (national emergency: police, ambulance, fire), your insurer and your dealer's helpline", "ফোনে সেভ রাখুন: ৯৯৯ (জাতীয় জরুরি সেবা: পুলিশ, অ্যাম্বুলেন্স, ফায়ার), আপনার ইন্স্যুরেন্স কোম্পানি আর ডিলারের হেল্পলাইন"],
      ["Photos or copies of your licence, registration and insurance papers", "লাইসেন্স, রেজিস্ট্রেশন আর ইন্স্যুরেন্সের কাগজের ছবি বা কপি"],
    ],
    steps: [
      ["Get yourself and others out of traffic. Switch on hazard lights if you have them.", "নিজেকে আর অন্যদের গাড়ির পথ থেকে সরান। হ্যাজার্ড লাইট থাকলে জ্বালান।"],
      ["If anyone is hurt, call 999. Do not move an injured person unless they are in more danger where they are.", "কেউ আহত হলে ৯৯৯-এ ফোন করুন। আহত মানুষকে সরাবেন না, যদি না সেখানে থাকা আরও বিপজ্জনক হয়।"],
      ["Take photos: the scene, all vehicles, number plates, damage and road conditions.", "ছবি তুলুন: পুরো জায়গা, সব গাড়ি, নম্বর প্লেট, ক্ষতি আর রাস্তার অবস্থা।"],
      ["Note the other driver's name, phone, vehicle number and the names and numbers of witnesses.", "অন্য চালকের নাম, ফোন, গাড়ির নম্বর, আর সাক্ষীদের নাম-নম্বর লিখে নিন।"],
      ["Tell your insurer as soon as you can. Policies often have a deadline for reporting.", "যত দ্রুত পারেন ইন্স্যুরেন্স কোম্পানিকে জানান। পলিসিতে প্রায়ই জানানোর সময়সীমা থাকে।"],
      ["For a serious crash, or if the insurer asks, report it at the nearest police station and keep a copy of the report.", "গুরুতর দুর্ঘটনা হলে, বা ইন্স্যুরেন্স কোম্পানি চাইলে, নিকটস্থ থানায় জানান আর রিপোর্টের কপি রাখুন।"],
      ["Breakdown: push the bike well off the road, then call your dealer's helpline or a mechanic you know.", "বিকল হলে: বাইক ঠেলে রাস্তার একদম বাইরে নিন, তারপর ডিলারের হেল্পলাইন বা পরিচিত মেকানিককে ফোন করুন।"],
    ],
    avoid: [
      ["Arguing or agreeing to a cash settlement on the spot before you know the damage and injuries.", "ক্ষতি আর আঘাত বোঝার আগেই ঝগড়া করা বা ঘটনাস্থলে টাকা নিয়ে মিটমাট করে ফেলা।"],
      ["Handing your bike or papers to a stranger who offers to 'sort it out'.", "'সব ঠিক করে দেব' বলা অচেনা কাউকে বাইক বা কাগজ দিয়ে দেওয়া।"],
      ["Riding on after a fall without checking the brakes, forks, bars and lights.", "পড়ে যাওয়ার পর ব্রেক, ফর্ক, হ্যান্ডেল আর লাইট না দেখেই আবার চালানো।"],
    ],
    mechanic: [
      ["Any crash, even a slow one. Bent forks, wheels or brake parts are not always visible.", "যেকোনো দুর্ঘটনার পর, ধীর গতির হলেও। ফর্ক, চাকা বা ব্রেকের পার্টস বাঁকলে সবসময় চোখে পড়ে না।"],
      ["See a doctor too. Some injuries only show up hours later.", "ডাক্তারও দেখান। কিছু আঘাত কয়েক ঘণ্টা পরে টের পাওয়া যায়।"],
    ],
  },
  {
    slug: "clutchless-shifting",
    updated: "2026-10-14",
    minutes: 5,
    title: ["Clutchless shifting: how it works and when to skip it", "ক্লাচ ছাড়া গিয়ার বদল: কীভাবে কাজ করে, কখন করবেন না"],
    summary: [
      "Riders argue about it endlessly. Here is what actually happens inside the gearbox, what is fine, and where you can hurt the bike or yourself.",
      "নিয়ে তর্কের শেষ নেই। গিয়ারবক্সের ভেতরে আসলে কী হয়, কোনটা ঠিক আর কোথায় বাইক বা নিজের ক্ষতি হতে পারে, এখানে সেটাই।",
    ],
    figures: [
      {
        width: 600,
        height: 640,
        alt: ["Animated diagram of a sequential gearbox: a shift fork slides a ring with dogs sideways to lock one gear to its shaft", "সিকোয়েন্সিয়াল গিয়ারবক্সের অ্যানিমেটেড ডায়াগ্রাম: শিফট ফর্ক ডগসহ রিংকে পাশে সরিয়ে একটি গিয়ারকে শ্যাফটের সাথে আটকায়"],
        caption: ["A sequential gearbox. The shift fork (grey) slides a ring of dogs (pink) into the next gear. There is no synchroniser, so the dogs simply have to line up and drop in.", "সিকোয়েন্সিয়াল গিয়ারবক্স। শিফট ফর্ক (ধূসর) ডগের রিংকে (গোলাপি) পরের গিয়ারে ঢুকিয়ে দেয়। সিঙ্ক্রোনাইজার নেই, ডগগুলো মিলে গেলেই ঢুকে যায়।"],
        image: { src: "/posts/sequential-gearbox.gif", author: "XyKyWyKy", license: "CC0", sourcePage: "https://commons.wikimedia.org/wiki/File:Gearbox_4gears_sequential.gif" },
      },
      {
        width: 1000,
        height: 750,
        alt: ["Close-up of motorcycle gearbox gears with square dog lugs on the face of the gear", "মোটরসাইকেল গিয়ারবক্সের গিয়ারের মুখে চৌকো ডগ লাগ-এর ক্লোজ-আপ"],
        caption: ["Real gearbox gears (Honda CBR600RR teardown). The chunky square lugs on the gear face are the dogs. Worn or rounded corners make shifts harder.", "আসল গিয়ারবক্সের গিয়ার (Honda CBR600RR খোলা অবস্থায়)। গিয়ারের মুখের মোটা চৌকো লাগগুলোই ডগ। কোণ ক্ষয়ে গোল হলে গিয়ার বদল কঠিন হয়ে যায়।"],
        image: { src: "/posts/gearbox-dogs.webp", author: "Spheroidite", license: "CC BY-SA 4.0", licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0", sourcePage: "https://commons.wikimedia.org/wiki/File:Honda_CBR600RR_teardown_2015-10-19_13.44.00.jpg" },
      },
    ],
    steps: [
      ["Know why it works. A motorcycle gearbox has no synchronisers like a car. Gears are locked to the shaft by dogs, which are chunky lugs that slot into matching gaps. They are built for fast, repeated load changes.", "কেন কাজ করে তা বুঝুন। গাড়ির মতো মোটরসাইকেলের গিয়ারবক্সে সিঙ্ক্রোনাইজার নেই। গিয়ার শ্যাফটের সাথে আটকায় ডগ দিয়ে, মানে মোটা লাগ যা মাপমতো ফাঁকে ঢোকে। দ্রুত, বারবার লোড বদলের জন্যই এগুলো বানানো।"],
      ["Upshift: keep the throttle on, ease off it for a moment as you press the shift lever up, then roll back on. Unloading the dogs for that instant lets them slide out and into the next gear. Do it smoothly, do not stab at the lever.", "আপশিফট: থ্রটল ধরে রেখে লিভার ওপরে চাপার মুহূর্তে একটু ছেড়ে দিন, তারপর আবার দিন। ওই মুহূর্তে ডগের ওপর চাপ কমে, তাই সহজে বেরিয়ে পরের গিয়ারে ঢোকে। মসৃণভাবে করুন, লিভারে ঘুষি মারবেন না।"],
      ["Downshift method 1, rev matching: close the throttle, blip it up as you press the lever down, so the engine speed matches the speed the lower gear needs. Release smoothly. It takes practice, and a bad blip gives a jerk or a rear-wheel skid.", "ডাউনশিফট পদ্ধতি ১, রেভ ম্যাচিং: থ্রটল বন্ধ করে লিভার নামানোর সময় থ্রটল একটু ঝাপটা দিন, যাতে ইঞ্জিনের গতি নিচের গিয়ারের দরকারি গতির সাথে মেলে। আস্তে ছাড়ুন। অভ্যাস লাগে; ভুল হলে ঝটকা বা পেছনের চাকা স্কিড করতে পারে।"],
      ["Downshift method 2, passive syncing: as the bike slows, hold light steady pressure on the lever. When engine and wheel speed come close, the gear drops in by itself. The dogs are angled to self-align, so it is gentle if you stay patient.", "ডাউনশিফট পদ্ধতি ২, প্যাসিভ সিঙ্কিং: বাইক ধীর হওয়ার সময় লিভারে হালকা চাপ ধরে রাখুন। ইঞ্জিন আর চাকার গতি কাছাকাছি এলে গিয়ার নিজেই ঢুকে যায়। ডগের আকার এমন যে নিজে থেকে মিলে যায়, তাই ধৈর্য ধরলে মসৃণ হয়।"],
      ["Practise on a quiet, dry, straight road at low speed first, never in traffic or in a corner.", "প্রথমে ফাঁকা, শুকনো, সোজা রাস্তায় কম গতিতে অভ্যাস করুন। ভিড়ের মধ্যে বা বাঁকে কখনো নয়।"],
    ],
    avoid: [
      ["Clutchless on a cold engine. Thick cold oil makes the dogs slow to engage. Ride a few minutes first.", "ঠান্ডা ইঞ্জিনে ক্লাচ ছাড়া বদল। ঠান্ডা ঘন তেলে ডগ ধীরে ঢোকে। আগে কয়েক মিনিট চালিয়ে নিন।"],
      ["Forcing it when the RPM does not match. Mismatched speed, not the lack of a clutch, is what damages the gearbox and locks the rear wheel.", "গতি না মিললে জোর করে গিয়ার ঢোকানো। গিয়ারবক্সের ক্ষতি আর পেছনের চাকা লক হওয়ার আসল কারণ গতির অমিল, ক্লাচ না থাকা নয়।"],
      ["Doing it hard on an old or abused bike: bent shift forks, rounded dogs or a gearbox that already jumps out of gear. Use the clutch there.", "পুরনো বা অযত্নের বাইকে জোরে করা: বাঁকা শিফট ফর্ক, গোল হয়ে যাওয়া ডগ, বা গিয়ার ইতিমধ্যে ফসকে যায়। সেখানে ক্লাচ ব্যবহার করুন।"],
      ["Downshifting clutchless on wet or loose roads. A wrong match can lock the rear tyre and slide you out.", "ভেজা বা আলগা রাস্তায় ক্লাচ ছাড়া ডাউনশিফট। অমিল হলে পেছনের টায়ার লক হয়ে পিছলে পড়তে পারেন।"],
      ["Missing the gear on a 1-N-2-3-4 pattern. Many commuter bikes have neutral between 1st and 2nd, and a lazy clutchless 1-to-2 shift can land in neutral. Use the clutch for that one.", "১-এন-২-৩-৪ প্যাটার্নে গিয়ার ফসকানো। অনেক কমিউটার বাইকে ১ম আর ২য় গিয়ারের মাঝে নিউট্রাল থাকে, আর ক্লাচ ছাড়া ঢিলেঢালা ১ থেকে ২ করলে নিউট্রালে পড়ে যেতে পারে। ওই বদলে ক্লাচ ব্যবহার করুন।"],
    ],
    mechanic: [
      ["The bike jumps out of gear, or the lever feels notchy or stuck: shift fork or dog wear.", "বাইক গিয়ার থেকে ফসকে যায়, বা লিভার শক্ত বা আটকে আটকে চলে: শিফট ফর্ক বা ডগ ক্ষয়।"],
      ["Loud crunching or clunking on every shift, or it will not find neutral.", "প্রতিবার গিয়ার বদলে জোরে কড়কড় বা ঠক শব্দ, অথবা নিউট্রাল পাওয়া যায় না।"],
      ["Gear oil or engine oil is low or old. Fix that first; oil level and quality matter a lot for smooth shifts.", "ইঞ্জিন অয়েল বা গিয়ার অয়েল কম বা পুরনো। আগে সেটা ঠিক করুন; মসৃণ গিয়ার বদলে অয়েলের পরিমাণ আর মান অনেক বড় ব্যাপার।"],
    ],
  },
  {
    slug: "used-check-carb",
    updated: "2026-10-15",
    minutes: 8,
    title: ["Buying a used carburettor bike: what to check", "সেকেন্ড-হ্যান্ড কার্বুরেটর বাইক কেনার আগে কী দেখবেন"],
    summary: [
      "For air-cooled carburettor bikes such as the Bajaj Pulsar 150, Discover 125, Hero Splendor+, Honda CG125, Honda Livo and TVS Apache RTR 160 2V. Papers first, then the engine, then the frame, plus the carb checks a seller can hide.",
      "Bajaj Pulsar 150, Discover 125, Hero Splendor+, Honda CG125, Honda Livo বা TVS Apache RTR 160 2V-এর মতো এয়ার-কুলড কার্বুরেটর বাইকের জন্য। আগে কাগজ, তারপর ইঞ্জিন, তারপর ফ্রেম, সাথে কার্বুরেটরের সেই চেকগুলো যা বিক্রেতা লুকাতে পারেন।",
    ],
    need: [
      ["A torch, a clean rag, and a friend or mechanic who knows bikes", "একটি টর্চ, পরিষ্কার ন্যাকড়া, আর বাইক বোঝেন এমন বন্ধু বা মেকানিক"],
      ["Your licence and helmet for the test ride", "টেস্ট রাইডের জন্য নিজের লাইসেন্স আর হেলমেট"],
    ],
    steps: [
      ...USED_PAPERS,
      ...USED_ENGINE,
      ["Cold start with the choke: a healthy carb bike starts within a few tries on choke when cold, and idles steadily once you push the choke off after a minute or two. If it only runs with the choke on, or dies as soon as you close the throttle, the carb is dirty or badly tuned.", "চোক দিয়ে ঠান্ডা স্টার্ট: ভালো কার্বুরেটর বাইক ঠান্ডা অবস্থায় চোক দিলে কয়েক চেষ্টাতেই স্টার্ট নেয়, আর এক-দুই মিনিট পর চোক বন্ধ করলেও স্থির আইডলে চলে। শুধু চোক দিয়েই চলে, বা থ্রটল ছাড়লেই বন্ধ হয়ে যায়, মানে কার্বুরেটর ময়লা বা টিউনিং ঠিক নেই।"],
      ["Once warm, blip the throttle. The revs should rise cleanly and fall back to a steady idle. Coughing, popping, a flat spot when you open it, or revs that hang high are carb or air-leak problems.", "গরম হলে থ্রটল ঝাপটা দিন। রেভ পরিষ্কারভাবে উঠে আবার স্থির আইডলে নামা উচিত। কাশির মতো শব্দ, ফটফট আওয়াজ, থ্রটল খুললে ঝিমিয়ে যাওয়া, বা রেভ উঁচুতে আটকে থাকা কার্বুরেটর বা বাতাস লিকের সমস্যা।"],
      ["Look at the carburettor itself: petrol stains or wetness under the float bowl, a strong petrol smell, chewed screw heads or broken paint marks on the adjusting screws (it has been tuned a lot), and a cracked or loose rubber joint between carb and engine. Ask when it was last cleaned, and why.", "কার্বুরেটর নিজে দেখুন: ফ্লোট বোলের নিচে পেট্রোলের দাগ বা ভেজা ভাব, পেট্রোলের কড়া গন্ধ, অ্যাডজাস্টিং স্ক্রুর মাথা ক্ষয়ে যাওয়া বা রঙের দাগ ভাঙা (অনেকবার টিউন করা হয়েছে), আর কার্বুরেটর ও ইঞ্জিনের মাঝের রাবার জয়েন্ট ফাটা বা ঢিলা কি না। শেষ কবে আর কেন পরিষ্কার করা হয়েছে জিজ্ঞেস করুন।"],
      ["Ask your mechanic to pull the spark plug. A light brown tip is healthy. Black and sooty means it runs rich (dirty air filter, wrong tuning or a sticking choke). Wet and oily points to burning oil.", "মেকানিককে বলুন স্পার্ক প্লাগ খুলে দেখাতে। মাথা হালকা বাদামি হলে ভালো। কালো, ঝুলের মতো হলে মিক্সচার রিচ (ময়লা এয়ার ফিল্টার, ভুল টিউনিং বা আটকে থাকা চোক)। ভেজা আর তেলতেলে হলে অয়েল পুড়ছে।"],
      ["The TVS Apache RTR 160 4V is carbureted but oil-cooled: also check its oil cooler, lines and oil level as in the oil-cooled guide. Old two-strokes like the Yamaha RX100 always smoke a little; the smoke test above is for four-strokes.", "TVS Apache RTR 160 4V কার্বুরেটর হলেও অয়েল-কুলড: অয়েল-কুলড গাইডের মতো এর অয়েল কুলার, লাইন আর অয়েল লেভেলও দেখুন। Yamaha RX100-এর মতো পুরনো টু-স্ট্রোক বাইক একটু ধোঁয়া দেবেই; ওপরের ধোঁয়ার পরীক্ষা ফোর-স্ট্রোকের জন্য।"],
      ...USED_CHASSIS,
    ],
    avoid: [
      ...USED_AVOID,
      ["Letting the seller 'just tune it a little' with a screwdriver while you wait. A quick tune can mask a worn carb or an air leak for the length of a test ride.", "আপনি অপেক্ষা করার সময় বিক্রেতাকে স্ক্রুড্রাইভার দিয়ে 'একটু টিউন' করতে দেওয়া। তাড়াহুড়োর টিউনিং টেস্ট রাইডের সময়টুকুর জন্য ক্ষয়ে যাওয়া কার্বুরেটর বা বাতাস লিক ঢেকে দিতে পারে।"],
      ["Accepting 'mileage is low, it just needs tuning'. Poor mileage can also come from a worn engine; check the smoke and the plug first.", "'মাইলেজ কম, একটু টিউন করলেই ঠিক' কথা মেনে নেওয়া। ইঞ্জিন ক্ষয়ে গেলেও মাইলেজ কমে; আগে ধোঁয়া আর প্লাগ দেখুন।"],
    ],
    mechanic: [
      ...USED_MECHANIC,
      ["It will not hold an idle without the choke, even after a carb clean: worn carb parts or an air leak.", "কার্বুরেটর পরিষ্কারের পরও চোক ছাড়া আইডল ধরে রাখে না: কার্বুরেটরের পার্টস ক্ষয় বা বাতাস লিক।"],
    ],
    related: ["used-check-air-cooled-fi", "used-check-oil-cooled-fi", "used-check-liquid-cooled", "spark-plug", "air-filter", "monsoon-riding-and-care"],
  },
  {
    slug: "used-check-air-cooled-fi",
    updated: "2026-10-15",
    minutes: 8,
    title: ["Buying a used air-cooled fuel-injected bike: what to check", "সেকেন্ড-হ্যান্ড এয়ার-কুলড ফুয়েল-ইনজেক্টেড বাইক কেনার আগে কী দেখবেন"],
    summary: [
      "For air-cooled FI bikes such as the Yamaha FZS FI V2 and V4, Fazer FI, Suzuki Gixxer FI ABS and Gixxer SF 155, Honda Hornet 2.0, SP160 and Hero Xtreme 125R. The usual papers and body checks, plus the FI warning light, fuel pump and sensors.",
      "Yamaha FZS FI V2 ও V4, Fazer FI, Suzuki Gixxer FI ABS ও Gixxer SF 155, Honda Hornet 2.0, SP160 বা Hero Xtreme 125R-এর মতো এয়ার-কুলড এফআই বাইকের জন্য। কাগজ আর বডির সাধারণ চেক, সাথে এফআই ওয়ার্নিং লাইট, ফুয়েল পাম্প আর সেন্সর।",
    ],
    need: [
      ["A torch, a clean rag, and a friend or mechanic who knows bikes", "একটি টর্চ, পরিষ্কার ন্যাকড়া, আর বাইক বোঝেন এমন বন্ধু বা মেকানিক"],
      ["Your licence and helmet for the test ride", "টেস্ট রাইডের জন্য নিজের লাইসেন্স আর হেলমেট"],
    ],
    steps: [
      ...USED_PAPERS,
      ["Key on, engine off: the FI warning light (an engine symbol, sometimes marked FI) should come on briefly as a self-check, and you should hear the fuel pump hum for a moment under the tank. If the light never comes on at all, the bulb may have been removed to hide a fault.", "চাবি অন, ইঞ্জিন বন্ধ: এফআই ওয়ার্নিং লাইট (ইঞ্জিনের চিহ্ন, কখনো FI লেখা) নিজে পরীক্ষার জন্য অল্প সময় জ্বলা উচিত, আর ট্যাংকের নিচে ফুয়েল পাম্পের গুনগুন শব্দ এক মুহূর্ত শোনা উচিত। লাইট একেবারেই না জ্বললে হয়তো সমস্যা লুকাতে বাল্বটাই খুলে রাখা হয়েছে।"],
      ...USED_ENGINE,
      ["No choke on FI: it should start on the button within a few seconds even when cold, with a slightly higher idle that settles by itself as it warms. Long cranking, stalling at idle or surging revs point to a dirty throttle body, an idle control fault or a weak fuel pump.", "এফআই-তে চোক নেই: ঠান্ডা অবস্থাতেও বাটন চাপলে কয়েক সেকেন্ডে স্টার্ট নেওয়া উচিত, শুরুতে আইডল একটু উঁচু থেকে গরম হলে নিজেই নেমে আসবে। অনেকক্ষণ ক্র্যাংক করা, আইডলে বন্ধ হয়ে যাওয়া বা রেভ ওঠানামা করা মানে থ্রটল বডি ময়লা, আইডল কন্ট্রোলে সমস্যা বা দুর্বল ফুয়েল পাম্প।"],
      ["After starting, the FI light must go out and stay out for the whole test ride. A light that stays on or flickers means the ECU has stored a fault.", "স্টার্টের পর এফআই লাইট নিভে যেতে হবে আর পুরো টেস্ট রাইডে নেভা থাকতে হবে। লাইট জ্বলে থাকলে বা মিটমিট করলে ইসিইউ-তে কোনো ফল্ট জমা আছে।"],
      ["Ask for a fault code reading at the brand's service centre before you pay; their diagnostic tool reads stored codes quickly. Some models can also show codes on the dash; the owner's manual explains how.", "টাকা দেওয়ার আগে ব্র্যান্ডের সার্ভিস সেন্টারে ফল্ট কোড পড়িয়ে নিন; ওদের ডায়াগনস্টিক যন্ত্রে জমা কোড দ্রুত দেখা যায়। কিছু মডেলে ড্যাশেও কোড দেখানো যায়; কীভাবে, তা ওনার্স ম্যানুয়ালে আছে।"],
      ["Feel for sensor trouble on the ride: jerky throttle at low speed, hesitation when you open it, a temperature reading that never moves, or 'mileage has dropped lately'. Throttle position, oxygen and temperature sensors are common culprits. They are fixable, but price them in.", "রাইডে সেন্সরের সমস্যা টের পান কি না দেখুন: কম গতিতে থ্রটলে ঝাঁকুনি, থ্রটল খুললে দ্বিধা, টেম্পারেচার রিডিং একেবারে না নড়া, বা 'ইদানীং মাইলেজ কমে গেছে'। থ্রটল পজিশন, অক্সিজেন আর টেম্পারেচার সেন্সর প্রায়ই দায়ী। ঠিক করা যায়, তবে খরচটা দামে ধরুন।"],
      ["Look under the seat and around the throttle body and ECU for cut, taped or joined wires, or an add-on box. A bypassed sensor or cheap tuning module can cause faults later. FI also needs steady voltage, so check the battery's age and that it cranks strongly.", "সিটের নিচে আর থ্রটল বডি ও ইসিইউ-র আশপাশে কাটা, টেপ মারা বা জোড়া দেওয়া তার, বা বাড়তি কোনো বক্স আছে কি না দেখুন। বাইপাস করা সেন্সর বা সস্তা টিউনিং মডিউল পরে ঝামেলা করতে পারে। এফআই-র স্থির ভোল্টেজ লাগে, তাই ব্যাটারি কত পুরনো আর ক্র্যাংক জোরালো কি না দেখুন।"],
      ...USED_CHASSIS,
    ],
    avoid: [
      ...USED_AVOID,
      ["Accepting 'the light comes on sometimes, it is nothing'. Get the codes read before you pay.", "'লাইট মাঝে মাঝে জ্বলে, কিছু না' কথা মেনে নেওয়া। টাকা দেওয়ার আগে কোড পড়িয়ে নিন।"],
      ["A short test ride only. Codes cleared just before you arrive can take a while to come back, so ride long enough for the engine to fully warm up.", "শুধু ছোট একটা টেস্ট রাইড। আপনি আসার ঠিক আগে কোড মুছে দিলে আবার ফিরতে সময় লাগে, তাই ইঞ্জিন পুরো গরম হওয়া পর্যন্ত চালান।"],
    ],
    mechanic: [
      ...USED_MECHANIC,
      ["The FI light stays on, or it hesitates or stalls even with a clean air filter and fresh petrol: get a diagnostic check at the service centre.", "এফআই লাইট জ্বলেই থাকে, বা পরিষ্কার এয়ার ফিল্টার আর নতুন পেট্রোলেও থমকে যায় বা বন্ধ হয়: সার্ভিস সেন্টারে ডায়াগনস্টিক চেক করান।"],
    ],
    related: ["used-check-carb", "used-check-oil-cooled-fi", "used-check-liquid-cooled", "battery-and-starting", "air-filter", "monsoon-riding-and-care"],
  },
  {
    slug: "used-check-oil-cooled-fi",
    updated: "2026-10-15",
    minutes: 8,
    title: ["Buying a used oil-cooled fuel-injected bike: what to check", "সেকেন্ড-হ্যান্ড অয়েল-কুলড ফুয়েল-ইনজেক্টেড বাইক কেনার আগে কী দেখবেন"],
    summary: [
      "For oil-cooled FI bikes such as the Bajaj Pulsar N160, NS160 and N250, Suzuki Gixxer 250 and Gixxer SF 250, Hero Thriller 160R 4V, Hero XPulse 200 4V and the Royal Enfield 350s. On these the engine oil also carries heat away, so its level and condition tell you a lot.",
      "Bajaj Pulsar N160, NS160 ও N250, Suzuki Gixxer 250 ও Gixxer SF 250, Hero Thriller 160R 4V, Hero XPulse 200 4V আর Royal Enfield-এর ৩৫০ মডেলগুলোর মতো অয়েল-কুলড এফআই বাইকের জন্য। এগুলোতে ইঞ্জিন অয়েল তাপও সরায়, তাই অয়েলের পরিমাণ আর অবস্থা অনেক কিছু বলে দেয়।",
    ],
    need: [
      ["A torch, a clean rag, and a friend or mechanic who knows bikes", "একটি টর্চ, পরিষ্কার ন্যাকড়া, আর বাইক বোঝেন এমন বন্ধু বা মেকানিক"],
      ["Your licence and helmet for the test ride", "টেস্ট রাইডের জন্য নিজের লাইসেন্স আর হেলমেট"],
    ],
    steps: [
      ...USED_PAPERS,
      ["Before starting, check the oil with the engine cold and the bike upright, in the sight glass or on the dipstick. It should sit between the marks. Low oil on an oil-cooled engine means it has run hotter than it should.", "স্টার্টের আগে, ইঞ্জিন ঠান্ডা আর বাইক সোজা রেখে সাইট গ্লাস বা ডিপস্টিকে অয়েল দেখুন। দুই দাগের মাঝে থাকা উচিত। অয়েল-কুলড ইঞ্জিনে অয়েল কম মানে ইঞ্জিন দরকারের চেয়ে বেশি গরমে চলেছে।"],
      ["Look at the oil colour. Fresh oil is amber and used oil darkens, which is normal. Milky or frothy oil means water got in (flood, or a careless wash); a burnt smell or glittering metal flakes are bad signs. Ask to see the receipt or service-book stamp for the last oil change.", "অয়েলের রং দেখুন। নতুন অয়েল হালকা সোনালি, পুরনো হলে গাঢ় হয়, এটা স্বাভাবিক। দুধের মতো বা ফেনা ওঠা অয়েল মানে পানি ঢুকেছে (বন্যা, বা অসাবধানে ধোয়া); পোড়া গন্ধ বা চিকচিকে ধাতুর কণা খারাপ লক্ষণ। শেষ অয়েল বদলের রসিদ বা সার্ভিস বুকের সিল দেখতে চান।"],
      ["Oil cooler and lines: most of these bikes have a small radiator-like oil cooler at the front, fed by hoses or metal pipes. Look for bent, crushed or mud-packed fins, and run a finger along the lines and joints. Oily wetness, fresh drips under the bike, or one joint wiped suspiciously clean needs an explanation. A dented cooler is also a sign of a fall.", "অয়েল কুলার আর লাইন: এগুলোর বেশির ভাগে সামনে ছোট রেডিয়েটরের মতো একটা অয়েল কুলার থাকে, হোস বা ধাতব পাইপ দিয়ে অয়েল যায়। পাত বাঁকা, থেঁতলানো বা কাদায় বোজা কি না দেখুন, আর লাইন ও জোড়াগুলোয় আঙুল বুলিয়ে দেখুন। তেলতেলে ভাব, বাইকের নিচে নতুন ফোঁটা, বা কোনো একটা জোড়া সন্দেহজনকভাবে ঝকঝকে মোছা থাকলে ব্যাখ্যা চান। টোল খাওয়া কুলার পড়ে যাওয়ারও চিহ্ন।"],
      ...USED_ENGINE,
      ["These bikes are fuel-injected too: the FI light should come on briefly at key-on and go out after starting, the fuel pump should hum for a moment, and it should start without fuss when cold. The air-cooled FI guide has the full list.", "এগুলোও ফুয়েল-ইনজেক্টেড: চাবি অন করলে এফআই লাইট অল্প সময় জ্বলে স্টার্টের পর নিভে যাওয়া উচিত, ফুয়েল পাম্প এক মুহূর্ত গুনগুন করবে, আর ঠান্ডায়ও ঝামেলা ছাড়া স্টার্ট নেবে। পুরো তালিকা এয়ার-কুলড এফআই গাইডে আছে।"],
      ["Heat check after the test ride: let it idle for a few minutes. If it has a temperature gauge or light, it should stay normal. Losing power when hot, a strong hot-oil smell or a warning light points to low oil, the wrong grade or a blocked cooler.", "টেস্ট রাইডের পর তাপ পরীক্ষা: কয়েক মিনিট আইডলে চলতে দিন। টেম্পারেচার গেজ বা লাইট থাকলে স্বাভাবিক থাকা উচিত। গরম হলে টান কমে যাওয়া, গরম অয়েলের কড়া গন্ধ বা ওয়ার্নিং লাইট মানে অয়েল কম, ভুল গ্রেড, বা কুলার বন্ধ হয়ে আছে।"],
      ...USED_CHASSIS,
    ],
    avoid: [
      ...USED_AVOID,
      ["Trusting 'the oil was changed yesterday' with no receipt. Fresh oil can hide milky or metal-laced old oil, so ask why it was changed just before the sale.", "রসিদ ছাড়া 'গতকালই অয়েল বদলেছি' কথায় ভরসা করা। নতুন অয়েল দুধের মতো বা ধাতুর কণা মেশানো পুরনো অয়েল ঢেকে দিতে পারে, তাই বিক্রির ঠিক আগে কেন বদলানো হলো জিজ্ঞেস করুন।"],
      ["Confusing the oil cooler with a radiator. Oil-cooled bikes have no coolant; anyone who says they 'topped up the radiator with water' has done harm.", "অয়েল কুলারকে রেডিয়েটর ভেবে ভুল করা। অয়েল-কুলড বাইকে কুল্যান্ট নেই; কেউ যদি বলেন 'রেডিয়েটরে পানি দিয়েছি', তাহলে ক্ষতিই করেছেন।"],
    ],
    mechanic: [
      ...USED_MECHANIC,
      ["Oil seeping at the cooler or its lines, or the oil level dropping between changes.", "কুলার বা তার লাইনে অয়েল চুইয়ে পড়া, বা দুই অয়েল বদলের মাঝে লেভেল কমে যাওয়া।"],
    ],
    related: ["used-check-carb", "used-check-air-cooled-fi", "used-check-liquid-cooled", "engine-oil", "monsoon-riding-and-care", "after-a-crash-or-breakdown"],
  },
  {
    slug: "used-check-liquid-cooled",
    updated: "2026-10-15",
    minutes: 9,
    title: ["Buying a used liquid-cooled bike: what to check", "সেকেন্ড-হ্যান্ড লিকুইড-কুলড বাইক কেনার আগে কী দেখবেন"],
    summary: [
      "For liquid-cooled bikes such as the Yamaha R15 V3 and V4, MT-15 V2, XSR155 and Aerox 155, Honda CBR150R, Suzuki GSX-R150, KTM Duke 125 and RC 125, and the Hero Karizma XMR 210. A cooling system that was neglected or filled with water is the big extra risk.",
      "Yamaha R15 V3 ও V4, MT-15 V2, XSR155 ও Aerox 155, Honda CBR150R, Suzuki GSX-R150, KTM Duke 125 ও RC 125, আর Hero Karizma XMR 210-এর মতো লিকুইড-কুলড বাইকের জন্য। এখানে বাড়তি বড় ঝুঁকি হলো অযত্নে থাকা বা শুধু পানি ভরা কুলিং সিস্টেম।",
    ],
    need: [
      ["A torch, a clean rag, and a friend or mechanic who knows bikes", "একটি টর্চ, পরিষ্কার ন্যাকড়া, আর বাইক বোঝেন এমন বন্ধু বা মেকানিক"],
      ["Your licence and helmet for the test ride", "টেস্ট রাইডের জন্য নিজের লাইসেন্স আর হেলমেট"],
    ],
    steps: [
      ...USED_PAPERS,
      ["Before starting, with the engine cold: the coolant in the reservoir should sit between the low and full marks. Never open the radiator cap on a warm engine.", "স্টার্টের আগে, ইঞ্জিন ঠান্ডা অবস্থায়: রিজার্ভারে কুল্যান্ট লো আর ফুল দাগের মাঝে থাকা উচিত। গরম ইঞ্জিনে কখনো রেডিয়েটরের ক্যাপ খুলবেন না।"],
      ["Look at the coolant colour. Proper coolant is clear and coloured, often green, blue or pink. Rusty brown, cloudy or plain water are warnings. Many used bikes run on tap water, which leaves scale and lets the inside corrode; mixing different coolant types is not recommended either.", "কুল্যান্টের রং দেখুন। ঠিক কুল্যান্ট স্বচ্ছ আর রঙিন, সাধারণত সবুজ, নীল বা গোলাপি। মরচে-বাদামি, ঘোলা বা শুধু পানি হলে সতর্ক হোন। অনেক সেকেন্ড-হ্যান্ড বাইকে কলের পানি দিয়ে চালানো হয়, এতে ভেতরে আস্তর জমে আর ক্ষয় ধরে; আলাদা ধরনের কুল্যান্ট মেশানোও ঠিক নয়।"],
      ["An oily film or bubbles in the coolant, or milky oil in the sight glass, can mean a failed head gasket letting oil and coolant mix. Steady white smoke with a sweet smell that does not clear once warm points the same way.", "কুল্যান্টে তেলের আস্তর বা বুদবুদ, অথবা সাইট গ্লাসে দুধের মতো অয়েল মানে হতে পারে হেড গ্যাসকেট নষ্ট, অয়েল আর কুল্যান্ট মিশে যাচ্ছে। গরম হওয়ার পরও মিষ্টি গন্ধের সাদা ধোঁয়া একটানা বের হলে একই ইঙ্গিত।"],
      ...USED_ENGINE,
      ["Radiator and hoses: look for bent or blocked fins, leaks or green or white crust at the hose joints and the cap, and hoses that feel hard, cracked or swollen. A replaced or bent radiator on a faired bike like the R15 or RC 125 is also a fall clue.", "রেডিয়েটর আর হোস: পাত বাঁকা বা বন্ধ কি না, হোসের জোড়া আর ক্যাপে লিক বা সবুজ-সাদা আস্তর আছে কি না, আর হোস শক্ত, ফাটা বা ফোলা কি না দেখুন। R15 বা RC 125-এর মতো ফেয়ারিং বাইকে বদলানো বা বাঁকা রেডিয়েটরও পড়ে যাওয়ার চিহ্ন।"],
      ["Water pump: find the small weep hole under the pump on the engine case. Dried coolant trails or drips there mean the pump seal is going.", "ওয়াটার পাম্প: ইঞ্জিন কেসিংয়ে পাম্পের নিচের ছোট ফুটোটা (উইপ হোল) খুঁজুন। সেখানে শুকনো কুল্যান্টের দাগ বা ফোঁটা মানে পাম্পের সিল যাচ্ছে।"],
      ["These bikes are fuel-injected too: the FI light should come on briefly at key-on and go out after starting, and it should start without fuss when cold. The air-cooled FI guide has the full list.", "এগুলোও ফুয়েল-ইনজেক্টেড: চাবি অন করলে এফআই লাইট অল্প সময় জ্বলে স্টার্টের পর নিভে যাওয়া উচিত, আর ঠান্ডায়ও ঝামেলা ছাড়া স্টার্ট নেবে। পুরো তালিকা এয়ার-কুলড এফআই গাইডে আছে।"],
      ["Fan test after the test ride: let it idle until it gets hot. The fan should switch on by itself and the temperature should come back down. If the fan never runs or the temperature light comes on, do not buy until it is fixed.", "টেস্ট রাইডের পর ফ্যান পরীক্ষা: গরম না হওয়া পর্যন্ত আইডলে চলতে দিন। ফ্যান নিজে থেকে চালু হয়ে তাপমাত্রা আবার নামানো উচিত। ফ্যান কখনো না চললে বা টেম্পারেচার লাইট জ্বললে ঠিক না করা পর্যন্ত কিনবেন না।"],
      ["Ask directly whether it has ever overheated. Discoloured exhaust pipes near the engine, cooked hoses and a coolant level that keeps dropping are signs it has.", "সরাসরি জিজ্ঞেস করুন কখনো ওভারহিট হয়েছিল কি না। ইঞ্জিনের কাছে সাইলেন্সার পাইপের রং বদলে যাওয়া, তাপে শক্ত হয়ে যাওয়া হোস আর বারবার কমে যাওয়া কুল্যান্ট লেভেল তারই চিহ্ন।"],
      ...USED_CHASSIS,
    ],
    avoid: [
      ...USED_AVOID,
      ["Believing 'it only has water in the radiator, that is fine here'. Without coolant's corrosion protection the pump and radiator wear faster; plan to flush and refill it properly.", "'রেডিয়েটরে শুধু পানি, এখানে তাতেই চলে' কথায় বিশ্বাস করা। কুল্যান্টের ক্ষয়রোধী সুরক্ষা ছাড়া পাম্প আর রেডিয়েটর দ্রুত নষ্ট হয়; ঠিকভাবে ফ্লাশ করে নতুন কুল্যান্ট ভরানোর হিসাব রাখুন।"],
      ["Checking the coolant only after the seller has warmed the bike up. The level reads differently hot, and you cannot safely open the cap.", "বিক্রেতা বাইক গরম করার পরে কুল্যান্ট দেখা। গরম অবস্থায় লেভেল অন্যরকম দেখায়, আর ক্যাপ খোলাও নিরাপদ নয়।"],
    ],
    mechanic: [
      ...USED_MECHANIC,
      ["Coolant that keeps dropping with no visible leak, or oil in the coolant: get a cooling-system pressure test or head gasket check before you pay, or walk away.", "কোনো লিক চোখে না পড়লেও কুল্যান্ট বারবার কমে যায়, বা কুল্যান্টে অয়েল: টাকা দেওয়ার আগে কুলিং সিস্টেমের প্রেসার টেস্ট বা হেড গ্যাসকেট চেক করান, নয়তো কেনা বাদ দিন।"],
    ],
    related: ["used-check-carb", "used-check-air-cooled-fi", "used-check-oil-cooled-fi", "coolant-and-radiator", "monsoon-riding-and-care", "after-a-crash-or-breakdown"],
  },
];

export const postBySlug = (slug: string) => POSTS.find((p) => p.slug === slug);
