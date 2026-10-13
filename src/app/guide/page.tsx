import type { Metadata } from "next";
import { langAlternates } from "@/lib/site";
import { GuideView } from "./GuideView";

export const metadata: Metadata = {
  title: "Buyer's guide: BRTA registration cost, licence, EMI, rules & buying used",
  description:
    "Everything to know before buying a motorcycle in Bangladesh: BRTA registration and 10-year tax token cost, smart driving licence fees and steps, paying in EMI, the 375cc rule, road laws and a 15-point used bike checklist.",
  alternates: langAlternates("/guide/"),
};

export default function GuidePage() {
  return <GuideView />;
}
