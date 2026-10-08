import type { Assessment, Behaviours, Bi, Flag, Green, Listing, Severity, Verdict } from "./types";
import { checkPrice, KM_PER_YEAR, type PriceBike } from "./price";
import { parseListingText, type SignalId } from "./text";

/**
 * Scoring engine. Pure functions, no React, no network.
 * Start at 60 (nothing known = not good, not bad). Green flags add, red flags subtract.
 * Caps: any critical flag -> at most 34 (Skip); two high flags -> at most 44 (Skip); one high flag -> at most 69 (never "Worth").
 * Thresholds: 78+ Worth looking into, 45-77 Look but with caution, below 45 Skip.
 * Every weight is an editorial judgement (approx), not a measured probability.
 */
export const BASE_SCORE = 60;
export const WORTH_AT = 78;
export const CAUTION_AT = 45;

export const EMPTY_BEHAVIOURS: Behaviours = {
  wantsAdvance: false, refusesInspection: false, oddMeeting: false, urgencyPressure: false,
  courierOffer: false, refusesPaperPhoto: false, claimsOwnerButManyAds: false, welcomesInspection: false,
};

export function emptyListing(id: string, label: string): Listing {
  return {
    id, label, platform: "bikroy", link: "", askingBDT: null, bikeId: "", year: null, regYear: null, km: null, owners: null,
    location: "", blueBook: "unknown", nameMatchesSeller: "unknown", taxToken: "unknown", smartCard: "unknown",
    photos: null, stockPhotos: "unknown", postAgeDays: null, reason: "none", sellerAccountMonths: null, otherAds: null,
    behaviours: { ...EMPTY_BEHAVIOURS }, text: "",
  };
}

const fmt = (n: number) => "৳" + Math.round(n).toLocaleString("en-US");

export function assess(l: Listing, bike: PriceBike | null | undefined, o: { nowYear?: number } = {}): Assessment {
  const nowYear = o.nowYear ?? new Date().getFullYear();
  const parsed = parseListingText(l.text, nowYear);
  const sig = new Set<SignalId>(parsed.signals.map((s) => s.id));
  const t = (id: SignalId) => sig.has(id);
  const b = l.behaviours;

  const price = checkPrice(bike, { asking: l.askingBDT, year: l.year, km: l.km, nowYear });
  const age = l.year != null ? Math.max(0, nowYear - l.year) : null;

  const flags: Flag[] = [];
  const greens: Green[] = [];
  const add = (id: string, severity: Severity, points: number, title: Bi, detail: Bi, fromText = false) =>
    flags.push({ id, severity, points, title, detail, fromText });
  const green = (id: string, points: number, title: Bi, detail: Bi) => greens.push({ id, points, title, detail });

  // ---- price ----
  if (price.known && price.deltaPct != null) {
    const pct = Math.round(Math.abs(price.deltaPct));
    if (price.band === "far-below")
      add("price-far-below", "high", 32,
        { en: `Price is ${pct}% under the usual range`, bn: `দাম স্বাভাবিক দামের চেয়ে ${pct}% কম` },
        { en: `Usual for this bike is about ${fmt(price.fairLow)} to ${fmt(price.fairHigh)}. A cut this deep is how scam ads attract clicks. Do not pay anything before you see the bike and the papers.`, bn: `এই বাইকের স্বাভাবিক দাম প্রায় ${fmt(price.fairLow)} থেকে ${fmt(price.fairHigh)}। এত কম দাম স্ক্যাম বিজ্ঞাপনের টোপ হয়। বাইক ও কাগজ না দেখে কোনো টাকা দেবেন না।` });
    else if (price.band === "below")
      add("price-below", "medium", 8,
        { en: `Price is ${pct}% under the usual range`, bn: `দাম স্বাভাবিকের চেয়ে ${pct}% কম` },
        { en: "A good deal is possible, but ask why it is cheap: papers, accident history, engine work.", bn: "ভালো ডিল হতে পারে, তবু কেন সস্তা তা জিজ্ঞেস করুন: কাগজ, দুর্ঘটনা, ইঞ্জিনের কাজ।" });
    else if (price.band === "above")
      add("price-above", "low", 6,
        { en: `Price is ${pct}% over the usual range`, bn: `দাম স্বাভাবিকের চেয়ে ${pct}% বেশি` },
        { en: `Offer near ${fmt(price.fairMid)} (the middle of the usual range).`, bn: `${fmt(price.fairMid)} এর কাছাকাছি (স্বাভাবিক সীমার মাঝামাঝি) দর দিন।` });
    else if (price.band === "far-above")
      add("price-far-above", "medium", 14,
        { en: `Price is ${pct}% over the usual range`, bn: `দাম স্বাভাবিকের চেয়ে ${pct}% বেশি` },
        { en: "Likely overpriced. Compare with other listings of the same model before replying.", bn: "সম্ভবত বেশি চাওয়া হচ্ছে। উত্তর দেওয়ার আগে একই মডেলের অন্য বিজ্ঞাপনের সাথে মিলিয়ে নিন।" });
    else if (price.band === "fair")
      green("price-fair", 10, { en: "Price is in the usual range", bn: "দাম স্বাভাবিক সীমার মধ্যে" },
        { en: `${fmt(price.fairLow)} to ${fmt(price.fairHigh)} is usual for this model, year and km.`, bn: `এই মডেল, সাল ও কিমির জন্য ${fmt(price.fairLow)} থেকে ${fmt(price.fairHigh)} স্বাভাবিক।` });
  }

  // ---- money before seeing ----
  const advance = b.wantsAdvance || t("advance") || t("walletFirst");
  if (advance)
    add("advance", "critical", 40,
      { en: "Asks for money before you see the bike", bn: "বাইক দেখার আগেই টাকা চাইছে" },
      { en: "Advance by bKash, Nagad or bank before you have seen the bike and the papers is the number one scam in online bike sales. Pay only at the transfer, face to face, after checking.", bn: "বাইক ও কাগজ দেখার আগে বিকাশ, নগদ বা ব্যাংকে অগ্রিম দেওয়া অনলাইন বাইক বিক্রির এক নম্বর স্ক্যাম। যাচাইয়ের পর, সামনাসামনি হস্তান্তরের সময়ই টাকা দিন।" },
      !b.wantsAdvance);
  else if (t("wallet"))
    add("wallet-mention", "low", 2,
      { en: "Mobile wallet mentioned in the chat", bn: "চ্যাটে মোবাইল ওয়ালেটের কথা এসেছে" },
      { en: "Fine for the final payment at transfer. Never send anything earlier.", bn: "হস্তান্তরের সময় চূড়ান্ত পেমেন্টে ঠিক আছে। তার আগে কিছু পাঠাবেন না।" }, true);

  // ---- inspection ----
  if (b.refusesInspection || t("refusesInspection"))
    add("refuses-inspection", "critical", 35,
      { en: "Refuses a mechanic check or test ride", bn: "মেকানিক দেখাতে বা টেস্ট রাইড দিতে রাজি নয়" },
      { en: "An honest seller with a good bike has no reason to refuse. Walk away.", bn: "ভালো বাইকের সৎ বিক্রেতার মানা করার কারণ নেই। সরে আসুন।" }, !b.refusesInspection);
  else if (b.welcomesInspection || t("inspectionOk"))
    green("inspection-ok", 10, { en: "Welcomes a mechanic check", bn: "মেকানিক দিয়ে দেখাতে রাজি" },
      { en: "Still do it: take your own mechanic, not the seller's.", bn: "তবু করুন: নিজের মেকানিক নিয়ে যান, বিক্রেতার না।" });

  // ---- papers ----
  const noPaper = l.blueBook === "no" || t("noPaper");
  const processing = !noPaper && (l.blueBook === "processing" || t("paperProcessing"));
  if (noPaper)
    add("no-bluebook", "critical", 40,
      { en: "No blue book / registration papers", bn: "ব্লু বুক / রেজিস্ট্রেশনের কাগজ নেই" },
      { en: "Without the registration papers you cannot transfer ownership at BRTA. The bike may be stolen or have a loan on it. Skip.", bn: "রেজিস্ট্রেশনের কাগজ ছাড়া BRTA-তে মালিকানা বদলানো যায় না। বাইকটি চোরাই বা ঋণযুক্ত হতে পারে। বাদ দিন।" }, l.blueBook !== "no");
  else if (processing)
    add("paper-processing", "high", 28,
      { en: "\"Paper under process\"", bn: "\"পেপার প্রসেসে আছে\"" },
      { en: "Often means there are no papers yet or they are not in the seller's name. Do not pay until you hold the original blue book / DRC.", bn: "প্রায়ই মানে কাগজ এখনও নেই বা বিক্রেতার নামে নেই। আসল ব্লু বুক / DRC হাতে না পাওয়া পর্যন্ত টাকা দেবেন না।" }, l.blueBook !== "processing");
  else if (l.blueBook === "yes")
    green("bluebook", 7, { en: "Blue book / DRC available", bn: "ব্লু বুক / DRC আছে" },
      { en: "Still check that it matches the bike (see questions) and look it up on the BRTA portal.", bn: "তবু বাইকের সাথে মিলছে কিনা দেখুন (প্রশ্ন দেখুন) ও BRTA পোর্টালে যাচাই করুন।" });
  else if (t("papersOk"))
    green("papers-claimed", 3, { en: "Seller says the papers are fine", bn: "বিক্রেতা বলছে কাগজ ঠিক আছে" },
      { en: "Only a claim so far. Ask for a photo of the papers.", bn: "এখনও শুধু মুখের কথা। কাগজের ছবি চান।" });

  if (l.nameMatchesSeller === "no")
    add("name-mismatch", "high", 25,
      { en: "Seller is not the name on the papers", bn: "কাগজের নাম আর বিক্রেতা আলাদা" },
      { en: "The name on the blue book / DRC must match the seller's NID. Otherwise insist on transfer from the registered owner.", bn: "ব্লু বুক / DRC-র নাম বিক্রেতার NID-র সাথে মিলতে হবে। না মিললে নিবন্ধিত মালিকের কাছ থেকেই হস্তান্তর চাই।" });
  else if (l.nameMatchesSeller === "yes")
    green("name-match", 5, { en: "Seller's name matches the papers", bn: "বিক্রেতার নাম কাগজের সাথে মেলে" }, { en: "Compare against the NID in person.", bn: "সামনাসামনি NID-র সাথে মেলান।" });

  if (b.refusesPaperPhoto || t("refusesPaperPhoto"))
    add("refuses-paper-photo", "high", 18,
      { en: "Will not send a photo of the papers", bn: "কাগজের ছবি পাঠাতে রাজি নয়" },
      { en: "A photo of the papers costs the seller nothing. Hiding them is a bad sign.", bn: "কাগজের ছবি পাঠাতে বিক্রেতার কিছু খরচ নেই। লুকানো খারাপ লক্ষণ।" }, !b.refusesPaperPhoto);

  if (l.taxToken === "no")
    add("tax-none", "medium", 8, { en: "No tax token", bn: "ট্যাক্স টোকেন নেই" },
      { en: "Unpaid years become your bill. Look up the dues on the BRTA portal and subtract from the price.", bn: "বকেয়া বছরের টাকা আপনার ঘাড়ে আসবে। BRTA পোর্টালে বকেয়া দেখে দাম থেকে বাদ দিন।" });
  else if (l.taxToken === "expired")
    add("tax-expired", "low", 4, { en: "Tax token expired", bn: "ট্যাক্স টোকেনের মেয়াদ শেষ" },
      { en: "Ask the seller to renew it, or take the dues off the price.", bn: "বিক্রেতাকে নবায়ন করতে বলুন বা দাম থেকে বকেয়া বাদ দিন।" });
  else if (l.taxToken === "valid")
    green("tax-valid", 3, { en: "Tax token is valid", bn: "ট্যাক্স টোকেন বৈধ" }, { en: "Check the expiry date on the token.", bn: "টোকেনের মেয়াদ দেখে নিন।" });
  if (l.smartCard === "yes")
    green("smartcard", 2, { en: "Smart card (digital registration)", bn: "স্মার্ট কার্ড (ডিজিটাল রেজিস্ট্রেশন)" }, { en: "Easier to look up on the BRTA portal.", bn: "BRTA পোর্টালে যাচাই করা সহজ।" });
  else if (l.smartCard === "no" && l.blueBook === "yes")
    add("no-smartcard", "low", 2, { en: "Old paper blue book, no smart card", bn: "পুরনো কাগজের ব্লু বুক, স্মার্ট কার্ড নেই" },
      { en: "Not a problem by itself. Ask how the bike is recorded with BRTA and check the dues on the portal.", bn: "এটা নিজে সমস্যা নয়। BRTA-তে বাইকটি কীভাবে নথিভুক্ত জিজ্ঞেস করুন ও পোর্টালে বকেয়া দেখুন।" });

  // ---- year / km ----
  if (l.year != null && l.regYear != null && Math.abs(l.regYear - l.year) >= 2)
    add("year-mismatch", "high", 15,
      { en: `Model year ${l.year} but papers say ${l.regYear}`, bn: `মডেল সাল ${l.year}, কিন্তু কাগজে ${l.regYear}` },
      { en: "A gap of two or more years can mean the bike is older than advertised or the papers belong to another bike. Compare chassis and engine numbers.", bn: "দুই বা তার বেশি বছরের ফারাক মানে বাইক বিজ্ঞাপনের চেয়ে পুরনো বা কাগজ অন্য বাইকের হতে পারে। চেসিস ও ইঞ্জিন নম্বর মেলান।" });
  if (age != null && age >= 2 && l.km != null) {
    const perYear = l.km / age;
    if (perYear < 1500)
      add("km-low", "medium", 10,
        { en: `Only ${Math.round(perYear).toLocaleString("en-US")} km a year`, bn: `বছরে মাত্র ${Math.round(perYear).toLocaleString("en-US")} কিমি` },
        { en: `Usual use is roughly ${KM_PER_YEAR.toLocaleString("en-US")} km a year (approx). A very low number can mean the meter was wound back. Check footpegs, grips, seat, chain and sprockets for wear that does not match.`, bn: `সাধারণ ব্যবহার বছরে প্রায় ${KM_PER_YEAR.toLocaleString("en-US")} কিমি (আনুমানিক)। অতি কম সংখ্যা মানে মিটার পিছিয়ে দেওয়া হতে পারে। ফুটপেগ, গ্রিপ, সিট, চেইন ও স্প্রকেটের ক্ষয় মিলছে কিনা দেখুন।` });
    else if (perYear >= 2000 && perYear <= 15000)
      green("km-plausible", 3, { en: "Km fits the age", bn: "কিমি বয়সের সাথে মেলে" }, { en: "Still check wear on pedals, grips and chain.", bn: "তবু প্যাডেল, গ্রিপ ও চেইনের ক্ষয় দেখুন।" });
  }
  if (parsed.km != null && l.km != null && Math.abs(parsed.km - l.km) / Math.max(l.km, 1) > 0.25)
    add("km-differs", "medium", 8,
      { en: `Chat says ${parsed.km.toLocaleString("en-US")} km, post says ${l.km.toLocaleString("en-US")} km`, bn: `চ্যাটে ${parsed.km.toLocaleString("en-US")} কিমি, পোস্টে ${l.km.toLocaleString("en-US")} কিমি` },
      { en: "Numbers that change between ad and chat are a warning sign. Ask the seller to explain.", bn: "বিজ্ঞাপন ও চ্যাটে সংখ্যা বদলালে সতর্ক হন। বিক্রেতাকে ব্যাখ্যা করতে বলুন।" }, true);
  if (parsed.price != null && l.askingBDT != null && Math.abs(parsed.price - l.askingBDT) / l.askingBDT > 0.1)
    add("price-differs", "medium", 10,
      { en: `Chat says ${fmt(parsed.price)}, post says ${fmt(l.askingBDT)}`, bn: `চ্যাটে ${fmt(parsed.price)}, পোস্টে ${fmt(l.askingBDT)}` },
      { en: "A price that moves between ad and chat can be bait-and-switch, or the parser read the wrong number. Check the chat yourself.", bn: "বিজ্ঞাপন ও চ্যাটে দাম বদলালে টোপ-বদল হতে পারে, বা পার্সার ভুল সংখ্যা ধরেছে। চ্যাট নিজে দেখুন।" }, true);
  if (l.owners != null && l.owners >= 4)
    add("owners-many", "medium", 6, { en: `${l.owners} owners so far`, bn: `এ পর্যন্ত ${l.owners} জন মালিক` }, { en: "Many hands usually means more wear and more paperwork risk.", bn: "অনেক হাত বদল মানে সাধারণত বেশি ক্ষয় ও কাগজের ঝুঁকি।" });
  else if (l.owners != null && l.owners === 3)
    add("owners-3", "low", 3, { en: "Third owner", bn: "তৃতীয় মালিক" }, { en: "Ask for the history of each transfer.", bn: "প্রতিটি হস্তান্তরের ইতিহাস জিজ্ঞেস করুন।" });
  else if (l.owners != null && l.owners >= 1 && l.owners <= 2)
    green("owners-few", 3, { en: l.owners === 1 ? "Single owner" : "Two owners", bn: l.owners === 1 ? "এক মালিক" : "দুই মালিক" }, { en: "Fewer hands, usually easier paperwork.", bn: "কম হাত বদল, সাধারণত কাগজ সহজ।" });

  // ---- photos ----
  if (l.stockPhotos === "yes")
    add("stock-photos", "high", 22, { en: "Photos look like stock or internet pictures", bn: "ছবিগুলো ইন্টারনেট বা স্টক ছবির মতো" },
      { en: "Ask for a live photo with today's date written on paper beside the bike and the number plate. Try a reverse image search.", bn: "আজকের তারিখ কাগজে লিখে বাইক ও নম্বর প্লেটের পাশে রেখে তোলা ছবি চান। রিভার্স ইমেজ সার্চ করে দেখুন।" });
  if (l.photos === 0 || t("noPhotos"))
    add("no-photos", "medium", 10, { en: "No photos", bn: "কোনো ছবি নেই" },
      { en: "A real seller can take photos in two minutes.", bn: "আসল বিক্রেতা দুই মিনিটে ছবি তুলতে পারেন।" }, l.photos !== 0);
  else if (l.photos != null && l.photos <= 2 && l.stockPhotos !== "yes")
    add("few-photos", "low", 4, { en: `Only ${l.photos} photo${l.photos === 1 ? "" : "s"}`, bn: `মাত্র ${l.photos}টি ছবি` }, { en: "Ask for photos of the engine, odometer, tyres and both sides.", bn: "ইঞ্জিন, ওডোমিটার, টায়ার ও দুই পাশের ছবি চান।" });
  else if (l.photos != null && l.photos >= 5 && l.stockPhotos !== "yes")
    green("photos-good", l.stockPhotos === "no" ? 5 : 3, { en: `${l.photos} photos${l.stockPhotos === "no" ? ", look original" : ""}`, bn: `${l.photos}টি ছবি${l.stockPhotos === "no" ? ", আসল মনে হচ্ছে" : ""}` },
      { en: "More photos means more to check.", bn: "বেশি ছবি মানে যাচাইয়ের বেশি সুযোগ।" });

  // ---- pressure and logistics ----
  if (b.urgencyPressure || t("urgent"))
    add("urgency", "medium", 10, { en: "Pushes you to hurry", bn: "তাড়াহুড়ো করাচ্ছে" },
      { en: "\"Other buyers are coming\" and \"today only\" are used to stop you checking. A good bike will still be there tomorrow.", bn: "\"অন্য ক্রেতা আসছে\", \"আজই\" - এসব আপনাকে যাচাই করতে না দেওয়ার কৌশল। ভালো বাইক আগামীকালও থাকবে।" }, !b.urgencyPressure);
  if (b.courierOffer || t("courier"))
    add("courier", "high", 20, { en: "Offers courier or delivery to another city", bn: "কুরিয়ার বা অন্য শহরে ডেলিভারির প্রস্তাব" },
      { en: "You cannot inspect a bike you only receive after paying. Buy only a bike you have seen and ridden.", bn: "টাকা দেওয়ার পর যে বাইক হাতে পান তা যাচাই করা যায় না। দেখে ও চালিয়ে দেখা বাইকই কিনুন।" }, !b.courierOffer);
  if (b.oddMeeting || t("oddMeeting"))
    add("odd-meeting", "high", 15, { en: "Wants to meet at night or in an empty place", bn: "রাতে বা ফাঁকা জায়গায় দেখা করতে চায়" },
      { en: "Meet in daylight, at a busy place or a mechanic's garage, with a friend.", bn: "দিনের আলোয়, ব্যস্ত জায়গায় বা মেকানিকের গ্যারেজে, বন্ধু নিয়ে দেখা করুন।" }, !b.oddMeeting);
  if (l.reason === "gov-transfer" || t("govTransfer"))
    add("gov-story", "medium", 10, { en: "\"Army / police transfer, selling cheap\" story", bn: "\"সেনা / পুলিশ বদলি, তাই সস্তায় বিক্রি\" গল্প" },
      { en: "A well-known script used in fake ads. It can be true, so verify the seller and papers the same way as for anyone else.", bn: "ভুয়া বিজ্ঞাপনে বহুল ব্যবহৃত গল্প। সত্যিও হতে পারে, তাই অন্য সবার মতোই বিক্রেতা ও কাগজ যাচাই করুন।" }, l.reason !== "gov-transfer");

  // ---- seller profile ----
  const manyAds = l.otherAds != null && l.otherAds >= 3;
  if ((manyAds && (b.claimsOwnerButManyAds || t("claimsOwner"))) || (b.claimsOwnerButManyAds && l.otherAds == null))
    add("dealer-as-owner", "medium", 12, { en: "Says \"owner\" but looks like a dealer", bn: "নিজেকে মালিক বলছে, কিন্তু ডিলারের মতো" },
      { en: "Many ads plus \"personal use\" does not add up. The bike may be in a previous owner's name. Ask whose name is on the papers.", bn: "অনেক বিজ্ঞাপন আর \"নিজের ব্যবহার\" মেলে না। বাইক আগের মালিকের নামে থাকতে পারে। কাগজে কার নাম জিজ্ঞেস করুন।" });
  else if (manyAds || t("dealer"))
    add("dealer", "low", 3, { en: "Probably a dealer or reseller", bn: "সম্ভবত ডিলার বা রিসেলার" },
      { en: "Not bad by itself. Expect a margin in the price, and check that the papers are not in a third person's name.", bn: "এটা নিজে খারাপ নয়। দামে মুনাফা থাকবে ধরুন, আর কাগজ তৃতীয় কারও নামে কিনা দেখুন।" });
  if (l.sellerAccountMonths != null && l.sellerAccountMonths < 1)
    add("new-account", "medium", 8, { en: "Seller account is under a month old", bn: "বিক্রেতার অ্যাকাউন্ট এক মাসেরও কম পুরনো" }, { en: "New accounts are common among scam ads. Do not rely on the profile.", bn: "স্ক্যাম বিজ্ঞাপনে নতুন অ্যাকাউন্ট সাধারণ। প্রোফাইলের ওপর ভরসা করবেন না।" });
  else if (l.sellerAccountMonths != null && l.sellerAccountMonths < 3)
    add("young-account", "low", 3, { en: "Seller account is under 3 months old", bn: "বিক্রেতার অ্যাকাউন্ট ৩ মাসের কম পুরনো" }, { en: "Weak signal. Judge by the papers and the meeting.", bn: "দুর্বল সংকেত। কাগজ ও দেখা করে বিচার করুন।" });
  else if (l.sellerAccountMonths != null && l.sellerAccountMonths >= 12)
    green("account-old", 3, { en: "Seller account is a year or older", bn: "বিক্রেতার অ্যাকাউন্ট এক বছর বা তার বেশি পুরনো" }, { en: "A weak positive: accounts can be sold or hacked.", bn: "দুর্বল ইতিবাচক: অ্যাকাউন্ট বিক্রি বা হ্যাক হতে পারে।" });
  if (["upgrading", "abroad", "not-using", "study"].includes(l.reason))
    green("reason-ok", 2, { en: "Believable reason for selling", bn: "বিক্রির বিশ্বাসযোগ্য কারণ" }, { en: "Ask a follow-up question to see whether the story holds.", bn: "গল্প টিকে কিনা দেখতে একটি ফলো-আপ প্রশ্ন করুন।" });
  if (l.postAgeDays != null && l.postAgeDays > 60)
    add("old-post", "low", 0, { en: `Listed for ${l.postAgeDays} days`, bn: `${l.postAgeDays} দিন ধরে বিজ্ঞাপন আছে` }, { en: "Long-listed bikes often sell below the asking price. Room to negotiate.", bn: "অনেকদিনের বিজ্ঞাপনের বাইক চাওয়া দামের নিচে বিক্রি হয়। দর কষাকষির সুযোগ।" });

  // ---- score ----
  const sev = (s: Severity) => flags.filter((f) => f.severity === s).length;
  const down = flags.reduce((n, f) => n + f.points, 0);
  const up = greens.reduce((n, g) => n + g.points, 0);
  let score = BASE_SCORE + up - down;
  const critical = sev("critical");
  const highs = critical + sev("high");
  let capNote: Bi | null = null;
  if (critical >= 1) { score = Math.min(score, 34); capNote = { en: "A deal-breaker flag caps the score: never continue while it is unresolved.", bn: "একটি ডিল-ব্রেকার ফ্ল্যাগ স্কোর সীমিত করে: সমাধান না হলে এগোবেন না।" }; }
  else if (highs >= 2) { score = Math.min(score, 44); capNote = { en: "Two serious flags together cap the score.", bn: "দুটি গুরুতর ফ্ল্যাগ একসাথে স্কোর সীমিত করে।" }; }
  else if (highs === 1) { score = Math.min(score, WORTH_AT - 3); capNote = { en: "One serious flag means this cannot be \"worth looking into\" until it is cleared.", bn: "একটি গুরুতর ফ্ল্যাগ থাকলে তা না মেটা পর্যন্ত \"দেখার যোগ্য\" হতে পারে না।" }; }
  score = Math.max(0, Math.min(100, Math.round(score)));
  const verdict: Verdict = score >= WORTH_AT ? "worth" : score >= CAUTION_AT ? "caution" : "skip";

  flags.sort((a, b) => b.points - a.points);
  greens.sort((a, b) => b.points - a.points);

  // ---- reasons ----
  const reasons: Bi[] = [];
  if (price.known && price.band !== "unknown") reasons.push(price.note);
  for (const f of flags.filter((f) => f.severity === "critical" || f.severity === "high").slice(0, 2)) reasons.push({ en: f.title.en + ".", bn: f.title.bn + "।" });
  if (capNote) reasons.push(capNote);
  if (!flags.some((f) => f.points >= 8) && greens.length) {
    reasons.push({ en: `${greens.length} good sign${greens.length === 1 ? "" : "s"} and no major red flag so far.`, bn: `${greens.length}টি ভালো লক্ষণ, এখন পর্যন্ত বড় কোনো লাল সংকেত নেই।` });
  }

  // ---- missing / confidence ----
  const missing: Bi[] = [];
  if (!bike) missing.push({ en: "Bike model", bn: "বাইকের মডেল" });
  if (l.askingBDT == null) missing.push({ en: "Asking price", bn: "চাওয়া দাম" });
  if (l.year == null) missing.push({ en: "Year", bn: "সাল" });
  if (l.km == null) missing.push({ en: "Km on the meter", bn: "মিটারের কিমি" });
  if (l.blueBook === "unknown" && !t("noPaper") && !t("paperProcessing") && !t("papersOk")) missing.push({ en: "Blue book status", bn: "ব্লু বুকের অবস্থা" });
  if (l.photos == null) missing.push({ en: "Number of photos", bn: "ছবির সংখ্যা" });
  const confidence = missing.length >= 4 ? "low" : missing.length >= 2 ? "medium" : "high";

  return { score, verdict, price, flags, greens, reasons, textSignals: parsed.signals.map((s) => s.id), missing, confidence };
}
