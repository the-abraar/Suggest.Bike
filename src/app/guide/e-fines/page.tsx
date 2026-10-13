import type { Metadata } from "next";
import { langAlternates, OG_BASE } from "@/lib/site";
import { EFinesView } from "./EFinesView";

const title = "Dhaka traffic e-fines from AI cameras, and fake fine SMS";
const description =
  "How DMP's CCTV and AI-camera e-fines work: what they catch, how a real notice arrives (letter; SMS only from 01320-042207 or 01320-042227), how to pay, what happens if you ignore it, how to spot a fake fine SMS, and the Dhaka-Chattogram highway auto-fine.";

export const metadata: Metadata = {
  title,
  description,
  alternates: langAlternates("/guide/e-fines/"),
  openGraph: { ...OG_BASE, title, description },
};

export default function Page() {
  return <EFinesView lang="en" />;
}
