import type { Metadata } from "next";
import { MatchView } from "./MatchView";

export const metadata: Metadata = {
  title: "Bike matchmaker: find the right motorcycle for you",
  description: "Answer a few questions on budget, use and riding style and get a ranked shortlist of motorcycles for Bangladesh.",
  alternates: { canonical: "/match/" },
};

export default function Page() {
  return <MatchView />;
}
