#!/usr/bin/env node
// Grundgerüst eines Projekts aus vorlagen/website anlegen und projekt.json schreiben.
// node scripts/geruest.mjs --name "Projekt" --worker projekt --subdomain konto --pruefstufe 3 --gestaltungsstufe 2
//   --fotos folgen|mit|ohne --hauptaktion 'a[href="/anfrage/"]' [--art website] [--3d] [--ziel .] [--aufraeumen]
// --aufraeumen entfernt die nur für das Kit-Repo gedachten Dateien (nurKit im Manifest).
// Fehlt .claude/kit-dateien.json im Ziel, schreibt das Gerüst sie wie kit-holen.mjs (Liste der Kit-Dateien des Projekts).
import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { kitDateien, LISTE } from "./kit-holen.mjs";

const kit = join(dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);
const wert = (n, d) => (args.includes(n) ? args[args.indexOf(n) + 1] : d);
const ziel = wert("--ziel", ".");
const projekt = {
  name: wert("--name", "Projekt"),
  art: wert("--art", "website"),
  pruefstufe: Number(wert("--pruefstufe", 3)),
  gestaltungsstufe: Number(wert("--gestaltungsstufe", 2)),
  fotos: wert("--fotos", "folgen"),
  worker: wert("--worker", ""),
  subdomain: wert("--subdomain", ""),
  produktionsbranch: "main",
  hauptaktion: { selektor: wert("--hauptaktion", 'a[href="/anfrage/"]') },
  dreiD: args.includes("--3d"),
  kitQuelle: wert("--kit-quelle", "https://github.com/El-Chami-Labs/dev-agents"),
};
const fehlt = ["worker", "subdomain"].filter((k) => !/^[a-z0-9-]+$/.test(projekt[k]));
if (fehlt.length) { console.log(`FEHLER: ${fehlt.join(", ")} fehlt oder enthält mehr als a-z, 0-9, -`); process.exit(2); }

function kopieren(von, nach) {
  for (const e of readdirSync(von)) {
    const a = join(von, e);
    const b = join(nach, e);
    if (statSync(a).isDirectory()) { mkdirSync(b, { recursive: true }); kopieren(a, b); continue; }
    if (existsSync(b)) continue; // Vorhandenes bleibt
    const text = readFileSync(a, "utf8").replaceAll("__NAME__", projekt.name).replaceAll("__WORKER__", projekt.worker);
    mkdirSync(nach, { recursive: true });
    writeFileSync(b, text);
  }
}

mkdirSync(ziel, { recursive: true });
kopieren(join(kit, "vorlagen/website"), ziel);
if (projekt.gestaltungsstufe >= 2) {
  mkdirSync(join(ziel, "src/bewegung"), { recursive: true });
  for (const d of ["bewegung.css", "bewegung.mjs"]) cpSync(join(kit, "vorlagen/bewegung", d), join(ziel, "src/bewegung", d));
  if (projekt.dreiD) cpSync(join(kit, "vorlagen/bewegung/szene-3d.mjs"), join(ziel, "src/bewegung/szene-3d.mjs"));
}
writeFileSync(join(ziel, "projekt.json"), JSON.stringify(projekt, null, 2) + "\n");
if (args.includes("--aufraeumen")) {
  const manifest = JSON.parse(readFileSync(join(kit, "kit-manifest.json"), "utf8"));
  for (const p of manifest.nurKit) rmSync(join(ziel, p), { recursive: true, force: true });
  writeFileSync(join(ziel, "README.md"), `# ${projekt.name}\n\nGebaut mit dem Agenten-Kit ${readFileSync(join(kit, "KIT-VERSION"), "utf8").trim()}.\n`);
}
if (!existsSync(join(ziel, LISTE))) {
  const manifest = JSON.parse(readFileSync(join(kit, "kit-manifest.json"), "utf8"));
  mkdirSync(join(ziel, ".claude"), { recursive: true });
  writeFileSync(join(ziel, LISTE), JSON.stringify(kitDateien(kit, manifest), null, 1) + "\n");
}
const zusatz = [projekt.gestaltungsstufe >= 4 ? "motion@14.9.1 lenis@1.3.27" : "", projekt.dreiD ? "three@0.187.0" : ""].filter(Boolean).join(" ");
console.log(`GERÜST ${projekt.name} in ${ziel}: Prüfstufe ${projekt.pruefstufe}, Gestaltungsstufe ${projekt.gestaltungsstufe}`);
console.log(`COMMITTEN: projekt.json ${LISTE} und die Vorlagen-Ordner`);
if (zusatz) console.log(`NÄCHSTER SCHRITT: npm install ${zusatz}`);
