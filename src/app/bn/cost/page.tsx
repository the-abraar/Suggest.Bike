import type { Metadata } from "next";
import { langAlternates, OG_BN } from "@/lib/site";
import { CostView } from "../../cost/CostView";

export const metadata: Metadata = {
  title: "বাংলাদেশে মোটরসাইকেল রাখার আসল খরচ",
  description: "যেকোনো বাইকের রেজিস্ট্রেশন, তেল, সার্ভিস, কিস্তি ও মোট মাসিক খরচ হিসাব করুন।",
  alternates: langAlternates("/cost/", "bn"),
  openGraph: OG_BN,
};

export default function Page() {
  return <CostView />;
}
