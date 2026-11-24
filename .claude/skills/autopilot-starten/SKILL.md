---
name: autopilot-starten
description: Bis zu 8 Features nacheinander bauen und prüfen, bis zum Pull Request. Ein Halt – kurzes Interview mit Zusammenfassung.
disable-model-invocation: true
argument-hint: "<Feature 1>; <Feature 2>; …"
---

Der Lauf endet erst mit dem Pull Request (Stop-Hook `lauf-ende`).

1. `git fetch origin main` und `git checkout -b <kurzer-name> origin/main`, dann
   `node scripts/status.mjs start autopilot --features "<A>;<B>"`. Höchstens 8 Features: Das Skript nimmt die ersten 8,
   der Rest steht in `status.json` unter `naechsterLauf` und im Report als „Nächster Lauf“.
2. Lies `projekt.json`, `docs/design-system.md` und die Liste der Seiten (`src/pages/`). Kein Repo-Rundgang.
3. Kurzes Interview wie im Setup (`.claude/skills/setup-starten/fragen.md`, Abschnitte 2 und 3): Fenster nur, wo die
   Feature-Liste etwas offen lässt (höchstens 10 Fragen), dann die Zusammenfassung mit jeder Antwort und je Feature
   einer Zeile. Halt bis Ahmads „ok“.
4. `node scripts/status.mjs freigabe`. Ab hier keine Frage mehr; Unklares mit `node scripts/status.mjs annahme "…"`.
5. Je Feature in der Reihenfolge aus `status.json` (Nummer `<n>`):
   1. Spezifikation nach `spezifikation.md` (dieser Ordner) in den Pfad `spec` des Features; Commit;
      `node scripts/status.mjs feature <n> bau` (merkt sich den Basis-Commit).
   2. Ab Prüfstufe 4: tester mit Übergabezettel, vor dem bauer.
   3. bauer mit Übergabezettel (Inhalt: `CLAUDE.md`, „Übergabezettel“).
   4. `node scripts/schnellpruefung.mjs` selbst ausführen; rot → bauer behebt.
   5. `node scripts/status.mjs feature <n> pruefung`, pruefer Runde 1 mit Übergabezettel und Basis-Commit; Bericht
      `laeufe/<branch>/pruefung-<n>-1.md`.
   6. bauer behebt alle „muss“ und schnelle „sollte“; pruefer Runde 2 nur auf die Änderung. Höchstens eine weitere
      Runde, dann Offenes mit `node scripts/status.mjs offen "…"`; sichtbare Fehler nimmt es nicht an, sie brauchen
      weitere Runden.
   7. Push, `node scripts/status.mjs feature <n> fertig`, Commit und Push von `status.json`.
6. Abschluss: `node scripts/schnellpruefung.mjs`, `node scripts/zeilen.mjs`, Report nach `report.md` in
   `laeufe/<branch>/report.md`, Push. Pull Request auf `main` mit diesem Report (GitHub-Werkzeug oder `gh pr create`),
   dann `node scripts/status.mjs pr <link>` (prüft die Vorschau-Links), Commit und Push von `status.json`.
7. `node scripts/actions.mjs --warten`, bis „ACTIONS GRÜN“: rot → Ursache lesen, beheben, pushen, erneut warten.
   Stand nur in der Beschreibung des Pull Requests nachtragen; nach Grün kein Commit, kein Push.
8. Antwort an Ahmad: Link zum Pull Request, Vorschau-Link, ein nächster Schritt.
