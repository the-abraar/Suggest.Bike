import type { Metadata } from "next";
import { langAlternates, OG_BN } from "@/lib/site";
import { FeedbackView } from "../../feedback/FeedbackView";

export const metadata: Metadata = {
  title: "মতামত",
  description: "ভুল দাম জানান বা কী ঠিক করা দরকার বলুন। কোনো অ্যাকাউন্ট লাগবে না।",
  alternates: langAlternates("/feedback/", "bn"),
  openGraph: OG_BN,
};

export default function Page() {
  return <FeedbackView />;
}
