// Convert bike photos in public/bikes/*.jpg to 800px-wide WebP, point bikes.json at the .webp, delete the JPG.
// Rerun after adding a new JPG photo: node scripts/webp-photos.mjs. Uses sharp (installed with Next).
import fs from "node:fs";
import sharp from "sharp";

const DIR = "public/bikes";
const DATA = "src/data/bikes.json";
let json = fs.readFileSync(DATA, "utf8");
let before = 0, after = 0;

for (const f of fs.readdirSync(DIR).filter((f) => /\.jpe?g$/i.test(f))) {
  const src = `${DIR}/${f}`;
  const out = src.replace(/\.jpe?g$/i, ".webp");
  await sharp(src).resize({ width: 800, withoutEnlargement: true }).webp({ quality: 75 }).toFile(out);
  const ref = `"/bikes/${f}"`;
  if (!json.includes(ref)) throw new Error(`${ref} not referenced in ${DATA}; left both files`);
  json = json.replaceAll(ref, `"/bikes/${f.replace(/\.jpe?g$/i, ".webp")}"`);
  before += fs.statSync(src).size;
  after += fs.statSync(out).size;
  fs.rmSync(src);
}
fs.writeFileSync(DATA, json); // string replace keeps the file's formatting
console.log(`photos: ${before} B jpg -> ${after} B webp`);
