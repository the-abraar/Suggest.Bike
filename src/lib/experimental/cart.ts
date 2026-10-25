// Experimental marketplace cart math. Pure: the page keeps lines in localStorage (sb-exp-cart). Sample prices, nothing is sold.

export type Line = { id: string; size?: string; qty: number };
export type Zone = "dhaka" | "outside";

export const MAX_QTY = 10;
export const MAX_LINES = 30; // localStorage and URL input are capped (CODING_STANDARDS "Cap")
export const DELIVERY: Record<Zone, number> = { dhaka: 60, outside: 120 }; // sample fees

const clampQty = (n: number) => Math.min(MAX_QTY, Math.max(1, Math.floor(n) || 1));
const same = (l: Line, id: string, size?: string) => l.id === id && (l.size ?? "") === (size ?? "");

/** Adds to an existing line (same product and size) or appends one; a 31st line is refused. */
export function addLine(lines: Line[], id: string, qty = 1, size?: string): Line[] {
  const hit = lines.find((l) => same(l, id, size));
  if (hit) return setQty(lines, id, size, hit.qty + qty);
  if (lines.length >= MAX_LINES) return lines;
  return [...lines, { id, ...(size && { size }), qty: clampQty(qty) }];
}

/** Below 1 removes the line; above MAX_QTY is capped. */
export const setQty = (lines: Line[], id: string, size: string | undefined, qty: number): Line[] =>
  qty < 1 ? removeLine(lines, id, size) : lines.map((l) => (same(l, id, size) ? { ...l, qty: clampQty(qty) } : l));

export const removeLine = (lines: Line[], id: string, size?: string) => lines.filter((l) => !same(l, id, size));

export const count = (lines: Line[]) => lines.reduce((n, l) => n + l.qty, 0);

export function totals(lines: Line[], priceOf: (id: string) => number | undefined, zone: Zone) {
  const subtotal = lines.reduce((s, l) => s + (priceOf(l.id) ?? 0) * l.qty, 0);
  const delivery = lines.length ? DELIVERY[zone] : 0;
  return { subtotal, delivery, total: subtotal + delivery };
}

/** Dhaka district (the city and its suburbs) gets the inside-Dhaka fee; everywhere else the outside fee. */
export const zoneFor = (district: string): Zone => (district === "Dhaka" ? "dhaka" : "outside");

/** "017 1234-5678", "+8801712345678" -> "01712345678"; null unless it is a BD mobile number (01[3-9] + 8 digits). */
export function bdMobile(s: string): string | null {
  const d = s.replace(/[\s-]/g, "").replace(/^\+?88(?=01)/, "");
  return /^01[3-9]\d{8}$/.test(d) ? d : null;
}

/** Divisions and their districts (64), for the checkout selects. */
export const DIVISIONS: Record<string, string[]> = {
  Barishal: ["Barguna", "Barishal", "Bhola", "Jhalokati", "Patuakhali", "Pirojpur"],
  Chattogram: ["Bandarban", "Brahmanbaria", "Chandpur", "Chattogram", "Cox's Bazar", "Cumilla", "Feni", "Khagrachhari", "Lakshmipur", "Noakhali", "Rangamati"],
  Dhaka: ["Dhaka", "Faridpur", "Gazipur", "Gopalganj", "Kishoreganj", "Madaripur", "Manikganj", "Munshiganj", "Narayanganj", "Narsingdi", "Rajbari", "Shariatpur", "Tangail"],
  Khulna: ["Bagerhat", "Chuadanga", "Jashore", "Jhenaidah", "Khulna", "Kushtia", "Magura", "Meherpur", "Narail", "Satkhira"],
  Mymensingh: ["Jamalpur", "Mymensingh", "Netrokona", "Sherpur"],
  Rajshahi: ["Bogura", "Chapainawabganj", "Joypurhat", "Naogaon", "Natore", "Pabna", "Rajshahi", "Sirajganj"],
  Rangpur: ["Dinajpur", "Gaibandha", "Kurigram", "Lalmonirhat", "Nilphamari", "Panchagarh", "Rangpur", "Thakurgaon"],
  Sylhet: ["Habiganj", "Moulvibazar", "Sunamganj", "Sylhet"],
};

/** Parses stored lines: drops anything malformed or unknown, merges duplicates, caps. Never throws. */
export function cleanLines(raw: unknown, known: (id: string, size?: string) => boolean): Line[] {
  if (!Array.isArray(raw)) return [];
  let out: Line[] = [];
  for (const x of raw.slice(0, MAX_LINES * 2)) {
    if (!x || typeof x !== "object") continue;
    const { id, size, qty } = x as Record<string, unknown>;
    if (typeof id !== "string" || (size !== undefined && typeof size !== "string") || typeof qty !== "number" || !known(id, size)) continue;
    out = addLine(out, id, qty, size);
  }
  return out;
}
