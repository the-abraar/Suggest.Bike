import type { Metadata } from "next";
import { langAlternates, OG_BN } from "@/lib/site";
import { LegalView } from "@/components/LegalView";

export const metadata: Metadata = {
  title: "দায়মুক্তি",
  description: "দাম ও আন্দাজগুলো পরিকল্পনার জন্য, কোনো পরামর্শ নয়।",
  alternates: langAlternates("/disclaimer/", "bn"),
  openGraph: OG_BN,
};

export default function Page() {
  return <LegalView doc="disclaimer" />;
}
