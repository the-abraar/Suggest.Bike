import type { Metadata } from "next";
import { LegalView } from "@/components/LegalView";

export const metadata: Metadata = { title: "Privacy", description: "How Suggest.Bike handles your data." };

export default function Page() {
  return <LegalView doc="privacy" />;
}
