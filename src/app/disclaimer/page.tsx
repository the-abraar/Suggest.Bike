import type { Metadata } from "next";
import { LegalView } from "@/components/LegalView";

export const metadata: Metadata = { title: "Disclaimer", description: "Prices and estimates are not advice." };

export default function Page() {
  return <LegalView doc="disclaimer" />;
}
