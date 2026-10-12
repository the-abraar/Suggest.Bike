import type { Metadata } from "next";
import { langAlternates } from "@/lib/site";
import { HomeView } from "./HomeView";

export const metadata: Metadata = {
  alternates: langAlternates("/"),
};

export default function Page() {
  return <HomeView />;
}
