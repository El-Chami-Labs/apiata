#!/usr/bin/env node
// Ergebnis der GitHub-Prüfungen (Haken) für den aktuellen Commit, eine Zeile je Prüfung.
// node scripts/actions.mjs [commit] [--warten [minuten]]   Zugang über `gh api`, sonst GH_TOKEN/GITHUB_TOKEN.
// --warten fragt alle 20 s nach, bis keine Prüfung mehr läuft (höchstens 8 Minuten, dann erneut aufrufen).
// Gibt es einen Lauf auf dem Branch, steht der Stand in status.json (haken); grün mit Pull Request setzt die Phase fertig.
// Exit: 0 grün, 1 rot, 2 GitHub nicht erreichbar, 3 noch keine Prüfungen, 4 läuft noch.
import { execFileSync, spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { branchName, hakenEintragen, lesen, schreiben, statusPfad } from "./status.mjs";

export const ROT = ["failure", "cancelled", "timed_out", "action_required", "startup_failure"];

/** Prüfläufe auswerten: { stand: grün | rot | läuft | keine, zeilen } */
export function auswerten(laeufe) {
  const zeilen = laeufe.map((l) => `${l.conclusion ?? l.status}: ${l.name}${l.html_url ? ` ${l.html_url}` : ""}`);
  if (!laeufe.length) return { stand: "keine", zeilen };
  if (laeufe.some((l) => ROT.includes(l.conclusion))) return { stand: "rot", zeilen };
  if (laeufe.some((l) => l.status !== "completed")) return { stand: "läuft", zeilen };
  return { stand: "grün", zeilen };
}

const CODE = { grün: 0, rot: 1, "nicht erreichbar": 2, keine: 3, läuft: 4 };

async function abfragen(repo, sha) {
  const pfad = `repos/${repo}/commits/${sha}/check-runs?per_page=100`;
  const gh = spawnSync("gh", ["api", pfad], { encoding: "utf8" });
  if (gh.status === 0) return JSON.parse(gh.stdout).check_runs ?? [];
  const token = process.env.GH_TOKEN ?? process.env.GITHUB_TOKEN;
  if (!token) throw new Error((gh.stderr || "gh fehlt").split("\n")[0]);
  const r = await fetch(`https://api.github.com/${pfad}`, { headers: { authorization: `Bearer ${token}`, accept: "application/vnd.github+json" } });
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  return (await r.json()).check_runs ?? [];
}

// Workflows, die schon beim Start scheitern (fehlerhafte Datei), erzeugen keine Prüfläufe
function workflowFehler(repo, sha) {
  const r = spawnSync("gh", ["api", `repos/${repo}/actions/runs?head_sha=${sha}`, "--jq", ".workflow_runs[] | \"\\(.conclusion // .status): \\(.path) \\(.html_url)\""], { encoding: "utf8" });
  return (r.stdout ?? "").trim().split("\n").filter((z) => /^failure/.test(z)).map((z) => `${z} (Workflow-Datei fehlerhaft?)`);
}

function eintragen(stand, sha) {
  try {
    const pfad = statusPfad(".", branchName("."));
    if (!existsSync(pfad)) return;
    const s = lesen(pfad);
    schreiben(pfad, hakenEintragen(s, stand, sha));
    if (s.phase === "fertig") console.log("LAUF FERTIG: Haken grün. Nichts mehr committen oder pushen; Stand nur in die Beschreibung des Pull Requests.");
  } catch { /* ohne Lauf nichts einzutragen */ }
}

async function main() {
  const args = process.argv.slice(2);
  const iw = args.indexOf("--warten");
  const minuten = iw >= 0 && /^\d+$/.test(args[iw + 1] ?? "") ? Number(args[iw + 1]) : 8;
  const commit = args.find((a, i) => !a.startsWith("--") && !(iw >= 0 && i === iw + 1)) ?? "HEAD";
  const git = (...a) => execFileSync("git", a, { encoding: "utf8" }).trim();
  const sha = git("rev-parse", commit);
  const remote = git("remote", "get-url", "origin");
  const m = remote.match(/github\.com[/:]([^/]+)\/([^/.]+)/i) ?? remote.match(/\/git\/([^/]+)\/([^/.]+)/);
  if (!m) { console.log(`FEHLER: kein GitHub-Repo erkannt (${remote})`); process.exit(2); }
  const repo = `${m[1]}/${m[2]}`;
  const bis = Date.now() + minuten * 60_000;
  let e;
  for (;;) {
    try { e = auswerten(await abfragen(repo, sha)); } catch (f) {
      console.log(`FEHLER: GitHub nicht erreichbar (${f.message}); Stand der Haken mit dem GitHub-Werkzeug lesen, dann node scripts/status.mjs haken <grün|rot> "<Beleg>"`);
      eintragen("nicht erreichbar", sha);
      process.exit(2);
    }
    if (e.stand === "keine") e.zeilen.push(...workflowFehler(repo, sha));
    if (e.stand === "keine" && e.zeilen.length) e.stand = "rot";
    if (iw < 0 || !["läuft", "keine"].includes(e.stand) || Date.now() > bis) break;
    await new Promise((ok) => setTimeout(ok, 20_000));
  }
  for (const z of e.zeilen) console.log(z);
  const text = { grün: "GRÜN", rot: "ROT", läuft: "LÄUFT", keine: "KEINE PRÜFUNGEN (noch nicht gestartet?)" }[e.stand];
  console.log(`ACTIONS ${text} (${sha.slice(0, 7)})`);
  eintragen(e.stand, sha);
  process.exit(CODE[e.stand]);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) await main();
