---
name: team-holen
description: Ein Projekt auf die neueste Kit-Version bringen; Projektspezifisches bleibt.
disable-model-invocation: true
argument-hint: "[Adresse des Kit-Repos]"
---

1. `git checkout -b kit-<version> origin/main`, `node scripts/status.mjs start autopilot --features "Kit holen"`,
   `node scripts/status.mjs freigabe`.
2. Kit-Repo (Adresse aus dem Argument oder `projekt.json` → `kitQuelle`) nach `/tmp/kit-quelle` klonen
   (`git clone --depth 1 <adresse> /tmp/kit-quelle`). Nicht erreichbar: im Report um den Zugang bitten, Ende.
3. `node scripts/kit-holen.mjs /tmp/kit-quelle`. Das Skript ersetzt nur Kit-Dateien aus `kit-manifest.json`, entfernt
   Kit-Dateien, die es in der neuen Version nicht gibt, behält Ahmads Paket-Freigaben und löscht Zeilen aus
   `kit-feedback.md`, die laut `kit-erledigt.json` erledigt sind.
4. `npm install`, `node scripts/schnellpruefung.mjs`. Rote Prüfungen durch neue Kit-Regeln behebt ein bauer im Projekt.
5. Commit (einzeln benannte Pfade), Push, Pull Request „Kit <alt> → <neu>“ mit der Liste geänderter Kit-Dateien und
   erledigter Feedback-Zeilen, `node scripts/status.mjs pr <link>`.
