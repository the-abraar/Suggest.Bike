import type { Metadata } from "next";
import { langAlternates, OG_BN } from "@/lib/site";
import { DealersView } from "../../dealers/DealersView";

export const metadata: Metadata = {
  title: "বাংলাদেশে মোটরসাইকেলের অফিশিয়াল ডিস্ট্রিবিউটর",
  description: "Bajaj, Honda, Yamaha, Suzuki, TVS, Hero, Royal Enfield, KTM সহ আরও ব্র্যান্ডের বাংলাদেশের অফিশিয়াল ডিস্ট্রিবিউটর: তাদের নিজেদের ওয়েবসাইট থেকে শোরুম লোকেটর ও হটলাইন।",
  alternates: langAlternates("/dealers/", "bn"),
  openGraph: OG_BN,
};

export default function Page() {
  return <DealersView />;
}
