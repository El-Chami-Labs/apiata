#!/usr/bin/env node
// Vorschau-Seite der Gestaltungswahl: public/gestaltung/index.html mit den Bildern der drei Vorschläge, Name, Rolle
// und Leitsatz aus docs/design-richtungen/auftrag-<x>.md. Ohne Entwurfsmarkierungen auf den Bildern.
// node scripts/vorschlaege-seite.mjs [--bilder public/gestaltung] [--auftraege docs/design-richtungen]
import { existsSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const args = process.argv.slice(2);
const wert = (n, d) => (args.includes(n) ? args[args.indexOf(n) + 1] : d);
const bilder = wert("--bilder", "public/gestaltung");
const auftraege = wert("--auftraege", "docs/design-richtungen");
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
const dateien = existsSync(bilder) ? readdirSync(bilder).filter((d) => d.endsWith(".png")) : [];
const abschnitte = [];
for (const x of ["a", "b", "c", "d", "e"]) {
  const pfad = join(auftraege, `auftrag-${x}.md`);
  if (!existsSync(pfad)) continue;
  const text = readFileSync(pfad, "utf8");
  const name = text.match(/^# Richtungs-Auftrag \w+ · (.+)$/m)?.[1] ?? x.toUpperCase();
  const rolle = text.match(/^- Rolle:\s*(\w+)/m)?.[1] ?? "";
  const leitsatz = text.match(/^- Leitsatz:\s*(.+)$/m)?.[1] ?? "";
  const eigene = dateien.filter((d) => d.startsWith(`gestaltung-${x}-`)).sort((a, b) => a.localeCompare(b, "de", { numeric: true }));
  const bildHtml = eigene.map((d) => `<figure><img src="/gestaltung/${d}" alt="Vorschlag ${x.toUpperCase()}: ${esc(d.replace(/\.png$/, ""))}" loading="lazy"><figcaption>${esc(d.includes("390") ? "Handy" : "Computer")}${d.includes("ganz") ? ", ganze Seite" : d.includes("bildfolge") ? ", Bewegung beim Scrollen" : ", erster Bildschirm"}</figcaption></figure>`).join("\n");
  abschnitte.push(`<section><h2>Vorschlag ${x.toUpperCase()} · ${esc(name)}</h2><p><strong>${esc(rolle)}</strong> – ${esc(leitsatz)}</p><p><a href="/gestaltung/${x}/">Entwurf live ansehen</a></p><div class="bilder">${bildHtml}</div></section>`);
}
const html = `<!doctype html><html lang="de"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Gestaltungsvorschläge</title>
<style>body{margin:0;font:16px/1.5 system-ui,sans-serif;background:#f3f3f1;color:#1d1d1b}main{max-width:1400px;margin:auto;padding:24px}section{background:#fff;border-radius:12px;padding:24px;margin-block:24px}.bilder{display:flex;gap:16px;overflow-x:auto;align-items:flex-start}figure{margin:0;flex:none}img{max-height:640px;width:auto;border:1px solid #ddd;display:block}figcaption{font-size:14px;color:#555}</style></head>
<body><main><h1>Drei Vorschläge – welcher soll es werden?</h1><p>Mischen geht auch, zum Beispiel „Farben von B, Schrift von A“.</p>${abschnitte.join("\n")}</main></body></html>\n`;
writeFileSync(join(bilder, "index.html"), html);
console.log(`VORSCHAU-SEITE ${join(bilder, "index.html")}: ${abschnitte.length} Vorschläge, ${dateien.length} Bilder`);
