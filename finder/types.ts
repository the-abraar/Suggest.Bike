import type { FinderRequest, Listing, MatchResult } from "../src/lib/finder";

/** A place to look for bikes. Return [] on any failure; never throw for a single bad page. */
export interface SourceAdapter {
  name: string;
  search(req: FinderRequest): Promise<Listing[]>;
}

export type RequestStatus = "open" | "expired" | "opted-out";

/** Per-request bookkeeping that the agent updates. */
export interface RequestState {
  status: RequestStatus;
  /** listingKey() values already sent to the user. */
  notified: string[];
  lastRunAt?: string;
  lastNotifiedAt?: string;
  /** Best matches seen so far (kept for the match report). Small on purpose. */
  matches: { key: string; url: string; title: string; score: number; seenAt: string }[];
}

export interface StoredRequest {
  request: FinderRequest;
  state: RequestState;
}

/** Per-phone bookkeeping, keyed by phoneId() so raw numbers are not used as keys. */
export interface PhoneState {
  optedOut?: boolean;
  optedOutAt?: string;
  lastMessageAt?: string;
}

/**
 * Where requests and state live.
 *  - FileStore: JSON files in finder/data (development and GitHub Actions artifacts).
 *  - HttpStore: talks to the Cloudflare Worker's /admin endpoints (production).
 * See finder/README.md for a GitHub-issue or Google Sheet alternative.
 */
export interface Store {
  load(): Promise<{ requests: StoredRequest[]; phones: Record<string, PhoneState> }>;
  save(requests: StoredRequest[], phones: Record<string, PhoneState>): Promise<void>;
}

export interface SendOutcome {
  ok: boolean;
  dryRun: boolean;
  id?: string;
  error?: string;
}

export interface Messenger {
  send(req: FinderRequest, match: MatchResult, extraCount: number): Promise<SendOutcome>;
}
