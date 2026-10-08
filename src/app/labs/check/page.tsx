import type { Metadata } from "next";
import { CheckView } from "./CheckView";

export const metadata: Metadata = {
  title: "Used-bike check: a checklist and price range for your model",
  description:
    "Experimental. Pick a motorcycle model, get a used-bike checklist made for it (papers, frame, engine, test ride), a trust summary and a price range estimate. Photos and sound stay in your browser.",
};

export default function CheckPage() {
  return <CheckView />;
}
