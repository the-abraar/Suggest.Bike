import type { Metadata } from "next";
import { FeedbackView } from "./FeedbackView";

export const metadata: Metadata = { title: "Feedback", description: "Report a wrong price or tell us what to fix. No account needed.", alternates: { canonical: "/feedback/" } };

export default function Page() {
  return <FeedbackView />;
}
