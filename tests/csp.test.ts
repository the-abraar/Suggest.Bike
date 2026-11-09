// scripts/csp-hash.mjs (postbuild) on small exported-page fixtures: hash-based script-src, meta placement, SRI gate. Run: npm test.
import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const HEAD = '<!DOCTYPE html><html lang="en"><head><meta charSet="utf-8"/>';
const THEME = "(function(){document.documentElement.dataset.theme='dark'})()";
const PUSH = 'self.__next_f.push([1,"x"])';
const page = (head = "", body = "") =>
  `${HEAD}<meta name="viewport" content="width=device-width"/><script src="/_next/static/chunks/a.js" async=""></script>${head}<script>${THEME}</script></head><body>${body}<script>${PUSH}</script></body></html>`;
const sha = (s: string) => `'sha256-${createHash("sha256").update(s).digest("base64")}'`;

const run = (files: Record<string, string>) => {
  const dir = mkdtempSync(join(tmpdir(), "sb-csp-"));
  for (const [f, html] of Object.entries(files)) writeFileSync(join(dir, f), html);
  const r = spawnSync(process.execPath, [new URL("../scripts/csp-hash.mjs", import.meta.url).pathname, dir], { encoding: "utf8" });
  const read = (f: string) => readFileSync(join(dir, f), "utf8");
  return { code: r.status, err: r.stderr, read, again: () => spawnSync(process.execPath, [new URL("../scripts/csp-hash.mjs", import.meta.url).pathname, dir], { encoding: "utf8" }) };
};
const csp = (html: string) => html.match(/<meta http-equiv="Content-Security-Policy" content="([^"]*)"\/>/)?.[1] ?? "";
const directive = (policy: string, name: string) => policy.split(";").map((d) => d.trim()).find((d) => d.startsWith(name + " ")) ?? "";

test("csp: one meta right after charset, every inline script hashed, no 'unsafe-inline' scripts", () => {
  const r = run({ "index.html": page() });
  assert.equal(r.code, 0, r.err);
  const html = r.read("index.html");
  assert.ok(html.startsWith(`${HEAD}<meta http-equiv="Content-Security-Policy" content="`), html.slice(0, 200));
  assert.equal(html.match(/Content-Security-Policy/g)?.length, 1);
  const p = csp(html);
  const s = directive(p, "script-src");
  assert.ok(s.startsWith("script-src 'self' "), s);
  assert.ok(s.includes(sha(THEME)) && s.includes(sha(PUSH)), s);
  assert.ok(!/unsafe-inline|unsafe-eval|gc\.zgo\.at/.test(s), s);
  for (const d of ["base-uri 'none'", "object-src 'none'", "form-action 'self' https://formspree.io", "img-src 'self' data: blob:"]) assert.ok(p.includes(d), `${d} missing: ${p}`);
  assert.ok(!/fonts\.googleapis|fonts\.gstatic|goatcounter|img-src[^;]* https:[;\s]/.test(p), p);
});

test("csp: re-running on its own output is refused (no second meta)", () => {
  const r = run({ "index.html": page() });
  assert.equal(r.code, 0, r.err);
  assert.notEqual(r.again().status, 0);
});

test("csp: a page whose head does not start with the charset meta fails the build", () => {
  assert.notEqual(run({ "index.html": page().replace('<meta charSet="utf-8"/>', "") }).code, 0);
});

test("csp: a page that already carries a CSP meta fails the build", () => {
  const html = page('<meta http-equiv="Content-Security-Policy" content="script-src \'unsafe-inline\'"/>');
  assert.notEqual(run({ "index.html": html }).code, 0);
});

test("csp: a third-party script without SRI fails the build", () => {
  const gc = '<script async="" data-goatcounter="https://demo.goatcounter.com/count" src="https://gc.zgo.at/count.v5.js"></script>';
  const r = run({ "index.html": page(gc) });
  assert.notEqual(r.code, 0);
  assert.match(r.err, /integrity/);
});

test("csp: GoatCounter with SRI gets its exact script URL and its own counter host only", () => {
  const gc = '<script async="" data-goatcounter="https://demo.goatcounter.com/count" src="https://gc.zgo.at/count.v5.js" integrity="sha384-abc" crossorigin="anonymous"></script>';
  const r = run({ "index.html": page(gc) });
  assert.equal(r.code, 0, r.err);
  const p = csp(r.read("index.html"));
  assert.ok(directive(p, "script-src").includes(" https://gc.zgo.at/count.v5.js "), p);
  assert.equal(directive(p, "connect-src"), "connect-src 'self' https://demo.goatcounter.com https://formspree.io");
  assert.equal(directive(p, "img-src"), "img-src 'self' data: blob: https://demo.goatcounter.com");
  assert.ok(!p.includes("*."), p);
});

test("csp: nested pages are rewritten too", () => {
  const dir = mkdtempSync(join(tmpdir(), "sb-csp-nested-"));
  mkdirSync(join(dir, "bn", "bikes"), { recursive: true });
  writeFileSync(join(dir, "bn", "bikes", "index.html"), page());
  const r = spawnSync(process.execPath, [new URL("../scripts/csp-hash.mjs", import.meta.url).pathname, dir], { encoding: "utf8" });
  assert.equal(r.status, 0, r.stderr);
  assert.ok(csp(readFileSync(join(dir, "bn", "bikes", "index.html"), "utf8")).includes(sha(PUSH)));
});
