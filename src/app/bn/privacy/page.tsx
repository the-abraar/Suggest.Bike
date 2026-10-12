import type { Metadata } from "next";
import { langAlternates, OG_BN } from "@/lib/site";
import { LegalView } from "@/components/LegalView";

export const metadata: Metadata = {
  title: "গোপনীয়তা",
  description: "Suggest.Bike আপনার তথ্য কীভাবে রাখে ও ব্যবহার করে।",
  alternates: langAlternates("/privacy/", "bn"),
  openGraph: OG_BN,
};

export default function Page() {
  return <LegalView doc="privacy" />;
}
