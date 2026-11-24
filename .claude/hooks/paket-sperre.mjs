#!/usr/bin/env node
// Paket-Sperre.
// UserPromptSubmit: trägt Ahmads Zeilen „PAKET-FREIGABE: <paket>@<version> <Lizenz>“ in docs/pakete-freigegeben.md ein.
// PreToolUse (Bash, Write, Edit): neue Pakete nur mit Freigabe; npx nur für bekannte Werkzeuge.
import { appendFileSync, existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { ablehnen, befehle, eingabeLesen, projektOrdner } from "./hilfen.mjs";
import { freigabenDatei, freigegeben, lizenzErlaubt, ungeprueft } from "../../scripts/pakete.mjs";

const NPX_WERKZEUGE = ["astro", "playwright", "vitest", "eslint", "tsc", "prettier", "wrangler", "vite"];
const INSTALL = ["install", "install-test", "it", "install-ci-test", "cit", "i", "in", "ins", "inst", "insta", "instal", "isnt", "isnta", "isntal", "isntall", "add"];

/** Paketname und Version aus einer Angabe wie @scope/name@1.2.3 */
export function zerlegen(angabe) {
  const m = angabe.match(/^(@?[^@\s]+)(?:@(.+))?$/);
  return m ? { name: m[1], version: m[2] } : { name: angabe };
}

export function pruefeBash(zeile, freigaben, ordner = ".") {
  for (const b of befehle(zeile)) {
    const kopf = b[0]?.split("/").pop();
    let sub = 1;
    while (sub < b.length && b[sub].startsWith("-")) sub += /^(--prefix|-C|--cwd|--registry|--cache|--workspace|-w)$/.test(b[sub]) ? 2 : 1;
    if (["npm", "pnpm", "yarn", "bun"].includes(kopf) && ["create", "init", "dlx", "exec", "x"].includes(b[sub]) && b.slice(sub + 1).some((a) => !a.startsWith("-")) && !(b[sub] === "init" && b.slice(sub + 1).every((a) => a.startsWith("-")))) {
      const werkzeug = zerlegen(b.slice(sub + 1).find((a) => !a.startsWith("-")));
      if (["create", "init"].includes(b[sub]) || !(NPX_WERKZEUGE.includes(werkzeug.name) && !werkzeug.version?.includes(":"))) return `${kopf} ${b[sub]} ${werkzeug.name} lädt ein Paket an der Freigabe vorbei.`;
    }
    if (["npm", "pnpm", "yarn", "bun"].includes(kopf) && INSTALL.includes(b[sub])) {
      const ende = b.findIndex((a, i) => i > sub && /^\d*[<>&]/.test(a));
      const pakete = b.slice(sub + 1, ende > 0 ? ende : undefined).filter((a) => !a.startsWith("-"));
      for (const p of pakete) {
        if (/^(\.|\/|file:|git|https?:|github:|link:)/.test(p)) return `Installieren aus Pfad oder Adresse ist gesperrt: ${p}`;
        const { name, version } = zerlegen(p);
        if (version && /^(npm|github|git|git\+\w+|https?|file|link|workspace):/.test(version)) {
          const echt = version.startsWith("npm:") ? zerlegen(version.slice(4)) : null;
          if (!echt || !freigegeben(freigaben, echt.name, echt.version)) return `Alias-Paket ${p} ist gesperrt: Es installiert ein anderes Paket unter freigegebenem Namen.`;
          continue;
        }
        if (!freigegeben(freigaben, name, version))
          return `Paket ${p} ist nicht freigegeben. Ohne das Paket bauen oder im Report melden: „offen: braucht PAKET-FREIGABE ${name}@<version> <Lizenz>“. Nicht warten.`;
      }
    }
    if (kopf === "bunx" || (kopf === "yarn" && b[1] === "dlx" && !NPX_WERKZEUGE.includes(zerlegen(b[2] ?? "").name))) return `${kopf} lädt Pakete an der Freigabe vorbei.`;
    if ((kopf === "npx" && b[1] === "astro" && b[2] === "add") || (kopf === "astro" && b[1] === "add") || (["pnpm", "yarn", "bunx"].includes(kopf) && b[1] === "astro" && b[2] === "add"))
      return "astro add installiert Pakete an der Freigabe vorbei. Integrationen mit npm install (freigegeben) und Eintrag in astro.config.mjs.";
    if (kopf === "npx" || (kopf === "pnpm" && b[1] === "dlx") || (kopf === "npm" && ["exec", "x"].includes(b[1]))) {
      const start = kopf === "npx" ? 1 : 2;
      const teile = b.slice(start);
      let werkzeug;
      for (let i = 0; i < teile.length; i++) {
        if (["-p", "--package"].includes(teile[i])) { werkzeug = teile[i + 1]; break; }
        if (teile[i].startsWith("--package=")) { werkzeug = teile[i].slice(10); break; }
        if (["--prefix", "--cache", "--registry", "-c", "--call"].includes(teile[i])) { i++; continue; }
        if (teile[i] === "--") continue;
        if (!teile[i].startsWith("-")) { werkzeug = teile[i]; break; }
      }
      if (!werkzeug) continue;
      const { name, version } = zerlegen(werkzeug);
      if (version && /:/.test(version)) return `npx ${werkzeug}: Alias-Pakete sind gesperrt.`;
      if (b.slice(start).some((x) => x === "add") && name === "astro") return "astro add installiert Pakete an der Freigabe vorbei.";
      const lokal = existsSync(join(ordner, "node_modules/.bin", name));
      if (!NPX_WERKZEUGE.includes(name) && !lokal && !freigegeben(freigaben, name))
        return `npx ${name} lädt ein nicht freigegebenes Paket. Nur installierte oder freigegebene Werkzeuge.`;
    }
  }
  return null;
}

/** Inhalt von package.json nach Write/Edit */
export function neuerInhalt(e, ordner) {
  const t = e.tool_input ?? {};
  if (e.tool_name === "Write") return t.content;
  const pfad = t.file_path?.startsWith("/") ? t.file_path : join(ordner, t.file_path ?? "");
  let alt = existsSync(pfad) ? readFileSync(pfad, "utf8") : "";
  const edits = t.edits ?? [{ old_string: t.old_string, new_string: t.new_string, replace_all: t.replace_all }];
  for (const ed of edits) alt = ed.replace_all ? alt.split(ed.old_string).join(ed.new_string) : alt.replace(ed.old_string, ed.new_string);
  return alt;
}

export function freigabeZeilen(text) {
  const raus = [];
  for (const m of String(text).matchAll(/PAKET-FREIGABE:\s*(\S+)\s+(\S+)/g)) {
    const { name, version } = zerlegen(m[1]);
    if (version) raus.push({ name, version, lizenz: m[2] });
  }
  return raus;
}

function main() {
  const e = eingabeLesen();
  const ordner = projektOrdner(e);
  if (e.hook_event_name === "UserPromptSubmit") {
    const neu = freigabeZeilen(e.prompt);
    if (!neu.length) return;
    const datei = join(ordner, "docs/pakete-freigegeben.md");
    const heute = new Date().toISOString().slice(0, 10);
    const notizen = [];
    for (const f of neu) {
      appendFileSync(datei, `| ${f.name} | ${f.version} | ${f.lizenz} | Ahmad ${heute} |\n`);
      notizen.push(`${f.name}@${f.version} freigegeben${lizenzErlaubt(f.lizenz) ? "" : ` (Lizenz ${f.lizenz} steht nicht auf der Liste erlaubter Lizenzen: im Report melden)`}`);
    }
    process.stdout.write(JSON.stringify({ hookSpecificOutput: { hookEventName: "UserPromptSubmit", additionalContext: notizen.join("; ") } }));
    return;
  }
  const freigaben = freigabenDatei(ordner);
  if (e.tool_name === "Bash") {
    const grund = pruefeBash(e.tool_input?.command ?? "", freigaben, ordner);
    if (grund) ablehnen(grund);
    return;
  }
  const pfad = e.tool_input?.file_path ?? "";
  if (/(^|\/)docs\/pakete-freigegeben\.md$/.test(pfad)) ablehnen("Freigaben trägt nur der Hook aus Ahmads Chat-Zeile ein.");
  if (/(^|\/)package\.json$/.test(pfad) && !/node_modules/.test(pfad)) {
    let paket;
    try {
      paket = JSON.parse(neuerInhalt(e, ordner));
    } catch {
      return; // unfertiges JSON: der Build meldet es
    }
    const offen = ungeprueft(paket, freigaben);
    if (offen.length) ablehnen(`Nicht freigegebene Pakete in package.json: ${offen.join(", ")}. Ohne sie bauen oder als „offen: braucht PAKET-FREIGABE …“ melden.`);
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) main();
