#!/usr/bin/env node
// Schnellprüfung: Build, Typen, Lint, Logik-Tests, Datenschutz, Fakten, Pakete, Kern-Tests + Layout-Wächter,
// Messungen (blockieren nie). Eine Zeile je Schritt; Details in laeufe/<branch>/schnellpruefung.md.
// node scripts/schnellpruefung.mjs [--nur build,e2e] [--ohne messung] [--ziel <datei>]
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

export const SCHRITTE = [
  { name: "build", befehl: "npm run build" },
  { name: "typen", befehl: "npm run typen" },
  { name: "lint", befehl: "npm run lint" },
  { name: "logik", befehl: "npm run test" },
  { name: "datenschutz", befehl: "node scripts/fremdquellen.mjs dist" },
  { name: "fakten", befehl: "node scripts/fakten.mjs dist" },
  { name: "pakete", befehl: "node scripts/pakete.mjs ." },
  { name: "e2e", befehl: "npx playwright test --project=handy --project=desktop --project=layout --reporter=json", playwright: true },
  { name: "messung", befehl: "npx playwright test --project=messung --pass-with-no-tests --reporter=json", playwright: true, meldet: true },
];

/** Befunde aus Playwright-JSON: { muss: [], wackelt: [], ok } */
export function playwrightAuswerten(bericht) {
  const muss = [];
  const wackelt = [];
  let ok = 0;
  const gehen = (suite, pfad = []) => {
    for (const s of suite.suites ?? []) gehen(s, [...pfad, s.title]);
    for (const spec of suite.specs ?? [])
      for (const t of spec.tests ?? []) {
        const titel = `${spec.title} [${t.projectName}]`;
        if (t.status === "unexpected") muss.push(`${titel}: ${(t.results.at(-1)?.error?.message ?? "").replace(/\u001b\[\d+m/g, "").split("\n").find((z) => z.trim()) ?? "rot"}`);
        else if (t.status === "flaky") wackelt.push(titel);
        else if (t.status === "expected") ok++;
      }
  };
  for (const s of bericht.suites ?? []) gehen(s);
  for (const f of bericht.errors ?? []) muss.push(`Playwright: ${(f.message ?? "").split("\n")[0]}`);
  return { muss, wackelt, ok };
}

function ausfuehren(schritt, json) {
  const t0 = Date.now();
  const env = { ...process.env, ...(json ? { PLAYWRIGHT_JSON_OUTPUT_NAME: json } : {}) };
  const r = spawnSync(schritt.befehl, { shell: true, encoding: "utf8", env, maxBuffer: 64 * 1024 * 1024 });
  return { code: r.status ?? 1, ausgabe: `${r.stdout ?? ""}${r.stderr ?? ""}`, sekunden: Math.round((Date.now() - t0) / 1000) };
}

function main() {
  const args = process.argv.slice(2);
  const nur = args.includes("--nur") ? args[args.indexOf("--nur") + 1].split(",") : null;
  const ohne = args.includes("--ohne") ? args[args.indexOf("--ohne") + 1].split(",") : [];
  const branch = process.env.LAUF_BRANCH || spawnSync("git", ["branch", "--show-current"], { encoding: "utf8" }).stdout.trim() || "lokal";
  const ziel = args.includes("--ziel") ? args[args.indexOf("--ziel") + 1] : join("laeufe", branch, "schnellpruefung.md");
  const zeilen = [];
  const details = [];
  let rot = false;
  let buildRot = false;
  for (const s of SCHRITTE) {
    if ((nur && !nur.includes(s.name)) || ohne.includes(s.name)) continue;
    if (buildRot && ["datenschutz", "fakten", "e2e", "messung"].includes(s.name)) { zeilen.push(`übersprungen: ${s.name} (Build rot)`); continue; }
    const json = s.playwright ? join("node_modules/.cache", `pw-${s.name}.json`) : null;
    if (json) { mkdirSync(dirname(json), { recursive: true }); rmSync(json, { force: true }); }
    const r = ausfuehren(s, json);
    if (s.playwright && json && existsSync(json)) {
      const a = playwrightAuswerten(JSON.parse(readFileSync(json, "utf8")));
      for (const w of a.wackelt) zeilen.push(`wackelt: ${s.name}: ${w} (grün in der Wiederholung, blockiert nicht)`);
      for (const m of a.muss) zeilen.push(`${s.meldet ? "gemeldet" : "muss"}: ${s.name}: ${m}`);
      if (!a.muss.length) zeilen.push(`ok: ${s.name} (${a.ok} Tests, ${r.sekunden} s)`);
      else if (!s.meldet) rot = true;
      if (a.muss.length) details.push(`## ${s.name}\n\n\`\`\`\n${r.ausgabe.split("\n").filter((z) => !z.startsWith("{") && !z.startsWith(" ")).slice(-15).join("\n")}\n\`\`\``);
      continue;
    }
    if (r.code === 0) { zeilen.push(`ok: ${s.name} (${r.sekunden} s)`); continue; }
    const befundZeilen = r.ausgabe.split("\n").filter((z) => /^(muss|sollte):/.test(z));
    if (befundZeilen.length) zeilen.push(...befundZeilen.map((z) => z.replace(/^(muss|sollte):\s*/, `$1: ${s.name}: `)));
    else zeilen.push(`${s.meldet ? "gemeldet" : "muss"}: ${s.name}: ${r.ausgabe.split("\n").filter((z) => /error|fehler|✘|×|failed/i.test(z))[0]?.trim() ?? `Exit ${r.code}`}`);
    if (!s.meldet) rot = true;
    if (s.name === "build") buildRot = true;
    details.push(`## ${s.name}\n\n\`\`\`\n${r.ausgabe.trim().split("\n").slice(-25).join("\n")}\n\`\`\``);
  }
  const kopf = `# Schnellprüfung ${branch}\n\n${new Date().toISOString()} · Ergebnis: ${rot ? "ROT" : "GRÜN"}\n\n`;
  mkdirSync(dirname(ziel), { recursive: true });
  writeFileSync(ziel, kopf + zeilen.map((z) => `- ${z}`).join("\n") + "\n\n" + details.join("\n\n") + "\n");
  for (const z of zeilen) console.log(z);
  console.log(`SCHNELLPRÜFUNG ${rot ? "ROT" : "GRÜN"} → ${ziel}`);
  process.exit(rot ? 1 : 0);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) main();
