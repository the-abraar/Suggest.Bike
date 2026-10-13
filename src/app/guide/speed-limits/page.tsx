import type { Metadata } from "next";
import { langAlternates, OG_BASE } from "@/lib/site";
import { SpeedView } from "./SpeedView";

const title = "Motorcycle speed limits in Bangladesh (BRTA 2024 guideline)";
const description =
  "Speed limits for motorcycles under BRTA's 2024 guideline: 30 km/h in Dhaka and other towns, 50 km/h on highways and district roads, 60 km/h on expressways, the speeding fine (৳10,000, 1 point) and why some reports say 60 on highways.";

export const metadata: Metadata = {
  title,
  description,
  alternates: langAlternates("/guide/speed-limits/"),
  openGraph: { ...OG_BASE, title, description },
};

export default function Page() {
  return <SpeedView lang="en" />;
}
