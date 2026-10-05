import type { Metadata } from "next";
import { GuideView } from "./GuideView";

export const metadata: Metadata = {
  title: "Buyer's guide: BRTA registration cost, licence, EMI, rules & buying used",
  description:
    "Everything to know before buying a motorcycle in Bangladesh: BRTA registration and 10-year tax token cost, smart driving licence fees and steps, paying in EMI, the 375cc rule, road laws and an 11-point used bike checklist.",
};

export default function GuidePage() {
  return <GuideView />;
}
