// Experimental marketplace preview (/experimental/marketplace/): a made-up catalogue. Generic names, no brands, and every
// price is a SAMPLE price shown with that label: nothing here is for sale. Import only from src/app/experimental.

export type Cat = "oil" | "parts" | "tyres" | "gear" | "security" | "care" | "accessories";

export const CATS: { id: Cat; label: string }[] = [
  { id: "oil", label: "Engine oil" },
  { id: "parts", label: "Parts" },
  { id: "tyres", label: "Tyres" },
  { id: "gear", label: "Helmets & gear" },
  { id: "security", label: "Locks & security" },
  { id: "care", label: "Care" },
  { id: "accessories", label: "Accessories" },
];

/** What a product needs from a bike to fit it; no `fit` = fits any bike. Rules in ./fitment.ts. */
export type FitRule =
  | { type: "oil"; grade: string; litres: number } // litres: bottle size
  | { type: "tyre"; sizes: string[] }
  | { type: "brake"; end: "front" | "rear"; kind: "disc" | "drum" }
  | { type: "engine" } // any petrol engine (air filter, spark plug)
  | { type: "chain" } // chain drive: not a scooter
  | { type: "clutch" }; // manual gearbox, petrol

export type Product = {
  id: string;
  cat: Cat;
  name: string;
  spec: string; // one line on the card
  price: number; // SAMPLE price, BDT
  icon: string; // key into ProductArt's icon map
  specs: [string, string][];
  why: string; // "Why we'd stock this"
  fit?: FitRule;
};

const OIL_SPEC = "API SN, JASO MA2";
const oil = (grade: string, base: string, litres: number, price: number, why: string): Product => ({
  id: `oil-${grade.toLowerCase().replace(/[^a-z0-9]+/g, "")}-${base.startsWith("Fully") ? "fs-" : ""}${String(litres).replace(".", "")}l`,
  cat: "oil",
  name: `${base} ${grade}, ${OIL_SPEC.split(", ")[1]}, ${litres} L`,
  spec: `${OIL_SPEC} · ${litres} L sealed bottle`,
  price,
  icon: "oil",
  specs: [
    ["Grade (SAE)", grade],
    ["Class", `${OIL_SPEC} (also meets API SL/SJ and JASO MA)`],
    ["Base", base],
    ["Bottle", `${litres} L, sealed, batch code on the cap`],
  ],
  why,
  fit: { type: "oil", grade, litres },
});

const WHY_OIL = "The grade your owner's manual names, in a sealed bottle from the importer, so you skip the guesswork and the fakes at the roadside shop.";

const tyre = (id: string, name: string, sizes: string[], price: number, spec: string, why: string): Product => ({
  id,
  cat: "tyres",
  name,
  spec: `${spec} · ${sizes.length} sizes`,
  price,
  icon: "tyre",
  specs: [
    ["Type", spec],
    ["Sizes", sizes.join(", ")],
    ["Date code", "Under 12 months old at dispatch"],
  ],
  why,
  fit: { type: "tyre", sizes },
});

export const PRODUCTS: Product[] = [
  // ---- Engine oil: every grade in bikes.json engineOil, 0.8 L and 1 L (tests/marketplace.test.ts checks the grades) ----
  oil("10W-30", "Semi-synthetic", 0.8, 560, WHY_OIL),
  oil("10W-30", "Semi-synthetic", 1, 680, WHY_OIL),
  oil("10W-40", "Semi-synthetic", 0.8, 590, WHY_OIL),
  oil("10W-40", "Semi-synthetic", 1, 720, WHY_OIL),
  oil("10W-40", "Fully synthetic", 1, 1150, "For riders who push a 150-250cc engine hard in the heat and want longer protection between changes."),
  oil("15W-50", "Fully synthetic", 0.8, 990, WHY_OIL),
  oil("15W-50", "Fully synthetic", 1, 1190, WHY_OIL),
  oil("20W-50", "Mineral", 0.8, 480, WHY_OIL),
  oil("20W-50", "Mineral", 1, 590, WHY_OIL),

  // ---- Parts: generic by type, ordered for your exact model ----
  {
    id: "pads-front-disc", cat: "parts", name: "Front disc brake pads (set)", spec: "Semi-metallic · for your model's caliper", price: 650, icon: "brake",
    specs: [["Fits", "Front disc brake"], ["Compound", "Semi-metallic, low dust"], ["Pack", "1 pair, with shims"]],
    why: "Pads are the part most often faked. A worn pad on a disc brake also eats the disc, which costs five times more.",
    fit: { type: "brake", end: "front", kind: "disc" },
  },
  {
    id: "pads-rear-disc", cat: "parts", name: "Rear disc brake pads (set)", spec: "Semi-metallic · for your model's caliper", price: 550, icon: "brake",
    specs: [["Fits", "Rear disc brake"], ["Compound", "Semi-metallic"], ["Pack", "1 pair"]],
    why: "Rear pads wear faster in city traffic, and most riders never check them.",
    fit: { type: "brake", end: "rear", kind: "disc" },
  },
  {
    id: "shoes-front-drum", cat: "parts", name: "Front drum brake shoes (pair)", spec: "Asbestos-free lining", price: 380, icon: "brake",
    specs: [["Fits", "Front drum brake"], ["Lining", "Asbestos-free"], ["Pack", "2 shoes with springs"]],
    why: "Cheap shoes glaze in the rain. A known lining stops the same way wet or dry.",
    fit: { type: "brake", end: "front", kind: "drum" },
  },
  {
    id: "shoes-rear-drum", cat: "parts", name: "Rear drum brake shoes (pair)", spec: "Asbestos-free lining", price: 350, icon: "brake",
    specs: [["Fits", "Rear drum brake"], ["Lining", "Asbestos-free"], ["Pack", "2 shoes with springs"]],
    why: "The most-used brake on a commuter. Worth replacing before the rivets touch the drum.",
    fit: { type: "brake", end: "rear", kind: "drum" },
  },
  {
    id: "air-filter", cat: "parts", name: "Air filter element", spec: "Paper element · ordered for your exact model", price: 420, icon: "filter",
    specs: [["Type", "Dry paper element"], ["Change", "About every 12,000 km, sooner on dusty roads"]],
    why: "Dhaka dust clogs filters fast. A clogged one quietly costs you mileage.",
    fit: { type: "engine" },
  },
  {
    id: "spark-plug", cat: "parts", name: "Spark plug", spec: "Nickel or iridium, per your manual's heat range", price: 280, icon: "plug",
    specs: [["Type", "As the manual specifies (heat range, gap)"], ["Change", "About every 10,000 km"]],
    why: "A worn plug means hard morning starts and poor mileage. It takes five minutes to change.",
    fit: { type: "engine" },
  },
  {
    id: "chain-kit", cat: "parts", name: "Chain & sprocket kit", spec: "O-ring or standard chain, both sprockets", price: 2600, icon: "chain",
    specs: [["Includes", "Chain, front and rear sprocket, master link"], ["Teeth", "Matched to your model's stock gearing"]],
    why: "Change all three together. A new chain on worn sprockets wears out in weeks.",
    fit: { type: "chain" },
  },
  {
    id: "clutch-plates", cat: "parts", name: "Clutch plate set", spec: "Friction plates, full set", price: 1450, icon: "parts",
    specs: [["Includes", "All friction plates for one clutch"], ["Sign it is due", "Revs rise but the bike does not speed up"]],
    why: "Stop-go traffic wears clutches early. A full set avoids mixing old and new plates.",
    fit: { type: "clutch" },
  },

  // ---- Tyres: every size in bikes.json (tests check coverage) ----
  tyre("tyre-street-17-narrow", "Street tyre, 17-inch, narrow", ["80/100-17", "90/80-17", "90/90-17", "100/80-17", "100/90-17", "110/70-17", "110/80-17"], 2700, "Tubeless, street pattern", "The front tyre on most 100-165cc bikes. Fresh stock matters: rubber hardens on a shelf."),
  tyre("tyre-street-17-wide", "Street tyre, 17-inch, wide", ["120/80-17", "130/70-17", "140/60-17", "140/70-17", "150/60-17"], 4300, "Tubeless, street pattern", "Rear tyres on 150cc and up. Grip in the wet is the first thing a cheap rear gives up."),
  tyre("tyre-commuter-tube", "Commuter tyre, 17/18-inch", ["2.50-17", "2.75-17", "3.00-17", "2.50-18", "2.75-18", "3.00-18", "3.75-18", "80/100-18", "90/90-18"], 1900, "Tube-type, ribbed or block pattern", "The everyday tyre on spoke-wheel commuters and classics. Long-wearing compound."),
  tyre("tyre-scooter", "Scooter tyre, 10-14-inch", ["90/100-10", "110/90-10", "3.00-10", "90/90-12", "100/80-12", "110/70-12", "110/80-12", "120/70-12", "100/80-14", "110/80-14", "120/70-14", "140/70-14"], 2300, "Tubeless, scooter pattern", "Small wheels wear fast and hit potholes hard. A fresh tyre is the cheapest safety upgrade."),
  tyre("tyre-dual-purpose", "Dual-purpose tyre, 18-21-inch", ["90/90-21", "100/90-19", "120/80-18"], 3900, "Tube-type, 70/30 road/trail", "For adventure and classic bikes that leave the tarmac now and then."),
  tyre("tyre-cruiser", "Cruiser tyre, 15/16-inch", ["130/90-15", "110/90-16", "90/90-16", "3.00-16"], 3600, "Tube-type, cruiser pattern", "Wide, low-profile sizes that local shops rarely keep in stock."),

  // ---- Helmets & gear ----
  {
    id: "helmet-full-face", cat: "gear", name: "Full-face helmet, ECE 22.06", spec: "Polycarbonate shell · clear visor · S to XL", price: 6500, icon: "helmet",
    specs: [["Standard", "ECE 22.06"], ["Shell", "Polycarbonate"], ["Visor", "Clear, anti-scratch, pinlock-ready"], ["Sizes", "S, M, L, XL"]],
    why: "Most helmets sold here carry no real test sticker. This is the one item we would never stock without a verifiable standard.",
  },
  {
    id: "helmet-open-face", cat: "gear", name: "Open-face helmet, DOT", spec: "Long visor · light for city riding", price: 3200, icon: "helmet",
    specs: [["Standard", "DOT FMVSS 218"], ["Visor", "Long clear visor"], ["Sizes", "M, L, XL"]],
    why: "Cooler in Dhaka heat than a full-face, and still a certified shell.",
  },
  {
    id: "helmet-modular", cat: "gear", name: "Modular (flip-up) helmet, ECE 22.06", spec: "Flip-up chin bar · sun visor", price: 8900, icon: "helmet",
    specs: [["Standard", "ECE 22.06 (P/J, tested both ways)"], ["Extras", "Drop-down sun visor"], ["Sizes", "M, L, XL"]],
    why: "For ride-share riders who talk to passengers and toll booths all day.",
  },
  {
    id: "gloves", cat: "gear", name: "Riding gloves with knuckle armour", spec: "Mesh, touchscreen fingertips", price: 1400, icon: "gloves",
    specs: [["Material", "Mesh and synthetic leather"], ["Armour", "Hard knuckle, palm slider"], ["Sizes", "M, L, XL"]],
    why: "Hands go down first in a fall. Mesh keeps them usable in summer.",
  },
  {
    id: "jacket", cat: "gear", name: "Mesh riding jacket with armour", spec: "CE level 1 shoulder and elbow armour", price: 5200, icon: "jacket",
    specs: [["Armour", "CE level 1, shoulder and elbow; back pad pocket"], ["Material", "Mesh with reflective panels"], ["Sizes", "M to XXL"]],
    why: "Made for 35°C: you will actually wear it, which is the point.",
  },
  {
    id: "rain-suit", cat: "gear", name: "Two-piece rain suit", spec: "Jacket and trousers · reflective strips", price: 1600, icon: "rain",
    specs: [["Pieces", "Jacket and trousers, in a pouch"], ["Seams", "Taped"], ["Sizes", "M to XXL"]],
    why: "Monsoon commuting without arriving soaked. Folds under the seat.",
  },

  // ---- Locks & security ----
  {
    id: "disc-lock-alarm", cat: "security", name: "Disc lock with alarm", spec: "110 dB alarm · reminder cable", price: 1800, icon: "lock",
    specs: [["Pin", "6 mm hardened steel"], ["Alarm", "110 dB on movement"], ["Includes", "Bright reminder cable, 2 keys"]],
    why: "Small, loud and quick to fit. The reminder cable stops you riding off with it on.",
  },
  {
    id: "u-lock", cat: "security", name: "Heavy U-lock", spec: "16 mm shackle · fits most wheels", price: 2200, icon: "lock",
    specs: [["Shackle", "16 mm hardened steel"], ["Keys", "3, with a key number card"]],
    why: "For parking overnight on the street. Locks a wheel to something fixed.",
  },
  {
    id: "chain-lock", cat: "security", name: "Armoured chain lock, 1.2 m", spec: "10 mm links in a fabric sleeve", price: 2900, icon: "chain",
    specs: [["Length", "1.2 m"], ["Links", "10 mm hardened steel"], ["Sleeve", "Fabric, protects paint"]],
    why: "Long enough to lock the frame to a pillar or gate in a building garage.",
  },
  {
    id: "gps-tracker", cat: "security", name: "GPS tracker (needs a SIM)", spec: "Hidden install · phone app location", price: 3500, icon: "tracker",
    specs: [["Power", "From the bike battery, small backup cell"], ["Needs", "A data SIM and a monthly plan (not included)"]],
    why: "Bike theft is common and recovery is rare. A tracker gives the police somewhere to start.",
  },

  // ---- Care ----
  {
    id: "chain-lube", cat: "care", name: "Chain lube spray, 150 ml", spec: "O-ring safe · low fling", price: 450, icon: "spray",
    specs: [["Size", "150 ml"], ["Safe for", "O-ring and X-ring chains"], ["Use", "Every 500 km or after rain"]],
    why: "The cheapest way to make a chain kit last twice as long.",
    fit: { type: "chain" },
  },
  {
    id: "chain-cleaner", cat: "care", name: "Chain cleaner, 500 ml", spec: "Use before lube · O-ring safe", price: 550, icon: "spray",
    specs: [["Size", "500 ml"], ["Safe for", "O-ring and X-ring chains"]],
    why: "Lube on a dirty chain makes grinding paste. Clean first.",
    fit: { type: "chain" },
  },
  {
    id: "bike-wash", cat: "care", name: "Bike wash shampoo, 1 L", spec: "pH neutral · safe on matte paint", price: 380, icon: "care",
    specs: [["Size", "1 L, about 20 washes"], ["Safe on", "Paint, matte finish, rubber"]],
    why: "Detergent powder strips wax and dries out rubber seals.",
  },
  {
    id: "microfibre", cat: "care", name: "Microfibre cloth set (3)", spec: "Wash, dry and polish", price: 300, icon: "care",
    specs: [["Pack", "3 cloths, 40 x 40 cm"]],
    why: "Small thing, but it stops the swirl marks an old T-shirt leaves.",
  },

  // ---- Accessories ----
  {
    id: "phone-mount", cat: "accessories", name: "Handlebar phone mount", spec: "Aluminium · vibration damper", price: 1500, icon: "phone",
    specs: [["Fits", "Handlebars 22-32 mm and mirror stems"], ["Phones", "4.7 to 7 inch"], ["Damper", "Rubber, protects the camera"]],
    why: "Ride-share riders mount a phone all day. Engine vibration can ruin a phone camera without a damper.",
  },
  {
    id: "bike-cover", cat: "accessories", name: "Rain cover for the bike", spec: "Waterproof · lock holes · fits most bikes", price: 950, icon: "rain",
    specs: [["Size", "Fits bikes up to 2.1 m long"], ["Extras", "Lock holes, elastic hem, carry bag"]],
    why: "Keeps rain and dust off a bike parked outside, which is most bikes here.",
  },
  {
    id: "tank-bag", cat: "accessories", name: "Strap-on tank bag, 8 L", spec: "Phone window · rain cover", price: 1900, icon: "bag",
    specs: [["Volume", "8 L"], ["Mounting", "Straps, works on plastic tanks"], ["Extras", "Clear phone window, rain cover"]],
    why: "Straps, not magnets, so it fits the many bikes with plastic tank covers.",
  },
  {
    id: "usb-charger", cat: "accessories", name: "Handlebar USB charger", spec: "USB-C + USB-A · waterproof cap · fused", price: 850, icon: "usb",
    specs: [["Ports", "USB-C PD and USB-A"], ["Wiring", "Inline fuse, switched by the ignition"]],
    why: "Keeps a navigation phone alive. The fuse and ignition switch protect your battery.",
  },
  {
    id: "seat-cover", cat: "accessories", name: "Mesh seat cover", spec: "Keeps the seat cooler in the sun", price: 450, icon: "accessory",
    specs: [["Fits", "Most single and split seats"], ["Material", "3D air mesh"]],
    why: "A seat parked in the sun at noon is too hot to sit on. This helps.",
  },
];

const BY_ID = new Map(PRODUCTS.map((p) => [p.id, p]));
export const getProduct = (id: string) => BY_ID.get(id);
