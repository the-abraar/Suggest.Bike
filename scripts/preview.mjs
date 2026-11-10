// Serves ./out like GitHub Pages does: dir/ -> dir/index.html, and a missing path gets out/404.html with status 404.
// Node built-ins only, so `npm run preview` downloads nothing. Usage: node scripts/preview.mjs [port] (default 3000).
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, join, normalize, resolve, sep } from "node:path";

const ROOT = resolve("out");
const PORT = Number(process.argv[2] || process.env.PORT || 3000);
const TYPES = {
  ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".css": "text/css", ".json": "application/json",
  ".txt": "text/plain; charset=utf-8", ".xml": "application/xml", ".svg": "image/svg+xml", ".png": "image/png",
  ".jpg": "image/jpeg", ".webp": "image/webp", ".ico": "image/x-icon", ".woff2": "font/woff2", ".webmanifest": "application/manifest+json",
};

/** The file under ROOT for a URL path, or null if there is none (or the path escapes ROOT). */
async function resolveFile(urlPath) {
  let p;
  try { p = decodeURIComponent(urlPath.split("?")[0]); } catch { return null; }
  const file = normalize(join(ROOT, p));
  if (file !== ROOT && !file.startsWith(ROOT + sep)) return null;
  for (const f of [file, join(file, "index.html")]) {
    const s = await stat(f).catch(() => null);
    if (s?.isFile()) return f;
  }
  return null;
}

createServer(async (req, res) => {
  const file = await resolveFile(req.url || "/");
  const [status, f] = file ? [200, file] : [404, join(ROOT, "404.html")];
  const body = await readFile(f).catch(() => null);
  if (!body) { res.writeHead(500).end("run `npm run build` first: out/ is missing"); return; }
  res.writeHead(status, { "content-type": TYPES[extname(f)] || "application/octet-stream" }).end(body);
}).listen(PORT, () => console.log(`serving ./out at http://localhost:${PORT}`));
