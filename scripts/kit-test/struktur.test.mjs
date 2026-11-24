// Kit-Test: Aufbau und Lesedisziplin (Wortzahlen, Lesebudget, Doppelungen, Altlasten, Frontmatter, Erlaubnisliste,
// Manifest, Workflow, Testgrenzen).
import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const wurzel = new URL("../../", import.meta.url).pathname;
const lesen = (p) => readFileSync(join(wurzel, p), "utf8");
const cfg = JSON.parse(lesen("docs/wortzahl.json"));
const woerter = (t) => t.split(/\s+/).filter(Boolean).length;

function mdDateien(pfad) {
  const voll = join(wurzel, pfad);
  if (!existsSync(voll)) return [];
  if (!statSync(voll).isDirectory()) return pfad.endsWith(".md") ? [pfad] : [];
  return readdirSync(voll).flatMap((e) => mdDateien(join(pfad, e)));
}
const istMaterial = (d) => cfg.material.some((m) => d === m || d.startsWith(m + "/"));
const regeln = cfg.regeltexte.flatMap(mdDateien).filter((d) => !istMaterial(d));

export function frontmatter(text) {
  const m = text.match(/^---\n([\s\S]*?)\n---/);
  const daten = {};
  if (!m) return daten;
  let schluessel = null;
  for (const z of m[1].split("\n")) {
    const kv = z.match(/^([\w-]+):\s*(.*)$/);
    if (kv) { schluessel = kv[1]; daten[schluessel] = kv[2]; } else if (schluessel) daten[schluessel] += "\n" + z;
  }
  return daten;
}

test("Wortzahlen: CLAUDE.md, Rollen, Regeltexte gesamt", () => {
  const g = cfg.grenzen;
  assert.ok(woerter(lesen("CLAUDE.md")) <= g["CLAUDE.md"], `CLAUDE.md hat ${woerter(lesen("CLAUDE.md"))} Wörter`);
  for (const r of mdDateien(".claude/agents")) assert.ok(woerter(lesen(r)) <= g.rolle, `${r}: ${woerter(lesen(r))} Wörter`);
  const gesamt = regeln.reduce((s, d) => s + woerter(lesen(d)), 0);
  assert.ok(gesamt <= g.gesamt, `Regeltexte gesamt ${gesamt} Wörter`);
  assert.ok(regeln.length >= 10, "Regeltexte nicht gefunden");
});

test("Lesebudget je Rolle unter der Grenze (CLAUDE.md + Rolle + vorgeladene Skills + Pflichtlektüre der Rolle)", () => {
  for (const r of mdDateien(".claude/agents")) {
    const fm = frontmatter(lesen(r));
    const skills = (fm.skills ?? "").split(/[,\n]/).map((s) => s.replace(/^[\s-]+/, "").trim()).filter(Boolean);
    // Kit-Dateien, die die Rolle in Backticks nennt, plus ein fester Betrag für Projektdateien (Spezifikation, Design-System, Bauplan)
    const pflicht = [...new Set([...lesen(r).matchAll(/`([\w./-]+\.md)`/g)].map((m) => m[1]))].filter((p) => existsSync(join(wurzel, p)) && !p.startsWith(".claude/agents/"));
    const summe = woerter(lesen("CLAUDE.md")) + woerter(lesen(r)) + skills.reduce((s, k) => s + woerter(lesen(`.claude/skills/${k}/SKILL.md`)), 0) +
      pflicht.reduce((s, p) => s + woerter(lesen(p)), 0) + cfg.grenzen.projektdateien;
    assert.ok(summe < cfg.grenzen.lesebudget, `${r}: Lesebudget ${summe} Wörter`);
  }
});

test("Doppelungs-Wächter: kein Satz steht in zwei Regeldateien", () => {
  const gesehen = new Map();
  const doppelt = [];
  for (const d of regeln) {
    const saetze = lesen(d).replace(/^---[\s\S]*?---/, "").split(/(?<=[.!?])\s+|\n/).map((s) => s.replace(/^[\s>*#|`\d.-]+/, "").replace(/\s+/g, " ").trim().toLowerCase()).filter((s) => s.length >= 50);
    for (const s of new Set(saetze)) {
      if (gesehen.has(s) && gesehen.get(s) !== d) doppelt.push(`${gesehen.get(s)} + ${d}: ${s.slice(0, 70)}`);
      else gesehen.set(s, d);
    }
  }
  assert.deepEqual(doppelt, []);
});

test("Altlasten-Wächter: keine Wörter wie „früher“ oder „bisher“ in Regeltexten (auch gebeugt)", () => {
  const funde = [];
  for (const d of regeln) {
    const t = lesen(d).toLowerCase();
    for (const w of cfg.altlasten) if (new RegExp(`(^|[^\\p{L}])${w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`, "u").test(t)) funde.push(`${d}: „${w}“`);
  }
  assert.deepEqual(funde, []);
});

test("CLAUDE.md importiert keine anderen Dateien", () => {
  assert.ok(!/(^|\s)@[\w./-]+\.(md|json)/m.test(lesen("CLAUDE.md")));
});

test("Skills: jeder Ablauf mit disable-model-invocation, name und description", () => {
  const ablaeufe = readdirSync(join(wurzel, ".claude/skills")).filter((d) => d !== "frontend-design");
  for (const s of ["setup-starten", "gestaltungswahl", "autopilot-starten", "autopilot-fortsetzen", "feinschliff", "pruefen", "medien", "team-holen", "team-verbessern"]) assert.ok(ablaeufe.includes(s), `Skill ${s} fehlt`);
  for (const s of ablaeufe) {
    const fm = frontmatter(lesen(`.claude/skills/${s}/SKILL.md`));
    assert.equal(fm.name, s);
    assert.equal(fm["disable-model-invocation"], "true", `${s}: disable-model-invocation fehlt`);
    assert.ok(fm.description?.length > 20, `${s}: description fehlt`);
  }
});

test("Befehlsnamen: kein Text nennt einen alten Befehl, Gestaltungswahl ist kein Startsatz", () => {
  const ALT = ["setup", "lauf", "lauf-fortsetzen", "kit-holen", "kit-verbessern", "gestaltungswahl"];
  const befehl = new RegExp(`(^|[^\\w./-])/(${ALT.join("|")})(?![\\w/-])`, "m");
  const ordner = new RegExp(`skills/(${ALT.filter((n) => n !== "gestaltungswahl").join("|")})/`);
  const texte = (pfad) => {
    const voll = join(wurzel, pfad);
    if (statSync(voll).isDirectory()) return readdirSync(voll).filter((e) => ![".git", "node_modules", "dist"].includes(e)).flatMap((e) => texte(pfad ? `${pfad}/${e}` : e));
    return /\.(md|mjs|js|ts|json|jsonc|yml|astro|txt)$/.test(pfad) ? [pfad] : [];
  };
  const funde = texte("").filter((d) => befehl.test(lesen(d)) || ordner.test(lesen(d)));
  assert.deepEqual(funde, []);
  const startsaetze = lesen("CLAUDE.md").match(/## Startsätze[\s\S]*?\n## /)[0];
  assert.ok(!/gestaltungswahl/.test(startsaetze), "Gestaltungswahl steht in der Startsatz-Tabelle");
  assert.equal(frontmatter(lesen(".claude/skills/gestaltungswahl/SKILL.md"))["user-invocable"], "false");
  for (const n of ["setup-starten", "autopilot-starten", "autopilot-fortsetzen", "team-holen", "team-verbessern", "medien", "feinschliff", "pruefen"])
    assert.match(startsaetze, new RegExp("`/" + n + "[ `]"), `Startsatz /${n} fehlt`);
});

test("Rollen: höchstens drei plus tester, Frontmatter statt Text", () => {
  const rollen = readdirSync(join(wurzel, ".claude/agents")).sort();
  assert.deepEqual(rollen, ["bauer.md", "pruefer.md", "tester.md"]);
  const modelle = { bauer: "sonnet", pruefer: "opus", tester: "sonnet" };
  for (const r of rollen) {
    const fm = frontmatter(lesen(`.claude/agents/${r}`));
    const n = r.replace(".md", "");
    assert.equal(fm.name, n);
    assert.equal(fm.model, modelle[n], `${n}: Modell`);
    assert.equal(fm.permissionMode, "dontAsk", `${n}: permissionMode`);
    assert.ok(Number(fm.maxTurns) > 0, `${n}: maxTurns`);
  }
  const p = frontmatter(lesen(".claude/agents/pruefer.md"));
  for (const t of ["Write", "Edit", "NotebookEdit"]) assert.ok(p.disallowedTools.includes(t), `pruefer darf ${t}`);
  assert.ok(!/Write|Edit/.test(p.tools), "pruefer tools enthält Schreibwerkzeug");
  assert.match(p.hooks, /nur-lesen\.mjs/);
});

test("Erlaubnisliste deckt alle Kit-Skripte und Befehle der Skills ab", () => {
  const settings = JSON.parse(lesen(".claude/settings.json"));
  const erlaubt = settings.permissions.allow.filter((a) => a.startsWith("Bash(")).map((a) => a.slice(5, -1));
  const passt = (befehl) => erlaubt.some((m) => new RegExp("^" + m.replace(/[.+?^${}()|[\]\\]/g, "\\$&").replace(/\*/g, ".*") + "$").test(befehl));
  const skripte = readdirSync(join(wurzel, "scripts")).filter((d) => d.endsWith(".mjs") && /process\.argv/.test(lesen(`scripts/${d}`)));
  for (const s of skripte) assert.ok(passt(`node scripts/${s} x`), `nicht erlaubt: node scripts/${s}`);
  const texte = [...mdDateien(".claude"), "CLAUDE.md", "docs/GESTALTUNG-RICHTUNGEN.md"].map(lesen).join("\n");
  const befehle = [...texte.matchAll(/`((?:node|npm|npx|git|gh) [^`]+)`/g)].map((m) => m[1].replace(/\s+/g, " "));
  assert.ok(befehle.length > 20);
  for (const b of befehle) {
    assert.ok(passt(b), `Befehl aus Skill nicht erlaubt: ${b}`);
    const skript = b.match(/node (scripts\/[\w-]+\.mjs)/)?.[1];
    if (skript) assert.ok(existsSync(join(wurzel, skript)), `Skript fehlt: ${skript}`);
    const npm = b.match(/^npm run ([\w-]+)/)?.[1];
    if (npm) assert.ok(JSON.parse(lesen("vorlagen/website/package.json")).scripts[npm], `npm-Skript fehlt: ${npm}`);
  }
  for (const h of ["grenzen", "paket-sperre", "frage-sperre", "lauf-ende"]) assert.ok(JSON.stringify(settings.hooks).includes(`${h}.mjs`), `Hook ${h} nicht eingetragen`);
});

test("Manifest: jede Kit-Datei existiert, jede Datei im Repo ist zugeordnet", () => {
  const m = JSON.parse(lesen("kit-manifest.json"));
  for (const p of [...m.kit, ...m.zusammenfuehren, ...m.nurKit]) assert.ok(existsSync(join(wurzel, p)), `fehlt: ${p}`);
  const bekannt = [...m.kit, ...m.zusammenfuehren, ...m.nurKit, ...m.projekt, ".git", ".gitignore", ".claude", ".github", "docs", "node_modules", ".lauf-stop.json"];
  for (const e of readdirSync(wurzel)) assert.ok(bekannt.some((b) => b === e || b.startsWith(e + "/")), `nicht im Manifest: ${e}`);
  for (const e of readdirSync(join(wurzel, "docs"))) assert.ok(bekannt.some((b) => b === `docs/${e}` || b.startsWith(`docs/${e}/`)), `nicht im Manifest: docs/${e}`);
});

test("Workflow prüft alles Feste, Unfertig-Sperre nur auf main", () => {
  const w = lesen(".github/workflows/pruefung.yml");
  for (const s of ["npm ci", "npm run build", "npm run typen", "npm run lint", "npm run test", "npm run e2e", "unfertig-sperre", "pakete.mjs", "fremdquellen.mjs", "fakten.mjs", "aufraeumen.mjs"]) assert.ok(w.includes(s), `Workflow ohne ${s}`);
  assert.match(w, /refs\/heads\/main/);
  assert.match(w, /^jobs:\n  pruefung:\n    runs-on: ubuntu-latest\n    timeout-minutes: 15$/m, "Job höchstens 15 Minuten");
  const browser = w.match(/- name: Browser installieren\n((?:        .*\n)+)/)?.[1] ?? "";
  assert.match(browser, /timeout-minutes: 5\n/, "Browser höchstens 5 Minuten");
  assert.equal((browser.match(/timeout \d+ npx playwright install --with-deps chromium/g) ?? []).length, 2, "Browser mit einer Wiederholung");
  assert.match(w, /-f projekt\.json \]; then echo "setup=ja"/);
  for (const name of ["Unfertig-Sperre", "Kern-Tests"]) {
    const bedingung = w.match(new RegExp(`- name: ${name}[^\\n]*\\n\\s+if: ([^\\n]+)`))?.[1] ?? "";
    assert.match(bedingung, /steps\.projekt\.outputs\.setup == 'ja'/, `${name} ohne projekt.json-Bedingung`);
  }
});

test("Kit-Test-Workflow startet nur im Kit-Repo", () => {
  const w = lesen(".github/workflows/kit-test.yml");
  const jobs = [...w.split(/^jobs:\n/m)[1].matchAll(/^  ([\w-]+):\n((?:    .*\n|\s*\n)*)/gm)];
  assert.deepEqual(jobs.map((j) => j[1]), ["kit-test", "beispiel"]);
  for (const [, name, rumpf] of jobs) assert.match(rumpf, /^    if: github\.repository == 'El-Chami-Labs\/dev-agents'$/m, `Job ${name} ohne Repo-Bedingung`);
});

test("Vorlage wrangler.jsonc hat den Block previews für npx wrangler preview", () => {
  assert.match(lesen("vorlagen/website/wrangler.jsonc"), /^\s*"previews": \{\s*\}/m);
});

test("team-verbessern endet vor dem Pull Request mit dem Abgleich des Beispiels", () => {
  const schritte = lesen(".claude/skills/team-verbessern/SKILL.md").split(/^\d+\. /m).slice(1);
  assert.ok(schritte.at(-2).includes("`node scripts/kit-holen.mjs . beispiel --ohne-referenzbilder`"));
  assert.match(schritte.at(-2), /Aufräum-Wächter/);
  assert.match(schritte.at(-1), /^Pull Request/);
});

test("Tests verhältnismäßig: höchstens 10 Kern-Tests, Wiederholung 1, Messungen getrennt", () => {
  const n = (p) => (lesen(p).match(/^test\(/gm) ?? []).length;
  assert.ok(n("vorlagen/website/tests/e2e/kern.spec.ts") + n("vorlagen/website/tests/e2e/ablauf.spec.ts") <= 10);
  const pw = lesen("vorlagen/website/playwright.config.ts");
  assert.match(pw, /retries: 1/);
  assert.match(pw, /name: "messung"/);
  assert.match(lesen("vorlagen/website/package.json"), /"e2e": "playwright test --project=handy --project=desktop --project=layout"/);
});
