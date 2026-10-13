import type { Metadata } from "next";
import { langAlternates, OG_BN } from "@/lib/site";
import { OwnerView } from "../../owner/OwnerView";

export const metadata: Metadata = {
  title: "নতুন বাইক নিয়ে কী করবেন: ব্রেক-ইন, বেসিক চেক, রেজিস্ট্রেশন, অ্যাকসেসরিজ",
  description: "নতুন বাইকের মালিকদের প্রথম মাসের চেকলিস্ট: ইঞ্জিন ব্রেক-ইন, বেসিক চেক, প্রথম ফ্রি সার্ভিস বুক করা, রেজিস্ট্রেশন, ইন্স্যুরেন্স, কোন অ্যাকসেসরিজ কিনবেন, আর চুরি ঠেকানো।",
  alternates: langAlternates("/owner/", "bn"),
  openGraph: OG_BN,
};

export default function Page() {
  return <OwnerView />;
}
