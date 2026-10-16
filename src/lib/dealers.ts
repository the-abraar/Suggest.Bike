import data from "@/data/dealers.json";

export type Dealer = {
  distributor: string;
  site: string;
  locator: string | null;
  hotline: string | null;
  service?: string; // service-centre line, also on sourceUrl
  sourceUrl: string;
  checked: string;
  note?: string;
  noteBn?: string;
  districts?: string[];
};

export const DEALERS = data.brands as Record<string, Dealer>;

/** Official distributor for a bike's brand; "Hero Honda" and other discontinued brands have none. */
export const dealerFor = (brand: string): Dealer | undefined => DEALERS[brand];

/** tel: href from a displayed number. */
export const telHref = (n: string) => `tel:${n.replace(/[^\d+]/g, "")}`;
