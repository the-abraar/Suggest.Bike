import type { Metadata } from "next";
import { langAlternates, OG_BN } from "@/lib/site";
import { SavedView } from "../../saved/SavedView";

export const metadata: Metadata = {
  title: "সংরক্ষিত বাইক",
  description: "আপনার সেভ করা মোটরসাইকেল, এই ব্রাউজারেই রাখা।",
  alternates: langAlternates("/saved/", "bn"),
  robots: { index: false, follow: true }, // a per-browser list: nothing for search to show
  openGraph: OG_BN,
};

export default function Page() {
  return <SavedView />;
}
