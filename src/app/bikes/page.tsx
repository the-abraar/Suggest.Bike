import type { Metadata } from "next";
import { BrowseView } from "./BrowseView";

export const metadata: Metadata = {
  title: "Browse motorcycles in Bangladesh: prices, mileage and specs",
  description: "Filter all motorcycles on sale in Bangladesh by budget, brand, type and engine size, with real mileage and prices.",
  alternates: { canonical: "/bikes/" },
};

export default function Page() {
  return <BrowseView />;
}
