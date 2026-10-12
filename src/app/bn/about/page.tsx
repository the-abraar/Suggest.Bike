import type { Metadata } from "next";
import { langAlternates, OG_BN } from "@/lib/site";
import { AboutView } from "../../about/AboutView";

export const metadata: Metadata = {
  title: "আমরা কীভাবে বাইক রেট করি",
  description: "Suggest.Bike কীভাবে বাংলাদেশের জন্য মোটরসাইকেল স্কোর করে, দাম কোথা থেকে আসে, আর ম্যাচমেকার কীভাবে কাজ করে।",
  alternates: langAlternates("/about/", "bn"),
  openGraph: OG_BN,
};

export default function Page() {
  return <AboutView />;
}
