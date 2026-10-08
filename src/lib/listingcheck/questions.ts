import type { Assessment, Listing, Question } from "./types";

/** The only fields we read from the full bike record. Nothing here is invented: the model-specific questions quote these editorial fields as they are. */
export interface BikeNotes {
  quirks?: string;
  mechanicNote?: string;
  bn?: { quirks?: string; mechanicNote?: string };
}

const Q = (id: string, priority: 1 | 2 | 3, en: string, bn: string, whyEn?: string, whyBn?: string, source: Question["source"] = "general"): Question => ({
  id, priority, source, text: { en, bn }, why: whyEn ? { en: whyEn, bn: whyBn ?? whyEn } : undefined,
});

export function buildQuestions(l: Listing, a: Assessment, notes?: BikeNotes | null): Question[] {
  const qs: Question[] = [];
  const has = (id: string) => a.flags.some((f) => f.id === id);

  // Gaps first: ask for what you do not know yet.
  if (l.blueBook !== "yes")
    qs.push(Q("gap-bluebook", 1, "Can you send a clear photo of the blue book / DRC (all pages)?", "ব্লু বুক / DRC-র (সব পাতার) একটি পরিষ্কার ছবি পাঠাতে পারবেন?", "No papers, no transfer.", "কাগজ না থাকলে হস্তান্তর হবে না।", "gap"));
  if (l.nameMatchesSeller !== "yes")
    qs.push(Q("gap-name", 1, "Whose name is on the papers? Will that person be present for the BRTA transfer?", "কাগজে কার নাম? BRTA হস্তান্তরের সময় সেই ব্যক্তি থাকবেন?", "The registered owner must sign the transfer.", "নিবন্ধিত মালিককেই হস্তান্তরে সই করতে হয়।", "gap"));
  if (l.taxToken === "unknown" || l.taxToken === "expired" || l.taxToken === "no")
    qs.push(Q("gap-tax", 2, "Until when is the tax token paid? Any dues pending?", "ট্যাক্স টোকেন কবে পর্যন্ত পরিশোধ? কোনো বকেয়া আছে?", undefined, undefined, "gap"));
  if (l.km == null) qs.push(Q("gap-km", 2, "Can you send a photo of the odometer?", "ওডোমিটারের ছবি পাঠাতে পারবেন?", undefined, undefined, "gap"));
  if (l.photos == null || l.photos < 5 || l.stockPhotos === "yes")
    qs.push(Q("gap-photos", 2, "Can you send fresh photos: both sides, engine, tyres, meter, number plate?", "নতুন ছবি পাঠাতে পারবেন: দুই পাশ, ইঞ্জিন, টায়ার, মিটার, নম্বর প্লেট?", undefined, undefined, "gap"));
  if (l.owners == null) qs.push(Q("gap-owners", 3, "How many owners has it had, and since when have you owned it?", "এ পর্যন্ত কতজন মালিক ছিলেন, আপনি কতদিন ধরে চালাচ্ছেন?", undefined, undefined, "gap"));

  // Flag-driven
  if (has("advance")) qs.push(Q("fl-advance", 1, "I will pay only in person at the BRTA transfer, after checking. Is that fine?", "আমি BRTA-তে হস্তান্তরের সময় সামনাসামনি, যাচাইয়ের পর টাকা দেব। ঠিক আছে?", "A real seller agrees. Anyone who insists on advance is a stop sign.", "আসল বিক্রেতা রাজি হবেন। অগ্রিমে জোর দিলে থামুন।"));
  if (has("price-far-below") || has("price-below")) qs.push(Q("fl-cheap", 1, "Why is the price lower than similar bikes? Any accident, engine work, or paper problem?", "একই রকম বাইকের চেয়ে দাম কম কেন? দুর্ঘটনা, ইঞ্জিনের কাজ বা কাগজের সমস্যা আছে?"));
  if (has("stock-photos")) qs.push(Q("fl-photo", 1, "Please send a photo of the bike with today's date on a paper beside the number plate.", "আজকের তারিখ লেখা কাগজ নম্বর প্লেটের পাশে রেখে বাইকের ছবি পাঠান।"));
  if (has("km-low")) qs.push(Q("fl-km", 2, "Do you have service records or invoices that show the km over time?", "সময়ের সাথে কিমি দেখায় এমন সার্ভিসের রেকর্ড বা রসিদ আছে?"));
  if (has("year-mismatch")) qs.push(Q("fl-year", 1, "Why does the year in the ad differ from the papers? Can I compare chassis and engine numbers with the papers?", "বিজ্ঞাপনের সাল কাগজের সাথে মেলে না কেন? চেসিস ও ইঞ্জিন নম্বর কাগজের সাথে মেলাতে পারি?"));
  if (has("dealer") || has("dealer-as-owner")) qs.push(Q("fl-dealer", 2, "Are you the owner or a reseller? Is the bike in your name?", "আপনি কি মালিক না রিসেলার? বাইক কি আপনার নামে?"));
  if (has("courier")) qs.push(Q("fl-courier", 1, "I will only buy after seeing and test riding the bike. Can we meet in person?", "বাইক দেখে ও চালিয়ে তবেই কিনব। সামনাসামনি দেখা করা যাবে?"));

  // Always useful
  qs.push(Q("g-inspect", 1, "Can I bring my own mechanic to check the bike and take a test ride?", "আমার নিজের মেকানিক নিয়ে এসে বাইক চেক করতে ও টেস্ট রাইড দিতে পারি?"));
  qs.push(Q("g-nums", 1, "Can we compare the chassis and engine numbers with the papers, and look up the dues on the BRTA portal?", "চেসিস ও ইঞ্জিন নম্বর কাগজের সাথে মেলাতে ও BRTA পোর্টালে বকেয়া দেখতে পারি?", "From the used-bike checklist on this site.", "এই সাইটের পুরনো বাইক চেকলিস্ট থেকে।"));
  qs.push(Q("g-accident", 2, "Has it ever had an accident, fallen in flood water, or had the engine opened?", "কখনও দুর্ঘটনা, বন্যার পানিতে ডোবা বা ইঞ্জিন খোলা হয়েছে?"));
  qs.push(Q("g-service", 2, "Who serviced it, when was the last service, and is there a service book?", "কে সার্ভিস করেছে, শেষ সার্ভিস কবে, সার্ভিস বুক আছে?"));
  if (l.reason === "none") qs.push(Q("g-reason", 3, "Why are you selling it?", "কেন বিক্রি করছেন?"));
  qs.push(Q("g-loan", 3, "Is there any bank loan or lease on it? Can you show a clearance letter if so?", "কোনো ব্যাংক ঋণ বা লিজ আছে? থাকলে ক্লিয়ারেন্স চিঠি দেখাতে পারবেন?", "BRTA will not transfer a bike under a hire-purchase entry without the lender's letter.", "ঋণদাতার চিঠি ছাড়া হায়ার-পারচেজ থাকলে BRTA হস্তান্তর করে না।"));

  // Model-specific: quote our own editorial fields, never invent.
  if (notes?.quirks) {
    qs.push({
      id: "m-quirks", priority: 2, source: "model",
      text: {
        en: `Owners report for this model: "${notes.quirks}" Has this bike shown any of it, and what was repaired?`,
        bn: `এই মডেলে মালিকদের অভিযোগ: "${notes.bn?.quirks ?? notes.quirks}" এই বাইকে এর কোনোটি দেখা গেছে? কী মেরামত হয়েছে?`,
      },
      why: { en: "From our editorial notes on this model.", bn: "এই মডেল নিয়ে আমাদের সম্পাদকীয় নোট থেকে।" },
    });
  }
  if (notes?.mechanicNote) {
    qs.push({
      id: "m-mech", priority: 3, source: "model",
      text: {
        en: `Servicing note for this model: "${notes.mechanicNote}" Who has been servicing this bike?`,
        bn: `এই মডেলের সার্ভিস নোট: "${notes.bn?.mechanicNote ?? notes.mechanicNote}" এই বাইক কে সার্ভিস করেছে?`,
      },
      why: { en: "From our editorial notes on this model.", bn: "এই মডেল নিয়ে আমাদের সম্পাদকীয় নোট থেকে।" },
    });
  }

  const seen = new Set<string>();
  return qs.filter((q) => !seen.has(q.id) && seen.add(q.id)).sort((x, y) => x.priority - y.priority);
}
