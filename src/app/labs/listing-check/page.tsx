import type { Metadata } from "next";
import { Suspense } from "react";
import { ListingCheckView } from "./ListingCheckView";

export const metadata: Metadata = {
  title: "Listing check (experimental)",
  description: "Paste what the seller said and the marketplace post details. Get a rule-based verdict, price check, red flags and questions to ask. Experimental.",
};

export default function ListingCheckPage() {
  return (
    <Suspense>
      <ListingCheckView />
    </Suspense>
  );
}
