// Writes src/data/generated/price-history.json from every committed version of src/data/bikes.json
// (plus uncommitted edits, dated today). Without git history (shallow clone, no .git) it warns and keeps only the current prices.
// Runs with build-data before `dev`, `build` and `typecheck`.
import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { diffSnapshots, type SnapBike, type Snapshot } from "../src/lib/history";

const root = new URL("..", import.meta.url);
const FILE = "src/data/bikes.json";
const git = (...args: string[]) => execFileSync("git", args, { cwd: root, encoding: "utf8", maxBuffer: 256 << 20, stdio: ["ignore", "pipe", "ignore"] });
const slim = (json: string): SnapBike[] => (JSON.parse(json) as SnapBike[]).map(({ id, brand, model, priceBDT, priceAsOf }) => ({ id, brand, model, priceBDT, priceAsOf }));
const today = new Date().toISOString().slice(0, 10);
const current = slim(readFileSync(new URL(FILE, root), "utf8"));

let snaps: Snapshot[] = [];
try {
  if (git("rev-parse", "--is-shallow-repository").trim() === "true") throw new Error("shallow clone");
  // --follow + --name-only gives the file's path at each commit, so renames still resolve.
  const log = git("log", "--follow", "--name-only", "--format=@%H %cI", "--", FILE).split("@").filter(Boolean);
  // shortcut: re-reads every version each build (6 commits, ~0.1 s); cache by sha if this grows past a few hundred commits.
  snaps = log.reverse().map((entry) => {
    const [head, ...paths] = entry.trim().split(/\n+/);
    const [sha, date] = head.split(" ");
    return { date: date.slice(0, 10), bikes: slim(git("show", `${sha}:${paths.at(-1)}`)) };
  });
  if (!snaps.length) throw new Error(`no commits touch ${FILE}`);
  if (git("status", "--porcelain", "--", FILE).trim()) snaps.push({ date: today, bikes: current });
} catch (e) {
  console.warn(`history: WARNING no git history (${(e as Error).message.split("\n")[0]}); price history shows current prices only`);
  snaps = [{ date: today, bikes: current }];
}

const history = diffSnapshots(snaps);
mkdirSync(new URL("src/data/generated/", root), { recursive: true });
writeFileSync(new URL("src/data/generated/price-history.json", root), JSON.stringify(history));
console.log(`history: ${snaps.length} versions of ${FILE} → ${history.events.length} change events`);
