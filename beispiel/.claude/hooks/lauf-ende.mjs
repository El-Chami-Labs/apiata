#!/usr/bin/env node
// Stop-Hook: Ein Lauf endet erst mit dem Pull Request und grünen GitHub-Haken für den letzten Commit. Erlaubte Halte: Interview (phase „fragen“) und
// Gestaltungswahl (phase „wahl“). Schutz mit stop_hook_active: Haben sich status.json und der Git-Stand (Commit,
// geänderte Dateien) seit der letzten Sperre nicht verändert, darf die Sitzung anhalten (kein Endlosschleife); der Stand bleibt für /autopilot-fortsetzen.
import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { eingabeLesen, projektOrdner, statusLesen } from "./hilfen.mjs";

export const HALTE = ["fragen", "wahl", "fertig", "abgebrochen"];

/** { sperren: bool, grund } */
export function entscheiden(status, stopAktiv, letzterHash, hash, head = "") {
  if (!status || HALTE.includes(status.phase)) return { sperren: false };
  if (stopAktiv && letzterHash === hash) return { sperren: false, grund: "kein Fortschritt seit der letzten Sperre" };
  if (status.pr) {
    const h = status.haken;
    const stand = h ? `${h.stand} für ${h.commit.slice(0, 7)}${head && h.commit !== head ? ", neuer Commit seit der Messung" : ""}` : "nicht gemessen";
    return {
      sperren: true,
      grund: `Pull Request steht, GitHub-Haken: ${stand}. Fertig erst, wenn alle grün sind: node scripts/actions.mjs --warten; rot → Ursache im Link lesen, beheben, pushen, erneut warten. Den Stand im Report nennen.`,
    };
  }
  const offen = (status.features ?? []).filter((f) => f.status !== "fertig").map((f) => f.name);
  return {
    sperren: true,
    grund: `Lauf „${status.branch}“ ist nicht fertig (Phase ${status.phase}${offen.length ? `, offen: ${offen.join(", ")}` : ""}). Weiterarbeiten bis zum Pull Request; Unklares als Annahme festhalten. Am Ende: node scripts/status.mjs pr <link>.`,
  };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const e = eingabeLesen();
  const ordner = projektOrdner(e);
  const gefunden = statusLesen(ordner);
  const merk = join(ordner, ".lauf-stop.json");
  const git = (...a) => spawnSync("git", ["-C", ordner, ...a], { encoding: "utf8" }).stdout ?? "";
  const hash = gefunden ? createHash("sha1").update(readFileSync(gefunden.pfad)).update(git("rev-parse", "HEAD")).update(git("status", "--porcelain")).digest("hex") : "";
  const letzter = existsSync(merk) ? JSON.parse(readFileSync(merk, "utf8")).hash : "";
  const { sperren, grund } = entscheiden(gefunden?.status, Boolean(e.stop_hook_active), letzter, hash, git("rev-parse", "HEAD").trim());
  if (sperren) {
    writeFileSync(merk, JSON.stringify({ hash }));
    process.stdout.write(JSON.stringify({ decision: "block", reason: grund }));
  }
}
