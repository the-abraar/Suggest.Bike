/**
 * Suggest.Bike Bike-finder Worker (REFERENCE, not deployed).
 *
 *   POST /requests            public form endpoint (CORS locked to SITE_ORIGIN, validated, rate limited)
 *   GET  /whatsapp/webhook    Meta webhook verification
 *   POST /whatsapp/webhook    incoming WhatsApp messages; "STOP" opts the sender out
 *   GET  /admin/state         nightly agent reads requests + state   (Bearer ADMIN_TOKEN)
 *   PUT  /admin/state         nightly agent writes state back        (Bearer ADMIN_TOKEN)
 *
 * Storage: one KV namespace (FINDER_KV). Keys: req:<id>, state:<id>, phone:<phoneId>, rl:<ipHash>:<hour>.
 * Requests expire from KV by themselves after 65 days (60-day life + 5 days grace), so old phone numbers do not linger.
 * Setup steps are in finder/README.md. Types for KV are declared here so the root `npm run typecheck` needs no extra packages.
 */
import { makeRequest, validateSubmission } from "../../src/lib/finder";
import type { FinderRequest } from "../../src/lib/finder";

interface KV {
  get(key: string): Promise<string | null>;
  put(key: string, value: string, opts?: { expirationTtl?: number }): Promise<void>;
  delete(key: string): Promise<void>;
  list(opts?: { prefix?: string; cursor?: string; limit?: number }): Promise<{ keys: { name: string }[]; list_complete: boolean; cursor?: string }>;
}

export interface Env {
  FINDER_KV: KV;
  /** e.g. https://suugest.bike  (exactly one origin) */
  SITE_ORIGIN: string;
  ADMIN_TOKEN: string;
  WHATSAPP_VERIFY_TOKEN: string;
  /** Meta app secret, used to verify webhook signatures. */
  WHATSAPP_APP_SECRET: string;
}

const DAY = 86_400;
const REQUEST_TTL = 65 * DAY;
const RATE_PER_HOUR = 5;
const MAX_BODY = 8 * 1024;
const STOP_WORDS = ["stop", "unsubscribe", "cancel", "quit", "বন্ধ", "স্টপ"];

const enc = new TextEncoder();
const hex = (b: ArrayBuffer) => [...new Uint8Array(b)].map((x) => x.toString(16).padStart(2, "0")).join("");
const sha = async (s: string) => hex(await crypto.subtle.digest("SHA-256", enc.encode(s)));
/** Must match phoneId() in finder/log.ts. */
const phoneId = async (phone: string) => (await sha(phone)).slice(0, 24);

function cors(env: Env, origin: string | null): Record<string, string> {
  return {
    "access-control-allow-origin": origin === env.SITE_ORIGIN ? env.SITE_ORIGIN : "null",
    "access-control-allow-methods": "POST, OPTIONS",
    "access-control-allow-headers": "content-type",
    "access-control-max-age": "86400",
    vary: "origin",
  };
}

const json = (body: unknown, status = 200, extra: Record<string, string> = {}) =>
  new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json", "cache-control": "no-store", ...extra } });

async function listAll(kv: KV, prefix: string): Promise<string[]> {
  const names: string[] = [];
  let cursor: string | undefined;
  do {
    const page = await kv.list({ prefix, cursor, limit: 1000 });
    names.push(...page.keys.map((k) => k.name));
    cursor = page.list_complete ? undefined : page.cursor;
  } while (cursor);
  return names;
}

async function timingSafeEqual(a: string, b: string) {
  const [x, y] = await Promise.all([sha(a), sha(b)]);
  let d = 0;
  for (let i = 0; i < x.length; i++) d |= x.charCodeAt(i) ^ y.charCodeAt(i);
  return d === 0;
}

async function hmacHex(secret: string, body: string) {
  const key = await crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return hex(await crypto.subtle.sign("HMAC", key, enc.encode(body)));
}

async function createRequest(req: Request, env: Env): Promise<Response> {
  const origin = req.headers.get("origin");
  const h = cors(env, origin);
  if (origin !== env.SITE_ORIGIN) return json({ error: "origin not allowed" }, 403, h);

  const text = await req.text();
  if (text.length > MAX_BODY) return json({ error: "too large" }, 413, h);

  // Per-IP rate limit. KV is eventually consistent, so this is a speed bump; use Cloudflare's Rate Limiting rules for a hard limit.
  const ip = req.headers.get("cf-connecting-ip") ?? "unknown";
  const rlKey = `rl:${(await sha(ip)).slice(0, 16)}:${Math.floor(Date.now() / 3_600_000)}`;
  const used = Number((await env.FINDER_KV.get(rlKey)) ?? 0);
  if (used >= RATE_PER_HOUR) return json({ error: "too many requests, try again later" }, 429, h);
  await env.FINDER_KV.put(rlKey, String(used + 1), { expirationTtl: 3600 });

  let body: unknown;
  try {
    body = JSON.parse(text);
  } catch {
    return json({ error: "invalid json" }, 400, h);
  }
  const v = validateSubmission(body);
  if (!v.ok) return json({ error: "invalid", fields: v.errors }, 400, h);

  const pid = await phoneId(v.value.whatsapp);
  const phone = await env.FINDER_KV.get(`phone:${pid}`);
  if (phone && (JSON.parse(phone) as { optedOut?: boolean }).optedOut) return json({ error: "this number has opted out; message us from WhatsApp to resume" }, 409, h);

  const id = crypto.randomUUID();
  const stored = makeRequest(v.value, id);
  await env.FINDER_KV.put(`req:${id}`, JSON.stringify(stored), { expirationTtl: REQUEST_TTL });
  return json({ id }, 201, h);
}

async function webhook(req: Request, env: Env, url: URL): Promise<Response> {
  if (req.method === "GET") {
    const ok = url.searchParams.get("hub.mode") === "subscribe" && url.searchParams.get("hub.verify_token") === env.WHATSAPP_VERIFY_TOKEN;
    return ok ? new Response(url.searchParams.get("hub.challenge") ?? "", { status: 200 }) : new Response("forbidden", { status: 403 });
  }
  const raw = await req.text();
  const sig = (req.headers.get("x-hub-signature-256") ?? "").replace("sha256=", "");
  if (!env.WHATSAPP_APP_SECRET || !(await timingSafeEqual(sig, await hmacHex(env.WHATSAPP_APP_SECRET, raw)))) return new Response("bad signature", { status: 401 });

  type Hook = { entry?: { changes?: { value?: { messages?: { from?: string; type?: string; text?: { body?: string } }[] } }[] }[] };
  const hook = JSON.parse(raw) as Hook;
  for (const e of hook.entry ?? [])
    for (const c of e.changes ?? [])
      for (const m of c.value?.messages ?? []) {
        const word = (m.text?.body ?? "").trim().toLowerCase();
        if (m.from && m.type === "text" && STOP_WORDS.includes(word)) {
          const id = await phoneId(`+${m.from}`);
          const old = JSON.parse((await env.FINDER_KV.get(`phone:${id}`)) ?? "{}") as object;
          await env.FINDER_KV.put(`phone:${id}`, JSON.stringify({ ...old, optedOut: true, optedOutAt: new Date().toISOString() }));
          // TODO (owner): optionally send a one-line "You are unsubscribed" reply with a free-form message (allowed inside the 24h window).
        }
      }
  return new Response("ok"); // always 200 so Meta does not retry
}

async function admin(req: Request, env: Env, url: URL): Promise<Response> {
  const auth = (req.headers.get("authorization") ?? "").replace(/^Bearer /, "");
  if (!env.ADMIN_TOKEN || !(await timingSafeEqual(auth, env.ADMIN_TOKEN))) return json({ error: "unauthorized" }, 401);
  if (url.pathname !== "/admin/state") return json({ error: "not found" }, 404);

  if (req.method === "GET") {
    const requests = await Promise.all(
      (await listAll(env.FINDER_KV, "req:")).map(async (k) => {
        const id = k.slice(4);
        const request = JSON.parse((await env.FINDER_KV.get(k)) ?? "null") as FinderRequest | null;
        const state = JSON.parse((await env.FINDER_KV.get(`state:${id}`)) ?? "null");
        return request ? { request, state: state ?? { status: "open", notified: [], matches: [] } } : null;
      }),
    );
    const phones: Record<string, unknown> = {};
    for (const k of await listAll(env.FINDER_KV, "phone:")) phones[k.slice(6)] = JSON.parse((await env.FINDER_KV.get(k)) ?? "{}");
    return json({ requests: requests.filter(Boolean), phones });
  }

  if (req.method === "PUT") {
    const body = (await req.json()) as { requests: { request: FinderRequest; state: unknown }[]; phones: Record<string, { optedOut?: boolean }> };
    for (const r of body.requests) await env.FINDER_KV.put(`state:${r.request.id}`, JSON.stringify(r.state), { expirationTtl: REQUEST_TTL });
    for (const [id, p] of Object.entries(body.phones)) {
      // Opt-out is sticky: a STOP that arrived while the agent was running must not be overwritten.
      const cur = JSON.parse((await env.FINDER_KV.get(`phone:${id}`)) ?? "{}") as { optedOut?: boolean };
      await env.FINDER_KV.put(`phone:${id}`, JSON.stringify({ ...p, optedOut: p.optedOut || cur.optedOut || undefined }), { expirationTtl: 400 * DAY });
    }
    return json({ ok: true });
  }
  return json({ error: "method not allowed" }, 405);
}

export default {
  async fetch(req: Request, env: Env): Promise<Response> {
    const url = new URL(req.url);
    try {
      if (url.pathname === "/requests") {
        if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: cors(env, req.headers.get("origin")) });
        if (req.method === "POST") return await createRequest(req, env);
        return json({ error: "method not allowed" }, 405);
      }
      if (url.pathname === "/whatsapp/webhook") return await webhook(req, env, url);
      if (url.pathname.startsWith("/admin/")) return await admin(req, env, url);
      return json({ error: "not found" }, 404);
    } catch {
      return json({ error: "server error" }, 500); // never echo internals or request bodies
    }
  },
};
