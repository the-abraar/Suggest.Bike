import type { Metadata } from "next";
import { langAlternates } from "@/lib/site";
import { LegalView } from "@/components/LegalView";

export const metadata: Metadata = {
  title: "Disclaimer",
  description: "Prices and estimates are not advice.",
  alternates: langAlternates("/disclaimer/"),
};

export default function Page() {
  return <LegalView doc="disclaimer" />;
}
