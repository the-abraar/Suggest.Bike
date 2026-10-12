import type { Metadata } from "next";
import { HomeView } from "./HomeView";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export default function Page() {
  return <HomeView />;
}
