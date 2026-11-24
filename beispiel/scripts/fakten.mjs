#!/usr/bin/env node
// Erfundene Fakten finden: Telefonnummern, E-Mail-Adressen, Preise, Prozent- und Kundenzahlen, Jahreszahlen,
// Anschriften und Bewertungen im sichtbaren Text, in mailto:/tel:-Zielen und in alt, title, aria-label, die weder in
// inhalte/fakten.json stehen noch als „Platzhalter: …“ (in Link-Zielen und Attributen: Wort „platzhalter“) markiert sind.
// node scripts/fakten.mjs [dist]
import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dateien, linkUndAttributWerte, seitenPfad, sichtbarerText } from "./build-text.mjs";

const MUSTER = [
  ["Telefon", /(?:\+49|\b0)\s?\(?\d{2,5}\)?[\s/-]?\d{3,}[\s-]?\d{0,6}/g],
  ["E-Mail", /\b[\w.+-]+@[\w-]+\.[\w.]{2,}\b/g],
  ["Preis", /\b\d{1,3}(?:[.\s]\d{3})*(?:,\d{2})?\s?(?:€|EUR\b|Euro\b)|€\s?\d+/g],
  ["Zahl", /\b\d[\d.]*\s?(?:%|Prozent|Kunden|Kundinnen|Projekte|Jahre(?:n)? Erfahrung|zufriedene)/gi],
  ["Jahr", /\b(?:seit|gegründet|Gründung)\s+(?:19|20)\d{2}\b/gi],
  ["Anschrift", /\b[A-ZÄÖÜ][a-zäöüß-]+(?:straße|str\.|weg|platz|allee|gasse)\s+\d+[a-z]?\b/g],
  ["Postleitzahl", /\b\d{5}\s+[A-ZÄÖÜ][a-zäöüß]+/g],
  ["Bewertung", /[★⭐]{2,}|\b\d[,.]\d\s?(?:von 5|\/\s?5|Sterne)/gi],
];

/** Telefonnummer nur als Ziffern, +49 und 0049 als führende 0: „+49 30 123“ = „030 123“ */
export const ziffern = (s) => String(s).replace(/^\s*(?:\+|00)49\s*(?:\(0\))?/, "0").replace(/\D/g, "");

/** Fakten in mailto:/tel:-Zielen und alt, title, aria-label; Werte mit „platzhalter“ sind markiert. */
export function faktenInWerten(werte, bekannt = []) {
  const raus = [];
  for (const { art, wert } of werte) {
    if (/platzhalter/i.test(wert) || !["mailto", "tel", "alt", "title", "aria-label"].includes(art)) continue;
    const funde = faktenFinden(art === "tel" ? `Telefon ${wert}` : wert, bekannt);
    if (art === "tel" && !funde.length && !bekannt.map(ziffern).includes(ziffern(wert))) funde.push(`Telefon „${wert}“`);
    raus.push(...funde.map((f) => `${f} in ${art}`));
  }
  return [...new Set(raus)];
}

export function faktenFinden(text, bekannt = []) {
  const raus = [];
  const norm = (s) => s.replace(/\s+/g, " ").trim().toLowerCase();
  const bekannteText = bekannt.map(norm);
  const bekannteNummern = bekannt.map(ziffern).filter((z) => z.length >= 6);
  for (const [art, re] of MUSTER)
    for (const m of text.matchAll(re)) {
      const wert = m[0].trim();
      const davor = text.slice(Math.max(0, m.index - 60), m.index);
      if (/Platzhalter\s*:[^.]*$/i.test(davor)) continue;
      if (bekannteText.some((b) => b.includes(norm(wert)) || norm(wert).includes(b))) continue;
      if (art === "Telefon" && bekannteNummern.includes(ziffern(wert))) continue;
      raus.push(`${art} „${wert}“`);
    }
  return [...new Set(raus)];
}

function main() {
  const dist = process.argv[2] ?? "dist";
  const fj = "inhalte/fakten.json";
  const bekannt = existsSync(fj) ? Object.values(JSON.parse(readFileSync(fj, "utf8"))).flat().map(String) : [];
  const liste = [];
  for (const d of dateien(dist)) {
    const pfad = seitenPfad(dist, d);
    if (pfad.startsWith("/gestaltung/")) continue;
    const html = readFileSync(d, "utf8");
    for (const f of [...faktenFinden(sichtbarerText(html), bekannt), ...faktenInWerten(linkUndAttributWerte(html), bekannt)]) liste.push(`${pfad}: ${f}`);
  }
  for (const b of liste) console.log(`muss: möglicher erfundener Fakt ohne „Platzhalter: …“: ${b} (echt? dann in inhalte/fakten.json)`);
  console.log(liste.length ? `FAKTEN ROT (${liste.length})` : "FAKTEN OK");
  process.exit(liste.length ? 1 : 0);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) main();
