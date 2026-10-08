import { existsSync } from "node:fs";
import type { FinderRequest, Listing } from "../../src/lib/finder";
import { log } from "../log";
import type { SourceAdapter } from "../types";

/**
 * Best-effort Bikroy adapter. READ finder/README.md BEFORE ENABLING.
 *
 * - OFF unless FINDER_BIKROY=1. The owner must first review Bikroy's terms of service and robots.txt.
 * - Kill switch: set FINDER_DISABLE_BIKROY=1, or create the file finder/KILL. Either stops all fetches at once.
 * - Polite: identifies itself, honours robots.txt (Disallow for "*"), waits between requests, at most 2 pages per search.
 * - Public search pages only. No login, no private data, no images downloaded, nothing from Facebook.
 * - The page markup is not under our control. parseBikroyHtml() is written against common patterns and
 *   a synthetic fixture; it has NOT been verified against the live site. Expect to adjust it.
 */

const BASE = "https://bikroy.com";
export const USER_AGENT = "SuggestBikeFinder/0.1 (+https://suugest.bike; hello@suugest.bike) polite-bot";
const DELAY_MS = Number(process.env.FINDER_FETCH_DELAY_MS ?? 4000);
const MAX_PAGES = 2;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export const killed = () => process.env.FINDER_DISABLE_BIKROY === "1" || existsSync(new URL("../KILL", import.meta.url));

/** Minimal robots.txt check: Disallow rules in the "User-agent: *" group, prefix match. */
export function robotsAllows(robotsTxt: string, path: string): boolean {
  let applies = false;
  const disallow: string[] = [];
  for (const raw of robotsTxt.split(/\r?\n/)) {
    const line = raw.replace(/#.*/, "").trim();
    const m = line.match(/^([a-z-]+)\s*:\s*(.*)$/i);
    if (!m) continue;
    const k = m[1].toLowerCase();
    if (k === "user-agent") applies = m[2].trim() === "*";
    else if (applies && k === "disallow" && m[2].trim()) disallow.push(m[2].trim());
  }
  return !disallow.some((d) => path.startsWith(d));
}

const toNumber = (s: string) => Number(s.replace(/[^\d]/g, ""));

/** Parses ad cards from a search results page. Pure; exported for tests. */
export function parseBikroyHtml(html: string): Listing[] {
  const out: Listing[] = [];
  // Pattern: <a href="/en/ad/slug"> ... title ... "Tk 1,55,000" ... location </a>
  const re = /<a\b[^>]*href="(\/(?:en\/)?ad\/[^"#?]+)[^"]*"[^>]*>([\s\S]*?)<\/a>/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html))) {
    const inner = m[2].replace(/<[^>]+>/g, " ").replace(/&amp;/g, "&").replace(/\s+/g, " ").trim();
    if (!inner) continue;
    const price = inner.match(/(?:Tk|৳)\s*([\d,]+)/i);
    const title = inner.replace(/(?:Tk|৳)\s*[\d,]+/i, "").trim().slice(0, 200);
    out.push({
      source: "bikroy",
      url: BASE + m[1],
      title,
      priceBDT: price ? toNumber(price[1]) : undefined,
    });
  }
  return out;
}

export function bikroyAdapter(): SourceAdapter {
  let robots: string | undefined;
  const cache = new Map<string, Listing[]>(); // one fetch per distinct query per run

  async function get(url: string): Promise<string | null> {
    if (killed()) return null;
    const r = await fetch(url, { headers: { "user-agent": USER_AGENT, accept: "text/html", "accept-language": "en" } });
    if (r.status === 429 || r.status === 403) {
      log("bikroy.blocked", { status: r.status });
      process.env.FINDER_DISABLE_BIKROY = "1"; // back off for the rest of this run
      return null;
    }
    return r.ok ? await r.text() : null;
  }

  return {
    name: "bikroy",
    async search(req: FinderRequest) {
      if (process.env.FINDER_BIKROY !== "1") {
        log("bikroy.skipped", { reason: "FINDER_BIKROY is not 1" });
        return [];
      }
      if (killed()) {
        log("bikroy.skipped", { reason: "kill switch" });
        return [];
      }
      const query = req.model;
      if (cache.has(query)) return cache.get(query) as Listing[];
      try {
        if (robots === undefined) robots = (await get(`${BASE}/robots.txt`)) ?? "";
        const path = "/en/ads/bangladesh/motorbikes-scooters";
        if (!robotsAllows(robots, path)) {
          log("bikroy.skipped", { reason: "robots.txt disallows" });
          return [];
        }
        const all: Listing[] = [];
        for (let page = 1; page <= MAX_PAGES; page++) {
          await sleep(DELAY_MS);
          const html = await get(`${BASE}${path}?query=${encodeURIComponent(query)}&page=${page}`);
          if (!html) break;
          const found = parseBikroyHtml(html);
          all.push(...found);
          if (!found.length) break;
        }
        cache.set(query, all);
        log("bikroy.fetched", { query, listings: all.length });
        return all;
      } catch (e) {
        log("bikroy.error", { message: e instanceof Error ? e.message : String(e) });
        return [];
      }
    },
  };
}
