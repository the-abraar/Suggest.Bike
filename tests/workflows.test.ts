// The price-refresh workflow keeps its write token away from npm code and edits only its own PR. Text checks, no YAML
// parser. Run: npm test.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const wf = readFileSync(new URL("../.github/workflows/price-refresh.yml", import.meta.url), "utf8");
const [top, jobs = ""] = wf.split(/^jobs:\n/m);
const job = (name: string) => jobs.split(/^ {2}(?=\S)/m).find((j) => j.startsWith(`${name}:`)) ?? "";

test("price-refresh: the default token is read-only", () => {
  assert.match(top, /^permissions:\n {2}contents: read\n(?! )/m);
});

test("price-refresh: scrape runs npm without a write token or a stored credential", () => {
  const s = job("scrape");
  assert.ok(s, "no scrape job");
  assert.match(s, /permissions:\n\s+contents: read\n/);
  assert.doesNotMatch(s, /: write|GH_TOKEN|github\.token|secrets\./);
  assert.match(s, /persist-credentials: false/);
  assert.match(s, /npm ci --ignore-scripts/);
});

test("price-refresh: publish holds the write token and runs no npm", () => {
  const p = job("publish");
  assert.ok(p, "no publish job");
  assert.match(p, /needs: scrape/);
  assert.match(p, /contents: write/);
  assert.match(p, /pull-requests: write/);
  assert.doesNotMatch(p, /\bnpm\b|\bnpx\b|\bnode\b|setup-node/);
});

test("price-refresh: publish unpacks the artifact outside the checkout", () => {
  const dl = job("publish").split(/- uses: actions\/download-artifact@/)[1]?.split(/\n {6}- /)[0] ?? "";
  assert.ok(dl, "no download-artifact step in publish");
  assert.match(dl, /^ +path: \$\{\{ runner\.temp \}\}\//m); // the default path is the workspace
});

test("price-refresh: the bot reuses only a PR whose head branch is in this repo", () => {
  assert.doesNotMatch(wf, /gh pr list/); // gh pr list --head matches same-named branches on forks too
  assert.match(wf, /head=\$\{GITHUB_REPOSITORY_OWNER\}:bot\/price-refresh/);
});

test("price-refresh: every action is pinned to a commit SHA", () => {
  for (const [, ref] of wf.matchAll(/uses: [^@\s]+@(\S+)/g)) assert.match(ref, /^[0-9a-f]{40}$/);
});
