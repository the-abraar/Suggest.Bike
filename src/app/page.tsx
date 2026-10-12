import type { Metadata } from "next";
import { HomeView } from "./HomeView";

export const metadata: Metadata = {
  alternates: { canonical: "/", languages: { en: "/", bn: "/bn/", "x-default": "/" } },
};

export default function Page() {
  return <HomeView />;
}
