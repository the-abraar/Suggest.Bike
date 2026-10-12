import type { Metadata } from "next";
import { langAlternates, OG_BN } from "@/lib/site";
import { CompareView } from "../../compare/CompareView";

export const metadata: Metadata = {
  title: "মোটরসাইকেল পাশাপাশি তুলনা করুন",
  description: "দুই বা তিনটি মোটরসাইকেলের দাম, আসল মাইলেজ, পার্টস, মিস্ত্রির পরিচিতি ও মাসিক খরচ তুলনা করুন।",
  alternates: langAlternates("/compare/", "bn"),
  openGraph: OG_BN,
};

export default function Page() {
  return <CompareView />;
}
