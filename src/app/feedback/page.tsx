import type { Metadata } from "next";
import { langAlternates } from "@/lib/site";
import { FeedbackView } from "./FeedbackView";

export const metadata: Metadata = {
  title: "Feedback",
  description: "Report a wrong price or tell us what to fix. No account needed.",
  alternates: langAlternates("/feedback/"),
};

export default function Page() {
  return <FeedbackView />;
}
