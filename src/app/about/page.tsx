import type { Metadata } from "next";
import { AboutView } from "./AboutView";

export const metadata: Metadata = {
  title: "How we rate bikes",
  description: "How Suggest.Bike scores motorcycles for Bangladesh, where prices come from, and how the matchmaker works.",
};

export default function AboutPage() {
  return <AboutView />;
}
