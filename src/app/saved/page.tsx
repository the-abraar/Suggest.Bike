import type { Metadata } from "next";
import { SavedView } from "./SavedView";

export const metadata: Metadata = {
  title: "Saved bikes",
  description: "Your saved motorcycles, kept in this browser.",
  alternates: { canonical: "/saved/" },
};

export default function Page() {
  return <SavedView />;
}
