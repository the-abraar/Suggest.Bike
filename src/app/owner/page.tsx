import type { Metadata } from "next";
import { langAlternates } from "@/lib/site";
import { OwnerView } from "./OwnerView";

export const metadata: Metadata = {
  title: "New bike? What to do first: break-in, basic checks, registration, accessories",
  description:
    "A first-month checklist for new bike owners in Bangladesh: breaking in the engine, basic checks, booking the first free service, registration, insurance, which accessories to buy, and theft prevention.",
  alternates: langAlternates("/owner/"),
};

export default function Page() {
  return <OwnerView />;
}
