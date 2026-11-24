#!/usr/bin/env node
// PreToolUse (AskUserQuestion): Fragen nur im Interview am Anfang. Jede Frage mit Vorschlag, höchstens 4 je
// Fenster; höchstens 10 je Lauf außer im Setup. Nach der Freigabe (status.json: freigabe gesetzt) keine Frage mehr.
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { ablehnen, eingabeLesen, projektOrdner, statusLesen } from "./hilfen.mjs";

export const MAX_FRAGEN = 10;

export function pruefeFragen(fragen, status) {
  if (status?.freigabe && status.phase !== "wahl")
    return "Ahmads Bestätigung der Zusammenfassung ist die Freigabe. Keine Rückfrage bis zum Pull Request: Unklares als Annahme festhalten (node scripts/status.mjs annahme \"…\").";
  if (!Array.isArray(fragen) || !fragen.length) return null;
  if (fragen.length > 4) return "Höchstens 4 Fragen je Fenster; weitere Fenster direkt danach.";
  const zuViele = fragen.filter((f) => (f.options ?? []).length > 4);
  if (zuViele.length) return "Höchstens 4 Optionen je Frage; weitere Werte per Freitext.";
  const ohne = fragen.filter((f) => !(f.options ?? []).some((o) => /\(Vorschlag\)/i.test(o.label ?? "")));
  if (ohne.length) return `Jede Frage braucht eine Option mit „(Vorschlag)“ im Text: ${ohne.map((f) => f.header ?? f.question).join(", ")}`;
  const bisher = status?.fragen ?? 0;
  if (status?.art !== "setup" && bisher + fragen.length > MAX_FRAGEN) return `Höchstens ${MAX_FRAGEN} Fragen im Interview (bisher ${bisher}).`;
  return null;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const e = eingabeLesen();
  const gefunden = statusLesen(projektOrdner(e));
  const fragen = e.tool_input?.questions ?? [];
  const grund = pruefeFragen(fragen, gefunden?.status);
  if (grund) ablehnen(grund);
  if (gefunden) {
    gefunden.status.fragen = (gefunden.status.fragen ?? 0) + fragen.length;
    writeFileSync(gefunden.pfad, JSON.stringify(gefunden.status, null, 2) + "\n");
  }
}
