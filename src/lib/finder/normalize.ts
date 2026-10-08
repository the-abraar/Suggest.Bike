import type { Lang } from "./types";

const BN_DIGITS = "০১২৩৪৫৬৭৮৯";

/** Bangla digits to ASCII. */
export function bnDigits(s: string): string {
  return s.replace(/[০-৯]/g, (d) => String(BN_DIGITS.indexOf(d)));
}

// Bangla spellings to Latin tokens. Extend freely. Longer phrases first.
const BN_WORDS: [string, string][] = [
  ["রয়েল এনফিল্ড", "royal enfield"], ["অ্যাপাচি", "apache"], ["এপাচি", "apache"], ["অ্যাপাচে", "apache"],
  ["ইয়ামাহা", "yamaha"], ["ইয়ামাহ", "yamaha"], ["হোন্ডা", "honda"], ["সুজুকি", "suzuki"], ["বাজাজ", "bajaj"],
  ["টিভিএস", "tvs"], ["হিরো", "hero"], ["কেটিএম", "ktm"], ["রানার", "runner"],
  ["পালসার", "pulsar"], ["জিক্সার", "gixxer"], ["ডিসকভার", "discover"], ["প্ল্যাটিনা", "platina"],
  ["প্লাটিনা", "platina"], ["সিবিআর", "cbr"], ["ইউনিকর্ন", "unicorn"], ["হর্নেট", "hornet"], ["শাইন", "shine"],
  ["লিভো", "livo"], ["আরএক্স", "rx"], ["আর এক্স", "rx"], ["আরটিআর", "rtr"], ["এফজেড", "fz"],
  ["এমটি", "mt"], ["আর১৫", "r15"], ["আর ১৫", "r15"], ["সিজি", "cg"], ["সিডি", "cd"], ["সিবি", "cb"],
  ["জিএস", "gs"], ["অ্যাভেঞ্জার", "avenger"], ["ইন্ট্রুডার", "intruder"], ["ক্লাসিক", "classic"],
  ["ডিউক", "duke"], ["ভেস্পা", "vespa"], ["স্কুটার", "scooter"], ["মোটরসাইকেল", "motorcycle"], ["বাইক", "bike"],
];

/** Lowercase, Bangla digits and words to Latin, punctuation to spaces. */
export function normText(s: string): string {
  let t = bnDigits(s).toLowerCase();
  for (const [bn, en] of BN_WORDS) t = t.split(bn).join(` ${en} `);
  return t.replace(/[^\p{L}\p{N}\p{M}]+/gu, " ").replace(/\s+/g, " ").trim();
}

/** "RX 115", "rx115", "আরএক্স ১১৫", "RX-115" all give "rx115". */
export function compactModel(s: string): string {
  return normText(s).replace(/ /g, "");
}

const BRANDS = ["yamaha", "honda", "suzuki", "bajaj", "tvs", "hero", "ktm", "royal enfield", "runner", "kawasaki", "vespa", "lifan", "keeway"];

/** Model tokens that must be present. Brand words are dropped because ads often omit them. */
export function modelTokens(model: string): string[] {
  const n = normText(model);
  const all = n.split(" ").filter(Boolean);
  const toks = all.filter((t) => !BRANDS.includes(t));
  return toks.length ? toks : all;
}

/** Does free text (ad title + description) mention the model? "rx115" and "rx 115" both match. */
export function mentionsModel(text: string, model: string): boolean {
  const hay = normText(text);
  const hayCompact = hay.replace(/ /g, "");
  const toks = modelTokens(model);
  if (!toks.length) return false;
  const joined = toks.join("");
  if (joined.length >= 3) {
    let from = 0;
    for (;;) {
      const i = hayCompact.indexOf(joined, from);
      if (i < 0) break;
      const after = hayCompact[i + joined.length];
      // "rx115" must not match inside "rx1150"
      if (!(/\d$/.test(joined) && after && /\d/.test(after))) return true;
      from = i + 1;
    }
  }
  const words = new Set(hay.split(" "));
  return toks.every((t) => words.has(t));
}

// ---- colours -------------------------------------------------------------
export const COLOURS: Record<string, { en: string; bn: string; words: string[] }> = {
  maroon: { en: "Maroon", bn: "মেরুন", words: ["maroon", "মেরুন", "মেরুণ", "deep red", "dark red", "wine red", "burgundy", "marun"] },
  red: { en: "Red", bn: "লাল", words: ["red", "লাল"] },
  black: { en: "Black", bn: "কালো", words: ["black", "কালো", "kalo"] },
  blue: { en: "Blue", bn: "নীল", words: ["blue", "নীল", "navy"] },
  white: { en: "White", bn: "সাদা", words: ["white", "সাদা"] },
  silver: { en: "Silver / grey", bn: "রুপালি / ধূসর", words: ["silver", "grey", "gray", "রুপালি", "ধূসর", "gunmetal"] },
  green: { en: "Green", bn: "সবুজ", words: ["green", "সবুজ"] },
  yellow: { en: "Yellow", bn: "হলুদ", words: ["yellow", "হলুদ"] },
  orange: { en: "Orange", bn: "কমলা", words: ["orange", "কমলা"] },
};

function hasPhrase(hay: string, phrase: string): boolean {
  return ` ${hay} `.includes(` ${normText(phrase)} `);
}

/** Colour keys mentioned in free text. "deep red" counts as maroon, not as plain red. */
export function coloursIn(text: string): string[] {
  const hay = normText(text);
  const found = Object.entries(COLOURS)
    .filter(([, c]) => c.words.some((w) => hasPhrase(hay, w)))
    .map(([k]) => k);
  if (found.includes("maroon") && found.includes("red")) {
    const stripped = hay.replace(/(deep|dark|wine) red/g, " ");
    if (!hasPhrase(stripped, "red") && !hasPhrase(stripped, "লাল")) return found.filter((k) => k !== "red");
  }
  return found;
}

// ---- districts -----------------------------------------------------------
export const DISTRICTS: Record<string, { en: string; bn: string; words: string[] }> = {
  dhaka: { en: "Dhaka", bn: "ঢাকা", words: ["dhaka", "ঢাকা", "dhanmondi", "mirpur", "uttara", "mohammadpur", "gulshan", "motijheel", "jatrabari", "badda", "savar", "keraniganj"] },
  gazipur: { en: "Gazipur", bn: "গাজীপুর", words: ["gazipur", "গাজীপুর", "tongi"] },
  narayanganj: { en: "Narayanganj", bn: "নারায়ণগঞ্জ", words: ["narayanganj", "নারায়ণগঞ্জ"] },
  chattogram: { en: "Chattogram", bn: "চট্টগ্রাম", words: ["chattogram", "chittagong", "ctg", "চট্টগ্রাম", "চিটাগাং"] },
  cumilla: { en: "Cumilla", bn: "কুমিল্লা", words: ["cumilla", "comilla", "কুমিল্লা"] },
  sylhet: { en: "Sylhet", bn: "সিলেট", words: ["sylhet", "সিলেট"] },
  rajshahi: { en: "Rajshahi", bn: "রাজশাহী", words: ["rajshahi", "রাজশাহী"] },
  bogura: { en: "Bogura", bn: "বগুড়া", words: ["bogura", "bogra", "বগুড়া"] },
  rangpur: { en: "Rangpur", bn: "রংপুর", words: ["rangpur", "রংপুর"] },
  khulna: { en: "Khulna", bn: "খুলনা", words: ["khulna", "খুলনা"] },
  jashore: { en: "Jashore", bn: "যশোর", words: ["jashore", "jessore", "যশোর"] },
  barishal: { en: "Barishal", bn: "বরিশাল", words: ["barishal", "barisal", "বরিশাল"] },
  mymensingh: { en: "Mymensingh", bn: "ময়মনসিংহ", words: ["mymensingh", "ময়মনসিংহ"] },
  "coxs-bazar": { en: "Cox's Bazar", bn: "কক্সবাজার", words: ["coxs bazar", "cox s bazar", "কক্সবাজার"] },
};

/** District keys mentioned in free text. */
export function districtsIn(text: string): string[] {
  const hay = normText(text);
  return Object.entries(DISTRICTS)
    .filter(([, d]) => d.words.some((w) => hasPhrase(hay, w)))
    .map(([k]) => k);
}

// ---- must-haves ----------------------------------------------------------
// "yes" phrases are what a seller writes when the claim holds; "no" phrases contradict it.
export const MUST_HAVES: Record<string, { en: string; bn: string; yes: string[]; no: string[] }> = {
  "original-sleeve": {
    en: "Original cylinder sleeve (not rebored)",
    bn: "আসল সিলিন্ডার স্লিভ (রিবোর করা নয়)",
    yes: ["original sleeve", "std sleeve", "standard bore", "not rebored", "no rebore", "never rebored", "অরিজিনাল স্লিভ", "রিবোর হয়নি", "রিবোর নাই"],
    no: ["rebored", "rebore done", "oversize piston", "রিবোর করা", "রিবোর হয়েছে", "sleeve changed"],
  },
  unmodified: {
    en: "Unmodified, stock condition",
    bn: "কোনো মডিফিকেশন নেই, স্টক অবস্থায়",
    yes: ["unmodified", "stock condition", "all original", "fully original", "completely stock", "মডিফাই নাই", "অরিজিনাল কন্ডিশন"],
    no: ["modified", "custom exhaust", "aftermarket", "modification done", "মডিফাই করা"],
  },
  "single-owner": {
    en: "Single owner",
    bn: "একজন মালিক",
    yes: ["single owner", "one owner", "1st owner", "first owner", "একজন মালিক", "সিঙ্গেল ওনার"],
    no: ["3rd owner", "third owner", "2nd owner", "second owner", "তৃতীয় মালিক", "দ্বিতীয় মালিক"],
  },
  "original-paint": {
    en: "Original paint",
    bn: "আসল রং",
    yes: ["original paint", "orginal paint", "no repaint", "company paint", "অরিজিনাল পেইন্ট", "আসল রং"],
    no: ["repainted", "full repaint", "repaint done", "re paint", "রি পেইন্ট", "আবার রং"],
  },
  "service-history": {
    en: "Service records available",
    bn: "সার্ভিসের রেকর্ড আছে",
    yes: ["service history", "service record", "service book", "সার্ভিস রেকর্ড", "সার্ভিস বুক"],
    no: [],
  },
};

export const PAPERS_YES = ["blue book", "bluebook", "papers clear", "paper clear", "all papers", "tax token", "ব্লু বুক", "ব্লুবুক", "কাগজ ঠিক", "কাগজপত্র ঠিক", "পেপারস ক্লিয়ার"];
export const PAPERS_NO = ["no papers", "without papers", "papers missing", "paper pending", "blue book lost", "কাগজ নাই", "কাগজ নেই", "ব্লু বুক নাই", "ব্লু বুক হারানো"];

export function includesAny(text: string, phrases: string[]): boolean {
  const hay = normText(text);
  return phrases.some((p) => hasPhrase(hay, p));
}

export function label(map: Record<string, { en: string; bn: string }>, key: string, lang: Lang): string {
  const v = map[key];
  return v ? v[lang] : key;
}
