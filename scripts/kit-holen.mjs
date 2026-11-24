#!/usr/bin/env node
// Kit-Dateien aus einer Kit-Quelle (Klon des Kit-Repos) ins Projekt holen. Projektspezifisches bleibt: nur Pfade aus
// „kit“ im Manifest werden ersetzt; Dateien einer älteren Kit-Version, die es nicht mehr gibt, werden entfernt;
// Ahmads Paket-Freigaben bleiben; Zeilen in kit-feedback.md, die laut kit-erledigt.json erledigt sind, fallen weg.
// node scripts/kit-holen.mjs <kit-quelle> [ziel] [--ohne-referenzbilder]
import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

export const LISTE = ".claude/kit-dateien.json";

function alleDateien(basis, pfad) {
  const voll = join(basis, pfad);
  if (!existsSync(voll)) return [];
  if (!statSync(voll).isDirectory()) return [pfad];
  return readdirSync(voll).flatMap((e) => alleDateien(basis, join(pfad, e)));
}

export function kitDateien(quelle, manifest, { ohneReferenzbilder = false } = {}) {
  const raus = manifest.kit.flatMap((p) => alleDateien(quelle, p));
  return raus.filter((d) => !manifest.nurKit.some((n) => d === n || d.startsWith(n + "/")))
    .filter((d) => !(ohneReferenzbilder && /design-bibliothek\/referenzen\/.+\.webp$/.test(d)))
    .filter((d) => !d.includes("node_modules"));
}

/** Freigaben zusammenführen: Kit-Tabelle + Zeilen des Projekts, die nicht aus dem Kit stammen */
export function freigabenZusammen(kitText, projektText) {
  const eigene = projektText.split("\n").filter((z) => /^\|/.test(z) && !/\|\s*Kit\s*\|\s*$/.test(z) && !/^\|\s*(Paket|-)/.test(z));
  const zeilen = kitText.trimEnd().split("\n");
  for (const z of eigene) if (!zeilen.includes(z)) zeilen.push(z);
  return zeilen.join("\n") + "\n";
}

/** Feedback-Zeilen entfernen, die zu einem Eintrag aus kit-erledigt.json passen: jede Merkmal-Gruppe mit einem Treffer
 * und Datum am Zeilenanfang auf oder vor dem Datum des Eintrags. Zeilen ohne lesbares Datum bleiben stehen. */
export function feedbackAufraeumen(text, erledigt) {
  const passt = (zeile, tag) => erledigt.find((e) => /^\d{4}-\d{2}-\d{2}$/.test(e.datum ?? "") && tag <= e.datum
    && e.merkmale.every((g) => g.some((m) => zeile.toLowerCase().includes(m.toLowerCase()))));
  const entfernt = [];
  const rest = text.split("\n").filter((z) => {
    const tag = z.trim().match(/^(\d{4}-\d{2}-\d{2})(?!\d)/)?.[1];
    if (!tag || Number.isNaN(Date.parse(tag))) return true;
    const e = passt(z, tag);
    if (e) entfernt.push({ version: e.version, zeile: z.trim() });
    return !e;
  });
  return { text: rest.join("\n"), entfernt };
}

export function holen(quelle, ziel, optionen = {}) {
  const manifest = JSON.parse(readFileSync(join(quelle, "kit-manifest.json"), "utf8"));
  const neu = kitDateien(quelle, manifest, optionen);
  const altListe = existsSync(join(ziel, LISTE)) ? JSON.parse(readFileSync(join(ziel, LISTE), "utf8")) : [];
  const entfernt = altListe.filter((d) => !neu.includes(d) && existsSync(join(ziel, d)));
  for (const d of entfernt) rmSync(join(ziel, d));
  for (const d of neu) {
    mkdirSync(dirname(join(ziel, d)), { recursive: true });
    cpSync(join(quelle, d), join(ziel, d));
  }
  for (const d of manifest.zusammenfuehren ?? []) {
    const k = join(quelle, d);
    const p = join(ziel, d);
    if (!existsSync(k)) continue;
    mkdirSync(dirname(p), { recursive: true });
    writeFileSync(p, existsSync(p) ? freigabenZusammen(readFileSync(k, "utf8"), readFileSync(p, "utf8")) : readFileSync(k, "utf8"));
  }
  writeFileSync(join(ziel, LISTE), JSON.stringify(neu, null, 1) + "\n");
  const fb = join(ziel, "kit-feedback.md");
  if (!existsSync(fb)) writeFileSync(fb, "# Kit-Feedback\n\nEine Zeile je Beobachtung: Datum · was hakte · Vorschlag.\n\n");
  const erl = join(quelle, "kit-erledigt.json");
  const feedback = feedbackAufraeumen(readFileSync(fb, "utf8"), existsSync(erl) ? JSON.parse(readFileSync(erl, "utf8")) : []);
  if (feedback.entfernt.length) writeFileSync(fb, feedback.text);
  return { kopiert: neu.length, entfernt, erledigt: feedback.entfernt, version: readFileSync(join(quelle, "KIT-VERSION"), "utf8").trim() };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2).filter((a) => !a.startsWith("--"));
  const [quelle, ziel = "."] = args;
  if (!quelle || !existsSync(join(quelle, "kit-manifest.json"))) {
    console.log("FEHLER: Kit-Quelle mit kit-manifest.json angeben, z. B. node scripts/kit-holen.mjs /tmp/kit");
    process.exit(2);
  }
  const alt = existsSync(join(ziel, "KIT-VERSION")) ? readFileSync(join(ziel, "KIT-VERSION"), "utf8").trim() : "keine";
  const r = holen(quelle, ziel, { ohneReferenzbilder: process.argv.includes("--ohne-referenzbilder") });
  for (const d of r.entfernt) console.log(`entfernt: ${d}`);
  for (const e of r.erledigt) console.log(`kit-feedback erledigt (${e.version}): ${e.zeile}`);
  console.log(`KIT ${alt} → ${r.version}: ${r.kopiert} Dateien (${relative(".", ziel) || "."})`);
}
