export type Pair = [en: string, bn: string];
export type Post = {
  slug: string;
  updated: string;
  minutes: number;
  title: Pair;
  summary: Pair;
  need?: Pair[];
  steps: Pair[];
  avoid: Pair[];
  mechanic: Pair[];
};

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
    updated: "2026-10-13",
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
      ["Look for a recognised safety certification label inside, such as DOT or ECE. Avoid helmets with no label at all.", "ভেতরে স্বীকৃত সেফটি সার্টিফিকেশনের লেবেল দেখুন, যেমন DOT বা ECE। কোনো লেবেল না থাকলে সেই হেলমেট নেবেন না।"],
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
];

export const postBySlug = (slug: string) => POSTS.find((p) => p.slug === slug);
