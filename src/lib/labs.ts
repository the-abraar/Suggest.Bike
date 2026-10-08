// Registry of experimental tools shown on /labs. Each tool lives in its own folder under src/app/labs/<slug>/.
export interface LabTool {
  slug: "check" | "negotiate" | "listing-check" | "finder";
  href: string;
  icon: "shield" | "wrench" | "scale" | "radar";
  title: { en: string; bn: string };
  blurb: { en: string; bn: string };
  /** "preview" = usable in the browser today; "soon" = page shows the plan only. */
  status: "preview" | "soon";
}

export const LAB_TOOLS: LabTool[] = [
  {
    slug: "check",
    href: "/labs/check/",
    icon: "shield",
    title: { en: "Used-bike check", bn: "পুরনো বাইক যাচাই" },
    blurb: {
      en: "Pick the model you're eyeing. Get a checklist made for that bike, then add photos, video or engine sound for a value estimate.",
      bn: "যে মডেলটি দেখছেন সেটি বেছে নিন। সেই বাইকের জন্য চেকলিস্ট পাবেন, আর ছবি, ভিডিও বা ইঞ্জিনের শব্দ দিলে দামের আন্দাজ পাবেন।",
    },
    status: "preview",
  },
  {
    slug: "negotiate",
    href: "/labs/negotiate/",
    icon: "wrench",
    title: { en: "Second-hand bike check", bn: "সেকেন্ড-হ্যান্ড বাইক যাচাই" },
    blurb: {
      en: "Pick the model, tap each part as you inspect it, and see how much you can knock off the price. Expected price included.",
      bn: "মডেল বেছে নিন, পরীক্ষার সময় প্রতিটি অংশে ট্যাপ করুন, আর দেখুন দাম কতটা কমানো যায়। প্রত্যাশিত দামসহ।",
    },
    status: "preview",
  },
  {
    slug: "listing-check",
    href: "/labs/listing-check/",
    icon: "scale",
    title: { en: "Listing check", bn: "বিজ্ঞাপন যাচাই" },
    blurb: {
      en: "Paste what a seller told you and the Bikroy or Facebook post details. We say if it's worth your time.",
      bn: "বিক্রেতা যা বলেছেন আর বিক্রয়.কম/ফেসবুক পোস্টের তথ্য দিন। সময় দেওয়ার মতো কি না আমরা বলব।",
    },
    status: "preview",
  },
  {
    slug: "finder",
    href: "/labs/finder/",
    icon: "radar",
    title: { en: "Bike finder", bn: "বাইক খুঁজে দেওয়া" },
    blurb: {
      en: "Want a maroon RX 115 with an original cylinder sleeve? Describe it. We search, then check again every midnight and message you on WhatsApp.",
      bn: "মেরুন রঙের RX 115, আসল সিলিন্ডার স্লিভ সহ? লিখে দিন। আমরা খুঁজব, প্রতি মাঝরাতে আবার দেখব, আর হোয়াটসঅ্যাপে জানাব।",
    },
    status: "soon",
  },
];
