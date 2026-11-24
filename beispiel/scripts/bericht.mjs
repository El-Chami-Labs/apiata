#!/usr/bin/env node
// Schreibt einen Bericht von stdin nach laeufe/<…>.md (für den lesenden pruefer). Nur Pfade unter laeufe/.
// node scripts/bericht.mjs laeufe/<branch>/pruefung-1.md <<'ENDE' … ENDE
// Sichtbare Fehler (verdeckt, abgeschnitten, unleserlich, leere Fläche) unter „sollte“ oder „kann“: kein Bericht, Exit 1.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, normalize } from "node:path";
import { fileURLToPath } from "node:url";

/** Sichtbarer Fehler: immer „muss“, nie „sollte“ oder „kann“, nie „offen“. */
export const SICHTBAR = /(?<![\p{L}])(?:über|ver)deckt|abgeschnitten|unleserlich|leere[nrs]?\s+fläche/iu;

/** Zeilen „sollte:“ oder „kann:“, die einen sichtbaren Fehler nennen. */
export function falschEingestuft(text) {
  return text.split("\n").filter((z) => /^\s*[-*]?\s*\**(sollte|kann)\**\s*:/i.test(z) && SICHTBAR.test(z)).map((z) => z.trim());
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const pfad = normalize(process.argv[2] ?? "");
  if (!/^laeufe\/[\w.-]+\/[\w./-]+\.md$/.test(pfad) || pfad.includes("..")) {
    console.log("FEHLER: Pfad muss unter laeufe/<branch>/ liegen und auf .md enden");
    process.exit(2);
  }
  const text = readFileSync(0, "utf8");
  const falsch = falschEingestuft(text);
  if (falsch.length) {
    for (const z of falsch) console.log(`FEHLER: sichtbarer Fehler ist immer „muss“: ${z}`);
    console.log("Bericht nicht geschrieben: diese Zeilen als „muss“ einstufen und erneut schreiben.");
    process.exit(1);
  }
  mkdirSync(dirname(pfad), { recursive: true });
  writeFileSync(pfad, text.endsWith("\n") ? text : text + "\n");
  const zaehlen = (stufe) => (text.match(new RegExp(`^\\s*[-*]?\\s*\\**${stufe}\\**\\s*:`, "gim")) ?? []).length;
  console.log(`BERICHT ${pfad}: muss ${zaehlen("muss")}, sollte ${zaehlen("sollte")}, kann ${zaehlen("kann")}`);
}
