// Types for the Listing check (Labs). Pure data, no React.
export interface Bi { en: string; bn: string }

export type Platform = "bikroy" | "fb-marketplace" | "fb-group" | "showroom" | "friend" | "other";
export type Tri = "yes" | "no" | "unknown";
export type BlueBook = "yes" | "no" | "processing" | "unknown";
export type TaxToken = "valid" | "expired" | "no" | "unknown";
export type Reason = "none" | "upgrading" | "abroad" | "money" | "not-using" | "study" | "gov-transfer" | "other";

/** Things the seller said or did. Each one is a yes/no tick in the form. */
export interface Behaviours {
  wantsAdvance: boolean;        // asks for any money (bKash/Nagad/bank) before you have seen bike and papers
  refusesInspection: boolean;   // will not allow a mechanic check or a test ride
  oddMeeting: boolean;          // only meets at night, on a highway, in an empty place
  urgencyPressure: boolean;     // "other buyers are coming", "sell today"
  courierOffer: boolean;        // offers to send the bike by courier / transport to another city
  refusesPaperPhoto: boolean;   // will not send a photo of the papers
  claimsOwnerButManyAds: boolean; // says "personal use" but runs many ads (set by the engine, can also be ticked)
  welcomesInspection: boolean;  // actively says "bring your mechanic"
}

export interface Listing {
  id: string;
  label: string;               // "Listing A"
  platform: Platform;
  link: string;                // optional: pasted for your own reference only; never fetched
  askingBDT: number | null;
  bikeId: string;              // "" when the model is not in our list
  year: number | null;         // model year the seller claims
  regYear: number | null;      // year shown on the registration papers, if known
  km: number | null;
  owners: number | null;
  location: string;
  blueBook: BlueBook;
  nameMatchesSeller: Tri;      // is the seller the name on the blue book / DRC?
  taxToken: TaxToken;
  smartCard: Tri;              // digital registration certificate (smart card blue book)
  photos: number | null;       // photos in the post
  stockPhotos: Tri;            // do the photos look like internet / stock pictures?
  postAgeDays: number | null;
  reason: Reason;
  sellerAccountMonths: number | null;
  otherAds: number | null;
  behaviours: Behaviours;
  text: string;                // pasted chat / post text, parsed by keyword matching
}

export type Severity = "critical" | "high" | "medium" | "low";

export interface Flag {
  id: string;
  severity: Severity;
  points: number;              // points taken off the score (positive number)
  title: Bi;
  detail: Bi;
  fromText?: boolean;
}
export interface Green { id: string; points: number; title: Bi; detail: Bi }

export type PriceBand = "unknown" | "far-below" | "below" | "fair" | "above" | "far-above";

export interface PriceCheck {
  known: boolean;
  fairLow: number;
  fairMid: number;
  fairHigh: number;
  asking: number | null;
  deltaPct: number | null;     // (asking - fairMid) / fairMid * 100; negative = cheaper than fair
  band: PriceBand;
  ageYears: number | null;
  basis: Bi;                   // one line saying where the fair range comes from
  note: Bi;                    // verdict sentence for the band
}

export type Verdict = "worth" | "caution" | "skip";

export interface Question { id: string; text: Bi; why?: Bi; priority: 1 | 2 | 3; source: "general" | "model" | "gap" }

export interface Assessment {
  score: number;               // 0-100
  verdict: Verdict;
  price: PriceCheck;
  flags: Flag[];
  greens: Green[];
  reasons: Bi[];               // the 2-4 sentences that explain the verdict
  textSignals: string[];       // ids matched from the pasted text
  missing: Bi[];               // things you did not fill in, which cap confidence
  confidence: "low" | "medium" | "high";
}
