import type { Assessment, Listing, Verdict } from "./types";

export const VERDICT_LABEL: Record<Verdict, { en: string; bn: string }> = {
  worth: { en: "Worth looking into", bn: "দেখার যোগ্য" },
  caution: { en: "Look, but with caution", bn: "দেখুন, তবে সতর্কতার সাথে" },
  skip: { en: "Skip", bn: "বাদ দিন" },
};

const PLATFORM: Record<Listing["platform"], string> = {
  bikroy: "Bikroy", "fb-marketplace": "Facebook Marketplace", "fb-group": "Facebook group", showroom: "Showroom", friend: "Friend / known person", other: "Other",
};
export const platformName = (p: Listing["platform"]) => PLATFORM[p];

const tk = (n: number) => "Tk " + Math.round(n).toLocaleString("en-US");

/** Plain text for sending to a friend (Messenger / WhatsApp). */
export function summaryText(l: Listing, a: Assessment, bikeName: string, lang: "en" | "bn", siteUrl: string): string {
  const L = (en: string, bn: string) => (lang === "bn" ? bn : en);
  const lines: string[] = [];
  lines.push(L(`Listing check: ${bikeName || "bike"} (${platformName(l.platform)})`, `লিস্টিং চেক: ${bikeName || "বাইক"} (${platformName(l.platform)})`));
  lines.push(L(`Verdict: ${VERDICT_LABEL[a.verdict].en} (${a.score}/100)`, `ফলাফল: ${VERDICT_LABEL[a.verdict].bn} (${a.score}/১০০)`));
  if (l.askingBDT != null) {
    let p = L(`Asking ${tk(l.askingBDT)}`, `চাওয়া দাম ${tk(l.askingBDT)}`);
    if (a.price.known) p += L(`; usual range ${tk(a.price.fairLow)} to ${tk(a.price.fairHigh)} (approx)`, `; স্বাভাবিক সীমা ${tk(a.price.fairLow)} থেকে ${tk(a.price.fairHigh)} (আনুমানিক)`);
    lines.push(p);
  }
  const facts = [l.year ? String(l.year) : "", l.km != null ? `${l.km.toLocaleString("en-US")} km` : "", l.location].filter(Boolean).join(", ");
  if (facts) lines.push(facts);
  const red = a.flags.filter((f) => f.points > 0).slice(0, 5);
  if (red.length) {
    lines.push(L("Red flags:", "লাল সংকেত:"));
    red.forEach((f) => lines.push("- " + (lang === "bn" ? f.title.bn : f.title.en)));
  }
  const gr = a.greens.slice(0, 4);
  if (gr.length) {
    lines.push(L("Good signs:", "ভালো লক্ষণ:"));
    gr.forEach((g) => lines.push("+ " + (lang === "bn" ? g.title.bn : g.title.en)));
  }
  lines.push(L("Rule-based guide, not a guarantee. Inspect in person and never pay in advance.", "নিয়মভিত্তিক গাইড, নিশ্চয়তা নয়। নিজে দেখুন, অগ্রিম টাকা দেবেন না।"));
  lines.push(`${siteUrl}/labs/listing-check/`);
  return lines.join("\n");
}

export function scamReportMailto(email: string, l: Listing, a: Assessment, bikeName: string): string {
  const subject = `Scam listing report: ${bikeName || "bike"} on ${platformName(l.platform)}`;
  const body = [
    "Hello,",
    "",
    "I want to report a possible scam listing.",
    "",
    `Platform: ${platformName(l.platform)}`,
    `Link / ad ID: ${l.link || "(add it here)"}`,
    `Bike: ${bikeName || "(unknown)"}`,
    `Asking price: ${l.askingBDT != null ? tk(l.askingBDT) : "(unknown)"}`,
    `Location: ${l.location || "(unknown)"}`,
    `Suggest.Bike listing check: ${VERDICT_LABEL[a.verdict].en}, ${a.score}/100`,
    "Red flags noticed:",
    ...(a.flags.filter((f) => f.points > 0).slice(0, 8).map((f) => `- ${f.title.en}`)),
    "",
    "What happened (add details, screenshots of the chat):",
    "",
  ].join("\n");
  return `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
