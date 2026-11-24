#!/usr/bin/env node
// Aufräum-Wächter: tote Verweise, verwaiste Dateien, Laufreste, alte Befehlsnamen, Beispiel abweichend vom Kit
// oder von der Vorlage.
// Eine Zeile je Befund, Exit 1 bei Befund.
// Aufruf: node scripts/aufraeumen.mjs [ordner]   (Branch aus LAUF_BRANCH, GITHUB_HEAD_REF, GITHUB_REF_NAME oder git)
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { basename, dirname, join, posix } from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { freigabenZusammen } from "./kit-holen.mjs";

export const ALTE_BEFEHLE = ["setup", "lauf", "lauf-fortsetzen", "kit-holen", "kit-verbessern", "gestaltungswahl"];
// Orte, die Skripte und Abläufe erst im Projekt anlegen.
const ERZEUGT = ["public/gestaltung", "public/medien", "src/pages/gestaltung", "src/gestaltung", "src/bewegung/szene-3d.mjs", "src/styles/tokens.css", "docs/design-richtungen"];
const EINGEBAUT = ["goal", "help", "clear", "compact", "config", "permissions", "model", "init", "review", "memory", "agents", "hooks", "mcp",
  "login", "logout", "status", "cost", "doctor", "resume", "fast", "plugin", "context", "usage", "export", "rewind", "add-dir", "ide", "security-review"];
const TEXT = /\.(md|mjs|json|yml)$/;
const BILD = /\.(png|jpe?g|webp|gif|avif)$/i;
const OBERORDNER = "\\.claude|\\.github|scripts|docs|vorlagen|src|tests|public|inhalte|beispiel";
const PFAD = new RegExp(`(?<![\\w.@/$<>-])((?:${OBERORDNER})/[\\w./@-]*)`, "g");
const BEFEHL = /(?<![\w./:\]\)>@<-])\/([a-z][a-z0-9-]*)(?=[\s`"“”',;:)!?]|$)/gm;

/** Dateien des Repos (versioniert und neu, ohne ignorierte). */
export function dateienListen(wurzel) {
  try {
    const aus = execFileSync("git", ["-C", wurzel, "ls-files", "-co", "--exclude-standard"], { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] });
    return aus.split("\n").filter((d) => d && existsSync(join(wurzel, d)));
  } catch {
    const lauf = (p) => readdirSync(join(wurzel, p)).flatMap((e) => {
      const q = p ? `${p}/${e}` : e;
      if ([".git", "node_modules", "dist"].includes(e)) return [];
      return statSync(join(wurzel, q)).isDirectory() ? lauf(q) : [q];
    });
    return lauf("");
  }
}

/** Projektwurzel einer Datei: beispiel/ ist ein eigenes Projekt im Kit-Repo. */
const wurzelVon = (d) => (d.startsWith("beispiel/") ? "beispiel" : "");
const rel = (w, p) => (w ? `${w}/${p}` : p);

/** Fremdmaterial (Designsprachen) und Testfälle mit erfundenen Pfaden prüft der Wächter nicht auf Verweise. */
const ohneVerweisPruefung = (d) => /(^|\/)scripts\/kit-test\//.test(d) || /(^|\/)docs\/design-bibliothek\/(?!README\.md$)[^/]+\.md$/.test(d);

/** a: genannte Pfade und Befehle, die es nicht gibt. Pfade, die ein Fehler-Diff im selben Ordner anlegt, gelten. */
export function toteVerweise(dateien, lesen, gibtEs, nurKit = []) {
  const befunde = [];
  const ausDiff = (d) => dateien.filter((x) => dirname(x) === dirname(d) && x.endsWith(".diff"))
    .flatMap((x) => [...lesen(x).matchAll(/^\+\+\+ b\/(\S+)/gm)].map((m) => m[1]));
  const skills = (w) => new Set(dateien.filter((d) => d.startsWith(rel(w, ".claude/skills/"))).map((d) => d.slice(rel(w, ".claude/skills/").length).split("/")[0]));
  const skillsJe = { "": skills(""), beispiel: skills("beispiel") };
  for (const d of dateien.filter((x) => TEXT.test(x) && !ohneVerweisPruefung(x))) {
    const w = wurzelVon(d);
    const basen = [w, dirname(d), rel(w, "vorlagen/website"), ...(w ? [] : ["beispiel"])];
    const diff = ausDiff(d);
    const text = lesen(d);
    for (const m of text.matchAll(PFAD)) {
      const nach = text[m.index + m[0].length] ?? "";
      if ("<{$*[(".includes(nach) && nach) continue;
      const p = m[1].replace(/[.:,]+$/, "").replace(/\/+$/, "");
      if (p.includes("..") || !p.includes("/") || ERZEUGT.some((e) => p === e || p.startsWith(e + "/"))) continue;
      if (diff.some((x) => x === p || x.endsWith("/" + p)) || nurKit.some((k) => p === k || p.startsWith(k + "/"))) continue;
      if (!basen.some((b) => gibtEs(b ? posix.join(b, p) : p))) befunde.push(`${d}: Pfad ${p} gibt es nicht`);
    }
    for (const m of text.matchAll(BEFEHL)) {
      const n = m[1];
      if (text[m.index - 1] === "`" && !skillsJe[w].has(n) && !EINGEBAUT.includes(n))
        befunde.push(`${d}: Befehl /${n} gibt es nicht`);
    }
  }
  return befunde;
}

/** b: Skripte, Skills, Rollen, Hooks und Designsprachen, die nirgends verwendet oder im Index genannt sind. */
export function verwaist(dateien, lesen) {
  const befunde = [];
  const texte = dateien.filter((d) => TEXT.test(d) || /\.(ya?ml|ts|astro|jsonc)$/.test(d));
  const genannt = (wort, ausser) => texte.some((t) => !ausser(t) && lesen(t).includes(wort));
  for (const w of ["", "beispiel"]) {
    const unter = (p) => dateien.filter((d) => d.startsWith(rel(w, p)) && !d.slice(rel(w, p).length).includes("/"));
    for (const s of unter("scripts/").filter((d) => d.endsWith(".mjs")))
      if (!genannt(basename(s), (t) => t === s || t.startsWith("scripts/kit-test/"))) befunde.push(`${s}: Skript wird nirgends verwendet`);
    for (const h of unter(".claude/hooks/").filter((d) => d.endsWith(".mjs")))
      if (!genannt(basename(h), (t) => t === h || t.startsWith("scripts/kit-test/"))) befunde.push(`${h}: Hook wird nirgends verwendet`);
    for (const r of unter(".claude/agents/").filter((d) => d.endsWith(".md"))) {
      const n = basename(r, ".md");
      if (!texte.some((t) => t.startsWith(rel(w, ".claude/skills/")) && new RegExp(`\\b${n}\\b`).test(lesen(t)))) befunde.push(`${r}: Rolle wird in keinem Skill verwendet`);
    }
    const skillOrdner = new Set(dateien.filter((d) => d.startsWith(rel(w, ".claude/skills/"))).map((d) => d.split("/").slice(0, w ? 4 : 3).join("/")));
    for (const s of skillOrdner) {
      const n = basename(s);
      if (!genannt(`/${n}`, (t) => t.startsWith(s + "/")) && !genannt(`skills/${n}/`, (t) => t.startsWith(s + "/"))) befunde.push(`${s}: Skill wird nirgends genannt`);
    }
    const bib = rel(w, "docs/design-bibliothek/");
    const index = rel(w, "docs/design-bibliothek/README.md");
    if (dateien.includes(index)) {
      const t = lesen(index);
      for (const v of unter("docs/design-bibliothek/").filter((d) => d.endsWith(".md") && d !== index))
        if (!t.includes(`\`${basename(v, ".md")}\``)) befunde.push(`${v}: Vorlage fehlt im Index ${index}`);
      const refs = new Set(dateien.filter((d) => d.startsWith(`${bib}referenzen/`) && d.split("/").length === bib.split("/").length + 2).map((d) => d.split("/").at(-2)));
      for (const r of refs) if (!t.includes(`\`${r}\``)) befunde.push(`${bib}referenzen/${r}: Referenzseite fehlt im Index ${index}`);
    }
  }
  return befunde;
}

/** Lauf-Ordner unter laeufe/: Ordner mit status.json (auch verschachtelt), sonst die erste Ebene. */
export function laufOrdner(dateien, w = "") {
  const basis = rel(w, "laeufe/");
  const unter = dateien.filter((d) => d.startsWith(basis)).map((d) => d.slice(basis.length));
  const mitStatus = [...new Set(unter.filter((d) => d.endsWith("/status.json")).map((d) => d.slice(0, -"/status.json".length)))];
  const rest = [...new Set(unter.filter((d) => !mitStatus.some((s) => d.startsWith(s + "/"))).map((d) => d.split("/")[0]))];
  return [...mitStatus, ...rest.filter((r) => !mitStatus.some((s) => s.startsWith(r + "/")))];
}

/** c: Laufreste. Kit-Repo: kein laeufe/ außer in beispiel/. Projekt: nur Läufe, deren Pull Request offen ist
 *  (nicht der Lauf eines gemergten Branchs, erkennbar daran, dass sein Ordner auf main liegt); auf main keine Prüfung. */
export function laufreste(dateien, { kit, branch, aufMain = () => false }) {
  const befunde = [];
  if (kit) {
    for (const l of laufOrdner(dateien)) befunde.push(`laeufe/${l}: Laufrest im Kit-Repo (Belege gehören in die Pull-Request-Beschreibung)`);
  } else if (branch && branch !== "main") {
    for (const l of laufOrdner(dateien)) if (l !== branch && aufMain(l)) befunde.push(`laeufe/${l}: Laufrest eines gemergten Laufs (node scripts/status.mjs start räumt ihn weg)`);
  }
  const bilderErlaubt = (d) => /(^|\/)(laeufe|public|src|docs\/design-bibliothek\/referenzen|docs\/abnahme)\//.test(d) || d.startsWith("vorlagen/");
  for (const d of dateien) {
    if (/\.(log|tmp)$/i.test(d) || /(^|\/)\.lauf-stop\.json$/.test(d)) befunde.push(`${d}: Laufrest`);
    else if (BILD.test(d) && !bilderErlaubt(d)) befunde.push(`${d}: Zwischenbild außerhalb von laeufe/, public/, src/`);
  }
  return befunde;
}

/** d: alte Befehlsnamen und Skill-Ordner, ohne Ausnahme. */
export function alteNamen(dateien, lesen) {
  const befehl = new RegExp(`(^|[^\\w./-])/(${ALTE_BEFEHLE.join("|")})(?![\\w/-])`, "m");
  const ordner = new RegExp(`skills/(${ALTE_BEFEHLE.filter((n) => n !== "gestaltungswahl").join("|")})/`);
  return dateien.filter((d) => /\.(md|mjs|js|ts|json|jsonc|yml|astro|txt|diff)$/.test(d) && basename(d) !== "aufraeumen.mjs")
    .filter((d) => befehl.test(lesen(d)) || ordner.test(lesen(d)))
    .map((d) => `${d}: alter Befehlsname (${(lesen(d).match(befehl) ?? lesen(d).match(ordner))[0].trim()})`);
}

/** e: beispiel/ hat jede Kit-Datei laut Manifest genau wie das Kit (Referenzbilder ausgenommen), keine überzähligen. */
export function beispielAbweichungen(dateien, lesen, gibtEs, manifest) {
  if (!manifest || !gibtEs("beispiel")) return [];
  const unter = (d, liste) => liste.some((p) => d === p || d.startsWith(p + "/"));
  const istKit = (d) => unter(d, manifest.kit) && !unter(d, manifest.nurKit) && !/design-bibliothek\/referenzen\/.+\.webp$/.test(d);
  const kit = dateien.filter((d) => !d.startsWith("beispiel/") && istKit(d));
  const befunde = kit.flatMap((d) => {
    const b = `beispiel/${d}`;
    if (!gibtEs(b)) return [`${b}: fehlt (Kit-Datei)`];
    return lesen(b) === lesen(d) ? [] : [`${b}: weicht vom Kit ab`];
  });
  for (const d of dateien.filter((d) => d.startsWith("beispiel/") && istKit(d.slice(9)) && !kit.includes(d.slice(9)))) befunde.push(`${d}: gibt es im Kit nicht`);
  for (const d of manifest.zusammenfuehren ?? []) {
    const b = `beispiel/${d}`;
    if (gibtEs(d) && (!gibtEs(b) || freigabenZusammen(lesen(d), lesen(b)) !== lesen(b))) befunde.push(`${b}: Kit-Freigaben fehlen`);
  }
  return befunde;
}

/** f: Konfiguration von beispiel/ gleich vorlagen/website, außer Projektwerten (Name, Worker). */
const KONFIG = ["wrangler.jsonc", "astro.config.mjs", "eslint.config.mjs"];
const ohneProjektwerte = (t) => t.replace(/("(?:name|worker)"\s*:\s*)"[^"]*"/g, '$1"__WORKER__"');
export function beispielKonfiguration(lesen, gibtEs) {
  if (!gibtEs("beispiel")) return [];
  return KONFIG.flatMap((k) => {
    const b = `beispiel/${k}`, v = `vorlagen/website/${k}`;
    if (!gibtEs(b) || !gibtEs(v)) return gibtEs(b) || gibtEs(v) ? [`${b}: fehlt in Beispiel oder Vorlage (${v})`] : [];
    const zb = ohneProjektwerte(lesen(b)).split("\n"), zv = ohneProjektwerte(lesen(v)).split("\n");
    const i = zv.findIndex((z, n) => z !== zb[n]);
    const zeile = i >= 0 ? i : zb.length !== zv.length ? Math.min(zb.length, zv.length) : -1;
    return zeile < 0 ? [] : [`${b}: weicht von ${v} ab (Zeile ${zeile + 1})`];
  });
}

/** Nur-Kit-Dateien aus dem Manifest: in Projekten genannt, aber absichtlich nicht vorhanden. */
function manifestLesen(wurzel) {
  try { return JSON.parse(readFileSync(join(wurzel, "kit-manifest.json"), "utf8")); } catch { return null; }
}

export function pruefen(wurzel, { branch, dateien = dateienListen(wurzel) } = {}) {
  const cache = new Map();
  const lesen = (d) => cache.get(d) ?? (cache.set(d, readFileSync(join(wurzel, d), "utf8")), cache.get(d));
  const gibtEs = (p) => existsSync(join(wurzel, p));
  const kit = existsSync(join(wurzel, "scripts/kit-test"));
  const aufMain = (l) => {
    for (const ref of ["origin/main", "main"]) {
      try { execFileSync("git", ["-C", wurzel, "cat-file", "-e", `${ref}:laeufe/${l}`], { stdio: "ignore" }); return true; } catch { /* nächste */ }
    }
    return false;
  };
  return [
    ...toteVerweise(dateien, lesen, gibtEs, manifestLesen(wurzel)?.nurKit ?? []),
    ...verwaist(dateien, lesen),
    ...laufreste(dateien, { kit, branch, aufMain }),
    ...alteNamen(dateien, lesen),
    ...beispielAbweichungen(dateien, lesen, gibtEs, manifestLesen(wurzel)),
    ...beispielKonfiguration(lesen, gibtEs),
  ];
}

export function aktuellerBranch(wurzel = ".") {
  const e = process.env;
  if (e.LAUF_BRANCH || e.GITHUB_HEAD_REF || e.GITHUB_REF_NAME) return e.LAUF_BRANCH || e.GITHUB_HEAD_REF || e.GITHUB_REF_NAME;
  try { return execFileSync("git", ["-C", wurzel, "branch", "--show-current"], { encoding: "utf8" }).trim(); } catch { return ""; }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const wurzel = process.argv[2] ?? ".";
  const befunde = pruefen(wurzel, { branch: aktuellerBranch(wurzel) });
  for (const b of befunde) console.log(`muss: ${b}`);
  console.log(befunde.length ? `AUFRÄUMEN ROT (${befunde.length})` : "AUFRÄUMEN OK");
  process.exit(befunde.length ? 1 : 0);
}
