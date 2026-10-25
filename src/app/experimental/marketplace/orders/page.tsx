import type { Metadata } from "next";
import { OrdersView } from "./OrdersView";

export const metadata: Metadata = { title: "Orders (shop preview)" };

export default function Page() {
  return <OrdersView />;
}
