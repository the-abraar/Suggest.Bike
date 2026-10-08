import type { Metadata } from "next";
import { FinderView } from "./FinderView";

export const metadata: Metadata = {
  title: "Bike finder (coming soon): tell us the exact bike, we keep looking",
  description:
    "Describe the bike you want, down to the colour, papers and an original cylinder sleeve. Experimental and coming soon: we will check public listings every midnight and message you on WhatsApp when something fits.",
};

export default function FinderPage() {
  return <FinderView />;
}
