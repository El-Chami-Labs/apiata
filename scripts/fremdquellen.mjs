#!/usr/bin/env node
// Datenschutz am Build: keine Google Fonts, keine fremd geladenen Skripte, Stile, Schriften, Bilder oder Einbettungen.
// Normale Links auf fremde Seiten sind erlaubt. node scripts/fremdquellen.mjs [dist]
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dateien, seitenPfad } from "./build-text.mjs";

const FREMD = /^(https?:)?\/\//i;

export function fremdeQuellen(html) {
  const raus = [];
  if (/fonts\.(googleapis|gstatic)\.com/i.test(html)) raus.push("Google Fonts eingebunden (Schriften selbst hosten mit @fontsource)");
  for (const m of html.matchAll(/<(script|img|iframe|source|video|audio|embed|object)\b[^>]*\s(?:src|data)=["']([^"']+)["']/gi))
    if (FREMD.test(m[2])) raus.push(`<${m[1]}> lädt von fremdem Server: ${m[2]}`);
  for (const m of html.matchAll(/<link\b[^>]*>/gi)) {
    const href = m[0].match(/href=["']([^"']+)["']/i)?.[1] ?? "";
    if (FREMD.test(href) && /rel=["'][^"']*(stylesheet|preload|preconnect|icon|modulepreload|dns-prefetch)/i.test(m[0]))
      raus.push(`<link> zu fremdem Server: ${href}`);
  }
  for (const m of html.matchAll(/@import\s+(?:url\()?["']?((?:https?:)?\/\/[^"')\s]+)/gi)) raus.push(`@import von fremdem Server: ${m[1]}`);
  for (const m of html.matchAll(/url\(\s*["']?((?:https?:)?\/\/[^"')\s]+)/gi)) raus.push(`url() von fremdem Server: ${m[1]}`);
  return [...new Set(raus)];
}

function main() {
  const dist = process.argv[2] ?? "dist";
  const liste = [];
  for (const d of dateien(dist, [".html", ".css"])) {
    const wo = d.endsWith(".css") ? d.replace(dist, "") : seitenPfad(dist, d);
    for (const b of fremdeQuellen(readFileSync(d, "utf8"))) liste.push(`${wo}: ${b}`);
  }
  for (const b of liste) console.log(`muss: Datenschutz: ${b}`);
  console.log(liste.length ? `FREMDQUELLEN ROT (${liste.length})` : "FREMDQUELLEN OK");
  process.exit(liste.length ? 1 : 0);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) main();
