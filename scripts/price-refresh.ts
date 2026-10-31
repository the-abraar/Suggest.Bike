// Monthly price refresh from the official Bangladesh distributor pages (docs/price-refresh.md).
// Fetches every page in OFFICIAL plus each distributor's model list, compares them with src/data/bikes.json and prints
// the PR body: a summary table, models whose availability is unconfirmed, and the owner's checklist for every other bike.
// Without --dry-run it also writes the official prices into bikes.json and bumps priceAsOf for confirmed headline prices.
// Usage: tsx scripts/price-refresh.ts [--dry-run] [--body pr-body.md]
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

type Variant = { name: string; priceBDT: number; priceSource: string };
export type Bike = { id: string; brand: string; model: string; status: string; priceBDT: number; priceAsOf: string; priceSource: string; variants?: Variant[] };
type Row = { name: string; price: number };
/** A page fetch: the HTML, or the HTTP status when there is none (0 = network error or robots.txt disallows). */
export type Get = (url: string) => Promise<string | number>;

const UA = "suggest-bike-price-refresh/1 (+https://suggest.bike; monthly check of official prices, one request every 2 s)";
const DELAY_MS = 2000, SUSPECT = 0.3;
const host = (u: string) => new URL(u).hostname.replace(/^www\./, "");
// Hero's price pages are <model>-price-in-bangladesh.html; its list links <model>.html.
const slug = (u: string) => new URL(u).pathname.split("/").filter(Boolean).pop()?.replace(/(-price-in-bangladesh)?\.html$/, "") ?? "";
const norm = (s: string) => s.toLowerCase().replace(/\s+/g, " ").trim();
const text = (s: string) => s.replace(/<!--[\s\S]*?-->|<[^>]+>/g, " ").replace(/&amp;/g, "&").replace(/\s+/g, " ").trim();
const rows = (h: string, re: RegExp): Row[] =>
  [...h.matchAll(re)].map((m) => ({ name: text(m.groups!.name), price: Number(m.groups!.price.replace(/\D/g, "")) }));

// yamahabd.com (Nuxt 2) ships each colour's price in window.__NUXT__=function(a,b,…){return{…}}(v1,v2,…), where a repeated
// value is a parameter name bound to the matching argument. A colour's price is AfterDiscountPrice when set, else ProductColorMRP.
const NUXT_VALUE = String.raw`"(?:[^"\\]|\\.)*"|[\w$]+`;
function yamaha(h: string): Row[] {
  const m = h.match(/window\.__NUXT__=function\(([^)]*)\)\{([\s\S]*)\}\(([\s\S]*?)\)<\/script>/);
  if (!m) return [];
  const params = m[1].split(","), args = [...m[3].matchAll(/"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|[^,'"]+/g)].map((a) => a[0]);
  if (params.length !== args.length) return []; // the argument list did not split cleanly: no rows, never a guess
  const val = (v: string) => { const i = params.indexOf(v), s = i < 0 ? v : args[i]; return s.startsWith('"') ? String(JSON.parse(s)) : s; };
  const V = NUXT_VALUE;
  return [...m[2].matchAll(new RegExp(`ColorName:(${V}),ColorCode:(?:${V}),ProductColorMRP:(${V}),[^}]*?AfterDiscountPrice:(${V})`, "g"))]
    .map((r) => ({ name: val(r[1]), price: [val(r[3]), val(r[2])].map((p) => Number(p.replace(/\D/g, ""))).find((n) => n > 0) ?? 0 })) // a 0 discount means unset
    .filter((r) => r.price > 0);
}

// One parser per distributor: page HTML to [{ name, price }]. Each is pinned by trimmed live markup in tests/fixtures/price-refresh/.
export const PARSERS: Record<string, (html: string) => Row[]> = {
  "bajajauto.com": (h) => rows(h, /<h1 class="product-headerTxt">(?<name>[\s\S]*?)<\/h1>\s*<div class="price-tag">\s*<p[^>]*>Price:\s*<span>(?<price>[\d,]+) BDT/g),
  "bdhonda.com": (h) => rows(h.match(/<select[^>]*id="productVariants"[\s\S]*?<\/select>/)?.[0] ?? "", /<option value="(?<price>[\d,]+)">(?<name>[\s\S]*?)<\/option>/g),
  "suzuki.com.bd": (h) => rows(h, /truncate">(?<name>[^<]+)<\/p><p[^>]*>START FROM BDT (?<price>[\d,]+)</g),
  // Two page templates: variant cards (Bullet) and colour swatches (Hunter). Classic 350 and Meteor 350 load prices in the browser only.
  "royalenfield.com": (h) => [
    ...rows(h, /class="bike-var-name">(?<name>[\s\S]*?)<\/h3>[\s\S]*?class="bike-var-price"[^>]*>\s*BDT (?<price>[\d,]+)/g),
    ...rows(h, /color-variant-price="BDT (?<price>[\d,]+)\*?" color-variant-img-alt-text="(?<name>[^"]*)"/g),
  ],
  "heromotocorp.com": (h) => rows(h, /<td><p>(?<name>[^<]+)<\/p><\/td>\s*<td><p class="price-value">\s*(?<price>[\d,]+)/g),
  "waltonbd.com": (h) => rows(h, /<title>(?<name>[^<]+)<\/title>[\s\S]*?class="final_price">(?<price>[\d,]+)</g),
  "yamahabd.com": yamaha,
};

// Each distributor's current model list: [url, regex whose first group is a model key]. A key is the product URL's slug,
// or the row name where the list is itself the price page (Suzuki).
export const LISTS: Record<string, [string, RegExp]> = {
  "bajajauto.com": ["https://www.bajajauto.com/en-bd/bikes", /\/en-bd\/bikes\/([a-z0-9-]+)"/g],
  "bdhonda.com": ["https://www.bdhonda.com/", /\/products\/([\w-]+)"/g],
  "suzuki.com.bd": ["https://www.suzuki.com.bd/bikes", /truncate">([^<]+)<\/p><p[^>]*>START FROM/g],
  "royalenfield.com": ["https://www.royalenfield.com/bd/en/motorcycles/", /\/bd\/en\/motorcycles\/([a-z0-9-]+)\/"/g],
  "heromotocorp.com": ["https://www.heromotocorp.com/en-bd/price-list.html", /\/en-bd\/products\/[a-z]+\/([a-z0-9-]+?)(?:-price-in-bangladesh)?\.html/g],
  "waltonbd.com": ["https://waltonbd.com/takyon", /\/takyon\/([a-z0-9-]+)"/g],
  "yamahabd.com": ["https://www.yamahabd.com/sitemap.xml", /yamahabd\.com\/products\/([\w-]+)</g],
};
export const listKeys = (h: string, url: string) => new Set([...h.matchAll(LISTS[host(url)][1])].map((m) => norm(m[1])));
const keyOf = (url: string, row: string) => (url === LISTS[host(url)][0] ? norm(row) : norm(slug(url)));

// [bike id, variant name ("" = the headline price), official page, row name on that page ("" = the page's only row)].
// A test fails when a bike or variant priced from one of these hosts is missing here, or a row names an unknown bike.
export const OFFICIAL: [string, string, string, string][] = [
  ["bajaj-platina-100", "", "https://www.bajajauto.com/en-bd/bikes/platina-100-es", ""],
  ["bajaj-platina-110-h", "", "https://www.bajajauto.com/en-bd/bikes/platina-110-h", ""],
  ["bajaj-ct100", "", "https://www.bajajauto.com/en-bd/bikes/ct-100-es", ""],
  ["bajaj-discover-125", "", "https://www.bajajauto.com/en-bd/bikes/discover-125-disc", ""],
  ["bajaj-discover-125", "Disc", "https://www.bajajauto.com/en-bd/bikes/discover-125-disc", ""],
  ["bajaj-discover-110", "", "https://www.bajajauto.com/en-bd/bikes/discover-110-disc", ""],
  ["bajaj-pulsar-ns125", "", "https://www.bajajauto.com/en-bd/bikes/pulsar-ns125", ""],
  ["bajaj-pulsar-150", "", "https://www.bajajauto.com/en-bd/bikes/pulsar-150-sd", ""],
  ["bajaj-pulsar-150", "Single Disc", "https://www.bajajauto.com/en-bd/bikes/pulsar-150-sd", ""],
  ["bajaj-pulsar-150", "Single Disc ABS", "https://www.bajajauto.com/en-bd/bikes/pulsar-150-sd-abs", ""],
  ["bajaj-pulsar-150", "Twin Disc", "https://www.bajajauto.com/en-bd/bikes/pulsar-150-td", ""],
  ["bajaj-pulsar-150", "Twin Disc ABS", "https://www.bajajauto.com/en-bd/bikes/pulsar-150-td-abs", ""],
  ["bajaj-pulsar-n160", "", "https://www.bajajauto.com/en-bd/bikes/pulsar-n160-dc-abs", ""],
  ["bajaj-pulsar-n160", "Single Seat (single-channel ABS)", "https://www.bajajauto.com/en-bd/bikes/pulsar-n160-single-seat", ""],
  ["bajaj-pulsar-n160", "Twin Disc (carburettor)", "https://www.bajajauto.com/en-bd/bikes/pulsar-n160-td", ""],
  ["bajaj-pulsar-n160", "Fi ABS (Dual Channel, 26 mm telescopic fork)", "https://www.bajajauto.com/en-bd/bikes/pulsar-n160-dc-abs", ""],
  ["bajaj-pulsar-n160", "Dual Channel ABS, 37 mm USD fork", "https://www.bajajauto.com/en-bd/bikes/pulsar-n160", ""],
  ["bajaj-pulsar-n250", "", "https://www.bajajauto.com/en-bd/bikes/pulsar-n250", ""],
  ["bajaj-pulsar-f250", "", "https://www.bajajauto.com/en-bd/bikes/pulsar-f250", ""],
  ["honda-shine-100", "", "https://www.bdhonda.com/products/shine100", ""],
  ["honda-dream-110", "", "https://www.bdhonda.com/products/dream110", ""],
  ["honda-livo-110", "", "https://www.bdhonda.com/products/livo", ""],
  ["honda-livo-110", "Disc CBS", "https://www.bdhonda.com/products/livo", ""],
  ["honda-sp125", "", "https://www.bdhonda.com/products/sp125", ""],
  ["honda-sp160", "", "https://www.bdhonda.com/products/sp160", "Double Disc ABS"],
  ["honda-sp160", "Single Disc", "https://www.bdhonda.com/products/sp160", "Single Disc"],
  ["honda-sp160", "Double Disc ABS", "https://www.bdhonda.com/products/sp160", "Double Disc ABS"],
  ["honda-x-blade-160", "", "https://www.bdhonda.com/products/xblade", ""],
  ["honda-hornet-2-0", "", "https://www.bdhonda.com/products/hornet20", ""],
  ["honda-nx200", "", "https://www.bdhonda.com/products/nx200", ""],
  ["honda-cbr150r", "", "https://www.bdhonda.com/products/cbr150r", ""],
  ["honda-dio", "", "https://www.bdhonda.com/products/dio", ""],
  ["hero-hf-deluxe", "", "https://www.heromotocorp.com/en-bd/products/commuter/hf-deluxe-price-in-bangladesh.html", "HF Deluxe BS4 T/L"],
  // shortcut: Splendor+ prices load in the browser only, so the run reports this row "not found"; check by hand until Hero serves it in HTML.
  ["hero-splendor-plus", "", "https://www.heromotocorp.com/en-bd/products/commuter/splendor-plus.html", ""],
  ["hero-glamour-x-125", "", "https://www.heromotocorp.com/en-bd/products/executive/glamour-x-price-in-bangladesh.html", ""],
  ["hero-xtreme-125r", "", "https://www.heromotocorp.com/en-bd/products/executive/xtreme-125r-abs-price-in-bangladesh.html", "DISC SELF CAST (RED)"],
  ["hero-hunk-150r", "", "https://www.heromotocorp.com/en-bd/products/premium/hunk-150r-price-in-bangladesh.html", "Hunk 150R DD ABS"],
  ["hero-hunk-150r", "Dual Disc", "https://www.heromotocorp.com/en-bd/products/premium/hunk-150r-price-in-bangladesh.html", "Hunk 150R DD"],
  ["hero-hunk-150r", "Dual Disc ABS", "https://www.heromotocorp.com/en-bd/products/premium/hunk-150r-price-in-bangladesh.html", "Hunk 150R DD ABS"],
  ["hero-thriller-160r-4v", "", "https://www.heromotocorp.com/en-bd/products/premium/thriller-160r-4v-price-in-bangladesh.html", ""],
  ["hero-xpulse-200-4v", "", "https://www.heromotocorp.com/en-bd/products/premium/xpulse-200-4v-price-in-bangladesh.html", "Xpulse 200 4V"],
  ["hero-karizma-xmr-210", "", "https://www.heromotocorp.com/en-bd/products/premium/karizma-xmr-price-in-bangladesh.html", ""],
  ["hero-xoom-125r", "", "https://www.heromotocorp.com/en-bd/products/scooter/xoom-125r-fi-price-in-bangladesh.html", ""],
  ["hero-xpulse-200-4v-pro", "", "https://www.heromotocorp.com/en-bd/products/premium/xpulse-200-4v-price-in-bangladesh.html", "Xpulse 200 4V Pro"],
  ["royal-enfield-hunter-350", "", "https://www.royalenfield.com/bd/en/motorcycles/hunter-350/", "Rebel Blue"],
  ["royal-enfield-hunter-350", "Rebel Blue/Red/Black (dual-channel ABS)", "https://www.royalenfield.com/bd/en/motorcycles/hunter-350/", "Rebel Blue"],
  ["royal-enfield-bullet-350", "", "https://www.royalenfield.com/bd/en/motorcycles/bullet-350/", "Standard - Maroon"],
  ["royal-enfield-bullet-350", "Standard Maroon", "https://www.royalenfield.com/bd/en/motorcycles/bullet-350/", "Standard - Maroon"],
  ["royal-enfield-bullet-350", "Black Gold", "https://www.royalenfield.com/bd/en/motorcycles/bullet-350/", "Black Gold"],
  ["suzuki-hayate-ep", "", "https://www.suzuki.com.bd/bikes", "HAYATE EP"],
  ["suzuki-gsx-125", "", "https://www.suzuki.com.bd/bikes", "GSX 125"],
  ["suzuki-gixxer-monotone", "", "https://www.suzuki.com.bd/bikes", "GIXXER MONOTONE"],
  ["suzuki-gixxer-monotone", "Monotone", "https://www.suzuki.com.bd/bikes", "GIXXER MONOTONE"],
  ["suzuki-gixxer-monotone", "Classic Matt", "https://www.suzuki.com.bd/bikes", "GIXXER CLASSIC MATT"],
  ["suzuki-gixxer-carb-dd", "", "https://www.suzuki.com.bd/bikes", "GIXXER"],
  ["suzuki-gixxer-fi-abs", "Carburettor, Double Disc", "https://www.suzuki.com.bd/bikes", "GIXXER"],
  ["suzuki-gixxer-sf-fi-abs", "", "https://www.suzuki.com.bd/bikes", "GIXXER SF"],
  ["suzuki-gixxer-sf-fi-abs", "SF FI ABS", "https://www.suzuki.com.bd/bikes", "GIXXER SF"],
  ["suzuki-gixxer-250", "", "https://www.suzuki.com.bd/bikes", "GIXXER 250"],
  ["suzuki-gixxer-sf-250", "", "https://www.suzuki.com.bd/bikes", "GIXXER SF 250"],
  ["suzuki-gsx-r150", "", "https://www.suzuki.com.bd/bikes", "GSX-R150"],
  ["suzuki-access-125", "", "https://www.suzuki.com.bd/bikes", "ACCESS 125"],
  // Yamaha: the page lists a price per colour; the row is a colour at the price the data carries (the cheapest, as for R15 V4 and FZ25).
  ["yamaha-saluto-125", "", "https://www.yamahabd.com/products/yamaha-saluto-125-ubs", "Purplish Blue"],
  ["yamaha-fazer-fi-v2", "", "https://www.yamahabd.com/products/yamaha-fazer-fi-v2", "Midnight Black"],
  ["yamaha-fzs-fi-v4", "", "https://www.yamahabd.com/products/yamaha-fzs-v4", "Dark Matte Blue"],
  ["yamaha-fzs-v2-dd", "", "https://www.yamahabd.com/products/yamaha-fzs-v2", "Armada Blue"],
  ["yamaha-fzs-fi-hybrid", "", "https://www.yamahabd.com/products/yamaha-fzs-fi-hybrid", "Racing Blue"],
  ["yamaha-fz-x", "", "https://www.yamahabd.com/products/yamaha-fz-x", "DARK-MATTE-BLUE"],
  ["yamaha-fz25", "", "https://www.yamahabd.com/products/yamaha-fz-25", "Racing Blue"],
  ["yamaha-r15-v4", "", "https://www.yamahabd.com/products/yamaha-r15-v4", "METALLIC-RED"],
  ["yamaha-r15-v3", "", "https://www.yamahabd.com/products/yamaha-r15-v3", "Dark Knight"],
  ["yamaha-mt-15-v2", "", "https://www.yamahabd.com/products/yamaha-mt-15-v2", "Metallic Black"],
  ["yamaha-ray-zr-125", "", "https://www.yamahabd.com/products/yamaha-ray-zr-125", "SPARKLE-GREEN"],
  ["yamaha-aerox-155", "", "https://www.yamahabd.com/products/yamaha-aerox-155", "Metallic Black"],
  ["walton-takyon-fusion-25td", "", "https://waltonbd.com/takyon-fusion-25td", ""],
  ["walton-takyon-1-00", "", "https://waltonbd.com/takyon/takyon-1-00-38ah", ""],
  ["walton-takyon-fusion-swift", "", "https://waltonbd.com/takyon/takyon-fusion-1-00-swift", ""],
];

export type Check = { id: string; variant: string; url: string; row: string; old: number; now?: number; status: "same" | "changed" | "suspect" | "missing" | "error"; note: string };

/** Fetches every OFFICIAL page and model list once and compares each price with bikes.json. */
export async function check(bikes: Bike[], get: Get, official = OFFICIAL) {
  const pages = new Map<string, string | number>();
  const load = async (url: string) => { if (!pages.has(url)) pages.set(url, await get(url)); return pages.get(url)!; };
  const lists: Record<string, Set<string> | null> = {};
  for (const [h, [url]] of Object.entries(LISTS)) { const p = await load(url); lists[h] = typeof p === "string" ? listKeys(p, url) : null; }
  const checks: Check[] = [];
  for (const [id, variant, url, rowName] of official) {
    const bike = bikes.find((b) => b.id === id);
    const entry = variant ? bike?.variants?.find((v) => v.name === variant) : bike;
    if (!entry) throw new Error(`OFFICIAL names ${id} ${variant}, which is not in bikes.json`);
    const c: Check = { id, variant, url, row: rowName, old: entry.priceBDT, status: "error", note: "" };
    checks.push(c);
    const page = await load(url);
    if (typeof page === "number") { Object.assign(c, page === 404 || page === 410 ? { status: "missing", note: `page gone (HTTP ${page})` } : { note: page ? `HTTP ${page}` : "network error or robots.txt" }); continue; }
    const found = PARSERS[host(url)](page);
    const row = rowName ? found.find((r) => norm(r.name) === norm(rowName)) : found.length === 1 ? found[0] : undefined;
    if (!row) { Object.assign(c, { status: "missing", note: `no "${rowName || "price"}" row; page lists: ${found.map((r) => `${r.name} ${r.price}`).join(", ") || "nothing"}` }); continue; }
    c.now = row.price;
    // A big jump is more likely a parse or page error than a price change, so it goes to a person instead of the data.
    c.status = row.price === c.old ? "same" : Math.abs(row.price - c.old) / c.old > SUSPECT ? "suspect" : "changed";
    if (c.status === "suspect") c.note = `more than ${SUSPECT * 100}% from bikes.json; not written, check by hand`;
  }
  return { checks, lists };
}

/** Writes confirmed and changed official prices into bikes; bumps priceAsOf only where the headline price was confirmed. */
export function apply(bikes: Bike[], checks: Check[], month: string) {
  for (const c of checks.filter((x) => x.status === "same" || x.status === "changed")) {
    const bike = bikes.find((b) => b.id === c.id)!;
    const entry = c.variant ? bike.variants!.find((v) => v.name === c.variant)! : bike;
    entry.priceBDT = c.now!;
    entry.priceSource = c.url;
    if (!c.variant) bike.priceAsOf = month;
  }
}

const tk = (n?: number) => (n == null ? "—" : `৳${n.toLocaleString("en-IN")}`);
const day = (d: Date) => d.toLocaleDateString("en-CA", { timeZone: "Asia/Dhaka" }); // priceAsOf months are Bangladesh months

/** The PR body: summary table, availability, models the data lacks, and the owner's staggered checklist. */
export function body(bikes: Bike[], checks: Check[], lists: Record<string, Set<string> | null>, now: Date, official = OFFICIAL) {
  const n = (s: Check["status"]) => checks.filter((c) => c.status === s).length;
  const name = (id: string) => { const b = bikes.find((x) => x.id === id)!; return `${b.brand} ${b.model}`; };
  const confirmed = new Set(checks.filter((c) => !c.variant && (c.status === "same" || c.status === "changed")).map((c) => c.id));
  const out = [
    `Monthly price refresh, ${day(now)}. ${checks.length} official prices checked on ${new Set(checks.map((c) => c.url)).size} distributor pages: ` +
      `**${n("changed")} changed**, ${n("same")} unchanged, ${n("suspect")} suspect, ${n("missing")} not found, ${n("error")} not fetched.`,
    "",
    `This PR writes the changed prices and sets \`priceAsOf\` to ${day(now).slice(0, 7)} for the ${confirmed.size} bikes whose headline price the official page confirmed. ` +
      "Suspect, missing and unfetched prices are not written. How to review and merge: `docs/price-refresh.md`.",
    "", "## Official prices", "", "| Bike | Variant | bikes.json | Official | Result | Page |", "|---|---|---:|---:|---|---|",
  ];
  const order: Check["status"][] = ["changed", "suspect", "missing", "error", "same"];
  for (const c of [...checks].sort((a, b) => order.indexOf(a.status) - order.indexOf(b.status)))
    out.push(`| ${name(c.id)} | ${c.variant || "(headline)"} | ${tk(c.old)} | ${tk(c.now)} | ${c.status}${c.note ? `: ${c.note.replace(/\|/g, "/")}` : ""} | ${c.url} |`);

  // Availability: an on-sale bike of a covered brand is confirmed when its official page is on the distributor's list and still has its price.
  const brandHost = new Map(official.map(([id, , url]) => [bikes.find((b) => b.id === id)!.brand, host(url)]));
  const unconfirmed: string[] = [];
  for (const b of bikes.filter((x) => x.status === "on-sale" && brandHost.has(x.brand))) {
    const h = brandHost.get(b.brand)!, list = lists[h], c = checks.find((x) => x.id === b.id && !x.variant);
    const key = c ? keyOf(c.url, c.row) : host(b.priceSource) === h ? keyOf(b.priceSource, "") : "";
    let why = "";
    if (c?.status === "missing") why = c.note;
    else if (list && c?.status !== "error" && !list.has(key)) why = key ? `not on ${LISTS[h][0]}` : `no official price page known; look for it on ${LISTS[h][0]}`;
    if (why) unconfirmed.push(`- ${b.brand} ${b.model} (\`${b.id}\`): ${why}`);
  }
  for (const [h, list] of Object.entries(lists)) if (!list) unconfirmed.push(`- ${h}: model list ${LISTS[h][0]} did not load, so its availability was not checked.`);
  out.push("", "## Availability unconfirmed", "", "On sale in bikes.json, but not on the distributor's current list. The data is unchanged; check with the distributor or a showroom.", "", ...(unconfirmed.length ? unconfirmed : ["None."]));

  const mapped = new Set(official.map(([, , url, row]) => `${host(url)} ${keyOf(url, row)}`));
  const extra = Object.entries(lists).flatMap(([h, keys]) => [...(keys ?? [])].filter((k) => !mapped.has(`${h} ${k}`)).map((k) => `${h}: ${k}`));
  out.push("", "## On the distributor's list, not checked here", "", "New models, or pages for variants the data does not carry yet.", "", extra.length ? extra.sort().join(", ") : "None.");

  // Owner checklist: every bike whose headline price was not confirmed above, oldest first, a quarter due each week.
  const todo = bikes.filter((b) => !confirmed.has(b.id)).sort((a, b) => a.priceAsOf.localeCompare(b.priceAsOf) || a.id.localeCompare(b.id));
  const per = Math.ceil(todo.length / 4);
  out.push("", "## Owner checklist", "", `${todo.length} bikes need a manual check. Re-check each price at its source and update \`priceBDT\`, \`priceSource\` and \`priceAsOf\` (see \`docs/price-refresh.md\`). Used-only bikes: open the listing in a browser; scripts must not scrape Bikroy or BikeBD.`);
  for (let w = 0; w < 4; w++) {
    const due = new Date(now.getTime() + (w + 1) * 7 * 864e5);
    out.push("", `### Week ${w + 1}, due ${day(due)}`, "");
    for (const b of todo.slice(w * per, (w + 1) * per))
      out.push(`- [ ] ${b.brand} ${b.model} (\`${b.id}\`${b.status === "used-only" ? ", used market" : ""}): ${tk(b.priceBDT)} as of ${b.priceAsOf}. ${b.priceSource}`);
  }
  return out.join("\n") + "\n";
}

// Minimal robots.txt check for the "User-agent: *" group: the longest matching Allow/Disallow rule wins; supports * and $.
export function robotsAllows(robots: string, path: string) {
  let star = false, prevUA = false, best = { len: -1, allow: true };
  for (const raw of robots.split(/\r?\n/)) {
    const line = raw.replace(/#.*/, "").trim(), i = line.indexOf(":");
    if (i < 0) continue;
    const k = line.slice(0, i).trim().toLowerCase(), v = line.slice(i + 1).trim();
    if (k === "user-agent") { star = (prevUA && star) || v === "*"; prevUA = true; continue; }
    prevUA = false;
    if (!star || !v || (k !== "allow" && k !== "disallow")) continue;
    const re = new RegExp("^" + v.replace(/[.+?^{}()|[\]\\]/g, "\\$&").replace(/\*/g, ".*"));
    if (re.test(path) && v.length > best.len) best = { len: v.length, allow: k === "allow" };
  }
  return best.allow;
}

/** Live fetcher: honours robots.txt, sends a clear User-Agent and waits DELAY_MS between requests. */
export function liveGet(ua = UA): Get {
  const robots = new Map<string, string>();
  let last = 0;
  const fetchText = async (url: string) => {
    await new Promise((r) => setTimeout(r, Math.max(0, last + DELAY_MS - Date.now())));
    last = Date.now();
    const res = await fetch(url, { headers: { "user-agent": ua }, redirect: "follow", signal: AbortSignal.timeout(30_000) });
    return { status: res.status, body: res.ok ? await res.text() : "" };
  };
  // No robots.txt (4xx) allows everything; an unreachable one (5xx, network) blocks the host for this run, as crawlers do.
  const closed = "User-agent: *\nDisallow: /";
  return async (url) => {
    try {
      const { origin, pathname, search } = new URL(url);
      if (!robots.has(origin)) robots.set(origin, await fetchText(`${origin}/robots.txt`).then((r) => (r.status === 200 ? r.body : r.status < 500 ? "" : closed), () => closed));
      if (!robotsAllows(robots.get(origin)!, pathname + search)) return 0;
      const r = await fetchText(url);
      return r.status === 200 ? r.body : r.status;
    } catch { return 0; }
  };
}

async function main() {
  const argv = process.argv.slice(2), dry = argv.includes("--dry-run");
  const bodyFile = argv.includes("--body") ? argv[argv.indexOf("--body") + 1] : undefined;
  const file = new URL("../src/data/bikes.json", import.meta.url);
  const bikes: Bike[] = JSON.parse(readFileSync(file, "utf8"));
  const now = new Date();
  const { checks, lists } = await check(bikes, liveGet());
  if (checks.every((c) => c.status === "error")) { console.error("Every official page failed to load; the network may be down. Nothing written."); process.exit(1); }
  const md = body(bikes, checks, lists, now);
  if (bodyFile) writeFileSync(bodyFile, md); else process.stdout.write(md);
  const diff = checks.filter((c) => c.status === "changed").map((c) => `${c.id}${c.variant ? ` [${c.variant}]` : ""}: ${c.old} -> ${c.now}`);
  console.error(`${dry ? "Dry run, nothing written. " : ""}${diff.length} price changes${diff.length ? ":\n  " + diff.join("\n  ") : "."}`);
  if (dry) return;
  apply(bikes, checks, day(now).slice(0, 7));
  writeFileSync(file, JSON.stringify(bikes, null, 1) + "\n");
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) main().catch((e) => { console.error(e); process.exit(1); });
