#!/usr/bin/env node
// status.json je Lauf (laeufe/<branch>/status.json): was läuft, was fertig, was offen, Zeitstempel je Phase.
// node scripts/status.mjs start <art> [--features "A;B"]   art: setup | autopilot | feinschliff | pruefen
//   start löscht vorher die laeufe/-Ordner gemergter Läufe (Ordner liegt auf main) in einem eigenen Commit.
//   autopilot: höchstens 8 Features, der Rest steht unter naechsterLauf; je Feature Nummer und Pfad der Spezifikation.
// node scripts/status.mjs phase <name>          node scripts/status.mjs freigabe
// node scripts/status.mjs feature <nr|name> <offen|bau|pruefung|fertig>   (bau merkt sich den Basis-Commit)
// node scripts/status.mjs weiter                nächstes offenes Feature mit Schritt (zum Fortsetzen)
// node scripts/status.mjs offen "<text>"  (kein sichtbarer Fehler)   node scripts/status.mjs annahme "<text>"
// node scripts/status.mjs pr <link>             Phase „haken“: fertig erst mit grünen GitHub-Haken (actions.mjs --warten);
//   prüft vorher die Vorschau-Links in laeufe/<branch>/report.md (vorschau-link.mjs --pruefen)
// node scripts/status.mjs haken <grün|rot> "<Beleg>"   nur wenn actions.mjs GitHub nicht erreicht: Stand aus dem GitHub-Werkzeug
// node scripts/status.mjs zeige | zeiten
import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { SICHTBAR } from "./bericht.mjs";
import { projektLesen } from "./build-text.mjs";
import { linksPruefen } from "./vorschau-link.mjs";

export const jetzt = () => new Date().toISOString();

export function branchName(ordner = ".") {
  return process.env.LAUF_BRANCH || execFileSync("git", ["-C", ordner, "branch", "--show-current"], { encoding: "utf8" }).trim();
}

export const statusPfad = (ordner, branch) => join(ordner, "laeufe", branch, "status.json");

export function lesen(pfad) {
  if (!existsSync(pfad)) throw new Error(`Kein Lauf auf diesem Branch (${pfad} fehlt). Start: node scripts/status.mjs start <art>`);
  return JSON.parse(readFileSync(pfad, "utf8"));
}

export function schreiben(pfad, s) {
  mkdirSync(dirname(pfad), { recursive: true });
  writeFileSync(pfad, JSON.stringify(s, null, 2) + "\n");
}

export function phaseWechseln(s, name, zeit = jetzt()) {
  const letzte = s.phasen.at(-1);
  if (letzte && !letzte.ende) letzte.ende = zeit;
  s.phase = name;
  if (!["fertig", "abgebrochen"].includes(name)) s.phasen.push({ name, start: zeit });
  return s;
}

/** Lauf-Ordner unter laeufe/ (Ordner mit status.json, auch verschachtelt; sonst die erste Ebene). */
export function laufOrdnerListen(ordner) {
  const basis = join(ordner, "laeufe");
  if (!existsSync(basis)) return [];
  const suche = (rel) => {
    const voll = join(basis, rel);
    if (existsSync(join(voll, "status.json"))) return [rel];
    const unter = readdirSync(voll).filter((e) => statSync(join(voll, e)).isDirectory()).flatMap((e) => suche(rel ? `${rel}/${e}` : e));
    return unter.length || !rel || rel.includes("/") ? unter : [rel];
  };
  return suche("").filter(Boolean);
}

/** Läufe gemergter Branches löschen: Ordner, die auf main liegen, außer dem eigenen. Ein Commit, Geschichte bleibt in Git. */
export function gemergteAufraeumen(ordner, branch) {
  const git = (...a) => execFileSync("git", ["-C", ordner, ...a], { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"], env: { ...process.env, GIT_TERMINAL_PROMPT: "0" } });
  try { git("fetch", "--quiet", "origin", "main"); } catch { /* ohne Netz: lokaler Stand */ }
  const aufMain = (l) => ["origin/main", "main"].some((ref) => { try { git("cat-file", "-e", `${ref}:laeufe/${l}`); return true; } catch { return false; } });
  const weg = laufOrdnerListen(ordner).filter((l) => l !== branch && aufMain(l)).map((l) => `laeufe/${l}`);
  if (!weg.length) return [];
  git("rm", "-r", "-q", "--", ...weg);
  git("commit", "-q", "-m", `Aufräumen: Läufe gemergter Branches entfernt (${weg.join(", ")})`, "--", ...weg);
  return weg;
}

export const MAX_FEATURES = 8;

export const kurzname = (name) =>
  name.toLowerCase().replace(/ä/g, "ae").replace(/ö/g, "oe").replace(/ü/g, "ue").replace(/ß/g, "ss")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 30).replace(/-+$/, "") || "feature";

export function neu(art, branch, features = [], zeit = jetzt()) {
  const max = art === "autopilot" ? MAX_FEATURES : Infinity;
  const liste = features.slice(0, max).map((name, i) => ({ nr: i + 1, name, status: "offen", spec: `laeufe/${branch}/spec-${i + 1}-${kurzname(name)}.md` }));
  return phaseWechseln(
    { art, branch, start: zeit, phase: "", freigabe: null, fragen: 0, phasen: [], features: liste, naechsterLauf: features.slice(max), offen: [], annahmen: [], pr: null, ende: null },
    "fragen",
    zeit,
  );
}

/** Stand der GitHub-Haken eintragen; grün mit Pull Request beendet den Lauf (Phase fertig). */
export function hakenEintragen(s, stand, commit, beleg = null, zeit = jetzt()) {
  s.haken = { stand, commit, zeit, ...(beleg ? { beleg } : {}) };
  if (stand === "grün" && s.pr && s.phase !== "fertig") {
    s.ende = zeit;
    phaseWechseln(s, "fertig", zeit);
  }
  return s;
}

export function featureFinden(s, schluessel) {
  return s.features.find((f) => String(f.nr) === String(schluessel) || f.name === schluessel);
}

/** Nächster Schritt nach einem Abbruch: erstes nicht fertiges Feature und wo es weitergeht. */
export function weiter(s, gibtEs = existsSync) {
  const f = s.features.find((x) => x.status !== "fertig");
  if (!f) return { schritt: "Abschluss: Schnellprüfung, Pull Request" };
  const kopf = { nr: f.nr, von: s.features.length, name: f.name, spec: f.spec, basis: f.basis ?? null };
  if (f.status === "pruefung") return { ...kopf, schritt: "pruefer: Runde nach den vorhandenen Berichten pruefung-<nr>-*.md, dann Nachbesserung" };
  if (f.status === "bau") return { ...kopf, schritt: "bauer: weiterbauen ab Stand des Branchs, dann Schnellprüfung" };
  if (f.spec && gibtEs(f.spec)) return { ...kopf, schritt: "Spezifikation liegt vor: tester (ab Prüfstufe 4) und bauer" };
  return { ...kopf, schritt: "Spezifikation schreiben" };
}

export function minuten(a, b) {
  return Math.round((new Date(b) - new Date(a)) / 6000) / 10;
}

export function zeiten(s, bis = jetzt()) {
  const zeilen = s.phasen.map((p) => `${p.name}: ${minuten(p.start, p.ende ?? bis)} min${p.ende ? "" : " (läuft)"}`);
  const ende = s.ende ?? s.phasen.at(-1)?.ende ?? bis;
  if (ende) zeilen.push(`gesamt: ${minuten(s.start, ende)} min`);
  if (s.freigabe && ende) zeilen.push(`ab Freigabe: ${minuten(s.freigabe, ende)} min`);
  return zeilen;
}

function main() {
  const [befehl, ...args] = process.argv.slice(2);
  const ordner = process.env.PROJEKT_ORDNER ?? ".";
  const branch = branchName(ordner);
  const pfad = statusPfad(ordner, branch);
  if (befehl === "start") {
    const i = args.indexOf("--features");
    const features = i >= 0 ? args[i + 1].split(";").map((x) => x.trim()).filter(Boolean) : [];
    if (existsSync(pfad)) { console.log(`Lauf existiert schon: ${pfad}`); process.exit(1); }
    const weg = gemergteAufraeumen(ordner, branch);
    if (weg.length) console.log(`AUFGERÄUMT: ${weg.join(", ")}`);
    const s = neu(args[0] ?? "autopilot", branch, features);
    schreiben(pfad, s);
    console.log(`START ${branch} (${pfad})`);
    if (s.naechsterLauf.length) console.log(`NÄCHSTER LAUF (über ${MAX_FEATURES}): ${s.naechsterLauf.join("; ")}`);
    return;
  }
  const s = lesen(pfad);
  if (befehl === "phase") phaseWechseln(s, args[0]);
  else if (befehl === "freigabe") { s.freigabe = jetzt(); phaseWechseln(s, "bauen", s.freigabe); }
  else if (befehl === "feature") {
    const f = featureFinden(s, args[0]) ?? (s.features.push({ nr: s.features.length + 1, name: args[0] }), s.features.at(-1));
    f.status = args[1] ?? "fertig";
    f[`${f.status}Zeit`] = jetzt();
    if (f.status === "bau" && !f.basis) try { f.basis = execFileSync("git", ["-C", ordner, "rev-parse", "HEAD"], { encoding: "utf8" }).trim(); } catch { f.basis = null; }
  } else if (befehl === "offen") {
    if (SICHTBAR.test(args.join(" "))) { console.log("FEHLER: sichtbarer Fehler bleibt nie offen: bauer behebt ihn, pruefer sieht die Änderung an, bis er behoben ist"); process.exit(1); }
    s.offen.push(args.join(" "));
  }
  else if (befehl === "annahme") s.annahmen.push(args.join(" "));
  else if (befehl === "pr") {
    const report = join(ordner, "laeufe", branch, "report.md");
    const falsch = existsSync(report) ? linksPruefen(readFileSync(report, "utf8"), branch, projektLesen(ordner)) : [];
    if (falsch.length) { for (const f of falsch) console.log(`FEHLER: ${report}: ${f}`); console.log("Link aus node scripts/vorschau-link.mjs übernehmen, Report und Pull Request berichtigen, dann erneut."); process.exit(1); }
    s.pr = args[0];
    phaseWechseln(s, "haken");
  }
  else if (befehl === "haken") {
    if (s.haken?.stand !== "nicht erreichbar") { console.log("FEHLER: Stand der Haken misst node scripts/actions.mjs --warten; haken nur, wenn es GitHub nicht erreicht"); process.exit(1); }
    if (!["grün", "rot"].includes(args[0]) || !args[1]) { console.log('FEHLER: node scripts/status.mjs haken <grün|rot> "<Beleg>"'); process.exit(2); }
    hakenEintragen(s, args[0], execFileSync("git", ["-C", ordner, "rev-parse", "HEAD"], { encoding: "utf8" }).trim(), args.slice(1).join(" "));
  }
  else if (befehl === "zeiten") { console.log(zeiten(s).join("\n")); return; }
  else if (befehl === "weiter") {
    const w = weiter(s, (p) => existsSync(join(ordner, p)));
    console.log(w.nr ? `WEITER: Feature ${w.nr} von ${w.von} „${w.name}“ – ${w.schritt} (Spezifikation ${w.spec}${w.basis ? `, Basis ${w.basis}` : ""})` : `WEITER: ${w.schritt}`);
    return;
  }
  else if (befehl === "zeige") {
    console.log(`${s.art} ${s.branch}: Phase ${s.phase}, Freigabe ${s.freigabe ? "ja" : "nein"}, PR ${s.pr ?? "fehlt"}, Haken ${s.haken ? `${s.haken.stand} (${s.haken.commit.slice(0, 7)})` : "nicht gemessen"}`);
    for (const f of s.features) console.log(`- ${f.nr ?? "-"} ${f.name}: ${f.status}`);
    if (s.naechsterLauf?.length) console.log(`nächster Lauf: ${s.naechsterLauf.join("; ")}`);
    for (const o of s.offen) console.log(`offen: ${o}`);
    return;
  } else { console.log("Befehle: start, phase, freigabe, feature, offen, annahme, pr, haken, zeige, zeiten, weiter"); process.exit(2); }
  schreiben(pfad, s);
  console.log(`${befehl} ok: Phase ${s.phase}`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  try { main(); } catch (f) { console.log(`FEHLER: ${f.message}`); process.exit(1); }
}
