#!/usr/bin/env node
// Fotos und Videos aus medien-eingang/ (nie im Repo) aufbereiten nach public/medien/: Fotos als WebP 960/1920 ohne
// Metadaten, Videos als MP4 (H.264) und WebM ohne Ton mit Standbild. Quellen in public/medien/QUELLEN.md.
// node scripts/medien.mjs [--eingang medien-eingang] [--ziel public/medien] [--quelle "Ahmad, eigene Aufnahme"]
import { spawnSync } from "node:child_process";
import { appendFileSync, existsSync, mkdirSync, readdirSync, readFileSync } from "node:fs";
import { basename, extname, join } from "node:path";

const args = process.argv.slice(2);
const wert = (n, d) => (args.includes(n) ? args[args.indexOf(n) + 1] : d);
const eingang = wert("--eingang", "medien-eingang");
const ziel = wert("--ziel", "public/medien");
const quelle = wert("--quelle", "vom Nutzer geliefert");

if (!existsSync(".gitignore") || !readFileSync(".gitignore", "utf8").split("\n").includes(`${eingang}/`)) {
  console.log(`FEHLER: ${eingang}/ steht nicht in .gitignore; Originale dürfen nie ins Repo`);
  process.exit(2);
}
if (spawnSync("ffmpeg", ["-version"]).status !== 0) {
  console.log("FEHLER: ffmpeg fehlt. Im Report melden: „offen: Medien nicht aufbereitet, ffmpeg fehlt“");
  process.exit(3);
}
if (!existsSync(eingang)) { console.log(`FEHLER: ${eingang}/ fehlt`); process.exit(2); }
mkdirSync(ziel, { recursive: true });
const ff = (...a) => spawnSync("ffmpeg", ["-y", "-loglevel", "error", ...a], { encoding: "utf8" });
const name = (d) => basename(d, extname(d)).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
let fehler = 0;
for (const d of readdirSync(eingang)) {
  const quellpfad = join(eingang, d);
  const n = name(d);
  if (/\.(jpe?g|png|webp|heic|tiff?)$/i.test(d)) {
    for (const b of [960, 1920]) {
      const r = ff("-i", quellpfad, "-map_metadata", "-1", "-vf", `scale='min(${b},iw)':-2`, "-q:v", "78", join(ziel, `${n}-${b}.webp`));
      if (r.status !== 0) { fehler++; console.log(`muss: Foto ${d}: ${r.stderr.split("\n")[0]}`); break; }
    }
    console.log(`FOTO ${d} → ${ziel}/${n}-960.webp, -1920.webp`);
  } else if (/\.(mp4|mov|webm|m4v)$/i.test(d)) {
    const v = "scale='min(1920,iw)':-2";
    const a = ff("-i", quellpfad, "-map_metadata", "-1", "-an", "-vf", v, "-c:v", "libx264", "-crf", "26", "-preset", "slow", "-movflags", "+faststart", "-pix_fmt", "yuv420p", join(ziel, `${n}.mp4`));
    const b = ff("-i", quellpfad, "-map_metadata", "-1", "-an", "-vf", v, "-c:v", "libvpx-vp9", "-crf", "36", "-b:v", "0", join(ziel, `${n}.webm`));
    const c = ff("-i", quellpfad, "-vframes", "1", "-vf", v, join(ziel, `${n}-standbild.webp`));
    if ([a, b, c].some((r) => r.status !== 0)) { fehler++; console.log(`muss: Video ${d} nicht vollständig aufbereitet`); continue; }
    console.log(`VIDEO ${d} → ${ziel}/${n}.mp4, .webm, -standbild.webp`);
  } else continue;
  appendFileSync(join(ziel, "QUELLEN.md"), `- ${n}: ${quelle} (Original ${d}, ${new Date().toISOString().slice(0, 10)})\n`);
}
console.log(fehler ? `MEDIEN ROT (${fehler})` : "MEDIEN OK");
process.exit(fehler ? 1 : 0);
