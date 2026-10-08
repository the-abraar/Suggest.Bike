import type { Metadata } from "next";
import { NegotiateView } from "./NegotiateView";

export const metadata: Metadata = {
  title: "Second-hand bike check: how much to knock off the price",
  description:
    "Experimental. Pick a model, tap each part on the bike as you inspect it, and see how much you can negotiate off, plus the expected price for a decent unit.",
};

export default function NegotiatePage() {
  return <NegotiateView />;
}
