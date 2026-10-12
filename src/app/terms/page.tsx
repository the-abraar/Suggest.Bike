import type { Metadata } from "next";
import { langAlternates } from "@/lib/site";
import { LegalView } from "@/components/LegalView";

export const metadata: Metadata = {
  title: "Terms of use",
  description: "Terms for using Suggest.Bike.",
  alternates: langAlternates("/terms/"),
};

export default function Page() {
  return <LegalView doc="terms" />;
}
