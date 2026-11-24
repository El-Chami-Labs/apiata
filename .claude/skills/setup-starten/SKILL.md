---
name: setup-starten
description: Neues Projekt einrichten – Interview in Phasen, Grundgerüst, Cloudflare-Konfiguration, Gestaltungswahl, Pull Request.
disable-model-invocation: true
argument-hint: "<was das Projekt ist, bekannte Fakten wie Name, Telefon, Adresse>"
---

Zwei Halte: Interview und Gestaltungswahl. Sonst keine Frage. Kein Halt für die Technik: Sie ist eine Frage im
Interview.

1. `git checkout -b setup`, dann `node scripts/status.mjs start setup`.
2. Interview nach `fragen.md` (dieser Ordner): Projektbeschreibung, Fenster, Zusammenfassung.
3. Nach Ahmads „ok“ zur Zusammenfassung: `node scripts/status.mjs freigabe`. Annahmen ab jetzt mit
   `node scripts/status.mjs annahme "…"`.
4. Gerüst: `node scripts/geruest.mjs --name "<Name>" --worker <worker> --subdomain <subdomain> --pruefstufe <n>
   --gestaltungsstufe <n> --art <website|tool|app|plattform> --fotos <folgen|mit|ohne> --hauptaktion '<Selektor>' --aufraeumen` (mit `--3d`, wenn
   Ahmad 3D wünscht). Danach `npm install` und den angezeigten zusätzlichen `npm install …`.
5. Fakten aus Ahmads Text in `inhalte/fakten.json`; Fehlendes bleibt „Platzhalter: …“ auf den Seiten.
6. `npm run build`, `node scripts/schnellpruefung.mjs --ohne messung`; rot → beheben. Commit (einzeln benannte
   Dateien und Ordner), Push.
7. Gestaltungswahl: Schritte aus `.claude/skills/gestaltungswahl/SKILL.md` ausführen. Halt bei der Wahl.
8. Nach der Wahl: bauer überträgt den gewählten Vorschlag auf Startseite, Kopf, Fuß, Impressum und Datenschutz und
   entfernt `src/pages/gestaltung/`, `src/gestaltung/` außer den Tokens und `public/gestaltung/`. Dann Ablauf je
   Feature aus `CLAUDE.md` (Schnellprüfung, pruefer, Nachbesserung).
9. Pull Request nach `.claude/skills/autopilot-starten/report.md`, `node scripts/status.mjs pr <link>`. Im Report zusätzlich die
   Klickwege „Cloudflare verbinden“ aus `docs/ANLEITUNG.md` als nächster Schritt, falls noch nicht verbunden.
