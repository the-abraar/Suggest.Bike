import type { Metadata } from "next";
import { langAlternates } from "@/lib/site";
import { OwnerView } from "./OwnerView";

export const metadata: Metadata = {
  title: "New bike? What to do first: break-in, basic checks, registration, accessories",
  description:
    "A first-weeks checklist for new bike owners in Bangladesh: how to break in the engine, basic checks you can do yourself, whether to register, and which accessories to buy (disc lock, helmet lock, crash guard, phone mount).",
  alternates: langAlternates("/owner/"),
};

export default function Page() {
  return <OwnerView />;
}
