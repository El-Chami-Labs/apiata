---
name: pruefen
description: Einen bestehenden Branch (auch von einem anderen Werkzeug gebaut) prüfen – Schnellprüfung, pruefer, Tests an gewollte Änderungen anpassen, Report. Kein Neubau.
disable-model-invocation: true
argument-hint: "<Branch>"
---

Die Änderungen auf dem Branch sind gewollt. Kein Neubau, kein Zurücknehmen von Code.

1. `git fetch origin <branch>`, `git checkout -B <branch> origin/<branch>`,
   `node scripts/status.mjs start pruefen`, `node scripts/status.mjs freigabe`.
2. `npm install`, dann `node scripts/schnellpruefung.mjs`.
3. Rote Tests, die eine gewollte Änderung abbilden (Text, Reihenfolge, Optik), passt ein bauer an die Änderung an.
   Rote Tests, die echte Fehler zeigen, bleiben rot und werden Befunde.
4. pruefer über `git diff origin/main...HEAD` mit Übergabezettel (statt Spezifikation: Liste der Änderungen aus
   `git log origin/main..HEAD --oneline`).
5. Sichtbare Fehler und andere „muss“ behebt ein bauer gezielt an der Stelle; eine Nachrunde des pruefer nur auf
   diese Korrekturen, bei sichtbaren Fehlern weitere, bis sie behoben sind.
6. Report nach `.claude/skills/autopilot-starten/report.md` als Pull Request (oder Kommentar im bestehenden),
   `node scripts/status.mjs pr <link>`.
