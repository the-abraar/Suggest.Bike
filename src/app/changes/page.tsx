import type { Metadata } from "next";
import { langAlternates } from "@/lib/site";
import { ChangesView } from "./ChangesView";

export const metadata: Metadata = {
  title: "What changed: bike price changes in Bangladesh",
  description: "Every motorcycle price rise and drop, new bike and removed bike in Suggest.Bike's data, month by month.",
  alternates: langAlternates("/changes/"),
};

export default function Page() {
  return <ChangesView />;
}
