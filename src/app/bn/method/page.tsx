import type { Metadata } from "next";
import { MethodView } from "../../method/MethodView";

export const metadata: Metadata = {
  title: "পদ্ধতি: প্রতিটি সংখ্যা কীভাবে তৈরি",
  description: "Suggest.Bike কীভাবে দাম, অন-রোড খরচ, মাইলেজ, ১১টি মালিকানা স্কোর, পার্টস ও পুরনো বাইকের দাম এবং ম্যাচ র‍্যাঙ্কিং তৈরি করে; কোনগুলো সম্পাদকীয় অনুমান; আর কীভাবে ভুল ধরিয়ে দেবেন।",
  alternates: { canonical: "/bn/method/", languages: { en: "/method/", bn: "/bn/method/", "x-default": "/method/" } },
  openGraph: { locale: "bn_BD" },
};

export default function Page() {
  return <MethodView />;
}
