import type { Metadata } from "next";
import { langAlternates, OG_BN } from "@/lib/site";
import { OwnerView } from "../../owner/OwnerView";

export const metadata: Metadata = {
  title: "নতুন বাইক নিয়ে কী করবেন: ব্রেক-ইন, বেসিক চেক, রেজিস্ট্রেশন, অ্যাকসেসরিজ",
  description: "নতুন বাইকের মালিকদের প্রথম কয়েক সপ্তাহের চেকলিস্ট: ইঞ্জিন ব্রেক-ইন, নিজে করা বেসিক চেক, রেজিস্ট্রেশন লাগবে কি না, আর কোন অ্যাকসেসরিজ কিনবেন (ডিস্ক লক, হেলমেট লক, ক্র্যাশ গার্ড, ফোন মাউন্ট)।",
  alternates: langAlternates("/owner/", "bn"),
  openGraph: OG_BN,
};

export default function Page() {
  return <OwnerView />;
}
