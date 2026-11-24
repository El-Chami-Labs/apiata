#!/usr/bin/env node
// Paket-Prüfung: direkte Abhängigkeiten nur mit Freigabe (docs/pakete-freigegeben.md), Lizenzen aller Pakete der
// Lock-Datei (auch indirekte) aus der erlaubten Liste. Aufruf: node scripts/pakete.mjs [projektordner]
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

export const ERLAUBTE_LIZENZEN = [
  "MIT", "MIT-0", "ISC", "BSD-2-Clause", "BSD-3-Clause", "0BSD", "Apache-2.0", "OFL-1.1", "BlueOak-1.0.0",
  "CC0-1.0", "CC-BY-4.0", "Unlicense", "Python-2.0", "MPL-2.0", "Zlib", "WTFPL",
];

// Indirekte Pakete, die nur beim Bauen laufen und nicht in der Website landen
export const LIZENZ_AUSNAHMEN = [
  { muster: /^@img\/sharp-/, grund: "Bildverarbeitung von Astro beim Build (libvips, LGPL), nicht ausgeliefert" },
];

/** Freigaben: Map name → Set der Versionen ("*" = jede) */
export function freigabenLesen(text) {
  const map = new Map();
  for (const zeile of text.split("\n")) {
    const m = zeile.match(/^\|\s*`?([@a-z0-9][^|`\s]*)`?\s*\|\s*`?([^|`\s]+)`?\s*\|/i);
    if (!m || m[1] === "Paket" || /^-+$/.test(m[1])) continue;
    if (!map.has(m[1])) map.set(m[1], new Set());
    map.get(m[1]).add(m[2]);
  }
  return map;
}

export function freigabenDatei(ordner = ".") {
  const pfad = join(ordner, "docs/pakete-freigegeben.md");
  return existsSync(pfad) ? freigabenLesen(readFileSync(pfad, "utf8")) : new Map();
}

const reineVersion = (v) => String(v ?? "").replace(/^[\^~=v]/, "");

/** Ist name@version freigegeben? version darf fehlen (dann reicht der Name). */
export function freigegeben(freigaben, name, version) {
  const gruppe = [...freigaben.keys()].find((k) => k.endsWith("/*") && name.startsWith(k.slice(0, -1)));
  const v = freigaben.get(name) ?? (gruppe ? freigaben.get(gruppe) : undefined);
  if (!v) return false;
  if (v.has("*") || !version || version === "latest") return true;
  return v.has(reineVersion(version));
}

/** Nicht freigegebene direkte Abhängigkeiten aus package.json-Objekt */
export function ungeprueft(paket, freigaben) {
  const raus = [];
  for (const feld of ["dependencies", "devDependencies", "optionalDependencies", "peerDependencies"])
    for (const [name, version] of Object.entries(paket?.[feld] ?? {})) {
      const alias = String(version).match(/^npm:(@?[^@]+)(?:@(.+))?$/);
      if (alias) { if (!freigegeben(freigaben, alias[1], alias[2])) raus.push(`${name}@${version}`); continue; }
      if (/^(github|git|git\+\w+|https?|file|link|workspace):|\//.test(String(version))) { raus.push(`${name}@${version}`); continue; }
      if (!freigegeben(freigaben, name, version)) raus.push(`${name}@${version}`);
    }
  return raus;
}

/** SPDX-Ausdruck erlaubt? (OR: eine reicht, AND: alle) */
export function lizenzErlaubt(lizenz) {
  if (!lizenz) return false;
  const text = String(lizenz).replace(/[()]/g, " ").trim();
  const oder = text.split(/\s+OR\s+/i);
  if (oder.length > 1) return oder.some(lizenzErlaubt);
  const und = text.split(/\s+AND\s+/i);
  if (und.length > 1) return und.every(lizenzErlaubt);
  return ERLAUBTE_LIZENZEN.includes(text.trim());
}

/** Pakete der Lock-Datei mit nicht erlaubter oder unbekannter Lizenz */
export function lizenzBefunde(lock, ordner = ".") {
  const raus = [];
  for (const [pfad, eintrag] of Object.entries(lock?.packages ?? {})) {
    if (!pfad) continue;
    const name = pfad.split("node_modules/").pop();
    let lizenz = eintrag.license;
    const pj = join(ordner, pfad, "package.json");
    if (!lizenz && existsSync(pj)) {
      try {
        const p = JSON.parse(readFileSync(pj, "utf8"));
        lizenz = p.license ?? p.licenses?.[0]?.type;
      } catch { /* unlesbar: bleibt unbekannt */ }
    }
    if (LIZENZ_AUSNAHMEN.some((a) => a.muster.test(name))) continue;
    if (!lizenzErlaubt(lizenz)) raus.push(`${name}@${eintrag.version}: Lizenz ${lizenz ?? "unbekannt"}`);
  }
  return raus;
}

function main() {
  const ordner = process.argv[2] ?? ".";
  const paket = JSON.parse(readFileSync(join(ordner, "package.json"), "utf8"));
  const befunde = ungeprueft(paket, freigabenDatei(ordner)).map((p) => `muss: Paket ohne Freigabe: ${p} (Ahmad gibt frei mit „PAKET-FREIGABE: ${p} <Lizenz>“)`);
  const lockPfad = join(ordner, "package-lock.json");
  if (existsSync(lockPfad))
    befunde.push(...lizenzBefunde(JSON.parse(readFileSync(lockPfad, "utf8")), ordner).map((b) => `muss: Lizenz nicht erlaubt: ${b}`));
  else befunde.push("muss: package-lock.json fehlt");
  for (const b of befunde) console.log(b);
  console.log(befunde.length ? `PAKETE ROT (${befunde.length})` : "PAKETE OK");
  process.exit(befunde.length ? 1 : 0);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) main();
