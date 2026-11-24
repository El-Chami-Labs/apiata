#!/usr/bin/env node
// Unfertig-Sperre: Auf dem Produktionsbranch (main) bricht der Build ab, solange eine Seite „Platzhalter“ enthält
// (im Text, in Link-Zielen wie mailto:/tel: oder in alt, title, aria-label; auch Adressen wie @example.com, .invalid),
// Gestaltungsentwürfe (/gestaltung/) im Build liegen oder ab Prüfstufe 3 Impressum oder Datenschutz fehlen.
// Auf anderen Branches nur Hinweis. node scripts/unfertig-sperre.mjs [dist] [--main]
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dateien, linkUndAttributWerte, projektLesen, seitenPfad, sichtbarerText } from "./build-text.mjs";

/** Platzhalter-Adressen in Link-Zielen: reservierte Namen (RFC 2606) und beispiel.de */
export const PLATZHALTER_ADRESSE = /@(?:[\w-]+\.)*(?:example\.(?:com|org|net)|example|invalid|test|localhost|beispiel\.de)\b/i;

const BRANCH_VARIABLEN = ["WORKERS_CI_BRANCH", "CF_PAGES_BRANCH", "GITHUB_REF_NAME", "BRANCH"];

export function produktion(umgebung, projekt) {
  const branch = BRANCH_VARIABLEN.map((v) => umgebung[v]).find(Boolean);
  return branch !== undefined && branch === (projekt.produktionsbranch ?? "main");
}

export function befunde(dist, projekt) {
  const raus = [];
  const seiten = dateien(dist).map((d) => {
    const html = readFileSync(d, "utf8");
    return { pfad: seitenPfad(dist, d), text: sichtbarerText(html), werte: linkUndAttributWerte(html) };
  });
  for (const s of seiten) {
    const treffer = s.text.match(/Platzhalter(\s*:\s*[^.,;]{1,40})?/gi);
    if (treffer) raus.push(`${s.pfad}: ${treffer.length}× Platzhalter (${treffer[0]})`);
    for (const { art, wert } of s.werte)
      if (/platzhalter/i.test(wert) || (art === "mailto" && PLATZHALTER_ADRESSE.test(wert))) raus.push(`${s.pfad}: Platzhalter in ${art} (${wert.slice(0, 60)})`);
    if (s.pfad.startsWith("/gestaltung/")) raus.push(`${s.pfad}: Gestaltungsentwurf im Build`);
  }
  if ((projekt.pruefstufe ?? 3) >= 3) {
    if (!seiten.some((s) => /impressum/.test(s.pfad))) raus.push("Impressum fehlt");
    if (!seiten.some((s) => /datenschutz/.test(s.pfad))) raus.push("Datenschutzerklärung fehlt");
  }
  return raus;
}

function main() {
  const args = process.argv.slice(2);
  const dist = args.find((a) => !a.startsWith("--")) ?? "dist";
  const projekt = projektLesen(".");
  const liste = befunde(dist, projekt);
  if (args.includes("--main") || produktion(process.env, projekt)) {
    for (const b of liste) console.log(`muss: Unfertig-Sperre: ${b}`);
    console.log(liste.length ? `UNFERTIG-SPERRE ROT (${liste.length}) – nicht live stellen` : "UNFERTIG-SPERRE OK");
    process.exit(liste.length ? 1 : 0);
  }
  console.log(`UNFERTIG-SPERRE nicht main: ${liste.length} offene Stellen (blockieren erst auf main)`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) main();
