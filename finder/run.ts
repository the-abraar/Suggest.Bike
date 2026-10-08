#!/usr/bin/env tsx
/**
 * Nightly Bike finder run.
 *
 *   npx tsx finder/run.ts --dry-run --fixtures      demo with built-in sample data (no network, nothing written)
 *   npx tsx finder/run.ts                           dry run against the real store and enabled sources
 *   FINDER_LIVE=1 npx tsx finder/run.ts             really send WhatsApp messages (needs the WHATSAPP_* env vars)
 *   npx tsx finder/run.ts --optout 01712345678      mark a number as opted out (file store)
 *   npx tsx finder/run.ts --forget 01712345678      delete a number's requests and state (file store)
 *
 * Store: FINDER_API + FINDER_ADMIN_TOKEN use the Cloudflare Worker; otherwise finder/data/*.json.
 */
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { normalizeBdPhone, type FinderRequest } from "../src/lib/finder";
import { runOnce, type RunReport } from "./agent";
import { log, logToFile, maskPhone, phoneId } from "./log";
import { FileStore, HttpStore, MemoryStore } from "./store";
import { bikroyAdapter } from "./sources/bikroy";
import { fixturesAdapter } from "./sources/fixtures";
import type { SourceAdapter, Store } from "./types";
import { cloudApiMessenger, dryRunMessenger } from "./whatsapp";

const here = dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const flag = (n: string) => args.includes(`--${n}`);
const value = (n: string) => (args.includes(`--${n}`) ? args[args.indexOf(`--${n}`) + 1] : undefined);

function printReport(rep: RunReport, live: boolean) {
  console.log(`\n=== Bike finder report (${live ? "LIVE" : "DRY RUN"}) ===`);
  console.log(`${rep.requests} request(s), ${rep.messagesSent} message(s) ${live ? "sent" : "that would be sent"}\n`);
  for (const s of rep.skipped) console.log(`- ${s.id}: skipped (${s.reason})`);
  for (const r of rep.results) {
    console.log(`\n* ${r.id}: ${r.summary}`);
    console.log(`  ${r.found} listing(s) fetched, ${r.newMatches.length} new eligible match(es)${r.deferred ? `, deferred: ${r.deferred}` : ""}${r.sent ? ", message queued for the best match" : ""}`);
    for (const m of r.newMatches) {
      console.log(`  - ${m.score}/100  ${m.listing.title}  ${m.listing.priceBDT ? "৳" + m.listing.priceBDT.toLocaleString("en-IN") : "no price"}  ${m.listing.url}`);
      for (const x of m.matched) console.log(`      ok       ${x.note}`);
      for (const x of m.unverifiable) console.log(`      ask/check ${x.note}`);
      for (const x of m.mismatched) console.log(`      no       ${x.note}`);
    }
  }
  console.log("");
}

async function main() {
  const fixtures = flag("fixtures");
  const dir = process.env.FINDER_DATA_DIR ?? join(here, "data");

  let store: Store;
  if (fixtures) store = new MemoryStore(JSON.parse(readFileSync(join(here, "fixtures/requests.json"), "utf8")) as FinderRequest[]);
  else if (process.env.FINDER_API && process.env.FINDER_ADMIN_TOKEN) store = new HttpStore(process.env.FINDER_API.replace(/\/$/, ""), process.env.FINDER_ADMIN_TOKEN);
  else {
    store = new FileStore(dir);
    logToFile(join(dir, "run.log"));
  }

  // Maintenance commands (file store only).
  const optout = value("optout");
  const forget = value("forget");
  if (optout || forget) {
    const phone = normalizeBdPhone((optout ?? forget) as string);
    if (!phone) throw new Error("That is not a valid Bangladesh number.");
    const { requests, phones } = await store.load();
    if (optout) {
      phones[phoneId(phone)] = { ...phones[phoneId(phone)], optedOut: true, optedOutAt: new Date().toISOString() };
      await store.save(requests, phones);
      log("optout", { to: maskPhone(phone) });
    } else {
      const keep = requests.filter((r) => r.request.whatsapp !== phone);
      delete phones[phoneId(phone)];
      const file = join(dir, "requests.json");
      if (existsSync(file)) writeFileSync(file, JSON.stringify(keep.map((r) => r.request), null, 2));
      await store.save(keep, phones);
      log("forget", { to: maskPhone(phone), removed: requests.length - keep.length });
    }
    return;
  }

  // Live only when explicitly asked: FINDER_LIVE=1, not --dry-run, and not a fixtures demo.
  const live = process.env.FINDER_LIVE === "1" && !flag("dry-run") && !fixtures;
  const sources: SourceAdapter[] = fixtures ? [fixturesAdapter(join(here, "fixtures/listings.json"))] : [bikroyAdapter()];
  const messenger = live ? cloudApiMessenger() : dryRunMessenger;

  const rep = await runOnce({ store, sources, messenger, persist: live, maxMessages: Number(process.env.FINDER_MAX_MESSAGES ?? 30), now: fixtures ? new Date("2026-10-09T18:00:00Z") : undefined });
  printReport(rep, live);
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
