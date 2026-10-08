import type { Metadata } from "next";
import { LabsView } from "./LabsView";

export const metadata: Metadata = {
  title: "Labs — experimental tools for used-bike buyers",
  description: "Experimental Suggest.Bike tools: a used-bike checklist made for your model, a marketplace listing check and a bike finder that messages you on WhatsApp.",
};

export default function LabsPage() {
  return <LabsView />;
}
