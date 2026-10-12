import type { Metadata } from "next";
import { LegalView } from "@/components/LegalView";

export const metadata: Metadata = { title: "Terms of use", description: "Terms for using Suggest.Bike." };

export default function Page() {
  return <LegalView doc="terms" />;
}
