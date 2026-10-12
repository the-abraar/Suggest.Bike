import type { Metadata } from "next";
import { langAlternates } from "@/lib/site";
import { SavedView } from "./SavedView";

export const metadata: Metadata = {
  title: "Saved bikes",
  description: "Your saved motorcycles, kept in this browser.",
  alternates: langAlternates("/saved/"),
};

export default function Page() {
  return <SavedView />;
}
