import data from "@/data/offers.json";

/** A time-limited showroom offer from src/data/offers.json (schema: offers.schema.json). */
export type Offer = {
  id: string;
  bikeIds: string[];
  type: "discount" | "free-registration" | "cashback" | "emi" | "exchange" | "gift" | "other";
  title: string;
  titleBn: string;
  regularPriceBDT?: number;
  offerPriceBDT?: number;
  startsOn: string; // YYYY-MM-DD, inclusive
  endsOn: string; // YYYY-MM-DD, inclusive
  where?: string;
  source: { name: string; url: string | null };
  notes?: string;
};

export const OFFERS = data.offers as Offer[];

/** Today's date in Bangladesh as YYYY-MM-DD. Offers start and end on BD dates whatever the visitor's clock zone. */
export const todayBD = (now = new Date()) => now.toLocaleDateString("en-CA", { timeZone: "Asia/Dhaka" });

/** ISO dates compare correctly as strings; both ends are inclusive. */
export const isActive = (o: Pick<Offer, "startsOn" | "endsOn">, today: string) => o.startsOn <= today && today <= o.endsOn;

/** The offer running today for a bike, if any (first listed wins). */
export const activeOffer = (bikeId: string, today: string, offers: Offer[] = OFFERS) => offers.find((o) => o.bikeIds.includes(bikeId) && isActive(o, today));

/** Whole days from an ISO date to today (both YYYY-MM-DD). */
export const daysSince = (iso: string, today: string) => Math.round((Date.parse(today) - Date.parse(iso)) / 864e5);

/** How old a "YYYY-MM" price is on the visitor's date: amber after 60 days, red after 120 (critique B5). Counted from the 1st, as validate does. */
export const priceAge = (asOf: string, today: string): "fresh" | "aging" | "stale" => {
  const d = daysSince(`${asOf}-01`, today);
  return d > 120 ? "stale" : d > 60 ? "aging" : "fresh";
};
