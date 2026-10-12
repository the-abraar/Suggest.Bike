import type { Metadata } from "next";
import { langAlternates } from "@/lib/site";
import { LegalView } from "@/components/LegalView";

export const metadata: Metadata = {
  title: "Privacy",
  description: "How Suggest.Bike handles your data.",
  alternates: langAlternates("/privacy/"),
};

export default function Page() {
  return <LegalView doc="privacy" />;
}
