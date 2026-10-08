import { dedupe, expiresAt, isExpired, listingKey, rankListings, summarize } from "../src/lib/finder";
import type { Listing, MatchResult } from "../src/lib/finder";
import { log, maskPhone, phoneId } from "./log";
import type { Messenger, PhoneState, SourceAdapter, Store, StoredRequest } from "./types";

export const DAY_MS = 86_400_000;

export interface RunOptions {
  store: Store;
  sources: SourceAdapter[];
  messenger: Messenger;
  now?: Date;
  /** Hard cap on messages per run. */
  maxMessages?: number;
  /** Write state back to the store. Set false for dry runs so nothing changes. Default true. */
  persist?: boolean;
}

export interface RunReport {
  requests: number;
  skipped: { id: string; reason: string }[];
  results: { id: string; summary: string; found: number; newMatches: MatchResult[]; sent: boolean; deferred: string }[];
  messagesSent: number;
}

/** One nightly pass. Safe to run twice: notified listings are remembered and one message per user per day is enforced. */
export async function runOnce(opts: RunOptions): Promise<RunReport> {
  const now = opts.now ?? new Date();
  const maxMessages = opts.maxMessages ?? 30;
  const { requests, phones } = await opts.store.load();
  const messaged = new Set<string>(); // phones messaged in this run (also guards dry runs)
  const report: RunReport = { requests: requests.length, skipped: [], results: [], messagesSent: 0 };

  const phoneOf = (r: StoredRequest): PhoneState => (phones[phoneId(r.request.whatsapp)] ??= {});

  // Opt-out is per phone number: STOP on one request closes every request from that number.
  for (const r of requests) {
    if (phoneOf(r).optedOut && r.state.status === "open") r.state.status = "opted-out";
    if (r.state.status === "open" && isExpired(r.request, now)) r.state.status = "expired";
  }

  for (const r of requests) {
    const { request: req, state } = r;
    const who = { request: req.id, to: maskPhone(req.whatsapp) };
    if (state.status !== "open") {
      report.skipped.push({ id: req.id, reason: state.status });
      log("skip", { ...who, reason: state.status, expiredOn: state.status === "expired" ? expiresAt(req).toISOString().slice(0, 10) : undefined });
      continue;
    }
    if (!req.consent) {
      report.skipped.push({ id: req.id, reason: "no WhatsApp consent" });
      log("skip", { ...who, reason: "no consent" });
      continue;
    }

    // 1. Search every source. A failing source must not stop the others.
    const found: Listing[] = [];
    for (const src of opts.sources) {
      try {
        found.push(...(await src.search(req)));
      } catch (e) {
        log("source.error", { source: src.name, message: e instanceof Error ? e.message : String(e) });
      }
    }
    // 2. Score, de-duplicate, keep eligible, drop what we already told this user about.
    const ranked = rankListings(req, dedupe(found));
    const fresh = ranked.filter((m) => !state.notified.includes(listingKey(m.listing)));
    state.lastRunAt = now.toISOString();
    for (const m of fresh) {
      const key = listingKey(m.listing);
      if (!state.matches.some((x) => x.key === key)) state.matches.push({ key, url: m.listing.url, title: m.listing.title, score: m.score, seenAt: now.toISOString() });
    }
    state.matches = state.matches.slice(-20);

    const entry = { id: req.id, summary: summarize(req), found: found.length, newMatches: fresh, sent: false, deferred: "" };
    report.results.push(entry);
    log("searched", { ...who, listings: found.length, eligible: ranked.length, fresh: fresh.length });
    if (!fresh.length) continue;

    // 3. Message rules: 1 per user per day, global cap per run.
    const ph = phoneOf(r);
    if (messaged.has(phoneId(req.whatsapp)) || (ph.lastMessageAt && now.getTime() - new Date(ph.lastMessageAt).getTime() < DAY_MS)) {
      entry.deferred = "already messaged this user in the last 24 hours";
      log("defer", { ...who, reason: entry.deferred });
      continue;
    }
    if (report.messagesSent >= maxMessages) {
      entry.deferred = `per-run cap of ${maxMessages} messages reached`;
      log("defer", { ...who, reason: entry.deferred });
      continue;
    }
    const best = fresh[0];
    const out = await opts.messenger.send(req, best, fresh.length - 1);
    if (out.ok) {
      entry.sent = true;
      report.messagesSent++;
      messaged.add(phoneId(req.whatsapp));
      state.notified.push(listingKey(best.listing));
      state.lastNotifiedAt = now.toISOString();
      // A dry run records nothing about the user, so a real run can still deliver tonight's matches.
      if (out.dryRun) {
        state.notified.pop();
        state.lastNotifiedAt = undefined;
      } else ph.lastMessageAt = now.toISOString();
    } else {
      entry.deferred = `send failed: ${out.error}`;
      log("send.failed", { ...who, error: out.error });
    }
  }

  if (opts.persist !== false) await opts.store.save(requests, phones);
  return report;
}
