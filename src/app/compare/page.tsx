import type { Metadata } from "next";
import { CompareView } from "./CompareView";

export const metadata: Metadata = {
  title: "Compare motorcycles side by side",
  description: "Compare two or three motorcycles on price, real mileage, parts, mechanic familiarity and monthly cost.",
  alternates: { canonical: "/compare/" },
};

export default function Page() {
  return <CompareView />;
}
