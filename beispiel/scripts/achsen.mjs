#!/usr/bin/env node
// Prüft die Achsen der drei Richtungs-Aufträge: gültige Werte, Stufe, Projektart; je zwei Vorschläge in mindestens 6 von
// 13 Achsen verschieden, immer in den Pflichtachsen (Aufbau, Kopfzeile, Formen, Knöpfe). Dazu Referenzseite und Vorlage:
// beide genannt, beide vorhanden, je Vorschlag andere.
// Aufruf: node scripts/achsen.mjs [ordner] [--achsen docs/gestaltung/achsen.md]
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

export const ACHSEN = ["komposition", "farbwelt", "schrift", "element", "dichte", "kopfzeile", "bildersatz", "fussleiste", "formen", "knoepfe", "effekte", "flaechen", "abschnitte"];
export const MIN_UNTERSCHIEDE = 6;
export const PFLICHT = ["komposition", "kopfzeile", "formen", "knoepfe"];

/** Erlaubte Werte aus achsen.md: Map achse → Map wert → { stufe, fuer[] } */
export function werteLesen(text) {
  const reihenfolge = ["Komposition", "Farbwelt", "Schriftcharakter", "Tragendes Element", "Dichte und Rhythmus", "Kopfzeile und Navigation", "Bildersatz", "Fußleiste", "Formen", "Knöpfe", "Effekte", "Flächen", "Abschnittsfolge"];
  const werte = new Map(ACHSEN.map((a) => [a, new Map()]));
  let achse = null;
  for (const zeile of text.split("\n")) {
    const titel = zeile.match(/^## (.+)$/);
    if (titel) {
      const i = reihenfolge.indexOf(titel[1].trim());
      achse = i >= 0 ? ACHSEN[i] : null;
      continue;
    }
    const w = zeile.match(/^- `([^`]+)` · ab Stufe (\d) · ([^·]+) ·/);
    if (achse && w) werte.get(achse).set(w[1], { stufe: Number(w[2]), fuer: w[3].split(",").map((s) => s.trim()) });
  }
  return werte;
}

const quelle = (text, feld) => {
  const m = text.match(new RegExp(`^- ${feld}:[ \\t]*\`([^\`]+)\`[ \\t]*(.*)$`, "m"));
  return m ? { pfad: m[1].trim().replace(/\/+$/, ""), satz: m[2].replace(/^[\s–—-]+/, "").trim() } : null;
};

/** Auftrag lesen: { name, achsen: {achse: wert}, stufe, fotos, art, referenz, vorlage } */
export function auftragLesen(text, name) {
  const zeile = text.match(/^- Achsen:[ \t]*(.+(?:\n[ \t]+\S.*)*)/m); // auch umbrochen, Folgezeilen eingerückt
  const achsen = {};
  if (zeile) for (const teil of zeile[1].replace(/\s+/g, " ").split(/\s*·\s*/)) {
    const [k, v] = teil.split("=").map((s) => s?.trim());
    if (k && v) achsen[k] = v;
  }
  const stufe = Number(text.match(/^- Gestaltungsstufe:\s*(\d)/m)?.[1] ?? 5);
  const fotos = text.match(/^- Fotos:\s*(.+)$/m)?.[1].trim() ?? "";
  const art = (text.match(/^- Projekt:\s*(\w+)/m)?.[1] ?? "website").toLowerCase();
  return { name, achsen, stufe, fotos, art, referenz: quelle(text, "Referenzseite"), vorlage: quelle(text, "Vorlage") };
}

/** Referenzseite und Vorlage: Pfad und Satz vorhanden, Pfad zeigt auf einen Referenz-Ordner bzw. eine Designsprache. */
function quellenPruefen(a, wurzel) {
  const befunde = [];
  const arten = [
    ["referenz", "Referenzseite", /^docs\/design-bibliothek\/referenzen\/[\w.-]+$/, (p) => join(p, "bauplan.md")],
    ["vorlage", "Vorlage", /^docs\/design-bibliothek\/(?!README\.md$)[\w.-]+\.md$/, (p) => p],
  ];
  for (const [feld, titel, muster, datei] of arten) {
    const q = a[feld];
    if (!q) { befunde.push(`${a.name}: Zeile „${titel}“ mit Pfad in Backticks fehlt`); continue; }
    if (!muster.test(q.pfad) || !existsSync(join(wurzel, datei(q.pfad)))) befunde.push(`${a.name}: ${titel} ${q.pfad} gibt es nicht`);
    if (!q.satz) befunde.push(`${a.name}: ${titel} ohne Satz, was übernommen wird`);
  }
  return befunde;
}

/** Befunde für eine Liste von Aufträgen. */
export function pruefen(auftraege, werte, wurzel = ".") {
  const befunde = [];
  for (const a of auftraege) {
    befunde.push(...quellenPruefen(a, wurzel));
    for (const achse of ACHSEN) {
      const wert = a.achsen[achse];
      if (!wert) { befunde.push(`${a.name}: Achse „${achse}“ fehlt`); continue; }
      const def = werte.get(achse).get(wert);
      if (!def) { befunde.push(`${a.name}: ${achse}=${wert} ist kein erlaubter Wert`); continue; }
      if (def.stufe > a.stufe) befunde.push(`${a.name}: ${achse}=${wert} erst ab Stufe ${def.stufe} (gewählt ${a.stufe})`);
      if (!def.fuer.includes("alle") && !def.fuer.includes(a.art)) befunde.push(`${a.name}: ${achse}=${wert} passt nicht zu ${a.art}`);
    }
  }
  for (let i = 0; i < auftraege.length; i++)
    for (let j = i + 1; j < auftraege.length; j++) {
      const [a, b] = [auftraege[i], auftraege[j]];
      const gleich = ACHSEN.filter((x) => a.achsen[x] && a.achsen[x] === b.achsen[x]);
      const unterschiede = ACHSEN.length - gleich.length;
      if (unterschiede < MIN_UNTERSCHIEDE)
        befunde.push(`${a.name} und ${b.name} zu ähnlich: nur ${unterschiede} von ${ACHSEN.length} Achsen verschieden (gleich: ${gleich.join(", ")})`);
      const pflichtGleich = PFLICHT.filter((x) => gleich.includes(x));
      if (pflichtGleich.length) befunde.push(`${a.name} und ${b.name} zu ähnlich im Aufbau: gleich in ${pflichtGleich.join(", ")}`);
      for (const [feld, titel] of [["referenz", "Referenzseite"], ["vorlage", "Vorlage"]])
        if (a[feld] && a[feld].pfad === b[feld]?.pfad) befunde.push(`${a.name} und ${b.name}: gleiche ${titel} ${a[feld].pfad}`);
      if (/folgen/i.test(a.fotos) && a.achsen.bildersatz === b.achsen.bildersatz)
        befunde.push(`${a.name} und ${b.name}: gleicher Bildersatz „${a.achsen.bildersatz}“`);
    }
  return befunde;
}

function main() {
  const args = process.argv.slice(2);
  const ordner = args.find((a) => !a.startsWith("--")) ?? "docs/design-richtungen";
  const iA = args.indexOf("--achsen");
  const achsenDatei = iA >= 0 ? args[iA + 1] : "docs/gestaltung/achsen.md";
  if (!existsSync(ordner)) { console.log(`FEHLER: Ordner ${ordner} fehlt`); process.exit(2); }
  const dateien = readdirSync(ordner).filter((d) => /^auftrag-[a-z]\.md$/.test(d)).sort();
  if (dateien.length < 2) { console.log(`FEHLER: weniger als zwei Aufträge in ${ordner}`); process.exit(2); }
  const werte = werteLesen(readFileSync(achsenDatei, "utf8"));
  const auftraege = dateien.map((d) => auftragLesen(readFileSync(join(ordner, d), "utf8"), d.replace(".md", "")));
  const befunde = pruefen(auftraege, werte);
  for (const b of befunde) console.log(`muss: ${b}`);
  console.log(befunde.length ? `ACHSEN ROT (${befunde.length})` : `ACHSEN OK (${auftraege.length} Vorschläge)`);
  process.exit(befunde.length ? 1 : 0);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) main();
