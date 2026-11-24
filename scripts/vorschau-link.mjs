#!/usr/bin/env node
// Vorschau-Link des aktuellen Branchs: https://<branch>-<worker>.<subdomain>.workers.dev, Branchname ungekürzt.
// Über 63 Zeichen (<branch>-<worker>) kürzt Cloudflare und hängt eine Prüfsumme an: dann nur der Link aus dem
// Cloudflare-Kommentar im Pull Request. Links nie von Hand schreiben.
// node scripts/vorschau-link.mjs [branch]
// node scripts/vorschau-link.mjs --pruefen <datei> [branch]   jeder workers.dev-Link der Datei passt zum Branch
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { projektLesen } from "./build-text.mjs";

export const DNS_GRENZE = 63;

export const alias = (branch) => branch.toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/^-+|-+$/g, "");

/** { link } oder { link: null, grund } */
export function vorschau(branch, projekt) {
  if (!projekt.worker || !projekt.subdomain || projekt.subdomain === "offen") return { link: null, grund: "worker oder subdomain fehlt in projekt.json" };
  const name = `${alias(branch)}-${projekt.worker}`;
  if (name.length > DNS_GRENZE)
    return { link: null, grund: `„${name}“ hat mehr als ${DNS_GRENZE} Zeichen; Cloudflare kürzt mit Prüfsumme: Link aus dem Cloudflare-Kommentar im Pull Request übernehmen` };
  return { link: `https://${name}.${projekt.subdomain}.workers.dev` };
}

export const vorschauLink = (branch, projekt) => vorschau(branch, projekt).link;

/** Befunde für workers.dev-Links in einem Text, die nicht zum Branch passen; leer = alles richtig. */
export function linksPruefen(text, branch, projekt) {
  const { link, grund } = vorschau(branch, projekt);
  if (!link && !/Cloudflare-Kommentar/.test(grund ?? "")) return [grund];
  const ende = `-${projekt.worker}.${projekt.subdomain}.workers.dev`;
  const erlaubt = link ? (h) => h === new URL(link).host : (h) => h.endsWith(ende) && /^[a-z0-9-]+--[a-z0-9]{4}$/.test(h.slice(0, -ende.length));
  const hosts = [...text.matchAll(/https?:\/\/([a-z0-9.-]+\.workers\.dev)/gi)].map((m) => m[1].toLowerCase());
  if (!hosts.length) return ["kein Vorschau-Link (workers.dev) gefunden"];
  return [...new Set(hosts.filter((h) => !erlaubt(h)))].map((h) => `Vorschau-Link ${h} passt nicht zum Branch „${branch}“ (richtig: ${link ?? `Link aus dem Cloudflare-Kommentar, endet auf ${ende}`})`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  const ip = args.indexOf("--pruefen");
  const rest = args.filter((a, i) => a !== "--pruefen" && !(ip >= 0 && i === ip + 1));
  const branch = rest[0] ?? execFileSync("git", ["branch", "--show-current"], { encoding: "utf8" }).trim();
  const projekt = projektLesen(".");
  if (ip >= 0) {
    const befunde = linksPruefen(readFileSync(args[ip + 1], "utf8"), branch, projekt);
    for (const b of befunde) console.log(`muss: ${b}`);
    console.log(befunde.length ? `VORSCHAU-LINKS ROT (${befunde.length})` : "VORSCHAU-LINKS OK");
    process.exit(befunde.length ? 1 : 0);
  }
  const { link, grund } = vorschau(branch, projekt);
  console.log(link ?? `FEHLER: ${grund}`);
  process.exit(link ? 0 : 1);
}
