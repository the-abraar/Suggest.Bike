import type { Metadata } from "next";
import { langAlternates } from "@/lib/site";
import { DealersView } from "./DealersView";

export const metadata: Metadata = {
  title: "Official motorcycle distributors in Bangladesh",
  description: "Official Bangladesh distributors for Bajaj, Honda, Yamaha, Suzuki, TVS, Hero, Royal Enfield, KTM and more: showroom locators and hotlines from their own websites.",
  alternates: langAlternates("/dealers/"),
};

export default function Page() {
  return <DealersView />;
}
