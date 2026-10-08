import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import type { FinderRequest } from "../src/lib/finder";
import type { PhoneState, RequestState, Store, StoredRequest } from "./types";

export const freshState = (): RequestState => ({ status: "open", notified: [], matches: [] });

const readJson = <T>(p: string, fallback: T): T => {
  try {
    return existsSync(p) ? (JSON.parse(readFileSync(p, "utf8")) as T) : fallback;
  } catch {
    return fallback;
  }
};

/**
 * Development store. Reads data/requests.json (an array of FinderRequest, e.g. exported from the Worker)
 * and keeps bookkeeping in data/state.json. The data folder is git-ignored: it holds phone numbers.
 */
export class FileStore implements Store {
  constructor(private dir: string) {}

  async load() {
    const reqs = readJson<FinderRequest[]>(join(this.dir, "requests.json"), []);
    const saved = readJson<{ states: Record<string, RequestState>; phones: Record<string, PhoneState> }>(join(this.dir, "state.json"), { states: {}, phones: {} });
    return {
      requests: reqs.map((request): StoredRequest => ({ request, state: saved.states[request.id] ?? freshState() })),
      phones: saved.phones,
    };
  }

  async save(requests: StoredRequest[], phones: Record<string, PhoneState>) {
    mkdirSync(this.dir, { recursive: true });
    const states = Object.fromEntries(requests.map((r) => [r.request.id, r.state]));
    const tmp = join(this.dir, "state.json.tmp");
    writeFileSync(tmp, JSON.stringify({ states, phones }, null, 2));
    renameSync(tmp, join(this.dir, "state.json"));
  }
}

/** In-memory store for tests and --fixtures runs. Nothing is written to disk. */
export class MemoryStore implements Store {
  constructor(private reqs: FinderRequest[], private phones: Record<string, PhoneState> = {}, private states: Record<string, RequestState> = {}) {}
  async load() {
    return { requests: this.reqs.map((request): StoredRequest => ({ request, state: this.states[request.id] ?? freshState() })), phones: this.phones };
  }
  async save(requests: StoredRequest[], phones: Record<string, PhoneState>) {
    this.states = Object.fromEntries(requests.map((r) => [r.request.id, r.state]));
    this.phones = phones;
  }
}

/**
 * Production store: the Cloudflare Worker in finder/worker exposes GET /admin/state and PUT /admin/state,
 * protected by a bearer token (FINDER_ADMIN_TOKEN). Set FINDER_API to the Worker URL.
 */
export class HttpStore implements Store {
  constructor(private base: string, private token: string) {}
  private headers = () => ({ authorization: `Bearer ${this.token}`, "content-type": "application/json" });

  async load() {
    const r = await fetch(`${this.base}/admin/state`, { headers: this.headers() });
    if (!r.ok) throw new Error(`Worker returned ${r.status} for /admin/state`);
    const body = (await r.json()) as { requests: StoredRequest[]; phones: Record<string, PhoneState> };
    return { requests: body.requests.map((s) => ({ request: s.request, state: s.state ?? freshState() })), phones: body.phones ?? {} };
  }

  async save(requests: StoredRequest[], phones: Record<string, PhoneState>) {
    const r = await fetch(`${this.base}/admin/state`, { method: "PUT", headers: this.headers(), body: JSON.stringify({ requests, phones }) });
    if (!r.ok) throw new Error(`Worker returned ${r.status} when saving state`);
  }
}
