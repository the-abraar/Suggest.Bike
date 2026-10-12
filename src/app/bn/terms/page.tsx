import type { Metadata } from "next";
import { langAlternates, OG_BN } from "@/lib/site";
import { LegalView } from "@/components/LegalView";

export const metadata: Metadata = {
  title: "ব্যবহারের শর্ত",
  description: "Suggest.Bike ব্যবহারের শর্তাবলি।",
  alternates: langAlternates("/terms/", "bn"),
  openGraph: OG_BN,
};

export default function Page() {
  return <LegalView doc="terms" />;
}
