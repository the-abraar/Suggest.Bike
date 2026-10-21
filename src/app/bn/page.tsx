import type { Metadata } from "next";
import { langAlternates, OG_BN } from "@/lib/site";
import { HomeView } from "../HomeView";

export const metadata: Metadata = {
  title: { absolute: "Suggest.Bike — বাংলাদেশে সঠিক মোটরসাইকেল খুঁজুন" },
  description: "বাংলাদেশে বাইক কেনার আগে সব হিসাব এক জায়গায় — বাজেট অনুযায়ী সঠিক বাইক খুঁজুন, আসল মাইলেজ, পার্টসের দাম, মিস্ত্রির পরিচিতি ও আসল মাসিক খরচ তুলনা করুন।",
  alternates: langAlternates("/", "bn"),
  openGraph: OG_BN,
};

export default function Page() {
  return <HomeView />;
}
