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
];

export const postBySlug = (slug: string) => POSTS.find((p) => p.slug === slug);
