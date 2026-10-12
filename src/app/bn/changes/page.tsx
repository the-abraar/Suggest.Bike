import type { Metadata } from "next";
import { langAlternates, OG_BN } from "@/lib/site";
import { ChangesView } from "../../changes/ChangesView";

export const metadata: Metadata = {
  title: "কী বদলেছে: বাংলাদেশে বাইকের দামের পরিবর্তন",
  description: "Suggest.Bike-এর ডেটায় মোটরসাইকেলের প্রতিটি দাম বাড়া-কমা, নতুন বাইক ও বাদ পড়া বাইক, মাস অনুযায়ী।",
  alternates: langAlternates("/changes/", "bn"),
  openGraph: OG_BN,
};

export default function Page() {
  return <ChangesView />;
}
