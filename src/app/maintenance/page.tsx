import type { Metadata } from "next";
import { langAlternates } from "@/lib/site";
import { MaintenanceView } from "./MaintenanceView";

export const metadata: Metadata = {
  title: "Bike maintenance guides: do the basics yourself",
  description: "Plain guides to basic motorcycle maintenance in Bangladesh: tyre pressure, chain lube, oil and brake checks, so you stop paying for jobs you can do in minutes.",
  alternates: langAlternates("/maintenance/"),
};

export default function Page() {
  return <MaintenanceView />;
}
