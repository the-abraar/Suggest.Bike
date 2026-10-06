// Shape of every record in src/data/bikes.json (the source of truth; edit this file, then `npm run data`).
export type Category =
  | "commuter"      // 100-125cc daily runners (Platina, Livo, Saluto, Discover)
  | "street"        // 150-165cc everyday naked/street (Pulsar, Apache, FZ, Gixxer, Hornet)
  | "sport"         // faired sport (R15, CBR150R, Gixxer SF, RC)
  | "naked"         // performance naked (MT-15, Duke, NS160, Xtreme)
  | "adventure"     // dual-sport/ADV (XPulse, V-Strom SX, CB150X)
  | "cruiser"       // Avenger, Intruder, Meteor
  | "classic"       // retro/classic (Classic 350, Hunter, CG125, RX100)
  | "scooter";

export interface Part { name: string; priceBDT: number; availability: "everywhere" | "common" | "dealer-only" | "rare"; note?: string }

export interface Bike {
  id: string;               // kebab slug, e.g. "bajaj-pulsar-n160"
  brand: string;            // "Bajaj"
  model: string;            // "Pulsar N160" (no brand prefix)
  variant?: string;         // "Dual Channel ABS" — if multiple variants exist, pick the most-sold one and mention others in priceNote
  category: Category;
  status: "on-sale" | "used-only";   // used-only = discontinued, bought on used market (CG125, RX100)
  priceBDT: number;         // current official ex-showroom price in BD (Taka). For used-only: typical used market price for decent condition.
  priceNote?: string;       // e.g. "Single-channel ABS variant ৳2,99,000"
  priceAsOf: string;        // "2026-09" — month of the source you found
  priceSource: string;      // URL where you saw the price (official site, bikebd.com, bikevaly.com etc.). Never invent.
  distributor?: string;     // BD distributor/assembler e.g. "Uttara Motors", "ACI Motors", "Bangladesh Honda Private Ltd (BHL)"
  assembledInBD?: boolean;
  engine: { cc: number; cylinders: number; stroke: 2 | 4; cooling: "air" | "oil" | "liquid"; valves?: number; fuel: "carb" | "fi" };
  powerPS: number; powerRpm?: number;
  torqueNm: number; torqueRpm?: number;
  gears: number;            // 0 for CVT scooters
  topSpeedKmh?: number;
  mileageKmpl: [number, number]; // REAL-WORLD BD range as reported by owners/test reviews (not claimed), e.g. [40, 45]
  weightKg: number;         // kerb weight
  seatHeightMm: number;
  groundClearanceMm?: number;
  fuelTankL: number;
  brakes: { front: "disc" | "drum"; rear: "disc" | "drum"; abs: "none" | "single" | "dual" | "cbs" };
  tubeless: boolean;
  tyres?: { front: string; rear: string };  // "100/80-17"
  suspension?: { front: string; rear: string }; // "USD fork", "Monoshock"
  // ---- Suggest.Bike editorial (be honest, BD-specific, based on owner reviews/forums/YouTube/review sites) ----
  scores: {                 // integers 1-10
    reliability: number; mechanicFamiliarity: number; // how many local mechanics outside dealer can fix it well
    partsAvailability: number; resale: number; comfort: number;
    cityHandling: number;   // Dhaka traffic agility, heat, clutch, weight
    highway: number; pillion: number; offroad: number; performance: number; beginnerFriendly: number;
  };
  tagline: string;          // one punchy line, e.g. "The default answer to 'which 150cc should I buy?'"
  feel: string;             // 1-2 sentences on how it rides
  quirks: string;           // known issues/handling quirks owners complain about (be specific & honest)
  braking: string;          // 1 sentence
  mechanicNote: string;     // 1-2 sentences on servicing in BD (dealer network, local mechanic comfort, special tools)
  pros: string[];           // 3-4 short
  cons: string[];           // 2-4 short
  bestFor: string[];        // e.g. ["Daily Dhaka commute", "First bike", "Ride-sharing (Pathao/Uber)"]
  serviceIntervalKm: number;    // typical
  avgServiceCostBDT: number;    // typical periodic service at dealer: engine oil, oil filter, labour
  tyrePairBDT?: number;         // front + rear tyre price when the category default is wrong (odd sizes, e.g. a 19-inch front)
  parts: Part[];            // EXACTLY these 5 names, approx BD market price: "Brake pads/shoes (front)", "Chain & sprocket set", "Air filter", "Engine oil change", "Clutch plate set"
  sources: string[];        // URLs you actually consulted for this bike (2-5)
  // ---- Optional enrichments ----
  bn?: BikeBn;              // Bangla versions of the editorial text
  aliases?: string[];       // extra search terms: Bangla spellings, common misspellings ("পালসার", "apachi")
  usedPrice?: UsedPrice;    // used-market asking prices for on-sale models
  image?: BikeImage;        // freely licensed photo (Wikimedia Commons), shown with credit
}

export interface BikeBn {
  tagline: string;
  feel: string;
  quirks: string;
  braking: string;
  mechanicNote: string;
  pros: string[];
  cons: string[];
  bestFor: string[];
  priceNote?: string | null;
  partNotes?: (string | null)[];
}

export interface UsedPrice { y1: number | null; y3: number | null; listingsSeen?: number; asOf: string; sources: string[] }

export interface BikeImage { src: string; author: string; license: string; licenseUrl?: string; sourcePage: string }

export type ScoreKey = keyof Bike["scores"];

/**
 * What every client page gets (src/data/generated/bikes.index.json).
 * Long-form text lives in per-bike files under public/data/bikes/ and is passed to the detail page at build time.
 */
export type BikeLite = Omit<
  Bike,
  "feel" | "quirks" | "braking" | "mechanicNote" | "pros" | "cons" | "bestFor" | "sources" | "priceNote" | "priceSource" | "tyres" | "suspension" | "bn" | "parts"
> & {
  taglineBn?: string;
  parts: Pick<Part, "name" | "priceBDT" | "availability">[];
  hasOffer: boolean;
};

export interface BrandNetwork {
  distributor: string;
  showrooms: number | null;
  serviceCentres: number | null;
  divisions: string[];
  allDivisions: boolean | null;
  dealerLocatorUrl: string | null;
  note: string;
  asOf: string;
  sources: string[];
  confidence: "high" | "medium" | "low";
}
