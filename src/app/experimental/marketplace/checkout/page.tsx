import type { Metadata } from "next";
import { CheckoutView } from "./CheckoutView";

export const metadata: Metadata = { title: "Checkout (shop preview)" };

export default function Page() {
  return <CheckoutView />;
}
