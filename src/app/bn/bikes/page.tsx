import type { Metadata } from "next";
import { langAlternates, OG_BN } from "@/lib/site";
import { BrowseView } from "../../bikes/BrowseView";

export const metadata: Metadata = {
  title: "বাংলাদেশের সব মোটরসাইকেল: দাম, মাইলেজ ও স্পেসিফিকেশন",
  description: "বাজেট, ব্র্যান্ড, ধরন ও সিসি দিয়ে বাংলাদেশে বিক্রি হওয়া সব মোটরসাইকেল ফিল্টার করুন, আসল মাইলেজ ও দামসহ।",
  alternates: langAlternates("/bikes/", "bn"),
  openGraph: OG_BN,
};

export default function Page() {
  return <BrowseView />;
}
