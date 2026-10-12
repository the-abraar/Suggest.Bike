import type { Metadata } from "next";
import { HomeView } from "../HomeView";

export const metadata: Metadata = {
  title: { absolute: "Suggest.Bike — বাংলাদেশে সঠিক মোটরসাইকেল খুঁজুন" },
  alternates: { canonical: "/bn/", languages: { en: "/", bn: "/bn/", "x-default": "/" } },
  openGraph: { locale: "bn_BD" },
};

export default function Page() {
  return <HomeView />;
}
