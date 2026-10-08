import type { FinderRequest, MatchResult } from "../src/lib/finder";
import { summarize } from "../src/lib/finder";
import { log, maskPhone } from "./log";
import type { Messenger, SendOutcome } from "./types";

const ADVERT_LINE = (m: MatchResult) =>
  `${m.listing.title}${m.listing.priceBDT ? `, ৳${m.listing.priceBDT.toLocaleString("en-IN")}` : ""}${m.listing.district ? `, ${m.listing.district}` : ""} (match ${m.score}/100)`.replace(/\s+/g, " ");

/** Template variables, in order. Create a template with these three placeholders and the STOP line (see README). */
export function templateParams(req: FinderRequest, m: MatchResult, extra: number): string[] {
  const more = extra > 0 ? ` +${extra} more waiting for tomorrow.` : "";
  return [summarize(req), ADVERT_LINE(m) + more, m.listing.url];
}

/** Prints what it would send. The default. */
export const dryRunMessenger: Messenger = {
  async send(req, m, extra): Promise<SendOutcome> {
    log("whatsapp.dry-run", { to: maskPhone(req.whatsapp), request: req.id, params: templateParams(req, m, extra) });
    return { ok: true, dryRun: true };
  },
};

/** Official WhatsApp Business Cloud API (Meta). Template messages only, so it works outside the 24-hour window. */
export function cloudApiMessenger(): Messenger {
  const token = process.env.WHATSAPP_TOKEN;
  const phoneId = process.env.WHATSAPP_PHONE_ID;
  const template = process.env.WHATSAPP_TEMPLATE;
  const version = process.env.WHATSAPP_API_VERSION ?? "v21.0";
  if (!token || !phoneId || !template) throw new Error("Live sending needs WHATSAPP_TOKEN, WHATSAPP_PHONE_ID and WHATSAPP_TEMPLATE.");
  return {
    async send(req, m, extra): Promise<SendOutcome> {
      // One template per language: WHATSAPP_TEMPLATE (English) and optionally WHATSAPP_TEMPLATE_BN.
      const name = req.lang === "bn" ? process.env.WHATSAPP_TEMPLATE_BN ?? template : template;
      const language = name === template ? process.env.WHATSAPP_TEMPLATE_LANG ?? "en" : process.env.WHATSAPP_TEMPLATE_LANG_BN ?? "bn";
      const body = {
        messaging_product: "whatsapp",
        to: req.whatsapp.replace(/^\+/, ""),
        type: "template",
        template: {
          name,
          language: { code: language },
          components: [{ type: "body", parameters: templateParams(req, m, extra).map((text) => ({ type: "text", text })) }],
        },
      };
      try {
        const r = await fetch(`https://graph.facebook.com/${version}/${phoneId}/messages`, {
          method: "POST",
          headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
          body: JSON.stringify(body),
        });
        const json = (await r.json().catch(() => ({}))) as { messages?: { id: string }[]; error?: { message?: string; code?: number } };
        if (!r.ok) {
          log("whatsapp.error", { to: maskPhone(req.whatsapp), status: r.status, code: json.error?.code });
          return { ok: false, dryRun: false, error: json.error?.message ?? `HTTP ${r.status}` };
        }
        log("whatsapp.sent", { to: maskPhone(req.whatsapp), request: req.id, id: json.messages?.[0]?.id });
        return { ok: true, dryRun: false, id: json.messages?.[0]?.id };
      } catch (e) {
        return { ok: false, dryRun: false, error: e instanceof Error ? e.message : String(e) };
      }
    },
  };
}
