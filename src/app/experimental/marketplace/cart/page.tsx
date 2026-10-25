import type { Metadata } from "next";
import { CartView } from "./CartView";

export const metadata: Metadata = { title: "Cart (shop preview)" };

export default function Page() {
  return <CartView />;
}
